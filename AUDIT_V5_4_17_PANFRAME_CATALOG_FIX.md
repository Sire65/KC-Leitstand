# V5.4.17 PanFrame + Testkatalog Fix - PASS

Korrektur fuer sichtbares Testkatalog-Schliesskreuz und Mouse-over-Schieberahmen im echten Hauptfenster.

- Testkatalog-Schliessen bekommt finalen z-index, Position und sichtbaren Buttonstil.
- PanFrame bleibt als unsichtbare Hover-Zone aktiv und blendet Linie, Pfeile, Griff und Pixelanzeige bei Mouse-over ein.
- PanFrame wird nicht mehr wegen fehlendem/kleinem Scroll-Maximum komplett versteckt.
- Alte dauerhafte EdgeControls bleiben visuell abgeschaltet.
- Keine Messlogik und kein app.js-Eingriff.

Status: CANDIDATE.
