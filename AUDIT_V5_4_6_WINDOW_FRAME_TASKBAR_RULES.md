# AUDIT V5.4.6 - WindowFrameModule V0.2.0 Taskbar Rules

Status: PASS MIT AUFLAGEN

## Umfang
- `shared.window-frame` auf V0.2.0 erweitert.
- Schliessen legt Fenster in eine Taskleiste ab, statt es endgueltig zu entfernen.
- Pflichtfenster erhalten Kennzeichnung und koennen nicht als letztes Kernfenster verschwinden.
- Unten angelegte Taskleiste stellt minimierte/abgelegte Fenster wieder her.
- Viele Taskleisten-Eintraege werden kompakt gestapelt.

## TUEV-Auflagen
- Bestehende Hauptansicht bleibt Standard und wurde nicht migriert.
- Keine Messlogik, keine SensorRegistry und kein Pruefdienst wurden geaendert.
- Modul bleibt `release: BLOCKED`, bis echte Feldadapter und Bedienungs-/Dashboard-TUEV bestanden sind.
- Naechste Stufe darf Registersortierung nur separat ueber NavigationCore pruefen.

## Bedienlogik
- X = in Taskleiste ablegen.
- Min = minimieren und in Taskleiste erreichbar halten.
- Max = innerhalb der Arbeitsflaeche maximieren.
- Standard = Demo-Arbeitsflaeche zuruecksetzen.
