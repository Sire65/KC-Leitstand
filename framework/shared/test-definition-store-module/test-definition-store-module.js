(function(){
  "use strict";
  const VERSION="0.1.0";
  const GROUPS=[
    {id:"internet",title:"Internet",capacity:260,description:"Ziele, DNS, Protokolle, Route, TCP und Providerstrecken"},
    {id:"router",title:"Router / FRITZ!Box",capacity:160,description:"Routerstatus, WAN, DOCSIS, Importdaten und Heimnetz"},
    {id:"wifi",title:"WLAN / Mesh",capacity:140,description:"Signal, Kanal, Repeater, Roaming und Funkumgebung"},
    {id:"pc",title:"PC / System",capacity:160,description:"CPU, RAM, Speicher, Dienste, SMART und Browserlast"},
    {id:"devices",title:"Geraete",capacity:120,description:"Clients, Multimedia, Drucker, NAS und auffaellige Endgeraete"},
    {id:"quality",title:"Qualitaet",capacity:220,description:"Jitter, Paketverlust, Latenzspitzen, Bufferbloat und Stabilitaet"},
    {id:"protocol",title:"Protokoll / Analyse",capacity:140,description:"Ereignisse, Korrelation, Berichte und historische Pruefung"}
  ];
  const TESTS=[
    {id:"router",group:"router",title:"FRITZ!Box",summary:"Erreichbarkeit im Heimnetz",state:"active",interval:"5 s",executionClass:"permanent",priority:100,loadClass:"low",critical:true},
    {id:"multiPing",group:"internet",title:"Multi-Ziel-Ping",summary:"Router, Cloudflare, Google, Quad9",state:"active",interval:"15 s",executionClass:"cyclic",priority:95,loadClass:"low",critical:true},
    {id:"ipStack",group:"internet",title:"IPv4 / IPv6",summary:"Beide Protokollwege getrennt",state:"active",interval:"30 s",executionClass:"cyclic",priority:88,loadClass:"low",critical:true},
    {id:"dns",group:"internet",title:"DNS-Vergleich",summary:"System-DNS und unabhaengige Ziele",state:"active",interval:"30 s",executionClass:"cyclic",priority:86,loadClass:"low",critical:true},
    {id:"tcp",group:"internet",title:"TCP / HTTPS",summary:"Echter Verbindungsaufbau statt nur Ping",state:"active",interval:"30 s",executionClass:"cyclic",priority:70,loadClass:"medium",critical:false},
    {id:"loss",group:"quality",title:"Loss-Burst / Jitter",summary:"Median, P95, P99, Max und Verlustserien",state:"active",interval:"15 s",executionClass:"cyclic",priority:94,loadClass:"low",critical:true},
    {id:"route",group:"internet",title:"Routing / Hop-Watch",summary:"Pfadaenderungen sparsam erkennen",state:"active",interval:"5 min",executionClass:"cyclic",priority:58,loadClass:"low",critical:false},
    {id:"stream",group:"quality",title:"Streaming-Watch",summary:"Kleine kontinuierliche Datenflussprobe",state:"active",interval:"60 s",executionClass:"cyclic",priority:50,loadClass:"medium",critical:false},
    {id:"buffer",group:"quality",title:"Bufferbloat-Korrelation",summary:"Ereignisgesteuerte Kurzprobe",state:"active",interval:"bei Stoerung",executionClass:"event",priority:76,loadClass:"high",critical:false},
    {id:"fritz",group:"router",title:"FRITZ!Box WAN",summary:"WAN-Status und Uptime",state:"active",interval:"15 s",executionClass:"cyclic",priority:92,loadClass:"low",critical:true},
    {id:"system",group:"pc",title:"PC-System",summary:"CPU, RAM und Datentraeger",state:"active",interval:"5 s",executionClass:"permanent",priority:90,loadClass:"low",critical:true},
    {id:"devices",group:"devices",title:"Geraete-Matrix",summary:"Manuelle Geraete-Korrelation",state:"active",interval:"ereignisbezogen",executionClass:"manual",priority:44,loadClass:"none",critical:false}
  ];
  const EXECUTION_CLASSES=[
    {id:"permanent",title:"Permanent",description:"kleine, dauerhaft erlaubte Zustandspruefungen"},
    {id:"cyclic",title:"Zyklisch",description:"zeitgesteuerte Pruefungen mit Scheduler-Fenster"},
    {id:"event",title:"Ereignis",description:"nur bei Warnung, Stoerung oder Benutzeraktion"},
    {id:"manual",title:"Manuell",description:"nur auf Benutzerwunsch"},
    {id:"deep",title:"Tiefenanalyse",description:"schwere Pruefungen, zeitlich begrenzt"}
  ];
  const CATEGORIES=[
    {id:"reachability",area:"internet",title:"Erreichbarkeit"},{id:"protocols",area:"internet",title:"Protokolle"},{id:"routing",area:"internet",title:"Routing"},
    {id:"quality",area:"internet",title:"Qualitaet"},{id:"router",area:"router",title:"Router / WAN"},{id:"wireless",area:"wifi",title:"Funknetz / Mesh"},
    {id:"system",area:"pc",title:"PC / System"},{id:"devices",area:"devices",title:"Geraete"},{id:"analysis",area:"protocol",title:"Protokoll / Auswertung"}
  ];
  const CATEGORY_BY_TEST={router:"router",multiPing:"reachability",ipStack:"protocols",dns:"protocols",tcp:"protocols",loss:"quality",route:"routing",stream:"quality",buffer:"quality",fritz:"router",system:"system",devices:"devices"};
  const AUDIO_BY_TEST={router:{speakerVisible:true,toneId:"router-status-soft",playMode:"manual-and-alarm",defaultVolumeStep:5},loss:{speakerVisible:true,toneId:"network-warning-soft",playMode:"manual-and-alarm",defaultVolumeStep:5},fritz:{speakerVisible:true,toneId:"wan-status-soft",playMode:"manual-and-alarm",defaultVolumeStep:5}};
  function decorateTest(test){return Object.assign({},test,{area:test.group==="quality"?"internet":test.group,category:CATEGORY_BY_TEST[test.id]||"analysis",subcategory:null,tags:[],cardControls:{power:true,collapse:true,minimize:true,lock:true},design:{statusSource:"automatic",focus:"none",accentToken:"network",environmentEffect:"border",animationPolicy:"state-change-only"},audio:Object.assign({enabled:false,speakerVisible:false,toneId:null,playMode:"disabled",defaultVolumeStep:5,minVolumeStep:1,maxVolumeStep:10},AUDIO_BY_TEST[test.id]||{},AUDIO_BY_TEST[test.id]?{enabled:true}:{})})}
  const clone=value=>JSON.parse(JSON.stringify(value));
  function plannedTotal(){return GROUPS.reduce((sum,g)=>sum+g.capacity,0)}
  function plannedRows(){return GROUPS.map(g=>({id:`${g.id}-reserved`,group:g.id,title:`${g.title} - reservierte Testplaetze`,summary:`${g.capacity} Plaetze fuer kuenftige Detailtests, Vorlagen und Herstellerprofile`,state:"planned",interval:"nach Freigabe",executionClass:"planned",priority:0,loadClass:"planned",critical:false,capacity:g.capacity}))}
  function allRows(){return clone(TESTS.map(decorateTest)).concat(plannedRows())}
  function stats(){
    const byExecution={};
    TESTS.forEach(t=>{byExecution[t.executionClass]=(byExecution[t.executionClass]||0)+1});
    return {active:TESTS.length,planned:plannedTotal(),groups:GROUPS.length,byExecution};
  }
  window.FrameworkTestDefinitionStore={version:"0.2.0",groups:()=>clone(GROUPS),categories:()=>clone(CATEGORIES),tests:()=>clone(TESTS.map(decorateTest)),executionClasses:()=>clone(EXECUTION_CLASSES),plannedTotal,plannedRows,allRows,stats};
})();
