# Audit V4.3.18 – Installationspfad und Laufwerksauswahl

- Quellpfad wird ausschließlich aus `$PSScriptRoot` ermittelt.
- Keine fehleranfällige Übergabe von `%~dp0` an PowerShell.
- Dateioperationen verwenden `-LiteralPath`.
- Installationsdialog startet bei „Dieser PC“ und bietet alle vorhandenen Laufwerke und Ordner an.
- Bei Dialogabbruch werden vorhandene Dateisystemlaufwerke als Textauswahl angezeigt.
- Fortschrittsbalken bleiben für alle Installationsschritte erhalten.
- Installation in den Quellordner oder einen übergeordneten Quellpfad wird blockiert.
