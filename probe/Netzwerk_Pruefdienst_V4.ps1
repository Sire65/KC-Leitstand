param([int]$Port=8765,[string]$Router="fritz.box")
$ErrorActionPreference="SilentlyContinue"
Add-Type -AssemblyName System.Net.HttpListener
$script:DeepUntil=[datetime]::MinValue
$script:LastRoute=""
function PingStats([string]$Target,[int]$Count=8,[string]$Family="Any"){
 $vals=@();$seq=@()
 1..$Count|%{
  $args=@("-n","1","-w","900");if($Family-eq"IPv4"){$args+="-4"}elseif($Family-eq"IPv6"){$args+="-6"};$args+=$Target
  $o=& ping @args 2>$null;$m=[regex]::Match(($o-join" "),'[=<]\s*(\d+)\s*ms')
  if($LASTEXITCODE-eq 0 -and $m.Success){$v=[double]$m.Groups[1].Value;$vals+=$v;$seq+=1}else{$seq+=0}
  Start-Sleep -Milliseconds 70
 }
 $loss=[math]::Round((1-$vals.Count/$Count)*100,1);$avg=if($vals.Count){[math]::Round(($vals|measure -Average).Average,1)}else{$null}
 $sorted=@($vals|sort);function Pct($p){if(!$sorted.Count){return $null};$i=[math]::Min($sorted.Count-1,[math]::Floor(($sorted.Count-1)*$p));return [double]$sorted[$i]}
 $diff=@();for($i=1;$i-lt$vals.Count;$i++){$diff += [math]::Abs($vals[$i]-$vals[$i-1])}
 $maxBurst=0;$cur=0;foreach($z in $seq){if($z-eq 0){$cur++;if($cur-gt$maxBurst){$maxBurst=$cur}}else{$cur=0}}
 @{ok=($vals.Count-gt 0);avgMs=$avg;lossPct=$loss;medianMs=(Pct .5);p95Ms=(Pct .95);p99Ms=(Pct .99);maxMs=if($vals.Count){($vals|measure -Maximum).Maximum}else{$null};jitterMs=if($diff.Count){[math]::Round(($diff|measure -Average).Average,1)}else{$null};p95JitterMs=if($diff.Count){$ds=@($diff|sort);[double]$ds[[math]::Min($ds.Count-1,[math]::Floor(($ds.Count-1)*.95))]}else{$null};maxLossBurst=$maxBurst}
}
function DnsTest([string]$Name){$sw=[Diagnostics.Stopwatch]::StartNew();try{[Net.Dns]::GetHostAddresses($Name)|Out-Null;$ok=$true}catch{$ok=$false};$sw.Stop();@{ok=$ok;ms=[math]::Round($sw.Elapsed.TotalMilliseconds,1);explain=if($ok){"Namensauflösung funktioniert"}else{"Namensauflösung fehlgeschlagen"}}}
function TcpTest([string]$HostName,[int]$P){$c=[Net.Sockets.TcpClient]::new();$sw=[Diagnostics.Stopwatch]::StartNew();try{$t=$c.ConnectAsync($HostName,$P);$ok=$t.Wait(3000)-and$c.Connected}catch{$ok=$false};$sw.Stop();$c.Dispose();@{ok=$ok;ms=[math]::Round($sw.Elapsed.TotalMilliseconds,1)}}
function SystemStat{
 $cpu=(Get-CimInstance Win32_Processor|measure LoadPercentage -Average).Average
 $os=Get-CimInstance Win32_OperatingSystem;$mem=[math]::Round((1-$os.FreePhysicalMemory/$os.TotalVisibleMemorySize)*100,1)
 $disk=(Get-Counter '\PhysicalDisk(_Total)\% Disk Time' -MaxSamples 1).CounterSamples.CookedValue
 @{cpuPct=[math]::Round($cpu,1);memPct=$mem;diskPct=[math]::Round([math]::Min(100,$disk),1)}
}
function WanStatus{
 $svc="urn:schemas-upnp-org:service:WANIPConnection:1";$xml="<?xml version=`"1.0`"?><s:Envelope s:encodingStyle=`"http://schemas.xmlsoap.org/soap/encoding/`" xmlns:s=`"http://schemas.xmlsoap.org/soap/envelope/`"><s:Body><u:GetStatusInfo xmlns:u=`"$svc`"></u:GetStatusInfo></s:Body></s:Envelope>"
 try{$r=Invoke-WebRequest -Uri "http://$Router`:49000/upnp/control/WANIPConn1" -Method Post -ContentType 'text/xml; charset="utf-8"' -Headers @{SOAPAction="`"$svc#GetStatusInfo`""} -Body $xml -TimeoutSec 3 -UseBasicParsing;[xml]$x=$r.Content;$n=$x.Envelope.Body.GetStatusInfoResponse;@{available=$true;connected=($n.NewConnectionStatus-eq"Connected");status=[string]$n.NewConnectionStatus;uptime=[int64]$n.NewUptime}}catch{@{available=$false;connected=$null;status="nicht verfügbar";uptime=$null}}
}
function RouteWatch{
 $o=& tracert -d -h 12 -w 500 1.1.1.1 2>$null;$hops=@($o|?{$_ -match '^\s*\d+\s'}|%{($_ -replace '\s+',' ').Trim()});$sig=($hops-join"|");$changed=($script:LastRoute-ne"" -and $sig-ne$script:LastRoute);$script:LastRoute=$sig;@{ok=($hops.Count-gt 0);changed=$changed;hopCount=$hops.Count;signature=([Convert]::ToHexString([Security.Cryptography.SHA256]::HashData([Text.Encoding]::UTF8.GetBytes($sig))).Substring(0,12));hops=$hops}
}
function Snapshot([bool]$Deep=$false){
 $count=if($Deep){24}else{8}
 $router=PingStats $Router 4
 $targets=@{cloudflare=(PingStats "1.1.1.1" $count);google=(PingStats "8.8.8.8" $count);quad9=(PingStats "9.9.9.9" $count)}
 $quality=$targets.cloudflare
 $ip=@{ipv4=(PingStats "1.1.1.1" 4 "IPv4");ipv6=(PingStats "2606:4700:4700::1111" 4 "IPv6")}
 $dns=@{google=(DnsTest "www.google.com");cloudflare=(DnsTest "www.cloudflare.com");chatgpt=(DnsTest "chatgpt.com")}
 $tcp=@{httpsCloudflare=(TcpTest "www.cloudflare.com" 443);httpsGoogle=(TcpTest "www.google.com" 443)}
 $route=if($Deep){RouteWatch}else{@{ok=$null;changed=$false;hopCount=$null;signature=$null}}
 @{ok=$true;mode=if($Deep){"DEEP"}else{"LIGHT"};ts=[DateTimeOffset]::Now.ToUnixTimeMilliseconds();router=$router;targets=$targets;quality=$quality;ip=$ip;dns=$dns;tcp=$tcp;wan=(WanStatus);system=(SystemStat);route=$route}
}

