const FRITZ_PROFILES=[{"id": "6690-cable", "name": "FRITZ!Box 6690 Cable", "access": "cable", "docsis": "3.1", "wifi": "Wi-Fi 6", "tr064": true, "defaultHost": "fritz.box", "features": ["DOCSIS", "WAN", "Mesh", "DVB-C", "DECT"], "recommended": {"interval": 15, "deep": 60}}, {"id": "6670-cable", "name": "FRITZ!Box 6670 Cable", "access": "cable", "docsis": "3.1", "wifi": "Wi-Fi 7", "tr064": true, "defaultHost": "fritz.box", "features": ["DOCSIS", "WAN", "Mesh", "Zigbee", "DECT"], "recommended": {"interval": 15, "deep": 60}}, {"id": "6660-cable", "name": "FRITZ!Box 6660 Cable", "access": "cable", "docsis": "3.1", "wifi": "Wi-Fi 6", "tr064": true, "defaultHost": "fritz.box", "features": ["DOCSIS", "WAN", "Mesh", "DECT"], "recommended": {"interval": 15, "deep": 60}}, {"id": "6591-cable", "name": "FRITZ!Box 6591 Cable", "access": "cable", "docsis": "3.1", "wifi": "Wi-Fi 5", "tr064": true, "defaultHost": "fritz.box", "features": ["DOCSIS", "WAN", "Mesh", "DVB-C", "DECT"], "recommended": {"interval": 15, "deep": 60}}, {"id": "7690-dsl", "name": "FRITZ!Box 7690", "access": "dsl", "docsis": null, "wifi": "Wi-Fi 7", "tr064": true, "defaultHost": "fritz.box", "features": ["DSL", "WAN", "Mesh", "Zigbee", "DECT"], "recommended": {"interval": 15, "deep": 60}}, {"id": "7590ax-dsl", "name": "FRITZ!Box 7590 AX", "access": "dsl", "docsis": null, "wifi": "Wi-Fi 6", "tr064": true, "defaultHost": "fritz.box", "features": ["DSL", "WAN", "Mesh", "DECT"], "recommended": {"interval": 15, "deep": 60}}, {"id": "5690pro-fiber", "name": "FRITZ!Box 5690 Pro", "access": "fiber-dsl", "docsis": null, "wifi": "Wi-Fi 7", "tr064": true, "defaultHost": "fritz.box", "features": ["Fiber", "DSL", "WAN", "Mesh", "Zigbee", "DECT"], "recommended": {"interval": 15, "deep": 60}}, {"id": "5590-fiber", "name": "FRITZ!Box 5590 Fiber", "access": "fiber", "docsis": null, "wifi": "Wi-Fi 6", "tr064": true, "defaultHost": "fritz.box", "features": ["Fiber", "WAN", "Mesh", "DECT"], "recommended": {"interval": 15, "deep": 60}}, {"id": "5530-fiber", "name": "FRITZ!Box 5530 Fiber", "access": "fiber", "docsis": null, "wifi": "Wi-Fi 6", "tr064": true, "defaultHost": "fritz.box", "features": ["Fiber", "WAN", "Mesh", "DECT"], "recommended": {"interval": 15, "deep": 60}}, {"id": "4060-wan", "name": "FRITZ!Box 4060", "access": "wan", "docsis": null, "wifi": "Wi-Fi 6", "tr064": true, "defaultHost": "fritz.box", "features": ["WAN", "Mesh", "DECT"], "recommended": {"interval": 15, "deep": 60}}];
const $=id=>document.getElementById(id);
const EXTRA_ROUTER_PROFILES=[
 {id:"speedport-smart4",name:"Telekom Speedport Smart 4",access:"dsl-wan",docsis:null,wifi:"Wi-Fi 6",tr064:false,defaultHost:"speedport.ip",features:["DSL","WAN","WLAN"],recommended:{interval:15,deep:60}},
 {id:"vodafone-station",name:"Vodafone Station",access:"cable",docsis:"3.1",wifi:"Wi-Fi 5/6",tr064:false,defaultHost:"192.168.0.1",features:["DOCSIS","WAN","WLAN"],recommended:{interval:15,deep:60}},
 {id:"easybox-805",name:"Vodafone EasyBox 805",access:"dsl-wan",docsis:null,wifi:"Wi-Fi 5",tr064:false,defaultHost:"easy.box",features:["DSL","WAN","WLAN"],recommended:{interval:15,deep:60}},
 {id:"tp-link-archer",name:"TP-Link Archer / Deco",access:"wan-mesh",docsis:null,wifi:"modellabhaengig",tr064:false,defaultHost:"tplinkwifi.net",features:["WAN","Mesh","WLAN"],recommended:{interval:15,deep:60}},
 {id:"custom-router",name:"Eigenes Routermodell",access:"custom",docsis:null,wifi:"unbekannt",tr064:false,defaultHost:"192.168.1.1",features:["WAN","DNS","Ping"],recommended:{interval:15,deep:60}}
];

// V4.3.5 - quota-sichere Datenspeicherung und Routererkennung; bestehende Laufzeitfunktionen geschuetzt
let lagState={last:performance.now(),current:0,max:0,history:[],longTasks:0};
let operationState={active:false,title:"SYSTEMBEREITSCHAFT",detail:"Warte auf ersten Messzyklus ...",result:"Noch kein Ergebnis",next:"FRITZ!Box pruefen",last:"-",lastTime:new Date().toLocaleTimeString("de-DE"),step:0};
let deepTimer=null;
function testOn(id){return S.settings.master!==false&&S.settings[id]!==false}
const AnimationManager={
 enabled(){return S.settings.master!==false&&S.settings.animations!==false},
 apply(){
  const enabled=this.enabled();
  document.body.classList.toggle("animations-off",!enabled);
  document.body.classList.toggle("reduced-motion",!enabled);
  document.documentElement.style.setProperty("--animation-state",enabled?"running":"paused");
  const ring=$("scanRing");if(ring)ring.classList.toggle("paused",!enabled);
  if(!enabled){
   document.querySelectorAll(".head-heart").forEach(el=>{el.style.transform="scale(.92)";el.style.opacity=".62";el.style.filter="none"});
  }
  return enabled;
 }
};
function animationsOn(){return AnimationManager.enabled()}
const AlertSoundService={
 ctx:null,lastKey:"",lastAt:0,repeats:0,timer:null,
 enabled(){return S.settings.alertSound===true&&S.settings.audioEnabled!==false&&(S.settings.audioActiveChannel==="alarms"||S.settings.audioActiveChannel==="warnings")},
 async unlock(){try{this.ctx=this.ctx||new (window.AudioContext||window.webkitAudioContext)();if(this.ctx.state==="suspended")await this.ctx.resume();return true}catch{return false}},
 async tone(level="red"){
  if(!await this.unlock())return false;
  const count=Math.max(1,Math.min(5,Number(S.settings.alertBeeps)||3)),vol=Math.max(.05,Math.min(1,(Number(S.settings.alertVolume)||60)/100));
  const freq=level==="red"?880:620,dur=level==="red"?.34:.22,gap=.18;
  for(let i=0;i<count;i++){const at=this.ctx.currentTime+i*(dur+gap),o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type="sine";o.frequency.setValueAtTime(freq,at);g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(vol,at+.025);g.gain.exponentialRampToValueAtTime(.0001,at+dur);o.connect(g).connect(this.ctx.destination);o.start(at);o.stop(at+dur+.03)}
  return true;
 },
 qualifies(level){return this.enabled()&&(level==="red"||(level==="yellow"&&S.settings.alertLevel==="yellow"))},
 notify(level,text,source){
  if(!this.qualifies(level))return;
  const key=level+"|"+source+"|"+text,now=Date.now(),repeatMs=Math.max(0,Number(S.settings.alertRepeat)||0)*1000,max=Math.max(1,Number(S.settings.alertMaxRepeats)||3);
  if(key!==this.lastKey){this.lastKey=key;this.repeats=0;this.lastAt=0}
  if(this.repeats>=max||now-this.lastAt<Math.max(3000,repeatMs))return;
  this.lastAt=now;this.repeats++;if(window.AudioCore){const prev=S.settings.audioActiveChannel;S.settings.audioActiveChannel=level==="red"?"alarms":"warnings";configureAudioCore();window.AudioCore.test(S.settings.audioActiveChannel,level==="red"?"alarm":"warning");S.settings.audioActiveChannel=prev;configureAudioCore()}else this.tone(level);
 },
 reset(){this.lastKey="";this.lastAt=0;this.repeats=0;if(this.timer)clearTimeout(this.timer)}
};

const AudioChannelCatalog=[
 ["latencyBall","Kugel-Klack","click"],
 ["healthRing","HealthRing","tone"],
 ["heart","EKG / Herz","ekg"],
 ["brain","Gehirn / Mystik","brain"],
 ["warnings","Warnungen","warning"],
 ["alarms","Alarme","alarm"],
 ["training","Schulung/Demo","training"]
];
function audioIcon(channel){return ""}
function configureAudioCore(){
 if(!window.AudioCore)return;
 S.settings.audioChannelVolume=S.settings.audioChannelVolume||{};
 const active=S.settings.audioActiveChannel||"";
 const level=Number(S.settings.audioChannelVolume[active]??S.settings.audioVolume??55);
 window.AudioCore.configure({enabled:S.settings.audioEnabled!==false,volume:level/100,activeChannel:active});
 document.querySelectorAll("[data-audio-channel]").forEach(b=>{const active=S.settings.audioEnabled!==false&&S.settings.audioActiveChannel===b.dataset.audioChannel;b.classList.toggle("active",active);b.classList.toggle("muted",!active);b.textContent=audioIcon(b.dataset.audioChannel);b.title=active?"Sound aktiv - klicken zum Ausschalten":"Sound testen und aktivieren"});
 if($("setAudioChannel"))$("setAudioChannel").value=S.settings.audioActiveChannel||"";
 if($("setAudioEnabled"))$("setAudioEnabled").checked=S.settings.audioEnabled!==false;
 if($("setAudioVolume")){$("setAudioVolume").value=String(S.settings.audioVolume??55);if($("audioVolumeValue"))$("audioVolumeValue").textContent=String(S.settings.audioVolume??55)+" %"}
 document.querySelectorAll("[data-audio-volume]").forEach(r=>{const ch=r.dataset.audioVolume;r.value=String(S.settings.audioChannelVolume?.[ch]??S.settings.audioVolume??55);const out=r.closest(".audio-channel-row,.audio-inline-control")?.querySelector("[data-audio-volume-value]");if(out)out.textContent=r.value+" %"});
}
async function toggleAudioChannel(channel,kind){
 S.settings.audioEnabled=true;
 S.settings.audioChannelVolume=S.settings.audioChannelVolume||{};
 if(S.settings.audioChannelVolume[channel]==null)S.settings.audioChannelVolume[channel]=S.settings.audioVolume??55;
 S.settings.audioActiveChannel=S.settings.audioActiveChannel===channel?"":channel;
 save();configureAudioCore();renderAudioSettings();
 if(window.AudioCore)await window.AudioCore.activateChannel(S.settings.audioActiveChannel||"");
 const note=$("audioLiveNote");if(note)note.textContent=S.settings.audioActiveChannel?("Aktiver Ton: "+audioLabel(S.settings.audioActiveChannel)):"Alle Sounds aus";
}
function audioLabel(channel){return (AudioChannelCatalog.find(x=>x[0]===channel)||[,channel])[1]}
async function checkAudioDevice(){
 const box=$("audioDeviceStatus");if(box)box.textContent="Pruefe Audiogeraet ...";
 const status=await window.AudioCore?.checkDevice?.();
 if(box){box.textContent=status?.message||"AudioCore ist nicht geladen.";box.classList.toggle("ok",!!status?.unlocked);box.classList.toggle("warn",!status?.unlocked)}
 return status;
}
async function runDirectAudioTest(){
 const box=$("audioDeviceStatus");if(box)box.textContent="Starte direkten Lautsprechertest ...";
 const status=await window.AudioCore?.checkDevice?.();
 const result=await window.AudioCore?.directTest?.();
 const text=[status?.message,result?.message,"WebAudio: "+(result?.webAudio?"gestartet":"nein"),"HTMLAudio: "+(result?.htmlAudio?"gestartet":"nein"),"AudioContext: "+(result?.ctxState||"unbekannt")].filter(Boolean).join(" | ");
 if(box){box.textContent=text||"AudioCore ist nicht geladen.";box.classList.toggle("ok",!!(result?.webAudio||result?.htmlAudio));box.classList.toggle("warn",!(result?.webAudio||result?.htmlAudio))}
 return result;
}function renderAudioSettings(){
 const host=$("audioChannelList");if(!host)return;
 host.innerHTML=AudioChannelCatalog.map(([id,label,kind])=>`<div class="audio-channel-row"><button class="audio-toggle ${S.settings.audioActiveChannel===id?"active":"muted"}" type="button" data-audio-channel="${id}" data-audio-kind="${kind}" title="${label} testen">${audioIcon(id)}</button><b>${label}</b><input class="audio-volume-mini" type="range" min="0" max="100" step="1" value="${S.settings.audioChannelVolume?.[id]??S.settings.audioVolume??55}" data-audio-volume="${id}" title="Lautstaerke ${label}"><small data-audio-volume-value>${S.settings.audioChannelVolume?.[id]??S.settings.audioVolume??55} %</small><small>${S.settings.audioActiveChannel===id?"aktiv":"aus"}</small></div>`).join("");
 host.querySelectorAll("[data-audio-channel]").forEach(b=>b.onclick=()=>toggleAudioChannel(b.dataset.audioChannel,b.dataset.audioKind));
 bindAudioVolumeControls(host);
 configureAudioCore();
}
function bindAudioVolumeControls(root=document){root.querySelectorAll("[data-audio-volume]").forEach(r=>{if(r.dataset.boundVolume)return;r.dataset.boundVolume="1";r.addEventListener("input",()=>{S.settings.audioChannelVolume=S.settings.audioChannelVolume||{};const ch=r.dataset.audioVolume;S.settings.audioChannelVolume[ch]=+r.value;if(S.settings.audioActiveChannel===ch){S.settings.audioVolume=+r.value;window.AudioCore?.setVolume?.(+r.value/100)}const out=r.closest(".audio-channel-row,.audio-inline-control")?.querySelector("[data-audio-volume-value]");if(out)out.textContent=r.value+" %";save();configureAudioCore();});});}
function audioInlineControl(channel,kind){const value=S.settings.audioChannelVolume?.[channel]??S.settings.audioVolume??55;return `<span class="audio-inline-control"><button class="audio-toggle ${S.settings.audioActiveChannel===channel?"active":"muted"}" type="button" data-audio-channel="${channel}" data-audio-kind="${kind}" title="${audioLabel(channel)} testen">${audioIcon(channel)}</button><input class="audio-volume-mini" type="range" min="0" max="100" step="1" value="${value}" data-audio-volume="${channel}" title="Lautstaerke ${audioLabel(channel)}"><small data-audio-volume-value>${value} %</small></span>`}
function attachAudioToggles(){
 const targets=[
  ["#lagValue","latencyBall","click"],
  ['[data-instrument="multiPing"]',"latencyBall","click"],
  ['[data-instrument="loss"]',"warnings","warning"],
  ['[data-instrument="system"]',"warnings","warning"],
  ['.brain-inline-card',"brain","brain"],
  ['.head-pulse',"heart","ekg"]
 ];
 targets.forEach(([selector,channel,kind])=>{
  document.querySelectorAll(selector).forEach(el=>{
   const host=el.closest(".foldable,.gauge,.card,.lag-panel")||el;
   if(host.querySelector(`:scope > .audio-toggle[data-audio-channel="${channel}"]`))return;
   const wrap=document.createElement("span");wrap.className="audio-inline-control";wrap.innerHTML=audioInlineControl(channel,kind);wrap.querySelector("[data-audio-channel]").onclick=e=>{e.stopPropagation();toggleAudioChannel(channel,kind)};bindAudioVolumeControls(wrap);host.appendChild(wrap);
  });
 });
 configureAudioCore();
}
window.addEventListener("latency-ball.bounce",e=>{const d=e.detail||{},v=Math.abs(Number(d.velocity)||0),lat=Number(d.latencyMs)||0,intensity=Math.max(.15,Math.min(1.4,v*.22+lat/220));window.AudioCore?.click("latencyBall",{intensity,volume:Math.max(.75,(Number(S.settings.audioVolume)||85)/100),minGapMs:0})});
let alertRangeMinutes=60;
function alertEvents(){const since=Date.now()-alertRangeMinutes*60000;return (S.events||[]).filter(e=>e.ts>=since&&(e.level==="yellow"||e.level==="red"))}
function renderAlertHistory(){
 const c=$("alertHistoryCanvas");if(!c)return;const list=alertEvents(),yc=list.filter(e=>e.level==="yellow").length,rc=list.filter(e=>e.level==="red").length;
 if($("alertYellowCount"))$("alertYellowCount").textContent=yc;if($("alertRedCount"))$("alertRedCount").textContent=rc;
 const dpr=devicePixelRatio||1,w=c.width=Math.max(180,c.clientWidth)*dpr,h=c.height=56*dpr,x=c.getContext("2d"),bins=18,now=Date.now(),span=alertRangeMinutes*60000,step=span/bins;
 x.clearRect(0,0,w,h);x.strokeStyle="#244759";x.lineWidth=1*dpr;for(let i=1;i<4;i++){x.beginPath();x.moveTo(0,h*i/4);x.lineTo(w,h*i/4);x.stroke()}
 const ys=Array(bins).fill(0),rs=Array(bins).fill(0);list.forEach(e=>{let i=Math.max(0,Math.min(bins-1,Math.floor((e.ts-(now-span))/step)));(e.level==="red"?rs:ys)[i]++});const mx=Math.max(1,...ys.map((v,i)=>v+rs[i])),bw=w/bins;
 for(let i=0;i<bins;i++){let yh=ys[i]/mx*(h-10*dpr),rh=rs[i]/mx*(h-10*dpr);x.fillStyle="#ffd02f";x.fillRect(i*bw+1*dpr,h-yh-rh-2*dpr,Math.max(2,bw-2*dpr),yh);x.fillStyle="#ff4c3e";x.fillRect(i*bw+1*dpr,h-rh-2*dpr,Math.max(2,bw-2*dpr),rh)}
 if(!c.dataset.bound){c.dataset.bound="1";c.addEventListener("mousemove",e=>{const r=c.getBoundingClientRect(),i=Math.max(0,Math.min(bins-1,Math.floor((e.clientX-r.left)/r.width*bins))),tip=$("alertHistoryTip"),from=new Date(now-span+i*step),to=new Date(now-span+(i+1)*step);if(!tip)return;tip.hidden=false;tip.style.left=Math.min(r.width-160,Math.max(4,e.clientX-r.left+8))+"px";tip.style.top="24px";tip.innerHTML=`<b>${from.toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"})}–${to.toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"})}</b><br>Gelb: ${ys[i]}<br>Rot: ${rs[i]}`});c.addEventListener("mouseleave",()=>{const t=$("alertHistoryTip");if(t)t.hidden=true})}
}
function bindAlertHistory(){document.querySelectorAll("[data-alert-range]").forEach(b=>b.onclick=()=>{alertRangeMinutes=Number(b.dataset.alertRange)||60;document.querySelectorAll("[data-alert-range]").forEach(x=>x.classList.toggle("active",x===b));renderAlertHistory()})}
try{
 new PerformanceObserver(list=>{lagState.longTasks+=list.getEntries().length}).observe({type:"longtask",buffered:false});
}catch{}
function lagTick(){
 const now=performance.now();
 if(!testOn("lag")){lagState.last=now;lagState.current=0;renderLag();return}
 const delay=Math.max(0,now-lagState.last-1000);
 lagState.last=now;lagState.current=delay;lagState.max=Math.max(lagState.max,delay);
 lagState.history.push(delay);if(lagState.history.length>90)lagState.history.shift();
 renderLag();
}
setInterval(lagTick,1000);
function renderLag(){
 const stopped=!testOn("lag"),v=lagState.current,l=stopped?"gray":v>=1000?"red":v>=250?"yellow":"green";if(window.AudioCore)window.AudioCore.configure({lagMs:stopped?0:v});
 if($("lagValue")){$("lagValue").textContent=stopped?"AUS":Math.round(v)+" ms";$("lagValue").className="lag-value "+l}
 if($("lagFill"))$("lagFill").style.width=Math.min(100,v/15)+"%";
 if($("lagExplain"))$("lagExplain").textContent=stopped?"Lag-Test ausgeschaltet - es wird nichts aufgezeichnet.":l==="green"?"Der Leitstand reagiert normal.":l==="yellow"?"Spuerbare Verzoegerung erkannt.":"Starker Haenger im PC oder Browser erkannt.";
 const c=$("lagHistory");if(c){const x=c.getContext("2d"),w=c.width,h=c.height;x.clearRect(0,0,w,h);x.strokeStyle="#28495b";for(let i=1;i<4;i++){x.beginPath();x.moveTo(0,h*i/4);x.lineTo(w,h*i/4);x.stroke()}const max=Math.max(250,...lagState.history);x.strokeStyle=l==="red"?"#ff4c3e":l==="yellow"?"#ffd02f":"#2cdb74";x.lineWidth=2;x.beginPath();lagState.history.forEach((n,i)=>{let px=i/(lagState.history.length-1||1)*w,py=h-Math.min(1,n/max)*h*.9;i?x.lineTo(px,py):x.moveTo(px,py)});x.stroke()}
}
const OP_STEPS=[
 ["FRITZ!BOX PRUEFEN","Erreichbarkeit und Antwortzeit im Heimnetz","Internetziele vergleichen"],
 ["INTERNETZIELE PRUEFEN","Cloudflare, Google und Quad9 werden verglichen","IPv4 und IPv6 pruefen"],
 ["IP-PROTOKOLLE PRUEFEN","IPv4 und IPv6 werden getrennt getestet","DNS-Aufloesung pruefen"],
 ["DNS PRUEFEN","Namensaufloesung und Antwortzeiten werden kontrolliert","Paketverlust und Jitter messen"],
 ["VERBINDUNGSQUALITAET PRUEFEN","Paketverlust, Jitter, P95 und P99 werden berechnet","PC-System pruefen"],
 ["PC-SYSTEM PRUEFEN","CPU, RAM und Datentraeger werden abgefragt","Ergebnisse bewerten"],
 ["URSACHE BEWERTEN","Alle Messkreise werden zeitlich verglichen","Naechsten Zyklus vorbereiten"]
];
function setOperation(step,status="running",result=""){
 operationState.step=step%OP_STEPS.length;const o=OP_STEPS[operationState.step];
 operationState.title=o[0];operationState.detail=o[1];operationState.next=o[2];operationState.active=status==="running";
 if(result)operationState.result=result;
 if(status==="done"){operationState.last=o[0]+" abgeschlossen";operationState.lastTime=new Date().toLocaleTimeString("de-DE");}
 renderOperation();
}

