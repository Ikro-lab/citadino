# Instala o monitor da live no Windows e deixa ele iniciando sozinho.
# Uso (PowerShell, na pasta monitor):  powershell -ExecutionPolicy Bypass -File .\instalar.ps1
$ErrorActionPreference = "Stop"
$origem = $PSScriptRoot
$destino = Join-Path $env:LOCALAPPDATA "CitadinoMonitor"
$tarefa = "Citadino Monitor"

function Atualizar-Path {
  $env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User")
}

Write-Host "== Monitor da live do Citadino ==" -ForegroundColor Cyan

# 1. Python 3.12
$python = $null
try { $python = (& py -3.12 -c "import sys; print(sys.executable)") 2>$null } catch {}
if (-not $python) {
  Write-Host "Instalando o Python 3.12..."
  winget install -e --id Python.Python.3.12 --scope user --accept-package-agreements --accept-source-agreements
  Atualizar-Path
  $python = (& py -3.12 -c "import sys; print(sys.executable)")
}
Write-Host "Python: $python"

# 2. ffmpeg (tira o quadro da live)
$ffmpeg = (Get-Command ffmpeg -ErrorAction SilentlyContinue).Source
if (-not $ffmpeg) {
  Write-Host "Instalando o ffmpeg..."
  winget install -e --id Gyan.FFmpeg --accept-package-agreements --accept-source-agreements
  Atualizar-Path
  $ffmpeg = (Get-Command ffmpeg -ErrorAction SilentlyContinue).Source
  if (-not $ffmpeg) {
    $ffmpeg = (Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Recurse -Filter ffmpeg.exe -ErrorAction SilentlyContinue | Select-Object -First 1).FullName
  }
}
if (-not $ffmpeg) { throw "Não achei o ffmpeg depois da instalação. Feche e abra o PowerShell e rode de novo." }
Write-Host "ffmpeg: $ffmpeg"

# 3. Arquivos e ambiente Python isolado
New-Item -ItemType Directory -Force $destino | Out-Null
Copy-Item (Join-Path $origem "monitor.py"), (Join-Path $origem "requirements.txt") $destino -Force
if (-not (Test-Path (Join-Path $destino "venv"))) { & $python -m venv (Join-Path $destino "venv") }
$py = Join-Path $destino "venv\Scripts\python.exe"
$pyw = Join-Path $destino "venv\Scripts\pythonw.exe"
& $py -m pip install --upgrade --quiet pip
& $py -m pip install --upgrade --quiet -r (Join-Path $destino "requirements.txt")

# 4. Configuração (a senha fica só nesta máquina)
$config = Join-Path $destino "config.env"
if (-not (Test-Path $config)) {
  $senha = Read-Host "Cole a senha do monitor (MONITOR_SECRET)"
  @(
    "SITE=https://citadino.vercel.app",
    "TENANT=cid",
    "MONITOR_SECRET=$senha",
    "FFMPEG=$ffmpeg"
  ) | Set-Content -Path $config -Encoding utf8
}

# 5. Inicia sozinho ao entrar no Windows e reinicia se cair
$acao = New-ScheduledTaskAction -Execute $pyw -Argument "`"$(Join-Path $destino 'monitor.py')`"" -WorkingDirectory $destino
$gatilho = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
$opcoes = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit ([TimeSpan]::Zero) `
  -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1) -StartWhenAvailable
Register-ScheduledTask -TaskName $tarefa -Action $acao -Trigger $gatilho -Settings $opcoes -Force | Out-Null
Start-ScheduledTask -TaskName $tarefa

# 6. Não deixar a máquina dormir (senão o monitor para)
$resp = Read-Host "Desligar a suspensão automática desta máquina na tomada? (S/n)"
if ($resp -ne "n" -and $resp -ne "N") {
  powercfg /change standby-timeout-ac 0
  powercfg /change hibernate-timeout-ac 0
}

Write-Host ""
Write-Host "Pronto! O monitor está rodando e vai iniciar sozinho quando o Windows entrar." -ForegroundColor Green
Write-Host "Registro do que ele faz: $(Join-Path $destino 'monitor.log')"
Write-Host "Para conferir agora:  Get-Content '$(Join-Path $destino 'monitor.log')' -Tail 20 -Wait"
