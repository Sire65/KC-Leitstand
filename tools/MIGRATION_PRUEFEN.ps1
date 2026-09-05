$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$python = Get-Command python -ErrorAction SilentlyContinue
if (-not $python) { $python = Get-Command py -ErrorAction SilentlyContinue }
if (-not $python) { Write-Error "Python wurde nicht gefunden. Migration nicht freigegeben." }
& $python.Source "$PSScriptRoot\migration-preflight.py"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