let ekgPhase=0;
let vitalsMemory={everHadData:false,lastDataAt:0,lastState:"standby"};
function alarmLoad(d=S.latest.snapshot||{}){
 const a=window.SystemAssessmentCore?.assess?.(d,S);
 if(!a)return {red:0,yellow:0,total:0,assessment:null};
 const red=a.events.filter(e=>e.severity==="red").length;
 const orange=a.events.filter(e=>e.severity==="orange").length;
 const yellow=a.events.filter(e=>e.severity==="yellow").length+(a.overall.level==="unknown"?1:0)+(S.deep?1:0);
 return {red:red+orange,yellow,total:(red+orange)*2+yellow,assessment:a};
}
function snapshotTime(d){
 const raw=d.ts??d.timestamp??d.at??d.measuredAt??d.createdAt;
 if(typeof raw==="number")return raw<1e12?raw*1000:raw;
 const parsed=raw?Date.parse(raw):NaN;
 return Number.isFinite(parsed)?parsed:0;
}
function classifyVitals(d=S.latest.snapshot||{}){
 const load=alarmLoad(d),a=load.assessment,hasData=Object.keys(d||{}).length>0;
 if(hasData){vitalsMemory.everHadData=true;vitalsMemory.lastDataAt=snapshotTime(d)||Date.now()}
 const stale=vitalsMemory.everHadData&&vitalsMemory.lastDataAt&&Date.now()-vitalsMemory.lastDataAt>90000;
 let state="normal",label="NORMALER SYSTEMRHYTHMUS",bpm=68,color="#2cdb74";
 if(S.settings.master===false){state="off";label="MESSUNGEN AUS";bpm=0;color="#71818b"}
 else if(stale){state="signal";label="MESSSIGNAL VERLOREN";bpm=0;color="#ff9d36"}
 else if(!a||a.overall.level==="unknown"){state="standby";label="MESSWERTE WERDEN AUFGEBAUT";bpm=0;color="#5aa7c7"}
 else if(a.overall.level==="red"){state="vf";label="KRITISCHER SYSTEMRHYTHMUS";bpm=a.overall.bpm;color="#ff4c3e"}
 else if(a.overall.level==="orange"){state="vf";label="SYSTEMRHYTHMUS ALARM";bpm=a.overall.bpm;color="#ff9d2f"}
 else if(a.overall.level==="yellow"){state="warning";label="SYSTEMBELASTUNG ERHOEHT";bpm=a.overall.bpm;color="#ffd02f"}
 else {bpm=a.overall.bpm;label="NORMALER SYSTEMRHYTHMUS"}
 if(S.deep&&state==="normal"){state="warning";label="TIEFENANALYSE LAEUFT";bpm=Math.max(bpm,88);color="#ffd02f"}
 vitalsMemory.lastState=state;
 return {...load,state,label,bpm,color,assessment:a};
}
function syncVitals(d=S.latest.snapshot||{}){
 const v=classifyVitals(d);
 const speed=v.bpm>0?60/v.bpm:1.2;
 const scan=Math.max(.42,3.2-v.yellow*.25-v.red*.48-(S.deep?0.25:0));
 document.documentElement.style.setProperty("--heart-speed",speed+"s");
 document.documentElement.style.setProperty("--scan-speed",scan+"s");
 document.documentElement.style.setProperty("--glass-speed",Math.max(.7,3.4-v.total*.24)+"s");
 document.documentElement.style.setProperty("--scan-color",v.color);
 document.body.classList.toggle("heart-red",v.state==="vf"||v.state==="asystole");
 document.body.classList.toggle("heart-yellow",v.state==="warning");
 document.body.classList.toggle("heart-flat",v.state==="asystole"||v.state==="signal"||v.state==="off"||v.state==="standby");
 document.body.classList.toggle("heart-vf",v.state==="vf");
   if(window.AudioCore)window.AudioCore.configure({bpm:v.bpm||0,rhythm:v.state||"standby"});
  AnimationManager.apply();
 if($("pulseBpm"))$("pulseBpm").textContent=v.bpm?`Puls ${Math.round(v.bpm)}/min · ${v.label}`:v.label;
 const box=document.querySelector(".head-pulse");if(box){box.dataset.rhythm=v.state;box.setAttribute("aria-label",v.label)}
 return v;
}
function ekgWave(phase,amplitude){
 const g=(center,width,height)=>height*Math.exp(-Math.pow((phase-center)/width,2));
 return g(.18,.035,-.10*amplitude)+g(.365,.012,.18*amplitude)+g(.395,.010,-1.00*amplitude)+g(.425,.014,.42*amplitude)+g(.68,.060,-.24*amplitude);
}
function deterministicNoise(t){
 return Math.sin(t*.019)*.48+Math.sin(t*.047+1.2)*.31+Math.sin(t*.113+2.7)*.21+Math.sin(t*.271+.4)*.12;
}
function drawGrid(x,w,h){
 x.strokeStyle="#17394a";x.lineWidth=1;
 for(let gx=0;gx<w;gx+=16){x.beginPath();x.moveTo(gx,0);x.lineTo(gx,h);x.stroke()}
 for(let gy=0;gy<h;gy+=16){x.beginPath();x.moveTo(0,gy);x.lineTo(w,gy);x.stroke()}
}
function drawScanHead(x,w,py,color,intensity=1){
 const gx=x.createRadialGradient(w-5,py,0,w-5,py,18);
 gx.addColorStop(0,color);gx.addColorStop(.22,color);gx.addColorStop(1,"transparent");
 x.fillStyle=gx;x.globalAlpha=.8*intensity;x.fillRect(w-28,Math.max(0,py-22),28,44);x.globalAlpha=1;
 x.fillStyle=color;x.beginPath();x.arc(w-5,py,2.2*intensity,0,Math.PI*2);x.fill();
}
function drawEKG(ts=0){
 const c=$("ekgCanvas");if(!c){requestAnimationFrame(drawEKG);return}
 const x=c.getContext("2d"),w=c.width=c.clientWidth||210,h=c.height=c.clientHeight||52;
 x.clearRect(0,0,w,h);drawGrid(x,w,h);
 const v=syncVitals(),now=ts||performance.now(),running=animationsOn()&&v.state!=="off",base=h*.55;
 const heart=document.querySelector(".head-heart");
 if(!animationsOn()){
   if(heart){heart.style.animation="none";heart.style.transform="scale(.92)";heart.style.opacity=".62";heart.style.filter="none";}
   x.strokeStyle="#65727a";x.shadowBlur=0;x.lineWidth=2;x.beginPath();x.moveTo(0,base);x.lineTo(w,base);x.stroke();
   requestAnimationFrame(drawEKG);return;
 }
 let heartScale=.92,heartOpacity=.5,heartGlow=0;
 if(v.state==="normal"||v.state==="warning"){
   const beatMs=60000/Math.max(30,v.bpm),phase=(now%beatMs)/beatMs;
   const p1=Math.exp(-Math.pow((phase-.08)/.040,2)),p2=.52*Math.exp(-Math.pow((phase-.22)/.060,2));
   heartScale=.88+.34*p1+.14*p2;heartOpacity=.70+.30*p1+.14*p2;heartGlow=12+34*p1+12*p2;
 }else if(v.state==="vf"){
   const irregular=Math.max(0,deterministicNoise(now*.75));
   heartScale=.90+.16*irregular;heartOpacity=.68+.30*irregular;heartGlow=12+20*irregular;
 }else if(v.state==="asystole"||v.state==="signal"){
   heartScale=.90;heartOpacity=.34;heartGlow=4;
 }
 if(heart){
   heart.style.animation="none";heart.style.transform=`scale(${heartScale.toFixed(4)})`;
   heart.style.opacity=String(Math.min(1,heartOpacity));heart.style.filter=`drop-shadow(0 0 ${heartGlow.toFixed(1)}px ${v.color})`;
   heart.style.background=v.state==="signal"?"#9c7049":v.state==="off"||v.state==="standby"?"#667782":v.color;
 }
 let color=v.color,shadow=v.state==="asystole"?15:v.state==="vf"?12:v.state==="warning"?10:8;
 x.strokeStyle=color;x.shadowColor=color;x.shadowBlur=running?shadow:0;x.lineWidth=v.state==="asystole"?2.7:2;x.beginPath();
 if(v.state==="off"||v.state==="standby"){
   x.moveTo(0,base);x.lineTo(w,base);x.stroke();x.shadowBlur=0;requestAnimationFrame(drawEKG);return;
 }
 if(v.state==="signal"){
   x.setLineDash([8,6]);x.moveTo(0,base);x.lineTo(w,base);x.stroke();x.setLineDash([]);drawScanHead(x,w,base,color,.8);x.shadowBlur=0;requestAnimationFrame(drawEKG);return;
 }
 const windowMs=v.state==="vf"?1900:3200;
 let lastY=base;
 for(let px=0;px<w;px++){
   const sampleTime=now-windowMs+(px/w)*windowMs;
   let py=base;
   if(v.state==="asystole")py=base+Math.sin(sampleTime*.004)*.35+deterministicNoise(sampleTime*.03)*.22;
   else if(v.state==="vf"){
     const chaos=deterministicNoise(sampleTime*.24)+.55*Math.sin(sampleTime*.073)+.35*Math.sin(sampleTime*.137+1.7);
     const envelope=.72+.28*Math.sin(sampleTime*.011);
     py=base+chaos*Math.min(h*.28,14)*envelope;
   }else{
     const beatMs=60000/Math.max(30,v.bpm),phase=((sampleTime%beatMs)+beatMs)%beatMs/beatMs;
     py=base+ekgWave(phase,Math.min(h*.34,v.state==="warning"?21:18));
   }
   lastY=py;px?x.lineTo(px,py):x.moveTo(px,py);
 }
 x.stroke();drawScanHead(x,w,lastY,color,v.state==="asystole"?1.25:1);x.shadowBlur=0;requestAnimationFrame(drawEKG);
}
function renderOperation(){
 if($("opTitle"))$("opTitle").innerHTML=operationState.title+'<span class="cursor"></span>';
 if($("opDetail"))$("opDetail").textContent=operationState.detail;
 if($("opResult"))$("opResult").textContent=operationState.result;
 if($("opNext"))$("opNext").textContent="Naechster Schritt: "+operationState.next;
 if($("lastOperation"))$("lastOperation").textContent="Letzte Operation: "+operationState.last;
 if($("monitorClock"))$("monitorClock").textContent=operationState.lastTime||new Date().toLocaleTimeString("de-DE");
 if($("monitorLamp")){$("monitorLamp").style.background=operationState.active?"var(--blue)":"var(--green)";$("monitorLamp").style.boxShadow="0 0 9px "+(operationState.active?"var(--blue)":"var(--green)")}
 if($("opQueue")){const queue=$("opQueue");queue.innerHTML=OP_STEPS.map((q,i)=>`<div class="queue-row ${i===operationState.step?"active":i<operationState.step?"done":""}"><span>${q[0]}</span><span>${i===operationState.step?"LAEUFT":i<operationState.step?"FERTIG":"WARTET"}</span></div>`).join("");requestAnimationFrame(()=>{const active=queue.querySelector(".active");if(active)queue.scrollTop=Math.max(0,active.offsetTop-queue.clientHeight/2+active.clientHeight/2)});}
}


const NAV=[["dashboard","HOME","Leitstand"],["current","WARN","Aktuelle Stoerung"],["internet","NET","Internet / Vodafone"],["fritz","RTR","Router / FRITZ!Box"],["docsis","DOC","Kabel / DOCSIS"],["wifi","WLAN","WLAN / Mesh"],["dns","DNS","DNS / IPv4 / IPv6"],["devices","DEV","Geraete"],["pc","SMART","PC / SMART"],["measurements","TAB","Messverlauf"],["incidents","LOG","Stoerprotokoll"],["reports","REP","Berichte"],["tests","TEST","Teststeuerung"],["settings","SET","Einstellungen"],["help","HELP","Hilfe"]];
const TESTS=[["router","FRITZ!Box","Erreichbarkeit im Heimnetz","5 s"],["multiPing","Multi-Ziel-Ping","Router, Cloudflare, Google, Quad9","15 s"],["ipStack","IPv4 / IPv6","Beide Protokollwege getrennt","30 s"],["dns","DNS-Vergleich","System-DNS und unabhaengige Ziele","30 s"],["tcp","TCP / HTTPS","Echter Verbindungsaufbau statt nur Ping","30 s"],["loss","Loss-Burst / Jitter","Median, P95, P99, Max und Verlustserien","15 s"],["route","Routing / Hop-Watch","Pfadaenderungen sparsam erkennen","5 min"],["stream","Streaming-Watch","Kleine kontinuierliche Datenflussprobe","60 s"],["buffer","Bufferbloat-Korrelation","Nur ereignisgesteuerte Kurzprobe","bei Stoerung"],["fritz","FRITZ!Box WAN","WAN-Status und Uptime","15 s"],["system","PC-System","CPU, RAM und Datentraeger","5 s"],["devices","Geraete-Matrix","Manuelle Geraete-Korrelation","ereignisbezogen"]];
let S={settings:{master:true,model:"6690-cable",host:"fritz.box",interval:15,deepSeconds:60,autoDeep:true,persist:true,density:"normal",animations:true,infoCards:false,sectionDefault:"remember",hints:true,rows:1000,scrollbars:true,markDeep:true,sectionsLocked:false,expertMode:false,retentionDays:30,historyLimit:12000,alertSound:false,alertLevel:"red",alertVolume:60,alertBeeps:3,alertRepeat:60,alertMaxRepeats:3,brainEnabled:true,audioEnabled:true,audioVolume:55,audioActiveChannel:""},latest:{},samples:[],events:[],docsis:[],fritzdiag:null,routerImport:null,routerDetect:null,smart:null,wifiSurvey:null,devices:{},deep:false,stage:1,assistant:{active:false,step:0}};
let sortAsc=false;
let cycle={seconds:15,left:15,running:false,last:null,count:0,phase:"Warte auf naechsten Messzyklus"};
const LIVE_SENSORS=[
 ["master","PWR","master"],["cpu","CPU","system"],["ram","RAM","system"],["master","SYS","master"],
 ["router","FRITZ!Box","router"],["wan","WAN","internet"],["multiPing","Internet","internet"],["ipv4","IPv4","ipStack"],
 ["ipv6","IPv6","ipStack"],["dns","DNS","dns"],["loss","Paketverl.","loss"],["jitter","Jitter","loss"],
 ["mesh","WLAN/Mesh","router"],["docsis","DOCSIS","docsis"],["lag","Browser-Lag","lag"]
];

