# Framework Studio / TUEV Audit - V5.4.7 NavigationTabOrderModule

Projekt: Netzwerk-Leitstand
Modul: shared.navigation-tab-order V0.1.0
Pruefung: Register-Reihenfolge, Ueberlauf und Skalierung fuer spaetere 1000+ Tests
Ergebnis: PASS MIT AUFLAGEN

## Ziel

Die oberen Fachregister duerfen vom Benutzer in eine eigene Reihenfolge gebracht werden. Die Einstellung wird lokal gespeichert und kann auf Standard zurueckgesetzt werden. Bei schmalem Platz oder spaeter mehr Hauptbereichen werden nicht-kritische Register in ein Mehr-Menue verschoben.

## Architekturabgleich

### NavigationCore - PASS

Das Modul veraendert nur die Darstellung und Reihenfolge vorhandener Registerkarten. Es erzeugt keine Messbereiche, startet keine Tests und greift nicht in die Routing- oder Messlogik ein.

### InteractionCore - PASS

Drag-and-drop per Maus ist isoliert. Bedienung bleibt ueber normale Buttons moeglich. Reset und Mehr-Menue sind klassische UI-Aktionen.

### SettingsCore - PASS MIT AUFLAGE

V0.1 speichert lokal unter `leitstand.navigation.tabs.v1`. Fuer die spaetere Studio-Freigabe muss diese Einstellung in SettingsCore/ProfileStorage ueberfuehrt werden.

### CapabilityCore - PASS MIT AUFLAGE

V0.1 ist eine Candidate-Funktion. Vor Freigabe muss die Funktion ueber CapabilityCore ein-/ausschaltbar sein.

### Mess- und Testsystem - PASS

Keine Datei der Messlogik wurde geaendert. `app.js` bleibt unberuehrt. Sensoren, Messwerte, Router-Erkennung, BrainCore und Testzyklen werden nicht manipuliert.

## Skalierung fuer 1000+ Tests

Studio-Auflage: Es duerfen nicht 1000 Tests als obere Registerkarten erzeugt werden.

Loesung:

- Obere Register bleiben Hauptbereiche, z. B. Internet, FRITZ!Box, WLAN, PC, Speicher, Qualitaet, Protokoll.
- Viele Tests werden in Gruppen, Unterlisten, Such-/Filteransichten und Arbeitsflaechen-Fenstern organisiert.
- Das Navigationsmodul stellt nur Reihenfolge und Ueberlauf der Hauptregister bereit.
- Das Mehr-Menue verhindert, dass die Kopfzeile bei vielen Hauptbereichen unbedienbar wird.
- Pflichtbereiche bleiben sichtbar oder erreichbar.

## Freigabestatus

Status: ARCHITECTURE_CANDIDATE
Release: BLOCKED

Naechste Stufe:

- SettingsCore-Anbindung
- CapabilityCore-Schalter
- Navigationsgruppen fuer grosse Testmengen
- Testfeld-Katalog mit Suche/Filter statt Registerkartenflut
