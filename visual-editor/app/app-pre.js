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
    if (Array.isArray(cat.youtubeVersions) && cat.youtubeVersions.length && LIVE.version) {
      const vs = cat.youtubeVersions.slice().sort((a, b) => cmpV(b.version, a.version));
      const pick = vs.find(v => cmpV(v.version, LIVE.version) <= 0) || vs[vs.length - 1];
      cat.youtubeVersions = [pick];
    }
    return new Response(JSON.stringify(cat), { headers: { "Content-Type": "application/json" } });
  };
  const fileLoad = store.load;
  store.load = function () {
    const s = fileLoad();
    s.state = Object.assign({}, LIVE.values);
    delete s.yt; delete s.device;
    return s;
  };
  navigator.vibrate = ms => { try { MorpheApp.vibrate(Number(Array.isArray(ms) ? ms[0] : ms) || 15); } catch (e) { /* ignore */ } return true; };
}
