# Pflichtenheft Eigenlast und Messschutz V1

Status: ARCHITECTURE_CANDIDATE  
Pruefweg: interner Framework-TUEV

## Ziel

Der Leitstand muss seine Eigenlast so gering halten, dass PC-Messungen nicht
unbemerkt durch Darstellung, Audio, Tabellen oder Testplanung beeinflusst werden.

## Muss-Regeln

- Keine unabhaengigen Dauertimer pro Testkarte.
- Unsichtbare Seiten und Karten pausieren Animationen und Detaildarstellung.
- Minimierte Karten aktualisieren nur kompakten Status.
- Eingeklappte Karten rendern keinen Detailinhalt.
- TableCore rendert maximal 100 Verwaltungszeilen gleichzeitig.
- Audio wird nur bei einem freigegebenen Test und erst bei Benutzung initialisiert.
- Lautstaerke-Popover existieren nur waehrend der Bedienung.
- Zentrale Sichtbarkeitssignale ersetzen Polling.
- Rohmesswerte bleiben erhalten; rechnerische Eigenlastkorrekturen sind ohne
  belastbare Quelle verboten.
- Erhoehte Eigenlast kennzeichnet das Messfenster und verlangt bei kritischen
  PC-Bewertungen eine Wiederholungsmessung.

## Interne TUEV-Gates

- PERFORMANCE_TUEV
- SENSOR_TUEV
- BEDIENUNGS_TUEV
- FRAMEWORK_TUEV
- TARGET_PC_SELF_LOAD
- BACKGROUND_PAUSE
- TABLECORE_1000_SCALE

Stable bleibt blockiert, bis Ruhe-, Normal- und Analyselast auf dem Ziel-PC
protokolliert wurden.
