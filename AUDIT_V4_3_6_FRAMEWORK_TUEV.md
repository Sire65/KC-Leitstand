# Audit V4.3.6 – Framework-TÜV V1.0

## Ziel
Verpflichtende automatische Qualitätssicherung mit Zertifikat und technischer Sperre.

## Implementiert
- `tools/framework-tuev.py`: quick, release, stable, verify
- `tuev/policy.json`: zentrale Prüf- und Schutzregeln
- Berichte: JSON, HTML und Fehlerliste
- Zertifikate: JSON und Text, an den vollständigen Dateistand gebunden
- Start und Installation prüfen das Zertifikat vor Ausführung
- GitHub Actions führt Candidate-TÜV automatisch aus
- Stable-Prüfung bleibt gesperrt, bis reale Ziel-PC- und Live-Nachweise vorliegen

## Schutz
Die Dateien unter `app/`, `public/` und `probe/` wurden für diese Stufe fachlich nicht geändert.
