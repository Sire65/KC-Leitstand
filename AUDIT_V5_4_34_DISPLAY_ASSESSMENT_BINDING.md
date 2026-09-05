# V5.4.34 Display Assessment Binding - PASS

## Ziel
LEDs, Diagnosekarten, Statuszeilen und Rundanzeigen sollen keine eigene zentrale Bewertungslogik mehr pflegen, sondern die Bewertung aus dem SystemAssessmentCore verwenden.

## Ergebnis
PASS MIT AUFLAGEN

## Geaendert
- app/app.js und public/app.js wurden synchron erweitert.
- Neue Anzeigeadapter: assessmentFor, uiLevel, domainAssessment, domainLevel und domainScore.
- LED-Status fuer Router, Internet, DNS, Qualitaet/Loss/Jitter und PC/System nutzt jetzt Core-Domaenen.
- Diagnose-Register fuer Internet, Router und PC nutzen Core-Level fuer Ampeln/Karten.
- Status-Tabelle, Router-Detailstatus und Gauges nutzen Core-Level statt lokaler Schwellen.
- PC-Health nutzt den PC-Domain-Score aus dem Core, wenn ein Snapshot vorhanden ist.
- Canvas-Gauges koennen orange direkt darstellen; CSS-basierte Altkomponenten mappen orange vorerst auf bestehende Warn-Darstellung.

## Gegenpruefung
- JavaScript-Syntaxpruefung fuer app/public app.js und StatusCore-Dateien bestanden.
- app/public Synchronitaet bestaetigt.
- Suche nach alten zentralen Anzeige-Schwellen in den Kernstellen ohne Resttreffer.
- Keine Messausfuehrung, kein Sensorstart und keine Datenmutation geaendert.

## Bewusst nicht geaendert
- Importbefunde wie FRITZ-Diagnose, Routerdatei, SMART und WLAN-Import behalten ihre lokalen Befundlevel, weil sie eigene Datenquellen sind.
- IPv4/IPv6 bleiben bis zur naechsten Core-Erweiterung als getrennte Detailanzeigen lokal.

## Auflagen / Naechster Schritt
SystemAssessmentCore sollte als naechstes eigene Subdomaenen fuer IPv4, IPv6, WLAN/Importe und SMART/Storage erhalten. Danach koennen auch diese Detailanzeigen vollstaendig zentralisiert werden.

Status: CANDIDATE
