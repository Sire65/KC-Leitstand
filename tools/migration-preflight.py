#!/usr/bin/env python3
from pathlib import Path
import json, re, sys
ROOT=Path(__file__).resolve().parents[1]
errors=[]; notes=[]
def load(rel):
 p=ROOT/rel
 if not p.exists(): errors.append(f"MISSING:{rel}"); return None
 try:return json.loads(p.read_text(encoding='utf-8'))
 except Exception as e: errors.append(f"INVALID_JSON:{rel}:{e}"); return None
for rel in ['framework/manifests/navigationcore.component.json','framework/manifests/framework-shell.component.json']:
 m=load(rel)
 if not m: continue
 for key in ['componentId','componentType','version','apiVersion','owner','entrypoints','dependencies','capabilities','migration','qa']:
  if key not in m: errors.append(f"CONTRACT_FIELD_MISSING:{rel}:{key}")
 for ep in m.get('entrypoints',[]):
  if not (ROOT/ep).exists(): errors.append(f"ENTRYPOINT_MISSING:{rel}:{ep}")
 if not m.get('migration',{}).get('preserveProjectConfig'): errors.append(f"PROJECT_CONFIG_NOT_PRESERVED:{rel}")
 if not m.get('migration',{}).get('rollbackRequired'): errors.append(f"ROLLBACK_NOT_REQUIRED:{rel}")
nav=load('app/config/navigation.json')
if nav:
 ids=[]; pages=[]
 for g in nav.get('groups',[]):
  ids.append(g.get('id'))
  for item in g.get('items',[]): ids.append(item.get('id')); pages.append(item.get('page'))
 dup=sorted({x for x in ids if x and ids.count(x)>1})
 if dup: errors.append('DUPLICATE_NAV_IDS:'+','.join(dup))
 html=(ROOT/'app/index.html').read_text(encoding='utf-8',errors='replace')
 html_pages=set(re.findall(r'data-page="([^"]+)"',html))
 for p in sorted(set(x for x in pages if x)):
  if p not in html_pages: errors.append('NAV_PAGE_NOT_IN_EXISTING_UI:'+p)
baseline=load('app/config/migration-baseline.json')
if baseline:
 for f in baseline.get('protectedFiles',[]):
  if not (ROOT/f).exists(): errors.append('PROTECTED_FILE_MISSING:'+f)
print('FRAMEWORK MIGRATION PREFLIGHT V1.0')
print('Project: Netzwerk-Leitstand')
print('Result:', 'PASS' if not errors else 'FAIL')
for e in errors: print('ERROR',e)
if not errors:
 print('Contracts: PASS')
 print('Entrypoints: PASS')
 print('Project configuration preservation: PASS')
 print('Navigation target compatibility: PASS')
 print('Rollback requirement: PASS')
sys.exit(1 if errors else 0)
