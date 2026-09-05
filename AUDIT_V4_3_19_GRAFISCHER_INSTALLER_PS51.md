# Audit V4.3.23 – Grafischer Installer / PowerShell 5.1

## Behoben

- DOS-basierte Laufwerksauswahl entfernt.
- Grafische Auswahl über Windows-Festplatten- und Ordnerstruktur eingebaut.
- `New-Item -LiteralPath` durch `[System.IO.Directory]::CreateDirectory()` ersetzt.
- Echter Fortschritt pro geprüfter und kopierter Datei.
- Installationsfehler werden verständlich angezeigt und als Diagnose protokolliert.

## Status

Candidate / TEST_ONLY. Ziel-PC-Test erforderlich.
