# Pflichtenheft – Registerkarte Eigenlast

Status: Architektur-Kandidat.

Die Registerkarte zeigt browserseitige Eigenlast über Rundinstrumente, Ampeln, Verlaufslinien, Lastsäulen und eine geschätzte Ringverteilung. Diagramme werden ausschließlich bei geöffneter und sichtbarer Registerkarte aktualisiert.

Erfasst werden UI-Lag, Long Tasks, verfügbarer JS-Heap-Schätzwert, eigene Resource-Timing-Deltas, definierte Tests und aktivierte Katalogsensoren. Abtastung erfolgt höchstens alle fünf Sekunden, verschlüsselte Verdichtung höchstens alle 30 Sekunden und maximal 360 Punkte.

Exakte Prozess-CPU, Prozess-RAM, GPU und Energie dürfen erst nach Anbindung des lokalen Prüfdienstes ausgewiesen werden. Schätzwerte sind sichtbar als solche zu kennzeichnen.
