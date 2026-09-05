(function(global){
  "use strict";
  const VERSION="0.2.2";
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const handles=["n","e","s","w","ne","nw","se","sw"];
  const RULES=Object.freeze({gridSize:12,minWidth:180,minHeight:120,minimumReachableWindows:1,closeMode:"taskbar",requiredWindowsStayReachable:true,forbidden:["measurement-start","sensor-mutation","probe-execution","app-js-dependency"]});
  function px(v){return Math.round(v)+"px"}
  function makeButton(label,title,cls){const b=document.createElement("button");b.type="button";b.className=cls||"";b.textContent=label;b.title=title;return b}
  function createWorkspace(host,options={}){
    if(!host)throw new Error("Workspace host fehlt");
    const settings={storageKey:options.storageKey||"framework.windowframe.workspace.v2",gridSize:options.gridSize||12,snap:options.snap!==false,minW:options.minW||180,minH:options.minH||120,minimumReachable:Math.max(1,options.minimumReachable||1)};
    const state={windows:{},z:10,snap:settings.snap};
    const registry={};
    let taskbar=null,stackMenu=null;
    function bounds(){const r=host.getBoundingClientRect();return {w:Math.max(320,r.width),h:Math.max(220,r.height)} }
    function snap(v){return state.snap?Math.round(v/settings.gridSize)*settings.gridSize:Math.round(v)}
    function visibleRequiredCount(skipId){return Object.keys(registry).filter(id=>id!==skipId&&registry[id].required&&state.windows[id]&&!state.windows[id].hidden&&!state.windows[id].minimized).length}
    function reachableCount(skipId){return Object.keys(registry).filter(id=>id!==skipId&&state.windows[id]&&!state.windows[id].hidden).length}
    function save(){try{localStorage.setItem(settings.storageKey,JSON.stringify({windows:state.windows,snap:state.snap,z:state.z}))}catch(e){} renderTaskbar();}
    function load(){try{const raw=JSON.parse(localStorage.getItem(settings.storageKey)||"null");if(raw){state.windows=raw.windows||{};state.snap=raw.snap!==false;state.z=raw.z||10}}catch(e){}}
    function bringToFront(win,id){state.z+=1;win.style.zIndex=state.z;state.windows[id].z=state.z;save()}
    function panel(){return host.closest(".workspace-frame-panel")}
    function setFrameStatus(msg){const el=panel()?.querySelector(".workspace-frame-status");if(el)el.textContent=msg}
    function edgeLevel(distance){if(distance<=0)return "limit";if(distance<18)return "hot";if(distance<42)return "warn";return "idle"}
    function updateEdgeMeters(win,id){const it=state.windows[id];if(!it||!win)return;const b=bounds();const right=Math.max(0,b.w-(it.x+it.w));const bottom=Math.max(0,b.h-(it.y+it.h));const map={left:edgeLevel(it.x),top:edgeLevel(it.y),right:edgeLevel(right),bottom:edgeLevel(bottom)};Object.keys(map).forEach(side=>{win.classList.toggle("wfm-near-"+side,map[side]!=="idle");const el=win.querySelector(".wfm-edge-meter."+side);if(el)el.className="wfm-edge-meter "+(side==="left"||side==="right"?"y ":"x ")+side+" "+map[side];});}
    function ensureTaskbar(){
      if(taskbar)return taskbar;
      taskbar=document.createElement("div");taskbar.className="wfm-taskbar";taskbar.setAttribute("aria-label","Abgelegte Fenster");
      const label=document.createElement("strong");label.textContent="Fenster";taskbar.appendChild(label);
      stackMenu=document.createElement("div");stackMenu.className="wfm-stack";taskbar.appendChild(stackMenu);
      host.appendChild(taskbar);return taskbar;
    }
    function renderTaskbar(){
      if(!host.isConnected)return;ensureTaskbar();
      [...taskbar.querySelectorAll("button")].forEach(x=>x.remove());
      const parked=Object.keys(registry).filter(id=>state.windows[id]?.hidden||state.windows[id]?.minimized);
      taskbar.hidden=parked.length===0;
      parked.forEach((id,index)=>{const meta=registry[id],it=state.windows[id];const btn=makeButton((meta.required?"* ":"")+(meta.title||id),"Fenster wieder anzeigen","wfm-task-btn");btn.classList.toggle("required",!!meta.required);btn.style.setProperty("--stack-index",String(Math.min(index,6)));btn.addEventListener("click",()=>restore(id));taskbar.appendChild(btn);if(index>=7)btn.classList.add("stacked");});
      if(stackMenu)stackMenu.textContent=parked.length>7?"+"+(parked.length-7):"";
    }
    function apply(win,id){const item=state.windows[id],b=bounds();const maxBtn=win.querySelector(".wfm-max-btn");if(maxBtn){maxBtn.textContent=item.maximized?"❐":"□";maxBtn.title=item.maximized?"Vorige Groesse":"Maximieren";}item.w=clamp(Number(item.w)||320,settings.minW,b.w);item.h=clamp(Number(item.h)||180,settings.minH,b.h);item.x=clamp(Number(item.x)||12,0,Math.max(0,b.w-item.w));item.y=clamp(Number(item.y)||12,0,Math.max(0,b.h-item.h));win.style.left=px(item.x);win.style.top=px(item.y);win.style.width=px(item.w);win.style.height=px(item.h);win.style.zIndex=item.z||1;win.classList.toggle("wfm-min",!!item.minimized);win.classList.toggle("wfm-max",!!item.maximized);win.classList.toggle("wfm-required",!!registry[id]?.required);win.hidden=!!item.hidden;updateEdgeMeters(win,id);if(item.maximized){win.style.left="8px";win.style.top="8px";win.style.width=px(Math.max(settings.minW,b.w-16));win.style.height=px(Math.max(settings.minH,b.h-52));}}
    function park(id,reason){
      const meta=registry[id],win=host.querySelector('[data-window-frame-id="'+id+'"]'),it=state.windows[id];if(!it||!win)return;
      if(meta.required&&visibleRequiredCount(id)<1){setFrameStatus("Pflichtfenster bleibt sichtbar: mindestens ein Kernfenster muss offen bleiben.");return;}
      if(reachableCount(id)<settings.minimumReachable){setFrameStatus("Arbeitsflaeche darf nicht komplett leer gespeichert werden.");return;}
      it.hidden=true;it.minimized=false;it.maximized=false;apply(win,id);save();setFrameStatus(reason||"Fenster in Taskleiste abgelegt.");
    }
    function minimize(id){const win=host.querySelector('[data-window-frame-id="'+id+'"]'),it=state.windows[id];if(!it||!win)return;if(registry[id]?.required&&visibleRequiredCount(id)<1){setFrameStatus("Pflichtfenster kann nicht als letztes Kernfenster minimiert werden.");return;}it.minimized=!it.minimized;it.hidden=false;it.maximized=false;apply(win,id);save();setFrameStatus(it.minimized?"Fenster minimiert und in Taskleiste sichtbar.":"Fenster wiederhergestellt.")}
    function restore(id){const win=host.querySelector('[data-window-frame-id="'+id+'"]'),it=state.windows[id];if(!it||!win)return;it.hidden=false;it.minimized=false;it.maximized=false;apply(win,id);bringToFront(win,id);setFrameStatus("Fenster wiederhergestellt.")}
    function addWindow(config){
      const id=config.id;if(!id)throw new Error("Window id fehlt");
      registry[id]={title:config.title||id,required:!!config.required,closeMode:config.closeMode||"taskbar"};
      if(!state.windows[id])state.windows[id]={x:config.x||18,y:config.y||18,w:config.w||340,h:config.h||210,z:++state.z,minimized:false,maximized:false,hidden:false};
      const existing=host.querySelector('[data-window-frame-id="'+id+'"]');if(existing){apply(existing,id);return existing;}
      const win=document.createElement("section");win.className="wfm-window";win.dataset.windowFrameId=id;win.setAttribute("role","group");win.setAttribute("aria-label",config.title||id);
      const head=document.createElement("header");head.className="wfm-head";
      const title=document.createElement("strong");title.textContent=config.title||id;
      const tools=document.createElement("div");tools.className="wfm-tools";
      const min=makeButton("_","Minimieren","wfm-min-btn"),max=makeButton("□","Maximieren","wfm-max-btn"),close=makeButton("×",config.required?"Pflichtfenster in Taskleiste ablegen":"In Taskleiste ablegen","wfm-close-btn");
      tools.append(min,max,close);head.append(title,tools);
      if(config.required){const badge=document.createElement("span");badge.className="wfm-required-badge";badge.textContent="Pflicht";head.insertBefore(badge,tools)}
      const body=document.createElement("div");body.className="wfm-body";if(config.content instanceof Node)body.append(config.content);else body.innerHTML=config.content||"";win.append(head,body);
      handles.forEach(dir=>{const h=document.createElement("i");h.className="wfm-handle "+dir;h.dataset.dir=dir;h.title=(dir.length===2?"Ecke":"Kante")+" ziehen";win.appendChild(h);h.addEventListener("pointerdown",e=>startResize(e,win,id,dir));});["top","right","bottom","left"].forEach(side=>{const meter=document.createElement("i");meter.className="wfm-edge-meter "+(side==="left"||side==="right"?"y ":"x ")+side+" idle";win.appendChild(meter);});
      const grip=document.createElement("b");grip.className="wfm-corner-grip";grip.title="Gleichmaessig groesser/kleiner ziehen";win.appendChild(grip);grip.addEventListener("pointerdown",e=>startResize(e,win,id,"se",true));
      head.addEventListener("pointerdown",e=>startMove(e,win,id));
      min.addEventListener("click",e=>{e.stopPropagation();minimize(id)});
      max.addEventListener("click",e=>{e.stopPropagation();const it=state.windows[id];it.maximized=!it.maximized;it.minimized=false;it.hidden=false;apply(win,id);save();setFrameStatus(it.maximized?"Fenster maximiert.":"Fenster wiederhergestellt.")});
      close.addEventListener("click",e=>{e.stopPropagation();park(id,"Fenster in Taskleiste abgelegt.")});
      win.addEventListener("pointerdown",()=>bringToFront(win,id));host.appendChild(win);apply(win,id);renderTaskbar();return win;
    }
    function capture(e,win){try{win.setPointerCapture(e.pointerId)}catch(_){}}
    function startMove(e,win,id){if(e.target.closest("button")||state.windows[id].maximized)return;e.preventDefault();bringToFront(win,id);const it=state.windows[id],sx=e.clientX,sy=e.clientY,ox=it.x,oy=it.y,b=bounds();capture(e,win);const move=ev=>{it.x=clamp(snap(ox+ev.clientX-sx),0,Math.max(0,b.w-it.w));it.y=clamp(snap(oy+ev.clientY-sy),0,Math.max(0,b.h-it.h-42));apply(win,id);updateEdgeMeters(win,id)};const end=()=>{window.removeEventListener("pointermove",move);window.removeEventListener("pointerup",end);save();updateEdgeMeters(win,id);setFrameStatus("Fenster verschoben.")};window.addEventListener("pointermove",move);window.addEventListener("pointerup",end,{once:true});}
    function startResize(e,win,id,dir,uniform){e.preventDefault();e.stopPropagation();const it=state.windows[id];if(it.maximized)return;bringToFront(win,id);const sx=e.clientX,sy=e.clientY,ow=it.w,oh=it.h,ox=it.x,oy=it.y,b=bounds();capture(e,win);const ratio=ow/Math.max(1,oh);const move=ev=>{let dx=ev.clientX-sx,dy=ev.clientY-sy,nx=ox,ny=oy,nw=ow,nh=oh;if(dir.includes("e"))nw=ow+dx;if(dir.includes("s"))nh=oh+dy;if(dir.includes("w")){nw=ow-dx;nx=ox+dx}if(dir.includes("n")){nh=oh-dy;ny=oy+dy}if(uniform){const delta=Math.abs(dx)>Math.abs(dy)?dx:dy;nw=ow+delta;nh=nw/ratio}nw=snap(clamp(nw,settings.minW,b.w));nh=snap(clamp(nh,settings.minH,b.h-42));nx=snap(clamp(nx,0,Math.max(0,b.w-nw)));ny=snap(clamp(ny,0,Math.max(0,b.h-nh-42)));it.x=nx;it.y=ny;it.w=nw;it.h=nh;apply(win,id);updateEdgeMeters(win,id)};const end=()=>{window.removeEventListener("pointermove",move);window.removeEventListener("pointerup",end);save();updateEdgeMeters(win,id);setFrameStatus("Fenstergroesse angepasst.")};window.addEventListener("pointermove",move);window.addEventListener("pointerup",end,{once:true});}
    function show(id){restore(id)}
    function reset(){state.windows={};state.z=10;host.innerHTML="";taskbar=null;stackMenu=null;localStorage.removeItem(settings.storageKey);setFrameStatus("Arbeitsflaeche zurueckgesetzt.")}
    function setSnap(v){state.snap=!!v;save();setFrameStatus(state.snap?"Raster aktiv.":"Freies Platzieren aktiv.")}
    load();return {version:VERSION,addWindow,show,restore,park,reset,save,setSnap,getState:()=>JSON.parse(JSON.stringify(state))};
  }
  function initLeitstandDemo(){
    const panel=document.getElementById("workspaceFramePanel"),host=document.getElementById("workspaceFrameHost"),open=document.getElementById("workspaceFrameOpen");if(!panel||!host||!open||!global.FrameworkWindowFrameModule)return;let workspace=null;
    function ensure(){if(workspace)return workspace;workspace=createWorkspace(host,{storageKey:"leitstand.workspace.demo.v2",gridSize:12,minimumReachable:1});workspace.addWindow({id:"demo-lag",title:"Lag-Test",required:true,closeMode:"taskbar",x:18,y:18,w:330,h:190,content:'<p><b>PERMANENTER LAG-TEST</b></p><p class="wfm-demo-value">0 ms</p><small>Pflichtfenster: bleibt erreichbar.</small>'});workspace.addWindow({id:"demo-warn",title:"Warnungen",required:true,closeMode:"taskbar",x:372,y:18,w:330,h:190,content:'<p><b>WARNUNGEN</b></p><p>Gelb 0 &nbsp; Rot 0</p><small>Ablegen landet unten in der Taskleiste.</small>'});workspace.addWindow({id:"demo-brain",title:"Denkzentrum kompakt",required:true,closeMode:"taskbar",x:126,y:232,w:440,h:230,content:'<p><b>DENKZENTRUM</b></p><p>Stabilitaet 98 %</p><small>Mindestens ein Pflichtfenster bleibt offen.</small>'});workspace.addWindow({id:"demo-log",title:"Einsatzprotokoll",required:false,closeMode:"taskbar",x:590,y:244,w:330,h:190,content:'<p><b>PROTOKOLL</b></p><p>Abgelegte Fenster koennen unten wieder geoeffnet werden.</p>'});return workspace;}
    open.addEventListener("click",()=>{panel.hidden=false;ensure();});document.getElementById("workspaceFrameMin")?.addEventListener("click",()=>{panel.hidden=true});document.getElementById("workspaceFrameMax")?.addEventListener("click",e=>{panel.classList.toggle("wfp-max");e.currentTarget.textContent=panel.classList.contains("wfp-max")?"❐":"□";e.currentTarget.title=panel.classList.contains("wfp-max")?"Vorige Groesse":"Maximieren";ensure();});document.getElementById("workspaceFrameClose")?.addEventListener("click",()=>{panel.hidden=true});document.getElementById("workspaceFrameReset")?.addEventListener("click",()=>{if(confirm("Demo-Arbeitsflaeche zuruecksetzen?")){workspace?.reset();workspace=null;host.innerHTML="";ensure();}});document.getElementById("workspaceFrameSnap")?.addEventListener("change",e=>ensure().setSnap(e.target.checked));
  }
  global.FrameworkWindowFrameModule=Object.freeze({version:VERSION,createWorkspace,initLeitstandDemo,rules:RULES});document.addEventListener("DOMContentLoaded",initLeitstandDemo);
})(window);




