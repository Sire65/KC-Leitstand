# AUDIT V4.3.1 – Router-Erkennung Abschlusslogik

## Fehlerbild
Der Fortschrittsbalken der Router-Erkennung konnte bei einem Fehler in der nachfolgenden Darstellung bei 82 % stehen bleiben.

## Korrektur
- Router-Erkennung besitzt jetzt einen eigenen Laufstatus.
- Fortschritt endet immer mit Erfolg oder verständlicher Fehlermeldung.
- Sicherheits-Timeout nach 12 Sekunden.
- Doppelklick/Mehrfachstart während eines laufenden Vorgangs gesperrt.
- Abschlussanzeige wird vor einer nachgelagerten Gesamtdarstellung gesetzt.
- Fehler in `render()` können den Abschlussbalken nicht mehr blockieren.
- Messdienst, SensorRegistry, Fachregister, Büro, Herz und EKG unverändert.

## Regression
Geschützt: V4.3.0 Fachregister, SensorRegistry, Büro-Hotspots, Herz/EKG, GitHub-public und lokaler Prüfdienst.
