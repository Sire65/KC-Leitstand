/* Netzwerk-Leitstand - Aktualisierungshinweis
 *
 * Beim Start des Leitstands wird einmal nachgesehen, ob eine neuere Fassung
 * bereitliegt. Liegt eine bereit, kommt die Frage: Ja oder Spaeter. Bei Ja
 * laeuft ein Zeitbalken, und danach startet der Leitstand tatsaechlich neu.
 *
 * Warum beim Start und nicht spaeter: der Leitstand kennt keine Anmeldung.
 * Der Moment, in dem jemand nachweislich davor sitzt, ist der Programmstart -
 * derselbe Moment, in dem die Begruessung erscheint. Gefragt wird einmal je
 * Browsersitzung, nicht bei jedem Registerwechsel.
 *
 * Zwei Dinge sind bewusst so und nicht anders:
 *
 *   Der Zeitbalken zeigt echte Restzeit. Er zaehlt die Sekunden herunter, die
 *   im Versionsverzeichnis stehen, und danach wird wirklich neu geladen. Eine
 *   Fortschrittsanzeige, hinter der kein Vorgang steht, waere eine Behauptung.
 *
 *   Auf einer oertlichen Installation (file://) gibt es kein Neuladen, das
 *   eine neue Fassung braechte - dort kommt eine neue Fassung ueber das
 *   Installationspaket. Dann zeigt der Hinweis genau das und keinen Balken,
 *   der nichts bewirkt.
 *
 * Die laufende Fassung wird nicht doppelt gepflegt: sie kommt aus
 * window.NETZWERK_LEITSTAND_SHELL.version, derselben Quelle, aus der auch die
 * Statusleiste und der Fenstertitel ihre Versionsangabe nehmen.
 */
