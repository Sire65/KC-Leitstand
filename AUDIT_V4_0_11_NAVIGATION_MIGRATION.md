# Netzwerk-Leitstand V4.0.11 Navigation Migration Audit

## Status

YELLOW-CANDIDATE. Static migration checks passed; real browser/runtime test remains open.

## Migration

- Added `app/assets/css/navigationcore-master.css`.
- Added `app/assets/js/navigationcore-master.js`.
- Replaced the local Netzwerk sidebar with a NavigationCore-compatible shell.
- Kept network-specific entries as adapter data.
- Preserved Fachlogik, polling, probe and measurement algorithms.

## Navigation Functions

- Five top buttons in the required order: menu, pin, rest mode, recent, menu groups.
- Full, compact and quick width states.
- Resize rail with pixel badge at the rail/pointer area.
- Width lock.
- Pin and auto-hover behavior.
- Recent navigation panel.
- Context chips.
- Admin info with `Auto: aus` and `Buero`.
- Rest mode closes floating menus and windows and shows a clean work area.

## Open Gate

- Browser runtime test with active local probe remains open because local `file:///` browser opening may be blocked by the Codex browser policy.