const STATUS_LED_MAP=[
 ["router","FRITZ!Box","router"],["wan","WAN","internet"],["multiPing","Internet","internet"],
 ["ipv4","IPv4","ipStack"],["ipv6","IPv6","ipStack"],["dns","DNS","dns"],
 ["loss","Paketverlust","loss"],["jitter","Jitter","loss"],["mesh","WLAN/Mesh","router"],
 ["docsis","DOCSIS","docsis"],["system","PC-System","system"],["lag","Browser-Lag","lag"]
];
function ledState(id){
 if(S.settings.master===false)return "off";
 if(cycle.running){
   const activeMap=["router","multiPing","ipStack","dns","loss","system"];
   let active=activeMap[Math.min(activeMap.length-1,Math.floor((Date.now()/650)%activeMap.length))];
   let group={wan:"multiPing",ipv4:"ipStack",ipv6:"ipStack",jitter:"loss",mesh:"router"}[id]||id;
   if(group===active)return "testing";
 }
 const d=S.latest?.snapshot||{};
 if(id==="lag"){let v=lagState.current;return v>=1000?"red":v>=250?"yellow":"green"}
 if(id==="router"||id==="wan"||id==="multiPing"||id==="dns"||id==="loss"||id==="jitter"||id==="system"||id==="cpu"||id==="ram")return domainLevel(id,d);
 if(id==="ipv4")return d.ip?.ipv4===false?"yellow":d.ip?.ipv4?.ok?"green":d.ip?"yellow":"gray";
 if(id==="ipv6")return d.ip?.ipv6===false?"yellow":d.ip?.ipv6?.ok?"green":d.ip?"yellow":"gray";
 if(id==="master")return S.settings.master===false?"off":"green";
 if(id==="docsis"||id==="mesh")return "gray";
 return "gray"
}
function ledLabel(state){return {off:"AUS",testing:"TEST",green:"OK",yellow:"WARN",orange:"ALARM",red:"FEHLER",gray:"-"}[state]||"-"}
function renderStatusLEDs(){
 const rail=$("statusLedRail");if(rail){rail.innerHTML="";rail.hidden=true;}
 const host=$("sensorLamps");if(!host)return;
 host.innerHTML=LIVE_SENSORS.map(([id,label,test],i)=>{
  const st=S.settings.master===false||S.settings[test]===false?"off":ledState(id);
  return `<button class="sensor-lamp status-led ${st}" data-led="${id}" data-target-test="${test}" title="${label}: ${ledLabel(st)} - klicken zum Bereich"><i></i><span>${label}</span><small>${ledLabel(st)}</small></button>`;
 }).join("");
 host.querySelectorAll("[data-led]").forEach(b=>b.onclick=()=>focusTestArea(b.dataset.targetTest,b.dataset.led));
}
function findTestCard(test){
 const names={router:"FRITZ!BOX",internet:"INTERNET",multiPing:"INTERNET",ipStack:"IP",dns:"DNS",loss:"PAKETVERLUST",system:"PC-SYSTEM",lag:"PERMANENTER LAG-TEST",docsis:"DOCSIS"};
 return [...document.querySelectorAll("#dashboard .foldable")].find(x=>(x.textContent||"").toUpperCase().includes(names[test]||test.toUpperCase()));
}
function focusTestArea(test,led){
 let el=findTestCard(test)||$("causePanel");if(!el)return;
 el.classList.remove("collapsed");el.scrollIntoView({behavior:"smooth",block:"center"});el.classList.add("focus-problem");
 setTimeout(()=>el.classList.remove("focus-problem"),1900);
 if(ledState(led)==="red")operationState.result="Stoerung fokussiert: "+led.toUpperCase()+" - Details im markierten Bereich";
 renderOperation();storeSectionState();
}
function attachFieldSwitches(){
 const map=[["FRITZ!BOX","router"],["INTERNET","multiPing"],["JITTER","loss"],["PAKETVERLUST","loss"],["DNS","dns"],["IPV4","ipStack"],["PC-SYSTEM","system"],["PERMANENTER LAG-TEST","lag"]];
 document.querySelectorAll("#dashboard .foldable").forEach(el=>{
  let head=el.querySelector(":scope > .fold-head");if(!head||head.querySelector(".field-tools"))return;
  let text=(head.textContent||"").toUpperCase(), hit=map.find(([n])=>text.includes(n));if(!hit)return;
  let box=document.createElement("div");box.className="field-tools";
  box.innerHTML=`<label class="mini-switch" title="${hit[0]} ein/aus"><input type="checkbox" data-field-test="${hit[1]}" ${S.settings[hit[1]]!==false?"checked":""}><span></span></label>`;
  head.insertBefore(box,head.querySelector(".fold-toggle"));
  box.onclick=e=>e.stopPropagation();
  box.querySelector("input").onchange=e=>{S.settings[hit[1]]=e.target.checked;save();renderLive();renderSwitches();renderStatusLEDs();syncFieldSwitches()};
 });
}
function syncFieldSwitches(){document.querySelectorAll("[data-field-test]").forEach(x=>x.checked=S.settings[x.dataset.fieldTest]!==false)}
function attachInstrumentSwitches(){
 document.querySelectorAll("[data-instrument]").forEach(el=>{
  if(el.querySelector(".instrument-switch"))return;
  const id=el.dataset.instrument,label=el.querySelector("b")?.textContent||id;
  const box=document.createElement("label");box.className="mini-switch instrument-switch";box.title=label+" ein/aus";
  box.innerHTML=`<input type="checkbox" data-instrument-test="${id}" ${S.settings[id]!==false?"checked":""}><span></span>`;
  box.onclick=e=>e.stopPropagation();
  box.querySelector("input").onchange=e=>{S.settings[id]=e.target.checked;save();renderLive();renderSwitches();renderDiagnosticTabs(S.latest.snapshot||{});redrawGauges()};
  el.appendChild(box);
  el.setAttribute("data-info",infoText(id));
 });
}
function syncInstrumentSwitches(){document.querySelectorAll("[data-instrument-test]").forEach(x=>x.checked=S.settings[x.dataset.instrumentTest]!==false)}
function dedupeDisplaySwitches(){
 // Pro sichtbarer Anzeige bleibt exakt ein Ein-/Ausschalter erhalten.
 document.querySelectorAll("[data-instrument]").forEach(el=>{
   const switches=[...el.querySelectorAll(".instrument-switch")];switches.slice(1).forEach(x=>x.remove());
 });
 document.querySelectorAll(".cockpit-instrument").forEach(el=>{
   const switches=[...el.querySelectorAll(".only-switch")];switches.slice(1).forEach(x=>x.remove());
 });
 document.querySelectorAll(".foldable").forEach(el=>{
   const field=el.querySelector(":scope > .fold-head .field-tools");if(!field)return;
   const local=[...el.querySelectorAll("[data-instrument-test],[data-tile-test]")];
   const fieldInput=field.querySelector("[data-field-test]");
   if(fieldInput&&local.some(x=>(x.dataset.instrumentTest||x.dataset.tileTest)===fieldInput.dataset.fieldTest))field.remove();
 });
}

function renderLive(){
 document.body.classList.toggle("master-stopped",S.settings.master===false);
 AnimationManager.apply();
 if(S.settings.master===false){cycle.running=false;S.deep=false;S.deepUntil=null;cycle.phase="Hauptschalter aus - alle Pruefungen angehalten";operationState.active=false;operationState.title="ANLAGE ANGEHALTEN";operationState.detail="Hauptschalter ist AUS";operationState.result="Keine Tests laufen";operationState.next="Hauptschalter einschalten";renderOperation();}

 let on=S.settings.master!==false, pct=cycle.running?100:Math.max(0,(cycle.seconds-cycle.left)/cycle.seconds*100);
 AnimationManager.apply();
 if($("autoState")){$("autoState").textContent=on?(cycle.running?"MESSUNG LAEUFT JETZT":"AUTOMATISCHE TESTS LAUFEN"):"AUTOMATISCHE TESTS AUS";$("autoState").className="bigstate "+(on?"green":"yellow")}
 if($("testPhase"))$("testPhase").textContent=on?cycle.phase:"Hauptschalter ist ausgeschaltet";
 if($("cycleFill"))$("cycleFill").style.width=pct+"%";
 if($("cycleText"))$("cycleText").textContent=!on?"PAUSIERT":cycle.running?"Sensoren pruefen das Netzwerk ...":"Naechste Messung in "+cycle.left+" s";
 if($("cycleInfo"))$("cycleInfo").textContent="Letzte Messung: "+(cycle.last?new Date(cycle.last).toLocaleTimeString("de-DE"):"-")+" - Messzyklus Nr. "+cycle.count;
 renderDeepProgress();renderStatusLEDs();syncFieldSwitches();syncInstrumentSwitches();dedupeDisplaySwitches();attachAudioToggles();
}
setInterval(()=>{if(S.settings.master!==false&&!cycle.running){cycle.left--;if(cycle.left<0)cycle.left=cycle.seconds}if($("monitorClock")&&!operationState.lastTime)$("monitorClock").textContent=new Date().toLocaleTimeString("de-DE");renderLive()},1000);


function enhanceFoldables(){
 document.querySelectorAll(".page").forEach(page=>{
  page.querySelectorAll(".card,.lag-panel,.operation-monitor,.cycle-panel,.gauge").forEach((el,i)=>{
   if(el.dataset.foldReady||el.closest(".settings-grid"))return;el.dataset.foldReady="1";el.classList.add("foldable");
   let title=el.querySelector(":scope > h2,:scope > .monitor-head,:scope > .lag-title,:scope > .cycle-title,:scope > b");
   if(!title)return;
   let head=document.createElement("div");head.className="fold-head";
   let clone=title.cloneNode(true);title.style.display="none";
   let btn=document.createElement("button");btn.className="fold-toggle";btn.textContent="v";btn.title="Bereich ein-/ausklappen";
   head.append(clone,btn);
   let body=document.createElement("div");body.className="fold-body";
   [...el.children].filter(x=>x!==title).forEach(x=>body.appendChild(x));
   el.append(head,body);
   head.onclick=e=>{if(e.target.closest("button")&&e.target!==btn)return;if(S.settings.sectionsLocked)return;el.classList.toggle("collapsed");storeSectionState();};
  })
 });
 applySectionDefault();attachFieldSwitches();dedupeDisplaySwitches();
}
function sectionKey(el){let page=el.closest(".page")?.id||"page";let idx=[...el.parentElement.children].indexOf(el);return page+":"+idx}
function storeSectionState(){if(S.settings.sectionDefault!=="remember")return;let st={};document.querySelectorAll(".foldable").forEach(x=>st[sectionKey(x)]=x.classList.contains("collapsed"));S.settings.sectionState=st;save()}
function applySectionDefault(){
 document.querySelectorAll(".foldable").forEach(x=>{
  let c=S.settings.sectionDefault==="closed"||S.settings.sectionDefault==="remember"&&S.settings.sectionState?.[sectionKey(x)];
  if(S.settings.sectionDefault==="open")c=false;x.classList.toggle("collapsed",!!c)
 })
}
function setAllSections(collapsed){if(S.settings.sectionsLocked)return;document.querySelectorAll(".page.active .foldable").forEach(x=>x.classList.toggle("collapsed",collapsed));storeSectionState()}
function updateSectionLock(){let c=$("mainContent");c?.classList.toggle("sections-locked",!!S.settings.sectionsLocked);$("lockSections")?.classList.toggle("active",!!S.settings.sectionsLocked);if($("lockSections"))$("lockSections").textContent=S.settings.sectionsLocked?"LOCK":"LOCK"}
function allProfiles(){return [...FRITZ_PROFILES,...EXTRA_ROUTER_PROFILES]}
function profile(){
 const p=allProfiles().find(x=>x.id===S.settings.model)||FRITZ_PROFILES[0];
 if(p.id==="custom-router"&&S.settings.customModel)return {...p,name:S.settings.customModel,defaultHost:S.settings.host||p.defaultHost,features:S.settings.customFeatures||p.features};
 return p;
}
function renderSettings(){
 if(!$("setModel"))return;
 $("setModel").innerHTML=allProfiles().map(x=>`<option value="${x.id}" ${x.id===S.settings.model?"selected":""}>${x.name}</option>`).join("");
 if($("setCustomModel"))$("setCustomModel").value=S.settings.customModel||"";
 $("setHost").value=S.settings.host||"fritz.box";$("setAccess").value=profile().access;
 $("setInterval").value=String(S.settings.interval||15);$("setDeep").value=String(S.settings.deepSeconds||60);
 $("setAutoDeep").checked=S.settings.autoDeep!==false;$("setPersist").checked=S.settings.persist!==false;
 $("setDensity").value=S.settings.density||"normal";$("setAnimations").checked=S.settings.animations!==false;if($("setBrainEnabled"))$("setBrainEnabled").checked=S.settings.brainEnabled!==false;
 if($("setInfoCards"))$("setInfoCards").checked=S.settings.infoCards===true;
 $("setSectionDefault").value=S.settings.sectionDefault||"remember";$("setHints").checked=S.settings.hints!==false;
 $("setRows").value=String(S.settings.rows||1000);$("setScrollbars").checked=S.settings.scrollbars!==false;$("setMarkDeep").checked=S.settings.markDeep!==false;
 if($("setExpertMode"))$("setExpertMode").checked=S.settings.expertMode===true;
 if($("setRetentionDays"))$("setRetentionDays").value=String(S.settings.retentionDays||30);
 if($("setHistoryLimit"))$("setHistoryLimit").value=String(S.settings.historyLimit||12000);
 if($("setAlertSound"))$("setAlertSound").checked=S.settings.alertSound===true;if($("setAlertLevel"))$("setAlertLevel").value=S.settings.alertLevel||"red";if($("setAlertVolume")){$("setAlertVolume").value=String(S.settings.alertVolume||60);if($("alertVolumeValue"))$("alertVolumeValue").textContent=String(S.settings.alertVolume||60)+" %"}if($("setAlertBeeps"))$("setAlertBeeps").value=String(S.settings.alertBeeps||3);if($("setAlertRepeat"))$("setAlertRepeat").value=String(S.settings.alertRepeat??60);if($("setAlertMaxRepeats"))$("setAlertMaxRepeats").value=String(S.settings.alertMaxRepeats||3);renderAudioSettings();
 updateProtocolStorageInfo();
 $("profileInfo").innerHTML=`<div class="profile-chip"><b>${profile().wifi}</b><small>WLAN-Generation</small></div><div class="profile-chip"><b>${profile().docsis||"-"}</b><small>DOCSIS</small></div><div class="profile-chip"><b>${profile().features.join(", ")}</b><small>Diagnosemodule</small></div><div class="router-profile-note">Profilstand lokal. Internet-Ergaenzung spaeter nur nach Freigabe und mit Pruefvorschau.</div>`;
 renderRouterProfileRegistry();renderSwitchAudit();
}
function showSettingsPanel(id="general"){
 document.querySelectorAll(".settings-panel").forEach(p=>p.classList.toggle("active",p.id.toLowerCase().includes(String(id).toLowerCase())));
 document.querySelectorAll(".settings-tab").forEach(b=>b.classList.toggle("active",b.dataset.settingsPanel===id));
 renderRouterProfileRegistry();renderSwitchAudit();
}
function renderRouterProfileRegistry(){
 const host=$("routerProfileRegistry");if(!host)return;
 const entries=[
  {title:"Aktives Profil",model:profile().name,kind:profile().access,source:"Einstellungen",score:"festgelegt",details:(profile().features||[]).join(", ")},
  S.routerDetect?{title:"Erkannt",model:S.routerDetect.model,kind:S.routerDetect.kind,source:"Router erkennen",score:S.routerDetect.score+" %",details:S.routerDetect.notes.join(" | ")}:null,
  S.routerImport?{title:"Importiert",model:S.routerImport.model||S.routerImport.kind,kind:S.routerImport.kind,source:S.routerImport.fileName,score:S.routerImport.level,details:S.routerImport.summary}:null,
  S.fritzdiag?{title:"FRITZ-Diagnose",model:"FRITZ!Box Diagnose",kind:"fritzdiag",source:S.fritzdiag.fileName||"Import",score:S.fritzdiag.meshError?"Warnung":"OK",details:"FRITZ!OS "+(S.fritzdiag.fritzOS||"-")}:null
 ].filter(Boolean);
 host.innerHTML=entries.map(x=>`<article class="router-profile-card"><h3>${x.title}</h3><b>${x.model}</b><small>Typ: ${x.kind} - Quelle: ${x.source}</small><small>Bewertung: ${x.score}</small><p>${x.details||"-"}</p></article>`).join("");
}
function renderSwitchAudit(){
 const host=$("switchAuditView");if(!host)return;
 const rows=[
  ["masterSwitch","Hauptschalter Teststeuerung","alle Tests ein/aus"],
  ["masterHomeSwitch","Hauptschalter Startseite","alle Tests ein/aus"],
  ["setAnimations","Animationen","Herz/Sanduhr/Scanring"],["setBrainEnabled","Gehirn","StatusCore 3D sichtbar/aus"],
  ["setExpertMode","Expertenmodus","technische Detailansichten"],
  ["setInfoCards","Infofenster","Infofenster an/aus"],
  ["setAutoDeep","Automatisch bei Rot","Tiefenanalyse"],
  ["setPersist","Verlauf speichern","Messdaten lokal"],
  ["setHints","Hinweise","Erklaertexte"],
  ["setScrollbars","Scrollbalken","Anzeige"],
  ["setMarkDeep","Stoerungsmarke startet Tiefentest","Stoerungsablauf"]
 ];
 const dynamic=[...document.querySelectorAll("[data-test],[data-live-test],[data-tile-test],[data-field-test]")].map(x=>[x.dataset.test||x.dataset.liveTest||x.dataset.tileTest||x.dataset.fieldTest,"Messkreis "+(x.dataset.test||x.dataset.liveTest||x.dataset.tileTest||x.dataset.fieldTest),"S.settings"]);
 const all=[...rows,...dynamic],seen=new Set();
 const out=all.filter(r=>{let k=r[0]+r[1];if(seen.has(k))return false;seen.add(k);return true}).map(r=>{let el=$(r[0])||document.querySelector(`[data-test="${r[0]}"],[data-live-test="${r[0]}"],[data-tile-test="${r[0]}"],[data-field-test="${r[0]}"]`),ok=!!el;return `<tr><td>${r[1]}</td><td>${r[2]}</td><td class="${ok?"ok":"warn"}">${ok?"verdrahtet":"nicht sichtbar"}</td></tr>`}).join("");
 host.innerHTML=`<div class="table-wrap"><table class="switch-audit-table"><thead><tr><th>Schalter</th><th>Funktion</th><th>Status</th></tr></thead><tbody>${out}</tbody></table></div>`;
}
function applySettings(){
 document.body.classList.toggle("compact",S.settings.density==="compact");
 document.body.classList.toggle("brain-off",S.settings.brainEnabled===false);
 AnimationManager.apply();
 document.body.classList.toggle("hide-hints",S.settings.hints===false);
 document.body.classList.toggle("info-cards-off",S.settings.infoCards!==true);
 document.body.classList.toggle("expert-mode",S.settings.expertMode===true);
 document.documentElement.classList.toggle("no-scrollbars",S.settings.scrollbars===false);
 cycle.seconds=Number(S.settings.interval)||15;
 document.documentElement.style.setProperty("--scroll-width",S.settings.scrollbars===false?"0px":"14px");configureAudioCore();
 updateSectionLock();renderSettings();
}
function readSettings(options={log:false}){
 S.settings.model=$("setModel").value;S.settings.customModel=$("setCustomModel")?.value||"";S.settings.host=$("setHost").value||"fritz.box";S.settings.interval=+$("setInterval").value;S.settings.deepSeconds=+$("setDeep").value;
 S.settings.autoDeep=$("setAutoDeep").checked;S.settings.persist=$("setPersist").checked;S.settings.density=$("setDensity").value;S.settings.animations=$("setAnimations").checked;S.settings.brainEnabled=$("setBrainEnabled")?.checked!==false;
 S.settings.infoCards=$("setInfoCards")?.checked===true;
 S.settings.sectionDefault=$("setSectionDefault").value;S.settings.hints=$("setHints").checked;S.settings.rows=+$("setRows").value;S.settings.scrollbars=$("setScrollbars").checked;S.settings.markDeep=$("setMarkDeep").checked;
 S.settings.expertMode=$("setExpertMode")?.checked===true;
 S.settings.retentionDays=+($("setRetentionDays")?.value||30);
 S.settings.historyLimit=+($("setHistoryLimit")?.value||12000);S.settings.audioEnabled=$("setAudioEnabled")?.checked!==false;S.settings.audioVolume=+($("setAudioVolume")?.value||55);{const audioSelect=$("setAudioChannel");S.settings.audioActiveChannel=audioSelect?audioSelect.value:(S.settings.audioActiveChannel||"");}S.settings.alertSound=$("setAlertSound")?.checked===true;S.settings.alertLevel=$("setAlertLevel")?.value||"red";S.settings.alertVolume=+($("setAlertVolume")?.value||60);S.settings.alertBeeps=+($("setAlertBeeps")?.value||3);S.settings.alertRepeat=+($("setAlertRepeat")?.value||0);S.settings.alertMaxRepeats=+($("setAlertMaxRepeats")?.value||3);
 pruneProtocols();
 save();applySettings();restartPollTimer();applySectionDefault();if(options.log)event("blue","Einstellungen gespeichert","settings");render();updateProtocolStorageInfo();
}

