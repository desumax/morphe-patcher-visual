#!/usr/bin/env node
// Regression checks: one per bug Max reported, so a fixed bug that comes back fails here before it
// reaches the phone (Max, Nov 24: "every reported bug gets a regression check"). The animation and
// layout rules live in tools/animcheck (probe.js); these are the behaviours a frame check can't see:
// scrolling, menus, gestures, dialogs, search. Each check names the report it guards.
//
//   node tools/regress/regress.js            all checks, web preview and App view build
//   node tools/regress/regress.js --only bar  checks whose name contains "bar"
//
// Exits 1 when a check fails. Adding a check: write it so it fails on the code that had the bug and
// passes on the fix (try both), give it the date and the words of the report.
"use strict";
const { chromium } = require("playwright");
const http = require("http"), fs = require("fs"), path = require("path"), os = require("os"), cp = require("child_process");

const VE = path.resolve(__dirname, "..", "..");
const ONLY = (() => { const i = process.argv.indexOf("--only"); return i > 0 ? process.argv[i + 1] : ""; })();

// ---- the site: web/ plus the App view build, as the preview is published --------------------------
function buildSite() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "regress-"));
  fs.cpSync(path.join(VE, "web"), dir, { recursive: true });
  const av = dir + ".av";
  cp.execFileSync("python3", [path.join(VE, "app", "build_app_view.py"), av], { stdio: "ignore" });
  fs.copyFileSync(path.join(av, "appview.html"), path.join(dir, "appview.html"));
  fs.cpSync(path.join(av, "app"), path.join(dir, "app"), { recursive: true });
  return dir;
}
const types = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml" };
function serve(dir) {
  return new Promise(res => {
    const srv = http.createServer((q, r) => {
      const u = decodeURIComponent(q.url.split("?")[0]), f = path.join(dir, u === "/" ? "index.html" : u);
      fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { "Content-Type": (types[path.extname(f)] || "application/octet-stream") + "; charset=utf-8" }); r.end(d); });
    });
    srv.listen(0, () => res(srv));
  });
}
let BASE = "", browser = null;
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function open(page = "index.html", opts = {}) {
  const ctx = await browser.newContext({ viewport: opts.viewport || { width: 412, height: 896 }, hasTouch: !!opts.touch, isMobile: !!opts.touch });
  const p = await ctx.newPage(); const errors = []; p.on("pageerror", e => errors.push(e.message));
  await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p.addInitScript(() => { try { localStorage.setItem("morphe-visual-editor-v1-tutorial", "1"); } catch (e) { /* none */ } });
  await p.goto(BASE + page); await sleep(page === "appview.html" ? 2500 : 1500);
  const f = page === "appview.html" ? p.frames().find(x => /app\/index/.test(x.url())) : p.mainFrame();
  return { ctx, p, f, errors };
}
const ok = (cond, msg) => { if (!cond) throw new Error(msg); };

