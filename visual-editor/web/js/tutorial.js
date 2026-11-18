"use strict";
// The first-run tutorial.

// ------------------------------------------------------------------ first-run tutorial
// Short numbered pages that loop on their own; OK appears after two full loops, or once every page
// has been opened by hand. Tapping a page jumps there and stops the automatic advance.
// The pages follow the current layout: "Group screens into tabs" adds a first page about screens
// and tabs, "Hide shown UI element settings" adds one about the shorter list.
const TUT_PAGES = {
  groups: { cap: "Pick a screen, then a tab", sub: "Six screens in the menu. Tabs under the preview switch it to that part of the app" },
  tap: { cap: "Tap something in the preview", sub: "Its setting card opens in the list" },
  change: { cap: "Double-tap it to change the setting", sub: "Holding it, or the toggle on its card, works too. Here the button gets hidden" },
  find: { cap: "Tap a hidden setting to find it", sub: "An outline shows where it was. Double-tap or hold it, or use the toggle, to bring it back" },
  tools: { ms: 6300, cap: "Search, reset and compare", sub: "Search finds any setting. Reset undoes your changes. Original shows stock YouTube, Morphe shows yours" },
  custom: { ms: 12300, cap: "Make it yours", sub: "At the end of the screen menu: group screens into tabs, and pick how the settings list looks" },
};
const tutPages = () => [...(grouped ? ["groups"] : []), "tap", "change", "find", "tools", "custom"];
const TUT_STEP_MS = 4200;
// the Cast setting's card as each list design draws it
function tutRowHTML(d) {
  const sum = esc((PREF.morphe_hide_cast_button && PREF.morphe_hide_cast_button.summary) || "");
  const right = d === "clean" ? `<span class="lt7" id="tlSw" role="presentation" aria-checked="false" data-at="r" data-tone="pos"><i></i><span>Hide</span><span>Show</span></span>`
    : d === "toggles" ? `<span class="sw" id="tlSw" role="presentation" aria-checked="false"></span>` : `<span class="state on" id="tlSw" aria-checked="false">Shown</span>`;
  return `<div class="tl-t">${d === "clean" ? "Cast button" : "Hide Cast button"}<small>${sum}</small></div>${right}<div class="tl-bar" id="tlBar"></div>`;
}
// small stand-ins for what the preview shows on a few screens, so picking a screen or tab visibly changes it
const TUT_VIEWS = `<div class="tview" data-v="watch"><div class="tv-vid" style="background:${ART[0]}"></div><div class="tv-l w80"></div><div class="tv-l w50"></div><div class="tv-chips"><i></i><i></i><i></i><i></i></div></div>
  <div class="tview" data-v="comments"><div class="tv-vid short" style="background:${ART[0]}"></div><div class="tv-h">Comments</div>${[0, 1, 2].map(i => `<div class="tv-c"><b style="background:${AV[i + 1]}"></b><span><i class="w40"></i><i class="w80"></i></span></div>`).join("")}</div>`;