function initNav(){
 const adapter=window.NetworkNavigationCoreAdapter?.bind(page);
 if(window.NetworkFrameworkRuntime) window.NetworkFrameworkRuntime.activate(adapter||window.NetworkNavigationCoreAdapter);
}
function page(id){
 if(document.body.classList.contains("office-mode")){document.body.classList.remove("office-mode")}
 if(S.settings.officeMode&&$("backToOffice")){$("backToOffice").hidden=false;$("backToOffice").textContent="Zurueck ins Buero"}
 const target=$(id)||$("dashboard");
 document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));
 target?.classList.add("active");
 document.querySelectorAll(".nav-item").forEach(x=>x.classList.toggle("active",x.dataset.page===id));
 const title=NAV.find(x=>x[0]===id)?.[2]||target?.querySelector("h2")?.textContent||"NETZWERK-LEITSTAND";
 $("pageTitle").textContent=title.toUpperCase();
}
function showOffice(){
 S.settings.officeMode=true;save();
 const overlay=$("officeOverlay");
 if(overlay) overlay.hidden=false;
 if($("officeView"))$("officeView").hidden=true;
 if($("backToOffice")){$("backToOffice").hidden=false;$("backToOffice").textContent="Zurueck ins Buero"};
 $("officeModeBtn")?.classList.add("active");
 if($("officeModeBtn"))$("officeModeBtn").textContent=$("officeModeBtn").dataset.labelOn||"Büromodus aktiv";
 $("officeChairExit")?.focus();
}
function leaveOffice(){
 const overlay=$("officeOverlay");
 if(overlay) overlay.hidden=true;
 if($("backToOffice"))$("backToOffice").hidden=!S.settings.officeMode;
}
function officeCommand(command){
 const note=$("officeLiveNote");
 const setNote=text=>{if(note)note.textContent=text};
 const openPage=id=>{leaveOffice();page(id);if($("backToOffice")){$("backToOffice").hidden=false;$("backToOffice").textContent="Zurueck ins Buero"}};
 if(command==="dashboard"){setNote("Dashboard wird geoeffnet");openPage("dashboard")}
 else if(command==="devices"){setNote("Geraeteverwaltung wird geoeffnet");openPage("devices")}
 else if(command==="address"){setNote("Stammdaten werden geoeffnet");openPage("settings");setTimeout(()=>showSettingsPanel("routerProfiles"),0)}
 else if(command==="console"){setNote("Teststeuerung wird geoeffnet");openPage("tests")}
 else if(command==="protocol"||command==="clock"){setNote("Messprotokoll wird geoeffnet");openPage("measurements")}
 else if(command==="search"){setNote("Live-Diagnose wird geoeffnet");openPage("current")}
 else if(command==="lamp"){setNote("Anzeigeeinstellungen werden geoeffnet");openPage("settings")}
 else if(command==="reports"){setNote("Berichte werden geoeffnet");openPage("reports")}
 else if(command==="exit"){
   setNote("Ausgang gewaehlt");
   if(confirm("Netzwerk-Leitstand wirklich verlassen? Nicht gespeicherte Browserdaten koennen verloren gehen.")){
     window.close();
     setTimeout(()=>{leaveOffice();page("dashboard");alert("Der Browser verhindert das automatische Schliessen. Du kannst den Tab jetzt sicher schliessen.")},250)
   }
 }
}
function pill(l){return `<span class="pill ${l}">${l==="green"?"GRUEN":l==="yellow"?"GELB":l==="red"?"ROT":"INFO"}</span>`}
function time(t){return t?new Date(t).toLocaleTimeString("de-DE"):"-"}function n(v,d=0){return Number.isFinite(+v)?(+v).toFixed(d):"-"}
function level(ok,v,y,r){if(ok===false)return"red";if(v==null)return"yellow";return v>=r?"red":v>=y?"yellow":"green"}
function assessmentFor(d=S.latest.snapshot||{}){return window.SystemAssessmentCore?.assess?.(d||{},S)||null}
function uiLevel(l,mode="css"){if(l==="unknown")return"gray";if(l==="orange"&&mode==="css")return"yellow";return l||"gray"}
function domainAssessment(id,d=S.latest.snapshot||{}){const map={wan:"internet",multiPing:"internet",internet:"internet",loss:"quality",jitter:"quality",quality:"quality",system:"pc",cpu:"pc",ram:"pc",storage:"pc",disk:"pc",router:"router",dns:"dns",runtime:"runtime"};const a=assessmentFor(d);return a?.domains?.[map[id]||id]||null}
function domainLevel(id,d=S.latest.snapshot||{},mode="css"){const x=domainAssessment(id,d);return x?uiLevel(x.level,mode):"gray"}
function domainScore(id,d=S.latest.snapshot||{}){const x=domainAssessment(id,d);return x?.available?x.score:null}
function gauge(id,val,max,label,l){
 let c=$(id);if(!c)return;let x=c.getContext("2d"),w=c.width,h=c.height;x.clearRect(0,0,w,h);
 const cx=w/2,cy=h*.78,r=Math.min(w*.36,h*.58),start=Math.PI*.78,end=Math.PI*2.22;
 let grd=x.createLinearGradient(0,0,w,h);grd.addColorStop(0,"#061721");grd.addColorStop(1,"#15384c");x.fillStyle=grd;x.beginPath();x.arc(cx,cy,r+22,0,Math.PI*2);x.fill();
 x.lineCap="round";x.lineWidth=15;x.strokeStyle="#223f50";x.beginPath();x.arc(cx,cy,r,start,end);x.stroke();
 let noValue=val==null||Number.isNaN(Number(val));
 let stopped=S.settings.master===false;
 let rawP=(stopped||noValue) ? 0 : Math.max(0,Math.min(1,(val||0)/max));
 let sensitiveP=(stopped||noValue)?0:Math.pow(rawP,.62);
 let pulse=animationsOn()?Math.sin(Date.now()/520+id.length)*.032:0;
 let p=(stopped||noValue)?0:Math.max(0,Math.min(1,sensitiveP+pulse));
 let col=l==="gray"?"#65727a":l==="red"?"#ff4c3e":l==="orange"?"#ff9348":l==="yellow"?"#ffd02f":l==="blue"?"#40adff":"#2cdb74";
 let glow=x.createLinearGradient(cx-r,0,cx+r,0);glow.addColorStop(0,col);glow.addColorStop(1,"#dffcff");x.strokeStyle=glow;x.shadowColor=col;x.shadowBlur=10;x.beginPath();x.arc(cx,cy,r,start,start+(end-start)*p);x.stroke();x.shadowBlur=0;
 for(let i=0;i<=10;i++){let a=start+(end-start)*i/10;x.strokeStyle=i%5?"#477084":"#8eb4c9";x.lineWidth=i%5?1:2;x.beginPath();x.moveTo(cx+Math.cos(a)*(r-10),cy+Math.sin(a)*(r-10));x.lineTo(cx+Math.cos(a)*(r+4),cy+Math.sin(a)*(r+4));x.stroke()}
 let needle=start+(end-start)*p;x.strokeStyle="#e9f7ff";x.lineWidth=3;x.beginPath();x.moveTo(cx,cy);x.lineTo(cx+Math.cos(needle)*(r-17),cy+Math.sin(needle)*(r-17));x.stroke();x.fillStyle=col;x.beginPath();x.arc(cx,cy,5,0,Math.PI*2);x.fill();
 x.fillStyle="#e2edf4";x.font="bold 22px Segoe UI";x.textAlign="center";x.fillText(label,cx,cy-18);x.font="11px Segoe UI";x.fillStyle="#8fa9b9";x.fillText(stopped?"AUS · NULLSTELLUNG":noValue?"STANDBY":l.toUpperCase(),cx,cy+20)
}
async function api(path,opt={}){try{let r=await fetch("http://127.0.0.1:8765"+path,{cache:"no-store",...opt});return await r.json()}catch(e){return {ok:false,error:"Pruefdienst nicht aktiv"}}}
const STORAGE_KEY="NLV4";
const STORAGE_DB="NetzwerkLeitstandDB";
const STORAGE_DB_VERSION=1;
let storageSaveTimer=null;
function openStorageDb(){
 return new Promise((resolve,reject)=>{
  if(!window.indexedDB){reject(new Error("IndexedDB nicht verfuegbar"));return}
  const req=indexedDB.open(STORAGE_DB,STORAGE_DB_VERSION);
  req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains("runtime"))db.createObjectStore("runtime")};
  req.onsuccess=()=>resolve(req.result);
  req.onerror=()=>reject(req.error||new Error("IndexedDB konnte nicht geoeffnet werden"));
 });
}
async function readLargeState(){
 try{
  const db=await openStorageDb();
  return await new Promise((resolve,reject)=>{
   const tx=db.transaction("runtime","readonly");
   const req=tx.objectStore("runtime").get("largeState");
   req.onsuccess=()=>resolve(req.result||null);
   req.onerror=()=>reject(req.error);
   tx.oncomplete=()=>db.close();
  });
 }catch{return null}
}
async function writeLargeState(data){
 try{
  const db=await openStorageDb();
  await new Promise((resolve,reject)=>{
   const tx=db.transaction("runtime","readwrite");
   tx.objectStore("runtime").put(data,"largeState");
   tx.oncomplete=()=>{db.close();resolve()};
   tx.onerror=()=>reject(tx.error);
  });
 }catch(e){console.warn("Grosse Verlaufsdaten konnten nicht gespeichert werden:",e)}
}

