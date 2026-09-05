// V5.4.0 - Scalable organ/sensor registry for small and large IT environments.
(function(){
  'use strict';
  const ORGANS={
    circulation:{label:'Kreislauf',purpose:'WAN, Internet, Routing und Provider',node:0,priority:100},
    respiration:{label:'Atmung',purpose:'WLAN, Funk, Access Points und Mesh',node:2,priority:80},
    nervous:{label:'Nervensystem',purpose:'DNS, DHCP, NTP und Namensaufloesung',node:3,priority:95},
    muscles:{label:'Muskeln',purpose:'Server, NAS, PCs und Clients',node:5,priority:75},
    senses:{label:'Sinne',purpose:'Kameras, IoT und externe Sensorik',node:6,priority:55},
    energy:{label:'Energie',purpose:'USV, Netzteile, PoE und Akkus',node:4,priority:85},
    immunity:{label:'Immunsystem',purpose:'Firewall, Schutz, Zertifikate und Anomalien',node:7,priority:100},
    memory:{label:'Gedaechtnis',purpose:'Historie, Protokolle, Backups und Speicher',node:1,priority:70},
    motor:{label:'Motor',purpose:'Leitstand-Runtime, Scheduler und Pruefdienst',node:5,priority:100}
  };
  const sensors=new Map();
  const clamp=v=>Math.max(0,Math.min(100,Number(v)||0));
  const stateFromScore=(score,available=true)=>!available?'offline':score>=90?'ok':score>=70?'notice':score>=40?'alarm':'critical';
  function register(def){
    if(!def||!def.id||!ORGANS[def.organ])throw new Error('Sensor braucht id und gueltiges Organ');
    const current=sensors.get(def.id)||{};
    const item={id:def.id,label:def.label||def.id,organ:def.organ,unit:def.unit||'',source:def.source||'runtime',loadClass:def.loadClass||'low',intervalSec:def.intervalSec||30,alarmCapable:def.alarmCapable!==false,enabled:def.enabled!==false,available:def.available!==false,value:def.value??null,score:clamp(def.score??100),state:def.state||stateFromScore(def.score??100,def.available!==false),lastUpdate:def.lastUpdate||0,reason:def.reason||'',...current,...def};
    item.score=clamp(item.score);item.state=item.state||stateFromScore(item.score,item.available);sensors.set(item.id,item);return item;
  }
  function update(id,patch){const item=sensors.get(id);if(!item)return register({id,organ:patch.organ||'motor',...patch});Object.assign(item,patch,{lastUpdate:Date.now()});item.score=clamp(item.score);item.state=patch.state||stateFromScore(item.score,item.available!==false);return item}
  function remove(id){return sensors.delete(id)}
  function list(filter={}){return [...sensors.values()].filter(s=>(filter.organ?filter.organ===s.organ:true)&&(filter.enabled===undefined?true:s.enabled===filter.enabled))}
  function organStatus(id){const organ=ORGANS[id];if(!organ)return null;const active=list({organ:id,enabled:true});if(!active.length)return{...organ,id,count:0,score:100,state:'offline',critical:0,warnings:0,attention:0};const weighted=active.reduce((a,s)=>{const w=s.alarmCapable?1.25:1;return{sum:a.sum+s.score*w,weight:a.weight+w}}, {sum:0,weight:0});const score=Math.round(weighted.sum/Math.max(1,weighted.weight));const critical=active.filter(s=>s.state==='critical'||s.state==='alarm').length,warnings=active.filter(s=>s.state==='notice').length;const attention=Math.round((100-score)*.65+critical*18+warnings*6+Math.min(20,active.length/10));return{...organ,id,count:active.length,score,state:stateFromScore(score,true),critical,warnings,attention:clamp(attention),worst:active.slice().sort((a,b)=>a.score-b.score)[0]}}
  function summary(){const organs=Object.keys(ORGANS).map(organStatus);const totalSensors=list({enabled:true}).length;const weighted=organs.reduce((a,o)=>({sum:a.sum+o.score*o.priority,weight:a.weight+o.priority}),{sum:0,weight:0});const score=Math.round(weighted.sum/Math.max(1,weighted.weight));return{score,state:stateFromScore(score,true),totalSensors,organs,critical:organs.reduce((n,o)=>n+o.critical,0),warnings:organs.reduce((n,o)=>n+o.warnings,0),focus:organs.slice().sort((a,b)=>b.attention-a.attention)} }
  function seed(){[
    ['internet.reachability','Internet erreichbar','circulation','%',10],['internet.ping','Internet-Latenz','circulation','ms',10],['internet.loss','Paketverlust','circulation','%',10],['router.reachability','Router erreichbar','circulation','%',10],
    ['wifi.signal','WLAN-Signal','respiration','%',30],['wifi.stability','WLAN-Stabilitaet','respiration','%',30],
    ['dns.latency','DNS-Latenz','nervous','ms',15],['dns.reliability','DNS-Zuverlaessigkeit','nervous','%',30],
    ['system.cpu','CPU','muscles','%',15],['system.ram','Arbeitsspeicher','muscles','%',15],['system.disk','Datentraeger','memory','%',60],
    ['security.firewall','Firewall','immunity','%',60],['runtime.scheduler','Scheduler','motor','%',5],['runtime.probe','Pruefdienst','motor','%',10]
  ].forEach(([id,label,organ,unit,intervalSec])=>register({id,label,organ,unit,intervalSec,score:100}));}
  seed();
  window.LeitstandOrganRegistry={ORGANS,register,update,remove,list,organStatus,summary,stateFromScore};
})();
