(function(){
  "use strict";
  const VERSION="0.2.0";
  const AREAS=[
    {id:"global",title:"Kopfzeile / Gesamtstatus",allowDetailTests:false,description:"Nur globale Ampeln, Summen und Warnhinweise. Keine Detailtest-Duplikate."},
    {id:"internet",title:"Internet",allowDetailTests:true,description:"Provider, Ziele, DNS, Protokolle, Routing und Verbindungsqualitaet."},
    {id:"router",title:"FRITZ!Box / Router",allowDetailTests:true,description:"Router, WAN, DOCSIS, Heimnetz und Router-Importdaten."},
    {id:"wifi",title:"WLAN / Mesh",allowDetailTests:true,description:"Funknetz, Mesh, Repeater, Kanal, Signal und Roaming."},
    {id:"pc",title:"PC / System",allowDetailTests:true,description:"CPU, RAM, Speicher, Dienste, SMART und lokaler Browser."},
    {id:"devices",title:"Geraete / Drucker / NAS",allowDetailTests:true,description:"Drucker, NAS, Multimedia, Clients und manuelle Geraetekorrelation."},
    {id:"protocol",title:"Protokoll / Auswertung",allowDetailTests:true,description:"Ereignisse, Berichte, Historie, Ursachenbewertung."}
  ];
  const OWNERS={router:{area:"router",page:"router",kind:"detail",mayMirrorInHeader:true},fritz:{area:"router",page:"router",kind:"detail",mayMirrorInHeader:true},multiPing:{area:"internet",page:"internet",kind:"detail",mayMirrorInHeader:true},ipStack:{area:"internet",page:"internet",kind:"detail",mayMirrorInHeader:false},dns:{area:"internet",page:"internet",kind:"detail",mayMirrorInHeader:false},tcp:{area:"internet",page:"internet",kind:"detail",mayMirrorInHeader:false},loss:{area:"internet",page:"internet",kind:"quality",mayMirrorInHeader:true},route:{area:"internet",page:"internet",kind:"detail",mayMirrorInHeader:false},stream:{area:"internet",page:"internet",kind:"quality",mayMirrorInHeader:false},buffer:{area:"internet",page:"internet",kind:"quality",mayMirrorInHeader:false},system:{area:"pc",page:"pc",kind:"detail",mayMirrorInHeader:true},devices:{area:"devices",page:"devices",kind:"detail",mayMirrorInHeader:true}};
  const MIRROR_RULES={globalHeader:{allowedKinds:["summary","alarm","heartbeat"],forbiddenKinds:["detail","table","chart"],note:"Kopfzeile darf Status spiegeln, aber keine Detailtests duplizieren."},crossArea:{allowed:false,note:"Fachtests bleiben in ihrem Besitzerbereich. Andere Seiten duerfen nur globale Kurzampeln anzeigen."}};
  const RULES=Object.freeze({singleOwnerPerTest:true,crossAreaDetails:false,headerSummaryOnly:true,unknownTestsGoTo:"protocol",forbidden:["measurement-start","sensor-mutation","probe-execution","app-js-dependency"]});
  function clone(value){return JSON.parse(JSON.stringify(value))}
  function area(id){return AREAS.find(x=>x.id===id)||AREAS[0]}
  function owner(testId){return Object.assign({area:"protocol",page:"protocol",kind:"detail",mayMirrorInHeader:false},OWNERS[testId]||{})}
  function decorate(test){const o=owner(test.id);return Object.assign({},test,{ownerArea:o.area,ownerPage:o.page,ownerKind:o.kind,mayMirrorInHeader:!!o.mayMirrorInHeader})}
  function decorateTests(tests){return (tests||[]).map(decorate)}
  function canPlace(testId,pageId,mode){const o=owner(testId);if(pageId==="overview")return mode==="summary"||o.mayMirrorInHeader;if(pageId==="global")return mode==="summary"&&o.mayMirrorInHeader;return o.page===pageId}
  function violations(assignments){return (assignments||[]).filter(item=>!canPlace(item.testId,item.pageId,item.mode||"detail")).map(item=>({testId:item.testId,pageId:item.pageId,reason:"Test gehoert fachlich zu "+owner(item.testId).page}))}
  function ownerMap(){const map={};Object.keys(OWNERS).forEach(id=>map[id]=owner(id));return map}
  window.FrameworkTestOwnershipMatrix={version:VERSION,rules:()=>clone(RULES),areas:()=>clone(AREAS),area,owner,ownerMap,decorate,decorateTests,canPlace,violations,mirrorRules:()=>clone(MIRROR_RULES)};
})();
