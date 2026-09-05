// V5.4.32 - SystemAssessmentCore: one truth for status, heart, brain and displays.
(function(global){
  "use strict";
  const VERSION="0.1.1-real-thermal";
  const THRESHOLDS=Object.freeze({
    levels:{green:82,yellow:65,orange:45,red:0},
    confidence:{good:75,limited:45,unknown:20},
    ping:{good:80,warn:180,red:300},
    routerPing:{good:20,warn:80,red:160},
    loss:{warn:1,orange:3,red:5},
    jitter:{warn:20,orange:35,red:50},
    cpu:{warn:80,red:95},ram:{warn:85,red:95},disk:{warn:80,red:95},temp:{warn:70,red:85}
  });
  const WEIGHTS=Object.freeze({router:18,internet:22,quality:20,dns:12,pc:14,runtime:14});
  const DOMAIN_LABELS=Object.freeze({router:"Router",internet:"Internet",quality:"Qualitaet",dns:"DNS",pc:"PC/System",runtime:"Pruefdienst"});
  const clamp=(v,min=0,max=100)=>Math.max(min,Math.min(max,Number.isFinite(Number(v))?Number(v):0));
  const num=(v,fb=null)=>Number.isFinite(Number(v))?Number(v):fb;
  function lowGood(value,good,red){const v=num(value,null);if(v==null)return null;if(v<=good)return 100;if(v>=red)return 0;return Math.round(100-((v-good)/(red-good))*100)}
  function highBad(value,warn,red){const v=num(value,null);if(v==null)return null;if(v<=warn)return 100;if(v>=red)return 0;return Math.round(100-((v-warn)/(red-warn))*100)}
  function levelFromScore(score,confidence,events){
    if(confidence<THRESHOLDS.confidence.unknown&&!events.some(e=>e.severity==="red"))return "unknown";
    if(events.some(e=>e.severity==="red"))return "red";
    if(score<THRESHOLDS.levels.orange||events.some(e=>e.severity==="orange"))return "orange";
    if(score<THRESHOLDS.levels.yellow||events.some(e=>e.severity==="yellow")||confidence<THRESHOLDS.confidence.limited)return "yellow";
    return "green";
  }
  function stateFromScore(score,available){if(!available)return "offline";if(score>=90)return "ok";if(score>=70)return "notice";if(score>=45)return "alarm";return "critical"}
  function worstLevel(levels){return levels.includes("red")?"red":levels.includes("orange")?"orange":levels.includes("yellow")?"yellow":"green"}
  function domain(id,score,available,reason,events=[]){
    const s=available?clamp(score):null;
    const level=available?levelFromScore(s,100,events):"unknown";
    return {id,label:DOMAIN_LABELS[id]||id,score:s==null?0:s,available:!!available,confidence:available?100:0,level,reason:reason||"noch nicht gemessen",events};
  }
  function assess(snapshot={},runtime={}){
    const d=snapshot||{}, events=[];
    const q=d.quality||{}, sys=d.system||{}, router=d.router||{};
    const routerOk=router.ok??d.routerOk??d.routerFound;
    const flatExternalTotal=num(d.externalTotal,null),flatExternalOk=num(d.externalOk,null);
    const targetValues=Object.values(d.targets||{});
    const external=targetValues.length?targetValues:(flatExternalTotal!=null?Array.from({length:flatExternalTotal},(_,i)=>({ok:i<flatExternalOk})):(d.targets?.cloudflare?[d.targets.cloudflare]:[]));
    const internetLike=d.multiPing||d.internet||d.targets?.cloudflare||{};
    const ping=num(internetLike.avgMs??d.targets?.cloudflare?.avgMs??d.ping,null);
    const loss=num(q.lossPct??internetLike.lossPct??d.loss?.percent??d.packetLoss,null);
    const jitter=num(q.p95JitterMs??internetLike.p95JitterMs??internetLike.jitterMs??d.jitter?.ms??d.jitter,null);
    const routerPing=num(router.avgMs??d.routerPing,null);
    const dnsValues=Object.values(d.dns||{}).filter(x=>x&&typeof x==="object");
    const dnsAvg=num(d.dns?.avgMs??d.dnsMs,null);
    const cpu=num(sys.cpuPct??d.cpu,null),ram=num(sys.memPct??sys.ramPct??d.ram,null),disk=num(sys.diskPct??d.disk,null);
    const tempCandidates=[sys.cpuTempC,sys.tempC,sys.temperatureC,sys.temperature,d.temperatureC,d.tempC,d.temperature,runtime?.smart?.temperature,runtime?.smart?.temp].map(x=>num(x,null)).filter(x=>x!=null);
    const temp=tempCandidates.length?Math.max(...tempCandidates):null;
    const tempSource=temp!=null?(runtime?.smart?.temperature!=null||runtime?.smart?.temp!=null?"SMART-/PC-Bericht":"Systemsensor"):null;
    const routerAvailable=routerOk!==undefined||router.avgMs!==undefined||d.routerPing!==undefined;
    const internetAvailable=!!(d.multiPing||d.internet||d.targets?.cloudflare||external.length||d.externalTotal!==undefined||d.ping!==undefined);
    const qualityAvailable=loss!=null||jitter!=null;
    const dnsAvailable=!!d.dns&&(dnsValues.length||dnsAvg!=null||d.dns.ok!==undefined)||d.dnsMs!==undefined;
    const pcAvailable=!!d.system&&(cpu!=null||ram!=null||disk!=null||temp!=null)||d.cpu!==undefined||d.ram!==undefined||d.disk!==undefined||temp!=null;
    const runtimeAvailable=Object.keys(d).length>0||d.ok!==undefined||d.probeOnline!==undefined;
    if(d.ok===false)events.push({domain:"runtime",severity:"yellow",reason:"Pruefdienst meldet keinen gueltigen Messzustand"});
    if(d.probeOnline===false)events.push({domain:"runtime",severity:"orange",reason:"Lokaler Pruefdienst nicht erreichbar"});
    if(routerOk===false)events.push({domain:"router",severity:"red",reason:"Router antwortet nicht"});
    if(routerOk===true&&external.length&&external.every(x=>x.ok===false))events.push({domain:"internet",severity:"red",reason:"Router erreichbar, aber externe Ziele nicht erreichbar"});
    if(loss!=null&&loss>=THRESHOLDS.loss.red)events.push({domain:"quality",severity:"red",reason:`Paketverlust ${loss.toFixed(1)} %`});
    else if(loss!=null&&loss>=THRESHOLDS.loss.orange)events.push({domain:"quality",severity:"orange",reason:`Paketverlust ${loss.toFixed(1)} %`});
    else if(loss!=null&&loss>=THRESHOLDS.loss.warn)events.push({domain:"quality",severity:"yellow",reason:`Paketverlust ${loss.toFixed(1)} %`});
    if(jitter!=null&&jitter>=THRESHOLDS.jitter.red)events.push({domain:"quality",severity:"red",reason:`Jitter P95 ${Math.round(jitter)} ms`});
    else if(jitter!=null&&jitter>=THRESHOLDS.jitter.orange)events.push({domain:"quality",severity:"orange",reason:`Jitter P95 ${Math.round(jitter)} ms`});
    else if(jitter!=null&&jitter>=THRESHOLDS.jitter.warn)events.push({domain:"quality",severity:"yellow",reason:`Jitter P95 ${Math.round(jitter)} ms`});
    if(cpu!=null&&cpu>=THRESHOLDS.cpu.red)events.push({domain:"pc",severity:"red",reason:`CPU ${Math.round(cpu)} %`});
    else if(cpu!=null&&cpu>=THRESHOLDS.cpu.warn)events.push({domain:"pc",severity:"yellow",reason:`CPU ${Math.round(cpu)} %`});
    if(ram!=null&&ram>=THRESHOLDS.ram.red)events.push({domain:"pc",severity:"red",reason:`RAM ${Math.round(ram)} %`});
    else if(ram!=null&&ram>=THRESHOLDS.ram.warn)events.push({domain:"pc",severity:"yellow",reason:`RAM ${Math.round(ram)} %`});
    if(disk!=null&&disk>=THRESHOLDS.disk.red)events.push({domain:"pc",severity:"red",reason:`Datentraeger ${Math.round(disk)} %`});
    else if(disk!=null&&disk>=THRESHOLDS.disk.warn)events.push({domain:"pc",severity:"yellow",reason:`Datentraeger ${Math.round(disk)} %`});
    if(temp!=null&&temp>=THRESHOLDS.temp.red)events.push({domain:"pc",severity:"red",reason:`Temperatur ${Math.round(temp)} °C`});
    else if(temp!=null&&temp>=THRESHOLDS.temp.warn)events.push({domain:"pc",severity:"yellow",reason:`Temperatur ${Math.round(temp)} °C`});
    const byDomain=id=>events.filter(e=>e.domain===id);
    const routerScore=routerOk===false?0:routerAvailable?Math.min(100,lowGood(routerPing??0,THRESHOLDS.routerPing.good,THRESHOLDS.routerPing.red)??100):0;
    const reachableExternal=external.length?external.filter(x=>x.ok!==false).length:null;
    const internetScore=internetAvailable?Math.min(lowGood(ping??0,THRESHOLDS.ping.good,THRESHOLDS.ping.red)??100,reachableExternal===0?0:100):0;
    const qualityParts=[loss==null?null:highBad(loss,THRESHOLDS.loss.warn,THRESHOLDS.loss.red),jitter==null?null:highBad(jitter,THRESHOLDS.jitter.warn,THRESHOLDS.jitter.red)].filter(v=>v!=null);
    const qualityScore=qualityParts.length?Math.round(qualityParts.reduce((a,b)=>a+b,0)/qualityParts.length):0;
    const dnsScore=dnsAvailable?(d.dns?.ok===false?20:dnsValues.length?Math.round(dnsValues.filter(x=>x.ok).length/dnsValues.length*100):(lowGood(dnsAvg??0,40,300)??100)):0;
    const pcParts=[cpu==null?null:highBad(cpu,THRESHOLDS.cpu.warn,THRESHOLDS.cpu.red),ram==null?null:highBad(ram,THRESHOLDS.ram.warn,THRESHOLDS.ram.red),disk==null?null:highBad(disk,THRESHOLDS.disk.warn,THRESHOLDS.disk.red),temp==null?null:highBad(temp,THRESHOLDS.temp.warn,THRESHOLDS.temp.red)].filter(v=>v!=null);
    const pcScore=pcParts.length?Math.round(pcParts.reduce((a,b)=>a+b,0)/pcParts.length):0;
    const runtimeScore=d.ok===false?65:d.probeOnline===false?35:runtimeAvailable?100:0;
    const domains={
      router:domain("router",routerScore,routerAvailable,routerAvailable?(routerOk===false?"Router nicht erreichbar":"Router bewertet"):"Router noch nicht gemessen",byDomain("router")),
      internet:domain("internet",internetScore,internetAvailable,internetAvailable?"Externe Erreichbarkeit bewertet":"Internet noch nicht gemessen",byDomain("internet")),
      quality:domain("quality",qualityScore,qualityAvailable,qualityAvailable?"Loss/Jitter bewertet":"Qualitaet noch nicht gemessen",byDomain("quality")),
      dns:domain("dns",dnsScore,dnsAvailable,dnsAvailable?"DNS bewertet":"DNS noch nicht gemessen",byDomain("dns")),
      pc:domain("pc",pcScore,pcAvailable,pcAvailable?"PC-Ressourcen bewertet":"PC noch nicht gemessen",byDomain("pc")),
      runtime:domain("runtime",runtimeScore,runtimeAvailable,runtimeAvailable?"Runtime bewertet":"Pruefdienst noch nicht bestaetigt",byDomain("runtime"))
    };
    const totalWeight=Object.values(WEIGHTS).reduce((a,b)=>a+b,0);
    const availableWeight=Object.entries(domains).reduce((sum,[id,d])=>sum+(d.available?WEIGHTS[id]:0),0);
    const confidence=Math.round(availableWeight/totalWeight*100);
    const rawScore=availableWeight?Math.round(Object.entries(domains).reduce((sum,[id,d])=>sum+(d.available?d.score*WEIGHTS[id]:0),0)/availableWeight):0;
    const worst=worstLevel(events.map(e=>e.severity));
    const eventCap=worst==="red"?35:worst==="orange"?60:worst==="yellow"?82:100;
    const weightedScore=Math.min(rawScore,eventCap);
    const overallLevel=levelFromScore(weightedScore,confidence,events);
    const visual=overallLevel==="orange"?"alarm":overallLevel==="red"?"critical":overallLevel==="yellow"?"notice":overallLevel==="unknown"?"offline":"ok";
    const bpm=overallLevel==="red"?138:overallLevel==="orange"?116:overallLevel==="yellow"?88:overallLevel==="unknown"?0:68;
    return {version:VERSION,overall:{score:weightedScore,rawScore,level:overallLevel,visual,confidence,bpm},domains,events,metrics:{ping,loss,jitter,routerPing,cpu,ram,disk,temp,tempSource,temperatureAvailable:temp!=null},display:{heartLevel:overallLevel,brainState:visual,ledLevel:overallLevel,label:overallLevel==="unknown"?"MESSWERTE WERDEN AUFGEBAUT":overallLevel==="green"?"SYSTEM STABIL":overallLevel==="yellow"?"BEOBACHTEN":overallLevel==="orange"?"ALARM":"KRITISCH"}};
  }
  global.SystemAssessmentCore=Object.freeze({version:VERSION,thresholds:THRESHOLDS,weights:WEIGHTS,assess,stateFromScore});
})(window);




