# Pflichtenheft Testverwaltung, Audio und Kartenfunktionen V1

Status: ARCHITECTURE_CANDIDATE / CONFIGURATION_ONLY

## Muss

- Tests werden nach Fachbereich, Kategorie und Unterkategorie verwaltet.
- Suche und kombinierbare Filter verhindern unuebersichtliche 1000er-Listen.
- Tabellenoperationen verwenden ausschliesslich TableCore.
- Jeder Test besitzt den gemeinsamen Kartenvertrag fuer Power, Einklappen,
  Minimieren und Sperren.
- Audio ist opt-in. Ohne gueltigen Audiovertrag erscheint kein Lautsprecher.
- Audiovertraege definieren Ton-ID, Betriebsart und Standardlautstaerke 1 bis 10.
- Lautstaerke ist ganzzahlig und rastet in zehn sichtbaren Stufen.
- Konfigurationsansichten starten keine Messung und veraendern keine Sensoren.
- Fehlende oder ungueltige Definitionen werden markiert, nicht erfunden.
- Massenbearbeitung benoetigt spaeter eine explizite Bestaetigung und Auditspur.

## Skalierung

- Kategorien werden vor der Testtabelle dargestellt.
- Standardansicht zeigt hoechstens 100 Ergebniszeilen.
- Suche umfasst ID, Titel, Beschreibung, Bereich und Kategorie.
- Filter: Bereich, Kategorie, Zustand, Audio, Ausfuehrungsklasse und TUEV-Status.
- Gespeicherte Ansichten und Virtualisierung sind vor produktiven 1000+ Tests
  verpflichtend.

## Nicht Bestandteil

- produktives Ein-/Ausschalten
- automatische Alarmwiedergabe
- veraendernde Massenoperationen
- Mess-, Probe-, Sensor- oder Scheduler-Ausfuehrung
