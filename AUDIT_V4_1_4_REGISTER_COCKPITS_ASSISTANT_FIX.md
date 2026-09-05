# Audit V4.1.4 - Register-Cockpits und Assistent-Fix

## Ziel

Korrektur der V4.1.3 nach Sichttest: Registerkarten sollten eigene Inhalte haben, doppelte Schalter mussten entfernt werden, Router-Erkennung sollte sichtbar sein und der Assistent sollte als gefuehrter Ablauf arbeiten.

## Geaendert

- Dashboard-Register rendern jetzt eigene Cockpits je Kategorie.
- Alte globale Rundinstrumente werden auf dem Dashboard ausgeblendet.
- Hauptschalter direkt auf der Startseite ergaenzt.
- Router erkennen auf Startseite und im Router-Register eingebaut.
- Top-Rechts-Schalter fuer alle Karten ein-/ausklappen ergaenzt.
- Infofenster-Schalter in den Einstellungen eingebaut.
- Custom-Infofenster standardmaessig ausgeschaltet; normale Tooltips bleiben erhalten.
- Doppelte Schalter auf Instrumentkarten entfernt.
- Herzform, Scanring und Sanduhr aus der funktionierenden Vorversion wiederhergestellt.
- Assistent mit Start, Zurueck und Weiter ergaenzt.

## Nicht geaendert

- Kein neuer Core.
- Keine Aenderung am PowerShell-Pruefdienst.
- Keine Aenderung an Framework-Cores.

## Offene Zielgeraete-Pruefung

Live-Browsertest, Touch-Test, echter Routerzugriff und Animationstest muessen auf dem Ziel-PC beziehungsweise Tablet erfolgen.
