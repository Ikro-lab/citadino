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
