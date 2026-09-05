# Pflichtenheft – Sensorpaket-Prüfung und Lastgate

Status: Architektur-Kandidat.

Vorgeschlagene Pakete müssen vor jeder Aktivierung geöffnet werden können. Jeder Sensor ist einzeln abwählbar. Lastklassen werden mit 0, 1, 3 oder 7 Punkten bewertet; das Kandidatenbudget beträgt 30 Punkte.

Über Budget darf keine Vormerkung gespeichert werden. Eine gültige Vormerkung bleibt `enabled:false` und erhält `PENDING_CAPABILITY_SCHEDULER_TUEV`. Sie wird AES-GCM-verschlüsselt in IndexedDB gespeichert und startet keine Messung.
