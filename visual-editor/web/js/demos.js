"use strict";
// Live demos: the looping animations played on the preview itself for gestures and behaviours.

// ------------------------------------------------------------------ demos (gesture / behaviour), faster loop
const LOOP_MS = 1500;
let demoStep = 0;
// What each demo does, by type. A bug or a wish that applies to one type ("should also play while the
// element is only previewed") is fixed once, for the whole type, in startDemo / the shared helpers.
//   transient  the setting's own element appears during a gesture and goes again (a hint, a thumbnail,
//              a sheet). When your settings hide it, the selected element is previewed as a ghost and the
//              demo still spawns and removes it, on the ghost, so you see what you are hiding.
//   gesture    a finger does something and the result shows (seek, swipe, double-tap, tap and hold);
//              the element it acts on comes from NEEDS when your settings hide it.
//   toast      a confirmation pill appears (remember speed / quality).
//   motion     an element already on screen changes over time (countdown, glow, captions, nav width).
//   overlay    guides drawn over the player (swipe zones and their style, size and colours).
// Comparisons (Off / On side by side) are not demos: they live in scenarios.js (scen()).
const DEMO_TYPES = {
  transient: "hide_player_gesture_hints seekbar_thumbnail_preview sb_create_new_segment sb_create_new_segment_step sb_voting_button",
  gesture: "tap_to_seek slide_to_seek disable_precise_seeking_gesture swipe_seek disable_shorts_double_tap_to_like swap_save_and_queue_actions",
  toast: "remember_playback_speed_last_selected_toast remember_video_quality_last_selected_toast",
  motion: "exit_fullscreen open_videos_fullscreen autoplay_mode disable_like_subscribe_glow stable_caption_blocks niconico_comments narrow_navigation_buttons",
  overlay: "swipe_left_zone swipe_right_zone swipe_top_zone swipe_overlay_style swipe_overlay_background_opacity swipe_text_overlay_size swipe_overlay_progress_volume_color swipe_overlay_progress_brightness_color swipe_overlay_progress_speed_color swipe_zone_width swipe_overlay_timeout swipe_speed_step swipe_speed_sensitivity swipe_zone_preview swipe_speed_zone_height",
};
const DEMO_TYPE = {};
Object.entries(DEMO_TYPES).forEach(([t, ks]) => ks.split(" ").forEach(k => { DEMO_TYPE["morphe_" + k] = t; }));
// true while a transient demo plays on a ghost (its element is hidden by your settings)
let demoOnGhost = false;
// fade a selectable element in or out, also when it is a ghost (whose opacity is otherwise fixed)
function fadeC(el, show) { if (!el) return; el.classList.add("dzt"); el.classList.toggle("dz", !show); }
// Every timer a demo starts runs on the clock's "demo" track, so switching to another setting (or
// toggling this one) cancels what the previous run still had queued, and the finger starts clean:
// no hold ring, seek position or toast from the last demo leaks into the next.
const dT = (fn, ms) => clock.after("demo", ms, fn);
const dEvery = (fn, ms) => clock.every("demo", ms, fn);
// cleanups a demo registers for when it is cut short (another setting selected mid-animation)
const demoUndo = [];
const onDemoStop = fn => { if (demoUndo.length < 8) demoUndo.push(fn); };
function stopDemo() {
  clock.stop("demo");
  demoUndo.splice(0).forEach(fn => { try { fn(); } catch { /* the scene was redrawn */ } });
  demoOnGhost = false;
  document.querySelectorAll("#stage .finger").forEach(f => { f.style.transition = "none"; f.classList.remove("show", "hold", "tap"); });
  document.querySelectorAll("#stage .toastin.dyn").forEach(n => n.remove()); document.querySelectorAll("#stage .demo-label.dyn").forEach(n => { n.style.opacity = "0"; setTimeout(() => { n.remove(); showSceneLabel(); }, 250); }); }
