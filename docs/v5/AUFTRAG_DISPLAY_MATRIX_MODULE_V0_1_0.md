# Auftrag - DisplayMatrixModule V0.1.0

Quelle: Framework Studio Architekturabgleich.

## Status

PASS MIT AUFLAGEN. Vor Sprint 7 muss das Modul sauber an die vorhandene Framework-Architektur angebunden werden.

## Naechste Entwicklungsschritte

1. MatrixFontManager mit mehreren Schriftgroessen und Unicode-Vorbereitung.
2. RendererFactory fuer LED-, Flip-Dot-, LCD-, Pixel- und Seven-Segment-Renderer.
3. Display Designer mit Live-Vorschau und Vorlagenverwaltung.
4. Seitenmanager mit automatischem Seitenwechsel, Alarmseiten und Vollbildmodus.
5. Framework-Integration: DesignCore, WindowCore, InteractionCore, SettingsCore, TransitionService und EventBus.
6. Studio-Registrierung und Framework-TUEV.

## Architekturauflagen

- DesignCore: Theme, Farben, Kontrastprofile, Nachtmodus, LED-Farbpaletten, Helligkeit, Schriftdefinitionen und Animationstokens lesen; keine festen Modulfarben ausser Benutzeroptionen.
- WindowCore: keine eigene Fensterpositionierung oder Skalierung; Layout-Editor-Kompatibilitaet erhalten.
- InteractionCore: Maus, Touch, Tastatur, Kontextmenue, Animation AUS und Reduced Motion unterstuetzen.
- SettingsCore: alle Einstellungen dort speichern; das Modul speichert selbst nichts dauerhaft.
- TransitionService: Helligkeit, Farbwechsel, Einblendungen, Pulsieren und Alarmuebergaenge steuern.
- EventBus: `display.show`, `display.clear`, `display.priority`, `display.alarm`, `display.symbol` vorbereiten.
- CapabilityCore: einfacher Modus nur Text, Expertenmodus fuer Designerfunktionen.
- SecurityCore optional fuer Rechte an Alarmtexten, Lauftexten und Designer.
- BackupCore empfohlen fuer Designerprofile.
- Framework Explorer: Modul sichtbar machen.

## Reihenfolge Nach Candidate

Integration in Netzwerk-Leitstand, Framework Studio/Baukasten, Framework-TUEV, Migrationstest in zweitem Programm, Freigabe als Standardmodul.
