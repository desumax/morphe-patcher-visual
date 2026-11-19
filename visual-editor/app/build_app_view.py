#!/usr/bin/env python3
"""Builds the "App view" of the live preview: the exact page the in-app editor loads (web/ plus the
app layer from build_app_web.py), shown inside a phone frame, with a stand-in for the app's bridge.

Usage: build_app_view.py <out_dir>
The output holds appview.html (the frame) and app/ (the in-app page). Publish both next to the
live preview's index.html, so the preview's "App view" button can open it.
"""
import shutil
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
out = Path(sys.argv[1]).resolve()
app = out / "app"
if out.exists():
    shutil.rmtree(out)
out.mkdir(parents=True)
subprocess.run([sys.executable, str(HERE / "build_app_web.py"), str(app)], check=True)

# Stand-in for window.MorpheApp: no live values (the preview's defaults are used), changes stay in
# the page, and leaving or restarting tells the frame, which shows what the app would do.
STUB = """<script>
window.MorpheApp = {
  state: () => JSON.stringify({ values: {}, version: "" }),
  set: () => {}, ready: () => {}, vibrate: ms => { try { navigator.vibrate && Navigator.prototype.vibrate.call(navigator, ms); } catch (e) {} },
  close: () => parent.postMessage({ appview: "close" }, "*"),
  restart: () => parent.postMessage({ appview: "restart" }, "*"),
  disableEditor: () => parent.postMessage({ appview: "disable" }, "*"),
};
</script>
"""
page = (app / "index.html").read_text(encoding="utf-8")
page = page.replace('<script src="js/app-pre.js"></script>', STUB + '<script src="js/app-pre.js"></script>', 1)
assert "window.MorpheApp" in page
(app / "index.html").write_text(page, encoding="utf-8")
shutil.copy2(HERE / "appview.html", out / "appview.html")
print("app view built in", out)
