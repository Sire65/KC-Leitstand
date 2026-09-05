(function(){
  "use strict";
  const VERSION="0.1.0";
  const LOAD_WEIGHT={none:0,planned:0,low:1,medium:3,high:7};
  const CLASS_POLICY={permanent:{lane:"Dauerpruefung",maxConcurrent:4},cyclic:{lane:"Zyklus",maxConcurrent:6},event:{lane:"Ereignis",maxConcurrent:3},manual:{lane:"Manuell",maxConcurrent:2},deep:{lane:"Tiefenanalyse",maxConcurrent:1},planned:{lane:"Reserviert",maxConcurrent:0}};
  function store(){return window.FrameworkTestDefinitionStore||null}
  function tests(){return store()?.tests?.()||[]}
  function weight(test){return LOAD_WEIGHT[test.loadClass]??2}
  function plan(input){
    const active=(input||tests()).filter(t=>t.state==="active").slice().sort((a,b)=>(b.priority||0)-(a.priority||0)||String(a.id).localeCompare(String(b.id)));
    const lanes={};
    Object.keys(CLASS_POLICY).forEach(id=>lanes[id]={id,title:CLASS_POLICY[id].lane,maxConcurrent:CLASS_POLICY[id].maxConcurrent,tests:[],load:0});
    active.forEach(test=>{
      const lane=lanes[test.executionClass]||lanes.cyclic;
      lane.tests.push(test);
      lane.load+=weight(test);
    });
    const warnings=[];
    Object.values(lanes).forEach(lane=>{
      if(lane.maxConcurrent>0&&lane.tests.length>lane.maxConcurrent)warnings.push(`${lane.title}: ${lane.tests.length} Tests auf ${lane.maxConcurrent} gleichzeitige Plaetze begrenzen.`);
      if(lane.load>18)warnings.push(`${lane.title}: Last ${lane.load} staffeln.`);
    });
    const totalLoad=Object.values(lanes).reduce((sum,lane)=>sum+lane.load,0);
    return {version:VERSION,totalTests:active.length,totalLoad,lanes,warnings,policy:"PLAN_ONLY_NO_EXECUTION"};
  }
  function nextWindow(input){
    const p=plan(input);
    const order=["permanent","cyclic","event","manual","deep"];
    return order.map(id=>p.lanes[id]).filter(lane=>lane&&lane.tests.length).map(lane=>({lane:lane.id,title:lane.title,allowed:lane.maxConcurrent,take:lane.tests.slice(0,Math.max(0,lane.maxConcurrent)).map(t=>t.id),queued:Math.max(0,lane.tests.length-lane.maxConcurrent),load:lane.load}));
  }
  window.FrameworkTestSchedulerModel={version:VERSION,plan,nextWindow,policy:()=>JSON.parse(JSON.stringify(CLASS_POLICY)),loadWeight:test=>weight(test)};
})();