function runTutorial(startAt) {
  const t = $("tut"), pages = tutPages();
  const playerTabs = GROUPS[0].tabs.map(([, n]) => n), watchTabs = GROUPS.find(g => g.id === "g_watch").tabs.map(([, n]) => n);
  const pickGroups = GROUPS.map(g => `<span data-g="${g.id}">${I(g.icon)}${esc(g.title)}</span>`).join("");
  const pickScreens = SECTIONS.filter(x => x.id !== "misc").slice(0, 12).map(s => `<span class="sm">${esc(s.title)}</span>`).join("");
  t.innerHTML = `<h2>Visual settings</h2><p class="tsub">See what each Morphe setting changes</p>
    <div class="tcap" id="tcap"></div>
    <div class="tdemo">
      <div class="tbar7" id="tBar"><span class="tpill" id="tPill">Player ${I("expand")}</span><span class="tsp"></span><span class="tic" id="tSearch">${I("search")}</span><span class="tic" id="tReset">${I("reset")}</span><span class="tseg"><b id="tOrig">Original</b><b id="tMorphe" class="on">Morphe</b></span><div class="tq" id="tQ"></div></div>
      <div class="tstage" id="tStage" style="background:${ART[0]}"><div class="tbtns"><div class="tb" id="tbCC">${I("cc")}</div><div class="tb" id="tbCast">${I("cast")}<div class="tring" id="tring"></div></div><div class="tb">${I("gear")}</div></div>
        <div class="tseek"><div></div></div>${TUT_VIEWS}
        <div class="tpick" id="tPick"><div class="tpg" id="tPg">${pickGroups}</div>
          <div class="tpfoot"><div class="tprow">Group screens into tabs<span class="sw" id="tGsw" aria-checked="${grouped}"></span></div>
            <div class="tprow">List design<span class="tseg3">${[["classic", "Morphe"], ["toggles", "Switches"], ["clean", "Clean"]].map(([d, n]) => `<b data-d="${d}" class="${d === design ? "on" : ""}">${n}</b>`).join("")}</span></div></div></div>
        <div class="tmenu" id="tMenu"><b>Reset settings?</b><span>Only this screen</span><span>Everything</span></div></div>
      <div class="ttabs" id="tTabs">${playerTabs.map((n, i) => `<span class="${i ? "" : "on"}">${esc(n)}</span>`).join("")}</div>
      <div class="tlist" id="tlist">${tutRowHTML(design)}</div>
    </div>
    <div class="finger tfinger" id="tFinger">${I("gesture")}<span class="tx2">2×</span></div>
    <div class="steps" role="tablist" aria-label="Tutorial pages">${pages.map((_, n) => `<button role="tab" data-step="${n}" aria-label="Page ${n + 1}"><i></i></button>`).join("")}</div>
    <button class="ok" id="tutOk">OK</button>`;
  t.classList.add("on");
  let step = Math.max(0, pages.indexOf(startAt)), loops = 0, manual = false; const seen = new Set();
  if (startAt) setTimeout(() => $("tutOk") && $("tutOk").classList.add("show"), TUT_PAGES[startAt]?.ms || TUT_STEP_MS); // opened for one new page: OK once it has played
  const cast = $("tbCast"), f = $("tFinger"), ring = $("tring"), row = $("tlist"), stage = $("tStage"), demo = t.querySelector(".tdemo");
  let rowDesign = design, sw = $("tlSw");
  const setRowDesign = d => { if (d === rowDesign) return; const h = sw.getAttribute("aria-checked") === "true"; rowDesign = d; row.innerHTML = tutRowHTML(d); sw = $("tlSw"); setHidden(h, true); row.classList.remove("morph"); void row.offsetWidth; row.classList.add("morph"); t.querySelectorAll(".tseg3 b").forEach(b => b.classList.toggle("on", b.dataset.d === d)); };
  const box = t.getBoundingClientRect.bind(t);
  const at2 = (ms, fn) => clock.after("tutPage", ms, fn);
  const centerOf = el => { const r = el.getBoundingClientRect(), b = box(); return [r.left - b.left + r.width / 2, r.top - b.top + r.height / 2]; };
  const move = (el, ms, dx = 0, dy = 0) => { const [x, y] = centerOf(el); f.style.transition = ms ? `left ${ms}ms var(--ease), top ${ms}ms var(--ease), opacity 160ms` : "opacity 160ms"; f.style.left = (x + dx) + "px"; f.style.top = (y + dy) + "px"; f.classList.add("show"); };
  const tap = () => { f.classList.remove("tap"); void f.offsetWidth; f.classList.add("tap"); };
  // a double-tap has to read as two taps: two ripples with a clear gap and a "2×" badge by the finger
  const dbl = fn => { f.classList.add("x2"); tap(); at2(300, () => { tap(); fn(); }); at2(1100, () => f.classList.remove("x2")); };
  const setHidden = (h, still) => {
    if (still) sw.classList.add("still");
    sw.setAttribute("aria-checked", String(h)); // the description stays as in the list; only the toggle changes
    if (rowDesign === "clean") { sw.dataset.at = h ? "l" : "r"; sw.dataset.tone = h ? "neg" : "pos"; }
    if (rowDesign === "classic") { sw.className = "state " + (h ? "off" : "on"); sw.textContent = h ? "Hidden" : "Shown"; }
    if (still) { void sw.offsetWidth; sw.classList.remove("still"); }
  };
  const setView = v => { stage.dataset.view = v || ""; };
  const setTabs = (names, on) => t.querySelectorAll("#tTabs span").forEach((s, i) => { s.textContent = names[i] || ""; s.style.display = names[i] ? "" : "none"; s.classList.toggle("on", i === on); });
  const setGrouped = g => { $("tGsw").setAttribute("aria-checked", String(g)); demo.classList.toggle("grouped", g); $("tPg").innerHTML = g ? pickGroups : pickScreens; $("tPg").classList.toggle("many", !g); };
  const pageSub = id => id === "change" && design === "classic" ? "Holding it works too. Here the button gets hidden"
    : id === "find" && design === "classic" ? "An outline shows where it was. Double-tap or hold it to bring it back" : TUT_PAGES[id].sub;
  // the caption area keeps the height of the tallest page, so the demo below never jumps
  { const cap = $("tcap"); let hMax = 0; pages.forEach((id, n) => { cap.innerHTML = `<b>${n + 1}</b>${TUT_PAGES[id].cap}<small>${pageSub(id)}</small>`; hMax = Math.max(hMax, cap.offsetHeight); }); cap.style.minHeight = hMax + "px"; }
  const show = () => {
    clock.start("tutPage");
    seen.add(step);
    const id = pages[step];
    t.querySelectorAll(".steps button").forEach((b, n) => { b.classList.toggle("on", n === step); b.setAttribute("aria-selected", String(n === step)); b.classList.toggle("done", seen.has(n)); });
    $("tcap").innerHTML = `<b>${step + 1}</b>${TUT_PAGES[id].cap}<small>${pageSub(id)}</small>`;
    // every page starts from the same scene; each one switches on the extras it needs
    demo.dataset.page = id;
    f.classList.remove("tap", "hold", "x2"); ring.classList.remove("go"); row.classList.remove("sel", "morph");
    ["tPick", "tMenu", "tQ"].forEach(x => $(x).classList.remove("show")); $("tQ").textContent = "";
    $("tOrig").classList.remove("on"); $("tMorphe").classList.add("on"); stage.classList.remove("stock");
    setTabs(playerTabs, 0); $("tPill").firstChild.textContent = "Player "; setView("");
    setGrouped(grouped); setRowDesign(design);
    t.querySelectorAll("#tPick span, .tseg3 b, .tprow").forEach(s => s.classList.remove("hit"));
    // the card only exists once something was tapped (page 2 makes it appear)
    row.classList.toggle("pre", id === "groups" || id === "tap");
    if (id === "groups") { // open the screen menu, pick Watch page, then a tab: the preview follows each choice
      cast.className = "tb"; setHidden(false, true); move($("tPill"), 0, 0, 60);
      at2(60, () => move($("tPill"), 500));
      at2(650, () => { tap(); $("tPick").classList.add("show"); });
      at2(1250, () => move(t.querySelector('#tPick [data-g="g_watch"]'), 450));
      at2(1800, () => { tap(); t.querySelector('#tPick [data-g="g_watch"]').classList.add("hit"); });
      at2(2100, () => { $("tPick").classList.remove("show"); $("tPill").firstChild.textContent = "Watch page "; setTabs(watchTabs, 0); setView("watch"); });
      at2(2600, () => move(t.querySelectorAll("#tTabs span")[2], 450));
      at2(3150, () => { tap(); setTabs(watchTabs, 2); setView("comments"); });
      at2(3900, () => f.classList.remove("show"));
    }
    if (id === "tap") { // tap the button: it lights up and its card appears in the list
      cast.className = "tb"; setHidden(false, true);
      move(cast, 0, 0, 120);
      at2(60, () => move(cast, 700));
      at2(900, () => { tap(); cast.classList.add("sel"); row.classList.remove("pre"); row.classList.add("sel"); });
      at2(3000, () => f.classList.remove("show"));
    }
    if (id === "change") { // double-tap the button: it goes away, and its toggle follows
      cast.className = "tb sel"; row.classList.add("sel"); setHidden(false, true); move(cast, 0, 0, 80);
      at2(60, () => move(cast, 600));
      at2(900, () => dbl(() => { setHidden(true); cast.className = "tb off"; }));
      at2(2600, () => f.classList.remove("show"));
    }
    if (id === "find") { // hidden: tapping its card shows an outline where it was; the toggle's Show brings it back
      cast.className = "tb off"; setHidden(true, true); move(row, 0, -40, 40);
      at2(60, () => move(row, 500, -40));
      at2(700, () => { tap(); row.classList.add("sel"); cast.className = "tb ghost"; });
      if (rowDesign === "classic") { at2(1500, () => move(row, 400, -40)); at2(2100, () => dbl(() => { setHidden(false); cast.className = "tb sel reveal"; })); }
      else { const target = () => rowDesign === "clean" ? sw.lastElementChild : sw; at2(1500, () => move(target(), 500)); at2(2200, () => { tap(); setHidden(false); cast.className = "tb sel reveal"; }); }
      at2(3400, () => f.classList.remove("show"));
    }
    if (id === "tools") { // search, a look at the reset menu (nothing is reset), then Original / Morphe
      cast.className = "tb off"; setHidden(true, true); move($("tSearch"), 0, 0, 60);
      at2(60, () => move($("tSearch"), 560));
      at2(760, () => { tap(); $("tQ").classList.add("show"); [..."cast"].forEach((c, i) => at2(960 + i * 140, () => { $("tQ").textContent += c; })); });
      at2(1872, () => { $("tQ").classList.remove("show"); move($("tReset"), 560); });
      at2(2540, () => { tap(); $("tMenu").classList.add("show"); });
      at2(3000, () => move($("tReset"), 400, 0, 34)); // the finger steps aside so the menu can be read
      at2(4150, () => $("tMenu").classList.remove("show"));
      at2(4656, () => move($("tOrig"), 450));
      at2(5200, () => { tap(); $("tOrig").classList.add("on"); $("tMorphe").classList.remove("on"); stage.classList.add("stock"); cast.className = "tb reveal"; }); // stock YouTube has the Cast button
      at2(5928, () => move($("tMorphe"), 220));
      at2(6180, () => { tap(); $("tMorphe").classList.add("on"); $("tOrig").classList.remove("on"); stage.classList.remove("stock"); cast.className = "tb off"; }); // and with your settings it is hidden again
    }
    if (id === "custom") { // the screen menu's own settings: tabs off and on again, then each list design
      cast.className = "tb"; setHidden(false, true); move($("tPill"), 0, 0, 60);
      at2(90, () => move($("tPill"), 600));
      at2(840, () => { tap(); $("tPick").classList.add("show"); });
      at2(1650, () => move($("tGsw"), 600));
      at2(2475, () => { tap(); setGrouped(!grouped); });
      at2(3825, () => { tap(); setGrouped(grouped); });
      const others = ["toggles", "classic", "clean"].filter(d => d !== design);
      [...others, design].forEach((d, i) => {
        at2(4950 + i * 1950, () => move(t.querySelector(`.tseg3 [data-d="${d}"]`), 420));
        at2(5700 + i * 1950, () => { tap(); setRowDesign(d); });
      });
      at2(11250, () => { $("tPick").classList.remove("show"); f.classList.remove("show"); });
    }
  };
  const okCheck = () => { if (loops >= 2 || seen.size === pages.length && manual) { $("tutOk").classList.add("show"); } };
  show();
  // each page stays up as long as its animation needs
  const pageMs = () => TUT_PAGES[pages[step]].ms || TUT_STEP_MS;
  const next = () => { clock.start("tut"); clock.after("tut", pageMs(), () => {
    if (manual) return;
    step = (step + 1) % pages.length;
    if (step === 0) loops++;
    okCheck(); show(); next();
  }); };
  next();
  t.querySelector(".steps").addEventListener("click", e => {
    const b = e.target.closest("[data-step]"); if (!b) return;
    manual = true; step = Number(b.dataset.step); show(); okCheck();
  });
  $("tutOk").onclick = () => { clock.stop("tut"); clock.stop("tutPage"); t.classList.remove("on"); try { localStorage.setItem(LS + "-tutorial", "1"); } catch { /* storage unavailable */ } };
}
$("replayTut").onclick = () => runTutorial();
// The first time tabs or the shorter list are switched on, show the tutorial page that explains them.
function tutOnce(id) { let done = false; try { done = localStorage.getItem(LS + "-tut-" + id) === "1"; localStorage.setItem(LS + "-tut-" + id, "1"); } catch { /* storage unavailable */ } if (!done) setTimeout(() => runTutorial(id), 400); }

function tick() { const d = new Date(); $("clock").textContent = `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`; }
