/*
 * Copyright 2026 Morphe.
 * https://github.com/MorpheApp/morphe-patches
 *
 * See the included NOTICE file for GPLv3 Section 7 terms that apply to this code.
 */

package app.morphe.extension.youtube.visualeditor;

import android.preference.ListPreference;
import android.preference.Preference;
import android.preference.PreferenceGroup;
import android.preference.PreferenceScreen;
import android.preference.TwoStatePreference;

import androidx.annotation.Nullable;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

import app.morphe.extension.shared.Logger;
import app.morphe.extension.shared.settings.BooleanSetting;
import app.morphe.extension.shared.settings.EnumSetting;
import app.morphe.extension.shared.settings.FloatSetting;
import app.morphe.extension.shared.settings.IntegerSetting;
import app.morphe.extension.shared.settings.LongSetting;
import app.morphe.extension.shared.settings.Setting;
import app.morphe.extension.shared.settings.StringSetting;

/**
 * What the installed Morphe build says about each setting, for the web editor: type, default,
 * availability, and the translated title, summaries and list entries of its row in the live
 * settings list (the regular Morphe screen), or in morphe_prefs.xml when the live list is gone.
 * The editor's catalogue is then only a source of preview hints.
 */
final class LiveSettings {

    private LiveSettings() {
    }

    /** Must run on the main thread: it reads the live preference rows. */
    static JSONObject meta() {
        JSONObject out = new JSONObject();
        Map<String, Row> rows = new HashMap<>();
        PreferenceScreen root = VisualEditorEntry.liveRoot();
        if (root != null) walk(root, null, null, 0, rows);
        PreferenceTree tree = PreferenceTree.get();
        for (Setting<?> s : Setting.allLoadedSettings()) {
            try {
                JSONObject m = new JSONObject();
                m.put("type", typeOf(s));
                m.put("available", s.isAvailable());
                m.put("rebootApp", s.rebootApp);
                Object d = s.defaultValue;
                m.put("default", d instanceof Enum<?> e ? e.name() : (d instanceof Boolean || d instanceof Number) ? d : String.valueOf(d));
                Row r = rows.get(s.key);
                if (r != null) {
                    Preference p = r.pref;
                    m.put("ui", true);
                    putText(m, "title", p.getTitle());
                    if (p instanceof TwoStatePreference t) {
                        putText(m, "summaryOn", t.getSummaryOn());
                        putText(m, "summaryOff", t.getSummaryOff());
                    }
                    if (!(p instanceof ListPreference)) putText(m, "summary", p.getSummary());
                    if (p instanceof ListPreference l) putEntries(m, l.getEntries(), l.getEntryValues());
                    putText(m, "screenTitle", r.screen);
                    putText(m, "subScreenTitle", r.sub);
                } else {
                    PreferenceTree.Node n = tree.node(s.key);
                    if (n != null) {
                        m.put("ui", true);
                        putText(m, "title", n.title);
                        if (n.entries == null) putText(m, "summary", n.summary);
                        putEntries(m, n.entries, n.entryValues);
                    }
                }
                out.put(s.key, m);
            } catch (Exception ex) {
                Logger.printException(() -> "Visual editor: meta failed for " + s.key, ex);
            }
        }
        return out;
    }

    /** Availability of every loaded setting, as Morphe's own list enables its rows. */
    static JSONObject available() {
        JSONObject out = new JSONObject();
        for (Setting<?> s : Setting.allLoadedSettings()) {
            try {
                out.put(s.key, s.isAvailable());
            } catch (Exception ignored) {
                // a setting whose availability can't be read stays as the page has it
            }
        }
        return out;
    }

    private static final class Row {
        final Preference pref;
        @Nullable final String screen, sub;

        Row(Preference pref, @Nullable String screen, @Nullable String sub) {
            this.pref = pref;
            this.screen = screen;
            this.sub = sub;
        }
    }

    private static void walk(PreferenceGroup group, @Nullable String screen, @Nullable String sub, int depth, Map<String, Row> rows) {
        for (int i = 0, n = group.getPreferenceCount(); i < n; i++) {
            Preference p = group.getPreference(i);
            String key = p.getKey();
            if (key != null && !rows.containsKey(key)) rows.put(key, new Row(p, screen, sub));
            if (p instanceof PreferenceGroup g) {
                String t = p.getTitle() == null ? null : p.getTitle().toString();
                boolean isScreen = p instanceof PreferenceScreen;
                walk(g, depth == 0 && isScreen ? t : screen, depth >= 1 && isScreen ? t : sub, isScreen ? depth + 1 : depth, rows);
            }
        }
    }

    private static String typeOf(Setting<?> s) {
        if (s instanceof BooleanSetting) return "boolean";
        if (s instanceof IntegerSetting) return "integer";
        if (s instanceof LongSetting) return "long";
        if (s instanceof FloatSetting) return "float";
        if (s instanceof EnumSetting) return "enum";
        if (s instanceof StringSetting) return "string";
        return "other";
    }

    private static void putText(JSONObject m, String name, @Nullable CharSequence v) throws Exception {
        if (v != null) m.put(name, v.toString());
    }

    private static void putEntries(JSONObject m, @Nullable CharSequence[] labels, @Nullable CharSequence[] values) throws Exception {
        if (labels == null || values == null || labels.length != values.length || labels.length == 0) return;
        JSONArray a = new JSONArray();
        for (int i = 0; i < labels.length; i++) {
            a.put(new JSONArray().put(String.valueOf(labels[i])).put(String.valueOf(values[i])));
        }
        m.put("entries", a);
    }
}
