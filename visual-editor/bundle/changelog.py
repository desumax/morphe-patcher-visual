#!/usr/bin/env python3
"""Drafts the CHANGELOG.md entry Morphe Manager shows for a test release of the visual editor.

Usage: changelog.py --version 0.1.N [--since REF] [--date YYYY-MM-DD]   draft the entry (test N)
       changelog.py --version 0.1.N --publish                          after tidying it

Versions have no "-" suffix: Manager reads any version with a "-" as a prerelease and leaves it out
of a stable source's changelog, so a "0.1.0-test.N" release never got its own entry and Manager fell
back to the feed's description. Test N is 0.1.N, tagged v0.1.N (the tag Manager links to).

Reads the commits since the last release tag (v0.1.*, or the older visual-editor-test-*, or --since) that touch the
editor, splits each subject into its changes ("a; b; c"), sorts them into Features, Bug Fixes and
Performance Improvements by their wording, and puts the entry at the top of the repo-root
CHANGELOG.md, in the conventional-changelog form Manager parses:

    # [0.1.13](https://github.com/<repo>/compare/v0.1.12...v0.1.13) (2026-11-24)
    ### Features
    * **YouTube - Visual settings editor:** Option pills glide between choices

The draft is approximate on purpose: before each release, read it once and tidy it (merge
duplicates, drop internal notes, reword for users), then commit it with the feed.
"""
import argparse
import re
import subprocess
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
REPO = "desumax/morphe-patcher-visual"
TAG_PREFIX = "visual-editor-"  # tags of the old 0.1.0-test.N releases
VERSION = re.compile(r"^0\.1\.(\d+)$")
SCOPE = "YouTube - Visual settings editor"
PATHS = ["visual-editor", "patches-bundle.json"]

# Wording that marks a change as a fix or a speed-up; everything else counts as a feature.
FIX = re.compile(r"\b(fix\w*|bug\w*|crash\w*|broken|repair\w*|restor\w*|no longer|stops?|regress\w*|wrong|missing|correct\w*)\b", re.I)
PERF = re.compile(r"\b(perf\w*|faster|speed\w*|cheaper|lighter|smooth\w*|lag\w*|jank|fewer (layouts|redraws)|cach\w*)\b", re.I)
# Commits that are bookkeeping, not changes a tester would notice.
SKIP = re.compile(r"^(merge\b|revert \"|wip\b|fixup!|squash!)|\[skip ci]|^manager feed|^chore\b|changelog", re.I)
INTERNAL = re.compile(r"\b(refactor\w*|dead code|bytecode|__pycache__|gitignore|readme|memory|docs?)\b", re.I)


def git(*args):
    return subprocess.run(["git", *args], cwd=ROOT, check=True, capture_output=True, text=True).stdout.strip()


def last_tag():
    try:
        return git("describe", "--tags", "--abbrev=0", "--match", "v0.1.*", "--match", TAG_PREFIX + "*", "HEAD")
    except subprocess.CalledProcessError:
        return None


def tag_for(version):
    return "v" + version


def check(version):
    if not VERSION.match(version):
        sys.exit(f"{version}: use 0.1.N for test N. Manager hides versions with a '-' from a stable "
                 "source's changelog, so they never get an entry of their own")


def changes(since):
    rng = f"{since}..HEAD" if since else "HEAD"
    log = git("log", "--no-merges", "--format=%s", rng, "--", *PATHS)
    seen, out = set(), []
    for subject in log.splitlines():
        subject = re.sub(r"^\w+(\([^)]*\))?!?:\s*", "", subject.strip())  # drop "feat(x):" style prefixes
        subject = re.sub(r"^visual editor:\s*", "", subject, flags=re.I)  # the scope already says so
        if not subject or SKIP.search(subject):
            continue
        head, _, rest = subject.partition(": ")
        # "Glass: a; b" -> "Glass: a", "Glass: b"; a leading topic stays with each part
        topic = head if rest and len(head) <= 24 and " " not in head.strip() else None
        parts = (rest if topic else subject).split(";")
        for part in parts:
            text = part.strip().rstrip(".")
            if not text or INTERNAL.search(text):
                continue
            text = text[0].upper() + text[1:]
            if topic and topic.lower() not in text.lower():
                text = f"{topic}: {text}"
            key = text.lower()
            if key not in seen:
                seen.add(key)
                out.append(text)
    return out


HEADING = re.compile(r"^# \[([^\]]+)\]\([^)]*\) \((\d{4}-\d{2}-\d{2})\)\s*$")


