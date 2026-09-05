# AUDIT V4.3.24 - LED-Verdichtung, Internet-Detail, Kontextnavigation, Router-Pruefung

## Umgesetzte Aenderungen
- Obere separate LED-Reihe entfernt und deren eindeutige Statusanzeigen in den LED-Block rechts neben Herz/EKG integriert.
- Doppelte Statusanzeigen vermieden; gemeinsamer Block enthaelt 15 eindeutige Statusgruppen.
- Herz/EKG durch entfallene obere LED-Reihe kompakter nach links gerueckt.
- IPv4-/IPv6-/Ziel-/Bewertungsblock rechts neben die vier Rundinstrumente gesetzt, bei kleineren Breiten rueckfallend unterhalb.
- Kontext-Chips der Navigation an vorhandene Zielseiten gebunden.
- Tooltip-Anzeige schliesst bei offenen Info-/Fensterdialogen und bleibt im sichtbaren Bereich.

## Routererkennung - nur geprueft, nicht geaendert
- Erkennung basiert derzeit auf eingestelltem Profil, Erreichbarkeit der Routeradresse, Routerdatei-Import und FRITZ!Box-Diagnoseimport.
- Ohne Import und ohne erreichbaren lokalen Pruefdienst ist die Modellbestimmung nur profilbasiert und daher keine echte automatische Hardwareerkennung.
- Fremdrouterprofile sind vorhanden: Speedport Smart 4, Vodafone Station, EasyBox 805, TP-Link Archer/Deco und eigenes Routermodell.
- Moegliche Fehlerursachen beim Freund: falsche Routeradresse, lokaler Pruefdienst nicht erreichbar, Browserzugriff auf lokale Routeradresse eingeschraenkt oder nicht passendes voreingestelltes Profil.
- Keine Routerlogik wurde in dieser Version veraendert.
