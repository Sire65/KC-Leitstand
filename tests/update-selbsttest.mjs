/* Selbsttest des Aktualisierungshinweises
 *   node tests/update-selbsttest.mjs
 *
 * Geprueft wird der Fassungsvergleich - die eine Stelle, an der ein Fehler
 * still bleibt und trotzdem teuer ist: vergleicht er falsch, meldet der
 * Leitstand entweder eine Aktualisierung, die es nicht gibt, oder verschweigt
 * eine, die es gibt.
 *
 * Der Vergleich wird aus der ausgelieferten Datei geladen statt hier
 * nachgebaut. Eine Kopie im Test wuerde die Kopie pruefen, nicht das
 * Programm.
 */
import { readFileSync } from 'node:fs';

const WURZEL = new URL('..', import.meta.url).pathname;
const quelle = readFileSync(WURZEL + 'app/update.js', 'utf8');

const anfang = quelle.indexOf('function zerlegen');
const ende = quelle.indexOf('/* --------------------------------------------------- Spaeter merken */');
if (anfang < 0 || ende < 0 || ende <= anfang) {
  console.error('FEHLER: Der Abschnitt mit dem Fassungsvergleich wurde in app/update.js nicht gefunden.');
  process.exit(1);
}
const neuer = new Function(`${quelle.slice(anfang, ende)}; return neuer;`)();

const faelle = [
  ['5.4.3', '5.4.2', true, 'hoehere Fehlerbehebung ist neuer'],
  ['5.4.2', '5.4.3', false, 'niedrigere ist nicht neuer'],
  ['5.4.2', '5.4.2', false, 'gleiche Fassung ist keine Aktualisierung'],
  ['5.10.0', '5.9.0', true, 'zehn ist mehr als neun'],
  ['5.5.0', '5.4.99', true, 'Nebenfassung sticht'],
  ['6.0.0', '5.99.99', true, 'Hauptfassung sticht'],
  ['5.5.0', '5.5.0-rc.1', true, 'fertige Fassung ist neuer als ihre Vorabfassung'],
  ['5.5.0-rc.1', '5.5.0', false, 'Vorabfassung ist nicht neuer als die fertige'],
  ['5.5.0-rc.10', '5.5.0-rc.9', true, 'Vorabfassung 10 ist neuer als 9'],
  ['5.4', '5.4.1', false, 'fehlende Stelle zaehlt als null'],
];

let fehler = 0;
for (const [a, b, erwartet, text] of faelle) {
  const ist = neuer(a, b);
  const ok = ist === erwartet;
  if (!ok) fehler++;
  console.log((ok ? '  ok   ' : 'FEHLER ') + `${text} (${a} / ${b}) -> ${ist}`);
}

// Der Zeitbalken darf nichts behaupten, was nicht kommt.
const zusagen = [
  [/location\.replace/.test(quelle), 'am Ende des Zeitbalkens wird tatsaechlich neu geladen'],
  [/Math\.ceil\(\(dauer - vergangen\)/.test(quelle), 'der Balken zeigt echte Restzeit'],
  [/location\.protocol === 'file:'/.test(quelle), 'oertliche Installation wird gesondert behandelt'],
  [/spaeterGemerkt/.test(quelle), 'abgelehnter Stand fragt nicht bei jedem Start erneut'],
  [/t\.spaeter\.hidden = !!verbindlich/.test(quelle), 'verbindliche Fassung kennt kein Spaeter'],
  [/NETZWERK_LEITSTAND_SHELL/.test(quelle), 'laufende Fassung kommt aus der Shell-Konfiguration'],
  [!/eval\s*\(/.test(quelle), 'kein eval im ausgelieferten Modul'],
];
for (const [ok, text] of zusagen) {
  if (!ok) fehler++;
  console.log((ok ? '  ok   ' : 'FEHLER ') + text);
}

if (fehler) { console.error(`\nUpdate-Selbsttest fehlgeschlagen: ${fehler} Beanstandungen.`); process.exit(1); }
console.log('\nUpdate-Selbsttest bestanden.');
