# Tiefenanalyse und Tiefenkonsolidierung V4.3.5

## Ausgangsbasis
Netzwerk-Leitstand V4.3.4 Candidate.

## Nachgewiesene Befunde

1. Die Oberfläche lud 15 historische Commandcenter-CSS-Dateien nacheinander. Das funktionierte, erhöhte aber Kopplung, Ladeaufwand und Risiko unbemerkter Überschreibungen.
2. `app` und `public` wurden als getrennte Laufzeitkopien gepflegt. JavaScript war identisch; `index.html` unterschied sich nur durch den Shell-Pfad.
3. Die Browser-TShark-Anfrage hatte kein eigenes Zeitlimit. Ein hängender lokaler Analyseprozess konnte die Oberfläche dauerhaft im Wartezustand halten.
4. Der PowerShell-Prüfdienst startete TShark synchron ohne Prozess-Zeitlimit.
5. Nach einer TShark-Auswertung konnte ein Browser-Resize versuchen, eine nicht vorhandene Timeline zu zeichnen.
6. Historische CSS- und Auditdateien sind für Nachvollziehbarkeit erforderlich, waren aber nicht als aktive bzw. historische Schicht kenntlich gemacht.

## Konsolidierung

- Exakte CSS-Kaskade in `commandcenter-consolidated-v4.3.5.css` zusammengeführt. Die Quelldateien bleiben unverändert als Historie erhalten und werden nicht mehr einzeln geladen.
- App- und Public-Runtime auf denselben JavaScript- und CSS-Stand synchronisiert; der einzige zulässige HTML-Unterschied bleibt der relative Shell-Pfad.
- Browser-TShark-Aufruf mit 190-Sekunden-Abbruch, HTTP-Statusprüfung und verständlicher Timeoutmeldung abgesichert.
- TShark-Prozess im Prüfdienst mit 180-Sekunden-Limit und sicherem Prozessabbruch versehen.
- Leere Uploads werden abgewiesen; übergebene Dateinamen werden auf den reinen Dateinamen reduziert.
- Resize-Regression nach TShark-Auswertung beseitigt.
- Messlogik, SensorRegistry, Büro, Hotspots, Herz/EKG, Register und Routererkennung nicht funktional verändert.

## Nicht entfernt

Alle historischen CSS-, QA-, Audit- und Release-Dateien bleiben im Paket. Konsolidierung bedeutet hier aktive Laufzeitbereinigung, nicht Verlust der Historie.

## Freigabestatus

YELLOW CANDIDATE: statische Prüfungen bestanden. Ziel-PC-Test mit TShark, FRITZ!Box 6690 und Büro-/Registerregression bleibt vor Stable verpflichtend.
