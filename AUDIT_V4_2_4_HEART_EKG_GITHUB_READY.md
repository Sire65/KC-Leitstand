# Audit V4.2.4 – Herz/EKG, Büromodus-Rückkehr und GitHub-Readiness

## Schutzumfang
Der PowerShell-Prüfdienst sowie bestehende Netzwerk-, Fritz!Box-, WLAN-, DOCSIS- und Systemmessverfahren wurden nicht geändert.

## Korrekturen
1. `backToOffice` wird nach jeder Auswahl im Büromodus sichtbar und trägt eindeutig die Beschriftung „Zurück ins Büro“.
2. `dedupeDisplaySwitches()` entfernt Doppelinstanzen in Instrument- und Cockpitanzeigen.
3. Herzform wird konfliktfrei über eine symmetrische Polygonkontur dargestellt.
4. Das EKG berechnet den zeitlichen Abstand vollständiger P-QRS-T-Komplexe direkt aus `60000 / BPM`.
5. Bei gestoppten Messungen wird ausschließlich eine Nulllinie gezeichnet.

## GitHub
- Pages-Workflow vorhanden.
- Validierungsworkflow ergänzt.
- Release-Checkliste und lokaler Release-Check ergänzt.
- Veröffentlichung bleibt gesperrt, bis Hans ausdrücklich freigibt.
