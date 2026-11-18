# Visual settings editor: native patch groundwork

This folder is the starting point for turning the web prototype (`../web`) into a real Morphe
patch. Its folders mirror [morphe-patches](https://github.com/MorpheApp/morphe-patches), so each
file can be copied to the same path in a fork of that repository.

It is groundwork. The structure, the data flow and the interaction rules are in place, but it has
not been compiled against morphe-patches yet, and the live preview drawing still has to be ported
screen by screen from `web/app.js`.

## A front end, not a fork of the settings

The editor is a *wrapper* around the existing settings, or more exactly an alternative front end
(a "view layer") for them. It doesn't copy, move or change any setting:

- **The list of settings is read at runtime** from `res/xml/morphe_prefs.xml`, the same file the
  regular Morphe settings screen inflates (`PreferenceTree`). Titles, summaries, list entries,
  order, screens and dependencies all come from the installed build.
- **Values and availability go through the extension's `Setting` API** (`getSettingFromPath`,
  `get`, `save`, `isAvailable`, `resetToDefault`), the same calls the regular screens make
  (`SettingsBridge`). Parent rules such as "only while X is on" are the developer's own
  `isAvailable()` logic, so they stay right when the developer changes them.
- **The only thing the editor adds is a map of hints**: which preview, and which kind of
  animation, a known setting belongs to (`morphe_visual_editor_preview_map.json`). It is never
  the source of truth: an entry whose setting no longer exists is skipped, and a setting the map
  doesn't know is still listed as a plain row under "More settings".

### Why this matters

The YouTube settings change constantly. From May to November 2026 (about 30 releases),
`Settings.java` went from 414 to 710 settings. 142 were removed, 47 renamed (the SponsorBlock
keys gained the `morphe_` prefix in July) and 50 had their default changed. Some were reworked
from an on/off switch into a list: `disable_continue_watching_prompt` became the three-way
`continue_watching_prompt`.

A design that copied the settings into the editor would break on almost every release. With this
design, a change upstream has at most one visible effect: a new or renamed setting appears without
its animation (as a plain row) until the map is updated. Nothing crashes, no setting goes missing,
and the developer doesn't need to do anything for the editor.

## Touches nothing upstream

| Concern | How it is handled |
| --- | --- |
| Entry at the top of Morphe settings | A new screen made with the public `PreferenceScreen.Screen(...)` API, which every patch uses. Root entries are sorted by key, and `00_0_visual_editor` sorts before `00_about`, so it lands above About. `SettingsPatch.kt` is not edited. |
| The editor's own on switch and two options | `VisualEditorSettings` in the editor's own package. `Settings.java` is not edited. |
| Other patches | Not edited. Each one still reads its own setting. |
| Morphe Manager and the patcher | Not touched. It is an ordinary optional patch, off by default. |

The trade-off is that the on switch sits one tap in, inside the "Visual settings editor" entry,
rather than as a bare switch on the root list. A bare switch there would need a five-line accessor
added to `SettingsPatch.kt`, which is exactly the kind of upstream change this design avoids.

## Keeping the map current

`../tools/check_preview_map.py` compares the map with any Morphe release. Make a catalogue of the
release with `../tools/extract_catalogue.py`, then run the check. It lists the map entries whose
setting is gone and the settings the map doesn't know yet, and exits with 1 when the map is stale.
This can run automatically in CI after each upstream release. Updating the map is the only
recurring maintenance, and the editor keeps working while it waits.

## Files

| Path | What it does |
| --- | --- |
| `patches/.../misc/visualeditor/VisualSettingsEditorPatch.kt` | The patch: the entry above About, its screen, and the bundled map. |
| `patches/src/main/resources/visualeditor/raw/morphe_visual_editor_preview_map.json` | Hints: which preview and animation kind each known setting uses, in preview order, plus the six groups for the tabbed layout. Exported from the web prototype. |
| `patches/src/main/resources/addresources/values/strings.xml` | The editor's own strings. |
| `extensions/.../visualeditor/PreferenceTree.java` | Reads the live settings list from `morphe_prefs.xml`. |
| `extensions/.../visualeditor/SettingsBridge.java` | Reads, changes and resets real settings through the `Setting` API, and tracks whether a restart is needed. |
| `extensions/.../visualeditor/PreviewMap.java` | Loads the hints, skips entries the installed build doesn't have, and lists the settings it doesn't know. |
| `extensions/.../visualeditor/VisualEditorSettings.java` | The editor's own three settings. |
| `extensions/.../visualeditor/VisualEditorSwitchPreference.java` | The on switch (loads `VisualEditorSettings` before the screen binds). |
| `extensions/.../visualeditor/VisualEditorPreference.java` | The "Open visual editor" entry. |
| `extensions/.../visualeditor/VisualEditorDialog.java` | The editor: top bar, sticky preview, tabs, list. A full-screen dialog, because root installs can't declare a new activity. |

`../data/catalogue.json` and `extract_catalogue.py` are for the web prototype and the map check
only. Nothing from them ships in the patch.

## Two ways to ship it

1. **As a pull request to morphe-patches (preferred).** The patch sits next to the others, and
   users switch it on in Morphe Manager like any other optional patch. It edits no existing file,
   so it doesn't change how the developer works. They would still be accepting a large UI feature
   to maintain, so it's worth discussing with them before opening the PR.
2. **As your own patch bundle, used next to the official one.** The same code works, because it
   only relies on the public settings API and `morphe_prefs.xml`. The bundle has to be built
   against the same `morphe-patches-library` version as the official patches, and rebuilt when
   that library changes in a way that affects the settings API.

## Porting order

1. Build the patch with an empty preview: the entry, the switch, the list, toggling and the
   restart prompt. This checks `PreferenceTree` and `SettingsBridge` on a device.
2. Port the preview adapters by kind (`vis` first, since it covers most settings), screen by
   screen, following the screen order in the preview map.
3. Port the scenarios (`scenario` kind) last. They are self-contained animations.
