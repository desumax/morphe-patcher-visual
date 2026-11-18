/*
 * Copyright 2026 Morphe.
 * https://github.com/MorpheApp/morphe-patches
 *
 * See the included NOTICE file for GPLv3 Section 7 terms that apply to this code.
 */

package app.morphe.extension.youtube.visualeditor;

import android.animation.ValueAnimator;
import android.app.Activity;
import android.app.AlertDialog;
import android.app.Dialog;
import android.content.Context;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.ColorDrawable;
import android.graphics.drawable.GradientDrawable;
import android.preference.EditTextPreference;
import android.preference.ListPreference;
import android.preference.Preference;
import android.preference.PreferenceScreen;
import android.preference.TwoStatePreference;
import android.text.Editable;
import android.text.InputType;
import android.text.TextUtils;
import android.text.TextWatcher;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.HapticFeedbackConstants;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.view.inputmethod.InputMethodManager;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.HorizontalScrollView;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.Switch;
import android.widget.TextView;

import androidx.annotation.Nullable;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import app.morphe.extension.shared.Logger;
import app.morphe.extension.shared.Utils;
import app.morphe.extension.shared.settings.BooleanSetting;
import app.morphe.extension.shared.settings.Setting;
import app.morphe.extension.shared.settings.preference.AbstractPreferenceFragment;

/**
 * The editor, a full screen dialog over the Morphe settings activity (root installs can't declare
 * a new activity).
 *
 *   top bar   close · screen picker · search · design · reset
 *   preview   placeholder in this test build (the drawings are ported from web/js/ next)
 *   tabs      grouped layout only, right under the preview
 *   list      one card per setting, in preview order
 *
 * Interaction, same rules as the web prototype:
 *   tap a card            select it (its description unfolds)
 *   hold or double-tap    change it: switches flip, lists move to their next entry
 *   tap a switch / toggle change it straight away
 *   tap a list value      pick from its entries
 * Sub-options sit indented under their parent and show only while the parent lets them.
 * Leaving the editor asks for a restart only if a changed setting needs one.
 */
@SuppressWarnings("deprecation")
final class VisualEditorDialog extends Dialog {

    private static final String MORE = "__more";
    private static final long DOUBLE_TAP_MS = 300;

    private final Activity activity;
    private final SettingsBridge bridge = new SettingsBridge();
    private final PreferenceTree tree = PreferenceTree.get();
    private final PreviewMap map = PreviewMap.get();

    private final boolean dark = Utils.isDarkModeEnabled();
    private final int bg = dark ? 0xFF0F0F0F : 0xFFFFFFFF;
    private final int surface = dark ? 0xFF212121 : 0xFFF2F2F2;
    private final int fg = dark ? 0xFFF1F1F1 : 0xFF0F0F0F;
    private final int fg2 = dark ? 0xFFAAAAAA : 0xFF606060;
    private final int accent = dark ? 0xFF3EA6FF : 0xFF065FD4;
    private final int negFill = dark ? 0xFF4A4A4A : 0xFFD6D6D6;
    private final int selFill = dark ? 0xFF1E2A38 : 0xFFE3EEFC;

    private String screenId;
    @Nullable private String selected;
    @Nullable private String query; // non-null while searching
    @Nullable private String lastTapKey;
    private long lastTapTime;

    private TextView titleView;
    private EditText searchField;
    private TextView designButton;
    private HorizontalScrollView tabScroll;
    private LinearLayout tabs;
    private LinearLayout list;
    private ScrollView scroller;

