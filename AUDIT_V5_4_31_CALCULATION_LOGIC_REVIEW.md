# V5.4.31 Calculation Logic Review - BEFUND

Ziel: Herzschlag, Gehirn, Stabilitaet, Farben und Messwerte logisch und wahrheitsgemaess aufeinander abstimmen.

## Befunde

1. Fehlende Messwerte werden teils als gesund gerechnet.
- `calculateHealth()` setzt fehlende Teilwerte wie Internet, Router, WLAN, DNS auf 100 %.
- Dadurch kann die Gesamtanzeige gruen wirken, obwohl Messwerte noch aufgebaut werden.
- Erwartung: fehlend = unbekannt/grau, nicht gesund/gruen.

2. Herz und Gehirn nutzen unterschiedliche Datenquellen.
- Herz nutzt `alarmLoad()` mit `d.quality.lossPct`, `d.quality.p95JitterMs`, CPU/RAM/Disk.
- BrainCoordinator nutzt `d.multiPing || d.internet` und teils `d.loss`, `d.jitter`.
- Ergebnis: Herz kann gelb/rot werden, waehrend Gehirn stabil/gruen bleibt.

3. BrainIntegration kann Coordinator-Anzeigen ueberstimmen.
- `leitstand-brain-integration.js` ruft weiter `setBrainActivity()`, Label und Caption auf.
- Auch wenn `BrainCoordinator` die autoritative Quelle sein soll, koennen Werte visuell auseinanderlaufen.

4. Offline/unbekannte Sensoren stabilisieren die Organwertung.
- OrganRegistry zaehlt enabled Sensoren, auch wenn sie nicht verfuegbar sind.
- Scores von nicht verfuegbaren oder noch nicht gemessenen Sensoren koennen die Stabilitaet kuenstlich hoch halten.

5. Schwellenwerte sind nicht zentral.
- Jitter/Loss/CPU/Router/Internet haben mehrere einzelne Schwellwertlogiken.
- Beispiele: `analyze()`, `calculateHealth()`, `BrainCoordinator`, LED-Status, Charts und Registeranzeigen bewerten aehnliche Werte separat.

## Vorgabe fuer Reparatur

Naechster Schritt: ein zentrales `SystemAssessmentCore` als reine Bewertungsinstanz.

Es soll liefern:
- `overall.score` 0..100
- `overall.level`: unknown | green | yellow | orange | red
- `confidence`: 0..100, weil fehlende Daten nicht als gesund zaehlen duerfen
- `domains`: router, internet, quality, dns, pc, runtime, brain
- `events`: harte Gruende fuer Warnung/Alarm
- `display`: einheitliche Farben fuer Herz, Gehirn, LED, Karten und Text

Regeln:
- Keine Messung starten.
- Keine Sensorwerte veraendern.
- Nur vorhandene Daten bewerten.
- Fehlende Daten sind `unknown`, nicht `green`.
- Eine harte rote Bedingung darf nicht durch viele gruene/unbekannte Werte weggeglattet werden.

## Status

Review: PASS MIT AUFLAGEN.
Implementierung: ausstehend.
