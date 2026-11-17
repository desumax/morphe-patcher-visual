# Morphe Visual Settings Editor (prototype)

An optional, visual front end for Morphe's existing YouTube settings. It does not
add or change any preference. It reads the same keys, defaults and dependencies that
Morphe already declares, and draws a live preview on top of them.

This folder holds stage 1 and 2 of the plan:

1. **`tools/extract_catalogue.py`** reads a checkout of
   [`MorpheApp/morphe-patches`](https://github.com/MorpheApp/morphe-patches) and writes
   `data/catalogue.json`: every preference a YouTube patch puts on a settings screen,
   with its type, default, restart flag, parent dependencies, screen and sub-screen,
   owning patch, source file, title, summaries and list entries.
2. **`web/`** is a phone-sized interactive preview generated from that catalogue.

Native Android work (stage 3) belongs in a fork of `morphe-patches`, not here: this
repository is the patcher engine, and the settings UI lives in the patches repo's
`extensions/shared/.../settings/preference` code.

## Regenerate the catalogue

```sh
git clone --depth 1 https://github.com/MorpheApp/morphe-patches /tmp/morphe-patches
python3 visual-editor/tools/extract_catalogue.py /tmp/morphe-patches visual-editor/data/catalogue.json
cp visual-editor/data/catalogue.json visual-editor/web/catalogue.json
```

The extractor is static (regex plus a bracket-aware call scanner over the Kotlin
sources). Each entry records `locationConfidence`:

| value | meaning |
| --- | --- |
| `exact` | the preference is written inside a `PreferenceScreen.X.addPreferences(...)` call or a known screen helper |
| `variable` | it is added to a collection that is later handed to a screen |
| `factory` | a shared patch receives the screen as a parameter from its YouTube caller |
| `file-helper`, `file-screen` | inferred from the only screen the file mentions |
| `unresolved` | no screen found (5 of 759 at the time of writing: GmsCore, link handling, settings name, export folder) |

## Run the preview

```sh
cd visual-editor/web && python3 -m http.server 8000
```

## How the preview is built

* `SECTIONS` maps the 12 Live View tabs to catalogue screens and sub-screens.
* `ADAPTERS` (the `def(...)` calls in `app.js`) lists which keys have a visual adapter
  and of which kind: `VisibilityPreview`, `OverlayPreview`, `GesturePreview`,
  `LayoutPreview`, `StylePreview`, `BehaviourPreview`.
* Every preference without an adapter falls back to its ordinary widget, under the
  Misc heading of its section, or under the Misc tab when no section claims its screen.
  New Morphe preferences therefore show up automatically after regenerating the catalogue.

Round 2 adds: a screen picker pill instead of tabs, restart prompt only when leaving the
editor, "Take me there" for settings blocked by another setting (and back again once it is
enabled), Animated / Static grouping, standard black-canvas scenario animations for settings
with no on-screen effect (haptics vibrate the device in sync), a looping first-run tutorial,
device presets and UI scale, and Morphe Manager's colours, shapes and motion timings.

Round 3 adds a YouTube version picker. Layouts and defaults follow the patched build, using
the same version checks as Settings.java (action bar layout on 21.36+, miniplayer types on
21.29+). It also adds SponsorBlock, fullscreen gesture, swipe overlay, miniplayer gesture and
glass navigation bar adapters. Scenario animations use a rotating device (`rotate()`) and show
the change from the previous value to the new one.

Round 4 makes version awareness generic. The extractor now reads, from morphe-patches:
the `is_X_Y_or_greater` guards around each preference registration (`when`), version-specific
option arrays (`entryVariants`), version-dependent defaults in Settings.java (`versionDefault`),
each setting's `Setting.Availability` rule translated to a small JS expression (`availability`,
`availabilityParents`), and the supported YouTube versions from `Constants.kt`
(`youtubeVersions`). The editor hides settings the chosen version does not have, offers only
its options, and greys out settings exactly when the app would. In the native port the app
knows its own version, so the picker goes away. Hidden components now always collapse (as Litho
filters do in the real app), with a size animation when they are switched off or on.

Interaction model: tap selects (and plays a demo for gestures and behaviours),
long-press switches the setting, tapping a hidden component shows it for a moment
without changing the setting, and Original / Modified compares stock YouTube with
the current settings.
