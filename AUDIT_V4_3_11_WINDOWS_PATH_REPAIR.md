# Audit V4.3.11 – Windows-Pfadübergabe repariert

## Ursache
Die Batch-Dateien übergaben `%~dp0` einschließlich abschließendem Rückwärtsschrägstrich als quoted Parameter an PowerShell. Auf einzelnen Windows-Konstellationen wurde das schließende Anführungszeichen Teil des Pfades. `Test-Path` meldete deshalb „Illegales Zeichen im Pfad“.

## Reparatur
- Zertifikatsprüfung ermittelt den Projektpfad standardmäßig selbst über `$PSScriptRoot`.
- `-Root "%~dp0"` wurde aus Start-, Prüf- und Installationspfaden entfernt.
- Eine optionale manuelle Root-Übergabe wird zusätzlich normalisiert und validiert.
- Keine Python-Abhängigkeit im normalen Windows-Start.

## Regression
Candidate-TÜV, Manifest, Zertifikat und ZIP-Integrität wurden neu erstellt.

## Status
Candidate/Testbetrieb. Stable-Freigabe weiterhin erst nach Ziel-PC-, Prüfdienst- und FRITZ!Box-Livetest.
