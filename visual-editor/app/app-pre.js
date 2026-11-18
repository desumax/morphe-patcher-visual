"use strict";
// In-app mode, part 1 (loaded after core.js, before boot.js). Active only inside YouTube, where the
// visual editor patch provides window.MorpheApp. The preview then edits the real Morphe settings:
//   - the catalogue keeps only the settings this Morphe build has, and only the installed YouTube version
//   - the starting values are the live values, not localStorage
const INAPP = typeof window.MorpheApp !== "undefined";
let LIVE = { values: {}, version: "" };
if (INAPP) {
  document.documentElement.classList.add("inapp");
  try { LIVE = JSON.parse(MorpheApp.state()); } catch (e) { /* keep empty: preview defaults */ }
  try { localStorage.removeItem(LS + "-baseline"); } catch (e) { /* storage unavailable */ }
  const cmpV = (a, b) => { const x = String(a).split(".").map(Number), y = String(b).split(".").map(Number); for (let i = 0; i < Math.max(x.length, y.length); i++) { const d = (x[i] || 0) - (y[i] || 0); if (d) return d; } return 0; };
  const nativeFetch = window.fetch.bind(window);
  window.fetch = async (url, opts) => {
    const r = await nativeFetch(url, opts);
    if (!/catalogue\.json$/.test(String(url))) return r;
    const cat = await r.json();
    const live = LIVE.values || {};
    if (Object.keys(live).length) cat.preferences = cat.preferences.filter(p => p.key in live);
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
  function applyLive(cat) {
    const meta = LIVE.meta || {};
    const known = new Set(cat.preferences.map(p => p.key));
    for (const p of cat.preferences) {
      const m = meta[p.key]; if (!m) continue;
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
    const TYPE_WIDGET = { boolean: "SwitchPreference", enum: "ListPreference", string: "EditTextPreference", integer: "EditTextPreference", long: "EditTextPreference", float: "EditTextPreference" };
    for (const [k, m] of Object.entries(meta)) {
      if (known.has(k) || !m.ui || !TYPE_WIDGET[m.type] || /^morphe_visual_editor_/.test(k)) continue;
      const entries = Array.isArray(m.entries) && m.entries.length ? m.entries.map(([label, value]) => ({ label, value })) : undefined;
      cat.preferences.push({ key: k, title: m.title || "", summary: m.summary ?? null, summaryOn: m.summaryOn ?? null, summaryOff: m.summaryOff ?? null,
        widget: entries ? "ListPreference" : TYPE_WIDGET[m.type], type: m.type, default: m.default, rebootApp: !!m.rebootApp, parents: [], customAvailability: [],
        screen: null, screenTitle: m.screenTitle || null, subScreen: null, subScreenTitle: m.subScreenTitle || null, entries, live: true });
      if (typeof m.available === "boolean") __liveAvail[k] = m.available;
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
