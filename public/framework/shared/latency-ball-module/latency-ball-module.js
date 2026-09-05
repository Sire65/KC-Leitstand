(function(global){
  "use strict";
  const VERSION="0.2.0";
  const DEFAULTS={warningMs:80,criticalMs:180,maxSamples:160,size:220,animation:true,gravity:.36,bounce:.84,demo:false};
  const clamp=(v,min,max)=>Math.min(max,Math.max(min,Number(v)||min));
  const TEST_LABELS={router:"FRITZ!Box",network:"Netzwerk",cloud:"Internetziele",wlan:"Paketverlust / Jitter",server:"PC-System",lag:"Browser-Lag",training:"Schulung / Demo"};
  function createEngine(options={}){
    const settings=Object.assign({},DEFAULTS,options.settings||{});
    const samples=Array.isArray(options.samples)?options.samples.slice():[];
    let running=false,velocity=0,position=.52,raf=0,last=0,demoPhase=0,currentTest="training";
    const listeners=new Set();
    function emit(type,detail){listeners.forEach(fn=>{try{fn({type,detail});}catch(_){}});try{global.dispatchEvent(new CustomEvent(`latency-ball.${type}`,{detail}));}catch(_){}}
    function statusFor(ms){return ms>=settings.criticalMs?"critical":ms>=settings.warningMs?"warn":"ok";}
    function latest(){return samples.at(-1)||null;}
    function currentLatency(){const l=latest();if(l)return l.latencyMs;if(settings.demo)return 35+Math.abs(Math.sin(demoPhase*.8))*185;return 0;}
    function statistics(){const avg=samples.length?samples.reduce((s,x)=>s+x.latencyMs,0)/samples.length:currentLatency(),l=latest(),lat=l?l.latencyMs:avg;return {version:VERSION,total:samples.length,latest:l,average:avg,latencyMs:lat,status:statusFor(lat),position,velocity,running,currentTest,testLabel:TEST_LABELS[currentTest]||currentTest||"Messung",demo:!!settings.demo};}
    function tick(t){
      if(!running)return;
      const dt=Math.min(34,t-(last||t));last=t;if(settings.demo)demoPhase+=dt/1000;
      const latency=currentLatency(),intensity=clamp(latency/settings.criticalMs,0,1.8),speed=1+intensity*1.75;
      velocity+=settings.gravity*speed*dt/16;position+=velocity*dt/(285-95*Math.min(1,intensity));
      if(position>1){position=1;velocity=-Math.abs(velocity)*(settings.bounce+.05*Math.min(1,intensity));emit("bounce",statistics());}
      if(position<0){position=0;velocity=Math.abs(velocity)*settings.bounce;}
      emit("frame",statistics());raf=global.requestAnimationFrame(tick);
    }
    const api={version:VERSION,settings,
      addSample(latencyMs,details={}){const sample={latencyMs:Math.max(0,Number(latencyMs)||0),jitterMs:Math.max(0,Number(details.jitterMs)||0),packetLossPercent:Math.max(0,Number(details.packetLossPercent)||0),group:details.group||"network",label:details.label||details.test||details.group||"Messung",timestamp:details.timestamp||new Date().toISOString(),source:details.source||"manual"};currentTest=sample.group||sample.label||"network";samples.push(sample);if(samples.length>settings.maxSamples)samples.splice(0,samples.length-settings.maxSamples);const intensity=clamp(sample.latencyMs/settings.criticalMs,0,1.8);velocity-=Math.min(2.6,.42+intensity*1.45);emit("sample",sample);emit("statistics",statistics());return sample;},
      setLatency(ms,details){return this.addSample(ms,details);},exportStatistics:statistics,statusFor,
      start(){if(running)return;running=true;last=0;raf=global.requestAnimationFrame(tick);emit("cycle",{running});},
      stop(){running=false;if(raf)global.cancelAnimationFrame(raf);raf=0;emit("cycle",{running});},
      reset(){samples.splice(0);position=.52;velocity=0;demoPhase=0;emit("reset",statistics());},
      setAnimation(v){const next=Boolean(v);if(settings.animation===next)return;settings.animation=next;if(!settings.animation)this.stop();else this.start();emit("settings",Object.assign({},settings));},
      setDemo(v){const next=Boolean(v);if(settings.demo===next)return;settings.demo=next;if(settings.demo){currentTest="training";this.start()}emit("settings",Object.assign({},settings));},
      setSize(v){settings.size=clamp(v,150,520);emit("settings",Object.assign({},settings));},
      getSamples(){return samples.slice();},subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);},
      toJSON(){return {version:VERSION,settings:Object.assign({},settings),samples:samples.slice(),state:{position,velocity,running,currentTest}};}
    };
    return api;
  }
  function drawGrid(ctx,w,h,stats){
    const horizon=h*.47,base=h*.82,amp=(stats.status==="critical"?24:stats.status==="warn"?16:8),phase=(performance.now()/380)*(stats.running?1:0);
    ctx.save();ctx.strokeStyle="rgba(210,226,232,.42)";ctx.lineWidth=1;
    for(let i=-8;i<=8;i++){const x=w*.5+i*w*.07;ctx.beginPath();ctx.moveTo(x,horizon);ctx.lineTo(w*.5+i*w*.16,base);ctx.stroke();}
    for(let j=0;j<9;j++){const t=j/8,y=horizon+t*(base-horizon),half=w*(.15+t*.48),wave=Math.sin(j*.9+phase)*amp*(1-t*.35);ctx.beginPath();for(let i=0;i<=48;i++){const p=i/48,x=w*.5-half+p*half*2,yy=y+Math.sin((p*2-1)*Math.PI*2+phase)*wave*(.28+.72*t);i?ctx.lineTo(x,yy):ctx.moveTo(x,yy)}ctx.stroke();}
    ctx.restore();
  }
  function drawScale(ctx,w,h,stats){
    const x=w-18,y=h*.20,bh=h*.58,grad=ctx.createLinearGradient(0,y+bh,0,y);grad.addColorStop(0,"#2cdb74");grad.addColorStop(.48,"#ffd02f");grad.addColorStop(1,"#ff4c3e");ctx.fillStyle=grad;ctx.fillRect(x,y,7,bh);ctx.strokeStyle="rgba(255,255,255,.5)";ctx.strokeRect(x,y,7,bh);const p=clamp(stats.latencyMs/(stats.average>stats.latencyMs?stats.average:180),0,1);ctx.fillStyle="#fff";ctx.beginPath();ctx.moveTo(x-5,y+bh-bh*p);ctx.lineTo(x-1,y+bh-bh*p-4);ctx.lineTo(x-1,y+bh-bh*p+4);ctx.fill();
  }
  function draw(canvas,engine){
    if(!canvas||!engine)return;const ctx=canvas.getContext("2d");if(!ctx)return;const size=engine.settings.size,dpr=global.devicePixelRatio||1,stats=engine.exportStatistics();
    const w=Math.round(size*1.55),h=size;canvas.width=w*dpr;canvas.height=h*dpr;canvas.style.width=w+"px";canvas.style.height=h+"px";ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
    const bg=ctx.createLinearGradient(0,0,0,h);bg.addColorStop(0,"#070a0d");bg.addColorStop(.55,"#11171c");bg.addColorStop(1,"#050607");ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
    ctx.fillStyle="rgba(220,232,238,.9)";ctx.font="700 13px system-ui,Arial";ctx.textAlign="left";ctx.fillText(stats.testLabel,w*.06,22);ctx.font="600 11px system-ui,Arial";ctx.fillStyle="rgba(220,232,238,.68)";ctx.fillText(`${Math.round(stats.latencyMs||0)} ms · ${stats.status.toUpperCase()}${stats.demo?" · DEMO":""}`,w*.06,40);
    drawGrid(ctx,w,h,stats);
    const color=stats.status==="critical"?"#ff4c3e":stats.status==="warn"?"#ffd02f":"#2cdb74",x=w*.50,y=h*.28+stats.position*h*.45,r=h*.095;
    ctx.fillStyle="rgba(0,0,0,.42)";ctx.beginPath();ctx.ellipse(x,h*.84,r*1.7,r*.28,0,0,Math.PI*2);ctx.fill();
    const g=ctx.createRadialGradient(x-r*.35,y-r*.45,r*.08,x,y,r*1.2);g.addColorStop(0,"#ffffff");g.addColorStop(.2,"#cfd6d9");g.addColorStop(.52,"#4b555a");g.addColorStop(.78,"#11171a");g.addColorStop(1,"#d7dde0");ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.strokeStyle="rgba(255,255,255,.55)";ctx.lineWidth=1.2;ctx.stroke();
    ctx.strokeStyle="rgba(255,255,255,.35)";ctx.lineWidth=.7;for(let i=-2;i<=2;i++){ctx.beginPath();ctx.ellipse(x,y,r*(1-Math.abs(i)*.08),r*.28,0,0,Math.PI*2);ctx.stroke()}for(let i=-2;i<=2;i++){ctx.beginPath();ctx.ellipse(x,y,r*.25,r,0,0,Math.PI*2);ctx.stroke();ctx.rotate(0)}
    ctx.shadowColor=color;ctx.shadowBlur=16;ctx.strokeStyle=color;ctx.beginPath();ctx.arc(x,y,r+3,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;drawScale(ctx,w,h,stats);
  }
  class LatencyBallElement extends HTMLElement{constructor(){super();this.attachShadow({mode:"open"});this.engine=createEngine();this._unsub=this.engine.subscribe(()=>this.render());}connectedCallback(){this.engine.start();this.render();}disconnectedCallback(){this._unsub?.();this.engine.stop();}addSample(ms,details){return this.engine.addSample(ms,details);}setLatency(ms,details){return this.engine.setLatency(ms,details);}exportStatistics(){return this.engine.exportStatistics();}start(){this.engine.start();}stop(){this.engine.stop();}render(){this.shadowRoot.innerHTML=`<style>:host{display:inline-grid;place-items:center}</style><canvas></canvas>`;draw(this.shadowRoot.querySelector("canvas"),this.engine);}}
  if(global.customElements&&!global.customElements.get("latency-ball-module"))global.customElements.define("latency-ball-module",LatencyBallElement);
  global.FrameworkLatencyBallModule=Object.freeze({version:VERSION,createEngine,draw});
})(window);

