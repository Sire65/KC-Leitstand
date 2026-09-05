# Framework Studio / TUEV Audit - V5.4.12 TestOwnershipMatrix + WorkspacePages

Projekt: Netzwerk-Leitstand
Module: shared.test-ownership-matrix V0.1.0, shared.workspace-pages V0.1.0, shared.test-catalog V0.5.0
Pruefung: Fachliche Testzuordnung und Seitenmodell vor Layout-Editor-Anbindung
Ergebnis: PASS MIT AUFLAGEN

## Ziel

Spezifische Tests sollen nicht fachlich vermischt werden. Internet-Tests gehoeren nicht auf FRITZ!Box-, PC- oder Drucker-Seiten. FRITZ!Box-, PC-, Drucker- und Geraetetests bleiben in ihren Bereichen.

## Grundregeln

- Jeder Detailtest hat genau einen fachlichen Besitzerbereich.
- Der Ueberblick darf nur Kurzstatus/Summary anzeigen.
- Die globale Kopfzeile darf Gesamtstatus, Ampeln und Warnungen zeigen, aber keine Detailtabellen oder Detaildiagramme duplizieren.
- Detailkarten duerfen nur auf der passenden Fachseite liegen.
- Cross-Area-Anzeigen sind nur als Summary erlaubt.

## Seitenmodell V0.1

- Seite 1 - Ueberblick: globale Kurzlage, Pflichtstatus, keine Detailduplikate
- Seite 2 - Internet: Ping, IPv4/IPv6, DNS, TCP, Loss/Jitter, Route, Streaming, Bufferbloat
- Seite 3 - FRITZ!Box / Kabel: Router, WAN, DOCSIS, spaeter WLAN/Mesh
- Seite 4 - PC / System: PC, Speicher, SMART, Browser, Dienste
- Seite 5 - Geraete: Drucker, NAS, Multimedia, Clients, Geraetematrix
- Seite 6 - Protokoll: Ereignisse, Historie, Ursachen, Berichte

## Architekturabgleich

### NavigationCore - PASS

Das Seitenmodell definiert Arbeitsseiten, veraendert aber keine aktive Navigation und startet keine Routenwechsel.

### WindowCore / LayoutEditor - PASS MIT AUFLAGE

Die Regeln sind vorbereitet. Der aktive Layout-Editor erzwingt sie noch nicht. Naechste Stufe: Layout-Editor darf Karten nur nach OwnershipMatrix und WorkspacePages platzieren.

### SettingsCore - PASS MIT AUFLAGE

V0.1 ist statisch. Spaeter muessen Benutzerzuordnungen fuer Seite 1, Seite 2 usw. in SettingsCore/ProfileStorage gespeichert werden.

### CapabilityCore / SecurityCore - PASS MIT AUFLAGE

Aendern der Seitenmatrix muss spaeter rechtegesteuert werden. Normale Benutzer duerfen Layout waehlen, aber fachliche Sicherheitsregeln nicht brechen.

### Mess- und Testsystem - PASS

Keine aktive Messlogik wurde veraendert. `app.js` ist nicht gekoppelt. Die Module sind reine Regel- und Darstellungsgrundlagen.

## Gegenpruefung

Validierung: Detailtests liegen in ihren Fachseiten. Ueberblick bleibt Summary. Keine Cross-Area-Detailduplikate.

## Freigabestatus

Status: ARCHITECTURE_CANDIDATE
Release: BLOCKED

Naechste Stufe:

- Einstellungen-Matrix vorbereiten: welche Tests auf Seite 1, 2, 3 usw. sichtbar sind.
- LayoutEditor/WindowFrameModule an Seiten und Ownership-Regeln anbinden.
- GlobalHeaderStrip als separate Summary-Zeile definieren.
