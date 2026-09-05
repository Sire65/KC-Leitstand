#!/usr/bin/env python3
from __future__ import annotations
import argparse, datetime as dt, hashlib, html, json, os, re, shutil, subprocess, sys, tempfile, zipfile
from pathlib import Path

SCRIPT_ROOT = Path(__file__).resolve().parents[1]

TEXT_EXTS = {'.html','.htm','.js','.mjs','.cjs','.css','.json','.md','.txt','.ps1','.cmd','.bat','.yml','.yaml','.xml'}


def sha256(path: Path) -> str:
    h=hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda:f.read(1024*1024),b''): h.update(chunk)
    return h.hexdigest()


def tree_digest(root: Path, ignore: set[str]) -> tuple[str,dict[str,str]]:
    hashes={}
    for p in sorted(root.rglob('*')):
        if not p.is_file() or '.git' in p.parts or '__pycache__' in p.parts or p.suffix=='.pyc': continue
        rel=p.relative_to(root).as_posix()
        if rel in ignore or rel.startswith('tuev-output/') or rel.endswith('.zip'): continue
        hashes[rel]=sha256(p)
    h=hashlib.sha256()
    for rel,d in hashes.items():
        h.update(rel.encode()); h.update(b'\0'); h.update(d.encode()); h.update(b'\n')
    return h.hexdigest(),hashes


def r(suite,cid,ok,text,severity='BLOCKER',evidence=''):
    return {'suite':suite,'id':cid,'result':'PASS' if ok else 'FAIL','severity':severity,'text':text,'evidence':evidence}


def run(cmd,cwd,timeout=90):
    try:
        cp=subprocess.run(cmd,cwd=cwd,text=True,capture_output=True,timeout=timeout)
        return cp.returncode,(cp.stdout+cp.stderr).strip()
    except Exception as e: return 127,str(e)


def find_project_root(base: Path) -> Path:
    entries=[p for p in base.iterdir() if p.name not in {'__MACOSX'}]
    if len(entries)==1 and entries[0].is_dir(): return entries[0]
    return base


def identify(root: Path) -> dict:
    pkg={}
    if (root/'package.json').exists():
        try: pkg=json.loads((root/'package.json').read_text(encoding='utf-8-sig'))
        except: pass
    register={}
    for name in ('PROJECT_REGISTER.json','project.json','manifest.json'):
        if (root/name).exists():
            try: register=json.loads((root/name).read_text(encoding='utf-8-sig')); break
            except: pass
    name=register.get('name') or pkg.get('name') or root.name
    version=str(register.get('version') or pkg.get('version') or '0.0.0')
    project_id=str(register.get('projectId') or re.sub(r'[^A-Za-z0-9]','',name)[:12].upper() or 'PROJECT')
    if (root/'framework/core').exists() or any(root.rglob('*core.js')): kind='FRAMEWORK_APP'
    elif (root/'index.html').exists() or (root/'app/index.html').exists() or (root/'public/index.html').exists(): kind='WEB_APP'
    elif any(root.glob('*.js')) or any(root.glob('*.ps1')): kind='COMPONENT'
    else: kind='GENERIC_PACKAGE'
    return {'name':name,'version':version,'projectId':project_id,'kind':kind,'package':pkg,'register':register}


def html_refs(path: Path):
    try: text=path.read_text(encoding='utf-8',errors='replace')
    except: return []
    refs=re.findall(r'(?:src|href)=["\']([^"\']+)["\']',text,re.I)
    missing=[]
    for ref in refs:
        if ref.startswith(('http:','https:','data:','#','mailto:','javascript:','blob:')): continue
        clean=ref.split('?')[0].split('#')[0]
        if clean and not (path.parent/clean).resolve().exists(): missing.append(ref)
    return missing


