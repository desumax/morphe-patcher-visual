"use strict";
// Theme colours, tablet layout, devices and UI scale.

// ------------------------------------------------------------------ theme and tablet layout
// UI design (Max, Nov 23): "yt" = Original (YouTube's own settings look), "m3" = Morphe (Morphe Manager's
// Material 3), "glass" = Glass (the Morphe layout as frosted panes over a soft coloured backdrop).
let theme = "yt";
const UI_DESIGNS = [["yt", "Original"], ["m3", "Morphe"], ["glass", "Glass"]];
function applyTheme() {
  if (theme === "glass" && glassUnsupported()) theme = "m3"; // saved from a device where it ran, or pretended
  const ph = $("phone");
  ph.classList.toggle("theme-yt", theme === "yt"); ph.classList.toggle("theme-m3", theme !== "yt"); ph.classList.toggle("theme-glass", theme === "glass");
  if (theme === "glass") glassTierApply(); else { ph.removeAttribute("data-gt"); liquidSync(); }
  applyAppColors();
}
// Glass adapts to the device, after ntvien/liquid-glass's device tiers: the same design is drawn with as
// much glass as the device can afford, so it never stutters.
//   2 Full:  blurred, refracting panes (SVG displacement through backdrop-filter) on bars, menus, dialogs
//            and the settings cards. Chromium only, on devices with 6+ GB and 6+ cores.
//   1 Light: blur on the few panes that float over content (top of the list, menu, dialogs, snackbar);
//            cards are tinted, not blurred.
//   0 Flat:  no blur at all, tinted panes only: no backdrop-filter support, reduced transparency asked
//            for, or a low-end device (2 GB or 2 cores or fewer).
// While glass is on, frame times are sampled during scrolls and menu/dialog animations; if three
// quarters of the frames take longer than 24 ms the tier drops one step, and the device remembers it.
let glassTier = null, glassCap = null;
// the preview's own page can force a level, to see each one on any computer (Max, Nov 23 PM); the app never does
let glassForced = null; try { const f = localStorage.getItem(LS + "-glassforce"); if (f !== null && /^[012]$/.test(f)) glassForced = +f; else if (f === "x" || f === "w") glassForced = f; } catch { /* storage unavailable */ }
function glassTierDetect() {
  const sup = q => { try { return CSS.supports(q); } catch { return false; } };
  const mq = q => { try { return matchMedia(q).matches; } catch { return false; } };
  if (!(sup("backdrop-filter: blur(1px)") || sup("-webkit-backdrop-filter: blur(1px)"))) return 0;
  if (mq("(prefers-reduced-transparency: reduce)")) return 0;
  const mem = navigator.deviceMemory || 4, cores = navigator.hardwareConcurrency || 4;
  if (mem <= 2 || cores <= 2) return 0;
  const chromium = !!(window.chrome || /\bChrome\/\d/.test(navigator.userAgent));
  if (chromium && mem >= 6 && cores >= 6 && sup("backdrop-filter: url(#lens)") && !mq("(prefers-reduced-motion: reduce)")) return 2;
  return 1;
}
function glassTierApply() {
  if (glassCap === null) { glassCap = 2; try { const c = parseInt(localStorage.getItem(LS + "-glass"), 10); if (c >= 0 && c <= 2) glassCap = c; } catch { /* storage unavailable */ } }
  if (typeof glassForced === "number") glassTier = glassForced;
  else if (glassTier === null) glassTier = Math.min(glassForced === "w" ? 0 : glassTierDetect(), glassCap);
  $("phone").dataset.gt = glassTier;
  liquidSoon();
}
const GLASS_TIER_NAMES = ["Flat glass", "Light glass", "Full glass"];
// Glass where it can't run (Max, Nov 23): no backdrop-filter at all, or an Android older than
// GLASS_MIN_ANDROID. Its button in UI design is greyed out; tapping it says why (a message, not a choice).
// The preview's Glass level menu can pretend the device is one of these ("Unsupported" there).
const GLASS_MIN_ANDROID = 10;
function glassUnsupported() {
  if (glassForced === "x") return true;
  const sup = q => { try { return CSS.supports(q); } catch { return false; } };
  if (!(sup("backdrop-filter: blur(1px)") || sup("-webkit-backdrop-filter: blur(1px)"))) return true;
  const a = /Android (\d+)/.exec(navigator.userAgent);
  return !!a && +a[1] < GLASS_MIN_ANDROID;
}
const uiOff = () => glassUnsupported() ? ["glass"] : [];
// a greyed-out choice: says why and is not picked (true)
function uiNo(id) { if (id !== "glass" || !glassUnsupported()) return false; snack("Unsupported on this Android version"); return true; }
// picking a UI design, from the screen menu or the tutorial
function uiPick(id) {
  if (uiNo(id)) return false;
  theme = id; applyTheme(); renderBar(); store.save(); glassSample();
  if (theme === "glass" && glassLowEnd()) setTimeout(glassSlowWarn, 450); // after the thumb has moved
  return true;
}
// A device that is too weak for glass, found by detection (2 GB or 2 cores) or by slow frames while glass
// is on: a popup says so once, in the dialog look of the rest (Max, Nov 23). Each new finding warns again.
const GLASS_SLOW_MSG = "Your device is not powerful enough for this glass design, please switch to alternatives for best performance!";
function glassLowEnd() { if (glassForced === "w") return true; const m = navigator.deviceMemory || 4, c = navigator.hardwareConcurrency || 4; return m <= 2 || c <= 2; }
function glassSlowWarn() {
  if (theme !== "glass" || typeof openDialog !== "function") return;
  if ($("dlg").classList.contains("open")) { setTimeout(glassSlowWarn, 1500); return; } // after the dialog that is open now
  openDialog(`<div class="di">${I("warning")}</div><h2 id="dlgTitle">Glass design</h2>
    <p>${GLASS_SLOW_MSG}</p>
    <div class="acts"><button class="dbtn primary" id="dOk">OK</button></div>`);
  $("dOk").onclick = closeDialog;
}
// ---------- Liquid Glass lens (Max, Nov 23: glass design 1) ----------
// Clear glass that bends what is behind it at its edges, with no frost: the web port of ntvien/liquid-glass's
// AGSL lens. For each surface size a displacement map is baked once in a canvas: inside a band B from the
// rounded edge, every point is pushed inward along the edge normal by (1 - sqrt(1 - u²)) × A, u = 1 - depth/B.
// The map feeds feDisplacementMap through backdrop-filter: url(#…), then a saturation lift; floats add a slight
// colour fringe (red, green and blue bent by ×1, ×1.12, ×1.24). Maps are cached by size, corner and recipe.
// What bends, by tier (the --gx-* variables in index.html draw the rest):
//   2 Full:  floats (sticky preview, menu, dialogs, snackbar) with fringe, cards, tracks, chosen thumbs;
//   1 Light: floats and chosen thumbs only, at most LENS_CAP thumbs on screen (as the repo caps real glass
//            per screen); cards keep rim and tint without sampling anything;
//   0 Flat:  no lens and no backdrop-filter at all: translucent fill, a top-left sheen and a 1px stroke.
// Only what is on screen gets a lens; the rest is cleared, so the cost follows what is visible.
const LENS = {
  float: { band: 16, amount: 26, sat: 1.6, blur: 2.5 }, floatFull: { band: 16, amount: 26, chroma: .12, sat: 1.6, blur: 2.5 },
  dlg: { band: 20, amount: 30, sat: 1.6, blur: 6 }, dlgFull: { band: 20, amount: 30, chroma: .1, sat: 1.6, blur: 6 },
  card: { band: 12, amount: 18, sat: 1.4 }, track: { band: 8, amount: 12, sat: 1.5 }, picked: { band: 9, amount: 14, sat: 1.8 },
};
const LENS_ROLES = [
  { sel: ".stick, html:not(.inapp) #picker, .snack", L: "float", tier: 1 },
  { sel: ".dlg", L: "dlg", tier: 1 },
  { sel: ".group", L: "card", tier: 2 },
  { sel: ".seg, .seg3, .lt7, .tab7:not([aria-selected=\"true\"])", L: "track", tier: 2 },
  { sel: ".seg3.th > .seg3-th, .lt7 > i, .ctl .opt[aria-pressed=\"true\"], .tab7[aria-selected=\"true\"]", L: "picked", tier: 1, cap: true },
];
const LENS_CAP = 8;
const lensOK = (() => { try { return CSS.supports("backdrop-filter", "url(#x)") || CSS.supports("-webkit-backdrop-filter", "url(#x)"); } catch { return false; } })();
const lensMaps = new Map(); let lensN = 0;
function lensSd(px, py, hw, hh, r) { const qx = Math.abs(px) - hw + r, qy = Math.abs(py) - hh + r; return Math.min(Math.max(qx, qy), 0) + Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) - r; }
function lensFilter(w, h, r, L) {
  w = Math.max(2, Math.round(w)); h = Math.max(2, Math.round(h)); r = Math.min(r, w / 2, h / 2);
  const key = [w, h, Math.round(r), L.band, L.amount, L.chroma || 0, L.blur || 0, L.sat].join(); if (lensMaps.has(key)) return lensMaps.get(key);
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h; const cx = cv.getContext("2d"), im = cx.createImageData(w, h), D = im.data;
  const hw = w / 2, hh = h / 2, gr = Math.min(r * 1.5, hw, hh), B = L.band, A = L.amount, S = 2 * (A + 1);
  for (let i = 0; i < w * h; i++) { D[i * 4] = D[i * 4 + 1] = D[i * 4 + 2] = 128; D[i * 4 + 3] = 255; }
  // only the band at the edge moves: rows and columns deeper than B are skipped
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (x >= B && x < w - B && y >= B && y < h - B && x >= r && x < w - r) { x = w - Math.max(B, r) - 1; continue; }
    const px = x + .5 - hw, py = y + .5 - hh, dep = -lensSd(px, py, hw, hh, r); if (dep >= B || dep <= -1) continue;
    const u = 1 - Math.max(0, dep) / B, d = (1 - Math.sqrt(Math.max(0, 1 - u * u))) * A, e = .5;
    let gx = lensSd(px + e, py, hw, hh, gr) - lensSd(px - e, py, hw, hh, gr), gy = lensSd(px, py + e, hw, hh, gr) - lensSd(px, py - e, hw, hh, gr); const l = Math.hypot(gx, gy) || 1;
    const ox = Math.max(-x, Math.min(w - 1 - x, -gx / l * d)), oy = Math.max(-y, Math.min(h - 1 - y, -gy / l * d)), i = (y * w + x) * 4;
    D[i] = Math.round((.5 + ox / S) * 255); D[i + 1] = Math.round((.5 + oy / S) * 255);
  }
  cx.putImageData(im, 0, 0);
  const id = "lens" + (lensN++), src = L.blur ? "b" : "SourceGraphic", ca = L.chroma || 0;
  let body = `<feImage href="${cv.toDataURL()}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="none" result="m"/>` + (L.blur ? `<feGaussianBlur in="SourceGraphic" stdDeviation="${L.blur}" result="b"/>` : "");
  if (!ca) body += `<feDisplacementMap in="${src}" in2="m" scale="${S}" xChannelSelector="R" yChannelSelector="G" result="d"/>`;
  else {
    const ch = ["1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0", "0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0", "0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0"];
    [1, 1 + ca, 1 + 2 * ca].forEach((k, i) => { body += `<feDisplacementMap in="${src}" in2="m" scale="${S * k}" xChannelSelector="R" yChannelSelector="G" result="d${i}"/><feColorMatrix in="d${i}" values="${ch[i]}" result="c${i}"/>`; });
    body += `<feComposite in="c0" in2="c1" operator="arithmetic" k2="1" k3="1" result="c01"/><feComposite in="c01" in2="c2" operator="arithmetic" k2="1" k3="1" result="d"/>`;
  }
  body += `<feColorMatrix in="d" type="saturate" values="${L.sat}"/>`;
  let defs = $("lensDefs"); if (!defs) { document.body.insertAdjacentHTML("beforeend", '<svg id="lensDefs" width="0" height="0" style="position:absolute;width:0;height:0" aria-hidden="true" focusable="false"><defs></defs></svg>'); defs = $("lensDefs"); }
  defs.firstChild.insertAdjacentHTML("beforeend", `<filter id="${id}" x="0" y="0" width="${w}" height="${h}" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB">${body}</filter>`);
  lensMaps.set(key, id); return id;
}
let lensOn = new Set(), lensRaf = 0;
function lensClear(e) { e.style.backdropFilter = ""; e.style.webkitBackdropFilter = ""; }
function liquidSync() {
  lensRaf = 0;
  const ph = $("phone"), tier = theme === "glass" && lensOK ? +(ph.dataset.gt || 0) : 0;
  if (!tier) { lensOn.forEach(lensClear); lensOn = new Set(); return; }
  const vh = innerHeight, vw = innerWidth, want = [], seen = new Set();
  // reads first, then writes (one layout)
  for (let i = LENS_ROLES.length - 1; i >= 0; i--) { // later roles win (a chosen tab is picked, not track)
    const R = LENS_ROLES[i]; if (tier < R.tier) continue;
    let n = 0;
    ph.querySelectorAll(R.sel).forEach(e => {
      if (seen.has(e)) return; seen.add(e);
      const b = e.getBoundingClientRect(); if (b.width < 4 || b.height < 4 || b.bottom < 0 || b.top > vh || b.right < 0 || b.left > vw) return;
      if (e.checkVisibility && !e.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true, opacityProperty: true, visibilityProperty: true })) return; // a closed menu or dialog
      if (R.cap && tier === 1 && ++n > LENS_CAP) return;
      want.push([e, e.offsetWidth || b.width, e.offsetHeight || b.height, parseFloat(getComputedStyle(e).borderTopLeftRadius) || 0, LENS[R.L + (tier === 2 && LENS[R.L + "Full"] ? "Full" : "")]]);
    });
  }
  const next = new Set();
  want.forEach(([e, w, h, r, L]) => { const v = `url(#${lensFilter(w, h, r, L)})`; if (e.style.backdropFilter !== v) { e.style.backdropFilter = v; e.style.webkitBackdropFilter = v; } next.add(e); });
  lensOn.forEach(e => { if (!next.has(e)) lensClear(e); }); lensOn = next;
}
function liquidSoon() { if (!lensRaf && theme === "glass") lensRaf = requestAnimationFrame(() => requestAnimationFrame(liquidSync)); }
// redraws, choices, resizes and scrolls all ask for one sync on the next frames
{
  const ph = $("phone");
  new MutationObserver(liquidSoon).observe(ph, { childList: true, subtree: true, attributes: true, attributeFilter: ["aria-pressed", "aria-selected", "data-at", "data-gt"] });
  let st = 0; document.addEventListener("scroll", () => { clearTimeout(st); st = setTimeout(liquidSoon, 120); }, { capture: true, passive: true });
  addEventListener("resize", liquidSoon);
}
// frame-time watch: a short window of frames after a scroll or an opening menu or dialog
let glassWatch = null;
function glassSample() {
  setTimeout(liquidSoon, 40); // a menu or dialog opening: its glass gets its lens once it shows
  if (theme !== "glass" || !glassTier || glassWatch || typeof glassForced === "number") return;
  const dts = []; let last = 0;
  glassWatch = requestAnimationFrame(function f(t) {
    if (last) { const dt = t - last; if (dt < 250) dts.push(dt); } // a hidden tab's gap isn't a slow frame
    last = t;
    if (dts.length < 40) { glassWatch = requestAnimationFrame(f); return; }
    glassWatch = null;
    dts.sort((a, b) => a - b);
    if (dts[Math.floor(dts.length * .75)] > 24 && theme === "glass" && glassTier > 0) {
      glassTier--; glassCap = glassTier;
      try { localStorage.setItem(LS + "-glass", String(glassCap)); } catch { /* storage unavailable */ }
      $("phone").dataset.gt = glassTier;
      if (typeof renderBar === "function" && $("picker").classList.contains("open")) renderBar();
      glassSlowWarn(); // slow frames: the device can't keep up with this much glass
    }
  });
}
document.addEventListener("scroll", glassSample, { capture: true, passive: true });
function setGlassForce(v) {
  glassForced = v === "" || v === null ? null : v === "x" || v === "w" ? v : +v; glassTier = null;
  if (glassForced === "x" && theme === "glass") theme = "m3"; // pretending glass can't run here: it can't stay on
  try { if (glassForced === null) localStorage.removeItem(LS + "-glassforce"); else localStorage.setItem(LS + "-glassforce", String(glassForced)); } catch { /* storage unavailable */ }
  applyTheme(); renderBar();
}
// Morphe's theme patch (Pure black / AMOLED, Material You, Catppuccin, custom) changes YouTube's
// background, so the preview and, in the YouTube look, the editor itself follow it.
function appBg() {
  if (mode === "orig") return "#0f0f0f";
  const t = state.morphe_theme_color_dark;
  if (t === "CUSTOM") return String(state.morphe_theme_color_dark_custom || "#0f0f0f").replace(/^#(..)(......)$/, "#$2");
  return (typeof THEME_DARK !== "undefined" && THEME_DARK[t]) || "#0f0f0f";
}
function lift(hex, amt) { const n = parseInt(hex.slice(1), 16); const c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.min(255, Math.round(v + (255 - v) * amt))); return "#" + c.map(v => v.toString(16).padStart(2, "0")).join(""); }
function applyAppColors() {
  const ph = $("phone"), bg = appBg();
  ph.style.setProperty("--app-bg", bg);
  if (theme !== "yt") { ["--m-bg", "--m-surface", "--m-c", "--m-c-high", "--m-c-highest"].forEach(v => ph.style.removeProperty(v)); return; }
  ph.style.setProperty("--m-bg", bg); ph.style.setProperty("--m-surface", bg); ph.style.setProperty("--m-c", bg);
  ph.style.setProperty("--m-c-high", lift(bg, .13)); ph.style.setProperty("--m-c-highest", lift(bg, .22));
}
// Portrait tablet: the preview sits on top and the settings fill two columns below it, on every tab.
// (This used to be limited to tabs with a 16:9 player, so Playback, Player menu, Home and the others
// fell back to one narrow column beside the preview. Every preview is at most ~420px tall, so all fit.)
function applyLayout() {
  const ed = document.querySelector(".editor"); if (!ed) return;
  const st = ed.clientWidth >= 600 && ed.clientHeight >= ed.clientWidth * 0.95;
  $("content").classList.toggle("stacked", st);
  fitOpts(); // column widths change with the layout, so the pills are fitted again
}
window.addEventListener("resize", applyLayout);

