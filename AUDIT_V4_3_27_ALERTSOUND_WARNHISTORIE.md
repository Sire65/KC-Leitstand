# AUDIT V4.3.28 - Warnton und Warnhistorie

## Umfang
- Symmetrischer Rahmen um Sanduhr und Zeitbalken
- Kompakte Warnhistorie zwischen Fortschritt und EKG
- Zeitraeume 15 Minuten, 1 Stunde, 24 Stunden und 7 Tage
- Hover-Auswertung fuer gelbe und rote Ereignisse
- AlertSoundService mit bewusster Aktivierung, Testton, Lautstaerke, Ausloesestufe, Tonanzahl und Wiederholungsgrenze

## Architektur
Projektbezogener Dienst, kein neuer Framework-Core. Messlogik und Bewertung bleiben unveraendert. Der Dienst konsumiert nur vorhandene Ereignisse.

## Sicherheitsvorgaben
Warnton ist standardmaessig ausgeschaltet. Keine Endlosschleife. Audiofreigabe erfolgt erst durch Benutzerinteraktion.