function Get-TSharkInfo{
 $candidates=@(
  (Get-Command tshark.exe -ErrorAction SilentlyContinue).Source,
  "$env:ProgramFiles\Wireshark\tshark.exe",
  "${env:ProgramFiles(x86)}\Wireshark\tshark.exe"
 )|Where-Object{$_ -and (Test-Path $_)}|Select-Object -Unique
 if(!$candidates){return @{available=$false;path=$null;version=$null}}
 $exe=$candidates[0];$ver=& $exe --version 2>$null|Select-Object -First 1
 @{available=$true;path=$exe;version=([string]$ver -replace '^TShark \(Wireshark\)\s*','')}
}
function Add-Stat($Map,[string]$Key,[int64]$Bytes=0){if([string]::IsNullOrWhiteSpace($Key)){return};if(!$Map.ContainsKey($Key)){$Map[$Key]=@{count=0;bytes=0}};$Map[$Key].count++;$Map[$Key].bytes+=$Bytes}
function Analyze-TShark([string]$CapturePath,[string]$OriginalName){
 $info=Get-TSharkInfo;if(!$info.available){throw 'TShark ist nicht installiert.'}
 $out=[IO.Path]::GetTempFileName();$err=[IO.Path]::GetTempFileName()
 try{
  $fields=@('frame.time_epoch','frame.len','_ws.col.Protocol','ip.src','ipv6.src','ip.dst','ipv6.dst','tcp.analysis.retransmission','tcp.analysis.fast_retransmission','tcp.analysis.duplicate_ack','tcp.analysis.out_of_order','tcp.analysis.lost_segment','tcp.flags.reset','dns.qry.name','dns.flags.rcode')
  $args=@('-r',$CapturePath,'-n','-T','fields');foreach($f in $fields){$args+=@('-e',$f)};$args+=@('-E','separator=\t','-E','quote=n','-E','occurrence=f')
  $argLine=($args|ForEach-Object{if($_ -match '[\s"]'){"`"$($_ -replace '"','\"')`""}else{$_}})-join ' '
  $proc=Start-Process -FilePath $info.path -ArgumentList $argLine -RedirectStandardOutput $out -RedirectStandardError $err -PassThru -WindowStyle Hidden
  if(!$proc.WaitForExit(180000)){try{$proc.Kill()}catch{};throw 'TShark-Zeitlimit von 180 Sekunden erreicht.'}
  if($proc.ExitCode-ne 0){$msg=(Get-Content $err -Raw);if($msg){throw $msg.Trim()}else{throw "TShark meldete Fehlercode $($proc.ExitCode)"}}
  $protocols=@{};$endpoints=@{};$domains=@{};$packets=0L;$total=0L;$first=$null;$last=$null;$retrans=0L;$dup=0L;$ooo=0L;$lost=0L;$rst=0L;$dnsErrors=0L
  Get-Content $out|ForEach-Object{
   $a=$_ -split "`t",-1;if($a.Count-lt 15){return};$packets++
   $epoch=0.0;[double]::TryParse($a[0],[Globalization.NumberStyles]::Float,[Globalization.CultureInfo]::InvariantCulture,[ref]$epoch)|Out-Null;if($first-eq$null){$first=$epoch};$last=$epoch
   $len=0L;[int64]::TryParse($a[1],[ref]$len)|Out-Null;$total+=$len;$proto=if($a[2]){$a[2]}else{'Unbekannt'};Add-Stat $protocols $proto $len
   $src=if($a[3]){$a[3]}else{$a[4]};$dst=if($a[5]){$a[5]}else{$a[6]};Add-Stat $endpoints $src $len;Add-Stat $endpoints $dst $len
   if($a[7] -or $a[8]){$retrans++};if($a[9]){$dup++};if($a[10]){$ooo++};if($a[11]){$lost++};if($a[12] -match '1'){$rst++};if($a[13]){Add-Stat $domains $a[13] 0};if($a[14] -and $a[14] -ne '0'){$dnsErrors++}
  }
  $toList={param($m,$name) @($m.GetEnumerator()|ForEach-Object{if($name-eq'address'){@{address=$_.Key;count=$_.Value.count;bytes=$_.Value.bytes}}elseif($name-eq'name'){@{name=$_.Key;count=$_.Value.count;bytes=$_.Value.bytes}}}|Sort-Object bytes,count -Descending)}
  $duration=if($first-ne$null -and $last-ne$null){[math]::Max(0,$last-$first)}else{0}
  $findings=@();$ratio=if($packets){$retrans/$packets}else{0}
  if($ratio-gt .02){$findings+=@{level='bad';text="Erhoehte TCP-Retransmissions: $retrans von $packets Paketen ($([math]::Round($ratio*100,2)) %). Moegliche Verluste oder starke Verzoegerungen."}}elseif($retrans){$findings+=@{level='warn';text="$retrans TCP-Retransmissions erkannt. Einzelne Wiederholungen koennen normal sein."}}else{$findings+=@{level='ok';text='Keine TCP-Retransmissions erkannt.'}}
  if($dup){$findings+=@{level=if($dup/$packets-gt .02){'bad'}else{'warn'};text="$dup Duplicate-ACK-Hinweise erkannt."}}
  if($ooo){$findings+=@{level='warn';text="$ooo Out-of-Order-Pakete erkannt. Das kann durch Pfadwechsel, WLAN oder Neuordnung entstehen."}}
  if($lost){$findings+=@{level='bad';text="$lost TCP-Lost-Segment-Hinweise erkannt. Diese sind ein starkes Indiz fuer fehlende Segmente im Mitschnitt."}}
  if($rst){$findings+=@{level=if($rst/$packets-gt .01){'warn'}else{'ok'};text="$rst TCP-Resets erkannt."}}
  if($dnsErrors){$findings+=@{level='warn';text="$dnsErrors DNS-Antworten mit Fehlercode erkannt."}}
  @{fileName=$OriginalName;packets=$packets;totalBytes=$total;duration=[math]::Round($duration,3);retransmissions=$retrans;duplicateAcks=$dup;outOfOrder=$ooo;lostSegments=$lost;tcpResets=$rst;dnsErrors=$dnsErrors;protocols=(& $toList $protocols 'name');endpoints=(& $toList $endpoints 'address');dnsQueries=(& $toList $domains 'name');findings=$findings;analyzedAt=[DateTimeOffset]::Now.ToString('o')}
 }finally{Remove-Item $out,$err -Force -ErrorAction SilentlyContinue}
}

$l=[Net.HttpListener]::new();$l.Prefixes.Add("http://127.0.0.1:$Port/");$l.Start()
Clear-Host;Write-Host "============================================================" -ForegroundColor DarkCyan
Write-Host " NETZWERK-LEITSTAND V4.0 - VOLLANALYSE PRUEFDIENST" -ForegroundColor Cyan
Write-Host " Framework-Referenz: Studio V1.38.22" -ForegroundColor DarkGray
Write-Host "============================================================" -ForegroundColor DarkCyan
Write-Host "Status: AKTIV - lastarmer Dauerbetrieb" -ForegroundColor Green
Write-Host "Tiefenanalyse wird nur bei Bedarf 60 Sekunden aktiviert.`n"
while($l.IsListening){$c=$l.GetContext();$c.Response.Headers.Add("Access-Control-Allow-Origin","*");$c.Response.Headers.Add("Access-Control-Allow-Methods","GET,POST,OPTIONS");$c.Response.Headers.Add("Access-Control-Allow-Headers","Content-Type,X-File-Name")
 if($c.Request.HttpMethod-eq"OPTIONS"){$c.Response.StatusCode=204;$c.Response.Close();continue}
 $path=$c.Request.Url.AbsolutePath
 if($path-eq"/trigger-deep"){$script:DeepUntil=(Get-Date).AddSeconds(60);$obj=@{ok=$true;deepUntil=$script:DeepUntil}}
 elseif($path-eq"/deep"){$obj=Snapshot $true}
 elseif($path-eq"/status"){$obj=Snapshot ((Get-Date)-lt$script:DeepUntil)}
 elseif($path-eq"/health"){$obj=@{ok=$true;service="NetworkLeitstandV4"}}
 elseif($path-eq"/tshark/status"){$ti=Get-TSharkInfo;$obj=@{ok=$true;service=$true;available=$ti.available;version=$ti.version}}
 elseif($path-eq"/tshark/analyze" -and $c.Request.HttpMethod-eq"POST"){
  $ti=Get-TSharkInfo
  if(!$ti.available){$obj=@{ok=$false;error="TShark ist nicht installiert."}}
  elseif($c.Request.ContentLength64-eq 0){$obj=@{ok=$false;error="Keine Datei empfangen."}}
  elseif($c.Request.ContentLength64-gt 104857600){$obj=@{ok=$false;error="Datei ist groesser als 100 MB."}}
  else{
   $tmp=[IO.Path]::Combine([IO.Path]::GetTempPath(),"NL_"+[guid]::NewGuid().ToString('N')+".pcap")
   try{$fs=[IO.File]::Create($tmp);$c.Request.InputStream.CopyTo($fs);$fs.Close();$raw=$c.Request.Headers['X-File-Name'];$name=if($raw){[IO.Path]::GetFileName([Uri]::UnescapeDataString($raw))}else{'Paketmitschnitt.pcap'};$analysis=Analyze-TShark $tmp $name;$obj=@{ok=$true;version=$ti.version;analysis=$analysis}}
   catch{$obj=@{ok=$false;error=$_.Exception.Message}}
   finally{if($fs){$fs.Dispose()};Remove-Item $tmp -Force -ErrorAction SilentlyContinue}
  }
 }
 else{$c.Response.StatusCode=404;$c.Response.Close();continue}
 $b=[Text.Encoding]::UTF8.GetBytes(($obj|ConvertTo-Json -Depth 10 -Compress));$c.Response.ContentType="application/json; charset=utf-8";$c.Response.OutputStream.Write($b,0,$b.Length);$c.Response.Close()
}