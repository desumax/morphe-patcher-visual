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
import app.morphe.extension.shared.Utils;

/**
 * Which live preview a setting belongs to and how it is shown there, exported from the web
 * prototype (res/raw/morphe_visual_editor_preview_map.json).
 *
 * Kinds, one native adapter each:
 *   vis        VisibilityAdapter   hide or show a component, collapsing it with a size animation
 *   overlay    OverlayAdapter      an overlay or card filled with sample content
 *   gesture    GestureAdapter      a looping touch demo while selected
 *   layout     LayoutAdapter       an arrangement or ordering choice
 *   style      StyleAdapter        opacity, size, colour, shape
 *   behaviour  BehaviourAdapter    playback behaviour
 *   scenario   ScenarioAdapter     a short before / after story on a small phone
 * Settings without an entry go to the screen's plain list ("No live preview or animation").
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
            JSONObject root = new JSONObject(Catalogue.readRaw(Utils.getContext(), "morphe_visual_editor_preview_map"));
            JSONArray scr = root.getJSONArray("screens");
            for (int i = 0; i < scr.length(); i++) {
                JSONObject o = scr.getJSONObject(i);
                m.screens.put(o.getString("id"), new Screen(o.getString("id"), o.getString("title"), o.optString("icon")));
            }
            JSONObject ent = root.getJSONObject("entries");
            for (java.util.Iterator<String> it = ent.keys(); it.hasNext(); ) {
                String key = it.next();
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
                for (int j = 0; j < tabs.length(); j++) g.tabs.add(tabs.getJSONArray(j).getString(0));
                m.groups.add(g);
            }
        } catch (Exception ex) {
            Logger.printException(() -> "Could not load the visual editor preview map", ex);
        }
        return m;
    }

    public List<Screen> screenList() {
        return Collections.unmodifiableList(new ArrayList<>(screens.values()));
    }
}