async function clearLargeState(){
 try{
  const db=await openStorageDb();
  await new Promise((resolve,reject)=>{const tx=db.transaction("runtime","readwrite");tx.objectStore("runtime").delete("largeState");tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>reject(tx.error)});
 }catch(e){console.warn("Gespeicherte Verlaufsdaten konnten nicht gelöscht werden:",e)}
}
function pruneProtocols(){
 const days=Math.max(1,Number(S.settings.retentionDays)||30),cutoff=Date.now()-days*86400000,limit=Math.max(100,Number(S.settings.historyLimit)||12000);
 S.samples=(S.samples||[]).filter(x=>(x.ts||0)>=cutoff).slice(-limit);
 S.events=(S.events||[]).filter(x=>(x.ts||0)>=cutoff).slice(-Math.min(limit,5000));
 S.docsis=(S.docsis||[]).filter(x=>!(x.ts)&&!(x.timestamp)||Number(x.ts||x.timestamp)>=cutoff).slice(-Math.min(limit,5000));
}
function bytesText(n){if(n<1024)return n+" B";if(n<1048576)return (n/1024).toFixed(1)+" KB";return (n/1048576).toFixed(2)+" MB"}
async function updateProtocolStorageInfo(){
 const el=$("protocolStorageInfo");if(!el)return;
 const payload=JSON.stringify({samples:S.samples||[],events:S.events||[],docsis:S.docsis||[]});
 let text=`Messwerte: ${(S.samples||[]).length.toLocaleString("de-DE")} · Ereignisse: ${(S.events||[]).length.toLocaleString("de-DE")} · lokale Nutzdaten ca. ${bytesText(new Blob([payload]).size)}`;
 try{const e=await navigator.storage?.estimate?.();if(e?.usage!==undefined)text+=` · Browser-Speicher insgesamt ${bytesText(e.usage)}`}catch{}
 el.textContent=text;
}
async function clearProtocols(kind){
 const labels={measurements:"Messverlauf",events:"Stoerprotokoll",all:"alle Protokolle"};
 if(!confirm(`${labels[kind]} wirklich leeren? Diese Aktion kann nicht rueckgaengig gemacht werden.`))return;
 const before={samples:(S.samples||[]).length,events:(S.events||[]).length,docsis:(S.docsis||[]).length};
 const payloadBefore=JSON.stringify({samples:S.samples||[],events:S.events||[],docsis:S.docsis||[]});
 const bytesBefore=new Blob([payloadBefore]).size;
 if(kind==="measurements"||kind==="all"){S.samples=[];S.docsis=[];S.latest={}}
 if(kind==="events"||kind==="all")S.events=[];
 pruneProtocols();await clearLargeState();save();render();await updateProtocolStorageInfo();
 const deleted={samples:before.samples-(S.samples||[]).length,events:before.events-(S.events||[]).length,docsis:before.docsis-(S.docsis||[]).length};
 const total=deleted.samples+deleted.events+deleted.docsis;
 const message=[
  "Protokolle erfolgreich geloescht.","",
  `Messwerte: ${deleted.samples.toLocaleString("de-DE")}`,
  `Ereignisse: ${deleted.events.toLocaleString("de-DE")}`,
  `DOCSIS-/Importwerte: ${deleted.docsis.toLocaleString("de-DE")}`,
  `Gesamt: ${total.toLocaleString("de-DE")} Eintraege`,
  `Freigegebener Speicher: ca. ${bytesText(bytesBefore)}`
 ].join("\n");
 alert(message);
 event("blue",`${total.toLocaleString("de-DE")} Protokolleintraege wurden geloescht`,"settings");
 save();render();
}
function bindSettingsControls(){
 const ids=["setAutoDeep","setPersist","setDensity","setAnimations","setBrainEnabled","setInfoCards","setSectionDefault","setHints","setRows","setScrollbars","setMarkDeep","setExpertMode","setRetentionDays","setHistoryLimit","setInterval","setDeep","setAlertSound","setAlertLevel","setAlertVolume","setAlertBeeps","setAlertRepeat","setAlertMaxRepeats","setAudioEnabled","setAudioVolume","setAudioChannel"];
 ids.forEach(id=>$(id)?.addEventListener("change",()=>{readSettings();}));
 $("clearMeasurements")?.addEventListener("click",()=>clearProtocols("measurements"));
 $("clearEvents")?.addEventListener("click",()=>clearProtocols("events"));
 $("clearAllProtocols")?.addEventListener("click",()=>clearProtocols("all"));
 $("setAlertVolume")?.addEventListener("input",()=>{if($("alertVolumeValue"))$("alertVolumeValue").textContent=$("setAlertVolume").value+" %"});$("setAudioVolume")?.addEventListener("input",()=>{S.settings.audioVolume=+$("setAudioVolume").value;if(S.settings.audioActiveChannel){S.settings.audioChannelVolume=S.settings.audioChannelVolume||{};S.settings.audioChannelVolume[S.settings.audioActiveChannel]=S.settings.audioVolume}if($("audioVolumeValue"))$("audioVolumeValue").textContent=$("setAudioVolume").value+" %";save();configureAudioCore()});$("setAudioChannel")?.addEventListener("change",async()=>{S.settings.audioEnabled=true;S.settings.audioActiveChannel=$("setAudioChannel").value;save();configureAudioCore();renderAudioSettings();await window.AudioCore?.activateChannel?.(S.settings.audioActiveChannel||"")});
 $("checkAudioDevice")?.addEventListener("click",checkAudioDevice);$("directAudioTest")?.addEventListener("click",runDirectAudioTest);$("testAlertSound")?.addEventListener("click",async()=>{S.settings.audioEnabled=true;S.settings.audioActiveChannel="alarms";save();configureAudioCore();renderAudioSettings();await checkAudioDevice();const snap=await window.AudioCore?.activateChannel?.("alarms");alert(snap?.loopRunning?"Alarmkanal laeuft dauerhaft, bis er wieder ausgeschaltet wird.":"Audiofreigabe nicht moeglich. Bitte Windows-Audiogeraet und Browserfreigabe pruefen.")});
}
function compactState(){
 const copy={...S};
 delete copy.samples;delete copy.events;delete copy.docsis;
 return {...copy,events:(S.events||[]).slice(-200),docsis:(S.docsis||[]).slice(-100),samples:[]};
}
function emergencyState(){
 return {settings:S.settings,devices:S.devices,routerImport:S.routerImport,routerDetect:S.routerDetect,fritzdiag:S.fritzdiag,smart:S.smart,wifiSurvey:S.wifiSurvey,assistant:S.assistant,latest:S.latest};
}
async function load(){
 let x=localStorage.getItem(STORAGE_KEY);
 if(x){try{let old=JSON.parse(x);S={...S,...old,settings:{...S.settings,...old.settings}}}catch{}}
 const large=await readLargeState();
 if(large){
  if(Array.isArray(large.samples))S.samples=large.samples;
  if(Array.isArray(large.events))S.events=large.events;
  if(Array.isArray(large.docsis))S.docsis=large.docsis;
 }
 S.routerImport=S.routerImport||null;S.routerDetect=S.routerDetect||null;S.smart=S.smart||null;S.wifiSurvey=S.wifiSurvey||null;if(!S.assistant)S.assistant={active:false,step:0};if(S.settings.infoCards===undefined)S.settings.infoCards=false;if(S.settings.brainEnabled===undefined)S.settings.brainEnabled=true;if(S.settings.uiFixVersion!=="5.4.2"){S.settings.uiFixVersion="5.4.2"}renderSwitches();renderDevices()
}
function save(){
 const compact=JSON.stringify(compactState());
 try{
  localStorage.setItem(STORAGE_KEY,compact);
 }catch(e){
  try{
   localStorage.removeItem(STORAGE_KEY);
   localStorage.setItem(STORAGE_KEY,JSON.stringify(emergencyState()));
   console.warn("Speicher wurde wegen Browserlimit auf Kerndaten reduziert.");
  }catch(inner){console.error("Kerndaten konnten nicht in localStorage gespeichert werden:",inner)}
 }
 clearTimeout(storageSaveTimer);
 storageSaveTimer=setTimeout(()=>{
  if(S.settings.persist===false){clearLargeState();return;}
  pruneProtocols();
  writeLargeState({samples:(S.samples||[]).slice(-(S.settings.historyLimit||12000)),events:(S.events||[]).slice(-Math.min(S.settings.historyLimit||12000,5000)),docsis:(S.docsis||[]).slice(-Math.min(S.settings.historyLimit||12000,5000)),savedAt:Date.now()});
 },350);
 return true;
}
function addSample(type,data){let row={ts:Date.now(),type,...data};S.samples.push(row);let limit=S.settings.historyLimit||12000;if(S.samples.length>limit)S.samples.splice(0,S.samples.length-limit);S.latest[type]=row}
function event(level,text,source="system"){let last=S.events.at(-1);if(last&&last.text===text&&Date.now()-last.ts<30000)return;S.events.push({ts:Date.now(),level,text,source});if(S.events.length>Math.min(S.settings.historyLimit||12000,5000))S.events.shift();AlertSoundService.notify(level,text,source);renderAlertHistory()}
function calculateHealth(d={}){
 const a=window.SystemAssessmentCore?.assess?.(d,S);
 if(a){
  const values={};Object.values(a.domains).forEach(x=>values[x.label]=x.available?x.score:null);
  const weights={};Object.entries(window.SystemAssessmentCore.weights||{}).forEach(([k,v])=>{weights[k]=v});
  return {score:a.overall.score,values,weights,confidence:a.overall.confidence,level:a.overall.level,assessment:a};
 }
 return {score:0,values:{},weights:{},confidence:0,level:"unknown"};
}
function showHealthExplanation(){
 const h=calculateHealth(S.latest.snapshot||{}),a=h.assessment;
 const rows=Object.entries(h.values).map(([k,v])=>`${k}: ${v==null?"unbekannt":Math.round(v)+" %"}`).join("\n");
 const reasons=a?.events?.length?a.events.map(e=>`- ${e.severity.toUpperCase()}: ${e.reason}`).join("\n"):"- keine harte Warnbedingung";
 alert(`Berechnung des Systemzustands\n\n${rows}\n\nGesamt: ${h.score} %\nVertrauen: ${h.confidence??0} %\nStufe: ${h.level}\n\nGruende:\n${reasons}\n\nFehlende Werte werden als unbekannt behandelt und nicht als gesund gerechnet.`);
}
function analyze(d){
 const h=calculateHealth(d),a=h.assessment;
 let title="Messwerte werden aufgebaut",text="Der Leitstand wartet auf den ersten vollstaendigen Messzyklus.",score=h.score,l="gray";
 if(a){
  l=a.overall.level==="green"?"green":a.overall.level==="yellow"?"yellow":a.overall.level==="unknown"?"yellow":"red";
  title=a.display.label;
  text=a.events?.[0]?.reason||(`Zentrale Bewertung: ${a.overall.score} % bei ${a.overall.confidence} % Vertrauen.`);
  if(a.overall.level==="green")text="Alle aktuell verfuegbaren Messwerte sind unauffaellig.";
 }
 if(S.deep){title="Stoerungs-Tiefenanalyse laeuft";text="Messstufe 3 sammelt dichter aufgeloeste Vergleichswerte. Die zentrale Bewertung bleibt aktiv.";l=l==="red"?"red":"yellow"}
 return {title,text,score,l,assessment:a}
}
let timelineWindowStart=0;
function chart(){
 let c=$("timeline");if(!c)return;let x=c.getContext("2d"),dpr=devicePixelRatio||1,w=c.width=Math.max(1,c.clientWidth)*dpr,h=c.height=210*dpr;x.clearRect(0,0,w,h);
 x.strokeStyle="#34586d";x.lineWidth=1*dpr;for(let i=1;i<5;i++){x.beginPath();x.moveTo(0,h*i/5);x.lineTo(w,h*i/5);x.stroke()}
 if(S.settings.master===false){x.strokeStyle="#65727a";x.lineWidth=2*dpr;x.beginPath();x.moveTo(0,h*.82);x.lineTo(w,h*.82);x.stroke();x.fillStyle="#8fa9b9";x.font=14*dpr+"px Segoe UI";x.fillText("ALLE MESSUNGEN AUS - ANZEIGE 0",16*dpr,32*dpr);return}
 let all=S.samples.filter(q=>q.type==="quality"),windowSize=Math.min(180,Math.max(24,Math.floor(c.clientWidth/7))),maxStart=Math.max(0,all.length-windowSize);timelineWindowStart=Math.max(0,Math.min(maxStart,timelineWindowStart||maxStart));let a=all.slice(timelineWindowStart,timelineWindowStart+windowSize);
 const range=$("timelineRange"),label=$("timelineRangeLabel");if(range){range.max=maxStart;range.value=timelineWindowStart;range.disabled=maxStart===0;if(label)label.textContent=a.length?`${timelineWindowStart+1}-${timelineWindowStart+a.length} von ${all.length}`:"keine Messwerte";if(!range.dataset.bound){range.dataset.bound="1";range.oninput=()=>{timelineWindowStart=Number(range.value)||0;chart()}}}
 if(!a.length){x.strokeStyle="#65727a";x.lineWidth=2*dpr;x.beginPath();x.moveTo(0,h*.72);x.lineTo(w,h*.72);x.stroke();x.fillStyle="#8fa9b9";x.font=14*dpr+"px Segoe UI";x.fillText("Messwerte erscheinen nach dem ersten Pruefdienst-Zyklus",16*dpr,32*dpr);return}
 const quality=q=>Math.max(0,Math.min(100,100-(Number(q.lossPct)||0)*7-Math.max(0,(Number(q.p95JitterMs)||0)-8)*.55-Math.max(0,(Number(q.p99Ms)||0)-30)*.22));
 const vals=a.map(quality),top=18*dpr,bottom=h-30*dpr,plotH=bottom-top,pxFor=i=>i/(a.length-1||1)*w,pyFor=v=>top+(100-v)/100*plotH;
 // Echte Messkurve
 x.strokeStyle="#40adff";x.lineWidth=2*dpr;x.beginPath();vals.forEach((v,i)=>{let px=pxFor(i),py=pyFor(v);i?x.lineTo(px,py):x.moveTo(px,py)});x.stroke();
 // Sichtbare Warn- und Fehlerspitzen
 a.forEach((q,i)=>{let loss=Number(q.lossPct)||0,jit=Number(q.p95JitterMs)||0,bad=loss>=5||jit>=50||q.ok===false,warn=!bad&&(loss>0||jit>=20);if(!bad&&!warn)return;let sev=Math.min(100,(bad?45:20)+loss*6+Math.max(0,jit-15)*.8),px=pxFor(i),base=pyFor(vals[i]),peak=Math.max(top,base-sev/100*plotH*.72);x.strokeStyle=bad?"#ff4c3e":"#ffd02f";x.lineWidth=(bad?3:2)*dpr;x.beginPath();x.moveTo(px,base);x.lineTo(px,peak);x.stroke();x.fillStyle=x.strokeStyle;x.beginPath();x.arc(px,peak,(bad?4:3)*dpr,0,Math.PI*2);x.fill()});
 // Lineare Trendlinie: zeigt eindeutig Auf- oder Abwaertstrend
 let nPts=vals.length,sumX=0,sumY=0,sumXY=0,sumXX=0;vals.forEach((v,i)=>{sumX+=i;sumY+=v;sumXY+=i*v;sumXX+=i*i});let den=nPts*sumXX-sumX*sumX,slope=den?((nPts*sumXY-sumX*sumY)/den):0,intercept=(sumY-slope*sumX)/nPts;
 x.save();x.setLineDash([8*dpr,6*dpr]);x.strokeStyle="#8df0a5";x.lineWidth=2*dpr;x.beginPath();x.moveTo(0,pyFor(intercept));x.lineTo(w,pyFor(intercept+slope*(nPts-1)));x.stroke();x.restore();
 const last=a.at(-1),lp={px:pxFor(a.length-1),py:pyFor(vals.at(-1))};x.fillStyle="#ffd02f";x.beginPath();x.arc(lp.px,lp.py,4*dpr,0,Math.PI*2);x.fill();x.fillStyle="#b8cedb";x.font=12*dpr+"px Segoe UI";let trend=slope>.08?"steigend":slope<-.08?"fallend":"stabil";x.fillText(`Qualitaet ${Math.round(vals.at(-1))} % - Trend ${trend}`,16*dpr,h-10*dpr);
 c._timelineData={a,vals,pxFor,pyFor};
 if(!c.dataset.hoverBound){c.dataset.hoverBound="1";c.addEventListener("mousemove",e=>{const data=c._timelineData||{},arr=data.a||[],r=c.getBoundingClientRect(),idx=Math.max(0,Math.min(arr.length-1,Math.round((e.clientX-r.left)/r.width*(arr.length-1)))),q=arr[idx],tip=$("timelineTip");if(!q||!tip)return;let qv=(data.vals||[])[idx];tip.hidden=false;tip.style.left=Math.min(r.width-190,Math.max(4,e.clientX-r.left+12))+"px";tip.style.top=Math.max(4,e.clientY-r.top-68)+"px";tip.innerHTML=`<b>${new Date(q.ts||Date.now()).toLocaleTimeString("de-DE")}</b><br>Qualitaet ${Math.round(qv)} %<br>Loss ${n(q.lossPct,1)} % · Jitter ${n(q.p95JitterMs)} ms · P99 ${n(q.p99Ms)} ms`});c.addEventListener("mouseleave",()=>{const t=$("timelineTip");if(t)t.hidden=true})}
}
function bars(){let c=$("bars");if(!c)return;let x=c.getContext("2d"),dpr=devicePixelRatio||1,w=c.width=c.clientWidth*dpr,h=c.height=210*dpr;x.clearRect(0,0,w,h);let names=[["router","Router"],["internet","Internet"],["dns","DNS"],["quality","Qualitaet"],["system","PC"],["fritz","FRITZ"]],v=names.map(([k])=>S.events.filter(e=>e.source===k&&e.level!=="blue").length),total=v.reduce((a,b)=>a+b,0),mx=Math.max(1,...v),bw=w/(names.length*1.7);if($("barsTotalPct"))$("barsTotalPct").textContent=total?"100 %":"0 %";names.forEach(([k,label],i)=>{let bh=v[i]/mx*(h-45),left=(i*1.7+.35)*bw;x.fillStyle=v[i]?"#ff9348":"#29495c";x.fillRect(left,h-bh-26*dpr,bw,bh);x.fillStyle="#b8cedb";x.textAlign="center";x.font=11*dpr+"px Segoe UI";x.fillText(label,(i*1.7+.85)*bw,h-7*dpr);if(v[i]){x.fillStyle="#ffffff";x.font="bold "+11*dpr+"px Segoe UI";x.fillText(Math.round(v[i]/total*100)+" %",(i*1.7+.85)*bw,h-bh-31*dpr)}});if(!c.dataset.hoverBound){c.dataset.hoverBound="1";c.addEventListener("mousemove",e=>{const r=c.getBoundingClientRect(),idx=Math.floor((e.clientX-r.left)/r.width*names.length),tip=$("barsTip");if(idx<0||idx>=names.length||!tip)return;tip.hidden=false;tip.style.left=Math.min(r.width-170,Math.max(4,e.clientX-r.left+10))+"px";tip.style.top=Math.max(4,e.clientY-r.top-52)+"px";tip.innerHTML=`<b>${names[idx][1]}</b><br>${v[idx]} Meldungen · ${total?Math.round(v[idx]/total*100):0} %`});c.addEventListener("mouseleave",()=>{const t=$("barsTip");if(t)t.hidden=true})}}
function metric(title,value,explain,l="green"){return `<article class="card"><h2>${title}</h2><div class="metric ${l}">${value}</div><div class="sub">${explain}</div></article>`}
function pcHealth(sys={},snapshot=null){
 let cpu=Number(sys.cpuPct||0),ram=Number(sys.memPct||0),disk=Number(sys.diskPct||0);
 const pc=(snapshot?domainAssessment("pc",snapshot):window.SystemAssessmentCore?.assess?.({system:sys},S)?.domains?.pc);
 if(pc?.available)return {score:pc.score,l:uiLevel(pc.level),cpu,ram,disk};
 let score=100;
 if(cpu>=95)score-=35;else if(cpu>=80)score-=18;
 if(ram>=95)score-=30;else if(ram>=85)score-=15;
 if(disk>=95)score-=30;else if(disk>=80)score-=15;
 let l=score<55?"red":score<80?"yellow":"green";
 return {score:Math.max(0,score),l,cpu,ram,disk}
}
function assistantPlan(d,a){
 const q=d.quality||{},sys=d.system||{},r=d.router||{},cf=d.targets?.cloudflare||{},health=pcHealth(sys,d),steps=[];
 let summary=a.title+" - "+a.text;
 if(!d.ok){steps.push(["1. Pruefdienst starten","Im Ordner `probe` die Datei `PRUEFDIENST_STARTEN.cmd` starten. Danach 30 Sekunden warten und den Leitstand neu messen lassen.","Wenn der Pruefdienst nicht laeuft, kann die Webseite nur eingeschraenkt bewerten."])}
 if(d.ok&&r.ok===false){steps.push(["2. Router erreichbar machen","Routeradresse pruefen, WLAN/LAN-Verbindung kontrollieren und testweise `fritz.box` beziehungsweise die Router-IP oeffnen.","Wenn der Router selbst nicht antwortet, sind Internet-Tests dahinter nicht aussagekraeftig."])}
 if(r.ok&&d.targets&&Object.values(d.targets).filter(x=>x.ok).length===0){steps.push(["3. WAN / Anbieter pruefen","FRITZ!Box ist erreichbar, externe Ziele aber nicht. Router-Oberflaeche oeffnen und Internetstatus, Kabel/DOCSIS und Anbieterstatus pruefen.","Das spricht eher fuer WAN/Kabel/Provider als fuer den PC."])}
 if((q.lossPct||0)>=5){steps.push(["4. Paketverlust eingrenzen","Tiefenanalyse starten. Danach schauen, ob Paketverlust bei allen Zielen oder nur bei einem Ziel auftritt.","Paketverlust verursacht Aussetzer, Sanduhr, Telefonie- und Streamingprobleme."])}
 if((q.p95JitterMs||0)>=50){steps.push(["5. Jitter untersuchen","Am selben Standort einmal per WLAN und einmal per LAN testen. Parallel Streaming/TV beobachten.","Jitter bedeutet schwankende Laufzeit. Der Durchschnitt kann gut aussehen, obwohl kurze Haenger auftreten."])}
 if(health.l!=="green"){steps.push(["6. PC-Gesundheit pruefen",`CPU ${n(health.cpu)} %, RAM ${n(health.ram)} %, Datentraeger ${n(health.disk)} %. Programme schliessen und SMART-/PC-Bericht importieren.`,"Hohe PC-Last kann lokale Haenger erzeugen, obwohl das Netz stabil ist."])}
 steps.push(["7. Ergebnis sichern","Stoerung markieren und JSON-Bericht exportieren, wenn der Fehler wieder auftritt.","So kann spaeter genau der Zeitpunkt mit Router-, Internet- und PC-Werten verglichen werden."]);
 if(cf.ok&&health.l==="green"&&(q.lossPct||0)<1&&(q.p95JitterMs||0)<20){steps.unshift(["Aktuell kein harter Fehler","Werte sind unauffaellig. Bei erneutem Haenger Stoerung markieren und danach den Assistenten starten.","Der Assistent bleibt vorbereitet."])}
 return {summary,steps:steps.slice(0,7)}
}
function renderAssistant(d,a){
 const p=assistantPlan(d,a);
 if($("assistantSummary"))$("assistantSummary").textContent=p.summary;
 if(!S.assistant)S.assistant={active:false,step:0};
 S.assistant.step=Math.max(0,Math.min(S.assistant.step,p.steps.length-1));
 if($("assistantSteps"))$("assistantSteps").innerHTML=S.assistant.active?"":p.steps.slice(0,3).map(([h,t])=>`<li><b>${h}:</b> ${t}</li>`).join("");
 if($("assistantWalk")){
  if(!S.assistant.active){$("assistantWalk").innerHTML=`<div class="finding gray"><b>Assistent bereit.</b><br>Klicke auf Assistent starten, dann fuehrt dich der Leitstand Schritt fuer Schritt durch die Pruefung.</div>`}
  else{let s=p.steps[S.assistant.step];$("assistantWalk").innerHTML=`<div class="assistant-step"><small>Schritt ${S.assistant.step+1} von ${p.steps.length}</small><h3>${s[0]}</h3><p>${s[1]}</p><em>${s[2]||""}</em></div>`}
 }
 if($("assistantPrev"))$("assistantPrev").disabled=!S.assistant.active||S.assistant.step===0;
 if($("assistantNext"))$("assistantNext").disabled=!S.assistant.active||S.assistant.step>=p.steps.length-1;
}
function infoText(key){
 const m={
  router:"Prueft, ob der Router im Heimnetz erreichbar ist. Wenn dieser Test aus ist, werden Routeranzeige und zugehoerige Statuslampen nicht aktiv bewertet.",
  multiPing:"Vergleicht mehrere Internetziele. So erkennt der Leitstand, ob nur ein Ziel oder der Internetzugang insgesamt betroffen ist.",
  ipStack:"Prueft IPv4 und IPv6 getrennt. Manche Stoerungen betreffen nur einen der beiden Protokollwege.",
  dns:"DNS uebersetzt Namen wie google.de in IP-Adressen. Fehler hier wirken wie Internetprobleme, obwohl die Leitung noch stehen kann.",
  loss:"Paketverlust bedeutet, dass Datenpakete unterwegs verloren gehen. Schon kleine Werte koennen Streaming, Telefonie und Chat stoeren.",
  jitter:"Jitter ist die Schwankung der Laufzeit. Hoher Jitter macht Verbindungen unruhig, auch wenn der Durchschnitt gut aussieht.",
  system:"PC-Systemwerte helfen zu unterscheiden, ob das Netz haengt oder der Rechner selbst ueberlastet ist.",
  lag:"Der Lag-Test misst, ob die Bedienoberflaeche oder der PC kurz einfriert. Ist er ausgeschaltet, wird nichts aufgezeichnet.",
  docsis:"DOCSIS ist der Kabelanschluss-Teil. Wichtig sind Pegel, Signalqualitaet und nicht korrigierbare Fehler.",
  smart:"SMART meldet Festplatten-/SSD-Gesundheit. Kritisch sind Reallocated, Pending, Uncorrectable und hohe Temperatur.",
  wifi:"WLAN-Werte wie Signal oder Kanal darf die Browser-App nicht direkt lesen. Sie kommen ueber Routerimport oder lokalen Pruefdienst."
 };
 return m[key]||"Kurzerklaerung zum Messwert. Details erscheinen, wenn echte Messdaten oder Importdaten vorhanden sind.";
}
function stateWord(l){return l==="green"?"OK":l==="yellow"?"WARN":l==="orange"?"ALARM":l==="red"?"FEHLER":l==="blue"?"AKTIV":l==="gray"?"OFFEN":"UNBEKANNT"}
function dial(title,value,max,label,state,testId="",infoKey=""){
 const p=value==null?18:Math.max(0,Math.min(100,Number(value)/max*100)),key=infoKey||testId,off=testId&&!testOn(testId);
 return `<article class="cockpit-instrument ${off?"is-off":""}" data-info="${key?infoText(key):label}"><header><b>${title}</b>${testId?`<label class="mini-switch only-switch" title="${title} ein/aus"><input data-tile-test="${testId}" type="checkbox" ${S.settings[testId]!==false?"checked":""}><span></span></label>`:""}</header><div class="dial ${state}" style="--p:${p}%"><span>${label}</span></div><small>${off?"ausgeschaltet":stateWord(state)}</small></article>`
}
function barRow(name,value,max,state,info){
 const p=value==null?0:Math.max(0,Math.min(100,Number(value)/max*100));
 return `<div class="cockpit-bar" data-info="${info}"><span>${name}</span><i><b class="${state}" style="width:${p}%"></b></i><em>${value??"-"}</em></div>`
}
function actionButton(id,label,info){return `<button class="btn cockpit-action" data-action="${id}" data-info="${info}">${label}</button>`}
function sensorCount(register){
 const list=window.NETZWERK_LEITSTAND_SENSOR_REGISTRY?.sensors||[];
 return list.filter(s=>s.register===register).length;
}
function registerHeading(title,description,register){return `<header class="register-heading"><div><h2>${title}</h2><p>${description}</p></div><span class="sensor-count">${sensorCount(register)} zugeordnete Sensoren</span></header>`}
function registerEmpty(title,text){return `<section class="register-empty"><b>${title}</b>${text}</section>`}
function renderDiagnosticTabs(d){
 const q=d.quality||{},sys=d.system||{},r=d.router||{},cf=d.targets?.cloudflare||{},health=pcHealth(sys,d),assessment=assessmentFor(d),domains=assessment?.domains||{};
 const active=document.querySelector(".diag-tab.active")?.dataset.diagTab||"internet";
 const data={
  internet:`<section class="register-view">${registerHeading("Internet & Provider","Nur Internetqualitaet, Erreichbarkeit und Protokollwege. Keine PC-, WLAN- oder Druckerwerte.","internet")}<div class="register-grid">${dial("Internet-Ping",cf.avgMs,300,cf.ok?n(cf.avgMs)+" ms":"offline",domainLevel("internet",d),"multiPing")}${dial("Paketverlust",q.lossPct,10,n(q.lossPct,1)+" %",domainLevel("quality",d),"loss")}${dial("Jitter P95",q.p95JitterMs,100,n(q.p95JitterMs)+" ms",domainLevel("quality",d),"loss","jitter")}${dial("DNS",d.dns?Object.keys(d.dns).length:0,4,d.dns?Object.keys(d.dns).length+" Resolver":"offen",domainLevel("dns",d),"dns")}<section class="cockpit-detail internet-detail">${barRow("IPv4",d.ip?.ipv4?.ok?100:0,100,d.ip?.ipv4?.ok?"green":"yellow","IPv4 getrennt bewertet")}${barRow("IPv6",d.ip?.ipv6?.ok?100:0,100,d.ip?.ipv6?.ok?"green":"yellow","IPv6 getrennt bewertet")}<table><tr><th>Ziel</th><th>Wert</th><th>Bewertung</th></tr><tr><td>Cloudflare</td><td>${cf.ok?n(cf.avgMs)+" ms":"nicht erreichbar"}</td><td>${stateWord(domainLevel("internet",d))}</td></tr><tr><td>Loss/Jitter</td><td>${n(q.lossPct,1)} % / ${n(q.p95JitterMs)} ms</td><td>Streaming/Telefonie relevant</td></tr></table></section></div></section>`,
  router:`<section class="register-view">${registerHeading("FRITZ!Box 6690 Cable","Router-, Anschluss- und DOCSIS-Daten. Internetqualitaet bleibt im Register Internet.","fritzbox")}<div class="register-grid">${dial("Router erreichbar",r.ok?100:0,100,r.ok?"OK":"keine Antwort",domainLevel("router",d),"router")}${dial("Antwortzeit",r.avgMs,120,r.avgMs!=null?n(r.avgMs)+" ms":"offen",domainLevel("router",d),"router")}${dial("Routerprofil",profile().features.length,6,profile().name,"blue")}${dial("Erkennung",S.routerDetect?.score||0,100,S.routerDetect?S.routerDetect.score+" %":"offen",S.routerDetect?.level||"gray","","router")}<section class="cockpit-detail"><div class="cockpit-actions">${actionButton("detectRouter","Router erkennen","Router jetzt aus Profil, erreichbarer Adresse und Importen erkennen")}${actionButton("openRouter","Router oeffnen","Router-Oberflaeche im Browser oeffnen")}</div><table><tr><th>Router-Test</th><th>Ergebnis</th></tr><tr><td>Adresse</td><td>${S.settings.host||profile().defaultHost}</td></tr><tr><td>Profil</td><td>${profile().name}</td></tr><tr><td>Erkennung</td><td>${S.routerDetect?S.routerDetect.model:"noch nicht ausgefuehrt"}</td></tr></table></section>${registerEmpty("Import und DOCSIS","Vorhandene Importfunktionen bleiben hier erhalten und werden nicht doppelt gemessen.")}</div></section>`,
  imports:`${dial("FRITZ-Diagnose",S.fritzdiag?100:0,100,S.fritzdiag?"vorhanden":"offen",S.fritzdiag?"green":"gray")}${dial("Routerdatei",S.routerImport?100:0,100,S.routerImport?S.routerImport.kind:"offen",S.routerImport?.level||"gray")}${dial("DOCSIS-Zaehler",S.routerImport?.uncorr??null,10000,S.routerImport?.uncorr!=null?"unkorr. "+S.routerImport.uncorr:"offen",S.routerImport?.uncorr>0?"yellow":S.routerImport?"green":"gray")}${dial("Kanalwerte",S.routerImport?.channels??null,64,S.routerImport?.channels?S.routerImport.channels+" Kanaele":"offen",S.routerImport?.channels?"green":"gray")}<section class="cockpit-detail"><div class="cockpit-actions">${actionButton("importDiag","FRITZ-Diagnose importieren","FRITZ!Box-Funktionsdiagnose auswerten")}${actionButton("importRouter","Routerdatei importieren","Router- oder DOCSIS-Datei importieren")}</div><table><tr><th>Import/DOCSIS</th><th>Status</th><th>Nutzen</th></tr><tr><td>FRITZ-Diagnose</td><td>${S.fritzdiag?"vorhanden":"offen"}</td><td>Router- und WLAN-Hinweise</td></tr><tr><td>Routerdatei</td><td>${S.routerImport?S.routerImport.kind:"offen"}</td><td>Router-/DOCSIS-Daten</td></tr><tr><td>Nicht korrigierbare Fehler</td><td>${S.routerImport?.uncorr??"-"}</td><td>Kabelsignal bewerten</td></tr></table></section>`,
  wifi:`<section class="register-view">${registerHeading("WLAN & Mesh","Nur Funknetz, Kanaele, Signal, Repeater und Mesh-Zustand.","wlan")}<div class="register-grid">${dial("WLAN-Status",S.fritzdiag?.weakWifi?75:20,100,S.fritzdiag?.weakWifi?"schwach":"offen",S.fritzdiag?.weakWifi?"yellow":"gray","wifi")}${dial("Mesh",S.fritzdiag?.meshError?90:20,100,S.fritzdiag?.meshError?"Fehler":"offen",S.fritzdiag?.meshError?"red":S.fritzdiag?"green":"gray","wifi")}${dial("Kanal",S.fritzdiag?.sameChannel24?70:15,100,S.fritzdiag?.sameChannel24?"auffaellig":"offen",S.fritzdiag?.sameChannel24?"yellow":"gray","wifi")}${dial("LAN/WLAN",S.wifiSurvey?100:0,100,S.wifiSurvey?"Vergleich":"vorbereitet",S.wifiSurvey?"green":"gray","wifi")}<section class="cockpit-detail">${barRow("Signal",S.fritzdiag?.weakWifi?45:null,100,S.fritzdiag?.weakWifi?"yellow":"gray","Signalwerte kommen ueber Import oder lokalen Pruefdienst")}${barRow("Mesh",S.fritzdiag?.meshError?90:null,100,S.fritzdiag?.meshError?"red":"gray","Mesh-Hinweise aus FRITZ-Diagnose")}<p>Der Browser darf WLAN-Hardware nicht direkt lesen. Der echte Test laeuft ueber Routerimport, FRITZ-Diagnose oder lokalen Pruefdienst.</p></section></div></section>`,
  pc:`<section class="register-view">${registerHeading("Windows-PC","Nur PC-Leistung, Speicher, Laufwerke und Windows-Gesundheit. Keine Internetwerte.","pc")}<div class="register-grid">${dial("CPU",sys.cpuPct,100,n(sys.cpuPct)+" %",domainLevel("pc",d),"system")}${dial("RAM",sys.memPct,100,n(sys.memPct)+" %",domainLevel("pc",d),"system")}${dial("Datentraeger",sys.diskPct,100,n(sys.diskPct)+" %",domainLevel("pc",d),"system")}${dial("UI-Lag",Math.min(100,lagState.current/10),100,Math.round(lagState.current)+" ms",lagState.current>=1000?"red":lagState.current>=250?"yellow":"green","lag")}<section class="cockpit-detail"><div class="cockpit-actions">${actionButton("importSmart","SMART-/PC-Bericht importieren","SMART- oder Windows-Gesundheitsbericht importieren")}</div>${barRow("SMART",S.smart?100:null,100,S.smart?.level||"gray","SMART meldet Festplatten-/SSD-Gesundheit")}${barRow("PC-Gesundheit",health.score,100,health.l,"Zusammenfassung aus CPU, RAM und Datentraeger")}<p>${S.smart?("SMART: "+S.smart.status):"Noch kein SMART-Bericht importiert."}</p></section></div></section>`,
  printer:`<section class="register-view">${registerHeading("Drucker","Druckerstatus, Warteschlange, Verbrauchsmaterial und Fehler werden in einer spaeteren Sensorstufe hier ergaenzt.","printer")}${registerEmpty("Noch keine aktive Doppelpruefung","Es wird erst ein Sensor aktiviert, wenn ein Drucker im Geraeteregister eindeutig hinterlegt ist.")}</section>`,
  multimedia:`<section class="register-view">${registerHeading("Multimedia","Fernseher, Fire TV und Streaminggeraete erhalten ausschliesslich eigene Sensoren.","multimedia")}${registerEmpty("Bereich vorbereitet","Vorhandene Geraete werden spaeter aus dem zentralen Geraeteregister zugeordnet.")}</section>`,
  nas:`<section class="register-view">${registerHeading("NAS & Speicher","NAS-Erreichbarkeit, Speicher, SMART und Freigaben werden hier gebuendelt.","nas")}${registerEmpty("Bereich vorbereitet","Keine Messung wird gestartet, solange kein NAS konfiguriert ist.")}</section>`,
  devices:`<section class="register-view">${registerHeading("Weitere Geraete","Nur Geraete ohne eigenes Fachregister erscheinen hier.","devices")}${registerEmpty("Keine Doppelanzeige","FRITZ!Box, PC, WLAN, Drucker, Multimedia und NAS werden nicht zusaetzlich in diesem Register wiederholt.")}</section>`,
  protocol:`${dial("Messwerte",Math.min(S.samples.length,1000),1000,S.samples.length+" Eintraege","green")}${dial("Stoerungen",Math.min(S.events.length,100),100,S.events.length+" Meldungen",S.events.some(e=>e.level==="red")?"red":S.events.some(e=>e.level==="yellow")?"yellow":"green")}${dial("Export",100,100,"JSON","green")}${dial("Tiefenanalyse",S.deep?100:0,100,S.deep?"laeuft":"bereit",S.deep?"yellow":"gray")}<section class="cockpit-detail"><div class="cockpit-actions">${actionButton("exportReport","Bericht exportieren","JSON-Diagnosebericht erstellen")}${actionButton("startAssistant","Assistent starten","Gefuehrte Problemloesung starten")}</div><table><tr><th>Bereich</th><th>Anzahl</th></tr><tr><td>Messwerte</td><td>${S.samples.length}</td></tr><tr><td>Ereignisse</td><td>${S.events.length}</td></tr></table></section>`
 };
 const host=$("diagTabPanels");if(!host)return;
 host.innerHTML=Object.entries(data).map(([id,html])=>`<div class="tab-panel register-cockpit ${id===active?"active":""}" data-panel="${id}">${html}</div>`).join("");
 document.querySelectorAll("[data-tile-test]").forEach(x=>x.onchange=()=>{S.settings[x.dataset.tileTest]=x.checked;save();renderLive();renderSwitches();renderDiagnosticTabs(S.latest.snapshot||{})});
 document.querySelectorAll("[data-action]").forEach(b=>b.onclick=()=>runAction(b.dataset.action));
}
function initDiagnosticTabs(){
 $("diagTabs")?.addEventListener("click",e=>{
  const b=e.target.closest("[data-diag-tab]");if(!b)return;
  document.querySelectorAll(".diag-tab").forEach(x=>x.classList.toggle("active",x===b));
  document.querySelectorAll(".tab-panel").forEach(x=>x.classList.toggle("active",x.dataset.panel===b.dataset.diagTab));
 });
}
function render(){renderAlertHistory();
 let d=S.latest.snapshot||{},r=d.router||{},cf=d.targets?.cloudflare||{},q=d.quality||{},sys=d.system||{},a=analyze(d);
 $("diagTitle").textContent=a.title;$("diagText").textContent=a.text;$("score").textContent=a.score+"%";$("score").title="Klicken: Berechnung anzeigen";$("score").onclick=showHealthExplanation;$("score").style.cursor="pointer";$("score").style.borderColor=a.l==="red"?"var(--red)":a.l==="yellow"?"var(--yellow)":"var(--green)";
 $("plant").className="plant "+a.l;$("plant").textContent=a.l==="red"?"STOERUNG ERKANNT":a.l==="yellow"?"ANLAGE AUFFAELLIG":"ANLAGE STABIL";
 let rl=domainLevel("router",d),il=domainLevel("internet",d),jl=domainLevel("quality",d),ll=domainLevel("quality",d),health=pcHealth(sys,d),storageLevel=domainLevel("pc",d);
 redrawGauges();
 $("vRouter").textContent=testOn("router")?(r.ok?"Router erreichbar":"keine Antwort"):"ausgeschaltet";$("vInternet").textContent=testOn("multiPing")?(cf.ok?"Internet erreichbar":"Internet gestoert"):"ausgeschaltet";$("vPcHealth").textContent=testOn("system")?(health.l==="green"?"PC gesund":health.l==="yellow"?"PC auffaellig":"PC kritisch"):"ausgeschaltet";$("vStorage").textContent=testOn("system")?(sys.diskPct==null?"noch nicht gemessen":sys.diskPct<80?"Speicher ok":"Speicher pruefen"):"ausgeschaltet";$("vLoss").textContent=testOn("loss")?(q.lossPct==null?"noch nicht gemessen":q.lossPct<1?"Qualitaet stabil":"Qualitaet auffaellig"):"ausgeschaltet";
 renderAssistant(d,a);
 renderDiagnosticTabs(d);
 let rows=[["FRITZ!Box",rl,r.ok?n(r.avgMs)+" ms":"keine Antwort",r.ok?"Router im Heimnetz erreichbar":"Router/Heimnetz pruefen"],["Internet",il,cf.ok?n(cf.avgMs)+" ms":"nicht erreichbar",cf.ok?"mehrere externe Ziele werden verglichen":"Vodafone/Kabel/WAN verdaechtig"],["Paketverlust",ll,n(q.lossPct,1)+" %",q.lossPct<1?"unauffaellig":"Datenpakete gehen verloren"],["Jitter P95",jl,n(q.p95JitterMs)+" ms",q.p95JitterMs<20?"stabil":"Verbindung schwankt"],["IPv4",d.ip?.ipv4?.ok?"green":"red",d.ip?.ipv4?.ok?"verbunden":"gestoert","IPv4 separat geprueft"],["IPv6",d.ip?.ipv6?.ok?"green":"yellow",d.ip?.ipv6?.ok?"verbunden":"nicht bestaetigt","IPv6 separat geprueft"],["PC CPU",domainLevel("pc",d),n(sys.cpuPct)+" %",sys.cpuPct<80?"PC nicht ueberlastet":"PC-Auslastung auffaellig"]];
 $("statusRows").innerHTML=rows.map(v=>`<tr><td>${v[0]}</td><td>${pill(v[1])}</td><td>${v[2]}</td><td>${v[3]}</td><td>${time(d.ts)}</td></tr>`).join("");
 $("incidentNow").innerHTML=`<div class="finding ${a.l}"><b>${a.title}</b><p>${a.text}</p><small>Messstufe ${S.deep?3:S.stage} - ${time(d.ts)}</small></div>`;
 $("deepMetrics").innerHTML=metric("Messstufe",S.deep?"3 - TIEFENANALYSE":"1 - DAUERBETRIEB",S.deep?"dichte Messung zeitlich begrenzt":"sehr geringe Zusatzlast",S.deep?"yellow":"green")+metric("Loss-Burst",q.maxLossBurst??"-",q.maxLossBurst?"aufeinanderfolgende verlorene Pakete":"keine Verlustserie erkannt",q.maxLossBurst>2?"red":"green")+metric("P99-Latenz",n(q.p99Ms)+" ms","99 % der Messungen liegen darunter",level(true,q.p99Ms,150,500));
 $("internetMetrics").innerHTML=metric("IPv4",d.ip?.ipv4?.ok?"ERREICHBAR":"GESTOERT","separater Protokollweg",d.ip?.ipv4?.ok?"green":"red")+metric("IPv6",d.ip?.ipv6?.ok?"ERREICHBAR":"NICHT BESTAETIGT","separater Protokollweg",d.ip?.ipv6?.ok?"green":"yellow")+metric("WAN-Uptime",d.wan?.uptime?Math.floor(d.wan.uptime/3600)+" h":"-","Zeit seit WAN-Verbindungsaufbau");
 $("targets").innerHTML=Object.entries(d.targets||{}).map(([k,v])=>`<div class="finding ${v.ok?"green":"red"}"><b>${k}</b> - ${v.ok?n(v.avgMs)+" ms":"nicht erreichbar"} - Verlust ${n(v.lossPct,1)} %</div>`).join("")||"Pruefdienst starten.";
 $("fritzState").innerHTML=`<div class="finding ${domainLevel("router",d)}"><b>Router ${r.ok?"erreichbar":"nicht erreichbar"}</b><br>WAN: ${d.wan?.connected===true?"verbunden":d.wan?.connected===false?"getrennt":"nicht verfuegbar"} - Uptime ${d.wan?.uptime??"-"} s</div>${S.fritzdiag?`<div class="finding ${S.fritzdiag.meshError?"red":"green"}">FRITZ-Import: FRITZ!OS ${S.fritzdiag.fritzOS||"-"} - ${S.fritzdiag.rxChannels??"-"} Empfang / ${S.fritzdiag.txChannels??"-"} Senden - Mesh ${S.fritzdiag.meshError?"Fehlerhinweis":"kein Fehlertext"}</div>`:""}${S.routerImport?`<div class="finding ${S.routerImport.level}">Routerdatei: ${S.routerImport.model||S.routerImport.kind} - ${S.routerImport.summary}</div>`:""}`;
 $("wifiState").innerHTML=S.fritzdiag||S.routerImport?`${S.fritzdiag?`<div class="finding ${S.fritzdiag.meshError?"red":"green"}"><b>Mesh / Repeater:</b> ${S.fritzdiag.meshError?"Fehlerhinweis erkannt":"kein Fehlertext erkannt"}</div><div class="finding ${S.fritzdiag.weakWifi?"yellow":"green"}"><b>WLAN-Signal:</b> ${S.fritzdiag.weakWifi?"schwache Verbindung gemeldet":"kein Schwachsignaltext"}</div><div class="finding ${S.fritzdiag.sameChannel24?"yellow":"green"}"><b>2,4 GHz:</b> ${S.fritzdiag.sameChannel24?"Kanalbelegung auffaellig":"kein Kanalhinweis erkannt"}</div>`:""}<div class="finding gray"><b>WLAN-Test:</b> Direkte Signalstaerke und Kanalwerte kommen erst ueber lokalen Windows-Pruefdienst oder importierte Router-/WLAN-Datei.</div>`:"Funktionsdiagnose oder Router-/WLAN-Bericht importieren, damit Mesh-/WLAN-Hinweise ausgewertet werden.";
 $("dnsState").innerHTML=Object.entries(d.dns||{}).map(([k,v])=>`<div class="finding ${v.ok?"green":"red"}"><b>${k}</b> - ${v.ok?n(v.ms)+" ms":"Fehler"} - ${v.explain||""}</div>`).join("")||"Noch keine DNS-Messung.";
 $("systemMetrics").innerHTML=metric("CPU",n(sys.cpuPct)+" %","Prozessorauslastung",domainLevel("pc",d))+metric("RAM",n(sys.memPct)+" %","Arbeitsspeicher",domainLevel("pc",d))+metric("Datentraeger",n(sys.diskPct)+" %","Datentraegerauslastung",domainLevel("pc",d));
 $("pcExplain").innerHTML=`<div class="finding ${sys.cpuPct>95?"yellow":"green"}">${sys.cpuPct>95?"PC ist stark ausgelastet. Lokale Haenger sind moeglich.":"Der PC zeigt aktuell keine CPU-Vollauslastung."}</div>`;
 renderRouterDetectState();renderRouterImportState();renderSmartState();renderDocsis();renderTables();chart();bars();save()
}
function renderTables(){let f=($("measureFilter")?.value||"").toLowerCase(),typ=$("measureType")?.value||"";let a=S.samples.filter(x=>(!typ||x.type===typ)&&JSON.stringify(x).toLowerCase().includes(f)).slice().reverse().slice(0,S.settings.rows||1000);$("measurementRows").innerHTML=a.map(x=>`<tr><td>${new Date(x.ts).toLocaleString("de-DE")}</td><td>${x.type}</td><td>${pill(x.ok===false?"red":"green")}</td><td>${x.value??x.avgMs??x.p95JitterMs??"-"}</td><td>${JSON.stringify(x).slice(0,180)}</td></tr>`).join("");let types=[...new Set(S.samples.map(x=>x.type))];let cur=$("measureType").value;$("measureType").innerHTML='<option value="">Alle Pruefkreise</option>'+types.map(x=>`<option ${x===cur?"selected":""}>${x}</option>`).join("");let ef=($("eventFilter")?.value||"").toLowerCase();$("eventRows").innerHTML=S.events.filter(e=>JSON.stringify(e).toLowerCase().includes(ef)).slice().reverse().slice(0,S.settings.rows||1000).map(e=>`<tr><td>${new Date(e.ts).toLocaleString("de-DE")}</td><td>${pill(e.level)}</td><td>${e.text}</td><td>${e.source}</td></tr>`).join("")}
function renderSwitches(){
 $("masterSwitch").checked=S.settings.master!==false;
 if($("masterHomeSwitch"))$("masterHomeSwitch").checked=S.settings.master!==false;
 $("switchGrid").innerHTML=`<div class="test-control-table"><table><thead><tr><th>Messkreis</th><th>Status</th><th>Intervall</th><th>Schalter</th></tr></thead><tbody>${TESTS.map(([id,t,p,intv])=>`<tr data-info="${infoText(id)}"><td><b>${t}</b><small>${p}</small></td><td>${S.settings.master===false||S.settings[id]===false?pill("gray"):pill("green")}</td><td>${intv}</td><td><label class="switch compact-switch"><input data-test="${id}" type="checkbox" ${S.settings[id]!==false?"checked":""}><span></span></label></td></tr>`).join("")}</tbody></table></div>`;
 document.querySelectorAll("[data-test]").forEach(x=>x.onchange=()=>{S.settings[x.dataset.test]=x.checked;save();renderLive();renderLag();renderStatusLEDs();syncFieldSwitches();renderDiagnosticTabs(S.latest.snapshot||{});redrawGauges()});
 $("masterSwitch").onchange=()=>{
  S.settings.master=$("masterSwitch").checked;
  TESTS.forEach(([id])=>S.settings[id]=S.settings.master);
  if(S.settings.master===false){lagState.current=0;lagState.max=0;lagState.history=[];cycle.running=false;S.deep=false;S.deepUntil=null;if(deepTimer)clearTimeout(deepTimer)}
  save();renderSwitches();renderLive();renderLag();renderStatusLEDs();syncFieldSwitches();renderOperation();renderDiagnosticTabs(S.latest.snapshot||{});redrawGauges();chart();bars();syncVitals()
 }
 if($("masterHomeSwitch"))$("masterHomeSwitch").onchange=()=>{$("masterSwitch").checked=$("masterHomeSwitch").checked;$("masterSwitch").onchange()};
}
function renderDevices(){let names=["Fernseher","Fire TV","PC / ChatGPT","iPhone"];$("deviceMatrix").innerHTML=names.map(nm=>`<div class="switch-card"><div><h2>${nm}</h2><p>${S.devices[nm]?"Stoerung markiert":"kein Problem markiert"}</p></div><label class="switch"><input data-device="${nm}" type="checkbox" ${S.devices[nm]?"checked":""}><span></span></label></div>`).join("");document.querySelectorAll("[data-device]").forEach(x=>x.onchange=()=>{S.devices[x.dataset.device]=x.checked;if(x.checked)event("blue",x.dataset.device+" als gestoert markiert","devices");let c=Object.values(S.devices).filter(Boolean).length;if(c>=3)event("red",c+" Geraete gleichzeitig betroffen - zentrale Netzursache sehr wahrscheinlich","devices");save();renderDevices()})}
function renderDocsis(){if(!S.docsis.length){$("docsisView").innerHTML="Noch kein Schnappschuss.";return}let a=S.docsis.slice().reverse(),last=a[0],prev=a[1],delta=prev?last.uncorr-prev.uncorr:null;$("docsisView").innerHTML=`<div class="finding ${delta>1000?"red":delta>0?"yellow":"green"}"><b>Letzte AEnderung nicht korrigierbarer Fehler:</b> ${delta==null?"Vergleich nach zweitem Schnappschuss":(delta>=0?"+":"")+delta}</div><div class="table-wrap"><table><thead><tr><th>Zeit</th><th>Nicht korr.</th><th>Korr.</th><th>Downstream</th><th>Upstream</th></tr></thead><tbody>${a.map(x=>`<tr><td>${new Date(x.ts).toLocaleString("de-DE")}</td><td>${x.uncorr}</td><td>${x.corr}</td><td>${x.down??"-"}</td><td>${x.up??"-"}</td></tr>`).join("")}</tbody></table></div>`}
function renderDeepProgress(){
 if(!$("deepProgress"))return;
 const total=(S.settings.deepSeconds||60)*1000,remain=S.deep&&S.deepUntil?Math.max(0,S.deepUntil-Date.now()):0,pct=S.deep?Math.max(0,Math.min(100,remain/total*100)):0;
 $("deepProgress").classList.toggle("active",!!S.deep);
 $("deepFill").style.width=pct+"%";
 $("deepRemain").textContent=S.deep?Math.ceil(remain/1000)+" s":"-- s";
 $("deepLabel").textContent=S.deep?"Tiefenanalyse laeuft - dichter Messmodus":"Tiefenanalyse bereit";
}
function parseDiag(raw,name){let t=raw.replace(/\r/g,""),os=/FRITZ!OS\s*([0-9.]+)/i.exec(t),rx=/(\d+)\s*Empfangskanaele/i.exec(t),tx=/(\d+)\s*Sendekanaele/i.exec(t);return {fileName:name,ts:Date.now(),fritzOS:os?.[1]||null,rxChannels:rx?+rx[1]:null,txChannels:tx?+tx[1]:null,meshError:/(Fehler.{0,100}Mesh|Mesh.{0,100}Fehler|unterbrochene WLAN-Verbindung)/is.test(t),weakWifi:/schwache WLAN-Verbindung/is.test(t),sameChannel24:/2,4.{0,120}(drei|3)\s+(andere\s+)?WLAN-Netze.{0,80}(selben|gleichen)\s+Kanal/is.test(t)}}
function findNum(t,patterns){for(const p of patterns){let m=p.exec(t);if(m)return Number(String(m[1]).replace(",",".").replace(/[^\d.-]/g,""))}return null}
function detectRouterKind(t,name){
 let low=(t+" "+name).toLowerCase();
 if(low.includes("fritz!box")||low.includes("fritzbox"))return "FRITZ!Box";
 if(low.includes("vodafone station"))return "Vodafone Station";
 if(low.includes("speedport"))return "Speedport";
 if(low.includes("easybox"))return "EasyBox";
 if(low.includes("tp-link")||low.includes("tplink")||low.includes("deco"))return "TP-Link/Deco";
 return "Allgemeiner Router";
}
function parseRouterFile(raw,name){
 let t=raw.replace(/\r/g," "),kind=detectRouterKind(t,name),json=null;
 try{json=JSON.parse(raw)}catch{}
 let model=/((FRITZ!Box|Vodafone Station|Speedport|EasyBox|TP-?Link|Deco)[^<\n\r]{0,60})/i.exec(t)?.[1]?.trim()||json?.settings?.customModel||json?.settings?.model||kind;
 let os=/FRITZ!OS\s*([0-9.]+)/i.exec(t)?.[1]||null;
 let uncorr=findNum(t,[/nicht\s*korrigierbare[^0-9]{0,40}([0-9][0-9.,]*)/i,/uncorrect(?:able|ed)[^0-9]{0,40}([0-9][0-9.,]*)/i,/unerrored[^0-9]{0,80}uncorrect[^0-9]{0,40}([0-9][0-9.,]*)/i]);
 let corr=findNum(t,[/korrigierbare[^0-9]{0,40}([0-9][0-9.,]*)/i,/correct(?:able|ed)[^0-9]{0,40}([0-9][0-9.,]*)/i]);
 let down=findNum(t,[/downstream[^-\d]{0,80}(-?[0-9]+(?:[,.][0-9]+)?)\s*dBmV/i,/empfang[^-\d]{0,80}(-?[0-9]+(?:[,.][0-9]+)?)\s*dBmV/i]);
 let up=findNum(t,[/upstream[^-\d]{0,80}(-?[0-9]+(?:[,.][0-9]+)?)\s*dBmV/i,/senden[^-\d]{0,80}(-?[0-9]+(?:[,.][0-9]+)?)\s*dBmV/i]);
 let snr=findNum(t,[/(?:SNR|MSE)[^0-9-]{0,40}(-?[0-9]+(?:[,.][0-9]+)?)/i]);
 let channels=(t.match(/(?:Empfangskanal|Downstream|DOCSIS)/gi)||[]).length;
 let docsisDetected=/DOCSIS|Kabel-Informationen|Empfangskanaele|Sendekanaele|nicht korrigierbar/i.test(t)||kind==="Vodafone Station";
 let warnings=[];
 if(docsisDetected&&uncorr!=null&&uncorr>0)warnings.push("Nicht korrigierbare DOCSIS-Fehler erkannt.");
 if(snr!=null&&snr<30)warnings.push("Signalqualitaet/SNR wirkt niedrig.");
 if(down!=null&&(down<-12||down>12))warnings.push("Downstream-Pegel ausserhalb typischer Zielbereiche.");
 if(up!=null&&up>51)warnings.push("Upstream-Pegel hoch.");
 if(/schwache WLAN|Mesh.{0,80}Fehler|Radar|DFS|Kanalbelegung/i.test(t))warnings.push("WLAN-/Mesh-Hinweis erkannt.");
 let level=warnings.some(w=>/unkorrigierbare|niedrig|ausserhalb|hoch/i.test(w))?"yellow":"green";
 let summary=docsisDetected?`DOCSIS ${uncorr==null?"ohne Zaehler":"unkorr. "+uncorr}${snr==null?"":", SNR "+snr}`:"Routerprofil ohne DOCSIS-Pflichtfelder";
 return {fileName:name,ts:Date.now(),kind,model,os,docsisDetected,uncorr,corr,down,up,snr,channels,warnings,level,summary,rawSize:raw.length};
}
function parseSmartFile(raw,name){
 let t=raw.replace(/\r/g," "),json=null;try{json=JSON.parse(raw)}catch{}
 let temp=findNum(t,[/Temperature[^0-9]{0,40}([0-9]{2,3})/i,/Temperatur[^0-9]{0,40}([0-9]{2,3})/i]);
 let realloc=findNum(t,[/Reallocated[^0-9]{0,50}([0-9]+)/i,/Wiederzugewiesene[^0-9]{0,50}([0-9]+)/i]);
 let pending=findNum(t,[/Pending[^0-9]{0,50}([0-9]+)/i,/Ausstehende[^0-9]{0,50}([0-9]+)/i]);
 let uncorrect=findNum(t,[/Uncorrectable[^0-9]{0,50}([0-9]+)/i,/nicht korrigierbar[^0-9]{0,50}([0-9]+)/i]);
 let wear=findNum(t,[/Wear[^0-9]{0,50}([0-9]+)/i,/Media Wearout[^0-9]{0,50}([0-9]+)/i]);
 let status=json?.health||json?.status||(/Pred Fail|Bad|Caution|Critical|Kritisch/i.test(t)?"kritisch":/OK|Healthy|Gut|Normal/i.test(t)?"ok":"unbekannt");
 let warnings=[];
 if(/Pred Fail|Bad|Critical|Kritisch/i.test(t))warnings.push("Datentraegerstatus kritisch gemeldet.");
 if((realloc||0)>0)warnings.push("Reallocated-Sektoren vorhanden.");
 if((pending||0)>0)warnings.push("Pending-Sektoren vorhanden.");
 if((uncorrect||0)>0)warnings.push("Uncorrectable-Fehler vorhanden.");
 if(temp!=null&&temp>=55)warnings.push("Temperatur hoch.");
 if(wear!=null&&wear>=80)warnings.push("SSD-Verschleisswert auffaellig.");
 let level=warnings.length?"yellow":status==="unbekannt"?"gray":"green";
 return {fileName:name,ts:Date.now(),status,temperature:temp,reallocated:realloc,pending,uncorrectable:uncorrect,wear,level,warnings,rawSize:raw.length};
}
function renderRouterImportState(){
 if(!$("routerImportState"))return;
 let x=S.routerImport;
 if(!x){$("routerImportState").innerHTML=`<div class="finding gray"><b>Noch keine Routerdatei importiert.</b><p>FRITZ!Box, Vodafone Station, Speedport oder andere Router koennen ueber gespeicherte Diagnose-/Statusdateien ausgewertet werden. Direkter Routerzugriff im Browser bleibt aus Sicherheitsgruenden begrenzt.</p></div>`;return}
 $("routerImportState").innerHTML=`<div class="finding ${x.level}"><b>${x.model||x.kind}</b><br>${x.summary}<br><small>${x.fileName} - ${new Date(x.ts).toLocaleString("de-DE")}</small></div><div class="mini-grid">${miniStat("Typ",x.kind,"erkannter Routertyp","blue")}${miniStat("DOCSIS",x.docsisDetected?"erkannt":"nicht erkannt",x.docsisDetected?"Kabelwerte koennen bewertet werden":"DSL/Fiber/WAN-Profil ohne DOCSIS","blue")}${miniStat("Nicht korr.",x.uncorr??"-","DOCSIS-Fehlerzaehler",x.uncorr>0?"yellow":"green")}${miniStat("SNR/MSE",x.snr??"-","Signalqualitaet aus Import",x.snr!=null&&x.snr<30?"yellow":"green")}</div>${x.warnings.length?x.warnings.map(w=>`<div class="finding yellow">${w}</div>`).join(""):`<div class="finding green">Keine harten Router-/DOCSIS-Warnungen im Importtext erkannt.</div>`}`;
}
function routerDetection(){
 const d=S.latest.snapshot||{},p=profile(),imp=S.routerImport,diag=S.fritzdiag;
 const host=(S.settings.host||p.defaultHost||"").trim();
 let score=10,model=p.name||"Unbekannter Router",kind=p.access||"unbekannt",notes=[];
 if(host){score+=10;notes.push("Gepruefte Routeradresse: "+host)}
 if(p.id!=="custom-router"){score+=20;notes.push("Eingestelltes Routerprofil: "+p.name)}
 if(d.router?.ok){score+=30;notes.push("Router im lokalen Netz erreichbar"+(d.router.avgMs!=null?" ("+n(d.router.avgMs)+" ms)":""));}
 else notes.push("Routeradresse antwortet derzeit nicht; Erkennung wird mit Profil und Importdaten fortgesetzt.");
 if(imp){score+=30;model=imp.model||model;kind=imp.kind||kind;notes.push("Routerdatei erkannt: "+imp.kind)}
 if(diag){score+=25;model=model.includes("FRITZ")?model:"FRITZ!Box / "+model;notes.push("FRITZ!Box-Funktionsdiagnose importiert")}
 const h=host.toLowerCase();
 if(h==="fritz.box"||h.includes("fritz")){model=model.includes("FRITZ")?model:"FRITZ!Box";score+=10;notes.push("FRITZ!Box-Adresse erkannt.")}
 else if(h.includes("speedport")){model="Speedport / "+model;score+=8;notes.push("Speedport-Adresse erkannt.")}
 else if(h.includes("vodafone")){model="Vodafone Router / "+model;score+=8;notes.push("Vodafone-Routeradresse erkannt.")}
 if(p.docsis||imp?.docsisDetected)notes.push("Kabel/DOCSIS-Felder relevant."); else notes.push("Keine DOCSIS-Pflichtfelder fuer dieses Profil.");
 score=Math.min(100,score);
 const level=d.router?.ok||imp||diag?(score>=70?"green":"yellow"):(score>=45?"yellow":"gray");
 if(!d.router?.ok&&!imp&&!diag)notes.push("Hinweis: Unbekannte Router werden nicht als Programmfehler behandelt. Routeradresse und lokaler Pruefdienst pruefen.");
 return {ts:Date.now(),score,model,kind,host,reachable:!!d.router?.ok,level,notes};
}
function renderRouterDetectState(){
 if(!$("routerDetectState"))return;
 let x=S.routerDetect;
 if(!x){$("routerDetectState").innerHTML=`<div class="finding gray"><b>Router noch nicht erkannt.</b><p>Nutze 'Router erkennen'. Der Assistent bewertet lokale Messwerte, Profil und importierte Dateien.</p></div>`;return}
 $("routerDetectState").innerHTML=`<div class="finding ${x.level}"><b>Router-Erkennung: ${x.model}</b><br>Trefferqualitaet ${x.score} % - ${x.kind}<br><small>${new Date(x.ts).toLocaleString("de-DE")}</small></div>${x.notes.map(n=>`<div class="finding blue">${n}</div>`).join("")}`;
}
function showRouterDetectPanel(stage,x=null){
 const panel=$("routerDetectPanel");if(!panel)return;
 panel.hidden=false;
 const msg=$("routerDetectMsg"),fill=$("routerDetectFill"),res=$("routerDetectResult");
 if(stage==="running"){
  msg.textContent="Router wird erkannt: Profil, Routeradresse, Live-Messung und importierte Dateien werden abgeglichen ...";
  fill.style.width="18%";
  res.innerHTML=`<div class="result-line">Start: ${new Date().toLocaleTimeString("de-DE")}</div>`;
  setTimeout(()=>{if(!panel.hidden)fill.style.width="52%"},220);
  setTimeout(()=>{if(!panel.hidden)fill.style.width="82%"},520);
  return;
 }
 if(stage==="done"&&x){
  msg.textContent="Router-Erkennung abgeschlossen.";
  fill.style.width="100%";
  const cls=x.level==="green"?"good":"warn";
  res.innerHTML=`<div class="result-line ${cls}"><b>${x.model}</b><br>Trefferqualitaet ${x.score} % - ${x.kind}</div>${x.notes.map(n=>`<div class="result-line">${n}</div>`).join("")}`;
 }
}
let routerDetectRun=null;
function finishRouterDetectPanel(stage,x=null,message=""){
 if(routerDetectRun?.progressTimer)clearInterval(routerDetectRun.progressTimer);
 if(routerDetectRun?.timeoutTimer)clearTimeout(routerDetectRun.timeoutTimer);
 routerDetectRun=null;
 const panel=$("routerDetectPanel"),fill=$("routerDetectFill"),msg=$("routerDetectMsg"),res=$("routerDetectResult");
 if(!panel)return;
 panel.hidden=false;
 if(stage==="done"&&x){
  msg.textContent="Router-Erkennung abgeschlossen.";
  fill.style.width="100%";
  const cls=x.level==="green"?"good":"warn";
  const notRecognized=!x.reachable&&!S.routerImport&&!S.fritzdiag;
  res.innerHTML=notRecognized
   ? `<div class="result-line warn"><b>Router wurde nicht erkannt, bitte Details selber eingeben.</b><br>Oeffne Einstellungen &gt; Routerprofile und trage Routertyp sowie Router-Adresse ein.</div><div class="result-line"><button class="btn" type="button" id="routerManualFromResult">Details selbst eingeben</button></div>`
   : `<div class="result-line ${cls}"><b>${x.model}</b><br>Trefferqualitaet ${x.score} % - ${x.kind}</div>${x.notes.map(n=>`<div class="result-line">${n}</div>`).join("")}<div class="result-line good">Vorgang beendet. Der Ladebalken wird nicht weiter ausgefuehrt.</div>`;
  if(notRecognized)setTimeout(()=>{$("routerManualFromResult")?.addEventListener("click",()=>{$("routerDetectPanel").hidden=true;document.querySelector('[data-page="settings"]')?.click();setTimeout(()=>document.querySelector('[data-settings-panel="routerProfiles"]')?.click(),50)})},0);
 }else{
  msg.textContent="Router-Erkennung beendet.";
  fill.style.width="100%";
  res.innerHTML=`<div class="result-line warn"><b>Erkennung konnte nicht vollstaendig abgeschlossen werden.</b><br>${message||"Unbekannter Fehler"}</div><div class="result-line">Bitte Routeradresse, Pruefdienst und importierte Routerdaten kontrollieren.</div>`;
 }
 document.querySelectorAll('[data-action="detectRouter"],#detectRouter,#detectRouterHome').forEach(b=>b.disabled=false);
}
function runRouterDetect(){
 if(routerDetectRun)return;
 showRouterDetectPanel("running");
 document.querySelectorAll('[data-action="detectRouter"],#detectRouter,#detectRouterHome').forEach(b=>b.disabled=true);
 const fill=$("routerDetectFill");
 let progress=18;
 const progressTimer=setInterval(()=>{
  progress=Math.min(94,progress+(progress<55?7:progress<80?4:1));
  if(fill)fill.style.width=progress+"%";
 },140);
 const timeoutTimer=setTimeout(()=>{
  if(!routerDetectRun)return;
  finishRouterDetectPanel("error",null,"Zeitueberschreitung nach 12 Sekunden. Der Vorgang wurde sicher beendet.");
 },12000);
 routerDetectRun={progressTimer,timeoutTimer};
 setTimeout(()=>{
  try{
   const result=routerDetection();
   S.routerDetect=result;
   event(result.level==="green"?"blue":"yellow","Router-Erkennung ausgefuehrt: "+result.model,"router-detect");
   save();
   finishRouterDetectPanel("done",result);
   try{render()}catch(renderError){console.error("Darstellungsfehler nach Router-Erkennung",renderError)}
  }catch(error){
   console.error("Router-Erkennung fehlgeschlagen",error);
   finishRouterDetectPanel("error",null,error?.message||String(error));
  }
 },900);
}
function startAssistant(){
 S.assistant={active:true,step:0};
 event("blue","Gefuehrter Assistent gestartet","assistant");
 render();
 const card=document.querySelector(".ai-assistant");
 if(card){card.classList.add("assistant-running");card.scrollIntoView({behavior:"smooth",block:"center"});setTimeout(()=>card.classList.remove("assistant-running"),2200)}
}
function runAction(action){
 if(action==="detectRouter")return runRouterDetect();
 if(action==="openRouter")return window.open("http://"+(S.settings.host||profile().defaultHost||"fritz.box"),"_blank");
 if(action==="importRouter")return $("routerFile")?.click();
 if(action==="importDiag")return $("diagFile")?.click();
 if(action==="importSmart")return $("smartFile")?.click();
 if(action==="exportReport")return exportReport();
 if(action==="startAssistant")return startAssistant();
}
function renderSmartState(){
 if(!$("smartState"))return;
 let x=S.smart;
 if(!x){$("smartState").innerHTML=`<div class="finding gray"><b>Noch kein SMART-/PC-Bericht importiert.</b><p>SMART-Werte kommen spaeter aus dem lokalen Pruefdienst oder aus Exporten von Windows, CrystalDiskInfo, Hersteller-Tools oder PowerShell.</p></div>`;return}
 $("smartState").innerHTML=`<div class="finding ${x.level}"><b>SMART-/PC-Bericht: ${x.status}</b><br><small>${x.fileName} - ${new Date(x.ts).toLocaleString("de-DE")}</small></div><div class="mini-grid">${miniStat("Temperatur",x.temperature??"-","Grad Celsius",x.temperature>=55?"yellow":"green")}${miniStat("Reallocated",x.reallocated??"-","ersetzte Sektoren",x.reallocated>0?"yellow":"green")}${miniStat("Pending",x.pending??"-","ausstehende Sektoren",x.pending>0?"yellow":"green")}${miniStat("Uncorrectable",x.uncorrectable??"-","nicht korrigierbare Medienfehler",x.uncorrectable>0?"yellow":"green")}</div>${x.warnings.length?x.warnings.map(w=>`<div class="finding yellow">${w}</div>`).join(""):`<div class="finding green">Keine SMART-Warnungen im Importtext erkannt.</div>`}`;
}
function miniStat(title,value,explain,l="green"){return `<div class="mini-stat ${l}"><b>${title}</b><strong>${value}</strong><span>${explain}</span></div>`}
function redrawGauges(){
 if(S.settings.master===false){
  gauge("gRouter",0,100,"0 ms","gray");
  gauge("gInternet",0,300,"0 ms","gray");
  gauge("gPcHealth",0,100,"0 %","gray");
  gauge("gStorage",0,100,"0 %","gray");
  gauge("gLoss",0,10,"0,0 %","gray");
  return;
 }
 let d=S.latest.snapshot||{},r=d.router||{},cf=d.targets?.cloudflare||{},q=d.quality||{},sys=d.system||{},health=pcHealth(sys,d);
 gauge("gRouter",testOn("router")?r.avgMs:null,100,testOn("router")&&r.ok?n(r.avgMs)+" ms":"0 ms",testOn("router")?domainLevel("router",d,"gauge"):"gray");
 gauge("gInternet",testOn("multiPing")?cf.avgMs:null,300,testOn("multiPing")&&cf.ok?n(cf.avgMs)+" ms":"0 ms",testOn("multiPing")?domainLevel("internet",d,"gauge"):"gray");
 gauge("gPcHealth",testOn("system")?100-health.score:null,100,testOn("system")?health.score+" %":"0 %",testOn("system")?domainLevel("pc",d,"gauge"):"gray");
 gauge("gStorage",testOn("system")?sys.diskPct:null,100,testOn("system")&&sys.diskPct!=null?n(sys.diskPct)+" %":"0 %",testOn("system")?domainLevel("pc",d,"gauge"):"gray");
 gauge("gLoss",testOn("loss")?Math.max(q.lossPct||0,(q.p95JitterMs||0)/10):null,10,testOn("loss")&&q.lossPct!=null?n(q.lossPct,1)+" %":"0,0 %",testOn("loss")?domainLevel("quality",d,"gauge"):"gray");
}

