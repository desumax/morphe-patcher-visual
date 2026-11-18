/*
 * Copyright 2026 Morphe.
 * https://github.com/MorpheApp/morphe-patches
 *
 * See the included NOTICE file for GPLv3 Section 7 terms that apply to this code.
 */

package app.morphe.extension.youtube.visualeditor;

import androidx.annotation.Nullable;

import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * The "Clean" design: the title without its leading Hide / Show / Enable / Disable, and a toggle
 * that names both states ("Hide | Show", "Off | On"). It is worked out from Morphe's own title at
 * runtime, so renamed and new settings convert by themselves. Same rules as the web preview
 * (cleanOf in web/js/core.js).
 */
final class CleanTitle {
    private static final Pattern VERB = Pattern.compile("^(hide|show|enable|disable)\\s+(.+)$",
            Pattern.CASE_INSENSITIVE | Pattern.DOTALL);

    /** Title shown in the Clean design. */
    final String title;
    /** Label shown while the setting is off, then while it is on. */
    final String offLabel, onLabel;

    private CleanTitle(String title, String offLabel, String onLabel) {
        this.title = title;
        this.offLabel = offLabel;
        this.onLabel = onLabel;
    }

    /** Hide / Off sit on the left, Show / On on the right. */
    String leftLabel() {
        return isNegative(offLabel) ? offLabel : onLabel;
    }

    String rightLabel() {
        return isNegative(offLabel) ? onLabel : offLabel;
    }

    /** If the "on" value of the setting is drawn on the right half of the toggle. */
    boolean onIsRight() {
        return isNegative(offLabel);
    }

    static boolean isNegative(String label) {
        return "Hide".equals(label) || "Off".equals(label);
    }

    /**
     * @param visual If the setting hides or shows a UI element (preview kinds vis and overlay).
     * @return The Clean form, or null if the title can't be read (the row then keeps Morphe's look).
     */
    @Nullable
    static CleanTitle of(@Nullable CharSequence morpheTitle, boolean visual) {
        if (morpheTitle == null) return null;
        String t = morpheTitle.toString().trim();
        if (t.isEmpty()) return null;
        Matcher m = VERB.matcher(t);
        if (!m.matches()) return new CleanTitle(t, "Off", "On");
        String rest = m.group(2).trim();
        if (rest.isEmpty()) return null;
        String nice = rest.substring(0, 1).toUpperCase(Locale.ROOT) + rest.substring(1);
        switch (m.group(1).toLowerCase(Locale.ROOT)) {
            case "hide":
                return new CleanTitle(nice, "Show", "Hide");
            case "show":
                return new CleanTitle(nice, "Hide", "Show");
            case "enable":
                return visual ? new CleanTitle(nice, "Hide", "Show") : new CleanTitle(nice, "Off", "On");
            default: // disable
                return new CleanTitle(nice, "On", "Off");
        }
    }
}
