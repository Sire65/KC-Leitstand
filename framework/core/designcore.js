(function(g){'use strict';
function E(c){let e=Error(c);e.code=c;throw e}
const tokens=['color.background','color.surface','color.text','color.accent','space.sm','space.md','radius.card','font.base'];
function create(){
 const themes=new Map();
 function registerTheme(x){
  if(!x||!x.themeId)E('THEME_ID_REQUIRED');
  if(themes.has(x.themeId))E('DUPLICATE_THEME_ID');
  const missing=tokens.filter(t=>!(x.tokens||{}).hasOwnProperty(t));
  if(missing.length)E('DESIGN_TOKENS_MISSING');
  const y=Object.freeze({themeId:x.themeId,tokens:Object.freeze({...x.tokens}),source:x.source||'MASTER'});
  themes.set(y.themeId,y);return y;
 }
 function getTheme(id){if(!themes.has(id))E('THEME_NOT_FOUND');return themes.get(id)}
 function evaluateContrast(x){
  if(!x||typeof x.ratio!=='number')E('CONTRAST_INPUT_REQUIRED');
  return Object.freeze({state:x.ratio>=4.5?'PASS':'FAIL',ratio:x.ratio});
 }
 function presentationHints(deviceProfile){
  const mode=deviceProfile&&deviceProfile.mode||'DESKTOP';
  return Object.freeze({mode,density:mode==='HANDSET'?'COMPACT':'STANDARD',freeWindows:mode==='DESKTOP'});
 }
 return Object.freeze({version:'1.0.0',registerTheme,getTheme,evaluateContrast,presentationHints,requiredTokens:Object.freeze(tokens.slice())})
}
g.DesignCore=Object.freeze({version:'1.0.0',apiVersion:'1',create});
})(typeof window!=='undefined'?window:globalThis);