/*
 * Copyright 2026 Morphe.
 * https://github.com/MorpheApp/morphe-patches
 *
 * See the included NOTICE file for GPLv3 Section 7 terms that apply to this code.
 */

package app.morphe.extension.youtube.visualeditor;

import android.content.Context;
import android.preference.SwitchPreference;
import android.util.AttributeSet;

/**
 * The on switch of the editor. A plain SwitchPreference, except that creating it loads
 * VisualEditorSettings, so its setting is registered before the screen looks it up.
 */
@SuppressWarnings({"deprecation", "unused"})
public class VisualEditorSwitchPreference extends SwitchPreference {
    static {
        VisualEditorSettings.ENABLED.get();
    }

    public VisualEditorSwitchPreference(Context context, AttributeSet attrs, int defStyleAttr, int defStyleRes) {
        super(context, attrs, defStyleAttr, defStyleRes);
    }

    public VisualEditorSwitchPreference(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
    }

    public VisualEditorSwitchPreference(Context context, AttributeSet attrs) {
        super(context, attrs);
    }

    public VisualEditorSwitchPreference(Context context) {
        super(context);
    }
}
