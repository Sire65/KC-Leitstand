param([string]$Root = "", [string]$LogPath = "")
$ErrorActionPreference = 'Stop'
if ([string]::IsNullOrWhiteSpace($Root)) { $Root = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path }
else { $Root = (Resolve-Path -LiteralPath ($Root.Trim().Trim('"'))).Path }
$lines = New-Object System.Collections.Generic.List[string]
function Out-Line([string]$Text,[ConsoleColor]$Color=[ConsoleColor]::Gray){$lines.Add($Text);Write-Host $Text -ForegroundColor $Color}
function Finish([int]$Code){if($LogPath){$parent=Split-Path $LogPath -Parent;if($parent){New-Item -ItemType Directory -Force -Path $parent|Out-Null};Set-Content -LiteralPath $LogPath -Value ($lines -join [Environment]::NewLine) -Encoding UTF8};exit $Code}
$certPath=Join-Path $Root 'tuev\certificate.json';$policyPath=Join-Path $Root 'tuev\policy.json'
if(!(Test-Path -LiteralPath $certPath)-or !(Test-Path -LiteralPath $policyPath)){Out-Line 'TUEV-ZERTIFIKAT ODER POLICY FEHLT.' Red;Finish 5}
$cert=Get-Content $certPath -Raw -Encoding UTF8|ConvertFrom-Json;$policy=Get-Content $policyPath -Raw -Encoding UTF8|ConvertFrom-Json
if($cert.status-ne'VALID'){Out-Line 'TUEV-ZERTIFIKAT IST NICHT GUELTIG.' Red;Finish 5}
$ignored=@{};foreach($x in $policy.ignoredHashPaths){$ignored[$x.Replace('\','/')]=$true}
$expected=@{};$cert.coveredFiles.psobject.Properties|ForEach-Object{$expected[$_.Name]=([string]$_.Value).ToLowerInvariant()}
$errors=New-Object System.Collections.Generic.List[string]
foreach($rel in $expected.Keys){$full=Join-Path $Root ($rel.Replace('/','\'));if(!(Test-Path $full -PathType Leaf)){$errors.Add("FEHLT | $rel | erwartet=$($expected[$rel])");continue};$actual=(Get-FileHash $full -Algorithm SHA256).Hash.ToLowerInvariant();if($actual-ne$expected[$rel]){$errors.Add("VERAENDERT | $rel | erwartet=$($expected[$rel]) | aktuell=$actual")}}
$all=Get-ChildItem $Root -Recurse -File|ForEach-Object{$rel=$_.FullName.Substring($Root.Length).TrimStart('\').Replace('\','/');if($rel-notmatch'(^|/)\.git(/|$)'-and $rel-notmatch'(^|/)__pycache__(/|$)'-and $rel-notmatch'\.pyc$'-and $rel-notmatch'\.zip$'-and $rel-notmatch'(^|/)diagnose(/|$)'-and $rel-notmatch'(^|/)dist(/|$)'-and !$ignored.ContainsKey($rel)){$rel}}
foreach($rel in $all){if(!$expected.ContainsKey($rel)){$actual=(Get-FileHash (Join-Path $Root ($rel.Replace('/','\'))) -Algorithm SHA256).Hash.ToLowerInvariant();$errors.Add("NICHT ZERTIFIZIERT | $rel | aktuell=$actual")}}
if($errors.Count){Out-Line 'TUEV-ZERTIFIKAT PASST NICHT ZUM DATEISTAND:' Red;$errors|ForEach-Object{Out-Line " - $_" Red};Finish 5}
Out-Line "TUEV-ZERTIFIKAT GUELTIG: $($cert.certificateId) | Version $($cert.version) | $($cert.level)" Green;Finish 0