async function poll(){if(S.settings.master===false){renderLive();return;}cycle.running=true;cycle.phase=S.deep?"Tiefenanalyse: Messpunkte werden dicht geprueft":"FRITZ!Box, Internet, DNS und PC werden geprueft";renderLive();
setOperation(0,"running","FRITZ!Box wird angesprochen ...");
let seqTimers=[
 setTimeout(()=>setOperation(1,"running","Mehrere Internetziele werden parallel verglichen ..."),700),
 setTimeout(()=>setOperation(2,"running","IPv4 und IPv6 werden getrennt geprueft ..."),1400),
 setTimeout(()=>setOperation(3,"running","DNS-Antwortzeiten werden gemessen ..."),2100),
 setTimeout(()=>setOperation(4,"running","Paketverlust und Laufzeitschwankung werden berechnet ..."),2800),
 setTimeout(()=>setOperation(5,"running","CPU, RAM und Datentraeger werden geprueft ..."),3500)
];
let d=await api(S.deep?"/deep":"/status");seqTimers.forEach(clearTimeout);addSample("snapshot",d);if(d.quality&&testOn("loss"))addSample("quality",{ok:d.ok,...d.quality});if(d.router&&testOn("router"))addSample("router",d.router);if(testOn("multiPing"))Object.entries(d.targets||{}).forEach(([k,v])=>addSample("target:"+k,v));if(d.ok&&testOn("router")&&testOn("multiPing")&&d.router?.ok&&d.targets&&Object.values(d.targets).filter(x=>x.ok).length===0)event("red","FRITZ!Box erreichbar, mehrere Internetziele gleichzeitig ausgefallen","internet");if(testOn("loss")&&(d.quality?.lossPct||0)>=5)event("red","Deutlicher Paketverlust: "+d.quality.lossPct+" %","quality");if(testOn("loss")&&(d.quality?.p95JitterMs||0)>=50)event("yellow","Hohe Laufzeitschwankung P95: "+d.quality.p95JitterMs+" ms","quality");setOperation(6,"running","Messwerte werden zur Ursachenbewertung zusammengefuehrt ...");
setTimeout(()=>{operationState.result=d.ok?"Messzyklus erfolgreich abgeschlossen":"Pruefdienst nicht erreichbar";setOperation(6,"done",operationState.result);renderOperation()},450);
cycle.running=false;cycle.last=Date.now();cycle.count++;cycle.left=cycle.seconds;cycle.phase="Messzyklus abgeschlossen - Ergebnisse werden angezeigt";renderLive();render()}
async function deep(){
 if(S.deep||S.settings.master===false)return;
 S.deep=true;S.stage=3;S.deepUntil=Date.now()+(S.settings.deepSeconds||60)*1000;
 event("blue",(S.settings.deepSeconds||60)+"-Sekunden-Tiefenanalyse gestartet","system");
 render();renderDeepProgress();await api("/trigger-deep",{method:"POST"});
 if(deepTimer)clearTimeout(deepTimer);
 deepTimer=setTimeout(()=>{S.deep=false;S.stage=1;S.deepUntil=null;event("blue","Tiefenanalyse beendet","system");render();renderDeepProgress()},(S.settings.deepSeconds||60)*1000)
}
function openWindow(title,body){let w=document.createElement("div");w.className="window";w.style.left=(90+Math.random()*180)+"px";w.style.top=(50+Math.random()*100)+"px";w.innerHTML=`<div class="window-head"><b>${title}</b><div class="window-controls"><button data-min>-</button><button data-max>[]</button><button class="close" data-close>x</button></div></div><div class="window-body">${body}</div>`;$("windowLayer").appendChild(w);let h=w.querySelector(".window-head"),drag=false,ox=0,oy=0;h.onmousedown=e=>{if(e.target.tagName==="BUTTON")return;drag=true;ox=e.clientX-w.offsetLeft;oy=e.clientY-w.offsetTop};document.addEventListener("mousemove",e=>{if(drag&&!w.classList.contains("max")){w.style.left=e.clientX-ox+"px";w.style.top=e.clientY-oy+"px"}});document.addEventListener("mouseup",()=>drag=false);w.querySelector("[data-close]").onclick=()=>w.remove();w.querySelector("[data-min]").onclick=()=>w.classList.toggle("min");w.querySelector("[data-max]").onclick=()=>w.classList.toggle("max");h.ondblclick=()=>w.classList.toggle("max")}
function attachInfoCards(){
 let card=document.createElement("div");card.className="info-card";document.body.appendChild(card);
 function show(el,e){if(S.settings.hints===false||S.settings.infoCards!==true)return;if(document.querySelector(".window:not(.min),.router-detect-panel:not([hidden])"))return hide();let t=el.dataset.info||el.title;if(!t)return;card.textContent=t;card.classList.add("show");let r=card.getBoundingClientRect(),x=(e.clientX||20)+14,y=(e.clientY||20)+14;card.style.left=Math.max(8,Math.min(innerWidth-Math.max(330,r.width+8),x))+"px";card.style.top=Math.max(8,Math.min(innerHeight-Math.max(130,r.height+8),y))+"px"}
 function hide(){card.classList.remove("show")}
 const ensureTitles=()=>document.querySelectorAll("[data-info]").forEach(el=>{if(!el.title)el.title=el.dataset.info});
 ensureTitles();setInterval(ensureTitles,2500);
 document.addEventListener("mouseover",e=>{let el=e.target.closest("[data-info]");if(el)show(el,e)});
 document.addEventListener("mousemove",e=>{let el=e.target.closest("[data-info]");if(el&&card.classList.contains("show"))show(el,e)});
 document.addEventListener("mouseout",e=>{if(e.target.closest("[data-info]"))hide()});
 document.addEventListener("click",e=>{if(e.target.closest(".window,.router-detect-panel"))return hide();let el=e.target.closest("[data-info]");if(el){show(el,e);setTimeout(hide,4500)}else hide()});
}
function exportReport(){let report={product:"Netzwerk-Leitstand V5.4.2",frameworkBasis:"Framework Studio V1.38.22",exportedAt:new Date().toISOString(),assessment:analyze(S.latest.snapshot||{}),settings:S.settings,devices:S.devices,fritzdiag:S.fritzdiag,routerImport:S.routerImport,routerDetect:S.routerDetect,smart:S.smart,docsis:S.docsis,events:S.events,samples:S.samples};let b=new Blob([JSON.stringify(report,null,2)],{type:"application/json"}),u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download="Netzwerk_Leitstand_V4_Bericht_"+new Date().toISOString().replaceAll(":","-")+".json";a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)}
$("markIncident").onclick=()=>{let t=prompt("Was haengt gerade?","Fernseher / Fire TV / Internet / ChatGPT");if(t){event("blue","MANUELLE STOERUNG: "+t,"manual");if(S.settings.markDeep!==false)deep();render()}};$("deepNow").onclick=deep;$("openFritz").onclick=()=>window.open("http://fritz.box","_blank");$("importDiag").onclick=()=>$("diagFile").click();$("diagFile").onchange=async e=>{let f=e.target.files?.[0];if(f){S.fritzdiag=parseDiag(await f.text(),f.name);event(S.fritzdiag.meshError?"red":"blue","FRITZ!Box-Funktionsdiagnose importiert","fritz");render()}e.target.value=""};$("saveDocsis").onclick=()=>{S.docsis.push({ts:Date.now(),uncorr:+$("uncorr").value||0,corr:+$("corr").value||0,down:$("down").value===""?null:+$("down").value,up:$("up").value===""?null:+$("up").value});event("blue","DOCSIS-Schnappschuss gespeichert","docsis");render()};$("exportBtn").onclick=$("reportExport").onclick=exportReport;$("measureFilter").oninput=$("measureType").onchange=$("eventFilter").oninput=renderTables;
if($("detectRouter"))$("detectRouter").onclick=runRouterDetect;
if($("detectRouterHome"))$("detectRouterHome").onclick=runRouterDetect;
if($("routerDetectClose"))$("routerDetectClose").onclick=()=>{$("routerDetectPanel").hidden=true};
if($("importRouterFile"))$("importRouterFile").onclick=()=>$("routerFile").click();
if($("routerFile"))$("routerFile").onchange=async e=>{let f=e.target.files?.[0];if(f){S.routerImport=parseRouterFile(await f.text(),f.name);if(S.routerImport.docsisDetected&&S.routerImport.uncorr!=null)S.docsis.push({ts:Date.now(),uncorr:S.routerImport.uncorr||0,corr:S.routerImport.corr||0,down:S.routerImport.down,up:S.routerImport.up,source:"router-import"});event(S.routerImport.level==="yellow"?"yellow":"blue","Routerdatei importiert: "+S.routerImport.kind,"router-import");render()}e.target.value=""};
if($("importSmartFile"))$("importSmartFile").onclick=()=>$("smartFile").click();
if($("smartFile"))$("smartFile").onchange=async e=>{let f=e.target.files?.[0];if(f){S.smart=parseSmartFile(await f.text(),f.name);event(S.smart.level==="yellow"?"yellow":"blue","SMART-/PC-Bericht importiert","smart");render()}e.target.value=""};

