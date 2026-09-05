# Pflichtenheft Testarbeitsflaechen V1

Projekt: Netzwerk-Leitstand  
Status: ARCHITECTURE_CANDIDATE / PREVIEW_ONLY  
Baustufe: Seiten und Anzeigen vor Laufzeitmigration

## Ziel

Der Leitstand erhaelt fachlich getrennte Testarbeitsflaechen. Testanzeigen werden
definitionsgesteuert einer Seite und einer Rastergroesse zugeordnet. Die bestehende
Mess-, Sensor- und Anzeige-Laufzeit bleibt bis zu einer gesonderten Freigabe der
Rueckfallstand.

## Pflichtseiten

1. Ueberblick
2. Internet
3. FRITZ!Box und Kabel
4. WLAN und Mesh
5. PC und System
6. Geraete
7. Protokoll und Auswertung

## Pflichtregeln

- Detailtests besitzen genau eine fachliche Eigentuemerseite.
- Der Ueberblick darf nur zusammenfassende Statusanzeigen spiegeln.
- Karten werden ueber TestDefinitionStore, OwnershipMatrix, WorkspacePages und
  TestCardLayoutSpec beschrieben.
- Das logische Raster hat sechs Spalten und die Groessen S, M, L und XL.
- Eine Karte startet keine Messung und veraendert keine Sensorwerte.
- PREVIEW_ONLY ist der Standard, bis Browser-, Layout-, Architektur- und
  Framework-TUEV bestanden sind.
- Bestehende Seiten, Anzeigen und gespeicherte Werte duerfen nicht geloescht oder
  automatisch migriert werden.
- Die spaetere Laufzeitumschaltung benoetigt einen expliziten Migrationsschalter
  und einen getesteten Rueckfallweg.
- `app` und `public` muessen inhaltlich synchron bleiben.

## Kartenvertrag

Jede Testkarte benoetigt mindestens:

- stabile Test-ID
- Titel und Kurzbeschreibung
- Eigentuemerseite und Fachbereich
- Zustand ACTIVE, PASSIVE, PLANNED, BLOCKED oder EXPERIMENTAL
- Ausfuehrungsklasse
- Standardbreite und Standardhoehe
- Minimal- und Maximalgroesse
- Messquelle oder eindeutige Kennzeichnung als Platzhalter

## Nicht Bestandteil dieser Baustufe

- Starten oder Stoppen von Tests
- Aenderung von Probe, SensorRegistry, BrainCore oder Scheduler-Ausfuehrung
- Entfernen oder Ersetzen bestehender Anzeigen
- freie Benutzerpositionen, Drag-and-drop oder Layoutmigration
- Stable-Freigabe oder Veroeffentlichung

## Abnahme Baustufe 1

- Sieben Seiten sind als Vorschau erreichbar.
- Vorhandene Testdefinitionen werden ohne Duplikation zugeordnet.
- Leere Seiten zeigen einen sicheren Platzhalter.
- Rastergroessen sind sichtbar und nachvollziehbar.
- Schliessen der Vorschau fuehrt unveraendert zum bisherigen Leitstand zurueck.
- Statische Pruefung, Migration Preflight und Release Check bestehen.