def releases(text):
    """CHANGELOG.md as [(version, date, {section: [bullet text]})], newest first."""
    out, cur, sec = [], None, None
    for line in text.splitlines():
        m = HEADING.match(line)
        if m:
            cur = (m.group(1), m.group(2), {})
            out.append(cur)
            sec = None
        elif cur and line.startswith("### "):
            sec = line[4:].strip()
            cur[2].setdefault(sec, [])
        elif cur and sec and line.startswith("* "):
            cur[2][sec].append(re.sub(r"^\* (\*\*[^*]+:\*\* )?", "", line).strip())
    return out


def short(version):
    m = VERSION.match(version)
    return f"Test {m.group(1)}" if m else version  # "0.1.13" -> "Test 13"


def publish(version):
    """Points the Manager feed and the release notes at version, from its CHANGELOG.md entry.

    Manager shows each CHANGELOG.md release as its own collapsible entry, and falls back to the
    feed's description as one entry when it can't read the file. So the description holds this
    release only: history there would show as one entry with every release inside it.
    """
    import json
    rel = releases((ROOT / "CHANGELOG.md").read_text(encoding="utf-8"))
    if not rel or rel[0][0] != version:
        sys.exit(f"CHANGELOG.md must start with {version}: draft and tidy it first")

    def block(r, heading):
        lines = [heading] if heading else []
        for sec, items in r[2].items():
            if items:
                lines += ["", f"**{sec}**"] + [f"- {x}" for x in items]
        return "\n".join(lines)

    tag = tag_for(version)
    notes = block(rel[0], None) + (
        f"\n\nAdd https://github.com/{REPO} as a patch source in Morphe Manager (Expert mode, together "
        "with Morphe Patches). Full history: CHANGELOG.md.")
    (HERE / "release-notes.md").write_text(notes + "\n", encoding="utf-8")
    desc = block(rel[0], f"### {short(version)} ({rel[0][1]})")
    feed = ROOT / "patches-bundle.json"
    data = json.loads(feed.read_text(encoding="utf-8")) if feed.exists() else {}
    data.pop("signature_download_url", None)
    data.update(version=version, created_at=time.strftime("%Y-%m-%dT%H:%M:%S"), description=desc,
                download_url=f"https://github.com/{REPO}/releases/download/{tag}/morphe-visual-editor-{version}.mpp")
    feed.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
    print(f"Feed and visual-editor/bundle/release-notes.md now describe {version} (use --notes-file for gh release create)")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--version", required=True)
    ap.add_argument("--publish", action="store_true",
                    help="after tidying: point patches-bundle.json and release-notes.md at this version's entry")
    ap.add_argument("--since", help="git ref of the previous release (default: the last visual-editor-test-* tag)")
    ap.add_argument("--date", default=time.strftime("%Y-%m-%d"))
    args = ap.parse_args()
    check(args.version)
    if args.publish:
        return publish(args.version)

    since = args.since or last_tag()
    items = changes(since)
    if not items:
        sys.exit(f"No editor changes since {since or 'the first commit'}")
    groups = {"Features": [], "Bug Fixes": [], "Performance Improvements": []}
    for text in items:
        kind = "Bug Fixes" if FIX.search(text) else "Performance Improvements" if PERF.search(text) else "Features"
        groups[kind].append(text)

    tag = tag_for(args.version)
    link = f"https://github.com/{REPO}/compare/{since}...{tag}" if since else f"https://github.com/{REPO}/releases/tag/{tag}"
    lines = [f"# [{args.version}]({link}) ({args.date})", ""]
    for title, texts in groups.items():
        if texts:
            lines += ["", f"### {title}", ""] + [f"* **{SCOPE}:** {t}" for t in texts] + [""]
    entry = "\n".join(lines).rstrip() + "\n\n\n"

    log = ROOT / "CHANGELOG.md"
    old = log.read_text(encoding="utf-8") if log.exists() else ""
    if f"# [{args.version}]" in old:
        sys.exit(f"CHANGELOG.md already has {args.version}: edit it there")
    # newest first, below the file's intro (everything before the first release heading)
    at = old.find("\n# [")
    head, rest = (old[:at + 1], old[at + 1:]) if at >= 0 else (old.rstrip() + "\n\n\n" if old.strip() else "", "")
    log.write_text(head + entry + rest, encoding="utf-8")
    print(f"Drafted {sum(map(len, groups.values()))} changes since {since or 'the start'} at the top of CHANGELOG.md. "
          "Read and tidy it before the release.")


if __name__ == "__main__":
    main()
