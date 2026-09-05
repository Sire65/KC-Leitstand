# Audit V4.3.18 – Archiv-Startschutz

## Anlass
Ein Windows-Test zeigte, dass eine CMD-Datei direkt aus WinRAR gestartet wurde. WinRAR stellte nur die Startdatei in einem temporären Ordner bereit; abhängige Dateien wie `tools/verify-certificate.ps1` fehlten.

## Reparatur
- Erkennung typischer WinRAR-, 7-Zip- und Windows-Temp-Pfade.
- Zusätzliche Prüfung zentraler Pflichtdateien vor jedem PowerShell-Aufruf.
- Klare Benutzermeldung: ZIP vollständig entpacken und aus einem normalen Ordner starten.
- Schutz in Start, Zertifikatsprüfung und Installation.
- Kein irreführender Zertifikatsfehler mehr, wenn tatsächlich nur ein Archiv-Direktstart vorliegt.

## Status
Candidate-Test erforderlich. Stable-Gates bleiben unverändert.
