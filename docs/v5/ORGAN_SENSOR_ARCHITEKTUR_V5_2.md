# Leitstand V5.2 – Organ- und Sensorarchitektur

## Ziel
Der Leitstand verwaltet kleine Heimnetze und grosse IT-Umgebungen mit mehreren hundert Sensoren, ohne die Hauptoberflaeche zu ueberladen.

## Prinzip
Sensoren werden neun digitalen Organen zugeordnet. Das Gehirn bewertet zuerst die Organe und erst bei Bedarf einzelne Sensoren.

1. Kreislauf – WAN, Internet, Routing, Provider
2. Atmung – WLAN, Funk, Access Points, Mesh
3. Nervensystem – DNS, DHCP, NTP, Namensaufloesung
4. Muskeln – Server, NAS, PCs, Clients
5. Sinne – Kameras, IoT, externe Sensorik
6. Energie – USV, Netzteile, PoE, Akkus
7. Immunsystem – Firewall, Schutz, Zertifikate, Anomalien
8. Gedaechtnis – Historie, Protokolle, Backups, Speicher
9. Motor – Leitstand-Runtime, Scheduler und Pruefdienst

## Skalierung
Die Registry verwendet eindeutige Sensor-IDs und eine Map-basierte Verwaltung. Sensoren koennen zur Laufzeit registriert, aktualisiert, deaktiviert und einem Organ zugeordnet werden. Die Hauptansicht zeigt nur verdichtete Organwerte; Detailregister zeigen Sensoren gruppiert und gefiltert.

## Sicherheitsregel
Das Gehirn darf interne Kontrollmessungen und Laststaffelung koordinieren. Eingriffe in Router, Betriebssystem oder externe Geraete benoetigen weiterhin eine ausdrueckliche Freigabe.
