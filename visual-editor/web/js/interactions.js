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
  const q = x => [...document.querySelectorAll(`#stage [data-k="${x}"], #stage [data-also~="${x}"]`)].filter(e => e.getClientRects().length && (!e.classList.contains("off") || e.classList.contains("ghost")));
  if (q(k).length) return [];
  const seen = new Set();
  for (let p = PROXY_K[k] || PARENT_OF[k]; p && !seen.has(p); p = PROXY_K[p] || PARENT_OF[p]) { seen.add(p); const e = q(p); if (e.length) return e; }
  return [];
}
// Any interaction with a card (tap, hold, its toggle or options, or its element in the preview)
// selects it, and a selected card always shows its whole description.
// Selecting by tapping a card's control (a switch, a value pill) ends the running comparison too: it used
// to set the selection before select() ran, so select() saw no change and the last setting's comparison
// kept playing (Max, Nov 23: it happened only when the new setting was picked through its control)
function touchSel(k) { if (selected === k) return; stopScenario(); if (ghosts.has(selected)) unghost(selected); selected = k; highlight(k, false); renderInspector(); }
// Descriptions show two lines; a longer one is cut (with a fade) and unfolds when its setting is
// selected, folding back when another one is. Every card keeps the same size whatever its state.
// An unfold starts two frames later, after the work that selected the card (a redraw, the preview,
// the demo) is done, so it never begins in a busy frame and stutters.
const afterBusy = fn => requestAnimationFrame(() => requestAnimationFrame(fn));
function unfold(el) { afterBusy(() => { if (el.isConnected && el.classList.contains("long") && el.closest(".row.sel")) el.classList.add("open"); }); }
function fitSums(root = $("list"), keep = new Set()) {
  // every description measured first, then marked: one layout for the list, not one per row (performance)
  const els = (Array.isArray(root) ? root : [root]).flatMap(r => [...r.querySelectorAll(":scope > .txt > .sum:not(.need), .row > .txt > .sum:not(.need)")]); // one box, or the cards just drawn
  const sizes = els.map(el => [parseFloat(getComputedStyle(el).lineHeight) || 17.5, el.scrollHeight]);
  els.forEach((el, i) => {
    const [lh, full] = sizes[i];
    el.classList.toggle("long", full > lh * 2 + 3); el.style.setProperty("--full", full + "px");
    const want = el.classList.contains("long") && !!el.closest(".row.sel");
    if (!want) el.classList.remove("open"); else if (keep.has(el)) el.classList.add("open"); else if (!el.classList.contains("open")) unfold(el);
  });
}
function highlight(k, flash = true, reveal = false) {
  document.querySelectorAll(".sel").forEach(e => e.classList.remove("sel", "selx")); wakeRings(); syncLocked(k);
  document.querySelectorAll(`[data-k="${k}"], [data-row="${k}"], [data-also~="${k}"]`).forEach(e => e.classList.add("sel"));
  document.querySelectorAll("#list .sum.open").forEach(e => { if (!e.closest(".row.sel")) e.classList.remove("open"); }); document.querySelectorAll(`#list [data-row="${k}"] > .txt > .sum.long:not(.open)`).forEach(unfold);
  const els = [...document.querySelectorAll(`#stage [data-k="${k}"], #stage [data-also~="${k}"]`)];
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
  const liveEls = () => [...document.querySelectorAll(`#stage [data-k="${k}"], #stage [data-also~="${k}"]`)];
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
  if (!big) popOrigin(e);
  e.classList.add("flash"); e.classList.toggle("flat", big); e.classList.toggle("twice", times > 1); wakeRings();
  e._flashT = setTimeout(() => e.classList.remove("flash", "flat", "twice"), FLASH_MS * times + 40);
}
function flashRow(el) { clearTimeout(el._attnT); el.classList.remove("attn"); void el.offsetWidth; el.classList.add("attn"); el._attnT = setTimeout(() => el.classList.remove("attn"), FLASH_MS * 2 + 40); }
// The setting and its element(s) flash together: used when arriving at a setting (search, "Take me there").
function flashTarget(k) {
  document.querySelectorAll(`#stage [data-k="${k}"], #stage [data-also~="${k}"]`).forEach(e => flashStage(e, 2));
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
    document.querySelectorAll(`#stage [data-k="${key}"], #stage [data-also~="${key}"]`).forEach(e => flashStage(e, 2));
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
    // only real scrollers move: a clipped screen (overflow hidden) never scrolls, or selecting a part at
    // its edge (the fullscreen action bar) shifted the whole preview up
    const sx = !p.classList.contains("inner-scroll") && p.scrollWidth > p.clientWidth + 1 && /auto|scroll/.test(cs.overflowX);
    const sy = p.scrollHeight > p.clientHeight + (sx ? 12 : 1) && /auto|scroll/.test(cs.overflowY);
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
  // an unselected ghost's ring that would run into the edge of what clips it stays just inside; a
  // selected part's ring is drawn on the ring layer instead, which may run past the preview's border
  if (!el.classList.contains("sel")) {
    const c = clipOf(el).getBoundingClientRect(), edge = [box.left - c.left, box.top - c.top, c.right - box.right, c.bottom - box.bottom];
    g.forEach((x, i) => { if (edge[i] > -3 && edge[i] + x < 4) g[i] = Math.max(x, 4 - Math.max(0, edge[i])); });
  }
  ["--fl", "--ft", "--fr", "--fb"].forEach((v, i) => el.style.setProperty(v, g[i] + "px"));
  el.classList.add("fit");
}
let ringObs = null;
function watchRing(el) {
  if (ringObs) ringObs.disconnect();
  if (!window.ResizeObserver || !el) return;
  ringObs = new ResizeObserver(() => { fitRing(el); wakeRings(); });
  ringObs.observe(el); el.querySelectorAll("*").forEach(c => ringObs.observe(c));
  if ($("stage")) ringObs.observe($("stage"));
}
function clipOf(el) {
  for (let p = el.parentElement; p && p !== $("stage"); p = p.parentElement) { const cs = getComputedStyle(p); if (cs.overflowX !== "visible" || cs.overflowY !== "visible") return p; }
  return $("stage");
}
function fitOutline(el) { fitRing(el); watchRing(el); wakeRings(); }
// ---- The selection ring above the preview frame
// The frame's rounded border clips the preview, so the ring of a part that sits against it (the
// whole-window controls background, the fullscreen action bar) and its selection pop were cut off.
// Such a ring is drawn on a layer above the frame instead, where it may run past the border; it
// follows the part through the pop, scrolling and resizing. An inner scroller's edge still applies:
// a part scrolled under a header shows no ring there, and one sitting against that edge has its
// ring drawn just inside it.
const RING_ROOM = 6;
let ringRAF = 0, ringQuiet = 0, ringKey = "", ringQuick = "", ringEls = [];
function wakeRings() { ringQuiet = 0; if (!ringRAF) ringRAF = requestAnimationFrame(ringTick); }
function ringTick() {
  ringRAF = 0;
  ringQuiet = syncRings() ? 0 : ringQuiet + 1;
  if (ringQuiet < 45) ringRAF = requestAnimationFrame(ringTick);
}
// The boxes around el that clip it (overflow other than visible), up to stop. The ring layer asks every
// frame while a part moves; which boxes clip does not change from one frame to the next, so the list is
// kept for a moment instead of reading every ancestor's style each frame (Max, Nov 22: performance).
const clipCache = new WeakMap();
function clipChain(el, stop) {
  const now = performance.now(), c = clipCache.get(el);
  if (c && c.stop === stop && now - c.at < 400) return c.list;
  const list = [];
  for (let p = el.parentElement; p && p !== stop; p = p.parentElement) {
    const cs = getComputedStyle(p); if (cs.overflowX !== "visible" || cs.overflowY !== "visible") list.push(p);
  }
  clipCache.set(el, { stop, at: now, list }); return list;
}
// the box that actually clips el: the frame, narrowed by any scroller inside it
function clipEdges(el, F) {
  let l = F.left, t = F.top, r = F.right, b = F.bottom;
  for (const p of clipChain(el, $("stage"))) {
    const q = p.getBoundingClientRect();
    l = Math.max(l, q.left); t = Math.max(t, q.top); r = Math.min(r, q.right); b = Math.min(b, q.bottom);
  }
  return { l, t, r, b };
}
function ringGeom(el, F, frameR) {
  const r = el.getBoundingClientRect();
  if (r.width < 1 || r.height < 1) return null;
  const A = clipEdges(el, F), s = el.offsetWidth ? r.width / el.offsetWidth : 1;
  const fit = el.classList.contains("fit"), ghost = el.classList.contains("ghost");
  const off = (ghost && fit ? 1 : 2) * s, w = (ghost ? 1.5 : 2) * s, d = off + w;
  const v = n => fit ? (parseFloat(el.style.getPropertyValue(n)) || 0) * s : 0;
  const bx = { l: r.left + v("--fl"), t: r.top + v("--ft"), r: r.right - v("--fr"), b: r.bottom - v("--fb") };
  // only a ring that would reach what clips the part (now, or while the pop scales it) moves here
  const mx = Math.max(RING_ROOM, r.width * .06), my = Math.max(RING_ROOM, r.height * .06);
  if (bx.l - d - mx >= A.l && bx.t - d - my >= A.t && bx.r + d + mx <= A.r && bx.b + d + my <= A.b) return null;
  const R = { l: bx.l - d, t: bx.t - d, r: bx.r + d, b: bx.b + d }, cut = { l: -1e9, t: -1e9, r: 1e9, b: 1e9 };
  // the frame's own edge: the ring runs past it, unless the part itself is cut off there
  // a scroller's edge inside the frame: the ring is drawn just inside it, or cut where the part is scrolled past it
  if (A.l > F.left + 2) { if (bx.l >= A.l - 3) R.l = Math.max(R.l, A.l); else cut.l = A.l; } else if (bx.l < F.left - 3) cut.l = F.left;
  if (A.t > F.top + 2) { if (bx.t >= A.t - 3) R.t = Math.max(R.t, A.t); else cut.t = A.t; } else if (bx.t < F.top - 3) cut.t = F.top;
  if (A.r < F.right - 2) { if (bx.r <= A.r + 3) R.r = Math.min(R.r, A.r); else cut.r = A.r; } else if (bx.r > F.right + 3) cut.r = F.right;
  if (A.b < F.bottom - 2) { if (bx.b <= A.b + 3) R.b = Math.min(R.b, A.b); else cut.b = A.b; } else if (bx.b > F.bottom + 3) cut.b = F.bottom;
  const ins = [cut.t - R.t, R.r - cut.r, R.b - cut.b, cut.l - R.l].map(x => Math.max(0, x));
  const hidden = R.r - R.l - ins[1] - ins[3] < 2 * w + 1 || R.b - R.t - ins[0] - ins[2] < 2 * w + 1;
  // corners follow the ring's usual curve; one at a corner of the frame follows the frame's curve
  const cs = getComputedStyle(el, fit ? "::before" : null), ref = Math.min(bx.r - bx.l, bx.b - bx.t);
  const px = x => String(x).endsWith("%") ? parseFloat(x) * ref / 100 : parseFloat(x) || 0;
  const aL = Math.abs(bx.l - F.left) <= 3, aR = Math.abs(bx.r - F.right) <= 3, aT = Math.abs(bx.t - F.top) <= 3, aB = Math.abs(bx.b - F.bottom) <= 3;
  const corner = (prop, x, y) => Math.round((x && y ? frameR : px(cs[prop]) * s) + d);
  const rad = [corner("borderTopLeftRadius", aL, aT), corner("borderTopRightRadius", aR, aT), corner("borderBottomRightRadius", aR, aB), corner("borderBottomLeftRadius", aL, aB)];
  return { R, ins, hidden, w, ghost, rad };
}
function syncRings() {
  const st = $("stage"), layer = $("ringLayer");
  if (!st || !layer) return false;
  st.querySelectorAll(".selx:not(.sel)").forEach(e => e.classList.remove("selx"));
  // nothing selected in the preview, or the preview hidden: no ring to place, and no layout to read
  // (asking whether the preview is shown is itself a layout, so it comes second; Max, Nov 22: performance)
  const sel = [...st.querySelectorAll(".c.sel")], live = sel.length && st.offsetParent ? sel : [];
  if (!live.length) { if (layer.firstChild) layer.replaceChildren(); ringQuick = ""; const k = ""; const ch = k !== ringKey; ringKey = k; return ch; }
  const L = layer.getBoundingClientRect(), F = st.getBoundingClientRect();
  // nothing moved since the last frame (the same parts, at the same places, the frame and the layer
  // where they were): the rings stay as drawn, without reading any styles (performance)
  const rk = q => `${q.left},${q.top},${q.width},${q.height}`;
  const quick = [rk(L), rk(F), innerWidth, innerHeight, ...live.map(el => rk(el.getBoundingClientRect()) + el.className + el.getAttribute("style"))].join("|");
  if (quick === ringQuick && live.length === ringEls.length && live.every((el, i) => el === ringEls[i])) return false;
  ringQuick = quick; ringEls = live;
  const sb = getComputedStyle(st.parentElement);
  const frameR = Math.max(0, parseFloat(sb.borderTopLeftRadius) - parseFloat(sb.borderTopWidth) || 0);
  const out = [];
  // what of the ring layer can be seen: the screen and every clipping box around the preview. A ring
  // that would run past it (the preview pinned at the top of the screen after scrolling, its edge on the
  // screen's edge) is drawn just inside instead, so no side of it ever disappears (Max, Nov 20)
  const V = { l: 0, t: 0, r: innerWidth, b: innerHeight };
  for (const a of clipChain(layer, document.documentElement)) {
    const q = a.getBoundingClientRect(); V.l = Math.max(V.l, q.left); V.t = Math.max(V.t, q.top); V.r = Math.min(V.r, q.right); V.b = Math.min(V.b, q.bottom);
  }
  let key = `${Math.round(F.left)},${Math.round(F.top)},${Math.round(V.t)},${Math.round(V.b)}`;
  for (const el of live) {
    const g = ringGeom(el, F, frameR);
    if (g) {
      const R = g.R, was = { ...R };
      R.l = Math.max(R.l, V.l); R.t = Math.max(R.t, V.t); R.r = Math.min(R.r, V.r); R.b = Math.min(R.b, V.b);
      g.ins = [g.ins[0] - (R.t - was.t), g.ins[1] - (was.r - R.r), g.ins[2] - (was.b - R.b), g.ins[3] - (R.l - was.l)].map(x => Math.max(0, x));
      if (R.r - R.l < 2 * g.w + 1 || R.b - R.t < 2 * g.w + 1) g.hidden = true;
    }
    el.classList.toggle("selx", !!g);
    if (!g) { const q = el.getBoundingClientRect(); key += `|${q.left | 0},${q.top | 0},${q.width | 0},${q.height | 0}`; continue; }
    const f = n => Math.round(n * 10) / 10;
    out.push({ ghost: g.ghost, css: g.hidden ? "display:none" : `left:${f(g.R.l - L.left)}px;top:${f(g.R.t - L.top)}px;width:${f(g.R.r - g.R.l)}px;height:${f(g.R.b - g.R.t)}px;border-width:${f(g.w)}px;border-radius:${g.rad.map(x => x + "px").join(" ")};clip-path:inset(${g.ins.map(x => f(x) + "px").join(" ")})` });
  }
  while (layer.children.length > out.length) layer.lastChild.remove();
  while (layer.children.length < out.length) layer.appendChild(document.createElement("i"));
  out.forEach((o, i) => { const ring = layer.children[i]; if (ring._css !== o.css) { ring.style.cssText = o.css; ring._css = o.css; } ring.classList.toggle("ghost", o.ghost); key += "|" + o.css; });
  const changed = key !== ringKey; ringKey = key;
  return changed;
}
// anything that moves or resizes the selected part wakes the ring layer for a moment
["scroll", "animationstart", "animationiteration", "transitionrun"].forEach(t => document.addEventListener(t, e => {
  // a comparison or demo playing over the preview (#canvas) moves nothing a ring follows
  const st = $("stage"); if (st && e.target instanceof Element && (st.contains(e.target) || e.target.contains(st)) && !e.target.closest("#canvas")) wakeRings();
}, { capture: true, passive: true }));
window.addEventListener("resize", wakeRings);
// the pop grows away from a clipping edge the part sits against, so it is never cut off there
function popOrigin(e) {
  const st = $("stage"); if (!st || !st.contains(e)) return;
  const r = e.getBoundingClientRect(), A = clipEdges(e, st.getBoundingClientRect()), gx = r.width * .06 + 1, gy = r.height * .06 + 1;
  const L = r.left - A.l < gx, R = A.r - r.right < gx, T = r.top - A.t < gy, B = A.b - r.bottom < gy;
  e.style.setProperty("--pop", `${L === R ? "center" : L ? "left" : "right"} ${T === B ? "center" : T ? "top" : "bottom"}`);
}
// A scroll that follows its target while it moves: the row's place is read again on every frame, so a
// preview, top bar or description changing size mid-scroll bends the path instead of ending off target
// and needing a second scroll. Touching the list takes over at once.
let rowGlide = null;
["wheel", "touchstart", "pointerdown", "keydown"].forEach(t => document.addEventListener(t, e => { if (rowGlide && $("scroller")?.contains(e.target)) rowGlide = null; }, { capture: true, passive: true }));
function glideScrollTo(sc, targetOf, ms = 620) {
  const id = {}, t0 = performance.now(), y0 = sc.scrollTop; rowGlide = id;
  progScrollUntil = t0 + ms + 400;
  const step = now => {
    if (rowGlide !== id) return;
    const raw = targetOf(); if (Number.isNaN(raw)) { rowGlide = null; return; }
    const t = Math.min(1, (now - t0) / ms), y1 = Math.max(0, Math.min(sc.scrollHeight - sc.clientHeight, raw));
    sc.scrollTop = y0 + (y1 - y0) * moveEase(t);
    // after the move, hold the row in place a little longer while late layout changes settle
    if (now - t0 < ms + 350) requestAnimationFrame(step); else rowGlide = null;
  };
  requestAnimationFrame(step);
}
function scrollRowIntoView(k, center) {
  const row = document.querySelector(`[data-row="${k}"]`); if (!row) return;
  if (center) { // centred: one continuous move that tracks the row (see glideScrollTo)
    const sc = $("scroller");
    glideScrollTo(sc, () => {
      const r = document.querySelector(`[data-row="${k}"]`); if (!r || selected !== k) return NaN;
      const two = $("content").offsetWidth >= 600 && !$("content").classList.contains("stacked"), stickH = two ? 0 : $("stick").offsetHeight;
      const top = r.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop;
      return top - stickH - (sc.clientHeight - stickH) / 2 + r.offsetHeight / 2;
    });
    return;
  }
  const sc = $("scroller"), two = $("content").offsetWidth >= 600 && !$("content").classList.contains("stacked"), stickH = two ? 0 : $("stick").offsetHeight;
  const top = row.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop;
  const target = center ? top - stickH - (sc.clientHeight - stickH) / 2 + row.offsetHeight / 2 : top - stickH - 8;
  if (center || top < sc.scrollTop + stickH || top + row.offsetHeight > sc.scrollTop + sc.clientHeight) { progScrollUntil = performance.now() + 900; sc.scrollTo({ top: target, behavior: "smooth" }); }
}