const showSceneLabel = () => { if (!document.querySelector("#stage .demo-label.dyn")) document.querySelectorAll("#stage .demo-label:not(.dyn)").forEach(n => { n.style.visibility = ""; }); };
// Demos no longer caption themselves (Max, Round 24: the animation explains itself). Only notes
// that say why nothing shows (force) still appear.
function label(text, bad, ms, force) {
  if (!force) return;
  const st = $("stage");
  st.querySelectorAll(".demo-label.dyn").forEach(n => n.remove());
  st.querySelectorAll(".demo-label:not(.dyn)").forEach(n => { n.style.visibility = "hidden"; }); // the scene's own label would sit right under it
  const d = document.createElement("div");
  d.className = "demo-label dyn" + (bad ? " bad" : "");
  d.textContent = text + (demoOnGhost ? " (hidden)" : "");
  st.firstElementChild?.appendChild(d);
  const top = d.getBoundingClientRect().bottom - (st.firstElementChild || st).getBoundingClientRect().top + 8;
  st.querySelectorAll(".toastin.dyn").forEach(t => { if (parseFloat(t.style.top) < top) t.style.top = top + "px"; }); // a pill shown first moves below
  if (ms) dT(() => { d.style.opacity = "0"; setTimeout(() => { d.remove(); showSceneLabel(); }, 300); }, ms);
}
const ENDSCREEN_SEL = new Set(["morphe_hide_autoplay_preview", "morphe_hide_end_screen_suggested_video"]);
function finger() { return document.querySelector("#stage .finger"); }
function place(f, x, y, ms) { f.style.transition = ms ? `left ${ms}ms var(--ease), top ${ms}ms var(--ease), opacity 120ms` : "opacity 120ms"; f.style.left = x + "px"; f.style.top = y + "px"; f.classList.add("show"); }
function hideF(f, after) { dT(() => { f.classList.remove("show", "hold"); }, after); }
function tapAt(x, y) { const f = finger(); if (!f) return; place(f, x, y); f.classList.remove("tap"); void f.offsetWidth; f.classList.add("tap"); hideF(f, 520); }
function fmt(total, pct) { const s = Math.round(total * pct / 100); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; }
function setSeek(pct) { const p = $("played"); if (p) p.style.width = pct + "%"; ["knob", "knobRing"].forEach(id => { const k = $(id); if (k) k.style.left = pct + "%"; }); }
function showPill(text, ms = 1100) {
  const st = $("stage").firstElementChild; if (!st) return;
  const d = document.createElement("div"); d.className = "toastin dyn";
  // never under the explanation pill in the top-left corner: sit just below it
  const lab = st.querySelector(".demo-label.dyn"), sr = st.getBoundingClientRect();
  d.style.top = (lab ? Math.max(14, lab.getBoundingClientRect().bottom - sr.top + 8) : 14) + "px"; d.textContent = text; st.appendChild(d);
  // nor over a hint the scene already shows (such as "Pull up for precise seeking") or a part of the
  // preview (badges, buttons, the time): step below it. Only small parts count, not whole panels.
  const stArea = sr.width * sr.height || 1;
  for (let i = 0; i < 8; i++) {
    const a = d.getBoundingClientRect(), hit = [...st.querySelectorAll(".toastin:not(.dyn), .demo-label, .c[data-k], .chip, .badge-txt, .pbtn, .time")].find(o => { if (o === d || !o.offsetWidth || getComputedStyle(o).visibility === "hidden" || o.contains(d)) return false; { const q = o.getBoundingClientRect(); if (q.width * q.height > stArea * .2) return false; } const q = o.getBoundingClientRect(); return Math.min(a.right, q.right) - Math.max(a.left, q.left) > 2 && Math.min(a.bottom, q.bottom) - Math.max(a.top, q.top) > 2; });
    if (!hit) break; d.style.top = (hit.getBoundingClientRect().bottom - sr.top + 6) + "px";
  }
  flash7(d); // the same blue double pulse as a changing part in the comparisons, so the eye finds it
  dT(() => d.remove(), ms);
}
const DEMOS = {
  morphe_tap_to_seek(on) {
    const seek = $("seek"); if (!seek) return;
    const st = $("stage").getBoundingClientRect(), r = seek.getBoundingClientRect();
    const pct = [72, 30, 55, 88, 12][demoStep % 5];
    tapAt(r.left - st.left + r.width * pct / 100, r.top - st.top + r.height / 2); onDemoStop(() => setSeek(17));
    if (on) { dT(() => setSeek(pct), 120); label(`Tap on seekbar: jumps to ${fmt(18 * 60 + 42, pct)}`); }
    else label("Tap on seekbar: nothing happens. Stock YouTube needs a drag.", true);
  },
  morphe_slide_to_seek(on) {
    const f = finger(); if (!f) return; const W = $("stage").clientWidth;
    place(f, W * .3, 90); f.classList.add("hold"); onDemoStop(() => setSeek(17));
    if (on) {
      // every loop starts from the resting point, so the seekbar moves each time, in step with the finger
      const moving = [$("played"), $("knob"), $("knobRing")].filter(Boolean);
      moving.forEach(e => e.style.transition = "none"); setSeek(17); void $("stage").offsetWidth;
      label("Press and hold the video, then slide: seeks");
      dT(() => { place(f, W * .7, 90, 700); moving.forEach(e => e.style.transition = "width .7s var(--ease), left .7s var(--ease)"); setSeek(60); }, 250);
      dT(() => moving.forEach(e => e.style.transition = ""), 1000); onDemoStop(() => moving.forEach(e => e.style.transition = ""));
    }
    else { label("Press and hold the video: plays at 2x speed (stock)", true); showPill("2x ▸▸"); }
    hideF(f, 1150);
  },
  morphe_disable_precise_seeking_gesture(disabled) {
    const film = $("film"), f = finger(); if (!film || !f) return; const st = $("stage");
    place(f, st.clientWidth * .42, st.clientHeight - 40);
    dT(() => place(f, st.clientWidth * .42, st.clientHeight - 110, 450), 120);
    // the thumbnails rise into place one after another, then fade out together
    const cards = [...film.children], ease = "cubic-bezier(.2,.8,.2,1)";
    if (!disabled) {
      dT(() => { film.style.display = "flex"; cards.forEach((c, i) => c.animate([{ opacity: 0, transform: "translateY(10px) scale(.92)" }, { opacity: 1, transform: "none" }], { duration: 320, delay: Math.abs(i - 2) * 45, easing: ease, fill: "backwards" })); }, 430);
      dT(() => film.animate([{ opacity: 1 }, { opacity: 0, transform: "translateY(4px)" }], { duration: 220, easing: ease, fill: "forwards" }), 1050);
      label("Pull up on the seekbar: precise seeking opens");
    } else label("Pull up on the seekbar: precise seeking stays off", true);
    const close = () => { film.style.display = "none"; film.getAnimations().forEach(a => a.cancel()); };
    dT(close, 1290); hideF(f, 1150); onDemoStop(close);
  },
  morphe_swipe_left_zone(v) { swipeDemo("left", v); },
  morphe_swipe_right_zone(v) { swipeDemo("right", v); },
  // the overlay style (and its opacity and text size) is shared by every swipe zone: alternate sides
  morphe_swipe_overlay_style() {
    const side = ["left", "right", "top"][demoStep % (V("morphe_swipe_top_zone") && V("morphe_swipe_top_zone") !== "OFF" ? 3 : 2)];
    const v = V("morphe_swipe_" + side + "_zone");
    swipeDemo(side, v && v !== "OFF" ? v : side === "left" ? "BRIGHTNESS" : side === "right" ? "VOLUME" : "SPEED", "Shared by every zone · ");
  },
  morphe_swipe_top_zone(v) { swipeDemo("top", v); },
  // the overlay shows the way it is set up, and stays for the timeout after the finger lifts; the loop
  // waits for it, so a long timeout plays out in full
  morphe_swipe_overlay_timeout() {
    const ms = Math.max(0, Math.min(5000, Number(V("morphe_swipe_overlay_timeout")) || 0)), every = Math.ceil((1300 + ms) / LOOP_MS);
    if (demoStep % every) return;
    const side = ["left", "right", "top"].find(x => { const v = V("morphe_swipe_" + x + "_zone"); return v && v !== "OFF"; }) || "left";
    const v = V("morphe_swipe_" + side + "_zone");
    swipeDemo(side, v && v !== "OFF" ? v : "BRIGHTNESS", "", false, ms);
    dT(() => label(`Finger lifted: the overlay stays ${ms} ms`, false, ms + 200), 1050);
  },
  morphe_swipe_speed_step() { swipeDemo(speedSide(), "SPEED"); dT(() => label(`Speed changes in ${(SPEED_STEPS[V("morphe_swipe_speed_step")] || .05).toFixed(2)}x steps`), 1000); },
  morphe_swipe_speed_sensitivity() { swipeDemo(speedSide(), "SPEED"); dT(() => label(`Sensitivity ${V("morphe_swipe_speed_sensitivity")}: this swipe reaches ${speedAt(1)}`), 1000); },
  morphe_swipe_overlay_background_opacity() { stillHud(); },
  morphe_swipe_text_overlay_size() { stillHud(); },
  morphe_swipe_overlay_progress_volume_color() { swipeDemo("right", "VOLUME"); },
  morphe_swipe_overlay_progress_brightness_color() { swipeDemo("left", "BRIGHTNESS"); },
  morphe_swipe_overlay_progress_speed_color() { swipeDemo("right", "SPEED"); },
  morphe_swipe_zone_width() { swipeZones(1400, true); label(`Left and right zones: ${V("morphe_swipe_zone_width")}% of the width each`, false, 1400); },
  morphe_swipe_seek(on) {
    const f = finger(); if (!f) return; const W = $("stage").clientWidth;
    place(f, W * .35, 80); dT(() => place(f, W * .7, 80, 650), 150);
    if (on) { { const t = seekJump(); label(`Swipe sideways in fullscreen: +${t}, release to seek`); showPill(`+${t}  ▸▸`); } } else label("Swipe sideways: does nothing (stock)", true);
    hideF(f, 1100);
  },
  morphe_disable_shorts_double_tap_to_like(disabled) {
    const W = $("stage").clientWidth;
    tapAt(W * .45, 170); dT(() => tapAt(W * .45, 170), 180);
    const h = $("heart");
    if (!disabled && h) { dT(() => { h.style.transform = "translate(-50%,-50%) scale(1)"; }, 260); dT(() => { h.style.transform = "translate(-50%,-50%) scale(0)"; }, 900); label("Double-tap: likes the Short (stock)"); }
    else label("Double-tap: does nothing, no accidental likes", true);
  },
  morphe_autoplay_mode(v) {
    const cd = document.querySelector("#stage .cd");
    if (cd) { let n = 5; cd.textContent = n; const t = dEvery(() => { n--; if (n < 1 || !document.body.contains(cd)) { clearInterval(t); return; } cd.textContent = n; }, 250); }
    label(`Autoplay: ${entryLabel("morphe_autoplay_mode", v)}`, v === "OFF");
  },
  morphe_disable_like_subscribe_glow(disabled) {
    const chip = document.querySelector("#stage .likechip");
    if (chip && !disabled) { chip.animate([{ boxShadow: "0 0 0 0 rgba(62,166,255,0)" }, { boxShadow: "0 0 10px 3px rgba(62,166,255,.8)" }, { boxShadow: "0 0 0 0 rgba(62,166,255,0)" }], { duration: 1100 }); label("Creator says \"hit like\": button glows (stock)"); }
    else label("Creator says \"hit like\": no glow", true);
  },
  morphe_stable_caption_blocks(on) {
    const line = $("capLine"); if (!line) return;
    const words = "the pancake needs to rest for one minute".split(" ");
    if (on) { line.textContent = words.join(" "); line.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250 }); label("Stable blocks: whole sentence at once"); }
    else { let i = 0; line.textContent = ""; const t = dEvery(() => { if (!document.body.contains(line) || i >= words.length) { clearInterval(t); return; } line.textContent += (i ? " " : "") + words[i++]; }, 120); label("Word by word: text shifts as spoken (stock)"); }
  },
  morphe_niconico_comments(on) { label(on ? "Comments fly across the video" : "Flying comments are off", !on); },
};
const argb = (v, fallback) => { const m = /^#([0-9a-f]{2})?([0-9a-f]{6})$/i.exec(String(v || "")); if (!m) return fallback; const a = m[1] ? parseInt(m[1], 16) / 255 : 1; const n = parseInt(m[2], 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a.toFixed(2)})`; };
function swipeZones(ms = 900, labels = false) {
  const st = $("stage").firstElementChild; if (!st) return;
  st.querySelectorAll(".zones").forEach(z => z.remove());
  const zw = Math.max(5, Math.min(50, Number(V("morphe_swipe_zone_width")) || 37));
  const th = Math.max(10, Math.min(60, Number(V("morphe_swipe_speed_zone_height")) || 30));
  const act = side => V("morphe_swipe_" + side + "_zone");
  const name = side => { const v = act(side); return !v || v === "OFF" ? "Off" : entryLabel("morphe_swipe_" + side + "_zone", v); };
  const top = act("top") && act("top") !== "OFF";
  const lab = side => labels ? `<b>${side[0].toUpperCase() + side.slice(1)}<small>${esc(name(side))}</small></b>` : "";
  const z = document.createElement("div"); z.className = "zones" + (labels ? " lab" : "");
  z.innerHTML = `<i class="${act("left") === "OFF" ? "zoff" : ""}" style="left:0;width:${zw}%">${lab("left")}</i><i class="${act("right") === "OFF" ? "zoff" : ""}" style="right:0;width:${zw}%">${lab("right")}</i>${top || labels ? `<i class="${top ? "" : "zoff"}" style="left:${zw}%;right:${zw}%;top:0;bottom:auto;height:${th}%">${lab("top")}</i>` : ""}`;
  st.appendChild(z);
  // a live change (dragging a zone slider) slides the zones from their last size instead of snapping
  const prev = swipeZones.last; swipeZones.last = { zw, th };
  if (!ms && prev && (prev.zw !== zw || prev.th !== th)) {
    const [l, r, t] = z.querySelectorAll(":scope > i");
    const set = (w, h) => { if (l) l.style.width = w + "%"; if (r) r.style.width = w + "%"; if (t) { t.style.left = t.style.right = w + "%"; t.style.height = h + "%"; } };
    set(prev.zw, prev.th); void z.offsetWidth; z.classList.add("slide"); set(zw, th);
  }
  if (ms) { dT(() => z.classList.add("out"), ms); dT(() => z.remove(), ms + 400); }
}
// still: the overlay stays up, half full and without a finger, so a slider for its look (opacity,
// text size) can be dragged while watching it change
// hold: how long the overlay stays after the finger lifts (the "Swipe overlay timeout" demo passes the
// setting; the other demos keep it short so they fit their loop)
function swipeDemo(side, action, prefix = "", still = false, hold = 100) {
  const st = $("stage"), f = finger(), hud = $("hud"); if (!f || !hud) return;
  const zw = Math.max(5, Math.min(50, Number(V("morphe_swipe_zone_width")) || 37)) / 100;
  const W = st.clientWidth, H = st.firstElementChild.clientHeight, x = side === "top" ? W * .5 : side === "left" ? W * zw / 2 : W * (1 - zw / 2);
  if (!still) {
    swipeZones();
    if (side === "top") { place(f, W * .35, H * .12); dT(() => place(f, W * .65, H * .12, 800), 120); }
    else { place(f, x, H * .75); dT(() => place(f, x, H * .25, 800), 120); }
  }
  const sideName = side === "top" ? "Top" : side === "left" ? "Left" : "Right";
  if (!action || action === "OFF") { label(`${sideName} swipe: does nothing (off)`, true); hud.style.display = "none"; }
  else {
    const ic = action === "VOLUME" ? "vol" : action === "BRIGHTNESS" ? "bright" : "speed";
    const style = state.morphe_swipe_overlay_style || "HORIZONTAL";
    const circ = style.startsWith("CIRCULAR"), vert = style.startsWith("VERTICAL"), min = style.includes("MINIMAL");
    const bgA = (Number(V("morphe_swipe_overlay_background_opacity")) || 0) / 100;
    const col = argb(V(action === "VOLUME" ? "morphe_swipe_overlay_progress_volume_color" : action === "BRIGHTNESS" ? "morphe_swipe_overlay_progress_brightness_color" : "morphe_swipe_overlay_progress_speed_color"), "#fff");
    const ts = Math.max(8, Math.min(30, Number(V("morphe_swipe_text_overlay_size")) || 14)) * .8;
    const txt = `<span class="hv" style="font-size:${ts}px;font-weight:600;color:#fff;font-variant-numeric:tabular-nums">${action === "SPEED" ? "1.0x" : "20"}</span>`;
    let inner;
    if (circ) inner = `<div style="width:64px;height:64px;border-radius:50%;background:conic-gradient(${col} var(--p,0%),rgba(255,255,255,.25) 0);display:grid;place-items:center"><div style="width:52px;height:52px;border-radius:50%;background:rgba(0,0,0,${bgA});display:grid;place-items:center">${I(ic)}${txt}</div></div>`;
    else if (vert) inner = `<div style="display:grid;justify-items:center;gap:6px;background:rgba(0,0,0,${bgA});padding:8px;border-radius:14px">${I(ic)}<div style="width:6px;height:80px;background:rgba(255,255,255,.25);border-radius:3px;position:relative"><div style="position:absolute;bottom:0;left:0;right:0;height:var(--p,0%);background:${col};border-radius:3px"></div></div>${txt}</div>`;
    else inner = `<div style="display:flex;align-items:center;gap:8px;background:rgba(0,0,0,${bgA});padding:8px 12px;border-radius:18px">${I(ic)}<div style="width:110px;height:5px;background:rgba(255,255,255,.25);border-radius:3px;position:relative"><div style="position:absolute;left:0;top:0;bottom:0;width:var(--p,0%);background:${col};border-radius:3px"></div></div>${txt}</div>`;
    hud.innerHTML = inner; hud.style.display = "block";
    if (style === "HORIZONTAL_MINIMAL_TOP") { hud.style.left = "50%"; hud.style.right = "auto"; hud.style.top = "12px"; hud.style.transform = "translateX(-50%)"; }
    else if (vert) { hud.style.left = side === "left" ? "auto" : "14px"; hud.style.right = side === "left" ? "14px" : "auto"; hud.style.top = "50%"; hud.style.transform = "translateY(-50%)"; }
    else { hud.style.left = "50%"; hud.style.right = "auto"; hud.style.top = "50%"; hud.style.transform = "translate(-50%,-50%)"; }
    // the bar follows the finger frame by frame: it reads where the finger actually is on its way,
    // so the fill and the number move exactly with it instead of stepping on a timer of their own
    const hv = hud.querySelector(".hv"), a0 = side === "top" ? W * .35 : H * .75, a1 = side === "top" ? W * .65 : H * .25;
    const show = fr0 => {
      // the threshold: the first stretch of the swipe changes nothing
      const dead = swipeDead(), fr = Math.max(0, (fr0 - dead) / (1 - dead));
      const [frac, txt] = action === "VOLUME" ? volAt(fr) : action === "BRIGHTNESS" ? brightAt(fr) : [.2 + .7 * fr, speedAt(fr)];
      hud.style.setProperty("--p", (frac * 100).toFixed(2) + "%");
      if (hv) hv.textContent = txt;
    };
    if (still) { show(.6); hud.style.transition = "none"; hud.style.opacity = "1"; return; }
    show(0);
    hud.style.transition = "opacity 160ms var(--ease)"; hud.style.opacity = "0"; requestAnimationFrame(() => { hud.style.opacity = "1"; });
    const t0 = performance.now();
    const t = dEvery(() => {
      const cur = parseFloat(getComputedStyle(f)[side === "top" ? "left" : "top"]);
      show(Math.max(0, Math.min(1, (cur - a0) / (a1 - a0))));
      if (performance.now() - t0 > 1000) clearInterval(t);
    }, 16);
    label(`${prefix}${sideName} swipe: ${entryLabel("morphe_swipe_" + side + "_zone", action) || action.toLowerCase()}`);
    dT(() => { hud.style.opacity = "0"; }, 1050 + hold);
    dT(() => { hud.style.display = "none"; hud.style.opacity = ""; }, 1220 + hold);
  }
  hideF(f, 1050);
}
// the speed a swipe reaches: it moves in "Speed step" steps, and a higher "Speed swipe sensitivity"
// needs more swiping per step, so the same swipe covers fewer steps (as in Morphe)
const SPEED_STEPS = { STEP_005: .05, STEP_010: .1, STEP_025: .25 };
function speedAt(fr) {
  const step = SPEED_STEPS[V("morphe_swipe_speed_step")] || .05, sens = Math.max(1, Number(V("morphe_swipe_speed_sensitivity")) || 10);
  const n = Math.floor(fr * 10 * (10 / sens) + 1e-6); // ticks this swipe covers
  return Math.min(8, 1 + n * step).toFixed(2).replace(/0$/, "") + "x";
}
// Volume and brightness follow their settings the same way: "Volume steps" splits the bar into that
// many steps, a higher volume or brightness sensitivity needs more swiping per step, and "Swipe magnitude
// threshold" is a dead stretch at the start of every swipe. Each returns [bar fill 0-1, shown value].
const VOL_STEPS = { STEPS_5: 5, STEPS_10: 10, STEPS_15: 15, STEPS_20: 20, STEPS_30: 30, STEPS_50: 50 };
const volSteps = () => VOL_STEPS[V("morphe_swipe_volume_steps")] || 15; // device default: 15 on most phones
function volAt(fr) {
  const steps = volSteps(), dist = Math.max(1, Number(V("morphe_swipe_volume_distance")) || 10), start = Math.round(steps * .2);
  const n = Math.min(steps, start + Math.floor(fr * (steps - start) * (10 / dist) + 1e-6)); return [n / steps, `${n} / ${steps}`];
}
function brightAt(fr) { const sens = Math.max(1, Number(V("morphe_swipe_brightness_sensitivity")) || 1), p = Math.min(100, Math.round(20 + 80 * fr / sens)); return [p / 100, p + "%"]; }
const swipeDead = () => Math.max(0, Math.min(.6, (Number(V("morphe_swipe_threshold")) || 0) / 300));
// "Seek swipe sensitivity" (100 by default) scales how far a sideways swipe seeks
const seekJump = () => { const s = Math.max(0, Math.round(90 * (Number(V("morphe_swipe_seek_sensitivity")) || 100) / 100)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
const activeSide = () => ["left", "right", "top"].find(x => { const v = V("morphe_swipe_" + x + "_zone"); return v && v !== "OFF"; }) || "left";
const zoneAction = side => { const v = V("morphe_swipe_" + side + "_zone"); return v && v !== "OFF" ? v : "BRIGHTNESS"; };
const sideFor = (action, fallback) => ["left", "right", "top"].find(x => V("morphe_swipe_" + x + "_zone") === action) || fallback;
const speedSide = () => ["left", "right", "top"].find(x => V("morphe_swipe_" + x + "_zone") === "SPEED") || "right";
// the overlay's look, held still on the first zone that has a gesture; dragging its slider redraws it live
function stillHud() {
  const side = ["left", "right", "top"].find(x => { const v = V("morphe_swipe_" + x + "_zone"); return v && v !== "OFF"; }) || "left";
  const v = V("morphe_swipe_" + side + "_zone");
  swipeDemo(side, v && v !== "OFF" ? v : "BRIGHTNESS", "", true);
}
// redrawn on every step of a slider or keystroke in a number box, so the preview follows the value live
const LIVE_HUD = {
  morphe_swipe_overlay_background_opacity: stillHud, morphe_swipe_text_overlay_size: stillHud,
  morphe_swipe_zone_width: () => swipeZones(0, true), morphe_swipe_speed_zone_height: () => swipeZones(0, true),
};
function startDemo(k) {
  stopDemo();
  const fn = DEMOS[k]; if (!fn) return;
  demoStep = 0;
  // the clock drops these as soon as another demo starts, so a stale loop can't stop the new one
  const run = () => {
    if (selected !== k) return stopDemo();
    demoOnGhost = DEMO_TYPE[k] === "transient" && (ghosts.has(k) || fading.has(k));
    // previewed while hidden: play the story of the element being there (a hide key's "shown" value is false)
    fn(demoOnGhost ? !isHideKey(k) : V(k)); demoStep++;
  };
  dT(run, 60);
  clock.every("demo", LOOP_MS, run);
}
const isAnimated = k => { const a = A[k]; return !!a && (a.kind === "gesture" || a.kind === "behaviour" || a.kind === "scenario" || !!DEMOS[k]); };

// ------------------------------------------------------------------ seekbar: more animations
def("seekbar", "style", "custom_seekbar_thumb custom_seekbar_thumb_scale_type");
Object.assign(DEMOS, {
  morphe_seekbar_thumbnail_preview(on) {
    const seek = $("seek"), f = finger(), bub = $("thumbBubble"); if (!seek || !f) return;
    const st = $("stage").getBoundingClientRect(), r = seek.getBoundingClientRect();
    const pr = bub && bub.offsetParent ? bub.offsetParent.getBoundingClientRect() : st;
    const y = r.top - st.top + r.height / 2, p0 = 17, p1 = 70, total = 18 * 60 + 42;
    const xAt = pct => r.left + r.width * pct / 100;
    const played = $("played"), knob = $("knob"), ring = $("knobRing"), tl = bub && bub.querySelector(".time");
    [played, knob, ring].forEach(e => e && (e.style.transition = "none"));
    if (bub) { bub.classList.add("dragging"); bub.style.opacity = on ? "1" : "0"; }
    const frame = pct => {
      setSeek(pct); place(f, xAt(pct) - st.left, y);
      if (bub) { const half = 50, x = Math.min(Math.max(xAt(pct) - pr.left, half + 4), pr.width - half - 4); bub.style.left = x + "px"; }
      if (tl) tl.textContent = fmt(total, pct);
    };
    const reset = () => { if (bub) { bub.classList.remove("dragging"); bub.style.left = ""; bub.style.opacity = ""; } if (tl) tl.textContent = "7:51"; [played, knob, ring].forEach(e => e && (e.style.transition = "")); setSeek(p0); };
    onDemoStop(reset);
    frame(p0); f.classList.add("hold");
    const t0 = performance.now() + 180, dur = 1000, tok = clock.run("demo");
    const step = now => {
      if (!clock.alive("demo", tok) || !document.body.contains(seek)) return;
      const t = Math.min(1, Math.max(0, (now - t0) / dur)), e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      frame(p0 + (p1 - p0) * e);
      if (t < 1) requestAnimationFrame(step);
      else dT(() => { f.classList.remove("show", "hold"); reset(); }, 300);
    };
    requestAnimationFrame(step);
    label(on ? "Drag the seekbar: a thumbnail follows your finger" : "Drag the seekbar: no thumbnail, only the time", !on);
  },
  // Watch later button: a tap, then a tap and hold; which one saves and which opens the queue options swaps
  morphe_swap_save_and_queue_actions(swapped) {
    const btn = [...document.querySelectorAll('#stage [data-k="morphe_save_to_watch_later_button"]')].find(e => e.getClientRects().length); if (!btn) return;
    // the player scene has no finger of its own: add one
    if (!finger()) { const v = $("stage").firstElementChild; if (!v) return; v.insertAdjacentHTML("beforeend", `<div class="finger">${I("gesture")}</div>`); }
    const f = finger();
    const st = $("stage").getBoundingClientRect(), r = btn.getBoundingClientRect(), x = r.left - st.left + r.width / 2, y = r.top - st.top + r.height / 2;
    const hold = demoStep % 2 === 1, queue = hold !== swapped;
    if (hold) { place(f, x, y); f.classList.add("hold"); dT(() => f.classList.remove("hold"), 650); hideF(f, 900); } else tapAt(x, y);
    dT(() => showPill(queue ? "Queue: Play next · Add to queue" : "Saved to Watch later", 900), hold ? 600 : 150);
    label(`${hold ? "Tap and hold" : "Tap"}: ${queue ? "queue options" : "saves to Watch later"}`, false);
  },
  morphe_hide_player_gesture_hints(hidden) {
    const f = finger(); if (!f) return; const st = $("stage");
    const hint = document.querySelector('#stage [data-k="morphe_hide_player_gesture_hints"]');
    place(f, st.clientWidth * .42, st.clientHeight - 16); dT(() => place(f, st.clientWidth * .42, st.clientHeight - 90, 600), 120);
    if (hint) { fadeC(hint, false); dT(() => fadeC(hint, !hidden), 300); dT(() => fadeC(hint, true), 1400); onDemoStop(() => hint.classList.remove("dz", "dzt")); }
    label(hidden ? "Pull up on the seekbar: no hint appears" : "Pull up on the seekbar: the hint explains the gesture", hidden);
    hideF(f, 1100);
  },
});
const liveDev = (rew) => `${miniVideo(5)}<span style="position:absolute;left:8px;top:7px;font-size:8px;font-weight:700;background:#cc0000;padding:1px 4px;border-radius:2px">LIVE</span><div class="msk" style="position:absolute;left:8%;right:8%;bottom:16%;height:3px;background:rgba(255,255,255,.3)"><div class="buf" style="position:absolute;left:${rew}%;right:0;top:0;bottom:0;background:rgba(255,255,255,.35)"></div><div class="mp" style="position:absolute;left:0;top:0;bottom:0;width:100%;background:#ff0033;transition:width .9s var(--ease)"></div></div>`;
scen("seekbar", "live_stream_dvr", (box, on) => {
  situation("A live stream that blocks rewinding", true);
  box.innerHTML = device("land", liveDev(on ? 0 : 96));
  const dev = box.querySelector(".dev"), f = box.querySelector("#scFinger"), mp = dev.querySelector(".mp"); const W = dev.clientWidth, H = dev.clientHeight;
  at(150, () => fingerTo(f, W * .9, H * .84)); at(450, () => { fingerTo(f, W * .35, H * .84, 900); if (on) mp.style.width = "35%"; });
  at(1400, () => dev.insertAdjacentHTML("beforeend", `<div class="toastin" style="top:8px">${on ? "−1:12:40 · rewinding" : "This stream can't be rewound"}</div>`));
  return on ? "You can drag back on any live stream" : "Rewinding is blocked on this stream (stock)";
});
scen("seekbar", "expand_live_stream_dvr_duration", (box, on) => {
  situation("Dragging back on a long live stream");
  box.innerHTML = device("land", liveDev(on ? 0 : 70));
  const dev = box.querySelector(".dev"), f = box.querySelector("#scFinger"), mp = dev.querySelector(".mp"); const W = dev.clientWidth, H = dev.clientHeight;
  at(150, () => fingerTo(f, W * .9, H * .84)); at(450, () => { fingerTo(f, W * .1, H * .84, 1000); mp.style.width = on ? "3%" : "70%"; });
  at(1500, () => dev.insertAdjacentHTML("beforeend", `<div class="toastin" style="top:8px">${on ? "−3 days · stream start" : "Stops at −4:00:00"}</div>`));
  return on ? "Rewind up to 7 days back" : "Rewind stops after a few hours (stock)";
});
// ------------------------------------------------------------------ section membership
let MEMBERS = {};
// ------------------------------------------------------------------ round 7 additions
Object.assign(DEMOS, {
  // the + button opens the segment editor: mark start and end, nudge by the time step, pick a category
  morphe_sb_create_new_segment(on) {
    const st = $("stage").firstElementChild; if (!st || !on) { label("The 'Create new segment' button is hidden", true, 1300); return; }
    st.querySelectorAll(".sbedit").forEach(n => n.remove());
    const step = Number(V("morphe_sb_create_new_segment_step")) || 150;
    const ed = document.createElement("div"); ed.className = "sbedit";
    ed.innerHTML = `<span class="chip">${I("prev", "ico", 'style="width:14px;height:14px"')} −${step} ms</span><span class="chip" style="background:#3ea6ff;color:#000">Start 1:30</span><span class="chip">End …</span><span class="chip">+${step} ms ${I("next", "ico", 'style="width:14px;height:14px"')}</span><span class="chip">${I("arrow", "ico", 'style="width:14px;height:14px"')} Publish</span>`;
    st.appendChild(ed); label("Create a segment: mark start and end, adjust, publish", false, 1300);
    dT(() => ed.remove(), 1450);
  },
  morphe_sb_create_new_segment_step() { DEMOS.morphe_sb_create_new_segment(true); },
  morphe_sb_voting_button(on) {
    const st = $("stage").firstElementChild; if (!st || !on) { label("The voting button is hidden", true, 1300); return; }
    st.querySelectorAll(".sbedit").forEach(n => n.remove());
    const ed = document.createElement("div"); ed.className = "sbedit";
    ed.innerHTML = `<span class="chip">${I("like", "ico", 'style="width:14px;height:14px"')} Upvote</span><span class="chip">${I("dislike", "ico", 'style="width:14px;height:14px"')} Downvote</span><span class="chip">Change category</span>`;
    st.appendChild(ed); label("Vote on the segments of this video", false, 1300); dT(() => ed.remove(), 1450);
  },
});
// Shared pieces for small "phone" scenarios: a page made of rows, a toast, a sheet.
const pageRows = (rows) => `<div class="pg7" style="position:absolute;inset:0;background:#0f0f0f;padding:6px;display:grid;grid-template-columns:minmax(0,1fr);grid-auto-rows:max-content;gap:5px;align-content:start;font-size:7px;color:#ddd">${rows}</div>`;
const bar7 = (w = 100, c = "#2a2a2a", h = 6) => `<i style="display:block;height:${h}px;width:${w}%;border-radius:3px;background:${c}"></i>`;
const cmt7 = (i, txt) => `<div class="cm7" style="display:flex;gap:4px;align-items:flex-start;padding:3px;border-radius:4px;transition:background .2s"><span style="width:12px;height:12px;border-radius:50%;background:${AV[i % AV.length]};flex:none"></span><span style="line-height:1.3">${txt}</span></div>`;
function toast7(dev, text, top = "78%") { dev.querySelectorAll(".t7").forEach(n => n.remove()); dev.insertAdjacentHTML("beforeend", `<div class="toastin t7" style="top:${top}">${text}</div>`); keepPillIn(dev.lastElementChild); /* fitted at once, not a frame later */ }
// a sheet in a scenario phone dims what it opens over, like the player menu sheets in the preview
function sheet7(dev, rows) { dev.insertAdjacentHTML("beforeend", `<div class="shs7" style="position:absolute;inset:0;background:rgba(0,0,0,.5);animation:ghostin .25s var(--ease);z-index:5"></div><div class="sh7" style="position:absolute;left:0;right:0;bottom:0;background:#212121;border-radius:8px 8px 0 0;padding:6px;display:grid;gap:4px;font-size:7.5px;animation:sheetup .25s var(--ease);z-index:5">${rows}</div>`); }
function holdAt(f, x, y) { fingerTo(f, x, y); f.classList.add("hold"); }

scen("comments", "copy_comments", (box, on) => {
  situation("Holding a comment");
  box.innerHTML = device("port", pageRows(`<b style="font-size:8px">Comments</b>${cmt7(2, "The wood stove at 12:04 is pure cosiness")}${cmt7(5, "Kom igjen! Taket trenger en egen video.")}${cmt7(3, "Subscribed for part 2")}`));
  const dev = box.querySelector(".dev"), f = box.querySelector("#scFinger"); const W = dev.clientWidth, H = dev.clientHeight;
  const c = dev.querySelectorAll(".cm7")[0];
  at(200, () => holdAt(f, W * .55, H * .13)); at(700, () => { c.style.background = "rgba(255,255,255,.12)"; });
  at(1100, () => { f.classList.remove("hold", "show"); if (on) toast7(dev, "Comment copied"); else sheet7(dev, ["Report", "Block user"].map(t => `<div>${t}</div>`).join("")); });
  return on ? "Hold a comment: its text is copied" : "Hold a comment: only the report menu (stock)";
});
scen("comments", "search_comments", (box, on) => {
  const list = ["The wood stove at 12:04 is pure cosiness", "Which stove model is that?", "Subscribed for part 2", "Stove + rain = perfect"];
  box.innerHTML = device("port", pageRows(`<div style="display:flex;align-items:center;gap:4px"><b style="font-size:8px;flex:1">Comments</b>${on ? `<span class="srch7" style="width:10px;height:10px;display:grid;place-items:center">${I("search", "ico", 'style="width:10px;height:10px"')}</span>` : ""}</div><div class="q7" style="height:0;overflow:hidden;transition:height .25s"><div style="height:12px;border-radius:6px;background:#2c2c2c;padding:0 5px;line-height:12px;color:#aaa"></div></div>${list.map((t, i) => cmt7(i + 1, t)).join("")}`));
  const dev = box.querySelector(".dev"), f = box.querySelector("#scFinger"); const W = dev.clientWidth, H = dev.clientHeight;
  if (!on) { toast7(dev, "No search in comments", "60%"); return "No way to search the loaded comments (stock)"; }
  at(200, () => fingerTo(f, W * .88, H * .055)); at(550, () => tapF(f));
  at(750, () => { f.classList.remove("show"); dev.querySelector(".q7").style.height = "14px"; });
  const q = dev.querySelector(".q7 div"); "stove".split("").forEach((ch, i) => at(950 + i * 110, () => { q.textContent += ch; }));
  at(1600, () => dev.querySelectorAll(".cm7").forEach((c, i) => { if (!/stove/i.test(list[i])) { c.style.transition = "opacity .25s, height .3s"; c.style.opacity = "0"; later(() => { c.style.display = "none"; }, 260); } }));
  return "Search button: shows only the loaded comments with your words";
});
scen("channel", "channel_search", (box, on) => {
  const ico = (c) => I("search", "ico", `style="width:10px;height:10px;${c ? "fill:" + c : ""}"`);
  box.innerHTML = device("port", pageRows(`<div class="top7" style="height:14px;display:flex;align-items:center;justify-content:flex-end;gap:6px;white-space:nowrap;overflow:hidden">${on ? `<span style="display:grid;place-items:center;width:14px;height:14px;border-radius:50%;background:rgba(62,166,255,.18)">${ico("#3ea6ff")}</span>` : ""}${ico()}</div><div style="height:22px;border-radius:4px;background:${ART[3]}"></div><div style="display:flex;gap:4px;align-items:center"><span style="width:16px;height:16px;border-radius:50%;background:${AV[0]}"></span><b style="font-size:8px">Fjord &amp; Timber</b></div><div class="body7" style="display:grid;gap:5px">${bar7(80)}${bar7(60)}${[0, 1, 2].map(i => `<div style="display:flex;gap:4px;align-items:center"><div style="width:26px;height:15px;border-radius:2px;background:${ART[i + 1]}"></div>${bar7(50)}</div>`).join("")}</div>`));
  const dev = box.querySelector(".dev"), f = box.querySelector("#scFinger"); const W = dev.clientWidth, H = dev.clientHeight;
  const top = dev.querySelector(".top7"), body = dev.querySelector(".body7");
  const tx = on ? W - 6 - 10 - 6 - 7 : W - 6 - 5, ty = 6 + 7;
  at(200, () => fingerTo(f, tx, ty)); at(550, () => tapF(f));
  at(800, () => {
    f.classList.remove("show");
    top.style.justifyContent = "flex-start";
    top.innerHTML = `${I("back", "ico", 'style="width:9px;height:9px;flex:none"')}<div style="flex:1;min-width:0;height:13px;border-radius:7px;background:#2c2c2c;font-size:7px;line-height:13px;padding:0 6px;color:#ddd;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"><span class="q7" style="color:#fff"></span><span class="ph7" style="color:#888">${on ? "Search this channel" : "Search YouTube"}</span></div>`;
  });
  "stove".split("").forEach((ch, i) => at(1050 + i * 90, () => { dev.querySelector(".ph7")?.remove(); const q = dev.querySelector(".q7"); if (q) q.textContent += ch; }));
  at(1600, () => {
    body.style.transition = "opacity .2s"; body.style.opacity = "0";
    later(() => {
      body.innerHTML = `<span style="color:#aaa;font-size:6.5px">${on ? "Results from Fjord &amp; Timber" : "Results from all of YouTube"}</span>` + [0, 1, 2].map(i => `<div style="display:flex;gap:4px;align-items:center"><div style="width:26px;height:15px;border-radius:2px;background:${ART[on ? i : i + 4]};flex:none"></div><span style="font-size:6.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${on ? ["Stove install, part 1", "Stove vs rain", "Cabin stove tour"][i] : ["Other channel · stove", "Stove review 2026", "Camping stoves ranked"][i]}</span></div>`).join("");
      body.style.opacity = "1";
    }, 210);
  });
  return on ? "Second search button: results only from this channel" : "Search button: searches all of YouTube (stock)";
});
scen("description", "copy_select_text", (box, on) => {
  situation("Holding the description text");
  box.innerHTML = device("port", pageRows(`<b style="font-size:8px">Description</b><span class="d7" style="line-height:1.35">Two weeks, one 12 m² cabin and a lot of <span class="w7">reclaimed pine</span>.</span>${bar7(90)}${bar7(70)}`));
  const dev = box.querySelector(".dev"), f = box.querySelector("#scFinger"); const W = dev.clientWidth, H = dev.clientHeight;
  at(200, () => holdAt(f, W * .45, H * .13));
  at(900, () => { f.classList.remove("hold", "show"); if (!on) { toast7(dev, "Nothing happens", "60%"); return; } const w = dev.querySelector(".w7"); w.style.background = "rgba(62,166,255,.45)"; w.style.borderRadius = "2px"; dev.insertAdjacentHTML("beforeend", `<div class="toastin" style="top:6%;background:#333">Copy · Select all · Share</div>`); });
  return on ? "Hold the description: select any part and copy it" : "Hold the description: nothing to select (stock)";
});
scen("watch", "copy_video_title", (box, on) => {
  situation("Holding the video title");
  box.innerHTML = device("port", playerArea(0) + `<div style="position:absolute;left:6px;right:6px;top:38%;font-size:8px;font-weight:600;line-height:1.3" class="tt7">Building a tiny cabin in the Norwegian forest</div>`);
  const dev = box.querySelector(".dev"), f = box.querySelector("#scFinger"); const W = dev.clientWidth, H = dev.clientHeight;
  at(200, () => holdAt(f, W * .5, H * .41));
  at(900, () => { f.classList.remove("hold", "show"); if (on) { dev.querySelector(".tt7").style.background = "rgba(255,255,255,.12)"; toast7(dev, "Title copied"); } else toast7(dev, "Description opens", "80%"); });
  return on ? "Hold the title: it is copied" : "Hold the title: same as a tap, the description opens (stock)";
});
scen("watch", "open_system_share_sheet", (box, on) => {
  situation("Tapping Share");
  box.innerHTML = device("port", playerArea(0) + `<div style="position:absolute;left:6px;top:40%;display:flex;gap:4px">${["like", "share", "save"].map(n => `<span style="background:#272727;border-radius:7px;padding:2px 5px;display:grid;place-items:center">${I(n, "ico", 'style="width:9px;height:9px"')}</span>`).join("")}</div>`);
  const dev = box.querySelector(".dev"), f = box.querySelector("#scFinger"); const W = dev.clientWidth, H = dev.clientHeight;
  at(200, () => fingerTo(f, W * .3, H * .43)); at(550, () => tapF(f));
  at(800, () => { f.classList.remove("show"); sheet7(dev, on ? `<div style="font-weight:600">Share with</div><div style="display:flex;gap:6px">${[1, 2, 3, 4].map(i => `<span style="width:14px;height:14px;border-radius:50%;background:${AV[i]}"></span>`).join("")}</div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px">${[0, 1, 2, 3].map(i => `<span style="height:12px;border-radius:3px;background:#3a3a3a"></span>`).join("")}</div>` : `<div style="font-weight:600">Share</div><div style="display:flex;gap:4px">${["#ff0033", "#25d366", "#1877f2", "#aaa"].map(c => `<span style="width:13px;height:13px;border-radius:50%;background:${c}"></span>`).join("")}</div><div>Copy link</div>`); });
  return on ? "Share: Android's own share sheet opens" : "Share: YouTube's in-app share panel opens (stock)";
});
scen("watch", "remove_viewer_discretion_dialog", (box, on) => {
  situation("Opening an age-sensitive video");
  box.innerHTML = device("port", playerArea(2));
  const dev = box.querySelector(".dev"), f = box.querySelector("#scFinger"); const W = dev.clientWidth, H = dev.clientHeight;
  dev.insertAdjacentHTML("beforeend", `<div class="dlg7" style="position:absolute;left:8%;right:8%;top:30%;background:#282828;border-radius:6px;padding:6px;font-size:7px;display:grid;gap:4px;transition:opacity .25s"><b>Viewer discretion advised</b><span style="color:#aaa">This video may be inappropriate for some users.</span><span style="justify-self:end;color:#3ea6ff">I understand</span></div>`);
  const d = dev.querySelector(".dlg7");
  if (on) { d.style.opacity = "0"; at(100, () => d.style.opacity = "1"); at(400, () => { d.style.opacity = "0"; toast7(dev, "Accepted for you", "70%"); }); return "The dialog is accepted automatically (age limits still apply)"; }
  toast7(dev, "Playback waits for you", "82%");
  at(1300, () => fingerTo(f, W * .75, H * .47)); at(1900, () => tapF(f)); at(2100, () => { d.style.opacity = "0"; f.classList.remove("show"); dev.querySelectorAll(".t7").forEach(e => e.remove()); });
  at(2300, () => toast7(dev, "Every time you open one", "82%"));
  return "You have to confirm the dialog each time (stock)";
});

def("player", "style", "player_icon_style");
// DeArrow: the same video card in each place DeArrow can rewrite, original vs crowd-sourced title
SCENES.dearrow = () => {
  const places = [["dearrow_titles_home", "Home"], ["dearrow_titles_subscription", "Subscriptions"], ["dearrow_titles_search", "Search"], ["dearrow_titles_player", "Up next"], ["dearrow_titles_library", "You"]];
  const icon = !!V("morphe_dearrow_titles_icon"), casual = !!V("morphe_dearrow_casual_mode");
  const card = ([k, where], i) => {
    const on = !!V("morphe_" + k);
    const t = on ? (casual && i % 2 ? "I built a tiny cabin in Norway (original title kept)" : "Building a 12 m² cabin from reclaimed pine in two weeks") : "I BUILT a TINY CABIN in the FOREST?! 😱 (insane)";
    return C(k, `<div style="display:flex;gap:10px;padding:8px 12px;align-items:flex-start"><div style="width:132px;flex:none;position:relative">${thumb(on ? 3 : 0, "border-radius:8px")}${on ? `<span class="dur" style="left:4px;right:auto">still · ${entryLabel("morphe_dearrow_thumbnail_stills_time", V("morphe_dearrow_thumbnail_stills_time"))}</span>` : ""}</div>
      <div style="min-width:0"><div class="t2" style="font-size:10.5px;margin-bottom:2px">${where}</div><div class="t1" style="font-size:13px;line-height:1.3">${on && icon ? C("dearrow_titles_icon", `<span style="display:inline-grid;place-items:center;width:15px;height:15px;border-radius:4px;background:#1e88e5;margin-right:4px;vertical-align:1px;font-size:9px;line-height:1">DA</span>`, { tag: "span" }) : ""}${esc(t)}</div><div class="t2">Fjord & Timber · 1.2M views</div></div></div>`, { blk: 1 });
  };
  return `<div class="inner-scroll" style="background:#0f0f0f;max-height:350px;overflow-y:auto;padding:4px 0">
    ${places.map(card).join("")}
    ${C("dearrow_vote_button", `<div style="margin:6px 12px 10px"><span class="chip" style="height:30px">${I("like")} DeArrow: vote for a title</span></div>`, { blk: 1 })}
  </div>`;
};
def("dearrow", "vis", "dearrow_titles_icon dearrow_vote_button");
def("dearrow", "style", "dearrow_titles_home dearrow_titles_subscription dearrow_titles_search dearrow_titles_player dearrow_titles_library dearrow_casual_mode dearrow_thumbnail_stills_time");
// Playback: the player shows what its defaults lead to (speed, quality, HDR, codec), with the
// speed list of the custom speed menu under it.
SCENES.playback = () => {
  const spd = Number(V("morphe_playback_speed_default")), q = String(V("morphe_video_quality_default_wifi")), qm = String(V("morphe_video_quality_default_mobile"));
  const hdr = !V("morphe_disable_hdr_video") || !!V("morphe_force_hdr_video");
  const codec = V("morphe_video_codec"), pitch = Number(V("morphe_playback_audio_pitch_default"));
  const badge = (k, t, extra = "") => C(k, `<span class="chip" style="height:22px;font-size:11px;padding:0 7px;background:rgba(0,0,0,.6)${extra}">${t}</span>`, { tag: "span" });
  const speeds = speedList();
  return `<div class="inner-scroll" style="background:#0f0f0f;max-height:350px;overflow-y:auto">
    <div class="video" style="position:relative">${videoFrame(5)}<div class="scrim" style="opacity:.25"></div>
      <div style="position:absolute;left:8px;top:8px;display:flex;gap:5px;flex-wrap:wrap">
        ${badge("playback_speed_default", spd > 0 ? spd + "x" : "Auto speed")}
        ${badge("video_quality_default_wifi", `${I("wifi", "ico", 'style="width:12px;height:12px"')}${q === "-2" ? "Auto" : q + "p"}`)}
        ${badge("video_quality_default_mobile", `${I("phone", "ico", 'style="width:12px;height:12px"')}${qm === "-2" ? "Auto" : qm + "p"}`)}
        ${C("disable_hdr_video", `<span class="chip" style="height:22px;font-size:11px;padding:0 7px;background:${hdr ? "#d4a000;color:#000" : "rgba(0,0,0,.6)"}">${hdr ? "HDR" : "SDR"}</span>`, { tag: "span", also: "force_hdr_video" })}
        ${badge("video_codec", codec === "VP9" ? "VP9" : codec === "AVC" ? "H.264" : "Codec: auto")}
        ${pitch > 0 ? badge("playback_audio_pitch_default", `Pitch ${pitch}x`) : ""}
      </div>
      <div class="pbtn bigbtn" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,.3)">${I("pause")}</div>
      <div class="time" id="pbTime" style="position:absolute;left:12px;bottom:14px">3:12 / 18:42</div>
      <div class="seek" style="bottom:6px"><div class="played" style="width:17%"></div></div>
    </div>
    ${C("custom_playback_speeds", `<div style="padding:10px 12px 4px"><div class="t2" style="margin-bottom:6px">Playback speed</div><div style="display:flex;gap:6px;overflow-x:auto;scrollbar-width:none">${speeds.map(n => `<span class="chip" style="height:28px;flex:none;${n === (spd > 0 ? spd : 1) ? "background:#f1f1f1;color:#0f0f0f" : ""}">${n}x</span>`).join("")}</div></div>`, { blk: 1, also: "custom_speed_menu" })}
    <div style="padding:10px 12px 14px"><div class="t1">${esc(VIDEOS[5].t)}</div><div class="t2">${VIDEOS[5].c} · ${VIDEOS[5].v}</div></div>
  </div>`;
};
// Behaviour: a watch page, the place where autoplay, loops, live chat and the player's popups happen.
// Every setting here plays its own Off / On scenario; the page is what the tab shows between them.
SCENES.behaviour = () => {
  const ap = !!V("morphe_autoplay_control"), lc = !!V("morphe_loop_count");
  return `<div class="inner-scroll" style="background:#0f0f0f;max-height:350px;overflow-y:auto">
    <div class="video" style="position:relative">${videoFrame(3)}<div class="scrim" style="opacity:.25"></div>
      ${C("autoplay_control", `<span class="chip" style="position:absolute;right:8px;top:8px;height:22px;font-size:11px;padding:0 7px;background:rgba(0,0,0,.6)">${I("play", "ico", 'style="width:12px;height:12px"')} Autoplay ${ap ? "on" : "off"}</span>`, { tag: "span" })}
      ${lc ? C("loop_count", `<span class="chip" style="position:absolute;left:8px;top:8px;height:22px;font-size:11px;padding:0 7px;background:rgba(0,0,0,.6)">${I("loop", "ico", 'style="width:12px;height:12px"')} Loop 2</span>`, { tag: "span" }) : ""}
      <div class="pbtn bigbtn" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,.3)">${I("pause")}</div>
      <div class="time" style="position:absolute;left:12px;bottom:14px">12:05 / ${VIDEOS[3].d}</div>
      <div class="seek" style="bottom:6px"><div class="played" style="width:96%"></div></div>
    </div>
    <div style="padding:10px 12px 4px"><div class="t1">${esc(VIDEOS[3].t)}</div><div class="t2">${VIDEOS[3].c} · ${VIDEOS[3].v}</div></div>
    <div class="t2" style="padding:8px 12px 4px">Up next</div>
    ${[4, 5].map(i => `<div style="display:flex;gap:10px;padding:6px 12px">${thumb(i, "width:120px;border-radius:8px;flex:none")}<div><div class="t1" style="font-size:13px">${esc(VIDEOS[i].t)}</div><div class="t2">${VIDEOS[i].c}</div></div></div>`).join("")}
  </div>`;
};
def("playback", "style", "playback_speed_default video_quality_default_wifi video_quality_default_mobile disable_hdr_video force_hdr_video video_codec playback_audio_pitch_default custom_playback_speeds custom_speed_menu");
Object.assign(DEMOS, {
  morphe_remember_playback_speed_last_selected_toast(on) { if (on) showPill("Changed default speed to: 1.5x", 1300); label(on ? "A toast confirms the new default speed" : "No toast when the default speed changes", !on, 1300); },
  morphe_remember_video_quality_last_selected_toast(on) { if (on) showPill("Changed default Wi-Fi quality to: 1080p", 1300); label(on ? "A toast confirms the new default quality" : "No toast when the default quality changes", !on, 1300); },
});
def("playback", "behaviour", "remember_playback_speed_last_selected_toast remember_video_quality_last_selected_toast"); // skip silence: a comparison (scenario-kit.js)
// Entering and leaving fullscreen, played on the Fullscreen preview itself (Max, Nov 20: no separate
// phones). The fullscreen player shrinks into the watch page's player, or grows out of it, using what the
// preview shows at that moment; a choice that doesn't apply to it (portrait only, while the preview is a
// landscape fullscreen) says so and the player stays. One story every three loops (4.5 s).
function fsMorph(fromFull, toFull) {
  const st = $("stage").firstElementChild; if (!st) return null;
  st.querySelectorAll(".fsm7").forEach(n => n.remove());
  const fr = st.querySelector(".frame"), art = (fr && fr.style.background) || ART[0]; // the picture the preview shows now
  const small = "left:25%;right:25%;top:0;height:50%;border-radius:0", full = "left:0;right:0;top:0;height:100%;border-radius:0";
  const o = document.createElement("div"); o.className = "fsm7 dyn";
  o.style.cssText = `position:absolute;inset:0;z-index:30;background:#0f0f0f;opacity:${fromFull ? 0 : 1};transition:opacity .35s`;
  o.innerHTML = `<div class="fsv7" style="position:absolute;${fromFull ? full : small};background:${art};transition:all .55s var(--ease)"></div>
    <div style="position:absolute;left:25%;right:25%;top:56%;display:grid;gap:6px"><i style="height:9px;width:80%;border-radius:4px;background:#2a2a2a"></i><i style="height:9px;width:55%;border-radius:4px;background:#2a2a2a"></i><i style="height:9px;width:65%;border-radius:4px;background:#2a2a2a"></i></div>`;
  st.appendChild(o); onDemoStop(() => o.remove());
  const v = o.querySelector(".fsv7");
  void o.offsetWidth;
  if (fromFull && !toFull) { o.style.opacity = 1; v.style.cssText += ";" + small; }
  if (!fromFull && toFull) { v.style.cssText += ";" + full; dT(() => { o.style.opacity = 0; }, 450); }
  return o;
}
Object.assign(DEMOS, {
  morphe_exit_fullscreen(v) {
    if (demoStep % 3) return;
    const st = $("stage").firstElementChild, pl = st && st.querySelector(".seek .played"), kn = st && st.querySelector(".seek .knob");
    st && st.querySelectorAll(".fsm7").forEach(n => n.remove());
    const set = (w, ms) => [pl, kn].forEach(e => { if (!e) return; e.style.transition = ms ? `${e === pl ? "width" : "left"} ${ms}ms linear` : "none"; e.style[e === pl ? "width" : "left"] = w + "%"; });
    set(88, 0); onDemoStop(() => set(52, 0));
    dT(() => set(100, 900), 60); // the video plays to its end
    const exits = /LANDSCAPE/.test(String(v)); // the preview is a landscape fullscreen
    dT(() => {
      if (exits) fsMorph(true, false);
      else showPill(String(v) === "PORTRAIT" ? "Stays: only portrait fullscreen is left" : "Stays in fullscreen", 1600);
    }, 1050);
    dT(() => { st && st.querySelectorAll(".fsm7").forEach(n => n.remove()); set(52, 0); }, 4200);
  },
  morphe_open_videos_fullscreen(v) {
    if (demoStep % 3) return;
    const on = String(v) !== "DISABLED";
    const o = fsMorph(false, false); if (!o) return; // a video opening in the watch page's player
    dT(() => {
      if (on) { fsMorph(false, true); showPill(String(v) === "PORTRAIT" ? "Opens in portrait fullscreen" : "Opens in fullscreen", 1400); }
      else showPill("Opens in the normal player", 1400);
    }, 700);
    dT(() => { const st = $("stage").firstElementChild; st && st.querySelectorAll(".fsm7").forEach(n => n.remove()); }, 4200);
  },
});
def("fullscreen", "behaviour", "exit_fullscreen open_videos_fullscreen");
// Comments: context lines (pinned, creator heart), gift cards, and a scrollable panel
{ const base = SCENES.comments; SCENES.comments = () => base()
    .replace('<div style="position:absolute;left:0;right:0;top:44px;bottom:0;background:#212121;border-radius:14px 14px 0 0;overflow-y:auto;scrollbar-width:thin">', '<div class="inner-scroll" style="position:absolute;left:0;right:0;top:44px;bottom:0;background:#212121;border-radius:14px 14px 0 0;overflow-y:auto;scrollbar-width:thin;padding-bottom:10px">')
    .replace(/(<div style="display:flex;gap:10px;padding:10px 12px">)/, `${C("hide_comments_contexts", `<div class="t2" style="padding:6px 12px 0 50px;display:flex;gap:6px;align-items:center;font-size:11.5px">${I("lock", "ico", 'style="width:12px;height:12px;fill:#aaa"')}Pinned by @fjordtimber</div>`, { blk: 1 })}$1`)
    .replace(/(<\/div>\s*<\/div>\s*)$/, `${C("hide_comments_gift_animation_and_cards", `<div style="margin:6px 12px;padding:10px 12px;border-radius:12px;background:linear-gradient(90deg,#3b2a12,#2a2a2a);display:flex;gap:10px;align-items:center">${I("gift", "ico", 'style="fill:#ffb74d"')}<div><b style="font-size:12.5px">@carpenter_jo sent 5 gifts</b><div class="t2">Gifted memberships to the community</div></div></div>`, { blk: 1 })}
      <div style="display:flex;gap:10px;padding:10px 12px">${av(7, 28)}<div style="flex:1"><div class="t2">@slowrails · 5h ${I("heart", "ico", 'style="width:12px;height:12px;fill:#ff4e45;vertical-align:-2px"')}</div><div style="font-size:13.5px;margin-top:2px">Which stove model is that?</div></div></div>$1`); }
def("comments", "vis", "hide_comments_contexts hide_comments_gift_animation_and_cards");
// "Player icon style": the player buttons draw the real icons of the chosen set, from the patch's own drawables
const styledIcons = (html, style) => {
  const set = typeof ICON_STYLES !== "undefined" && ICON_STYLES[style];
  if (!set) return html;
  return html.replace(/(<div class="pbtn[^"]*"[^>]*>\s*)<svg class="ico" viewBox="0 0 24 24"\s*><path d="([^"]*)"\/><\/svg>/g, (m, open, d) => {
    const name = Object.keys(set).find(k => P[k] === d);
    return name ? `${open}<svg class="ico sty" viewBox="${set[name][0]}">${set[name][1]}</svg>` : m;
  });
};
{ const base = SCENES.player; SCENES.player = () => { const st = V("morphe_player_icon_style") || "AUTO"; return styledIcons(base(), st).replace(/^\s*<div/, `<div data-icons="${esc(st)}"`); }; }
scen("shorts", "shorts_player_type", (box, v) => {
  situation("Tapping a Short in the Home feed");
  const shelf = `<div class="dv-feed" style="position:absolute;inset:0;background:#0f0f0f;padding:6px;display:grid;grid-template-columns:1fr 1fr;gap:4px;align-content:start;transition:opacity .25s">
    <div style="grid-column:1/-1;height:8px;width:40%;border-radius:3px;background:#ff0033;opacity:.8"></div>
    ${[5, 6].map(i => `<div style="aspect-ratio:9/16;border-radius:5px;background:${ART[i]}"></div>`).join("")}<i style="grid-column:1/-1;height:8px;border-radius:3px;background:#2a2a2a"></i><i style="grid-column:1/-1;height:8px;width:70%;border-radius:3px;background:#2a2a2a"></i></div>`;
  box.innerHTML = device("port", shelf);
  const dev = box.querySelector(".dev"), f = box.querySelector("#scFinger"); const W = dev.clientWidth, H = dev.clientHeight;
  at(150, () => fingerTo(f, W * .28, H * .3)); at(650, () => tapF(f));
  at(900, () => {
    f.classList.remove("show");
    if (v === "REGULAR_PLAYER") devContent(dev, `<div class="dv-video" style="background:#000"><div style="position:absolute;left:36%;right:36%;top:0;bottom:0;background:${ART[5]}"></div></div><div class="dv-below"><i></i><i></i><i></i></div>`);
    else if (v === "REGULAR_PLAYER_FULLSCREEN") devContent(dev, `<div style="position:absolute;inset:0;background:#000"><div style="position:absolute;left:0;right:0;top:8%;bottom:8%;background:${ART[5]}"></div><div style="position:absolute;left:8%;right:8%;bottom:4%;height:2px;background:rgba(255,255,255,.4)"><div style="width:30%;height:2px;background:#ff0033"></div></div></div>`);
    else devContent(dev, `<div style="position:absolute;inset:0;background:${ART[5]}"><div style="position:absolute;right:5px;bottom:18%;display:grid;gap:5px">${[0, 1, 2, 3].map(() => `<i style="display:block;width:12px;height:12px;border-radius:50%;background:rgba(255,255,255,.3)"></i>`).join("")}</div><div style="position:absolute;left:6px;bottom:8%;width:50%;height:6px;border-radius:3px;background:rgba(255,255,255,.5)"></div></div>`);
  });
  return v === "REGULAR_PLAYER" ? "Opens in the regular player, with comments and related videos below"
    : v === "REGULAR_PLAYER_FULLSCREEN" ? "Opens in the regular player, straight to fullscreen" : "Opens in the Shorts player (stock)";
});

Object.assign(DEMOS, {
  morphe_swipe_zone_preview() { swipeZones(1400, true); label("Swipe zones: left, right and top, with their gesture", false, 1400); },
  morphe_swipe_speed_zone_height() { swipeZones(1400, true); label(`Top zone: ${V("morphe_swipe_speed_zone_height")}% of the player height`, false, 1400); },
  morphe_narrow_navigation_buttons(on) {
    const nb = document.querySelector("#stage .navbar"); if (!nb) return;
    nb.classList.toggle("narrow", !on);
    dT(() => { if (document.body.contains(nb)) nb.classList.toggle("narrow", on); }, 650);
    label(on ? "Narrow buttons: grouped in the middle, easier to reach" : "Default: buttons spread over the whole width", !on, 1300);
  },
});
