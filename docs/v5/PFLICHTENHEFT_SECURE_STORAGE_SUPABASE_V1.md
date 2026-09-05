# Pflichtenheft Secure Storage und Supabase V1

## Lokale Speicherung

- Neue Module speichern ausschliesslich in IndexedDB.
- Nutzdaten werden vor dem Schreiben mit AES-GCM-256 verschluesselt.
- Pro Datensatz wird ein neuer 12-Byte-IV erzeugt.
- Der Standardgeraeteschluessel ist nicht exportierbar.
- Klartextdaten duerfen weder in localStorage noch in IndexedDB liegen.
- Migration: Altwert lesen, verschluesseln, entschluesselt verifizieren und erst
  danach den Altwert loeschen.
- Massenloeschungen alter Speicherwerte sind verboten.

## Schluessel

- Device-Modus eignet sich fuer lokalen Schutz, nicht fuer Geraetewechsel.
- Vor produktivem Cloud-Sync ist ein Passphrase- oder Wrapped-Key-Verfahren mit
  Wiederherstellungsprozess erforderlich.
- Schluessel, Passwoerter und Service-Role-Keys duerfen nie im Quellcode stehen.

## Supabase

- Offline-First; lokale Bedienung funktioniert ohne Cloud.
- Synchronisiert werden nur verschluesselte Payloads und Metadaten.
- Supabase Auth und Row Level Security sind verpflichtend.
- Browser verwendet nur einen Publishable Key.
- Service-Role-Key im Browser ist verboten.
- Benutzer duerfen ausschliesslich eigene Datensaetze lesen und schreiben.
- Konflikte, Loeschungen und Migrationen erhalten Version und Auditdatum.
- Sync bleibt standardmaessig deaktiviert, bis Projekt, Auth, RLS und
  Schluesselwiederherstellung abgenommen sind.
