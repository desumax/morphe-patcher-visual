"use strict";
// Snackbar, proxies, flashes, scrolling the preview to an element, and the selection ring.

// ------------------------------------------------------------------ interactions
let snackTimer = null, undoFn = null;
function snack(msg, undo) {
  $("snackMsg").innerHTML = msg; undoFn = undo || null; $("snackUndo").hidden = !undo;
  $("snack").classList.add("show"); clearTimeout(snackTimer);
  snackTimer = setTimeout(() => $("snack").classList.remove("show"), 3200);
}
$("canvas").addEventListener("click", () => stopScenario());
$("snackUndo").onclick = () => { if (undoFn) undoFn(); undoFn = null; $("snack").classList.remove("show"); };

// A setting that has no element of its own in the preview (it changes how something behaves) points
// at the element that does the behaviour: its parent's element (Playback speed button for "Tap to
// cycle speeds"), or a named one (the seekbar for the seekbar colour and thumb settings).
const PROXY_K = { morphe_seekbar_custom_color: "morphe_hide_seekbar" };
function proxyEls(k) {
  const q = x => [...document.querySelectorAll(`#stage [data-k="${x}"], #stage [data-also="${x}"]`)].filter(e => e.getClientRects().length && (!e.classList.contains("off") || e.classList.contains("ghost")));
  if (q(k).length) return [];
  const seen = new Set();
  for (let p = PROXY_K[k] || PARENT_OF[k]; p && !seen.has(p); p = PROXY_K[p] || PARENT_OF[p]) { seen.add(p); const e = q(p); if (e.length) return e; }
  return [];
}
// Descriptions show two lines; a longer one is cut (with a fade) and unfolds when its setting is
// selected, folding back when another one is. Every card keeps the same size whatever its state.
function fitSums(root = $("list")) {
  root.querySelectorAll(".row > .txt > .sum:not(.need)").forEach(el => {
    const lh = parseFloat(getComputedStyle(el).lineHeight) || 17.5, full = el.scrollHeight;
    el.classList.toggle("long", full > lh * 2 + 3); el.style.setProperty("--full", full + "px");
    el.classList.toggle("open", el.classList.contains("long") && !!el.closest(".row.sel"));
  });
}
function highlight(k, flash = true, reveal = false) {
  document.querySelectorAll(".sel").forEach(e => e.classList.remove("sel", "selin"));
  document.querySelectorAll(`[data-k="${k}"], [data-row="${k}"], [data-also="${k}"]`).forEach(e => e.classList.add("sel"));
  document.querySelectorAll("#list .sum.open").forEach(e => { if (!e.closest(".row.sel")) e.classList.remove("open"); }); document.querySelectorAll(`#list [data-row="${k}"] > .txt > .sum.long`).forEach(e => e.classList.add("open"));
  const els = [...document.querySelectorAll(`#stage [data-k="${k}"], #stage [data-also="${k}"]`)];
  const proxy = els.length ? [] : proxyEls(k);
  const finish = () => { els.forEach(e => {
    fitOutline(e);
    // big components (bars, shelves) only glow: scaling them up looked like the whole preview jumping
    if (flash) flashStage(e);
  }); if (flash) proxy.forEach(e => { fitRing(e); flashStage(e); }); };
  const finish0 = finish;
  const finishAll = () => { finish0(); lastFlash = { k, t: Date.now() }; if (parentFlashFor === k) flashParents(k); };
  if (!reveal || skipReveal) { skipReveal = false; return finishAll(); }
  // wait until a growing (ghost-revealed or restored) element has its full size, then scroll to it
  const liveEls = () => [...document.querySelectorAll(`#stage [data-k="${k}"], #stage [data-also="${k}"]`)];
  const go = () => { if (selected !== k) return; const live = liveEls(); els.splice(0, els.length, ...live); fT(finishAll, revealInStage(live) ? 340 : 0); };
  fT(() => {
    if (selected !== k) return;
    const growing = liveEls().flatMap(e => e.getAnimations()).filter(a => a.playState === "running" && isFinite(a.effect?.getComputedTiming().endTime) && a.effect?.getComputedTiming().fill !== "forwards");
    if (growing.length) { const run = clock.run("focus"); Promise.all(growing.map(a => a.finished.catch(() => {}))).then(() => { if (clock.alive("focus", run)) go(); }); } else go();
  }, 60);
}
let skipReveal = false;
// One flash look for everything: the selected element, and the parent settings it depends on,
// in the preview and in the list, all start on the same frame with the same pulse (FLASH_MS each).
const FLASH_MS = 480;
let lastFlash = { k: null, t: 0 }, parentFlashFor = null, quietFlashUntil = 0;
function flashStage(e, times = 1) {
  if (times === 1 && Date.now() < quietFlashUntil) return;
  const big = e.offsetWidth > $("stage").clientWidth * .5 || e.offsetHeight > 80; // big components only glow
  clearTimeout(e._flashT); e.classList.remove("flash", "flat", "twice"); void e.offsetWidth;
  e.classList.add("flash"); e.classList.toggle("flat", big); e.classList.toggle("twice", times > 1);
  e._flashT = setTimeout(() => e.classList.remove("flash", "flat", "twice"), FLASH_MS * times + 40);
}
function flashRow(el) { clearTimeout(el._attnT); el.classList.remove("attn"); void el.offsetWidth; el.classList.add("attn"); el._attnT = setTimeout(() => el.classList.remove("attn"), FLASH_MS * 2 + 40); }
// The setting and its element(s) flash together: used when arriving at a setting (search, "Take me there").
function flashTarget(k) {
  document.querySelectorAll(`#stage [data-k="${k}"], #stage [data-also="${k}"]`).forEach(e => flashStage(e, 2));
  document.querySelectorAll(`[data-row="${k}"]`).forEach(el => { if (el.offsetParent) flashRow(el); });
}
// Only the parents that actually block k: "Hide snackbar" is already off, so it does not flash
// when "Custom snackbar" is the one to switch on.
function blockingParents(k) {
  const p = PREF[k], out = [];
  const any = p.parents.filter(x => x.mode === "any");
  for (const x of p.parents) if (x.mode !== "any" && (x.mode === "not" ? !!state[x.key] : !state[x.key])) out.push(x.key);
  if (any.length && !any.some(x => !!state[x.key])) out.push(...any.map(x => x.key));
  if (!availOk(k)) out.push(...(p.availabilityParents || []), ...availKeys(k));
  return [...new Set(out)];
}
function flashParents(k) {
  parentFlashFor = null;
  flashTarget(k);
  for (const key of blockingParents(k)) {
    document.querySelectorAll(`#stage [data-k="${key}"], #stage [data-also="${key}"]`).forEach(e => flashStage(e, 2));
    document.querySelectorAll(`[data-row="${key}"]`).forEach(flashRow);
  }
}
// Scrollable boxes inside the preview (feeds, action bars, chip rows) scroll so the selected
// element is centred before it flashes. Works for overflow:hidden strips too.
function scrollBoxes(el) {
  const out = [], stage = $("stage");
  for (let p = el.parentElement; p && p !== stage; p = p.parentElement) {
    const cs = getComputedStyle(p);
    // a sideways strip stays sideways even while a flashing (slightly scaled up) child makes it a
    // few pixels taller than its box; reading it as a vertical scroller sent the selection off screen
    const sx = !p.classList.contains("inner-scroll") && p.scrollWidth > p.clientWidth + 1 && /auto|scroll|hidden/.test(cs.overflowX);
    const sy = p.scrollHeight > p.clientHeight + (sx ? 12 : 1) && /auto|scroll|hidden/.test(cs.overflowY);
    if (sx || sy) out.push([p, sx, sy]);
  }
  return out;
}
function frameFor(el, box) {
  const lim = box.clientHeight * .9; let best = el;
  for (let q = el.parentElement; q && q !== box; q = q.parentElement) { const h = q.getBoundingClientRect().height; if (h > lim) break; if (h > best.getBoundingClientRect().height + 2) best = q; }
  return best;
}
function revealInStage(els) {
  let moved = false;
  els.filter(e => e.offsetParent || e.getClientRects().length).slice(0, 1).forEach(el => {
    scrollBoxes(el).forEach(([box, sx, sy]) => {
      // a small element inside a bigger card (a label on a thumbnail) centres the whole card,
      // so you see what it belongs to
      const r = (sy ? frameFor(el, box) : el).getBoundingClientRect(), b = box.getBoundingClientRect();
      let dx = 0, dy = 0;
      if (sx && (r.left < b.left + 4 || r.right > b.right - 4)) dx = (r.left + r.width / 2) - (b.left + b.width / 2);
      if (sy && (r.top < b.top + 4 || r.bottom > b.bottom - 4)) dy = (r.top + Math.min(r.height, b.height) / 2) - (b.top + b.height / 2);
      // absolute targets: a relative scrollBy issued while an earlier smooth scroll is still running
      // lands off target (quick successive selections). With nothing to move, stop any scroll still
      // running from the previous selection so it can't carry this element out of view.
      if (dx || dy) { box.scrollTo({ left: box.scrollLeft + dx, top: box.scrollTop + dy, behavior: "smooth" }); moved = true; }
      else box.scrollTo({ left: box.scrollLeft, top: box.scrollTop, behavior: "instant" });
    });
  });
  return moved;
}
// The selection outline sits outside the element; when that would be clipped by the preview edge,
// draw it inside instead.
// The ring (outline, flash, hold, ghost dashes) goes around what an element actually draws, not
// around its wrapper: a caption line is centred in a full-width positioning box, a menu item's text
// sits in a padded row, a dot sits in a corner of its button. Measure the painted content and, when
// the wrapper is clearly bigger, draw the ring at those insets. Runs after every render and whenever
// the selected element changes size (a slider, text typed in by an animation).
const paints = st => st.backgroundColor !== "rgba(0, 0, 0, 0)" || st.backgroundImage !== "none" || parseFloat(st.borderTopWidth) > 0 || parseFloat(st.borderBottomWidth) > 0 || st.boxShadow !== "none";
function paintedBox(el) {
  let l = 1e9, t = 1e9, r = -1e9, b = -1e9;
  const add = q => { if (q.width < .5 || q.height < .5) return; l = Math.min(l, q.left); t = Math.min(t, q.top); r = Math.max(r, q.right); b = Math.max(b, q.bottom); };
  const walk = n => {
    for (const c of n.childNodes) {
      if (c.nodeType === 3) { if (c.textContent.trim()) { const rg = document.createRange(); rg.selectNodeContents(c); for (const q of rg.getClientRects()) add(q); } continue; }
      if (c.nodeType !== 1) continue;
      const st = getComputedStyle(c);
      if (st.display === "none" || st.visibility === "hidden" || st.opacity === "0") continue;
      const tag = c.tagName.toLowerCase();
      if (tag === "svg" || tag === "img" || tag === "canvas" || paints(st)) add(c.getBoundingClientRect());
      if (tag !== "svg" && st.overflow === "visible") walk(c); else if (tag !== "svg") add(c.getBoundingClientRect());
    }
  };
  walk(el);
  return r > l ? { l, t, r, b } : null;
}
function fitRing(el) {
  if (!el.isConnected || el.classList.contains("shade")) { el.classList.remove("fit"); return; }
  const st = getComputedStyle(el);
  if (st.display === "none" || paints(st)) { if (st.display !== "none") el.classList.remove("fit"); return; }
  const box = el.getBoundingClientRect(), u = paintedBox(el);
  if (!u || !box.width) { el.classList.remove("fit"); return; }
  const P = 3; // breathing room between the content and the ring
  const g = [u.l - box.left, u.t - box.top, box.right - u.r, box.bottom - u.b].map(x => Math.max(0, Math.round(x - P)));
  if (Math.max(...g) < 8) { el.classList.remove("fit"); return; }
  // a ring that would run into the edge of what clips it stays just inside instead
  const c = clipOf(el).getBoundingClientRect(), edge = [box.left - c.left, box.top - c.top, c.right - box.right, c.bottom - box.bottom];
  g.forEach((x, i) => { if (edge[i] > -3 && edge[i] + x < 4) g[i] = Math.max(x, 4 - Math.max(0, edge[i])); });
  ["--fl", "--ft", "--fr", "--fb"].forEach((v, i) => el.style.setProperty(v, g[i] + "px"));
  el.classList.add("fit");
}
let ringObs = null;
function watchRing(el) {
  if (ringObs) ringObs.disconnect();
  if (!window.ResizeObserver || !el) return;
  ringObs = new ResizeObserver(() => fitRing(el));
  ringObs.observe(el); el.querySelectorAll("*").forEach(c => ringObs.observe(c));
}
function clipOf(el) {
  for (let p = el.parentElement; p && p !== $("stage"); p = p.parentElement) { const cs = getComputedStyle(p); if (cs.overflowX !== "visible" || cs.overflowY !== "visible") return p; }
  return $("stage");
}
function fitOutline(el) {
  fitRing(el); watchRing(el);
  if (el.classList.contains("fit")) { el.classList.remove("selin"); return; }
  const r = el.getBoundingClientRect(), b = clipOf(el).getBoundingClientRect();
  el.classList.toggle("selin", r.left < b.left + 4 || r.right > b.right - 4 || r.top < b.top + 4);
}
function scrollRowIntoView(k, center, tries = 2) {
  const row = document.querySelector(`[data-row="${k}"]`); if (!row) return;
  // a long smooth scroll can be cut short (the list or the preview changes height while it runs),
  // so check where the row ended up and finish the job if it is still away from the target
  if (center && tries) fT(() => {
    const r = document.querySelector(`[data-row="${k}"]`); if (!r || selected !== k) return;
    const sc = $("scroller"), sr = sc.getBoundingClientRect(), rr = r.getBoundingClientRect(), stickH = $("stick").offsetHeight;
    const mid = sr.top + stickH + (sc.clientHeight - stickH) / 2, rmid = rr.top + rr.height / 2;
    const atEnd = sc.scrollTop + sc.clientHeight >= sc.scrollHeight - 2 || sc.scrollTop <= 0;
    if (Math.abs(rmid - mid) > 60 && !(atEnd && rr.top >= sr.top + stickH && rr.bottom <= sr.bottom)) scrollRowIntoView(k, true, tries - 1);
  }, 750);
  const sc = $("scroller"), two = $("content").offsetWidth >= 600 && !$("content").classList.contains("stacked"), stickH = two ? 0 : $("stick").offsetHeight;
  const top = row.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop;
  const target = center ? top - stickH - (sc.clientHeight - stickH) / 2 + row.offsetHeight / 2 : top - stickH - 8;
  if (center || top < sc.scrollTop + stickH || top + row.offsetHeight > sc.scrollTop + sc.clientHeight) { progScrollUntil = performance.now() + 900; sc.scrollTo({ top: target, behavior: "smooth" }); }
}