$("expandAll").onclick=()=>setAllSections(false);
$("collapseAll").onclick=()=>setAllSections(true);
if($("toggleAllSections"))$("toggleAllSections").onclick=()=>{let anyOpen=[...document.querySelectorAll(".page.active .foldable")].some(x=>!x.classList.contains("collapsed"));setAllSections(anyOpen);$("toggleAllSections").textContent=anyOpen?"A":"V"};
$("lockSections").onclick=()=>{S.settings.sectionsLocked=!S.settings.sectionsLocked;save();updateSectionLock()};
if($("assistantStart"))$("assistantStart").onclick=startAssistant;
if($("assistantStartTop"))$("assistantStartTop").onclick=startAssistant;
if($("assistantPrev"))$("assistantPrev").onclick=()=>{if(S.assistant?.active){S.assistant.step=Math.max(0,S.assistant.step-1);render()}};
if($("assistantNext"))$("assistantNext").onclick=()=>{if(S.assistant?.active){S.assistant.step++;render()}};
document.querySelectorAll(".nav-group-toggle").forEach(btn=>btn.onclick=e=>{e.stopPropagation();btn.closest(".nav-group")?.classList.toggle("closed")});
document.querySelectorAll(".settings-tab").forEach(b=>b.onclick=()=>showSettingsPanel(b.dataset.settingsPanel));
document.addEventListener("click",e=>{let b=e.target.closest("[data-settings-tab]");if(b)setTimeout(()=>showSettingsPanel(b.dataset.settingsTab),0)});
if($("officeModeBtn"))$("officeModeBtn").addEventListener("click",()=>{if($("officeModeBtn").classList.contains("active"))showOffice();else{S.settings.officeMode=false;save();leaveOffice();$("backToOffice").hidden=true}});
if($("backToOffice"))$("backToOffice").onclick=showOffice;
if($("officeChairExit"))$("officeChairExit").onclick=()=>{S.settings.officeMode=false;save();leaveOffice();$("officeModeBtn")?.classList.remove("active");if($("officeModeBtn"))$("officeModeBtn").textContent=$("officeModeBtn").dataset.labelOff||"Büromodus starten";if($("backToOffice"))$("backToOffice").hidden=true};
document.querySelectorAll("[data-office-command]").forEach(el=>{
 el.addEventListener("click",()=>officeCommand(el.dataset.officeCommand));
 el.addEventListener("mouseenter",()=>{
   el.classList.add("office-active");
   const note=$("officeLiveNote"); if(note) note.textContent=el.dataset.label||"Aktion bereit";
   if(el.dataset.officeCommand==="console") document.querySelector(".office-console-actions")?.classList.add("office-visible");
 });
 el.addEventListener("mouseleave",()=>{
   el.classList.remove("office-active");
   if(el.dataset.officeCommand==="console") setTimeout(()=>{
     const actions=document.querySelector(".office-console-actions");
     if(actions && !actions.matches(":hover") && !actions.matches(":focus-within")) actions.classList.remove("office-visible");
   },120);
 });
 el.addEventListener("focus",()=>{el.classList.add("office-active"); if(el.dataset.officeCommand==="console") document.querySelector(".office-console-actions")?.classList.add("office-visible")});
 el.addEventListener("blur",()=>{el.classList.remove("office-active")});
});
const officeActions=document.querySelector(".office-console-actions");
if(officeActions){
 officeActions.addEventListener("mouseenter",()=>officeActions.classList.add("office-visible"));
 officeActions.addEventListener("mouseleave",()=>officeActions.classList.remove("office-visible"));
}
document.querySelectorAll("[data-office-action]").forEach(button=>button.addEventListener("click",event=>{
 event.stopPropagation();
 const action=button.dataset.officeAction;
 const note=$("officeLiveNote");
 const say=text=>{if(note)note.textContent=text};
 if(action==="start-all"){
  if($("masterSwitch")){ $("masterSwitch").checked=true; $("masterSwitch").onchange(); }
  say("Alle Messungen gestartet");
 }else if(action==="stop-all"){
  if($("masterSwitch")){ $("masterSwitch").checked=false; $("masterSwitch").onchange(); }
  say("Alle Messungen gestoppt · Anzeigen auf 0");
 }else if(action==="deep"){
  if(S.settings.master===false){say("Tiefenanalyse nicht möglich · zuerst Messungen starten");return;}
  deep();say("Tiefenanalyse gestartet");
 }else if(action==="report"){exportReport();say("Bericht erzeugt");}
}));
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("officeOverlay")?.hidden)$("officeChairExit")?.click()});

