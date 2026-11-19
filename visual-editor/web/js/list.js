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
  const gpick = (x, i) => { const n = tabsOf(x).reduce((a, [t]) => a + MEMBERS[t].live.length + MEMBERS[t].misc.length, 0); // a group card: its name on a tab at the top left, its icon at the top right, one line per tab,
    // and the number of settings on a tab at the bottom left
    return `<button class="pick gcard" role="menuitem" data-group="${x.id}" aria-current="${x === g}" style="transition-delay:${i * 12}ms"><span class="gc-h"><span class="gc-t">${esc(x.title)}${devMarkGroup(x)}</span><span class="pi">${I(x.icon)}</span></span><span class="gc-tabs">${tabsOf(x).map(([, t]) => `<span>${esc(t)}</span>`).join("")}</span><span class="gc-n">${n} settings</span></button>`; };
  $("pickGrid").innerHTML = (grouped ? `<div class="pg pvis pgroups">${GROUPS.map(gpick).join("")}</div>` : `<div class="pg pvis">${vis.map(pick).join("")}</div>` + `<div class="plaincard"><div class="ph">${I("list")}No preview · standard settings</div><div class="pg">${plain.map(pick).join("")}</div></div>`)
    + `<div class="themerow"><div class="themetog" data-theme-toggle role="menuitemcheckbox" aria-checked="${theme === "m3"}"><span class="pi">${I("palette")}</span><div class="tt">Morphe design</div><span class="sw" role="presentation" aria-checked="${theme === "m3"}"></span></div>`
    + `<button class="ordreset" data-order-reset ${customOrder ? "" : "disabled"} title="Hold a screen to move it. This restores Morphe's order.">${I("reset")}Reset order</button></div>`
    + `<div class="themerow simrow"><div class="themetog" data-group-toggle role="menuitemcheckbox" aria-checked="${grouped}"><span class="pi">${I("layers")}</span><div class="tt">Group screens into tabs<small>Six screens instead of ${SECTIONS.length}. Each one has tabs right under the live preview, and every tab brings its own preview.</small></div><span class="sw" role="presentation" aria-checked="${grouped}"></span></div></div>`
    + `<div class="themerow designrow"><div class="dcol"><div class="dsg"><span class="pi">${I("list")}</span><div class="tt">Settings list design</div></div><div class="seg3" role="radiogroup" aria-label="Settings list design">${[["classic", "Morphe"], ["toggles", "Switches"], ["clean", "Clean"]].map(([id, t]) => `<button role="radio" data-design="${id}" aria-checked="${design === id}">${t}</button>`).join("")}</div></div><button class="offnew" data-editor-off>${I("power")}Disable new design</button></div>`;
  $("btnReset").disabled = mode !== "mod" || !Object.keys(PREF).some(k => JSON.stringify(state[k]) !== JSON.stringify(defaults[k]));
}
// ---- DEV ONLY: "finished" checkmarks -------------------------------------------------------------
// Screens Max has signed off ("lock it"). Shown as a small check in the screen menu and on the tabs.
// To remove before shipping: delete this block, the .devdone CSS rule, and the three devMark /
// devMarkGroup calls (screen menu card, group card, tab).
const DEV_DONE = new Set(["player", "seekbar", "fullscreen", "flyout"]); // section ids, e.g. "player"
// settings Max approved without a preview: a tab id approves all of its settings that have none, a key one setting
const NO_PREVIEW_OK = new Set(["fullscreen", "player", "morphe_custom_seekbar_thumb_file", "morphe_swipe_seek_sensitivity"]);
const devMark = id => DEV_DONE.has(id) ? `<span class="devdone" title="Finished (development marker)">✓</span>` : "";
const devMarkGroup = g => tabsOf(g).length && tabsOf(g).every(([id]) => DEV_DONE.has(id)) ? devMark(tabsOf(g)[0][0]) : "";
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
  const mine = new Set(sectionKeys()), ours = e => mine.has(e.dataset.k) || mine.has(e.dataset.also);
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
function hugComponents(root) {
  root.querySelectorAll(".c").forEach(c => {
    if (c.children.length !== 1 || c.childNodes.length > 1 && [...c.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return;
    const ch = c.firstElementChild, cs = ch.style;
    if (!MARGINS.some(m => cs[m]) || c.style.padding || c.style.background) return;
    const own = getComputedStyle(ch);
    MARGINS.forEach(m => { if (own[m] && own[m] !== "0px" && own[m] !== "auto") { c.style[m] = own[m]; ch.style[m] = "0px"; } });
    if (own.borderTopLeftRadius !== "0px") c.style.borderRadius = own.borderTopLeftRadius;
  });
  // a left-aligned card narrower than its block wrapper: shrink the wrapper to the card
  root.querySelectorAll(".c.blk, div.c").forEach(hugWidth);
}
function hugWidth(c) {
  {
    if (c.children.length !== 1 || c.style.width) return;
    const r = c.getBoundingClientRect(), q = c.firstElementChild.getBoundingClientRect();
    if (!r.width || q.width > r.width - 6 || Math.abs(q.left - r.left) > 1) return;
    const cs = getComputedStyle(c); if (cs.display !== "block" || getComputedStyle(c.parentElement).display.includes("flex")) return;
    c.style.width = "fit-content";
  }
}

function stateChip(k) {
  const a = A[k], p = PREF[k], v = V(k);
  if (p.type === "boolean") {
    if (a && (a.kind === "vis" || a.kind === "overlay")) return shown(k) ? `<span class="state on">Shown</span>` : `<span class="state off">Hidden</span>`;
    return v ? `<span class="state on">On</span>` : `<span class="state">Off</span>`;
  }
  return "";
}
function summaryFor(k) { const p = PREF[k]; const v = V(k); if (p.type === "boolean") return (v ? p.summaryOn : p.summaryOff) || p.summary || ""; return p.summary || ""; }
const RANGES = { font_size: [8, 48], travel_duration: [2, 15], width_dip: [100, 400], caption_scale: [50, 300], corner_radius: [0, 24], blur: [0, 100], smoothing: [0, 100], dim_duration: [0, 10] };
const sameVal = (a, b) => String(a) === String(b) || (a !== "" && b !== "" && a != null && b != null && !isNaN(a) && !isNaN(b) && Number(a) === Number(b));
function controlFor(k) {
  const p = PREF[k]; const v = V(k); const dis = !parentsOk(k) ? "disabled" : "";
  const ents = entriesFor(k).filter(e => !(OFF_LIST.has(k) && e.value === "off"));
  if (OFF_LIST.has(k) && String(v) === "off") return "";
  // up to 8 choices: a row of pills; 9 to 16 (icon styles, theme colours, qualities): a 3-column grid
  // of pills built from the same entries, so it follows whatever list Morphe ships; more: a dropdown
  if (ents.length && ents.length <= 16) return `<div class="ctl optgrid">${ents.map(e => `<button class="opt" data-set="${k}" data-val="${esc(e.value)}" aria-pressed="${sameVal(e.value, v)}" ${dis}>${esc(e.label)}</button>`).join("")}</div>`;
  if (ents.length) return `<div class="ctl"><select data-set="${k}" ${dis} aria-label="${esc(title(k))}">${ents.map(e => `<option value="${esc(e.value)}" ${sameVal(e.value, v) ? "selected" : ""}>${esc(e.label)}</option>`).join("")}</select></div>`;
  if (p.type === "integer" || p.type === "float" || p.type === "long") {
    const r = Object.entries(RANGES).find(([n]) => k.includes(n));
    if (r || /opacity|scale|strength|display_area/.test(k)) {
      const [min, max] = r ? r[1] : [0, 100];
      return `<div class="ctl"><input type="range" min="${min}" max="${max}" step="1" value="${v}" data-set="${k}" ${dis} aria-label="${esc(title(k))}"><span class="val" data-val-of="${k}">${v}</span></div>`;
    }
    return `<div class="ctl side"><input type="number" value="${v}" data-set="${k}" ${dis} aria-label="${esc(title(k))}" step="${p.type === "float" ? "0.05" : "1"}"></div>`;
  }
  if (p.type === "string") {
    // Morphe opens the system file picker for these; the preview does the same and draws the image
    if (p.widget === "NonInteractivePreference" && /_file$/.test(k)) return `<div class="ctl"><label class="opt filepick" ${dis ? 'aria-disabled="true"' : ""}>${I("image")}${v ? "Change image" : "Choose image"}<input type="file" accept="image/*" data-file="${k}" ${dis} hidden></label>${v ? `<span class="val">${esc(v)}</span>` : ""}</div>`;
    if (/color/.test(k) && /^#/.test(String(v))) return `<div class="ctl side"><input type="color" value="#${String(v).slice(-6)}" data-set="${k}" ${dis} aria-label="${esc(title(k))}"><span class="val">${esc(v)}</span></div>`;
    if (isListBox(k)) return listBox(k, dis);
    return `<div class="ctl"><input type="text" value="${esc(v)}" data-set="${k}" ${dis} aria-label="${esc(title(k))}"></div>`;
  }
  return "";
}
// Settings that hold a list as text, one entry per line (speeds, filter words, channel whitelists):
// one shared editor for all of them. Each entry is a chip with a remove button, and a field at the end
// adds one (Enter or +). It reads and writes exactly Morphe's format, the entries joined by new lines,
// so Morphe parses what it always did.
const isListBox = k => PREF[k].type === "string" && (String(PREF[k].default ?? "").includes("\n") || /strings|phrases|speeds|whitelist|filter/.test(k));
const listNumeric = k => /speeds/.test(k);
function listItems(k, from = V(k)) {
  const v = String(from ?? "");
  // older or hand-typed values may use spaces or commas; Morphe's own default is one per line
  const parts = v.includes("\n") || !listNumeric(k) ? v.split("\n") : v.split(/[\s,]+/);
  return parts.map(x => x.trim()).filter(Boolean);
}
function listBox(k, dis) {
  const items = listItems(k), num = listNumeric(k);
  return `<div class="ctl lst" data-lst="${k}">${items.map((t, i) => `<span class="lchip">${esc(t)}${num ? "×" : ""}<button class="lx" data-lx="${i}" ${dis} aria-label="Remove ${esc(t)}">${I("close")}</button></span>`).join("")}
    <span class="ladd"><input class="lin" data-lin="${k}" ${dis} placeholder="${num ? "Add speed" : "Add entry"}" ${num ? 'inputmode="decimal"' : ""} aria-label="Add to ${esc(title(k))}"><button class="lplus" data-ladd="${k}" ${dis} aria-label="Add">${I("plus")}</button></span></div>`;
}
// returns an error to show, or null once the entry is added
function listAdd(k, raw) {
  const t = String(raw).trim(); if (!t) return null;
  const items = listItems(k);
  if (listNumeric(k)) { const n = Number(t.replace(",", ".")); if (!(n > 0 && n <= 8)) return "Enter a speed between 0.05 and 8"; if (items.some(x => Number(x) === n)) return "Already in the list"; items.push(String(n).includes(".") ? String(n) : n.toFixed(1)); if (!/cycle/.test(k)) items.sort((a, b) => a - b); } // a cycle keeps its order: it is the order taps go through
  else { if (items.includes(t)) return "Already in the list"; items.push(t); }
  listSet(k, items); return null;
}
function listSet(k, items) { ensureMod(); touchSel(k); const before = state[k]; state[k] = items.join("\n"); afterChange(k, before); requestAnimationFrame(() => document.querySelector(`[data-lin="${k}"]`)?.focus({ preventScroll: true })); }
const whereOf = x => { const s = sectionOf(x); return s !== section ? ` (${esc(SECTIONS.find(z => z.id === s)?.title || "Miscellaneous")})` : ""; };
function shortNeed(k) {
  if (!classicParentsOk(k)) return PREF[k].parents.some(x => x.mode === "not" && !!state[x.key]) ? "Parent setting must be disabled" : "Parent setting must be enabled";
  return /S\("/.test(String(PREF[k].availability || "")) ? "Parent setting must be enabled" : "Not available with the current settings";
}
function needText(k) {
  if (!classicParentsOk(k)) return "Needs " + PREF[k].parents.map(x => `“${esc(title(x.key))}” ${x.mode === "not" ? "off" : "on"}${whereOf(x.key)}`).join(", ");
  const av = String(PREF[k].availability || ""), sk = [...new Set([...av.matchAll(/S\("([^"]+)"\)/g)].map(m => m[1]))].filter(x => PREF[x] && inVersion(x));
  if (sk.length > 1 && av.includes("||")) return `Available once any of these is on: ${sk.map(x => `“${esc(title(x))}”${whereOf(x)}`).join(", ")}`;
  const ap = (PREF[k].availabilityParents || []).filter(x => PREF[x]);
  return ap.length ? `Not available with the current ${ap.map(x => `“${esc(title(x))}”`).join(", ")}` : "Not available here";
}
// The setting to visit so that k becomes available.
function blockerOf(k) {
  const p = PREF[k];
  if (!classicParentsOk(k)) return (p.parents.find(x => x.mode === "not" ? !!state[x.key] : !state[x.key]) || p.parents[0]).key;
  const cands = availKeys(k).filter(x => PREF[x] && inVersion(x));
  // prefer a setting on this screen (e.g. a DeArrow title place) over one on another screen
  return cands.find(x => sectionOf(x) === section) || cands[0] || null;
}
const availKeys = k => [...new Set([...(PREF[k].availabilityParents || []), ...[...String(PREF[k].availability || "").matchAll(/S\("([^"]+)"\)/g)].map(m => m[1])])].filter(x => x !== k);
const dependsOn = (k, parent) => PREF[k].parents.some(x => x.key === parent) || availKeys(k).includes(parent);
// The setting on another screen that k was unlocked through (via the popup): k then offers "More" to reach it again.
const borrowedParent = k => [...PREF[k].parents.map(x => x.key), ...availKeys(k)].find(x => borrowed[section] && borrowed[section].has(x) && sectionOf(x) !== section);

function rowHTML(k, live) {
  const p = PREF[k]; const a = A[k];
  const dis = !parentsOk(k);
  const isBool = p.type === "boolean";
  const info = !p.type || p.type === "screen" || p.widget === "NonInteractivePreference" || p.widget === "IntentPreference";
  let right = "", ctl = "";
  const swHTML = () => `<button class="sw" role="switch" data-sw="${k}" aria-checked="${!!V(k)}" aria-label="${esc(title(k))}"></button>`;
  if (OFF_LIST.has(k)) { right = `<button class="sw" role="switch" data-sw="${k}" aria-checked="${String(V(k)) !== "off"}" aria-label="${esc(title(k))}"></button>`; ctl = controlFor(k); }
  else if (isBool && design === "clean" && cleanOf(k)) right = toggleHTML(k);
  else if (isBool && design === "toggles") right = swHTML();
  else if (live && a.kind !== "scenario") { right = stateChip(k); if (!isBool) ctl = controlFor(k); }
  else if (isBool) right = swHTML();
  else if (!info || (p.widget === "NonInteractivePreference" && /_file$/.test(k))) ctl = controlFor(k);
  // A list setting (speeds, filter words): the chips are the control, so nothing sits on the right and
  // they get the card's full width. Its Reset is a small pill beside the title, greyed out like the
  // screen's Reset until the list differs from Morphe's own (it asks before restoring).
  let lreset = "";
  if (!info && isListBox(k)) { const same = String(V(k) ?? "") === String(defaults[k] ?? ""); right = ""; lreset = `<button class="resetbtn lreset" data-lreset="${k}" ${same || dis ? "disabled" : ""} title="Restore the default list" aria-label="Restore the default list">${I("reset")}Reset</button>`; }
  const cls = ["row", live ? "live" : "fallback"];
  if (selected === k) cls.push("sel");
  if (dis) cls.push("dis");
  if (PARENT_OF[k]) { if (k === peekKid) cls.push("peek"); else if (!kidVisible(k)) cls.push("hide"); }
  if (live && (a.kind === "vis" || a.kind === "overlay") && !shown(k)) cls.push("offstate");
  const sum = info ? (p.summary || (p.type === "screen" ? "Opens a sub-screen in Morphe settings" : "Information")) : summaryFor(k);
  const blk = dis ? blockerOf(k) : null;
  const bp = dis ? null : borrowedParent(k);
  const goto = blk ? `<button class="goto" data-goto="${k}">${sectionOf(blk) !== section ? "Change it here" : "Take me there"} ${I("arrow")}</button>`
    : bp ? `<button class="goto more" data-more="${k}" data-target="${bp}" title="${esc(title(bp))}">More ${I("arrow")}</button>` : "";
  // locked: a short line beside "Take me there" (the full reason is its tooltip), so the card keeps
  // the height of an unlocked one
  const need = dis ? `<div class="need3" title="${esc(needText(k).replace(/<[^>]*>/g, ""))}">${shortNeed(k)}</div>` : "";
  const tags = "";
  const kids = KIDS[k] ? KIDS[k].filter(x => kidVisible(x) || x === peekKid).length : 0;
  const kidbtn = kids ? `<button class="kidbtn" data-kidtoggle="${k}" aria-expanded="${!collapsed.has(k)}" aria-label="${kids} sub-options">${kids}${I("expand")}</button>`
    : KIDS[k] ? `<span class="kidbtn kidoff" title="Sub-settings hidden while this is off" aria-label="${KIDS[k].length} sub-settings, hidden">${KIDS[k].length}${I("lock")}</span>` : ""; // same footprint as the open/close button, so the card never changes width
  const over = /^(hide|show) in /i.test(title(k)) && p.subScreenTitle ? `<div class="over">${esc(p.subScreenTitle)}</div>` : "";
  return `<div class="${cls.join(" ")}" data-row="${k}" data-k="${k}" tabindex="0">
    <div class="txt">${over}${lreset ? '<div class="ttlrow">' : ""}<div class="ttl">${ttlHTML(shownTitle(k), (dis ? I("lock", "lk") : "") + tags + kidbtn)}</div>${lreset ? lreset + "</div>" : ""}
      ${sum ? `<div class="sum">${esc(sum)}</div>` : ""}${ctl}</div>${right || goto || need ? `<div class="side">${right}${need}${goto}</div>` : ""}</div>`;
}
// The last word of a title and the badges after it never wrap apart, so a sub-options pill can't end up alone on a line.
function ttlHTML(t, after) { if (!after) return esc(t); const i = t.lastIndexOf(" "); return `${esc(t.slice(0, i + 1))}<span class="nw">${esc(t.slice(i + 1))}${after}</span>`; }
const groupHTML = (name, icon, keys, live) => keys.length ? `<div class="gtitle">${I(icon)}${name} · ${keys.length}</div><div class="group">${keys.map(k => rowHTML(k, live)).join("")}</div>` : "";

// Rows follow the order their components appear in the preview, top to bottom, left to right
// (doodle and top bar first). Settings without a component (scenarios) keep their order after them.
// Measured once per screen with every hidden component drawn, so toggling never reshuffles the list.
let posCache = { sec: null, pos: {} };
const LAYOUT = {
  fullscreen: [
    ["On the player", ["hide_video_title", "hide_player_related_videos_overlay", "hide_quick_actions", "fullscreen_video_scale"]],
    ["Swipe zones", ["swipe_left_zone", "swipe_right_zone", "swipe_top_zone", "swipe_zone_preview", "swipe_zone_width"]],
    ["Shared by every swipe zone", ["swipe_overlay_style", "swipe_overlay_background_opacity", "swipe_overlay_progress_brightness_color", "swipe_overlay_progress_volume_color", "swipe_overlay_progress_speed_color", "swipe_text_overlay_size", "swipe_haptic_feedback", "swipe_press_to_engage", "volume_boost", "swipe_ignore_when_locked", "swipe_lowest_value_enable_auto_brightness", "swipe_save_and_restore_brightness"]],
    ["Swipe to seek", ["swipe_seek"]],
    ["Entering and leaving fullscreen", ["disable_fullscreen_dragged_down_gesture", "disable_fullscreen_pulled_up_gesture", "disable_fullscreen_sliding_down_gesture"]],
    ["Pinch to zoom", ["disable_fullscreen_zoom_gesture", "restore_pinch_to_zoom"]],
  ],
};
function stagePositions() {
  const st = $("stage");
  if (posCache.sec === section || st.dataset.sec !== section) return posCache.pos;
  const pos = {}, sr = st.getBoundingClientRect();
  st.classList.add("measure");
  st.querySelectorAll("[data-k], [data-also]").forEach(e => {
    const k = e.dataset.k || e.dataset.also, r = e.getBoundingClientRect(); if (!r.width && !r.height) return;
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
let peekKid = null, lastOpen = new Set(), lastDis = { sec: null, keys: new Set() };
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
      const any = ks.some(x => kidVisible(x) || x === peekKid);
      if (any && (!collapsed.has(k) || ks.includes(peekKid))) wantOpen.add(k);
      // parent and its sub-options travel as one unit, so in two columns they stay in the same column
      out = `<div class="unit">${out}<div class="kids ${lastOpen.has(k) ? "open" : ""}" data-kids-of="${k}"><div class="kin">${byPosition(ks).map(x => rowHTML(x, isLive(x))).join("")}</div></div></div>`;
    }
    return out;
  };
  if (section !== "misc") {
    const top = m.live.filter(k => !PARENT_OF[k]);
    // in the clean design a setting whose title can't be converted keeps Morphe's look, at the end
    const ordered0 = byPosition(top), ordered = [...ordered0.filter(k => !cleanBroken(k)), ...ordered0.filter(cleanBroken)];
    const rest = m.misc.filter(k => !PARENT_OF[k]);
    let live = "";
    const lay = LAYOUT[section];
    if (lay) {
      // screens with a lot of related settings get small captions so it is clear what belongs together
      const used = new Set(), caps = lay.map(([cap, ks]) => [cap, ks.map(x => "morphe_" + x).filter(x => ordered.includes(x))]);
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
    const fresh = kin.innerHTML; kin.innerHTML = old;
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
      if (wantOpen.has(grp) && lastOpen.has(grp) && oldKidRows.has(k)) { const t = document.createElement("div"); t.innerHTML = oldKidRows.get(k); const o = t.firstElementChild; o.classList.remove("sel", "attn", "nudge", "unlock"); r.replaceWith(o); r = o; }
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
  if (lastDis.sec === section) lastDis.keys.forEach(k => { if (!dis.has(k)) { const r = list.querySelector(`[data-row="${k}"]`); if (r && !r.classList.contains("hide")) unlockFx(r); } });
  lastDis = { sec: section, keys: dis };
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
function fitPills(box, pills, textOf, chrome) {
  const W = box.clientWidth; if (!W || !pills.length) return;
  const cs = getComputedStyle(pills[0]), gap = parseFloat(getComputedStyle(box).columnGap) || 6;
  optCtx = optCtx || document.createElement("canvas").getContext("2d"); optCtx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  const need = Math.ceil(Math.max(...pills.map(o => optCtx.measureText(textOf(o)).width)) + chrome);
  const maxCols = Math.max(1, Math.floor((W + gap) / (need + gap)));
  const n = pills.length, rows = Math.ceil(n / Math.min(n, maxCols)), cols = Math.ceil(n / rows);
  const even = (W - gap * (cols - 1)) / cols;
  box.style.gridTemplateColumns = even <= need * 1.5 ? `repeat(${cols}, minmax(0, 1fr))` : `repeat(${cols}, minmax(0, ${need}px))`;
}
function fitOpts(root = $("list")) {
  root.querySelectorAll(".ctl.optgrid").forEach(box => fitPills(box, [...box.querySelectorAll(".opt")], o => o.textContent, 2 * OPT_PAD + 2));
  // list chips (speeds, words): text, then the remove button; the add field takes its own line
  root.querySelectorAll(".ctl.lst").forEach(box => fitPills(box, [...box.querySelectorAll(".lchip")], o => o.firstChild ? o.firstChild.textContent : "", LCHIP_CHROME));
}
const OPT_PAD = 6; // the least room beside a pill's text
const LCHIP_CHROME = 11 + 2 + 26 + 2 + 8; // left padding, gap, remove button, right padding, breathing room
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
function unlockFx(row) {
  row.classList.remove("unlock"); void row.offsetWidth; row.classList.add("unlock");
  row.querySelectorAll(".ulk").forEach(e => e.remove());
  const u = document.createElement("div"); u.className = "ulk";
  u.innerHTML = `<svg viewBox="0 0 24 24"><path class="sh" d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0" fill="none" stroke="var(--m-success)" stroke-width="2.2" stroke-linecap="round"/><rect x="6" y="10.5" width="12" height="9.5" rx="2.2"/></svg>`;
  // it pops up right on the card's control (the middle of a Hide / Show toggle, a switch, a box)
  const ctl = row.querySelector(".side .lt7, .side .sw, .side .state, .ctl.side, .side > *");
  if (ctl) { const rr = row.getBoundingClientRect(), cr = ctl.getBoundingClientRect(); Object.assign(u.style, { left: (cr.left - rr.left + cr.width / 2) + "px", top: (cr.top - rr.top + cr.height / 2) + "px", right: "auto", margin: "-20px 0 0 -20px" }); }
  row.appendChild(u); setTimeout(() => { u.remove(); row.classList.remove("unlock"); }, 950);
}

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
  const all = CAT.preferences.filter(p => inVersion(p.key));
  if (!q) { $("list").innerHTML = `<div class="shint">Type to search all ${all.length} settings.</div>`; return; }
  const words = q.split(/\s+/).filter(Boolean);
  const hits = [];
  for (const p of all) {
    const sec = SECTIONS.find(s => s.id === sectionOf(p.key));
    const hay = `${title(p.key)} ${p.summary || ""} ${p.summaryOn || ""} ${p.summaryOff || ""} ${p.subScreenTitle || ""} ${placeLabel(sectionOf(p.key))} ${p.key}`.toLowerCase();
    if (!words.every(w => hay.includes(w))) continue;
    const t = title(p.key).toLowerCase();
    hits.push({ p, sec, score: (t.startsWith(q) ? 0 : t.includes(q) ? 1 : 2) });
  }
  hits.sort((a, b) => a.score - b.score || SECTIONS.indexOf(a.sec) - SECTIONS.indexOf(b.sec));
  const mark = t => { let h = esc(t); for (const w of words) h = h.replace(new RegExp(`(${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig"), "<mark>$1</mark>"); return h; };
  $("list").innerHTML = hits.length
    ? `<div class="sechead">${hits.length} result${hits.length > 1 ? "s" : ""}</div><div class="group">${hits.slice(0, 120).map(({ p, sec }) => {
        const par = PARENT_OF[p.key];
        const where = p.type === "screen" ? `Screen · ${placeLabel(sectionOf(p.key))}` : `${placeLabel(sectionOf(p.key))}${par ? ` › ${title(par)}` : ""}`;
        return `<div class="sres" data-res="${p.key}" tabindex="0"><div class="ttl">${mark(title(p.key))}</div><div class="where">${esc(where)}</div>${summaryFor(p.key) ? `<div class="sum">${esc(summaryFor(p.key))}</div>` : ""}</div>`;
      }).join("")}</div>`
    : `<div class="shint">No settings match “${esc(query)}”.</div>`;
}
$("btnSearch").onclick = () => setSearch(true);
$("qClose").onclick = () => { query = ""; setSearch(false); };
$("q").addEventListener("input", e => { query = e.target.value; renderSearch(); });
$("q").addEventListener("keydown", e => { if (e.key === "Escape") { query = ""; setSearch(false); } if (e.key === "Enter") { const f = $("list").querySelector("[data-res]"); if (f) openResult(f.dataset.res); } });
function openResult(k) { setSearch(false); returnTo = null; goToSetting(k); }

function renderInspector() {
  const k = selected, p = k && PREF[k];
  if (!p) $("selCard").innerHTML = `<h2>Selected</h2><p>Nothing selected. Tap a component in the preview or a row in the list.</p>`;
  else {
    const a = A[k];
    const src = p.sourceFile ? `<a href="https://github.com/MorpheApp/morphe-patches/blob/main/${esc(p.sourceFile)}" target="_blank" rel="noopener">${esc(p.sourceFile.split("/").pop())}</a>` : "–";
    $("selCard").innerHTML = `<h2>Selected</h2><h3>${esc(title(k))}</h3><p>${esc(p.summary || summaryFor(k) || "")}</p>
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
  const kindOf = k => A[k] ? (isAnimated(k) ? "anim" : "shown") : NO_PREVIEW_OK.has(k) ? "ok" : lights(k) ? "shown" : okNone(k) ? "ok" : "none";
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
      <div class="covmiss">${c.none || c.ok ? keys.filter(k => /none|ok/.test(kindOf(k))).map(k => `<div>${esc(title(k))}${kindOf(k) === "ok" ? " <i>(approved)</i>" : ""}</div>`).join("") : "Every setting here has a preview."}</div></details>`).join("")}</div>
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
function openDialog(html) { $("dlgBox").innerHTML = html; $("dlg").classList.add("open"); setTimeout(() => $("dlgBox").querySelector("button")?.focus(), 50); }
function closeDialog() { $("dlg").classList.remove("open"); }
function restartDialog() {
  const keys = pendingRestart();
  openDialog(`<div class="di">${I("restart")}</div><h2 id="dlgTitle">Restart to apply</h2>
    <p>${keys.length} setting${keys.length > 1 ? "s" : ""} only take${keys.length > 1 ? "" : "s"} effect after YouTube restarts.</p>
    <ul>${keys.map(k => `<li>${esc(title(k))}</li>`).join("")}</ul>
    <div class="acts"><button class="dbtn primary" id="dRestart">Restart now</button><button class="dbtn tonal" id="dStay">Keep editing</button></div>`);
  $("dRestart").onclick = () => { closeDialog(); $("restarting").classList.add("on"); setTimeout(() => { baseline = { ...state }; storeBaseline(); renderBar(); $("restarting").classList.remove("on"); snack("YouTube restarted. All changes are applied."); }, 1400); };
  $("dStay").onclick = closeDialog;
}
function storeBaseline() { try { localStorage.setItem(LS + "-baseline", JSON.stringify(baseline)); } catch { /* storage unavailable */ } }
// with the search bar open, the back arrow closes search (like its cross), it doesn't leave the editor;
// this runs before any other handler of the arrow, the in-app one too
$("btnBack").addEventListener("click", e => { if (searching) { e.stopImmediatePropagation(); e.preventDefault(); $("qClose").click(); } }, true);
$("btnBack").onclick = () => {
  if (pendingRestart().length) return restartDialog();
  const app = $("app"); app.classList.remove("exitflash"); void app.offsetWidth; app.classList.add("exitflash");
  setTimeout(() => snack("Back to Morphe settings (demo: the editor reopens)"), 350);
};
// Settings from other screens changed through the popup count as part of this screen for Reset.
const borrowed = {};
function borrowPopup(k, target) {
  const sec = SECTIONS.find(z => z.id === sectionOf(target)), p = PREF[target];
  const where = [p.screenTitle, p.subScreenTitle].filter(Boolean).join(" › ");
  openDialog(`<h2 id="dlgTitle">${esc(title(target))}</h2>
    <p class="dlgwhere">Lives on the <b>${esc(sec ? sec.title : "Miscellaneous")}</b> screen${where ? ` · in Morphe: ${esc(where)}` : ""}. “${esc(title(k))}” needs it.</p>
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
    else if (opt) { ensureMod(); state[target] = coerce(target, opt.dataset.val); after(); }
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
