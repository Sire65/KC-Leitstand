param([ValidateSet('Candidate','Installer','All')][string]$Mode='All',[string]$OutputDir='')
$ErrorActionPreference='Stop'
$Root=(Resolve-Path (Join-Path $PSScriptRoot '..')).Path;$Project='Netzwerk-Leitstand';$Version='5.4.2'
if(!$OutputDir){$OutputDir=Join-Path (Split-Path $Root -Parent) 'Netzwerk-Leitstand-Builds'}
New-Item -ItemType Directory -Force -Path $OutputDir|Out-Null
$run=Join-Path $env:TEMP ("FrameworkBuildCore_"+[guid]::NewGuid().ToString('N'));New-Item -ItemType Directory $run|Out-Null
$log=Join-Path $run 'build.log';function Log($m){$l="$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | $m";Add-Content $log $l -Encoding UTF8;Write-Host $m}
function Fail($m){Log "FEHLER: $m";throw $m}
function HashTree($base,$ignored){$map=[ordered]@{};Get-ChildItem $base -Recurse -File|Sort-Object FullName|ForEach-Object{$rel=$_.FullName.Substring($base.Length).TrimStart('\').Replace('\','/');if($rel-notmatch'(^|/)\.git(/|$)'-and $rel-notmatch'(^|/)__pycache__(/|$)'-and $rel-notmatch'\.pyc$'-and $rel-notmatch'\.zip$'-and $rel-notmatch'(^|/)diagnose(/|$)'-and $rel-notmatch'(^|/)dist(/|$)'-and -not $ignored.ContainsKey($rel)){$map[$rel]=(Get-FileHash $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant()}};return $map}
try{
 Log '[1/8] Projekt- und Versionskonsistenz pruefen'
 $reg=Get-Content (Join-Path $Root 'PROJECT_REGISTER.json') -Raw|ConvertFrom-Json;if($reg.version-ne$Version){Fail "PROJECT_REGISTER Version $($reg.version) statt $Version"}
 foreach($f in @('app/config/shell.config.js','public/config/shell.config.js','tools/framework-launcher.ps1')){if((Get-Content (Join-Path $Root $f)-Raw)-notmatch [regex]::Escape($Version)){Fail "Versionskennung fehlt in $f"}}
 Log '[2/8] Externe Hilfsprogramme und Syntaxpruefungen'
 & powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $Root 'tests/static-check.ps1') *> (Join-Path $run 'static-check.log');if($LASTEXITCODE-ne0){Fail 'PowerShell Static-Check fehlgeschlagen'}
 Get-ChildItem $Root -Recurse -Filter *.json|ForEach-Object{try{Get-Content $_.FullName -Raw|ConvertFrom-Json|Out-Null}catch{Fail "JSON ungueltig: $($_.FullName)"}}
 $node=Get-Command node.exe -ErrorAction SilentlyContinue;if($node){Get-ChildItem $Root -Recurse -Filter *.js|ForEach-Object{& $node.Source --check $_.FullName *> $null;if($LASTEXITCODE-ne0){Fail "JavaScript Syntax: $($_.FullName)"}}}else{Log 'HINWEIS: Node.js nicht vorhanden; JS-Pruefung durch Projekt-TUEV abgedeckt.'}
 Log '[3/8] Manifest vor Zertifikat aktualisieren'
 $manifest=[ordered]@{schemaVersion='1.0.0';project=$Project;version=$Version;generatedAt=(Get-Date).ToUniversalTime().ToString('o');note='Vor Zertifikatsbildung erzeugt'}
 $manifest|ConvertTo-Json -Depth 5|Set-Content (Join-Path $Root 'SHA256_MANIFEST.json') -Encoding UTF8
 Log '[4/8] Zertifikat reproduzierbar erzeugen'
 $policy=Get-Content (Join-Path $Root 'tuev/policy.json') -Raw|ConvertFrom-Json;$ignored=@{};foreach($x in $policy.ignoredHashPaths){$ignored[$x.Replace('\','/')]=$true}
 $hashes=HashTree $Root $ignored;$concat=($hashes.GetEnumerator()|ForEach-Object{"$($_.Key):$($_.Value)"})-join "`n";$tmp=Join-Path $run 'tree.txt';Set-Content $tmp $concat -NoNewline -Encoding UTF8;$digest=(Get-FileHash $tmp -Algorithm SHA256).Hash.ToLowerInvariant();$id='FT-'+(Get-Date -Format yyyyMMdd)+'-'+$digest.Substring(0,12).ToUpperInvariant()
 $cert=[ordered]@{schemaVersion='1.0.0';certificateId=$id;authority='Framework-TUEV';projectId='NL';project=$Project;version=$Version;level='CANDIDATE';usage='TEST_ONLY';status='VALID';issuedAt=(Get-Date).ToUniversalTime().ToString('o');treeDigest=$digest;coveredFiles=$hashes;report='tuev/report.json'}
 $cert|ConvertTo-Json -Depth 10|Set-Content (Join-Path $Root 'tuev/certificate.json') -Encoding UTF8
 "FRAMEWORK TUEV`nBESTANDEN`nZertifikat: $id`nProjekt: $Project V$Version`nStufe: CANDIDATE`nNutzung: TEST_ONLY`nPruefsumme: $digest"|Set-Content (Join-Path $Root 'tuev/certificate.txt') -Encoding UTF8
 Log '[5/8] Zertifikat im Quellstand gegenpruefen'
 & powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $Root 'tools/verify-certificate.ps1') -LogPath (Join-Path $run 'verify-source.log');if($LASTEXITCODE-ne0){Fail 'Quellzertifikat ungueltig'}
 $parent=Split-Path $Root -Parent;$candidate=Join-Path $OutputDir "Netzwerk_Leitstand_V5_3_0_Brain_Action_Coordination_Candidate.zip";$installer=Join-Path $OutputDir "Netzwerk_Leitstand_V5_3_0_Installationsversion.zip"
 if($Mode-in@('Candidate','All')){Log '[6/8] Candidate-ZIP erzeugen';Remove-Item $candidate -Force -ErrorAction SilentlyContinue;Compress-Archive -Path $Root -DestinationPath $candidate -CompressionLevel Optimal}
 if($Mode-in@('Installer','All')){Log '[6/8] Installations-ZIP erzeugen';$stage=Join-Path $run 'installer';New-Item -ItemType Directory $stage|Out-Null;Get-ChildItem $Root -Force|Where-Object{$_.Name-notin@('.git','diagnose','dist')}|ForEach-Object{Copy-Item $_.FullName $stage -Recurse -Force};Remove-Item $installer -Force -ErrorAction SilentlyContinue;Compress-Archive -Path (Join-Path $stage '*') -DestinationPath $installer -CompressionLevel Optimal}
 Log '[7/8] ZIP automatisch entpacken und Zertifikat erneut pruefen'
 foreach($zip in @($candidate,$installer)|Where-Object{Test-Path $_}){$check=Join-Path $run ([IO.Path]::GetFileNameWithoutExtension($zip));Expand-Archive $zip $check -Force;$vr=if(Test-Path (Join-Path $check 'tools')){$check}else{(Get-ChildItem $check -Directory|Select-Object -First 1).FullName};& powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $vr 'tools/verify-certificate.ps1') -Root $vr -LogPath (Join-Path $run ((Split-Path $zip -Leaf)+'.verify.log'));if($LASTEXITCODE-ne0){Remove-Item $zip -Force;Fail "ZIP-Gegenpruefung fehlgeschlagen: $zip"}}
 Log '[8/8] Nur bestandene Pakete veroeffentlichen'
 $report=Join-Path $OutputDir "BUILD_REPORT_V5_3_0.txt";$items=@();foreach($z in @($candidate,$installer)|Where-Object{Test-Path $_}){$items+="Paket: $z`nSHA256: $((Get-FileHash $z -Algorithm SHA256).Hash.ToLowerInvariant())"};("FRAMEWORKBUILDCORE PASS`nProjekt: $Project V$Version`nZeit: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n`n"+($items-join"`n`n"))|Set-Content $report -Encoding UTF8
 Log 'BUILD BESTANDEN: Candidate/Installer wurden nach Entpacken erneut verifiziert.'
 Copy-Item $log (Join-Path $OutputDir 'FRAMEWORK_BUILD_LAST.log') -Force
}catch{Copy-Item $log (Join-Path $OutputDir 'FRAMEWORK_BUILD_FAILED.log') -Force -ErrorAction SilentlyContinue;Write-Host $_.Exception.Message -ForegroundColor Red;exit 1}finally{Remove-Item $run -Recurse -Force -ErrorAction SilentlyContinue}
exit 0
