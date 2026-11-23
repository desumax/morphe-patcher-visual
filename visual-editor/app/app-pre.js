"use strict";
// In-app mode, part 1 (loaded after core.js, before boot.js). Active only inside YouTube, where the
// visual editor patch provides window.MorpheApp. The preview then edits the real Morphe settings:
//   - the list holds exactly the rows Morphe's own list has (adaptCatalogue), at the installed YouTube version
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
    window.MORPHE_STOP = true; // boot.js draws nothing while the app swaps in its regular list
    try { MorpheApp.fallback(); } catch (e) { try { MorpheApp.close(); } catch (e2) { /* ignore */ } }
  }
  try { localStorage.removeItem(LS + "-baseline"); } catch (e) { /* storage unavailable */ }
  const cmpV = (a, b) => { const x = String(a).split(".").map(Number), y = String(b).split(".").map(Number); for (let i = 0; i < Math.max(x.length, y.length); i++) { const d = (x[i] || 0) - (y[i] || 0); if (d) return d; } return 0; };
  // THE ONE PLACE that decides which rows the in-app editor has. boot.js calls it once the
  // preview's own rows are assembled (the catalogue, then SponsorBlock's categories).
  //   - Morphe decides: LIVE.meta holds one entry per row its own list shows (LiveSettings.meta),
  //     settings and action rows alike. A setting without an entry is not in this build's list
  //     (its patch was left out), so it is not in the editor either.
  //   - The one exception: SponsorBlock builds its category rows in code, so they have no entry of
  //     their own; they are in while SponsorBlock's screen is (morphe_sb_enabled has an entry) and
  //     this build has their setting.
  //   - Every row's facts come from Morphe (applyLive); the catalogue adds only preview hints.
  //   - Rows Morphe has that the catalogue doesn't know are added as plain rows.
  // Elsewhere the editor only leaves out rows that do nothing on this device (offDevice, a design
  // rule). The App view's stand-in (MorpheApp.preview) keeps the preview's catalogue.
  window.adaptCatalogue = cat => {
    if (MorpheApp.preview || window.MORPHE_STOP) return;
    const meta = LIVE.meta || {}, values = LIVE.values || {};
    const sbScreen = "morphe_sb_enabled" in meta;
    const sbKeys = new Set(SB_CATS.map(([c]) => "morphe_sb_" + c));
    const exists = k => k in meta || (sbScreen && sbKeys.has(k) && k in values);
    cat.preferences = cat.preferences.filter(p => exists(p.key));
    // the SponsorBlock scene draws only the categories this build has
    for (let i = SB_CATS.length - 1; i >= 0; i--) if (!exists("morphe_sb_" + SB_CATS[i][0])) SB_CATS.splice(i, 1);
    applyLive(cat);
    // the installed YouTube version picks the preview's layout (the newest one at or below it)
    if (Array.isArray(cat.youtubeVersions) && cat.youtubeVersions.length && LIVE.version) {
      const vs = cat.youtubeVersions.slice().sort((a, b) => cmpV(b.version, a.version));
      cat.youtubeVersions = [vs.find(v => cmpV(v.version, LIVE.version) <= 0) || vs[vs.length - 1]];
    }
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
    const FAMILY = { boolean: "switch", enum: "text", string: "text", integer: "number", long: "number", float: "number" };
    for (const p of cat.preferences) {
      const m = meta[p.key]; if (!m) continue;
      delete p.when; // Morphe shows this row in this build, whatever YouTube version the catalogue rule names
      // Morphe changed the setting's type (a switch became a list, say): its type and widget win,
      // so the control and the value format match what Morphe saves.
      // Within one family (integer / long / float, string / enum) only the value format follows, so
      // a read-only counter stays read-only and a list stays a list.
      if (FAMILY[m.type] && FAMILY[m.type] === FAMILY[p.type]) p.type = m.type;
      else if (m.type && TYPE_WIDGET[m.type] && liveType(m) !== p.type && !(m.type === "action" && p.type == null)) {
        p.type = liveType(m);
        p.widget = Array.isArray(m.entries) && m.entries.length ? "ListPreference" : TYPE_WIDGET[m.type];
        delete p.entryVariants; delete p.versionDefault; delete p.summaryOn; delete p.summaryOff;
        if (p.widget !== "ListPreference") { delete p.entries; delete RUNTIME_ENTRIES[p.key]; }
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
      if (known.has(k) || !TYPE_WIDGET[m.type] || /^morphe_visual_editor_/.test(k)) continue;
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