def checks(root: Path, meta: dict) -> list[dict]:
    out=[]
    files=[p for p in root.rglob('*') if p.is_file() and '.git' not in p.parts]
    out.append(r('structure','PACKAGE_NOT_EMPTY',bool(files),f'{len(files)} Dateien gefunden'))
    out.append(r('structure','VERSION_FORMAT',bool(re.fullmatch(r'\d+\.\d+\.\d+(?:[-+][A-Za-z0-9.-]+)?',meta['version'])),f"Version {meta['version']}",severity='WARNING'))
    # Parse JSON
    for p in root.rglob('*.json'):
        if '.git' in p.parts or 'tuev-output' in p.parts: continue
        try: json.loads(p.read_text(encoding='utf-8-sig'))
        except Exception as e: out.append(r('syntax','JSON_PARSE',False,f'Ungültiges JSON: {p.relative_to(root)}',evidence=str(e)))
    # HTML refs and duplicate IDs
    for p in root.rglob('*.html'):
        if 'tuev-output' in p.parts: continue
        miss=html_refs(p)
        out.append(r('structure',f'HTML_REFS_{str(p.relative_to(root)).replace("/","_")}',not miss,f'Lokale Referenzen: {p.relative_to(root)}',evidence='\n'.join(miss)))
        text=p.read_text(encoding='utf-8',errors='replace')
        ids=re.findall(r'\bid=["\']([^"\']+)["\']',text,re.I)
        dup=sorted({x for x in ids if ids.count(x)>1})
        out.append(r('structure',f'HTML_IDS_{str(p.relative_to(root)).replace("/","_")}',not dup,f'Eindeutige HTML-IDs: {p.relative_to(root)}',severity='WARNING',evidence='\n'.join(dup)))
    # JS syntax
    jsfiles=[p for p in root.rglob('*.js') if 'node_modules' not in p.parts and 'tuev-output' not in p.parts]
    if shutil.which('node'):
        for p in jsfiles:
            rc,ev=run(['node','--check',str(p)],root)
            out.append(r('syntax',f'NODE_{str(p.relative_to(root)).replace("/","_")}',rc==0,f'JavaScript-Syntax: {p.relative_to(root)}',evidence=ev))
    else: out.append(r('syntax','NODE_AVAILABLE',False,'Node.js nicht gefunden',severity='WARNING'))
    # CSS brace sanity and referenced CSS existence is covered by html refs
    for p in root.rglob('*.css'):
        if 'tuev-output' in p.parts: continue
        t=p.read_text(encoding='utf-8',errors='replace')
        out.append(r('syntax',f'CSS_BRACES_{str(p.relative_to(root)).replace("/","_")}',t.count('{')==t.count('}'),f'CSS-Klammern: {p.relative_to(root)}'))
    # Dangerous constructs
    dangerous=[]
    for p in files:
        if p.suffix.lower() not in TEXT_EXTS: continue
        try:t=p.read_text(encoding='utf-8',errors='ignore')
        except:continue
        for pat in [r'\beval\s*\(',r'new\s+Function\s*\(',r'document\.write\s*\(']:
            if re.search(pat,t): dangerous.append(f'{p.relative_to(root)}: {pat}')
    out.append(r('security-baseline','NO_DANGEROUS_JS',not dangerous,'Keine offensichtlichen gefährlichen JavaScript-Konstrukte',evidence='\n'.join(dangerous)))
    # Project specific contract if present
    contract=root/'tuev/project-policy.json'
    if contract.exists():
        try:
            pol=json.loads(contract.read_text(encoding='utf-8-sig'))
            for rel in pol.get('requiredFiles',[]): out.append(r('project-policy',f'FILE_{Path(rel).name}',(root/rel).exists(),f'Pflichtdatei {rel}'))
            combined='\n'.join((p.read_text(encoding='utf-8',errors='ignore') for p in files if p.suffix.lower() in TEXT_EXTS))
            absent=[x for x in pol.get('protectedTokens',[]) if x.lower() not in combined.lower()]
            out.append(r('regression','PROTECTED_TOKENS',not absent,'Geschützte Funktionen vorhanden',evidence='\n'.join(absent)))
        except Exception as e: out.append(r('project-policy','POLICY_PARSE',False,'Projekt-TÜV-Richtlinie ungültig',evidence=str(e)))
    else: out.append(r('project-policy','POLICY_PRESENT',False,'Keine projektspezifische TÜV-Richtlinie; nur universelle Prüfung',severity='WARNING'))
    # public/app consistency: index.html may differ only by deployment path prefix
    if (root/'app').exists() and (root/'public').exists():
        for rel in ['app.js','pcap-analyzer.js']:
            a=root/'app'/rel; b=root/'public'/rel
            if a.exists() and b.exists(): out.append(r('public',f'APP_PUBLIC_{rel.replace(".","_")}',a.read_bytes()==b.read_bytes(),f'App/Public identisch: {rel}',severity='WARNING'))
        a=root/'app/index.html'; b=root/'public/index.html'
        if a.exists() and b.exists():
            normalize=lambda s:s.replace('../framework/','framework/')
            ok=normalize(a.read_text(encoding='utf-8',errors='replace'))==normalize(b.read_text(encoding='utf-8',errors='replace'))
            out.append(r('public','APP_PUBLIC_index_html',ok,'App/Public semantisch identisch: index.html',severity='WARNING'))
    # Framework runtime integration: files alone are not sufficient
    if (root/'PROJECT_REGISTER.json').exists() and (root/'app/index.html').exists():
        reg=meta.get('register') or {}; html_text=(root/'app/index.html').read_text(encoding='utf-8',errors='replace')
        bootstrap=(root/'framework/core/network-framework-runtime.js')
        boot=bootstrap.read_text(encoding='utf-8',errors='replace') if bootstrap.exists() else ''
        for core in reg.get('generalCores',[]):
            filename=core.lower()+'.js'
            loaded=filename in html_text.lower()
            activated=(f"id:'{core}'" in boot or f'id:"{core}"' in boot) and f"bindConsumer(id,consumer)" in boot
            out.append(r('framework-runtime',f'CORE_{core.upper()}',loaded and activated,f'{core} geladen, aktiviert und Consumer-gebunden',evidence=f'loaded={loaded}; activated={activated}'))
    # package scripts when available
    pkg=meta.get('package') or {}
    scripts=pkg.get('scripts',{}) if isinstance(pkg,dict) else {}
    for key in ['test','lint','static-check']:
        if key not in scripts or not shutil.which('npm'):
            continue
        command=str(scripts.get(key,''))
        needs_powershell=('powershell' in command.lower() or 'pwsh' in command.lower())
        has_powershell=bool(shutil.which('powershell') or shutil.which('pwsh'))
        if needs_powershell and not has_powershell:
            out.append(r('external-tools',f'NPM_{key.upper().replace("-","_")}',False,f'npm {key} auf diesem Betriebssystem nicht ausführbar',severity='WARNING',evidence='PowerShell nicht verfügbar'))
            continue
        rc,ev=run(['npm','run',key],root,timeout=180)
        out.append(r('external-tools',f'NPM_{key.upper().replace("-","_")}',rc==0,f'npm {key}',severity='WARNING' if key=='test' else 'BLOCKER',evidence=ev[-8000:]))
    return out


