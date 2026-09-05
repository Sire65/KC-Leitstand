# Audit V4.2.5

## Fehlerursache
Das Herz wurde per CSS-Animation, das EKG per JavaScript gesteuert. Dadurch bestand keine garantierte Synchronisation; globale Animationsregeln konnten nur das Herz anhalten.

## Korrektur
Beide Darstellungen werden nun aus derselben BPM- und Phasenberechnung im `requestAnimationFrame` gesteuert.

## GitHub Pages
`public/index.html` ist eigenstaendig lauffaehig. Assets, Konfiguration und Framework-Shell-Runtime liegen innerhalb von `public`. Der Workflow deployt ausschließlich diesen Ordner.
