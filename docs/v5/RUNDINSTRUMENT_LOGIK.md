# Rundinstrument-Logik V5

## Einheitliche Anzeige
DisplayedPercent = NeedlePercent = ColorPercent = StatusPercent.

## Gesundheitswert Internet
Gewichtungsvorschlag:
- Erreichbarkeit 30 %
- Paketverlust 25 %
- DNS 15 %
- Ping 15 %
- Jitter 15 %

## Gesundheitswert Router
- Erreichbarkeit 45 %
- WAN-Zustand 25 %
- Neustart-/Fehlerstatus 15 %
- Ressourcen/Temperatur, falls verfügbar 15 %
Nicht unterstützte Teilwerte werden neutral aus der Gewichtung entfernt, nicht als Fehler gewertet.

## Gesundheitswert PC
- CPU 25 %
- RAM 25 %
- Datenträger 20 %
- UI-Lag 20 %
- Netzwerkadapter 10 %

## Verbindungsstabilität
- Paketverlust 40 %
- Jitter 25 %
- Ping/P95 20 %
- Abbruchrate 15 %

## Sonderzustände
- Keine Daten: grau, kein Prozentwert, Text „Noch keine Messung“
- Nicht unterstützt: grau, Text „Nicht verfügbar“
- Test läuft: blau, letzter gültiger Wert bleibt sichtbar
- Vollständig normal: exakt 100 %, Zeiger exakt 100