// ------------------------------------------------------------------ devices and UI scale
const DEVICES = [
  { id: "phone", label: "Phone", w: 400, h: 820 },
  { id: "land", label: "Phone landscape", w: 860, h: 420 },
  { id: "tablet", label: "Tablet", w: 820, h: 1100 },
  { id: "desktop", label: "Desktop", w: 1180, h: 760, desktop: true },
];
let device_ = "phone", uiScale = 100;
function applyDevice() {
  const d = DEVICES.find(x => x.id === device_);
  const ph = $("phone");
  ph.style.width = d.w + "px"; ph.style.height = d.h + "px"; ph.classList.toggle("desktop", !!d.desktop);
  $("app").style.zoom = uiScale / 100;
  const avail = Math.min(window.innerWidth - 40, d.w), availH = window.innerHeight - 40;
  const s = Math.min(1, avail / d.w, Math.max(.45, availH / d.h));
  ph.style.transform = s < 1 ? `scale(${s})` : "";
  $("devwrap").style.width = d.w * s + "px"; $("devwrap").style.height = d.h * s + "px";
  applyLayout(); if (barStays()) $("app").classList.remove("barhidden");
  $("devBtns").innerHTML = DEVICES.map(x => `<button class="btn" data-dev="${x.id}" aria-pressed="${x.id === device_}">${x.label}</button>`).join("");
}
$("devBtns").addEventListener("click", e => { const b = e.target.closest("[data-dev]"); if (!b) return; device_ = b.dataset.dev; applyDevice(); store.save(); });
{ const gs = $("glideStyle"); if (gs) { gs.innerHTML = GLIDE_STYLES.map(([v, t]) => `<option value="${v}">${t}</option>`).join(""); gs.value = glideStyle; gs.addEventListener("change", e => setGlideStyle(e.target.value)); } }
{ const gf = $("glassForce"); if (gf) { gf.value = glassForced === null ? "" : String(glassForced); gf.addEventListener("change", e => setGlassForce(e.target.value)); } }
$("uiScale").addEventListener("input", e => { uiScale = Number(e.target.value); $("uiScaleOut").textContent = uiScale + "%"; applyDevice(); });
window.addEventListener("resize", () => { if (window.innerWidth > 860) applyDevice(); else { $("phone").style.transform = ""; $("devwrap").style.width = ""; $("devwrap").style.height = ""; $("phone").style.width = ""; $("phone").style.height = ""; } });
