(function(global){
  "use strict";
  const VERSION="0.1.0";
  const MAX_REGISTERED=250, MAX_ACTIVE_PER_FRAME=100;
  const transitions=new Map();
  let raf=0, motionEnabled=true;
  let reducedMotion=global.matchMedia?global.matchMedia("(prefers-reduced-motion: reduce)").matches:false;
  const easings={linear:t=>t,standard:t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2,easeOut:t=>1-Math.pow(1-t,3)};
  const clamp01=v=>Math.max(0,Math.min(1,Number(v)||0));
  function emit(name,detail){try{global.dispatchEvent(new CustomEvent(name,{detail}));}catch(_){}}
  function parseColor(v){
    if(Array.isArray(v))return v.slice(0,4);
    const s=String(v||"").trim();
    if(/^#[0-9a-f]{6}$/i.test(s))return [parseInt(s.slice(1,3),16),parseInt(s.slice(3,5),16),parseInt(s.slice(5,7),16),1];
    if(/^#[0-9a-f]{3}$/i.test(s))return [parseInt(s[1]+s[1],16),parseInt(s[2]+s[2],16),parseInt(s[3]+s[3],16),1];
    const m=s.match(/rgba?\(([^)]+)\)/i); if(m){const a=m[1].split(',').map(Number);return [a[0]||0,a[1]||0,a[2]||0,a.length>3?a[3]:1];}
    return [0,0,0,1];
  }
  function colorString(a){return `rgba(${Math.round(a[0])},${Math.round(a[1])},${Math.round(a[2])},${Math.max(0,Math.min(1,a[3]??1))})`;}
  function interpolate(from,to,t,type){
    if(type==='color'){const a=parseColor(from),b=parseColor(to);return colorString(a.map((v,i)=>v+(b[i]-v)*t));}
    return Number(from)+(Number(to)-Number(from))*t;
  }
  function currentValue(tr,now=performance.now()){
    if(!tr.startedAt)return tr.from;
    const t=clamp01((now-tr.startedAt)/Math.max(1,tr.duration));
    return interpolate(tr.from,tr.to,(easings[tr.easing]||easings.standard)(t),tr.type);
  }
  function finishRecord(tr,status='completed'){
    try{tr.onUpdate?.(tr.to,1);tr.onComplete?.(tr.to);}catch(e){emit('transition.failed',{id:tr.id,scope:tr.scope,error:String(e)});}
    transitions.delete(tr.id);emit(`transition.${status}`,{id:tr.id,scope:tr.scope,value:tr.to});
  }
  function schedule(){if(!raf&&transitions.size&&motionEnabled&&!document.hidden)raf=requestAnimationFrame(tick);}
  function tick(now){raf=0;let active=0;
    for(const tr of transitions.values()){
      if(active++>=MAX_ACTIVE_PER_FRAME)break;
      const p=clamp01((now-tr.startedAt)/Math.max(1,tr.duration));
      const e=(easings[tr.easing]||easings.standard)(p),value=interpolate(tr.from,tr.to,e,tr.type);
      try{tr.onUpdate?.(value,p);}catch(err){emit('transition.failed',{id:tr.id,scope:tr.scope,error:String(err)});transitions.delete(tr.id);continue;}
      emit('transition.updated',{id:tr.id,scope:tr.scope,progress:p,value});
      if(p>=1)finishRecord(tr);
    }
    schedule();
  }
  function start(type,options={}){
    if(!options.id)throw new Error('Transition id required');
    const id=String(options.id),scope=String(options.scope||'global');
    const existing=transitions.get(id),now=performance.now();
    const from=existing?currentValue(existing,now):options.from;
    if(existing)emit('transition.retargeted',{id,scope,from,to:options.to});
    if(transitions.size>=MAX_REGISTERED&&!existing)throw new Error('Transition limit exceeded');
    const immediate=!motionEnabled||reducedMotion&&options.reducedMotion!=='short-fade'||Number(options.duration)<=0;
    const tr={id,scope,type,from,to:options.to,duration:immediate?0:Number(options.duration||300),easing:options.easing||'standard',startedAt:now,onUpdate:options.onUpdate,onComplete:options.onComplete,interruption:options.interruption||'continue-from-current',reducedMotion:options.reducedMotion||'finish-immediately'};
    transitions.set(id,tr);emit('transition.started',{id,scope,from,to:tr.to,duration:tr.duration,type});
    if(immediate){finishRecord(tr);return id;}
    schedule();return id;
  }
  const transitionValue=o=>start('number',o), transitionColor=o=>start('color',o);
  const transitionState=o=>start(o.type||'number',o),transitionIntensity=transitionValue,transitionRotation=transitionValue,transitionPulse=transitionValue;
  function cancelTransition(id){const tr=transitions.get(String(id));if(!tr)return false;transitions.delete(String(id));emit('transition.cancelled',{id:tr.id,scope:tr.scope});return true;}
  function finishTransition(id){const tr=transitions.get(String(id));if(!tr)return false;finishRecord(tr);return true;}
  function finishAllTransitions(scope){for(const tr of [...transitions.values()])if(!scope||tr.scope===scope)finishRecord(tr);}
  function setMotionEnabled(v){motionEnabled=Boolean(v);if(!motionEnabled){finishAllTransitions();}else{schedule();}emit('transition.motion.changed',{motionEnabled,reducedMotion});}
  function setReducedMotion(v){reducedMotion=Boolean(v);if(reducedMotion)finishAllTransitions();emit('transition.motion.changed',{motionEnabled,reducedMotion});}
  function getTransitionState(id){const tr=transitions.get(String(id));return tr?{id:tr.id,scope:tr.scope,from:tr.from,to:tr.to,current:currentValue(tr),duration:tr.duration}:null;}
  function dispose(scope){for(const tr of [...transitions.values()])if(!scope||tr.scope===scope)transitions.delete(tr.id);if(!transitions.size&&raf){cancelAnimationFrame(raf);raf=0;}}
  document.addEventListener('visibilitychange',()=>{if(document.hidden){if(raf){cancelAnimationFrame(raf);raf=0;}}else schedule();});
  global.FrameworkTransitionService=Object.freeze({version:VERSION,transitionValue,transitionColor,transitionState,transitionIntensity,transitionRotation,transitionPulse,cancelTransition,finishTransition,finishAllTransitions,setMotionEnabled,setReducedMotion,getTransitionState,dispose});
})(window);