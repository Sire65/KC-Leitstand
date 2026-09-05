# Pflichtenheft – Gehirn, Steuerzentrale, Problemwissen und Maßnahmen

Status: Architektur-Kandidat. Keine Freigabe für reale Aktorsteuerung.

## Ziel

Die Steuerzentrale übernimmt Bewertungen ausschließlich vom `SystemAssessmentCore`, ordnet bekannte Probleme einem versionierten Runbook zu und schreibt Erkennung, Entscheidung, Maßnahme und Ergebnis live in den Überwachungsmonitor.

## Muss-Regeln

- Ereignisgesteuert arbeiten; kein zusätzliches Polling.
- Bekannte Probleme nach Kategorie, Schwelle, Schweregrad und Runbook führen.
- Messwert, Datenquelle, Entscheidung, Policy und Verifikation nachvollziehbar protokollieren.
- Protokoll und Lernergebnisse verschlüsselt in IndexedDB speichern.
- KI darf recherchieren, erklären, priorisieren und Pakete vorschlagen. Sie darf keine Policy umgehen.
- Externe oder physische Änderungen benötigen CapabilityCore, Gerätefreigabe, Grenzwerte, Benutzerfreigabe, Rücknahme und Nachprüfung.
- Lüfterprofile, Router-Neustarts und vergleichbare Eingriffe bleiben bis zur gesonderten Prüfung `ACTUATOR_BLOCKED`.
- Bestehende Brain-Aktionen werden in dieser Stufe nur beobachtet und protokolliert.

## Abnahme

Statische Prüfung, Browser-Smoke-Test, Migrationsprüfung, Release-Prüfung und interne Studio-/TÜV-Kandidatenprüfung müssen erfolgreich sein. Eine externe TÜV-Freigabe wird nicht behauptet.
