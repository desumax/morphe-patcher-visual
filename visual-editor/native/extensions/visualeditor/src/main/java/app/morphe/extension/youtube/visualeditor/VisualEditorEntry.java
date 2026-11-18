/*
 * Copyright 2026 Morphe.
 * https://github.com/MorpheApp/morphe-patches
 *
 * See the included NOTICE file for GPLv3 Section 7 terms that apply to this code.
 */

package app.morphe.extension.youtube.visualeditor;

import android.app.Activity;
import android.content.Context;
import android.preference.Preference;
import android.preference.PreferenceFragment;
import android.preference.PreferenceScreen;
import android.preference.SwitchPreference;

import androidx.annotation.Nullable;

import java.lang.ref.WeakReference;

import app.morphe.extension.shared.Logger;
import app.morphe.extension.shared.Utils;

/**
 * Where the editor joins the regular Morphe settings. The patch calls {@link #onSettingsInitializing}
 * at the start of the Morphe settings fragment's initialize(); the rows are added right after
 * Morphe has built, translated and sorted its own list. Nothing in Morphe's code or resources is changed: two rows are added
 * to the top of the live list, above About.
 */
@SuppressWarnings({"deprecation", "unused"})
public final class VisualEditorEntry {
    static final String KEY_SWITCH = "morphe_visual_editor_entry_switch";
    static final String KEY_OPEN = "morphe_visual_editor_entry_open";

    /** The live, translated Morphe settings list. The editor reads titles and entries from it. */
    private static WeakReference<PreferenceScreen> liveRoot = new WeakReference<>(null);
    /** Activity the editor last opened by itself in, so a fragment rebuilt in it doesn't reopen it. */
    private static WeakReference<Activity> autoOpenedIn = new WeakReference<>(null);

    private VisualEditorEntry() {
    }

    @Nullable
    static PreferenceScreen liveRoot() {
        return liveRoot.get();
    }

    /**
     * Injection point, the first instruction of the settings fragment's initialize(). Runs the
     * real work once initialize() (and the fragment's onCreate) have finished building the list.
     * Must never throw: the regular settings have to keep working regardless.
     */
    public static void onSettingsInitializing(PreferenceFragment fragment) {
        try {
            Utils.runOnMainThread(() -> onSettingsCreated(fragment));
        } catch (Throwable ex) {
            Logger.printException(() -> "Visual editor: could not schedule its entry", ex);
        }
    }

    static void onSettingsCreated(PreferenceFragment fragment) {
        try {
            PreferenceScreen root = fragment.getPreferenceScreen();
            if (root == null) return;
            liveRoot = new WeakReference<>(root);
            if (root.findPreference(KEY_OPEN) != null) return; // initialize() ran again

            Context context = root.getContext();
            int top = Integer.MAX_VALUE;
            Preference model = null;
            for (int i = 0, n = root.getPreferenceCount(); i < n; i++) {
                Preference p = root.getPreference(i);
                if (p.getOrder() < top) {
                    top = p.getOrder();
                    model = p;
                }
            }
            if (top == Integer.MAX_VALUE) top = 0;

            SwitchPreference toggle = new EntrySwitch(context);
            toggle.setKey(KEY_SWITCH);
            toggle.setPersistent(false);
            toggle.setTitle("Visual settings editor");
            toggle.setSummaryOn("On: settings open in the visual editor");
            toggle.setSummaryOff("Off: settings open as the regular list");
            toggle.setChecked(VisualEditorSettings.ENABLED.get());
            toggle.setOrder(top - 2);

            Preference open = new Preference(context);
            open.setKey(KEY_OPEN);
            open.setPersistent(false);
            open.setTitle("Open visual editor");
            open.setSummary("Live preview of each YouTube screen: tap an element to find its setting, hold it to change it");
            open.setOrder(top - 1);
            open.setEnabled(VisualEditorSettings.ENABLED.get());

            if (model != null) {
                // Same row look as the entry it now sits above (icon layout or not).
                // Same row as About: EntrySwitch adds the switch beside it when that row has no
                // widget frame (test 3 showed no switch; borrowing a switch row misaligned it).
                toggle.setLayoutResource(model.getLayoutResource());
                open.setLayoutResource(model.getLayoutResource());
                if (model.getIcon() != null) {
                    toggle.setIcon(model.getIcon());
                    open.setIcon(model.getIcon());
                }
            }

            toggle.setOnPreferenceChangeListener((p, value) -> {
                boolean on = Boolean.TRUE.equals(value);
                VisualEditorSettings.ENABLED.save(on);
                open.setEnabled(on);
                if (on) show(fragment.getActivity());
                return true;
            });
            open.setOnPreferenceClickListener(p -> {
                show(fragment.getActivity());
                return true;
            });

            root.addPreference(toggle);
            root.addPreference(open);

            Activity activity = fragment.getActivity();
            if (VisualEditorSettings.ENABLED.get() && activity != null && autoOpenedIn.get() != activity) {
                autoOpenedIn = new WeakReference<>(activity);
                // Already posted after onCreate, so closing the editor lands on the settings list.
                show(activity);
            }
        } catch (Throwable ex) {
            Logger.printException(() -> "Visual editor: could not add its entry", ex);
        }
    }

