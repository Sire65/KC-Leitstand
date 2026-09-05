(function(global){
  "use strict";
  const VERSION="0.1.0";
  const CORE_TABS=["internet","router","pc","protocol"];
  function initTabOrder(strip,options={}){
    if(!strip)return null;
    const storageKey=options.storageKey||"leitstand.navigation.tabs.v1";
    const tabs=()=>[...strip.querySelectorAll("[data-diag-tab]")];
    const standard=tabs().map(x=>x.dataset.diagTab);
    let dragged="";
    const tools=document.createElement("div");tools.className="navtab-tools";
    const more=document.createElement("button");more.type="button";more.className="navtab-more";more.textContent="Mehr";more.hidden=true;
    const menu=document.createElement("div");menu.className="navtab-menu";menu.hidden=true;
    const reset=document.createElement("button");reset.type="button";reset.className="navtab-reset";reset.textContent="Standard";reset.title="Registerreihenfolge zuruecksetzen";
    tools.append(more,reset,menu);strip.after(tools);
    function sanitize(order){const known=standard.slice();const result=[];(Array.isArray(order)?order:[]).forEach(id=>{if(known.includes(id)&&!result.includes(id))result.push(id)});known.forEach(id=>{if(!result.includes(id))result.push(id)});return result;}
    function save(){try{localStorage.setItem(storageKey,JSON.stringify({order:tabs().map(x=>x.dataset.diagTab)}))}catch(e){}}
    function load(){try{return sanitize(JSON.parse(localStorage.getItem(storageKey)||"null")?.order)}catch(e){return standard}}
    function apply(order){const map=new Map(tabs().map(x=>[x.dataset.diagTab,x]));sanitize(order).forEach(id=>{const el=map.get(id);if(el)strip.appendChild(el)});markCore();arrangeOverflow();}
    function markCore(){tabs().forEach(btn=>{btn.draggable=true;btn.classList.toggle("navtab-core",CORE_TABS.includes(btn.dataset.diagTab));btn.title=CORE_TABS.includes(btn.dataset.diagTab)?"Pflichtregister, verschiebbar aber nicht entfernbar":"Register ziehen zum Sortieren";});}
    function activeId(){return strip.querySelector(".diag-tab.active")?.dataset.diagTab||""}
    function arrangeOverflow(){
      tabs().forEach(btn=>btn.classList.remove("navtab-hidden-overflow"));menu.innerHTML="";more.hidden=true;menu.hidden=true;
      const all=tabs();if(all.length<2)return;
      const available=Math.max(360,strip.clientWidth||0),active=activeId();let used=tools.offsetWidth+24;
      const overflow=[];
      all.forEach(btn=>{used+=btn.offsetWidth+8;if(used>available&&!CORE_TABS.includes(btn.dataset.diagTab)&&btn.dataset.diagTab!==active)overflow.push(btn)});
      overflow.forEach(btn=>{btn.classList.add("navtab-hidden-overflow");const item=document.createElement("button");item.type="button";item.textContent=btn.textContent;item.dataset.targetTab=btn.dataset.diagTab;item.addEventListener("click",()=>{menu.hidden=true;btn.click();arrangeOverflow();});menu.appendChild(item);});
      more.hidden=overflow.length===0;more.textContent=overflow.length?"Mehr ("+overflow.length+")":"Mehr";
    }
    strip.addEventListener("dragstart",e=>{const btn=e.target.closest("[data-diag-tab]");if(!btn)return;dragged=btn.dataset.diagTab;btn.classList.add("navtab-dragging");try{e.dataTransfer.setData("text/plain",dragged);e.dataTransfer.effectAllowed="move"}catch(_){}});
    strip.addEventListener("dragend",()=>{tabs().forEach(x=>x.classList.remove("navtab-dragging","navtab-drop-before","navtab-drop-after"));dragged="";arrangeOverflow();});
    strip.addEventListener("dragover",e=>{const target=e.target.closest("[data-diag-tab]");if(!target||!dragged||target.dataset.diagTab===dragged)return;e.preventDefault();const r=target.getBoundingClientRect(),before=e.clientX<r.left+r.width/2;tabs().forEach(x=>x.classList.remove("navtab-drop-before","navtab-drop-after"));target.classList.add(before?"navtab-drop-before":"navtab-drop-after");});
    strip.addEventListener("drop",e=>{const target=e.target.closest("[data-diag-tab]");if(!target||!dragged||target.dataset.diagTab===dragged)return;e.preventDefault();const source=tabs().find(x=>x.dataset.diagTab===dragged);if(!source)return;const r=target.getBoundingClientRect(),before=e.clientX<r.left+r.width/2;strip.insertBefore(source,before?target:target.nextSibling);save();tabs().forEach(x=>x.classList.remove("navtab-drop-before","navtab-drop-after"));arrangeOverflow();});
    more.addEventListener("click",()=>{menu.hidden=!menu.hidden});
    reset.addEventListener("click",()=>{try{localStorage.removeItem(storageKey)}catch(e){}apply(standard);save();});
    global.addEventListener("resize",arrangeOverflow);
    apply(load());
    return {version:VERSION,apply,reset:()=>{try{localStorage.removeItem(storageKey)}catch(e){}apply(standard);},getOrder:()=>tabs().map(x=>x.dataset.diagTab)};
  }
  function init(){const strip=document.getElementById("diagTabs");if(!strip)return;global.LeitstandNavigationTabOrder=initTabOrder(strip,{storageKey:"leitstand.navigation.tabs.v1"});}
  global.FrameworkNavigationTabOrderModule=Object.freeze({version:VERSION,initTabOrder});
  document.addEventListener("DOMContentLoaded",init);
})(window);
