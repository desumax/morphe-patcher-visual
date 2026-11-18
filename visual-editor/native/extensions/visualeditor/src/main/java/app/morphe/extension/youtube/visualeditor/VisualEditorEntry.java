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
 * Where the editor joins the regular Morphe settings. The patch calls {@link #onSettingsCreated}
 * at the end of the Morphe settings fragment's initialize(), after Morphe has built, translated
 * and sorted its own list. Nothing in Morphe's code or resources is changed: two rows are added
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

    /** Injection point. Must never throw: the regular settings have to keep working regardless. */
    public static void onSettingsCreated(PreferenceFragment fragment) {
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

            SwitchPreference toggle = new SwitchPreference(context);
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
            open.setSummary("Test build: list, toggles and the Clean, Switches and Morphe designs");
            open.setOrder(top - 1);
            open.setEnabled(VisualEditorSettings.ENABLED.get());

            if (model != null) {
                // Same row look as the entry it now sits above (icon layout or not).
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
                // After the settings screen is on screen, so closing the editor lands on it.
                Utils.runOnMainThread(() -> show(activity));
            }
        } catch (Throwable ex) {
            Logger.printException(() -> "Visual editor: could not add its entry", ex);
        }
    }

    static void show(@Nullable Activity activity) {
        if (activity == null || activity.isFinishing()) return;
        // Fail safe: if anything in the editor goes wrong on this YouTube or Morphe build, the
        // regular Morphe settings are still right there and nothing else is affected.
        try {
            new VisualEditorDialog(activity).show();
        } catch (Throwable ex) {
            Logger.printException(() -> "Visual editor could not open", ex);
            Utils.showToastShort("The visual editor isn't available on this version. Use the regular settings.");
        }
    }
}
