#!/usr/bin/env python3
from __future__ import annotations
import argparse, datetime as dt, hashlib, html, json, os, re, shutil, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TUEV = ROOT / "tuev"
POLICY = json.loads((TUEV / "policy.json").read_text(encoding="utf-8"))


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def rel_files():
    ignored = set(POLICY.get("ignoredHashPaths", []))
    for p in sorted(ROOT.rglob("*")):
        if not p.is_file() or ".git" in p.parts or "__pycache__" in p.parts or p.suffix==".pyc":
            continue
        r = p.relative_to(ROOT).as_posix()
        if r in ignored or r.endswith(".zip"):
            continue
        yield r, p


def tree_digest() -> tuple[str, dict[str, str]]:
    hashes = {r: sha256(p) for r, p in rel_files()}
    h = hashlib.sha256()
    for r, digest in hashes.items():
        h.update(r.encode("utf-8")); h.update(b"\0"); h.update(digest.encode("ascii")); h.update(b"\n")
    return h.hexdigest(), hashes


def run(cmd: list[str], timeout=60):
    try:
        cp = subprocess.run(cmd, cwd=ROOT, text=True, capture_output=True, timeout=timeout)
        return cp.returncode, (cp.stdout + cp.stderr).strip()
    except (OSError, subprocess.TimeoutExpired) as e:
        return 127, str(e)


def result(suite, check_id, ok, text, severity="BLOCKER", evidence=None):
    return {"suite": suite, "id": check_id, "result": "PASS" if ok else "FAIL", "severity": severity, "text": text, "evidence": evidence or ""}


def validate_json(results):
    for p in ROOT.rglob("*.json"):
        if ".git" in p.parts: continue
        try: json.loads(p.read_text(encoding="utf-8-sig"))
        except Exception as e: results.append(result("syntax", "JSON_PARSE", False, f"Ungültiges JSON: {p.relative_to(ROOT)}", evidence=str(e)))


def html_refs(path: Path):
    text = path.read_text(encoding="utf-8")
    refs = re.findall(r'(?:src|href)=["\']([^"\']+)["\']', text, re.I)
    missing=[]
    for ref in refs:
        if ref.startswith(("http:","https:","data:","#","mailto:","javascript:")): continue
        clean=ref.split("?")[0].split("#")[0]
        target=(path.parent/clean).resolve()
        if not target.exists(): missing.append(ref)
    return missing


