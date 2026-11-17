#!/usr/bin/env python3
"""
Extracts a machine-readable catalogue of every YouTube preference that
Morphe patches expose, by statically reading a checkout of morphe-patches:

  * extensions/**/Settings*.java      -> key, type, default, reboot, parents
  * patches/**/*.kt                   -> which patch adds it, preference widget,
                                         settings screen / sub-screen
  * addresources/values/**/strings.xml -> titles, summaries, list entries

Usage: extract_catalogue.py <morphe-patches checkout> <out.json>

Nothing here modifies Morphe. The output is the single source of truth the
visual editor reads; anything the editor has no adapter for falls back to
the "Misc" list automatically.
"""
import json, re, sys, subprocess, xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(sys.argv[1]).resolve()
OUT = Path(sys.argv[2])

# --------------------------------------------------------------- strings
def load_strings():
    strings, arrays = {}, {}
    base = ROOT / "patches/src/main/resources/addresources/values"
    for sub in ("shared", "shared-youtube", "youtube", "sponsorblock"):
        for f in ("strings.xml", "arrays.xml"):
            p = base / sub / f
            if not p.exists():
                continue
            tree = ET.parse(p)
            for el in tree.getroot().iter():
                name = el.get("name")
                if not name:
                    continue
                if el.tag == "string":
                    v = "".join(el.itertext()).strip()
                    if len(v) > 1 and v[0] == '"' and v[-1] == '"': v = v[1:-1]
                    strings[name] = v.replace("\\'", "'").replace('\\"', '"').replace("\\n", "\n")
                elif el.tag == "string-array":
                    arrays[name] = [ "".join(i.itertext()).strip() for i in el.findall("item") ]
    return strings, arrays

STRINGS, ARRAYS = load_strings()

def res(s):
    if s and s.startswith("@string/"):
        return STRINGS.get(s[8:], s)
    return s

# --------------------------------------------------------------- java settings
SETTING_RE = re.compile(
    r'public\s+static\s+final\s+(\w+)(?:<[^>]*>)?\s+(\w+)\s*=\s*new\s+(\w+)(?:<[^>]*>)?\(\s*"([^"]+)"\s*,(.*?)\);\s*$',
    re.S | re.M)

def split_top(s):
    out, depth, cur, q = [], 0, "", None
    for ch in s:
        if q:
            cur += ch
            if ch == q: q = None
            continue
        if ch in "\"'": q = ch
        elif ch in "([{<": depth += 1
        elif ch in ")]}>": depth -= 1
        if ch == "," and depth == 0:
            out.append(cur.strip()); cur = ""
        else:
            cur += ch
    if cur.strip(): out.append(cur.strip())
    return out

def norm_default(t, raw):
    raw = raw.strip()
    if raw in ("TRUE", "true", "Boolean.TRUE"): return True
    if raw in ("FALSE", "false", "Boolean.FALSE"): return False
    if t in ("IntegerSetting", "LongSetting"):
        try: return int(raw.rstrip("L"))
        except ValueError: return raw
    if t == "FloatSetting":
        try: return float(raw.rstrip("f"))
        except ValueError: return raw
    if t == "StringSetting":
        m = re.fullmatch(r'"(.*)"', raw, re.S)
        return bytes(m.group(1), "utf-8").decode("unicode_escape") if m else raw
    if t == "EnumSetting":
        m = re.search(r'\.(\w+)$', raw)
        return m.group(1) if m else raw
    return raw

def load_settings():
    files = [
        "extensions/shared/library/src/main/java/app/morphe/extension/shared/settings/SharedSettings.java",
        "extensions/shared-youtube/library/src/main/java/app/morphe/extension/shared/settings/SharedYouTubeSettings.java",
        "extensions/youtube/src/main/java/app/morphe/extension/youtube/settings/Settings.java",
    ]
    settings, field_to_key = {}, {}
    for f in files:
        text = (ROOT / f).read_text()
        # remember the "// Section" comment that precedes each declaration
        section = None
        for line_no, line in enumerate(text.splitlines()):
            pass
        sections = [(m.start(), m.group(1).strip()) for m in re.finditer(r'^\s*//\s*([A-Z][^\n]{0,40})$', text, re.M)]
        for m in SETTING_RE.finditer(text):
            decl_t, field, cls, key, rest = m.groups()
            args = split_top(rest)
            default = norm_default(cls, args[0]) if args else None
            flags = [a for a in args[1:] if a in ("true", "false", "TRUE", "FALSE")]
            dialog = next((a.strip('"') for a in args[1:] if a.startswith('"')), None)
            avail = next((a for a in args[1:] if "parent" in a or "Availability" in a), None)
            sec = None
            for pos, name in sections:
                if pos < m.start(): sec = name
            settings[key] = {
                "key": key, "field": field,
                "type": cls.replace("Setting", "").lower(),
                "default": default,
                "rebootApp": flags[0].lower() == "true" if flags else False,
                "includeWithImport": (flags[1].lower() == "true") if len(flags) > 1 else True,
                "dialog": res("@string/" + dialog) if dialog else None,
                "availability": avail,
                "sourceSection": sec,
                "sourceFile": f.split("/")[-1],
            }
            field_to_key[field] = key
    # resolve parent(FIELD) references into keys
    for s in settings.values():
        a = s.get("availability")
        if not a: continue
        deps = []
        for kind, inner in re.findall(r'(parentsAll|parentsAny|parentNot|parent)\(([^()]*(?:\([^()]*\))?[^()]*)\)', a):
            for tok in re.findall(r'\b[A-Z][A-Z0-9_]+\b', inner):
                if tok in field_to_key:
                    deps.append({"key": field_to_key[tok], "mode": "not" if kind == "parentNot" else ("any" if kind == "parentsAny" else "all")})
        s["parents"] = deps
        s["customAvailability"] = re.findall(r'new (\w+Availability)', a)
    return settings

