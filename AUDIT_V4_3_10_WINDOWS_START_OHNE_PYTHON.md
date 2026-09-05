# Audit V4.3.11 – Windows-Start ohne Python

## Befund
Der Start von V4.3.9 rief zwingend `python tools/framework-tuev.py verify` auf. Auf einem normalen Windows-Ziel-PC ohne Python wurde der fehlende Interpreter fälschlich als ungültiges TÜV-Zertifikat behandelt.

## Reparatur
- Native Zertifikatsprüfung mit Windows PowerShell und `Get-FileHash` ergänzt.
- Start, Installation und manuelle Zertifikatsprüfung benötigen kein Python mehr.
- Vollständige Prüfung aller zertifizierten Dateien sowie Erkennung zusätzlicher nicht zertifizierter Dateien.
- Python bleibt nur Entwicklungswerkzeug zur Erstellung eines neuen TÜV-Zertifikats.

## Status
Candidate; Windows-Zieltest durch Anwender erforderlich.
