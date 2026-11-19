/*
 * Copyright 2026 Morphe.
 * https://github.com/MorpheApp/morphe-patches
 *
 * See the included NOTICE file for GPLv3 Section 7 terms that apply to this code.
 */

package app.morphe.extension.youtube.visualeditor;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.Dialog;
import android.content.Context;
import android.content.pm.PackageInfo;
import android.graphics.drawable.ColorDrawable;
import android.os.Build;
import android.os.SystemClock;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.util.Base64;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

import androidx.annotation.Nullable;

import org.json.JSONObject;
import org.json.JSONTokener;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.zip.GZIPInputStream;

import app.morphe.extension.shared.Logger;
import app.morphe.extension.shared.Utils;
import app.morphe.extension.shared.settings.BooleanSetting;
import app.morphe.extension.shared.settings.FloatSetting;
import app.morphe.extension.shared.settings.IntegerSetting;
import app.morphe.extension.shared.settings.LongSetting;
import app.morphe.extension.shared.settings.Setting;

/**
 * The editor as designed: the web preview itself (cards, pickers, sliders, tabs, search, live
 * animations), hosted in a WebView and connected to the real Morphe settings through a small
 * bridge, window.MorpheApp:
 *   state()        the live values of every Morphe setting, the YouTube version, and per setting
 *                  its live type, default, availability, title, summaries and list entries (meta)
 *   available()    the current availability of every setting (also pushed after each set)
 *   set(key, json) save one value through the Setting API (with Morphe's own confirmations)
 *   close()        leave the editor (and Morphe settings while the new design is on)
 *   disableEditor() turn the new design off and show the regular Morphe list
 *   restart()      restart YouTube to apply settings that need it
 *   vibrate(ms)    haptics for the demos
 * The pages are served from the editor's own extension (WebAssets) under a private https origin;
 * every other request is refused, so the editor never touches the network.
 */
@SuppressWarnings("deprecation")
final class WebEditorDialog extends Dialog {

    private static final String ORIGIN = "https://visual-editor.morphe.local/";

    private final Activity activity;
    private final SettingsBridge bridge = new SettingsBridge();
    private final WebView web;
    /** Live titles, entries, defaults and availability, read on the main thread before the page loads. */
    private String meta = "{}";
    private final long openedAt = SystemClock.uptimeMillis();
    /** The settings list behind the editor, hidden until the editor closes so it never flashes. */
    @Nullable private View hiddenList;
    private boolean revealed;

    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    WebEditorDialog(Activity activity) {
        super(activity, android.R.style.Theme_DeviceDefault_NoActionBar);
        this.activity = activity;
        requestWindowFeature(Window.FEATURE_NO_TITLE);

        FrameLayout root = new FrameLayout(activity);
        root.setBackgroundColor(0xFF0F0F0F);
        // Keep the editor inside the status bar and navigation bar (edge-to-edge is enforced on
        // new Android versions, which drew test 1 under the status bar).
        root.setOnApplyWindowInsetsListener((v, insets) -> {
            int top, bottom, left, right;
            if (Build.VERSION.SDK_INT >= 30) {
                android.graphics.Insets i = insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout() | WindowInsets.Type.ime());
                top = i.top; bottom = i.bottom; left = i.left; right = i.right;
            } else {
                top = insets.getSystemWindowInsetTop(); bottom = insets.getSystemWindowInsetBottom();
                left = insets.getSystemWindowInsetLeft(); right = insets.getSystemWindowInsetRight();
            }
            v.setPadding(left, top, right, bottom);
            return insets;
        });

