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
      await p.waitForTimeout(60); const mid = await gap(); await p.waitForTimeout(500); const end = await gap();
      ok(g0 > end + 4, `the example side doesn't start wider than 4 dp (${g0} vs ${end})`);
      ok(mid > end + 2 && mid < g0, `the first slider step cuts instead of gliding: ${g0} → ${mid} → ${end}`);
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
