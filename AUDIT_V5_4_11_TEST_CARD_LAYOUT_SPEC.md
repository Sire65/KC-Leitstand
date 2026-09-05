# Framework Studio / TUEV Audit - V5.4.11 TestCardLayoutSpec

Projekt: Netzwerk-Leitstand
Module: shared.test-card-layout-spec V0.1.0, shared.test-catalog V0.4.0
Pruefung: Rastergroessen fuer Testkarten und spaetere Arbeitsflaechen-Platzierung
Ergebnis: PASS MIT AUFLAGEN

## Ziel

Testkarten sollen nicht frei und unkontrolliert wachsen, sondern in klaren Rastergroessen angeordnet werden. Dadurch bleibt der Leitstand auch bei vielen Pruefkreisen aufgeraeumt.

## Rasterregel V0.1

Arbeitsflaeche: 6 Spalten

Breiten:

- S = 1 Spalte
- M = 2 Spalten
- L = 3 Spalten
- XL = 4 Spalten

Hoehen:

- S = 2 Rastereinheiten
- M = 3 Rastereinheiten
- L = 4 Rastereinheiten
- XL = 6 Rastereinheiten

## Praxisregel

Eine kleine S-Karte kann neben einer XL-Karte platziert werden, weil XL 4 von 6 Spalten nutzt. Es bleiben 2 Spalten frei. Dadurch sind z. B. moeglich:

- XL + S
- XL + M
- L + L
- L + M + S
- M + M + M
- S + S + M + M

Nicht erlaubt sind Kombinationen, deren Summe mehr als 6 Spalten ergibt. Diese Karten rutschen spaeter automatisch in die naechste Reihe.

## Architekturabgleich

### WindowCore - PASS

Das Modul definiert nur erlaubte Rastergroessen. Es verschiebt keine aktiven Fenster und veraendert keine Fensterpositionen.

### LayoutEditor - PASS MIT AUFLAGE

Der aktuelle Layout-Editor nutzt diese Spezifikation noch nicht aktiv. Naechste Stufe muss die Grid-Regeln in die Arbeitsflaeche uebernehmen.

### DesignCore - PASS

Das Modul enthaelt keine eigenen Farbvorgaben fuer Karteninhalte. Die sichtbaren Badges nutzen vorhandene Leitstand-Stile.

### InteractionCore - PASS

Keine neue riskante Interaktion. Der Testkatalog zeigt nur die empfohlene Kartengroesse.

### Mess- und Testsystem - PASS

Keine aktive Messlogik wurde veraendert. `app.js` ist nicht gekoppelt. Das Modul startet keine Tests und veraendert keine Sensoren.

## Freigabestatus

Status: ARCHITECTURE_CANDIDATE
Release: BLOCKED

Naechste Stufe:

- LayoutEditor/WindowFrameModule an die Rastergroessen anbinden.
- Karten beim Ziehen auf 6-Spalten-Raster einrasten lassen.
- Min-/Max-Groesse je Testkarte erzwingen.
- Pflichtkarten beim Verkleinern/Schliessen schuetzen.