    VisualEditorDialog(Activity activity) {
        super(activity, Utils.isDarkModeEnabled()
                ? android.R.style.Theme_DeviceDefault_NoActionBar
                : android.R.style.Theme_DeviceDefault_Light_NoActionBar);
        this.activity = activity;
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        screenId = firstScreen();
        setContentView(buildLayout(activity));
        Window w = getWindow();
        if (w != null) {
            w.setBackgroundDrawable(new ColorDrawable(bg));
            w.setLayout(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT);
            w.setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);
        }
        render();
    }

    // ------------------------------------------------------------------ layout

    private String firstScreen() {
        if (VisualEditorSettings.GROUPED.get()) {
            for (PreviewMap.Group g : map.groups) {
                for (String tab : g.tabs) if (hasKeys(tab)) return tab;
            }
        }
        for (PreviewMap.Screen s : map.screenList()) if (!s.keys.isEmpty()) return s.id;
        return MORE;
    }

    private boolean hasKeys(String screen) {
        PreviewMap.Screen s = map.screens.get(screen);
        return s != null && !s.keys.isEmpty();
    }

    private View buildLayout(Context context) {
        LinearLayout root = new LinearLayout(context);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(bg);

        // Top bar
        LinearLayout bar = new LinearLayout(context);
        bar.setOrientation(LinearLayout.HORIZONTAL);
        bar.setGravity(Gravity.CENTER_VERTICAL);
        bar.setPadding(dp(4), dp(4), dp(8), dp(4));

        TextView close = barButton("←", "Close the visual editor");
        close.setOnClickListener(v -> onBackPressed());
        bar.addView(close);

        titleView = text(18, fg, true);
        titleView.setSingleLine(true);
        titleView.setEllipsize(TextUtils.TruncateAt.END);
        titleView.setPadding(dp(8), dp(10), dp(8), dp(10));
        titleView.setOnClickListener(v -> openPicker());
        bar.addView(titleView, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f));

        searchField = new EditText(context);
        searchField.setSingleLine(true);
        searchField.setHint("Search settings");
        searchField.setTextColor(fg);
        searchField.setHintTextColor(fg2);
        searchField.setInputType(InputType.TYPE_CLASS_TEXT);
        searchField.setVisibility(View.GONE);
        searchField.addTextChangedListener(new TextWatcher() {
            @Override public void beforeTextChanged(CharSequence s, int a, int b, int c) { }
            @Override public void onTextChanged(CharSequence s, int a, int b, int c) { }
            @Override public void afterTextChanged(Editable s) {
                if (query != null) {
                    query = s.toString();
                    renderList();
                }
            }
        });
        bar.addView(searchField, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f));

        TextView search = barButton("⌕", "Search");
        search.setOnClickListener(v -> startSearch());
        bar.addView(search);

        designButton = pill("", fg, surface);
        designButton.setOnClickListener(v -> openDesignPicker());
        LinearLayout.LayoutParams dlp = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        dlp.setMargins(dp(4), 0, dp(4), 0);
        bar.addView(designButton, dlp);

        TextView reset = barButton("↺", "Reset");
        reset.setOnClickListener(v -> openReset());
        bar.addView(reset);
        root.addView(bar);

        // Preview (placeholder in this build)
        TextView preview = text(13, fg2, false);
        preview.setText("Live preview: not in this test build yet. This build tests the list, the toggles, "
                + "the three designs, search and reset on your real settings.");
        preview.setPadding(dp(14), dp(10), dp(14), dp(10));
        preview.setBackground(round(surface, 14));
        LinearLayout.LayoutParams plp = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        plp.setMargins(dp(12), dp(2), dp(12), dp(8));
        root.addView(preview, plp);

        // Tabs
        tabScroll = new HorizontalScrollView(context);
        tabScroll.setHorizontalScrollBarEnabled(false);
        tabs = new LinearLayout(context);
        tabs.setPadding(dp(8), 0, dp(8), dp(6));
        tabScroll.addView(tabs);
        root.addView(tabScroll);

        // List
        scroller = new ScrollView(context);
        scroller.setVerticalScrollBarEnabled(false);
        scroller.setClipToPadding(false);
        list = new LinearLayout(context);
        list.setOrientation(LinearLayout.VERTICAL);
        list.setPadding(dp(8), 0, dp(8), dp(24));
        scroller.addView(list);
        root.addView(scroller, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f));
        return root;
    }

    // ------------------------------------------------------------------ rendering

    private void render() {
        renderBar();
        renderTabs();
        renderList();
    }

    private void renderBar() {
        boolean searching = query != null;
        titleView.setVisibility(searching ? View.GONE : View.VISIBLE);
        searchField.setVisibility(searching ? View.VISIBLE : View.GONE);
        titleView.setText(screenTitle(screenId) + "  ▾");
        designButton.setText(designName(VisualEditorSettings.design()));
    }

    private String screenTitle(String id) {
        if (MORE.equals(id)) return "More settings";
        if (VisualEditorSettings.GROUPED.get()) {
            for (PreviewMap.Group g : map.groups) if (g.tabs.contains(id)) return g.title;
        }
        PreviewMap.Screen s = map.screens.get(id);
        return s == null ? id : s.title;
    }

    private static String designName(String d) {
        switch (d) {
            case VisualEditorSettings.Design.SWITCHES: return "Switches";
            case VisualEditorSettings.Design.MORPHE: return "Morphe";
            default: return "Clean";
        }
    }

    /** Grouped layout: the tabs of the current group, under the preview. Tabs stay static on switch. */
    private void renderTabs() {
        tabs.removeAllViews();
        tabScroll.setVisibility(View.GONE);
        if (query != null || !VisualEditorSettings.GROUPED.get()) return;
        for (PreviewMap.Group g : map.groups) {
            if (!g.tabs.contains(screenId)) continue;
            for (String tab : g.tabs) {
                if (!hasKeys(tab)) continue;
                boolean on = tab.equals(screenId);
                String title = g.tabTitles.containsKey(tab) ? g.tabTitles.get(tab) : tab;
                TextView t = pill(title, on ? Color.WHITE : fg, on ? accent : surface);
                t.setOnClickListener(v -> showScreen(tab, null));
                LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
                lp.setMargins(dp(4), 0, dp(4), 0);
                tabs.addView(t, lp);
            }
            tabScroll.setVisibility(View.VISIBLE);
        }
    }

    private void renderList() {
        list.removeAllViews();
        if (query != null) {
            renderSearch();
            return;
        }
        if (MORE.equals(screenId)) {
            renderMore();
            return;
        }
        PreviewMap.Screen s = map.screens.get(screenId);
        if (s == null) return;
        addRows(s.keys, true);
    }

    /**
     * Adds the cards for keys (in preview order). Sub-options follow their parent, indented, and
     * show only while available. In the Clean design, on/off settings whose title can't be
     * converted keep Morphe's look and move to the end.
     */
    private void addRows(List<String> keys, boolean nest) {
        Set<String> inList = new LinkedHashSet<>(keys);
        Map<String, List<String>> kids = new LinkedHashMap<>();
        List<String> top = new ArrayList<>();
        for (String k : keys) {
            String parent = nest ? parentIn(k, inList) : null;
            if (parent == null) {
                top.add(k);
            } else {
                List<String> l = kids.get(parent);
                if (l == null) kids.put(parent, l = new ArrayList<>());
                l.add(k);
            }
        }
        List<String> ordered = new ArrayList<>();
        List<String> tail = new ArrayList<>();
        boolean clean = VisualEditorSettings.Design.CLEAN.equals(VisualEditorSettings.design());
        for (String k : top) {
            if (clean && SettingsBridge.isBoolean(k) && cleanOf(k) == null) tail.add(k);
            else ordered.add(k);
        }
        ordered.addAll(tail);
        for (String k : ordered) addRowTree(k, kids, 0, new LinkedHashSet<>());
    }

    private void addRowTree(String key, Map<String, List<String>> kids, int depth, Set<String> seen) {
        if (!seen.add(key)) return;
        if (depth > 0 && !SettingsBridge.isAvailable(key) && key.equals(selected) == false) return;
        list.addView(row(key, depth));
        List<String> children = kids.get(key);
        if (children != null) for (String c : children) addRowTree(c, kids, depth + 1, seen);
    }

    /** The first setting key gating k that is also in this list (Morphe's own availability rules). */
    @Nullable
    private static String parentIn(String k, Set<String> inList) {
        Setting<?> s = SettingsBridge.setting(k);
        if (s == null) return null;
        try {
            for (Setting<?> p : s.getParentSettings()) {
                if (p != null && !p.key.equals(k) && inList.contains(p.key)) return p.key;
            }
        } catch (Exception ignored) {
            // A rule this build can't answer: list it flat.
        }
        return null;
    }

    /** Settings the preview map doesn't know yet, grouped by the Morphe screen they are on. */
    private void renderMore() {
        TextView note = text(13, fg2, false);
        note.setText("Settings the visual editor has no preview for yet. They work the same as everywhere else.");
        note.setPadding(dp(12), dp(4), dp(12), dp(8));
        list.addView(note);
        for (Map.Entry<String, List<String>> e : map.unmapped().entrySet()) {
            PreferenceTree.Node screen = tree.node(e.getKey());
            String title = screen == null ? "Other" : liveTitle(screen.key, screen.title);
            TextView h = text(14, accent, true);
            h.setText(title);
            h.setPadding(dp(12), dp(14), dp(12), dp(4));
            list.addView(h);
            addRows(e.getValue(), true);
        }
    }

    private void renderSearch() {
        String q = query == null ? "" : query.trim().toLowerCase(Locale.ROOT);
        if (q.length() < 2) {
            TextView hint = text(14, fg2, false);
            hint.setText("Type at least two letters.");
            hint.setPadding(dp(12), dp(12), dp(12), dp(12));
            list.addView(hint);
            return;
        }
        int found = 0;
        for (PreferenceTree.Node n : tree.byKey.values()) {
            if (n.key == null || n.isScreen() || SettingsBridge.setting(n.key) == null) continue;
            String title = liveTitle(n.key, n.title);
            CharSequence summary = summaryOf(n.key);
            String hay = (title + " " + (summary == null ? "" : summary)).toLowerCase(Locale.ROOT);
            if (!hay.contains(q)) continue;
            View r = row(n.key, 0);
            r.setOnClickListener(v -> {
                endSearch();
                PreviewMap.Entry e = map.entry(n.key);
                showScreen(e == null ? MORE : e.screen, n.key);
            });
            list.addView(r);
            if (++found >= 60) break;
        }
        if (found == 0) {
            TextView none = text(14, fg2, false);
            none.setText("No setting matches “" + query.trim() + "”.");
            none.setPadding(dp(12), dp(12), dp(12), dp(12));
            list.addView(none);
        }
    }

    // ------------------------------------------------------------------ one card

    private View row(String key, int depth) {
        Setting<?> s = SettingsBridge.setting(key);
        boolean available = SettingsBridge.isAvailable(key);
        boolean isSel = key.equals(selected);
        String design = VisualEditorSettings.design();
        PreviewMap.Entry entry = map.entry(key);
        boolean visual = entry != null && ("vis".equals(entry.kind) || "overlay".equals(entry.kind));
        PreferenceTree.Node node = tree.node(key);
        String morpheTitle = liveTitle(key, node == null ? null : node.title);
        CleanTitle clean = s instanceof BooleanSetting ? CleanTitle.of(morpheTitle, visual) : null;

        LinearLayout card = new LinearLayout(getContext());
        card.setOrientation(LinearLayout.HORIZONTAL);
        card.setGravity(Gravity.CENTER_VERTICAL);
        card.setMinimumHeight(dp(64));
        card.setPadding(dp(12 + depth * 20), dp(10), dp(12), dp(10));
        card.setBackground(isSel ? round(selFill, 14) : null);
        card.setTag(key);

        LinearLayout texts = new LinearLayout(getContext());
        texts.setOrientation(LinearLayout.VERTICAL);
        TextView title = text(16, fg, false);
        boolean cleanLook = VisualEditorSettings.Design.CLEAN.equals(design) && clean != null;
        title.setText(cleanLook ? clean.title : morpheTitle);
        texts.addView(title);
        CharSequence summary = summaryOf(key);
        if (!TextUtils.isEmpty(summary)) {
            TextView sum = text(13, fg2, false);
            sum.setText(summary);
            // Fixed card heights: long descriptions unfold only while the card is selected.
            if (!isSel) {
                sum.setMaxLines(2);
                sum.setEllipsize(TextUtils.TruncateAt.END);
            }
            texts.addView(sum);
        }
        if (!available) {
            Setting<?> blocker = blockerOf(s);
            if (blocker != null) {
                TextView go = text(13, accent, true);
                go.setText("Needs “" + liveTitle(blocker.key, null) + "” · Take me there →");
                go.setPadding(0, dp(4), 0, 0);
                go.setOnClickListener(v -> takeMeThere(blocker.key));
                texts.addView(go);
            }
        }
        card.addView(texts, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f));

        View control = control(key, s, clean, design, available);
        if (control != null) {
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
            lp.setMargins(dp(12), 0, 0, 0);
            card.addView(control, lp);
        }
        title.setAlpha(available ? 1f : 0.45f);

        card.setOnClickListener(v -> {
            long now = System.currentTimeMillis();
            if (key.equals(lastTapKey) && now - lastTapTime < DOUBLE_TAP_MS) {
                lastTapKey = null;
                change(v, key);
                return;
            }
            lastTapKey = key;
            lastTapTime = now;
            select(key);
        });
        card.setOnLongClickListener(v -> {
            change(v, key);
            return true;
        });
        return card;
    }

    @Nullable
    private View control(String key, @Nullable Setting<?> s, @Nullable CleanTitle clean, String design, boolean available) {
        if (s == null) return null;
        Preference live = live(key);
        if (s instanceof BooleanSetting) {
            boolean on = SettingsBridge.boolValue(key);
            if (VisualEditorSettings.Design.CLEAN.equals(design) && clean != null) {
                return cleanToggle(key, clean, on, available);
            }
            if (VisualEditorSettings.Design.MORPHE.equals(design) && clean != null && isHideShow(clean)) {
                boolean shown = on == "Show".equals(clean.onLabel);
                TextView chip = pill(shown ? "Shown" : "Hidden", shown ? Color.WHITE : fg, shown ? accent : negFill);
                chip.setAlpha(available ? 1f : 0.45f);
                chip.setOnClickListener(v -> { if (available) change(v, key); });
                return chip;
            }
            Switch sw = new Switch(getContext());
            sw.setChecked(on);
            sw.setEnabled(available);
            sw.setOnCheckedChangeListener((b, checked) -> change(b, key));
            return sw;
        }
        if (live instanceof ListPreference lp && lp.getEntryValues() != null) {
            TextView chip = pill(entryLabel(lp, SettingsBridge.stringValue(key)) + "  ▾", fg, surface);
            chip.setMaxWidth(dp(170));
            chip.setSingleLine(true);
            chip.setEllipsize(TextUtils.TruncateAt.END);
            chip.setAlpha(available ? 1f : 0.45f);
            chip.setOnClickListener(v -> { if (available) pickEntry(key, lp); });
            return chip;
        }
        // Text, numbers, colours: a value box, rounded at the card's right, edited in place.
        TextView box = pill(SettingsBridge.stringValue(key), fg, surface);
        box.setMaxWidth(dp(150));
        box.setSingleLine(true);
        box.setEllipsize(TextUtils.TruncateAt.END);
        box.setAlpha(available ? 1f : 0.45f);
        box.setOnClickListener(v -> { if (available) editValue(key, live); });
        return box;
    }

    private static boolean isHideShow(CleanTitle c) {
        return ("Hide".equals(c.offLabel) && "Show".equals(c.onLabel))
                || ("Show".equals(c.offLabel) && "Hide".equals(c.onLabel));
    }

    /** Clean design toggle: Hide / Off always left, Show / On always right; the current one is filled. */
    private View cleanToggle(String key, CleanTitle c, boolean on, boolean available) {
        LinearLayout t = new LinearLayout(getContext());
        t.setOrientation(LinearLayout.HORIZONTAL);
        t.setBackground(round(surface, 18));
        t.setPadding(dp(3), dp(3), dp(3), dp(3));
        boolean rightActive = on == c.onIsRight();
        String current = on ? c.onLabel : c.offLabel;
        boolean negative = CleanTitle.isNegative(current);
        for (int i = 0; i < 2; i++) {
            boolean active = (i == 1) == rightActive;
            TextView half = text(13, active ? (negative ? fg : Color.WHITE) : fg2, active);
            half.setText(i == 0 ? c.leftLabel() : c.rightLabel());
            half.setGravity(Gravity.CENTER);
            half.setMinWidth(dp(48));
            half.setPadding(dp(10), dp(6), dp(10), dp(6));
            if (active) half.setBackground(round(negative ? negFill : accent, 15));
            final boolean wantRight = i == 1;
            half.setOnClickListener(v -> {
                if (available && wantRight != rightActive) change(v, key);
            });
            t.addView(half);
        }
        t.setAlpha(available ? 1f : 0.45f);
        return t;
    }

    // ------------------------------------------------------------------ actions

    private void select(String key) {
        selected = key;
        renderList();
    }

    /** Hold, double-tap, or a tap on the control: flip a switch, or move a list to its next entry. */
    private void change(View v, String key) {
        if (!SettingsBridge.isAvailable(key)) {
            Setting<?> b = blockerOf(SettingsBridge.setting(key));
            Utils.showToastShort(b == null ? "Not available right now"
                    : "Change “" + liveTitle(b.key, null) + "” first");
            renderList();
            return;
        }
        v.performHapticFeedback(HapticFeedbackConstants.LONG_PRESS);
        selected = key;
        Setting<?> s = SettingsBridge.setting(key);
        Preference live = live(key);
        if (s instanceof BooleanSetting) {
            bridge.toggle(activity, key, this::renderList);
        } else if (live instanceof ListPreference lp && lp.getEntryValues() != null && lp.getEntryValues().length > 0) {
            CharSequence[] values = lp.getEntryValues();
            int i = indexOf(values, SettingsBridge.stringValue(key));
            bridge.save(activity, key, values[(i + 1) % values.length].toString(), this::renderList);
        } else {
            editValue(key, live);
        }
    }

    private void pickEntry(String key, ListPreference lp) {
        CharSequence[] values = lp.getEntryValues();
        CharSequence[] labels = lp.getEntries() != null ? lp.getEntries() : values;
        selected = key;
        new AlertDialog.Builder(activity)
                .setTitle(liveTitle(key, null))
                .setSingleChoiceItems(labels, indexOf(values, SettingsBridge.stringValue(key)), (d, which) -> {
                    d.dismiss();
                    bridge.save(activity, key, values[which].toString(), this::renderList);
                })
                .setNegativeButton(android.R.string.cancel, null)
                .show();
    }

    private void editValue(String key, @Nullable Preference live) {
        selected = key;
        EditText input = new EditText(activity);
        input.setText(SettingsBridge.stringValue(key));
        input.setSelectAllOnFocus(true);
        Setting<?> s = SettingsBridge.setting(key);
        Object v = s == null ? null : s.get();
        if (v instanceof Integer || v instanceof Long) {
            input.setInputType(InputType.TYPE_CLASS_NUMBER | InputType.TYPE_NUMBER_FLAG_SIGNED);
        } else if (v instanceof Float || v instanceof Double) {
            input.setInputType(InputType.TYPE_CLASS_NUMBER | InputType.TYPE_NUMBER_FLAG_DECIMAL | InputType.TYPE_NUMBER_FLAG_SIGNED);
        } else if (live instanceof EditTextPreference) {
            input.setInputType(InputType.TYPE_CLASS_TEXT);
        }
        FrameLayout wrap = new FrameLayout(activity);
        wrap.setPadding(dp(20), dp(8), dp(20), 0);
        wrap.addView(input);
        new AlertDialog.Builder(activity)
                .setTitle(liveTitle(key, null))
                .setView(wrap)
                .setPositiveButton(android.R.string.ok, (d, w) ->
                        bridge.save(activity, key, input.getText().toString().trim(), this::renderList))
                .setNeutralButton("Default", (d, w) -> {
                    bridge.reset(java.util.Collections.singletonList(key));
                    renderList();
                })
                .setNegativeButton(android.R.string.cancel, null)
                .show();
    }

    private void takeMeThere(String parentKey) {
        PreviewMap.Entry e = map.entry(parentKey);
        showScreen(e == null ? MORE : e.screen, parentKey);
    }

    private void showScreen(String id, @Nullable String select) {
        screenId = id;
        selected = select;
        render();
        if (select != null) scrollToAndFlash(select);
        else scroller.scrollTo(0, 0);
    }

    private void scrollToAndFlash(String key) {
        scroller.post(() -> {
            View r = list.findViewWithTag(key);
            if (r == null) return;
            scroller.smoothScrollTo(0, Math.max(0, r.getTop() - (scroller.getHeight() - r.getHeight()) / 2));
            ValueAnimator a = ValueAnimator.ofFloat(1f, 0.35f, 1f, 0.35f, 1f);
            a.setDuration(900);
            a.addUpdateListener(an -> r.setAlpha((float) an.getAnimatedValue()));
            a.start();
        });
    }

    private void openPicker() {
        List<String> ids = new ArrayList<>();
        List<String> labels = new ArrayList<>();
        if (VisualEditorSettings.GROUPED.get()) {
            for (PreviewMap.Group g : map.groups) {
                for (String tab : g.tabs) {
                    if (hasKeys(tab)) {
                        ids.add(tab);
                        labels.add(g.title);
                        break;
                    }
                }
            }
        } else {
            for (PreviewMap.Screen s : map.screenList()) {
                if (!s.keys.isEmpty()) {
                    ids.add(s.id);
                    labels.add(s.title);
                }
            }
        }
        int more = 0;
        for (List<String> l : map.unmapped().values()) more += l.size();
        ids.add(MORE);
        labels.add("More settings (" + more + " without a preview yet)");
        ids.add("__layout");
        labels.add(VisualEditorSettings.GROUPED.get() ? "Layout: grouped tabs ✓ (tap for 24 screens)" : "Layout: 24 screens (tap for grouped tabs)");
        new AlertDialog.Builder(activity)
                .setItems(labels.toArray(new CharSequence[0]), (d, which) -> {
                    String id = ids.get(which);
                    if ("__layout".equals(id)) {
                        VisualEditorSettings.GROUPED.save(!VisualEditorSettings.GROUPED.get());
                        render();
                    } else {
                        showScreen(id, null);
                    }
                })
                .show();
    }

    private void openDesignPicker() {
        String[] ids = {VisualEditorSettings.Design.CLEAN, VisualEditorSettings.Design.SWITCHES, VisualEditorSettings.Design.MORPHE};
        String[] labels = {
                "Clean: titles name both states (Hide | Show, Off | On)",
                "Switches: every on/off setting is a switch",
                "Morphe: Morphe's own titles, Shown / Hidden labels"
        };
        int cur = 0;
        for (int i = 0; i < ids.length; i++) if (ids[i].equals(VisualEditorSettings.design())) cur = i;
        new AlertDialog.Builder(activity)
                .setTitle("Settings list design")
                .setSingleChoiceItems(labels, cur, (d, which) -> {
                    d.dismiss();
                    VisualEditorSettings.DESIGN.save(ids[which]);
                    render();
                })
                .show();
    }

    private void openReset() {
        String here = query != null ? null : screenTitle(screenId);
        List<CharSequence> items = new ArrayList<>();
        if (here != null) items.add("Only " + here);
        items.add("Everything (every Morphe setting)");
        new AlertDialog.Builder(activity)
                .setTitle("Reset settings to default?")
                .setItems(items.toArray(new CharSequence[0]), (d, which) -> {
                    if (here != null && which == 0) {
                        bridge.reset(keysOfCurrentView());
                        renderList();
                    } else {
                        new AlertDialog.Builder(activity)
                                .setMessage("Reset every Morphe setting to its default? This can't be undone.")
                                .setPositiveButton("Reset everything", (d2, w2) -> {
                                    List<String> all = new ArrayList<>();
                                    for (Setting<?> s : Setting.allLoadedSettings()) all.add(s.key);
                                    bridge.reset(all);
                                    renderList();
                                })
                                .setNegativeButton(android.R.string.cancel, null)
                                .show();
                    }
                })
                .setNegativeButton(android.R.string.cancel, null)
                .show();
    }

    /** The keys of the current screen, or of every tab of the current group in the grouped layout. */
    private List<String> keysOfCurrentView() {
        List<String> out = new ArrayList<>();
        if (MORE.equals(screenId)) {
            for (List<String> l : map.unmapped().values()) out.addAll(l);
            return out;
        }
        if (VisualEditorSettings.GROUPED.get()) {
            for (PreviewMap.Group g : map.groups) {
                if (!g.tabs.contains(screenId)) continue;
                for (String tab : g.tabs) {
                    PreviewMap.Screen s = map.screens.get(tab);
                    if (s != null) out.addAll(s.keys);
                }
                return out;
            }
        }
        PreviewMap.Screen s = map.screens.get(screenId);
        if (s != null) out.addAll(s.keys);
        return out;
    }

    private void startSearch() {
        query = "";
        searchField.setText("");
        render();
        searchField.requestFocus();
        InputMethodManager imm = (InputMethodManager) activity.getSystemService(Context.INPUT_METHOD_SERVICE);
        if (imm != null) imm.showSoftInput(searchField, InputMethodManager.SHOW_IMPLICIT);
    }

    private void endSearch() {
        query = null;
        InputMethodManager imm = (InputMethodManager) activity.getSystemService(Context.INPUT_METHOD_SERVICE);
        if (imm != null) imm.hideSoftInputFromWindow(searchField.getWindowToken(), 0);
        render();
    }

    @Override
    public void onBackPressed() {
        if (query != null) {
            endSearch();
            return;
        }
        dismiss();
    }

    @Override
    public void dismiss() {
        super.dismiss();
        try {
            if (bridge.restartNeeded()) AbstractPreferenceFragment.showRestartDialogIfNeeded(activity);
        } catch (Throwable ex) {
            Logger.printException(() -> "Visual editor: restart dialog failed", ex);
        }
    }

    // ------------------------------------------------------------------ live settings texts

    /** The live, translated preference for key, from the Morphe settings list on screen. */
    @Nullable
    private static Preference live(String key) {
        PreferenceScreen root = VisualEditorEntry.liveRoot();
        try {
            return root == null ? null : root.findPreference(key);
        } catch (Exception ex) {
            return null;
        }
    }

    private static String liveTitle(@Nullable String key, @Nullable String fallback) {
        Preference p = key == null ? null : live(key);
        if (p != null && !TextUtils.isEmpty(p.getTitle())) return p.getTitle().toString();
        if (!TextUtils.isEmpty(fallback)) return fallback;
        PreferenceTree.Node n = key == null ? null : PreferenceTree.get().node(key);
        if (n != null && !TextUtils.isEmpty(n.title)) return n.title;
        return key == null ? "" : key.replaceFirst("^morphe_", "").replace('_', ' ');
    }

    /** Morphe's own summary for the current value: summaryOn / summaryOff, or the list's summary. */
    @Nullable
    private static CharSequence summaryOf(String key) {
        Preference p = live(key);
        if (p == null) {
            PreferenceTree.Node n = PreferenceTree.get().node(key);
            return n == null ? null : n.summary;
        }
        if (p instanceof TwoStatePreference tp) {
            CharSequence s = SettingsBridge.boolValue(key) ? tp.getSummaryOn() : tp.getSummaryOff();
            return s != null ? s : tp.getSummary();
        }
        try {
            CharSequence s = p.getSummary();
            if (s != null && s.toString().contains("%s")) return null;
            return s;
        } catch (Exception ex) {
            return null; // a summary that formats with an argument this build doesn't have
        }
    }

    @Nullable
    private static Setting<?> blockerOf(@Nullable Setting<?> s) {
        if (s == null) return null;
        try {
            for (Setting<?> p : s.getParentSettings()) {
                if (p != null && p != s) return p;
            }
        } catch (Exception ignored) {
        }
        return null;
    }

    @Nullable
    private CleanTitle cleanOf(String key) {
        PreviewMap.Entry e = map.entry(key);
        boolean visual = e != null && ("vis".equals(e.kind) || "overlay".equals(e.kind));
        PreferenceTree.Node n = tree.node(key);
        return CleanTitle.of(liveTitle(key, n == null ? null : n.title), visual);
    }

    private static int indexOf(CharSequence[] values, String value) {
        for (int i = 0; i < values.length; i++) {
            if (values[i].toString().equalsIgnoreCase(value)) return i;
        }
        return -1;
    }

    private static String entryLabel(ListPreference lp, String value) {
        int i = indexOf(lp.getEntryValues(), value);
        CharSequence[] entries = lp.getEntries();
        if (i >= 0 && entries != null && i < entries.length) return entries[i].toString();
        return value;
    }

    // ------------------------------------------------------------------ view helpers

    private TextView text(int sp, int color, boolean bold) {
        TextView t = new TextView(getContext());
        t.setTextSize(TypedValue.COMPLEX_UNIT_SP, sp);
        t.setTextColor(color);
        if (bold) t.setTypeface(Typeface.DEFAULT_BOLD);
        return t;
    }

    private TextView barButton(String glyph, String description) {
        TextView b = text(22, fg, false);
        b.setText(glyph);
        b.setGravity(Gravity.CENTER);
        b.setContentDescription(description);
        b.setMinWidth(dp(44));
        b.setPadding(dp(8), dp(6), dp(8), dp(6));
        return b;
    }

    private TextView pill(String label, int color, int fill) {
        TextView p = text(13, color, true);
        p.setText(label);
        p.setGravity(Gravity.CENTER);
        p.setPadding(dp(12), dp(7), dp(12), dp(7));
        p.setBackground(round(fill, 16));
        return p;
    }

    private GradientDrawable round(int color, int radiusDp) {
        GradientDrawable d = new GradientDrawable();
        d.setColor(color);
        d.setCornerRadius(dp(radiusDp));
        return d;
    }

    private int dp(int v) {
        return (int) (v * getContext().getResources().getDisplayMetrics().density + 0.5f);
    }
}
