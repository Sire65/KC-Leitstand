# AUDIT V5.4.4 - Accessory Integration

Ziel: Die Baukastenmodule `shared.health-ring` und `shared.latency-ball` werden im Netzwerk-Leitstand als Zubehoer eingebaut, bleiben aber eigenstaendige Shared Modules.

## Ergebnis

- HealthRing-Zubehoer ist als verschiebbares Testfeld `data-layout-id="healthRing"` eingebaut.
- LatencyBall-Zubehoer ist als verschiebbares Testfeld `data-layout-id="latencyBall"` eingebaut.
- Beide Zubehoerfelder sind im Layout-Editor sichtbar, verschiebbar, skalierbar, sperrbar und ausblendbar.
- Beide Zubehoer koennen in den Einstellungen getrennt ein- oder ausgeschaltet werden.
- Die Leitstand-App fuettert die Module ueber Messereignisse; die Module selbst starten keine Tests.
- `app` und `public` wurden synchron gehalten.

## Architekturgrenze

Der Leitstand ist Konsument. Die Baukastenmodule bleiben in `framework/shared` und enthalten keine Leitstand-spezifische Diagnose- oder BrainCore-Logik.

## Offene Gates

- Browser-Smoke-Test auf Ziel-PC.
- Framework-TUEV mit Screenshot-/Layout-Pruefung.
- Spaeterer Migrationstest in einem zweiten Programm.
