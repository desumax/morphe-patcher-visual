#!/usr/bin/env python3
"""Compare the web editor's preview hints with a Morphe release.

Usage: check_drift.py <catalogue.json>

Make the catalogue from the release first: extract_catalogue.py <morphe-patches checkout> <catalogue.json>.
The web editor names settings in its scenes, animations and placement rules (web/js/*.js). This
prints every setting it names that the release no longer has (renamed or removed upstream), and
every name prefix ("morphe_swipe_") that no longer matches any setting. Neither breaks the editor:
a hint for a missing setting is never drawn, and settings without hints are shown as plain rows.
The report only says which hints to update. Exits with 1 when something is out of date, so it can
run in CI after each upstream release.
"""
import json
import re
import sys
from pathlib import Path

WEB_JS = Path(__file__).resolve().parent.parent / "web" / "js"

cat = json.load(open(sys.argv[1], encoding="utf-8"))
keys = {p["key"] for p in cat["preferences"]}
# Rows the editor adds itself (boot.js): SponsorBlock's segment categories, built by Morphe in code.
scen = (WEB_JS / "scenarios.js").read_text(encoding="utf-8")
m = re.search(r"const SB_CATS = (\[.*?\]);", scen)
keys |= {"morphe_sb_" + c[0] for c in json.loads(m.group(1))} if m else set()

named, prefixes = {}, {}
for f in sorted(WEB_JS.glob("*.js")):
    for hit in re.finditer(r"""["'`](morphe_[a-z0-9_]+)["'`]""", f.read_text(encoding="utf-8")):
        k = hit.group(1)
        (prefixes if k.endswith("_") else named).setdefault(k, set()).add(f.name)

gone = sorted(k for k in named if k not in keys)
dead = sorted(p for p in prefixes if not any(k.startswith(p) for k in keys))
print(f"{len(keys)} settings in the release, {len(named)} named by the web editor, {len(prefixes)} name prefixes")
print(f"\nNamed by the editor but gone upstream ({len(gone)}):")
for k in gone:
    print("  -", k, "(" + ", ".join(sorted(named[k])) + ")")
print(f"\nName prefixes that match nothing ({len(dead)}):")
for p in dead:
    print("  -", p + "*", "(" + ", ".join(sorted(prefixes[p])) + ")")
sys.exit(1 if gone or dead else 0)
