"use strict";
// Pointer handling (tap, hold, drag), list controls, tabs and the menus.

// press handling (tap vs hold), shared by stage and list
let press = null;
const LONG = 480;
// Mouse drag scrolls the preview's feeds and strips, like a finger would on the phone.
let drag = null;
function scrollTargets(t) {
  const out = []; const stage = $("stage");
  for (let p = t; p && p !== stage && p.nodeType === 1; p = p.parentElement) {
    const cs = getComputedStyle(p);
    if (!p.classList.contains("inner-scroll") && p.scrollWidth > p.clientWidth + 1 && /auto|scroll/.test(cs.overflowX)) out.push([p, "x"]);
    if (p.scrollHeight > p.clientHeight + 1 && /auto|scroll/.test(cs.overflowY)) out.push([p, "y"]);
  }
  return out;
}
function down(e) {
  if (e.button > 0) return;
  if (e.pointerType === "mouse" && e.target.closest("#stage")) drag = { x: e.clientX, y: e.clientY, t: e.target, on: false };
  // tapping a switch flips it straight away (the row itself keeps tap = select, hold = switch)
  if (e.target.closest(".sw,.lt7")) return;
  if (e.target.closest("input,select,textarea,button.opt,.filepick,.goto,.kidbtn,.replay,[data-tray]")) return;
  const el = e.target.closest("[data-k]"); if (!el) return;
  const k = el.dataset.k; const from = el.closest("#stage") ? "stage" : "list";
  // holding only does something for settings it can switch (on/off, or a short list it can step
  // through); for a slider, colour or text field the hold ring would charge up to nothing
  if (!canToggle(k)) { press = { el, k, from, x: e.clientX, y: e.clientY, long: false }; return; }
  el.classList.add("pressing");
  if (from === "stage" && el.classList.contains("off")) { (ghostTimers.get(k) || []).forEach(clearTimeout); ghostTimers.delete(k); el.classList.remove("ghost-out"); el.classList.add("charging"); }
  press = { el, k, from, x: e.clientX, y: e.clientY, long: false };
  // holding a preview element brings its setting into view while the hold is still charging
  if (from === "stage") press.peek = setTimeout(() => { if (!press || press.k !== k) return; document.querySelectorAll(".row.sel").forEach(r => r.classList.remove("sel")); document.querySelector(`[data-row="${k}"]`)?.classList.add("sel"); const o = openFor(k); setTimeout(() => scrollRowIntoView(k, true), o ? 300 : 0); }, 160);
  press.t = setTimeout(() => { if (!press) return; press.long = true; el.classList.remove("pressing"); touchSel(k); toggle(k); if (from === "stage") setTimeout(() => scrollRowIntoView(k, true), 30); }, LONG);
}
function cancelPress() { if (press) { clearTimeout(press.t); clearTimeout(press.peek); press.el.classList.remove("pressing", "charging"); press = null; } }
function move(e) {
  if (press && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 10) cancelPress();
  if (!drag || !(e.buttons & 1)) { drag = null; return; }
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
  if (!drag.on && Math.hypot(dx, dy) < 8) return;
  if (!drag.on) { drag.on = true; const ts = scrollTargets(drag.t); drag.box = (ts.find(([, ax]) => ax === (Math.abs(dx) > Math.abs(dy) ? "x" : "y")) || ts[0] || [null])[0]; $("stage").classList.add("dragging"); }
  if (drag.box) { drag.box.scrollLeft -= dx; drag.box.scrollTop -= dy; }
  drag.x = e.clientX; drag.y = e.clientY;
}
document.addEventListener("pointerup", () => { if (drag) { drag = null; $("stage").classList.remove("dragging"); } });
function up() {
  if (!press) return;
  clearTimeout(press.t); clearTimeout(press.peek); press.el.classList.remove("pressing", "charging");
  const { k, from, long } = press; press = null;
  if (long) return;
  const a = A[k];
  if (mode === "mod" && a && (a.kind === "vis" || a.kind === "overlay") && !shown(k)) {
    if (from === "stage") ghost(k, false);
    select(k, from);
    if (from !== "stage" && document.querySelector(`#stage [data-k="${k}"]`)) ghost(k);
  } else select(k, from);
}
$("list").addEventListener("change", e => {
  const inp = e.target.closest("input[data-file]"); if (!inp || !inp.files || !inp.files[0]) return;
  const k = inp.dataset.file, file = inp.files[0];
  if (pickedFiles[k]) URL.revokeObjectURL(pickedFiles[k]);
  pickedFiles[k] = URL.createObjectURL(file);
  const before = state[k]; state[k] = file.name; afterChange(k, before);
});
["stage", "list"].forEach(id => {
  const el = $(id);
  el.addEventListener("pointerdown", down); el.addEventListener("pointermove", move);
  el.addEventListener("pointerup", up); el.addEventListener("pointercancel", cancelPress);
  el.addEventListener("pointerleave", e => { if (e.target === el) cancelPress(); });
  el.addEventListener("contextmenu", e => { if (e.target.closest("[data-k]")) e.preventDefault(); });
});
$("stage").addEventListener("click", e => {
  if (e.target.closest("[data-tray]")) { trayOpen = !trayOpen; renderStage(); if (selected) highlight(selected); return; }
  if (trayOpen && !e.target.closest(".tray") && !e.target.closest("[data-k]")) { trayOpen = false; renderStage(); if (selected) highlight(selected); }
});
// mouse wheel scrolls horizontal strips (action bars, chips)
$("app").addEventListener("wheel", e => {
  if (!e.target.closest("#stage") || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
  const ts = scrollTargets(e.target);
  const y = ts.find(([b, ax]) => ax === "y" && (e.deltaY > 0 ? b.scrollTop + b.clientHeight < b.scrollHeight - 1 : b.scrollTop > 0));
  if (y) return; // native vertical scroll
  const x = ts.find(([, ax]) => ax === "x");
  if (x) { x[0].scrollLeft += e.deltaY; e.preventDefault(); }
}, { passive: false });
$("list").addEventListener("keydown", e => {
  const row = e.target.closest("[data-row]"); if (!row || e.target !== row) return;
  if (e.key === "Enter") { select(row.dataset.row, "list"); e.preventDefault(); }
  if (e.key === " ") { toggle(row.dataset.row); e.preventDefault(); }
});
$("list").addEventListener("click", e => {
  const res = e.target.closest("[data-res]");
  if (res) { openResult(res.dataset.res); return; }
  const kb = e.target.closest("[data-kidtoggle]");
  if (kb) {
    const k = kb.dataset.kidtoggle, open = collapsed.has(k);
    if (open) collapsed.delete(k); else collapsed.add(k);
    kb.setAttribute("aria-expanded", String(open));
    const box = document.querySelector(`[data-kids-of="${k}"]`); if (box) box.classList.toggle("open", open);
    if (open) lastOpen.add(k); else lastOpen.delete(k);
    return;
  }
  const mo = e.target.closest("[data-more]");
  if (mo) { borrowPopup(mo.dataset.more, mo.dataset.target); return; }
  const go = e.target.closest("[data-goto]");
  if (go) {
    const k = go.dataset.goto; const target = blockerOf(k); if (!target) return;
    if (sectionOf(target) !== section) { borrowPopup(k, target); return; }
    returnTo = { key: k };
    // "any of these" (brightness colour needs the left, right or top swipe on Brightness): every one
    // of them on this screen flashes and the note names them all, not just the first
    const av = String(PREF[k].availability || ""), any = av.includes("||") ? availKeys(k).filter(x => PREF[x] && inVersion(x) && sectionOf(x) === section) : [];
    if (any.length > 1) {
      goToSetting(target, () => any.forEach(x => document.querySelectorAll(`#list [data-row="${x}"]`).forEach(flashRow)));
      const val = (av.match(/===\s*"([^"]+)"/) || [])[1], names = any.map(x => `<b>${esc(title(x))}</b>`);
      const list = names.slice(0, -1).join(", ") + " or " + names[names.length - 1];
      snack(val ? `Set ${list} to <b>${esc(entryLabel(any[0], val) || val)}</b>, and you'll be brought back` : `Change ${list}, and you'll be brought back`);
      return;
    }
    goToSetting(target);
    snack(PREF[target].type === "boolean" ? `Switch <b>${esc(title(target))}</b> by holding it, and you'll be brought back` : `Change <b>${esc(title(target))}</b>, and you'll be brought back`);
    return;
  }
  const rp = e.target.closest("[data-replay]");
  const sw = e.target.closest("[data-sw]");
  if (sw) { const k = sw.dataset.sw; if (A[k]) { touchSel(k); toggle(k); } else { select(k); toggle(k); } return; }
  const opt = e.target.closest("button.opt[data-set]");
  if (opt) { ensureMod(); const k = opt.dataset.set; touchSel(k); const before = state[k]; state[k] = coerce(k, opt.dataset.val); afterChange(k, before); }
});
$("list").addEventListener("input", e => {
  const t = e.target; const k = t.dataset && t.dataset.set; if (!k || t.tagName === "SELECT") return;
  // a number box applies each keystroke straight away (the box keeps focus), like a slider does
  const num = t.type === "number" && t.value !== "" && isFinite(t.value);
  if (t.type === "range" || t.type === "color" || num) {
    ensureMod();
    if (!("before" in t.dataset)) t.dataset.before = JSON.stringify(state[k] ?? null);
    state[k] = t.type === "color" ? fromColor(k, t.value) : Number(t.value);
    const lab = document.querySelector(`[data-val-of="${k}"]`); if (lab) lab.textContent = t.value;
    // redrawn without the selection pop: it flashed the preview on every step of the slider
    selected = k; renderStage(); highlight(k, false);
    if (LIVE_HUD[k]) LIVE_HUD[k]();
  }
});
$("list").addEventListener("change", e => {
  const t = e.target; const k = t.dataset && t.dataset.set; if (!k) return;
  ensureMod();
  const before = "before" in t.dataset ? JSON.parse(t.dataset.before) : state[k]; delete t.dataset.before;
  state[k] = t.type === "range" || t.type === "number" ? Number(t.value) : t.type === "color" ? fromColor(k, t.value) : coerce(k, t.value);
  if (t.type === "range" || t.type === "color") { commit(); select(k); if (returnTo) afterChange(k, before); } else afterChange(k, before);
});

$("secPill").onclick = () => setPicker(!pickerOpen);
$("tabs").addEventListener("click", e => { if (tabDrag.justDragged) { tabDrag.justDragged = false; return; } const t = e.target.closest("[data-tab]"); if (!t || t.dataset.tab === section) return; returnTo = null; switchSection(t.dataset.tab); });
// Tabs scroll sideways (touch, mouse wheel, mouse drag). Holding a tab lifts it; drag it to reorder.
const tabDrag = { justDragged: false };
(() => {
  const box = $("tabs"); let st = null;
  box.addEventListener("wheel", e => { if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { box.scrollLeft += e.deltaY; e.preventDefault(); } }, { passive: false });
  box.addEventListener("pointerdown", e => {
    if (e.button > 0) return;
    const t = e.target.closest("[data-tab]");
    st = { x: e.clientX, sl: box.scrollLeft, t, mode: null, id: e.pointerId };
    if (t) st.hold = setTimeout(() => { if (!st || st.mode) return; st.mode = "lift"; t.classList.add("lift"); box.setPointerCapture(st.id); try { navigator.vibrate && navigator.vibrate(15); } catch { /* ignore */ } }, 450);
  });
  box.addEventListener("pointermove", e => {
    if (!st) return;
    const dx = e.clientX - st.x;
    if (!st.mode && Math.abs(dx) > 8) { clearTimeout(st.hold); st.mode = e.pointerType === "mouse" ? "scroll" : "native"; if (st.mode === "scroll") box.setPointerCapture(st.id); }
    if (st.mode === "scroll") box.scrollLeft = st.sl - dx;
    if (st.mode === "lift") {
      const tabs = [...box.querySelectorAll(".tab7")], me = st.t;
      const over = tabs.find(o => { if (o === me) return false; const r = o.getBoundingClientRect(); return e.clientX > r.left && e.clientX < r.right; });
      if (over) { const r = over.getBoundingClientRect(); over.parentNode.insertBefore(me, e.clientX < r.left + r.width / 2 ? over : over.nextSibling); }
      const br = box.getBoundingClientRect(); if (e.clientX > br.right - 24) box.scrollLeft += 8; else if (e.clientX < br.left + 24) box.scrollLeft -= 8;
    }
  });
  const end = () => {
    if (!st) return; clearTimeout(st.hold);
    if (st.mode === "lift") {
      st.t.classList.remove("lift");
      const g = groupOf(section), ids = [...box.querySelectorAll(".tab7")].map(b => b.dataset.tab), def = g.tabs.map(([t]) => t).filter(t => ids.includes(t));
      if (JSON.stringify(ids) === JSON.stringify(def)) delete tabOrder[g.id]; else tabOrder[g.id] = ids;
      store.save(); tabDrag.justDragged = true; setTimeout(() => { tabDrag.justDragged = false; }, 300);
    } else if (st.mode === "scroll") { tabDrag.justDragged = true; setTimeout(() => { tabDrag.justDragged = false; }, 300); }
    st = null;
  };
  box.addEventListener("pointerup", end); box.addEventListener("pointercancel", end);
  box.addEventListener("contextmenu", e => e.preventDefault());
  box.addEventListener("touchmove", e => { if (st && st.mode === "lift") e.preventDefault(); }, { passive: false }); // a lifted tab moves, the strip doesn't
})();
$("pickScrim").onclick = () => setPicker(false);
$("pickGrid").addEventListener("click", e => {
  if (pickSuppress) return;
  const dz = e.target.closest("[data-design]");
  if (dz) { design = dz.dataset.design; renderBar(); renderList(); store.save(); return; }
  if (e.target.closest("[data-group-toggle]")) { grouped = !grouped; renderBar(); renderStage(); store.save(); if (grouped) tutOnce("groups"); return; }
  const gb = e.target.closest("[data-group]");
  if (gb) { const g = GROUPS.find(x => x.id === gb.dataset.group), tabs = tabsOf(g); setPicker(false); returnTo = null; switchSection(lastTab[g.id] && tabs.some(([t]) => t === lastTab[g.id]) ? lastTab[g.id] : tabs[0][0]); return; }
  if (e.target.closest("[data-theme-toggle]")) { theme = theme === "m3" ? "yt" : "m3"; applyTheme(); renderBar(); store.save(); return; }
  // leaves the new design for Morphe's own settings screen; in the app the patch's switch at the top
  // of Morphe's settings turns it back on
  if (e.target.closest("[data-editor-off]")) {
    openDialog(`<div class="di">${I("power")}</div><h2 id="dlgTitle">Disable the new design?</h2><p>Morphe's settings open in their original look. You can turn the new design back on from the top of Morphe's settings. Your settings are not changed.</p><div class="acts"><button class="dbtn primary" data-dlg-ok>Disable</button><button class="dbtn tonal" data-dlg-cancel>Cancel</button></div>`);
    $("dlgBox").querySelector("[data-dlg-cancel]").onclick = closeDialog;
    $("dlgBox").querySelector("[data-dlg-ok]").onclick = () => {
      closeDialog();
      if (typeof window.MorpheApp !== "undefined" && window.MorpheApp.disableEditor) { try { window.MorpheApp.disableEditor(); } catch (err) { /* ignore */ } }
      else snack("In the app this switches back to Morphe's original settings");
    };
    return;
  }
  if (e.target.closest("[data-order-reset]")) {
    openDialog(`<div class="di">${I("reset")}</div><h2 id="dlgTitle">Reset screen order?</h2><p>The screens go back to Morphe's own order. Your settings are not changed.</p><div class="acts"><button class="dbtn primary" data-dlg-ok>Reset</button><button class="dbtn tonal" data-dlg-cancel>Cancel</button></div>`);
    $("dlgBox").querySelector("[data-dlg-cancel]").onclick = closeDialog;
    $("dlgBox").querySelector("[data-dlg-ok]").onclick = () => { customOrder = null; applyOrder(); renderBar(); store.save(); closeDialog(); snack("Screens are back in Morphe's order"); };
    return;
  }
  const b = e.target.closest("[data-sec]"); if (!b) return; setPicker(false); returnTo = null; switchSection(b.dataset.sec); });
document.addEventListener("keydown", e => { if (e.key === "Escape") { setPicker(false); closeDialog(); if (searching) { query = ""; setSearch(false); } } });
function setMode(m) {
  mode = m;
  $("btnOrig").setAttribute("aria-pressed", String(m === "orig")); $("btnMod").setAttribute("aria-pressed", String(m === "mod"));
  commit(); if (selected) select(selected);
}
// a two-way toggle: a tap anywhere on it switches between Original and Morphe
document.querySelector(".appbar .seg").onclick = () => setMode(mode === "orig" ? "mod" : "orig");
