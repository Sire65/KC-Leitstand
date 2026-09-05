(function (global) {
  "use strict";

  const VERSION = "0.5.6-embedded-brain-core";
  const BRAIN_ASSET = "assets/images/brain/digital-brain-core-v1.png";

  const STATES = Object.freeze({
    ok:       { color:"#20d36b", accent:"#f7fff9", rotation:32, breath:3.8, breathAmp:.105, flashMin:2.1, flashMax:5.4, boltMin:3.2, boltMax:7.8, ray:2.6, orb:.88, label:"SYSTEMGEHIRN STABIL" },
    notice:   { color:"#d9d52b", accent:"#ffb14a", rotation:20, breath:2.7, breathAmp:.135, flashMin:1.0, flashMax:3.4, boltMin:1.8, boltMax:4.8, ray:1.45, orb:.86, label:"SYSTEMGEHIRN - WARNUNG" },
    alarm:    { color:"#ff8a1f", accent:"#ff3b30", rotation:11, breath:1.55, breathAmp:.195, flashMin:.48, flashMax:1.8, boltMin:.62, boltMax:2.35, ray:.78, orb:.93, label:"SYSTEMGEHIRN - ALARM" },
    critical: { color:"#ff3b30", accent:"#b82b10", rotation:6, breath:.78, breathAmp:.275, flashMin:.15, flashMax:.62, boltMin:.18, boltMax:.86, ray:.42, orb:1.00, label:"SYSTEMGEHIRN - HOECHSTALARM" },
    offline:  { color:"#8f969f", accent:"#d4d7db", rotation:0, breath:0, breathAmp:0, flashMin:0, flashMax:0, boltMin:0, boltMax:0, ray:0, orb:.72, label:"SYSTEMGEHIRN OFFLINE" },
    test:     { color:"#3aa0ff", accent:"#b8dcff", rotation:24, breath:3.4, breathAmp:.10, flashMin:1.2, flashMax:3.6, boltMin:1.8, boltMax:4.8, ray:1.8, orb:.82, label:"SYSTEMGEHIRN - WARTUNG" }
  });

  const DEFAULT_SENSOR_NAMES = [
    "Internet","Router","WLAN","LAN","DNS","Provider","Endgeraete","Observer"
  ];

  const EDGES = Object.freeze([
    [0,1],[1,2],[2,3],[3,0],
    [4,5],[5,6],[6,7],[7,4],
    [0,4],[1,5],[2,6],[3,7]
  ]);

  const VERTICES = Object.freeze([
    [-1,-1, 1],[ 1,-1, 1],[ 1, 1, 1],[-1, 1, 1],
    [-1,-1,-1],[ 1,-1,-1],[ 1, 1,-1],[-1, 1,-1]
  ]);

  function clamp(value, min, max) {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : min;
  }

  function hexToRgb(hex) {
    const v = parseInt(String(hex).replace("#",""), 16);
    return { r:(v>>16)&255, g:(v>>8)&255, b:v&255 };
  }

  function rgba(hex, alpha) {
    const c = hexToRgb(hex);
    return `rgba(${c.r},${c.g},${c.b},${alpha})`;
  }

  class StatusCore3DIndicator extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode:"open" });
      this._state = "ok";
      this._severity = 0;
      this._stability = 100;
      this._message = "";
      this._brainActivity = 0.18;
      this._brainLoad = 0.18;
      this._visual = {...STATES.ok};
      this._transitionScope = "statuscore-3d";
      this._thoughtPulses = [];
      this._nodeBursts = [];
      this._criticalFlashUntil = 0;
      this._edgeFlashColors = [];
      this._enabled = true;
      this._showMetrics = true;
      this._frozen = false;
      this._runtimePause = false;
      this._startTime = performance.now();
      this._edgeStrobes = EDGES.map((_,i) => ({ next:this._startTime+350+i*173+Math.random()*2400, until:0, intensity:1 }));
      this._ambientBolt = { next:this._startTime+1800+Math.random()*3400, until:0, from:0, to:6, seed:0 };
      this._mousePlasma = { active:false, x:0, y:0, last:0, seed:Math.random()*1000 };
      this._brainImage = new Image();
      this._brainImageReady = false;
      this._brainImage.onload = () => { this._brainImageReady=true; this._requestFrame(); };
      this._brainImage.onerror = () => { this._brainImageReady=false; this._requestFrame(); };
      this._brainImage.src = BRAIN_ASSET;
      this._frozenTime = 0;
      this._lastFrame = 0;
      this._raf = 0;
      this._angleOffset = { x:-0.30, y:0.48, z:0.06 };
      this._sensors = DEFAULT_SENSOR_NAMES.map((name, i) => ({
        id:`sensor-${i+1}`, name, state:"ok", value:null
      }));
      this._onVisibility = () => {
        this._runtimePause = document.hidden;
        if (!this._runtimePause) this._requestFrame();
      };
      this._onPointerMove = event => this._handlePointerMove(event);
      this._onPointerLeave = () => { this._mousePlasma.active=false; this._requestFrame(); };
    }

    connectedCallback() {
      this._renderShell();
      document.addEventListener("visibilitychange", this._onVisibility);
      this._resizeObserver = new ResizeObserver(() => this._resize());
      this._resizeObserver.observe(this);
      this._resize();
      this._requestFrame();
    }

    disconnectedCallback() {
      document.removeEventListener("visibilitychange", this._onVisibility);
      this._canvas?.removeEventListener("pointermove", this._onPointerMove);
      this._canvas?.removeEventListener("pointerleave", this._onPointerLeave);
      this._resizeObserver?.disconnect();
      cancelAnimationFrame(this._raf);
      this._transitionService()?.dispose(this._transitionScope);
    }

    _transitionService() { return global.FrameworkTransitionService || null; }

    _getVisualConfig() {
      return {...STATES[this._state], ...this._visual, label:STATES[this._state].label};
    }

    _retargetVisual(targetState) {
      const target=STATES[targetState]||STATES.ok;
      const svc=this._transitionService();
      const duration=targetState==="critical"?420:targetState==="alarm"?720:targetState==="notice"?1050:1450;
      const apply=(key,value)=>{this._visual[key]=value;this._requestFrame();};
      if(!svc||!this._enabled){this._visual={...target};return;}
      svc.setMotionEnabled(this._enabled);
      ["rotation","breath","breathAmp","flashMin","flashMax","boltMin","boltMax","ray","orb"].forEach(key=>{
        svc.transitionValue({id:`brain.${key}`,scope:this._transitionScope,from:Number(this._visual[key]??target[key]),to:Number(target[key]),duration,easing:"standard",interruption:"continue-from-current",reducedMotion:"finish-immediately",onUpdate:value=>apply(key,value)});
      });
      ["color","accent"].forEach(key=>{
        svc.transitionColor({id:`brain.${key}`,scope:this._transitionScope,from:this._visual[key]||target[key],to:target[key],duration,easing:"standard",interruption:"continue-from-current",reducedMotion:"short-fade",onUpdate:value=>apply(key,value)});
      });
    }

    setStatus(payload = {}) {
      if (payload.state && STATES[payload.state] && payload.state !== this._state) { this._state = payload.state; this._retargetVisual(this._state); }
      if (payload.severity !== undefined) this._severity = clamp(payload.severity, 0, 100);
      if (payload.stability !== undefined) this._stability = clamp(payload.stability, 0, 100);
      if (payload.message !== undefined) this._message = String(payload.message || "");
      if (Array.isArray(payload.sensors)) this.setSensors(payload.sensors);
      this._updateText();
      this._requestFrame();
      this.dispatchEvent(new CustomEvent("statuscore:status-change", {
        detail:this.getStatus(), bubbles:true, composed:true
      }));
    }

    setSensors(sensors = []) {
      this._sensors = DEFAULT_SENSOR_NAMES.map((fallback, i) => {
        const src = sensors[i] || {};
        return {
          id:String(src.id || `sensor-${i+1}`),
          name:String(src.name || fallback),
          state:STATES[src.state] ? src.state : "ok",
          value:src.value ?? null
        };
      });
      this._requestFrame();
    }

    setSettings(settings = {}) {
      if (typeof settings.enabled === "boolean") {
        this._enabled = settings.enabled;
        const svc=this._transitionService();
        if(svc){svc.setMotionEnabled(this._enabled);if(!this._enabled)svc.finishAllTransitions(this._transitionScope);}
      }
      if (typeof settings.showMetrics === "boolean") this._showMetrics = settings.showMetrics;
      this._updateText();
      this._requestFrame();
      this.dispatchEvent(new CustomEvent("statuscore:settings-change", {
        detail:this.getSettings(), bubbles:true, composed:true
      }));
    }

    getSettings() {
      return { enabled:this._enabled, showMetrics:this._showMetrics };
    }

    setEnabled(enabled) {
      this.setSettings({ enabled:Boolean(enabled) });
    }

    setBrainActivity(value) {
      const target=clamp(value,0,1);
      this._brainLoad=target;
      const svc=this._transitionService();
      if(svc&&this._enabled){
        svc.transitionValue({id:"brain.runtime-load",scope:this._transitionScope,from:this._brainActivity,to:target,duration:target>this._brainActivity?520:1350,easing:"standard",interruption:"continue-from-current",reducedMotion:"finish-immediately",onUpdate:v=>{this._brainActivity=clamp(v,0,1);this._requestFrame();}});
      } else { this._brainActivity=target; this._requestFrame(); }
    }

    getBrainActivity() {
      return this._brainActivity;
    }

    sendThought(fromIndex=0,toIndex=1,severity="ok") {
      const pulse={from:Math.max(0,Math.min(7,Number(fromIndex)||0)),to:Math.max(0,Math.min(7,Number(toIndex)||1)),severity,started:performance.now(),duration:620+Math.random()*720};
      this._thoughtPulses.push(pulse);
      this._thoughtPulses=this._thoughtPulses.slice(-10);
      this._requestFrame();
    }

    triggerCriticalFlash() {
      this._criticalFlashUntil=performance.now()+650;
      this._requestFrame();
    }

    freezeFrame() {
      if (this._frozen) return;
      this._frozenTime = performance.now();
      this._frozen = true;
      this._updateFreezeButton();
      this._draw(this._frozenTime);
    }

    unfreezeFrame() {
      if (!this._frozen) return;
      const now = performance.now();
      this._startTime += now - this._frozenTime;
      this._frozen = false;
      this._updateFreezeButton();
      this._requestFrame();
    }

    isFrozen() {
      return this._frozen;
    }

    pause() { this.freezeFrame(); }
    resume() { this.unfreezeFrame(); }

    getStatus() {
      return {
        state:this._state,
        severity:this._severity,
        stability:this._stability,
        message:this._message,
        sensors:this._sensors.map(s => ({...s}))
      };
    }

    _renderShell() {
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display:block;
            min-width:260px;
            min-height:190px;
            contain:layout paint style;
            font-family:system-ui,-apple-system,"Segoe UI",sans-serif;
            color:#eef7ff;
          }
          .root {
            position:relative;
            height:100%;
            min-height:190px;
            border-radius:18px;
            overflow:hidden;
            background:
              radial-gradient(circle at 50% 44%,rgba(33,63,88,.22),transparent 34%),
              linear-gradient(180deg,rgba(12,28,43,.18),rgba(4,10,17,.04));
          }
          canvas { position:absolute; inset:0; width:100%; height:100%; display:block; }
          .status {
            position:absolute; left:4px; right:4px; bottom:3px;
            text-align:center; pointer-events:none; white-space:nowrap;
          }
          .label {
            font-weight:800; font-size:9px; letter-spacing:.04em;
            text-shadow:0 0 8px var(--state-color,#20d36b); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
          }
          .metrics {
            margin-top:1px; display:flex; justify-content:center; gap:6px;
            font-size:8px; font-weight:650; opacity:.82; white-space:nowrap;
          }
          .toolbar {
            position:absolute; top:10px; right:10px; display:flex; gap:6px;
          }
          button {
            appearance:none; border:1px solid rgba(255,255,255,.22);
            background:rgba(7,18,28,.78); color:#f4f8fb;
            border-radius:9px; padding:7px 10px; font-weight:700; cursor:pointer;
            backdrop-filter:blur(5px);
          }
          button:hover { background:rgba(18,40,58,.9); }
          button:focus-visible { outline:2px solid #fff; outline-offset:2px; }
          .off {
            position:absolute; left:50%; top:50%; transform:translate(-50%,-50%);
            padding:10px 13px; border-radius:10px; border:1px solid rgba(255,255,255,.18);
            background:rgba(7,15,23,.88); font-size:12px; letter-spacing:.04em;
            display:none;
          }
          :host([data-disabled]) .off { display:block; }
          :host([data-disabled]) canvas { opacity:.25; filter:saturate(.25); }
          @media (prefers-reduced-motion:reduce) {
            .toolbar button:first-child { display:none; }
          }
        </style>
        <div class="root">
          <canvas part="canvas" aria-label="3D-Systemstatus"></canvas>
          <div class="toolbar">
            <button class="freeze" type="button">Stop</button>
          </div>
          <div class="off">ANIMATION AUSGESCHALTET</div>
          <div class="status">
            <div class="label" aria-live="polite"></div>
            <div class="metrics"></div>
          </div>
        </div>
      `;
      this._canvas = this.shadowRoot.querySelector("canvas");
      this._ctx = this._canvas.getContext("2d");
      this._freezeBtn = this.shadowRoot.querySelector(".freeze");
      this._freezeBtn.addEventListener("click", () => {
        this._frozen ? this.unfreezeFrame() : this.freezeFrame();
      });
      this._canvas.addEventListener("click", e => this._handleCanvasClick(e));
      this._canvas.addEventListener("pointermove", this._onPointerMove);
      this._canvas.addEventListener("pointerleave", this._onPointerLeave);
      this._updateText();
      this._updateFreezeButton();
    }

    _updateText() {
      const cfg = this._getVisualConfig();
      this.style.setProperty("--state-color", cfg.color);
      this.toggleAttribute("data-disabled", !this._enabled);
      const label = this.shadowRoot?.querySelector(".label");
      const metrics = this.shadowRoot?.querySelector(".metrics");
      if (label) label.textContent = this._message || cfg.label;
      if (metrics) {
        metrics.style.display = this._showMetrics ? "flex" : "none";
        metrics.innerHTML = `<span>Stabilitaet ${Math.round(this._stability)} %</span><span>Alarm ${Math.round(this._severity)} %</span>`;
      }
    }

    _updateFreezeButton() {
      if (this._freezeBtn) this._freezeBtn.textContent = this._frozen ? "Weiter" : "Stop";
    }

    _resize() {
      if (!this._canvas) return;
      const rect = this.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(260, Math.round(rect.width || 320));
      const h = Math.max(190, Math.round(rect.height || 210));
      this._canvas.width = Math.round(w * dpr);
      this._canvas.height = Math.round(h * dpr);
      this._canvas.style.width = `${w}px`;
      this._canvas.style.height = `${h}px`;
      this._dpr = dpr;
      this._w = w;
      this._h = h;
      this._requestFrame();
    }

    _requestFrame() {
      if (this._raf) return;
      this._raf = requestAnimationFrame(t => {
        this._raf = 0;
        if (!this._runtimePause) this._loop(t);
      });
    }

    _loop(time) {
      if (!this._enabled) {
        this._draw(this._frozen ? this._frozenTime : time);
        return;
      }
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const fps = reduce ? 12 : 30;
      const renderTime = this._frozen ? this._frozenTime : (reduce ? this._startTime + (time - this._startTime) * 0.24 : time);
      if (time - this._lastFrame >= 1000/fps || this._frozen) {
        this._lastFrame = time;
        this._draw(renderTime);
      }
      if (!this._frozen) this._requestFrame();
    }

    _angles(time) {
      const cfg = this._getVisualConfig();
      if (!this._enabled || this._frozen || cfg.rotation <= 0) return this._angleOffset;
      const t = (time - this._startTime) / 1000;
      const y = this._angleOffset.y + (t / cfg.rotation) * Math.PI * 2;
      const activity=clamp(this._brainActivity,0,1);
      const xAmp=this._state==="ok"?0.10:this._state==="notice"?0.22:0.34+activity*.18;
      const zAmp=this._state==="ok"?0.035:this._state==="notice"?0.08:0.12+activity*.08;
      const x = this._angleOffset.x + Math.sin(t / cfg.rotation * Math.PI * 2) * xAmp;
      const z = this._angleOffset.z + Math.sin(t / cfg.rotation * Math.PI * 4) * zAmp;
      return {x,y,z};
    }

    _rotate(v, a) {
      let [x,y,z] = v;
      let c=Math.cos(a.x), s=Math.sin(a.x);
      [y,z] = [y*c-z*s, y*s+z*c];
      c=Math.cos(a.y); s=Math.sin(a.y);
      [x,z] = [x*c+z*s, -x*s+z*c];
      c=Math.cos(a.z); s=Math.sin(a.z);
      [x,y] = [x*c-y*s, x*s+y*c];
      return [x,y,z];
    }

    _project(v, scale, cx, cy) {
      const camera = 4.4;
      const p = camera / (camera - v[2]);
      return { x:cx + v[0]*scale*p, y:cy + v[1]*scale*p, z:v[2], p };
    }

    _breath(time, cfg) {
      if (!cfg.breath || !this._enabled || this._frozen) return 1;
      const activity = clamp(this._brainActivity,0,1);
      const period = Math.max(.55,cfg.breath/(1+activity*.68));
      const phase = ((time-this._startTime)/1000)*(Math.PI*2/period);
      const amplitude = cfg.breathAmp*(1.05+activity*.72);
      return 1 + Math.sin(phase-Math.PI/2)*amplitude;
    }

    _edgeFlash(time,index,cfg) {
      if (!this._enabled || !cfg.flashMin) return 1;
      const slot=this._edgeStrobes[index];
      if (time>=slot.next) {
        const activity=clamp(this._brainActivity,0,1);
        const min=cfg.flashMin*1000/(1+activity*1.55), max=cfg.flashMax*1000/(1+activity*1.35);
        slot.until=time+95+Math.random()*(150+activity*220);
        slot.intensity=2.1+Math.random()*(1.9+activity*2.2);
        const rare=Math.random();
        let flashColor="#ffffff";
        if(this._state==="critical"){const colors=["#ffffff","#86d8ff","#9f7cff","#ff3b30","#ff8a1f"];flashColor=colors[Math.floor(Math.random()*colors.length)]}
        else if(this._state==="alarm"){flashColor=rare<.18?"#7fd7ff":rare<.46?"#ff3b30":"#ffffff"}
        else if(this._state==="notice"){flashColor=rare<.055?"#ff3b30":rare<.105?"#5fc7ff":"#ffffff"}
        else if(this._state==="ok"){flashColor=rare<.028?"#ff3b30":rare<.070?"#54c7ff":"#ffffff"}
        this._edgeFlashColors[index]=flashColor;
        slot.next=time+min+Math.random()*Math.max(80,max-min);
        if(Math.random()<(.12+activity*.18)) slot.next=slot.until+70+Math.random()*160;
      }
      if(time<slot.until){
        const remaining=Math.max(0,slot.until-time);
        const life=Math.min(1,remaining/190);
        const flicker=.72+.28*Math.sin((slot.until-time)*.19+index*1.7);
        return 1+(slot.intensity-1)*(0.72+life*.55)*flicker;
      }
      return 1;
    }

    _updateAmbientBolt(time,cfg) {
      if (!this._enabled || !cfg.boltMin) return;
      const b=this._ambientBolt;
      if(time>=b.next){
        const activity=clamp(this._brainActivity,0,1);
        b.from=Math.floor(Math.random()*8);
        do{b.to=Math.floor(Math.random()*8)}while(b.to===b.from);
        b.seed=Math.random()*1000;
        b.until=time+105+Math.random()*(105+activity*180);
        const min=cfg.boltMin*1000/(1+activity*1.35),max=cfg.boltMax*1000/(1+activity*1.15);
        b.next=time+min+Math.random()*Math.max(100,max-min);
      }
    }

    _rayPulse(time, seconds) {
      if (!seconds) return 0;
      return 0.32 + 0.22*(0.5+0.5*Math.sin((time-this._startTime)/1000 * Math.PI*2/seconds));
    }

    _rayPalette(index) {
      if (this._state === "critical") return index % 2 === 0 ? ["#b82b10", "#ff3b30"] : ["#ff3b30", "#b82b10"];
      if (this._state === "alarm") return index % 2 === 0 ? ["#ff8a1f", "#ff3b30"] : ["#ff3b30", "#ff8a1f"];
      if (this._state === "notice") return index % 2 === 0 ? ["#22d36b", "#ff9f43"] : ["#ff9f43", "#22d36b"];
      if (this._state === "test") return index % 2 === 0 ? ["#ffffff", "#3aa0ff"] : ["#3aa0ff", "#ffffff"];
      return index % 2 === 0 ? ["#ffffff", "#22e36f"] : ["#22e36f", "#ffffff"];
    }

    _drawMysteryAura(ctx,cx,cy,scale,time,cfg) {
      if (this._state === "offline") return;
      const activity=clamp(this._brainActivity,0,1);
      const phase=(time-this._startTime)/1000;
      const pulse=.5+.5*Math.sin(phase*1.45);

      ctx.save();
      const outer=ctx.createRadialGradient(cx,cy,scale*.08,cx,cy,scale*(.96+activity*.16));
      outer.addColorStop(0,rgba(cfg.accent,.19+activity*.12));
      outer.addColorStop(.34,rgba(cfg.color,.145+activity*.095));
      outer.addColorStop(.68,rgba(cfg.accent,.060+activity*.055));
      outer.addColorStop(1,"rgba(0,0,0,0)");
      ctx.globalAlpha=.80+pulse*.18;
      ctx.fillStyle=outer;
      ctx.beginPath();
      ctx.ellipse(cx,cy,scale*(1.04+activity*.18),scale*(.58+activity*.10),phase*.08,0,Math.PI*2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.globalAlpha=.22+activity*.18;
      ctx.strokeStyle=rgba(cfg.accent,.62);
      ctx.lineWidth=1.0+activity*1.05;
      ctx.shadowColor=cfg.accent;
      ctx.shadowBlur=15+activity*26;
      for(let i=0;i<4;i++){
        const r=scale*(.38+i*.16)+Math.sin(phase*1.35+i)*scale*.032;
        ctx.beginPath();
        ctx.ellipse(cx,cy,r,r*(.25+i*.045),phase*(.18+i*.035)+i*.72,0,Math.PI*2);
        ctx.stroke();
      }
      ctx.restore();

      ctx.save();
      ctx.globalAlpha=.08+activity*.08;
      ctx.strokeStyle="rgba(255,255,255,.72)";
      ctx.lineWidth=.7;
      ctx.shadowColor="#ffffff";
      ctx.shadowBlur=8+activity*10;
      for(let i=0;i<2;i++){
        const r=scale*(.48+i*.22)+Math.cos(phase*1.1+i)*scale*.018;
        ctx.beginPath();
        ctx.ellipse(cx,cy,r,r*(.19+i*.035),-phase*.16+i*.85,0,Math.PI*2);
        ctx.stroke();
      }
      ctx.restore();
    }
    _draw(time) {
      if (!this._ctx || !this._w || !this._h) return;
      const ctx = this._ctx;
      const dpr = this._dpr || 1;
      ctx.setTransform(dpr,0,0,dpr,0,0);
      ctx.clearRect(0,0,this._w,this._h);

      const cfg = this._getVisualConfig();
      const cx = this._w/2;
      const cy = this._h*.43;
      const cubeScale = Math.min(this._w*.205, this._h*.255);
      const angles = this._angles(time);

      const rotated = VERTICES.map(v => this._rotate(v, angles));
      const projected = rotated.map(v => this._project(v, cubeScale, cx, cy));

      // Soft background halo.
      const halo = ctx.createRadialGradient(cx,cy,8,cx,cy,cubeScale*1.25);
      halo.addColorStop(0,rgba(cfg.color,.13));
      halo.addColorStop(.35,rgba(cfg.color,.055));
      halo.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle = halo;
      ctx.fillRect(cx-cubeScale*1.4,cy-cubeScale*1.4,cubeScale*2.8,cubeScale*2.8);

      // 1) Fine state-colored rays behind sphere and rods.
      if (this._state !== "offline") {
        const pulse = this._rayPulse(time,cfg.ray);
        projected.forEach((p,i) => {
          const dx=p.x-cx, dy=p.y-cy;
          const len=Math.max(1,Math.hypot(dx,dy));
          const nx=-dy/len, ny=dx/len;
          const separation=1.7;
          const rayColors=this._rayPalette(i);

          rayColors.forEach((rayColor,j) => {
            const side=j===0?-1:1;
            const sx=cx+nx*separation*side;
            const sy=cy+ny*separation*side;
            const ex=p.x+nx*separation*side;
            const ey=p.y+ny*separation*side;
            const grad=ctx.createLinearGradient(sx,sy,ex,ey);
            grad.addColorStop(0,"rgba(255,255,255,.44)");
            grad.addColorStop(.10,rgba(rayColor,.46));
            grad.addColorStop(.52,rgba(rayColor,.18));
            grad.addColorStop(1,rgba(rayColor,0));

            ctx.save();
            ctx.strokeStyle=grad;
            ctx.lineWidth=.46;
            ctx.globalAlpha=pulse*(j===0?1:.90);
            ctx.shadowColor=rayColor;
            ctx.shadowBlur=2.8;
            ctx.beginPath();
            ctx.moveTo(sx,sy);
            ctx.lineTo(ex,ey);
            ctx.stroke();
            ctx.restore();
          });
        });
      }

      this._drawMysteryAura(ctx,cx,cy,cubeScale,time,cfg);
      this._drawGlassFaces(ctx,projected,cx,cy,cfg);
      this._drawGlassReflections(ctx,projected,time,cfg);
      this._drawCoolingFlow(ctx,projected,cx,cy,cubeScale,time,cfg);
      this._drawHeatShield(ctx,cx,cy,cubeScale,time,cfg);

      // 2) Depth-correct organism: rear rods, living core, then front rods.
      const edgeDepth=EDGES.map(([a,b],index)=>({a,b,index,z:(projected[a].z+projected[b].z)/2})).sort((x,y)=>x.z-y.z);
      edgeDepth.filter(e=>e.z<0).forEach(e=>this._drawRod(ctx,projected[e.a],projected[e.b],cfg,this._edgeFlash(time,e.index,cfg),this._edgeFlashColors?.[e.index]));

      // The embedded brain replaces only the former sphere and keeps its proven status pulse.
      const brainAlarmBoost=this._state==="critical"?1.24:this._state==="alarm"?1.14:this._state==="notice"?1.05:1;
      this._drawBrainCore(ctx,cx,cy,cubeScale*0.31*cfg.orb*this._breath(time,cfg)*brainAlarmBoost,cfg,time);

      edgeDepth.filter(e=>e.z>=0).forEach(e=>this._drawRod(ctx,projected[e.a],projected[e.b],cfg,this._edgeFlash(time,e.index,cfg),this._edgeFlashColors?.[e.index]));

      // Neural currents and occasional short lightning show continuous thought processing.
      this._drawStrobeSignalBolts(ctx,projected,cx,cy,time,cfg);
      this._drawNodeStreams(ctx,projected,time,cfg);
      this._drawThoughtPulses(ctx,projected,cx,cy,time,cfg);
      this._updateAmbientBolt(time,cfg);
      this._drawAmbientBolt(ctx,projected,cx,cy,time,cfg);
      this._drawMousePlasma(ctx,cx,cy,time,cfg);
      this._drawOverheatWave(ctx,cx,cy,cubeScale,time,cfg);
      this._drawCriticalStorm(ctx,cx,cy,cubeScale,time,cfg);

      // Sensor nodes last.
      projected.forEach((p,i) => this._drawNode(ctx,p,this._sensors[i],i));
    }

    _drawSphere(ctx,cx,cy,r,cfg,time) {
      const base = hexToRgb(cfg.color);
      const grad = ctx.createRadialGradient(cx-r*.34,cy-r*.42,r*.05,cx,cy,r);
      grad.addColorStop(0,"rgba(255,255,255,.98)");
      grad.addColorStop(.09,rgba(cfg.accent,.98));
      grad.addColorStop(.28,rgba(cfg.color,.98));
      grad.addColorStop(.64,`rgba(${Math.round(base.r*.48)},${Math.round(base.g*.48)},${Math.round(base.b*.48)},.98)`);
      grad.addColorStop(.88,"rgba(4,10,15,.98)");
      grad.addColorStop(1,"rgba(0,0,0,1)");
      ctx.save();
      ctx.fillStyle = grad;
      ctx.shadowColor = cfg.color;
      ctx.shadowBlur = 20 + this._severity*.18;
      ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill();

      if (this._state === "test") {
        ctx.save();
        ctx.strokeStyle="rgba(255,255,255,.98)";
        ctx.lineWidth=2.15;
        ctx.shadowColor="#ffffff";
        ctx.shadowBlur=10;
        ctx.beginPath();
        ctx.arc(cx,cy,r*1.20,0,Math.PI*2);
        ctx.stroke();

        ctx.setLineDash([4.5,5.5]);
        ctx.lineDashOffset=-((time-this._startTime)/55)%10;
        ctx.globalAlpha=.82;
        ctx.lineWidth=1.45;
        ctx.beginPath();
        ctx.arc(cx,cy,r*1.42,0,Math.PI*2);
        ctx.stroke();
        ctx.restore();
      }

      const core = ctx.createRadialGradient(cx,cy,0,cx,cy,r*.65);
      core.addColorStop(0,"rgba(255,255,255,.84)");
      core.addColorStop(.18,rgba(cfg.color,.54));
      core.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle = core;
      ctx.beginPath(); ctx.arc(cx,cy,r*.65,0,Math.PI*2); ctx.fill();

      const rot = (time-this._startTime)*0.00045*(.4+this._brainActivity);
      ctx.strokeStyle = rgba(cfg.accent,.28);
      ctx.lineWidth = 1;
      ctx.shadowBlur = 4;
      for (let i=0;i<4;i++) {
        ctx.beginPath();
        ctx.ellipse(cx,cy,r*(.42+i*.12),r*(.10+i*.025),rot+i*.55,0,Math.PI*2);
        ctx.stroke();
      }

      const hx = cx-r*.34 + Math.sin(rot*1.7)*r*.06;
      const hy = cy-r*.40 + Math.cos(rot*1.3)*r*.04;
      const hi = ctx.createRadialGradient(hx,hy,0,hx,hy,r*.31);
      hi.addColorStop(0,"rgba(255,255,255,.96)");
      hi.addColorStop(.24,"rgba(255,255,255,.42)");
      hi.addColorStop(1,"rgba(255,255,255,0)");
      ctx.fillStyle = hi;
      ctx.beginPath(); ctx.arc(hx,hy,r*.31,0,Math.PI*2); ctx.fill();
      ctx.restore();
    }

    _drawRod(ctx,a,b,cfg,flash,flashColor) {
      const dx=b.x-a.x, dy=b.y-a.y;
      const len=Math.hypot(dx,dy);
      if (!len) return;

      const ux=dx/len, uy=dy/len;
      const nx=-uy, ny=ux;

      const rodGradient=ctx.createLinearGradient(a.x,a.y,b.x,b.y);
      rodGradient.addColorStop(0.00,rgba(cfg.color,.58));
      rodGradient.addColorStop(0.30,rgba(cfg.color,.78));
      rodGradient.addColorStop(0.39,rgba(cfg.color,.42));
      rodGradient.addColorStop(0.445,"rgba(255,255,255,.64)");
      rodGradient.addColorStop(0.50,"rgba(255,255,255,1)");
      rodGradient.addColorStop(0.555,"rgba(255,255,255,.64)");
      rodGradient.addColorStop(0.61,rgba(cfg.color,.42));
      rodGradient.addColorStop(0.70,rgba(cfg.color,.78));


      rodGradient.addColorStop(1.00,rgba(cfg.color,.58));

      ctx.save();
      ctx.lineCap="round";
      ctx.strokeStyle=rodGradient;
      ctx.lineWidth=1.55;
      ctx.shadowColor=cfg.color;
      ctx.shadowBlur=10;
      ctx.beginPath();
      ctx.moveTo(a.x,a.y);
      ctx.lineTo(b.x,b.y);
      ctx.stroke();

      const whiteStart=.305;
      const whiteEnd=.695;
      const centerGradient=ctx.createLinearGradient(
        a.x+dx*whiteStart,a.y+dy*whiteStart,
        a.x+dx*whiteEnd,a.y+dy*whiteEnd
      );
      centerGradient.addColorStop(0.00,rgba(cfg.color,0));
      centerGradient.addColorStop(0.08,"rgba(255,255,255,.12)");
      centerGradient.addColorStop(0.20,"rgba(255,255,255,.78)");
      centerGradient.addColorStop(0.50,"rgba(255,255,255,1)");
      centerGradient.addColorStop(0.80,"rgba(255,255,255,.78)");
      centerGradient.addColorStop(0.92,"rgba(255,255,255,.12)");
      centerGradient.addColorStop(1.00,rgba(cfg.color,0));

      ctx.strokeStyle=centerGradient;
      ctx.lineWidth=3.05;
      ctx.shadowColor="#ffffff";
      ctx.shadowBlur=15.5;
      ctx.beginPath();
      ctx.moveTo(a.x+dx*whiteStart,a.y+dy*whiteStart);
      ctx.lineTo(a.x+dx*whiteEnd,a.y+dy*whiteEnd);
      ctx.stroke();

      const mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};
      const capsuleLen=Math.max(6,Math.min(9,len*.065));
      const capsuleHalf=capsuleLen/2;
      const halfHeight=2.05;
      const p1={x:mid.x-ux*capsuleHalf,y:mid.y-uy*capsuleHalf};
      const p2={x:mid.x+ux*capsuleHalf,y:mid.y+uy*capsuleHalf};

      ctx.lineWidth=.82+Math.max(0,flash-1)*.22;
      const strobeColor=flashColor||"#ffffff";
      ctx.strokeStyle=rgba(strobeColor,Math.min(1,.72+.30*flash));
      ctx.shadowColor=strobeColor;
      ctx.shadowBlur=7.0+10.5*Math.max(0,flash-1);
      ctx.beginPath();
      ctx.moveTo(p1.x+nx*halfHeight,p1.y+ny*halfHeight);
      ctx.lineTo(p2.x+nx*halfHeight,p2.y+ny*halfHeight);
      ctx.arc(p2.x,p2.y,halfHeight,Math.atan2(ny,nx),Math.atan2(-ny,-nx),false);
      ctx.lineTo(p1.x-nx*halfHeight,p1.y-ny*halfHeight);
      ctx.arc(p1.x,p1.y,halfHeight,Math.atan2(-ny,-nx),Math.atan2(ny,nx),false);
      ctx.closePath();
      ctx.stroke();

      if (flash>1.03) {
        ctx.globalAlpha=Math.min(1,.18+(flash-1)*.48);
        ctx.fillStyle=rgba(strobeColor,.90);
        ctx.fill();
      }
      ctx.restore();
    }

    _drawGlassFaces(ctx,projected,cx,cy,cfg) {
      if (this._state === "offline") return;
      const faces=[[0,1,2,3],[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]];
      const depth=faces.map((face,index)=>({face,index,z:face.reduce((sum,i)=>sum+projected[i].z,0)/face.length})).sort((a,b)=>a.z-b.z);
      ctx.save();
      depth.forEach(({face,index})=>{
        const pts=face.map(i=>projected[i]);
        if(pts.some(p=>!p)) return;
        const alpha=this._state==="critical"?.070:this._state==="alarm"?.060:this._state==="notice"?.052:.044;
        const edgeAlpha=this._state==="critical"?.30:this._state==="alarm"?.26:.22;
        const g=ctx.createLinearGradient(pts[0].x,pts[0].y,pts[2].x,pts[2].y);
        g.addColorStop(0,rgba(cfg.accent,alpha*.55));
        g.addColorStop(.48,rgba(cfg.color,alpha));
        g.addColorStop(1,"rgba(255,255,255,.018)");
        ctx.beginPath();
        pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
        ctx.closePath();
        ctx.fillStyle=g;
        ctx.fill();
        ctx.strokeStyle=index%2?rgba(cfg.accent,edgeAlpha):rgba(cfg.color,edgeAlpha);
        ctx.lineWidth=.95;
        ctx.shadowColor=cfg.color;
        ctx.shadowBlur=6;
        ctx.stroke();
      });
      ctx.restore();
    }
    _drawGlassReflections(ctx,projected,time,cfg) {
      if (this._state === "offline") return;
      const phase=(time-this._startTime)/1000;
      const bands=[[0,1,5,4],[3,2,6,7],[0,3,7,4],[1,2,6,5],[0,1,2,3]];
      ctx.save();
      bands.forEach((face,index)=>{
        const pts=face.map(i=>projected[i]); if(pts.some(p=>!p)) return;
        const a=pts[0],b=pts[1],c=pts[2],d=pts[3];
        const sweep=(Math.sin(phase*.45+index*1.7)*.5+.5);
        const p1={x:a.x+(b.x-a.x)*sweep,y:a.y+(b.y-a.y)*sweep};
        const p2={x:d.x+(c.x-d.x)*sweep,y:d.y+(c.y-d.y)*sweep};
        const grad=ctx.createLinearGradient(p1.x,p1.y,p2.x,p2.y);
        grad.addColorStop(0,"rgba(255,255,255,0)");
        grad.addColorStop(.42,"rgba(255,255,255,.34)");
        grad.addColorStop(.58,rgba(cfg.accent,.28));
        grad.addColorStop(1,"rgba(255,255,255,0)");
        ctx.strokeStyle=grad;
        ctx.lineWidth=.95;
        ctx.shadowColor="#ffffff";
        ctx.shadowBlur=9;
        ctx.globalAlpha=.58;
        ctx.beginPath();ctx.moveTo(p1.x,p1.y);ctx.lineTo(p2.x,p2.y);ctx.stroke();
      });
      ctx.restore();
    }


    _drawCoolingFlow(ctx,projected,cx,cy,scale,time,cfg) {
      const temp=this._brainTemperature();
      if(this._state==="offline" || temp<70) return;
      const heat=clamp((temp-70)/70,0,1);
      const phase=(time-this._startTime)/1000;
      const coolant=heat>.72?"#67e8ff":"#3aa0ff";
      ctx.save();
      EDGES.forEach(([from,to],i)=>{
        const a=projected[from],b=projected[to]; if(!a||!b)return;
        const flow=(phase*(1.15+heat*2.3)+i*.127)%1;
        const tail=Math.max(0,flow-(.14+heat*.10));
        const sx=a.x+(b.x-a.x)*tail, sy=a.y+(b.y-a.y)*tail;
        const ex=a.x+(b.x-a.x)*flow, ey=a.y+(b.y-a.y)*flow;
        const grad=ctx.createLinearGradient(sx,sy,ex,ey);
        grad.addColorStop(0,"rgba(70,190,255,0)");
        grad.addColorStop(.32,`rgba(74,200,255,${.20+heat*.26})`);
        grad.addColorStop(1,`rgba(210,250,255,${.56+heat*.36})`);
        ctx.strokeStyle=grad;
        ctx.lineWidth=1.1+heat*2.2;
        ctx.shadowColor=coolant;
        ctx.shadowBlur=8+heat*20;
        ctx.globalAlpha=.46+heat*.42;
        ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(ex,ey);ctx.stroke();
        ctx.fillStyle=heat>.75?"#d9fbff":coolant;
        ctx.globalAlpha=.75;
        ctx.beginPath();ctx.arc(ex,ey,1.8+heat*3.0,0,Math.PI*2);ctx.fill();
      });
      const pump=.5+.5*Math.sin(phase*(3.2+heat*2.4));
      ctx.globalAlpha=.22+heat*.42+pump*.18;
      const ring=ctx.createRadialGradient(cx,cy,scale*.10,cx,cy,scale*(.38+heat*.20));
      ring.addColorStop(0,"rgba(210,250,255,.22)");
      ring.addColorStop(.45,`rgba(63,185,255,${.16+heat*.28})`);
      ring.addColorStop(1,"rgba(0,120,255,0)");
      ctx.fillStyle=ring;
      ctx.beginPath();ctx.ellipse(cx,cy,scale*(.42+heat*.16),scale*(.22+heat*.08),phase*.38,0,Math.PI*2);ctx.fill();
      ctx.restore();
    }    _metricColor(value, yellow, orange, red) {
      if(value>=red) return "#ff3b30";
      if(value>=orange) return "#ff8a1f";
      if(value>=yellow) return "#ffe45e";
      return "#20d36b";
    }

    _drawMiniMetric(ctx,x,y,label,value,unit,color,hot) {
      const flicker=hot?.72+.28*Math.sin(performance.now()*.026+x):1;
      ctx.save();
      ctx.font="700 8px system-ui,-apple-system,Segoe UI,sans-serif";
      ctx.textAlign="left";
      ctx.textBaseline="middle";
      ctx.globalAlpha=.94;
      ctx.fillStyle="rgba(4,14,22,.58)";
      ctx.strokeStyle=rgba(color,.45*flicker);
      ctx.shadowColor=color;
      ctx.shadowBlur=hot?12*flicker:5;
      ctx.beginPath();
      if(ctx.roundRect){ctx.roundRect(x,y,58,17,5)}else{ctx.rect(x,y,58,17)}
      ctx.fill();ctx.stroke();
      ctx.fillStyle="rgba(218,238,248,.78)";
      ctx.fillText(label,x+5,y+5.5);
      ctx.font="800 10px system-ui,-apple-system,Segoe UI,sans-serif";
      ctx.fillStyle=color;
      ctx.fillText(`${value}${unit}`,x+5,y+12.3);
      if(hot){
        ctx.globalAlpha=.36*flicker;
        ctx.fillStyle="#ffffff";
        ctx.beginPath();ctx.arc(x+51,y+5,2.2,0,Math.PI*2);ctx.fill();
      }
      ctx.restore();
    }

    _drawReactorTelemetry(ctx,cx,cy,scale,time,cfg) {
      if(this._state==="offline") return;
      const activity=clamp(this._brainActivity,0,1);
      const energy=Math.round(Math.min(100,34+activity*52+this._severity*.18));
      const rotation=Math.round(Math.max(0,(STATES[this._state]?.rotation?60/STATES[this._state].rotation*20:0)+activity*34));
      const temp=this._brainTemperature();
      const load=Math.round(Math.min(100,activity*100));
      const metrics=[
        ["ENERGIE",energy,"%",this._metricColor(energy,68,82,94),energy>=94],
        ["ROTATION",rotation,"%",this._metricColor(rotation,42,62,82),rotation>=82],
        ["TEMP",temp,"°C",this._metricColor(temp,48,72,96),temp>=96],
        ["LAST",load,"%",this._metricColor(load,48,70,88),load>=88]
      ];
      const startX=cx-scale*.95;
      const y=cy-scale*1.18;
      metrics.forEach((m,i)=>this._drawMiniMetric(ctx,startX+i*62,y,m[0],m[1],m[2],m[3],m[4]));
    }
    _brainTemperature() {
      const activity=clamp(this._brainActivity,0,1);
      const severity=clamp(this._severity,0,100)/100;
      if(this._state==="critical") return Math.round(96+severity*42+activity*28);
      if(this._state==="alarm") return Math.round(67+severity*34+activity*18);
      if(this._state==="notice") return Math.round(43+severity*18+activity*10);
      if(this._state==="test") return Math.round(38+activity*14);
      return Math.round(32+activity*8);
    }

    _drawTemperatureBadge(ctx,cx,cy,scale,time,cfg) {
      if(this._state==="offline") return;
      const temp=this._brainTemperature();
      const hot=this._state==="critical"||this._state==="alarm";
      const warning=this._state==="notice";
      const x=cx+scale*.78;
      const y=cy-scale*.82;
      const label=`${temp}°C`;
      ctx.save();
      ctx.font=`${hot?12:10}px system-ui,-apple-system,Segoe UI,sans-serif`;
      ctx.textAlign="center";
      ctx.textBaseline="middle";
      const w=ctx.measureText(label).width+18;
      const h=hot?20:17;
      const bg=hot?"rgba(92,10,4,.72)":warning?"rgba(80,66,8,.55)":"rgba(5,28,21,.46)";
      const fg=hot?"#fff3e8":warning?"#fff4a6":"#bfffe0";
      ctx.fillStyle=bg;
      ctx.strokeStyle=hot?"rgba(255,255,255,.42)":warning?"rgba(255,231,103,.34)":"rgba(183,255,210,.26)";
      ctx.shadowColor=hot?"#ff4b30":warning?"#ffe45e":cfg.color;
      ctx.shadowBlur=hot?16:6;
      ctx.beginPath();
      if(ctx.roundRect){ctx.roundRect(x-w/2,y-h/2,w,h,7)}else{ctx.rect(x-w/2,y-h/2,w,h)}
      ctx.fill();ctx.stroke();
      ctx.fillStyle=fg;
      ctx.font=`700 ${hot?12:10}px system-ui,-apple-system,Segoe UI,sans-serif`;
      ctx.fillText(label,x,y+.2);
      if(hot){
        ctx.globalAlpha=.38+.22*Math.sin((time-this._startTime)*.012);
        ctx.strokeStyle="rgba(255,255,255,.85)";
        ctx.beginPath();ctx.arc(x+w/2-3,y-h/2+3,3.5,0,Math.PI*2);ctx.stroke();
      }
      ctx.restore();
    }

    _drawHeatShield(ctx,cx,cy,scale,time,cfg) {
      if(this._state!=="critical"&&this._state!=="alarm") return;
      const critical=this._state==="critical";
      const phase=(time-this._startTime)/1000;
      ctx.save();
      ctx.globalAlpha=critical?.36:.20;
      ctx.strokeStyle=critical?"rgba(255,244,220,.86)":"rgba(255,183,88,.56)";
      ctx.lineWidth=critical?1.25:.85;
      ctx.shadowColor=critical?"#ffffff":"#ff8a1f";
      ctx.shadowBlur=critical?18:10;
      for(let i=0;i<(critical?3:2);i++){
        const pulse=.5+.5*Math.sin(phase*(1.1+i*.33)+i);
        ctx.beginPath();
        ctx.ellipse(cx,cy,scale*(.50+i*.18+pulse*.035),scale*(.30+i*.09+pulse*.025),phase*(.18+i*.08),0,Math.PI*2);
        ctx.stroke();
      }
      ctx.restore();
    }
    _drawOverheatWave(ctx,cx,cy,scale,time,cfg) {
      if(this._state!=="critical"&&this._state!=="alarm") return;
      const phase=(time-this._startTime)/1000;
      const critical=this._state==="critical";
      const heat=critical?1:.55;
      const flashLife=critical&&time<this._criticalFlashUntil?1-Math.max(0,Math.min(1,(this._criticalFlashUntil-time)/650)):0;
      ctx.save();
      const cloud=ctx.createRadialGradient(cx,cy,scale*.10,cx,cy,scale*(.92*heat+flashLife*.68));
      cloud.addColorStop(0,critical?"rgba(255,255,255,.64)":"rgba(255,255,255,.34)");
      cloud.addColorStop(.14,critical?"rgba(255,244,232,.52)":"rgba(255,226,202,.28)");
      cloud.addColorStop(.38,critical?"rgba(255,54,36,.40)":"rgba(255,138,31,.24)");
      cloud.addColorStop(.74,"rgba(255,138,31,.22)");
      cloud.addColorStop(1,"rgba(255,0,0,0)");
      ctx.globalAlpha=(critical?.84:.34)+.22*Math.sin(phase*3.2)+flashLife*.52;
      ctx.fillStyle=cloud;
      ctx.beginPath();
      ctx.ellipse(cx,cy,scale*((critical?1.34:.92)+flashLife*1.08),scale*((critical?.82:.50)+flashLife*.66),phase*.16,0,Math.PI*2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      const waves=flashLife>0?3:2;
      for(let i=0;i<waves;i++){
        const life=flashLife>0?Math.max(0,Math.min(1,flashLife-i*.18)):(.45+.45*Math.sin(phase*1.4+i));
        ctx.globalAlpha=(flashLife>0?(1-life)*.52:.16+life*.14);
        ctx.strokeStyle=i%2===0?"rgba(255,245,232,.84)":"rgba(255,64,42,.62)";
        ctx.lineWidth=1.1+life*2.3;
        ctx.shadowColor=i%2===0?"#ffffff":"#ff3b30";
        ctx.shadowBlur=26+life*28;
        ctx.beginPath();
        ctx.ellipse(cx,cy,scale*(.38+life*.98+i*.12),scale*(.20+life*.54+i*.06),phase*(.48+i*.15),0,Math.PI*2);
        ctx.stroke();
      }
      ctx.restore();

      ctx.save();
      // orbiting alarm fog: irregular wisps circling the brain core.
      for(let i=0;i<(critical?9:5);i++){
        const wobble=Math.sin(phase*(1.15+i*.21)+i*2.1);
        const angle=phase*(critical?.42:.26)+i*.83+wobble*.35;
        const rx=scale*((critical?.76:.56)+i*.045+Math.sin(phase*.7+i)*.035);
        const ry=scale*((critical?.42:.30)+i*.020+Math.cos(phase*.9+i)*.025);
        const x=cx+Math.cos(angle)*rx;
        const y=cy+Math.sin(angle)*ry;
        const size=scale*((critical?.145:.085)+(.5+.5*wobble)*.045);
        const fog=ctx.createRadialGradient(x,y,0,x,y,size);
        fog.addColorStop(0,critical?"rgba(255,245,235,.34)":"rgba(255,210,170,.18)");
        fog.addColorStop(.42,critical?"rgba(255,58,42,.20)":"rgba(255,138,31,.14)");
        fog.addColorStop(1,"rgba(255,0,0,0)");
        ctx.globalAlpha=critical?.72:.38;
        ctx.fillStyle=fog;
        ctx.beginPath();
        ctx.ellipse(x,y,size*(1.35+Math.abs(wobble)*.55),size*(.56+Math.abs(Math.cos(angle))*.28),angle*.7,0,Math.PI*2);
        ctx.fill();
      }
      ctx.restore();
    }

    _drawBrainCore(ctx,cx,cy,r,cfg,time) {
      if (!this._brainImageReady) {
        this._drawSphere(ctx,cx,cy,r,cfg,time);
        return;
      }
      const width=r*5.15, height=r*4.58;
      ctx.save();
      ctx.globalAlpha=this._state==="offline"?.38:.92;
      ctx.shadowColor=cfg.color;
      ctx.shadowBlur=18+this._severity*.22;
      ctx.drawImage(this._brainImage,cx-width/2,cy-height/2,width,height);
      ctx.globalCompositeOperation="source-atop";
      ctx.globalAlpha=this._state==="offline"?.46:.19;
      ctx.fillStyle=cfg.color;
      ctx.fillRect(cx-width/2,cy-height/2,width,height);
      ctx.restore();
    }
    _drawCriticalStorm(ctx,cx,cy,scale,time,cfg) {
      if(this._state!=="critical" || !this._enabled) return;
      const phase=(time-this._startTime)/1000;
      const palette=["#ffffff","#86d8ff","#9f7cff","#ff3b30","#ff8a1f"];
      ctx.save();
      for(let i=0;i<7;i++){
        const pulse=Math.max(0,Math.sin(phase*(2.2+i*.37)+i*1.9));
        if(pulse<.54 && i>2) continue;
        const angle=phase*.38+i*.86+Math.sin(phase+i)*.24;
        const inner=scale*(.24+i*.018);
        const outer=scale*(.88+i*.16+pulse*.22);
        const color=palette[i%palette.length];
        const points=[];
        const steps=4+(i%3);
        for(let s=0;s<=steps;s++){
          const t=s/steps;
          const r=inner+(outer-inner)*t;
          const bend=Math.sin((s+1)*12.989+i*78.23+phase*4.1)*scale*(.030+.018*pulse);
          points.push({x:cx+Math.cos(angle+t*.28)*r+Math.cos(angle+Math.PI/2)*bend,y:cy+Math.sin(angle+t*.28)*r*.64+Math.sin(angle+Math.PI/2)*bend});
        }
        ctx.globalAlpha=.18+pulse*.64;
        ctx.strokeStyle=rgba(color,.96);
        ctx.lineWidth=.7+pulse*2.1;
        ctx.shadowColor=color;
        ctx.shadowBlur=14+pulse*28;
        ctx.beginPath();
        points.forEach((p,n)=>n?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
        ctx.stroke();
      }
      for(let i=0;i<4;i++){
        const pulse=Math.max(0,Math.sin(phase*(3.1+i*.41)+i*.73));
        if(pulse<.70) continue;
        const angle=phase*.55+i*1.57;
        const sx=cx+Math.cos(angle)*scale*.42, sy=cy+Math.sin(angle)*scale*.25;
        const ex=cx+Math.cos(angle)*scale*(1.28+pulse*.34), ey=cy+Math.sin(angle)*scale*(.76+pulse*.20);
        const fire=i%2?"#ff3b30":"#fff1cf";
        ctx.globalAlpha=.20+pulse*.46;
        ctx.strokeStyle=rgba(fire,.92);
        ctx.lineWidth=1.0+pulse*1.8;
        ctx.shadowColor=fire;
        ctx.shadowBlur=18+pulse*24;
        ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo((sx+ex)/2+Math.sin(phase+i)*scale*.045,(sy+ey)/2-Math.cos(phase+i)*scale*.035);ctx.lineTo(ex,ey);ctx.stroke();
      }
      ctx.restore();
    }
    _drawStrobeSignalBolts(ctx,projected,cx,cy,time,cfg) {
      if (!this._enabled || this._state === "offline") return;
      const activity=clamp(this._brainActivity,0,1);
      const coreRadius=Math.max(8,Math.min(this._w,this._h)*.035*(this._state==="critical"?1.35:this._state==="alarm"?1.18:1));
      ctx.save();
      EDGES.forEach(([aIndex,bIndex],index)=>{
        const slot=this._edgeStrobes[index];
        if(!slot || time>=slot.until || slot.intensity<2.45) return;
        const a=projected[aIndex],b=projected[bIndex]; if(!a||!b)return;
        const source={x:(a.x+b.x)/2,y:(a.y+b.y)/2};
        const color=this._edgeFlashColors?.[index]||"#ffffff";
        const life=Math.max(0,Math.min(1,(slot.until-time)/230));
        const dx=cx-source.x,dy=cy-source.y,len=Math.max(1,Math.hypot(dx,dy));
        const tx=cx-dx/len*coreRadius*.42,ty=cy-dy/len*coreRadius*.42;
        const nx=-dy/len,ny=dx/len;
        const steps=6+(index%3);
        const jag=2.4+activity*4.2+(this._state==="critical"?3.2:0);
        ctx.globalAlpha=Math.min(1,.24+life*.72);
        ctx.strokeStyle=rgba(color,.96);
        ctx.lineWidth=.75+life*1.9+(this._state==="critical"?.65:0);
        ctx.shadowColor=color;
        ctx.shadowBlur=12+life*24+(this._state==="critical"?16:0);
        ctx.beginPath();
        for(let i=0;i<=steps;i++){
          const t=i/steps;
          const baseX=source.x+(tx-source.x)*t;
          const baseY=source.y+(ty-source.y)*t;
          const offset=(i===0||i===steps)?0:(Math.sin((index+1)*17.19+i*23.7+time*.031)*.5+.5)*jag*(i%2?-1:1);
          const x=baseX+nx*offset;
          const y=baseY+ny*offset;
          i?ctx.lineTo(x,y):ctx.moveTo(x,y);
        }
        ctx.stroke();
        ctx.globalAlpha=Math.min(1,.34+life*.58);
        ctx.fillStyle=rgba(color,.90);
        ctx.beginPath();ctx.arc(tx,ty,1.8+life*3.2,0,Math.PI*2);ctx.fill();
      });
      ctx.restore();
    }
    _drawNodeStreams(ctx,projected,time,cfg) {
      if (!this._enabled || this._state === "offline") return;
      const activity=clamp(this._brainActivity,0,1);
      const intensity=this._state==="critical"?1:this._state==="alarm"?.82:this._state==="notice"?.55:.20;
      const color=this._state==="critical"?"#ffffff":this._state==="alarm"?"#ffd0b8":this._state==="notice"?"#ffe88a":"#cffff0";
      const stateColor=this._state==="critical"?"#ff3b30":this._state==="alarm"?"#ff8a1f":cfg.color;
      const phaseBase=(time-this._startTime)/1000*(.72+activity*1.65);
      ctx.save();
      EDGES.forEach(([from,to],i)=>{
        if(this._state==="ok"&&(i+Math.floor(phaseBase*2))%5!==0)return;if((i+Math.floor(phaseBase*3))%3===1 && this._state!=="critical"&&this._state!=="ok") return;
        const a=projected[from],b=projected[to]; if(!a||!b)return;
        const t=(phaseBase+i*.173)%1;
        const tail=Math.max(0,t-.16);
        const sx=a.x+(b.x-a.x)*tail, sy=a.y+(b.y-a.y)*tail;
        const ex=a.x+(b.x-a.x)*t, ey=a.y+(b.y-a.y)*t;
        const grad=ctx.createLinearGradient(sx,sy,ex,ey);
        grad.addColorStop(0,rgba(stateColor,0));
        grad.addColorStop(.35,rgba(stateColor,.42*intensity));
        grad.addColorStop(1,this._state==="critical"&&i%2===0?"rgba(255,255,255,.96)":rgba(color,.78*intensity));
        ctx.strokeStyle=grad;
        ctx.lineWidth=.85+activity*1.15+(this._state==="critical"?.75:0);
        ctx.shadowColor=this._state==="critical"&&i%2===0?"#ffffff":stateColor;
        ctx.shadowBlur=8+activity*14+(this._state==="critical"?10:0);
        ctx.globalAlpha=.42+intensity*.38;
        ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(ex,ey);ctx.stroke();
        ctx.fillStyle=this._state==="critical"&&i%2===0?"#ffffff":color;
        ctx.globalAlpha=.55+intensity*.35;
        ctx.beginPath();ctx.arc(ex,ey,1.8+activity*2.2+(this._state==="critical"?1.4:0),0,Math.PI*2);ctx.fill();
      });
      ctx.restore();
    }
    _drawThoughtPulses(ctx,projected,cx,cy,time,cfg) {
      const colors={ok:"#78ff9e",notice:"#ffe45e",alarm:"#ff9f43",critical:"#ff4b43"};
      this._thoughtPulses=this._thoughtPulses.filter(p=>time-p.started<p.duration);
      this._thoughtPulses.forEach(p=>{
        const a=projected[p.from], b=projected[p.to]; if(!a||!b)return;
        const phase=Math.max(0,Math.min(1,(time-p.started)/p.duration));
        const color=p.severity==="critical"&&Math.sin((time-p.started)*.055+p.to)>-.15?"#ffffff":colors[p.severity]||cfg.color;
        const viaCore=phase<.5; const local=viaCore?phase*2:(phase-.5)*2;
        const sx=viaCore?a.x:cx, sy=viaCore?a.y:cy, ex=viaCore?cx:b.x, ey=viaCore?cy:b.y;
        const x=sx+(ex-sx)*local, y=sy+(ey-sy)*local;
        const tx=sx+(ex-sx)*Math.max(0,local-.13), ty=sy+(ey-sy)*Math.max(0,local-.13);
        if(phase>.82&&!p.arrived){p.arrived=true;this._nodeBursts.push({index:p.to,started:time,severity:p.severity});this._nodeBursts=this._nodeBursts.slice(-16);}
        ctx.save();ctx.strokeStyle=color;ctx.lineWidth=1.35+2.4*this._brainActivity;ctx.shadowColor=color;ctx.shadowBlur=18+28*this._brainActivity;ctx.globalAlpha=.68+.32*this._brainActivity;ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(x,y);ctx.stroke();ctx.fillStyle=color;ctx.globalAlpha=1;ctx.beginPath();ctx.arc(x,y,2.8+3.6*this._brainActivity,0,Math.PI*2);ctx.fill();ctx.restore();
      });
      if(time<this._criticalFlashUntil){ctx.save();ctx.strokeStyle="rgba(255,255,255,.98)";ctx.lineWidth=3.0;ctx.shadowColor="#ffffff";ctx.shadowBlur=28;ctx.beginPath();ctx.moveTo(projected[0].x,projected[0].y);ctx.lineTo(cx,cy);ctx.lineTo(projected[6].x,projected[6].y);ctx.stroke();ctx.restore();}
    }

    _drawAmbientBolt(ctx,projected,cx,cy,time,cfg) {
      const b=this._ambientBolt;
      if(time>=b.until || !this._enabled) return;
      const a=projected[b.from],z=projected[b.to];if(!a||!z)return;
      const severityColor=this._state==='critical'?["#ffffff","#86d8ff","#9f7cff","#ff3b30"][Math.abs(Math.floor(b.seed))%4]:this._state==='alarm'?'#ff9f43':this._state==='notice'?'#fff27a':'#d9fff0';
      const points=[];const segments=8;
      for(let i=0;i<=segments;i++){
        const t=i/segments;
        let x,y;
        if(t<.5){const u=t*2;x=a.x+(cx-a.x)*u;y=a.y+(cy-a.y)*u}else{const u=(t-.5)*2;x=cx+(z.x-cx)*u;y=cy+(z.y-cy)*u}
        const jitter=(i===0||i===segments)?0:(Math.sin((i+1)*12.9898+b.seed)*43758.5453%1-.5)*(2.0+this._brainActivity*4.2);
        points.push({x:x+jitter,y:y-jitter*.55});
      }
      ctx.save();ctx.globalAlpha=Math.min(1,.46+(b.until-time)/155);ctx.strokeStyle=severityColor;ctx.lineWidth=.95+this._brainActivity*1.25+(this._state==='critical'?.75:0);ctx.shadowColor=severityColor;ctx.shadowBlur=9+this._brainActivity*12+(this._state==='critical'?12:0);ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();ctx.restore();
    }


    _drawMousePlasma(ctx,cx,cy,time,cfg) {
      const m=this._mousePlasma;
      if(!m || !m.active || !this._enabled || this._state==="offline") return;
      const age=time-m.last;
      if(age>700){m.active=false;return;}
      const dx=m.x-cx, dy=m.y-cy;
      const dist=Math.hypot(dx,dy);
      if(dist<16) return;
      const activity=clamp(this._brainActivity,0,1);
      const alpha=Math.max(0,1-age/700);
      const segments=11;
      const count=this._state==="critical"?5:this._state==="alarm"?4:3;
      ctx.save();
      ctx.globalCompositeOperation="lighter";
      for(let b=0;b<count;b++){
        const seed=m.seed+b*23.17+Math.floor(time/44)*.31;
        const color=b%4===0?"#ffffff":b%4===1?"#d9a6ff":b%4===2?"#9b58ff":"#72d8ff";
        const nx=-dy/Math.max(1,dist), ny=dx/Math.max(1,dist);
        ctx.beginPath();
        for(let i=0;i<=segments;i++){
          const t=i/segments;
          const taper=Math.sin(Math.PI*t);
          const jitter=(Math.sin(seed+i*4.87+time*.026)+Math.sin(seed*.37+i*9.31))*0.5*(5+activity*12+b*1.6)*taper;
          const x=cx+dx*t+nx*jitter;
          const y=cy+dy*t+ny*jitter;
          i?ctx.lineTo(x,y):ctx.moveTo(x,y);
        }
        ctx.globalAlpha=(.28+activity*.25)*alpha;
        ctx.strokeStyle=color;
        ctx.lineWidth=b===0?1.8:1.05;
        ctx.shadowColor=color;
        ctx.shadowBlur=16+activity*20;
        ctx.stroke();
      }
      const g=ctx.createRadialGradient(m.x,m.y,1,m.x,m.y,24+activity*20);
      g.addColorStop(0,"rgba(255,255,255,.72)");
      g.addColorStop(.36,"rgba(190,105,255,.34)");
      g.addColorStop(1,"rgba(118,70,255,0)");
      ctx.globalAlpha=.60*alpha;
      ctx.fillStyle=g;
      ctx.beginPath();ctx.arc(m.x,m.y,28+activity*16,0,Math.PI*2);ctx.fill();
      ctx.restore();
    }
    _drawNode(ctx,p,sensor,index) {
      const cfg=STATES[sensor.state] || STATES.ok;
      const now=performance.now();
      this._nodeBursts=(this._nodeBursts||[]).filter(b=>now-b.started<520);
      const burst=this._nodeBursts.filter(b=>b.index===index).reduce((m,b)=>Math.max(m,1-(now-b.started)/520),0);
      const alarmPulse=(this._state==="alarm"||this._state==="critical")?.55+.45*Math.sin(now*.010+index*.7):0;
      const calmPulse=sensor.state==="ok"?.75+.25*Math.sin(now*.006+index*.9):0;
      const pop=burst>0?Math.sin(burst*Math.PI)*2.7:0;
      const alarmBoost=this._state==="critical"?3.2:this._state==="alarm"?2.1:0;
      const radius=5.7+pop+(sensor.state==="ok"?calmPulse*1.15:0)+alarmBoost+alarmPulse*1.45;
      ctx.save();
      if(burst>0){
        ctx.globalAlpha=Math.min(1,.28+burst*.62);
        ctx.strokeStyle="#ffffff";
        ctx.lineWidth=1.1+burst*2.2;
        ctx.shadowColor="#ffffff";
        ctx.shadowBlur=18+burst*22;
        ctx.beginPath();ctx.arc(p.x,p.y,radius+5+burst*7,0,Math.PI*2);ctx.stroke();
      }

      ctx.globalAlpha=1;
      ctx.shadowColor=burst>0?"#ffffff":(this._state==="alarm"||this._state==="critical"?"#ffd8d2":cfg.color);
      ctx.shadowBlur=burst>0?26+burst*30:(this._state==="alarm"||this._state==="critical"?24+alarmPulse*18:(sensor.state==="ok"?15+calmPulse*8:10));
      const g=ctx.createRadialGradient(p.x-2,p.y-2,0,p.x,p.y,Math.max(8+pop,radius+2));
      g.addColorStop(0,"#fff");
      g.addColorStop(.18,burst>0||this._state==="alarm"||this._state==="critical"?"#ffffff":cfg.color);
      g.addColorStop(.43,this._state==="alarm"||this._state==="critical"?"#ff3b30":cfg.color);
      g.addColorStop(.68,cfg.color);
      g.addColorStop(1,"#061019");
      ctx.fillStyle=g;
      ctx.beginPath(); ctx.arc(p.x,p.y,radius,0,Math.PI*2); ctx.fill();
      ctx.restore();
      this._nodeHit = this._nodeHit || [];
      this._nodeHit[index]={x:p.x,y:p.y,r:Math.max(12+pop,radius+6)};
    }


    _handlePointerMove(event) {
      if(!this._canvas || !this._mousePlasma) return;
      const rect=this._canvas.getBoundingClientRect();
      this._mousePlasma.x=event.clientX-rect.left;
      this._mousePlasma.y=event.clientY-rect.top;
      this._mousePlasma.last=performance.now();
      this._mousePlasma.active=true;
      this._mousePlasma.seed+=.73;
      this._requestFrame();
    }
    _handleCanvasClick(event) {
      const rect=this._canvas.getBoundingClientRect();
      const x=event.clientX-rect.left, y=event.clientY-rect.top;
      const hit=(this._nodeHit||[]).findIndex(n => n && Math.hypot(x-n.x,y-n.y)<=n.r);
      if (hit>=0) {
        this.dispatchEvent(new CustomEvent("statuscore:sensor-select",{
          detail:{index:hit,sensor:{...this._sensors[hit]}},
          bubbles:true,composed:true
        }));
      }
    }
  }

  if (!customElements.get("statuscore-3d")) {
    customElements.define("statuscore-3d",StatusCore3DIndicator);
  }

  global.StatusCore3D = Object.freeze({
    version:VERSION,
    states:Object.freeze(Object.keys(STATES)),
    create(options={}) {
      const el=document.createElement("statuscore-3d");
      if (options.settings) el.setSettings(options.settings);
      el.setStatus(options);
      return el;
    }
  });
})(window);

























