#!/usr/bin/env python3
"""Drafts the CHANGELOG.md entry Morphe Manager shows for a test release of the visual editor.

Usage: changelog.py --version 0.1.0-test.N [--since REF] [--date YYYY-MM-DD]

Reads the commits since the last release tag (visual-editor-test-*, or --since) that touch the
editor, splits each subject into its changes ("a; b; c"), sorts them into Features, Bug Fixes and
Performance Improvements by their wording, and puts the entry at the top of the repo-root
CHANGELOG.md, in the conventional-changelog form Manager parses:

    # [0.1.0-test.9](https://github.com/<repo>/compare/visual-editor-test-8...visual-editor-test-9) (2026-11-24)
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

ROOT = Path(__file__).resolve().parents[2]
REPO = "desumax/morphe-patcher-visual"
TAG_PREFIX = "visual-editor-"
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
        return git("describe", "--tags", "--abbrev=0", "--match", TAG_PREFIX + "*", "HEAD")
    except subprocess.CalledProcessError:
        return None


def tag_for(version):
    return TAG_PREFIX + version.split("-", 1)[-1].replace(".", "-")


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


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--version", required=True)
    ap.add_argument("--since", help="git ref of the previous release (default: the last visual-editor-test-* tag)")
    ap.add_argument("--date", default=time.strftime("%Y-%m-%d"))
    args = ap.parse_args()

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
    if old.startswith(f"# [{args.version}]"):
        sys.exit(f"CHANGELOG.md already starts with {args.version}: edit it there")
    log.write_text(entry + old, encoding="utf-8")
    print(f"Drafted {sum(map(len, groups.values()))} changes since {since or 'the start'} at the top of CHANGELOG.md. "
          "Read and tidy it before the release.")


if __name__ == "__main__":
    main()
