# Audit V4.3.11 – TÜV-Härtung und Abschluss-Regression

## Anlass
Der Negativtest der V4.3.8 zeigte, dass eine absichtlich zurückgesetzte Shell-Version vom Candidate-TÜV nicht erkannt wurde.

## Änderung
- Verbindliche Versionskonsistenzprüfung über Package, Projektregister, Shell-JSON, Shell-Konfiguration, Framework-Runtime, Navigation-Adapter und SHA-256-Manifest.
- Negativtest muss Versionsdrift als Blocker erkennen.
- Keine funktionale Änderung an Messdienst, Sensoren oder Bedienoberfläche.

## Freigaberegel
Candidate bleibt TEST_ONLY. Stable benötigt weiterhin Ziel-PC-, Prüfdienst- und Router-Livenachweise.

## Abschlussprüfung
- Interner Candidate-TÜV: PASS, 0 Blocker, 0 Warnungen.
- Universeller TÜV auf Ordner: PASS.
- Externe Node.js-Syntaxprüfung: PASS.
- JSON-Prüfung: PASS (77 Dateien).
- Negativtests: 4/4 PASS; alle absichtlichen Fehler wurden blockiert.
- Chromium-Smoke-Test konnte in der isolierten Linux-Umgebung wegen gesperrter Systemressourcen nicht belastbar ausgeführt werden. Dieser Punkt bleibt Teil des Ziel-PC-/Stable-Gates.

## Ergebnis
V4.3.11 hat den Candidate-TÜV bestanden. Keine Stable- oder Veröffentlichungsfreigabe ohne Ziel-PC-, Prüfdienst- und FRITZ!Box-Livetest.
