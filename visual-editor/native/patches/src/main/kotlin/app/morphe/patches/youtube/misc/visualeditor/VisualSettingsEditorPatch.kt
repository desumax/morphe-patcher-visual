/*
 * Copyright 2026 Morphe.
 * https://github.com/MorpheApp/morphe-patches
 *
 * See the included NOTICE file for GPLv3 Section 7 terms that apply to this code.
 */

package app.morphe.patches.youtube.misc.visualeditor

import app.morphe.patcher.patch.bytecodePatch
import app.morphe.patches.all.misc.resources.addResources
import app.morphe.patches.all.misc.resources.addResourcesPatch
import app.morphe.patches.shared.misc.settings.preference.NonInteractivePreference
import app.morphe.patches.shared.misc.settings.preference.SwitchPreference
import app.morphe.patches.youtube.misc.extension.sharedExtensionPatch
import app.morphe.patches.youtube.misc.settings.addRootPreference
import app.morphe.patches.youtube.misc.settings.settingsPatch
import app.morphe.patches.youtube.shared.Constants.COMPATIBILITY_YOUTUBE
import app.morphe.util.ResourceGroup
import app.morphe.util.copyResources

/**
 * Optional visual front end for the Morphe settings screen.
 *
 * Nothing here changes how any other patch works: the editor only reads and writes the same
 * settings the regular Morphe screens use (through the extension's Setting API), so every
 * existing patch keeps owning its own behaviour. The patch is off by default. When selected it
 * adds one switch at the top of Morphe settings, above About, that turns the editor on.
 *
 * What gets bundled:
 *  - the settings catalogue (titles, types, defaults, parents and availability rules),
 *    generated from this repository by visual-editor/tools/extract_catalogue.py
 *  - the preview map (which live preview and adapter kind each setting uses),
 *    exported from the web prototype
 */
@Suppress("unused")
val visualSettingsEditorPatch = bytecodePatch(
    name = "Visual settings editor",
    description = "Adds an optional visual editor for Morphe settings: a live preview of each " +
        "YouTube screen where you tap an element to find its setting and hold it to change it.",
    default = false,
) {
    dependsOn(
        sharedExtensionPatch,
        settingsPatch,
        addResourcesPatch,
    )

    compatibleWith(COMPATIBILITY_YOUTUBE)

    execute {
        addResources("youtube", "misc.visualeditor.visualSettingsEditorPatch")

        // The data the editor is built from, read at runtime from res/raw.
        copyResources(
            "visualeditor",
            ResourceGroup(
                "raw",
                "morphe_visual_editor_catalogue.json",
                "morphe_visual_editor_preview_map.json",
            ),
        )

        // Top of the Morphe settings screen, above About. The "00_0" part of the key sorts it
        // before "morphe_settings_screen_00_about" in the root screen (sorted by key).
        addRootPreference(
            // Title and on/off summaries: morphe_settings_screen_00_0_visual_editor_title,
            // ..._summary_on and ..._summary_off (read by BooleanSettingPreference).
            SwitchPreference(
                key = "morphe_settings_screen_00_0_visual_editor",
                icon = "@drawable/morphe_settings_screen_00_about",
                layout = "@layout/preference_with_icon",
            )
        )

        // Shown under the switch while it is on: opens the editor.
        addRootPreference(
            NonInteractivePreference(
                key = "morphe_settings_screen_00_1_visual_editor_open",
                tag = "app.morphe.extension.youtube.visualeditor.VisualEditorPreference",
                selectable = true,
                dependency = "morphe_settings_screen_00_0_visual_editor",
            )
        )
    }
}
