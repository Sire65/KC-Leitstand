# Audit V5.5.9 - Secure IndexedDB and Supabase Foundation

Datum: 2026-07-29  
Status: CANDIDATE / SYNC DISABLED

## Umsetzung

- AES-GCM-256 verschluesselter IndexedDB-Core.
- Nicht exportierbarer Geraeteschluessel als lokaler Candidate-Modus.
- Neuer zufaelliger 12-Byte-IV pro Schreibvorgang.
- Workspace-Layout schreibt nicht mehr in localStorage.
- Einmalige Altwertmigration folgt read-encrypt-verify-delete.
- Supabase-Adapter ist offline-first und standardmaessig deaktiviert.
- Sync verarbeitet nur verschluesselte Records.
- Auth und RLS sind Pflicht; Service-Role im Browser ist verboten.
- RLS-SQL-Vorlage fuer benutzereigene Records erstellt.

## Grenzen

- Geraeteschluessel erlaubt noch keine Entschluesselung auf einem zweiten Geraet.
- Vor echtem Cloud-Sync ist Passphrase- oder Wrapped-Key-Recovery erforderlich.
- Es wurde kein Supabase-Projekt verbunden und kein SQL ausgefuehrt.
- Alte Laufzeitmodule mit localStorage werden erst einzeln migriert.
