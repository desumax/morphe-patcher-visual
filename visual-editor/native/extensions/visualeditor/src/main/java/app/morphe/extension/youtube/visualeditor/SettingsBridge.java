/*
 * Copyright 2026 Morphe.
 * https://github.com/MorpheApp/morphe-patches
 *
 * See the included NOTICE file for GPLv3 Section 7 terms that apply to this code.
 */

package app.morphe.extension.youtube.visualeditor;

import android.app.AlertDialog;
import android.content.Context;

import androidx.annotation.Nullable;

import app.morphe.extension.shared.Logger;
import app.morphe.extension.shared.settings.BooleanSetting;
import app.morphe.extension.shared.settings.Setting;
import app.morphe.extension.shared.settings.preference.AbstractPreferenceFragment;

/**
 * Reads and writes the real Morphe settings through the same Setting API the regular screens use.
 * The editor keeps no copy of any setting, so whatever is changed here is exactly what the regular
 * Morphe screens would have changed, and every patch keeps reading its own setting as before.
 */
final class SettingsBridge {

    /** If a setting changed in the editor needs an app restart (asked once, when leaving). */
    private boolean restartNeeded;

    @Nullable
    static Setting<?> setting(@Nullable String key) {
        return key == null ? null : Setting.getSettingFromPath(key);
    }

    static boolean isAvailable(String key) {
        Setting<?> s = setting(key);
        return s == null || s.isAvailable();
    }

    static boolean isBoolean(String key) {
        return setting(key) instanceof BooleanSetting;
    }

    static boolean boolValue(String key) {
        Setting<?> s = setting(key);
        return s instanceof BooleanSetting b && b.get();
    }

    static String stringValue(String key) {
        Setting<?> s = setting(key);
        return s == null ? "" : String.valueOf(s.get());
    }

    /**
     * Saves a value as a string, the way the regular screens save list and text preferences.
     * Settings that ask the user to confirm a change ask here too, before saving.
     *
     * @param after Run once the value is saved, or the confirmation is declined.
     */
    void save(Context context, String key, String newValue, Runnable after) {
        Setting<?> s = setting(key);
        if (s == null || newValue.equals(String.valueOf(s.get()))) {
            after.run();
            return;
        }
        if (s.userDialogMessage != null && !newValue.equals(String.valueOf(s.defaultValue))) {
            try {
                new AlertDialog.Builder(context)
                        .setMessage(s.userDialogMessage.toString())
                        .setPositiveButton(android.R.string.ok, (d, w) -> {
                            saveConfirmed(s, newValue);
                            after.run();
                        })
                        .setNegativeButton(android.R.string.cancel, (d, w) -> after.run())
                        .setOnCancelListener(d -> after.run())
                        .show();
                return;
            } catch (Exception ex) {
                Logger.printException(() -> "Visual editor: confirmation dialog failed", ex);
            }
        }
        saveConfirmed(s, newValue);
        after.run();
    }

    void toggle(Context context, String key, Runnable after) {
        save(context, key, String.valueOf(!boolValue(key)), after);
    }

    private void saveConfirmed(Setting<?> s, String newValue) {
        try {
            s.saveFromString(newValue);
            if (s.rebootApp) markRestart();
        } catch (RuntimeException ex) {
            Logger.printException(() -> "Visual editor: could not save " + s.key + ": " + newValue, ex);
        }
    }

    void reset(Iterable<String> keys) {
        for (String key : keys) {
            Setting<?> s = setting(key);
            if (s != null && !s.isSetToDefault()) {
                s.resetToDefault();
                if (s.rebootApp) markRestart();
            }
        }
    }

    private void markRestart() {
        restartNeeded = true;
        // The regular Morphe screens ask for the restart when settings are closed: same flag.
        AbstractPreferenceFragment.setRestartNeeded();
    }

    boolean restartNeeded() {
        return restartNeeded;
    }
}
