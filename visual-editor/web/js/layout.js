"use strict";
// Theme colours, tablet layout, devices and UI scale.

// ------------------------------------------------------------------ theme and tablet layout
// UI design (Max, Nov 23): "yt" = Original (YouTube's own settings look), "m3" = Morphe (Morphe Manager's
// Material 3), "glass" = Glass (the Morphe layout as frosted panes over a soft coloured backdrop).
let theme = "yt";
const UI_DESIGNS = [["yt", "Original"], ["m3", "Morphe"], ["glass", "Glass"]];
function applyTheme() {
  const ph = $("phone");
  ph.classList.toggle("theme-yt", theme === "yt"); ph.classList.toggle("theme-m3", theme !== "yt"); ph.classList.toggle("theme-glass", theme === "glass");
  if (theme === "glass") glassTierApply(); else ph.removeAttribute("data-gt");
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
let glassForced = null; try { const f = localStorage.getItem(LS + "-glassforce"); if (f !== null && /^[012]$/.test(f)) glassForced = +f; } catch { /* storage unavailable */ }
function glassTierDetect() {
  const sup = q => { try { return CSS.supports(q); } catch { return false; } };
  const mq = q => { try { return matchMedia(q).matches; } catch { return false; } };
  if (!(sup("backdrop-filter: blur(1px)") || sup("-webkit-backdrop-filter: blur(1px)"))) return 0;
  if (mq("(prefers-reduced-transparency: reduce)")) return 0;
  const mem = navigator.deviceMemory || 4, cores = navigator.hardwareConcurrency || 4;
  if (mem <= 2 || cores <= 2) return 0;
  const chromium = !!(window.chrome || /\bChrome\/\d/.test(navigator.userAgent));
  if (chromium && mem >= 6 && cores >= 6 && sup("backdrop-filter: url(#lgRefract)") && !mq("(prefers-reduced-motion: reduce)")) return 2;
  return 1;
}
function glassTierApply() {
  if (glassCap === null) { glassCap = 2; try { const c = parseInt(localStorage.getItem(LS + "-glass"), 10); if (c >= 0 && c <= 2) glassCap = c; } catch { /* storage unavailable */ } }
  if (glassForced !== null) glassTier = glassForced;
  else if (glassTier === null) glassTier = Math.min(glassTierDetect(), glassCap);
  $("phone").dataset.gt = glassTier;
  if (glassTier === 2 && !$("lgDefs")) document.body.insertAdjacentHTML("beforeend", '<svg id="lgDefs" width="0" height="0" style="position:absolute;width:0;height:0" aria-hidden="true" focusable="false"><filter id="lgRefract" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.011 0.016" numOctaves="2" seed="11" result="n"/><feGaussianBlur in="n" stdDeviation="2.5" result="w"/><feDisplacementMap in="SourceGraphic" in2="w" scale="26" xChannelSelector="R" yChannelSelector="G"/></filter></svg>');
}
const GLASS_TIER_NAMES = ["Flat glass", "Light glass", "Full glass"];
// frame-time watch: a short window of frames after a scroll or an opening menu or dialog
let glassWatch = null;
function glassSample() {
  if (theme !== "glass" || !glassTier || glassWatch || glassForced !== null) return;
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
    }
  });
}
document.addEventListener("scroll", glassSample, { capture: true, passive: true });
function setGlassForce(v) {
  glassForced = v === "" || v === null ? null : +v; glassTier = null;
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
