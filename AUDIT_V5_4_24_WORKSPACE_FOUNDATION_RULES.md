# V5.4.24 Workspace Foundation Rules - PASS

PanFrame und WindowFrame wurden als wiederverwendbare Baukasten-Grundlage konsolidiert.

- Beide Module besitzen MODULE_RULES.json in framework und public.
- Beide Module exportieren ihre Regeln zur Laufzeit fuer Studio/TUEV.
- PanFrame-Regeln: Kantenmodus, Mindesthoehe/-breite, Ampelgrenzen, verbotene Messlogik.
- WindowFrame-Regeln: Pflichtfenster, Taskleiste, Mindestgroessen, Standard-Controls.
- Keine Messlogik und kein app.js-Eingriff.

Status: CANDIDATE.
