/*
 * Copyright 2026 Morphe.
 * https://github.com/MorpheApp/morphe-patches
 *
 * See the included NOTICE file for GPLv3 Section 7 terms that apply to this code.
 */

package app.morphe.extension.youtube.visualeditor;

import static java.lang.Boolean.FALSE;
import static app.morphe.extension.shared.settings.Setting.parent;

import app.morphe.extension.shared.settings.BooleanSetting;

/**
 * The editor's own three settings. They live here, inside the editor's package, so that
 * Settings.java (which the developer edits all the time) is left untouched. The class is loaded
 * by VisualEditorSwitchPreference before the settings screen binds its preferences.
 */
public final class VisualEditorSettings {
    public static final BooleanSetting ENABLED = new BooleanSetting("morphe_visual_editor_enabled", FALSE);
    public static final BooleanSetting HIDE_SHOWN = new BooleanSetting("morphe_visual_editor_hide_shown", FALSE, parent(ENABLED));
    public static final BooleanSetting GROUPED = new BooleanSetting("morphe_visual_editor_grouped", FALSE, parent(ENABLED));

    private VisualEditorSettings() {
    }
}
