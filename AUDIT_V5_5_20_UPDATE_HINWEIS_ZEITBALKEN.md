# Audit V5.5.20 – Aktualisierungshinweis mit Zeitbalken

Datum: 2026-09-05

Der Leitstand hatte bisher keine Aktualisierungsfunktion. Wer eine ältere
Fassung im Browser stehen hatte, bekam davon nichts mit. Das ist jetzt anders:
beim Programmstart sieht der Leitstand einmal nach, ob eine neuere Fassung
bereitliegt, und fragt dann – Ja oder Später.

Der Leitstand kennt keine Anmeldung. Der Moment, in dem nachweislich jemand
davor sitzt, ist der Programmstart, derselbe Moment, in dem die Begrüßung
erscheint. Gefragt wird einmal je Browsersitzung; ein Registerwechsel ist kein
neuer Start. Zusätzlich fragt die Versionsanzeige in der Statusleiste auf Klick
nach – das ist die Stelle, an der ohnehin nachgesehen wird, welche Fassung
läuft.

## Was bewusst so und nicht anders ist

**Der Zeitbalken zeigt echte Restzeit.** Er zählt die Sekunden herunter, die im
Versionsverzeichnis als `installSekunden` stehen, und danach wird tatsächlich
neu geladen. Vorher wird der Zwischenspeicher geräumt, sonst startet der
Browser womöglich wieder in die alte Fassung. Eine Fortschrittsanzeige, hinter
der kein Vorgang steht, wäre eine Behauptung und keine Anzeige.

**Auf einer örtlichen Installation gibt es keinen Balken.** Unter `file://`
bringt Neuladen keine neue Fassung – dort kommt sie über das
Installationspaket. Der Hinweis sagt dann genau das und zeigt keinen Balken,
der nichts bewirkt.

**Ein nicht erreichbares Versionsverzeichnis gilt nicht als „aktuell“.** Es
wird still übergangen, wenn die Prüfung von selbst lief, und benannt, wenn
jemand ausdrücklich nachgesehen hat. Unbekannt ist nicht in Ordnung.

**Später wird gemerkt, aber nicht ewig.** Zwölf Stunden für genau die
abgelehnte Fassung. Erscheint eine neuere, fragt sie sofort wieder. Trägt das
Versionsverzeichnis `"verbindlich": true`, gibt es keinen Später-Knopf.

## Keine zweite Versionsquelle

Die laufende Fassung kommt aus `window.NETZWERK_LEITSTAND_SHELL.version` –
derselben Quelle, aus der Statusleiste und Fenstertitel ihre Angabe nehmen. Es
wurde keine zweite Versionskonstante eingeführt, die auseinanderlaufen könnte.

## Geänderte und neue Dateien

| Datei | Zweck |
|---|---|
| `app/update.js`, `public/update.js` | Der Hinweis selbst. Byteweise identisch. |
| `app/releases/latest.json`, `public/releases/latest.json` | Versionsverzeichnis. Byteweise identisch. |
| `app/index.html`, `public/index.html` | Ein zusätzlicher `<script src="update.js">`. |
| `tools/release-check.py` | Prüft die Gleichheit beider Stände und die Fassung im Verzeichnis. |
| `tests/update-selbsttest.mjs` | Prüft den Fassungsvergleich an der ausgelieferten Datei. |
| `.github/workflows/validate.yml` | Führt Syntaxprüfung und Selbsttest aus. |
| `PROJECT_REGISTER.json` | Eintrag `updateNotice` mit dem verbindlichen Vertrag. |

`app/app.js` wurde nicht angefasst. Die Shell-Laufzeit wurde nicht angefasst.
Der Hinweis baut seine Oberfläche selbst auf und verschwindet spurlos, wenn die
Datei entfernt wird – der Rückfall ist das Löschen einer Datei und einer Zeile.

## Prüfungen

```
python tools/release-check.py
python tools/migration-preflight.py
node tests/update-selbsttest.mjs
python tools/framework-tuev.py release --level CANDIDATE
python tools/framework-tuev.py verify
```
