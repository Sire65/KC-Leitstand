# Audit V4.2.6 – realistische Systemrhythmen

## Ziel
Die Herz-/EKG-Anzeige bildet den technischen Gesamtzustand gut erkennbar und konsistent ab.

## Zustandsmodell
1. NORMAL: geordneter Sinusrhythmus, gruen.
2. BELASTUNG: erhoehter Puls, gelb, weiterhin geordnet.
3. KRITISCH: mehrere rote Kernsysteme, chaotische VF-Simulation, rot.
4. KEINE SYSTEMAKTIVITAET: helle laufende Flatline, stilles Herz.
5. MESSSIGNAL VERLOREN: gestrichelte orange Linie; kein falscher Totalausfall.
6. MESSUNGEN AUS / WARTEN: graue Ruhelinie.

## Schutz
- Keine Aenderung am PowerShell-Pruefdienst.
- Bestehende Messdaten und Fachlogik bleiben erhalten.
- Darstellung arbeitet nur mit vorhandenen Statuswerten.
