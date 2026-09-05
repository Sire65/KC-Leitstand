# Audit V4.3.18 – Installer-Robustheit und echter Fortschritt

## Behoben
- Laufwerksauswahl auf PC-Ebene als nummeriertes Menü für alle erkannten Dateisystemlaufwerke.
- Alternative vollständige manuelle Pfadeingabe.
- Keine Übergabe des Quellpfads aus CMD an PowerShell.
- Quellpfad ausschließlich aus `$PSScriptRoot` ermittelt.
- Zertifikatsprüfungen laufen mit sichtbarem Heartbeat und Zeitangabe.
- Kopiervorgang zeigt echten dateibasierten Fortschritt statt statischer 40-Prozent-Anzeige.
- Zielordner darf Laufwerkswurzel-nah liegen; nur Quelle selbst und deren Unterordner werden blockiert.
- Vorhandener Zielordner wird nicht mehr ungefragt gelöscht.

## Status
Candidate / TEST_ONLY. Windows-Zielrechnerprüfung erforderlich.
