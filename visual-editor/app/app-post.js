"use strict";
// In-app mode, part 2 (loaded after boot.js). Every change the editor stores is sent to Morphe's
// own settings; Back and Restart go to the app.
if (INAPP) {
  // Every change goes through setPref (core.js), which lists the key in changedPrefs; each save
  // sends exactly those keys to Morphe. The first save only ends the start-up (values the editor
  // fitted to this YouTube version are not changes the user made).
  let started = false;
  const fileSave = store.save;
  store.save = function () {
    const keys = [...changedPrefs];
    changedPrefs.clear();
    fileSave();
    if (!Object.keys(PREF).length) return;
    if (!started) { started = true; carryPending(); return; }
    for (const k of keys) {
      if (!(k in LIVE.values)) continue;
      try { MorpheApp.set(__morpheKey(k), JSON.stringify(state[k])); } catch (e) { /* ignore */ }
    }
  };
  // Changes saved earlier that still wait for a restart (Morphe keeps the values YouTube runs with):
  // they count as changed from the start, so the restart prompt on leaving lists them again, and
  // window.__pendingAtOpen holds them for the prompt shown when the editor opens.
  window.__pendingAtOpen = [];
  function carryPending() {
    let p = {};
    try { p = JSON.parse(MorpheApp.pending ? MorpheApp.pending() : "{}") || {}; } catch (e) { /* older app */ }
    for (const mk in p) { const k = __editorKey(mk); if (k in PREF) { baseline[k] = p[mk]; __pendingAtOpen.push(k); } }
    if (__pendingAtOpen.length) { renderBar(); pendingDialog(__pendingAtOpen); } // "Changes not applied yet": apply and restart, continue, or reset
  }
  // Leaving with "Save for later": the values are already saved; Morphe keeps the list for next time.
  window.savePendingForLater = () => {
    const o = {}; for (const k of pendingRestart()) o[__morpheKey(k)] = baseline[k];
    try { MorpheApp.savePending(JSON.stringify(o)); } catch (e) { /* older app */ }
  };
  // "Reset": every change waiting for a restart goes back to the value YouTube runs with.
  window.resetPendingChanges = () => {
    // Morphe puts the values back itself (resetPending), so they are loaded, not sent again
    loadPrefs(Object.fromEntries(pendingRestart().map(k => [k, baseline[k]])));
    try { MorpheApp.resetPending(); } catch (e) { /* older app */ }
    commit();
  };
  // Morphe kept another value (a confirmation was declined, or the value was refused).
  window.morpheSetValue = (k, json) => {
    k = __editorKey(k); // Morphe's key for a setting the editor knows under another (app-pre.js)
    if (!(k in PREF)) return;
    try { loadPrefs({ [k]: JSON.parse(json) }); } catch (e) { return; }
    commit();
  };
  // Availability as Morphe's own list has it. Available natively: unlocked whatever the catalogue's
  // parents say. Not available: the catalogue's parents explain it if they can, otherwise the
  // availability rule (which reads the native value, see applyLive) locks it.
  const catalogueParentsOk = classicParentsOk;
  classicParentsOk = k => (__liveAvail[k] === true ? true : catalogueParentsOk(k));
  window.morpheAvailability = map => {
    let changed = false;
    for (const mk in map) { const k = __editorKey(mk); if (k in __liveAvail && __liveAvail[k] !== map[mk]) { __liveAvail[k] = map[mk]; changed = true; } }
    if (changed) commit();
  };
  // The leave and reopen prompts (restartDialog, pendingDialog in list.js) run Morphe's own actions here.
  leaveHost.restart = () => { try { MorpheApp.restart(); } catch (e) { /* ignore */ } };
  leaveHost.saveForLater = () => { savePendingForLater(); try { MorpheApp.close(); } catch (e) { /* ignore */ } };
  leaveHost.reset = leaving => { resetPendingChanges(); if (leaving) { try { MorpheApp.close(); } catch (e) { /* ignore */ } } else snack("Changes reset"); };
  // Navigation in the app: the editor opens on the screen menu, shown as a page of cards. A card
  // opens its live preview screen; Back (key, gesture or arrow) from a screen returns to the menu,
  // Back from the menu leaves the editor. The restart prompt only comes when leaving the editor.
  let menuPage = false;
  const pickerToggle = setPicker;
  const menuTitle = document.createElement("div");
  menuTitle.className = "menutitle"; menuTitle.textContent = "Visual settings";
  $("secPill").before(menuTitle);
  $("secPill").onclick = null; $("secPill").removeAttribute("aria-haspopup"); $("secPill").tabIndex = -1;
  function setMenu(on) {
    if (!on && window.__drawBehind) window.__drawBehind(); // the screen behind the menu, not drawn yet at start (boot.js)
    menuPage = on;
    document.documentElement.classList.toggle("menupage", on);
    if (on) { $("scroller").scrollTop = 0; $("app").classList.remove("barhidden"); }
    pickerToggle(on);
    $("app").style.setProperty("--abh", document.querySelector(".appbar").offsetHeight + "px");
  }
  // Every caller that closed the dropdown (a card, search, the scrim) now leaves the menu page.
  setPicker = open => setMenu(open);
  const searchOpen = openResult;
  openResult = k => { setMenu(false); searchOpen(k); };
  const leave = () => {
    if (pendingRestart().length) return restartDialog();
    try { MorpheApp.close(); } catch (e) { /* ignore */ }
  };
  $("btnBack").onclick = () => (menuPage ? leave() : setMenu(true));
  $("btnBack").setAttribute("aria-label", "Back");
  // The phone's Back key: close what is open first, then go back like the arrow.
  window.morpheBack = () => {
    if ($("dlg").classList.contains("open")) { closeDialog(); return; }
    if ($("tut") && $("tut").classList.contains("on")) { $("tut").closeTutorial ? $("tut").closeTutorial() : $("tutOk") && $("tutOk").click(); return; }
    if (searching) { $("qClose").click(); return; }
    $("btnBack").click();
  };
  // Action rows (import / export, export logs, links...): a tap runs Morphe's own row, so its
  // dialog or screen opens exactly as in the regular settings. Search results lead to them too.
  const runAction = k => { try { MorpheApp.action(k); } catch (e) { snack("Update the visual editor patch to use this"); } };
  document.addEventListener("click", e => {
    const row = e.target.closest("#list [data-row]");
    if (!row || !__liveActions.has(row.dataset.row)) return;
    e.stopPropagation(); select(row.dataset.row, "list"); runAction(row.dataset.row);
  }, true);
  // Predictive back (Android 14+): while the Back gesture is held on a screen, the screen shrinks
  // toward the finger's side and the card menu shows behind it. Letting go goes to the menu,
  // swiping back in cancels. The app forwards the gesture's progress; elsewhere it does nothing.
  let peek = null;
  const ed = document.querySelector(".editor"), pk = $("picker");
  const canPeek = () => !menuPage && !$("dlg").classList.contains("open") && !($("tut") && $("tut").classList.contains("on")) && !searching;
  const peekDraw = p => {
    const e = 1 - Math.pow(1 - Math.min(1, Math.max(0, p)), 2); // ease out, like the system's
    ed.style.transform = `translateX(${(peek.edge === 1 ? -1 : 1) * 18 * e}px) scale(${1 - 0.1 * e})`;
    ed.style.borderRadius = `${28 * e}px`;
    pk.style.opacity = String(0.4 + 0.6 * e);
  };
  const peekEnd = () => {
    document.documentElement.classList.remove("peekback");
    ed.style.transition = ed.style.transform = ed.style.borderRadius = ed.style.opacity = pk.style.opacity = "";
    peek = null;
  };
  window.morpheBackStart = edge => {
    if (!canPeek()) return;
    peek = { edge };
    pk.classList.add("open"); // the menu, drawn behind the screen
    document.documentElement.classList.add("peekback");
    ed.style.transition = "none"; peekDraw(0);
  };
  window.morpheBackProgress = p => { if (peek) peekDraw(p); };
  window.morpheBackCancel = () => {
    if (!peek) return;
    ed.style.transition = "transform 200ms var(--ease), border-radius 200ms var(--ease)"; peekDraw(0);
    setTimeout(() => { if (!peek) return; pk.classList.remove("open"); peekEnd(); }, 210);
  };
  const keyBack = window.morpheBack;
  window.morpheBack = () => {
    if (!peek) return keyBack();
    // the gesture was let go: the screen finishes leaving, then the menu page takes over
    ed.style.transition = "transform 160ms var(--ease), opacity 160ms var(--ease)";
    ed.style.transform = `translateX(${(peek.edge === 1 ? -1 : 1) * 30}px) scale(.86)`; ed.style.opacity = "0"; pk.style.opacity = "1";
    setTimeout(() => { peekEnd(); setMenu(true); }, 170);
  };
  setMenu(true);
  // Tell the app the first screen is drawn, so it can fade the editor in (no loading frames).
  // The screen behind the menu is drawn after the app has faded the editor in (boot.js).
  requestAnimationFrame(() => requestAnimationFrame(() => {
    try { MorpheApp.ready(); } catch (e) { /* older app */ }
    setTimeout(() => { if (window.__drawBehind) window.__drawBehind(); }, 400);
  }));
}
