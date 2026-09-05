# Audit V5.5.15 – Device Discovery Domain Isolation Candidate

Datum: 2026-07-29

Start- und manuelle Geräteerkennung wurden als additive, nicht blockierende Kandidatenschicht ergänzt. Fünf Domänen werden unabhängig mit Zeitgrenze und `Promise.allSettled` bewertet.

Ein fehlender Router oder eine fehlerhafte Interneterkennung beeinflusst weder PC- noch Speichererkennung. Ergebnisse und Paketvorschläge werden verschlüsselt gespeichert. Vorschläge sind nicht aktiv und benötigen Bestätigung; bestehende Messlogik wurde nicht verändert.
