/*
 * Copyright 2026 Morphe.
 * https://github.com/MorpheApp/morphe-patches
 *
 * See the included NOTICE file for GPLv3 Section 7 terms that apply to this code.
 */

package app.morphe.extension.youtube.visualeditor;

import androidx.annotation.Nullable;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import app.morphe.extension.shared.Logger;

/**
 * Which live preview a setting belongs to and how it is shown there, exported from the web
 * prototype (preview_map.json, built into PreviewMapData so the patch adds no resources).
 *
 * Kinds, one native adapter each:
 *   vis        VisibilityAdapter   hide or show a component, collapsing it with a size animation
 *   overlay    OverlayAdapter      an overlay or card filled with sample content
 *   gesture    GestureAdapter      a looping touch demo while selected
 *   layout     LayoutAdapter       an arrangement or ordering choice
 *   style      StyleAdapter        opacity, size, colour, shape
 *   behaviour  BehaviourAdapter    playback behaviour
 *   scenario   ScenarioAdapter     a short before / after story on a small phone
 * The map is only a list of hints, never the source of truth: an entry whose setting is not in
 * the installed Morphe build (renamed, removed, not in this YouTube version) is skipped, and a
 * setting with no entry is still listed, as a plain row under "More settings". So when the
 * developer changes settings, the editor at worst shows a new setting without its animation
 * until the map catches up; it never breaks and never hides a setting.
 */
public final class PreviewMap {

    public static final class Screen {
        public final String id, title, icon;
        public final List<String> keys = new ArrayList<>();

        Screen(String id, String title, String icon) {
            this.id = id;
            this.title = title;
            this.icon = icon;
        }
    }

    /** A group of screens shown as tabs under the preview (the optional grouped layout). */
    public static final class Group {
        public final String id, title;
        public final List<String> tabs = new ArrayList<>();
        /** Tab title per screen id, in the grouped layout's own words. */
        public final Map<String, String> tabTitles = new LinkedHashMap<>();

        Group(String id, String title) {
            this.id = id;
            this.title = title;
        }
    }

    public static final class Entry {
        public final String screen, kind;

        Entry(String screen, String kind) {
            this.screen = screen;
            this.kind = kind;
        }
    }

    public final Map<String, Screen> screens = new LinkedHashMap<>();
    public final Map<String, Entry> entries = new LinkedHashMap<>();
    public final List<Group> groups = new ArrayList<>();

    private static volatile PreviewMap instance;

    public static PreviewMap get() {
        if (instance == null) {
            synchronized (PreviewMap.class) {
                if (instance == null) instance = load();
            }
        }
        return instance;
    }

    @Nullable
    public Entry entry(String key) {
        return entries.get(key);
    }

    private static PreviewMap load() {
        PreviewMap m = new PreviewMap();
        try {
            PreferenceTree tree = PreferenceTree.get();
            JSONObject root = new JSONObject(PreviewMapData.json());
            JSONArray scr = root.getJSONArray("screens");
            for (int i = 0; i < scr.length(); i++) {
                JSONObject o = scr.getJSONObject(i);
                m.screens.put(o.getString("id"), new Screen(o.getString("id"), o.getString("title"), o.optString("icon")));
            }
            JSONObject ent = root.getJSONObject("entries");
            for (java.util.Iterator<String> it = ent.keys(); it.hasNext(); ) {
                String key = it.next();
                if (!tree.has(key)) continue; // not in this Morphe build: skip quietly
                JSONObject o = ent.getJSONObject(key);
                Entry e = new Entry(o.getString("screen"), o.getString("kind"));
                m.entries.put(key, e);
                Screen s = m.screens.get(e.screen);
                if (s != null) s.keys.add(key);
            }
            JSONArray grp = root.getJSONArray("groups");
            for (int i = 0; i < grp.length(); i++) {
                JSONObject o = grp.getJSONObject(i);
                Group g = new Group(o.getString("id"), o.getString("title"));
                JSONArray tabs = o.getJSONArray("tabs");
                for (int j = 0; j < tabs.length(); j++) {
                    JSONArray t = tabs.getJSONArray(j);
                    g.tabs.add(t.getString(0));
                    g.tabTitles.put(t.getString(0), t.optString(1, t.getString(0)));
                }
                m.groups.add(g);
            }
        } catch (Exception ex) {
            Logger.printException(() -> "Could not load the visual editor preview map", ex);
        }
        return m;
    }

    /**
     * Settings of the installed Morphe build that the map does not know yet, in Morphe's order,
     * grouped by the Morphe screen they are on. Shown as plain rows, so nothing is ever missing.
     */
    public Map<String, List<String>> unmapped() {
        Map<String, List<String>> out = new LinkedHashMap<>();
        for (PreferenceTree.Node n : PreferenceTree.get().byKey.values()) {
            if (n.isScreen() || n.key == null || entries.containsKey(n.key)) continue;
            if (app.morphe.extension.shared.settings.Setting.getSettingFromPath(n.key) == null) continue; // buttons, headers
            String screen = n.screen == null ? "" : n.screen;
            List<String> list = out.get(screen);
            if (list == null) out.put(screen, list = new ArrayList<>());
            list.add(n.key);
        }
        return out;
    }

    public List<Screen> screenList() {
        return Collections.unmodifiableList(new ArrayList<>(screens.values()));
    }
}
