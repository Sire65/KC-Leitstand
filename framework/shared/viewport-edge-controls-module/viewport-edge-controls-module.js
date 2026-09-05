(function(){
  "use strict";
  const VERSION="0.1.0";
  function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
  function level(pos,max){
    if(max<=0)return "off";
    const d=Math.min(pos,max-pos);
    if(d<=2)return "limit";
    if(d<60)return "hot";
    if(d<140)return "warn";
    return "idle";
  }
  function button(label,title,axis,dir){const b=document.createElement("button");b.type="button";b.textContent=label;b.title=title;b.dataset.axis=axis;b.dataset.dir=dir;return b}
  function create(content){
    if(!content||content.dataset.edgeControls==="ready")return null;
    content.dataset.edgeControls="ready";
    const right=document.createElement("div");right.className="viewport-edge-controls vec-right idle";right.innerHTML='<i></i>';
    right.prepend(button("▲","Nach oben","y","-1"));right.append(button("▼","Nach unten","y","1"));
    const bottom=document.createElement("div");bottom.className="viewport-edge-controls vec-bottom idle";bottom.innerHTML='<i></i>';
    bottom.prepend(button("◄","Nach links","x","-1"));bottom.append(button("►","Nach rechts","x","1"));
    document.body.append(right,bottom);
    function scroll(axis,dir){const amount=axis==="x"?Math.max(240,content.clientWidth*.45):Math.max(220,content.clientHeight*.45);content.scrollBy({left:axis==="x"?amount*dir:0,top:axis==="y"?amount*dir:0,behavior:"smooth"})}
    [right,bottom].forEach(el=>el.querySelectorAll("button").forEach(b=>b.addEventListener("click",()=>scroll(b.dataset.axis,Number(b.dataset.dir)||1))));
    function update(){
      const maxY=Math.max(0,content.scrollHeight-content.clientHeight),maxX=Math.max(0,content.scrollWidth-content.clientWidth);
      right.className="viewport-edge-controls vec-right "+level(content.scrollTop,maxY);
      bottom.className="viewport-edge-controls vec-bottom "+level(content.scrollLeft,maxX);
      right.hidden=maxY<=0;bottom.hidden=maxX<=0;
    }
    content.addEventListener("scroll",update,{passive:true});window.addEventListener("resize",update);setTimeout(update,80);setInterval(update,1500);
    return {version:VERSION,update};
  }
  function init(){window.LeitstandViewportEdgeControls=create(document.getElementById("mainContent")||document.querySelector(".content"));}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
  window.FrameworkViewportEdgeControls={version:VERSION,create};
})();
