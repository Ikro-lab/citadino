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
import urllib.error
import urllib.request
from datetime import datetime, timezone
from logging.handlers import RotatingFileHandler
from pathlib import Path

from PIL import Image
from rapidocr_onnxruntime import RapidOCR

AQUI = Path(__file__).resolve().parent
INTERVALO = 5  # segundos entre leituras do placar
ESPERA_SEM_JOGO = 60  # segundos entre consultas ao site sem partida ao vivo
# Placar da transmissão sobe ~7s depois do lance; o clipe marca o lance (o player abre 10s antes).
GOL_ANTES_DO_PLACAR = 7
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
    log.info(f"Acompanhando {partida['jogo']} (live {partida['videoId']})")

    while True:
        t0 = time.time()
        try:
            momento = agora()
            segundo_video = live.quadro(quadro)
            leitura = ler_placar(quadro)
            falhas = 0
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
                    gc, gf = leitura
                    lado = None
                    if aceito and gc == aceito[0] + 1 and gf == aceito[1]:
                        lado = "casa"
                    elif aceito and gf == aceito[1] + 1 and gc == aceito[0]:
                        lado = "fora"
                    if lado:
                        enviar_gol(partida, lado, leitura, visto, inicio_live)
                    else:
                        log.info(f"Placar base {gc} x {gf}")
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


def enviar_gol(partida, lado, placar, visto, inicio_live):
    momento, segundo_video = visto
    if segundo_video is not None:
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
