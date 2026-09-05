// V5.4.29 - reversible layout editor with matrix preview.
(function(){
  'use strict';
  const STORAGE='leitstand.layout.testfields.core-restored.v1';
  const STANDARD_RESET_KEYS=Object.freeze([
    STORAGE,
    'leitstand.layout.testfields.v1',
    'leitstand.layout.testfields.v2',
    'leitstand.layout.testfields.v3',
    'leitstand.workspace.demo.v2',
    'framework.windowframe.workspace.v2',
    'leitstand.testcatalog.view.v1'
  ]);
  try{localStorage.removeItem('leitstand.layout.testfields.v1');localStorage.removeItem('leitstand.layout.testfields.v2');localStorage.removeItem('leitstand.layout.testfields.v3')}catch(e){}
  const GRID=12;
  const defs=[
    {id:'brain',label:'Denkzentrum'},
    {id:'timer',label:'Sanduhr / Zeitbalken'},
    {id:'warnings',label:'Warnhistorie'},
    {id:'heart',label:'Herz / EKG'},
    {id:'leds',label:'LED-Block'}
  ];
  const state={mode:'grid',editing:false,lockAll:false,matrixPage:'overview',items:{},history:[]};
  const $=id=>document.getElementById(id);
  const snap=v=>state.mode==='grid'?Math.round(v/GRID)*GRID:Math.round(v);
  const getEl=id=>document.querySelector('[data-layout-id="'+id+'"]');
  function snapshot(){return JSON.parse(JSON.stringify({mode:state.mode,lockAll:state.lockAll,items:state.items}))}
  function pushHistory(){state.history.push(snapshot());if(state.history.length>30)state.history.shift()}
  function setStatus(msg){if($('layoutEditorStatus'))$('layoutEditorStatus').textContent=msg}
  function ensureItem(id,el){
    if(!state.items[id])state.items[id]={x:0,y:0,w:null,h:null,hidden:false,locked:false};
    const it=state.items[id];
    if(it.w===null)it.w=Math.round(el.getBoundingClientRect().width);
    if(it.h===null)it.h=Math.round(el.getBoundingClientRect().height);
    return it;
  }
  function applyItem(id){
    const el=getEl(id);if(!el)return;const it=ensureItem(id,el);
    el.classList.toggle('layout-field-hidden',!!it.hidden);
    el.classList.toggle('layout-locked',!!it.locked||state.lockAll);
    el.style.setProperty('transform',`translate(${it.x||0}px,${it.y||0}px)`,'important');
    if(it.w)el.style.setProperty('width',it.w+'px','important');else el.style.removeProperty('width');
    if(it.h)el.style.setProperty('height',it.h+'px','important');else el.style.removeProperty('height');
  }
  function applyAll(){defs.forEach(d=>applyItem(d.id));renderVisibility();renderMatrixEditor();window.dispatchEvent(new Event('resize'))}
  function save(){localStorage.setItem(STORAGE,JSON.stringify(snapshot()));setStatus('Layout gespeichert.')}
  function removeStandardLayoutKeys(){STANDARD_RESET_KEYS.forEach(key=>{try{localStorage.removeItem(key)}catch(e){}})}
  function resetRuntimeModules(){try{window.LeitstandNavigationTabOrder?.reset?.()}catch(e){};try{window.FrameworkTestCatalogModule?.open&&localStorage.removeItem('leitstand.testcatalog.view.v1')}catch(e){}}
  function load(){try{const d=JSON.parse(localStorage.getItem(STORAGE)||'null');if(d){state.mode=d.mode||'grid';state.lockAll=!!d.lockAll;state.items=d.items||{}}}catch(e){}applyAll();syncControls()}
  function reset(){pushHistory();state.mode='grid';state.lockAll=false;state.matrixPage='overview';state.items={};defs.forEach(d=>{const el=getEl(d.id);if(el){el.style.removeProperty('transform');el.style.removeProperty('width');el.style.removeProperty('height');el.classList.remove('layout-field-hidden','layout-locked')}});removeStandardLayoutKeys();resetRuntimeModules();syncControls();renderVisibility();window.dispatchEvent(new Event('resize'));setStatus('Standard wiederhergestellt: Layout, Fensterpositionen und Matrixansicht. Messwerte bleiben erhalten.')}
  function autoArrange(){pushHistory();state.mode='grid';state.lockAll=false;state.matrixPage='overview';state.items={};defs.forEach(d=>{const el=getEl(d.id);if(el){el.style.removeProperty('transform');el.style.removeProperty('width');el.style.removeProperty('height');el.classList.remove('layout-field-hidden','layout-locked')}});syncControls();renderVisibility();window.dispatchEvent(new Event('resize'));setStatus('Sinnvolle Standardanordnung geladen.')}
  function undo(){const prev=state.history.pop();if(!prev){setStatus('Keine weitere Aenderung vorhanden.');return}state.mode=prev.mode;state.lockAll=prev.lockAll;state.items=prev.items;applyAll();syncControls();setStatus('Letzte Aenderung rueckgaengig gemacht.')}
  function escapeHtml(value){return String(value==null?'':value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}
  function testStore(){return window.FrameworkTestDefinitionStore||null}
  function testOwnership(){return window.FrameworkTestOwnershipMatrix||null}
  function testPages(){return window.FrameworkWorkspacePages||null}
  function testLayout(){return window.FrameworkTestCardLayoutSpec||null}
  function matrixSourceRows(){const tests=testStore()?.tests?.()||[];return tests.map(t=>testOwnership()?.decorate?.(t)||t).map(t=>testPages()?.decorate?.(t)||t)}
  function renderMatrixCard(card,layoutApi){const spec=layoutApi.forTest(card.id);const units=layoutApi.widthUnits(spec);return `<button type="button" class="layout-matrix-card size-${escapeHtml(spec.width)}" data-layout-matrix-card="${escapeHtml(card.id)}" style="grid-column:span ${escapeHtml(units)}" title="${escapeHtml(card.title)}"><b>${escapeHtml(card.title)}</b><span>${escapeHtml(spec.width)} / ${escapeHtml(spec.height)} · ${escapeHtml(spec.view)}</span></button>`}
  function renderMatrixEditor(){
    const host=$('layoutMatrixEditor');if(!host)return;
    const pagesApi=testPages(),layoutApi=testLayout();
    if(!pagesApi||!layoutApi){host.innerHTML='<div class="layout-matrix-empty">Matrixmodule noch nicht geladen.</div>';return;}
    const summary=pagesApi.matrixSummary(matrixSourceRows());const pages=summary.rows||[];
    if(!pages.some(p=>p.id===state.matrixPage))state.matrixPage=pages[0]?.id||'overview';
    const page=pages.find(p=>p.id===state.matrixPage)||pages[0];
    const options=pages.map(p=>`<button type="button" class="${p.id===state.matrixPage?'active':''}" data-layout-matrix-page="${escapeHtml(p.id)}">${escapeHtml(p.title.replace(/^Seite \d+ - /,''))}</button>`).join('');
    const rows=(page?.layoutPlan?.rows||[]).map(row=>`<div class="layout-matrix-row">${row.cards.map(card=>renderMatrixCard(card,layoutApi)).join('')}</div>`).join('')||'<div class="layout-matrix-empty">Keine Detailkarten auf dieser Seite.</div>';
    host.innerHTML=`<div class="layout-matrix-header"><div><b>Matrix im Arbeitsflaechen-Editor</b><span>${escapeHtml(summary.totalDetailTests)} Karten / ${escapeHtml(summary.pages)} Seiten · ${summary.violations?.length?escapeHtml(summary.violations.length)+' Warnungen':'Zuordnung OK'}</span></div></div><div class="layout-matrix-tabs">${options}</div><article class="layout-matrix-page"><header><b>${escapeHtml(page?.title||'Seite')}</b><span>${escapeHtml(page?.detailCount||0)} Karten / ${escapeHtml(page?.layoutPlan?.rowCount||0)} Reihen</span></header>${rows}</article>`;
    host.querySelectorAll('[data-layout-matrix-page]').forEach(btn=>btn.addEventListener('click',()=>{state.matrixPage=btn.dataset.layoutMatrixPage;renderMatrixEditor();setStatus('Matrixseite '+btn.textContent+' angezeigt.')}));
    host.querySelectorAll('[data-layout-matrix-card]').forEach(btn=>btn.addEventListener('click',()=>setStatus('Matrixkarte ausgewaehlt: '+btn.dataset.layoutMatrixCard+'. Verschieben/Speichern folgt im naechsten Schritt.')));
  }
  function syncControls(){
    $('layoutGridMode')?.classList.toggle('active',state.mode==='grid');$('layoutGridMode')?.classList.toggle('secondary',state.mode!=='grid');
    $('layoutFreeMode')?.classList.toggle('active',state.mode==='free');$('layoutFreeMode')?.classList.toggle('secondary',state.mode!=='free');
    if($('layoutLockAll'))$('layoutLockAll').checked=state.lockAll;
  }
  function renderVisibility(){const box=$('layoutVisibilityList');if(!box)return;box.innerHTML='';defs.forEach(d=>{const el=getEl(d.id);if(!el)return;const it=ensureItem(d.id,el);const lab=document.createElement('label');lab.innerHTML=`<input type="checkbox" ${it.hidden?'':'checked'}> <span>${d.label}</span>`;lab.querySelector('input').addEventListener('change',e=>{pushHistory();it.hidden=!e.target.checked;applyItem(d.id);setStatus(d.label+(it.hidden?' ausgeblendet.':' eingeblendet.'))});box.appendChild(lab)})}
  function addTools(el,id){if(el.querySelector(':scope > .layout-field-tools'))return;const tools=document.createElement('div');tools.className='layout-field-tools';tools.innerHTML='<button class="layout-move-handle" title="Feld verschieben">✥</button><button class="layout-hide" title="Feld ausblenden">◉</button><button class="layout-lock" title="Feld sperren">🔓</button><button class="layout-reset-one" title="Feld zuruecksetzen">↺</button>';el.appendChild(tools);
    ['n','e','s','w','ne','nw','se','sw'].forEach(dir=>{const h=document.createElement('i');h.className='layout-resize-handle '+dir;h.dataset.dir=dir;el.appendChild(h);h.addEventListener('pointerdown',e=>startResize(e,id,dir))});
    tools.querySelector('.layout-move-handle').addEventListener('pointerdown',e=>startMove(e,id));
    tools.querySelector('.layout-hide').addEventListener('click',e=>{e.stopPropagation();pushHistory();ensureItem(id,el).hidden=true;applyItem(id);renderVisibility();setStatus('Feld ausgeblendet.')});
    tools.querySelector('.layout-lock').addEventListener('click',e=>{e.stopPropagation();pushHistory();const it=ensureItem(id,el);it.locked=!it.locked;applyItem(id);e.currentTarget.textContent=it.locked?'🔒':'🔓';setStatus(it.locked?'Feld gesperrt.':'Feld entsperrt.')});
    tools.querySelector('.layout-reset-one').addEventListener('click',e=>{e.stopPropagation();pushHistory();state.items[id]={x:0,y:0,w:null,h:null,hidden:false,locked:false};el.style.removeProperty('transform');el.style.removeProperty('width');el.style.removeProperty('height');applyItem(id);renderVisibility();window.dispatchEvent(new Event('resize'));setStatus('Feld zurueckgesetzt.')});
  }
  function locked(id){const it=state.items[id];return state.lockAll||it?.locked}
  function startMove(e,id){if(!state.editing||locked(id))return;e.preventDefault();e.stopPropagation();pushHistory();const el=getEl(id),it=ensureItem(id,el),sx=e.clientX,sy=e.clientY,ox=it.x||0,oy=it.y||0;e.currentTarget.setPointerCapture(e.pointerId);
    const move=ev=>{let nx=ox+(ev.clientX-sx),ny=oy+(ev.clientY-sy);const r=el.getBoundingClientRect();nx=snap(nx);ny=snap(ny);const maxX=window.innerWidth-90-r.left+ox,minX=60-r.right+ox;const maxY=window.innerHeight-60-r.top+oy,minY=65-r.bottom+oy;it.x=Math.max(minX,Math.min(maxX,nx));it.y=Math.max(minY,Math.min(maxY,ny));applyItem(id)};
    const end=()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',end);setStatus('Feld verschoben'+(state.mode==='grid'?' und am Raster ausgerichtet.':'.'));window.dispatchEvent(new Event('resize'))};window.addEventListener('pointermove',move);window.addEventListener('pointerup',end,{once:true});
  }
  function startResize(e,id,dir){if(!state.editing||locked(id))return;e.preventDefault();e.stopPropagation();pushHistory();const el=getEl(id),it=ensureItem(id,el),sx=e.clientX,sy=e.clientY,ow=it.w,oh=it.h,ox=it.x||0,oy=it.y||0;const minW=id==='brain'?240:150,minH=id==='brain'?190:72;
    const move=ev=>{const dx=ev.clientX-sx,dy=ev.clientY-sy;if(dir.includes('e'))it.w=snap(Math.max(minW,ow+dx));if(dir.includes('s'))it.h=snap(Math.max(minH,oh+dy));if(dir.includes('w')){const nw=snap(Math.max(minW,ow-dx));it.x=snap(ox+(ow-nw));it.w=nw}if(dir.includes('n')){const nh=snap(Math.max(minH,oh-dy));it.y=snap(oy+(oh-nh));it.h=nh}applyItem(id);window.dispatchEvent(new Event('resize'))};
    const end=()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',end);setStatus('Groesse angepasst'+(state.mode==='grid'?' und am Raster ausgerichtet.':'.'))};window.addEventListener('pointermove',move);window.addEventListener('pointerup',end,{once:true});
  }
  function setEditing(on){state.editing=on;document.body.classList.toggle('layout-editing',on);if(layoutEditorPanel)layoutEditorPanel.hidden=!on;if(on)renderMatrixEditor();setStatus(on?'Bearbeitungsmodus aktiv.':'Bearbeitungsmodus beendet.');window.dispatchEvent(new Event('resize'))}
  window.addEventListener('DOMContentLoaded',()=>{
    defs.forEach(d=>{const el=getEl(d.id);if(el){ensureItem(d.id,el);addTools(el,d.id)}});load();renderVisibility();renderMatrixEditor();
    $('layoutEditOpen')?.addEventListener('click',()=>setEditing(true));$('layoutEditorClose')?.addEventListener('click',()=>setEditing(false));
    $('layoutGridMode')?.addEventListener('click',()=>{state.mode='grid';syncControls();setStatus('Rastermodus aktiv.')});$('layoutFreeMode')?.addEventListener('click',()=>{state.mode='free';syncControls();setStatus('Freies Verschieben aktiv.')});
    $('layoutAutoArrange')?.addEventListener('click',autoArrange);$('layoutUndo')?.addEventListener('click',undo);$('layoutSave')?.addEventListener('click',save);$('layoutReset')?.addEventListener('click',()=>{if(confirm('Standard wirklich wiederherstellen? Es werden nur Layout, Fensterpositionen und Matrixansicht zurueckgesetzt. Messwerte und Protokolle bleiben erhalten.'))reset()});
    $('layoutLockAll')?.addEventListener('change',e=>{pushHistory();state.lockAll=e.target.checked;applyAll();setStatus(state.lockAll?'Alle Felder gesperrt.':'Felder wieder bearbeitbar.')});
  });
  window.LeitstandLayoutEditor={open:()=>setEditing(true),close:()=>setEditing(false),reset,save,standardReset:reset,standardResetKeys:()=>STANDARD_RESET_KEYS.slice(),renderMatrixEditor};
  if(!document.querySelector('script[data-test-workspace-shell]')){
    const script=document.createElement('script');script.dataset.testWorkspaceShell='loader';script.src='framework/shared/test-workspace-shell-module/test-workspace-shell-module.js?v=5523';document.head.appendChild(script);
  }
})();





