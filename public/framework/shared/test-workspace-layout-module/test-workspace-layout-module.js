(function(){
  "use strict";
  const VERSION="0.2.0",LEGACY_STORAGE="leitstand.testworkspace.layout.v1",SECURE_SCOPE="test-workspace",SECURE_KEY="layout-v1",SCHEMA=1,COLUMNS=6,ROW_PX=42,GAP=10;
  const SIZE_ORDER=["S","M","L","XL"],SIZE_WIDTH={S:1,M:2,L:3,XL:4},SIZE_HEIGHT={S:2,M:3,L:4,XL:6};
  const state={editing:false,data:{schemaVersion:SCHEMA,pages:{}},history:[]};
  const clone=value=>JSON.parse(JSON.stringify(value));
  const grid=()=>document.querySelector("[data-workspace-grid-page]");
  const pageId=()=>grid()?.dataset.workspaceGridPage||"overview";
  const cards=()=>[...(grid()?.querySelectorAll("[data-test-card-id]")||[])];
  const status=message=>{const out=document.getElementById("testWorkspaceLayoutStatus");if(out)out.textContent=message};
  function validItem(item){return item&&Number.isInteger(item.column)&&Number.isInteger(item.row)&&Number.isInteger(item.widthUnits)&&Number.isInteger(item.heightUnits)&&item.column>=1&&item.row>=1&&item.widthUnits>=1&&item.widthUnits<=COLUMNS&&item.heightUnits>=1&&item.column+item.widthUnits-1<=COLUMNS}
  const validData=parsed=>parsed?.schemaVersion===SCHEMA&&parsed.pages&&Object.values(parsed.pages).every(page=>page?.items&&Object.values(page.items).every(validItem));
  async function loadSecure(){const storage=window.FrameworkSecureStorage;if(!storage)return;try{await storage.ready();let parsed=await storage.get(SECURE_SCOPE,SECURE_KEY);if(!parsed){const result=await storage.migrateLocalStorage(SECURE_SCOPE,SECURE_KEY,LEGACY_STORAGE,validData);if(result.migrated)parsed=await storage.get(SECURE_SCOPE,SECURE_KEY)}if(validData(parsed))state.data=parsed;if(grid())apply()}catch(_){status("Sicherer Layoutspeicher nicht verfuegbar; Standard bleibt aktiv.")}}
  async function save(){const storage=window.FrameworkSecureStorage;if(!storage){status("Sicherer Speicher noch nicht bereit.");return}try{await storage.set(SECURE_SCOPE,SECURE_KEY,state.data);status("Layout verschluesselt in IndexedDB gespeichert.")}catch(_){status("Layout konnte nicht sicher gespeichert werden.")}}
  function snapshot(){state.history.push(clone(state.data));if(state.history.length>40)state.history.shift()}
  function undo(){const previous=state.history.pop();if(!previous){status("Keine Aenderung zum Rueckgaengigmachen.");return}state.data=previous;apply();status("Letzte Layoutaenderung rueckgaengig gemacht.")}
  function overlaps(a,b){return a.column<b.column+b.widthUnits&&a.column+a.widthUnits>b.column&&a.row<b.row+b.heightUnits&&a.row+a.heightUnits>b.row}
  function collides(items,id,candidate){return Object.entries(items).some(([otherId,item])=>otherId!==id&&!item.hidden&&overlaps(candidate,item))}
  function firstFree(items,width,height,startRow=1){
    for(let row=startRow;row<500;row++)for(let column=1;column<=COLUMNS-width+1;column++){const candidate={column,row,widthUnits:width,heightUnits:height,hidden:false,locked:false};if(!collides(items,"",candidate))return candidate}
    return {column:1,row:startRow,widthUnits:width,heightUnits:height,hidden:false,locked:false};
  }
  function defaultPage(){
    const items={};
    cards().forEach(card=>{const width=Math.max(1,Math.min(COLUMNS,Number(card.style.getPropertyValue("--card-w"))||2));const height=Math.max(1,Number(card.style.getPropertyValue("--card-h"))||3);items[card.dataset.testCardId]=firstFree(items,width,height)});
    return {items};
  }
  function ensurePage(){
    const id=pageId();if(!state.data.pages[id])state.data.pages[id]=defaultPage();
    const items=state.data.pages[id].items;
    cards().forEach(card=>{const testId=card.dataset.testCardId;if(!validItem(items[testId])){const width=Math.max(1,Math.min(COLUMNS,Number(card.style.getPropertyValue("--card-w"))||2));const height=Math.max(1,Number(card.style.getPropertyValue("--card-h"))||3);items[testId]=firstFree(items,width,height)}});
    return state.data.pages[id];
  }
  function apply(){
    const host=grid();if(!host)return;const page=ensurePage();host.style.gridAutoRows=ROW_PX+"px";
    cards().forEach(card=>{const item=page.items[card.dataset.testCardId];card.style.gridColumn=`${item.column} / span ${item.widthUnits}`;card.style.gridRow=`${item.row} / span ${item.heightUnits}`;card.style.minHeight="0";card.classList.toggle("workspace-layout-hidden",!!item.hidden);card.classList.toggle("workspace-layout-locked",!!item.locked);decorate(card,item)});
    document.body.classList.toggle("test-workspace-layout-editing",state.editing);syncToolbar();
  }
  function decorate(card,item){
    let tools=card.querySelector(":scope > .test-workspace-card-tools");if(!tools){tools=document.createElement("div");tools.className="test-workspace-card-tools";tools.innerHTML='<button type="button" data-layout-action="move" title="Mit Maus oder Pfeiltasten verschieben" aria-label="Karte verschieben">✥</button><button type="button" data-layout-action="size" title="Rastergroesse wechseln" aria-label="Kartengroesse wechseln">S</button><button type="button" data-layout-action="lock" title="Karte sperren" aria-label="Karte sperren">🔓</button><button type="button" data-layout-action="hide" title="Karte ausblenden" aria-label="Karte ausblenden">◉</button>';card.prepend(tools);bindTools(card,tools)}
    const size=SIZE_ORDER.find(key=>SIZE_WIDTH[key]===item.widthUnits&&SIZE_HEIGHT[key]===item.heightUnits)||`${item.widthUnits}×${item.heightUnits}`;
    tools.querySelector('[data-layout-action="size"]').textContent=size;tools.querySelector('[data-layout-action="lock"]').textContent=item.locked?"🔒":"🔓";tools.querySelector('[data-layout-action="hide"]').textContent=item.hidden?"◎":"◉";
  }
  function commit(testId,candidate,message){
    const items=ensurePage().items;if(candidate.column<1||candidate.row<1||candidate.column+candidate.widthUnits-1>COLUMNS||collides(items,testId,candidate)){status("Position belegt oder ausserhalb des Rasters.");return false}
    snapshot();items[testId]=candidate;apply();status(message);return true;
  }
  function moveBy(card,dx,dy){
    const id=card.dataset.testCardId,item=ensurePage().items[id];if(!state.editing||item.locked)return;
    commit(id,Object.assign({},item,{column:item.column+dx,row:item.row+dy}),"Karte im Raster verschoben.");
  }
  function bindTools(card,tools){
    const move=tools.querySelector('[data-layout-action="move"]');move.tabIndex=0;
    move.addEventListener("keydown",event=>{const directions={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};if(!directions[event.key])return;event.preventDefault();moveBy(card,...directions[event.key])});
    move.addEventListener("pointerdown",event=>startDrag(event,card));
    tools.querySelector('[data-layout-action="size"]').addEventListener("click",()=>cycleSize(card));
    tools.querySelector('[data-layout-action="lock"]').addEventListener("click",()=>{const item=ensurePage().items[card.dataset.testCardId];snapshot();item.locked=!item.locked;apply();status(item.locked?"Karte gesperrt.":"Karte entsperrt.")});
    tools.querySelector('[data-layout-action="hide"]').addEventListener("click",()=>{const item=ensurePage().items[card.dataset.testCardId];if(item.locked)return;snapshot();item.hidden=!item.hidden;apply();status(item.hidden?"Karte ausgeblendet.":"Karte eingeblendet.")});
  }
  function startDrag(event,card){
    const id=card.dataset.testCardId,item=ensurePage().items[id];if(!state.editing||item.locked)return;event.preventDefault();event.stopPropagation();
    const host=grid(),rect=host.getBoundingClientRect(),cell=(rect.width-(COLUMNS-1)*GAP)/COLUMNS,startX=event.clientX,startY=event.clientY,origin=clone(item),target=event.currentTarget;try{target.setPointerCapture(event.pointerId)}catch(_){}
    const move=ev=>{const dc=Math.round((ev.clientX-startX)/(cell+GAP)),dr=Math.round((ev.clientY-startY)/(ROW_PX+GAP));card.dataset.dragColumn=String(origin.column+dc);card.dataset.dragRow=String(origin.row+dr)};
    const end=ev=>{window.removeEventListener("pointermove",move);window.removeEventListener("pointerup",end);const column=Number(card.dataset.dragColumn||origin.column),row=Number(card.dataset.dragRow||origin.row);delete card.dataset.dragColumn;delete card.dataset.dragRow;if(column!==origin.column||row!==origin.row)commit(id,Object.assign({},origin,{column,row}),"Karte am Raster eingerastet.")};
    window.addEventListener("pointermove",move);window.addEventListener("pointerup",end,{once:true});
  }
  function cycleSize(card){
    const id=card.dataset.testCardId,item=ensurePage().items[id];if(!state.editing||item.locked)return;const current=SIZE_ORDER.findIndex(key=>SIZE_WIDTH[key]===item.widthUnits&&SIZE_HEIGHT[key]===item.heightUnits),next=SIZE_ORDER[(current+1+SIZE_ORDER.length)%SIZE_ORDER.length],candidate=Object.assign({},item,{widthUnits:SIZE_WIDTH[next],heightUnits:SIZE_HEIGHT[next]});
    commit(id,candidate,"Kartengroesse auf "+next+" gesetzt.");
  }
  function resetPage(){snapshot();state.data.pages[pageId()]=defaultPage();apply();status("Standardanordnung dieser Seite wiederhergestellt.")}
  async function resetAll(){snapshot();state.data={schemaVersion:SCHEMA,pages:{}};try{await window.FrameworkSecureStorage?.remove?.(SECURE_SCOPE,SECURE_KEY)}catch(_){}apply();status("Alle neuen Testseiten auf Standard gesetzt.")}
  function setEditing(on){state.editing=!!on;apply();status(state.editing?"Bearbeitungsmodus aktiv.":"Bearbeitungsmodus beendet.")}
  function ensureToolbar(){
    const host=document.querySelector(".test-workspace-page"),pageHead=host?.querySelector(".test-workspace-page-head");if(!host||!pageHead)return;
    let bar=host.querySelector(".test-workspace-layout-toolbar");if(!bar){bar=document.createElement("section");bar.className="test-workspace-layout-toolbar";bar.innerHTML='<button type="button" data-workspace-layout="edit">Bearbeiten</button><button type="button" data-workspace-layout="undo">Rueckgaengig</button><button type="button" data-workspace-layout="save">Speichern</button><button type="button" data-workspace-layout="reset-page">Seite zuruecksetzen</button><button type="button" data-workspace-layout="reset-all">Alles zuruecksetzen</button><output id="testWorkspaceLayoutStatus" aria-live="polite">Rasterlayout V1 bereit.</output>';pageHead.after(bar);
      bar.querySelector('[data-workspace-layout="edit"]').addEventListener("click",()=>setEditing(!state.editing));bar.querySelector('[data-workspace-layout="undo"]').addEventListener("click",undo);bar.querySelector('[data-workspace-layout="save"]').addEventListener("click",save);bar.querySelector('[data-workspace-layout="reset-page"]').addEventListener("click",resetPage);bar.querySelector('[data-workspace-layout="reset-all"]').addEventListener("click",resetAll)}
  }
  function syncToolbar(){const button=document.querySelector('[data-workspace-layout="edit"]');if(button){button.textContent=state.editing?"Bearbeitung beenden":"Bearbeiten";button.classList.toggle("active",state.editing)}}
  function injectStyle(){
    if(document.getElementById("testWorkspaceLayoutStyle"))return;const style=document.createElement("style");style.id="testWorkspaceLayoutStyle";style.textContent=`
      .test-workspace-layout-toolbar{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:-4px 0 12px;padding:8px;border:1px solid #31586d;border-radius:7px;background:#071b26}.test-workspace-layout-toolbar button{padding:6px 9px;border:1px solid #487286;border-radius:5px;background:#102d3b;color:#e8f8ff;font-weight:900;cursor:pointer}.test-workspace-layout-toolbar button.active{border-color:#37df80;background:#16412f}.test-workspace-layout-toolbar output{flex:1;min-width:220px;color:#9edcf3;font-size:11px;text-align:right}
      .test-workspace-card{position:relative}.test-workspace-card-tools{position:absolute;right:6px;top:6px;z-index:4;display:none;gap:3px;padding:3px;border:1px solid #39738b;border-radius:6px;background:#061923ee}.test-workspace-card-tools button{width:27px;height:27px;padding:0;border:1px solid #416c7e;border-radius:4px;background:#113446;color:#fff;cursor:pointer;font-weight:900}.test-workspace-layout-editing .test-workspace-card-tools{display:flex}.test-workspace-layout-editing .test-workspace-card{outline:1px dashed #62dfff;outline-offset:2px}.test-workspace-layout-editing .workspace-layout-locked{outline-color:#ffd251}.test-workspace-layout-editing .workspace-layout-hidden{display:block!important;opacity:.35}.test-workspace-layout-editing [data-layout-action="move"]{cursor:move}.test-workspace-layout-editing .test-workspace-card[data-drag-column]{outline:2px solid #fff}.test-workspace-layout-editing .test-workspace-card>header{padding-right:118px}body:not(.test-workspace-layout-editing) .workspace-layout-hidden{display:none!important}
      @media(max-width:700px){.test-workspace-layout-toolbar output{flex-basis:100%;text-align:left}.test-workspace-grid{grid-auto-rows:auto!important}.test-workspace-card{grid-row:auto!important;min-height:126px!important}}
    `;document.head.appendChild(style);
  }
  function onRendered(){ensureToolbar();apply()}
  injectStyle();window.addEventListener("testworkspace:rendered",onRendered);window.addEventListener("leitstand:secure-storage-ready",loadSecure,{once:true});if(window.FrameworkSecureStorage)loadSecure();
  if(document.readyState!=="loading"&&grid())onRendered();
  window.FrameworkTestWorkspaceLayout={version:VERSION,schemaVersion:SCHEMA,storage:{engine:"IndexedDB",encrypted:true,scope:SECURE_SCOPE,key:SECURE_KEY},setEditing,save,undo,resetPage,resetAll,getState:()=>clone(state.data),rules:()=>({columns:COLUMNS,rowUnitPx:ROW_PX,gapPx:GAP,coordinates:["column","row","widthUnits","heightUnits"],collisionPolicy:"REJECT_AND_KEEP_LAST_VALID"})};
})();
