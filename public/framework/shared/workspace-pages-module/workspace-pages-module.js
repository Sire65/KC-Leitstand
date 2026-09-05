(function(){
  "use strict";
  const VERSION="0.2.0";
  const PAGES=[
    {id:"overview",title:"Seite 1 - Ueberblick",role:"overview",headerStrip:true,allowedAreas:["global"],summaryTests:["multiPing","router","system","devices"],detailTests:[],description:"Nur globale Kurzlage und Pflichtstatus, keine Detailtest-Duplikate."},
    {id:"internet",title:"Seite 2 - Internet",role:"detail",headerStrip:true,allowedAreas:["internet"],summaryTests:["multiPing"],detailTests:["multiPing","ipStack","dns","tcp","loss","route","stream","buffer"],description:"Internet, DNS, Protokolle, Routing und Qualitaet."},
    {id:"router",title:"Seite 3 - FRITZ!Box / Kabel",role:"detail",headerStrip:true,allowedAreas:["router"],summaryTests:["router","fritz"],detailTests:["router","fritz"],description:"Router, WAN, DOCSIS und Anschlusszustand."},
    {id:"wifi",title:"Seite 4 - WLAN / Mesh",role:"detail",headerStrip:true,allowedAreas:["wifi"],summaryTests:[],detailTests:[],description:"Funknetz, Kanaele, Mesh und WLAN-Geraete."},
    {id:"pc",title:"Seite 5 - PC / System",role:"detail",headerStrip:true,allowedAreas:["pc"],summaryTests:["system"],detailTests:["system"],description:"Lokaler PC, Speicher, SMART, Browser und Dienste."},
    {id:"devices",title:"Seite 6 - Geraete",role:"detail",headerStrip:true,allowedAreas:["devices"],summaryTests:["devices"],detailTests:["devices"],description:"Drucker, NAS, Multimedia, Clients und Geraetematrix."},
    {id:"protocol",title:"Seite 7 - Protokoll",role:"analysis",headerStrip:true,allowedAreas:["protocol"],summaryTests:[],detailTests:[],description:"Ereignisse, Historie, Ursachen und Berichte."}
  ];
  const RULES=Object.freeze({noCrossAreaDetailDuplication:true,overviewSummaryOnly:true,pageHeaderMayMirrorSummary:true,scaleTarget:"1000+ tests",forbidden:["measurement-start","sensor-mutation","probe-execution","app-js-dependency"]});
  function clone(value){return JSON.parse(JSON.stringify(value))}
  function ownership(){return window.FrameworkTestOwnershipMatrix||null}
  function layout(){return window.FrameworkTestCardLayoutSpec||null}
  function store(){return window.FrameworkTestDefinitionStore||null}
  function pages(){return clone(PAGES)}
  function page(id){return clone(PAGES.find(x=>x.id===id)||PAGES[0])}
  function pageForTest(testId){const owner=ownership()?.owner?.(testId);return owner?.page||"protocol"}
  function assignments(){const result=[];PAGES.forEach(p=>{(p.summaryTests||[]).forEach(testId=>result.push({pageId:p.id,testId,mode:"summary"}));(p.detailTests||[]).forEach(testId=>result.push({pageId:p.id,testId,mode:"detail"}))});return result}
  function validate(){return ownership()?.violations?.(assignments())||[]}
  function decorate(test){return Object.assign({},test,{workspacePage:pageForTest(test.id)})}
  function decorateTests(tests){return (tests||[]).map(decorate)}
  function matrix(tests){
    const decorated=decorateTests(tests||store()?.tests?.()||[]).map(t=>ownership()?.decorate?.(t)||t);
    return PAGES.map(p=>{
      const detail=decorated.filter(t=>pageForTest(t.id)===p.id);
      const plan=layout()?.placementPlan?.(detail)||{rows:[],rowCount:0,estimatedHeightPx:0};
      return Object.assign(clone(p),{detailCount:detail.length,summaryCount:(p.summaryTests||[]).length,tests:detail.map(t=>t.id),layoutPlan:plan});
    });
  }
  function matrixSummary(tests){const rows=matrix(tests);return {pages:rows.length,totalDetailTests:rows.reduce((s,p)=>s+p.detailCount,0),violations:validate(),pagesWithCards:rows.filter(p=>p.detailCount>0).length,rows}}
  window.FrameworkWorkspacePages={version:VERSION,rules:()=>clone(RULES),pages,page,pageForTest,assignments,validate,decorate,decorateTests,matrix,matrixSummary};
})();
