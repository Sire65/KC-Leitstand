# Audit V4.3.2 – Speicherquota

## Fehlerursache
Der komplette Laufzeitzustand inklusive bis zu 12.000 Messproben und 2.000 Ereignissen wurde als ein JSON-Block unter `NLV4` in `localStorage` gespeichert. Browser begrenzen diesen Speicher typischerweise auf wenige Megabyte. Dadurch warf `setItem` einen `QuotaExceededError`, den die Router-Erkennung als allgemeinen Fehler meldete.

## Korrektur
- Konfiguration und Kerndaten: kompakt in `localStorage`.
- Messproben, Ereignisse und DOCSIS-Verlauf: IndexedDB.
- Debounced Speicherung zur Lastbegrenzung.
- Notfall-Fallback auf Kerndaten, ohne Funktionsabbruch.
- Bestehende Messalgorithmen und der lokale Pruefdienst unveraendert.
