/*
 * Copyright 2026 Morphe.
 * https://github.com/MorpheApp/morphe-patches
 *
 * See the included NOTICE file for GPLv3 Section 7 terms that apply to this code.
 */

package app.morphe.extension.youtube.visualeditor;

import android.app.Dialog;
import android.content.Context;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.widget.FrameLayout;
import android.widget.HorizontalScrollView;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

import androidx.annotation.Nullable;

import java.util.ArrayList;
import java.util.List;

import app.morphe.extension.shared.Utils;

/**
 * The editor itself, laid out like the web prototype:
 *
 *   top bar      back · screen picker · search · reset
 *   preview      sticky; draws the current screen with sample content (PreviewHost)
 *   tabs         only in the grouped layout, right under the preview
 *   list         one row per setting, ordered by where its element sits in the preview
 *
 * Interaction (same rules as the prototype):
 *   tap a row             select it: the preview scrolls to its element and flashes it
 *   hold or double-tap    change it (switches flip, lists move to the next entry)
 *   tap a switch          change it straight away
 *   tap a preview element select its setting and bring that row to the middle of the list
 *   hold a preview element change its setting
 * Leaving the editor asks for a restart only if a changed setting needs one.
 *
 * Groundwork: the structure and the data flow are in place; the preview drawing
 * (PreviewHost and the adapters) is ported screen by screen from web/app.js.
 */
public final class VisualEditorDialog extends Dialog {

    private final SettingsBridge settings = new SettingsBridge();
    private final PreferenceTree tree = PreferenceTree.get();
    private final PreviewMap map = PreviewMap.get();

    private String screenId;
    @Nullable private String selected;

    private FrameLayout preview;
    private LinearLayout tabs;
    private LinearLayout list;
    private ScrollView scroller;

    public VisualEditorDialog(Context context) {
        super(context, android.R.style.Theme_DeviceDefault_NoActionBar_Fullscreen);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        List<PreviewMap.Screen> screens = map.screenList();
        screenId = screens.isEmpty() ? "misc" : screens.get(0).id;
        setContentView(buildLayout(context));
        showScreen(screenId);
    }

    private View buildLayout(Context context) {
        LinearLayout root = new LinearLayout(context);
        root.setOrientation(LinearLayout.VERTICAL);

        TextView bar = new TextView(context); // TODO: real top bar (back, picker, search, reset)
        bar.setPadding(dp(16), dp(12), dp(16), dp(12));
        bar.setOnClickListener(v -> openPicker());
        root.addView(bar, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT));

        preview = new FrameLayout(context);
        root.addView(preview, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(260)));

        HorizontalScrollView tabScroll = new HorizontalScrollView(context);
        tabScroll.setHorizontalScrollBarEnabled(false);
        tabs = new LinearLayout(context);
        tabs.setPadding(dp(10), 0, dp(10), dp(8));
        tabScroll.addView(tabs);
        root.addView(tabScroll);

        scroller = new ScrollView(context);
        scroller.setVerticalScrollBarEnabled(false);
        list = new LinearLayout(context);
        list.setOrientation(LinearLayout.VERTICAL);
        scroller.addView(list);
        root.addView(scroller, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f));
        return root;
    }

    private void showScreen(String id) {
        screenId = id;
        selected = null;
        renderTabs();
        renderPreview();
        renderList();
    }

    /** Grouped layout: the tabs of the current group, under the preview. */
    private void renderTabs() {
        tabs.removeAllViews();
        if (!VisualEditorSettings.GROUPED.get()) return;
        for (PreviewMap.Group g : map.groups) {
            if (!g.tabs.contains(screenId)) continue;
            for (String tab : g.tabs) {
                PreviewMap.Screen s = map.screens.get(tab);
                if (s == null) continue;
                TextView t = new TextView(getContext());
                t.setText(s.title);
                t.setPadding(dp(12), dp(6), dp(12), dp(6));
                t.setSelected(tab.equals(screenId));
                t.setOnClickListener(v -> showScreen(tab));
                tabs.addView(t);
            }
        }
    }

    private void renderPreview() {
        preview.removeAllViews();
        // TODO: PreviewHost.forScreen(screenId) draws the screen; each adapter binds its keys
        // to views and reports taps back through onPreviewTap / onPreviewHold.
    }

    private void renderList() {
        list.removeAllViews();
        PreviewMap.Screen s = map.screens.get(screenId);
        if (s == null) return;
        boolean hideShown = VisualEditorSettings.HIDE_SHOWN.get();
        List<String> keys = new ArrayList<>(s.keys); // already in preview order (exported that way)
        for (String key : keys) {
            PreferenceTree.Node p = tree.node(key);
            if (p == null) continue; // the map is filtered already; this is just a guard
            if (hideShown && isShownElement(key) && !key.equals(selected)) continue;
            list.addView(row(p));
        }
    }

    private View row(PreferenceTree.Node p) {
        TextView t = new TextView(getContext()); // TODO: real row (title, summary, switch or value, sub-options)
        t.setText(p.title);
        t.setPadding(dp(20), dp(14), dp(20), dp(14));
        t.setTag(p.key);
        t.setOnClickListener(v -> select(p.key, false));
        t.setOnLongClickListener(v -> {
            settings.toggle(p.key);
            renderPreview();
            return true;
        });
        return t;
    }

    private boolean isShownElement(String key) {
        PreviewMap.Entry e = map.entry(key);
        if (e == null || !("vis".equals(e.kind) || "overlay".equals(e.kind))) return false;
        Object v = settings.get(key);
        // "hide_..." settings show the element while false; "show_..." while true.
        boolean hideKey = key.contains("_hide_") || key.startsWith("morphe_hide");
        return v instanceof Boolean b && (hideKey != b);
    }

    private void select(String key, boolean fromPreview) {
        selected = key;
        if (fromPreview) {
            if (VisualEditorSettings.HIDE_SHOWN.get()) {
                renderList(); // the tapped element's setting is pinned at the top
                scroller.smoothScrollTo(0, 0);
            } else {
                View row = list.findViewWithTag(key);
                if (row != null) scroller.smoothScrollTo(0, row.getTop() - (scroller.getHeight() - row.getHeight()) / 2);
            }
        }
        // TODO: flash the element in the preview, and ghost it in red while it is hidden.
    }

    private void openPicker() {
        // TODO: screen picker (24 screens, or 6 groups when GROUPED is on), plus "More settings"
        // listing map.unmapped(): settings the preview map does not know yet, as plain rows.
    }

    @Override
    public void dismiss() {
        super.dismiss();
        if (settings.needsRestart()) {
            Utils.showToastShort("Restart YouTube to apply all changes"); // TODO: the Morphe restart dialog
        }
    }

    private int dp(int v) {
        return (int) (v * getContext().getResources().getDisplayMetrics().density);
    }
}
