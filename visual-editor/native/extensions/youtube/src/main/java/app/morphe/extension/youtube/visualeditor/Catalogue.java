/*
 * Copyright 2026 Morphe.
 * https://github.com/MorpheApp/morphe-patches
 *
 * See the included NOTICE file for GPLv3 Section 7 terms that apply to this code.
 */

package app.morphe.extension.youtube.visualeditor;

import android.content.Context;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import app.morphe.extension.shared.Logger;
import app.morphe.extension.shared.Utils;

/**
 * The settings catalogue bundled by the patch (res/raw/morphe_visual_editor_catalogue.json).
 * One entry per Morphe preference: title, type, default, list entries, parents and the
 * availability rule, as extracted from this repository. The editor never hardcodes a setting.
 */
public final class Catalogue {

    public static final class Pref {
        public final String key;
        public final String title;
        @Nullable public final String summary;
        /** boolean, enum, string, int, float, long, color or screen. */
        public final String type;
        public final boolean rebootApp;
        /** Morphe screen and sub-screen the setting lives in, used for the "Misc" fallback. */
        @Nullable public final String screen, subScreen;
        /** List entries as label / value pairs, empty for non-list settings. */
        public final List<String[]> entries;
        /** Keys this setting depends on (shown as offset sub-options under the parent). */
        public final List<String> parents;

        Pref(JSONObject o) {
            key = o.optString("key");
            title = o.optString("title", key);
            summary = o.isNull("summary") ? null : o.optString("summary");
            type = o.optString("type", "boolean");
            rebootApp = o.optBoolean("rebootApp");
            screen = o.isNull("screenTitle") ? null : o.optString("screenTitle");
            subScreen = o.isNull("subScreenTitle") ? null : o.optString("subScreenTitle");
            List<String[]> e = new ArrayList<>();
            JSONArray ea = o.optJSONArray("entries");
            if (ea != null) for (int i = 0; i < ea.length(); i++) {
                JSONObject x = ea.optJSONObject(i);
                if (x != null) e.add(new String[]{x.optString("label"), x.optString("value")});
            }
            entries = Collections.unmodifiableList(e);
            List<String> p = new ArrayList<>();
            JSONArray pa = o.optJSONArray("parents");
            if (pa != null) for (int i = 0; i < pa.length(); i++) {
                JSONObject x = pa.optJSONObject(i);
                if (x != null) p.add(x.optString("key"));
            }
            JSONArray ap = o.optJSONArray("availabilityParents");
            if (ap != null) for (int i = 0; i < ap.length(); i++) p.add(ap.optString(i));
            parents = Collections.unmodifiableList(p);
        }
    }

    private static volatile Catalogue instance;

    public final Map<String, Pref> prefs;

    private Catalogue(Map<String, Pref> prefs) {
        this.prefs = prefs;
    }

    @NonNull
    public static Catalogue get() {
        Catalogue c = instance;
        if (c == null) {
            synchronized (Catalogue.class) {
                if (instance == null) instance = load(Utils.getContext());
                c = instance;
            }
        }
        return c;
    }

    private static Catalogue load(Context context) {
        Map<String, Pref> out = new LinkedHashMap<>();
        try {
            JSONObject root = new JSONObject(readRaw(context, "morphe_visual_editor_catalogue"));
            JSONArray list = root.getJSONArray("preferences");
            for (int i = 0; i < list.length(); i++) {
                Pref p = new Pref(list.getJSONObject(i));
                // Settings this YouTube build doesn't have are not registered, so skip them.
                if (app.morphe.extension.shared.settings.Setting.getSettingFromPath(p.key) != null) {
                    out.put(p.key, p);
                }
            }
        } catch (Exception ex) {
            Logger.printException(() -> "Could not load the visual editor catalogue", ex);
        }
        return new Catalogue(Collections.unmodifiableMap(out));
    }

    static String readRaw(Context context, String name) throws Exception {
        final int id = context.getResources().getIdentifier(name, "raw", context.getPackageName());
        try (InputStream in = context.getResources().openRawResource(id)) {
            return new String(Utils.readAllBytes(in), StandardCharsets.UTF_8);
        }
    }
}
