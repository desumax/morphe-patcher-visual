# Visual settings editor: native patch groundwork

This folder is the starting point for turning the web prototype (`../web`) into a real Morphe
patch. Its folders mirror the layout of [morphe-patches](https://github.com/MorpheApp/morphe-patches),
so each file can be copied to the same path in a fork of that repository.

It is groundwork. The structure, the data and the interaction rules are in place, but the code has
not been compiled against morphe-patches yet. The live preview drawing still has to be ported
screen by screen from `web/app.js`.

## What it is

An optional front end for the existing Morphe settings. It adds no settings of its own, apart from
its on switch and its two display options. Every change goes through the extension's `Setting` API,
the same way the regular Morphe screens save settings. Because of that:

- no patcher or manager code changes;
- no existing patch changes how it works: each patch still reads its own setting;
- the patch is off by default (`default = false`). When it is selected, it adds one switch at the
  top of Morphe settings, above About, plus an "Open visual editor" entry under it.

## Files

| Path | What it does |
| --- | --- |
| `patches/.../misc/visualeditor/VisualSettingsEditorPatch.kt` | The patch: adds the switch and the entry at the top of Morphe settings, and bundles the data files. |
| `patches/src/main/resources/visualeditor/raw/morphe_visual_editor_preview_map.json` | Which preview and adapter kind each setting uses, in preview order, plus the six groups for the tabbed layout. Exported from the web prototype. |
| `morphe_visual_editor_catalogue.json` (not copied here) | Use `../data/catalogue.json`, regenerated with `../tools/extract_catalogue.py` against the target morphe-patches commit. |
| `patches/src/main/resources/addresources/values/strings.xml` | The editor's strings, ready to merge into the youtube app strings. |
| `extensions/.../visualeditor/Catalogue.java` | Loads the catalogue and skips settings that the current YouTube version doesn't have. |
| `extensions/.../visualeditor/PreviewMap.java` | Loads the preview map: screens, entries, groups. |
| `extensions/.../visualeditor/SettingsBridge.java` | Reads, toggles and resets real settings, and tracks whether a restart is needed. |
| `extensions/.../visualeditor/VisualEditorPreference.java` | The "Open visual editor" entry. |
| `extensions/.../visualeditor/VisualEditorDialog.java` | The editor: top bar, sticky preview, tabs, list. It opens as a full-screen dialog, because a new activity can't be declared on root installs. |
| `upstream-touchpoints/SettingsPatch.kt.diff` | The only edits to existing upstream files: a small `addRootPreference` accessor, and three `BooleanSetting`s in `Settings.java`. |

## Two ways to ship it

1. **As a pull request to morphe-patches (preferred).** The patch lives next to the others, uses
   their extension classes directly, and needs only the two small additions in
   `upstream-touchpoints`. Users enable it in Morphe Manager like any other optional patch. The
   maintainers would need to accept a large UI feature, so it is worth opening a discussion with
   them before the PR, once the prototype has settled.
2. **As your own patch bundle, used next to the official one.** Morphe Manager can load extra
   patch sources. A separate bundle can't reach the private parts of the official settings patch,
   though. It would have to add its entry at runtime (by hooking the Morphe settings fragment) and
   read settings by key through `Setting.getSettingFromPath`. That works, but it is more fragile:
   an official update that renames a key or a class breaks it until the bundle is updated.

Both start from the same files. Option 1 is cleaner, and option 2 is the fallback if upstream says no.

## Porting order

1. Build the patch with an empty preview: the switch, the entry, the list, toggling and the restart
   prompt. This checks the catalogue and the bridge on a device.
2. Port the preview adapters by kind (`vis` first, since it covers most settings), screen by screen,
   following the screen order in the preview map.
3. Port the scenarios (`scenario` kind) last. They are self-contained animations.
