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

3. Card menu (Max, test 3): in the app the editor opens on the screen menu as a full-screen page of
   cards (grouped: six group cards filling the screen, then Morphe design / Reset order / Group /
   list design rows). A card opens its live screen; the top bar then shows the title without the
   dropdown arrow and does nothing on tap. Back (key, gesture or arrow) from a screen returns to the
   menu, Back from the menu leaves the editor; the restart prompt only comes then (verified: a
   restart setting changed in Player, Back → menu with no prompt, Back → prompt). Search results
   leave the menu page and open the setting's screen.
4. Opening hitch (Max, test 3): the dialog has no window animation, the settings list behind it is
   hidden while it is open, and the WebView stays transparent on the dark background until the page
   calls `MorpheApp.ready()` after its first drawn frame (fallback 2.5 s), then fades in (160 ms).
   Screen recording: YouTube settings → one dark frame → menu fades in; the Morphe list never shows.
   Opening time (tap to ready): 1.86 s first open after app start, 0.62 s afterwards (emulator).
5. Restart prompt copy: "1 setting only takes effect".

## Parity checks (emulator vs web preview at the same density)
- Option grid (Player icon style), search page, Player screen: same layout; differences come only
  from live values (e.g. Collapse button hidden on the emulator) and live-only setting counts.
- Rows keep their height when a Hide/Show or option changes (12 rows measured before/after).
- Scrolling: 182 frames in 3 s, median 16.7 ms, p95 17.9 ms, none over 33 ms (emulator, host GPU).

## Still open
- The two entry rows both reuse About's info icon (no own icon in the patches resources).
- After typing in search with a hardware keyboard, the back arrow can keep a focus ring.
