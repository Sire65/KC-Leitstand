(function(){
  "use strict";
  const VERSION="0.2.0";
  const GRID={columns:6,rowUnitPx:42,gapPx:10,widths:{S:1,M:2,L:3,XL:4},heights:{S:2,M:3,L:4,XL:6}};
  const SIZE_RULES={
    S:"Kompaktkarte fuer Ampel, Einzelwert oder kleinen Status.",
    M:"Standardkarte fuer Status plus 2-4 Kennwerte.",
    L:"Breite Karte fuer Tabellen, Verlauf oder mehrere Ziele.",
    XL:"Maximale Fachkarte fuer Pfade, Geraetematrix oder umfangreiche Tabellen."
  };
  const VIEW_TYPES={status:"Kompaktstatus",gauge:"Rundinstrument",table:"Status + Tabelle",chart:"Verlauf / Diagramm",log:"Protokoll / Liste"};
  const DEFAULT_SPEC={width:"M",height:"M",minWidth:"S",maxWidth:"XL",minHeight:"S",maxHeight:"XL",view:"status",allowBesideXL:true};
  const SPECS={
    router:{width:"S",height:"M",view:"gauge",reason:"Routerstatus ist schnell erfassbar."},
    multiPing:{width:"L",height:"M",view:"table",reason:"Mehrere Ziele brauchen nebeneinander Werte."},
    ipStack:{width:"M",height:"S",view:"status",reason:"IPv4/IPv6 passen als kompakte Doppelanzeige."},
    dns:{width:"M",height:"M",view:"table",reason:"Resolver plus kleine Bewertungstabelle."},
    tcp:{width:"M",height:"S",view:"status",reason:"Verbindungsaufbau braucht nur Kerndaten."},
    loss:{width:"L",height:"M",view:"chart",reason:"Jitter und Verlust profitieren von Verlauf."},
    route:{width:"XL",height:"L",view:"table",reason:"Hop-Watch braucht Pfad und Historie."},
    stream:{width:"M",height:"M",view:"chart",reason:"Streaming-Watch braucht Verlauf und Status."},
    buffer:{width:"L",height:"L",view:"chart",reason:"Bufferbloat braucht Korrelation."},
    fritz:{width:"M",height:"M",view:"table",reason:"WAN-Status plus Uptime und Hinweise."},
    system:{width:"L",height:"M",view:"chart",reason:"CPU/RAM/Speicher brauchen mehrere Kennzahlen."},
    devices:{width:"XL",height:"M",view:"table",reason:"Geraetematrix braucht Breite."}
  };
  const RULES=Object.freeze({columns:GRID.columns,sizes:["S","M","L","XL"],rowPolicy:"first-fit-stable",allowSmallBesideXL:true,forbidden:["cross-area-detail-duplication","measurement-start","sensor-mutation","app-js-dependency"]});
  function clone(value){return JSON.parse(JSON.stringify(value))}
  function normalize(spec){return Object.assign({},DEFAULT_SPEC,spec||{})}
  function forTest(id){return normalize(SPECS[id])}
  function forTests(tests){return (tests||[]).map(test=>Object.assign({},test,{layoutSpec:forTest(test.id)}))}
  function widthUnits(spec){return GRID.widths[(spec||{}).width]||GRID.widths.M}
  function heightUnits(spec){return GRID.heights[(spec||{}).height]||GRID.heights.M}
  function canPlaceBeside(left,right){return widthUnits(left)+widthUnits(right)<=GRID.columns}
  function placementPlan(tests){
    const rows=[];
    (tests||[]).map(t=>Object.assign({},t,{layoutSpec:forTest(t.id)})).forEach(test=>{
      const units=widthUnits(test.layoutSpec);
      let row=rows.find(r=>r.used+units<=GRID.columns);
      if(!row){row={index:rows.length,used:0,heightUnits:0,cards:[]};rows.push(row)}
      const card={id:test.id,title:test.title,width:test.layoutSpec.width,height:test.layoutSpec.height,units,view:test.layoutSpec.view,ownerArea:test.ownerArea||test.group||"unknown",page:test.workspacePage||test.ownerPage||"unassigned"};
      row.cards.push(card);row.used+=units;row.heightUnits=Math.max(row.heightUnits,heightUnits(test.layoutSpec));
    });
    return {columns:GRID.columns,rowCount:rows.length,rows,estimatedHeightPx:rows.reduce((sum,r)=>sum+(r.heightUnits*GRID.rowUnitPx)+GRID.gapPx,0)};
  }
  function pagePlan(tests,pageId){return placementPlan((tests||[]).filter(t=>!pageId||t.workspacePage===pageId||t.ownerPage===pageId))}
  function rowExamples(){return [
    {label:"S neben XL",fits:canPlaceBeside({width:"S"},{width:"XL"}),note:"passt in eine 6-Spalten-Reihe; daneben bleibt eine freie Spalte"},
    {label:"S neben L",fits:canPlaceBeside({width:"S"},{width:"L"}),note:"passt locker in eine 6-Spalten-Reihe"},
    {label:"M neben M",fits:canPlaceBeside({width:"M"},{width:"M"}),note:"passt mit Reserve"},
    {label:"S + S + M",fits:(GRID.widths.S+GRID.widths.S+GRID.widths.M)<=GRID.columns,note:"passt mit Reserve"}
  ]}
  window.FrameworkTestCardLayoutSpec={version:VERSION,rules:()=>clone(RULES),grid:()=>clone(GRID),sizeRules:()=>clone(SIZE_RULES),viewTypes:()=>clone(VIEW_TYPES),forTest,forTests,widthUnits,heightUnits,canPlaceBeside,placementPlan,pagePlan,rowExamples};
})();
