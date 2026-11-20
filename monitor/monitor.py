"""Monitor da live: lê o placar da transmissão no YouTube e avisa o site a cada gol.

Fica ligado o tempo todo. A cada minuto pergunta ao site se há partida ao vivo
com link do YouTube; quando há, lê o placar da live a cada INTERVALO segundos e,
quando um time sobe 1 gol (confirmado em 2 leituras), manda o gol ao site, que
lança o gol na súmula e deixa o clipe para o admin aprovar; quando o placar
volta 1 gol, avisa o site para tirar o gol que lançou (ver src/lib/gols-sugeridos.ts).

Confere os nomes do placar da tela: se a live passou para outro jogo de hoje,
encerra o anterior e inicia o da tela no site; sem jogo ao vivo no site, inicia
o jogo agendado cujo placar aparece na live.

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
# Faixas em volta do "x" do placar, num quadro 1280x720, tentadas em ordem. Com nome
# curto à esquerda o placar anda para a esquerda (13/11: "CAC 0 x 1", o "0" em ~155px
# ficava fora da primeira faixa).
FAIXAS_PLACAR = [(170, 28, 360, 70), (120, 28, 360, 70)]

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
# Rodando com pythonw (sem console), cada ffmpeg/yt-dlp abriria uma janela de terminal.
SEM_JANELA = getattr(subprocess, "CREATE_NO_WINDOW", 0)


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
            capture_output=True, text=True, timeout=90, creationflags=SEM_JANELA,
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
            capture_output=True, timeout=45, creationflags=SEM_JANELA,
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
    for faixa in FAIXAS_PLACAR:
        c = im.crop(faixa)
        c = c.resize((c.width * 2, c.height * 2))
        r, _ = ocr(c, use_det=False, use_cls=False)
        m = re.search(r"([0-9oO]{1,2})\s*[xX×]\s*([0-9oO]{1,2})", r[0][0] if r else "")
        if m:
            return tuple(int(g.replace("o", "0").replace("O", "0")) for g in m.groups())
    return None


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


def _iniciais(texto):
    sem_acento = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode()
    return "".join(p[0] for p in re.findall(r"[A-Za-z0-9]+", sem_acento)).upper()


def _parecido(tela, site):
    """Quanto o nome lido na tela (às vezes encurtado) lembra o nome do site, de 0 a 1.

    A transmissão encurta: "CU-ZONAS" para "C.U.Zonas Futsal Feminino", "CAC" para
    "Cidreira Atlético Clube". Começo igual ou iniciais iguais valem quase como igual.
    O OCR junta ao nome pedaços do escudo ("AAS PUMAS"): cada palavra vale sozinha também.
    """
    palavras = tela.split()
    if len(palavras) > 1:
        return max([_parecido(tela.replace(" ", ""), site)] + [_parecido(p, site) for p in palavras if len(_normalizar(p)) >= 4])
    a, b = _normalizar(tela), _normalizar(site)
    if not a or not b:
        return 0.0
    nota = SequenceMatcher(None, a, b).ratio()
    if len(a) >= 4 and b.startswith(a) or len(b) >= 4 and a.startswith(b):
        nota = max(nota, 0.9)
    if len(a) >= 2 and a == _iniciais(site):
        nota = max(nota, 0.9)
    return nota


def nomes_na_tela(arquivo):
    """(nome à esquerda, nome à direita) do placar da transmissão, ou None se não deu para ler."""
    im = Image.open(arquivo).convert("RGB")
    if im.size != (1280, 720):
        im = im.resize((1280, 720))
    c = im.crop(FAIXA_NOMES)
    c = c.resize((c.width * 2, c.height * 2))
    r, _ = ocr(c)
    caixas = [(sum(p[0] for p in caixa) / len(caixa) / 2 + FAIXA_NOMES[0], texto) for caixa, texto, _conf in r or []]
    # A divisa é o "x" do placar quando ele aparece: com nome curto à esquerda o placar
    # anda e o nome da direita chega a ficar antes do pixel fixo (13/11: REALEZA em 298px).
    xis = [centro for centro, texto in caixas if texto.strip() in ("x", "X", "×")]
    divisa = xis[0] if xis else DIVISA_LADOS
    esquerda, direita = [], []
    for centro, texto in caixas:
        if not re.search(r"[A-Za-z]{3}", texto):
            continue  # números e o "x" do placar
        (esquerda if centro < divisa else direita).append(texto)
    if not esquerda or not direita:
        return None
    return " ".join(esquerda), " ".join(direita)


def comparar(nomes, jogo):
    """(nota de 0 a 2, invertida) dos nomes da tela contra o jogo "Casa x Fora" do site."""
    casa, _, fora = jogo.partition(" x ")
    esq, dir_ = nomes
    direta = _parecido(esq, casa) + _parecido(dir_, fora)
    invertida = _parecido(esq, fora) + _parecido(dir_, casa)
    return max(direta, invertida), invertida > direta


def ordem_da_transmissao(arquivo, casa, fora):
    """True se a transmissão mostra o visitante do site à esquerda; None se não deu para ler.

    O placar da live não segue a ordem casa x fora do site (ex.: CDC Veterano à
    esquerda num jogo cadastrado como CDC Master x CDC Veterano).
    """
    nomes = nomes_na_tela(arquivo)
    if not nomes:
        return None
    esq, dir_ = nomes
    # Nome idêntico ao de um time decide (ex.: "RENASCER" x "RENASCER FUT" num jogo
    # cadastrado como renascer B x Renascer, em que a semelhança empata).
    n = _normalizar
    exato_direta = n(esq) == n(casa) or n(dir_) == n(fora)
    exato_invertida = n(esq) == n(fora) or n(dir_) == n(casa)
    if exato_direta != exato_invertida:
        return exato_invertida
    direta = _parecido(esq, casa) + _parecido(dir_, fora)
    invertida = _parecido(esq, fora) + _parecido(dir_, casa)
    if max(direta, invertida) < 1.0 or abs(direta - invertida) < 0.2:
        return None  # nomes ilegíveis ou parecidos demais para decidir
    return invertida > direta


# Reconhecer o jogo pelos nomes: nota mínima (de 2) e folga sobre o segundo colocado.
NOTA_JOGO = 1.0
FOLGA_JOGO = 0.3
# Abaixo disso, os nomes da tela não são do jogo acompanhado (outro jogo na live).
# Nos testes (13 e 16/11), nomes de outro jogo deram de 0,4 a 0,8; o jogo certo, 1,8.
NOTA_OUTRO_JOGO = 0.9
CONFERIR_NOMES = 30  # segundos entre conferências dos nomes na tela
VEZES_PARA_TROCAR = 3  # conferências seguidas vendo o mesmo outro jogo antes de trocar


def jogo_na_tela(nomes, jogos):
    """O jogo (dict do site) cujos times estão na tela, ou None se não der para afirmar."""
    notas = sorted(((comparar(nomes, j["jogo"])[0], i) for i, j in enumerate(jogos)), reverse=True)
    if not notas or notas[0][0] < NOTA_JOGO:
        return None
    if len(notas) > 1 and notas[0][0] - notas[1][0] < FOLGA_JOGO:
        return None
    return jogos[notas[0][1]]


def trocar_partida(iniciar, encerrar=None, placar=None):
    """Pede ao site para encerrar o jogo acompanhado e iniciar o da tela. True se trocou."""
    corpo = {"iniciarId": iniciar["id"], "encerrarId": encerrar["id"] if encerrar else None}
    if placar:
        corpo["placarNaTela"] = list(placar)
    try:
        api("POST", "monitor/trocar", corpo)
        log.info(f"Live mudou de jogo: {(encerrar['jogo'] + ' encerrado; ') if encerrar else ''}{iniciar['jogo']} iniciado")
        return True
    except urllib.error.HTTPError as e:
        log.warning(f"Site recusou a troca de jogo ({e.code}): {e.read()[:200]!r}")
    except Exception as e:  # noqa: BLE001
        log.warning(f"Não consegui trocar de jogo: {e}")
    return False


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


def voltou_um_gol(antes, depois):
    """Lado cujo placar desceu exatamente 1 (o outro igual): o operador corrigiu um gol."""
    if not antes:
        return None
    if depois == (antes[0] - 1, antes[1]):
        return "casa"
    if depois == (antes[0], antes[1] - 1):
        return "fora"
    return None


def acompanhar(partida, proximas=()):
    """Lê o placar enquanto a partida estiver ao vivo; volta quando ela acaba.

    A cada CONFERIR_NOMES segundos confere os nomes no placar da tela. Se forem de
    outro jogo, os gols param de ir ao site; se forem de um jogo de hoje ainda
    agendado (`proximas`), por VEZES_PARA_TROCAR conferências seguidas, pede ao
    site para encerrar este e iniciar aquele, e volta.
    """
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
    proximas = [p for p in proximas if p["videoId"] == partida["videoId"]]
    ultima_conferencia = 0.0
    conferem = True  # os nomes na tela são deste jogo (até prova em contrário)
    outro, vezes_outro = None, 0
    log.info(f"Acompanhando {partida['jogo']} (live {partida['videoId']})")

    while True:
        t0 = time.time()
        try:
            momento = agora()
            segundo_video = live.quadro(quadro)
            leitura = bruta = ler_placar(quadro)
            if leitura and time.time() - ultima_conferencia > CONFERIR_NOMES:
                ultima_conferencia = time.time()
                nomes = nomes_na_tela(quadro)
                if nomes:
                    na_tela = jogo_na_tela(nomes, [partida, *proximas])
                    if (na_tela and na_tela["id"] == partida["id"]) or (
                            na_tela is None and comparar(nomes, partida["jogo"])[0] >= NOTA_OUTRO_JOGO):
                        if not conferem:
                            log.info("Os nomes na tela voltaram a ser deste jogo.")
                        conferem, outro, vezes_outro = True, None, 0
                    else:
                        if conferem:
                            log.warning(f"A tela mostra outro jogo ({nomes[0]} x {nomes[1]}): gols não vão ao site.")
                        conferem = False
                        if na_tela:
                            vezes_outro = vezes_outro + 1 if outro and outro["id"] == na_tela["id"] else 1
                            outro = na_tela
                            if vezes_outro >= VEZES_PARA_TROCAR:
                                inv = comparar(nomes, na_tela["jogo"])[1]
                                if trocar_partida(na_tela, partida, (bruta[1], bruta[0]) if inv else bruta):
                                    return
                                vezes_outro = 0
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
                    if gols and not conferem:
                        log.warning(f"Placar foi a {leitura[0]} x {leitura[1]}, mas a tela é de outro jogo: não enviado.")
                        replay_inicio = None
                    elif gols:
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
                    elif conferem and voltou_um_gol(aceito, leitura):
                        desfazer_gol(partida, voltou_um_gol(aceito, leitura), leitura)
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
                resposta = api("GET", "monitor")
                ativas = [p for p in resposta["partidas"] if p["id"] == partida["id"]]
            except Exception as e:  # noqa: BLE001
                log.warning(f"Site não respondeu: {e}")
                ativas, resposta = [partida], {"proximas": proximas}
            if not ativas:
                log.info("Partida encerrada no site.")
                return
            proximas = [p for p in resposta.get("proximas", []) if p["videoId"] == partida["videoId"]]
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


VEZES_PARA_INICIAR = 2  # olhadas seguidas (uma por minuto) vendo o mesmo jogo agendado


def vigiar(proximas, lives, vistos):
    """Sem jogo ao vivo no site: olha a live dos jogos de hoje. Se o placar da tela é
    de um deles por VEZES_PARA_INICIAR olhadas seguidas, pede ao site para iniciá-lo."""
    quadro = Path(tempfile.gettempdir()) / "monitor-vigia.png"
    for video_id in dict.fromkeys(p["videoId"] for p in proximas):
        candidatos = [p for p in proximas if p["videoId"] == video_id]
        try:
            live = lives.setdefault(video_id, Live(video_id))
            live.quadro(quadro)
            placar = ler_placar(quadro)
            nomes = nomes_na_tela(quadro) if placar else None
        except Exception as e:  # noqa: BLE001 — live fora do ar ou ainda não começou
            log.debug(f"Vigia {video_id}: {e}")
            continue
        jogo = jogo_na_tela(nomes, candidatos) if nomes else None
        if not jogo:
            for p in candidatos:
                vistos.pop(p["id"], None)
            continue
        vistos[jogo["id"]] = vistos.get(jogo["id"], 0) + 1
        log.info(f"Placar na live: {nomes[0]} {placar[0]} x {placar[1]} {nomes[1]} = {jogo['jogo']}"
                 f" ({vistos[jogo['id']]}/{VEZES_PARA_INICIAR})")
        if vistos[jogo["id"]] >= VEZES_PARA_INICIAR:
            inv = comparar(nomes, jogo["jogo"])[1]
            if trocar_partida(jogo, None, (placar[1], placar[0]) if inv else placar):
                vistos.clear()
                return True
    return False


def desfazer_gol(partida, lado, placar):
    """Placar da live voltou um gol (operador corrigiu): o site tira o gol que lançou sozinho."""
    corpo = {"acao": "desfazer", "videoId": partida["videoId"], "lado": lado,
             "placarCasa": placar[0], "placarFora": placar[1]}
    try:
        resposta = api("POST", "gols-sugeridos", corpo)
        log.info(f"Placar voltou ({lado}) para {placar[0]} x {placar[1]} -> {resposta.get('resultado')}")
    except Exception as e:  # noqa: BLE001
        log.warning(f"Não consegui avisar o placar que voltou: {e}")


def main():
    configurar_log()
    log.info(f"Monitor ligado ({SITE}/{TENANT}).")
    lives, vistos = {}, {}
    while True:
        try:
            resposta = api("GET", "monitor")
            partidas, proximas = resposta["partidas"], resposta.get("proximas", [])
        except urllib.error.HTTPError as e:
            log.warning(f"Site respondeu {e.code} (senha certa? MONITOR_SECRET na Vercel?)")
            partidas, proximas = [], []
        except Exception as e:  # noqa: BLE001
            log.warning(f"Sem conexão com o site: {e}")
            partidas, proximas = [], []
        if partidas:
            vistos.clear()
            acompanhar(partidas[0], proximas)
            continue
        if proximas and vigiar(proximas, lives, vistos):
            continue
        time.sleep(ESPERA_SEM_JOGO)


if __name__ == "__main__":
    main()
