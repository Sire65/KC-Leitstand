# Netzwerk-Leitstand V4.0.10 Runtime-Fix Audit

## Status

YELLOW-CANDIDATE. Static checks passed; real browser/runtime test remains open.

## Findings in V4.0.9

- Status LEDs used `S.data`, but polling stores current measurements in `S.latest.snapshot`.
- Polling was hard-coded with `setInterval(poll,15000)` and ignored the configured interval.
- `PROJECT_REGISTER.json` still reported version `4.0.0`.

## Changes in V4.0.10

- LED source changed to `S.latest?.snapshot`.
- Polling timer now uses `S.settings.interval` with a minimum of 5 seconds.
- Saving settings restarts the polling timer.
- Project register updated to version `4.0.10`.
- README and QA metadata updated.

## Unchanged

- `probe/Netzwerk_Pruefdienst_V4.ps1` was not changed.
- Framework core files were not changed.
- Navigation, layout and measurement algorithms were not redesigned.

## Open Gate

- Browser runtime verification with active local probe on `http://127.0.0.1:8765/`.
