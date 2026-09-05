# Netzwerk-Leitstand V4.1.6

Status: CANDIDATE

## Schwerpunkt

Diese Version verbessert Navigation, Stammdatenstruktur, Bueromodus, Routerprofile und Schalterpruefung.

## Neu

- Navigation mit Oberpunkt `Stammdaten` und eingerueckten Unterpunkten.
- Schnellzugriffe und Navigation erhalten wieder echte Symbolanzeigen statt reiner Buchstaben.
- Untere Messfenster/Rundinstrumente werden wieder eingeblendet.
- Pulslogik: Ruhepuls etwa 60/min, rote Stoerungen deutlich hoeher, Vollalarm bis 200/min.
- Router erkennen und Assistent starten sitzen kompakter rechts neben den Registern.
- Erkannte und importierte Router werden als Register `Routerprofile` unter Einstellungen angezeigt.
- Neues Einstellungsregister `Schalter-Audit`.
- Bueromodus ueber Admin-Box-Button `Buero`.
- Buerobild liegt getrennt unter `app/assets/images/office`.
- Beim Verlassen des Buerobilds erscheint `Zurueck zum Buero`.

## Nicht geaendert

- Kein neuer Core.
- NavigationCore bleibt Grundlage.
- Lokaler PowerShell-Pruefdienst unveraendert.