(function () {
  'use strict';

  var VERZEICHNIS = 'releases/latest.json';
  var REMOTE_VERZEICHNIS = 'https://raw.githubusercontent.com/Sire65/KC-Leitstand/main/'+(location.pathname.indexOf('/public/')>=0?'public/':'app/')+'releases/latest.json';
  var SPEICHER = 'leitstand_update_spaeter';
  var SITZUNG = 'leitstand_update_gefragt';
  var SPAETER_STUNDEN = 12;

  var oertlich = location.protocol === 'file:' || /^(?:127\.0\.0\.1|localhost)$/i.test(location.hostname);

  function laufendeVersion() {
    var shell = window.NETZWERK_LEITSTAND_SHELL;
    if (shell && shell.version) return String(shell.version);
    // Ohne Shell-Konfiguration bleibt der Fenstertitel. Faellt auch der aus,
    // wird nicht geraten: ohne bekannte Fassung gibt es keinen Vergleich.
    var treffer = /V(\d+\.\d+\.\d+)/.exec(document.title || '');
    return treffer ? treffer[1] : '';
  }

  /* ------------------------------------------------------- Versionen */
  function zerlegen(v) {
    var roh = String(v == null ? '0' : v).trim();
    var strich = roh.indexOf('-');
    var kern = (strich >= 0 ? roh.slice(0, strich) : roh).replace(/[^0-9.]/g, '');
    return {
      zahlen: kern.split('.').map(function (x) { return Number(x) || 0; }),
      vorab: strich >= 0 ? roh.slice(strich + 1) : ''
    };
  }

  // Vorabbezeichner stueckweise vergleichen: dev.9 ist aelter als dev.10.
  function vorabVergleich(a, b) {
    var A = a.split('.'), B = b.split('.');
    for (var i = 0; i < Math.max(A.length, B.length); i++) {
      var x = A[i], y = B[i];
      if (x === undefined) return -1;
      if (y === undefined) return 1;
      var xz = /^[0-9]+$/.test(x), yz = /^[0-9]+$/.test(y);
      if (xz && yz) { if (Number(x) !== Number(y)) return Number(x) < Number(y) ? -1 : 1; continue; }
      if (x !== y) return x < y ? -1 : 1;
    }
    return 0;
  }

  function neuer(a, b) {
    var A = zerlegen(a), B = zerlegen(b);
    var n = Math.max(A.zahlen.length, B.zahlen.length);
    for (var i = 0; i < n; i++) {
      var x = A.zahlen[i] || 0, y = B.zahlen[i] || 0;
      if (x > y) return true;
      if (x < y) return false;
    }
    // Gleicher Kern: eine Vorabfassung ist aelter als die fertige.
    if (A.vorab && !B.vorab) return false;
    if (!A.vorab && B.vorab) return true;
    if (!A.vorab && !B.vorab) return false;
    return vorabVergleich(A.vorab, B.vorab) > 0;
  }

  /* --------------------------------------------------- Spaeter merken */
  function spaeterGemerkt(version) {
    try {
      var roh = localStorage.getItem(SPEICHER);
      if (!roh) return false;
      var s = JSON.parse(roh);
      if (s.version !== version) return false;
      return Date.now() - Number(s.zeit || 0) < SPAETER_STUNDEN * 3600 * 1000;
    } catch (e) { return false; }
  }
  function spaeterMerken(version) {
    try { localStorage.setItem(SPEICHER, JSON.stringify({ version: version, zeit: Date.now() })); } catch (e) { /* egal */ }
  }
  function spaeterVergessen() {
    try { localStorage.removeItem(SPEICHER); } catch (e) { /* egal */ }
  }

  /* ------------------------------------------------------- Oberflaeche */
  var teile = null;

  function stilEinbauen() {
    if (document.getElementById('leitstandUpdateStil')) return;
    var s = document.createElement('style');
    s.id = 'leitstandUpdateStil';
    s.textContent = [
      '#leitstandUpdate{position:fixed;inset:0;z-index:5000;display:none;align-items:center;justify-content:center;background:#03090ecc}',
      '#leitstandUpdate.offen{display:flex}',
      '#leitstandUpdateKarte{width:min(460px,calc(100% - 32px));padding:20px 22px;border:1px solid #48697c;border-radius:8px;',
      'background:linear-gradient(#122a3a,#0a1c28);color:#e2edf4;box-shadow:0 18px 50px #000a;font:14px "Segoe UI",Arial,sans-serif}',
      '#leitstandUpdateKarte h2{margin:0 0 10px;font-size:17px;letter-spacing:1px;color:#eef6fa}',
      '#leitstandUpdateKarte p{margin:0 0 10px;line-height:1.5}',
      '#leitstandUpdateFrage{color:#8fa9b9}',
      '#leitstandUpdateFortschritt{margin:14px 0 4px;display:none}',
      '#leitstandUpdateFortschritt.an{display:block}',
      '#leitstandUpdateSpur{height:9px;border-radius:999px;background:#07131d;border:1px solid #35586e;overflow:hidden}',
      '#leitstandUpdateBalken{height:100%;width:0;border-radius:999px;background:#40adff;transition:width .25s linear}',
      '#leitstandUpdateRest{margin:7px 0 0;color:#8fa9b9;font-size:12px}',
      '#leitstandUpdateKnoepfe{display:flex;gap:10px;justify-content:flex-end;margin-top:16px}',
      '#leitstandUpdateKnoepfe button{padding:8px 15px;border:1px solid #587487;border-radius:5px;background:#17394d;color:#fff;cursor:pointer}',
      '#leitstandUpdateKnoepfe button:hover{background:#255b78}',
      '#leitstandUpdateJa{border-color:#40adff;background:#1d5c86}',
      '#leitstandUpdateKnoepfe button[disabled]{opacity:.55;cursor:default}'
    ].join('');
    document.head.appendChild(s);
  }

  function aufbauen() {
    if (teile) return teile;
    stilEinbauen();
    var huelle = document.createElement('div');
    huelle.id = 'leitstandUpdate';
    huelle.setAttribute('role', 'dialog');
    huelle.setAttribute('aria-modal', 'true');
    huelle.setAttribute('aria-labelledby', 'leitstandUpdateTitel');

    var karte = document.createElement('div');
    karte.id = 'leitstandUpdateKarte';

    var titel = document.createElement('h2');
    titel.id = 'leitstandUpdateTitel';
    titel.textContent = 'Aktualisierung verfügbar';

    var text = document.createElement('p');
    text.id = 'leitstandUpdateText';

    var frage = document.createElement('p');
    frage.id = 'leitstandUpdateFrage';

    var fortschritt = document.createElement('div');
    fortschritt.id = 'leitstandUpdateFortschritt';
    var spur = document.createElement('div');
    spur.id = 'leitstandUpdateSpur';
    var balken = document.createElement('div');
    balken.id = 'leitstandUpdateBalken';
    spur.appendChild(balken);
    var rest = document.createElement('p');
    rest.id = 'leitstandUpdateRest';
    fortschritt.appendChild(spur);
    fortschritt.appendChild(rest);

    var knoepfe = document.createElement('div');
    knoepfe.id = 'leitstandUpdateKnoepfe';
    var spaeter = document.createElement('button');
    spaeter.id = 'leitstandUpdateSpaeter';
    spaeter.type = 'button';
    spaeter.textContent = 'Später';
    var ja = document.createElement('button');
    ja.id = 'leitstandUpdateJa';
    ja.type = 'button';
    ja.textContent = 'Ja, jetzt aktualisieren';
    knoepfe.appendChild(spaeter);
    knoepfe.appendChild(ja);

    karte.appendChild(titel);
    karte.appendChild(text);
    karte.appendChild(frage);
    karte.appendChild(fortschritt);
    karte.appendChild(knoepfe);
    huelle.appendChild(karte);
    document.body.appendChild(huelle);

    teile = { huelle: huelle, text: text, frage: frage, fortschritt: fortschritt, balken: balken, rest: rest, spaeter: spaeter, ja: ja };
    return teile;
  }

  function schliessen() { if (teile) teile.huelle.classList.remove('offen'); }

  /* --------------------------------------------------------- Zeitbalken */
  // Zaehlt echte Sekunden herunter und ruft danach wirklich auf, was
  // angekuendigt war.
  function balkenLaufenLassen(sekunden, fertig) {
    var t = aufbauen();
    t.fortschritt.classList.add('an');
    var dauer = Math.max(2, Math.min(30, Number(sekunden) || 5)) * 1000;
    var start = Date.now();
    var uhr = setInterval(function () {
      var vergangen = Date.now() - start;
      var anteil = Math.min(1, vergangen / dauer);
      t.balken.style.width = (anteil * 100).toFixed(1) + '%';
      var uebrig = Math.ceil((dauer - vergangen) / 1000);
      t.rest.textContent = uebrig > 0
        ? 'Wird vorbereitet – Neustart in ' + uebrig + ' Sekunde' + (uebrig === 1 ? '' : 'n') + ' …'
        : 'Neustart …';
      if (anteil >= 1) { clearInterval(uhr); fertig(); }
    }, 100);
  }

  /* ------------------------------------------------------- Verzeichnis */
  function lies(m, deutsch, englisch) { return m[deutsch] !== undefined ? m[deutsch] : m[englisch]; }

  function verzeichnisHolen() {
    var quelle = oertlich ? REMOTE_VERZEICHNIS : VERZEICHNIS;
    return fetch(quelle + '?t=' + Date.now(), { cache: 'no-store' }).then(function (a) {
      if (!a.ok) throw new Error('HTTP ' + a.status);
      return a.json();
    }).then(function (m) {
      if (!m || !(m.fassung || m.version)) throw new Error('Versionsverzeichnis ohne Versionsangabe');
      return m;
    });
  }

  /* ---------------------------------------------------------- Pruefung */
  var laeuft = false;
  var letztes = null;

  function pruefen(optionen) {
    var o = optionen || {};
    var vonSelbst = !!o.vonSelbst;
    if (laeuft) return Promise.resolve({ laeuft: true });
    var laufend = laufendeVersion();
    if (!laufend) return Promise.resolve({ fehler: true, grund: 'laufende Fassung unbekannt' });
    laeuft = true;

    return verzeichnisHolen().then(function (m) {
      letztes = m;
      var version = String(lies(m, 'fassung', 'version') || '');
      var verbindlich = !!lies(m, 'verbindlich', 'mandatory');

      if (!neuer(version, laufend)) {
        schliessen();
        spaeterVergessen();
        return { aktuell: true, version: laufend, verzeichnis: m };
      }
      if (vonSelbst && !verbindlich && spaeterGemerkt(version)) {
        return { aktuell: false, unterdrueckt: true, verzeichnis: m };
      }

      var t = aufbauen();
      var hinweise = String(lies(m, 'hinweise', 'notes') || '').slice(0, 400);
      t.text.textContent = 'Version ' + version + ' ist verfügbar. Sie arbeiten mit V' + laufend + '.'
        + (hinweise ? ' ' + hinweise : '');

      if (oertlich) {
        // Ehrlich bleiben: neu laden holt hier keine neue Fassung.
        var paket = String(lies(m, 'paket', 'packageUrl') || '');
        t.frage.textContent = paket
          ? 'Diese Installation wird über das Installationspaket aktualisiert: ' + paket
          : 'Diese Installation wird über das Installationspaket aktualisiert.';
        t.ja.textContent = 'Verstanden';
        t.spaeter.hidden = true;
      } else {
        t.frage.textContent = verbindlich
          ? 'Diese Aktualisierung ist verbindlich. Jetzt aktualisieren?'
          : 'Jetzt aktualisieren?';
        t.ja.textContent = 'Ja, jetzt aktualisieren';
        t.spaeter.hidden = !!verbindlich;
      }

      t.spaeter.disabled = false;
      t.spaeter.setAttribute('data-fassung', version);
      t.ja.disabled = false;
      t.fortschritt.classList.remove('an');
      t.balken.style.width = '0%';
      t.huelle.classList.add('offen');
      t.ja.focus();
      return { aktuell: false, verzeichnis: m };
    }).catch(function (f) {
      // Ein nicht erreichbares Verzeichnis ist keine Aktualitaet. Es wird
      // deshalb nie als "aktuell" gemeldet, sondern als unbekannt.
      return { fehler: true, grund: f && f.message ? f.message : String(f) };
    }).then(function (r) {
      laeuft = false;
      return r;
    });
  }

  /* ------------------------------------------------------ Aktualisieren */
  function aktualisieren() {
    var t = aufbauen();
    if (oertlich) { schliessen(); return; }
    t.ja.disabled = true;
    t.spaeter.disabled = true;

    var m = letztes || {};
    var ziel = String(lies(m, 'adresse', 'releaseUrl') || './');
    spaeterVergessen();
    t.ja.textContent = 'Wird vorbereitet …';

    balkenLaufenLassen(lies(m, 'installSekunden', 'estimatedInstallSeconds'), function () {
      // Zwischenspeicher raeumen, sonst startet der Browser womoeglich
      // wieder in die vorherige Fassung.
      var fertig = function () {
        location.replace(ziel + (ziel.indexOf('?') >= 0 ? '&' : '?') + 'update=' + Date.now());
      };
      if (!window.caches) { fertig(); return; }
      caches.keys().then(function (namen) {
        return Promise.all(namen.map(function (n) { return caches.delete(n); }));
      }).then(fertig, fertig);
    });
  }

  /* ------------------------------------------------------------ Aufbau */
  function verdrahten() {
    var t = aufbauen();
    t.ja.addEventListener('click', aktualisieren);
    t.spaeter.addEventListener('click', function () {
      var v = t.spaeter.getAttribute('data-fassung');
      if (v) spaeterMerken(v);
      schliessen();
    });
    // Die Versionsangabe in der Statusleiste ist der Ort, an dem jemand
    // nachsieht, welche Fassung laeuft. Also fragt sie auch nach.
    var anzeige = document.querySelector('.shell-status-bar .version');
    if (anzeige) {
      anzeige.style.cursor = 'pointer';
      anzeige.title = 'Auf Aktualisierung prüfen';
      anzeige.addEventListener('click', function () { pruefen({ vonSelbst: false }); });
    }
  }

  function starten() {
    verdrahten();
    // Einmal je Browsersitzung. Ein Registerwechsel ist kein neuer Start.
    var schonGefragt = false;
    try { schonGefragt = sessionStorage.getItem(SITZUNG) === '1'; } catch (e) { /* egal */ }
    if (schonGefragt) return;
    try { sessionStorage.setItem(SITZUNG, '1'); } catch (e) { /* egal */ }
    pruefen({ vonSelbst: true });
  }

  // Die Statusleiste baut die Shell-Runtime erst nach dem Laden auf; deshalb
  // etwas Vorlauf, damit die Versionsanzeige schon da ist.
  function anstossen() { setTimeout(starten, 1200); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', anstossen, { once: true });
  else anstossen();

  window.LeitstandUpdate = { pruefen: pruefen, aktualisieren: aktualisieren, neuer: neuer, laufendeVersion: laufendeVersion };
})();
