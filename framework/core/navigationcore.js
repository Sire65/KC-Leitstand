(function(g){'use strict';
 const VERSION='1.1.0', API='1.1.0';
 function create(){let adapter=null;const events=[];function emit(type,data){events.push(Object.freeze({type,at:new Date().toISOString(),...(data||{})}))}function need(){if(!adapter)throw Error('NAVIGATION_CORE_ADAPTER_NOT_BOUND');return adapter}
  return Object.freeze({version:VERSION,apiVersion:API,bindAdapter(a){if(!a||typeof a.setWidth!=='function'||typeof a.toggleQuick!=='function'||typeof a.resetWidth!=='function')throw Error('NAVIGATION_CORE_ADAPTER_INVALID');adapter=a;emit('ADAPTER_BOUND',{version:a.version||null});return true},isBound(){return !!adapter},setWidth(w,o){const r=need().setWidth(w,o);emit('WIDTH_SET',{width:w});return r},toggleSidebar(){const r=need().toggleQuick();emit('SIDEBAR_TOGGLED');return r},resetWidth(){const r=need().resetWidth();emit('WIDTH_RESET',{width:270});return r},snapshot(){return Object.freeze({version:VERSION,apiVersion:API,adapterBound:!!adapter,eventCount:events.length})},eventLog(){return Object.freeze(events.slice())}})
 }
 g.NavigationCore=Object.freeze({version:VERSION,apiVersion:API,create});
 g.NavigationCoreContract=Object.freeze({coreId:'NavigationCore',runtimeId:'master.navigation',version:VERSION,apiVersion:API,behaviorOwner:'central-core-runtime',releaseGate:'YELLOW_REAL_DEVICE_EVIDENCE_OPEN'});
})(typeof window!=='undefined'?window:globalThis);
