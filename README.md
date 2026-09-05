# Netzwerk-Leitstand V4.3.5 Candidate

Fachlich getrennte Register und zentrale SensorRegistry. Internet und PC zeigen nur ihre jeweils relevanten Werte. Bestehende Leitstandfunktionen bleiben geschützt.

# Netzwerk-Leitstand V4.1.7

Standalone-Candidate fuer lokale Netzwerk-, Router-, WLAN- und PC-Diagnose mit Registertrennung, LED-Leiste, sensibleren Instrumenten, Buerofenster und Navigation mit Plus/Minus-Gruppen.

## Status

YELLOW-CANDIDATE. Statische Pruefungen bestanden; echter Browser-/Probe-/Routertest bleibt auf dem Ziel-PC offen.

## Start

1. `probe/PRUEFDIENST_STARTEN.cmd` starten.
2. `NETZWERK_LEITSTAND_STARTEN.cmd` starten oder `app/index.html` lokal oeffnen.
3. Auf der Startseite den Hauptschalter einschalten.

## Neu in V4.1.7

- Diagnose-Register werden hart getrennt; inaktive Register-Panels bleiben verborgen.
- LED-Leiste ist wieder sichtbar und kompakt.
- Grosse Sensor-Kacheln in der Live-Kopfzeile sind ausgeblendet.
- Rundinstrumente reagieren sensibler auf Messwertveraenderungen.
- Assistent-starten scrollt sichtbar zur Assistentenkarte und startet den Schrittmodus.
- Bueromodus oeffnet als separates Fenster, nicht als Flaeche ueber den Messinstrumenten.
- Zeitstrahl zeigt Warn- und Fehlerspitzen im Verlauf.
- Navigation nutzt Plus/Minus-Klappkoepfe und farbige Icons.

## Grenzen

Die Browser-/GitHub-Version kann keine lokalen SMART-Werte, WLAN-Kanaele oder Router-Innendaten direkt auslesen. Diese Werte kommen ueber lokalen Windows-Pruefdienst oder importierte Diagnoseberichte.

Der lokale Pruefdienst wurde nicht veraendert.


## TShark-Tiefenanalyse
Optional Wireshark/TShark installieren und den lokalen Pruefdienst starten. Im Register Paketmitschnitt zeigt der Leitstand den Providerstatus und bietet eine lokale Tiefenanalyse an. Ohne TShark funktioniert die vorhandene Browser-Auswertung weiter.

## Framework-TÜV
V4.3.28 darf nur mit einem gültigen Zertifikat gestartet oder installiert werden. `TUEV_RELEASEPRUEFUNG.cmd` erzeugt ein Candidate-Zertifikat für Testbetrieb. Eine Stable-Freigabe benötigt zusätzliche Live-Nachweise.
