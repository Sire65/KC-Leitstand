# Release Notes V4.3.2

## Korrektur
Die Router-Erkennung wurde durch das Browser-Speicherlimit von `localStorage` unterbrochen. V4.3.2 trennt kleine Konfigurationsdaten von grossen Verlaufsdaten.

## Speicherung
- `localStorage`: Einstellungen, Geräte, Routerergebnis und kompakte Kerndaten.
- IndexedDB: Messproben, Ereignisverlauf und DOCSIS-Historie.
- Notfall-Fallback: Bei einem Browserlimit bleiben die Kerndaten speicherbar und die laufende Aktion wird nicht abgebrochen.

## Unverändert
Pruefdienst, Messalgorithmen, Fachregister, SensorRegistry, Buero, Hotspots, Herz/EKG und GitHub-Public.