SETTINGS = load_settings()

# --------------------------------------------------------------- kotlin prefs
PREF_TYPES = {"SwitchPreference", "ListPreference", "TextPreference", "NonInteractivePreference",
              "IntentPreference", "PreferenceScreenPreference", "PreferenceCategory"}
SCREEN_HELPERS = {
    "addPlayerOverlayPreferences": ("PLAYER", "morphe_overlay_buttons_screen"),
    "addPlayerFlyoutMenuPreferences": ("PLAYER", "morphe_hide_player_flyout"),
    "addShortsPlayerPreferences": ("SHORTS", "morphe_shorts_player_screen"),
}

def scan_calls(text):
    """Return list of (callee, open_idx, close_idx) for every call, ignoring strings/comments."""
    calls, stack = [], []
    i, n = 0, len(text)
    while i < n:
        c = text[i]
        if text.startswith("//", i):
            i = text.find("\n", i); i = n if i < 0 else i; continue
        if text.startswith("/*", i):
            i = text.find("*/", i); i = n if i < 0 else i + 2; continue
        if text.startswith('"""', i):
            j = text.find('"""', i + 3); i = n if j < 0 else j + 3; continue
        if c == '"':
            j = i + 1
            while j < n and text[j] != '"':
                j += 2 if text[j] == "\\" else 1
            i = j + 1; continue
        if c == "(":
            m = re.search(r'([\w.]+)\s*(?:<[\w<>, ?]*>)?\s*$', text[max(0, i - 120):i])
            stack.append([m.group(1) if m else "", i, None])
        elif c == ")" and stack:
            e = stack.pop(); e[2] = i; calls.append(tuple(e))
        i += 1
    return calls

def first_string_arg(text, open_idx, close_idx):
    body = text[open_idx + 1:close_idx]
    m = re.match(r'\s*"([^"]+)"', body)
    if m: return m.group(1)
    m = re.search(r'\bkey\s*=\s*"([^"]+)"', body)
    return m.group(1) if m else None

def named_arg(body, name):
    m = re.search(r'\b%s\s*=\s*"([^"]+)"' % name, body)
    return m.group(1) if m else None

PATCH_NAME_RE = re.compile(r'(?:val\s+(\w+)\s*=\s*)?(?:bytecodePatch|resourcePatch|patch)\s*\(\s*name\s*=\s*"([^"]+)"(?:\s*,\s*description\s*=\s*((?:"[^"]*"\s*\+?\s*)+))?', re.S)

SCREEN_REF = re.compile(r'\bPreferenceScreen\.([A-Z][A-Z_]+)\b')

def build_indirections(files, texts):
    """Preference groups (global mutable sets) and shared factories that receive a screen."""
    groups, factories = {}, {}
    for f in files:
        text = texts[f]
        for g in re.findall(r'(?:internal|private)?\s*val\s+(\w+)\s*=\s*mutable(?:Set|List)Of<BasePreference>\(\)', text):
            groups[g] = f
        if "/shared/" in str(f) and re.search(r'preferenceScreen\s*:\s*BasePreferenceScreen\.Screen', text):
            for fn in re.findall(r'fun\s+(\w+)\s*\(', text):
                factories[fn] = f
    factory_screen = {}
    for fn, sf in factories.items():
        for f in files:
            if "/youtube/" not in str(f): continue
            t = texts[f]
            m = re.search(r'\b%s\s*\((.*?)\n\)' % fn, t, re.S)
            if m:
                sm = re.search(r'preferenceScreen\s*=\s*PreferenceScreen\.([A-Z][A-Z_]+)', m.group(1)) or SCREEN_REF.search(m.group(1))
                if sm: factory_screen.setdefault(sf, sm.group(1))
    return groups, factory_screen

