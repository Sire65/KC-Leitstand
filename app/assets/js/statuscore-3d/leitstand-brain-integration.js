// V5.4.32 - BrainCore integration reads SystemAssessmentCore for consistent labels.
(function(){
  "use strict";
  const byId=id=>document.getElementById(id);
  let brain=null;
  function visualStateFor(a){const s=a?.display?.brainState||a?.overall?.visual||"offline";if(s==="offline"&&a?.overall?.confidence>0)return a.overall.level==="green"?"ok":a.overall.level==="yellow"?"notice":a.overall.level==="orange"?"alarm":a.overall.level==="red"?"critical":"notice";return s;}
  function getData(){
    const snap=(typeof S!=="undefined"&&S.latest&&S.latest.snapshot)||{};
    const a=window.SystemAssessmentCore?.assess?.(snap,typeof S!=="undefined"?S:{});
    if(a){
      const sensors=Object.values(a.domains).map(d=>({name:d.label,state:d.available?window.SystemAssessmentCore.stateFromScore(d.score,true):"offline",value:d.available?Math.round(d.score)+" %":"unbekannt"}));
      return {state:visualStateFor(a),severity:100-a.overall.score,stability:a.overall.score,sensors,assessment:a,rd:typeof S!=="undefined"?S.routerDetect:null,routerOk:a.domains.router.available&&a.domains.router.level!=="red"};
    }
    return {state:"offline",severity:0,stability:0,sensors:[],assessment:null,rd:null,routerOk:false};
  }
  function updateRouterSummary(data){const box=byId("brainRouterSummary"),manual=byId("brainManualRouter");if(!box)return;const rd=data.rd;if(!rd){box.innerHTML="<b>Router noch nicht erkannt.</b><br>Starte die automatische Erkennung. Falls kein Router gefunden wird, koennen die Details manuell eingetragen werden.";manual.hidden=true;return}if(!data.routerOk&&!rd.reachable&&!rd.notes?.some(n=>/importiert|diagnose/i.test(n))){box.innerHTML="<b>Router wurde nicht erkannt, bitte Details selber eingeben.</b><br><span>Routertyp, Adresse und Anschlussart koennen unter Einstellungen &gt; Routerprofile eingetragen werden.</span>";manual.hidden=false;return}box.innerHTML=`<b>${rd.model||"Router erkannt"}</b><br>Trefferqualitaet: ${Number(rd.score||0)} %<br>Status: ${data.routerOk?"erreichbar":"Profil/Import erkannt"}`;manual.hidden=true}
  function update(){
    brain=brain||byId("leitstandBrain");if(!brain||typeof brain.setStatus!=="function")return;
    const d=getData();
    if(!window.LeitstandBrainCoordinator)brain.setStatus(d);
    const brainEnabled=typeof S==="undefined"||S.settings?.brainEnabled!==false;
    brain.setEnabled(brainEnabled);
    if(!window.LeitstandBrainCoordinator)brain.setBrainActivity(Math.max(0.22,Math.min(1,(100-d.stability)/100)));
    const label=byId("brainStateLabel"),caption=byId("brainCaption"),level=d.assessment?.overall?.level||"unknown";
    if(label&&!window.LeitstandBrainCoordinator){label.className="pill "+(level==="green"?"green":level==="yellow"?"yellow":level==="unknown"?"gray":"red");label.textContent=d.assessment?.display?.label||"MESSWERTE WERDEN AUFGEBAUT"}
    if(caption)caption.textContent=d.assessment?`Gesamtstabilitaet ${d.assessment.overall.score} %. Vertrauen ${d.assessment.overall.confidence} %. Zentrale Bewertung aus SystemAssessmentCore.`:"Messwerte werden aufgebaut.";
    updateRouterSummary(d);
  }
  function openManual(){const nav=document.querySelector('[data-page="settings"]');if(nav)nav.click();setTimeout(()=>{const tab=document.querySelector('[data-settings-panel="routerProfiles"]');if(tab)tab.click();const host=byId("setHost");if(host){host.focus();host.scrollIntoView({behavior:"smooth",block:"center"})}},80)}
  window.addEventListener("DOMContentLoaded",()=>{brain=byId("leitstandBrain");byId("brainDetectRouter")?.addEventListener("click",()=>byId("detectRouterHome")?.click());byId("brainManualRouter")?.addEventListener("click",openManual);update();setInterval(update,1500)});
})();




