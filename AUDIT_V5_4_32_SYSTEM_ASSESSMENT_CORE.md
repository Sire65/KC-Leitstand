# V5.4.32 SystemAssessmentCore - PASS

Zentrale Bewertungsinstanz fuer Leitstand-Anzeigen eingefuehrt.

- Fehlende Messwerte ergeben `unknown`, nicht mehr automatisch gruen.
- Harte rote Bedingungen wie Router offline oder Paketverlust >= 5 % bleiben rot und werden nicht weggeglättet.
- BrainCoordinator nutzt SystemAssessmentCore fuer Stabilitaet, Level, Aktivitaet, Brain-State und Sensorwerte.
- BrainIntegration nutzt denselben Core und ueberstimmt den Coordinator nicht mehr bei Aktivitaet/Label.
- Keine Messung wird gestartet, keine Sensorwerte werden veraendert.

Noch offen fuer naechsten Schritt:
- app.js `calculateHealth()` / `analyze()` und Herz-Anzeige ebenfalls direkt auf SystemAssessmentCore umstellen.

Status: CANDIDATE.