// ---- the checks -------------------------------------------------------------------------------------
const CHECKS = [
  {
    name: "top-bar-returns-at-top",
    report: "Nov 24: after Show on Mute button the top bar stayed hidden at the top of the list",
    async run() {
      const { p, ctx } = await open();
      await p.evaluate(() => { setPicker(false); goToSetting("morphe_mute_video_button"); }); await sleep(900);
      await p.mouse.move(206, 600);
      for (let i = 0; i < 12; i++) { await p.mouse.wheel(0, 120); await sleep(40); }
      await p.evaluate(() => document.querySelector('[data-row="morphe_mute_video_button"]').scrollIntoView({ block: "center" })); await sleep(400);
      for (let i = 0; i < 3; i++) { await p.mouse.wheel(0, 60); await sleep(40); } await sleep(400);
      ok(await p.evaluate(() => $("app").classList.contains("barhidden")), "setup: the bar did not hide while scrolling down");
      const xy = await p.evaluate(() => { const r = document.querySelector('[data-row="morphe_mute_video_button"]'); const b = [...r.querySelectorAll("button, span, b")].find(x => x.textContent.trim() === "Show") || r.querySelector(".lt7"); const q = b.getBoundingClientRect(); return [q.x + q.width / 2, q.y + q.height / 2]; });
      await p.mouse.click(xy[0], xy[1]); await sleep(150);
      for (let i = 0; i < 30; i++) { await p.mouse.wheel(0, -400); await sleep(16); }
      await sleep(1500);
      const [hid, top] = await p.evaluate(() => [$("app").classList.contains("barhidden"), $("scroller").scrollTop]);
      ok(top < 8, `setup: the list did not reach its top (${top})`);
      ok(!hid, "the top bar is still hidden at the top of the list");
      await ctx.close();
    },
  },
  {
    name: "card-opens-without-old-screen",
    report: "Nov 24: Player, back, App flashed the Player preview's frame before App (every card)",
    async run() {
      const { f, ctx } = await open("appview.html", { viewport: { width: 900, height: 1000 } });
      const openCard = async t => {
        await f.evaluate(() => { window.__fr = []; const t0 = performance.now(); const step = () => { const st = $("stage"); window.__fr.push([document.documentElement.classList.contains("menupage"), st.dataset.sec || "", st.classList.contains("swap-out")]); if (performance.now() - t0 < 400) requestAnimationFrame(step); }; requestAnimationFrame(step); });
        await f.locator("#pickGrid .pick", { hasText: t }).first().click(); await sleep(600);
        return f.evaluate(() => window.__fr);
      };
      await openCard("Player");
      await f.evaluate(() => $("btnBack").click()); await sleep(500);
      const fr = await openCard("App");
      const shown = fr.filter(x => !x[0]);
      ok(shown.length, "setup: the App screen never showed");
      const first = shown[0][1], last = shown[shown.length - 1][1];
      ok(first === last && !shown.some(x => x[2]), `the previous screen showed first (${first}, sliding out) before ${last}`);
      await ctx.close();
    },
  },
  {
    name: "back-swipe-cancel-clean",
    report: "Nov 24: a back swipe started then cancelled flashed the screen, and a see-through menu faded over it",
    async run() {
      const { f, ctx } = await open("appview.html", { viewport: { width: 900, height: 1000 } });
      await f.locator("#pickGrid .pick", { hasText: "Player" }).first().click(); await sleep(800);
      const fr = await f.evaluate(async () => {
        morpheBackStart(0, 0);
        for (let x = 0; x <= 120; x += 10) { morpheBackProgress(x / 400, x); await new Promise(r => requestAnimationFrame(r)); }
        const out = [], t0 = performance.now(); morpheBackCancel();
        await new Promise(res => { const step = () => { const pk = $("picker"), cs = getComputedStyle(pk); out.push([+cs.zIndex, +cs.opacity, document.querySelector(".editor").getBoundingClientRect().left, document.documentElement.classList.contains("peekback")]); if (performance.now() - t0 < 900) requestAnimationFrame(step); else res(); }; requestAnimationFrame(step); });
        return out;
      });
      ok(!fr.some(x => x[2] < -.5), `the screen sprang past its place (${Math.min(...fr.map(x => x[2])).toFixed(1)}px), showing the menu at the other edge`);
      ok(!fr.some(x => !x[3] && x[1] > .01), "the menu was still visible over the screen after the swipe was cancelled");
      await ctx.close();
    },
  },
  {
    name: "popup-grows-from-button",
    report: "Nov 24: popups spawned from the top in the web view, then were too slow (350 ms open, 200 ms close)",
    async run() {
      const { p, ctx } = await open("index.html", { touch: true });
      await p.evaluate(() => { setPicker(false); goToSetting("morphe_pref_import_export"); }); await sleep(1500);
      const b = await p.evaluate(() => { const r = document.querySelector("[data-act]").getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
      await p.touchscreen.tap(b[0], b[1]); await sleep(20);
      // where the popup is drawn at the start of its animation (paused at 0)
      const a = await p.evaluate(() => { const an = $("dlgBox").getAnimations()[0]; if (!an) return null; an.pause(); an.currentTime = 0; const r = $("dlgBox").getBoundingClientRect(), ms = an.effect.getTiming().duration; an.play(); return { ms, from: [r.x + r.width / 2, r.y + r.height / 2] }; });
      ok(a && a.from, "the popup did not animate from the tapped button");
      ok(Math.hypot(a.from[0] - b[0], a.from[1] - b[1]) < 30, `the popup starts ${Math.round(Math.hypot(a.from[0] - b[0], a.from[1] - b[1]))}px away from the tapped button`);
      ok(a.ms <= 360, `opening takes ${a.ms} ms (asked: 350)`);
      await sleep(500); await p.evaluate(() => closeDialog());
      const c = await p.evaluate(() => $("dlgBox").getAnimations().map(x => x.effect.getTiming().duration)[0]);
      ok(c && c <= 210, `closing takes ${c} ms (asked: 200)`);
      await ctx.close();
    },
  },
  {
    name: "app-view-action-pill",
    report: "Nov 24: Import / Export's Open pill was unstyled in the App view, and Open only said to update the patch",
    async run() {
      const { f, ctx } = await open("appview.html", { viewport: { width: 900, height: 1000 } });
      await f.locator("#pickGrid .pick", { hasText: "App" }).first().click(); await sleep(800);
      await f.evaluate(() => goToSetting("morphe_pref_import_export")); await sleep(1500);
      const s = await f.evaluate(() => { const b = document.querySelector("[data-act]"), c = getComputedStyle(b); return [c.display, c.borderRadius, c.height]; });
      ok(/flex/.test(s[0]) && parseFloat(s[1]) > 100 && parseFloat(s[2]) <= 40, `the Open pill is not styled (${s.join(", ")})`);
      await f.evaluate(() => document.querySelector("[data-act]").click()); await sleep(700);
      ok(await f.evaluate(() => $("dlg").classList.contains("open") && !!$("iexText")), "Open did not show the Import / Export dialog");
      await ctx.close();
    },
  },
  {
    name: "glide-end-no-pop",
    report: "Nov 24: at the end of a tab glide the tab's own fill popped in (grey, then white) and labels flashed",
    async run() {
      const { p, ctx } = await open();
      await p.evaluate(() => { theme = "glass"; applyTheme(); setPicker(false); renderAll(); }); await sleep(800);
      // a phone's pace. The original slip (a finished animation's event ran before the frame's rAF, so the
      // tab's transitions came back too early) depended on frame timing and does not show in headless
      // frames: this guards the end state (nothing changes once the glide is over), not that exact race.
      const cdp = await ctx.newCDPSession(p); await cdp.send("Emulation.setCPUThrottlingRate", { rate: 6 });
      const r = await p.evaluate(async () => {
        const tabs = document.querySelectorAll("#tabs .tab7"); tabs[1].click();
        const box = $("tabs"), out = [];
        await new Promise(res => { const t0 = performance.now(); const step = () => { const s = box.querySelector('[aria-selected="true"]'); out.push([box.classList.contains("gliding"), getComputedStyle(s).backgroundColor, getComputedStyle(s.querySelector(".tx") || s).color]); if (performance.now() - t0 < 1400) requestAnimationFrame(step); else res(); }; requestAnimationFrame(step); });
        return out;
      });
      const after = r.slice(r.findIndex((x, i) => i && !x[0] && r[i - 1][0]));
      ok(after.length > 2, "setup: the glide never ended");
      const fin = r[r.length - 1];
      const bad = after.filter(x => x[1] !== fin[1] || x[2] !== fin[2]);
      ok(!bad.length, `after the glide the tab still changed for ${bad.length} frame(s) (${bad[0] && bad[0][1]} / ${bad[0] && bad[0][2]})`);
      await ctx.close();
    },
  },
  {
    name: "glass-rim-travels",
    report: "Nov 24: a glass toggle's travelling pill lost its reflective edge until the glide ended",
    async run() {
      const { p, ctx } = await open();
      await p.evaluate(() => { theme = "glass"; applyTheme(); setPicker(false); renderAll(); }); await sleep(800);
      const r = await p.evaluate(() => { document.querySelectorAll("#tabs .tab7")[1].click(); const l = document.querySelector("#tabs .glayer"); if (!l) return "no layer"; const id = (/url\("?#([^")]+)/.exec(l.style.filter) || [])[1]; if (!id) return "not goo"; const fl = document.getElementById(id); return fl && fl.querySelector("feMorphology, feOffset") ? "" : "the moving colour has no rim"; });
      ok(r === "" || r === "not goo", r);
      await ctx.close();
    },
  },
  {
    name: "search-gesture-words",
    report: "Nov 24: 'Pull up to fullscreen' and 'Slide down to fullscreen' found nothing",
    async run() {
      const { p, ctx } = await open();
      for (const q of ["pull up to fullscreen", "slide down to fullscreen", "pinch to zoom"]) {
        // the editor's own search: the results it draws for these words
        const n = await p.evaluate(q => { query = q; renderSearch(); const l = $("list"), n = l.querySelectorAll("[data-res], [data-row], [data-open]").length; return l.querySelector(".shint") && !n ? 0 : n; }, q).catch(() => -1);
        ok(n > 0, `search for "${q}" finds nothing${n < 0 ? " (search helpers changed: update this check)" : ""}`);
      }
      await ctx.close();
    },
  },
  {
    name: "rubber-band-half",
    report: "Nov 24: reduce the bounce at the list ends by 50%",
    async run() {
      const { p, ctx } = await open("index.html", { touch: true });
      await p.evaluate(() => { setPicker(false); $("scroller").scrollTop = 0; }); await sleep(400);
      const cdp = await ctx.newCDPSession(p); let mx = 0;
      const tp = (type, y) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" ? [] : [{ x: 200, y }] });
      await tp("touchStart", 500);
      for (let y = 500; y <= 800; y += 15) { await tp("touchMove", y); await sleep(16); mx = Math.max(mx, await p.evaluate(() => parseFloat(($("content").style.translate || "0 0").split(" ")[1]) || 0)); }
      await tp("touchEnd", 800);
      ok(mx > 10, "setup: pulling past the top did not stretch the list");
      ok(mx < 80, `a 300px pull stretches ${mx.toFixed(0)}px (half of the earlier 136 is about 68)`);
      await ctx.close();
    },
  },
  {
    name: "menu-cards-compact",
    report: "Nov 24: with Group screens into tabs off, the menu cards took two or more lines with empty space",
    async run() {
      const { f, ctx } = await open("appview.html", { viewport: { width: 900, height: 1000 } });
      const r = await f.evaluate(() => { grouped = false; renderBar(); setPicker(true); paintPicker(); const cs = [...document.querySelectorAll("#pickGrid .pg.pvis .pick")]; return { h: Math.max(...cs.map(c => c.offsetHeight)), order: cs.map(c => c.dataset.sec), want: SECTIONS.filter(x => SCENES[x.id]).map(x => x.id) }; });
      ok(r.h <= 80, `a screen card is ${r.h}px tall`);
      ok(r.order.join() === r.want.join(), "the cards are not in Morphe's order");
      await ctx.close();
    },
  },
  {
    name: "comparison-layout-settles-first",
    report: "Nov 24 (second report): Play next in queue type opened with its labels beside the phones while it waited for a choice, and on top once one was picked; the waiting outline was a whole phone beside a half phone",
    async run() {
      const { p, ctx } = await open();
      // the Home tab: a tall preview, where the wrong shape shows (a short one can make labels beside right)
      await p.evaluate(() => { setPicker(false); quickSection("feed"); }); await sleep(400);
      const keys = await p.evaluate(() => Object.keys(SCN).filter(k => PREF[k]));
      const bad = [];
      for (const k of keys) {
        await p.evaluate(k => { stopScenario(); pairMemo = null; playScenario(k); }, k); await sleep(260);
        const r = await p.evaluate(() => {
          const g = document.querySelector("#canvas .scbox .duo7.gen"); if (!g || !g.dataset.lay) return null;
          // the layout a pair with these contents gets (fitDev's rule), against the one it is drawn in
          g._measured = null; const m = measurePair(g), f = wh => wh ? fitScale(wh[0], wh[1]) : 0;
          const S = { side: f(m.sideWH), row: f(m.rowWH), column: f(m.colWH), top: f(m.topWH) };
          let best = S.side >= Math.max(S.row, S.column) * 1.04 ? "side" : S.row >= S.column || scTurns ? "row" : "column";
          if (S.top >= S[best] * 1.06) best = "top";
          const a = g.querySelector(".ask7"), side = g.querySelector(".dl7 > .side");
          return { lay: g.dataset.lay, best, gain: S[best] / (S[g.dataset.lay] || 1), ask: a ? [a.offsetHeight, side.offsetHeight] : null };
        });
        if (!r) continue;
        if (r.lay !== r.best && r.gain > 1.07) bad.push(`${k}: drawn ${r.lay}, ${r.best} is ${((r.gain - 1) * 100).toFixed(0)}% larger`);
        if (r.ask && Math.abs(r.ask[0] - r.ask[1]) > 1) bad.push(`${k}: waiting outline ${r.ask[0]}px tall beside a ${r.ask[1]}px phone`);
      }
      await p.evaluate(() => stopScenario());
      ok(keys.length > 100, `setup: only ${keys.length} comparisons found`);
      ok(!bad.length, `${bad.length} comparison(s) start in the wrong shape:\n       ` + bad.slice(0, 12).join("\n       "));
      await ctx.close();
    },
  },
  {
    name: "scroll-less-sensitive",
    report: "Nov 24 evening: make the scrolling 20% less sensitive (a drag moves the list 80% of the finger's way, a fling goes on and stops, a drag taps nothing)",
    async run() {
      const { p, ctx } = await open("index.html", { touch: true });
      await p.evaluate(() => { setPicker(false); $("scroller").scrollTop = 600; window.__clicks = 0; document.addEventListener("click", () => window.__clicks++, true); }); await sleep(400);
      const cdp = await ctx.newCDPSession(p);
      const tp = (type, y) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" ? [] : [{ x: 200, y }] });
      const s0 = await p.evaluate(() => $("scroller").scrollTop);
      await tp("touchStart", 700);
      for (let y = 700; y >= 400; y -= 10) { await tp("touchMove", y); await sleep(16); }
      await sleep(120); // stand still: no fling
      await tp("touchEnd", 400); await sleep(300);
      const moved = await p.evaluate(() => $("scroller").scrollTop) - s0;
      ok(Math.abs(moved - 300 * .8 + 8 * .8) < 12, `a 300px drag moved the list ${moved.toFixed(0)}px (80% is about 234)`);
      ok(await p.evaluate(() => window.__clicks) === 0, "the drag tapped what was under the finger");
      // a quick flick goes on after the finger lifts, then stops
      const f0 = await p.evaluate(() => $("scroller").scrollTop);
      await tp("touchStart", 700);
      for (let y = 700; y >= 460; y -= 40) { await tp("touchMove", y); await sleep(8); }
      await tp("touchEnd", 460);
      const f1 = await p.evaluate(() => $("scroller").scrollTop); await sleep(1500);
      const f2 = await p.evaluate(() => $("scroller").scrollTop); await sleep(300);
      const f3 = await p.evaluate(() => $("scroller").scrollTop);
      ok(f2 - f1 > 100, `the fling carried the list only ${(f2 - f1).toFixed(0)}px after the finger lifted`);
      ok(Math.abs(f3 - f2) < 1, "the fling had not stopped after 1.5 s");
      await ctx.close();
    },
  },
  {
    name: "ghost-leaves-no-line",
    report: "Nov 24: going from a hidden part's setting (Create new segment button, hidden) to another (Use compact Skip button), the part narrowed away and left a red dashed line before it went (every hidden part)",
    async run() {
      const { p, ctx } = await open();
      const k = "morphe_sb_create_new_segment", other = "morphe_sb_compact_skip_button";
      await p.evaluate(k => { setPicker(false); goToSetting(k); }, k); await sleep(900);
      // hide it (whichever value does), then select it: it shows as a ghost
      const ok1 = await p.evaluate(async k => {
        const els = () => [...document.querySelectorAll(`#stage [data-k="${k}"]`)];
        for (const v of [false, true]) { setPref(k, v); commit(); await new Promise(r => setTimeout(r, 400)); if (els().some(e => e.classList.contains("off"))) break; }
        select(k, "list"); await new Promise(r => setTimeout(r, 600));
        return els().some(e => e.classList.contains("ghost"));
      }, k);
      ok(ok1, "setup: the hidden part did not show as a ghost");
      await p.evaluate(o => select(o, "list"), other);
      const seen = [];
      for (const t of [160, 260, 360]) {
        await sleep(t === 160 ? 160 : 100);
        seen.push(await p.evaluate(k => [...document.querySelectorAll(`#stage [data-k="${k}"].leaving`)].map(e => {
          const a = c => { const m = /rgba?\(([^)]+)\)/.exec(c); if (!m) return 0; const v = m[1].split(",").map(Number); return v.length > 3 ? v[3] : 1; };
          const cs = getComputedStyle(e), b = getComputedStyle(e, "::before");
          return Math.max(cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) ? a(cs.outlineColor) * parseFloat(cs.opacity) : 0, b.outlineStyle !== "none" && parseFloat(b.outlineWidth) ? a(b.outlineColor) * parseFloat(cs.opacity) : 0);
        }), k));
      }
      ok(seen.some(x => x.length), "setup: the part did not fold away");
      const worst = Math.max(0, ...seen.flat());
      ok(worst < .05, `the folding part's dashed ring is still drawn (strength ${worst.toFixed(2)})`);
      await ctx.close();
    },
  },
  {
    name: "app-menu-search-and-marks",
    report: "Nov 24: closing search opened from the menu went into the last card's screen; on first open a card was already marked as selected",
    async run() {
      const { f, ctx } = await open("appview.html", { viewport: { width: 900, height: 1000 } });
      ok(await f.evaluate(() => document.documentElement.classList.contains("menupage")), "setup: the app did not open on the menu");
      ok(await f.evaluate(() => !document.querySelector('#pickGrid [aria-current="true"]')), "a card is marked as selected on first open");
      await f.evaluate(() => $("btnSearch").click()); await sleep(400);
      await f.evaluate(() => $("qClose").click()); await sleep(400);
      ok(await f.evaluate(() => document.documentElement.classList.contains("menupage")), "closing search did not go back to the menu");
      // after a card was opened and left, that card is the marked one
      await f.evaluate(() => document.querySelector("#pickGrid [data-group], #pickGrid [data-sec]").click()); await sleep(500);
      await f.evaluate(() => $("btnBack").click()); await sleep(500);
      ok(await f.evaluate(() => !!document.querySelector('#pickGrid [aria-current="true"]')), "the card just used is not marked");
      await ctx.close();
    },
  },
  {
    name: "app-menu-fills-screen",
    report: "Nov 24: with screens grouped, the menu was a little longer than a 6.8 inch screen; it should fill any screen without scrolling; Reset order moved into the top bar",
    async run() {
      for (const [w, h] of [[360, 640], [384, 760], [412, 860], [412, 915], [480, 1000]]) {
        const { p, ctx } = await open("app/index.html", { viewport: { width: w, height: h } });
        await p.evaluate(() => { grouped = true; renderBar(); }); await sleep(300);
        const r = await p.evaluate(() => {
          const pk = $("picker"), last = [...$("pickGrid").children].pop(), cut = [...document.querySelectorAll("#pickGrid .gc-t, #pickGrid .gc-tabs span")].filter(e => e.scrollWidth > e.clientWidth + 1).length;
          const bar = document.querySelector(".appbar .barord");
          return { over: pk.scrollHeight - pk.clientHeight, gap: pk.getBoundingClientRect().bottom - last.getBoundingClientRect().bottom, hint: /Hold a screen to move it/.test($("pickGrid").textContent), bar: !!bar && bar.offsetWidth > 0, cut };
        });
        ok(r.over <= 1, `${w}x${h}: the menu scrolls by ${r.over}px`);
        ok(r.gap < 30, `${w}x${h}: ${Math.round(r.gap)}px left empty under the menu`);
        ok(!r.hint && r.bar, `${w}x${h}: Reset order is not in the top bar (or the hint line is back)`);
        await ctx.close();
      }
    },
  },
  {
    name: "web-menu-like-app",
    report: "Nov 24: Reset order and the menu fit had changed only in App view, not in the web view",
    async run() {
      for (const [w, h] of [[1280, 900], [412, 860]]) {
        const { p, ctx } = await open("index.html", { viewport: { width: w, height: h } });
        await p.evaluate(() => { grouped = true; renderBar(); setPicker(true); }); await sleep(600);
        const r = await p.evaluate(() => { const pk = $("picker"), b = $("barOrd"); return { over: pk.scrollHeight - pk.clientHeight, bar: !!b && b.offsetWidth > 0, row: !!document.querySelector("#pickGrid .ordrow"), marked: !!document.querySelector('#pickGrid [aria-current="true"]') }; });
        ok(r.over <= 1, `${w}x${h}: the web menu scrolls by ${r.over}px`);
        ok(r.bar && !r.row, `${w}x${h}: Reset order is not in the top bar of the web view`);
        ok(!r.marked, `${w}x${h}: a card is marked before any was opened`);
        await p.evaluate(() => $("btnSearch").click()); await sleep(300);
        await p.evaluate(() => $("qClose").click()); await sleep(300);
        ok(await p.evaluate(() => pickerOpen), `${w}x${h}: closing search did not go back to the menu`);
        await ctx.close();
      }
    },
  },
  {
    name: "ryd-off-shows-its-part",
    report: "Nov 24: Return YouTube Dislike off left a small green square instead of the red outline and the dislike count",
    async run() {
      const { p, ctx } = await open();
      const k = "morphe_ryd_enabled";
      const r = await p.evaluate(async k => { setPicker(false); quickSection("watch"); await new Promise(r => setTimeout(r, 500)); setPref(k, false); commit(); renderStage(); select(k, "list"); await new Promise(r => setTimeout(r, 900));
        const e = document.querySelector(`#stage [data-k="${k}"]`); if (!e) return null; const b = e.getBoundingClientRect(); return { ghost: e.classList.contains("ghost"), w: b.width, text: e.textContent.trim() }; }, k);
      ok(r, "the dislike count is not in the preview at all");
      ok(r.ghost && r.text && r.w > 12, `off, the dislike count is not drawn as a hidden part (ghost ${r.ghost}, "${r.text}", ${Math.round(r.w)}px wide)`);
      await ctx.close();
    },
  },
  {
    name: "preview-scrolls-to-where-a-setting-acts",
    report: "Nov 24: scrolled down on the video page, Video action bar layout (and its options) and Like and Subscribe glow didn't bring the preview to the action bar; Nov 25: it should go to the very top",
    async run() {
      const { p, ctx } = await open();
      for (const k of ["morphe_video_action_bar_layout", "morphe_disable_like_subscribe_glow"]) {
        const r = await p.evaluate(async k => {
          setPicker(false); quickSection("watch"); await new Promise(r => setTimeout(r, 500));
          const sc = document.querySelector("#stage .inner-scroll"); sc.scrollTop = sc.scrollHeight; await new Promise(r => setTimeout(r, 200));
          select(k, "list"); await new Promise(r => setTimeout(r, 1300));
          return sc.scrollTop;
        }, k);
        ok(r < 2, `${k}: the video page is ${Math.round(r)}px down instead of at its top (Nov 25: scroll to the very top)`);
      }
      await ctx.close();
    },
  },
  {
    name: "fitted-ghost-pulses-only-its-part",
    report: "Nov 24: 'Create a Short' button hidden and selected: the whole line glowed instead of the button (the outline was right)",
    async run() {
      const { p, ctx } = await open();
      const k = "morphe_hide_comments_create_a_short_button";
      const r = await p.evaluate(async k => { setPicker(false); quickSection("comments"); await new Promise(r => setTimeout(r, 500)); setPref(k, true); commit(); renderStage(); select(k, "list"); await new Promise(r => setTimeout(r, 1600));
        const e = document.querySelector(`#stage [data-k="${k}"]`); return { fit: e.classList.contains("fit"), ghost: e.classList.contains("ghost"), anim: getComputedStyle(e).animationName }; }, k);
      ok(r.ghost && r.fit, "setup: the hidden button is not a fitted ghost");
      ok(r.anim !== "ghostpulse", "the whole line pulses (the pulse belongs on the button's ring)");
      await ctx.close();
    },
  },
  {
    name: "story-lines-as-asked",
    report: "Nov 24: Search comments: no On sentence, Off says Not searchable; Minimal comments button and Sanitize highlighted search links: no white sentences",
    async run() {
      const { p, ctx } = await open();
      const lines = k => p.evaluate(async k => { setPicker(false); quickSection(sectionOf(k)); await new Promise(r => setTimeout(r, 500)); select(k, "list"); await new Promise(r => setTimeout(r, 1500));
        return [...document.querySelectorAll("#canvas .dl7")].map(c => [...c.querySelectorAll(".sf7")].map(e => e.offsetHeight ? e.textContent.trim() : "").join("")); }, k);
      const sc = await lines("morphe_search_comments");
      ok(sc[0] === "Not searchable" && !sc[1], `Search comments lines: ${JSON.stringify(sc)}`);
      for (const k of ["morphe_minimal_comments_button", "morphe_sanitize_comments_highlighted_search_links"]) { const l = await lines(k); ok(l.length === 2 && l.every(x => !x), `${k} still has white lines: ${JSON.stringify(l)}`); }
      await ctx.close();
    },
  },
  {
    name: "flying-comment-settings-no-whole-flash",
    report: "Nov 24: every setting under Niconico comments flashed the whole preview; ten of them get their own animation instead",
    async run() {
      const { p, ctx } = await open();
      const r = await p.evaluate(async () => {
        setPicker(false); setPref("morphe_niconico_comments", true); commit(); quickSection("danmaku"); await new Promise(r => setTimeout(r, 600));
        const out = [];
        for (const x of ["max_refresh_rate", "font_size", "portrait_font_size", "opacity"]) {
          const k = "morphe_niconico_comments_" + x; select(k, "list"); await new Promise(r => setTimeout(r, 450));
          const s = $("stage").getBoundingClientRect();
          if ([...document.querySelectorAll("#stage .flash")].some(e => { const b = e.getBoundingClientRect(); return b.width * b.height > s.width * s.height * .6; }) || document.querySelector(".stagebox.changed")) out.push(x);
        }
        const own = ["ended_premieres", "hide_crowded", "live_premieres", "live_streams", "max_length", "pip", "portrait", "separate_portrait", "timed_comments", "timed_comments_with_replay"].filter(x => !SCN["morphe_niconico_comments_" + x]);
        return { out, own };
      });
      ok(!r.out.length, `the whole preview flashes for: ${r.out.join(", ")}`);
      ok(!r.own.length, `no animation of its own: ${r.own.join(", ")}`);
      await ctx.close();
    },
  },
  {
    name: "portrait-settings-under-their-parent",
    report: "Nov 24: Display area / Comment font size / Travel duration in portrait appeared above Separate settings for portrait, which also had no lock pill",
    async run() {
      const { p, ctx } = await open();
      const r = await p.evaluate(async () => {
        setPicker(false); setPref("morphe_niconico_comments", true); setPref("morphe_niconico_comments_separate_portrait", false); commit(); quickSection("danmaku"); await new Promise(r => setTimeout(r, 700));
        const row = k => document.querySelector(`#list [data-row="morphe_niconico_comments_${k}"]`);
        const lock = !!row("separate_portrait")?.querySelector(".kidbtn.kidoff");
        toggle("morphe_niconico_comments_separate_portrait"); await new Promise(r => setTimeout(r, 900));
        const rows = [...document.querySelectorAll("#list [data-row]")].filter(e => e.offsetParent).map(e => e.dataset.row);
        const at = x => rows.indexOf("morphe_niconico_comments_" + x);
        return { lock, below: ["portrait_display_area", "portrait_font_size", "portrait_travel_duration"].every(x => at(x) > at("separate_portrait")) };
      });
      ok(r.lock, "Separate settings for portrait has no lock pill while its settings are hidden");
      ok(r.below, "the portrait settings are not below Separate settings for portrait");
      await ctx.close();
    },
  },
  {
    name: "disable-choice-last-and-grey",
    report: "Nov 24: SponsorBlock: Disable sat first in Hook / Greetings (last elsewhere) and showed dark green when chosen instead of grey",
    async run() {
      const { p, ctx } = await open();
      const r = await p.evaluate(async () => {
        setPicker(false); quickSection("sponsorblock"); await new Promise(r => setTimeout(r, 600));
        const bad = [];
        document.querySelectorAll("#list .ctl").forEach(c => { const o = [...c.querySelectorAll(".opt")]; const i = o.findIndex(e => /^disable$/i.test(e.textContent.trim())); if (i >= 0 && i !== o.length - 1) bad.push(c.closest("[data-row]")?.dataset.row); });
        const k = Object.keys(PREF).find(k => /^morphe_sb_.*(hook|greeting|intro)/i.test(k) && entriesFor(k).some(e => /^disable$/i.test(e.label)));
        let grey = null;
        if (k) { const v = entriesFor(k).find(e => /^disable$/i.test(e.label)).value; setPref(k, v); commit(); renderList(); await new Promise(r => setTimeout(r, 300));
          const b = [...document.querySelectorAll(`#list [data-row="${k}"] .opt`)].find(e => /^disable$/i.test(e.textContent.trim()));
          grey = b && b.classList.contains("offw") && !/\(4[34], 9[02], 5[02]\)/.test(getComputedStyle(b).backgroundColor) ? true : getComputedStyle(b).backgroundColor; }
        return { bad, k, grey };
      });
      ok(!r.bad.length, `Disable is not the last choice in: ${r.bad.join(", ")}`);
      ok(r.k && r.grey === true, `a chosen Disable is not grey (${r.k}: ${r.grey})`);
      await ctx.close();
    },
  },
  {
    name: "ryd-and-alert-settings-do-something",
    report: "Nov 25: Estimated likes, Feed thumbnail like position / count / percentage and Connection error alerts did nothing",
    async run() {
      const { p, ctx } = await open();
      const r = await p.evaluate(async () => {
        setPicker(false); setPref("morphe_ryd_enabled", true); setPref("morphe_sb_enabled", true); commit();
        const bad = [];
        for (const k of ["morphe_ryd_estimated_like", "morphe_ryd_feed_counts_position", "morphe_ryd_feed_like_count", "morphe_ryd_feed_like_ratio", "morphe_ryd_toast_on_connection_error", "morphe_sb_toast_on_connection_error"]) {
          quickSection(sectionOf(k)); await new Promise(r => setTimeout(r, 400));
          if (k === "morphe_ryd_feed_counts_position") { const b = state[k]; setPref(k, "MIDDLE_RIGHT"); afterChange(k, b); } else select(k, "list");
          await new Promise(r => setTimeout(r, 1800));
          const devs = [...document.querySelectorAll("#canvas.show .dev")];
          if (devs.length !== 2 || devs[0].innerHTML === devs[1].innerHTML) bad.push(k);
          select("morphe_ryd_enabled", "list"); await new Promise(r => setTimeout(r, 300));
        }
        return bad;
      });
      ok(!r.length, `no difference drawn for: ${r.join(", ")}`);
      await ctx.close();
    },
  },
  {
    name: "slider-comparison-follows-slider",
    report: "Nov 25: adjusting the Quick actions top margin slider did not change its animation live; its white and blue lines go",
    async run() {
      const { p, ctx } = await open();
      const r = await p.evaluate(async () => {
        const k = "morphe_quick_actions_top_margin";
        setPicker(false); quickSection(sectionOf(k)); await new Promise(r => setTimeout(r, 500)); select(k, "list"); await new Promise(r => setTimeout(r, 1200));
        const sl = document.querySelector(`#list input[type="range"][data-set="${k}"]`); if (!sl) return { err: "no slider" };
        for (const v of [6, 10, 14]) { sl.value = v; sl.dispatchEvent(new Event("input", { bubbles: true })); await new Promise(r => setTimeout(r, 120)); }
        await new Promise(r => setTimeout(r, 200));
        const labels = [...document.querySelectorAll("#canvas .dl7 > span")].map(e => e.textContent.trim());
        const lines = [...document.querySelectorAll("#canvas .sf7, #canvas .sit")].filter(e => e.offsetHeight && e.textContent.trim()).map(e => e.textContent.trim());
        return { labels, lines };
      });
      ok(!r.err, r.err);
      ok(r.labels.includes("14 dp"), `the comparison still shows ${JSON.stringify(r.labels)} after the slider moved to 14`);
      ok(!r.lines.length, `white or blue lines remain: ${JSON.stringify(r.lines)}`);
      await ctx.close();
    },
  },
  {
    name: "comments-stories-as-asked",
    report: "Nov 25: Search comments should find 2 comments and be 10% faster; Comments carousel filter: no blue line, and show it takes carousel pages out",
    async run() {
      const { p, ctx } = await open();
      const r = await p.evaluate(async () => {
        setPicker(false); setPref("morphe_hide_comments_carousel", true); commit();
        const go = async (k, ms) => { quickSection(sectionOf(k)); await new Promise(r => setTimeout(r, 500)); select(k, "list"); await new Promise(r => setTimeout(r, ms)); };
        await go("morphe_search_comments", 3300);
        const found = document.querySelectorAll("#canvas .dev")[1]?.querySelectorAll(".cl7 .cm7").length;
        const hold = SCN_HOLD.morphe_search_comments;
        await go("morphe_hide_comments_carousel", 400);
        const sit = document.querySelector("#canvas .sit")?.textContent.trim() || "";
        await new Promise(r => setTimeout(r, 1500));
        const moved = [...document.querySelectorAll("#canvas .crt7")].map(t => t.style.transform);
        return { found, hold, sit, moved };
      });
      ok(r.found === 2, `Search comments finds ${r.found} comments, not 2`);
      ok(r.hold <= 3100, `Search comments still runs ${r.hold} ms (was 3400, 10% faster is 3060)`);
      ok(!r.sit, `Comments carousel filter still has the blue line "${r.sit}"`);
      ok(r.moved.length === 2 && r.moved.every(t => /translateX\(-\d/.test(t)), `the carousel never swipes to another page: ${JSON.stringify(r.moved)}`);
      await ctx.close();
    },
  },
  {
    name: "flying-comment-stories-as-asked",
    report: "Nov 25: flying comment stories keep their blue lines, ignore the Display area slider, the portrait sliders do nothing, Separate settings for portrait turns too slowly",
    async run() {
      const { p, ctx } = await open();
      const r = await p.evaluate(async () => {
        setPicker(false); setPref("morphe_niconico_comments", true); setPref("morphe_niconico_comments_display_area", 40); commit(); quickSection("danmaku"); await new Promise(r => setTimeout(r, 600));
        const blue = [], area = [], low = [];
        for (const x of ["live_streams", "live_premieres", "ended_premieres", "hide_crowded", "max_length", "pip", "portrait", "separate_portrait", "timed_comments_with_replay"]) {
          const k = "morphe_niconico_comments_" + x; select(k, "list"); await new Promise(r => setTimeout(r, 1200));
          if (document.querySelector("#canvas .sit")?.textContent.trim()) blue.push(x);
          const a = document.querySelector("#canvas .dev .na7"), h = a && a.parentElement.clientHeight ? a.clientHeight / a.parentElement.clientHeight : 1;
          if (Math.abs(h - .4) > .05) area.push(`${x} ${Math.round(h * 100)}%`);
          if (/live|premieres/.test(x)) { const d = document.querySelectorAll("#canvas .dev")[0], t = d.querySelector(".toastin, .toast7"); if (t) { const b = t.getBoundingClientRect(), q = d.getBoundingClientRect(); if ((b.top + b.height / 2 - q.top) / q.height < .65) low.push(x); } }
        }
        const portrait = ["portrait_font_size", "portrait_travel_duration", "portrait_display_area"].filter(x => !SCN["morphe_niconico_comments_" + x]);
        select("morphe_niconico_comments_separate_portrait", "list"); let turnMs = 0;
        for (let i = 0; i < 40 && !turnMs; i++) { await new Promise(r => setTimeout(r, 60)); for (const d of document.querySelectorAll("#canvas .dev")) for (const a of d.getAnimations()) if (a.id === "turn") turnMs = a.effect.getTiming().duration; }
        return { blue, area, low, portrait, turnMs };
      });
      ok(!r.blue.length, `blue lines remain on: ${r.blue.join(", ")}`);
      ok(!r.area.length, `comments ignore Display area 40%: ${r.area.join(", ")}`);
      ok(!r.low.length, `the message sits too high on: ${r.low.join(", ")}`);
      ok(!r.portrait.length, `no animation for: ${r.portrait.join(", ")}`);
      ok(r.turnMs && r.turnMs <= 400, `Separate settings for portrait turns in ${r.turnMs} ms (500 before, 20% faster is 400)`);
      await ctx.close();
    },
  },
  {
    name: "ryd-stories-no-lines-no-stray-flash",
    report: "Nov 25: Estimated likes and the feed like stories had white and blue sentences; selecting Feed thumbnail like count / percentage / position flashed the dislike count in the preview",
    async run() {
      const { p, ctx } = await open();
      const r = await p.evaluate(async () => {
        setPicker(false); setPref("morphe_ryd_enabled", true); commit();
        const lines = [], flash = [];
        for (const k of ["morphe_ryd_estimated_like", "morphe_ryd_feed_like_count", "morphe_ryd_feed_like_ratio", "morphe_ryd_feed_counts_position"]) {
          quickSection(sectionOf(k)); await new Promise(r => setTimeout(r, 400)); select(k, "list"); await new Promise(r => setTimeout(r, 250));
          if (k !== "morphe_ryd_estimated_like" && document.querySelector('#stage .flash[data-k="morphe_ryd_enabled"], #stage [data-k="morphe_ryd_enabled"] .flash')) flash.push(k);
          await new Promise(r => setTimeout(r, 1600));
          const t = [...document.querySelectorAll("#canvas .sit, #canvas .sf7")].filter(e => e.offsetHeight && e.textContent.trim()).map(e => e.textContent.trim());
          if (t.length) lines.push(`${k}: ${t.join(" / ")}`);
        }
        return { lines, flash };
      });
      ok(!r.lines.length, `stories still have sentences: ${r.lines.join("; ")}`);
      ok(!r.flash.length, `selecting these flashes the dislike count: ${r.flash.join(", ")}`);
      await ctx.close();
    },
  },
  {
    name: "margin-slider-glides-from-example",
    report: "Nov 25: dragging Quick actions top margin from 0 cut from the 24 dp example to the new value (the animation clipped at the start)",
    async run() {
      const { p, ctx } = await open();
      const k = "morphe_quick_actions_top_margin";
      await p.evaluate(async k => { setPicker(false); quickSection(sectionOf(k)); await new Promise(r => setTimeout(r, 500)); select(k, "list"); await new Promise(r => setTimeout(r, 2000)); }, k);
      const gap = () => p.evaluate(() => document.querySelectorAll("#canvas .gap7")[1]?.getBoundingClientRect().height ?? -1);
      const g0 = await gap();
      await p.evaluate(k => { const t = document.querySelector(`#list input[type=range][data-set="${k}"]`); t.value = 4; t.dispatchEvent(new Event("input", { bubbles: true })); }, k);
      // sampled through the glide (a busy machine may show its first frame late): some frame lies between
      const seen = []; for (let i = 0; i < 12; i++) { await p.waitForTimeout(25); seen.push(await gap()); }
      await p.waitForTimeout(300); const end = await gap(), mid = seen.find(v => v > end + 1 && v < g0 - 1);
      ok(g0 > end + 3, `the example side doesn't start wider than 4 dp (${g0} vs ${end})`);
      ok(mid !== undefined, `the first slider step cuts instead of gliding: ${g0} → ${seen.map(v => v.toFixed(1)).join(" ")} → ${end}`);
      await ctx.close();
    },
  },
  {
    name: "button-families-in-two-columns",
    report: "Nov 25: Fullscreen's Action bar sub-settings: titled Action bar buttons, the word button dropped from each, title and toggle two to a line",
    async run() {
      const { p, ctx } = await open();
      const r = await p.evaluate(async () => {
        setPicker(false); quickSection("fullscreen"); await new Promise(r => setTimeout(r, 900));
        const par = document.querySelector('#list [data-row="morphe_hide_quick_actions"] .ttl')?.textContent.trim();
        const kin = document.querySelector('#list [data-kids-of="morphe_hide_quick_actions"] .kin');
        const rows = kin ? [...kin.querySelectorAll(":scope > .row:not(.hide)")] : [];
        const titles = rows.map(x => x.querySelector(".ttl").textContent.trim());
        const tops = rows.slice(0, 2).map(x => Math.round(x.getBoundingClientRect().top)), lefts = rows.slice(0, 2).map(x => Math.round(x.getBoundingClientRect().left));
        return { par, duo: !!kin?.classList.contains("duo2"), titles, tops, lefts };
      });
      ok(/^Action bar buttons/.test(r.par || ""), `the parent reads "${r.par}"`);
      ok(r.duo && r.tops[0] === r.tops[1] && r.lefts[1] > r.lefts[0], `sub-settings aren't two to a line: ${JSON.stringify(r)}`);
      ok(r.titles.length > 4 && r.titles.every(t => !/button/i.test(t)) && r.titles.includes("Live chat"), `titles: ${r.titles.join(", ")}`);
      await ctx.close();
    },
  },
  {
    name: "carousel-filter-names-as-toggles",
    report: "Nov 25: Comments carousel filter asked to type names; every name Morphe lists is a toggle now, the value stays Morphe's newline list",
    async run() {
      const { p, ctx } = await open();
      const k = "morphe_hide_comments_carousel_filter_strings";
      await p.evaluate(async k => { setPicker(false); setPref("morphe_hide_comments_carousel", true); setPref(k, "my own"); commit(); quickSection(sectionOf(k)); await new Promise(r => setTimeout(r, 900)); }, k);
      const names = await p.evaluate(k => [...document.querySelectorAll(`#list [data-lst="${k}"] [data-lch]`)].map(x => x.dataset.lch), k);
      const typing = await p.evaluate(k => !!document.querySelector(`#list [data-lin="${k}"]`), k);
      ok(!typing, "the card still has a field to type into");
      ok(["Ask", "Community", "Hype", "Listen", "my own"].every(n => names.includes(n)), `toggles: ${names.join(", ")}`);
      if (names.includes("Hype")) { await p.locator(`#list [data-lst="${k}"] [data-lch="Hype"]`).click(); await p.waitForTimeout(400); }
      const v = await p.evaluate(k => V(k), k);
      ok(v === "Hype\nmy own", `after Hide on Hype the value is ${JSON.stringify(v)}`);
      await ctx.close();
    },
  },
  {
    name: "area-boxes-group-by-location",
    report: "Nov 25: Player → Controls had 19 button cards; split by area (Top, Middle, Bottom) with the plain switches boxed two to a line, cards with sub-settings after their area's box, the same for Shorts, Comments, Player menu, Description, Channel, Seekbar",
    async run() {
      const { p, ctx, errors } = await open();
      const r = await p.evaluate(async () => {
        setPicker(false);
        const bad = [], out = {};
        // every key in the tables is one of Morphe's (a typo or a renamed key would silently drop out)
        for (const [tab, spec] of Object.entries(AREAS)) for (const [, ks] of spec) ks.forEach(x => { if (!PREF["morphe_" + x]) bad.push(`${tab}: morphe_${x} is not in Morphe's settings`); });
        for (const tab of Object.keys(AREAS)) {
          quickSection(tab); renderList(); await new Promise(r => setTimeout(r, 500));
          const m = MEMBERS[tab], want = [...m.live, ...m.misc].filter(k => !PARENT_OF[k]);
          const seen = [...document.querySelectorAll("#list .row[data-row]")].filter(r => !r.closest(".kids")).map(r => r.dataset.row);
          want.forEach(k => { const n = seen.filter(x => x === k).length; if (n !== 1) bad.push(`${tab}: ${k} is listed ${n} times`); });
          const boxes = [...document.querySelectorAll("#list .shared[data-area]")];
          boxes.forEach(b => {
            const spec = AREAS[tab].find(([n]) => n === b.dataset.area);
            [...b.querySelectorAll(":scope > .kin > .row")].forEach(r => {
              const k = r.dataset.row;
              if (!spec || !spec[1].includes(k.replace(/^morphe_/, ""))) bad.push(`${tab}: ${k} is in ${b.dataset.area} but not in its table`);
              if (PREF[k].type !== "boolean" || KIDS[k]) bad.push(`${tab}: ${k} (not a plain switch) is in a box`);
              const sum = r.querySelector(".sum"); if (sum && sum.offsetHeight) bad.push(`${tab}: ${k} shows its description in a box`);
              if (/\bbutton$/i.test(r.querySelector(".ttl").textContent.trim())) bad.push(`${tab}: ${k} still says button`);
            });
          });
          out[tab] = boxes.map(b => b.dataset.area);
        }
        // Player: the three areas in order, a card with sub-settings right after its area's box
        quickSection("player"); renderList(); await new Promise(r => setTimeout(r, 500));
        const seq = [...document.querySelectorAll("#list .shared[data-area], #list .unit")].map(e => e.dataset.area || e.querySelector(".row").dataset.row);
        return { bad, out, seq, cast: document.querySelector('#list [data-area="Top area"] [data-row="morphe_hide_cast_button"] .ttl')?.textContent.trim() };
      });
      ok(!r.bad.length, r.bad.slice(0, 8).join("; "));
      ok(JSON.stringify(r.out.player) === '["Top area","Middle area","Bottom area"]', `Player boxes: ${r.out.player}`);
      ok(r.cast === "Cast", `Cast button reads "${r.cast}" in the Top area box`);
      const at = x => r.seq.indexOf(x);
      // (Nov 25, 12:49: Player controls background comes after the three area boxes)
      ok(at("Middle area") < at("Bottom area") && at("Bottom area") < at("morphe_copy_video_link_button") && at("Bottom area") < at("morphe_hide_player_control_buttons_background"), `order: ${r.seq.join(", ")}`);
      ok(r.out.shorts.includes("Right side") && r.out.comments.includes("Comment box") && r.out.seekbar.includes("Haptics"), JSON.stringify(r.out));
      ok(!errors.length, errors.join("; "));
      await ctx.close();
    },
  },
  {
    name: "area-box-rows-still-work",
    report: "Nov 25: the area boxes must not break what a card does: its toggle, the preview tap that selects it, the hidden part's collapse, Morphe's value",
    async run() {
      const { p, ctx, errors } = await open();
      await p.evaluate(async () => { setPicker(false); quickSection("player"); renderList(); await new Promise(r => setTimeout(r, 600)); });
      // the Hide half of Cast's toggle, in the Top area box
      await p.locator('#list [data-area="Top area"] [data-row="morphe_hide_cast_button"] .lt7 > span').first().click(); await p.waitForTimeout(500);
      const v1 = await p.evaluate(() => ({ v: V("morphe_hide_cast_button"), shown: shown("morphe_hide_cast_button") }));
      ok(v1.v === true && v1.shown === false, `Hide on Cast in its box: ${JSON.stringify(v1)}`);
      // tapping Captions in the preview selects its row inside the box
      await p.evaluate(() => { const e = document.querySelector('#stage [data-k="morphe_hide_captions_button"]'); e.scrollIntoView({ block: "center" }); });
      await p.locator('#stage [data-k="morphe_hide_captions_button"]').first().click(); await p.waitForTimeout(700);
      const sel = await p.evaluate(() => ({ selected, rowSel: !!document.querySelector('#list [data-area="Top area"] [data-row="morphe_hide_captions_button"].sel') }));
      ok(sel.selected === "morphe_hide_captions_button" && sel.rowSel, `preview tap: ${JSON.stringify(sel)}`);
      // the switches design: the box's switch flips Morphe's boolean
      await p.evaluate(async () => { design = "toggles"; renderBar(); renderList(); await new Promise(r => setTimeout(r, 400)); });
      await p.locator('#list [data-area="Bottom area"] [data-sw="morphe_mute_video_button"]').click(); await p.waitForTimeout(500);
      const v2 = await p.evaluate(() => V("morphe_mute_video_button"));
      ok(v2 === true, `Mute's switch in the Bottom area box: ${v2}`);
      ok(!errors.length, errors.join("; "));
      await ctx.close();
    },
  },
  {
    name: "long-toggle-titles-fade-and-slide",
    report: "Nov 25: Comments carousel filter cut \"Community\" beside its toggle; a title that doesn't fit fades out with an ellipsis, and pressing its toggle slides it right to left",
    async run() {
      const { p, ctx } = await open("index.html", { viewport: { width: 290, height: 740 }, touch: true });
      const k = "morphe_hide_comments_carousel_filter_strings";
      await p.evaluate(async k => { setPicker(false); setPref("morphe_hide_comments_carousel", true); commit(); quickSection(sectionOf(k)); renderList(); await new Promise(r => setTimeout(r, 900)); document.querySelector(`#list [data-lst="${k}"]`).scrollIntoView({ block: "center" }); await new Promise(r => setTimeout(r, 300)); }, k);
      const name = `#list [data-lst="${k}"] .lchc:has([data-lch="Community"]) .lchn`;
      const st = await p.evaluate(sel => { const e = document.querySelector(sel); return e && { ovf: e.classList.contains("ovf"), over: e.scrollWidth - e.clientWidth }; }, name);
      ok(st && st.over > 1 && st.ovf, `Community at 290 px: ${JSON.stringify(st)}`);
      await p.evaluate(sel => { window.__slid = []; const o = Element.prototype.animate; Element.prototype.animate = function (k, t) { if (Array.isArray(k) && k.some(f => "textIndent" in f)) window.__slid.push(this.textContent); return o.call(this, k, t); }; }, name);
      await p.locator(`#list [data-lst="${k}"] .lchc:has([data-lch="Community"]) [data-lch]`).tap(); await p.waitForTimeout(600); // a real touch, scrolled into view
      const slid = await p.evaluate(() => window.__slid);
      ok(slid.includes("Community"), `pressing its toggle doesn't slide the title (slid: ${slid.join(", ")})`);
      await ctx.close();
    },
  },
  {
    name: "estimated-likes-label-has-room",
    report: "Nov 25: Estimated likes: \"Hidden by owner\" was clipped",
    async run() {
      const { p, ctx } = await open();
      const r = await p.evaluate(async () => {
        setPicker(false); setPref("morphe_ryd_enabled", true); commit(); quickSection(sectionOf("morphe_ryd_estimated_like")); await new Promise(r => setTimeout(r, 500));
        select("morphe_ryd_estimated_like", "list"); await new Promise(r => setTimeout(r, 1500));
        return [...document.querySelectorAll("#canvas .lkc7")].map(l => l.closest('div[style*="background:#272727"]')).map(pl => {
          let c = pl.parentElement; while (c && getComputedStyle(c).overflow === "visible") c = c.parentElement;
          const a = pl.getBoundingClientRect(), z = c.getBoundingClientRect(), l = pl.querySelector(".lkc7"), sp = l.parentElement.parentElement.getBoundingClientRect(), lr = l.getBoundingClientRect();
          return { text: l.textContent, room: z.right - a.right, gap: sp.right - lr.right, shrinks: [...pl.children].some(x => getComputedStyle(x).flexShrink !== "0") };
        });
      });
      ok(r.length === 2, `like pills: ${JSON.stringify(r)}`);
      // nothing in the pill may shrink (a squeezed label ran into the divider), and the pill fits with room to spare
      r.forEach(x => ok(x.room >= 8 && x.gap >= 3 && !x.shrinks, `"${x.text}" has no room: ${JSON.stringify(x)}`));
      await ctx.close();
    },
  },
  {
    name: "feed-like-position-flashes-only-the-badge",
    report: "Nov 25: changing Feed thumbnail like position flashed the duration, the title and the views badge",
    async run() {
      const { p, ctx } = await open();
      const k = "morphe_ryd_feed_counts_position";
      const r = await p.evaluate(async k => {
        setPicker(false); setPref("morphe_ryd_enabled", true); commit(); quickSection(sectionOf(k)); renderList(); await new Promise(r => setTimeout(r, 500));
        select(k, "list"); await new Promise(r => setTimeout(r, 1800));
        const before = V(k); setPref(k, "MIDDLE_RIGHT"); commit(); playScenario(k, before); await new Promise(r => setTimeout(r, 900));
        const hit = new Set();
        for (const a of document.getAnimations()) { const t = a.effect?.target; if (!t || !t.closest || !t.closest("#canvas")) continue; if (a.effect.getKeyframes().some(f => "boxShadow" in f && "scale" in f)) hit.add(t); }
        return [...hit].filter(t => !t.closest(".fb7")).map(t => (t.textContent || t.className.baseVal || t.tagName).trim().slice(0, 20));
      }, k);
      ok(!r.length, `unrelated parts flash: ${r.join(", ")}`);
      await ctx.close();
    },
  },
  {
    name: "every-popup-grows-from-its-button",
    report: "Nov 25: the Reset dialog's popup grows out of its button; the screen menu and the preview's tray of buttons that are off did not",
    async run() {
      const { p, ctx } = await open();
      const centre = sel => p.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width }; }, sel);
      const pill = await centre("#secPill");
      // the first frame, measured in the same task as the tap (a busy machine let the spring run on before a later read)
      const tapNow = (btn, sel) => p.evaluate(([btn, sel]) => { const b = document.querySelector(btn); b.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })); b.click(); const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width }; }, [btn, sel]);
      const m0 = await tapNow("#secPill", "#picker"); await p.waitForTimeout(500); const m1 = await centre("#picker");
      ok(m0 && Math.hypot(m0.x - pill.x, m0.y - pill.y) < 60 && m0.w < m1.w * .5, `the screen menu doesn't start at its button: ${JSON.stringify({ pill, m0, m1 })}`);
      await p.evaluate(() => setPicker(false)); await p.waitForTimeout(400);
      await p.evaluate(async () => { quickSection("player"); await new Promise(r => setTimeout(r, 600)); });
      const tp = await centre("#stage [data-tray]");
      const t0 = await tapNow("#stage [data-tray]", "#stage .tray"); await p.waitForTimeout(500); const t1 = await centre("#stage .tray");
      ok(t0 && Math.hypot(t0.x - tp.x, t0.y - tp.y) < 60 && t0.w < t1.w * .6, `the tray doesn't start at its pill: ${JSON.stringify({ tp, t0, t1 })}`);
      await p.click("#stage [data-tray]"); await p.waitForTimeout(80);
      const c0 = await centre("#stage .tray");
      ok(c0 && c0.w < t1.w, `the tray doesn't shrink back into its pill: ${JSON.stringify(c0)}`);
      await ctx.close();
    },
  },
  {
    name: "tab-fill-passes-over-pressed-tab",
    report: "Nov 25 (phone): the tapped tab's grey was drawn over the moving white fill until it landed",
    async run() {
      const { p, ctx } = await open();
      await p.evaluate(async () => { setPicker(false); quickSection("player"); await new Promise(r => setTimeout(r, 700)); });
      const tab = '#tabs .tab7[data-tab="flyout"]';
      await p.evaluate(sel => document.querySelector(sel).scrollIntoView({ inline: "center" }), tab); await p.waitForTimeout(400);
      const b = await p.locator(tab).boundingBox();
      await p.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await p.mouse.down(); await p.waitForTimeout(250); await p.mouse.up();
      await p.waitForTimeout(40);
      // a phone keeps the press (:active scale, glass brightness) on the tab for a moment after the tap, while
      // the fill already moves; here the press is put back by hand, as the phone has it
      const r = await p.evaluate(sel => { const t = document.querySelector(sel); t.style.transform = "scale(.96)"; t.style.filter = "brightness(1.18)"; const cs = getComputedStyle(t); return { gliding: t.parentElement.classList.contains("gliding"), transform: cs.transform, filter: cs.filter }; }, tab);
      ok(r.gliding, `no glide ran: ${JSON.stringify(r)}`);
      ok(r.transform === "none" && (r.filter === "none" || !r.filter), `the tapped tab paints over the fill: ${JSON.stringify(r)}`);
      await ctx.close();
    },
  },
  {
    name: "flash-glow-never-clipped",
    report: "Nov 25: hiding and showing a Navigation bar button began with a green glow cut off at its top and bottom",
    async run() {
      const { p, ctx } = await open();
      await p.evaluate(async () => { setPicker(false); quickSection("nav"); await new Promise(r => setTimeout(r, 700)); });
      for (const k of ["morphe_hide_home_button", "morphe_hide_subscriptions_button"]) {
        await p.locator(`#list [data-row="${k}"]`).first().scrollIntoViewIfNeeded(); await p.waitForTimeout(300);
        // switch the setting and read the first frames of the flash: every flashing part's glow (2 px around it)
        // must fit in the boxes that clip it, or be drawn on the ring layer instead
        await p.evaluate(() => {
          window.__glow = [];
          const tick = n => {
            const layer = $("ringLayer");
            for (const e of document.querySelectorAll("#stage .c.flash:not(.flat)")) {
              const q = e.getBoundingClientRect(); if (q.width < 2 || q.height < 2) continue;
              let t = -1e9, b = 1e9, l = -1e9, rr = 1e9;
              for (let a = e; a && a !== $("stage").parentElement; a = a.parentElement) { const cs = getComputedStyle(a); if (cs.overflowX !== "visible" || cs.overflowY !== "visible") { const c = a.getBoundingClientRect(); t = Math.max(t, c.top); b = Math.min(b, c.bottom); l = Math.max(l, c.left); rr = Math.min(rr, c.right); } }
              const cut = q.top - 2 < t - .5 || q.bottom + 2 > b + .5 || q.left - 2 < l - .5 || q.right + 2 > rr + .5;
              const own = getComputedStyle(e, "::after").display !== "none";
              __glow.push({ n, k: e.dataset.k, cut, own, layer: !!layer.querySelector("i.flash") });
            }
            if (n < 30) requestAnimationFrame(() => tick(n + 1));
          };
          requestAnimationFrame(() => tick(0));
        });
        await p.locator(`#list [data-row="${k}"] .lt7, #list [data-row="${k}"] .sw`).first().click();
        await p.waitForTimeout(700);
        const seen = await p.evaluate(() => __glow);
        const r = seen.filter(g => g.cut && (g.own || !g.layer)).map(g => `frame ${g.n} ${g.k}: ${g.own ? "own glow cut off" : "no glow on the ring layer"}`);
        ok(seen.length, `${k}: no flash seen`);
        ok(!r.length, `${k}: ${r.join("; ")}`);
        await p.waitForTimeout(700);
      }
      await ctx.close();
    },
  },
  {
    name: "caret-hidden-under-preview",
    report: "Nov 25: with the cursor in a text field, scrolling it up under the preview drew the blinking cursor over the preview",
    async run() {
      const { p, ctx } = await open();
      await p.evaluate(async () => { setPicker(false); quickSection("nav"); await new Promise(r => setTimeout(r, 700)); });
      // a text field in the list: focus it in view, then scroll it up under the pinned preview
      const r = await p.evaluate(async () => {
        const f = [...document.querySelectorAll("#list input[type=text], #list input:not([type]), #list input[type=number], #list textarea")].find(x => x.offsetParent);
        if (!f) return { none: true };
        const sc = $("scroller"); f.scrollIntoView({ block: "end" }); await new Promise(r => setTimeout(r, 200)); f.focus({ preventScroll: true });
        await new Promise(r => setTimeout(r, 100));
        const shown = getComputedStyle(f).caretColor;
        const st = $("stick").getBoundingClientRect(), fr = f.getBoundingClientRect();
        sc.scrollTop += fr.top - st.bottom + 30; // the field's top now under the preview
        sc.dispatchEvent(new Event("scroll")); await new Promise(r => setTimeout(r, 100));
        const under = f.getBoundingClientRect().top < $("stick").getBoundingClientRect().bottom;
        return { shown, under, hidden: getComputedStyle(f).caretColor };
      });
      ok(!r.none, "no text field on the Navigation screen");
      ok(r.under, `the field didn't reach the preview: ${JSON.stringify(r)}`);
      ok(r.shown !== "rgba(0, 0, 0, 0)" && r.hidden === "rgba(0, 0, 0, 0)", `the caret stays drawn under the preview: ${JSON.stringify(r)}`);
      await ctx.close();
    },
  },
  {
    name: "buttons-without-labels-in-preview",
    report: "Nov 25: Navigation buttons without labels did nothing in the preview, with or without the Glass navigation bar",
    async run() {
      const { p, ctx } = await open();
      await p.evaluate(async () => { setPicker(false); quickSection("nav"); await new Promise(r => setTimeout(r, 700)); });
      const tap = async k => { const t = p.locator(`#list [data-row="${k}"] .lt7, #list [data-row="${k}"] .sw`).first(); await t.scrollIntoViewIfNeeded(); await t.click(); await p.waitForTimeout(700); };
      const labels = () => p.evaluate(() => [...document.querySelectorAll('#stage .navbar [data-k="morphe_hide_navigation_button_labels"]')].filter(e => e.offsetHeight).length);
      const K = "morphe_disable_icon_only_navigation_buttons", G = "morphe_navigation_bar_glass";
      const steps = [];
      steps.push(["start", await labels()]);
      await tap(K); steps.push(["icon only", await labels()]);
      await tap(G); steps.push(["icon only, glass", await labels()]);
      await tap(K); steps.push(["labels, glass", await labels()]);
      await tap(K); steps.push(["icon only, glass again", await labels()]);
      await tap(G); steps.push(["icon only, glass off", await labels()]);
      await tap(K); steps.push(["labels, glass off", await labels()]);
      const want = [true, false, false, true, false, false, true];
      ok(steps.every(([, n], i) => (n > 0) === want[i]), `labels drawn: ${JSON.stringify(steps)}`);
      await ctx.close();
    },
  },
  {
    name: "tour-steps-one-by-one",
    report: "Nov 25: the animation tour reset to random numbers and didn't cycle through the animations in order",
    async run() {
      const { p, ctx } = await open();
      await p.evaluate(() => { setPicker(false); document.getElementById("devTourBtn").click(); });
      const seen = [];
      for (let n = 0; n < 24; n++) {
        await p.click("#devTour .dt-go[data-d=\"1\"]"); await p.waitForTimeout(n % 3 ? 150 : 900); // quick taps and settled ones
        seen.push(await p.evaluate(() => document.querySelector("#devTour .dt-n").textContent.split(" / ")[0] | 0));
      }
      ok(seen.every((x, i) => x === i + 1), `tour numbers: ${seen.join(",")}`);
      await ctx.close();
    },
  },
  {
    name: "value-wheel-turns-and-types",
    report: "Nov 25: number settings (Glass navigation bar size) get a turning wheel; a tap on its middle opens a field on top of the keyboard and the top bar hides so the preview stays in view",
    async run() {
      const { p, ctx } = await open();
      const K = "morphe_navigation_bar_glass_height";
      await p.evaluate(async () => { setPicker(false); quickSection("nav"); setPref("morphe_navigation_bar_glass", true); renderAll(); await new Promise(r => setTimeout(r, 700)); });
      const w = p.locator(`#list .wheel[data-wheel="${K}"]`); ok(await w.count(), "no wheel for Glass navigation bar size");
      // in the free part of the screen, below the pinned preview
      await p.evaluate(k => { const el = document.querySelector(`#list .wheel[data-wheel="${k}"]`), sc = $("scroller"); sc.scrollTop += el.getBoundingClientRect().bottom - innerHeight + 120; }, K); await p.waitForTimeout(400);
      const bb = await w.boundingBox(), y = bb.y + bb.height / 2, v0 = await p.evaluate(k => state[k], K);
      // a sideways drag (the mouse here; a finger on the phone, checked by hand) turns it
      let x = bb.x + bb.width * .7; await p.mouse.move(x, y); await p.mouse.down();
      for (let i = 0; i < 10; i++) { x -= 12; await p.mouse.move(x, y); await p.waitForTimeout(16); }
      await p.mouse.up(); await p.waitForTimeout(1200);
      const v1 = await p.evaluate(k => state[k], K);
      ok(v1 > v0, `swiping the wheel left didn't raise the value: ${v0} -> ${v1}`);
      await p.mouse.click(bb.x + bb.width / 2, y); await p.waitForTimeout(600);
      const r = await p.evaluate(() => ({ pill: !!document.querySelector(".vpill"), focus: document.activeElement.className, bar: $("app").classList.contains("barhidden") }));
      ok(r.pill && r.focus === "vpin" && r.bar, `tapping the middle value: ${JSON.stringify(r)}`);
      await p.keyboard.press("Control+A"); await p.keyboard.type("120"); await p.waitForTimeout(150);
      const live = await p.evaluate(k => state[k], K);
      await p.keyboard.press("Enter"); await p.waitForTimeout(500);
      const end = await p.evaluate(k => ({ v: state[k], pill: !!document.querySelector(".vpill"), pos: document.querySelector(`.wheel[data-wheel="${k}"]`).dataset.pos }), K);
      ok(live === 120 && end.v === 120 && !end.pill, `typing 120: live ${live}, after Enter ${JSON.stringify(end)}`);
      await ctx.close();
    },
  },
  {
    name: "landscape-popups-and-menu-fit",
    report: "Nov 25 (landscape): the card menu was poorly laid out, popups were cut off at the top and bottom, and card lists cut off their longest line",
    async run() {
      const { p, ctx } = await open("app/index.html", { viewport: { width: 915, height: 412 } });
      const menu = await p.evaluate(() => { const pg = document.querySelector("#pickGrid .pg.pgroups"); return { cols: getComputedStyle(pg).gridTemplateColumns.split(" ").length, cut: [...document.querySelectorAll(".gc-tabs span, .gc-t")].filter(s => s.scrollWidth > s.clientWidth + 1).map(s => s.textContent) }; });
      ok(menu.cols === 3 && !menu.cut.length, `landscape menu: ${JSON.stringify(menu)}`);
      // a tall popup: the box that previews a setting from another screen, and a list dialog
      const r = await p.evaluate(async () => {
        const out = [];
        for (const open of [() => borrowPopup("morphe_hide_shorts_button", "morphe_hide_navigation_bar"), () => restartDialog && openDialog(`<h2 id="dlgTitle">T</h2>${"<p>line</p>".repeat(30)}<div class="acts"><button class="dbtn" data-x>OK</button></div>`)]) {
          open(); await new Promise(r => setTimeout(r, 700));
          const b = $("dlgBox").getBoundingClientRect(), app = $("app").getBoundingClientRect();
          out.push({ top: Math.round(b.top - app.top), bottom: Math.round(app.bottom - b.bottom) });
          closeDialog(); await new Promise(r => setTimeout(r, 400));
        }
        return out;
      });
      ok(r.every(x => x.top >= 0 && x.bottom >= 0), `popups run past the screen: ${JSON.stringify(r)}`);
      await ctx.close();
    },
  },
  {
    name: "menu-card-lists-never-cut",
    report: "Nov 25: the Player card cut off \"Seekbar & ge…\" and Watch page \"Flying comm…\" in the main menu",
    async run() {
      for (const vp of [{ width: 360, height: 740 }, { width: 384, height: 832 }, { width: 412, height: 915 }]) {
        const { p, ctx } = await open("app/index.html", { viewport: vp });
        await p.waitForTimeout(800);
        const cut = await p.evaluate(() => [...document.querySelectorAll(".gc-tabs span, .gc-t")].filter(s => s.scrollWidth > s.clientWidth + 1).map(s => s.textContent));
        ok(!cut.length, `${vp.width}x${vp.height}: cut off ${cut.join(", ")}`);
        await ctx.close();
      }
    },
  },
  {
    name: "area-order-as-asked-nov25",
    report: "Nov 25 (12:49): Player controls background after the three area boxes; 'New posts' with the suggested actions (bottom), copied without \"button\"; Player menu without top/bottom boxes",
    async run() {
      const { p, ctx } = await open();
      const r = await p.evaluate(async () => {
        const out = {};
        setPicker(false); quickSection("player"); await new Promise(r => setTimeout(r, 600));
        const bgRow = document.querySelector('#list [data-row="morphe_hide_player_control_buttons_background"]'), box = document.querySelector('#list [data-area="Bottom area"]');
        out.bg = bgRow ? 1 : -1; out.bottom = box ? 0 : -1; if (bgRow && box) out.bg = box.compareDocumentPosition(bgRow) & Node.DOCUMENT_POSITION_FOLLOWING ? 1 : -2;
        quickSection("shorts"); await new Promise(r => setTimeout(r, 600));
        const np = document.querySelector('#list [data-row="morphe_hide_shorts_new_posts_button"]');
        out.npBox = np && np.closest("[data-area]")?.dataset.area; out.npTitle = np && np.querySelector(".ttl").textContent;
        quickSection("flyout"); await new Promise(r => setTimeout(r, 600));
        out.flyout = [...document.querySelectorAll("#list [data-area]")].map(e => e.dataset.area);
        return out;
      });
      ok(r.bottom >= 0 && r.bg > r.bottom, `Player controls background not after the Bottom area box: ${JSON.stringify(r)}`);
      ok(r.npBox === "Bottom area" && !/button/i.test(r.npTitle || "x button"), `'New posts': ${JSON.stringify(r)}`);
      ok(!r.flyout.some(a => /Top of|Bottom of/.test(a)), `Player menu boxes: ${JSON.stringify(r.flyout)}`);
      await ctx.close();
    },
  },
  {
    name: "shorts-icon-style-draws-its-icons",
    report: "Nov 25 (12:49): 'Shorts icon style' did nothing in the preview",
    async run() {
      const { p, ctx } = await open();
      const r = await p.evaluate(async () => {
        const out = {};
        setPicker(false); quickSection("shorts"); await new Promise(r => setTimeout(r, 500));
        for (const st of ["AUTO", "FLUENT", "PHOSPHOR"]) {
          setPref("morphe_shorts_icon_style", st); commit(); renderStage(); await new Promise(r => setTimeout(r, 100));
          const like = document.querySelector('#stage [data-k="morphe_hide_shorts_like_button"] svg');
          out[st] = like ? like.outerHTML : "";
        }
        return out;
      });
      ok(r.AUTO && r.FLUENT && r.PHOSPHOR, `no like button: ${JSON.stringify(r).slice(0, 200)}`);
      ok(r.FLUENT !== r.AUTO && r.PHOSPHOR !== r.AUTO && r.FLUENT !== r.PHOSPHOR, "the like icon is the same in every Shorts icon style");
      await ctx.close();
    },
  },
  {
    name: "shorts-menu-opens-once",
    report: "Nov 25 (12:49): Audio track, Captions and Playback speed in the Shorts menu restarted the menu's opening animation; Download in Shorts menu was a different drawing",
    async run() {
      const { p, ctx } = await open();
      const r = await p.evaluate(async () => {
        const out = { slides: [], download: null };
        setPref("morphe_download_mode", "EXTERNAL"); commit();
        setPicker(false); quickSection("shorts"); await new Promise(r => setTimeout(r, 500));
        for (const k of ["morphe_hide_shorts_flyout_captions", "morphe_shorts_playback_speed_flyout_button", "morphe_hide_shorts_flyout_audio_track", "morphe_shorts_download_flyout_button"]) {
          select(k, "list"); await new Promise(r => setTimeout(r, 40));
          out.slides.push(document.getAnimations().filter(a => a.animationName === "sheetup" && a.effect?.target?.closest?.("#stage")).length);
          await new Promise(r => setTimeout(r, 400));
        }
        out.download = !!document.querySelector('#stage [data-k="morphe_shorts_download_flyout_button"]');
        return out;
      });
      ok(r.slides[0] === 1, `the Shorts menu did not slide up when it opened: ${JSON.stringify(r)}`);
      ok(r.slides.slice(1).every(n => n === 0), `the Shorts menu slid up again while open: ${JSON.stringify(r)}`);
      ok(r.download, "Download in Shorts menu is not in the Shorts menu");
      await ctx.close();
    },
  },
  {
    name: "about-is-not-a-shorts-setting",
    report: "Nov 25 (12:49): 'About' was listed in Shorts and did nothing (Morphe's About row sits above every screen)",
    async run() {
      const { p, ctx } = await open();
      const r = await p.evaluate(async () => {
        setPicker(false); quickSection("shorts"); await new Promise(r => setTimeout(r, 500));
        return { row: !!document.querySelector('#list [data-row="morphe_settings_screen_00_about"]'), anywhere: Object.keys(MEMBERS).filter(s => [...MEMBERS[s].live, ...MEMBERS[s].misc].includes("morphe_settings_screen_00_about")) };
      });
      ok(!r.row && !r.anywhere.length, `About is listed: ${JSON.stringify(r)}`);
      await ctx.close();
    },
  },
  {
    name: "gesture-hint-not-stuck",
    report: "Nov 25 (12:49): the 'Pull up for precise seeking' pill stayed on screen in Slide to seek, Precise seeking gesture and others",
    async run() {
      const { p, ctx } = await open();
      const r = await p.evaluate(async () => {
        const vis = () => { const h = document.querySelector('#stage [data-k="morphe_hide_player_gesture_hints"]'); return !!h && getComputedStyle(h).visibility !== "hidden" && h.getBoundingClientRect().height > 0; };
        setPicker(false); quickSection("seekbar"); await new Promise(r => setTimeout(r, 500));
        const out = { rest: vis() };
        for (const k of ["morphe_slide_to_seek", "morphe_disable_precise_seeking_gesture", "morphe_tap_to_seek"]) { select(k, "list"); await new Promise(r => setTimeout(r, 600)); out[k] = vis(); }
        select("morphe_hide_player_gesture_hints", "list"); await new Promise(r => setTimeout(r, 600)); out.own = vis();
        return out;
      });
      const stuck = Object.entries(r).filter(([k, v]) => k !== "own" && v).map(([k]) => k);
      ok(!stuck.length, `the gesture hint pill shows in: ${stuck.join(", ")}`);
      ok(r.own, "the gesture hint pill does not show for its own setting");
      await ctx.close();
    },
  },
];

(async () => {
  const dir = buildSite(), srv = await serve(dir);
  BASE = `http://localhost:${srv.address().port}/`;
  browser = await chromium.launch();
  let fails = 0;
  for (const c of CHECKS.filter(c => !ONLY || c.name.includes(ONLY))) {
    const t0 = Date.now();
    try { await c.run(); console.log(`ok   ${c.name} (${Date.now() - t0} ms)`); }
    catch (e) { fails++; console.log(`FAIL ${c.name}: ${e.message}\n     guards: ${c.report}`); }
  }
  await browser.close(); srv.close(); fs.rmSync(dir, { recursive: true, force: true }); fs.rmSync(dir + ".av", { recursive: true, force: true });
  console.log(fails ? `${fails} check(s) failed` : "all checks passed");
  process.exit(fails ? 1 : 0);
})();
