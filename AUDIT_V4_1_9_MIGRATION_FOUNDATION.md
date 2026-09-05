# AUDIT V4.1.9 – Migrationsfähige Framework-Komponenten

## Ziel
Der bestehende Netzwerk-Leitstand wird nicht umgebaut. Diese Version ergänzt ausschließlich das verbindliche Fundament für kontrollierte One-Touch-Migrationen allgemeiner Bedienelemente.

## Neu
- maschinenlesbarer Komponentenvertrag
- Manifest für NavigationCore
- Manifest für FrameworkShell
- projektbezogene Navigation außerhalb des Core-Codes
- Shell-Konfiguration für Kopfzeile, Arbeitsbereich, SmartPanel und Statusleiste
- geschützte Regressionsbasis V4.1.8
- lokale Migrations-Vorprüfung
- Rollback-Pflicht und Erhalt der Projektkonfiguration verbindlich festgelegt

## Nicht verändert
- Prüfdienst
- Messlogik
- EKG und Instrumente
- bestehende Navigation und Seiten
- Büroansicht und Hotspots
- Fritz!Box-, DOCSIS-, WLAN- und Berichtsfunktionen

## Gate
YELLOW_CANDIDATE – Das Migrationsfundament ist statisch geprüft. Eine echte Komponentenübernahme in weitere Projekte erfolgt erst nach Quellen-/Zielvergleich, Regression und Nutzerfreigabe.
