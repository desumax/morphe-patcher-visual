"use strict";
// Rendering the settings list and tabs, search, and the restart prompt.

// ------------------------------------------------------------------ rendering
const $ = id => document.getElementById(id);
const secInfo = () => SECTIONS.find(s => s.id === section);

function renderBar() {
  const s = secInfo(), g = groupOf(section);
  $("secLabel").textContent = grouped ? g.title : s.title;
  $("secIcon").innerHTML = `<path d="${P[grouped ? g.icon : s.icon] || P.list}"/>`;
  renderTabs();
  const pick = (x, i) => {
    const m = MEMBERS[x.id];
    const sub = `${m.live.length + m.misc.length} settings`;
    return `<button class="pick" role="menuitem" data-sec="${x.id}" aria-current="${x.id === section}" style="transition-delay:${Math.min(i, 12) * 12}ms"><span class="pi">${I(x.icon)}</span><span><div class="pt">${esc(x.title)}${devMark(x.id)}</div><div class="ps">${sub}</div></span></button>`;
  };
  const vis = SECTIONS.filter(x => SCENES[x.id]), plain = SECTIONS.filter(x => !SCENES[x.id]);
  // a group card (design D, Max Nov 22): a rail on the left with the icon and the number of settings,
  // the group's name and one line per tab on the right
  const gpick = (x, i) => { const n = tabsOf(x).reduce((a, [t]) => a + MEMBERS[t].live.length + MEMBERS[t].misc.length, 0);
    return `<button class="pick gcard" role="menuitem" data-group="${x.id}" aria-current="${x === g}" style="transition-delay:${i * 12}ms"><span class="gc-rail"><span class="pi">${I(x.icon)}</span><span class="gc-n"><b>${n}</b><small>settings</small></span></span><span class="gc-body"><span class="gc-t">${esc(x.title)}${devMarkGroup(x)}</span><span class="gc-tabs">${tabsOf(x).map(([, t]) => `<span>${esc(t)}</span>`).join("")}</span></span></button>`; };
  $("pickGrid").innerHTML = (grouped ? `<div class="pg pvis pgroups">${GROUPS.map(gpick).join("")}</div>` : `<div class="pg pvis">${vis.map(pick).join("")}</div>` + `<div class="plaincard"><div class="ph">${I("list")}No preview · standard settings</div><div class="pg">${plain.map(pick).join("")}</div></div>`)
    // screen order: its own line under the cards, so the group switch keeps the full width for its text
    + `<div class="themerow ordrow"><span class="ordhint">Hold a screen to move it</span><button class="ordreset" data-order-reset ${customOrder ? "" : "disabled"} title="Hold a screen to move it. This restores Morphe's order.">${I("reset")}Reset order</button></div>`
    + `<div class="themerow simrow"><div class="themetog" data-group-toggle role="menuitemcheckbox" aria-checked="${grouped}"><span class="pi">${I("layers")}</span><div class="tt">Group screens into tabs<small>Six screens instead of ${SECTIONS.length}. Each one has tabs right under the live preview, and every tab brings its own preview.</small></div><span class="sw" role="presentation" aria-checked="${grouped}"></span></div></div>`
    // UI design sits right above the list design (Max, Nov 23)
    // one line: the title on the left, its toggle on the right (Max, Nov 23 PM)
    + `<div class="themerow uirow"><span class="pi">${I("palette")}</span><div class="tt">UI design${theme === "glass" && glassTier !== null ? `<small>${GLASS_TIER_NAMES[glassTier]}${glassForced ? " (forced)" : ""}</small>` : ""}</div>${seg3("UI design", "ui", UI_DESIGNS, theme)}</div>`
    + `<div class="themerow designrow"><div class="dcol"><div class="dsg"><span class="pi">${I("list")}</span><div class="tt">Settings list design</div></div><div class="drow">${seg3("Settings list design", "design", [["classic", "Morphe"], ["toggles", "Switches"], ["clean", "Clean"]], design)}<button class="offnew" data-editor-off>${I("power")}Disable new design</button></div></div></div>`;
  placeSeg3();
  $("btnReset").disabled = mode !== "mod" || !Object.keys(PREF).some(k => JSON.stringify(state[k]) !== JSON.stringify(defaults[k]));
}
// ---- DEV ONLY: "finished" checkmarks -------------------------------------------------------------
// Screens Max has signed off ("lock it"). Shown as a small check in the screen menu and on the tabs.
// To remove before shipping: delete this block, the .devdone CSS rule, and the three devMark /
// devMarkGroup calls (screen menu card, group card, tab).
const DEV_DONE = new Set(["player", "seekbar", "fullscreen", "flyout", "endscreen"]); // section ids, e.g. "player"
// settings Max approved without a preview: a tab id approves all of its settings that have none, a key one setting
const NO_PREVIEW_OK = new Set(["fullscreen", "player", "morphe_custom_seekbar_thumb_file", "morphe_swipe_seek_sensitivity"]);
const devMark = id => DEV_DONE.has(id) ? `<span class="devdone" title="Finished (development marker)">✓</span>` : "";
const devMarkGroup = g => tabsOf(g).length && tabsOf(g).every(([id]) => DEV_DONE.has(id)) ? devMark(tabsOf(g)[0][0]) : "";
// Click a title with the mouse to copy it in quotes ("Open advanced quality menu"), for writing feedback
// faster. Only in the web preview (no MorpheApp bridge) and only for a mouse, so a phone never sees it.
const DEV_WEB = typeof window.MorpheApp === "undefined";
function devCopy(t, x, y) {
  t = String(t).replace(/✓/g, "").replace(/\s+/g, " ").trim(); if (!t) return;
  const q = `"${t}"`, done = () => { const n = document.createElement("div"); n.className = "devcopy"; n.textContent = "Copied " + q; n.style.left = x + "px"; n.style.top = y + "px"; document.body.appendChild(n); setTimeout(() => n.remove(), 1100); };
  const old = () => { const ta = document.createElement("textarea"); ta.value = q; ta.style.cssText = "position:fixed;opacity:0"; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); done(); } catch (e) { /* no clipboard */ } ta.remove(); };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(q).then(done, old); else old();
}
document.addEventListener("click", e => {
  if (!DEV_WEB || e.pointerType !== "mouse" || !(e.target instanceof Element) || e.target.closest("#devTour")) return;
  const row = e.target.closest(".row .ttl") && e.target.closest("[data-row]"), res = e.target.closest(".sres .ttl") && e.target.closest("[data-res]");
  const plain = e.target.closest(".gc-t, .tab7, .pick .pt, .sit, .gtitle, #canvas .cap");
  const t = row ? shownTitle(row.dataset.row) : res ? title(res.dataset.res) : plain ? plain.textContent : "";
  if (t) devCopy(t, e.clientX, e.clientY);
}, true);
// Animation tour: step through every setting that has an animation (a two-phone comparison or a live
// preview animation), tab by tab in menu order, with the buttons, the arrow keys or the mouse wheel over
// the bar. Each step opens the setting the way a search result does. Click the name to copy it.
function tourKeys() {
  const ids = grouped ? GROUPS.flatMap(g => tabsOf(g).map(([t]) => t)) : SECTIONS.map(s => s.id), out = [];
  for (const id of ids) { const m = MEMBERS[id]; if (m) for (const k of [...m.live, ...m.misc]) if ((SCN[k] || DEMOS[k]) && inVersion(k) && !out.includes(k)) out.push(k); }
  return out;
}
function tourGo(d) {
  const ks = tourKeys(); if (!ks.length) return;
  let i = ks.indexOf(selected); i = i < 0 ? (d > 0 ? 0 : ks.length - 1) : (i + d + ks.length) % ks.length;
  goToSetting(ks[i]); tourLabel(ks[i], i, ks.length);
}
function tourLabel(k, i, n) {
  const b = document.getElementById("devTour"); if (!b) return;
  const sec = SECTIONS.find(z => z.id === sectionOf(k));
  b.querySelector(".dt-n").textContent = `${i + 1} / ${n} · ${sec ? sec.title : ""}`;
  const nm = b.querySelector(".dt-k"); nm.textContent = shownTitle(k); nm.dataset.k = k;
}
function tourOpen(open) {
  let b = document.getElementById("devTour");
  if (!b) {
    b = document.createElement("div"); b.id = "devTour";
    b.innerHTML = `<button class="dt-go" data-d="-1" aria-label="Previous animation">‹</button><div class="dt-mid"><div class="dt-n">Animation tour</div><div class="dt-k" title="Click to copy">Press › to start</div></div><button class="dt-go" data-d="1" aria-label="Next animation">›</button><button class="dt-x" aria-label="Close the tour">×</button>`;
    document.body.appendChild(b);
    b.addEventListener("click", e => {
      const go = e.target.closest(".dt-go"), x = e.target.closest(".dt-x"), nm = e.target.closest(".dt-k");
      if (go) tourGo(Number(go.dataset.d)); else if (x) tourOpen(false); else if (nm && nm.dataset.k) devCopy(nm.textContent, e.clientX, e.clientY);
    });
    let wheelAt = 0;
    b.addEventListener("wheel", e => { e.preventDefault(); const now = performance.now(); if (now - wheelAt < 350 || !e.deltaY) return; wheelAt = now; tourGo(e.deltaY > 0 ? 1 : -1); }, { passive: false });
  }
  b.hidden = !open; document.getElementById("devTourBtn").hidden = open;
  if (open && selected) { const ks = tourKeys(), i = ks.indexOf(selected); if (i >= 0) tourLabel(selected, i, ks.length); }
}
document.addEventListener("keydown", e => {
  const b = document.getElementById("devTour"); if (!b || b.hidden || e.target.closest?.("input, textarea, [contenteditable]")) return;
  if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); tourGo(1); }
  if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); tourGo(-1); }
});
if (DEV_WEB) window.addEventListener("load", () => {
  const t = document.createElement("button"); t.id = "devTourBtn"; t.textContent = "▶ Tour"; t.title = "Step through every animation (development tool)";
  t.onclick = () => tourOpen(true); document.body.appendChild(t);
});
// To remove before shipping: delete everything from "Click a title" to here, and the .devcopy and
// #devTour CSS rules.
// ---- end DEV ONLY ---------------------------------------------------------------------------------
function renderTabs() {
  const box = $("tabs"); if (!box) return;
  $("stick").classList.toggle("grouped", grouped);
  if (!grouped) { box.innerHTML = ""; return; }
  const g = groupOf(section);
  box.innerHTML = tabsOf(g).map(([id, t]) => `<button class="tab7" role="tab" data-tab="${id}" aria-selected="${id === section}">${esc(t)}${devMark(id)}</button>`).join("");
  const cur = box.querySelector('[aria-selected="true"]');
  if (cur) box.scrollTo({ left: cur.offsetLeft - (box.clientWidth - cur.offsetWidth) / 2, behavior: "smooth" });
}
// Screen menu order: Morphe's own order by default (its settings screens, then their sub-screens);
// hold a card to drag it somewhere else. The custom order is saved; Reset order restores Morphe's.
let customOrder = null, morpheOrder = [];
function computeMorpheOrder() {
  const titleOf = scr => (CAT.screens && CAT.screens[scr]) || scr || "~";
  const rank = id => {
    const m = MEMBERS[id]; const keys = m ? [...m.live, ...m.misc] : [];
    if (!keys.length) return "~~";
    const count = {}; keys.forEach(k => { const p = PREF[k]; const t = titleOf(p.screen) + "|" + (p.subScreenTitle || ""); count[t] = (count[t] || 0) + 1; });
    return Object.entries(count).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];
  };
  morpheOrder = [...SECTIONS].map(s => [s.id, s.id === "misc" ? "~~~" : rank(s.id)]).sort((a, b) => a[1].localeCompare(b[1])).map(x => x[0]);
}
function applyOrder() {
  if (!morpheOrder.length) computeMorpheOrder();
  const ids = customOrder ? [...customOrder.filter(id => SECTIONS.some(s => s.id === id)), ...morpheOrder.filter(id => !customOrder.includes(id))] : morpheOrder;
  const all = [...SECTIONS]; SECTIONS.length = 0;
  ids.forEach(id => { const s = all.find(x => x.id === id); if (s && !SECTIONS.includes(s)) SECTIONS.push(s); });
  all.forEach(s => { if (!SECTIONS.includes(s)) SECTIONS.push(s); });
}
let pickDrag = null, pickSuppress = false;
$("pickGrid").addEventListener("pointerdown", e => {
  const card = e.target.closest(".pick"); if (!card || e.button > 0) return;
  pickDrag = { card, x: e.clientX, y: e.clientY, on: false, t: setTimeout(() => {
    if (!pickDrag) return; pickDrag.on = true; card.classList.add("lifted"); card.parentElement.classList.add("arranging");
    try { card.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    if (navigator.vibrate) try { navigator.vibrate(12); } catch { /* ignore */ }
  }, LONG) };
});
$("pickGrid").addEventListener("pointermove", e => {
  if (!pickDrag) return;
  if (!pickDrag.on) { if (Math.hypot(e.clientX - pickDrag.x, e.clientY - pickDrag.y) > 10) { clearTimeout(pickDrag.t); pickDrag = null; } return; }
  e.preventDefault();
  const { card } = pickDrag, grid = card.parentElement;
  card.style.transform = `translate(${e.clientX - pickDrag.x}px, ${e.clientY - pickDrag.y}px) scale(1.04)`;
  // hit-test on layout boxes (not transformed ones, which are mid-slide)
  const g = grid.getBoundingClientRect(), px = e.clientX - g.left, py = e.clientY - g.top;
  const over = [...grid.children].find(c => c !== card && px >= c.offsetLeft && px <= c.offsetLeft + c.offsetWidth && py >= c.offsetTop && py <= c.offsetTop + c.offsetHeight);
  if (over) {
    const before = { left: card.offsetLeft, top: card.offsetTop };
    const list = [...grid.children]; const after = list.indexOf(over) > list.indexOf(card);
    // FLIP the siblings so they slide into place
    const first = new Map(list.map(c => [c, [c.offsetLeft, c.offsetTop]]));
    grid.insertBefore(card, after ? over.nextSibling : over);
    list.forEach(c => { if (c === card) return; const [l, t] = first.get(c); if (l !== c.offsetLeft || t !== c.offsetTop) c.animate([{ transform: `translate(${l - c.offsetLeft}px, ${t - c.offsetTop}px)` }, { transform: "none" }], { duration: 180, easing: "cubic-bezier(.2,0,0,1)" }); });
    pickDrag.x += card.offsetLeft - before.left; pickDrag.y += card.offsetTop - before.top;
    card.style.transform = `translate(${e.clientX - pickDrag.x}px, ${e.clientY - pickDrag.y}px) scale(1.04)`;
  }
}, { passive: false });
function endPickDrag() {
  if (!pickDrag) return;
  clearTimeout(pickDrag.t);
  if (pickDrag.on) {
    const { card } = pickDrag; card.classList.remove("lifted"); card.parentElement.classList.remove("arranging");
    card.animate([{ transform: card.style.transform }, { transform: "none" }], { duration: 160, easing: "cubic-bezier(.2,0,0,1)" }); card.style.transform = "";
    customOrder = [...$("pickGrid").querySelectorAll(".pick")].map(c => c.dataset.sec);
    if (JSON.stringify(customOrder) === JSON.stringify(morpheOrder.filter(id => customOrder.includes(id)))) customOrder = null;
    applyOrder(); store.save(); pickSuppress = true; setTimeout(() => { pickSuppress = false; }, 50);
    const rb = document.querySelector("[data-order-reset]"); if (rb) rb.disabled = !customOrder;
  }
  pickDrag = null;
}
$("pickGrid").addEventListener("pointerup", endPickDrag);
$("pickGrid").addEventListener("pointercancel", endPickDrag);
$("pickGrid").addEventListener("contextmenu", e => { if (e.target.closest(".pick")) e.preventDefault(); });
function setPicker(open) {
  pickerOpen = open;
  $("picker").classList.toggle("open", open); $("pickScrim").classList.toggle("open", open);
  if (open) { placeSeg3(); glassSample(); } // drawn while hidden: its thumb is placed once it can be measured
  $("secPill").setAttribute("aria-expanded", String(open));
}

let stageHold = 0;
let renderCount = 0;
function renderStage() {
  if (stageHold) return;
  const st = $("stage");
  const scene = SCENES[section];
  $("stick").hidden = !scene && !grouped;
  $("stick").classList.toggle("noscene", !scene);
  if (!scene) { st.innerHTML = ""; return; }
  const same = st.dataset.sec === section; st.dataset.sec = section; renderCount++;
  if (!same) { ghosts.clear(); fading.clear(); }
  const scrollers = same ? [...st.querySelectorAll(".inner-scroll")].map(e => e.scrollTop) : [];
  const hscroll = same ? [...st.querySelectorAll("[data-hs]")].map(e => e.scrollLeft) : [];
  st.className = "stage" + (mode === "orig" ? " original" : "");
  // a custom seekbar colour shows on every seekbar, not only on its own screen
  st.style.setProperty("--seek-1", V("morphe_seekbar_custom_color") ? String(V("morphe_seekbar_custom_color_primary") || "") : "");
  // the Player menu: switching between the menu and one of its sheets plays like a user opening it
  const flyFrom = same && section === "flyout" ? { sub: st.dataset.flysub || "", html: st.querySelector(".inner-scroll")?.outerHTML, top: st.querySelector(".inner-scroll")?.scrollTop || 0 } : null;
  st.innerHTML = scene().replace(/background:#0f0f0f/g, "background:var(--app-bg,#0f0f0f)");
  if (section === "flyout") { st.dataset.flysub = flySub || ""; if (flyFrom && flyFrom.html && flyFrom.sub !== (flySub || "")) flyTransition(st, flyFrom, flySub || ""); }
  st.querySelectorAll(".finger").forEach(f => { if (!f.firstChild) f.innerHTML = I("gesture"); });
  st.querySelectorAll(".inner-scroll").forEach((e, i) => { if (scrollers[i]) e.scrollTop = scrollers[i]; });
  st.querySelectorAll('[style*="overflow-x:auto"]').forEach((e, i) => { e.dataset.hs = ""; if (hscroll[i]) e.scrollLeft = hscroll[i]; });
  hugComponents(st);
  markFixed(st);
  st.querySelectorAll(".c").forEach(fitRing);
  const sel = st.querySelector(".c.sel"); if (sel) watchRing(sel); wakeRings();
}
// Opening a sheet: the menu row is tapped, the menu slides down and the sheet slides up, as in the
// app. Going back to the menu plays it the other way. The old sheet is a copy without settings on it.
const FLY_ROW = { quality: "morphe_hide_player_flyout_quality", captions: "morphe_hide_player_flyout_captions", audio: "morphe_hide_player_flyout_audio_track" };
// the menu row lighting up, the old sheet sliding down, the pause before the new one, its slide up (ms)
const FLY_MS = { tap: 182, out: 168, gap: 140, in: 224 };
function flyTransition(st, from, to) {
  const sheet = st.querySelector(".inner-scroll"); if (!sheet) return;
  const t = document.createElement("div"); t.innerHTML = from.html; const old = t.firstElementChild; if (!old) return;
  old.classList.remove("inner-scroll"); old.style.pointerEvents = "none"; old.style.zIndex = "6";
  const tapRow = to && old.querySelector(`[data-k="${FLY_ROW[to]}"]`);
  old.querySelectorAll("[data-k], [data-also]").forEach(e => { e.removeAttribute("data-k"); e.removeAttribute("data-also"); e.classList.remove("sel", "flash", "selx"); });
  sheet.after(old); old.scrollTop = from.top;
  const T = FLY_MS, ease = "cubic-bezier(.2,0,0,1)", wait = tapRow ? T.tap : 0;
  if (tapRow) { tapRow.style.transition = `background ${T.tap * .7}ms`; requestAnimationFrame(() => { tapRow.style.background = "rgba(255,255,255,.14)"; }); }
  sheet.style.transform = "translateY(100%)";
  old.animate([{ transform: "none" }, { transform: "translateY(100%)" }], { duration: T.out, delay: wait, easing: "cubic-bezier(.3,0,1,1)", fill: "forwards" }).onfinish = () => old.remove();
  const a = sheet.animate([{ transform: "translateY(100%)" }, { transform: "none" }], { duration: T.in, delay: wait + T.gap, easing: ease, fill: "backwards" });
  sheet.style.transform = "";
  const ring = () => { try { wakeRings(); } catch { /* not loaded */ } };
  [0, wait + T.gap, wait + T.gap + T.in].forEach(ms => setTimeout(ring, ms)); a.onfinish = ring;
}
// Parts of the preview that no setting on this screen changes are greyed out: plain controls (the
// play button, the time, a seekbar that belongs to another tab) and components of other screens.
const FIXED_SEL = ".pbtn, .bigbtn, .time, .seek, .chip, svg.ico, .tb, .badge-txt";
function markFixed(st) {
  const mine = new Set(sectionKeys()), ours = e => mine.has(e.dataset.k) || (e.dataset.also || "").split(" ").some(x => mine.has(x));
  const cs = [...st.querySelectorAll(".c[data-k]")];
  cs.forEach(c => { if (!ours(c) && !c.classList.contains("ghost") && !c.querySelector("[data-k], [data-also]") && !c.closest(".finger")) c.classList.add("fixed7"); });
  st.querySelectorAll(FIXED_SEL).forEach(e => {
    const host = e.closest(".c[data-k]");
    if (host) return; // inside a component: it follows that component (greyed above if it isn't ours)
    if ([...e.querySelectorAll("[data-k], [data-also]")].some(ours)) return;
    if (e.parentElement.closest(".fixed7")) return;
    e.classList.add("fixed7");
  });
}
// Many components are drawn as a wrapper around one card that carries its own margins. The outline,
// flash and ghost dashes belong to the card, not to the full-width wrapper, so move the card's margins
// (and its corner radius) onto the wrapper. Layout stays the same.
const MARGINS = ["marginTop", "marginRight", "marginBottom", "marginLeft"];
// Performance (Max, Nov 22): every card is read first and changed after, so the preview is laid out once
// instead of once per card (a read after a change makes the browser redo the layout).
function hugComponents(root) {
  const moves = [];
  root.querySelectorAll(".c").forEach(c => {
    if (c.children.length !== 1 || c.childNodes.length > 1 && [...c.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return;
    const ch = c.firstElementChild, cs = ch.style;
    if (!MARGINS.some(m => cs[m]) || c.style.padding || c.style.background) return;
    const own = getComputedStyle(ch);
    moves.push([c, ch, MARGINS.map(m => own[m]), own.borderTopLeftRadius]);
  });
  moves.forEach(([c, ch, ms, rad]) => {
    MARGINS.forEach((m, i) => { if (ms[i] && ms[i] !== "0px" && ms[i] !== "auto") { c.style[m] = ms[i]; ch.style[m] = "0px"; } });
    if (rad !== "0px") c.style.borderRadius = rad;
  });
  // a left-aligned card narrower than its block wrapper: shrink the wrapper to the card
  [...root.querySelectorAll(".c.blk, div.c")].filter(hugsNarrow).forEach(c => { c.style.width = "fit-content"; });
}
function hugsNarrow(c) {
  if (c.children.length !== 1 || c.style.width) return false;
  const r = c.getBoundingClientRect(), q = c.firstElementChild.getBoundingClientRect();
  if (!r.width || q.width > r.width - 6 || Math.abs(q.left - r.left) > 1) return false;
  const cs = getComputedStyle(c); return cs.display === "block" && !getComputedStyle(c.parentElement).display.includes("flex");
}
function hugWidth(c) { if (hugsNarrow(c)) c.style.width = "fit-content"; }

function stateChip(k) {
  const a = A[k], p = PREF[k], v = V(k);
  if (p.type === "boolean") {
    if (a && (a.kind === "vis" || a.kind === "overlay")) return shown(k) ? `<span class="state on">Shown</span>` : `<span class="state off">Hidden</span>`;
    return v ? `<span class="state on">On</span>` : `<span class="state">Off</span>`;
  }
  return "";
}
function summaryFor(k) { const p = PREF[k]; const v = V(k); if (p.type === "boolean") return fmtSum(k, (v ? p.summaryOn : p.summaryOff) || p.summary || ""); return fmtSum(k, p.summary || ""); }
// Morphe fills some descriptions at run time (String.format: "Saved videos: %s"). The preview fills the
// same slots, in every place a description shows, so a raw %s never reaches the screen: the setting's own
// value when it has one, else a stand-in from FMT_FILL (slot 1, 2, ...), else an ellipsis.
const FMT_FILL = { morphe_loop_count_clear: ["0"], morphe_series_tracker_completion: ["90", "30"], morphe_export_download_folder: ["Download"] };
function fmtSum(k, t) {
  if (!/%(\d+\$)?[sd]/.test(t)) return t;
  const v = V(k), own = v !== undefined && v !== null && v !== "" && typeof v !== "boolean" ? String(v) : null, fill = FMT_FILL[k] || [];
  let n = 0;
  return t.replace(/%%|%(\d+\$)?[sd]/g, (m, pos) => m === "%%" ? "%" : (i => own ?? fill[i] ?? "…")(pos ? parseInt(pos, 10) - 1 : n++));
}
const RANGES = { font_size: [8, 48], travel_duration: [2, 15], width_dip: [100, 400], caption_scale: [50, 300], corner_radius: [0, 24], blur: [0, 100], smoothing: [0, 100], dim_duration: [0, 10] };
const sameVal = (a, b) => String(a) === String(b) || (a !== "" && b !== "" && a != null && b != null && !isNaN(a) && !isNaN(b) && Number(a) === Number(b));
function controlFor(k) {
  const p = PREF[k]; const v = V(k); const dis = !parentsOk(k) ? "disabled" : "";
  const ents = entriesFor(k).filter(e => !(OFF_LIST.has(k) && e.value === "off"));
  if (OFF_LIST.has(k) && String(v) === "off") return "";
  // up to 8 choices: a row of pills; 9 to 16 (icon styles, theme colours, qualities): a 3-column grid
  // of pills built from the same entries, so it follows whatever list Morphe ships; more: a dropdown
  if (ents.length && ents.length <= 16) return `<div class="ctl optgrid">${ents.map(e => `<button class="opt${NEG_WORD.has(String(e.label)) ? " neg" : ""}${sameVal(e.value, defaults[k]) ? " def" : ""}" data-set="${k}" data-val="${esc(e.value)}" aria-pressed="${sameVal(e.value, v)}" ${dis}><span class="ol">${esc(e.label)}</span></button>`).join("")}</div>`; // .ol: the label sits over the gliding colour, the colour over the pill borders
  if (ents.length) return `<div class="ctl"><select data-set="${k}" ${dis} aria-label="${esc(shownTitle(k))}">${ents.map(e => `<option value="${esc(e.value)}" ${sameVal(e.value, v) ? "selected" : ""}>${esc(e.label)}</option>`).join("")}</select></div>`;
  if (p.type === "integer" || p.type === "float" || p.type === "long") {
    const r = Object.entries(RANGES).find(([n]) => k.includes(n));
    // a range Morphe states in the description ("0-5000 ms", "(5-75)") makes a slider too, so a new
    // setting with one needs no entry here
    const sr = /\(?(\d+)\s*[-–]\s*(\d+)\s*(ms|dp|sp|%)?\)/.exec(String(p.summary || ""));
    if (r || sr || /opacity|scale|strength|display_area/.test(k)) {
      const [min, max] = r ? r[1] : sr ? [Number(sr[1]), Number(sr[2])] : [0, 100];
      return `<div class="ctl"><input type="range" min="${min}" max="${max}" step="1" value="${v}" data-set="${k}" style="--pct:${max > min ? Math.round((v - min) / (max - min) * 1000) / 10 : 0}%" ${dis} aria-label="${esc(shownTitle(k))}"><span class="val" data-val-of="${k}">${v}</span></div>`;
    }
    return `<div class="ctl side"><input type="number" value="${v}" data-set="${k}" ${dis} aria-label="${esc(shownTitle(k))}" step="${p.type === "float" ? "0.05" : "1"}"></div>`;
  }
  if (p.type === "string") {
    // Morphe opens the system file picker for these; the preview does the same and draws the image
    if (p.widget === "NonInteractivePreference" && /_file$/.test(k)) return `<div class="ctl"><label class="opt filepick" ${dis ? 'aria-disabled="true"' : ""}>${I("image")}${v ? "Change image" : "Choose image"}<input type="file" accept="image/*" data-file="${k}" ${dis} hidden></label>${v ? `<span class="val">${esc(v)}</span>` : ""}</div>`;
    if (/color/.test(k) && /^#/.test(String(v))) return `<div class="ctl side"><input type="color" value="#${String(v).slice(-6)}" data-set="${k}" ${dis} aria-label="${esc(shownTitle(k))}"><span class="val">${esc(v)}</span></div>`;
    if (isListBox(k)) return listBox(k, dis);
    return `<div class="ctl"><input type="text" value="${esc(v)}" data-set="${k}" ${dis} aria-label="${esc(shownTitle(k))}"></div>`;
  }
  return "";
}
// Settings that hold a list as text, one entry per line (speeds, filter words, channel whitelists):
// one shared editor for all of them. Each entry is a chip with a remove button, and a field at the end
// adds one (Enter or +). It reads and writes exactly Morphe's format, the entries joined by new lines,
// so Morphe parses what it always did.
const isListBox = k => PREF[k].type === "string" && (String(PREF[k].default ?? "").includes("\n") || /strings|phrases|speeds|whitelist|filter/.test(k));
const listNumeric = k => /speeds/.test(k);
// Channel whitelists are stored by Morphe as JSON ([{"id":"UC…","name":"Fjord & Timber"}]), not one per line.
// Their chips show the names and can be removed; channels are added from a video's ⋮ menu (Morphe needs the
// channel id), so they have no add field. Their format is kept exactly, so Morphe still parses it.
const listJSON = k => /_channel_whitelist$/.test(k) || /^\s*\[/.test(String(V(k) ?? ""));
function jsonEntries(v) { try { const a = JSON.parse(String(v || "[]")); return Array.isArray(a) ? a.filter(e => e && typeof e === "object") : []; } catch (e) { return []; } }
function listItems(k, from = V(k)) {
  if (listJSON(k)) return jsonEntries(from).map(e => String(e.name || e.id || "")).filter(Boolean);
  const v = String(from ?? "");
  // older or hand-typed values may use spaces or commas; Morphe's own default is one per line
  const parts = v.includes("\n") || !listNumeric(k) ? v.split("\n") : v.split(/[\s,]+/);
  return parts.map(x => x.trim()).filter(Boolean);
}
function listBox(k, dis) {
  const items = listItems(k), num = listNumeric(k);
  const chips = items.map((t, i) => `<span class="lchip">${esc(t)}${num ? "×" : ""}<button class="lx" data-lx="${i}" ${dis} aria-label="Remove ${esc(t)}">${I("close")}</button></span>`).join("");
  if (listJSON(k)) return `<div class="ctl lst" data-lst="${k}">${chips}<span class="lhint">${items.length ? "Add more" : "No channels yet. Add one"} from a video's ⋮ menu: Whitelist channel</span></div>`;
  return `<div class="ctl lst" data-lst="${k}">${chips}
    <span class="ladd"><input class="lin" data-lin="${k}" ${dis} placeholder="${num ? "Add speed" : "Add entry"}" ${num ? 'inputmode="decimal"' : ""} aria-label="Add to ${esc(shownTitle(k))}"><button class="lplus" data-ladd="${k}" ${dis} aria-label="Add">${I("plus")}</button></span></div>`;
}
// returns an error to show, or null once the entry is added
function listAdd(k, raw) {
  const t = String(raw).trim(); if (!t) return null;
  const items = listItems(k);
  if (listNumeric(k)) { const n = Number(t.replace(",", ".")); if (!(n > 0 && n <= 8)) return "Enter a speed between 0.05 and 8"; if (items.some(x => Number(x) === n)) return "Already in the list"; items.push(String(n).includes(".") ? String(n) : n.toFixed(1)); if (!/cycle/.test(k)) items.sort((a, b) => a - b); } // a cycle keeps its order: it is the order taps go through
  else { if (items.includes(t)) return "Already in the list"; items.push(t); }
  listSet(k, items); return null;
}
function listRemove(k, i) {
  if (!listJSON(k)) { const items = listItems(k); items.splice(i, 1); return listSet(k, items); }
  const es = jsonEntries(V(k)).filter(e => e.name || e.id); es.splice(i, 1);
  ensureMod(); touchSel(k); const before = state[k]; state[k] = es.length ? JSON.stringify(es) : ""; afterChange(k, before);
}
function listSet(k, items) { if (listJSON(k)) { ensureMod(); touchSel(k); const before = state[k]; state[k] = items.length ? JSON.stringify(items.map(n => ({ id: n, name: n }))) : ""; afterChange(k, before); return; }
  ensureMod(); touchSel(k); const before = state[k]; state[k] = items.join("\n"); afterChange(k, before); requestAnimationFrame(() => document.querySelector(`[data-lin="${k}"]`)?.focus({ preventScroll: true })); }
const whereOf = x => { const s = sectionOf(x); return s !== section ? ` (${esc(SECTIONS.find(z => z.id === s)?.title || "Miscellaneous")})` : ""; };
function shortNeed(k) {
  if (!classicParentsOk(k)) { const b = PREF[k].parents.find(x => x.mode === "not" ? !!state[x.key] : !state[x.key]) || PREF[k].parents[0]; return `Parent setting must be ${stateWord(b.key, b.mode !== "not")}`; }
  if (needsTablet(k)) return "Only on tablets and large screens";
  return /S\("/.test(String(PREF[k].availability || "")) ? "Parent setting must be enabled" : "Not available with the current settings";
}
function needText(k) {
  if (!classicParentsOk(k)) return "Needs " + PREF[k].parents.map(x => `“${esc(shownTitle(x.key))}” set to ${stateWord(x.key, x.mode !== "not")}${whereOf(x.key)}`).join(", ");
  const av = String(PREF[k].availability || ""), sk = [...new Set([...av.matchAll(/S\("([^"]+)"\)/g)].map(m => m[1]))].filter(x => PREF[x] && inVersion(x));
  if (sk.length > 1 && av.includes("||")) return `Available once one of these is set: ${sk.map(x => `“${esc(shownTitle(x))}”${PREF[x].type === "boolean" ? " " + stateWord(x, true) : ""}${whereOf(x)}`).join(", ")}`;
  if (needsTablet(k)) return deviceWhy(k); // one wording for every device lock
  const ap = (PREF[k].availabilityParents || []).filter(x => PREF[x]);
  return ap.length ? `Not available with the current ${ap.map(x => `“${esc(shownTitle(x))}”`).join(", ")}` : "Not available here";
}
// The setting to visit so that k becomes available.
function blockerOf(k) {
  const p = PREF[k];
  if (!classicParentsOk(k)) return (p.parents.find(x => x.mode === "not" ? !!state[x.key] : !state[x.key]) || p.parents[0]).key;
  const cands = availKeys(k).filter(x => PREF[x] && inVersion(x));
  // prefer a setting on this screen (e.g. a DeArrow title place) over one on another screen
  return cands.find(x => sectionOf(x) === section) || cands[0] || null;
}
const availKeys = k => [...new Set([...(PREF[k].availabilityParents || []), ...[...String(PREF[k].availability || "").matchAll(/[SD]\("([^"]+)"\)/g)].map(m => m[1])])].filter(x => x !== k);
const dependsOn = (k, parent) => PREF[k].parents.some(x => x.key === parent) || availKeys(k).includes(parent);
// The setting on another screen that k was unlocked through (via the popup): k then offers "More" to reach it again.
const borrowedParent = k => [...PREF[k].parents.map(x => x.key), ...availKeys(k)].find(x => borrowed[section] && borrowed[section].has(x) && sectionOf(x) !== section);

// An info row Morphe opens a website from ("Tap here to open OpenRouter.ai"): the same link as a button
function linkFor(k) {
  const m = /Tap here to open ([A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+)/.exec(String(PREF[k].summary || "")); if (!m) return "";
  return `<div class="ctl"><a class="opt linkbtn" href="https://${esc(m[1])}" target="_blank" rel="noopener noreferrer">${I("link")}Open ${esc(m[1])}</a></div>`;
}
// A sub-option that has sub-options of its own (Audio pitch controls > Audio time stretching): its own
// dependents sit right under it inside the parent's group, so it gets the same pill as a top-level parent,
// a lock with the count while they are hidden and the count while they show (no folding of its own).
function deepKidPill(k) {
  if (!PARENT_OF[k]) return "";
  const dk = sectionKeys().filter(x => DIRECT_PARENT[x] === k); if (!dk.length) return "";
  const shown = dk.filter(x => kidVisible(x) || peeking(x)).length;
  return shown ? `<span class="kidbtn kidin" aria-expanded="true" aria-label="${shown} sub-settings, shown below">${shown}${I("expand")}</span>`
    : kidLock(k, dk.length);
}
// the lock pill of a parent whose sub-settings are hidden: a button that shows them, locked
const peeking = x => x === peekKid || (!!peekPar && (PARENT_OF[x] === peekPar || DIRECT_PARENT[x] === peekPar));
const kidLock = (k, n) => `<button class="kidbtn kidoff" data-kidpeek="${k}" aria-expanded="${peekPar === k}" title="Show the ${n} locked sub-settings" aria-label="${n} sub-settings, locked: show them">${n}${I("lock")}</button>`;
function rowHTML(k, live) {
  const p = PREF[k]; const a = A[k];
  const dis = !parentsOk(k);
  const isBool = p.type === "boolean";
  // an info row Morphe still stores a value for (a picked file, a channel whitelist) keeps its editor
  // (Morphe draws these with its own slider, picker or list dialog; any one with a value type has an editor here)
  const editInfo = p.widget === "NonInteractivePreference" && !!p.type && p.type !== "screen";
  const info = !editInfo && (!p.type || p.type === "screen" || p.widget === "NonInteractivePreference" || p.widget === "IntentPreference");
  let right = "", ctl = "";
  const swHTML = () => `<button class="sw" role="switch" data-sw="${k}" aria-checked="${!!V(k)}" aria-label="${esc(shownTitle(k))}"></button>`;
  if (OFF_LIST.has(k)) { right = `<button class="sw" role="switch" data-sw="${k}" aria-checked="${String(V(k)) !== "off"}" aria-label="${esc(shownTitle(k))}"></button>`; ctl = controlFor(k); }
  else if (isBool && design === "clean" && cleanOf(k)) right = toggleHTML(k);
  else if (isBool && design === "toggles") right = swHTML();
  else if (live && a.kind !== "scenario") { right = stateChip(k); if (!isBool) ctl = controlFor(k); }
  else if (isBool) right = swHTML();
  else if (!info) ctl = controlFor(k);
  else ctl = linkFor(k);
  // A list setting (speeds, filter words): the chips are the control, so nothing sits on the right and
  // they get the card's full width. Its Reset is a small pill beside the title, greyed out like the
  // screen's Reset until the list differs from Morphe's own (it asks before restoring).
  // locked (Max, Nov 23): the control is greyed out under a cover that shows only the gold lock; when the
  // setting unlocks, the lock breaks and the cover opens from the middle to both ends (unlockFx)
  if (dis) { if (right) right = withLock(right); else if (ctl) ctl = withLock(ctl); }
  let lreset = "";
  if (!info && isListBox(k)) { const same = String(V(k) ?? "") === String(defaults[k] ?? ""); right = ""; lreset = `<button class="resetbtn lreset" data-lreset="${k}" ${same || dis ? "disabled" : ""} title="Restore the default list" aria-label="Restore the default list">${I("reset")}Reset</button>`; }
  const cls = ["row", live ? "live" : "fallback"];
  if (selected === k) cls.push("sel");
  if (dis) cls.push("dis");
  if (PARENT_OF[k]) { if (peeking(k)) cls.push("peek"); else if (!kidVisible(k)) cls.push("hide"); }
  if (live && (a.kind === "vis" || a.kind === "overlay") && !shown(k)) cls.push("offstate");
  const sum = info ? (fmtSum(k, String(p.summary || "")).replace(/\s*Tap here to open \S+\s*$/, "") || (p.type === "screen" ? "Opens a sub-screen in Morphe settings" : "Information")) : summaryFor(k); // the link has its own button (linkFor)
  const blk = dis ? blockerOf(k) : null;
  const bp = dis ? null : borrowedParent(k);
  const goto = blk ? `<button class="goto" data-goto="${k}">${sectionOf(blk) !== section ? "Change it here" : "Take me there"} ${I("arrow")}</button>`
    : bp ? `<button class="goto more" data-more="${k}" data-target="${bp}" title="${esc(shownTitle(bp))}">More ${I("arrow")}</button>` : "";
  // locked: a short line beside "Take me there" (the full reason is its tooltip), so the card keeps
  // the height of an unlocked one
  const need = dis ? `<div class="need3" title="${esc(needText(k).replace(/<[^>]*>/g, ""))}">${shortNeed(k)}</div>` : "";
  const tags = "";
  const kids = KIDS[k] ? KIDS[k].filter(x => kidVisible(x) || (x === peekKid && peekPar !== k)).length : 0;
  const kidbtn = kids ? `<button class="kidbtn" data-kidtoggle="${k}" aria-expanded="${!collapsed.has(k)}" aria-label="${kids} sub-options">${kids}${I("expand")}</button>`
    : KIDS[k] ? kidLock(k, KIDS[k].length)
    : deepKidPill(k); // same footprint as the open/close button, so the card never changes width
  const over = /^(hide|show) in /i.test(title(k)) && p.subScreenTitle ? `<div class="over">${esc(p.subScreenTitle)}</div>` : "";
  return `<div class="${cls.join(" ")}" data-row="${k}" data-k="${k}" tabindex="0">
    <div class="txt">${over}${lreset ? '<div class="ttlrow">' : ""}<div class="ttl">${ttlHTML(shownTitle(k), (dis ? I("lock", "lk") : "") + tags + kidbtn)}</div>${lreset ? lreset + "</div>" : ""}
      ${sum ? `<div class="sum">${esc(sum)}</div>` : ""}${ctl}</div>${right || goto || need ? `<div class="side">${right}${need}${goto}</div>` : ""}</div>`;
}
// A "Disable X" card shown as "X" with Off | On keeps Morphe's description as written, with no
// "When Off:" lead-in (Max, Nov 23: dropped on every such card).
// The last word of a title and the badges after it never wrap apart, so a sub-options pill can't end up alone on a line.
function ttlHTML(t, after) { if (!after) return esc(t); const i = t.lastIndexOf(" "); return `${esc(t.slice(0, i + 1))}<span class="nw">${esc(t.slice(i + 1))}${after}</span>`; }
const groupHTML = (name, icon, keys, live) => keys.length ? `<div class="gtitle">${I(icon)}${name} · ${keys.length}</div><div class="group">${keys.map(k => rowHTML(k, live)).join("")}</div>` : "";

// Rows follow the order their components appear in the preview, top to bottom, left to right
// (doodle and top bar first). Settings without a component (scenarios) keep their order after them.
// Measured once per screen with every hidden component drawn, so toggling never reshuffles the list.
let posCache = { sec: null, pos: {} };
const LAYOUT = {
  fullscreen: [
    ["On the player", ["hide_video_title", "hide_live_chat_replay_button", "hide_player_related_videos_overlay", "hide_quick_actions", "fullscreen_video_scale", "fullscreen_playlist_panel"]],
    ["Swipe zones", ["swipe_left_zone", "swipe_right_zone", "swipe_top_zone", "swipe_zone_preview", "swipe_zone_width"]],
    ["Shared by every swipe zone", ["swipe_overlay_style", "swipe_overlay_background_opacity", "swipe_overlay_progress_brightness_color", "swipe_overlay_progress_volume_color", "swipe_overlay_progress_speed_color", "swipe_text_overlay_size", "swipe_haptic_feedback", "swipe_press_to_engage", "volume_boost", "swipe_ignore_when_locked", "swipe_lowest_value_enable_auto_brightness", "swipe_save_and_restore_brightness", "swipe_threshold", "swipe_brightness_sensitivity", "swipe_volume_distance", "swipe_volume_steps"]],
    ["Swipe to seek", ["swipe_seek"]],
    ["Entering and leaving fullscreen", ["open_videos_fullscreen", "exit_fullscreen", "force_fullscreen_landscape", "disable_fullscreen_dragged_down_gesture", "disable_fullscreen_pulled_up_gesture", "disable_fullscreen_sliding_down_gesture"]],
    ["Pinch to zoom", ["disable_fullscreen_zoom_gesture", "restore_pinch_to_zoom"]],
  ],
};
function stagePositions() {
  const st = $("stage");
  if (posCache.sec === section || st.dataset.sec !== section) return posCache.pos;
  const pos = {}, sr = st.getBoundingClientRect();
  st.classList.add("measure");
  st.querySelectorAll("[data-k], [data-also]").forEach(e => {
    const k = e.dataset.k || (e.dataset.also || "").split(" ")[0], r = e.getBoundingClientRect(); if (!r.width && !r.height) return;
    let y = r.top - sr.top, x = r.left - sr.left;
    for (let q = e.parentElement; q && q !== st; q = q.parentElement) { y += q.scrollTop; x += q.scrollLeft; }
    const v = Math.round(y / 14) * 10000 + Math.max(0, Math.round(x));
    if (pos[k] === undefined || v < pos[k]) pos[k] = v;
    if (e.dataset.also && e.dataset.k && (pos[e.dataset.k] === undefined || v < pos[e.dataset.k])) pos[e.dataset.k] = v;
  });
  st.classList.remove("measure");
  posCache = { sec: section, pos };
  return pos;
}
function byPosition(keys) {
  const pos = stagePositions(), idx = new Map(keys.map((k, i) => [k, i]));
  const at = k => pos[k] !== undefined ? pos[k] : null;
  const placed = keys.filter(k => at(k) !== null).sort((a, b) => at(a) - at(b) || idx.get(a) - idx.get(b));
  const rest = placeDependents([placed], keys.filter(k => at(k) === null));
  return keepTogether([...placed, ...rest]);
}
// Related settings sit together in a tab's list (Max, Nov 20: the three Shorts speed settings were apart),
// whatever their parts' places in the preview and whether they have a preview at all: each group lands,
// in this order, where its first member would be. A member without a preview leaves "More settings" for
// its group; a group with no previewed member stays together under "More settings". Members in another
// tab, or that are sub-options, are left where they are. One table for every tab.
const RELATED = [
  // Shorts
  ["shorts_playback_speed_default", "shorts_remember_playback_speed", "shorts_playback_speed_flyout_button"],
  ["shorts_autoplay", "shorts_autoplay_background", "shorts_disable_background_playback"],
  ["hide_shorts_flyout_audio_track", "hide_shorts_flyout_captions", "shorts_download_flyout_button"],
  // Video & audio
  ["playback_speed_default", "custom_speed_menu", "remember_playback_speed_last_selected", "disable_playback_speed_music", "playback_speed_channel_whitelist"],
  ["video_quality_default_wifi", "video_quality_default_mobile", "remember_video_quality_last_selected", "video_quality_prioritize", "advanced_video_quality_menu", "hide_premium_video_quality"],
  ["shorts_quality_default_wifi", "shorts_quality_default_mobile", "remember_shorts_quality_last_selected"],
  ["video_delay", "video_delay_bluetooth_only"],
  // Behaviour
  ["do_not_remember_loop_video", "loop_count", "loop_count_clear"],
  ["download_force_4k", "download_mode"],
  // Look
  ["theme_color_dark", "theme_color_dark_custom", "theme_color_light", "theme_color_light_custom", "theme_color_change_foreground"],
  ["custom_font_type", "custom_font_file"],
  ["gradient_loading_screen", "splash_screen_style", "splash_screen_duration"],
  ["series_tracker", "series_tracker_completion", "series_tracker_backup"],
  // Feed
  ["hide_view_count", "feed_view_count"],
  ["hide_community_posts", "hide_post_like_dislike_buttons", "hide_post_comment_button", "hide_post_share_button", "hide_post_comments_preview", "post_buttons_layout", "post_image_download", "post_translate"],
  ["hide_filter_bar_in_feed", "hide_filter_bar_in_search", "hide_filter_bar_in_related_videos", "hide_filter_bar_in_history", "hide_filter_bar_in_comments"],
  ["hide_keyword_content_home", "hide_keyword_content_subscriptions", "hide_keyword_content_search", "hide_keyword_content_comments", "hide_keyword_content_about_whole_words", "hide_keyword_content_about"],
  ["hide_aislist_blocklist_home", "hide_aislist_blocklist_search", "hide_aislist_warnlist_home", "hide_aislist_warnlist_search", "aislist_submit_flyout_menu", "hide_aislist_about", "hide_aislist_attribution"],
  ["hide_feed_flyout_menu", "ads_channel_whitelist_flyout_menu", "ask_summarize_flyout_menu", "playback_speed_channel_whitelist_flyout_menu", "feed_download_flyout_button"],
  ["playlist_long_press_drag", "playlist_wide_drag_handles", "playlist_hide_removal_snackbar"],
  // Captions
  ["preferred_caption_language", "secondary_caption_language", "auto_translate_additional_languages"],
];
function relate(list, rest) {
  for (const g of RELATED) {
    const ks = g.map(x => "morphe_" + x).filter(k => !PARENT_OF[k] && (list.includes(k) || rest.includes(k))); if (ks.length < 2) continue;
    const at = Math.min(...ks.map(k => list.indexOf(k)).filter(i => i >= 0)), into = isFinite(at) ? list : rest;
    const where = isFinite(at) ? at : Math.min(...ks.map(k => rest.indexOf(k)));
    ks.forEach(k => [list, rest].forEach(l => { const i = l.indexOf(k); if (i >= 0) l.splice(i, 1); }));
    into.splice(where, 0, ...ks);
  }
}
// settings that belong right after another one wherever their own parts sit
const NEXT_TO = { morphe_custom_speed_menu: "morphe_playback_speed_default" };
function keepTogether(list) {
  for (const [k, after] of Object.entries(NEXT_TO)) {
    const i = list.indexOf(k); if (i < 0 || !list.includes(after)) continue;
    list.splice(i, 1); list.splice(list.indexOf(after) + 1, 0, k);
  }
  return list;
}
// A setting that only matters once another one is set up (Speed step needs a Speed swipe zone) and has
// nothing of its own in the preview goes right after the related settings: after the one that unlocks
// under the same condition and is most alike by name (Overlay timeout after the overlay settings), else
// after the setting it depends on. Not at the top or the bottom of the screen. One rule for every tab,
// the captioned ones and sub-options included.
// lists: the arrays the rows are placed into (changed in place); returns the rows with nothing related.
const condOf = k => String(PREF[k].availability || "") + "|" + (PREF[k].parents || []).map(x => x.key + x.mode).join(",");
const alike = (a, b) => { let n = 0; while (n < a.length && a[n] === b[n]) n++; return n; };
function placeDependents(lists, movable) {
  const rest = [];
  for (const k of movable) {
    const c = condOf(k); let at = null, best = -1;
    if (c !== "|") lists.forEach(l => l.forEach((x, i) => { if (x !== k && condOf(x) === c && alike(x, k) >= best) { best = alike(x, k); at = [l, i]; } }));
    if (!at) { const deps = new Set([...(PREF[k].parents || []).map(x => x.key), ...availKeys(k)]); lists.forEach(l => l.forEach((x, i) => { if (deps.has(x)) at = [l, i]; })); }
    if (at) at[0].splice(at[1] + 1, 0, k); else rest.push(k);
  }
  return rest;
}
let lastVis = { sec: null, keys: new Set() };
const pickedFiles = {}; // images chosen with a file picker, kept for this visit only
const foldingKids = new Map(); // sub-option groups still folding away: their old rows, and until when
// peekPar: a parent whose locked sub-settings are shown, locked, after a tap on its lock pill (Max, Nov 20:
// the pill looked like a button and did nothing). Each one says what unlocks it.
let peekKid = null, peekPar = null, lastOpen = new Set(), lastDis = { sec: null, keys: new Set() };
const collapsed = new Set();
function renderList() {
  if (searching) return renderSearch();
  const m = MEMBERS[section];
  let html = "";
  const isLive = k => m.live.includes(k);
  const wantOpen = new Set();
  const withKids = k => {
    let out = rowHTML(k, isLive(k));
    const ks = KIDS[k];
    if (ks) {
      const any = ks.some(x => kidVisible(x) || peeking(x));
      if (any && (!collapsed.has(k) || ks.some(peeking))) wantOpen.add(k);
      // parent and its sub-options travel as one unit, so in two columns they stay in the same column
      // a sub-option of a sub-option (Audio time stretching needs Audio pitch controls) sits right under
      // the one it depends on, one step further in
      const deep = x => DIRECT_PARENT[x] && DIRECT_PARENT[x] !== k && ks.includes(DIRECT_PARENT[x]);
      const flat = byPosition(ks).filter(x => !deep(x)), order = [];
      const put = x => { order.push(x); byPosition(ks.filter(y => deep(y) && DIRECT_PARENT[y] === x)).forEach(put); };
      flat.forEach(put); ks.forEach(x => { if (!order.includes(x)) order.push(x); });
      out = `<div class="unit">${out}<div class="kids ${lastOpen.has(k) ? "open" : ""}" data-kids-of="${k}"><div class="kin">${order.map(x => { const h = rowHTML(x, isLive(x)); return deep(x) ? h.replace('class="row ', 'class="row deep ') : h; }).join("")}</div></div></div>`;
    }
    return out;
  };
  if (section !== "misc") {
    const top = m.live.filter(k => !PARENT_OF[k]);
    // in the clean design a setting whose title can't be converted keeps Morphe's look, at the end
    const ordered0 = byPosition(top), ordered = [...ordered0.filter(k => !cleanBroken(k)), ...ordered0.filter(cleanBroken)];
    const rest = m.misc.filter(k => !PARENT_OF[k]);
    relate(ordered, rest);
    let live = "";
    const lay = LAYOUT[section];
    if (lay) {
      // screens with a lot of related settings get small captions so it is clear what belongs together
      // a caption can take settings without a preview too: they leave "More settings" for it
      const used = new Set(), caps = lay.map(([cap, ks]) => [cap, ks.map(x => "morphe_" + x).filter(x => ordered.includes(x) || rest.includes(x))]);
      caps.forEach(([, inSec]) => inSec.forEach(x => { const i = rest.indexOf(x); if (i >= 0) rest.splice(i, 1); }));
      caps.forEach(([, inSec]) => inSec.forEach(x => used.add(x)));
      // settings not in a caption join the related ones (see placeDependents); only the rest go first
      const left = placeDependents(caps.map(c => c[1]), ordered.filter(x => !used.has(x))).map(withKids).join("");
      for (const [cap, inSec] of caps) {
        const body = inSec.map(withKids).join("");
        if (body) live += `<div class="subhead" data-h="${esc(cap)}">${esc(cap)}</div>${body}`;
      }
      if (left) live = left + live;
    } else live = ordered.map(withKids).join("");
    if (live) html += `<div class="group">${live}</div>`;
    if (rest.length) html += `${ordered.length ? `<div class="sechead" data-h="more">More settings<span class="nolive">No live preview or animation</span></div>` : ""}<div class="group">${rest.map(withKids).join("")}</div>`;
  } else {
    const groups = {};
    for (const k of m.misc) {
      if (PARENT_OF[k]) continue;
      const p = PREF[k];
      const g = (p.screenTitle || "Unplaced") + (p.subScreenTitle ? " › " + p.subScreenTitle : "");
      (groups[g] = groups[g] || []).push(k);
    }
    for (const g of Object.keys(groups).sort()) html += `<div class="gtitle" data-h="${esc(g)}">${esc(g)} · <span class="gn">${groups[g].length}</span></div><div class="group">${groups[g].map(withKids).join("")}</div>`;
  }
  const list = $("list");
  // sub-options that are about to fold away keep their old look (no locks popping in) while they
  // close; the new state is swapped in once they are out of sight
  // (a second render during the fold, e.g. from the selection that follows the toggle, keeps them too)
  const closingOld = new Map(), now0 = performance.now();
  if (lastVis.sec !== section) foldingKids.clear();
  foldingKids.forEach((v, grp) => { if (v.until > now0 && !wantOpen.has(grp)) closingOld.set(grp, v.old); else foldingKids.delete(grp); });
  if (lastVis.sec === section) list.querySelectorAll(".kids.open").forEach(b => { if (!wantOpen.has(b.dataset.kidsOf)) { const old = b.querySelector(".kin").innerHTML, btn = list.querySelector(`[data-row="${b.dataset.kidsOf}"] .kidbtn`)?.outerHTML; closingOld.set(b.dataset.kidsOf, old); foldingKids.set(b.dataset.kidsOf, { old, btn, until: now0 + 320 }); } });
  // switches keep their old position for a frame so the change slides instead of snapping
  const swWas = new Map(); list.querySelectorAll("[data-sw]").forEach(x => swWas.set(x.dataset.sw, [x.getAttribute("aria-checked"), x.dataset.at, x.dataset.tone]));
  // groups caught mid-fold by this render: their new box carries on from the height it had
  const midFold = new Map(); list.querySelectorAll(".kids:not(.open)").forEach(b => { const h = b.getBoundingClientRect().height; if (h > .5 && foldingKids.has(b.dataset.kidsOf)) midFold.set(b.dataset.kidsOf, h); });
  // descriptions that were unfolded stay unfolded through the redraw, without playing the unfold again
  // (one caught mid-unfold, e.g. by the switch tap that selected its card, carries on from its height)
  // a sub-option that folds away inside a group that stays open keeps its old look while it folds:
  // drawn in its new state it showed a lock and its "Needs ..." line, grew, then shrank
  const oldKidRows = new Map(); list.querySelectorAll(".kids .row:not(.hide)").forEach(r => oldKidRows.set(r.dataset.row, r.outerHTML));
  const wasOpen = new Map([...list.querySelectorAll(".row > .txt > .sum.open")].map(e => [e.closest(".row").dataset.row, e.getBoundingClientRect().height]));
  const headsWere = list.dataset.view === section ? shownHeads(list) : null;
  // a locked card that unlocks loses its "Take me there" and its "needs ..." line: the card eases to its new
  // height and the two fade where they were, instead of the card snapping shorter (Max, Nov 23)
  const lockedWas = new Map(); if (list.dataset.view === section) list.querySelectorAll(".row.dis[data-row]").forEach(r => { const sd = r.querySelector(":scope > .side"); if (!sd || !r.offsetHeight || sd.offsetParent !== r) return; lockedWas.set(r.dataset.row, { h: r.offsetHeight, side: sd.cloneNode(true), x: sd.offsetLeft, y: sd.offsetTop, w: sd.offsetWidth }); });
  list.innerHTML = html; list.dataset.view = section;
  mergeZonePreview(list);
  fitOpts(list);
  const goneNow = hideLocked(list);
  midFold.forEach((h, grp) => {
    const box = list.querySelector(`[data-kids-of="${grp}"]`), left = (foldingKids.get(grp)?.until ?? 0) - performance.now(); if (!box || left < 30) return;
    box.classList.remove("open");
    box.animate([{ height: h + "px", gridTemplateRows: "1fr" }, { height: "0px", gridTemplateRows: "1fr" }], { duration: left, easing: "cubic-bezier(.2,0,0,1)" });
  });
  list.querySelectorAll("[data-sw]").forEach(x => {
    const was = swWas.get(x.dataset.sw), now = [x.getAttribute("aria-checked"), x.dataset.at, x.dataset.tone];
    if (!was || was[0] === now[0]) return;
    const put = v => { x.setAttribute("aria-checked", v[0]); if (v[1]) x.dataset.at = v[1]; if (v[2]) x.dataset.tone = v[2]; };
    put(was); x.classList.add("still"); void x.offsetWidth; x.classList.remove("still"); requestAnimationFrame(() => put(now));
  });
  closingOld.forEach((old, grp) => {
    // the parent's sub-options pill keeps its count until the fold is over, then turns into the
    // lock pill: switching it at once drew the lock mid-fold
    const fold = foldingKids.get(grp), nb = list.querySelector(`[data-row="${grp}"] .kidbtn`);
    if (fold && fold.btn && nb && nb.outerHTML !== fold.btn) {
      const fresh = nb.outerHTML; nb.outerHTML = fold.btn;
      setTimeout(() => { const cur = list.querySelector(`[data-row="${grp}"] .kidbtn`); if (cur && !list.querySelector(`[data-kids-of="${grp}"]`)?.classList.contains("open")) { cur.outerHTML = fresh; const n = list.querySelector(`[data-row="${grp}"] .kidbtn`); n?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160 }); } }, Math.max(0, fold.until - performance.now()) + 20);
    }
    const kin = list.querySelector(`[data-kids-of="${grp}"] > .kin`); if (!kin) return;
    const fresh = kin.innerHTML; kin.innerHTML = old; stripUnlock(kin);
    kin.querySelectorAll(".row").forEach(r => r.classList.remove("sel", "attn", "nudge"));
    const left = Math.max(0, (foldingKids.get(grp)?.until ?? now0) - performance.now());
    setTimeout(() => { if (kin.isConnected && !kin.parentElement.classList.contains("open")) kin.innerHTML = fresh; }, left + 20);
  });
  const keepOpen = [...list.querySelectorAll(".row > .txt > .sum")].filter(e => wasOpen.has(e.closest(".row").dataset.row));
  keepOpen.forEach(e => { e.style.transition = "none"; e.style.maxHeight = wasOpen.get(e.closest(".row").dataset.row) + "px"; });
  fitSums(list, new Set(keepOpen));
  // the unfold carries on once the redraw and everything after it is done (two frames on), so it
  // doesn't start inside that busy stretch and skip its first frames
  if (keepOpen.length) { void list.offsetHeight; afterBusy(() => keepOpen.forEach(e => { e.style.transition = ""; e.style.maxHeight = ""; })); }
  // animate sub-option groups and rows from their previous state to the new one
  void list.offsetHeight;
  const sameSec = lastVis.sec === section;
  const nowVis = new Set();
  list.querySelectorAll(".kids .row").forEach(r => {
    const k = r.dataset.row, vis = !r.classList.contains("hide"), box = r.closest(".kids"), grp = box.dataset.kidsOf;
    if (vis) nowVis.add(k);
    if (!sameSec) return;
    const was = lastVis.keys.has(k);
    if (was && !vis) {
      // keep it on screen while it folds away, then hide it
      r.classList.remove("hide");
      if (wantOpen.has(grp) && lastOpen.has(grp) && oldKidRows.has(k)) { const t = document.createElement("div"); t.innerHTML = oldKidRows.get(k); const o = t.firstElementChild; o.classList.remove("sel", "attn", "nudge"); stripUnlock(o); r.replaceWith(o); r = o; }
      if (wantOpen.has(grp) && lastOpen.has(grp)) { const an = sizeAnim(r, false); const end = () => { r.classList.add("hide"); r.getAnimations().forEach(a => a.cancel()); }; if (an) an.onfinish = end; else end(); }
      else setTimeout(() => r.classList.add("hide"), 300);
    } else if (!was && vis && lastOpen.has(grp) && wantOpen.has(grp)) sizeAnim(r, true);
  });
  list.querySelectorAll(".kids").forEach(e => e.classList.toggle("open", wantOpen.has(e.dataset.kidsOf)));
  lastOpen = wantOpen; lastVis = { sec: section, keys: nowVis };
  // locked settings that came or went fold in and out like sub-options
  if (lastGone.sec === section) {
    list.querySelectorAll(".row[data-row]").forEach(r => {
      const k = r.dataset.row, box = r.closest(".gunit") || r;
      if (lastGone.keys.has(k) && !goneNow.has(k)) sizeAnim(box, true);
      else if (!lastGone.keys.has(k) && goneNow.has(k)) { box.classList.add("going"); foldAway(box, () => syncGroups(list)); }
    });
    syncGroups(list);
    syncHeads(list, headsWere);
  }
  lastGone = { sec: section, keys: goneNow };
  // rows that just became available on this screen get the unlock animation
  // read from the settings, not the drawn rows: a sub-option folding away keeps its unlocked look
  // while it folds, and read from the DOM it never counted as locked, so it unlocked only once
  const dis = new Set([...list.querySelectorAll(".row[data-row]")].map(r => r.dataset.row).filter(k => PREF[k] && !parentsOk(k)));
  if (lastDis.sec === section) { carryUnlocks(list); lastDis.keys.forEach(k => { if (!dis.has(k)) { const r = list.querySelector(`[data-row="${k}"]`); if (r && !r.dataset.ulk && !r.classList.contains("hide")) unlockFx(r); } }); }
  else unlocking.clear();
  lastDis = { sec: section, keys: dis };
  lockedWas.forEach((w, k) => { const r = list.querySelector(`.row[data-row="${k}"]:not(.dis)`); if (r) unlockMorph(r, w); });
}
// the unlocking card: height from the locked card's to its own, the old side column fading in place
function unlockMorph(r, w) {
  const h1 = r.offsetHeight;
  if (!h1) return;
  const ghost = w.side; ghost.classList.add("sidefade"); ghost.querySelectorAll("button").forEach(b => { b.disabled = true; b.tabIndex = -1; });
  ghost.style.cssText = `position:absolute;left:${w.x}px;top:${w.y}px;width:${w.w}px;margin:0;pointer-events:none;z-index:3`;
  r.appendChild(ghost);
  ghost.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "scale(.92)" }], { duration: ULK_MS * .45, easing: "ease-out", fill: "forwards" }).onfinish = () => ghost.remove();
  if (Math.abs(h1 - w.h) > 1) r.animate([{ height: w.h + "px", minHeight: "0px", overflow: "hidden" }, { height: h1 + "px", minHeight: "0px", overflow: "hidden" }], { duration: ULK_MS * .6, easing: "cubic-bezier(.4,0,.2,1)" });
}
// "Swipe zone preview" is one column on the right of the left, right and top zone rows, its title
// running vertically, since it previews all three
// A locked setting (its parent is off) isn't listed until the parent is on; one reached by search or
// "Take me there" stays while it is selected, with its lock and the way to unlock it.
let lastGone = { sec: null, keys: new Set() };
// selecting a locked setting (from search) unfolds it; selecting something else folds it away again
function syncLocked(k) {
  const list = $("list"); if (!list || searching) return;
  const before = shownHeads(list); let changed = false;
  list.querySelectorAll(".gunit").forEach(box => {
    const row = box.classList.contains("row") ? box : box.querySelector(":scope > .row"); if (!row) return;
    const want = row.dataset.row === k || !row.classList.contains("dis"), out = isOut(box);
    if (want && out) {
      box.getAnimations().forEach(a => a.cancel()); box.classList.remove("gone", "going"); lastGone.keys.delete(row.dataset.row); changed = true;
      syncGroups(list); fitOpts(box); sizeAnim(box, true);
    } else if (!want && !out) {
      lastGone.keys.add(row.dataset.row); changed = true;
      foldAway(box, () => syncGroups(list));
    }
  });
  if (changed) syncHeads(list, before);
}
// Option pills: as many columns as the longest label allows on this screen width, then the rows evened
// out (6 speeds a row, 5 qualities, all pitches on one line when they fit), worked out again whenever
// the list is drawn or the window changes size. Nothing is fixed per setting.
let optCtx = null;
// Every pill in a box gets the width of the one with the longest text. When an even row would stretch
// them far past that (a few long options, one per line), they keep that width instead of filling the line.
// What fitPills reads from the page, read for every box before any box is changed: reading after each
// write made the browser lay the whole list out again once per box (Max, Nov 22: performance).
function pillsMeasure(box, pills) {
  const W = box.clientWidth; if (!W || !pills.length) return null;
  const cs = getComputedStyle(pills[0]);
  return { W, fontSize: cs.fontSize, font: `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`, gap: parseFloat(getComputedStyle(box).columnGap) || 6 };
}
function fitPills(box, pills, textOf, chrome, tight = false, pre) {
  if (!pre) { box.classList.remove("tight"); box.style.removeProperty("--tight-fs"); pre = pillsMeasure(box, pills); }
  if (!pre) return;
  const { W, gap } = pre, cs = { fontSize: pre.fontSize };
  optCtx = optCtx || document.createElement("canvas").getContext("2d"); optCtx.font = pre.font;
  let need = Math.ceil(Math.max(...pills.map(o => optCtx.measureText(textOf(o)).width)) + chrome), colCap = Infinity;
  // A few long labels (Chinese (Simplified)) take two lines when that gains a column, so one long name
  // does not halve the grid (Max, Nov 20). Each label's best two-line width is its widest half.
  if (!tight || pills.length > 8 || pills.some(o => /\s/.test(textOf(o).trim()))) {
    const w = t => optCtx.measureText(t).width;
    const two = t => { const p = t.split(/\s+/); let b = w(t); for (let i = 1; i < p.length; i++) b = Math.min(b, Math.max(w(p.slice(0, i).join(" ")), w(p.slice(i).join(" ")))); return b; };
    const need2 = Math.ceil(Math.max(...pills.map(o => two(textOf(o)))) + chrome);
    const wraps = pills.filter(o => w(textOf(o)) + chrome > need2).length;
    // Labels of two words or more may take two lines whenever one more column saves a line of pills
    // (Max, Nov 23 PM: Player icon style, 2 columns of 5 lines became 3 of 4), every word kept whole.
    const colsAt = nd => Math.max(1, Math.floor((W + gap) / (nd + gap))), rowsAt = c => Math.ceil(pills.length / Math.min(pills.length, c));
    const c1 = colsAt(need), c2 = Math.min(colsAt(need2), c1 + 1);
    if (colsAt(need2) > c1 && wraps <= Math.max(1, Math.floor(pills.length / 4))) need = need2; // a few long labels: as many columns as fit
    else if (c2 > c1 && rowsAt(c2) < rowsAt(c1)) { need = need2; colCap = c2; } // many: one more column, one line less
  }
  const maxCols = Math.min(colCap, Math.max(1, Math.floor((W + gap) / (need + gap))));
  const n = pills.length, rows = Math.ceil(n / Math.min(n, maxCols)), cols = Math.ceil(n / rows);
  // fill the line only when that stretches the pills by at most a quarter; otherwise each keeps the
  // widest pill's width (three long options one per line stay that long, not the whole card wide)
  // One line beats equal widths: when equal pills would wrap but the pills at their own widths fit
  // on one line (Off · Volume · Brightness · Speed), they share the line in proportion to their text.
  if (maxCols < n) {
    const own = pills.map(o => Math.ceil(optCtx.measureText(textOf(o)).width + chrome)), sum = own.reduce((a, b) => a + b, 0) + gap * (n - 1);
    if (sum <= W) { box.style.gridTemplateColumns = own.map(w => `minmax(${w}px, ${w}fr)`).join(" "); box.style.justifyContent = ""; return; }
    // Short values that only just miss one line (Auto · 2160p · … · 240p) get a smaller text and the
    // least padding to stay on it, down to 10.5 px text; past that they wrap as usual.
    if (tight) {
      const fs = parseFloat(cs.fontSize), texts = pills.map(o => optCtx.measureText(textOf(o)).width), T = texts.reduce((a, b) => a + b, 0), TC = 8;
      const sc = Math.min(1, (W - TC * n - gap * (n - 1)) / T);
      if (fs * sc >= 10.5) {
        box.classList.add("tight"); box.style.setProperty("--tight-fs", (fs * sc).toFixed(2) + "px");
        box.style.gridTemplateColumns = texts.map(w => { const px = Math.ceil(w * sc + TC); return `minmax(${px}px, ${px}fr)`; }).join(" "); box.style.justifyContent = ""; return;
      }
    }
  }
  const even = (W - gap * (cols - 1)) / cols;
  const fill = cols > 1 && (even <= need * 1.25 || colCap === cols); // a column gained by wrapping: the pills share the line
  box.style.gridTemplateColumns = fill ? `repeat(${cols}, minmax(0, 1fr))` : `repeat(${cols}, ${Math.min(need, W)}px)`;
  box.style.justifyContent = fill ? "" : "center"; // pills that don't fill the line sit in its middle
}
function fitOpts(root = $("list")) {
  const jobs = [...root.querySelectorAll(".ctl.optgrid")].map(box => [box, [...box.querySelectorAll(".opt")], o => o.textContent, 2 * OPT_PAD + 2, true])
    // list chips (speeds, words): text, then the remove button; the add field takes its own line
    .concat([...root.querySelectorAll(".ctl.lst")].map(box => [box, [...box.querySelectorAll(".lchip")], o => o.firstChild ? o.firstChild.textContent : "", LCHIP_CHROME, false]));
  // all writes undone, then all reads, then all writes: one layout for the whole list instead of one per box
  jobs.forEach(([box]) => { box.classList.remove("tight"); box.style.removeProperty("--tight-fs"); });
  const pre = jobs.map(([box, pills]) => pillsMeasure(box, pills));
  jobs.forEach((j, i) => { if (pre[i]) fitPills(...j, pre[i]); });
}
// Option pills: the pressed colour flows from the old pill to the new one with a little bounce, in every
// option grid (list rows and the "needs" popup), across grid rows and for tall or tight pills alike.
// optSnap runs before the state changes (the grid is redrawn), optGlide once the new grid is laid out.
// One absolutely placed thumb per grid, shut in with contain:strict: only its transform and size move,
// nothing else in the list is laid out again. A tap during a glide carries on from where the thumb is.
let optFrom = null;
const OPT_REDUCED = matchMedia("(prefers-reduced-motion: reduce)");
function optSnap(btn) {
  optFrom = null;
  const box = btn.closest(".ctl.optgrid"); if (!box || OPT_REDUCED.matches) return;
  const th = box.querySelector(":scope > .optth"), old = box.querySelector('.opt[aria-pressed="true"]');
  const from = th || old || btn, b = box.getBoundingClientRect(), r = from.getBoundingClientRect();
  optFrom = { k: btn.dataset.set, pop: !!box.closest(".dlglist"), x: r.left - b.left, y: r.top - b.top, w: r.width, h: r.height, bg: th || old ? getComputedStyle(from).backgroundColor : null, t: performance.now() };
  if (th) th.getAnimations().forEach(a => a.cancel());
}
function optGlide() {
  const f = optFrom; optFrom = null;
  if (!f || performance.now() - f.t > 400) return;
  const scope = f.pop ? document.querySelector("#dlgBox .dlglist") : $("list");
  const on = scope && [...scope.querySelectorAll(`.opt[data-set="${f.k}"][aria-pressed="true"]`)].find(o => o.offsetParent);
  const box = on && on.parentElement; if (!box || !box.classList.contains("optgrid")) return;
  const b = box.getBoundingClientRect(), r = on.getBoundingClientRect();
  const to = { x: r.left - b.left, y: r.top - b.top, w: r.width, h: r.height };
  const dx = to.x - f.x, dy = to.y - f.y, dist = Math.hypot(dx, dy);
  const cs = getComputedStyle(on), bg = cs.backgroundColor;
  if (dist < 1 && f.bg === bg) return;
  box.querySelectorAll(":scope > .optth").forEach(t => t.remove());
  const th = document.createElement("i"); th.className = "optth"; th.setAttribute("aria-hidden", "true");
  th.style.cssText = `width:${to.w}px;height:${to.h}px;transform:translate(${to.x}px,${to.y}px);background:${bg}`;
  box.prepend(th); box.classList.add("gliding");
  // the pill's own corner, and a droplet shape for the trip: the leading end round, the trailing end
  // drawn out into a tail (each corner "horizontal / vertical"), so the colour flows rather than slides
  const R0 = Math.min(parseFloat(cs.borderTopLeftRadius) || 0, to.h / 2);
  const rad = (h, lead, tail, right) => { const v = h / 2, L = `${lead}px`, T = `${tail}px`; // right: moving right
    return right ? `${T} ${L} ${L} ${T} / ${v}px ${v}px ${v}px ${v}px` : `${L} ${T} ${T} ${L} / ${v}px ${v}px ${v}px ${v}px`; };
  const fr = (x, y, w, h, extra) => Object.assign({ transform: `translate(${x}px,${y}px)`, width: w + "px", height: h + "px" }, extra);
  const flat = r => ({ borderRadius: `${r}px` });
  let frames, dur;
  if (!f.bg) { // nothing was picked yet: a drop of colour grows out of the tapped pill and wobbles into its shape
    frames = [fr(to.x + to.w * .3, to.y + to.h * .25, to.w * .4, to.h * .5, { opacity: 0, borderRadius: `${to.h / 2}px`, easing: "cubic-bezier(.3,0,.4,1)" }),
      fr(to.x - 3, to.y + 1, to.w + 6, to.h - 2, { opacity: 1, borderRadius: `${to.h / 2}px`, offset: .5, easing: "ease-in-out" }),
      fr(to.x + 1.5, to.y - 1, to.w - 3, to.h + 2, { ...flat(R0), offset: .75, easing: "ease-in-out" }), fr(to.x, to.y, to.w, to.h, { opacity: 1, ...flat(R0) })];
    dur = 170;
  } else {
    const ux = dist ? dx / dist : 0, uy = dist ? dy / dist : 0, ov = Math.min(6, 2 + dist * .04), right = dx >= 0;
    // the rebound stays inside the grid (a pill at the edge is not overshot out of its card)
    const bw = b.width, bh = b.height, cx = x => Math.max(-2, Math.min(bw - to.w + 2, x)), cy = y => Math.max(-2, Math.min(bh - to.h + 2, y));
    let mids;
    // one point of the trip: centre moved t of the way, the drop drawn out along its way (k: along, q: across)
    const at = (t, k, q) => { const w0 = f.w + (to.w - f.w) * t, h0 = f.h + (to.h - f.h) * t, ax = Math.abs(ux), ay = Math.abs(uy);
      const mw = w0 * (ax * k + ay * q), mh = h0 * (ay * k + ax * q), mcx = f.x + f.w / 2 + (to.x + to.w / 2 - f.x - f.w / 2) * t, mcy = f.y + f.h / 2 + (to.y + to.h / 2 - f.y - f.h / 2) * t; return [mcx - mw / 2, mcy - mh / 2, mw, mh]; };
    if (Math.abs(dy) > 1) { // another grid row: a drop travels straight there (never a blob over four pills), stretched along its way
      const [x1, y1, w1, h1] = at(.18, 1.08, .86), [x2, y2, w2, h2] = at(.45, 1.22, .74), [x3, y3, w3, h3] = at(.74, 1.1, .82);
      mids = [fr(x1, y1, w1, h1, { borderRadius: rad(h1, h1 / 2, h1 * .8, right), offset: .16, easing: "cubic-bezier(.33,0,.4,1)" }),
        fr(x2, y2, w2, h2, { borderRadius: rad(h2, h2 / 2, h2 * 1.2, right), offset: .38, easing: "cubic-bezier(.3,.2,.4,1)" }),
        fr(x3, y3, w3, h3, { borderRadius: rad(h3, h3 / 2, h3, right), offset: .58, easing: "cubic-bezier(.25,.5,.4,1)" })];
    } else { // same row: the leading end runs ahead and pulls the tail after it like a liquid, thinnest mid-way
      const L0 = f.x, R0x = f.x + f.w, L1 = to.x, R1 = to.x + to.w, mcy = f.y + f.h / 2 + (to.y + to.h / 2 - f.y - f.h / 2) * .5;
      const span = (lead, trail, k) => { const l = L0 + (L1 - L0) * (right ? trail : lead), r = R0x + (R1 - R0x) * (right ? lead : trail), h = (f.h + (to.h - f.h) * .5) * k; return [l, mcy - h / 2, r - l, h]; };
      const [x1, y1, w1, h1] = span(.32, .02, .93), [x2, y2, w2, h2] = span(.7, .2, .8), [x3, y3, w3, h3] = span(.97, .6, .86);
      mids = [fr(x1, y1, w1, h1, { borderRadius: rad(h1, h1 / 2, Math.min(w1 * .45, h1 * 1.1), right), offset: .16, easing: "cubic-bezier(.33,0,.4,1)" }),
        fr(x2, y2, w2, h2, { borderRadius: rad(h2, h2 / 2, Math.min(w2 * .45, h2 * 1.7), right), offset: .38, easing: "cubic-bezier(.3,.2,.4,1)" }),
        fr(x3, y3, w3, h3, { borderRadius: rad(h3, h3 / 2, Math.min(w3 * .45, h3 * 1.2), right), offset: .58, easing: "cubic-bezier(.25,.5,.4,1)" })];
    }
    // arrival: overshoot, squash, and a short damped jelly wobble back into the pill's own shape
    frames = [fr(f.x, f.y, f.w, f.h, { backgroundColor: f.bg, ...flat(Math.min(R0, f.h / 2)), easing: "cubic-bezier(.45,0,.55,1)" }), ...mids,
      fr(cx(to.x + ux * ov), cy(to.y + uy * ov), to.w - Math.abs(ux) * ov * .8, to.h + 2 - Math.abs(uy) * ov * .4, { backgroundColor: bg, borderRadius: `${to.h / 2}px`, offset: .72, easing: "cubic-bezier(.4,0,.6,1)" }),
      fr(cx(to.x - ux * ov * .3), cy(to.y - uy * ov * .3) + .6, to.w + Math.abs(ux) * ov * .35 + 1, to.h - 1.2, { ...flat(R0), offset: .86, easing: "cubic-bezier(.4,0,.6,1)" }),
      fr(to.x - .4, to.y - .3, to.w + .8, to.h + .6, { ...flat(R0), offset: .94, easing: "cubic-bezier(.4,0,.6,1)" }),
      fr(to.x, to.y, to.w, to.h, { backgroundColor: bg, ...flat(R0) })];
    dur = Math.round(160 + Math.min(80, dist * .22)); // quicker again: 160-240 ms (Max, Nov 23 PM)
  }
  const a = th.animate(frames, { duration: dur, fill: "none" });
  // hand back to the pill without a fade: the pill's own background transition, set off by .gliding
  // going, flashed it from clear to its colour (choice, black, choice) on the last frame
  const done = () => {
    if (![...box.querySelectorAll(":scope > .optth")].some(t => t !== th)) { // not handed on to a newer glide
      const p = box.querySelector('.opt[aria-pressed="true"]');
      if (p) p.style.transition = "none";
      box.classList.remove("gliding"); if (p) void p.offsetWidth;
      if (p) requestAnimationFrame(() => { p.style.transition = ""; });
    }
    th.remove();
  };
  a.onfinish = done; a.oncancel = done;
}
const OPT_PAD = 6; // the least room beside a pill's text
const LCHIP_CHROME = 8 + 2 + 22 + 2; // left padding, gap, remove button, right padding (4 speeds a row in a ~300px card)
addEventListener("resize", () => { clearTimeout(fitOpts._t); fitOpts._t = setTimeout(() => fitOpts(), 120); });
function hideLocked(list) {
  const gone = new Set();
  list.querySelectorAll(".row.dis[data-row]").forEach(r => {
    const k = r.dataset.row; if (k === selected || r.closest(".kids")) return;
    const unit = r.parentElement.classList.contains("unit") && r.parentElement.firstElementChild === r ? r.parentElement : r;
    unit.classList.add("gone", "gunit"); gone.add(k);
  });
  syncHeads(list, null);
  return gone;
}
// Captions and headings ("Swipe zones", "More settings", a Miscellaneous group) only show while
// something under them does, in every tab and list design: worked out from the rows, never fixed in
// the markup. A row folding away ("going") already counts as gone, so its heading folds with it.
// before: the headings shown before the change (headId), to fold the ones that came or went; null
// just sets them.
const HEADS = ".subhead, .sechead, .gtitle";
const isOut = n => n.classList.contains("gone") || n.classList.contains("going");
const headId = h => h.dataset.h || h.textContent;
const shownHeads = list => new Set([...list.querySelectorAll(HEADS)].filter(h => !isOut(h)).map(headId));
function headBody(h) {
  if (h.classList.contains("subhead")) { const out = []; for (let n = h.nextElementSibling; n && !n.matches(HEADS); n = n.nextElementSibling) out.push(n); return out; }
  const g = h.nextElementSibling; return g && g.classList.contains("group") ? [...g.children].filter(n => !n.matches(HEADS)) : [];
}
function syncHeads(list, before) {
  list.querySelectorAll(HEADS).forEach(h => {
    const items = headBody(h).filter(n => !isOut(n)), show = items.length > 0, going = h.classList.contains("going");
    const gn = h.querySelector(".gn"); if (gn && show) gn.textContent = items.length;
    const was = before ? before.has(headId(h)) : show;
    if (was === show && !(going && show)) { if (!going) h.classList.toggle("gone", !show); return; }
    h.getAnimations().forEach(a => a.cancel()); h.classList.remove("going", "gone", "sizing", "sizew", "sizei");
    if (show) sizeAnim(h, true);
    else foldAway(h);
  });
  syncGroups(list);
}
// a card group stays while a row in it is still folding away
const syncGroups = list => list.querySelectorAll(".group").forEach(g => g.classList.toggle("gone", ![...g.children].some(n => !n.matches(HEADS) && !n.classList.contains("gone"))));
// folds a row or heading away, then hides it for good
function foldAway(el, then) {
  el.classList.remove("gone"); el.classList.add("going");
  const an = sizeAnim(el, false);
  const end = () => { el.classList.remove("going"); el.classList.add("gone"); el.getAnimations().forEach(a => a.cancel()); if (then) then(); };
  if (an) an.onfinish = end; else end();
}
function mergeZonePreview(list) {
  const pv = list.querySelector('.row[data-row="morphe_swipe_zone_preview"]'); if (!pv) return;
  const zs = ["left", "right", "top"].map(s => list.querySelector(`.row[data-row="morphe_swipe_${s}_zone"]`)).filter(Boolean)
    .map(r => r.parentElement.classList.contains("unit") ? r.parentElement : r).filter(e => e.parentElement === pv.parentElement);
  if (zs.length < 2) return;
  const g = document.createElement("div"); g.className = "zgrid";
  const col = document.createElement("div"); col.className = "zcol";
  zs[0].before(g); zs.forEach(e => col.appendChild(e)); g.append(col, pv); pv.classList.add("zprev");
}
// One unlock animation per setting, on one clock. Every tap redraws the list, which threw the running
// badge away with the old rows (it vanished, or a stale copy of the row brought it back from the start:
// the flicker on a quick second tap). Now a redraw picks the animation up where it was instead.
const ULK_MS = 560, unlocking = new Map(); // setting -> when its unlock animation started
function unlockFx(row, out = false) {
  const k = row.dataset.row, t0 = unlocking.get(k), resume = t0 !== undefined && performance.now() - t0 < ULK_MS;
  if (!resume) unlocking.set(k, performance.now());
  row.dataset.ulk = "1";
  // A row that just appeared (a sub-option unfolding) is still growing from zero height with its
  // overflow clipped: measuring it then put the badge in the wrong place, clipped, between two cards.
  // So a new badge waits until the row and its sub-option group have finished moving, and it is placed
  // inside the control's own box (centred by CSS), so it can't drift from it whatever the layout does.
  const moving = resume ? [] : [row, row.closest(".kids")].filter(Boolean).flatMap(e => e.getAnimations())
    .filter(a => { const t = a.effect && a.effect.getComputedTiming(); return t && isFinite(t.endTime); });
  // the control stays locked (greyed, gold lock) until its opening starts, so it never shows unlocked first
  if (!resume && !out) { const h = lockHost(row); if (h && !h.querySelector(".lk7")) h.insertAdjacentHTML("beforeend", LOCK_COVER); }
  const go = () => {
    if (!row.isConnected) return;
    if (!resume && moving.length) unlocking.set(k, performance.now()); // the opening plays whole once the row stops moving
    const el = performance.now() - unlocking.get(k); if (el >= ULK_MS) return;
    // locked again mid-opening: the row's own locked cover stays, the opening fades over it
    row.querySelectorAll(out ? ".ulk, .lk7.go" : ".ulk, .lk7").forEach(e => e.remove());
    row.classList.add("unlock");
    row.getAnimations().filter(a => /^unlock/.test(a.animationName || "")).forEach(a => { a.currentTime = el; });
    // the locked cover comes back on the now unlocked control and plays its opening (lockOpening)
    const host = lockHost(row); if (!host) { setTimeout(() => row.classList.remove("unlock"), ULK_MS - el); return; }
    const u = lockOpening(host);
    host.getAnimations({ subtree: true }).filter(a => /^lk/.test(a.animationName || "")).forEach(a => { a.currentTime = el; });
    // locked again mid-animation (the parent tapped off): the badge fades from where it is, no jump
    if (out) { unlocking.delete(k); u.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150, fill: "forwards" }).onfinish = () => { lockClosed(host, u); row.classList.remove("unlock"); }; return; }
    setTimeout(() => { lockClosed(host, u); row.classList.remove("unlock"); }, ULK_MS - el);
  };
  if (!moving.length) return go();
  let done = false; const once = () => { if (!done) { done = true; go(); } };
  Promise.all(moving.map(a => a.finished.catch(() => {}))).then(once); setTimeout(once, 700);
}
// after a redraw: running unlocks carry on on the new rows (only while the setting is still unlocked)
function carryUnlocks(list) {
  const now = performance.now();
  unlocking.forEach((t, k) => {
    if (now - t >= ULK_MS) return unlocking.delete(k);
    const r = list.querySelector(`.row[data-row="${k}"]`);
    if (!r || r.dataset.ulk || r.classList.contains("hide")) return;
    unlockFx(r, r.classList.contains("dis") || !parentsOk(k));
  });
}
// copies of old rows (kept on screen while they fold away) must not bring a finished or running badge back
// ---- The lock on a locked setting's control, and its opening
// The gold lock (same colour as the "Parent setting must be…" line) is drawn in two parts, the shackle
// and the body, so it can open and break.
const LOCK_SVG = `<svg class="lki" viewBox="0 0 24 24" aria-hidden="true"><path class="lks" d="M8 11V8a4 4 0 0 1 8 0v3"/><rect class="lkb" x="5.5" y="10.5" width="13" height="10" rx="2.4"/><circle class="lkk" cx="12" cy="15.5" r="1.5"/></svg>`;
// a <b>, not a <span>: the toggle styles its own spans (its two words)
const LOCK_COVER = `<b class="lk7" aria-hidden="true">${LOCK_SVG}</b>`;
// the cover goes inside the control's own box (a toggle, a switch, a state chip, a box of options)
const withLock = html => html.replace(/<\/(\w+)>\s*$/, `${LOCK_COVER}</$1>`);
const lockHost = row => row.querySelector(".side > .lt7, .side > .sw, .side > .state") || row.querySelector(".txt > .ctl");
// The opening (Max, Nov 23: design A "Doors"), in ULK_MS like the rest of the unlock: the shackle swings
// open on the left door, the lock cracks down the middle and its two halves slide out to both ends with
// the grey, like sliding doors. As they part, each door casts a shadow on the control behind it and shows
// a lit edge, and a shade over the control lifts, so the doors read as in front of it. The control itself
// is never moved, scaled or filtered: that made it settle and shift at the end (Max, Nov 23).
function lockOpening(host) {
  const u = document.createElement("b");
  u.className = "lk7 go"; u.setAttribute("aria-hidden", "true");
  const half = side => `<span class="lkh ${side}"><span class="lkc">${LOCK_SVG}</span></span>`;
  u.innerHTML = `<span class="lkshade"></span>` + half("l") + half("r");
  host.appendChild(u);
  return u;
}
const lockClosed = (host, u) => u.remove();
const stripUnlock = root => { root.querySelectorAll(".ulk, .lk7.go").forEach(e => e.remove()); (root.matches?.(".row") ? [root] : []).concat([...root.querySelectorAll(".row")]).forEach(r => { r.classList.remove("unlock"); delete r.dataset.ulk; }); };

// ------------------------------------------------------------------ search
let searching = false, query = "";
function setSearch(on) {
  if (on === searching) return;
  searching = on;
  // the bar grows out of the search button to both sides, and shrinks back into it
  { const bar = $("searchBar"), b = bar.getBoundingClientRect(), r = $("btnSearch").getBoundingClientRect();
    if (b.width && r.width) { bar.style.setProperty("--cl", Math.max(0, r.left - b.left) + "px"); bar.style.setProperty("--cr", Math.max(0, b.right - r.right) + "px"); } }
  $("app").classList.toggle("searching", on);
  $("btnSearch").setAttribute("aria-expanded", String(on));
  $("q").tabIndex = on ? 0 : -1; $("qClose").tabIndex = on ? 0 : -1;
  if (on) { stopDemo(); stopScenario(); setPicker(false); $("q").value = query; setTimeout(() => { $("q").focus(); $("q").select(); }, 60) /* a remembered search is selected, so one key replaces or clears it */; $("scroller").scrollTop = 0; renderList(); }
  else { $("q").blur(); renderStage(); renderList(); }
}
function renderSearch() {
  $("list").dataset.view = "search";
  const q = query.trim().toLowerCase();
  // settings this device leaves out of the lists (offDevice) are still found, locked, with the reason
  const all = CAT.preferences.filter(p => inYtVersion(p.key) && !(p.type === "screen" && offDevice(p.key)));
  if (!q) { $("list").innerHTML = `<div class="shint">Type to search all ${all.length} settings.</div>`; return; }
  const words = q.split(/\s+/).filter(Boolean);
  const hits = [];
  for (const p of all) {
    const sec = SECTIONS.find(s => s.id === resSection(p.key));
    const hay = `${title(p.key)} ${p.summary || ""} ${p.summaryOn || ""} ${p.summaryOff || ""} ${p.subScreenTitle || ""} ${placeLabel(resSection(p.key))} ${p.key}`.toLowerCase();
    if (!words.every(w => hay.includes(w))) continue;
    const t = title(p.key).toLowerCase();
    hits.push({ p, sec, score: (t.startsWith(q) ? 0 : t.includes(q) ? 1 : 2) });
  }
  // a sub-screen and its own main switch with the same name (Voice over translation) are one result: the setting
  for (let i = hits.length - 1; i >= 0; i--) { const s = hits[i].p; if (s.type === "screen" && hits.some(h => h.p.subScreen === s.key && title(h.p.key) === title(s.key))) hits.splice(i, 1); }
  hits.sort((a, b) => a.score - b.score || SECTIONS.indexOf(a.sec) - SECTIONS.indexOf(b.sec));
  const mark = t => { let h = esc(t); for (const w of words) h = h.replace(new RegExp(`(${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig"), "<mark>$1</mark>"); return h; };
  $("list").innerHTML = hits.length
    ? `<div class="sechead">${hits.length} result${hits.length > 1 ? "s" : ""}</div><div class="group">${hits.slice(0, 120).map(({ p, sec }) => {
        const par = PARENT_OF[p.key];
        const where = p.type === "screen" ? `Screen · ${placeLabel(resSection(p.key))}` : `${placeLabel(resSection(p.key))}${par ? ` › ${title(par)}` : ""}`;
        const off = offDevice(p.key);
        return `<div class="sres${off ? " soff" : ""}" data-res="${p.key}" tabindex="0"><div class="ttl">${mark(title(p.key))}${off ? I("lock", "lk") : ""}</div><div class="where">${esc(where)}</div>${off ? `<div class="sum need">${esc(deviceWhy(p.key))}</div>` : summaryFor(p.key) ? `<div class="sum">${esc(summaryFor(p.key))}</div>` : ""}</div>`;
      }).join("")}</div>`
    : `<div class="shint">No settings match “${esc(query)}”.</div>`;
}
$("btnSearch").onclick = () => setSearch(true);
$("qClose").onclick = () => { query = ""; setSearch(false); };
$("q").addEventListener("input", e => { query = e.target.value; renderSearch(); });
$("q").addEventListener("keydown", e => { if (e.key === "Escape") { query = ""; setSearch(false); } if (e.key === "Enter") { const f = $("list").querySelector("[data-res]"); if (f) openResult(f.dataset.res); } });
// a setting this device leaves out has no row to open: its result stays, and its reason pulses
function openResult(k) {
  if (offDevice(k)) { const r = $("list").querySelector(`[data-res="${k}"] .need`); if (r) r.animate([{ opacity: .35 }, { opacity: 1 }, { opacity: .35 }, { opacity: 1 }], { duration: 700 }); return; }
  setSearch(false); returnTo = null; goToSetting(k);
}
// the tab a result belongs to; a setting left out on this device keeps the tab it would be in
const resSection = k => offDevice(k) && A[k] && SECTIONS.some(s => s.id === A[k].section) ? A[k].section : sectionOf(k);

function renderInspector() {
  // the in-app editor never shows the inspector (app.css): drawing it there was a third of every change's work
  if (document.documentElement.classList.contains("inapp")) return;
  const k = selected, p = k && PREF[k];
  if (!p) $("selCard").innerHTML = `<h2>Selected</h2><p>Nothing selected. Tap a component in the preview or a row in the list.</p>`;
  else {
    const a = A[k];
    const src = p.sourceFile ? `<a href="https://github.com/MorpheApp/morphe-patches/blob/main/${esc(p.sourceFile)}" target="_blank" rel="noopener">${esc(p.sourceFile.split("/").pop())}</a>` : "–";
    $("selCard").innerHTML = `<h2>Selected</h2><h3>${esc(shownTitle(k))}</h3><p>${esc(fmtSum(k, p.summary || "") || summaryFor(k) || "")}</p>
      <dl class="kv">
        <dt>Key</dt><dd>${esc(k)}</dd>
        <dt>Adapter</dt><dd><span class="pill">${a ? (a.kind === "scenario" ? "ScenarioAnimation" : KIND_NAME[a.kind]) : KIND_NAME.fallback}</span></dd>
        <dt>Type</dt><dd>${esc(p.type || p.widget)}${p.rebootApp ? ' · <span style="color:var(--m-warning)">restarts app</span>' : ""}</dd>
        <dt>Default</dt><dd>${esc(JSON.stringify(defaults[k]))}</dd>
        <dt>Current</dt><dd>${esc(JSON.stringify(state[k]))}</dd>
        <dt>Stock</dt><dd>${esc(JSON.stringify(stockOf(k)))}</dd>
        <dt>Screen</dt><dd>${esc([p.screenTitle, p.subScreenTitle].filter(Boolean).join(" › ") || "–")}</dd>
        <dt>Patch</dt><dd>${esc(p.patch || "(internal)")}</dd>
        <dt>Source</dt><dd>${src}</dd>
        ${p.parents && p.parents.length ? `<dt>Depends on</dt><dd>${p.parents.map(x => esc((x.mode === "not" ? "!" : "") + x.key)).join("<br>")}</dd>` : ""}
      </dl>`;
  }
  const total = CAT.preferences.length;
  // Every setting is in the editor; what differs is how much the preview does for it. Three kinds,
  // the same in the totals, each tab's bar and its list: animated (plays a demo or an Off / On
  // comparison), shown (drawn in the preview, changes it, no animation), no preview (a plain row under
  // the tab's "More settings", or in Miscellaneous when it has no tab).
  const okNone = k => NO_PREVIEW_OK.has(k) || NO_PREVIEW_OK.has(sectionOf(k));
  // a setting without its own entry that still lights up a part of the preview counts as shown: it
  // acts on another setting's element (NEEDS), flashes a named one (PROXY_K) or its parent's element in the preview (a
  // sub-option such as "Tap Playback speed button to cycle speeds")
  const lights = k => { if (NEEDS[k] || PROXY_K[k]) return true; const seen = new Set(); for (let p = PARENT_OF[k]; p && !seen.has(p); p = PARENT_OF[p]) { seen.add(p); if ((A[p] && A[p].kind !== "scenario") || NEEDS[p] || PROXY_K[p]) return true; } return false; };
  const kindOf = k => A[k] && A[k].kind !== "list" ? (isAnimated(k) ? "anim" : "shown") : NO_PREVIEW_OK.has(k) ? "ok" : lights(k) ? "shown" : okNone(k) ? "ok" : "none";
  const count = keys => { const c = { anim: 0, shown: 0, ok: 0, none: 0 }; keys.forEach(k => c[kindOf(k)]++); return c; };
  const bar = (c, t) => `<div class="bar3">${["anim", "shown", "ok", "none"].map(x => c[x] ? `<i class="${x}" style="width:${c[x] / t * 100}%"></i>` : "").join("")}</div>`;
  const all = count(CAT.preferences.map(p => p.key));
  const tabs = SECTIONS.filter(s => s.id !== "misc").map(s => { const m = MEMBERS[s.id], keys = [...m.live, ...m.misc]; return { s, keys, c: count(keys) }; });
  const miscN = MEMBERS.misc ? MEMBERS.misc.live.length + MEMBERS.misc.misc.length : 0;
  const openTabs = new Set([...$("covCard").querySelectorAll("details[open]")].map(d => d.dataset.s)); // stays open through redraws
  $("covCard").innerHTML = `<h2>Coverage</h2>
    <p class="covlead">All ${total} settings in Morphe are in the editor. The bars show how much the preview does for them.</p>
    <div class="covkey"><span><i class="anim"></i><b>${all.anim}</b> animated</span><span><i class="shown"></i><b>${all.shown}</b> shown, not animated</span><span><i class="ok"></i><b>${all.ok}</b> no preview, approved</span><span><i class="none"></i><b>${all.none}</b> no preview</span></div>
    <div class="covhelp">Animated: plays a demo or an Off / On comparison. Shown: drawn in the preview, or lights up the part of it it changes, without an animation. Approved: no preview, and fine that way. No preview: a plain setting row, under its tab's "More settings" (or in Miscellaneous when it has no tab). Tap a tab to see its settings without a preview.</div>
    <div class="cov">${tabs.map(({ s, keys, c }) => `<details class="r3" data-s="${s.id}"${openTabs.has(s.id) ? " open" : ""}><summary><span>${esc(s.title)}</span>${bar(c, keys.length)}<span class="num">${c.anim}<i>·</i>${c.shown}<i>·</i>${c.ok}<i>·</i>${c.none}</span></summary>
      <div class="covmiss">${c.none || c.ok ? keys.filter(k => /none|ok/.test(kindOf(k))).map(k => `<div>${esc(shownTitle(k))}${kindOf(k) === "ok" ? " <i>(approved)</i>" : ""}</div>`).join("") : "Every setting here has a preview."}</div></details>`).join("")}</div>
    <div class="covhelp">Numbers per tab: animated · shown · approved without preview · no preview. ${miscN ? `Miscellaneous holds ${miscN} more with no tab of their own.` : ""}</div>
    <p style="margin-top:12px;font-size:12px">Source: <span style="font-family:var(--mono)">${esc(CAT.source)}</span></p>`;
  const ch = changedOnly(); const n = Object.keys(ch).length;
  $("chgCard").innerHTML = `<h2>Changed settings</h2><p>${n ? `${n} setting${n > 1 ? "s" : ""} differ from Morphe's defaults. Saved in this browser only.` : "All settings are at Morphe's defaults."}</p>
    ${n ? `<pre class="json" id="json">${esc(JSON.stringify(ch, null, 1))}</pre>` : ""}
    <div class="btnrow">${n ? `<button class="btn" id="copyJson">Copy as JSON</button><button class="btn danger" id="resetAll">Reset all</button>` : ""}</div>`;
  const cp = $("copyJson");
  if (cp) cp.onclick = () => { const txt = JSON.stringify(ch, null, 1); (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => snack("Copied changed settings"), () => selectPre()); };
  const rs = $("resetAll");
  if (rs) rs.onclick = () => { const before = { ...state }; Object.assign(state, defaults); commit(); snack("Reset all settings to defaults", () => { Object.assign(state, before); commit(); }); };
}
function selectPre() { const pre = $("json"); if (!pre) return; const r = document.createRange(); r.selectNodeContents(pre); const s = getSelection(); s.removeAllRanges(); s.addRange(r); snack("Press Ctrl+C to copy"); }

function renderAll() { renderBar(); renderStage(); renderList(); renderInspector(); applyLayout(); store.save(); }
function commit() { applyAppColors(); renderBar(); renderStage(); renderList(); renderInspector(); store.save(); }

// ------------------------------------------------------------------ restart handling
const pendingRestart = () => Object.keys(PREF).filter(k => PREF[k].rebootApp && JSON.stringify(state[k]) !== JSON.stringify(baseline[k]));
function openDialog(html) { $("dlgBox").innerHTML = html; $("dlg").classList.add("open"); glassSample(); setTimeout(() => $("dlgBox").querySelector("button")?.focus(), 50); }
function closeDialog() { $("dlg").classList.remove("open"); }
// Changes that only apply after YouTube restarts (Max, Nov 20). Values are saved as soon as they are
// changed; leaving asks what to do with these: restart now, keep them for later, or reset them to the
// values YouTube runs with. Opening the editor again with some still waiting asks the same in reverse.
// leaveHost holds what each answer does: the web demo's versions here, the in-app editor's in app-post.js.
const pendingList = keys => `<ul>${keys.map(k => `<li>${esc(shownTitle(k))}</li>`).join("")}</ul>`;
const nSettings = n => `${n} setting${n > 1 ? "s" : ""}`;
const leaveHost = {
  restart() { $("restarting").classList.add("on"); setTimeout(() => { baseline = { ...state }; storeBaseline(); savedPending(null); renderBar(); $("restarting").classList.remove("on"); snack("YouTube restarted. All changes are applied."); }, 1400); },
  saveForLater() { savedPending(pendingRestart()); webLeave("Saved. They apply the next time YouTube restarts"); },
  reset(leaving) { for (const k of pendingRestart()) state[k] = baseline[k]; savedPending(null); commit(); if (leaving) webLeave("Changes reset"); else snack("Changes reset"); },
};
function webLeave(msg) {
  const app = $("app"); app.classList.remove("exitflash"); void app.offsetWidth; app.classList.add("exitflash");
  setTimeout(() => snack(`${msg} (demo: the editor reopens)`), 350);
}
function savedPending(keys) { try { if (keys && keys.length) localStorage.setItem(LS + "-pending", JSON.stringify(keys)); else localStorage.removeItem(LS + "-pending"); } catch { /* storage unavailable */ } }
function resetConfirm(n, leaving, back) {
  openDialog(`<div class="di">${I("reset")}</div><h2 id="dlgTitle">Reset these changes?</h2>
    <p>${nSettings(n)} go${n > 1 ? "" : "es"} back to the value${n > 1 ? "s" : ""} YouTube is running with now.</p>
    <div class="acts"><button class="dbtn primary neg" id="dReset">Reset</button><button class="dbtn tonal" id="dBack">Cancel</button></div>`);
  $("dReset").onclick = () => { closeDialog(); leaveHost.reset(leaving); };
  $("dBack").onclick = back;
}
// leaving the editor
function restartDialog() {
  const keys = pendingRestart();
  openDialog(`<div class="di">${I("restart")}</div><h2 id="dlgTitle">Restart to apply</h2>
    <p>${nSettings(keys.length)} only take${keys.length > 1 ? "" : "s"} effect after YouTube restarts. They are saved.</p>
    ${pendingList(keys)}
    <div class="acts"><button class="dbtn primary" id="dRestart">Restart now</button><button class="dbtn tonal" id="dLater">Save for later</button><button class="dbtn text neg" id="dReset">Reset changes</button></div>`);
  $("dRestart").onclick = () => { closeDialog(); leaveHost.restart(); };
  $("dLater").onclick = () => { closeDialog(); leaveHost.saveForLater(); };
  $("dReset").onclick = () => resetConfirm(keys.length, true, restartDialog);
}
// opening the editor with changes saved earlier that still wait for a restart
// (saved: the keys the app kept from the last visit; the App view stand-in has no live values, so it
// can only list those)
function pendingDialog(saved = []) {
  const now = pendingRestart(), keys = now.length ? now : saved.filter(k => PREF[k]); if (!keys.length) return;
  openDialog(`<div class="di">${I("restart")}</div><h2 id="dlgTitle">Changes not applied yet</h2>
    <p>You saved ${nSettings(keys.length)} last time. YouTube hasn't restarted since, so ${keys.length > 1 ? "they aren't" : "it isn't"} applied yet.</p>
    ${pendingList(keys)}
    <div class="acts"><button class="dbtn primary" id="dRestart">Apply and restart</button><button class="dbtn tonal" id="dGo">Continue changes</button><button class="dbtn text neg" id="dReset">Reset changes</button></div>`);
  $("dRestart").onclick = () => { closeDialog(); leaveHost.restart(); };
  $("dGo").onclick = closeDialog;
  $("dReset").onclick = () => resetConfirm(keys.length, false, () => pendingDialog(saved));
}
// The menu's three-way toggles: one thumb slides to the picked option (Max, Nov 22). The picker
// is drawn again on every change, so the thumb starts from where the old one was (seg3From) and glides.
// Every three-way toggle in the menu (UI design, Settings list design) works the same way.
const seg3 = (label, attr, opts, cur) => `<div class="seg3" role="radiogroup" aria-label="${label}" data-seg="${attr}"><i class="seg3-th"></i>${opts.map(([id, t]) => `<button role="radio" data-${attr}="${id}" aria-checked="${cur === id}">${t}</button>`).join("")}</div>`;
let seg3From = {};
function seg3Snap() { seg3From = {}; document.querySelectorAll("#pickGrid .seg3.th").forEach(seg => { const th = seg.querySelector(".seg3-th"); seg3From[seg.dataset.seg] = [th.offsetLeft, th.offsetWidth]; }); }
function placeSeg3() {
  document.querySelectorAll("#pickGrid .seg3").forEach(seg => {
    const th = seg.querySelector(".seg3-th"), on = seg.querySelector('[aria-checked="true"]');
    if (!th || !on || !on.offsetWidth) return; // hidden: the picked button keeps its own fill (CSS)
    const to = [on.offsetLeft, on.offsetWidth], from = seg3From[seg.dataset.seg];
    seg.classList.add("th"); // shown first, so its starting place is drawn and the move animates
    if (from) { th.style.transition = "none"; th.style.left = from[0] + "px"; th.style.width = from[1] + "px"; void th.offsetWidth; th.style.transition = ""; }
    th.style.left = to[0] + "px"; th.style.width = to[1] + "px";
  });
  seg3From = {};
}
function storeBaseline() { try { localStorage.setItem(LS + "-baseline", JSON.stringify(baseline)); } catch { /* storage unavailable */ } }
// with the search bar open, the back arrow closes search (like its cross), it doesn't leave the editor;
// this runs before any other handler of the arrow, the in-app one too
$("btnBack").addEventListener("click", e => { if (searching) { e.stopImmediatePropagation(); e.preventDefault(); $("qClose").click(); } }, true);
$("btnBack").onclick = () => {
  if (pendingRestart().length) return restartDialog();
  webLeave("Back to Morphe settings");
};
// Settings from other screens changed through the popup count as part of this screen for Reset.
const borrowed = {};
function borrowPopup(k, target) {
  const sec = SECTIONS.find(z => z.id === sectionOf(target)), p = PREF[target];
  const where = [p.screenTitle, p.subScreenTitle].filter(Boolean).join(" › ");
  openDialog(`<h2 id="dlgTitle">${esc(shownTitle(target))}</h2>
    <p class="dlgwhere">Lives on the <b>${esc(sec ? sec.title : "Miscellaneous")}</b> screen${where ? ` · in Morphe: ${esc(where)}` : ""}. “${esc(shownTitle(k))}” needs it.</p>
    <div class="dlglist">${rowHTML(target, false).replace('class="row', 'class="row inpop')}</div>
    <div class="acts"><button class="dbtn tonal" id="dDone">Done</button></div>`);
  const box = $("dlgBox");
  const after = () => {
    (borrowed[section] = borrowed[section] || new Set()).add(target);
    const r = box.querySelector(".dlglist"); if (r) r.innerHTML = rowHTML(target, false).replace('class="row', 'class="row inpop');
    commit();
    if (parentsOk(k)) setTimeout(() => { closeDialog(); const row = document.querySelector(`[data-row="${k}"]`); if (row) { scrollRowIntoView(k); unlockFx(row); } select(k); }, 350);
  };
  box.onclick = e => {
    if (e.target.id === "dDone") return closeDialog();
    const sw = e.target.closest("[data-sw]"), opt = e.target.closest("button.opt[data-set]");
    if (sw) { ensureMod(); state[target] = !state[target]; after(); }
    else if (opt) { ensureMod(); optSnap(opt); state[target] = coerce(target, opt.dataset.val); after(); optGlide(); }
  };
  box.onchange = e => { const t = e.target; if (!t.dataset || t.dataset.set !== target) return; ensureMod(); state[target] = t.type === "range" || t.type === "number" ? Number(t.value) : coerce(target, t.value); after(); };
}
// Reset sits next to search and asks whether to reset this preview's screen or every setting.
const changedKeys = keys => keys.filter(k => JSON.stringify(state[k]) !== JSON.stringify(defaults[k]));
const screenChanges = () => changedKeys([...new Set([...sectionKeys(), ...(borrowed[section] || [])])]);
const allChanges = () => changedKeys(Object.keys(PREF));
function doReset(keys, all, label) {
  if (!keys.length) return;
  const before = {}; keys.forEach(k => { before[k] = state[k]; state[k] = defaults[k]; });
  const lent = all ? { ...borrowed } : { [section]: borrowed[section] };
  if (all) Object.keys(borrowed).forEach(x => delete borrowed[x]); else delete borrowed[section];
  commit(); snack(`Reset ${keys.length} setting${keys.length > 1 ? "s" : ""} ${label}`, () => { Object.assign(state, before); Object.entries(lent).forEach(([x, v]) => { if (v) borrowed[x] = v; }); commit(); });
}
$("btnReset").onclick = () => {
  const scr = screenChanges(), all = allChanges(), name = SECTIONS.find(x => x.id === section)?.title || "this screen";
  if (!all.length) return snack("Nothing to reset: everything is at its default");
  const n = x => `${x} change${x === 1 ? "" : "s"}`;
  openDialog(`<h2 id="dlgTitle">Reset settings?</h2><p>Put settings back to Morphe's defaults.</p>
    <div class="choice"><button data-reset="screen" ${scr.length ? "" : "disabled"}><span>Only ${esc(name)}</span><small>${n(scr.length)}</small></button>
    <button data-reset="all"><span>Everything</span><small>${n(all.length)}</small></button></div>
    <div class="acts"><button class="dbtn tonal" id="dCancel">Cancel</button></div>`);
  $("dlgBox").onclick = e => {
    const b = e.target.closest("[data-reset]");
    if (e.target.id === "dCancel") return closeDialog();
    if (!b || b.disabled) return;
    closeDialog();
    if (b.dataset.reset === "all") doReset(allChanges(), true, "everywhere"); else doReset(screenChanges(), false, `on ${name}`);
  };
};
// hide the top bar while scrolling down, show it again on the way up
var progScrollUntil = 0;
// Tablets and desktops have room to spare, so there the bar always stays (phone portrait and
// landscape still hide it). Based on the app's own size, so the in-app WebView follows the device.
const barStays = () => { const a = $("app"); return a.clientWidth >= 600 && a.clientHeight >= 600; };
window.addEventListener("resize", () => { if (barStays()) $("app").classList.remove("barhidden"); });
// crossing the tablet size changes which settings Morphe offers or that do anything (offDevice): rebuild the lists then
{ let wasTab = null; window.addEventListener("resize", () => { const t = previewIsTablet(); if (wasTab !== null && t !== wasTab) { buildMembers(); renderBar(); renderList(); renderInspector(); } wasTab = t; }); }
// the editor sits one bar lower than the top (see .app > .editor): keep --abh at the bar's real height
{ const bar = document.querySelector(".appbar"); if (bar && window.ResizeObserver) new ResizeObserver(() => $("app").style.setProperty("--abh", bar.offsetHeight + "px")).observe(bar); }
{
  let lastY = 0, acc = 0, barMoveUntil = 0;
  $("scroller").addEventListener("scroll", () => {
    const sc = $("scroller"), y = sc.scrollTop, app = $("app"), d = y - lastY; lastY = y;
    if (app.classList.contains("searching") || pickerOpen || barStays()) { app.classList.remove("barhidden"); acc = 0; return; }
    // only your own scrolling moves the bar: jumps to a setting (and holds) leave it where it is
    if (performance.now() < progScrollUntil || press) { acc = 0; return; }
    // Showing or hiding the bar resizes the scroller. Near the end of the list that moves the scroll
    // position by itself, which used to read as scrolling the other way and flip the bar back: the
    // preview then bounced up and down on its own. Scrolls during the bar's own move are ignored,
    // and the bar only hides when the list has room to scroll past it.
    if (performance.now() < barMoveUntil) { acc = 0; return; }
    acc = Math.sign(d) === Math.sign(acc) ? acc + d : d;
    const bar = document.querySelector(".appbar"), hid = app.classList.contains("barhidden");
    if (bar && !hid) app.style.setProperty("--abh", bar.offsetHeight + "px");
    const room = sc.scrollHeight - sc.clientHeight - y, abh = bar ? bar.offsetHeight : 56;
    let want = hid;
    if (y < 8) want = false;
    else if (acc > 24 && room > abh + 24) want = true;
    else if (acc < -24) want = false;
    if (want !== hid) { app.classList.toggle("barhidden", want); acc = 0; barMoveUntil = performance.now() + 320; }
  }, { passive: true });
}
$("dlg").addEventListener("click", e => { if (e.target.id === "dlg") closeDialog(); });
