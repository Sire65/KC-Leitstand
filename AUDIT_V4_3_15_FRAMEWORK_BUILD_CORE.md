# Audit V4.3.18 – FrameworkBuildCore V1.0

- Build-Pipeline: Prüfung → Manifest → Zertifikat → ZIP → automatisches Entpacken → erneute Zertifikatsprüfung.
- Bei Fehler wird das erzeugte Paket gelöscht und nicht freigegeben.
- Candidate und Installationsversion können getrennt oder gemeinsam erzeugt werden.
- Endanwender benötigen kein Python.
- FrameworkLauncher V2 erzeugt Diagnosebericht und Diagnose-ZIP mit Zertifikat, Policy, Manifest und detailliertem Hash-Abgleich.
- Veröffentlichung bleibt bis zur ausdrücklichen Benutzerfreigabe gesperrt.
