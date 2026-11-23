#!/usr/bin/env python3
"""Compare the visual editor's preview map with a Morphe release.

Usage: check_preview_map.py <catalogue.json> <preview_map.json>

Make the catalogue from the release first: extract_catalogue.py <morphe-patches checkout> <catalogue.json>.
Prints the map entries whose setting is gone (renamed or removed upstream) and the settings
the map does not know yet. Neither breaks the editor: stale entries are skipped at runtime and
unknown settings are shown as plain rows. The report only says which animations to update.
Exits with 1 when the map is out of date, so it can run in CI after each upstream release.
"""
import json
import re
import sys
from pathlib import Path

cat = json.load(open(sys.argv[1]))
pmap = json.load(open(sys.argv[2]))
live = {p["key"] for p in cat["preferences"] if not p.get("synthetic")}
# Rows the catalogue makes itself for settings Morphe builds in code (SponsorBlock's categories):
# not in morphe_prefs.xml, so not "upstream" for this report, but not gone either.
synthetic = {p["key"] for p in cat["preferences"] if p.get("synthetic")}
# the preview adds those rows at start-up from SB_CATS (web/js/scenarios.js) when the catalogue lacks them
sb = Path(__file__).resolve().parent.parent / "web" / "js" / "scenarios.js"
m = re.search(r"const SB_CATS = (\[.*?\]);\n", sb.read_text(encoding="utf-8")) if sb.exists() else None
if m:
    synthetic |= {"morphe_sb_" + c[0] for c in json.loads(m.group(1))}
mapped = set(pmap["entries"])
stale = sorted(mapped - live - synthetic)
new = sorted(k for k in live - mapped)
print(f"{len(live)} settings upstream, {len(mapped)} in the preview map")
print(f"\nIn the map but gone upstream ({len(stale)}), skipped at runtime:")
for k in stale:
    print("  -", k)
print(f"\nUpstream but not in the map ({len(new)}), shown as plain rows:")
for k in new:
    print("  +", k)
sys.exit(1 if stale else 0)
