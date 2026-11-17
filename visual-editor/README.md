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

Round 5 reworks the editor for less clutter. The default look now matches YouTube's own settings
screens, and Morphe Manager's Material 3 look is an experimental toggle at the end of the screen
menu. A search button in the top bar finds any setting live and jumps to it. Settings that depend
on another setting on the same screen sit under it as offset sub-options. They show only while
the parent is on, and they can be folded away. A locked row only appears when you jump to a hidden
sub-option, and an unlock animation plays when its dependency is met. Each screen has a Reset
button. New screens cover Ads, App look, Snackbar, Playback and DeArrow. Scenario animations place
buttons where the live preview draws them (`anchor()`). The extractor now reads only a
preference's own `titleKey`, not one from a nested child, which fixes three screen titles.

Interaction model: tap selects (and plays a demo for gestures and behaviours),
long-press switches the setting, tapping a hidden component shows it for a moment
without changing the setting, and Original / Modified compares stock YouTube with
the current settings.

Round 6 polishes the interaction model. Double-tap toggles a setting as well as long-press. When a
setting depends on one that lives on another screen, that setting opens in a popup that names its
original location, and Reset also undoes it. Sub-options grow in and collapse out with the same size
animation, and a parent says "Sub-settings hidden" while its children are folded or unavailable.
Selecting a setting briefly flashes its element on the preview. Hidden Player buttons preview in
place instead of opening the 13-button tray. The YouTube look follows Morphe's own dark theme colour
(AMOLED black, Catppuccin and so on). Screens without a preview sit in a separate "No preview" group in
the screen menu. Seekbar & gestures gains custom thumb, thumbnail preview, gesture hint and live DVR
animations.

Round 7 is a pass over every screen. Picking a setting scrolls its element into view inside the
preview (feeds, sheets and button strips) before it flashes, and the outline is drawn inside when the
element touches the preview edge. The preview scrolls with mouse drag and wheel. Holding a preview
element brings its setting into view while the hold charges. Sub-options nest: a sub-sub-option hides
with its own parent, and `MANUAL_PARENT` adds the few dependencies Morphe does not declare (Create
button vs the swap, navigation bar style vs the glass bar). The screen menu follows Morphe's order, can
be rearranged by holding a card, and has Reset order. Lists Morphe builds at runtime (caption
languages, custom speeds, SponsorBlock segment categories) get representative entries. Playback,
DeArrow and the Description sheet have real previews, and new scenarios cover copying and searching
comments, channel search, text selection, the share sheet, Open Shorts with and pinch to zoom.

Round 8 tightens selection. The live preview has a frame that glows briefly when a setting changes.
Holding to hide or restore a component now scrolls it into view as well: a component that is about to
collapse is brought into view first, and a restored one is centred once it has grown to full size. A
hidden setting that you select stays revealed with a slow red pulse until you pick another setting,
instead of disappearing on a timer. A collapsing component keeps its content clipped until it is gone,
which removes a one-frame flash at the end of the collapse. The channel search scenario was redrawn.

Round 9 is about order and coverage. List rows now follow the position of their component in the preview,
top to bottom and left to right, measured once per screen with every hidden component drawn; settings
without a component follow after. A setting that unlocks when any one of several settings is on (DeArrow
titles in any place, any swipe zone) is no longer nested under the first of them; it stays a normal row,
greyed out until one is on. Component wrappers take over their card's margins and corner radius
(`hugComponents`), so outlines, flashes and ghost dashes hug the card instead of the full preview width.
Narrowing components keep their text on one line and pull in the flex gap. A setting unlocked through the
cross-screen popup gets a "More" button that reopens it, and screen Reset clears that. Popups follow the
YouTube dialog style in the YouTube look. An experimental menu option lists only hidden components: what you
can see is removed in the preview by double-tap or hold. Around a hundred scenario pages were added through a
small kit (`hidePage`, `x7`, `clock7`, `check7`), covering most settings that had no preview.