$("setModel").onchange=()=>{S.settings.model=$("setModel").value;let p=profile();$("setAccess").value=p.access;$("setHost").value=p.defaultHost;S.settings.host=p.defaultHost;renderSettings()};
if($("suggestRouterProfile"))$("suggestRouterProfile").onclick=()=>{
 let name=($("setCustomModel")?.value||"").toLowerCase(),id=name.includes("speedport")?"speedport-smart4":name.includes("vodafone")?"vodafone-station":name.includes("easybox")?"easybox-805":name.includes("tp-link")||name.includes("deco")?"tp-link-archer":"custom-router";
 S.settings.model=id;S.settings.customModel=$("setCustomModel")?.value||"";let p=profile();S.settings.host=p.defaultHost;$("setModel").value=id;event("blue","Routerprofil lokal abgeleitet: "+p.name,"settings");renderSettings();save();
};
$("saveSettings").onclick=()=>readSettings({log:true});
$("resetSettings").onclick=()=>{if(confirm("Alle Bedien- und Messeinstellungen auf Standard zuruecksetzen?")){S.settings={...S.settings,model:"6690-cable",host:"fritz.box",interval:15,deepSeconds:60,autoDeep:true,persist:true,density:"normal",animations:true,infoCards:false,sectionDefault:"remember",hints:true,rows:1000,scrollbars:true,markDeep:true,sectionsLocked:false,expertMode:false,retentionDays:30,historyLimit:12000,alertSound:false,alertLevel:"red",alertVolume:60,alertBeeps:3,alertRepeat:60,alertMaxRepeats:3,brainEnabled:true,audioEnabled:true,audioVolume:55,audioActiveChannel:"",officeMode:false,uiFixVersion:"5.4.2"};save();applySettings();applySectionDefault();leaveOffice();render()}};

let pollTimer=null;
function restartPollTimer(){
 if(pollTimer) clearInterval(pollTimer);
 pollTimer=setInterval(poll,Math.max(5,Number(S.settings.interval)||15)*1000);
}
if($("monitorClock"))$("monitorClock").textContent=new Date().toLocaleTimeString("de-DE");
setInterval(redrawGauges,1200);
setInterval(chart,1000);
initNav();initDiagnosticTabs();bindAlertHistory();enhanceFoldables();attachInstrumentSwitches();attachInfoCards();bindSettingsControls();applySettings();renderAudioSettings();renderOperation();renderLag();drawEKG();load().then(()=>{configureAudioCore();render();poll();restartPollTimer()});





































