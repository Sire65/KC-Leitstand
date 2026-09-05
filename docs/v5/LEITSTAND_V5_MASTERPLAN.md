# Netzwerk-Leitstand V5 – Masterplan

## Status
V5-Vorbereitung auf Basis des eingefrorenen Golden Masters V4.3.28.

## Produktziel
Eine dauerhaft überwachende, verständliche Netzwerk-Leitwarte mit ruhiger Hauptübersicht, logisch getrennten Fachregistern, erklärbaren Gesundheitswerten, kontrollierter Eigenlast und reproduzierbarer TÜV-Freigabe.

## Verbindliche Grundsätze
1. Die Hauptansicht bleibt der Golden Master und wird nicht mit zusätzlichen Sensoren überladen.
2. Neue Sensoren werden ausschließlich über SensorRegistry 2.0 registriert.
3. Jeder Sensor besitzt Rohwert, Einheit, Gesundheitswert, Status, Grenzwerte, Verlauf, Tooltip, Erklärung, Alarmregel und Belastungsklasse.
4. Intensive Prüfungen laufen nur ereignisgesteuert oder manuell.
5. Normalstart, Installer, Prüfdienst, Build und TÜV sind voneinander getrennt.
6. Neue Framework-Cores benötigen einen formalen Architektur-TÜV.

## Zielregister
- Leitstand
- Internet & Provider
- Router
- WLAN & Mesh
- Geräte
- PC-System
- Historie & Ursachen
- Sensorverwaltung
- Alarmverwaltung
- Einstellungen

## Sensorprofile
### Basis
Leichte Dauerüberwachung, geringe Eigenlast, laiengerechte Anzeige.
### Erweitert
Zusätzliche WLAN-, Geräte- und Verlaufsdiagnostik.
### Experte
DOCSIS, PCAP, TShark, Tiefenanalyse und technische Detailwerte.

## Umsetzungsstufen
1. Golden Master und Inventur
2. SensorRegistry 2.0
3. Rundinstrument- und Gesundheitslogik
4. Register-Shell und progressive Offenlegung
5. Last- und Intervallsteuerung
6. Alarm- und Quittierungslogik
7. Historie und Ursachenanalyse
8. GitHub-/Startarchitektur
9. Studio-Integration
10. Abschluss-TÜV und Release