def resolve_var(var, f, texts, calls_cache, groups):
    """Find where a preference collection variable is handed to a settings screen."""
    search = [f] + ([groups[var]] if var in groups and groups[var] != f else [])
    for sf in search:
        text = texts[sf]
        calls = calls_cache.setdefault(sf, scan_calls(text))
        for m in re.finditer(r'\b%s\b' % re.escape(var), text):
            enc = sorted([e for e in calls if e[1] < m.start() < e[2]], key=lambda e: -e[1])
            screen = sub = None
            for cal, eo, ec in enc:
                cb = cal.split(".")[-1]
                if cb == "PreferenceScreenPreference" and not sub:
                    sub = first_string_arg(text, eo, ec)
                mm = re.match(r'PreferenceScreen\.([A-Z_]+)\.addPreferences', cal)
                if mm: screen = mm.group(1); break
                if cb in SCREEN_HELPERS:
                    screen, hs = SCREEN_HELPERS[cb]; sub = sub or hs; break
            if screen: return screen, sub
    # Group consumed indirectly (e.g. captions split the group into categories):
    # fall back to the single sub-screen its defining file adds.
    if var in groups:
        m = re.findall(r'PreferenceScreen\.([A-Z][A-Z_]+)\.addPreferences\(\s*PreferenceScreenPreference\(\s*key\s*=\s*"([^"]+)"', texts[groups[var]])
        if len(m) == 1: return m[0]
    return None

def load_prefs():
    prefs = {}
    kt_root = ROOT / "patches/src/main/kotlin/app/morphe/patches"
    files = list((kt_root / "youtube").rglob("*.kt")) + list((kt_root / "shared").rglob("*.kt"))
    texts = {f: f.read_text() for f in files}
    GROUPS, FACTORY_SCREEN = build_indirections(files, texts)
    calls_cache = {}
    for f in files:
        text = texts[f]
        rel = str(f.relative_to(ROOT))
        calls = calls_cache.setdefault(f, scan_calls(text))
        patch_names = [(m.start(), m.group(2), re.sub(r'"\s*\+\s*"', "", (m.group(3) or "")).strip().strip('"')) for m in PATCH_NAME_RE.finditer(text)]
        file_screens = sorted(set(SCREEN_REF.findall(text)) - {"SHORTS_PLAYER"})
        file_helpers = [h for h in SCREEN_HELPERS if re.search(r'\b%s\(' % h, text)]
        for callee, o, c in calls:
            base = callee.split(".")[-1]
            if base not in PREF_TYPES: continue
            key = first_string_arg(text, o, c)
            if not key: continue
            body = text[o + 1:c]
            # enclosing calls (innermost first)
            enclosing = sorted([e for e in calls if e[1] < o and e[2] > c], key=lambda e: -e[1])
            screen = sub = category = None
            for cal, eo, ec in enclosing:
                cb = cal.split(".")[-1]
                mm = re.match(r'PreferenceScreen\.([A-Z_]+)\.addPreferences', cal)
                if mm and not screen: screen = mm.group(1)
                if cb in SCREEN_HELPERS and not screen:
                    screen, hs = SCREEN_HELPERS[cb]; sub = sub or hs
                if cb == "PreferenceScreenPreference" and not sub:
                    sub = first_string_arg(text, eo, ec)
                if cb == "PreferenceCategory" and not category:
                    category = first_string_arg(text, eo, ec)
            confidence = "exact" if screen else None
            if not screen:
                var = None
                for cal, eo, ec in enclosing:
                    head = cal.split(".")[0]
                    if head in GROUPS or (cal.endswith((".add", ".addAll")) and head):
                        var = head; break
                colls = [e for e in enclosing if e[0].split(".")[-1] in ("mutableSetOf", "setOf", "arrayOf", "listOf", "mutableListOf")]
                if not var and colls:
                    outer = colls[-1]
                    vm = re.findall(r'\bval\s+(\w+)\s*=', text[max(0, outer[1] - 300):outer[1]])
                    if vm: var = vm[-1]
                if not var:
                    gm = re.search(r'(\w+)\s*(?:\+=|\.add)\s*\(?\s*$', text[max(0, o - 200):o].rsplit(base, 1)[0])
                    if gm: var = gm.group(1)
                if var:
                    r = resolve_var(var, f, texts, calls_cache, GROUPS)
                    if r:
                        screen, vs = r; sub = sub or vs; confidence = "variable"
            if not screen and f in FACTORY_SCREEN:
                screen = FACTORY_SCREEN[f]; confidence = "factory"
            if not screen and file_helpers:
                screen, hs = SCREEN_HELPERS[file_helpers[0]]; sub = sub or hs; confidence = "file-helper"
            if not screen and len(file_screens) == 1:
                screen = file_screens[0]; confidence = "file-screen"
            pname = pdesc = None
            for pos, nm, ds in patch_names:
                if pos < o or pname is None: pname, pdesc = nm, ds
                if pos > o: break
            entry = prefs.setdefault(key, {"key": key, "widget": base, "occurrences": []})
            entry["occurrences"].append({
                "file": rel, "screen": screen, "subScreen": sub if sub != key else None,
                "category": category, "confidence": confidence or "unresolved",
                "patch": pname, "patchDescription": pdesc,
                "summary": "summary = false" not in body,
                "entriesKey": named_arg(body, "entriesKey"),
                "entryValuesKey": named_arg(body, "entryValuesKey"),
                "tag": named_arg(body, "tag"),
                "titleKey": named_arg(body, "titleKey"),
                "summaryKey": named_arg(body, "summaryKey"),
            })
    return prefs

