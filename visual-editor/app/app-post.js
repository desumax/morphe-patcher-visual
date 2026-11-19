"use strict";
// In-app mode, part 2 (loaded after boot.js). Every change the editor stores is sent to Morphe's
// own settings; Back and Restart go to the app.
if (INAPP) {
  let sent = null;
  const snapshot = () => { const o = {}; for (const k in PREF) o[k] = JSON.stringify(state[k]); return o; };
  const fileSave = store.save;
  store.save = function () {
    fileSave();
    if (!Object.keys(PREF).length) return;
    if (!sent) { sent = snapshot(); return; }
    for (const k in PREF) {
      if (!(k in LIVE.values)) continue;
      const j = JSON.stringify(state[k]);
      if (j !== sent[k]) { sent[k] = j; try { MorpheApp.set(k, j); } catch (e) { /* ignore */ } }
    }
  };
  // Morphe kept another value (a confirmation was declined, or the value was refused).
  window.morpheSetValue = (k, json) => {
    if (!(k in PREF)) return;
    try { state[k] = JSON.parse(json); } catch (e) { return; }
    if (sent) sent[k] = json;
    commit();
  };
  // Availability as Morphe's own list has it. Available natively: unlocked whatever the catalogue's
  // parents say. Not available: the catalogue's parents explain it if they can, otherwise the
  // availability rule (which reads the native value, see applyLive) locks it.
  const catalogueParentsOk = classicParentsOk;
  classicParentsOk = k => (__liveAvail[k] === true ? true : catalogueParentsOk(k));
  window.morpheAvailability = map => {
    let changed = false;
    for (const k in map) if (k in __liveAvail && __liveAvail[k] !== map[k]) { __liveAvail[k] = map[k]; changed = true; }
    if (changed) commit();
  };
  const previewRestart = restartDialog;
  restartDialog = function () {
    previewRestart();
    $("dRestart").onclick = () => { closeDialog(); try { MorpheApp.restart(); } catch (e) { /* ignore */ } };
    $("dStay").textContent = "Later";
    $("dStay").onclick = () => { closeDialog(); try { MorpheApp.close(); } catch (e) { /* ignore */ } };
  };
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
  setMenu(true);
  // Tell the app the first screen is drawn, so it can fade the editor in (no loading frames).
  requestAnimationFrame(() => requestAnimationFrame(() => { try { MorpheApp.ready(); } catch (e) { /* older app */ } }));
}