def core_checks(level: str):
    out=[]
    pkg_path=ROOT/"package.json"
    required=[pkg_path, ROOT/"app/index.html", ROOT/"app/app.js", ROOT/"public/index.html", ROOT/"public/app.js",
              ROOT/"app/config/sensor-registry.json", ROOT/"probe/Netzwerk_Pruefdienst_V4.ps1", ROOT/"PROJECT_REGISTER.json",
              ROOT/".github/workflows/validate.yml", ROOT/".github/workflows/pages.yml"]
    missing=[str(p.relative_to(ROOT)) for p in required if not p.exists()]
    out.append(result("structure","REQUIRED_FILES",not missing,"Pflichtdateien vollständig" if not missing else "Pflichtdateien fehlen",evidence="\n".join(missing)))
    validate_json(out)
    try:
        pkg=json.loads(pkg_path.read_text(encoding="utf-8")); version=pkg["version"]
        out.append(result("structure","VERSION_PRESENT",bool(re.fullmatch(r"\d+\.\d+\.\d+",version)),f"Version {version}"))
    except Exception as e:
        version="unknown"; out.append(result("structure","VERSION_PRESENT",False,"Version nicht lesbar",evidence=str(e)))

    # Verbindliche Versionskonsistenz über alle aktiven Runtime- und Metadatenflächen
    version_sources = {
        "package.json": lambda: json.loads((ROOT/"package.json").read_text(encoding="utf-8-sig")).get("version"),
        "PROJECT_REGISTER.json": lambda: json.loads((ROOT/"PROJECT_REGISTER.json").read_text(encoding="utf-8-sig")).get("version"),
        "app/config/shell.json": lambda: json.loads((ROOT/"app/config/shell.json").read_text(encoding="utf-8-sig")).get("version"),
        "public/config/shell.json": lambda: json.loads((ROOT/"public/config/shell.json").read_text(encoding="utf-8-sig")).get("version"),
    }
    version_mismatches=[]
    for label, getter in version_sources.items():
        try:
            value=getter()
            if value != version: version_mismatches.append(f"{label}: {value!r} != {version!r}")
        except Exception as e:
            version_mismatches.append(f"{label}: nicht lesbar ({e})")
    text_sources=[
        "app/config/shell.config.js", "public/config/shell.config.js",
        "framework/core/network-framework-runtime.js", "public/framework/core/network-framework-runtime.js",
        "framework/shell/framework-shell-runtime.js", "public/framework/shell/framework-shell-runtime.js",
        "app/assets/js/navigationcore-master.js", "public/assets/js/navigationcore-master.js",
    ]
    for rel in text_sources:
        p=ROOT/rel
        try:
            text=p.read_text(encoding="utf-8",errors="replace")
            if version not in text: version_mismatches.append(f"{rel}: aktive Projektversion {version} fehlt")
        except Exception as e:
            version_mismatches.append(f"{rel}: nicht lesbar ({e})")
    manifest_path=ROOT/"SHA256_MANIFEST.json"
    try:
        manifest_version=json.loads(manifest_path.read_text(encoding="utf-8-sig")).get("version")
        if manifest_version != version: version_mismatches.append(f"SHA256_MANIFEST.json: {manifest_version!r} != {version!r}")
    except Exception as e:
        version_mismatches.append(f"SHA256_MANIFEST.json: nicht lesbar ({e})")
    out.append(result("structure","VERSION_CONSISTENCY",not version_mismatches,f"Versionskonsistenz {version}",evidence="\n".join(version_mismatches)))

    app_html=(ROOT/"app/index.html").read_text(encoding="utf-8",errors="replace") if (ROOT/"app/index.html").exists() else ""
    app_js=(ROOT/"app/app.js").read_text(encoding="utf-8",errors="replace") if (ROOT/"app/app.js").exists() else ""
    combined=app_html+"\n"+app_js
    absent=[t for t in POLICY["protectedTokens"] if t.lower() not in combined.lower()]
    out.append(result("regression","PROTECTED_TOKENS",not absent,"Geschützte Leitstandfunktionen vorhanden" if not absent else "Geschützte Funktionen fehlen",evidence="\n".join(absent)))
    for r in POLICY["protectedFiles"]:
        out.append(result("regression",f"PROTECTED_FILE_{Path(r).name}",(ROOT/r).exists(),f"Geschützte Datei {r}"))

    if (ROOT/"app/app.js").exists() and (ROOT/"public/app.js").exists():
        out.append(result("public","APP_PUBLIC_JS",(ROOT/"app/app.js").read_bytes()==(ROOT/"public/app.js").read_bytes(),"App/Public app.js identisch"))
    if (ROOT/"app/pcap-analyzer.js").exists() and (ROOT/"public/pcap-analyzer.js").exists():
        out.append(result("public","APP_PUBLIC_PCAP",(ROOT/"app/pcap-analyzer.js").read_bytes()==(ROOT/"public/pcap-analyzer.js").read_bytes(),"App/Public PCAP-Analyzer identisch"))
    for hp in [ROOT/"app/index.html",ROOT/"public/index.html"]:
        if hp.exists():
            miss=html_refs(hp); out.append(result("structure",f"HTML_REFS_{hp.parent.name}",not miss,f"Lokale Referenzen in {hp.relative_to(ROOT)} vollständig",evidence="\n".join(miss)))

    regp=ROOT/"app/config/sensor-registry.json"
    if regp.exists():
        try:
            reg=json.loads(regp.read_text(encoding="utf-8")); sensors=reg.get("sensors",[]); ids=[s.get("id") for s in sensors]
            out.append(result("registry","SENSOR_IDS_UNIQUE",len(ids)==len(set(ids)) and None not in ids,"Sensor-IDs eindeutig"))
            out.append(result("registry","SENSOR_REGISTER_ONE",all(bool(s.get("register")) for s in sensors),"Alle Sensoren besitzen ein Register"))
            duplicate_sources={}
            for s in sensors:
                key=(s.get("source"),s.get("metric"),s.get("device"))
                if all(key): duplicate_sources.setdefault(key,[]).append(s.get("id"))
            dups={str(k):v for k,v in duplicate_sources.items() if len(v)>1}
            out.append(result("registry","NO_DUPLICATE_MEASUREMENT",not dups,"Keine nachweisbar doppelten Messdefinitionen",severity="WARNING",evidence=json.dumps(dups,ensure_ascii=False,indent=2)))
        except Exception as e: out.append(result("registry","REGISTRY_PARSE",False,"SensorRegistry nicht lesbar",evidence=str(e)))

    if shutil.which("node"):
        for js in ["app/app.js","app/pcap-analyzer.js","public/app.js"]:
            rc, ev=run(["node","--check",js]); out.append(result("syntax",f"NODE_{js.replace('/','_')}",rc==0,f"Node Syntax {js}",evidence=ev))
    else: out.append(result("syntax","NODE_AVAILABLE",False,"Node.js nicht gefunden; Syntaxprüfung nicht ausgeführt",severity="WARNING"))

    rc, ev=run([sys.executable,"tools/release-check.py"])
    out.append(result("release","EXISTING_RELEASE_CHECK",rc==0,"Bestehender Release-Check",evidence=ev))
    rc, ev=run([sys.executable,"tools/migration-preflight.py"])
    out.append(result("release","MIGRATION_PREFLIGHT",rc==0,"Migrations-Preflight",evidence=ev))

    # Runtime-Core-Prüfung: registrierte allgemeine Cores müssen geladen und Consumer-gebunden sein
    try:
        register=json.loads((ROOT/"PROJECT_REGISTER.json").read_text(encoding="utf-8-sig"))
        html_text=(ROOT/"app/index.html").read_text(encoding="utf-8",errors="replace")
        bootstrap_path=ROOT/"framework/core/network-framework-runtime.js"
        bootstrap=bootstrap_path.read_text(encoding="utf-8",errors="replace") if bootstrap_path.exists() else ""
        for core in register.get("generalCores",[]):
            loaded=(core.lower()+".js") in html_text.lower()
            activated=(f"id:'{core}'" in bootstrap or f'id:"{core}"' in bootstrap) and "bindConsumer(id,consumer)" in bootstrap
            out.append(result("framework-runtime",f"CORE_{core.upper()}",loaded and activated,f"{core} geladen, aktiviert und Consumer-gebunden",evidence=f"loaded={loaded}; activated={activated}"))
    except Exception as e:
        out.append(result("framework-runtime","CORE_RUNTIME_AUDIT",False,"Core-Runtime-Prüfung fehlgeschlagen",evidence=str(e)))

    dangerous=[]
    for p in [ROOT/"app/index.html", ROOT/"app/app.js", ROOT/"public/index.html", ROOT/"public/app.js"]:
        if p.exists():
            t=p.read_text(encoding="utf-8",errors="ignore")
            for pattern in [r"eval\s*\(",r"new\s+Function\s*\(",r"document\.write\s*\("]:
                if re.search(pattern,t): dangerous.append(f"{p.relative_to(ROOT)}: {pattern}")
    out.append(result("security-baseline","NO_DANGEROUS_JS",not dangerous,"Keine offensichtlichen gefährlichen JavaScript-Konstrukte",evidence="\n".join(dangerous)))

    pending=[]
    if level=="STABLE":
        for check in ["target-pc","probe-live","router-live"]:
            marker=ROOT/"tuev/evidence"/f"{check}.json"
            ok=False
            if marker.exists():
                try: ok=json.loads(marker.read_text(encoding="utf-8")).get("result")=="PASS"
                except: pass
            out.append(result(check,check.upper().replace('-','_'),ok,f"Nachweis {check}",evidence=str(marker.relative_to(ROOT))))
    return version,out


