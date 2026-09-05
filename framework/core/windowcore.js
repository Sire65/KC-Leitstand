(function(g){'use strict';
function E(c){let e=Error(c);e.code=c;throw e}
function create(){
 const m=new Map();
 function read(id){const w=m.get(id);if(!w)E('WINDOW_NOT_FOUND');return w}
 function put(w){const n=Object.freeze({...w,updatedAt:new Date().toISOString()});m.set(n.windowId,n);return n}
 function ensure(x){if(!x||!x.windowId)E('WINDOW_ID_REQUIRED');const old=m.get(x.windowId);if(old)return old;return put({windowId:x.windowId,title:x.title||x.windowId,state:x.state||'OPEN',mode:x.mode||'WINDOWED',dirty:!!x.dirty,focused:false,z:Number(x.z)||0})}
 function open(x){const w=ensure(x);return put({...w,state:'OPEN'})}
 function close(id,opt){const w=read(id);if(w.dirty&&!(opt&&opt.force))E('DIRTY_WINDOW_BLOCKS_CLOSE');return put({...w,state:'CLOSED',focused:false})}
 function minimize(id){return put({...read(id),state:'MINIMIZED',focused:false})}
 function maximize(id){return put({...read(id),state:'MAXIMIZED'})}
 function restore(id){return put({...read(id),state:'OPEN'})}
 function focus(id,z){const w=read(id);return put({...w,state:w.state==='MINIMIZED'?'OPEN':w.state,focused:true,z:Number(z)||w.z})}
 function blur(id){return put({...read(id),focused:false})}
 function setMode(id,mode){if(!['WINDOWED','FULLSCREEN','SHEET','CARD','DESKTOP','TABLET','MOBILE'].includes(mode))E('INVALID_WINDOW_MODE');return put({...read(id),mode})}
 function remove(id){read(id);m.delete(id);return true}
 function snapshot(){return Object.freeze([...m.values()].map(x=>Object.freeze({...x})))}
 return Object.freeze({version:'1.1.0',ensure,open,close,minimize,maximize,restore,focus,blur,setMode,remove,snapshot})
}
g.WindowCore=Object.freeze({version:'1.1.0',apiVersion:'1',create});
})(typeof window!=='undefined'?window:globalThis);