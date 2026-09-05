# Framework-TÜV Universal V1.0

Der universelle Prüfer akzeptiert einen Projektordner oder eine ZIP-Datei. Er erkennt Projektname, Version und Projekttyp automatisch und erzeugt einen getrennten Prüfbericht sowie ein projektbezogenes Zertifikat.

## Verwendung

- Projekt-ZIP oder Ordner auf `PROJEKT_ZUM_TUEV.cmd` ziehen.
- Oder: `python tools/framework-tuev-universal.py <Quelle>`.

## Prüfungen

- Paket- und Dateistruktur
- JSON-, JavaScript-, CSS- und HTML-Basisprüfung
- lokale HTML-Verweise
- doppelte HTML-IDs
- Sicherheits-Baseline
- vorhandene npm-Prüfskripte
- App-/Public-Abgleich
- projektspezifische Schutzregeln über `tuev/project-policy.json`

## Zertifikatsbindung

Das Zertifikat ist an die SHA-256-Prüfsumme des geprüften Projektbaums gebunden. Änderungen nach der Prüfung machen das Zertifikat ungültig.

## Chat-Entwicklung

Bei jeder im Chat erzeugten Candidate-ZIP wird derselbe universelle Prüfer als Build-Schritt ausgeführt. Das Ergebnis wird in das jeweilige Projektpaket unter `tuev/` übernommen.
