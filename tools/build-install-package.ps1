param([string]$OutputDir='')
$ErrorActionPreference='Stop'
$Root=(Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$Version='5.3.1'
if([string]::IsNullOrWhiteSpace($OutputDir)){$OutputDir=Join-Path (Split-Path $Root -Parent) 'Netzwerk-Leitstand-Builds'}
New-Item -ItemType Directory -Force -Path $OutputDir|Out-Null
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $Root 'tools\verify-certificate.ps1')
if($LASTEXITCODE -ne 0){throw 'Installationspaket gesperrt: Zertifikat ungueltig.'}
$stage=Join-Path $env:TEMP "Netzwerk_Leitstand_Installer_$Version"
Remove-Item -Recurse -Force $stage -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $stage|Out-Null
$exclude=@('dist','diagnose','.git')
Get-ChildItem -LiteralPath $Root -Force|Where-Object{$exclude -notcontains $_.Name}|ForEach-Object{Copy-Item -LiteralPath $_.FullName -Destination $stage -Recurse -Force}
$zip=Join-Path $OutputDir "Netzwerk_Leitstand_V4_3_13_Installationsversion.zip"
Remove-Item -Force $zip -ErrorAction SilentlyContinue
Compress-Archive -Path (Join-Path $stage '*') -DestinationPath $zip -CompressionLevel Optimal
$hash=(Get-FileHash -LiteralPath $zip -Algorithm SHA256).Hash.ToLowerInvariant()
Set-Content -LiteralPath (Join-Path $OutputDir 'INSTALLATION_BUILD_REPORT.txt') -Encoding UTF8 -Value "Projekt: Netzwerk-Leitstand V$Version`nErstellt: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`nPaket: $zip`nSHA256: $hash`nQuelle: zertifizierter Candidate"
Remove-Item -Recurse -Force $stage
Write-Host "Installationsversion erstellt:`n$zip`nSHA256: $hash" -ForegroundColor Green
