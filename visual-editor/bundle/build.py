#!/usr/bin/env python3
"""
Builds the Visual settings editor test bundle (.mpp) for Morphe Manager.

It copies MorpheApp/morphe-patches at a release tag, removes every official patch and every
extension the editor doesn't compile against, lays the editor's patch and extension over it, and
runs the official build (`:patches:buildAndroid`). The result holds one patch, "Visual settings
editor", so it can be added in Morphe Manager next to the official Morphe Patches bundle.

Needs: git, JDK 17+, the Android SDK (ANDROID_HOME or local.properties), and a GitHub token with
read:packages for the Morphe Gradle plugin (GITHUB_ACTOR + GITHUB_TOKEN, or gpr.user / gpr.key
in ~/.gradle/gradle.properties).

Usage: build.py --version 0.1.0-test.N [--tag v2.3.0] [--work DIR] [--out DIR]
"""
import argparse
import json
import os
import shutil
import subprocess
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
NATIVE = HERE.parent / "native"
OVERLAY = HERE / "overlay"
UPSTREAM = "https://github.com/MorpheApp/morphe-patches.git"


def run(cmd, cwd=None, env=None):
    print("+", " ".join(str(c) for c in cmd), flush=True)
    subprocess.run([str(c) for c in cmd], cwd=cwd, env=env, check=True)


sys.path.insert(0, str(HERE.parent / "app"))
import outdir  # noqa: E402


def rmtree(path: Path):
    def onerror(func, p, _):
        os.chmod(p, 0o700)
        func(p)
    if path.exists():
        shutil.rmtree(path, onerror=onerror)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--tag", default="v2.3.0", help="morphe-patches release to build against")
    ap.add_argument("--work", default=str(HERE / "work"))
    ap.add_argument("--out", default=str(HERE / "out"))
    ap.add_argument("--version", required=True, help="bundle version, e.g. 0.1.0-test.9 (also names the .mpp)")
    ap.add_argument("--manifest", action="store_true",
                    help="also point patches-bundle.json at this version's release asset (publish that release before pushing the manifest)")
    ap.add_argument("--skip-build", action="store_true", help="only prepare the workspace")
    args = ap.parse_args()

    started = time.time()
    work = Path(args.work).resolve()
    repo = work / "morphe-patches"
    # Only a checkout this tool cloned (marked) is replaced; any other folder there stops the run.
    outdir.clear(repo)
    work.mkdir(parents=True, exist_ok=True)
    run(["git", "clone", "--quiet", "--depth", "1", "--branch", args.tag, UPSTREAM, repo])
    outdir.mark(repo)

    # Upstream's own YouTube compatibility (app identity, supported versions and their minimum
    # Android), kept from the official sources before they are removed, so the editor declares
    # exactly what the official patches support at this tag (see VisualSettingsEditorPatch.kt).
    constants = repo / "patches/src/main/kotlin/app/morphe/patches/youtube/shared/Constants.kt"
    if not constants.exists():
        sys.exit(f"{constants.relative_to(repo)} is missing at {args.tag}: update the editor's compatibility")
    constants_src = constants.read_text(encoding="utf-8")

    # Keep only what the editor builds against: the shared extension library and the patch stubs.
    rmtree(repo / "patches" / "src")
    rmtree(repo / "archive")
    for ext in (repo / "extensions").iterdir():
        if ext.is_dir() and ext.name != "shared":
            rmtree(ext)

    # The editor's sources and build files.
    shutil.copytree(NATIVE / "patches" / "src", repo / "patches" / "src")
    constants.parent.mkdir(parents=True, exist_ok=True)
    constants.write_text(constants_src, encoding="utf-8")
    shutil.copytree(NATIVE / "extensions" / "visualeditor", repo / "extensions" / "visualeditor")
    shutil.copytree(OVERLAY, repo, dirs_exist_ok=True)

    # The designed editor: the web preview plus the in-app scripts, packed into the extension.
    appweb = work / "appweb"
    run([sys.executable, HERE.parent / "app" / "build_app_web.py", appweb])
    run([sys.executable, HERE / "gen_web_assets.py", appweb,
         repo / "extensions/visualeditor/src/main/java/app/morphe/extension/youtube/visualeditor/WebAssets.java"])

    props = repo / "gradle.properties"
    lines = [l for l in props.read_text().splitlines() if not l.startswith("version")]
    props.write_text("\n".join(lines + [f"version = {args.version}", ""]))

    if args.skip_build:
        print("Workspace ready:", repo)
        return

    gradlew = repo / ("gradlew.bat" if os.name == "nt" else "gradlew")
    if os.name != "nt":
        os.chmod(gradlew, 0o755)
    run([gradlew, ":patches:buildAndroid", ":patches:listBundlePatches", "--no-daemon", "--stacktrace"], cwd=repo)

    out = Path(args.out).resolve()
    out.mkdir(parents=True, exist_ok=True)
    built = sorted((repo / "patches/build/libs").glob("*.mpp"), key=lambda p: p.stat().st_mtime)
    if not built:
        sys.exit("No .mpp was built")
    target = out / f"morphe-visual-editor-{args.version}.mpp"
    shutil.copy2(built[-1], target)
    print(f"Built {target} ({target.stat().st_size} bytes) in {time.time() - started:.0f} s")

    if args.manifest:
        # Manager's feed: the version, its .mpp and the release it is attached to must agree.
        tag = "visual-editor-" + args.version.split("-", 1)[-1].replace(".", "-")
        feed = HERE / "patches-bundle.json"
        data = json.loads(feed.read_text(encoding="utf-8"))
        data.update(version=args.version, created_at=time.strftime("%Y-%m-%dT%H:%M:%S"),
                    download_url=f"https://github.com/desumax/morphe-patcher-visual/releases/download/{tag}/{target.name}")
        feed.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
        print(f"patches-bundle.json now points at release {tag}: attach {target.name} to it before pushing")


if __name__ == "__main__":
    main()
