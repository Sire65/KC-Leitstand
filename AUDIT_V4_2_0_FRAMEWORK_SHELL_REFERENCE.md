# Audit V4.2.0 – Framework Shell Referenz

## Ziel
Erste echte, laufzeitaktive Referenz der gemeinsamen Framework Shell im Netzwerk-Leitstand.

## Umgesetzt
- Navigation wird vor dem Fachprogramm aus `app/config/navigation.config.js` erzeugt.
- Gemeinsame Kopfzeile mit Begrüßung, Projektidentität, Suche, KI-Zugriff und SmartPanel-Schalter.
- Rechtes einklappbares SmartPanel mit Pinnwand, KI und Kontextdetails.
- Gemeinsame Statusleiste mit Internet, FRITZ!Box, Prüfdienst, CPU, RAM, letztem Test und Version.
- Framework-Shell-Runtime als getrennte, fachlogikfreie Komponente.
- Bestehende NavigationCore-, Fachseiten-, Büro-, Sensor- und Prüfdienstlogik unverändert weiterverwendet.

## Architekturgrenzen
- Shell orchestriert nur Oberfläche und Konfiguration.
- Fachmessungen bleiben in `app/app.js` und im lokalen Prüfdienst.
- Designwerte bleiben CSS-/DesignCore-kompatibel.
- Tablet ist ein MobileCore-Gerätemodus; kein neuer TabletCore.

## Regression
Geschützt bleiben Dashboard, Live-Diagnose, Störungen, Prüfkreise, Geräte, WLAN, FRITZ!Box, DOCSIS, Berichte, Messprotokoll, Einstellungen, Hilfe, Büromodus, EKG, Instrumente, Schalter und Prüfdienst.

## Gate
YELLOW CANDIDATE: statische Prüfung bestanden; Ziel-PC-, Browser-, Fritz!Box- und Tablet-Livetest ausstehend.
