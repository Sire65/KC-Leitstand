(function(){
  "use strict";
  const VERSION="0.2.0",ASSET="assets/images/brain/digital-brain-core-v1.png";
  function levelFrom(assessment){const level=assessment?.overall?.level||"unknown";return ["green","yellow","orange","red"].includes(level)?level:"gray"}
  function install(){
    document.querySelectorAll(".brain-inner-visual").forEach(legacy=>legacy.remove());
    document.querySelectorAll("statuscore-3d").forEach(core=>core.dataset.brainVisual="embedded");
  }
  function update(assessment){install();const level=levelFrom(assessment);document.querySelectorAll("statuscore-3d").forEach(core=>core.dataset.level=level)}
  function init(){install();window.addEventListener("leitstand:brain-coordination",event=>update(event.detail?.assessment||event.detail))}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
  window.FrameworkBrainInnerVisual={version:VERSION,asset:ASSET,update};
})();
