# Framework Studio / TUEV Audit - V5.4.10 TestSchedulerModel

Projekt: Netzwerk-Leitstand
Module: shared.test-scheduler-model V0.1.0, shared.test-catalog V0.3.0
Pruefung: Planungsmodell fuer 1000+ Tests ohne Messausfuehrung
Ergebnis: PASS MIT AUFLAGEN

## Ziel

Die spaetere Freischaltung sehr vieler Tests darf nicht dazu fuehren, dass alle Tests gleichzeitig laufen. V5.4.10 fuegt deshalb ein Scheduler-Planungsmodell ein. Dieses Modell berechnet nur Last, Ausfuehrungsklassen und gleichzeitige Plaetze. Es startet keine Messungen.

## Architekturabgleich

### NavigationCore - PASS

Die Hauptnavigation bleibt unveraendert. Die Scheduler-Vorschau ist nur im Testkatalog sichtbar.

### InteractionCore - PASS

Der Benutzer sieht eine Planvorschau mit Ausfuehrungsklassen und Last. Es gibt keinen Startknopf und keine direkte Messaktion.

### SettingsCore - PASS MIT AUFLAGE

Die Scheduler-Policy ist in V0.1 fest im Candidate-Modul definiert. Vor Stable-Freigabe muss sie aus SettingsCore/PolicyStorage kommen.

### CapabilityCore - PASS MIT AUFLAGE

Scheduler-Vorschau und spaetere Scheduler-Aktivierung muessen getrennte Capabilities werden.

### Mess- und Testsystem - PASS

Keine aktive Messlogik wurde veraendert. `app.js` ist nicht gekoppelt. Das Modul darf keine Timer starten, keine Sensoren aendern und keine Netzwerkzugriffe ausfuehren.

## Scheduler-Regeln V0.1

Ausfuehrungsklassen:

- permanent: maximal 4 gleichzeitig
- cyclic: maximal 6 gleichzeitig
- event: maximal 3 gleichzeitig
- manual: maximal 2 gleichzeitig
- deep: maximal 1 gleichzeitig

Lastklassen:

- none: 0
- low: 1
- medium: 3
- high: 7

Das Modell erzeugt Warnungen, wenn eine Klasse zu viele Tests oder zu hohe Last enthaelt.

## Skalierungsregel fuer 1000+ Tests

Verbindliche Auflagen:

- 1000+ Tests werden als Definitionen gefuehrt, nicht als aktive UI-Elemente.
- Der Scheduler waehlt spaeter nur passende Teilmengen pro Zeitfenster.
- Permanente Tests muessen leichtgewichtig bleiben.
- Tiefenanalysen laufen einzeln und zeitlich begrenzt.
- Ereignis-Tests starten nur nach Warnung, Stoerung oder Benutzerfreigabe.
- Die Hauptoberflaeche zeigt Gruppenstatus, Prioritaeten und Auffaelligkeiten.

## Freigabestatus

Status: ARCHITECTURE_CANDIDATE
Release: BLOCKED

Naechste Stufe:

- SchedulerCore-Adapter vorbereiten, weiterhin ohne echte Messausfuehrung.
- Testgruppen-Fenster fuer die Arbeitsflaeche vorbereiten.
- Pflichtfenster und kritische Tests mit WindowFrameModule verbinden.
