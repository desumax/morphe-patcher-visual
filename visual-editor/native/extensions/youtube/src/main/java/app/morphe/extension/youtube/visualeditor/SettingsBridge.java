/*
 * Copyright 2026 Morphe.
 * https://github.com/MorpheApp/morphe-patches
 *
 * See the included NOTICE file for GPLv3 Section 7 terms that apply to this code.
 */

package app.morphe.extension.youtube.visualeditor;

import androidx.annotation.Nullable;

import java.util.HashSet;
import java.util.Set;

import app.morphe.extension.shared.settings.BooleanSetting;
import app.morphe.extension.shared.settings.EnumSetting;
import app.morphe.extension.shared.settings.Setting;

/**
 * Reads and writes the real Morphe settings. The editor has no settings of its own besides its
 * two display options, so whatever is changed here is exactly what the regular Morphe screens
 * would have changed, and every patch keeps reading its own setting as before.
 */
public final class SettingsBridge {

    /** Settings changed in this session that need an app restart (asked once, when leaving). */
    private final Set<String> needRestart = new HashSet<>();

    @Nullable
    public Object get(String key) {
        Setting<?> s = Setting.getSettingFromPath(key);
        return s == null ? null : s.get();
    }

    public boolean isAvailable(String key) {
        Setting<?> s = Setting.getSettingFromPath(key);
        return s != null && s.isAvailable();
    }

    /** Hold / double-tap: flips a switch, or moves a list setting to its next entry. */
    public void toggle(String key) {
        Setting<?> s = Setting.getSettingFromPath(key);
        if (s == null || !s.isAvailable()) return;
        if (s instanceof BooleanSetting b) {
            b.save(!b.get());
        } else if (s instanceof EnumSetting<?> e) {
            cycle(e);
        } else {
            return; // text, numbers and colours open their own control instead
        }
        if (s.rebootApp) needRestart.add(key);
    }

    /**
     * Moves a list setting to its next entry. The entries come from the live settings screen
     * (PreferenceTree), so a value the developer adds or drops is picked up automatically, and
     * only the entries the regular screen offers are ever chosen.
     */
    @SuppressWarnings({"unchecked", "rawtypes"})
    private static void cycle(EnumSetting e) {
        PreferenceTree.Node n = PreferenceTree.get().node(e.key);
        if (n == null || n.entryValues == null || n.entryValues.length == 0) return;
        String cur = ((Enum<?>) e.get()).name();
        int i = 0;
        while (i < n.entryValues.length && !n.entryValues[i].toString().equals(cur)) i++;
        String next = n.entryValues[(i + 1) % n.entryValues.length].toString();
        try {
            e.save(Enum.valueOf(((Enum) e.get()).getDeclaringClass(), next));
        } catch (IllegalArgumentException ignored) {
            // the screen offers a value this build's enum doesn't have: leave the setting alone
        }
    }

    public void reset(Iterable<String> keys) {
        for (String key : keys) {
            Setting<?> s = Setting.getSettingFromPath(key);
            if (s != null && !s.isSetToDefault()) {
                s.resetToDefault();
                if (s.rebootApp) needRestart.add(key);
            }
        }
    }

    public boolean needsRestart() {
        return !needRestart.isEmpty();
    }
}
