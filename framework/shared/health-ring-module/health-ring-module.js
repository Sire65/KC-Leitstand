(function(global){
  "use strict";
  const VERSION="0.1.0";
  const STATUS={
    ok:{label:"OK",color:"#32b45f",weight:0},
    warn:{label:"Warnung",color:"#f2c94c",weight:1},
    critical:{label:"Kritisch",color:"#f2994a",weight:2},
    alarm:{label:"Alarm",color:"#d64545",weight:3},
    maintenance:{label:"Wartung",color:"#2f80ed",weight:.5}
  };
  const GROUPS={
    network:"Netzwerk",
    server:"Server",
    clients:"Clients",
    wlan:"WLAN",
    security:"Sicherheit",
    cloud:"Cloud",
    maintenance:"Wartung"
  };
  const DEFAULTS={ringSize:240,pixelSize:8,rings:2,maxResults:180,animation:true,groupFilter:"all",showCenter:true};
  const clamp=(v,min,max)=>Math.min(max,Math.max(min,Number(v)||min));
  const esc=v=>String(v??"");
  function nowIso(){return new Date().toISOString();}
  function trendOf(results){
    if(results.length<6)return "neutral";
    const half=Math.floor(results.length/2),a=avgRisk(results.slice(0,half)),b=avgRisk(results.slice(half));
    if(b-a>.35)return "worse";
    if(a-b>.35)return "better";
    return "stable";
  }
  function avgRisk(results){
    if(!results.length)return 0;
    return results.reduce((sum,r)=>sum+(STATUS[r.status]?.weight??1),0)/results.length;
  }
  function createEngine(options={}){
    const settings=Object.assign({},DEFAULTS,options.settings||{});
    let running=Boolean(options.running),results=Array.isArray(options.results)?options.results.slice():[];
    const listeners=new Set();
    const visible=()=>settings.groupFilter==="all"?results.slice():results.filter(r=>r.group===settings.groupFilter);
    function emit(type,detail){
      const event={type,detail};
      listeners.forEach(fn=>{try{fn(event);}catch(_){}});
      try{global.dispatchEvent(new CustomEvent(`health-ring.${type}`,{detail}));}catch(_){}
    }
    function statistics(){
      const data=visible(),counts=Object.fromEntries(Object.keys(STATUS).map(k=>[k,0])),groups=Object.fromEntries(Object.keys(GROUPS).map(k=>[k,0]));
      data.forEach(r=>{if(counts[r.status]!=null)counts[r.status]+=1;if(groups[r.group]!=null)groups[r.group]+=1;});
      const total=data.length,okRate=total?counts.ok/total:1,riskScore=total?avgRisk(data):0;
      return {version:VERSION,running,filter:settings.groupFilter,total,counts,groups,okRate,riskScore,trend:trendOf(data),latest:data.at(-1)||null};
    }
    const api={
      version:VERSION,
      statusCatalog:STATUS,
      groupCatalog:GROUPS,
      settings,
      addResult(status,details={}){
        const normalized=STATUS[status]?status:"warn";
        const result={id:details.id||`hr-${Date.now()}-${Math.random().toString(16).slice(2)}`,status:normalized,group:GROUPS[details.group]?details.group:"network",label:details.label||STATUS[normalized].label,timestamp:details.timestamp||nowIso(),source:details.source||"manual",meta:details.meta||{}};
        results.push(result);
        if(results.length>settings.maxResults)results.splice(0,results.length-settings.maxResults);
        emit("result",result);emit("statistics",statistics());
        return result;
      },
      resetCycle(){results=[];emit("reset",statistics());},
      startCycle(){running=true;emit("cycle",{running});},
      stopCycle(){running=false;emit("cycle",{running});},
      exportStatistics:statistics,
      setRingSize(v){settings.ringSize=clamp(v,120,520);emit("settings",Object.assign({},settings));},
      setPixelSize(v){settings.pixelSize=clamp(v,4,22);emit("settings",Object.assign({},settings));},
      setAnimation(v){settings.animation=Boolean(v);emit("settings",Object.assign({},settings));},
      setGroupFilter(v){settings.groupFilter=v==="all"||GROUPS[v]?v:"all";emit("settings",Object.assign({},settings));},
      showStatistics(){settings.showStatistics=true;emit("settings",Object.assign({},settings));},
      hideStatistics(){settings.showStatistics=false;emit("settings",Object.assign({},settings));},
      getResults(){return results.slice();},
      getVisibleResults:visible,
      subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);},
      toJSON(){return {version:VERSION,running,settings:Object.assign({},settings),results:results.slice()};}
    };
    return api;
  }
  function draw(canvas,engine){
    if(!canvas||!engine)return;
    const ctx=canvas.getContext("2d");if(!ctx)return;
    const settings=engine.settings,size=settings.ringSize,dpr=global.devicePixelRatio||1,center=size/2;
    canvas.width=size*dpr;canvas.height=size*dpr;canvas.style.width=size+"px";canvas.style.height=size+"px";
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,size,size);
    ctx.strokeStyle="#d8e1e5";ctx.lineWidth=1;
    for(let i=1;i<=settings.rings;i++){ctx.beginPath();ctx.arc(center,center,(size*.37/settings.rings)*i,0,Math.PI*2);ctx.stroke();}
    const results=engine.getVisibleResults(),slots=Math.max(24,Math.ceil(results.length/Math.max(1,settings.rings)));
    results.forEach((r,index)=>{
      const ring=index%settings.rings,angle=((Math.floor(index/settings.rings)%slots)/slots)*Math.PI*2-Math.PI/2,radius=size*.37-ring*settings.pixelSize*2.2;
      ctx.fillStyle=STATUS[r.status]?.color||STATUS.warn.color;ctx.beginPath();ctx.arc(center+Math.cos(angle)*radius,center+Math.sin(angle)*radius,settings.pixelSize/2,0,Math.PI*2);ctx.fill();
    });
    if(settings.showCenter!==false){
      const stats=engine.exportStatistics(),label=stats.trend==="worse"?"UP":stats.trend==="better"?"DOWN":"OK";
      ctx.fillStyle="#fff";ctx.strokeStyle="#cbd7dd";ctx.beginPath();ctx.arc(center,center,32,0,Math.PI*2);ctx.fill();ctx.stroke();
      ctx.fillStyle="#18212a";ctx.font="700 14px system-ui,Arial";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(label,center,center);
    }
  }
  class HealthRingElement extends HTMLElement{
    constructor(){super();this.attachShadow({mode:"open"});this.engine=createEngine();this._unsub=this.engine.subscribe(()=>this.render());}
    connectedCallback(){this.render();}
    disconnectedCallback(){this._unsub?.();}
    addResult(status,details){return this.engine.addResult(status,details);}
    resetCycle(){return this.engine.resetCycle();}
    startCycle(){return this.engine.startCycle();}
    stopCycle(){return this.engine.stopCycle();}
    exportStatistics(){return this.engine.exportStatistics();}
    setRingSize(v){this.engine.setRingSize(v);this.render();}
    setPixelSize(v){this.engine.setPixelSize(v);this.render();}
    setAnimation(v){this.engine.setAnimation(v);}
    render(){
      this.shadowRoot.innerHTML=`<style>:host{display:inline-grid;place-items:center}.wrap{display:grid;place-items:center}.meta{font:12px system-ui;color:#526673;text-align:center;margin-top:6px}</style><div class="wrap"><canvas></canvas><div class="meta"></div></div>`;
      const c=this.shadowRoot.querySelector("canvas"),m=this.shadowRoot.querySelector(".meta"),s=this.engine.exportStatistics();
      draw(c,this.engine);m.textContent=`${s.total} Tests · ${Math.round(s.okRate*100)} % OK · ${esc(s.trend)}`;
    }
  }
  if(global.customElements&&!global.customElements.get("health-ring-module"))global.customElements.define("health-ring-module",HealthRingElement);
  global.FrameworkHealthRingModule=Object.freeze({version:VERSION,createEngine,draw,statusCatalog:STATUS,groupCatalog:GROUPS});
})(window);
