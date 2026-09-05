# Pflichtenheft – Geräteerkennung und Domänenisolation

Status: Architektur-Kandidat.

Beim Start erfolgt eine nicht blockierende Erkennung in einer Leerlaufphase. Über „Neue Geräte suchen“ kann sie erneut ausgeführt werden. PC, Speicher, Netzwerkschnittstelle, Router und Internet werden als getrennte Domänen behandelt.

Jeder Erkenner besitzt eine Zeitgrenze von vier Sekunden und liefert `ERKANNT`, `NICHT_ERKANNT` oder `FEHLER`. Die Gesamtauswertung verwendet `Promise.allSettled`; eine Ausnahme darf weder den Suchlauf noch bestehende Tests stoppen.

Ein fehlender Router blockiert ausschließlich routerabhängige Adapter. PC-, Speicher- und lokale Tests bleiben ausführbar. Erkannte Geräte erzeugen nur Paketvorschläge mit `CONFIRM_REQUIRED`; Sensoren werden nicht automatisch aktiviert.