    /**
     * A switch row in any row layout. Morphe's icon rows have no widget frame, so when the row
     * has none the switch is put at its end, with the id SwitchPreference binds to.
     */
    static final class EntrySwitch extends SwitchPreference {
        EntrySwitch(Context context) {
            super(context);
        }

        @Override
        protected android.view.View onCreateView(android.view.ViewGroup parent) {
            android.view.View row = super.onCreateView(parent);
            try {
                if (row.findViewById(android.R.id.widget_frame) != null) return row;
                int id = android.content.res.Resources.getSystem().getIdentifier("switch_widget", "id", "android");
                if (id == 0) return row;
                Context c = getContext();
                android.widget.LinearLayout box = new android.widget.LinearLayout(c);
                box.setOrientation(android.widget.LinearLayout.HORIZONTAL);
                box.setGravity(android.view.Gravity.CENTER_VERTICAL);
                box.setLayoutParams(new android.widget.AbsListView.LayoutParams(
                        android.view.ViewGroup.LayoutParams.MATCH_PARENT, android.view.ViewGroup.LayoutParams.WRAP_CONTENT));
                box.setMinimumHeight(row.getMinimumHeight());
                box.addView(row, new android.widget.LinearLayout.LayoutParams(0,
                        android.view.ViewGroup.LayoutParams.WRAP_CONTENT, 1f));
                android.widget.Switch sw = new android.widget.Switch(c);
                sw.setId(id);
                sw.setFocusable(false);
                sw.setClickable(false);
                android.widget.LinearLayout.LayoutParams lp = new android.widget.LinearLayout.LayoutParams(
                        android.view.ViewGroup.LayoutParams.WRAP_CONTENT, android.view.ViewGroup.LayoutParams.WRAP_CONTENT);
                lp.setMarginEnd((int) (16 * c.getResources().getDisplayMetrics().density));
                box.addView(sw, lp);
                return box;
            } catch (Throwable ex) {
                Logger.printException(() -> "Visual editor: could not add the entry switch", ex);
                return row;
            }
        }
    }

    static void show(@Nullable Activity activity) {
        if (activity == null || activity.isFinishing()) return;
        // Fail safe: if anything in the editor goes wrong on this YouTube or Morphe build, the
        // regular Morphe settings are still right there and nothing else is affected.
        try {
            if (WebEditorDialog.available()) {
                try {
                    new WebEditorDialog(activity).show();
                    return;
                } catch (Throwable ex) {
                    Logger.printException(() -> "Visual editor: WebView editor failed, using the list editor", ex);
                }
            }
            new VisualEditorDialog(activity).show();
        } catch (Throwable ex) {
            Logger.printException(() -> "Visual editor could not open", ex);
            Utils.showToastShort("The visual editor isn't available on this version. Use the regular settings.");
        }
    }
}