PREFS = load_prefs()

# --------------------------------------------------------------- merge
SCREEN_TITLES = {
    "ADS": "Ads", "DEARROW": "DeArrow", "FEED": "Feed", "GENERAL": "General", "MISC": "Miscellaneous",
    "PLAYER": "Player", "RETURN_YOUTUBE_DISLIKE": "Return YouTube Dislike", "SEEKBAR": "Seekbar",
    "SHORTS": "Shorts", "SPONSORBLOCK": "SponsorBlock", "SWIPE_CONTROLS": "Swipe controls", "VIDEO": "Video",
}

def best_occ(occs):
    order = {"exact": 0, "variable": 1, "factory": 1, "file-helper": 2, "file-screen": 3, "unresolved": 4}
    return sorted(occs, key=lambda o: order[o["confidence"]])[0]

catalogue = []
for key, p in PREFS.items():
    if p["widget"] in ("PreferenceCategory",):
        continue
    o = best_occ(p["occurrences"])
    s = SETTINGS.get(key, {})
    ek = o["entriesKey"] or (key + "_entries")
    evk = o["entryValuesKey"] or (key + "_entry_values")
    entries = [res(x) for x in ARRAYS.get(ek, [])]
    values = ARRAYS.get(evk, [])
    item = {
        "key": key,
        "title": STRINGS.get(o["titleKey"] or "") or STRINGS.get(key + "_title") or STRINGS.get(key),
        "summary": STRINGS.get(o["summaryKey"] or "") or STRINGS.get(key + "_summary"),
        "summaryOn": STRINGS.get(key + "_summary_on"),
        "summaryOff": STRINGS.get(key + "_summary_off"),
        "widget": p["widget"],
        "type": s.get("type") or ("screen" if p["widget"] == "PreferenceScreenPreference" else None),
        "default": s.get("default"),
        "rebootApp": s.get("rebootApp", False),
        "dialog": s.get("dialog"),
        "parents": s.get("parents", []),
        "customAvailability": s.get("customAvailability", []),
        "screen": o["screen"],
        "screenTitle": SCREEN_TITLES.get(o["screen"]),
        "subScreen": o["subScreen"],
        "subScreenTitle": STRINGS.get((o["subScreen"] or "") + "_title"),
        "category": o["category"],
        "patch": o["patch"],
        "patchDescription": o["patchDescription"],
        "sourceFile": o["file"],
        "locationConfidence": o["confidence"],
        "versionVariants": len(p["occurrences"]),
    }
    if entries:
        item["entries"] = [{"label": l, "value": v} for l, v in zip(entries, values or entries)]
    catalogue.append(item)

catalogue.sort(key=lambda x: (x["screen"] or "~", x["subScreen"] or "", x["key"]))
rev = subprocess.run(["git", "-C", str(ROOT), "log", "-1", "--format=%h %cs"], capture_output=True, text=True).stdout.strip()
internal = sorted(k for k in SETTINGS if k not in PREFS)
out = {
    "source": "MorpheApp/morphe-patches@" + rev,
    "generatedBy": "visual-editor/tools/extract_catalogue.py",
    "counts": {
        "preferences": len(catalogue),
        "settingsDeclared": len(SETTINGS),
        "internalOnly": len(internal),
        "unresolvedScreen": sum(1 for c in catalogue if not c["screen"]),
    },
    "screens": SCREEN_TITLES,
    "preferences": catalogue,
    "internalSettings": internal,
}
OUT.write_text(json.dumps(out, indent=1, ensure_ascii=False))
print(json.dumps(out["counts"]))
