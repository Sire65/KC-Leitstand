(function(){
  "use strict";
  const fallbackNav={
    schemaVersion:"fallback", projectId:"NL", projectIcon:"▦", defaultExpandedGroup:"leitstand", maxOpenGroups:1,
    userPanel:{displayName:"Hans",role:"Administrator",automaticLabelOff:"Auto: aus",automaticLabelOn:"Auto: an",officeStartLabel:"Büromodus starten",officeActiveLabel:"Büromodus aktiv"},
    groups:[{id:"leitstand",label:"Leitstand",items:[{id:"dashboard",label:"Dashboard",page:"dashboard",icon:"⌂"},{id:"help",label:"Hilfe",page:"help",icon:"?"}]}]
  };
  const fallbackShell={projectId:"NL",projectName:"Netzwerk-Leitstand",projectIcon:"▦",version:"5.4.2",greeting:{name:"Hans"},rightPanel:{enabled:true,defaultCollapsed:true},responsive:{tabletMaxWidth:1100,phoneMaxWidth:700}};
  const nav=window.NETZWERK_LEITSTAND_NAVIGATION||fallbackNav;
  const shell=window.NETZWERK_LEITSTAND_SHELL||fallbackShell;
  const text=(value,fallback="")=>String(value??fallback);
  const icon=(value)=>text(value,"•");
  const esc=(value)=>text(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

  function renderNavigation(){
    const host=document.getElementById("menuScroll");
    if(!host||!Array.isArray(nav.groups))return;
    host.innerHTML=nav.groups.map((group,groupIndex)=>{
      const isOpen=group.id===(nav.defaultExpandedGroup||nav.groups[0]?.id);
      const items=(group.items||[]).map((item,itemIndex)=>{
        const attrs=[`data-icon="${esc(icon(item.icon))}"`,`data-page="${esc(item.page)}"`,`data-nav-id="${esc(item.id)}"`];
        if(item.settingsPanel)attrs.push(`data-settings-tab="${esc(item.settingsPanel)}"`);
        return `<button type="button" class="nav-item${item.sub?" nav-sub":""}${groupIndex===0&&itemIndex===0?" active":""}" ${attrs.join(" ")}><span class="shell-nav-icon" aria-hidden="true">${esc(icon(item.icon))}</span><span class="shell-nav-label">${esc(item.label)}</span></button>`;
      }).join("");
      return `<section class="nav-group${isOpen?"":" closed"} ${esc(group.cssClass||"")}" data-nav-group="${esc(group.id)}"><button class="nav-parent nav-group-toggle" type="button" aria-expanded="${String(isOpen)}"><span class="group-plus">${isOpen?"−":"+"}</span><b>${esc(group.label)}</b><i aria-hidden="true">${isOpen?"▾":"▸"}</i></button>${items}</section>`;
    }).join("");
    host.dataset.runtime="FrameworkShell";
    host.dataset.schemaVersion=text(nav.schemaVersion,"unknown");
  }

  function configureIdentity(){
    document.querySelector(".user-name")?.replaceChildren(document.createTextNode(nav.userPanel?.displayName||"Hans"));
    document.querySelector(".user-role")?.replaceChildren(document.createTextNode(nav.userPanel?.role||"Benutzer"));
    const auto=document.getElementById("autoModeBtn");
    if(auto){auto.textContent=nav.userPanel?.automaticLabelOff||"Auto: aus";auto.dataset.labelOff=nav.userPanel?.automaticLabelOff||"Auto: aus";auto.dataset.labelOn=nav.userPanel?.automaticLabelOn||"Auto: an";}
    const office=document.getElementById("officeModeBtn");
    if(office){office.textContent=nav.userPanel?.officeStartLabel||"Büromodus starten";office.dataset.labelOff=nav.userPanel?.officeStartLabel||"Büromodus starten";office.dataset.labelOn=nav.userPanel?.officeActiveLabel||"Büromodus aktiv";}
    const subtitle=document.querySelector(".top small");
    if(subtitle)subtitle.textContent=`${shell.projectName} V${shell.version} · Framework Shell Referenz${shell.candidate?" · Candidate":""}`;
    document.title=`${shell.projectName} V${shell.version}${shell.candidate?" - Candidate":""}`;
  }

  function buildHeader(){
    const header=document.querySelector(".top");
    const title=document.getElementById("pageTitle")?.parentElement;
    if(!header||!title)return;
    title.classList.add("shell-greeting");
    if(!title.querySelector(".shell-greeting-line")){
      const greeting=document.createElement("div");greeting.className="shell-greeting-line";
      const hour=new Date().getHours();const word=hour<11?"Guten Morgen":hour<18?"Guten Tag":"Guten Abend";
      greeting.innerHTML=`<span class="shell-project-icon" aria-hidden="true">${esc(shell.projectIcon||nav.projectIcon)}</span><span><b>${word}, ${esc(shell.greeting?.name||"Hans")}</b><small>${esc(shell.projectName)}</small></span>`;
      title.prepend(greeting);
    }
    const tools=document.querySelector(".top-right");
    if(!tools)return;
    const definitions=[
      ["shellSearch","⌕","Globale Suche"],
      ["shellAi","KI","KI-Diagnose und Empfehlungen"],
      ["shellNotifications","🔔","Benachrichtigungen"],
      ["smartPanelToggle","▤","Pinnwand / SmartPanel"]
    ];
    definitions.reverse().forEach(([id,label,tip])=>{
      if(document.getElementById(id))return;
      const button=document.createElement("button");button.type="button";button.className="iconbtn shell-header-tool";button.id=id;button.title=tip;button.setAttribute("aria-label",tip);button.textContent=label;tools.prepend(button);
    });
    const oldClock=document.getElementById("clock");
    if(oldClock){oldClock.classList.add("shell-digital-clock");oldClock.setAttribute("aria-label","Datum und Uhrzeit");}
  }

  function buildSmartPanel(){
    if(!shell.rightPanel?.enabled||document.getElementById("shellSmartPanel"))return;
    const panel=document.createElement("aside");panel.id="shellSmartPanel";panel.className=`shell-smart-panel${shell.rightPanel.defaultCollapsed!==false?" collapsed":""}`;
    panel.setAttribute("aria-label","Kontextbezogenes SmartPanel");
    panel.innerHTML=`<header><div><b>SMARTPANEL</b><small>Pinnwand, KI und Kontext</small></div><button id="smartPanelClose" title="Bereich einklappen" aria-label="SmartPanel einklappen">×</button></header>
      <nav class="smart-tabs" aria-label="SmartPanel Bereiche"><button class="active" data-smart-mode="pinboard">Pinnwand</button><button data-smart-mode="ai">KI</button><button data-smart-mode="properties">Details</button><button data-smart-mode="tasks">Aufgaben</button></nav>
      <section data-smart-panel="pinboard" class="active"><article><b>Heute wichtig</b><p>V5.4.2 vervollständigt die gemeinsame Bedienoberfläche. Ziel-PC- und Fritz!Box-Livetest stehen noch aus.</p></article><article><b>Candidate-Schutz</b><p>Mess- und Prüfdienstlogik bleiben unverändert.</p></article></section>
      <section data-smart-panel="ai"><article><b>KI-Empfehlungen</b><p id="shellAiSummary">Noch keine kritische Abweichung erkannt.</p></article><button class="btn" data-page="current">Diagnose öffnen</button></section>
      <section data-smart-panel="properties"><article><b>Aktueller Bereich</b><p id="shellCurrentPage">Dashboard</p></article><article><b>Bedienprofil</b><p>Standard · Expertenfunktionen bei Bedarf</p></article><article><b>Gerätemodus</b><p id="shellDeviceModeDetail">Desktop</p></article></section>
      <section data-smart-panel="tasks"><article><b>Offene Prüfungen</b><p>Browserbedienung, lokaler Prüfdienst, Fritz!Box 6690 und Tabletansicht prüfen.</p></article><button class="btn" data-page="tests">Prüfkreise öffnen</button></section>`;
    document.body.appendChild(panel);
  }

  function buildStatusBar(){
    if(document.getElementById("shellStatusBar"))return;
    const bar=document.createElement("footer");bar.id="shellStatusBar";bar.className="shell-status-bar";bar.setAttribute("aria-label","Systemstatus");
    bar.innerHTML=`<button data-page="current" title="Internetdiagnose öffnen"><i class="green"></i>Internet <b id="shellInternetState">Prüfung</b></button><button data-page="fritz" title="FRITZ!Box öffnen"><i class="yellow"></i>FRITZ!Box <b id="shellFritzState">wartet</b></button><span><i class="green"></i>Prüfdienst <b>bereit</b></span><span>CPU <b id="shellCpu">--</b></span><span>RAM <b id="shellRam">--</b></span><span>Letzter Test <b id="shellLastTest">--:--</b></span><span>Ansicht <b id="shellDeviceMode">Desktop</b></span><span class="version">V${esc(shell.version)}</span>`;
    document.body.appendChild(bar);
  }

  function setSmartMode(mode){
    document.querySelectorAll("[data-smart-mode]").forEach(x=>x.classList.toggle("active",x.dataset.smartMode===mode));
    document.querySelectorAll("[data-smart-panel]").forEach(x=>x.classList.toggle("active",x.dataset.smartPanel===mode));
  }

  function updateClock(){
    const clock=document.getElementById("clock");if(!clock)return;
    const now=new Date();
    const time=now.toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
    const date=now.toLocaleDateString("de-DE",{weekday:"short",day:"2-digit",month:"2-digit",year:"numeric"});
    clock.innerHTML=`<b>${time}</b><small>${date}</small>`;
  }

  function updateDeviceMode(){
    const width=window.innerWidth;
    const phoneMax=shell.responsive?.phoneMaxWidth||700;
    const tabletMax=shell.responsive?.tabletMaxWidth||1100;
    const mode=width<=phoneMax?"Smartphone":width<=tabletMax?"Tablet":"Desktop";
    document.documentElement.dataset.deviceMode=mode.toLowerCase();
    document.body.classList.toggle("device-tablet",mode==="Tablet");
    document.body.classList.toggle("device-phone",mode==="Smartphone");
    const short=document.getElementById("shellDeviceMode");if(short)short.textContent=mode;
    const detail=document.getElementById("shellDeviceModeDetail");if(detail)detail.textContent=mode;
  }

  function bindShell(){
    const panel=document.getElementById("shellSmartPanel");
    const toggle=()=>panel?.classList.toggle("collapsed");
    document.getElementById("smartPanelToggle")?.addEventListener("click",toggle);
    document.getElementById("smartPanelClose")?.addEventListener("click",toggle);
    document.querySelectorAll("[data-smart-mode]").forEach(btn=>btn.addEventListener("click",()=>setSmartMode(btn.dataset.smartMode)));
    document.getElementById("shellSearch")?.addEventListener("click",()=>{
      const q=window.prompt("Seite oder Funktion suchen:");if(!q)return;
      const target=[...document.querySelectorAll(".nav-item")].find(x=>x.textContent.toLowerCase().includes(q.toLowerCase()));
      if(target)target.click();else window.alert("Keine passende Funktion gefunden.");
    });
    document.getElementById("shellAi")?.addEventListener("click",()=>{panel?.classList.remove("collapsed");setSmartMode("ai");});
    document.getElementById("shellNotifications")?.addEventListener("click",()=>{panel?.classList.remove("collapsed");setSmartMode("tasks");});
    document.addEventListener("click",event=>{
      const target=event.target.closest("[data-page]");if(!target)return;
      const output=document.getElementById("shellCurrentPage");if(output)output.textContent=target.textContent.trim()||target.dataset.page;
    });
    window.addEventListener("resize",updateDeviceMode,{passive:true});
    updateDeviceMode();updateClock();window.setInterval(updateClock,1000);
  }

  renderNavigation();configureIdentity();buildHeader();buildSmartPanel();buildStatusBar();bindShell();
  window.FrameworkShellRuntime=Object.freeze({version:"1.1.0",projectId:shell.projectId,navigationSource:"app/config/navigation.config.js",shellSource:"app/config/shell.config.js",fallbackActive:!window.NETZWERK_LEITSTAND_NAVIGATION||!window.NETZWERK_LEITSTAND_SHELL});
})();
