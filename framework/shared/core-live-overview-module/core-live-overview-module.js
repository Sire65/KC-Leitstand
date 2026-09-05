(function(){
  "use strict";
  const VERSION="0.1.0",MODULE_URL=document.currentScript?.src||document.baseURI;
  const WINDOWS=[
    {id:"brain",title:"Systemgehirn",selector:".brain-inline-card",span:"wide"},
    {id:"live",title:"Live-Status, EKG und Kreis-LED",selector:"#testLive",span:"full"},
    {id:"lag",title:"Permanenter Lag-Test",selector:".lag-panel",span:"normal"},
    {id:"monitor",title:"Live-Monitor",selector:".operation-monitor",span:"wide"}
  ];
  const state={records:new Map(),assessment:null,windowCore:null,ball:null,ring:null};
  const reduced=()=>document.body.classList.contains("animations-off")||matchMedia("(prefers-reduced-motion: reduce)").matches;
  function initCore(){
    if(state.windowCore||!window.WindowCore)return;
    state.windowCore=window.WindowCore.create();
    WINDOWS.forEach(item=>state.windowCore.ensure({windowId:`workspace.live.${item.id}`,title:item.title,state:"CLOSED",mode:"CARD"}));
    state.windowCore.ensure({windowId:"workspace.live.latency-ball",title:"Tanzende Latenzkugel",state:"CLOSED",mode:"CARD"});
    state.windowCore.ensure({windowId:"workspace.live.health-ring",title:"Kreis-LED",state:"CLOSED",mode:"CARD"});
  }
  function parking(){
    let host=document.getElementById("coreLiveParking");
    if(!host){host=document.createElement("div");host.id="coreLiveParking";host.hidden=true;document.body.appendChild(host)}
    return host;
  }
  function capture(){
    WINDOWS.forEach(item=>{
      if(state.records.has(item.id))return;
      const node=document.querySelector(item.selector);if(!node)return;
      const marker=document.createComment(`core-live-origin:${item.id}`);node.parentNode.insertBefore(marker,node);
      state.records.set(item.id,{...item,node,marker});
    });
  }
  function park(){
    capture();const host=parking();
    state.records.forEach(record=>{if(record.node.parentNode!==host)host.appendChild(record.node)});
    state.ball?.stop?.();state.ball=null;state.ring=null;
  }
  function restore(){
    state.records.forEach(record=>{if(record.marker.parentNode)record.marker.parentNode.insertBefore(record.node,record.marker.nextSibling)});
    state.windowCore?.snapshot().forEach(win=>{if(win.state!=="CLOSED")state.windowCore.close(win.windowId,{force:true})});
    state.ball?.stop?.();
  }
  function loadVisual(name,path,ready){
    if(customElements.get(name)){ready();return}
    const key=`core-visual-${name}`;let script=document.querySelector(`script[data-${key}]`);
    if(!script){script=document.createElement("script");script.setAttribute(`data-${key}`,"loader");script.src=new URL(path,MODULE_URL).href;script.addEventListener("load",ready,{once:true});document.head.appendChild(script)}
    else script.addEventListener("load",ready,{once:true});
  }
  function addWindow(deck,title,span,id){
    const card=document.createElement("article");card.className=`core-live-window ${span}`;card.dataset.coreWindow=id;
    card.innerHTML=`<header><small>WINDOWCORE · LIVE</small><b>${title}</b></header><div class="core-live-window-body"></div>`;
    deck.appendChild(card);state.windowCore?.open({windowId:id});return card.querySelector(".core-live-window-body");
  }
  function mountVisuals(deck){
    const ballHost=addWindow(deck,"Tanzende Latenzkugel","normal","workspace.live.latency-ball");
    const ringHost=addWindow(deck,"Kreis-LED · Testzustände","normal","workspace.live.health-ring");
    loadVisual("latency-ball-module","../latency-ball-module/latency-ball-module.js",()=>{
      if(!ballHost.isConnected)return;state.ball=document.createElement("latency-ball-module");ballHost.appendChild(state.ball);state.ball.engine?.setSize?.(150);if(reduced())state.ball.stop?.();updateVisuals();
    });
    loadVisual("health-ring-module","../health-ring-module/health-ring-module.js",()=>{
      if(!ringHost.isConnected)return;state.ring=document.createElement("health-ring-module");ringHost.appendChild(state.ring);state.ring.setRingSize?.(178);updateVisuals();
    });
  }
  function updateVisuals(){
    const assessment=state.assessment||window.LeitstandBrainCoordinator?.getAssessment?.()||{},metrics=assessment.metrics||{},domains=assessment.domains||{};
    const latency=Number(metrics.latency??metrics.ping??metrics.routerLatency);
    if(state.ball&&Number.isFinite(latency))state.ball.setLatency(latency,{group:"network",source:"SystemAssessmentCore"});
    if(state.ball){if(reduced())state.ball.stop?.();else state.ball.start?.()}
    if(state.ring){
      state.ring.resetCycle?.();state.ring.startCycle?.();
      Object.entries(domains).forEach(([group,value])=>{const level=value?.level||"unknown",status=level==="green"?"ok":level==="yellow"?"warn":level==="orange"?"critical":level==="red"?"alarm":"maintenance";state.ring.addResult?.(status,{group:["network","server","clients","wlan","security","cloud","maintenance"].includes(group)?group:"network",label:group,source:"SystemAssessmentCore"})});
      state.ring.stopCycle?.();
    }
  }
  function mount(pageId){
    park();if(pageId!=="overview")return;
    const page=document.querySelector(".test-workspace-page");if(!page)return;
    const deck=document.createElement("section");deck.className="core-live-overview";deck.setAttribute("aria-label","Live-Monitoring und Animationen");
    const heading=document.createElement("header");heading.className="core-live-overview-head";heading.innerHTML="<div><small>CORE-LIVE-DECK</small><h3>Live-Monitoring und Animationen</h3></div><span>eine Laufzeit · keine Duplikate</span>";deck.appendChild(heading);
    WINDOWS.forEach(item=>{const record=state.records.get(item.id);if(!record)return;const body=addWindow(deck,item.title,item.span,`workspace.live.${item.id}`);body.appendChild(record.node)});
    mountVisuals(deck);page.appendChild(deck);updateVisuals();
  }
  function style(){
    if(document.getElementById("coreLiveOverviewStyle"))return;const sheet=document.createElement("style");sheet.id="coreLiveOverviewStyle";sheet.textContent=`
      .core-live-overview{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px;margin-top:14px}.core-live-overview-head{grid-column:1/-1;display:flex;justify-content:space-between;align-items:center;padding:10px 12px;border:1px solid #3c6a7e;border-radius:8px;background:#092330}.core-live-overview-head h3{margin:2px 0}.core-live-overview-head small{color:#62dfff;font-weight:900}.core-live-overview-head span{color:#9dc3d3;font-size:11px}.core-live-window{grid-column:span 2;min-width:0;overflow:hidden;border:1px solid #38677b;border-radius:8px;background:#071b25}.core-live-window.wide{grid-column:span 3}.core-live-window.full{grid-column:1/-1}.core-live-window>header{display:flex;justify-content:space-between;gap:8px;padding:8px 10px;border-bottom:1px solid #31586d;background:#0d2b39}.core-live-window>header small{color:#62dfff;font-size:9px;font-weight:900}.core-live-window-body{min-width:0;overflow:auto;padding:8px}.core-live-window-body>.brain-inline-card,.core-live-window-body>#testLive,.core-live-window-body>.lag-panel,.core-live-window-body>.operation-monitor{width:100%!important;max-width:none!important;margin:0!important}.core-live-window-body latency-ball-module,.core-live-window-body health-ring-module{display:grid;place-items:center;min-height:190px;overflow:hidden}
      @media(max-width:1050px){.core-live-window,.core-live-window.wide{grid-column:span 3}}@media(max-width:700px){.core-live-overview{grid-template-columns:1fr}.core-live-window,.core-live-window.wide,.core-live-window.full{grid-column:1}.core-live-overview-head{display:block}}
    `;document.head.appendChild(sheet);
  }
  function init(){
    initCore();style();capture();window.addEventListener("testworkspace:before-render",park);window.addEventListener("testworkspace:rendered",event=>mount(event.detail?.pageId));window.addEventListener("testworkspace:closing",restore);window.addEventListener("leitstand:brain-coordination",event=>{state.assessment=event.detail?.assessment||event.detail||null;updateVisuals()});
    if(!document.getElementById("testWorkspaceShell")?.hidden)mount("overview");
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
  window.FrameworkCoreLiveOverview={version:VERSION,park,restore,mount,snapshot:()=>state.windowCore?.snapshot?.()||[]};
})();
