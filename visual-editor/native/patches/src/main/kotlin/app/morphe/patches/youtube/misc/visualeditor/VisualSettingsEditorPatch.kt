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
import app.morphe.patches.shared.misc.settings.preference.PreferenceScreenPreference.Sorting
import app.morphe.patches.youtube.misc.extension.sharedExtensionPatch
import app.morphe.patches.youtube.misc.settings.PreferenceScreen
import app.morphe.patches.youtube.misc.settings.settingsPatch
import app.morphe.patches.youtube.shared.Constants.COMPATIBILITY_YOUTUBE
import app.morphe.util.ResourceGroup
import app.morphe.util.copyResources

private const val EXTENSION_PACKAGE = "app.morphe.extension.youtube.visualeditor"

/**
 * Optional visual front end for the Morphe settings screen.
 *
 * It is a front end only: it reads the settings list at runtime from the same morphe_prefs.xml
 * the regular Morphe screens use, and reads and writes values through the same Setting API. It
 * edits no existing file and no other patch, so the developer keeps working exactly as before.
 * Settings the bundled preview map does not know yet still appear, as plain rows.
 *
 * Off by default. When selected, it adds a "Visual settings editor" entry at the top of Morphe
 * settings, above About (root entries are sorted by key, and "00_0" sorts before "00_about").
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

        // Hints only: which preview each known setting appears in. Not a copy of the settings.
        copyResources(
            "visualeditor",
            ResourceGroup("raw", "morphe_visual_editor_preview_map.json"),
        )

        // A screen of its own, made with the public PreferenceScreen API every patch uses, so
        // SettingsPatch.kt needs no change. Holds the on switch, the editor entry and its options.
        PreferenceScreen.Screen(
            key = "morphe_settings_screen_00_0_visual_editor",
            summaryKey = null,
            icon = "@drawable/morphe_settings_screen_00_about",
            layout = "@layout/preference_with_icon",
            sorting = Sorting.UNSORTED,
        ).addPreferences(
            NonInteractivePreference(
                key = "morphe_visual_editor_enabled",
                summaryKey = null, // the switch shows ..._summary_on / ..._summary_off
                tag = "$EXTENSION_PACKAGE.VisualEditorSwitchPreference",
                selectable = true,
            ),
            NonInteractivePreference(
                key = "morphe_visual_editor_open",
                tag = "$EXTENSION_PACKAGE.VisualEditorPreference",
                selectable = true,
                dependency = "morphe_visual_editor_enabled",
            ),
        )
    }
}
