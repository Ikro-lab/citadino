"""Monitor da live: lê o placar da transmissão no YouTube e avisa o site a cada gol.

Fica ligado o tempo todo. A cada minuto pergunta ao site se há partida ao vivo
com link do YouTube; quando há, lê o placar da live a cada INTERVALO segundos e,
quando um time sobe 1 gol (confirmado em 2 leituras), manda o gol ao site, que
avisa o admin para aprovar (ver src/lib/gols-sugeridos.ts).

Só fala com o site, com a senha MONITOR_SECRET (arquivo config.env ao lado).
"""
import json
import logging
import re
import shutil
import subprocess
import sys
import tempfile
import time
import unicodedata
import urllib.error
from difflib import SequenceMatcher
import urllib.request
from datetime import datetime, timezone
from logging.handlers import RotatingFileHandler
from pathlib import Path

from PIL import Image
from rapidocr_onnxruntime import RapidOCR

AQUI = Path(__file__).resolve().parent
INTERVALO = 5  # segundos entre leituras do placar
ESPERA_SEM_JOGO = 60  # segundos entre consultas ao site sem partida ao vivo
# Placar da transmissão sobe ~7s depois do lance; o clipe começa uns 10s antes dele,
# para dar para ver a jogada que levou ao gol.
GOL_ANTES_DO_PLACAR = 17
# Reserva quando não dá para saber a posição exata no vídeo: atraso medido da live.
LATENCIA_LIVE = 65
# Faixa em volta do "x" do placar, num quadro 1280x720 (serve para nomes curtos e longos).
FAIXA_PLACAR = (170, 28, 360, 70)

log = logging.getLogger("monitor")


def configurar_log():
    log.setLevel(logging.INFO)
    fmt = logging.Formatter("%(asctime)s %(message)s", "%d/%m %H:%M:%S")
    arquivo = RotatingFileHandler(AQUI / "monitor.log", maxBytes=2_000_000, backupCount=3, encoding="utf-8")
    arquivo.setFormatter(fmt)
    log.addHandler(arquivo)
    tela = logging.StreamHandler(sys.stdout)
    tela.setFormatter(fmt)
    log.addHandler(tela)


def ler_config():
    cfg = {}
    for linha in (AQUI / "config.env").read_text(encoding="utf-8").splitlines():
        if "=" in linha and not linha.strip().startswith("#"):
            k, v = linha.split("=", 1)
            cfg[k.strip()] = v.strip().strip('"')
    return cfg


CFG = ler_config()
SITE = CFG.get("SITE", "https://citadino.vercel.app").rstrip("/")
TENANT = CFG.get("TENANT", "cid")
SENHA = CFG["MONITOR_SECRET"]
FFMPEG = CFG.get("FFMPEG") or shutil.which("ffmpeg") or "ffmpeg"
YTDLP = [sys.executable, "-m", "yt_dlp"]


