# TÜV-Prüfkatalog V5

## Architektur-TÜV
- neue Funktion korrekt zugeordnet
- keine Doppelimplementierung
- klare Runtime-Ownership
- echte Consumer
- dokumentierte API und Abhängigkeiten

## Dashboard-TÜV
- keine Randlücke
- keine horizontale Scrollleiste
- keine Überlappung
- keine abgeschnittenen Texte
- gleiche Blockhöhen
- keine leeren Platzhalter
- LEDs eindeutig beschriftet
- Tooltip und Dialog schließen sich gegenseitig aus
- Instrumentwert und Zeiger identisch

## Sensor-TÜV
- Sensor-ID eindeutig
- Quelle vorhanden
- Einheit und Grenzwerte vorhanden
- Messintervall und Lastklasse definiert
- Verlauf und Erklärung vorhanden
- nicht unterstützte Sensoren werden neutral behandelt

## Performance-TÜV
- Basisprofil im Leerlauf geringe CPU-/RAM-Last
- keine parallelen Intensivtests
- Messung beeinflusst Messergebnis nicht wesentlich
- Render- und Sensorlaufzeiten protokolliert

## Bedienungs-TÜV
- Laienverständlichkeit
- klare Warntexte
- Prozentwerte erklärbar
- progressive Offenlegung
- Animationen vollständig abschaltbar
- Alarm quittierbar und begrenzt

## Release-Gate
Nur vollständig geprüfte, erneut entpackte und zertifizierte Pakete dürfen Candidate werden.
