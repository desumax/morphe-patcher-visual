/*
 * Copyright 2026 Morphe.
 * https://github.com/MorpheApp/morphe-patches
 *
 * See the included NOTICE file for GPLv3 Section 7 terms that apply to this code.
 */

package app.morphe.patches.youtube.misc.visualeditor

import app.morphe.patcher.extensions.InstructionExtensions.addInstruction
import app.morphe.patcher.patch.ApkFileType
import app.morphe.patcher.patch.Compatibility
import app.morphe.patcher.patch.PatchException
import app.morphe.patcher.patch.bytecodePatch
import app.morphe.patcher.patch.classDefByOrNull
import app.morphe.patcher.patch.mutableClassDefBy
import com.android.tools.smali.dexlib2.Opcode

private const val ENTRY =
    "Lapp/morphe/extension/youtube/visualeditor/VisualEditorEntry;"

// The Morphe settings screen of the official Morphe Patches (its YouTube extension).
private const val SETTINGS_FRAGMENT =
    "Lapp/morphe/extension/youtube/settings/preference/YouTubePreferenceFragment;"

/**
 * Optional visual front end for the Morphe settings screen, shipped as a bundle of its own that is
 * applied on top of the official Morphe Patches.
 *
 * It is a front end only. It reads the settings list from the same morphe_prefs.xml the regular
 * Morphe screens use, and reads and writes values through the same Setting API. It depends on no
 * patch object of another bundle, adds no resources and edits no other patch: its only change to
 * Morphe's code is one call at the end of the settings fragment's initialize(), which adds the
 * editor's two rows above About.
 *
 * That call is made in finalize, after every patch of every bundle has run, so the official
 * settings extension is already merged no matter in which order the bundles' patches run.
 */
@Suppress("unused")
val visualSettingsEditorPatch = bytecodePatch(
    name = "Visual settings editor",
    description = "Adds an optional visual editor at the top of Morphe settings (test build). " +
        "Apply it together with the Morphe Patches bundle, including its settings.",
    default = false,
) {
    // Same app identity as the official bundle's YouTube compatibility, without pinning versions.
    compatibleWith(
        Compatibility(
            name = "YouTube",
            packageName = "com.google.android.youtube",
            apkFileType = ApkFileType.APK_REQUIRED,
            appIconColor = 0xFF0033,
            signatures = setOf(
                // Android 13+
                "5aad2bee6db95d17e05a08d7d1e64c10a1511879154483916b6ae6c7fd9cb0c6",
                // Android 7+
                "3d7a1223019aa39d9ea0e3436ab7c0896bfb4fb679f4de5fe7c23f326c8f994a",
            ),
        ),
    )

    extendWith("extensions/visualeditor.mpe")

    finalize {
        if (classDefByOrNull(SETTINGS_FRAGMENT) == null) {
            throw PatchException(
                "Morphe settings were not found. Select the Morphe Patches bundle too " +
                    "(any patch with Morphe settings, for example Hide ads).",
            )
        }

        val initialize = mutableClassDefBy(SETTINGS_FRAGMENT).methods.firstOrNull { method ->
            method.name == "initialize" && method.parameterTypes.isEmpty() && method.returnType == "V"
        } ?: throw PatchException("Morphe settings changed: initialize() not found")

        // Before every return, so the rows are added after Morphe built, translated and sorted its list.
        val returns = initialize.implementation!!.instructions
            .withIndex()
            .filter { (_, instruction) -> instruction.opcode == Opcode.RETURN_VOID }
            .map { it.index }
        if (returns.isEmpty()) throw PatchException("Morphe settings changed: initialize() has no return")

        returns.asReversed().forEach { index ->
            initialize.addInstruction(
                index,
                "invoke-static { p0 }, $ENTRY->onSettingsCreated(Landroid/preference/PreferenceFragment;)V",
            )
        }
    }
}
