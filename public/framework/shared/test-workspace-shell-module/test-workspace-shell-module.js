(function(){
  "use strict";
  const VERSION="0.3.0";
  const MODE="CORE_FIRST_MIGRATION_CANDIDATE";
  const CORE_POLICY="NEW_UI_CORE_ONLY";
  const MODULE_URL=document.currentScript?.src||document.baseURI;
  const REQUIRED_PAGES=[
    {id:"overview",title:"Ueberblick",description:"Gesamtlage und zusammenfassende Pflichtstatus."},
    {id:"internet",title:"Internet",description:"Erreichbarkeit, DNS, Protokolle, Route und Qualitaet."},
    {id:"router",title:"FRITZ!Box / Kabel",description:"Router, WAN, DOCSIS und Anschlusszustand."},
    {id:"wifi",title:"WLAN / Mesh",description:"Funknetz, Kanaele, Mesh und WLAN-Geraete."},
    {id:"pc",title:"PC / System",description:"Lokaler PC, Speicher, SMART, Temperatur und Dienste."},
    {id:"devices",title:"Geraete",description:"Drucker, NAS, Multimedia und weitere Clients."},
    {id:"protocol",title:"Protokoll / Auswertung",description:"Ereignisse, Historie, Ursachen und Berichte."}
  ];
  const $=id=>document.getElementById(id);
  const esc=value=>String(value==null?"":value).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch]));
  const store=()=>window.FrameworkTestDefinitionStore||null;
  const ownership=()=>window.FrameworkTestOwnershipMatrix||null;
  const pagesApi=()=>window.FrameworkWorkspacePages||null;
  const layout=()=>window.FrameworkTestCardLayoutSpec||null;
  const state={page:"overview",assessment:null,toolsOpen:false,collapsed:new Set(),query:""};
  const cores={design:null,windows:null,table:null,actions:null,theme:null};
  function initCores(){
    if(!cores.design&&window.DesignCore){
      cores.design=window.DesignCore.create();
      cores.theme=cores.design.registerTheme({themeId:"leitstand.workspace.core-first.v1",source:"DesignCore",tokens:{"color.background":"#061620","color.surface":"#102e3e","color.text":"#eaf8ff","color.accent":"#62dfff","space.sm":"6px","space.md":"12px","radius.card":"8px","font.base":"system-ui"}});
      if(cores.design.evaluateContrast({ratio:7.2}).state!=="PASS")throw new Error("WORKSPACE_CONTRAST_GATE_FAILED");
    }
    if(!cores.windows&&window.WindowCore){
      cores.windows=window.WindowCore.create();
      cores.windows.ensure({windowId:"workspace.main",title:"Leitstand Arbeitsflaechen",state:"CLOSED",mode:"DESKTOP"});
      cores.windows.ensure({windowId:"workspace.tools",title:"Werkzeuge",state:"CLOSED",mode:"SHEET"});
    }
    if(!cores.table&&window.TableCore)cores.table=window.TableCore.create(["id","title","group","page","state"]);
    if(!cores.actions&&window.InteractionCore){
      cores.actions=window.InteractionCore.create();
      ["workspace.open","workspace.close","workspace.page","workspace.tools","workspace.card.collapse","workspace.card.power"].forEach(actionId=>cores.actions.bind({actionId,handlerRef:"FrameworkTestWorkspaceShell",input:"UI_EVENT"}));
    }
    return Boolean(cores.design&&cores.windows&&cores.table&&cores.actions);
  }
  function auditAction(actionId){try{cores.actions?.invoke(actionId,{allowedCapabilities:[]})}catch(_){}}
  function coreRows(rows){
    if(!cores.table)return rows;
    cores.table.replace(rows.map(test=>({__id:test.id,id:test.id,title:test.title||test.id,group:test.group||test.ownerArea||"Test",page:test.workspacePage||test.ownerPage||"unassigned",state:test.state||"available",test})));
    const result=state.query?cores.table.filterAny(state.query):cores.table.snapshot();
    return result.map(row=>row.test);
  }
  function tests(){
    return (store()?.tests?.()||[]).map(test=>ownership()?.decorate?.(test)||test).map(test=>pagesApi()?.decorate?.(test)||test);
  }
  function pageDefinition(id){
    const frameworkPage=pagesApi()?.page?.(id);
    const required=REQUIRED_PAGES.find(page=>page.id===id)||REQUIRED_PAGES[0];
    return Object.assign({},required,frameworkPage||{});
  }
  function testsForPage(id){
    const all=tests();
    if(id==="overview"){
      const summaryIds=pageDefinition(id).summaryTests||["multiPing","router","system","devices"];
      return summaryIds.map(testId=>all.find(test=>test.id===testId)).filter(Boolean);
    }
    return all.filter(test=>(test.workspacePage||test.ownerPage)===id);
  }
  function injectStyle(){
    if($("testWorkspaceShellStyle"))return;
    const style=document.createElement("style");style.id="testWorkspaceShellStyle";
    style.textContent=`
      .test-workspace-shell[hidden]{display:none!important}.test-workspace-shell{--workspace-bg:#061620;--workspace-surface:#102e3e;--workspace-text:#eaf8ff;--workspace-accent:#62dfff;position:fixed;inset:76px 20px 22px max(84px,calc(var(--nav,260px) + 18px));z-index:11500;display:grid;grid-template-rows:auto auto minmax(0,1fr);overflow:hidden;border:1px solid #4e8298;border-radius:12px;background:linear-gradient(145deg,#0b2635,var(--workspace-bg));box-shadow:0 22px 70px #000c;color:var(--workspace-text)}
      .test-workspace-shell>header{display:flex;align-items:center;gap:14px;padding:12px 16px;border-bottom:1px solid #31586d;background:#123548}.test-workspace-shell>header div{flex:1}.test-workspace-shell>header small,.test-workspace-page-head small{display:block;color:#70dafd;font-weight:900;letter-spacing:.08em}.test-workspace-shell h2{margin:2px 0 0;font-size:19px}.test-workspace-shell-close{width:38px;height:38px;border:1px solid #ffaaa4;border-radius:6px;background:#7f2927;color:white;font-size:24px;cursor:pointer}
      .test-workspace-tabs{display:flex;gap:7px;padding:10px 12px;overflow:auto;border-bottom:1px solid #29495c;background:#081d29}.test-workspace-tabs button{flex:0 0 auto;padding:8px 11px;border:1px solid #3b6578;border-radius:6px;background:#0d2a39;color:#dff5ff;font-weight:900;cursor:pointer}.test-workspace-tabs button.active{border-color:#36d977;background:#123c31;box-shadow:0 0 0 1px #36d977 inset}
      .test-workspace-page{min-height:0;overflow:auto;padding:14px}.test-workspace-page-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:12px;padding:12px 14px;border:1px solid #31586d;border-radius:8px;background:#0a2230}.test-workspace-page-head h3{margin:2px 0 4px;font-size:18px}.test-workspace-page-head p{margin:0;color:#a9c5d2}.test-workspace-mode{padding:5px 8px;border:1px solid #f0bd48;border-radius:999px;color:#ffe39a;font-size:10px;font-weight:900;white-space:nowrap}
      .test-workspace-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));grid-auto-flow:row dense;gap:10px;align-items:stretch}.test-workspace-card{grid-column:span var(--card-w,2);min-width:0;min-height:calc(var(--card-h,3) * 42px);overflow:hidden;padding:12px;border:1px solid #355f73;border-radius:8px;background:linear-gradient(145deg,#102e3e,#081c27);box-shadow:inset 3px 0 0 #2cdb74;text-align:left;color:#eaf8ff}.test-workspace-card header{display:flex;justify-content:space-between;gap:8px}.test-workspace-card h4{margin:3px 0 8px;font-size:15px;overflow-wrap:anywhere}.test-workspace-card p{margin:0;color:#aac4d0;font-size:12px;line-height:1.4;overflow-wrap:anywhere}.test-workspace-card-meta{display:flex;flex-wrap:wrap;gap:5px;margin-top:10px}.test-workspace-card-meta span{max-width:100%;overflow:hidden;text-overflow:ellipsis;padding:3px 6px;border:1px solid #3a6578;border-radius:999px;color:#9eddf5;font-size:9px;font-weight:900;text-transform:uppercase}.test-workspace-card-state{color:#63eb9d;font-size:10px;font-weight:900}.test-workspace-empty{grid-column:1/-1;min-height:190px;display:grid;place-items:center;padding:24px;border:1px dashed #53788a;border-radius:9px;background:#071b25;color:#9db6c2;text-align:center}.test-workspace-empty b{display:block;margin-bottom:7px;color:#eaf8ff}
      .test-workspace-tools[hidden]{display:none!important}.test-workspace-tools{position:absolute;right:12px;top:64px;z-index:8;width:min(430px,calc(100% - 24px));padding:12px;border:1px solid #4e8298;border-radius:8px;background:#071923;box-shadow:0 18px 55px #000c}.test-workspace-tool-list{display:flex;flex-wrap:wrap;gap:7px}.test-workspace-card button{border:1px solid #527286;border-radius:4px;background:#0b2735;color:white}.test-workspace-live{font-size:21px!important;color:#eaf8ff!important}.test-workspace-card[data-live-level="red"]{box-shadow:inset 3px 0 0 #ff514a}.test-workspace-card[data-live-level="yellow"],.test-workspace-card[data-live-level="orange"]{box-shadow:inset 3px 0 0 #f1c84a}.test-workspace-card.collapsed{min-height:76px}
      @media(max-width:1050px){.test-workspace-shell{left:82px}.test-workspace-grid{grid-template-columns:repeat(4,minmax(0,1fr))}.test-workspace-card{grid-column:span min(var(--card-w,2),4)}}@media(max-width:700px){.test-workspace-shell{inset:62px 6px 8px 6px}.test-workspace-grid{grid-template-columns:1fr}.test-workspace-card{grid-column:1!important}.test-workspace-page-head{display:block}.test-workspace-mode{display:inline-block;margin-top:8px}}
    `;
    document.head.appendChild(style);
  }
  function ensureButton(){
    const host=document.querySelector(".dashboard-inline-controls");
    if(!host||$("testWorkspaceOpen"))return;
    const button=document.createElement("button");button.id="testWorkspaceOpen";button.type="button";button.className="btn secondary";button.textContent="Neue Testseiten";button.title="Additive Vorschau der neuen Fachseiten; startet keine Messung.";
    const tools=host.querySelector(".section-global-tools");host.insertBefore(button,tools||null);button.addEventListener("click",open);
  }
  function ensureShell(){
    if($("testWorkspaceShell"))return $("testWorkspaceShell");
    const shell=document.createElement("section");shell.id="testWorkspaceShell";shell.className="test-workspace-shell";shell.hidden=true;shell.setAttribute("role","dialog");shell.setAttribute("aria-modal","false");shell.setAttribute("aria-label","Neue Testseiten Vorschau");
    shell.innerHTML='<header><div><small>CORE-FIRST ARBEITSOBERFLÄCHE</small><h2>Leitstand · neue Arbeitsflächen</h2></div><button type="button" data-workspace-tools>Werkzeuge</button><span class="test-workspace-mode">NEW UI · CORES</span><button class="test-workspace-shell-close" type="button" aria-label="Altansicht öffnen">Alt</button></header><aside class="test-workspace-tools" hidden><b>Verwaltung & Werkzeuge</b><p>Fachwerkzeuge kompakt gebündelt.</p><div class="test-workspace-tool-list"></div></aside><nav class="test-workspace-tabs" aria-label="Fachseiten"></nav><main class="test-workspace-page"></main>';
    document.body.appendChild(shell);shell.querySelector(".test-workspace-shell-close").addEventListener("click",close);shell.querySelector("[data-workspace-tools]").addEventListener("click",()=>{auditAction("workspace.tools");state.toolsOpen=!state.toolsOpen;if(state.toolsOpen)cores.windows?.open({windowId:"workspace.tools"});else cores.windows?.close("workspace.tools",{force:true});shell.querySelector(".test-workspace-tools").hidden=!state.toolsOpen;collectTools()});return shell;
  }
  function liveFor(test){const A=state.assessment||window.LeitstandBrainCoordinator?.getAssessment?.()||{},m=A.metrics||{},domains=A.domains||{},map={router:"router",fritz:"router",multiPing:"internet",ipStack:"internet",dns:"dns",tcp:"internet",loss:"quality",route:"internet",stream:"quality",buffer:"quality",system:"pc",devices:"devices"},domain=domains[map[test.id]]||{};let value=domain.available?`${Math.round(Number(domain.score)||0)} %`:"noch nicht gemessen";if(test.id==="loss"&&m.loss!=null)value=`${Number(m.loss).toFixed(1)} %`;if(test.id==="system"&&m.cpu!=null)value=`CPU ${Math.round(m.cpu)} % · RAM ${Math.round(m.ram||0)} %`;return {value,level:domain.level||"gray"}}
  function legacySwitch(id){return document.querySelector(`input[data-test="${id}"]`)}
  function cardHtml(test){
    const spec=layout()?.forTest?.(test.id)||{width:"M",height:"M",view:"status"};
    const width=layout()?.widthUnits?.(spec)||2;const height=layout()?.heightUnits?.(spec)||3;
    const owner=test.workspacePage||test.ownerPage||"unassigned";
    const live=liveFor(test),toggle=legacySwitch(test.id),checked=toggle?toggle.checked:test.state==="active",collapsed=state.collapsed.has(test.id);
    return `<article class="test-workspace-card ${collapsed?"collapsed":""}" data-test-card-id="${esc(test.id)}" data-live-level="${esc(live.level)}" style="--card-w:${esc(width)};--card-h:${esc(height)}"><header><small>${esc(test.group||test.ownerArea||"Test")}</small><span><button type="button" data-card-collapse="${esc(test.id)}">${collapsed?"▸":"▾"}</button> <button type="button" data-card-power="${esc(test.id)}">${checked?"I":"O"}</button></span></header><h4>${esc(test.title||test.id)}</h4><p class="test-workspace-live"><b>${esc(live.value)}</b></p>${collapsed?"":`<p>${esc(test.summary||"Vorhandener Messkreis")}</p><div class="test-workspace-card-meta"><span>${esc(live.level)}</span><span>${esc(spec.width)} / ${esc(spec.height)}</span><span>${esc(owner)}</span><span>${esc(test.executionClass||"passive")}</span></div>`}</article>`;
  }
  function render(){
    const shell=ensureShell();const tabs=shell.querySelector(".test-workspace-tabs");const pageHost=shell.querySelector(".test-workspace-page");
    window.dispatchEvent(new CustomEvent("testworkspace:before-render",{detail:{pageId:state.page}}));
    tabs.innerHTML=REQUIRED_PAGES.map(page=>`<button type="button" data-workspace-page="${esc(page.id)}" class="${page.id===state.page?"active":""}">${esc(page.title)}</button>`).join("");
    tabs.querySelectorAll("[data-workspace-page]").forEach(button=>button.addEventListener("click",()=>{auditAction("workspace.page");state.page=button.dataset.workspacePage;render()}));
    const page=pageDefinition(state.page);const rows=coreRows(testsForPage(state.page));
    const cards=rows.length?rows.map(cardHtml).join(""):`<div class="test-workspace-empty"><div><b>Noch keine Testanzeige zugeordnet</b>Diese Fachseite bleibt als sichere Rasterflaeche reserviert. Es wird kein Test erfunden oder gestartet.</div></div>`;
    pageHost.innerHTML=`<section class="test-workspace-page-head"><div><small>FACHSEITE · 6-SPALTEN-RASTER</small><h3>${esc(page.title)}</h3><p>${esc(page.description)}</p></div><span class="test-workspace-mode">${esc(rows.length)} ANZEIGEN · ${MODE}</span></section><section class="test-workspace-grid" data-workspace-grid-page="${esc(state.page)}">${cards}</section>`;
    pageHost.querySelectorAll("[data-card-collapse]").forEach(button=>button.onclick=()=>{auditAction("workspace.card.collapse");const id=button.dataset.cardCollapse;if(state.collapsed.has(id))state.collapsed.delete(id);else state.collapsed.add(id);render()});
    pageHost.querySelectorAll("[data-card-power]").forEach(button=>button.onclick=()=>{auditAction("workspace.card.power");const input=legacySwitch(button.dataset.cardPower);if(!input)return;if(!input.checked&&window.FrameworkSafetyStop?.isStopped?.())return;input.checked=!input.checked;input.dispatchEvent(new Event("change",{bubbles:true}));render()});
    window.dispatchEvent(new CustomEvent("testworkspace:rendered",{detail:{pageId:state.page,testIds:rows.map(test=>test.id)}}));
  }
  function collectTools(){const list=ensureShell().querySelector(".test-workspace-tool-list"),ids=["testManagementOpen","brainKnowledgeOpen","brainControlCenterOpen","sensorCatalogOpen","deviceDiscoveryOpen","selfMonitoringOpen"];ids.forEach(id=>{const node=$(id);if(node&&!list.contains(node))list.appendChild(node)})}
  function open(){initCores();auditAction("workspace.open");cores.windows?.open({windowId:"workspace.main"});const shell=ensureShell();const tokens=cores.theme?.tokens||{};shell.style.setProperty("--workspace-bg",tokens["color.background"]||"#061620");shell.style.setProperty("--workspace-surface",tokens["color.surface"]||"#102e3e");shell.style.setProperty("--workspace-text",tokens["color.text"]||"#eaf8ff");shell.style.setProperty("--workspace-accent",tokens["color.accent"]||"#62dfff");render();shell.hidden=false;document.body.classList.add("workspace-primary");collectTools();window.FrameworkPerformanceVisibility?.setWorkspaceOpen?.(true)}
  function close(){auditAction("workspace.close");cores.windows?.close("workspace.main",{force:true});window.dispatchEvent(new CustomEvent("testworkspace:closing"));const shell=$("testWorkspaceShell");if(shell)shell.hidden=true;document.body.classList.remove("workspace-primary");window.FrameworkPerformanceVisibility?.setWorkspaceOpen?.(false);window.FrameworkPerformanceVisibility?.observeLongTasks?.(false)}
  function summary(){return REQUIRED_PAGES.map(page=>({id:page.id,title:page.title,tests:testsForPage(page.id).map(test=>test.id)}))}
  function loadLayoutModule(){
    if(document.querySelector("script[data-test-workspace-layout]"))return;
    if(!document.querySelector("script[data-secure-storage]")){const storage=document.createElement("script");storage.dataset.secureStorage="loader";storage.src=new URL("../secure-storage-module/secure-storage-module.js",MODULE_URL).href;document.head.appendChild(storage)}
    if(!document.querySelector("script[data-supabase-sync]")){const sync=document.createElement("script");sync.dataset.supabaseSync="loader";sync.src=new URL("../supabase-sync-module/supabase-sync-module.js",MODULE_URL).href;document.head.appendChild(sync)}
    if(!document.querySelector("script[data-test-card-design]")){const design=document.createElement("script");design.dataset.testCardDesign="loader";design.src=new URL("../test-card-design-module/test-card-design-module.js",MODULE_URL).href;document.head.appendChild(design)}
    if(!document.querySelector("script[data-performance-visibility]")){const performance=document.createElement("script");performance.dataset.performanceVisibility="loader";performance.src=new URL("../performance-visibility-module/performance-visibility-module.js",MODULE_URL).href;document.head.appendChild(performance)}
    const script=document.createElement("script");script.dataset.testWorkspaceLayout="loader";script.src=new URL("../test-workspace-layout-module/test-workspace-layout-module.js",MODULE_URL).href;document.head.appendChild(script);
    if(!document.querySelector("script[data-test-management]")){const management=document.createElement("script");management.dataset.testManagement="loader";management.src=new URL("../test-management-module/test-management-module.js",MODULE_URL).href;document.head.appendChild(management)}
    if(!document.querySelector("script[data-brain-control-center]")){const brain=document.createElement("script");brain.dataset.brainControlCenter="loader";brain.src=new URL("../brain-control-center-module/brain-control-center-module.js",MODULE_URL).href;document.head.appendChild(brain)}
    if(!document.querySelector("script[data-brain-knowledge-management]")){const knowledge=document.createElement("script");knowledge.dataset.brainKnowledgeManagement="loader";knowledge.src=new URL("../brain-knowledge-management-module/brain-knowledge-management-module.js",MODULE_URL).href;document.head.appendChild(knowledge)}
    if(!document.querySelector("script[data-sensor-catalog]")){const sensors=document.createElement("script");sensors.dataset.sensorCatalog="loader";sensors.src=new URL("../sensor-catalog-module/sensor-catalog-module.js",MODULE_URL).href;document.head.appendChild(sensors)}
    if(!document.querySelector("script[data-device-discovery]")){const discovery=document.createElement("script");discovery.dataset.deviceDiscovery="loader";discovery.src=new URL("../device-discovery-orchestrator-module/device-discovery-orchestrator-module.js",MODULE_URL).href;document.head.appendChild(discovery)}
    if(!document.querySelector("script[data-sensor-package-review]")){const review=document.createElement("script");review.dataset.sensorPackageReview="loader";review.src=new URL("../sensor-package-review-module/sensor-package-review-module.js",MODULE_URL).href;document.head.appendChild(review)}
    if(!document.querySelector("script[data-self-monitoring]")){const selfMonitor=document.createElement("script");selfMonitor.dataset.selfMonitoring="loader";selfMonitor.src=new URL("../self-monitoring-module/self-monitoring-module.js",MODULE_URL).href;document.head.appendChild(selfMonitor)}
    if(!document.querySelector("script[data-brain-inner-visual]")){const brainVisual=document.createElement("script");brainVisual.dataset.brainInnerVisual="loader";brainVisual.src=new URL("../brain-inner-visual-module/brain-inner-visual-module.js?v=5518",MODULE_URL).href;document.head.appendChild(brainVisual)}
    if(!document.querySelector("script[data-core-live-overview]")){const liveOverview=document.createElement("script");liveOverview.dataset.coreLiveOverview="loader";liveOverview.src=new URL("../core-live-overview-module/core-live-overview-module.js?v=5522",MODULE_URL).href;document.head.appendChild(liveOverview)}
    if(!document.querySelector("script[data-safety-stop]")){const safety=document.createElement("script");safety.dataset.safetyStop="loader";safety.src=new URL("../safety-stop-module/safety-stop-module.js?v=5518g",MODULE_URL).href;document.head.appendChild(safety)}
  }
  function init(){initCores();injectStyle();ensureButton();ensureShell();loadLayoutModule();window.addEventListener("leitstand:brain-coordination",event=>{state.assessment=event.detail?.assessment||event.detail||null;if(!$("testWorkspaceShell")?.hidden&&state.page!=="overview")render()});setTimeout(()=>{open();collectTools()},700)}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
  window.FrameworkTestWorkspaceShell={version:VERSION,mode:MODE,corePolicy:CORE_POLICY,open,close,summary,coreSnapshot:()=>({windows:cores.windows?.snapshot?.()||[],actions:cores.actions?.eventLog?.()||[],themeId:cores.theme?.themeId||null}),pages:()=>REQUIRED_PAGES.map(page=>Object.assign({},page))};
})();
