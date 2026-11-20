# Monitor da live

Lê o placar da transmissão no YouTube e, a cada gol, avisa o site: o admin recebe a
notificação "Gol de …?" para aprovar e escolher o autor (`src/lib/gols-sugeridos.ts`).

- Pergunta ao site, a cada minuto, se há partida ao vivo com link do YouTube
  (`GET /api/[tenant]/monitor`); sem jogo, fica parado.
- Com jogo, tira um quadro da live a cada 5s e lê o placar em volta do "x".
  Gol = um lado sobe 1 e se repete em 2 leituras; o resto (placar de outro jogo,
  zerado) só vira a nova base.
- Manda o gol para `POST /api/[tenant]/gols-sugeridos` com o segundo do vídeo:
  pelo número do trecho da live (exato) ou, se não houver, pelo atraso estimado.
- A cada 30s confere os nomes dos times no placar da tela. Nomes de outro jogo:
  os gols param de ir ao site. Se forem de um jogo de hoje ainda agendado com a
  mesma live (por 3 conferências seguidas), pede ao site para encerrar o jogo
  acompanhado e iniciar o da tela (`POST /api/[tenant]/monitor/trocar`); os
  admins recebem o aviso para conferir as súmulas.
- Sem jogo ao vivo no site, olha a live dos jogos de hoje uma vez por minuto
  (`proximas` no GET): placar de um deles na tela por 2 olhadas seguidas, inicia.
- Usa só a senha `MONITOR_SECRET` (a mesma da Vercel), nunca o banco.

## Instalar (Windows 10/11)

1. Copie a pasta `monitor` para a máquina.
2. No PowerShell, dentro da pasta:
   `powershell -ExecutionPolicy Bypass -File .\instalar.ps1`
3. Cole a senha do monitor quando pedir.

Instala Python 3.12 e ffmpeg (winget) se faltarem, fica em
`%LOCALAPPDATA%\CitadinoMonitor` e inicia sozinho quando o Windows entra (tarefa
"Citadino Monitor"). Registro em `monitor.log` na mesma pasta.

O Windows precisa entrar sozinho no usuário (ou ficar logado) para a tarefa rodar.

## Desinstalar

`Unregister-ScheduledTask -TaskName "Citadino Monitor" -Confirm:$false` e apagar
`%LOCALAPPDATA%\CitadinoMonitor`.
