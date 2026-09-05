(function(){
  "use strict";
  const VERSION="0.1.7";
  const MIN_HEIGHT=86;
  const MIN_WIDTH=320;
  const STATUS_BAR=30;
  const RULES=Object.freeze({minHeight:MIN_HEIGHT,minWidth:MIN_WIDTH,statusBarReserve:STATUS_BAR,greenUntil:.72,yellowFrom:.72,orangeFrom:.86,redFrom:.96,mode:"edge-resize",forbidden:["measurement-start","sensor-mutation","probe-execution","app-js-dependency"]});
  function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
  function edgeState(value,max){if(max<=0)return "active";const p=value/max;if(p>=.96)return "limit";if(p>=.86)return "hot";if(p>=.72)return "warn";return "active"}
  function makeBtn(text,axis,dir){const b=document.createElement("button");b.type="button";b.textContent=text;b.dataset.axis=axis;b.dataset.dir=String(dir);return b}
  function create(content){
    if(!content||content.dataset.panFrame==="ready")return null;
    content.dataset.panFrame="ready";
    const surface=content.closest(".main")||content;
    surface.dataset.panFrameSurface="ready";
    const root=document.documentElement;
    const right=document.createElement("div");right.className="viewport-pan-frame pan-right";right.innerHTML='<div class="pan-line"></div><div class="pan-grip" title="Rechte Fensterkante links/rechts ziehen"></div><output>0 px</output>';
    right.prepend(makeBtn("◄","right",1));right.append(makeBtn("►","right",-1));
    const bottom=document.createElement("div");bottom.className="viewport-pan-frame pan-bottom";bottom.innerHTML='<div class="pan-line"></div><div class="pan-grip" title="Untere Fensterkante hoch/runter ziehen"></div><output>0 px</output>';
    bottom.prepend(makeBtn("▲","bottom",1));bottom.append(makeBtn("▼","bottom",-1));
    document.body.append(right,bottom);
    let dragging=null;
    const state={bottom:0,right:0};
    function limits(){
      const r=surface.getBoundingClientRect();
      const availableH=Math.max(MIN_HEIGHT,window.innerHeight-r.top-STATUS_BAR);
      const availableW=Math.max(MIN_WIDTH,window.innerWidth-r.left);
      return {bottom:Math.max(0,availableH-MIN_HEIGHT),right:Math.max(0,availableW-MIN_WIDTH),top:r.top,left:r.left,availableH,availableW};
    }
    function apply(){
      const lim=limits();
      state.bottom=clamp(state.bottom,0,lim.bottom);
      state.right=clamp(state.right,0,lim.right);
      root.style.setProperty("--viewport-pan-bottom",Math.round(state.bottom)+"px");
      root.style.setProperty("--viewport-pan-right",Math.round(state.right)+"px");
      const h=Math.max(MIN_HEIGHT,lim.availableH-state.bottom)+"px"; const w=Math.max(MIN_WIDTH,lim.availableW-state.right)+"px"; surface.style.setProperty("height",h,"important"); surface.style.setProperty("max-height",h,"important"); content.style.setProperty("height",h,"important"); content.style.setProperty("max-height",h,"important"); surface.style.setProperty("width",w,"important"); surface.style.setProperty("max-width",w,"important"); surface.style.setProperty("min-width",MIN_WIDTH+"px","important"); content.style.setProperty("width","100%","important"); content.style.setProperty("max-width","100%","important"); content.style.setProperty("min-width",MIN_WIDTH+"px","important"); content.style.setProperty("overflow","auto","important");
      bottom.dataset.state=edgeState(state.bottom,lim.bottom);
      right.dataset.state=edgeState(state.right,lim.right);
      bottom.querySelector("output").textContent=Math.round(state.bottom)+" / "+Math.round(lim.bottom)+" px";
      right.querySelector("output").textContent=Math.round(state.right)+" / "+Math.round(lim.right)+" px";
      bottom.hidden=false;right.hidden=false;
    }
    function show(el){el.classList.add("pan-show");apply()}
    function hide(el){if(!dragging)el.classList.remove("pan-show")}
    function step(edge,dir){const amount=edge==="bottom"?48:64;state[edge]=clamp(state[edge]+amount*dir,0,limits()[edge]);apply();(edge==="bottom"?bottom:right).classList.add("pan-show")}
    [right,bottom].forEach(el=>{
      const edge=el.classList.contains("pan-bottom")?"bottom":"right";
      el.addEventListener("mouseenter",()=>show(el));
      el.addEventListener("mouseleave",()=>hide(el));
      el.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>step(b.dataset.axis,Number(b.dataset.dir)||1)));
      const grip=el.querySelector(".pan-grip");
      grip.addEventListener("pointerdown",ev=>{ev.preventDefault();dragging={edge,startX:ev.clientX,startY:ev.clientY,origin:state[edge],el};el.classList.add("pan-show","pan-drag");try{grip.setPointerCapture(ev.pointerId)}catch(_){}});
    });
    window.addEventListener("pointermove",ev=>{
      if(!dragging)return;
      if(dragging.edge==="bottom")state.bottom=clamp(dragging.origin-(ev.clientY-dragging.startY),0,limits().bottom);
      else state.right=clamp(dragging.origin-(ev.clientX-dragging.startX),0,limits().right);
      apply();
    });
    window.addEventListener("pointerup",()=>{if(!dragging)return;const el=dragging.el;dragging=null;el.classList.remove("pan-drag","pan-show")});
    window.addEventListener("resize",apply);setTimeout(apply,120);
    return {version:VERSION,apply,getState:()=>Object.assign({},state)};
  }
  function init(){window.LeitstandViewportPanFrame=create(document.getElementById("mainContent")||document.querySelector(".content"));}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
  window.FrameworkViewportPanFrame={version:VERSION,create,rules:RULES};
})();



