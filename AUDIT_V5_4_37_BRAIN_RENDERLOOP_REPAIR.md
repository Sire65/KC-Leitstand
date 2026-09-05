# V5.4.37 Brain Renderloop Repair - PASS

## Anlass
Das 3D-Denkzentrum stand sichtbar still, obwohl Status und Energie aktualisiert wurden.

## Ursache
Der Renderloop des StatusCore3D hat bei prefers-reduced-motion die Renderzeit dauerhaft auf den Startzeitpunkt gesetzt und danach keinen weiteren Frame angefordert. Auf Systemen mit aktivierter Bewegungsreduzierung wurde dadurch ein Standbild erzeugt.

## Geaendert
- Reduced Motion erzeugt jetzt eine ruhige, reduzierte Dauerbewegung statt Stillstand.
- Der Renderloop laeuft bei aktivem Gehirn weiter und rendert mit reduzierter Bildrate, wenn Bewegungsreduzierung aktiv ist.
- Bei normaler Einstellung bleibt die volle 30-FPS-Logik erhalten.
- app/public StatusCore3D wurde synchronisiert.

## Gegenpruefung
- JavaScript-Syntaxpruefung fuer StatusCore3D, BrainCoordinator und LeitstandBrainIntegration bestanden.
- app/public Synchronitaet fuer StatusCore3D bestaetigt.
- Keine Messlogik, kein Scheduler und keine Sensor-Ausfuehrung geaendert.

Status: CANDIDATE