def api(metodo, caminho, corpo=None):
    req = urllib.request.Request(
        f"{SITE}/api/{TENANT}/{caminho}",
        data=json.dumps(corpo).encode() if corpo is not None else None,
        method=metodo,
        headers={"Authorization": f"Bearer {SENHA}", "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.load(r)


def agora():
    return datetime.now(timezone.utc)


class Live:
    """Lista de trechos (HLS) da live e o último quadro dela."""

    def __init__(self, video_id):
        self.video_id = video_id
        self.manifesto = None
        self.obtido_em = 0.0

    def _url_manifesto(self):
        saida = subprocess.run(
            [*YTDLP, "--no-warnings", "-f", "232/231/230/best[height<=720]", "-g",
             f"https://www.youtube.com/watch?v={self.video_id}"],
            capture_output=True, text=True, timeout=90,
        )
        url = saida.stdout.strip().splitlines()[-1] if saida.stdout.strip() else ""
        if not url.startswith("http"):
            raise RuntimeError(f"YouTube não entregou a live: {saida.stderr.strip()[-200:]}")
        return url

    def ultimo_trecho(self):
        """(url do último trecho, segundo dele no vídeo ou None)."""
        if not self.manifesto or time.time() - self.obtido_em > 300:
            self.manifesto, self.obtido_em = self._url_manifesto(), time.time()
        with urllib.request.urlopen(self.manifesto, timeout=20) as r:
            texto = r.read().decode("utf-8", "replace")
        trechos = [l for l in texto.splitlines() if l.startswith("http")]
        if not trechos:
            raise RuntimeError("lista de trechos vazia")
        duracoes = [float(m) for m in re.findall(r"#EXTINF:([0-9.]+)", texto)]
        url = trechos[-1]
        # Na live, cada trecho tem número em sequência e duração fixa desde o início
        # da transmissão: número x duração = posição no vídeo (sem chutar o atraso).
        m = re.search(r"/sq/(\d+)", url)
        segundo = int(m.group(1)) * duracoes[-1] if m and duracoes else None
        return url, segundo

    def quadro(self, destino):
        url, segundo = self.ultimo_trecho()
        destino.unlink(missing_ok=True)
        subprocess.run(
            [FFMPEG, "-hide_banner", "-loglevel", "error", "-y", "-i", url, "-frames:v", "1", str(destino)],
            capture_output=True, timeout=45,
        )
        if not destino.exists():
            self.manifesto = None
            raise RuntimeError("não consegui tirar o quadro da live")
        return segundo


ocr = RapidOCR()


def ler_placar(arquivo):
    im = Image.open(arquivo).convert("RGB")
    if im.size != (1280, 720):
        im = im.resize((1280, 720))
    c = im.crop(FAIXA_PLACAR)
    c = c.resize((c.width * 2, c.height * 2))
    r, _ = ocr(c, use_det=False, use_cls=False)
    m = re.search(r"([0-9oO]{1,2})\s*[xX×]\s*([0-9oO]{1,2})", r[0][0] if r else "")
    if not m:
        return None
    return tuple(int(g.replace("o", "0").replace("O", "0")) for g in m.groups())


# Selo vermelho "REPLAY" no canto superior esquerdo: a transmissão repete o lance
# logo depois do gol, muitas vezes antes de o operador atualizar o placar (que já
# chegou a subir 90s depois). O replay entra de 2s a 16s depois do gol (06/11:
# Beco 11550 -> replay 11552; Renascer 12510 -> 12526). O site mostra o clipe de
# 10s antes a 8s depois do segundo marcado, então 8s antes do replay pega os dois.
FAIXA_REPLAY = (35, 35, 275, 110)
CLIPE_ANTES_DO_REPLAY = 8
REPLAY_VALE_POR = 300  # segundos de vídeo: replay mais antigo que isso não é deste gol
REPLAY_SEM_GOL_AVISO = 150  # replay sem o placar mudar depois disso: anota no registro


def tem_replay(arquivo):
    im = Image.open(arquivo).convert("RGB")
    if im.size != (1280, 720):
        im = im.resize((1280, 720))
    c = im.crop(FAIXA_REPLAY)
    px = c.load()
    vermelhos = sum(1 for x in range(0, c.width, 2) for y in range(0, c.height, 2)
                    if (lambda r, g, b: r > 170 and g < 80 and b < 80)(*px[x, y]))
    if vermelhos / ((c.width // 2) * (c.height // 2)) < 0.3:
        return False
    r, _ = ocr(c.resize((c.width * 2, c.height * 2)), use_det=False, use_cls=False)
    return bool(r) and "EPLA" in _normalizar(r[0][0])


# Faixa dos nomes dos times dos dois lados do placar, e a divisa entre os lados.
FAIXA_NOMES = (0, 20, 640, 80)
DIVISA_LADOS = 300


def _normalizar(texto):
    sem_acento = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode()
    return re.sub(r"[^A-Z0-9]", "", sem_acento.upper())


def _parecido(a, b):
    return SequenceMatcher(None, _normalizar(a), _normalizar(b)).ratio()


def ordem_da_transmissao(arquivo, casa, fora):
    """True se a transmissão mostra o visitante do site à esquerda; None se não deu para ler.

    O placar da live não segue a ordem casa x fora do site (ex.: CDC Veterano à
    esquerda num jogo cadastrado como CDC Master x CDC Veterano).
    """
    im = Image.open(arquivo).convert("RGB")
    if im.size != (1280, 720):
        im = im.resize((1280, 720))
    c = im.crop(FAIXA_NOMES)
    c = c.resize((c.width * 2, c.height * 2))
    r, _ = ocr(c)
    esquerda, direita = [], []
    for caixa, texto, _conf in r or []:
        if not re.search(r"[A-Za-z]{3}", texto):
            continue  # números e o "x" do placar
        centro = sum(p[0] for p in caixa) / len(caixa) / 2 + FAIXA_NOMES[0]
        (esquerda if centro < DIVISA_LADOS else direita).append(texto)
    if not esquerda or not direita:
        return None
    esq, dir_ = " ".join(esquerda), " ".join(direita)
    direta = _parecido(esq, casa) + _parecido(dir_, fora)
    invertida = _parecido(esq, fora) + _parecido(dir_, casa)
    if max(direta, invertida) < 1.0 or abs(direta - invertida) < 0.2:
        return None  # nomes ilegíveis ou parecidos demais para decidir
    return invertida > direta


MAX_GOLS_DE_UMA_VEZ = 3  # salto maior que isso é leitura errada ou placar de outro jogo


def gols_entre(antes, depois):
    """Gols entre dois placares confirmados, um por vez: [(lado, placar depois dele)].

    O placar pode sumir da tela (replay) e voltar com mais de 1 gol; cada um vira
    uma sugestão, com o placar intermediário. Placar que desce ou salta demais
    não é gol: vira só a nova base.
    """
    if not antes:
        return []
    dc, df = depois[0] - antes[0], depois[1] - antes[1]
    if dc < 0 or df < 0 or not 0 < dc + df <= MAX_GOLS_DE_UMA_VEZ:
        return []
    gc, gf = antes
    gols = []
    for _ in range(dc):
        gc += 1
        gols.append(("casa", (gc, gf)))
    for _ in range(df):
        gf += 1
        gols.append(("fora", (gc, gf)))
    return gols


def acompanhar(partida):
    """Lê o placar enquanto a partida estiver ao vivo; volta quando ela acaba."""
    live = Live(partida["videoId"])
    quadro = Path(tempfile.gettempdir()) / "monitor-placar.png"
    inicio_live = partida.get("transmissaoInicioEm")
    inicio_live = datetime.fromisoformat(inicio_live.replace("Z", "+00:00")) if inicio_live else None
    aceito, candidato, repeticoes, visto = None, None, 0, None
    ultima_leitura = ()  # só para o registro: anota cada leitura nova
    ultima_consulta = time.time()
    falhas = 0
    casa, _, fora = partida["jogo"].partition(" x ")
    invertida = None  # a transmissão mostra o visitante à esquerda? (None = ainda não sei)
    replay_na_tela = False
    replay_inicio = None  # segundo do vídeo do último replay ainda não ligado a um gol
    replay_avisado = False
    log.info(f"Acompanhando {partida['jogo']} (live {partida['videoId']})")

    while True:
        t0 = time.time()
        try:
            momento = agora()
            segundo_video = live.quadro(quadro)
            leitura = ler_placar(quadro)
            if leitura and invertida is None:
                invertida = ordem_da_transmissao(quadro, casa, fora)
                if invertida is not None:
                    log.info(f"Ordem na transmissão: {f'{fora} x {casa} (invertida em relação ao site)' if invertida else f'{casa} x {fora} (igual ao site)'}")
            if leitura and invertida:
                leitura = (leitura[1], leitura[0])  # daqui em diante, sempre casa x fora do site
            falhas = 0
            replay = tem_replay(quadro)
            if replay and not replay_na_tela and segundo_video is not None:
                replay_inicio, replay_avisado = segundo_video, False
                log.info(f"REPLAY na tela (vídeo {round(segundo_video)}s)")
            replay_na_tela = replay
            if (replay_inicio is not None and not replay_avisado and segundo_video is not None
                    and segundo_video - replay_inicio > REPLAY_SEM_GOL_AVISO):
                replay_avisado = True
                log.warning(f"Replay em {round(replay_inicio)}s e o placar não mudou: se foi gol, lance na súmula"
                            f" e use o clipe em ~{round(replay_inicio) - CLIPE_ANTES_DO_REPLAY}s")
            if leitura != ultima_leitura:
                ultima_leitura = leitura
                log.info(f"Leitura: {f'{leitura[0]} x {leitura[1]}' if leitura else 'sem placar na tela'}"
                         f" (vídeo {round(segundo_video) if segundo_video is not None else '?'}s)")
            if leitura:
                if leitura == candidato:
                    repeticoes += 1
                else:
                    candidato, repeticoes, visto = leitura, 1, (momento, segundo_video)
                if repeticoes == 2 and leitura != aceito:
                    gols = gols_entre(aceito, leitura)
                    if gols:
                        if len(gols) > 1:
                            log.info(f"Placar pulou de {aceito[0]} x {aceito[1]} para {leitura[0]} x {leitura[1]}:"
                                     f" {len(gols)} gols no mesmo momento (acerte o clipe na aprovação)")
                        # O replay antes da mudança do placar marca o lance melhor que o placar.
                        lance = None
                        if (replay_inicio is not None and visto[1] is not None
                                and 0 <= visto[1] - replay_inicio <= REPLAY_VALE_POR):
                            lance = round(replay_inicio) - CLIPE_ANTES_DO_REPLAY
                        replay_inicio = None
                        for i, (lado, placar) in enumerate(gols):
                            ultimo = i == len(gols) - 1
                            enviar_gol(partida, lado, placar, visto, inicio_live, lance if ultimo else None)
                    else:
                        log.info(f"Placar base {leitura[0]} x {leitura[1]}")
                    aceito = leitura
        except Exception as e:  # noqa: BLE001 — segue tentando; a live pode oscilar
            falhas += 1
            log.warning(f"Falha na leitura ({falhas}): {e}")
            if falhas >= 20:
                log.warning("Muitas falhas seguidas; volto a consultar o site.")
                return

        if time.time() - ultima_consulta > ESPERA_SEM_JOGO:
            ultima_consulta = time.time()
            try:
                ativas = [p for p in api("GET", "monitor")["partidas"] if p["id"] == partida["id"]]
            except Exception as e:  # noqa: BLE001
                log.warning(f"Site não respondeu: {e}")
                ativas = [partida]
            if not ativas:
                log.info("Partida encerrada no site.")
                return
            inicio = ativas[0].get("transmissaoInicioEm")
            inicio_live = datetime.fromisoformat(inicio.replace("Z", "+00:00")) if inicio else inicio_live
        time.sleep(max(1, INTERVALO - (time.time() - t0)))


def enviar_gol(partida, lado, placar, visto, inicio_live, lance=None):
    momento, segundo_video = visto
    if lance is not None:
        segundo = lance
        origem = "replay"
    elif segundo_video is not None:
        segundo = round(segundo_video) - GOL_ANTES_DO_PLACAR
        origem = "posição do trecho"
    elif inicio_live:
        segundo = round((momento - inicio_live).total_seconds()) - LATENCIA_LIVE - GOL_ANTES_DO_PLACAR
        origem = "atraso estimado"
    else:
        log.warning("Gol visto, mas sem saber o segundo do vídeo; não enviado.")
        return
    corpo = {"videoId": partida["videoId"], "lado": lado, "segundo": max(0, segundo),
             "placarCasa": placar[0], "placarFora": placar[1]}
    try:
        resposta = api("POST", "gols-sugeridos", corpo)
        log.info(f"GOL {lado} {placar[0]} x {placar[1]} (t={segundo}s, {origem}) -> {resposta.get('resultado')}")
    except urllib.error.HTTPError as e:
        log.warning(f"Site recusou o gol ({e.code}): {e.read()[:200]!r}")
    except Exception as e:  # noqa: BLE001
        log.warning(f"Não consegui enviar o gol: {e}")


def main():
    configurar_log()
    log.info(f"Monitor ligado ({SITE}/{TENANT}).")
    while True:
        try:
            partidas = api("GET", "monitor")["partidas"]
        except urllib.error.HTTPError as e:
            log.warning(f"Site respondeu {e.code} (senha certa? MONITOR_SECRET na Vercel?)")
            partidas = []
        except Exception as e:  # noqa: BLE001
            log.warning(f"Sem conexão com o site: {e}")
            partidas = []
        if partidas:
            acompanhar(partidas[0])
        else:
            time.sleep(ESPERA_SEM_JOGO)


if __name__ == "__main__":
    main()
