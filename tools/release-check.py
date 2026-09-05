from pathlib import Path
import json, sys, re
root=Path(__file__).resolve().parents[1]
pkg=json.loads((root/'package.json').read_text(encoding='utf-8'))
version=pkg['version']
required=[
'app/index.html','app/app.js','app/pcap-analyzer.js','app/config/sensor-registry.json','app/config/sensor-registry.config.js','app/assets/css/commandcenter-consolidated-v4.3.5.css','app/assets/images/office/leitstand-buero-v1.png',
'public/index.html','public/app.js','public/pcap-analyzer.js','public/config/sensor-registry.json','public/config/sensor-registry.config.js','public/assets/css/commandcenter-consolidated-v4.3.5.css','public/.nojekyll','public/framework/shell/framework-shell-runtime.js',
'app/update.js','app/releases/latest.json','public/update.js','public/releases/latest.json',
'QA_V4_3_6.json','AUDIT_V4_3_6_FRAMEWORK_TUEV.md','docs/RELEASE_NOTES_V4_3_6.md','tools/framework-tuev.py','tuev/policy.json','probe/Netzwerk_Pruefdienst_V4.ps1'
]
missing=[p for p in required if not (root/p).exists()]
if missing:
 print('FEHLT:',*missing,sep='\n'); sys.exit(1)
reg=json.loads((root/'app/config/sensor-registry.json').read_text(encoding='utf-8'))
ids=[s['id'] for s in reg['sensors']]
assert len(ids)==len(set(ids)), 'Doppelte Sensor-ID'
assert all(s.get('register') for s in reg['sensors']), 'Sensor ohne Register'
html=(root/'app/index.html').read_text(encoding='utf-8')
public_html=(root/'public/index.html').read_text(encoding='utf-8')
assert 'commandcenter-v4.3.1.css' not in html, 'Verweis auf nicht vorhandene CSS-Datei'
assert html.count('commandcenter-consolidated-v4.3.5.css')==1, 'Aktive CSS-Kaskade nicht eindeutig'
for tab in ['internet','router','wifi','pc','printer','multimedia','nas','devices','protocol']:
 assert f'data-diag-tab="{tab}"' in html, f'Register fehlt: {tab}'
combined=html+(root/'app/app.js').read_text(encoding='utf-8')
for protected in ['office-hotspot','backToOffice','office-console-actions','heart','ekg']:
 assert protected.lower() in combined.lower(), f'Geschuetztes Element fehlt: {protected}'
assert (root/'app/app.js').read_bytes()==(root/'public/app.js').read_bytes(), 'App/Public app.js nicht identisch'
assert (root/'app/pcap-analyzer.js').read_bytes()==(root/'public/pcap-analyzer.js').read_bytes(), 'App/Public PCAP-Analyzer nicht identisch'
normalized=html.replace('../framework/','framework/')
assert normalized==public_html, 'App/Public index.html unterscheiden sich ueber den erlaubten Shell-Pfad hinaus'

# Aktualisierungshinweis: die beiden Auslieferungsstaende duerfen nicht
# auseinanderlaufen, und das Versionsverzeichnis muss dieselbe Fassung nennen
# wie das Programm. Sonst meldet der Leitstand entweder eine Aktualisierung,
# die es nicht gibt, oder keine, die es gibt.
assert (root/'app/update.js').read_bytes()==(root/'public/update.js').read_bytes(), 'App/Public update.js nicht identisch'
assert (root/'app/releases/latest.json').read_bytes()==(root/'public/releases/latest.json').read_bytes(), 'App/Public Versionsverzeichnis nicht identisch'
verzeichnis=json.loads((root/'app/releases/latest.json').read_text(encoding='utf-8'))
assert verzeichnis.get('fassung')==version, f"Versionsverzeichnis nennt {verzeichnis.get('fassung')!r} statt {version!r}"
assert '<script src="update.js"></script>' in html, 'Aktualisierungshinweis wird nicht geladen'

print(f'RELEASE CHECK V{version} PASS')
