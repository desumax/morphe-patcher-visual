# Emulator loop notes (overnight 18–19 Nov 2026)

Setup: AVD `MorpheVE36` (Pixel 7 profile, 1080x2400 @ 420 dpi = 411x914 dp, x86_64 Google APIs API 36,
6 GB RAM). YouTube 21.44.528 (apkpure, has x86_64 libs, so no ARM translation needed), morphe-cli
2.3.0-dev.3, Morphe Patches 2.4.0-dev.2 + this bundle, MicroG-RE 7.3.1-dev.1. Loop scripts live in
`bundle/work-loop/` (git-ignored): `cycle.sh` (build + patch + install on emulator-5554 only),
`nav.sh` (open Morphe settings), `cdp.js` (drives the editor WebView over Chrome DevTools; WebView
debugging is switched on only when `ro.kernel.qemu` is 1, never on a phone), `ref.js` (web preview
reference shots at the same density in Edge).

Cycle time: bundle build 26–46 s, patch 14–21 s, install 4 s (≈ 1 min total).

## Checked and working
- Patched app starts; Morphe settings open; the two rows sit above About; no crash anywhere.
- Editor opens full screen inside the status and navigation bars; first-run tutorial shows.
- Live values load (920 settings; 705 catalogue settings matched on this build).
- Changing a setting in the editor saves it through the Setting API: the regular Morphe list shows it.
- Back key: closes the tutorial, the screen picker, search, then the editor.
- Restart prompt appears when leaving after a restart-needing change; Later closes the editor.

## Fixed
1. Entry switch missing: the toggle copied About's row layout, which has no widget frame. Now the
   switch is added at the end of that same row (EntrySwitch), aligned with the other rows.
2. Live data: `MorpheApp.state()` now returns `meta` per setting (type, default, availability,
   rebootApp, live translated title/summary/summaryOn/summaryOff and list entries from the regular
   settings rows, or morphe_prefs.xml). `MorpheApp.available()` returns current availability, and the
   app pushes it after every change (`morpheAvailability`). The page uses the live text, entries,
   defaults and availability over the catalogue; the catalogue rules stay only as hints for
   "Needs …" / "Take me there". Settings the catalogue doesn't know (25 on Patches 2.4.0-dev.2,
   e.g. PiP actions, DeArrow thumbnails, SponsorBlock colours) appear as plain rows under Misc.
   Verified: Copy video link button on/off locks and unlocks "Copy timestamp by default" exactly as
   `Setting.isAvailable()` and the regular list.

## Still open
- Web copy: "1 setting only take effect after YouTube restarts" (should be "takes").
