(function(){
  "use strict";
  const $ = (id) => document.getElementById(id);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));

  let runtimeApi = null;

  function closeFloatingUi(){
    $("navActionMenu")?.classList.remove("open");
    $("recentPanel")?.classList.remove("open");
    $("menuScroll")?.classList.remove("recent-hidden");
    $("recentBtn")?.classList.remove("active");
    document.querySelectorAll(".nav-group").forEach(group => group.classList.add("closed"));
    document.querySelectorAll(".window").forEach(win => {
      win.classList.add("min");
      win.style.display = "none";
    });
  }

  function init(navigate){
    const app = $("shell");
    const nav = $("navigationCore");
    const rail = $("resizeRail");
    const status = $("resizeStatus");
    const toggle = $("railToggle");
    const lockButton = $("railLock");
    const pinButton = $("pinBtn");
    const restButton = $("restBtn");
    const recentButton = $("recentBtn");
    const recentPanel = $("recentPanel");
    const recentList = $("recentList");
    const menuScroll = $("menuScroll");
    const hamburger = $("hamburger");
    const navActionMenu = $("navActionMenu");
    const contextList = $("contextList");
    const contextEmpty = $("contextEmpty");
    const autoModeButton = $("autoModeBtn");
    const officeModeButton = $("officeModeBtn");
    if(!app || !nav || nav.dataset.bound === "true") return;
    nav.dataset.bound = "true";

    let width = 270;
    let locked = false;
    let dragging = false;
    let pinned = true;
    let hoverTimer = null;
    let lastMenuState = null;
    const recent = [];

    function setWidth(nextWidth, options={}){
      width = Math.max(72, Math.min(430, Math.round(nextWidth)));
      document.documentElement.style.setProperty("--sidebar-w", width + "px");
      document.documentElement.style.setProperty("--nav", width + "px");
      if(status) status.textContent = width + " px";
      const quick = options.forceQuick || width < 180;
      const compact = !quick && width < 270;
      app.classList.toggle("quick", quick);
      app.classList.toggle("compact", compact);
      if(toggle) toggle.textContent = quick ? ">" : "<";
    }

    function syncLock(){
      if(!lockButton || !rail) return;
      lockButton.classList.toggle("is-locked", locked);
      lockButton.classList.toggle("is-open", !locked);
      const glyph = lockButton.querySelector(".lock-glyph");
      if(glyph) glyph.textContent = locked ? "L" : "U";
      lockButton.title = locked ? "Breite freigeben" : "Breite arretieren";
      rail.classList.toggle("locked", locked);
    }

    function syncPin(){
      if(!pinButton) return;
      pinButton.classList.toggle("active", pinned);
      pinButton.setAttribute("aria-pressed", String(pinned));
      pinButton.textContent = pinned ? "P" : "p";
      pinButton.title = pinned ? "Sidebar loesen - Auto-Hover aktivieren" : "Sidebar fixieren";
    }

    function updateZone(){
      rail?.classList.remove("zone-green","zone-yellow","zone-red");
      if(!rail) return;
      if(width <= 90 || width >= 420) rail.classList.add("zone-red");
      else if(width <= 130 || width >= 380) rail.classList.add("zone-yellow");
      else rail.classList.add("zone-green");
    }

    function recordRecent(button){
      if(!button || !recentList) return;
      const label = button.textContent.trim();
      const existing = recent.indexOf(label);
      if(existing >= 0) recent.splice(existing, 1);
      recent.unshift(label);
      recent.splice(8);
      recentList.innerHTML = recent.map(item => `<button type="button" data-recent-label="${esc(item)}">${esc(item)}</button>`).join("");
      const empty = $("recentEmpty");
      if(empty) empty.style.display = recent.length ? "none" : "block";
    }

    function applyContext(label){
      if(!contextList) return;
      contextList.innerHTML = "";
      const defaults = ["Live-Diagnose", "Messprotokoll", "Einstellungen"].filter(item => item !== label);
      [label, ...defaults].filter(Boolean).slice(0,4).forEach((item, index) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "context-chip" + (index === 0 ? " primary" : "");
        chip.textContent = item;
        chip.dataset.contextLabel = item;
        contextList.appendChild(chip);
      });
      if(contextEmpty) contextEmpty.style.display = "none";
    }

    function activateContext(label){
      const map={
        "Live-Diagnose":"dashboard","Leitstand":"dashboard","Messprotokoll":"measurements",
        "Einstellungen":"settings","Aktuelle Stoerung":"current","Internet / Vodafone":"internet",
        "Router / FRITZ!Box":"fritz","WLAN / Mesh":"wifi","DNS / IPv4 / IPv6":"dns",
        "Geraete":"devices","PC / SMART":"pc","Stoerprotokoll":"incidents","Berichte":"reports",
        "Teststeuerung":"tests","Hilfe":"help"
      };
      const page=map[label];
      if(!page)return;
      const button=document.querySelector(`.nav-item[data-page="${page}"]`);
      if(button)activateNavButton(button);else if(typeof navigate==="function")navigate(page);
    }

    contextList?.addEventListener("click", event => {
      const chip=event.target.closest("[data-context-label]");
      if(!chip)return;
      activateContext(chip.dataset.contextLabel);
    });

    function activateNavButton(button){
      if(!button) return;
      const target = button.dataset.page;
      if(!target) return;
      $$(".nav-item").forEach(item => item.classList.toggle("active", item === button));
      recordRecent(button);
      applyContext(button.textContent.trim());
      if(typeof navigate === "function") navigate(target);
    }

    toggle?.addEventListener("click", () => {
      if(app.classList.contains("quick")) setWidth(270);
      else setWidth(72, { forceQuick:true });
    });
    pinButton?.addEventListener("click", () => {
      pinned = !pinned;
      clearTimeout(hoverTimer);
      syncPin();
      if(pinned && app.classList.contains("quick")) setWidth(270);
    });
    lockButton?.addEventListener("click", () => {
      locked = !locked;
      syncLock();
    });
    restButton?.addEventListener("click", () => {
      const entering = !app.classList.contains("rest-mode");
      app.classList.toggle("rest-mode", entering);
      restButton.classList.toggle("active", entering);
      restButton.title = entering ? "Ruhemodus verlassen" : "Ruhemodus einschalten";
      if(entering){
        closeFloatingUi();
        if(contextList) contextList.innerHTML = "";
        if(contextEmpty) contextEmpty.style.display = "block";
      }else{
        $$(".nav-group").forEach(group => group.classList.remove("closed"));
      }
    });
    menuScroll?.addEventListener("click", event => {
      const toggleButton = event.target.closest(".nav-group-toggle");
      if(!toggleButton) return;
      const group = toggleButton.closest(".nav-group");
      if(!group) return;
      const willOpen = group.classList.contains("closed");
      const maxOpen = Number(window.NETZWERK_LEITSTAND_NAVIGATION?.maxOpenGroups ?? 1);
      if(willOpen && maxOpen === 1){
        $$(".nav-group", menuScroll).forEach(item => {
          if(item !== group){
            item.classList.add("closed");
            item.querySelector(".nav-group-toggle")?.setAttribute("aria-expanded", "false");
            const plus=item.querySelector(".group-plus"); if(plus) plus.textContent="+";
            const arrow=item.querySelector(".nav-group-toggle i"); if(arrow) arrow.textContent="▸";
          }
        });
      }
      group.classList.toggle("closed", !willOpen);
      toggleButton.setAttribute("aria-expanded", String(willOpen));
      const plus=toggleButton.querySelector(".group-plus"); if(plus) plus.textContent=willOpen ? "−" : "+";
      const arrow=toggleButton.querySelector("i"); if(arrow) arrow.textContent=willOpen ? "▾" : "▸";
    });

    $("toggleMenus")?.addEventListener("click", () => {
      const groups = $$(".nav-group");
      const anyOpen = groups.some(group => !group.classList.contains("closed"));
      if(anyOpen){
        lastMenuState = groups.map(group => group.classList.contains("closed"));
        groups.forEach(group => group.classList.add("closed"));
      }else{
        groups.forEach((group, index) => group.classList.toggle("closed", !!(lastMenuState && lastMenuState[index])));
      }
    });
    autoModeButton?.addEventListener("click", () => {
      autoModeButton.classList.toggle("active");
      autoModeButton.textContent = autoModeButton.classList.contains("active") ? (autoModeButton.dataset.labelOn || "Auto: an") : (autoModeButton.dataset.labelOff || "Auto: aus");
    });
    officeModeButton?.addEventListener("click", () => {
      officeModeButton.classList.toggle("active");
      officeModeButton.textContent = officeModeButton.classList.contains("active") ? (officeModeButton.dataset.labelOn || "Büromodus aktiv") : (officeModeButton.dataset.labelOff || "Büromodus starten");
    });
    hamburger?.addEventListener("click", event => {
      event.stopPropagation();
      navActionMenu?.classList.toggle("open");
    });
    document.addEventListener("click", event => {
      if(navActionMenu && hamburger && !navActionMenu.contains(event.target) && event.target !== hamburger) navActionMenu.classList.remove("open");
    });
    recentButton?.addEventListener("click", () => {
      const open = !recentPanel?.classList.contains("open");
      recentPanel?.classList.toggle("open", open);
      menuScroll?.classList.toggle("recent-hidden", open);
      recentButton.classList.toggle("active", open);
    });
    nav.addEventListener("mouseenter", () => {
      if(pinned || dragging) return;
      clearTimeout(hoverTimer);
      if(app.classList.contains("quick")) setWidth(270);
    });
    nav.addEventListener("mouseleave", () => {
      if(pinned || dragging) return;
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => {
        if(!pinned && !nav.matches(":hover") && !dragging) setWidth(72, { forceQuick:true });
      }, 650);
    });
    rail?.addEventListener("mouseenter", () => {
      status?.classList.add("show");
      if(status) status.textContent=width+" px";
    });
    rail?.addEventListener("mouseleave", () => {
      if(!dragging) status?.classList.remove("show");
    });
    rail?.addEventListener("pointerdown", event => {
      if(locked) return;
      dragging = true;
      rail.classList.add("dragging");
      status?.classList.add("show");
      $("dragArrow")?.classList.add("show");
      rail.setPointerCapture(event.pointerId);
      updateZone();
    });
    rail?.addEventListener("dblclick", event => {
      event.preventDefault();
      locked = false;
      syncLock();
      setWidth(270);
    });
    rail?.addEventListener("pointermove", event => {
      if(!dragging || locked) return;
      const left = nav.getBoundingClientRect().left;
      setWidth(event.clientX - left);
      updateZone();
    });
    rail?.addEventListener("pointerup", () => {
      dragging = false;
      rail.classList.remove("dragging","zone-green","zone-yellow","zone-red");
      $("dragArrow")?.classList.remove("show");
      window.setTimeout(() => status?.classList.remove("show"), 350);
    });
    document.addEventListener("click", event => {
      const navButton = event.target.closest("[data-page]");
      if(navButton && nav.contains(navButton)){
        activateNavButton(navButton);
        recentPanel?.classList.remove("open");
        menuScroll?.classList.remove("recent-hidden");
        recentButton?.classList.remove("active");
      }
      const recentItem = event.target.closest("[data-recent-label]");
      if(recentItem){
        const target = $$(".nav-item").find(item => item.textContent.trim() === recentItem.dataset.recentLabel);
        if(target) activateNavButton(target);
        recentPanel?.classList.remove("open");
        menuScroll?.classList.remove("recent-hidden");
        recentButton?.classList.remove("active");
      }
      const contextItem = event.target.closest("[data-context-label]");
      if(contextItem){
        const target = $$(".nav-item").find(item => item.textContent.trim() === contextItem.dataset.contextLabel);
        if(target) activateNavButton(target);
      }
      const actionButton = event.target.closest("#navActionMenu [data-action]");
      if(actionButton){
        const action = actionButton.dataset.action;
        navActionMenu?.classList.remove("open");
        if(action === "print") window.print();
        if(action === "filter-reset") document.querySelectorAll("input[type=search], .filter input").forEach(input => input.value = "");
        if(action === "nav-reset") setWidth(270);
        if(action === "help" && typeof navigate === "function") navigate("help");
      }
    });

    syncLock();
    syncPin();
    setWidth(270);
    applyContext("Dashboard");
    runtimeApi = Object.freeze({
      version:"master-prototype-v0.15.8-adapter-v5.4.2",
      setWidth:(value,options)=>setWidth(value,options),
      toggleQuick:()=>setWidth(app.classList.contains("quick")?270:72,{forceQuick:!app.classList.contains("quick")}),
      resetWidth:()=>setWidth(270)
    });
    return runtimeApi;
  }

  window.NetworkNavigationCoreAdapter = Object.freeze({ version:"master-prototype-v0.15.8-adapter-v5.4.2", bind:init, closeFloatingUi, setWidth:(w,o)=>runtimeApi&&runtimeApi.setWidth(w,o), toggleQuick:()=>runtimeApi&&runtimeApi.toggleQuick(), resetWidth:()=>runtimeApi&&runtimeApi.resetWidth() });
})();
