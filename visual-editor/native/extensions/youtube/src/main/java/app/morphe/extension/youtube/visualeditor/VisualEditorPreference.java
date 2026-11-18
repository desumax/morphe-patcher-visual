/*
 * Copyright 2026 Morphe.
 * https://github.com/MorpheApp/morphe-patches
 *
 * See the included NOTICE file for GPLv3 Section 7 terms that apply to this code.
 */

package app.morphe.extension.youtube.visualeditor;

import android.content.Context;
import android.preference.Preference;
import android.util.AttributeSet;

/**
 * "Open visual editor", right under the switch at the top of Morphe settings.
 * Enabled only while the switch is on (android:dependency).
 */
@SuppressWarnings({"deprecation", "unused"})
public class VisualEditorPreference extends Preference {

    public VisualEditorPreference(Context context, AttributeSet attrs, int defStyleAttr, int defStyleRes) {
        super(context, attrs, defStyleAttr, defStyleRes);
    }

    public VisualEditorPreference(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
    }

    public VisualEditorPreference(Context context, AttributeSet attrs) {
        super(context, attrs);
    }

    public VisualEditorPreference(Context context) {
        super(context);
    }

    @Override
    protected void onClick() {
        // A full screen dialog inside the settings activity: no new activity is declared,
        // which root installs can't do.
        // Fail safe: if anything in the editor goes wrong on this YouTube or Morphe build, the
        // regular Morphe settings are still right here and nothing else is affected.
        try {
            new VisualEditorDialog(getContext()).show();
        } catch (Throwable ex) {
            app.morphe.extension.shared.Logger.printException(() -> "Visual editor could not open", ex);
            app.morphe.extension.shared.Utils.showToastShort("The visual editor isn't available on this version. Use the settings below.");
        }
    }
}
