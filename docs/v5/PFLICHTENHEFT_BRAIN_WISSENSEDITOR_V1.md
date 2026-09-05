# Pflichtenheft – Brain-Wissenseditor

Status: Architektur-Kandidat, Entwurfsbetrieb.

Der Editor erfasst Problem-ID, Bezeichnung, Beschreibung, Kategorie, autoritative Messquelle, Messwert, Warn- und Kritisch-Schwelle, Zusatzbedingung, Runbook-ID, höchstens 20 Runbook-Schritte, Maßnahmenklasse, Verifikationsregel und vorbereiteten Prüfstatus.

Kritisch muss größer als Warnung sein. Unbekannte Maßnahmenklassen werden auf `ACTUATOR_BLOCKED` zurückgestuft. Speicherung erfolgt ausschließlich verschlüsselt über `FrameworkSecureStorage`. Ein gespeicherter Entwurf ist niemals laufzeitwirksam und stellt keine Freigabe dar.
