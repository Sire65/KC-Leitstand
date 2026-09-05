# Framework Studio / TUEV Audit - V5.4.9 TestDefinitionStore

Projekt: Netzwerk-Leitstand
Module: shared.test-definition-store V0.1.0, shared.test-catalog V0.2.0
Pruefung: Datenbasierte Testdefinitionen vor Scheduler- und 1000+-Ausbau
Ergebnis: PASS MIT AUFLAGEN

## Ziel

Die Testliste wird aus dem UI-Modul herausgeloest. Testdefinitionen liegen jetzt in einer eigenen Store-Schicht. Der Katalog liest diese Daten nur und startet weiterhin keine Messungen.

## Architekturabgleich

### NavigationCore - PASS

Die obere Navigation bleibt bei Hauptbereichen. Der Testkatalog bleibt eine eigene Ansicht und erzeugt keine Registerkartenflut.

### InteractionCore - PASS

Der Katalog bietet Suche, Gruppenfilter, Statusfilter und neu einen Filter nach Ausfuehrungsklassen.

### SettingsCore - PASS MIT AUFLAGE

Die aktuelle Katalogansicht wird lokal gespeichert. Vor Stable-Freigabe muss das in SettingsCore/ProfileStorage ueberfuehrt werden.

### CapabilityCore - PASS MIT AUFLAGE

TestDefinitionStore und TestCatalog bleiben Candidate-Zubehoer. Vor Freigabe muessen Sichtbarkeit und Bearbeitungsrechte ueber CapabilityCore steuerbar sein.

### Mess- und Testsystem - PASS

Keine aktive Messlogik wurde veraendert. `app.js` wurde nicht gekoppelt. Der Store ist rein lesend und fuehrt keine Probe aus.

## Neue Struktur

Testdefinitionen enthalten jetzt:

- id
- Gruppe
- Titel
- Zusammenfassung
- Status
- Intervall
- Ausfuehrungsklasse
- Prioritaet
- Lastklasse
- Kritikalitaet

Ausfuehrungsklassen:

- permanent
- cyclic
- event
- manual
- deep

## Skalierungsregel fuer 1000+ Tests

Die 1000+ Tests werden spaeter als Daten im TestDefinitionStore gefuehrt. Die Ausfuehrung wird erst in einer separaten Scheduler-Schicht entschieden.

Verbindliche Auflagen:

- Der Store darf keine Messungen starten.
- Der Katalog darf nur lesen, suchen und filtern.
- Der Scheduler muss spaeter Lastklassen und Prioritaeten beachten.
- Die Hauptoberflaeche zeigt Gruppenstatus und Auffaelligkeiten, nicht alle Einzeltests.
- Detailtests werden nur bei Suche, Filter, Ereignis oder geoeffnetem Arbeitsfenster dargestellt.

## Freigabestatus

Status: ARCHITECTURE_CANDIDATE
Release: BLOCKED

Naechste Stufe:

- SchedulerModel V0.1.0 als Planungsmodul ohne echte Messausfuehrung.
- Definitionen spaeter aus externer JSON/SettingsCore-Quelle laden.
- Bearbeiten/Importieren von Testdefinitionen erst nach CapabilityCore- und SecurityCore-Abgleich.
