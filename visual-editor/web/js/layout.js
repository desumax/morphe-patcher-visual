"use strict";
// Theme colours, tablet layout, devices and UI scale.

// ------------------------------------------------------------------ theme and tablet layout
let theme = "yt";
function applyTheme() { const ph = $("phone"); ph.classList.toggle("theme-yt", theme !== "m3"); ph.classList.toggle("theme-m3", theme === "m3"); applyAppColors(); }
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
  if (theme === "m3") { ["--m-bg", "--m-surface", "--m-c", "--m-c-high", "--m-c-highest"].forEach(v => ph.style.removeProperty(v)); return; }
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
$("uiScale").addEventListener("input", e => { uiScale = Number(e.target.value); $("uiScaleOut").textContent = uiScale + "%"; applyDevice(); });
window.addEventListener("resize", () => { if (window.innerWidth > 860) applyDevice(); else { $("phone").style.transform = ""; $("devwrap").style.width = ""; $("devwrap").style.height = ""; $("phone").style.width = ""; $("phone").style.height = ""; } });
