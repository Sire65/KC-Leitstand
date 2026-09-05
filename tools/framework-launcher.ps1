param([switch]$DiagnosticOnly)
$ErrorActionPreference='Stop'
$ProjectRoot=(Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$Version='5.4.2'
$Project='Netzwerk-Leitstand'
$Log=New-Object System.Collections.Generic.List[string]
function Add-Log([string]$Text){$line="$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | $Text";$Log.Add($line);Write-Host $Text}
function Show-ProgressLine([int]$No,[string]$Text,[int]$Percent){
  $blocks=[Math]::Floor($Percent/5);$bar=('='*$blocks)+('.'*(20-$blocks));
  Write-Host -NoNewline ("`r[{0}/6] {1,-34} [{2}] {3,3}%" -f $No,$Text,$bar,$Percent)
  if($Percent -ge 100){Write-Host ''}
}
function Run-Stage([int]$No,[string]$Text,[scriptblock]$Action){
  foreach($p in 0,20,40){Show-ProgressLine $No $Text $p;Start-Sleep -Milliseconds 90}
  try{& $Action;foreach($p in 60,80,100){Show-ProgressLine $No $Text $p;Start-Sleep -Milliseconds 90};Add-Log ("[{0}/6] {1} [OK]" -f $No,$Text)}
  catch{Show-ProgressLine $No $Text 100;Add-Log ("[{0}/6] {1} [FEHLER]" -f $No,$Text);throw}
}
function Test-ArchiveStart {
  $patterns=@('\\AppData\\Local\\Temp\\Rar\$','\\AppData\\Local\\Temp\\7z','\\AppData\\Local\\Temp\\wz','\\Windows\\Temp\\')
  foreach($x in $patterns){if($ProjectRoot -match $x){return $true}};return $false
}
function New-Diagnostic([string]$Reason){
  $dir=Join-Path $ProjectRoot 'diagnose';New-Item -ItemType Directory -Force -Path $dir|Out-Null
  $stamp=Get-Date -Format 'yyyyMMdd_HHmmss';$file=Join-Path $dir ("Leitstand_Diagnose_$stamp.txt")
  $os=Get-CimInstance Win32_OperatingSystem -ErrorAction SilentlyContinue
  $body=@('FRAMEWORKLAUNCHER DIAGNOSEBERICHT',"Projekt: $Project V$Version","Zeitstempel: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz')","Windows-Version: $($os.Caption) $($os.Version) Build $($os.BuildNumber)","PowerShell-Version: $($PSVersionTable.PSVersion)","Projektpfad: $ProjectRoot","Erkannter Fehler: $Reason",'','Pruefprotokoll:',($Log -join [Environment]::NewLine)) -join [Environment]::NewLine
  Set-Content -LiteralPath $file -Value $body -Encoding UTF8
  $packDir=Join-Path $dir ("Paket_$stamp");New-Item -ItemType Directory -Force -Path $packDir|Out-Null;Copy-Item $file $packDir -Force
  foreach($item in @('tuev\certificate.json','tuev\policy.json','SHA256_MANIFEST.json','diagnose\last-certificate-check.log')){$src=Join-Path $ProjectRoot $item;if(Test-Path $src){Copy-Item $src $packDir -Force}}
  $zip=$packDir+'.zip';Compress-Archive -Path (Join-Path $packDir '*') -DestinationPath $zip -Force;Remove-Item $packDir -Recurse -Force
  Write-Host "`nDiagnosebericht erstellt:`n$file`n$zip" -ForegroundColor Cyan
  try{Start-Process explorer.exe -ArgumentList "/select,`"$file`""}catch{}
}
function Stop-WithDiagnostic([string]$Reason,[int]$Code){
  Write-Host "`nSTART GESPERRT: $Reason" -ForegroundColor Red;Write-Host "`n[D] Diagnose erstellen   [Enter] Beenden" -ForegroundColor Yellow
  $k=$Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown');if($k.Character -match '[dD]'){New-Diagnostic $Reason};exit $Code
}
Clear-Host
Write-Host '============================================================'
Write-Host " $Project V$Version"
Write-Host ' FrameworkLauncher V2.1 - sichtbarer Fortschritt'
Write-Host '============================================================'
try{
 Run-Stage 1 'Normalen Projektordner pruefen' {if(Test-ArchiveStart){throw 'Direktstart aus ZIP/WinRAR/7-Zip erkannt. Bitte ZIP vollstaendig entpacken und aus einem normalen Ordner starten.'}}
 Run-Stage 2 'Projektstruktur pruefen' {$required=@('app\index.html','tools\verify-certificate.ps1','probe\PRUEFDIENST_STARTEN.cmd','tuev\certificate.json');$missing=@($required|Where-Object{-not(Test-Path -LiteralPath (Join-Path $ProjectRoot $_) -PathType Leaf)});if($missing.Count){throw ("Pflichtdateien fehlen: "+($missing -join ', '))}}
 Run-Stage 3 'TUEV-Zertifikat und Integritaet' {$verify=Join-Path $ProjectRoot 'tools\verify-certificate.ps1';$verifyLog=Join-Path $ProjectRoot 'diagnose\last-certificate-check.log';New-Item -ItemType Directory -Force -Path (Split-Path $verifyLog -Parent)|Out-Null;& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $verify -LogPath $verifyLog;if($LASTEXITCODE -ne 0){throw 'Das Framework-TUEV-Zertifikat ist ungueltig oder der Dateistand wurde veraendert.'}}
 Run-Stage 4 'Windows-Komponenten pruefen' {if(-not(Get-Command powershell.exe -ErrorAction SilentlyContinue)){throw 'Windows PowerShell wurde nicht gefunden.'}}
 if($DiagnosticOnly){New-Diagnostic 'Manuell angeforderte Diagnose';exit 0}
 Run-Stage 5 'Netzwerk-Pruefdienst starten' {$probe=Join-Path $ProjectRoot 'probe\PRUEFDIENST_STARTEN.cmd';try{Start-Process -FilePath ([string]$probe) -WorkingDirectory ([string](Split-Path $probe))}catch{Add-Log "Pruefdienst konnte nicht gestartet werden: $($_.Exception.Message)"}}
 Run-Stage 6 'Leitstand starten' {
   $index=Join-Path $ProjectRoot 'app\index.html';$uri=[System.Uri]::new($index).AbsoluteUri
   $candidates=@("${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe","$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe","$env:ProgramFiles\Google\Chrome\Application\chrome.exe","${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe")
   [string]$browser=($candidates|Where-Object{$_ -and (Test-Path -LiteralPath $_ -PathType Leaf)}|Select-Object -First 1)
   if(-not [string]::IsNullOrWhiteSpace($browser)){Start-Process -FilePath $browser -ArgumentList @("--app=$uri",'--start-maximized','--disable-features=msEdgeSidebarV2') -WorkingDirectory $ProjectRoot}
   else{Start-Process -FilePath ([string]$index) -WorkingDirectory $ProjectRoot}
 }
 Write-Host "`nLeitstand wurde gestartet." -ForegroundColor Green
}catch{Stop-WithDiagnostic $_.Exception.Message 7}