def write_outputs(level, version, checks, issue_certificate):
    TUEV.mkdir(exist_ok=True); (TUEV/"evidence").mkdir(exist_ok=True)
    blockers=[c for c in checks if c["result"]=="FAIL" and c["severity"]=="BLOCKER"]
    warnings=[c for c in checks if c["result"]=="FAIL" and c["severity"]!="BLOCKER"]
    status="PASS" if not blockers else "FAIL"
    digest, hashes=tree_digest()
    now=dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat()
    cert_id=f"FT-{dt.datetime.now().strftime('%Y%m%d')}-{digest[:12].upper()}"
    report={"schemaVersion":"1.0.0","project":"Netzwerk-Leitstand","version":version,"level":level,"status":status,
            "timestamp":now,"blockers":len(blockers),"warnings":len(warnings),"checks":checks,"treeDigest":digest}
    (TUEV/"report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
    (TUEV/"failures.json").write_text(json.dumps({"blockers":blockers,"warnings":warnings},ensure_ascii=False,indent=2),encoding="utf-8")
    rows="".join(f"<tr><td>{html.escape(c['suite'])}</td><td>{html.escape(c['id'])}</td><td>{c['result']}</td><td>{html.escape(c['text'])}</td></tr>" for c in checks)
    (TUEV/"report.html").write_text(f"<!doctype html><meta charset=utf-8><title>Framework TÜV</title><h1>Framework TÜV – {html.escape(version)}</h1><p>Status: <b>{status}</b> · Stufe: {level} · Blocker: {len(blockers)} · Warnungen: {len(warnings)}</p><table border=1 cellspacing=0 cellpadding=6><tr><th>Suite</th><th>ID</th><th>Status</th><th>Prüfung</th></tr>{rows}</table>",encoding="utf-8")
    if issue_certificate and status=="PASS":
        cert={"schemaVersion":"1.0.0","certificateId":cert_id,"authority":"Framework-TUEV","projectId":"NL","project":"Netzwerk-Leitstand",
              "version":version,"level":level,"usage":"TEST_ONLY" if level=="CANDIDATE" else "PRODUCTION","status":"VALID",
              "issuedAt":now,"treeDigest":digest,"coveredFiles":hashes,"report":"tuev/report.json"}
        (TUEV/"certificate.json").write_text(json.dumps(cert,ensure_ascii=False,indent=2),encoding="utf-8")
        (TUEV/"certificate.txt").write_text(f"FRAMEWORK TÜV\nBESTANDEN\nZertifikat: {cert_id}\nProjekt: Netzwerk-Leitstand V{version}\nStufe: {level}\nNutzung: {cert['usage']}\nPrüfsumme: {digest}\nAusgestellt: {now}\n",encoding="utf-8")
    elif issue_certificate:
        for p in [TUEV/"certificate.json",TUEV/"certificate.txt"]:
            if p.exists(): p.unlink()
    return status, blockers, warnings


def verify():
    cp=TUEV/"certificate.json"
    if not cp.exists(): print("TÜV-SPERRE: Zertifikat fehlt"); return 3
    try: cert=json.loads(cp.read_text(encoding="utf-8"))
    except Exception as e: print("TÜV-SPERRE: Zertifikat ungültig",e); return 3
    current,_=tree_digest()
    if cert.get("status")!="VALID" or cert.get("treeDigest")!=current:
        print("TÜV-SPERRE: Zertifikat passt nicht zum aktuellen Dateistand")
        print("Zertifikat:",cert.get("treeDigest")); print("Aktuell:    ",current); return 4
    print(f"FRAMEWORK TÜV GÜLTIG: {cert.get('certificateId')} ({cert.get('level')}/{cert.get('usage')})")
    return 0


def main():
    ap=argparse.ArgumentParser(); ap.add_argument("mode",choices=["quick","release","verify"]); ap.add_argument("--level",choices=["CANDIDATE","STABLE"],default="CANDIDATE")
    a=ap.parse_args()
    if a.mode=="verify": return verify()
    version,checks=core_checks(a.level)
    status,blockers,warnings=write_outputs(a.level,version,checks,a.mode=="release")
    print(f"FRAMEWORK TÜV {a.mode.upper()} {a.level}: {status} | Blocker={len(blockers)} Warnungen={len(warnings)}")
    for c in blockers: print(f"BLOCKER {c['suite']}/{c['id']}: {c['text']}")
    return 0 if status=="PASS" else 2
if __name__=="__main__": raise SystemExit(main())