        // Remote debugging only on the Android emulator (ro.kernel.qemu), never on a phone: the
        // development loop drives and screenshots the editor through Chrome DevTools.
        if (isEmulator()) WebView.setWebContentsDebuggingEnabled(true);
        web = new WebView(activity);
        web.setBackgroundColor(0xFF0F0F0F);
        // The page fades in once it has drawn its first screen (MorpheApp.ready), so the WebView's
        // loading frames never show; the dark root stays behind it until then.
        web.setAlpha(0f);
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setMediaPlaybackRequiresUserGesture(true);
        s.setTextZoom(100);
        web.addJavascriptInterface(new Bridge(), "MorpheApp");
        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                return serve(request.getUrl().toString());
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return !request.getUrl().toString().startsWith(ORIGIN); // no navigation away
            }
        });
        root.addView(web, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        setContentView(root);

        Window w = getWindow();
        if (w != null) {
            w.setBackgroundDrawable(new ColorDrawable(0xFF0F0F0F));
            w.setWindowAnimations(0); // appears at once over the settings list, no pop-in
            w.setLayout(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT);
            w.setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_NOTHING);
            w.setStatusBarColor(0xFF0F0F0F);
            w.setNavigationBarColor(0xFF0F0F0F);
            if (Build.VERSION.SDK_INT >= 30) {
                w.setDecorFitsSystemWindows(false);
                if (w.getInsetsController() != null) {
                    w.getInsetsController().setSystemBarsAppearance(0,
                            android.view.WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS
                                    | android.view.WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS);
                }
            }
        }
        try {
            meta = LiveSettings.meta().toString();
        } catch (Throwable ex) {
            Logger.printException(() -> "Visual editor: live settings unavailable", ex);
        }
        web.loadUrl(ORIGIN + "index.html");
        web.postDelayed(this::reveal, 2500); // in case the page never reports ready
    }

    @Override
    public void show() {
        super.show();
        try {
            View list = activity.findViewById(android.R.id.content);
            if (list != null && list.getVisibility() == View.VISIBLE) {
                list.setVisibility(View.INVISIBLE);
                hiddenList = list;
            }
        } catch (Throwable ignored) {
        }
    }

    private void reveal() {
        if (revealed || destroyed) return;
        revealed = true;
        android.util.Log.i("MorpheVisualEditor", "ready after " + (SystemClock.uptimeMillis() - openedAt) + " ms");
        web.animate().alpha(1f).setDuration(160).start();
    }

    // ------------------------------------------------------------------ files

    @Nullable
    private static WebResourceResponse serve(String url) {
        if (!url.startsWith(ORIGIN)) {
            // No network from inside YouTube's settings.
            return new WebResourceResponse("text/plain", "utf-8", 403, "Blocked", null, new ByteArrayInputStream(new byte[0]));
        }
        String path = url.substring(ORIGIN.length());
        int q = path.indexOf('?');
        if (q >= 0) path = path.substring(0, q);
        if (path.isEmpty()) path = "index.html";
        String[] parts = WebAssets.FILES.get(path);
        if (parts == null) {
            return new WebResourceResponse("text/plain", "utf-8", 404, "Not found", null, new ByteArrayInputStream(new byte[0]));
        }
        try {
            return new WebResourceResponse(mime(path), "utf-8", new ByteArrayInputStream(unpack(parts)));
        } catch (Exception ex) {
            Logger.printException(() -> "Visual editor: could not unpack " + url, ex);
            return null;
        }
    }

    private static byte[] unpack(String[] parts) throws java.io.IOException {
        StringBuilder b = new StringBuilder();
        for (String p : parts) b.append(p);
        byte[] gz = Base64.decode(b.toString(), Base64.DEFAULT);
        try (InputStream in = new GZIPInputStream(new ByteArrayInputStream(gz))) {
            ByteArrayOutputStream out = new ByteArrayOutputStream(gz.length * 4);
            byte[] buf = new byte[16384];
            for (int n; (n = in.read(buf)) > 0; ) out.write(buf, 0, n);
            return out.toByteArray();
        }
    }

    private static String mime(String path) {
        if (path.endsWith(".html")) return "text/html";
        if (path.endsWith(".js")) return "application/javascript";
        if (path.endsWith(".css")) return "text/css";
        if (path.endsWith(".json")) return "application/json";
        if (path.endsWith(".svg")) return "image/svg+xml";
        return "application/octet-stream";
    }

    // ------------------------------------------------------------------ bridge

    /** Called from the page's JavaScript thread: anything touching views goes to the main thread. */
    private final class Bridge {
        @JavascriptInterface
        public String state() {
            JSONObject values = new JSONObject();
            try {
                for (Setting<?> s : Setting.allLoadedSettings()) {
                    Object v = s.get();
                    if (v instanceof Enum<?> e) values.put(s.key, e.name());
                    else if (v instanceof Boolean || v instanceof Number) values.put(s.key, v);
                    else values.put(s.key, String.valueOf(v));
                }
                JSONObject out = new JSONObject();
                out.put("values", values);
                out.put("version", appVersion(activity));
                out.put("meta", new JSONObject(meta));
                return out.toString();
            } catch (Exception ex) {
                Logger.printException(() -> "Visual editor: state failed", ex);
                return "{\"values\":{},\"version\":\"\"}";
            }
        }

        @JavascriptInterface
        public void set(String key, String json) {
            Utils.runOnMainThread(() -> {
                Setting<?> s = Setting.getSettingFromPath(key);
                if (s == null) return;
                String value = fromJson(s, json);
                if (value == null) {
                    sendBack(s);
                    return;
                }
                bridge.save(activity, key, value, () -> {
                    if (!value.equals(String.valueOf(asJsonValue(s)))) sendBack(s);
                    pushAvailability();
                });
            });
        }

        @JavascriptInterface
        public String available() {
            return LiveSettings.available().toString();
        }

        @JavascriptInterface
        public void ready() {
            Utils.runOnMainThread(WebEditorDialog.this::reveal);
        }

        /**
         * Leave the editor. While the new design is on, the old Morphe list must never show, so
         * leaving goes straight back to YouTube's settings (the editor already asked for any restart).
         */
        @JavascriptInterface
        public void close() {
            Utils.runOnMainThread(() -> {
                if (VisualEditorSettings.ENABLED.get()) leaveSettings();
                else dismiss();
            });
        }

        /** "Disable new design": switch the editor off and show the regular Morphe list. */
        @JavascriptInterface
        public void disableEditor() {
            Utils.runOnMainThread(() -> {
                VisualEditorSettings.ENABLED.save(false);
                VisualEditorEntry.syncRows();
                dismiss();
            });
        }

        @JavascriptInterface
        public void restart() {
            Utils.runOnMainThread(() -> Utils.restartApp(activity));
        }

        @JavascriptInterface
        public void vibrate(int ms) {
            try {
                Vibrator v = (Vibrator) activity.getSystemService(Context.VIBRATOR_SERVICE);
                if (v == null) return;
                int d = Math.max(5, Math.min(ms, 500));
                if (Build.VERSION.SDK_INT >= 26) v.vibrate(VibrationEffect.createOneShot(d, VibrationEffect.DEFAULT_AMPLITUDE));
                else v.vibrate(d);
            } catch (Throwable ignored) {
                // no vibrator, or no permission: haptics are optional
            }
        }
    }

    /** The JSON value the page sent, as the string Setting.saveFromString reads, or null if unusable. */
    @Nullable
    private static String fromJson(Setting<?> s, String json) {
        try {
            Object v = new JSONTokener(json).nextValue();
            if (v == null || v == JSONObject.NULL) return null;
            if (s instanceof BooleanSetting) return String.valueOf(Boolean.parseBoolean(String.valueOf(v)));
            if (s instanceof IntegerSetting || s instanceof LongSetting) {
                return v instanceof Number n ? String.valueOf(n.longValue()) : String.valueOf(v);
            }
            if (s instanceof FloatSetting) return v instanceof Number n ? String.valueOf(n.floatValue()) : String.valueOf(v);
            return String.valueOf(v);
        } catch (Exception ex) {
            return null;
        }
    }

    private static Object asJsonValue(Setting<?> s) {
        Object v = s.get();
        return v instanceof Enum<?> e ? e.name() : v;
    }

    /** Sends Morphe's availability of every setting to the page after a change. */
    private void pushAvailability() {
        try {
            web.evaluateJavascript("window.morpheAvailability && morpheAvailability(" + LiveSettings.available() + ")", null);
        } catch (Exception ex) {
            Logger.printException(() -> "Visual editor: availability push failed", ex);
        }
    }

    /** Tells the page which value Morphe kept (a confirmation was declined or a value refused). */
    private void sendBack(Setting<?> s) {
        try {
            Object v = asJsonValue(s);
            String json = (v instanceof Boolean || v instanceof Number) ? String.valueOf(v) : JSONObject.quote(String.valueOf(v));
            web.evaluateJavascript("window.morpheSetValue && morpheSetValue(" + JSONObject.quote(s.key) + "," + JSONObject.quote(json) + ")", null);
        } catch (Exception ex) {
            Logger.printException(() -> "Visual editor: sendBack failed", ex);
        }
    }

    private static String appVersion(Context c) {
        try {
            PackageInfo p = c.getPackageManager().getPackageInfo(c.getPackageName(), 0);
            return p.versionName == null ? "" : p.versionName;
        } catch (Exception ex) {
            return "";
        }
    }

    @Override
    public void onBackPressed() {
        web.evaluateJavascript("window.morpheBack ? (morpheBack(), 'ok') : 'none'", r -> {
            if (r == null || r.contains("none")) {
                if (VisualEditorSettings.ENABLED.get()) leaveSettings();
                else dismiss();
            }
        });
    }

    private boolean destroyed;

    /** Closes the editor together with the Morphe settings screen, without showing the list. */
    private void leaveSettings() {
        hiddenList = null; // stays hidden: the activity is finishing
        dismiss();
        try {
            if (!activity.isFinishing()) activity.finish();
        } catch (Throwable ex) {
            Logger.printException(() -> "Visual editor: could not close settings", ex);
        }
    }

    @Override
    public void dismiss() {
        super.dismiss();
        if (hiddenList != null) {
            hiddenList.setVisibility(View.VISIBLE);
            hiddenList = null;
        }
        if (destroyed) return;
        destroyed = true;
        try {
            web.stopLoading();
            web.destroy();
        } catch (Throwable ignored) {
        }
        // A restart left for later: Morphe's own settings ask for it when they are closed.
    }

    private static boolean isEmulator() {
        try {
            Class<?> sp = Class.forName("android.os.SystemProperties");
            Object v = sp.getMethod("get", String.class).invoke(null, "ro.kernel.qemu");
            return "1".equals(v);
        } catch (Throwable ex) {
            return false;
        }
    }

    static boolean available() {
        try {
            // Throws if no WebView provider is installed or it is being updated.
            android.webkit.CookieManager.getInstance();
            return true;
        } catch (Throwable ex) {
            return false;
        }
    }
}
