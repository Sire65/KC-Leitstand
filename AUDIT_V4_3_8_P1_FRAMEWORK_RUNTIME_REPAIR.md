# Audit V4.3.8 – P1 Framework-Runtime-Reparatur

## Auftrag
Bestätigte Release-Blocker aus dem TÜV der V4.3.7 gezielt beheben, ohne Funktionsumbau des Netzwerk-Leitstands.

## Behobene Blocker
- Versionsstand in Package, Projektregister, Shell-Konfiguration und Shell-Runtime auf 4.3.8 vereinheitlicht.
- Alle im Projektregister genannten allgemeinen Cores werden im Browser-Startpfad geladen.
- CoreRuntime validiert und aktiviert FrameworkCore, CapabilityCore, InteractionCore, TableCore, NavigationCore, WindowCore, DesignCore und MobileCore.
- Für jeden aktiven Core ist ein konkreter Leitstand-Consumer registriert.
- NavigationCore besitzt einen realen Adapter zum bestehenden Navigation-Master; die Ownership ist damit zentral nachweisbar.
- Python-Cachedateien sind aus Zertifikats- und Baumhashbildung ausgeschlossen.
- App/Public-Prüfung akzeptiert ausschließlich die notwendige Deployment-Pfadabweichung.
- Framework-TÜV prüft nun reale Core-Ladung, Aktivierung und Consumer-Bindung.
- SHA-256-Manifest wurde für V4.3.8 neu erstellt.

## Prüfresultat
- Release-Check: PASS
- Migrations-Preflight: PASS
- Framework-TÜV Quick Candidate: PASS
- Framework-TÜV Release Candidate: PASS
- Zertifikatsprüfung: PASS
- Universeller Framework-TÜV: PASS; ein nicht-blockierender Linux-Hinweis wegen fehlender PowerShell.

## Freigabestatus
CANDIDATE / TEST_ONLY. Veröffentlichung bleibt gemäß Projektgrundsatz bis zur ausdrücklichen Freigabe durch Hans gesperrt.
