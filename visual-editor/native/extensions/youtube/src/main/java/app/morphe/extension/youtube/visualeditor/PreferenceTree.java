/*
 * Copyright 2026 Morphe.
 * https://github.com/MorpheApp/morphe-patches
 *
 * See the included NOTICE file for GPLv3 Section 7 terms that apply to this code.
 */

package app.morphe.extension.youtube.visualeditor;

import android.content.Context;
import android.content.res.Resources;
import android.content.res.XmlResourceParser;

import androidx.annotation.Nullable;

import org.xmlpull.v1.XmlPullParser;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import app.morphe.extension.shared.Logger;
import app.morphe.extension.shared.Utils;

/**
 * The live list of Morphe settings, read at runtime from the same res/xml/morphe_prefs.xml that
 * the regular Morphe settings screen inflates.
 *
 * Nothing about the settings is copied into this patch: titles, summaries, list entries, order,
 * screens and dependencies all come from the installed Morphe build. A setting the developer
 * adds, renames, removes or moves shows up here exactly as it does on the regular screens,
 * with no change to the editor. (Upstream history, May to November 2026: the YouTube settings
 * went from 414 to 710 keys, with 142 removed, 47 renamed and 50 default changes.)
 */
public final class PreferenceTree {

    private static final String ANDROID_NS = "http://schemas.android.com/apk/res/android";

    public static final class Node {
        /** Element name: a preference class (SwitchPreference, ListPreference, a full class name...). */
        public final String type;
        @Nullable public final String key, title, summary, dependency;
        @Nullable public final CharSequence[] entries, entryValues;
        /** The Morphe screen this node sits in (key of the nearest PreferenceScreen), or null at the root. */
        @Nullable public final String screen;
        public final List<Node> children = new ArrayList<>();

        Node(String type, @Nullable String key, @Nullable String title, @Nullable String summary,
             @Nullable String dependency, @Nullable CharSequence[] entries,
             @Nullable CharSequence[] entryValues, @Nullable String screen) {
            this.type = type;
            this.key = key;
            this.title = title;
            this.summary = summary;
            this.dependency = dependency;
            this.entries = entries;
            this.entryValues = entryValues;
            this.screen = screen;
        }

        public boolean isScreen() {
            return type.endsWith("PreferenceScreen");
        }
    }

    /** Every keyed node, in the order Morphe lists them. */
    public final Map<String, Node> byKey = new LinkedHashMap<>();
    /** The top-level Morphe screens (Ads, Feed, Player...). */
    public final List<Node> screens = new ArrayList<>();

    private static volatile PreferenceTree instance;

    public static PreferenceTree get() {
        if (instance == null) {
            synchronized (PreferenceTree.class) {
                if (instance == null) instance = load(Utils.getContext());
            }
        }
        return instance;
    }

    public boolean has(String key) {
        return byKey.containsKey(key);
    }

    @Nullable
    public Node node(String key) {
        return byKey.get(key);
    }

    private static PreferenceTree load(Context context) {
        PreferenceTree tree = new PreferenceTree();
        Resources res = context.getResources();
        // Same resource the settings fragment uses; the icon variants hold the same preferences.
        int id = res.getIdentifier("morphe_prefs", "xml", context.getPackageName());
        if (id == 0) id = res.getIdentifier("morphe_prefs_icons", "xml", context.getPackageName());
        if (id == 0) {
            Logger.printException(() -> "Visual editor: morphe_prefs not found");
            return tree;
        }
        Deque<Node> stack = new ArrayDeque<>();
        try (XmlResourceParser p = res.getXml(id)) {
            for (int ev = p.getEventType(); ev != XmlPullParser.END_DOCUMENT; ev = p.next()) {
                if (ev == XmlPullParser.START_TAG) {
                    Node parent = stack.peek();
                    String screen = null;
                    for (Node n : stack) if (n.isScreen() && n.key != null) { screen = n.key; break; }
                    Node node = new Node(p.getName(), p.getAttributeValue(ANDROID_NS, "key"),
                            text(res, p, "title"), text(res, p, "summary"),
                            p.getAttributeValue(ANDROID_NS, "dependency"),
                            array(res, p, "entries"), array(res, p, "entryValues"), screen);
                    if (parent != null) parent.children.add(node);
                    if (node.key != null) tree.byKey.put(node.key, node);
                    if (node.isScreen() && stack.size() == 1) tree.screens.add(node);
                    stack.push(node);
                } else if (ev == XmlPullParser.END_TAG) {
                    stack.pop();
                }
            }
        } catch (Exception ex) {
            Logger.printException(() -> "Visual editor: could not read morphe_prefs", ex);
        }
        return tree;
    }

    @Nullable
    private static String text(Resources res, XmlResourceParser p, String attr) {
        int rid = p.getAttributeResourceValue(ANDROID_NS, attr, 0);
        if (rid != 0) {
            try { return res.getString(rid); } catch (Resources.NotFoundException ignored) { return null; }
        }
        return p.getAttributeValue(ANDROID_NS, attr);
    }

    @Nullable
    private static CharSequence[] array(Resources res, XmlResourceParser p, String attr) {
        int rid = p.getAttributeResourceValue(ANDROID_NS, attr, 0);
        if (rid == 0) return null;
        try { return res.getTextArray(rid); } catch (Resources.NotFoundException ignored) { return null; }
    }
}
