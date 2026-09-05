# Audit V4.3.18 – FrameworkLauncher, Diagnose, Installer und Randstabilisierung

- Ein-Klick-Start über FrameworkLauncher V1.0.
- Start aus ZIP/WinRAR/7-Zip/Temp wird klar blockiert.
- Diagnosemodus erzeugt Windows-Version, PowerShell-Version, Projektpfad, Fehler, Prüfprotokoll und Zeitstempel.
- Browserstart bevorzugt Edge/Chrome im App-Modus; Browser-Sidebar und normale Browser-Chrome werden vermieden.
- CSS-Randstabilisierung nutzt die vollständige Viewportbreite und entfernt reservierte Scrollbar-Gutters.
- Automatischer Builder `INSTALLATIONSVERSION_ERZEUGEN.cmd` erstellt ausschließlich aus zertifiziertem Dateistand eine Installations-ZIP samt SHA-256-Bericht.
