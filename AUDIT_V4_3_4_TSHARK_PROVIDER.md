# Audit V4.3.4 – TShark Analyse-Provider

## Umsetzung
- Optionaler TShark-Provider im lokalen Windows-Pruefdienst
- Automatische Erkennung ueblicher Wireshark-Installationspfade und PATH
- Lokaler Binär-Upload bis 100 MB an 127.0.0.1
- Temp-Datei wird nach Analyse geloescht
- Strukturierte Auswertung von Retransmissions, Duplicate ACK, Out-of-Order, Lost Segments, TCP Resets, DNS-Fehlern, Protokollen und Endpunkten
- Bestehender Browser-PCAP-Parser bleibt als vollstaendiger Fallback erhalten

## Schutz
- Keine Aenderung an Herz/EKG, Buero, Hotspots, Registern oder vorhandenen Messalgorithmen
- TShark wird nicht mitgeliefert und muss separat installiert sein
- Keine automatische Uebertragung ins Internet
