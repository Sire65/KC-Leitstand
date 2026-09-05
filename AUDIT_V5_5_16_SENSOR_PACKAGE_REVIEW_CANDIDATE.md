# Audit V5.5.16 – Sensor Package Review Candidate

Datum: 2026-07-29

Paketvorschläge lassen sich öffnen und pro Sensor prüfen. Die deterministische Lastbewertung begrenzt Vormerkungen auf 30 Punkte. Überlastete oder leere Auswahlen werden abgewiesen.

Gespeichert wird ausschließlich eine verschlüsselte, nicht ausführbare Aktivierungsabsicht mit `enabled:false` und `PENDING_CAPABILITY_SCHEDULER_TUEV`. Adapterbindung, Aktivierung und Messausführung bleiben ausgeschlossen.