def write_output(root: Path, meta: dict, outdir: Path, level: str, checks_: list[dict]):
    outdir.mkdir(parents=True,exist_ok=True)
    blockers=[x for x in checks_ if x['result']=='FAIL' and x['severity']=='BLOCKER']
    warnings=[x for x in checks_ if x['result']=='FAIL' and x['severity']!='BLOCKER']
    status='PASS' if not blockers else 'FAIL'
    digest,hashes=tree_digest(root,{'tuev/certificate.json','tuev/certificate.txt','tuev/report.json','tuev/report.html','tuev/failures.json'})
    now=dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat()
    cert_id=f"FT-{meta['projectId']}-{dt.datetime.now().strftime('%Y%m%d')}-{digest[:12].upper()}"
    report={'schemaVersion':'2.0.0','engine':'Framework-TUEV Universal','project':meta['name'],'projectId':meta['projectId'],'kind':meta['kind'],'version':meta['version'],'level':level,'status':status,'timestamp':now,'blockers':len(blockers),'warnings':len(warnings),'checks':checks_,'treeDigest':digest}
    (outdir/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    (outdir/'failures.json').write_text(json.dumps({'blockers':blockers,'warnings':warnings},ensure_ascii=False,indent=2),encoding='utf-8')
    rows=''.join(f"<tr><td>{html.escape(x['suite'])}</td><td>{html.escape(x['id'])}</td><td>{x['result']}</td><td>{html.escape(x['text'])}</td></tr>" for x in checks_)
    (outdir/'report.html').write_text(f'<!doctype html><meta charset=utf-8><title>Framework TÜV</title><h1>Framework TÜV – {html.escape(meta["name"])} {html.escape(meta["version"])}</h1><p><b>{status}</b> · {level} · Blocker {len(blockers)} · Hinweise {len(warnings)}</p><table border=1 cellspacing=0 cellpadding=6><tr><th>Suite</th><th>ID</th><th>Status</th><th>Prüfung</th></tr>{rows}</table>',encoding='utf-8')
    if status=='PASS':
        cert={'schemaVersion':'2.0.0','certificateId':cert_id,'authority':'Framework-TUEV','projectId':meta['projectId'],'project':meta['name'],'projectKind':meta['kind'],'version':meta['version'],'level':level,'usage':'TEST_ONLY' if level=='CANDIDATE' else 'PRODUCTION','status':'VALID','issuedAt':now,'treeDigest':digest,'coveredFiles':hashes,'report':'report.json'}
        (outdir/'certificate.json').write_text(json.dumps(cert,ensure_ascii=False,indent=2),encoding='utf-8')
        (outdir/'certificate.txt').write_text(f"FRAMEWORK TÜV\nBESTANDEN\nZertifikat: {cert_id}\nProjekt: {meta['name']} {meta['version']}\nTyp: {meta['kind']}\nStufe: {level}\nPrüfsumme: {digest}\nAusgestellt: {now}\n",encoding='utf-8')
    return status,len(blockers),len(warnings),cert_id


def main():
    ap=argparse.ArgumentParser(description='Projektübergreifender Framework-TÜV')
    ap.add_argument('source',help='Projektordner oder ZIP-Datei')
    ap.add_argument('--level',choices=['CANDIDATE','STABLE'],default='CANDIDATE')
    ap.add_argument('--output',default='')
    a=ap.parse_args()
    src=Path(a.source).resolve()
    if not src.exists(): print('Quelle fehlt:',src); return 2
    temp=None
    if src.is_file():
        if not zipfile.is_zipfile(src): print('Nur ZIP-Dateien oder Ordner werden unterstützt'); return 2
        temp=Path(tempfile.mkdtemp(prefix='framework-tuev-'))
        with zipfile.ZipFile(src) as z: z.extractall(temp)
        root=find_project_root(temp)
        default_out=src.parent/(src.stem+'_TUEV')
    else:
        root=src; default_out=root/'tuev-output'
    outdir=Path(a.output).resolve() if a.output else default_out
    meta=identify(root)
    cs=checks(root,meta)
    status,b,w,cid=write_output(root,meta,outdir,a.level,cs)
    print(f"FRAMEWORK TÜV UNIVERSAL: {status} | {meta['name']} {meta['version']} | Blocker={b} Hinweise={w}")
    if status=='PASS': print('Zertifikat:',outdir/'certificate.txt')
    else: print('GESPERRT. Bericht:',outdir/'report.html')
    if temp: shutil.rmtree(temp,ignore_errors=True)
    return 0 if status=='PASS' else 2

if __name__=='__main__': raise SystemExit(main())
