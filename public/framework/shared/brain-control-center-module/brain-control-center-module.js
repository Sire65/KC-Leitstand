(function(){
  "use strict";
  const VERSION="0.1.0",MODE="CANDIDATE_SIMULATION_ONLY",SCOPE="brain-control",LOG_KEY="monitor-v1",OUTCOME_KEY="outcomes-v1",MAX_LOG=500,COOLDOWN_MS=60000;
  const $=id=>document.getElementById(id);
  const esc=value=>String(value==null?"":value).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch]));
  const problems=Object.freeze([
    {id:"TEMP.CPU.HIGH",category:"temperature",title:"CPU-Temperatur hoch",warning:70,critical:85,metric:"temp",requires:"temperatureAvailable",runbook:"RB.TEMP.CPU"},
    {id:"RESOURCE.CPU.HIGH",category:"resource",title:"CPU-Auslastung hoch",warning:80,critical:95,metric:"cpu",runbook:"RB.RESOURCE.CPU"},
    {id:"RESOURCE.RAM.HIGH",category:"resource",title:"Arbeitsspeicher-Auslastung hoch",warning:85,critical:95,metric:"ram",runbook:"RB.RESOURCE.RAM"},
    {id:"NETWORK.LOSS.HIGH",category:"network",title:"Paketverlust hoch",warning:3,critical:5,metric:"loss",runbook:"RB.NETWORK.LOSS"},
    {id:"NETWORK.INTERNET.DOWN",category:"network",title:"Internetverbindung ausgefallen",eventMatch:"internet",runbook:"RB.NETWORK.DOWN"}
  ]);
  const runbooks=Object.freeze({
    "RB.TEMP.CPU":[
      {id:"repeat-temperature",title:"Temperaturmessung wiederholen",policy:"AUTO_SAFE_PLAN"},
      {id:"reduce-background-work",title:"Nicht kritische Hintergrundarbeit reduzieren",policy:"CONFIRM_REQUIRED"},
      {id:"increase-approved-fan-profile",title:"Freigegebenes Lüfterprofil erhöhen",policy:"ACTUATOR_BLOCKED"}
    ],
    "RB.RESOURCE.CPU":[{id:"verify-cpu",title:"CPU-Auslastung verifizieren",policy:"AUTO_SAFE_PLAN"},{id:"identify-process",title:"Verursachenden Prozess ermitteln",policy:"AUTO_SAFE_PLAN"}],
    "RB.RESOURCE.RAM":[{id:"verify-memory",title:"Speicherauslastung verifizieren",policy:"AUTO_SAFE_PLAN"},{id:"identify-memory-owner",title:"Speicherverursacher ermitteln",policy:"AUTO_SAFE_PLAN"}],
    "RB.NETWORK.LOSS":[{id:"repeat-loss-test",title:"Paketverlust erneut messen",policy:"AUTO_SAFE_PLAN"},{id:"compare-route",title:"Route und Gegenstelle vergleichen",policy:"AUTO_SAFE_PLAN"}],
    "RB.NETWORK.DOWN":[{id:"verify-local-link",title:"Lokale Verbindung prüfen",policy:"AUTO_SAFE_PLAN"},{id:"verify-router-wan",title:"Router-/WAN-Status prüfen",policy:"AUTO_SAFE_PLAN"},{id:"restart-router",title:"Router-Neustart vorschlagen",policy:"CONFIRM_REQUIRED"}]
  });
  const state={log:[],outcomes:[],lastSignatures:new Map(),ready:false};
  const now=()=>new Date().toISOString();
  function severity(problem,value){return Number(value)>=problem.critical?"critical":"warning"}
  function detect(assessment){
    const metrics=assessment?.metrics||{};
    const found=problems.filter(problem=>{
      if(problem.requires&&!metrics[problem.requires])return false;
      if(problem.metric)return Number(metrics[problem.metric])>=problem.warning;
      return (assessment?.events||[]).some(event=>String(event?.reason||event?.domain||"").toLowerCase().includes(problem.eventMatch)&&String(event?.severity||"").toLowerCase()==="red");
    });
    return found.map(problem=>({problem,severity:problem.metric?severity(problem,metrics[problem.metric]):"critical",value:problem.metric?metrics[problem.metric]:null}));
  }
  async function persist(){
    const storage=window.FrameworkSecureStorage;
    if(!storage)return false;
    await storage.set(SCOPE,LOG_KEY,state.log);
    await storage.set(SCOPE,OUTCOME_KEY,state.outcomes);
    return true;
  }
  function addLog(type,message,data){
    const entry={id:`brain-${Date.now()}-${Math.random().toString(16).slice(2)}`,at:now(),type,message,data:data||{}};
    state.log.unshift(entry);if(state.log.length>MAX_LOG)state.log.length=MAX_LOG;
    window.LeitstandBrainCoordinator?.add?.(`[Steuerzentrale/${type}] ${message}`,"core");
    window.dispatchEvent(new CustomEvent("leitstand:brain-monitor-entry",{detail:entry}));
    render();persist().catch(()=>{});
    return entry;
  }
  function planFinding(finding){
    const steps=(runbooks[finding.problem.runbook]||[]).map(step=>Object.assign({},step,{execution:step.policy==="AUTO_SAFE_PLAN"?"SIMULATED_PLAN":"BLOCKED",reason:step.policy==="ACTUATOR_BLOCKED"?"Kein freigegebener CapabilityCore-Aktor angeschlossen":step.policy==="CONFIRM_REQUIRED"?"Benutzerfreigabe erforderlich":"Beobachtungs-/Prüfschritt"}));
    return {problemId:finding.problem.id,title:finding.problem.title,severity:finding.severity,value:finding.value,runbookId:finding.problem.runbook,steps,mode:MODE,createdAt:now()};
  }
  function analyze(assessment,source){
    const findings=detect(assessment);
    findings.forEach(finding=>{
      const signature=`${finding.problem.id}:${finding.severity}`,last=state.lastSignatures.get(signature)||0;
      if(Date.now()-last<COOLDOWN_MS)return;
      state.lastSignatures.set(signature,Date.now());
      const plan=planFinding(finding);
      addLog("PROBLEM_ERKANNT",`${plan.title} (${plan.severity})`,{source:source||"SystemAssessmentCore",plan});
      plan.steps.forEach(step=>addLog(step.execution,step.title,{problemId:plan.problemId,policy:step.policy,reason:step.reason}));
    });
    return findings.map(planFinding);
  }
  function recordOutcome(problemId,status,note){
    const outcome={problemId,status:String(status||"UNKNOWN").toUpperCase(),note:String(note||""),at:now()};
    state.outcomes.unshift(outcome);if(state.outcomes.length>MAX_LOG)state.outcomes.length=MAX_LOG;
    addLog("VERIFIKATION",`${problemId}: ${outcome.status}`,outcome);return outcome;
  }
  function simulate(problemId){
    const problem=problems.find(item=>item.id===problemId);if(!problem)return [];
    state.lastSignatures.delete(`${problem.id}:warning`);
    const metrics={temperatureAvailable:true,temp:0,cpu:0,ram:0,loss:0};
    if(problem.metric)metrics[problem.metric]=problem.warning;
    const events=problem.eventMatch?[{domain:"internet",severity:"red",reason:"internet unavailable"}]:[];
    return analyze({metrics,events},"MANUELLE_SIMULATION");
  }
  function ensureUi(){
    const host=document.querySelector(".dashboard-inline-controls");
    if(host&&!$("brainControlCenterOpen")){
      const button=document.createElement("button");button.id="brainControlCenterOpen";button.type="button";button.className="btn secondary";button.textContent="Gehirn-Monitor";button.title="Wissens- und Maßnahmenmonitor im Simulationsmodus";
      host.insertBefore(button,host.querySelector(".section-global-tools")||null);button.addEventListener("click",()=>{const panel=ensurePanel();panel.hidden=!panel.hidden;render()});
    }
    return ensurePanel();
  }
  function ensurePanel(){
    if($("brainControlCenterPanel"))return $("brainControlCenterPanel");
    const panel=document.createElement("aside");panel.id="brainControlCenterPanel";panel.hidden=true;panel.setAttribute("aria-label","Gehirn Steuerzentrale Monitor");
    panel.innerHTML='<header><div><small>STEUERZENTRALE · KANDIDAT</small><b>Problemwissen & Maßnahmenmonitor</b></div><button type="button" aria-label="Monitor schließen">×</button></header><p class="brain-safety">SIMULATION · KEINE AKTORSTEUERUNG</p><div class="brain-actions"><button type="button" data-brain-sim="TEMP.CPU.HIGH">CPU-Temperaturfall simulieren</button></div><div class="brain-monitor-list"></div>';
    panel.querySelector("header button").addEventListener("click",()=>{panel.hidden=true});
    panel.querySelector("[data-brain-sim]").addEventListener("click",event=>simulate(event.currentTarget.dataset.brainSim));
    document.body.appendChild(panel);return panel;
  }
  function style(){
    if($("brainControlCenterStyle"))return;
    const sheet=document.createElement("style");sheet.id="brainControlCenterStyle";sheet.textContent=`
      #brainControlCenterPanel[hidden]{display:none!important}#brainControlCenterPanel{position:fixed;right:20px;bottom:20px;z-index:12050;width:min(470px,calc(100vw - 30px));max-height:70vh;overflow:auto;border:1px solid #47788c;border-radius:10px;background:#071c27;color:#e8f7ff;box-shadow:0 18px 60px #000c}
      #brainControlCenterPanel header{position:sticky;top:0;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 14px;border-bottom:1px solid #31586d;background:#103346}#brainControlCenterPanel header small{display:block;color:#72dcff;font-weight:900}#brainControlCenterPanel header button{border:0;background:transparent;color:white;font-size:25px;cursor:pointer}
      .brain-safety{margin:10px 12px;padding:7px;border:1px solid #e4b84f;border-radius:5px;color:#ffe094;text-align:center;font-size:11px;font-weight:900}.brain-actions{padding:0 12px 8px}.brain-actions button{padding:7px 9px;border:1px solid #55798a;border-radius:5px;background:#123548;color:#e8f7ff;cursor:pointer}.brain-monitor-list{display:grid;gap:7px;padding:8px 12px 14px}.brain-monitor-entry{padding:8px;border-left:3px solid #50c7f2;background:#0c2937;font-size:11px}.brain-monitor-entry b{display:block;margin-bottom:3px}.brain-monitor-entry time{color:#8eb4c4}
    `;document.head.appendChild(sheet);
  }
  function render(){
    const list=ensurePanel().querySelector(".brain-monitor-list");
    list.innerHTML=state.log.length?state.log.slice(0,30).map(entry=>`<article class="brain-monitor-entry"><b>${esc(entry.type)} · ${esc(entry.message)}</b><time>${esc(entry.at)}</time></article>`).join(""):"<p>Noch keine bewerteten Ereignisse.</p>";
  }
  async function restore(){
    const storage=window.FrameworkSecureStorage;if(!storage)return false;
    await storage.ready();state.log=await storage.get(SCOPE,LOG_KEY)||[];state.outcomes=await storage.get(SCOPE,OUTCOME_KEY)||[];state.ready=true;render();return true;
  }
  function init(){
    style();ensureUi();
    restore().catch(error=>addLog("SPEICHER_FEHLER",error.message));
    window.addEventListener("leitstand:secure-storage-ready",()=>restore().catch(()=>{}),{once:true});
    window.addEventListener("leitstand:brain-coordination",event=>analyze(event.detail?.assessment||event.detail,"SystemAssessmentCore"));
    window.addEventListener("leitstand:brain-action",event=>addLog("LEGACY_AKTION_BEOBACHTET","Bestehende Brain-Aktion nur protokolliert; keine Aktorausführung.",{action:event.detail||{}}));
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
  window.FrameworkBrainControlCenter={version:VERSION,mode:MODE,analyze,simulate,recordOutcome,problems:()=>problems.map(item=>Object.assign({},item)),runbooks:()=>JSON.parse(JSON.stringify(runbooks)),monitor:()=>state.log.map(item=>Object.assign({},item)),capabilities:()=>({SystemAssessmentCore:true,eventDriven:true,encryptedStorage:"FrameworkSecureStorage",actuatorExecution:false,actionGate:"ACTUATOR_BLOCKED"})};
})();
