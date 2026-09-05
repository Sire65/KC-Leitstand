# Audit V4.2.1 – Framework Shell Stabilisierung

## Ziel
Die in V4.2.0 eingeführte Framework Shell wird bedienlogisch vervollständigt, ohne Mess- und Prüfdienstlogik zu verändern.

## Umgesetzt
- Navigation aus Projektkonfiguration mit maximal einer geöffneten Obermenügruppe.
- Plus/Minus- und Pfeilstatus sowie `aria-expanded` für Obermenüs.
- Benutzerfeld: Hans, Administrator, Auto-Status und eindeutige Aktion „Büromodus starten“.
- Projektidentität und Begrüßungszeile aus Shell-/Navigationskonfiguration.
- Digitaluhr mit Datum und Sekundenanzeige.
- SmartPanel mit Pinnwand, KI, Details und Aufgaben.
- Statusleiste mit Internet, FRITZ!Box, Prüfdienst, CPU, RAM, letztem Test, Gerätemodus und Version.
- Responsive Erkennung für Desktop, Tablet und Smartphone.
- Fallback-Konfiguration für Shell und Navigation.

## Schutz bestehender Funktionen
- `probe/Netzwerk_Pruefdienst_V4.ps1` ist gegenüber V4.2.0 bytegenau unverändert.
- Keine Messalgorithmen, Routerprüfungen, WLAN-/DOCSIS-Logik oder Berichtsfunktionen geändert.
- `app/app.js` wurde ausschließlich für die neuen eindeutigen Büromodus-Beschriftungen angepasst.

## Prüfungen
- JavaScript-Syntax: PASS
- Migration-Preflight: PASS
- 12 bestehende Navigationsziele: PASS
- CSS-/Runtime-Einbindung: PASS
- Prüfdienst-SHA-256 unverändert: PASS
- ZIP-Struktur und Manifest: PASS

## Status
YELLOW CANDIDATE. Ziel-PC-, Prüfdienst-, FRITZ!Box-6690-, Tablet- und Smartphone-Livetests stehen aus.
