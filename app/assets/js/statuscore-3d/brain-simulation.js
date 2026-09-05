// V5.4.1 - isolated training simulation for Denkzentrum, Heart/EKG and TimeCore.
(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const levels={
    normal:{brain:'ok',activity:.16,bpm:65,cycle:'15 s',label:'STABIL',energy:18},
    notice:{brain:'notice',activity:.42,bpm:84,cycle:'8 s',label:'BEOBACHTEN',energy:49},
    alarm:{brain:'alarm',activity:.72,bpm:112,cycle:'4 s',label:'ALARM',energy:77},
    critical:{brain:'critical',activity:.98,bpm:148,cycle:'2 s',label:'VOLLALARM',energy:98}
  };
  const clearClasses=()=>document.body.classList.remove('sim-heart-notice','sim-heart-alarm','sim-heart-critical','sim-timer-notice','sim-timer-alarm','sim-timer-critical');
  function apply(){
    const component=$('simulationComponent')?.value||'all',key=$('simulationState')?.value||'normal',cfg=levels[key],brain=$('leitstandBrain');
    window.LeitstandSimulation={active:true,component,state:key};clearClasses();
    if(component==='all'||component==='brain'){
      brain?.setEnabled(true);brain?.setStatus({state:cfg.brain,severity:Math.round(cfg.activity*100),stability:Math.round(100-cfg.activity*68)});brain?.setBrainActivity(cfg.activity);
      const label=$('brainStateLabel');if(label){label.className='pill '+(key==='normal'?'green':key==='notice'?'yellow':'red');label.textContent=cfg.label}
      const ev=$('brainEnergyValue'),ef=$('brainEnergyFill');if(ev)ev.textContent=cfg.energy+' %';if(ef)ef.style.width=cfg.energy+'%';
      for(let i=0;i<1+Math.round(cfg.activity*4);i++)setTimeout(()=>brain?.sendThought(i%8,(i*3+2)%8,cfg.brain),i*130);
      if(key==='alarm'||key==='critical')brain?.triggerCriticalFlash();
    }
    if(component==='all'||component==='heart'){
      if(key!=='normal')document.body.classList.add('sim-heart-'+key);
      document.body.classList.toggle('heart-yellow',key==='notice');document.body.classList.toggle('heart-red',key==='alarm'||key==='critical');
      const bpm=$('pulseBpm');if(bpm)bpm.textContent='Puls '+cfg.bpm+'/min · SIMULATION';
    }
    if(component==='all'||component==='timer'){
      if(key!=='normal')document.body.classList.add('sim-timer-'+key);
      const cycle=$('cycleText');if(cycle)cycle.textContent='Simulation: naechste Messung in '+cfg.cycle;
    }
    const st=$('brainSimulationStatus');if(st)st.textContent='Simulation aktiv: '+component+' / '+key+'. Echte Messwerte bleiben unverändert.';
  }
  function stop(){
    window.LeitstandSimulation={active:false};clearClasses();document.body.classList.remove('heart-yellow','heart-red');
    const st=$('brainSimulationStatus');if(st)st.textContent='Simulation beendet. Live-Zustand wird wiederhergestellt.';
    window.LeitstandBrainCoordinator?.think?.();
  }
  window.addEventListener('DOMContentLoaded',()=>{
    const modal=$('brainSimulationModal');
    $('brainSimulationOpen')?.addEventListener('click',()=>{modal.hidden=false});
    $('brainSimulationClose')?.addEventListener('click',()=>{stop();modal.hidden=true});
    $('brainSimulationStart')?.addEventListener('click',apply);
    $('brainSimulationStop')?.addEventListener('click',stop);
    modal?.addEventListener('click',e=>{if(e.target===modal){stop();modal.hidden=true}});
  });
})();
