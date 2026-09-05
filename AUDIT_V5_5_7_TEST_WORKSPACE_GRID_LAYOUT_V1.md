# Audit V5.5.7 - Test Workspace Grid Layout V1

Datum: 2026-07-29  
Status: PASS MIT AUFLAGEN  
Modus: PREVIEW_ONLY

## Ziel

Die neuen Fachseiten erhalten von Anfang an ein versioniertes, kollisionssicheres
Rasterlayout. Die bestehende Leitstand-Laufzeit und ihre Anzeigen bleiben
unangetasteter Rueckfallstand.

## Architektur

- Eigenstaendiges Modul `shared.test-workspace-layout` V0.1.0.
- Speicherformat `leitstand.testworkspace.layout.v1` mit Schema-Version 1.
- Ausschliesslich logische Koordinaten: column, row, widthUnits, heightUnits.
- Sechs Spalten, 42-Pixel-Zeileneinheit und 10-Pixel-Abstand.
- Keine persistierten Pixelpositionen.
- Ungueltige gespeicherte Daten fallen auf das Standardlayout zurueck.
- Kollisionen und Positionen ausserhalb des Rasters werden abgelehnt.
- Keine seitenuebergreifende Verschiebung.

## Bedienung

- Bearbeitungsmodus getrennt vom normalen Anzeigemodus.
- Verschieben mit Maus/Pointer.
- Verschieben mit Pfeiltasten.
- Rastergroessen S, M, L und XL.
- Sperren und Ausblenden pro Karte.
- Rueckgaengig-Historie mit maximal 40 Zustaenden.
- Speichern, Seite zuruecksetzen und alle neuen Seiten zuruecksetzen.
- Responsive Einspaltenansicht veraendert die gespeicherten Desktop-Koordinaten
  nicht.
- Statusausgaben werden ueber `aria-live` bekanntgegeben.

## Browser-Smoke-Test

- Layoutmodul und Werkzeugleiste geladen: PASS
- Vier Karten des Ueberblicks positioniert: PASS
- Bearbeitungsmodus und vier Kartenwerkzeuge: PASS
- Tastaturverschiebung Router Spalte 4 nach Spalte 5: PASS
- Rueckbewegung nach Spalte 4: PASS
- Kollisionsversuch mit Multi-Ping in Spalte 3 abgelehnt: PASS
- Groessenaenderung: PASS
- Speicherung und Wiederherstellung nach Neuladen: PASS
- Vollstaendiges Zuruecksetzen auf Standard: PASS
- Vorschau geschlossen, bestehendes Dashboard vorhanden: PASS
- JavaScript-Fehler im Browser: 0

## Technische Gates

- JavaScript-Syntax: PASS
- JSON-Parsing: PASS
- App/Public-Modulsynchronitaet: PASS
- Static Check: PASS
- Migration Preflight: PASS
- Release Check: PASS

## Nicht veraendert

- `app.js`
- Probe und lokale Messdienste
- SensorRegistry und Messquellen
- BrainCore und SystemAssessmentCore
- Scheduler-Ausfuehrung
- bestehende Dashboard-Anzeigen und deren gespeicherte Werte

## Auflagen

- Produktive Anzeigen erst nach Einzelzuordnung ihrer Messquelle anbinden.
- Vor Standardumschaltung responsive Screenshot-Pruefung in mehreren
  Zielaufloesungen durchfuehren.
- Freie Groessen ausserhalb S/M/L/XL benoetigen einen separaten Vertrag.
- Stable-, Publish- und Altcode-Loeschfreigabe bleiben blockiert.
