"use strict";
// In-app mode, part 1 (loaded after core.js, before boot.js). Active only inside YouTube, where the
// visual editor patch provides window.MorpheApp. The preview then edits the real Morphe settings:
//   - the catalogue keeps only the settings this Morphe build has, and only the installed YouTube version
//   - the starting values are the live values, not localStorage
const INAPP = typeof window.MorpheApp !== "undefined";
let LIVE = { values: {}, version: "" };
if (INAPP) {
  document.documentElement.classList.add("inapp");
  // Morphe could not give its values: go back to its regular list rather than show an editor
  // that would look right but save nothing (the empty state is only for the standalone preview).
  let liveOk = false;
  try { LIVE = JSON.parse(MorpheApp.state()); liveOk = !!(LIVE && LIVE.values && Object.keys(LIVE.values).length); } catch (e) { /* handled below */ }
  if (!liveOk && !MorpheApp.preview) {
    LIVE = { values: {}, version: "" };
    try { MorpheApp.fallback(); } catch (e) { try { MorpheApp.close(); } catch (e2) { /* ignore */ } }
  }
  try { localStorage.removeItem(LS + "-baseline"); } catch (e) { /* storage unavailable */ }
  const cmpV = (a, b) => { const x = String(a).split(".").map(Number), y = String(b).split(".").map(Number); for (let i = 0; i < Math.max(x.length, y.length); i++) { const d = (x[i] || 0) - (y[i] || 0); if (d) return d; } return 0; };
  const nativeFetch = window.fetch.bind(window);
  window.fetch = async (url, opts) => {
    const r = await nativeFetch(url, opts);
    if (!/catalogue\.json$/.test(String(url))) return r;
    const cat = await r.json();
    const live = LIVE.values || {};
    // keep what this Morphe build has: its settings, and its action rows (import / export, logs, links)
    // The installed preference rows decide what shows: a setting Morphe has (all are loaded) but
    // whose row is not in its list (its patch was left out) is not shown. SponsorBlock builds its
    // category rows in code, so they follow SponsorBlock's own row. Without row data (an older
    // patch) every setting with a value shows, as before.
    const meta = LIVE.meta || {};
    const hasRows = Object.values(meta).some(m => m && m.ui && m.type !== "action");
    const isAction = k => meta[k] && meta[k].type === "action";
    const sbOn = !hasRows || !!(meta.morphe_sb_enabled && meta.morphe_sb_enabled.ui);
    const shown = k => {
      if (isAction(k)) return true;
      if (!(k in live)) return false;
      if (!hasRows || (meta[k] && meta[k].ui)) return true;
      return k.startsWith("morphe_sb_") && sbOn;
    };
    if (Object.keys(live).length) cat.preferences = cat.preferences.filter(p => shown(p.key));
    // The preview adds SponsorBlock's category rows after this; only the ones this build has, and
    // none without SponsorBlock, so every control shown can be saved.
    if (Object.keys(live).length && typeof SB_CATS !== "undefined") {
      for (let i = SB_CATS.length - 1; i >= 0; i--) if (!sbOn || !(("morphe_sb_" + SB_CATS[i][0]) in live)) SB_CATS.splice(i, 1);
    }
    applyLive(cat);
    if (Array.isArray(cat.youtubeVersions) && cat.youtubeVersions.length && LIVE.version) {
      const vs = cat.youtubeVersions.slice().sort((a, b) => cmpV(b.version, a.version));
      const pick = vs.find(v => cmpV(v.version, LIVE.version) <= 0) || vs[vs.length - 1];
      cat.youtubeVersions = [pick];
    }
    return new Response(JSON.stringify(cat), { headers: { "Content-Type": "application/json" } });
  };
  // Live data: what this Morphe build says (LIVE.meta, from the regular settings rows and the
  // Setting API) wins over the catalogue; the catalogue keeps only preview hints (element,
  // animation, order, grouping). Availability follows Setting.isAvailable(), refreshed after
  // every change (morpheAvailability), instead of the catalogue's copied rules.
  window.__liveAvail = {};
  // Morphe's action rows (not settings): a tap runs the real row in the app, see app-post.js
  window.__liveActions = new Set(Object.keys(LIVE.meta || {}).filter(k => LIVE.meta[k] && LIVE.meta[k].type === "action"));
  function applyLive(cat) {
    const meta = LIVE.meta || {};
    const known = new Set(cat.preferences.map(p => p.key));
    const TYPE_WIDGET = { action: "Preference", boolean: "SwitchPreference", enum: "ListPreference", string: "EditTextPreference", integer: "EditTextPreference", long: "EditTextPreference", float: "EditTextPreference" };
    const liveType = m => m.type === "action" ? null : m.type;
    for (const p of cat.preferences) {
      const m = meta[p.key]; if (!m) continue;
      // Morphe changed the setting's type (a switch became a list, say): its type and widget win,
      // so the control and the value format match what Morphe saves.
      if (m.type && TYPE_WIDGET[m.type] && liveType(m) !== p.type && !(m.type === "action" && p.type == null)) {
        p.type = liveType(m);
        p.widget = Array.isArray(m.entries) && m.entries.length ? "ListPreference" : TYPE_WIDGET[m.type];
        delete p.entryVariants; delete p.versionDefault; delete p.summaryOn; delete p.summaryOff;
      }
      if (m.title) p.title = m.title;
      if (m.summary != null) p.summary = m.summary;
      if (p.type === "boolean") { if (m.summaryOn != null) p.summaryOn = m.summaryOn; if (m.summaryOff != null) p.summaryOff = m.summaryOff; }
      if (Array.isArray(m.entries) && m.entries.length) {
        p.entries = m.entries.map(([label, value]) => ({ label, value }));
        delete p.entryVariants;
        delete RUNTIME_ENTRIES[p.key];
      }
      if ("default" in m) { p.default = m.default; delete p.versionDefault; }
      if (typeof m.rebootApp === "boolean") p.rebootApp = m.rebootApp;
      if (typeof m.available === "boolean") {
        __liveAvail[p.key] = m.available;
        // The value comes from the native map; the catalogue rule stays in the text (never
        // evaluated) so "Needs ..." and "Take me there" can still name the settings involved.
        const live = `__liveAvail[${JSON.stringify(p.key)}] !== false`;
        p.availability = p.availability ? `!(false && (${p.availability})) && ${live}` : live;
      }
    }
    // Settings this build has that the catalogue doesn't know: plain rows under Misc, so nothing is hidden.
    for (const [k, m] of Object.entries(meta)) {
      if (known.has(k) || !m.ui || !TYPE_WIDGET[m.type] || /^morphe_visual_editor_/.test(k)) continue;
      const entries = Array.isArray(m.entries) && m.entries.length ? m.entries.map(([label, value]) => ({ label, value })) : undefined;
      cat.preferences.push({ key: k, title: m.title || "", summary: m.summary ?? null, summaryOn: m.summaryOn ?? null, summaryOff: m.summaryOff ?? null,
        widget: entries ? "ListPreference" : TYPE_WIDGET[m.type], type: m.type === "action" ? null : m.type, default: m.default, rebootApp: !!m.rebootApp, parents: [], customAvailability: [],
        screen: null, screenTitle: m.screenTitle || null, subScreen: null, subScreenTitle: m.subScreenTitle || null, entries, live: true });
      // availability as Morphe has it, read through the same rule the known rows use
      if (typeof m.available === "boolean") {
        __liveAvail[k] = m.available;
        cat.preferences[cat.preferences.length - 1].availability = `__liveAvail[${JSON.stringify(k)}] !== false`;
      }
    }
  }
  const fileLoad = store.load;
  store.load = function () {
    const s = fileLoad();
    s.state = Object.assign({}, LIVE.values);
    delete s.yt; delete s.device;
    return s;
  };
  navigator.vibrate = ms => { try { MorpheApp.vibrate(Number(Array.isArray(ms) ? ms[0] : ms) || 15); } catch (e) { /* ignore */ } return true; };
}
