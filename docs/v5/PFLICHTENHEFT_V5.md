# Pflichtenheft Netzwerk-Leitstand V5

## P-01 Hauptübersicht
Die bestehende Hauptübersicht bleibt visuell und funktional stabil. Neue Detailwerte erscheinen in Fachregistern.

## P-02 Rundinstrumente
Die vier großen Instrumente zeigen ausschließlich Gesundheitswerte von 0 bis 100 Prozent. Mittelwert, Zeiger, Farbe und Status müssen immer denselben Wert repräsentieren.

### Instrumente
- Internetgesundheit
- Routergesundheit
- PC-Gesundheit
- Verbindungsstabilität

### Ampelbereiche
- 90–100: Grün / normal
- 75–89: Hellgrün / geringe Abweichung
- 60–74: Gelb / beobachten
- 40–59: Orange / deutliche Störung
- 0–39: Rot / kritisch

## P-03 Rohwerte
Ping, Jitter, Paketverlust, DNS-Zeit und Durchsatz bleiben Rohwerte mit Einheit. Sie werden getrennt vom Gesundheitswert dargestellt.

## P-04 Erklärbarkeit
Jeder Prozentwert besitzt die Aktion „Warum dieser Wert?“. Die Teilkomponenten und ihre Gewichtung werden angezeigt.

## P-05 Sensorvertrag
Pflichtfelder: id, name, register, category, source, rawUnit, healthRule, thresholds, intervalClass, loadClass, history, tooltip, explanation, alarmPolicy, supportState.

## P-06 Lastklassen
- L0 passiv
- L1 sehr leicht
- L2 leicht
- L3 mittel
- L4 intensiv
- L5 forensisch

L4/L5 dürfen nicht permanent laufen.

## P-07 Animationen
Animationen sind bedeutungstragend und zentral abschaltbar. Bei AUS stoppen EKG, Herz, Sanduhr, LEDs, Zeigerübergänge, Scan- und Balkeneffekte vollständig.

## P-08 Alarm
Akustische Alarmierung ist standardmäßig AUS. Sie benötigt Benutzerfreigabe, Quittierung, Wiederholungsgrenze, Ruhezeit und Alarmprotokoll.

## P-09 GitHub-Start
Die statische Oberfläche muss ohne PowerShell über GitHub Pages oder einen lokalen Webserver starten. Lokale System- und Routerdaten benötigen einen optionalen Prüfdienst.

## P-10 Freigabe
Kein Release ohne Architektur-, Dashboard-, Sensor-, Performance-, Bedienungs- und Framework-TÜV.
