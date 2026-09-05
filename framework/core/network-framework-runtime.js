(function(g){
  'use strict';
  const definitions=[
    {id:'FrameworkCore',global:'FrameworkCore',dependencies:[]},
    {id:'CapabilityCore',global:'CapabilityCore',dependencies:[]},
    {id:'InteractionCore',global:'InteractionCore',dependencies:['CapabilityCore']},
    {id:'TableCore',global:'TableCore',dependencies:[]},
    {id:'NavigationCore',global:'NavigationCore',dependencies:['InteractionCore']},
    {id:'WindowCore',global:'WindowCore',dependencies:['InteractionCore']},
    {id:'DesignCore',global:'DesignCore',dependencies:[]},
    {id:'MobileCore',global:'MobileCore',dependencies:['DesignCore']}
  ];
  let activated=false;
  function registerAll(){
    const known=new Set((g.CoreRuntime?.status?.()||[]).map(x=>x.id));
    definitions.forEach(def=>{ if(!known.has(def.id)) g.CoreRuntime.register(def); });
  }
  function activate(navAdapter){
    if(activated) return snapshot();
    if(!g.CoreRuntime) throw new Error('CORE_RUNTIME_MISSING');
    registerAll();
    const instances={};
    definitions.forEach(def=>{
      g.CoreRuntime.validate(def.id);
      const options=def.id==='TableCore'?{TableCore:['status','value','state']}:{ };
      instances[def.id]=g.CoreRuntime.activate(def.id,options);
    });
    if(instances.NavigationCore && navAdapter){ instances.NavigationCore.bindAdapter(navAdapter); }
    const consumers={
      FrameworkCore:'network-shell-lifecycle',
      CapabilityCore:'network-diagnostic-capability-catalog',
      InteractionCore:'network-control-actions',
      TableCore:'network-diagnostic-tables',
      NavigationCore:'network-navigation-adapter',
      WindowCore:'network-window-ui',
      DesignCore:'network-theme-and-contrast',
      MobileCore:'network-device-profile'
    };
    Object.entries(consumers).forEach(([id,consumer])=>g.CoreRuntime.bindConsumer(id,consumer));
    instances.CapabilityCore?.registerMany?.([
      {capabilityId:'network.measure',ownerCore:'NetworkMonitorCore',description:'Netzwerkmessungen ausführen'},
      {capabilityId:'network.import.pcap',ownerCore:'NetworkMonitorCore',description:'PCAP-Dateien importieren'},
      {capabilityId:'network.router.detect',ownerCore:'FritzBoxCore',description:'Router erkennen'}
    ]);
    instances.InteractionCore?.bind?.({actionId:'network.navigation',handlerRef:'page',input:'POINTER_OR_KEYBOARD'});
    instances.InteractionCore?.bind?.({actionId:'network.measurement.toggle',handlerRef:'instrument-switches',requiresCapability:'network.measure',input:'POINTER_OR_KEYBOARD'});
    instances.WindowCore?.ensure?.({windowId:'network-main',title:'Netzwerk-Leitstand',mode:'DESKTOP'});
    instances.DesignCore?.registerTheme?.({themeId:'network-command-center',tokens:{
      'color.background':'#07131a','color.surface':'#102631','color.text':'#e7f6ff','color.accent':'#3dd6ff',
      'space.sm':'8px','space.md':'16px','radius.card':'12px','font.base':'system-ui'
    },source:'PROJECT'});
    const mode=instances.MobileCore?.classify?.({width:Math.max(1,g.innerWidth||1280),touch:'ontouchstart' in g});
    if(mode) instances.WindowCore?.setMode?.('network-main',mode==='HANDSET'?'MOBILE':mode);
    activated=true;
    g.dispatchEvent?.(new CustomEvent('network-framework-ready',{detail:snapshot()}));
    return snapshot();
  }
  function snapshot(){
    return Object.freeze({activated,cores:g.CoreRuntime?.status?.()||[],consumers:g.CoreRuntime?.consumerStatus?.()||[]});
  }
  g.NetworkFrameworkRuntime=Object.freeze({version:'5.4.2',activate,snapshot});
})(typeof window!=='undefined'?window:globalThis);
