# Pflichtenheft DesignCore-Testkarten V1

## Ziel

Neue Testkarten erhalten eine zentral kontrollierte, semantische Umgebung. Farbe
zeigt Messzustand oder getrennten Benutzerfokus, niemals beides vermischt.

## Regeln

- Messzustand: normal, warning, elevated, critical, information, unknown, disabled.
- Benutzerfokus: none, watch, important, pinned.
- Kritisches Rot ist keine frei waehlbare Dekorationsfarbe.
- Fokus darf Messzustand und Alarmprioritaet nicht ueberschreiben.
- Farbe wird immer durch Text, Symbol oder Statusbezeichnung ergaenzt.
- Gespeichert werden Tokens, keine Hex-Farben.
- DesignCore registriert das Basisthema und prueft Kontrastvorgaben.
- Effekte: none, border, status-strip oder soft-halo.
- Gruen besitzt keine Daueranimation.
- Unsichtbare und minimierte Karten animieren nicht.
- `prefers-reduced-motion` schaltet Bewegungsanimationen ab.
- Der Seitenakzent folgt dem hoechsten sichtbaren Messstatus, nicht dem Fokus.

## Candidate-Grenze

Die erste Baustufe gestaltet nur neue Testkarten. Bestehende Dashboardfarben und
Messlogik bleiben unveraendert.
