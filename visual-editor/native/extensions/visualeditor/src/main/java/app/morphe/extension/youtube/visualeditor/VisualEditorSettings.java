/*
 * Copyright 2026 Morphe.
 * https://github.com/MorpheApp/morphe-patches
 *
 * See the included NOTICE file for GPLv3 Section 7 terms that apply to this code.
 */

package app.morphe.extension.youtube.visualeditor;

import static java.lang.Boolean.FALSE;
import static java.lang.Boolean.TRUE;

import app.morphe.extension.shared.settings.BooleanSetting;
import app.morphe.extension.shared.settings.StringSetting;

/**
 * The editor's own settings. They live in the editor's package, so Settings.java (which the
 * developer edits all the time) is left untouched. Their keys start with morphe_visual_editor_,
 * which no Morphe setting uses.
 */
public final class VisualEditorSettings {
    /** Opening Morphe settings opens the editor first. The regular list is one tap back. */
    public static final BooleanSetting ENABLED = new BooleanSetting("morphe_visual_editor_enabled", FALSE);
    /** Six groups with tabs under the preview, instead of 24 separate screens. */
    public static final BooleanSetting GROUPED = new BooleanSetting("morphe_visual_editor_grouped", TRUE);
    /** List design: clean (default), switches or morphe. */
    public static final StringSetting DESIGN = new StringSetting("morphe_visual_editor_design", Design.CLEAN);

    public static final class Design {
        public static final String CLEAN = "clean";
        public static final String SWITCHES = "switches";
        public static final String MORPHE = "morphe";

        private Design() {
        }
    }

    public static String design() {
        String d = DESIGN.get();
        if (Design.SWITCHES.equals(d) || Design.MORPHE.equals(d)) return d;
        return Design.CLEAN;
    }

    private VisualEditorSettings() {
    }
}
