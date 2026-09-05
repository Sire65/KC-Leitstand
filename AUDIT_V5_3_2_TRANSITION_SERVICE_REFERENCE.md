# Audit V5.4.0 – Shared Transition Service Reference

## Scope
Nur StatusCore 3D wurde als erster Referenz-Consumer migriert.

## Architekturentscheidung
- Klasse: SHARED_MODULE
- ID: shared.transition-service
- Version: 0.1.0
- Status: ARCHITECTURE_CANDIDATE
- Release: blockiert
- Kein Eintrag als Framework-Core.

## Verhalten
- Ein gemeinsamer requestAnimationFrame-Scheduler.
- Schnelle Zielwechsel laufen vom aktuell sichtbaren Zwischenwert weiter.
- Animation AUS setzt alle Übergänge unmittelbar auf den Zielzustand.
- Reduced Motion beendet starke Bewegungsübergänge unmittelbar.
- Fachlicher Alarmstatus bleibt sofort wirksam; nur die visuelle Intensität wird interpoliert.

## Rollback
StatusCore besitzt weiterhin den direkten statischen Darstellungsweg, falls der Dienst fehlt.

## Offene Gates
- echter Zielbrowser-Performance- und Leaktest
- weitere Consumer nur nach Einzelmigration
- zweite unabhängige Anwendung vor Core-Neuantrag
