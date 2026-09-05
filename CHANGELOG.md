# V5.5.20
- Aktualisierungshinweis beim Programmstart: Ja oder Später, mit Zeitbalken.
- Der Balken zählt echte Restzeit und lädt danach tatsächlich neu; vorher wird der Zwischenspeicher geräumt.
- Eine abgelehnte Fassung fragt zwölf Stunden nicht wieder, eine verbindliche kennt kein Später.
- Örtliche Installationen (file://) bekommen den Hinweis auf das Installationspaket statt eines Balkens.
- Die laufende Fassung kommt aus der Shell-Konfiguration; es gibt keine zweite Versionskonstante.

# V5.4.0
- Shared Transition Service V0.1.0 als Architecture Candidate registriert.
- StatusCore 3D als erster Referenz-Consumer migriert.
- Fließende Farb-, Puls-, Rotations- und Intensitätsübergänge mit Retargeting vom sichtbaren Zwischenwert.
- Rollback- und Reduced-Motion-Verträge ergänzt.

# Changelog

## 5.4.0 - BrainCore Organic Animation Correction
- Smooth breathing energy core, no heart-like beat.
- Independent irregular rod strobes.
- State-dependent neural lightning.
- Depth-correct sphere/rod rendering.
- Full cube visibility corrected.


- Brain Action Coordination: Der Gehirnmonitor zeigt erstmals Beobachtung, Entscheidung, Massnahme, Wirkungskontrolle und Ergebnis.
- Sichere interne Massnahmen fuer Kontrolldichte, Hintergrundlast, Selbstschutz und Speicherpflege.
- Entwarnung normalisiert Herzfrequenz und Messzyklus nachvollziehbar.

# V5.4.0
- Neural Coordination: Gedankenstroeme, koordinierter Puls/Zeitgeber und erweiterter Selbstschutz.

# V5.1.0
- Digitaler Organismus: BrainCoordinator, Aktivitaetsmonitor, Aufmerksamkeit und Selbstschutz.
- Herzaktivitaet wird an reale Gehirnaktivitaet gekoppelt.
- StatusCore 3D bleibt das zentrale Gehirn.

## 5.0.2
- Gehirn kompakter, Statuslogik gruen/gelb/rot korrigiert und separater Gehirn-Schalter ergänzt.

# V4.3.28 - UI-Rand, LED-Lesbarkeit und echte Trendlinie

- rechter Rand nachgeschaerft
- LED-Texte entkoppelt und Kartenhoehen vereinheitlicht
- echte lineare Trendlinie und sichtbare Fehlerspitzen

# V4.3.28 - Warnhistorie und akustischer Alarm

- Kompakte Gelb/Rot-Historie mit Zeitraumauswahl und Hover.
- Symmetrischer Rahmen fuer Sanduhr und Fortschrittsbalken.
- AlertSoundService mit Einstellungen und Testton; standardmaessig aus.
- Keine Aenderung der Mess- oder Routerlogik.

# V4.3.28 - Bedienzeile, Live-Hoehe, Letzter Schritt und Routererkennung

- + / - / LOCK neben Assistent starten.
- Register-Hilfetext entfernt.
- LED-Beschriftungen und letzte Messzeile voll sichtbar.
- Letzter Schritt sofort zeitlich belegt.
- Routererkennung robuster und fehlertoleranter.

# V4.3.24 - LED-Block, Internet-Detail und Kontextnavigation

- Separate obere LED-Reihe in den LED-Block rechts neben Herz/EKG integriert, ohne doppelte Statusanzeigen.
- IPv4-/IPv6-/Zielblock rechts neben die vier Rundinstrumente gesetzt.
- Kontext-Chips reagieren jetzt auf Klick und oeffnen vorhandene Zielbereiche.
- Tooltip-/Info-Ueberlagerung abgesichert.
- Routererkennung nur geprueft und dokumentiert; keine Aenderung der Routerlogik.

# V4.3.23 - Laufender Messbereich kompakt

- Sanduhr, Fortschritt, Herz/EKG und 2x4-LED-Block symmetrisch angeordnet.
- Uhrzeitfeld belegt.
- Layout-Shift durch laufende Operationsliste beseitigt.
- Keine weiteren Bereiche geaendert.

# V4.3.23 - Installer Encoding/Parser Repair

- PowerShell-5.1-safe ASCII installer.
- Graphical drive/folder selection retained.
- Unicode mojibake and parser break removed.
- Installer parser gate documented.

# V4.3.23 – Grafischer Installer und PowerShell-5.1-Kompatibilität

- Echter grafischer Installationsdialog mit klickbarer Laufwerks- und Ordnerstruktur.
- Keine DOS-Laufwerksauswahl und keine manuelle Pfadeingabe im Normalfall.
- Sichtbarer echter Fortschritt bei Zertifikatsprüfung, Kopieren und Gegenprüfung.
- Verzeichnisanlage über .NET statt inkompatiblem `New-Item -LiteralPath`.
- Vollständig kompatibel mit Windows PowerShell 5.1.

## V4.3.23
- FrameworkBuildCore mit Build-Gates und ZIP-Gegenprüfung.
- Diagnose-ZIP mit konkretem SHA-256-Abgleich.
- Automatische Candidate- und Installationspakete.

# V4.3.23
- Wirksame Einstellungsschalter, Expertenmodus und Protokollverwaltung mit Lösch- und Begrenzungsfunktionen.

## V4.3.23 – Schutz vor Direktstart aus ZIP/WinRAR

- erkennt typische WinRAR-, 7-Zip- und Windows-Temp-Pfade vor dem PowerShell-Aufruf
- prüft zentrale Pflichtdateien, bevor Zertifikat oder Prüfdienst gestartet werden
- zeigt einen klaren Hinweis: ZIP vollständig entpacken und aus einem normalen Ordner starten
- schützt Start, TÜV-Zertifikatsprüfung und Installation
- verhindert irreführende Meldungen über fehlende oder ungültige Zertifikate bei Archiv-Direktstart

## V4.3.11 – Windows-Pfadbehandlung repariert

- fehlerhafte Übergabe von `%~dp0` an PowerShell entfernt
- Root-Ermittlung über `$PSScriptRoot`
- optionale Pfadeingabe robust normalisiert
- Zertifikatsprüfung weiterhin ohne Python

## V4.3.11 – TÜV-Härtung Versionskonsistenz

- Candidate-TÜV erkennt jetzt Versionsdrift über alle aktiven Runtime- und Metadatenflächen.
- Negativtests für fehlenden Core, Versionsdrift, Zertifikatsmanipulation und JavaScript-Syntax ergänzt.
- Keine fachliche Änderung an Netzwerk- oder Messfunktionen.

## V4.3.8 – P1 Framework-Runtime-Reparatur

- Allgemeine Framework-Cores real geladen, aktiviert und mit Consumern verbunden.
- NavigationCore an den bestehenden Leitstand-Adapter gebunden.
- Versionsstände auf 4.3.8 vereinheitlicht.
- Zertifikats-Hashing von `__pycache__` und `.pyc` bereinigt.
- TÜV um Core-Runtime- und semantische App/Public-Prüfung erweitert.
- SHA-256-Manifest neu erstellt.

## V4.3.5 – Optionaler TShark Analyse-Provider
- TShark automatisch erkennen
- Tiefenanalyse lokal ueber Pruefdienst
- Browser-Auswertung bleibt als Fallback
- Keine Datenuebertragung ins Internet

## V4.3.3 – Paketmitschnitt-Import
- `.eth`/klassische `.pcap` lokal analysierbar.
- Protokolle, Endpunkte, Verbindungen, DNS, TCP-Auffaelligkeiten und Verlauf.

## V4.3.3
- Browser-Speicherfehler `QuotaExceededError` behoben.
- Kleine Einstellungen bleiben in `localStorage`; grosse Verlaufsdaten werden in IndexedDB gespeichert.
- Sichere Notfallablage verhindert, dass Router-Erkennung durch einen Speicherfehler abbricht.
- Bestehende Mess-, Register-, Buero-, Herz-/EKG- und GitHub-Funktionen unveraendert.

## V4.3.3
- Router-Erkennung: Fortschrittsbalken, Fehlerabschluss, Timeout und Mehrfachstart repariert.

## V4.3.3
- Fachregister logisch getrennt.
- SensorRegistry V1 eingefuehrt.
- Keine neuen Doppeltests; bestehende Laufzeitfunktionen geschuetzt.

## V4.2.7
- Normalpuls auf 60/min reduziert.
- Herzschlag vergroessert und heller sichtbar gemacht.
- Leitstandbild und Buerofunktionen regressionsgeschuetzt und unveraendert beibehalten.

## V4.2.4 – Rückkehr ins Büro, eindeutige Schalter, Herz/EKG und GitHub-Readiness

- „Zurück ins Büro“ erscheint nach jeder im Büro gewählten Funktion.
- Pro sichtbarer Anzeige bleibt nur ein Ein-/Ausschalter.
- Herzform neu und symmetrisch aufgebaut.
- EKG auf BPM-synchronen P-QRS-T-Komplex umgestellt.
- GitHub-Release-Check und Validierungsworkflow ergänzt.
- Mess- und Prüfdienstlogik nicht verändert.

## V4.2.3 – Bedienruhe und Bürosteuerung
- Digitaluhr stabilisiert.
- Vollständige Nullstellung bei ausgeschalteten Messungen.
- Pixelanzeige an der Navi-Verschiebelinie wiederhergestellt.
- Direkte Schaltpult-Aktionen im Büromodus ergänzt.

# V4.2.1 – Framework Shell Stabilisierung

- Obermenüs mit echter Ein-Gruppen-Logik und ARIA-Status.
- Benutzerfeld mit Auto-Status und eindeutiger Aktion „Büromodus starten“.
- Begrüßungszeile, Projektidentität und Digitaluhr vereinheitlicht.
- SmartPanel um Aufgabenbereich und Gerätemodus ergänzt.
- Statusleiste und Desktop-/Tablet-/Smartphone-Erkennung stabilisiert.
- Mess- und Prüfdienstlogik nicht verändert.

# V4.2.0
- Interaktiver Vollbild-Bueromodus mit Gegenstaenden als Hotspots.
- Buerostuhl-Exit, Touch-/Tastaturbasis und Paketkonsolidierung.
- Pruefdienst und Messalgorithmen unveraendert.

# Changelog

## V4.1.7

- Diagnose-Register strikt getrennt; inaktive Register-Panels werden per CSS-Override ausgeblendet.
- LED-Leiste wieder aktiviert und kompakter dargestellt.
- Grosse Sensor-Kacheln in der Live-Kopfzeile ausgeblendet.
- Rundinstrumente sensibler skaliert und kompakter dargestellt.
- Assistent-Start sichtbar repariert: Schrittmodus startet und scrollt zur Assistentenkarte.
- Bueromodus oeffnet als separates WindowCore-Fenster statt oberhalb der Messinstrumente.
- Zeitstrahl um Warn- und Fehlerspitzen erweitert.
- Navigationsgruppen auf Plus/Minus-Klappkoepfe umgestellt.
- Navigations- und Schnellzugriffsicons wieder farbig hervorgehoben.

## V4.1.6

- Stammdaten-Oberpunkt mit eingerueckten Unterpunkten ergaenzt.
- Navigation und Schnellzugriffe mit Symbolen versehen.
- Untere grosse Messfenster wieder eingeblendet.
- Pulslogik von ca. 60/min bis 200/min korrigiert.
- Router erkennen und Assistent starten rechts neben den Registern positioniert.
- Routerprofile als Register unter Einstellungen angelegt.
- Schalter-Audit als Register unter Einstellungen angelegt.
- Bueromodus mit Bild in separatem Asset-Ordner eingebaut.
- Zurueck-zum-Buero-Schaltflaeche ergaenzt.

## V4.1.5

- Register fachlich getrennt: Internet, Router, Import/DOCSIS, WLAN, PC/SMART und Protokoll zeigen jeweils eigene Inhalte.
- Router-Register von WAN/DOCSIS-Importinhalten bereinigt.
- Import/DOCSIS-Register von PC/SMART-Inhalten bereinigt.
- Grosse Startseiten-Steuerkarte durch kompakte Register-Bedienleiste ersetzt.
- Globale Status-LED-Leiste auf dem Dashboard ausgeblendet, damit Register nicht vermischt wirken.
- Router erkennen zeigt sichtbaren Fortschritt und Ergebnisfenster.
- Verbindungsverlauf zeigt Live-Bewegung auch ohne Messdaten.
- Animationen werden bei erster V4.1.5-Migration wieder aktiviert.

## V4.1.4

- Registerkarten zu echten eigenen Cockpits umgebaut.
- Alte globale Rundinstrumente auf dem Dashboard ausgeblendet, damit keine Register-Dopplung entsteht.
- Hauptschalter auf der Startseite ergaenzt.
- Router erkennen auf Startseite und Router-Register sichtbar gemacht.
- Infofenster-Schalter in Einstellungen eingebaut; bei Aus bleiben nur Tooltips.
- Doppelte Kartenschalter entfernt.
- Sanduhr, Scanring und Herzform aus der funktionierenden Vorversion wiederhergestellt.
- Assistent zu einem gefuehrten Schritt-fuer-Schritt-Ablauf erweitert.
- Top-Rechts-Schalter fuer alle Karten ein-/ausklappen ergaenzt.

## V4.1.3

- Control-Cockpit mit hoeher platzierten, kompakteren Diagnose-Registern.
- Registerkarten zeigen eigene Testkarten, Tabellen, Balken und Kategorie-Details.
- Hauptschalter stoppt Tests, Tiefenanalyse und sichtbare Instrumentenbewegung.
- Einzelne Messfenster und Instrumente erhalten eigene Ein-/Ausschalter.
- Router-Erkennung aus Routerprofil, erreichbarer Adresse, Live-Messung und importierten Diagnosedateien.
- Realistischere EKG-Linie mit Pulsanzeige.
- Sanduhr und Scanring wieder als echte visuelle Elemente, langsamer im Normalbetrieb und schneller bei Fehlerlast.
- Infokarten/Tooltips fuer Messwerte und Bedienelemente.
- Tiefenanalyse mit sichtbarem 60-Sekunden-Fortschrittsbalken.
- Pruefkreise platzsparender als Tabelle.
- Animationen-aus-Einstellung wirkt auf Herzschlag, EKG, Scanring, Sanduhr und Instrumente.
- Pruefdienst und Framework-Cores unveraendert gelassen.

## V4.1.2

- Registerkarten nach oben ins Cockpit verschoben und zustandserhaltend gemacht.
- Routerdatei-Import fuer FRITZ!Box, Vodafone Station, Speedport, EasyBox, TP-Link/Deco und allgemeine Routerdateien.
- DOCSIS-Hinweise aus Importtexten: nicht korrigierbare Fehler, korrigierbare Fehler, Pegel, SNR/MSE.
- SMART-/PC-Berichtimport mit Auswertung von Reallocated, Pending, Uncorrectable und Temperatur.
- WLAN-Seite mit ehrlicher Browser-/Pruefdienst-Grenze und LAN/WLAN-Testlogik.
- Rundinstrumente mit laufender Nachzeichnung.
- Stabile ASCII-Iconlabels statt kaputter Symbolzeichen.

## V4.1.1

- Diagnose-Register fuer Testgruppen eingebaut.
- System-Herzschlag dynamisch nach Fehlerlast.
- Scanring und Sanduhr dynamisch nach Testlast.
- Rundinstrumente mit Standby-Ausschlag.
- Neue sichtbare Testgruppen ohne Ueberladung der Startseite.
- GitHub-ready Dateien ergaenzt.

## V4.1.0

- Command-Center-Ausbau mit PC-/Speicheranzeige und Assistent.

## V4.0.11

- Master-Navigation migriert.

## V4.2.0 – Migrationsfundament
- Komponentenvertrag und Manifeste ergänzt.
- Navigation und Framework-Shell als externe Projektkonfiguration beschrieben.
- Migration-Preflight, Baseline-Schutz und Rollback-Pflicht ergänzt.
- Keine bestehende Fach- oder Messfunktion verändert.


## V4.2.6
- Herz/EKG gemeinsame Taktquelle
- GitHub Pages public-Ordner

## V4.3.6
- Framework-TÜV V1.0 mit automatischer Pflichtprüfung, Zertifikat und technischen Sperren.

## V4.3.7 – Universeller Framework-TÜV
- Projektübergreifender TÜV für Ordner und ZIP-Dateien.
- Automatische Erkennung von Projektname, Version und Typ.
- Drag-and-drop-Prüfeingang `PROJEKT_ZUM_TUEV.cmd`.
- Eigenes Zertifikat je Programm, Core oder Paket.
- Projektspezifische Schutzregeln über `tuev/project-policy.json`.

## V4.3.23
- FrameworkLauncher V1.0 mit Ein-Klick-Prüfung und Start.
- Diagnosemodus mit versandfähigem Textbericht.
- Klarer Archiv-/ZIP-Startschutz.
- App-Modus-Start in Edge/Chrome zur Vermeidung von Browser-Sidebar-Randstörungen.
- CSS-Randstabilisierung für volle Arbeitsfläche.
- Automatischer Builder für eine zertifizierte Installationsversion.

## V4.3.23 – Installationsort, Fortschrittsanzeige und Browserstart
- Installationsordner wird vor der Installation abgefragt und bestätigt.
- Sichtbare Fortschrittsbalken für alle Start- und Installationsphasen.
- PowerShell-Fehler `System.Object[]` bei der Browserübergabe behoben.
- Diagnosemodus und Archiv-Startschutz beibehalten.

## V5.4.0 – Organ Sensor Neural Integration
- neun digitale Organe als skalierbare Verdichtungsebene eingefuehrt
- Map-basierte SensorRegistry fuer grosse IT-Umgebungen vorbereitet
- erste Runtime-Sensoren mit Gehirn, Herz, Zeitgeber, Selbstschutz und Monitor verdrahtet
- Brain-Monitor zeigt Sensorzahl, Aufmerksamkeitsfokus, Gegenpruefungen und Organstatus
- Hauptoberflaeche unveraendert gelassen
