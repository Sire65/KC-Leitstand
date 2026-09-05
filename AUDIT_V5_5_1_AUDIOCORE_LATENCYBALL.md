# Framework Studio / TUEV Audit - V5.5.1 AudioCore LatencyBall

Projekt: Netzwerk-Leitstand V5.4.4 Accessory Visual Modules Candidate
Datum: 2026-07-17
Status: PASS MIT AUFLAGEN

## Ergebnis
AudioCore wurde als eigener Core-Baustein ergaenzt und in den Leitstand eingebunden.

## Umsetzung
- Neuer Core: framework/core/audiocore.js und public/framework/core/audiocore.js.
- Neue Registerkarte Einstellungen / Audio mit Hauptschalter, Gesamtlautstaerke, aktivem Audiokanal und Testliste.
- Pro geeigneter Anzeige werden Lautsprecher-Schalter ergaenzt; Klick aktiviert/testet den Kanal, zweiter Klick schaltet ihn aus.
- Es kann immer nur ein aktiver Audiokanal gesetzt sein.
- LatencyBall nutzt das Ereignis latency-ball.bounce fuer ein wertabhaengiges Klack-Signal.
- Alarm-/Warnton wurde auf AudioCore-Kanallogik geroutet, damit keine parallelen Sounds entstehen.

## Architekturabgleich
- SettingsCore: PASS - Audioeinstellungen liegen in S.settings und werden ueber vorhandene Speicherlogik persistiert.
- InteractionCore: PASS - Bedienung per Schalter/Select, keine blockierende Interaktion.
- DesignCore: PASS - Symbole und Zustaende ueber bestehendes CSS, keine fremden Assets.
- EventBus/Runtime: PASS - LatencyBall bleibt Modul, Audio reagiert auf sein Bounce-Event.
- WindowCore: PASS - keine Veraenderung an Fensterlogik oder Layout-Editor.
- SecurityCore: PASS MIT AUFLAGEN - spaetere Rechte fuer Audiofreigabe/Alarmton koennen ergaenzt werden.

## Pruefungen
- node --check app/app.js: PASS
- node --check public/app.js: PASS
- node --check framework/core/audiocore.js: PASS
- node --check public/framework/core/audiocore.js: PASS
- app/public Hashabgleich: PASS
- Marker-/Encodingpruefung: PASS
- AudioCore-Kanallogik: PASS - activeChannel erzwingt Einzelkanalbetrieb.

## Auflagen
- In spaeterer Stufe koennen weitere Testkarten explizit Audiofaehigkeiten aus dem Testkatalog bekommen.
- Schulungs-/Demomodus soll eigene Klangprofile ueber denselben AudioCore erhalten.
- Keine externen Audiodateien verwenden, solange WebAudio fuer die Signale ausreicht.
