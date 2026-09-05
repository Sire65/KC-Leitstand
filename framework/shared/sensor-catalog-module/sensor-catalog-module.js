(function(){
  "use strict";
  const VERSION="0.1.0",MODE="CATALOG_ONLY_DISABLED",LIMIT=100,SCOPE="sensor-catalog",ASSIGNMENTS_KEY="assignments-v1",$=id=>document.getElementById(id);
  const esc=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch]));
  const FAMILIES=Object.freeze([
    {id:"internet",title:"Internet & Provider",count:260,load:"low",execution:"cyclic",interval:30,organ:"circulation",metrics:["reachability","latency","loss","jitter","tls","route"]},
    {id:"router",title:"Router & DOCSIS",count:160,load:"low",execution:"cyclic",interval:30,organ:"circulation",metrics:["wan","uptime","channel","errors","dhcp","nat"]},
    {id:"wifi",title:"WLAN & Mesh",count:140,load:"low",execution:"event",interval:60,organ:"respiration",metrics:["signal","channel","roaming","noise","mesh","client"]},
    {id:"pc",title:"PC & System",count:160,load:"low",execution:"cyclic",interval:30,organ:"muscles",metrics:["cpu","ram","disk","temperature","service","smart"]},
    {id:"devices",title:"Geräte",count:120,load:"none",execution:"manual",interval:300,organ:"senses",metrics:["presence","status","queue","storage","battery","firmware"]},
    {id:"quality",title:"Qualität",count:220,load:"medium",execution:"event",interval:60,organ:"circulation",metrics:["loss","jitter","bufferbloat","throughput","stability","correlation"]},
    {id:"protocol",title:"Protokoll & Analyse",count:140,load:"none",execution:"event",interval:300,organ:"memory",metrics:["event","trend","incident","report","baseline","verification"]}
  ]);
  const PACKAGES=Object.freeze([
    {id:"PKG.HOME.CORE",title:"Heimnetz Grundschutz",families:["internet","router","pc"],maxSensors:18,activation:"CONFIRM_REQUIRED"},
    {id:"PKG.WIFI.MESH",title:"WLAN-/Mesh-Diagnose",families:["wifi","internet"],maxSensors:16,activation:"CONFIRM_REQUIRED"},
    {id:"PKG.STREAMING",title:"Streaming-Störung",families:["quality","internet","wifi"],maxSensors:14,activation:"CONFIRM_REQUIRED"},
    {id:"PKG.CPU.THERMAL",title:"PC Temperatur & Last",families:["pc"],maxSensors:10,activation:"CONFIRM_REQUIRED"}
  ]);
  const state={query:"",family:"",load:"",execution:"",assignments:[],cache:null};
  function definitions(){
    if(state.cache)return state.cache;
    state.cache=FAMILIES.flatMap(family=>Array.from({length:family.count},(_,index)=>{
      const ordinal=index+1,metric=family.metrics[index%family.metrics.length];
      return {__id:`sensor.${family.id}.${String(ordinal).padStart(4,"0")}`,id:`sensor.${family.id}.${String(ordinal).padStart(4,"0")}`,title:`${family.title}: ${metric} ${ordinal}`,family:family.id,metric,organ:family.organ,loadClass:family.load,executionClass:family.execution,intervalSec:family.interval,enabled:false,adapterState:"UNBOUND",approval:"CATALOG_CANDIDATE",audioEnabled:false};
    }));return state.cache;
  }
  function rows(){
    let data=definitions();if(state.family)data=data.filter(row=>row.family===state.family);if(state.load)data=data.filter(row=>row.loadClass===state.load);if(state.execution)data=data.filter(row=>row.executionClass===state.execution);
    const model=window.TableCore?.create(["id","title","family","metric","organ","loadClass","executionClass","adapterState","approval"]);if(!model)return data.slice(0,LIMIT);model.replace(data);return (state.query?model.filterAny(state.query):model.snapshot()).slice(0,LIMIT);
  }
  async function assignDraft(sensorId,targetId){
    const sensor=definitions().find(row=>row.id===sensorId);if(!sensor)throw new Error("UNKNOWN_SENSOR");
    const assignment={sensorId,targetId:String(targetId||"UNASSIGNED").slice(0,120),enabled:false,adapterState:"UNBOUND",activation:"BLOCKED_UNTIL_APPROVED",updatedAt:new Date().toISOString()};
    const index=state.assignments.findIndex(item=>item.sensorId===sensorId);if(index>=0)state.assignments[index]=assignment;else state.assignments.unshift(assignment);
    await window.FrameworkSecureStorage?.set(SCOPE,ASSIGNMENTS_KEY,state.assignments);return Object.assign({},assignment);
  }
  async function restore(){const storage=window.FrameworkSecureStorage;if(!storage)return;await storage.ready();state.assignments=await storage.get(SCOPE,ASSIGNMENTS_KEY)||[];render()}
  function style(){if($("sensorCatalogStyle"))return;const sheet=document.createElement("style");sheet.id="sensorCatalogStyle";sheet.textContent=`
    .sensor-catalog[hidden]{display:none!important}.sensor-catalog{position:fixed;inset:76px 20px 22px max(84px,calc(var(--nav,260px) + 18px));z-index:12150;display:grid;grid-template-rows:auto auto auto minmax(0,1fr);overflow:hidden;border:1px solid #4e8298;border-radius:12px;background:#071923;color:#eaf8ff;box-shadow:0 22px 70px #000c}.sensor-catalog>header{display:flex;align-items:center;gap:12px;padding:12px 14px;background:#123548}.sensor-catalog>header div{flex:1}.sensor-catalog h2{margin:2px 0}.sensor-catalog small{color:#72d9ff;font-weight:900}.sensor-catalog-close{font-size:24px;background:#842b28!important;border-color:#ffaaa4!important}.sensor-catalog-families{display:flex;gap:7px;overflow:auto;padding:9px 12px;border-bottom:1px solid #31586d}.sensor-catalog-filters{display:grid;grid-template-columns:minmax(220px,1fr) 160px 180px;gap:8px;padding:9px 12px;border-bottom:1px solid #31586d}.sensor-catalog input,.sensor-catalog select{min-height:35px;padding:0 8px;border:1px solid #527286;border-radius:5px;background:#061923;color:white}.sensor-catalog button{padding:7px 10px;border:1px solid #527286;border-radius:5px;background:#123548;color:white;cursor:pointer}.sensor-catalog button.active{border-color:#36d977;background:#16412f}.sensor-catalog-body{overflow:auto;padding:10px 12px}.sensor-catalog-summary{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:9px}.sensor-catalog-summary span{padding:8px;border:1px solid #31586d;background:#0b2938;text-align:center}.sensor-catalog table{width:100%;border-collapse:collapse;background:#081d29}.sensor-catalog th{position:sticky;top:0;background:#16394c;color:#bdefff;text-align:left}.sensor-catalog th,.sensor-catalog td{padding:8px;border:1px solid #31586d;font-size:11px}.sensor-catalog-off{color:#ffd77a;font-weight:900}.sensor-package-list{display:flex;gap:7px;overflow:auto;margin-bottom:9px}.sensor-package-list button{white-space:nowrap}.sensor-catalog-note{color:#9ebac7;font-size:11px}@media(max-width:800px){.sensor-catalog{inset:62px 6px 8px}.sensor-catalog-filters{grid-template-columns:1fr}.sensor-catalog-summary{grid-template-columns:1fr 1fr}.sensor-catalog table{min-width:950px}}
  `;document.head.appendChild(sheet)}
  function ensureButton(){const host=document.querySelector(".dashboard-inline-controls");if(!host||$("sensorCatalogOpen"))return;const button=document.createElement("button");button.id="sensorCatalogOpen";button.type="button";button.className="btn secondary";button.textContent="Sensorkatalog 1200";button.title="Definitionen und Pakete; alle Sensoren standardmäßig deaktiviert.";host.insertBefore(button,host.querySelector(".section-global-tools")||null);button.onclick=open}
  function ensurePanel(){
    if($("sensorCatalogPanel"))return $("sensorCatalogPanel");const panel=document.createElement("section");panel.id="sensorCatalogPanel";panel.className="sensor-catalog";panel.hidden=true;panel.setAttribute("role","dialog");panel.setAttribute("aria-label","Sensorkatalog");
    panel.innerHTML='<header><div><small>TABLECORE · LAZY CATALOG</small><h2>Skalierbarer Sensorkatalog</h2></div><span class="sensor-catalog-off">1.200 DEAKTIVIERT</span><button class="sensor-catalog-close" aria-label="Sensorkatalog schließen">×</button></header><nav class="sensor-catalog-families"></nav><section class="sensor-catalog-filters"><input type="search" placeholder="Sensor, ID, Messwert oder Organ suchen"><select data-filter="load"><option value="">Alle Lastklassen</option><option value="none">Keine Messlast</option><option value="low">Niedrig</option><option value="medium">Mittel</option><option value="high">Hoch</option></select><select data-filter="execution"><option value="">Alle Ausführungsklassen</option><option value="cyclic">Zyklisch</option><option value="event">Ereignisbezogen</option><option value="manual">Manuell</option></select></section><main class="sensor-catalog-body"><div class="sensor-catalog-summary"></div><div class="sensor-package-list"></div><div class="sensor-catalog-result"></div></main>';
    document.body.appendChild(panel);panel.querySelector(".sensor-catalog-close").onclick=close;panel.querySelector("input").oninput=event=>{state.query=event.target.value;renderTable()};panel.querySelector('[data-filter="load"]').onchange=event=>{state.load=event.target.value;renderTable()};panel.querySelector('[data-filter="execution"]').onchange=event=>{state.execution=event.target.value;renderTable()};return panel;
  }
  function render(){
    const panel=ensurePanel(),familyHost=panel.querySelector(".sensor-catalog-families");familyHost.innerHTML=`<button data-family="" class="${state.family?"":"active"}">Alle 1.200</button>`+FAMILIES.map(family=>`<button data-family="${esc(family.id)}" class="${state.family===family.id?"active":""}">${esc(family.title)} · ${family.count}</button>`).join("");familyHost.querySelectorAll("[data-family]").forEach(button=>button.onclick=()=>{state.family=button.dataset.family;render()});
    panel.querySelector(".sensor-catalog-summary").innerHTML=`<span><b>1.200</b><br>Definitionen</span><span><b>0</b><br>automatisch aktiviert</span><span><b>${state.assignments.length}</b><br>Zuordnungsentwürfe</span><span><b>100</b><br>maximal sichtbar</span>`;
    panel.querySelector(".sensor-package-list").innerHTML=PACKAGES.map(pkg=>`<button type="button" title="Nur Paketvorlage; keine Aktivierung">${esc(pkg.title)} · max. ${pkg.maxSensors}</button>`).join("");renderTable();
  }
  function renderTable(){const host=document.querySelector(".sensor-catalog-result");if(!host)return;const data=rows();host.innerHTML=`<p class="sensor-catalog-note">${data.length} sichtbare Ergebnisse · Katalog wird nur bei geöffneter Seite aufgebaut · Pakete aktivieren nichts.</p><table><thead><tr><th>Sensor</th><th>Familie</th><th>Messwert</th><th>Organ</th><th>Last</th><th>Ausführung</th><th>Adapter</th><th>Aktiv</th></tr></thead><tbody>${data.map(row=>`<tr><td><b>${esc(row.title)}</b><br><small>${esc(row.id)}</small></td><td>${esc(row.family)}</td><td>${esc(row.metric)}</td><td>${esc(row.organ)}</td><td>${esc(row.loadClass)}</td><td>${esc(row.executionClass)} / ${row.intervalSec}s</td><td>${esc(row.adapterState)}</td><td class="sensor-catalog-off">NEIN</td></tr>`).join("")}</tbody></table>`}
  function open(){const panel=ensurePanel();render();panel.hidden=false;window.FrameworkPerformanceVisibility?.setManagementOpen?.(true)}function close(){const panel=$("sensorCatalogPanel");if(panel)panel.hidden=true;window.FrameworkPerformanceVisibility?.setManagementOpen?.(false)}
  function stats(){return {definitions:definitions().length,enabled:0,assignedDrafts:state.assignments.length,families:FAMILIES.length,packages:PACKAGES.length}}
  function init(){style();ensureButton();ensurePanel();restore().catch(()=>{});window.addEventListener("leitstand:secure-storage-ready",()=>restore().catch(()=>{}),{once:true})}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
  window.FrameworkSensorCatalog={version:VERSION,mode:MODE,open,close,definitions:()=>definitions().map(row=>Object.assign({},row)),families:()=>FAMILIES.map(row=>Object.assign({},row)),packages:()=>PACKAGES.map(row=>Object.assign({},row)),assignDraft,stats};
})();
