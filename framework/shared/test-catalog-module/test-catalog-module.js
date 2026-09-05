(function(){
  "use strict";
  const VERSION="0.6.0";
  const STORAGE_KEY="leitstand.testcatalog.view.v1";
  const FALLBACK_GROUPS=[{id:"internet",title:"Internet",capacity:260,description:"Ziele, DNS, Protokolle, Route, TCP und Providerstrecken"},{id:"router",title:"Router / FRITZ!Box",capacity:160,description:"Routerstatus, WAN, DOCSIS, Importdaten und Heimnetz"},{id:"quality",title:"Qualitaet",capacity:220,description:"Jitter, Paketverlust, Latenzspitzen, Bufferbloat und Stabilitaet"}];
  const FALLBACK_TESTS=[{id:"router",group:"router",title:"FRITZ!Box",summary:"Erreichbarkeit im Heimnetz",state:"active",interval:"5 s",executionClass:"permanent",priority:100,loadClass:"low",critical:true}];
  function store(){return window.FrameworkTestDefinitionStore||null}
  function scheduler(){return window.FrameworkTestSchedulerModel||null}
  function layoutSpec(){return window.FrameworkTestCardLayoutSpec||null}
  function ownership(){return window.FrameworkTestOwnershipMatrix||null}
  function workspacePages(){return window.FrameworkWorkspacePages||null}
  function groups(){return store()?.groups?.()||FALLBACK_GROUPS.slice()}
  function tests(){return store()?.tests?.()||FALLBACK_TESTS.slice()}
  function executionClasses(){return store()?.executionClasses?.()||[{id:"permanent",title:"Permanent"},{id:"cyclic",title:"Zyklisch"},{id:"event",title:"Ereignis"},{id:"manual",title:"Manuell"},{id:"deep",title:"Tiefenanalyse"}]}
  function plannedTotal(){return store()?.plannedTotal?.()||groups().reduce((sum,g)=>sum+(g.capacity||0),0)}
  function buildRows(){return store()?.allRows?.()||tests().concat(groups().map(g=>({id:`${g.id}-reserved`,group:g.id,title:`${g.title} - reservierte Testplaetze`,summary:`${g.capacity||0} Plaetze fuer kuenftige Detailtests`,state:"planned",interval:"nach Freigabe",executionClass:"planned",priority:0,loadClass:"planned",critical:false,capacity:g.capacity||0}))) }
  function schedulePlan(){return scheduler()?.plan?.(tests())||{totalLoad:0,lanes:{},warnings:[],policy:"NO_SCHEDULER"}}
  function $(id){return document.getElementById(id)}
  function loadState(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}")||{}}catch(_){return {}}}
  function saveState(state){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch(_){}}
  function escapeHtml(value){return String(value==null?"":value).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch]))}
  function groupTitle(id){return groups().find(g=>g.id===id)?.title||id}
  function executionTitle(id){return executionClasses().find(x=>x.id===id)?.title||id}
  function pageTitle(id){return workspacePages()?.page?.(id)?.title||id}
  function ensureButton(){
    const host=document.querySelector(".dashboard-inline-controls");
    if(!host||$("testCatalogOpen"))return;
    const btn=document.createElement("button");
    btn.className="btn secondary";btn.id="testCatalogOpen";btn.type="button";btn.textContent="Testkatalog";btn.title="Gruppierte Testuebersicht fuer grosse Pruefumfaenge";
    const tools=host.querySelector(".section-global-tools");host.insertBefore(btn,tools||null);btn.addEventListener("click",()=>openPanel());
  }
  function ensurePanel(){
    if($("testCatalogPanel"))return $("testCatalogPanel");
    const panel=document.createElement("div");panel.id="testCatalogPanel";panel.className="test-catalog-panel";panel.hidden=true;document.body.appendChild(panel);renderShell();return panel;
  }
  function ensureFloatingClose(panel){
    let close=$("testCatalogCloseFloating");
    if(!close){close=document.createElement("button");close.id="testCatalogCloseFloating";close.className="test-catalog-floating-close";close.type="button";close.textContent="×";close.setAttribute("aria-label","Testkatalog schliessen");close.title="Testkatalog schliessen";panel.appendChild(close)}
    close.onclick=()=>{panel.hidden=true};const headerClose=$("testCatalogClose");if(headerClose)headerClose.onclick=()=>{panel.hidden=true};
  }
  function renderShell(){
    const panel=$("testCatalogPanel");if(!panel)return;
    panel.innerHTML=`<header><div><small>TESTKATALOG CANDIDATE</small><h2>Pruefkreise strukturieren</h2></div><button class="iconbtn" id="testCatalogClose" type="button" aria-label="Testkatalog schliessen" title="Testkatalog schliessen">×</button></header><section class="test-catalog-summary" id="testCatalogSummary"></section><section class="test-scheduler-preview" id="testSchedulerPreview"></section><section class="test-catalog-tools"><input id="testCatalogSearch" type="search" placeholder="Suchen"><select id="testCatalogGroup"><option value="">Alle Gruppen</option>${groups().map(g=>`<option value="${g.id}">${escapeHtml(g.title)}</option>`).join("")}</select><select id="testCatalogState"><option value="">Alle Zustaende</option><option value="active">Aktiv</option><option value="planned">Reserviert</option></select><select id="testCatalogExecution"><option value="">Alle Klassen</option>${executionClasses().map(x=>`<option value="${x.id}">${escapeHtml(x.title)}</option>`).join("")}</select><select id="testCatalogPage"><option value="">Alle Seiten</option>${workspacePages()?workspacePages().pages().map(p=>`<option value="${p.id}">${escapeHtml(p.title)}</option>`).join(""):""}</select></section><section class="test-matrix-preview" id="testMatrixPreview"></section><section class="test-catalog-groups" id="testCatalogGroups"></section><section class="test-catalog-list" id="testCatalogList"></section><footer>Diese Ansicht startet keine Messung. Scheduler zeigt nur eine sichere Planvorschau.</footer>`;
    ensureFloatingClose(panel);
    $("testCatalogSearch").addEventListener("input",render);$("testCatalogGroup").addEventListener("change",render);$("testCatalogState").addEventListener("change",render);$("testCatalogExecution").addEventListener("change",render);if($("testCatalogPage"))$("testCatalogPage").addEventListener("change",render);
  }
  function renderSchedulerPreview(plan){
    const host=$("testSchedulerPreview");if(!host)return;const lanes=Object.values(plan.lanes||{}).filter(lane=>lane.tests&&lane.tests.length);
    host.innerHTML=`<div><b>Scheduler-Vorschau</b><span>${escapeHtml(plan.policy)} | Last ${escapeHtml(plan.totalLoad||0)}</span></div><div class="test-scheduler-lanes">${lanes.map(lane=>`<span title="Maximal ${escapeHtml(lane.maxConcurrent)} gleichzeitig">${escapeHtml(lane.title)}: ${escapeHtml(lane.tests.length)} / ${escapeHtml(lane.maxConcurrent)}</span>`).join("")}</div>${(plan.warnings||[]).length?`<p>${plan.warnings.map(escapeHtml).join(" | ")}</p>`:""}`;
  }
  function matrixSourceRows(){return tests().map(t=>ownership()?ownership().decorate(t):t).map(t=>workspacePages()?workspacePages().decorate(t):t)}
  function renderMatrixPreview(selectedPage){
    const host=$("testMatrixPreview");if(!host)return;
    if(!workspacePages()||!layoutSpec()){host.innerHTML=`<div class="test-matrix-note">Matrixmodule noch nicht geladen.</div>`;return;}
    const summary=workspacePages().matrixSummary(matrixSourceRows());
    const violations=summary.violations||[];
    const pages=summary.rows.filter(p=>!selectedPage||p.id===selectedPage);
    host.innerHTML=`<div class="test-matrix-head"><div><b>Testkarten-Matrix</b><span>${escapeHtml(summary.totalDetailTests)} Detailkarten / ${escapeHtml(summary.pages)} Seiten</span></div><div class="test-matrix-status ${violations.length?"warn":"ok"}">${violations.length?escapeHtml(violations.length)+" Regelwarnungen":"Zuordnung OK"}</div></div><div class="test-matrix-pages">${pages.map(renderMatrixPage).join("")}</div>`;
  }
  function renderMatrixPage(page){
    const plan=page.layoutPlan||{rows:[]};
    const rows=(plan.rows||[]).map(row=>`<div class="test-matrix-row" style="grid-template-columns:repeat(6,1fr)">${row.cards.map(card=>renderMatrixCard(card)).join("")}</div>`).join("")||`<div class="test-matrix-empty">Keine Detailkarten auf dieser Seite.</div>`;
    return `<article class="test-matrix-page"><header><div><small>${escapeHtml(page.role)}</small><b>${escapeHtml(page.title)}</b></div><span>${escapeHtml(page.detailCount)} Karten / ${escapeHtml(plan.rowCount||0)} Reihen</span></header>${rows}</article>`;
  }
  function renderMatrixCard(card){
    const spec=layoutSpec()?.forTest?.(card.id)||{width:"M",height:"M",view:"status"};
    const units=layoutSpec()?.widthUnits?.(spec)||2;
    return `<button type="button" class="test-matrix-card size-${escapeHtml(spec.width)}" data-matrix-test="${escapeHtml(card.id)}" style="grid-column:span ${escapeHtml(units)}" title="${escapeHtml(card.title)}"><b>${escapeHtml(card.title)}</b><span>${escapeHtml(spec.width)} / ${escapeHtml(spec.height)} · ${escapeHtml(spec.view)}</span></button>`;
  }
  function render(){
    const panel=ensurePanel();ensureFloatingClose(panel);if(!$("testCatalogExecution"))renderShell();
    const saved=loadState();
    if(saved.query&&!$("testCatalogSearch").value)$("testCatalogSearch").value=saved.query;if(saved.group&&$("testCatalogGroup").value!==saved.group)$("testCatalogGroup").value=saved.group;if(saved.mode&&$("testCatalogState").value!==saved.mode)$("testCatalogState").value=saved.mode;if(saved.execution&&$("testCatalogExecution").value!==saved.execution)$("testCatalogExecution").value=saved.execution;if(saved.page&&$("testCatalogPage")&&$("testCatalogPage").value!==saved.page)$("testCatalogPage").value=saved.page;
    const q=($("testCatalogSearch")?.value||"").trim().toLowerCase();const group=$("testCatalogGroup")?.value||"";const mode=$("testCatalogState")?.value||"";const execution=$("testCatalogExecution")?.value||"";const page=$("testCatalogPage")?.value||"";saveState({query:q,group,mode,execution,page});
    const activeTests=tests();const allGroups=groups();const plan=schedulePlan();const activeByGroup=new Map();activeTests.forEach(t=>activeByGroup.set(t.group,(activeByGroup.get(t.group)||0)+1));
    $("testCatalogSummary").innerHTML=`<article><b>${activeTests.length}</b><span>aktive Tests</span></article><article><b>${plannedTotal()}</b><span>reservierte Plaetze</span></article><article><b>${allGroups.length}</b><span>Gruppen statt Tab-Flut</span></article><article><b>${escapeHtml(plan.totalLoad||0)}</b><span>geplante Last</span></article>`;
    renderSchedulerPreview(plan);renderMatrixPreview(page);
    $("testCatalogGroups").innerHTML=allGroups.map(g=>`<button type="button" data-catalog-group="${g.id}" class="${group===g.id?"active":""}"><b>${escapeHtml(g.title)}</b><span>${activeByGroup.get(g.id)||0} aktiv / ${g.capacity||0} reserviert</span><small>${escapeHtml(g.description)}</small></button>`).join("");
    document.querySelectorAll("[data-catalog-group]").forEach(btn=>btn.onclick=()=>{const select=$("testCatalogGroup");select.value=select.value===btn.dataset.catalogGroup?"":btn.dataset.catalogGroup;render()});
    document.querySelectorAll("[data-matrix-test]").forEach(btn=>btn.onclick=()=>{const search=$("testCatalogSearch");if(search){search.value=btn.dataset.matrixTest;render()}});
    let rows=buildRows().map(t=>ownership()?ownership().decorate(t):t).map(t=>workspacePages()?workspacePages().decorate(t):t).filter(t=>(!group||t.group===group)&&(!mode||t.state===mode)&&(!execution||t.executionClass===execution)&&(!page||t.workspacePage===page));
    if(q)rows=rows.filter(t=>`${t.title} ${t.summary} ${groupTitle(t.group)} ${t.id} ${t.executionClass} ${t.loadClass}`.toLowerCase().includes(q));
    rows.sort((a,b)=>(b.priority||0)-(a.priority||0)||String(a.title).localeCompare(String(b.title),"de"));
    const limit=80;const shown=rows.slice(0,limit);
    $("testCatalogList").innerHTML=shown.map(t=>`<article class="${t.state}"><div><small>${escapeHtml(groupTitle(t.group))}</small><h3>${escapeHtml(t.title)}</h3><p>${escapeHtml(t.summary)}</p><div class="test-catalog-badges"><span>${escapeHtml(executionTitle(t.executionClass))}</span><span>Prioritaet ${escapeHtml(t.priority||0)}</span><span>Last ${escapeHtml(t.loadClass||"-")}</span>${layoutSpec()?`<span>Karte ${escapeHtml(layoutSpec().forTest(t.id).width)} / ${escapeHtml(layoutSpec().forTest(t.id).height)}</span>`:""}${ownership()?`<span>Bereich ${escapeHtml(ownership().area(ownership().owner(t.id).area).title)}</span>`:""}${workspacePages()?`<span>${escapeHtml(pageTitle(workspacePages().pageForTest(t.id)))}</span>`:""}</div></div><aside><b>${t.state==="active"?"AKTIV":"RESERVIERT"}</b><span>${escapeHtml(t.interval)}</span></aside></article>`).join("")+(rows.length>limit?`<div class="test-catalog-note">${rows.length-limit} weitere Eintraege ausgeblendet. Bitte Suche oder Gruppe nutzen.</div>`:"");
    panel.hidden=false;
  }
  function openPanel(){ensurePanel();render()}
  function matrixSummary(){return workspacePages()?.matrixSummary?.(matrixSourceRows())||null}
  function init(){ensureButton();ensurePanel();window.LeitstandTestCatalog={version:VERSION,open:openPanel,groups,activeTests:tests,plannedTotal,schedulePlan,matrixSummary};}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
  window.FrameworkTestCatalogModule={version:VERSION,init,open:openPanel,matrixSummary};
})();
