# Audit V4.1.8 – Bueromodus und Paketkonsolidierung

## Unveraendert
- probe/Netzwerk_Pruefdienst_V4.ps1
- Messalgorithmen und Pollinglogik
- Routerprofile
- bestehende Diagnose- und Registerlogik

## Geaendert
- Bueromodus von normalem Fenster auf Vollbild-Overlay umgestellt
- Objekt-Hotspots mit prozentualen, responsiven Flaechen eingefuehrt
- sichtbare Marker entfallen
- Pakettest und Versionskonsistenz repariert

## Architekturentscheidung
Kein neuer Core. Die Fachzuordnung verbleibt im Netzwerk-Leitstand; die Bedienereignisse nutzen bestehende Seiten- und Einstellungsfunktionen. Eine spaetere Generalisierung erfolgt erst nach projektuebergreifendem Nachweis.
