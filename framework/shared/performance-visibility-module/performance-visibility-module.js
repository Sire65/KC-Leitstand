(function(){
  "use strict";
  const VERSION="0.1.0";
  const state={documentVisible:!document.hidden,workspaceOpen:false,managementOpen:false,reducedMotion:!!window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches,longTasks:0,lastLongTaskMs:0,selfLoad:"normal"};
  const clone=()=>Object.assign({},state);
  function emit(reason){document.documentElement.dataset.leitstandVisibility=state.documentVisible?"visible":"hidden";document.documentElement.dataset.leitstandSelfLoad=state.selfLoad;window.dispatchEvent(new CustomEvent("leitstand:performance-policy",{detail:Object.assign({reason},clone())}))}
  function setWorkspaceOpen(open){state.workspaceOpen=!!open;emit("workspace")}
  function setManagementOpen(open){state.managementOpen=!!open;emit("management")}
  function setSelfLoad(level){if(!["normal","elevated","analysis"].includes(level))return false;state.selfLoad=level;emit("self-load");return true}
  function shouldRenderDetail(element){return state.documentVisible&&!state.reducedMotion&&!element?.classList?.contains("workspace-layout-hidden")&&!element?.classList?.contains("workspace-card-collapsed")&&!element?.classList?.contains("workspace-card-minimized")}
  function animationBudget(element){if(!shouldRenderDetail(element))return 0;return element?.dataset?.continuousAnimation==="true"?30:1}
  document.addEventListener("visibilitychange",()=>{state.documentVisible=!document.hidden;emit("document-visibility")},{passive:true});
  const media=window.matchMedia?.("(prefers-reduced-motion: reduce)");media?.addEventListener?.("change",event=>{state.reducedMotion=!!event.matches;emit("reduced-motion")});
  let observer=null;
  function observeLongTasks(on){
    if(!on){observer?.disconnect();observer=null;return}
    if(observer||typeof PerformanceObserver==="undefined")return;
    try{observer=new PerformanceObserver(list=>{for(const entry of list.getEntries()){state.longTasks++;state.lastLongTaskMs=Math.round(entry.duration);if(entry.duration>=50)state.selfLoad="elevated"}emit("long-task")});observer.observe({entryTypes:["longtask"]})}catch(_){observer=null}
  }
  window.addEventListener("testworkspace:rendered",()=>observeLongTasks(true));
  window.FrameworkPerformanceVisibility={version:VERSION,mode:"EVENT_DRIVEN",getState:clone,setWorkspaceOpen,setManagementOpen,setSelfLoad,shouldRenderDetail,animationBudget,observeLongTasks,budgets:()=>({backgroundAnimationFps:0,hiddenCardAnimationFps:0,minimizedCardDetailRenderFps:0,visiblePassiveCardMaxFps:1,visibleAnimatedCardMaxFps:30,independentCardTimers:0,longTaskWarningMs:50})};
  emit("init");
})();
