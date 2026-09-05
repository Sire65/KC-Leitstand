# Audit V4.1.3 - Control-Cockpit und Router-Erkennung

## Ziel

Umsetzung der gewuenschten Leitstand-Korrekturen ohne neue Framework-Cores und ohne Veraenderung des lokalen Pruefdienstes.

## Geaendert

- Diagnose-Register kompakter und hoeher platziert.
- Kategorie-Register mit eigenen Testkarten, Tabellen und Balken.
- Hauptschalter stoppt aktive Testdarstellung, Tiefenanalyse und Instrumentenbewegung.
- Einzelne Instrumente und Testkarten besitzen eigene Ein-/Ausschalter.
- Router-Erkennung mit Button `Router erkennen` ergaenzt.
- EKG-Canvas mit realistischerer Kurve und Pulsanzeige erweitert.
- Sanduhr und Scanring als echte visuelle Elemente wiederhergestellt.
- Infokarten fuer Messwerte und Schalter ergaenzt.
- Tiefenanalyse mit Fortschrittsbalken und Restzeit.
- Pruefkreis-Seite kompakter als Tabelle.

## Nicht geaendert

- Keine neuen Framework-Cores.
- Keine Aenderung an NavigationCore, WindowCore, TableCore oder anderen Framework-Cores.
- Keine Aenderung am lokalen PowerShell-Pruefdienst.
- Keine direkte Browser-Behauptung fuer SMART-, WLAN- oder Router-Hardwarewerte.

## Candidate-Grenze

Der echte Live-Test mit aktivem Pruefdienst, Routerzugriff und Zielgeraeten muss auf dem Ziel-PC erfolgen. Die statische Paketpruefung ist bestanden.
