# Audit V4.3.18 – Installationsort, Fortschritt und Browserstart

- Installationsort wird vor dem Kopieren über Windows-Ordnerauswahl abgefragt.
- Vorgabe bleibt `%LOCALAPPDATA%\Netzwerk-Leitstand-V4`, kann aber geändert werden.
- Jede Installations- und Startphase zeigt einen DOS-/PowerShell-Fortschrittsbalken.
- Browserpfad wird als einzelner String statt als `System.Object[]` an `Start-Process` übergeben.
- Diagnosemodus und Archiv-Startschutz bleiben erhalten.
