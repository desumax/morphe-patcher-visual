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
  const previewRestart = restartDialog;
  restartDialog = function () {
    previewRestart();
    $("dRestart").onclick = () => { closeDialog(); try { MorpheApp.restart(); } catch (e) { /* ignore */ } };
    $("dStay").textContent = "Later";
    $("dStay").onclick = () => { closeDialog(); try { MorpheApp.close(); } catch (e) { /* ignore */ } };
  };
  $("btnBack").onclick = () => {
    if (pendingRestart().length) return restartDialog();
    try { MorpheApp.close(); } catch (e) { /* ignore */ }
  };
  // The phone's Back key: close what is open first, then leave like the back arrow.
  window.morpheBack = () => {
    if ($("dlg").classList.contains("open")) { closeDialog(); return; }
    if ($("picker").classList.contains("open")) { setPicker(false); return; }
    if ($("tut") && $("tut").classList.contains("on")) { $("tutOk") && $("tutOk").click(); return; }
    if (searching) { $("qClose").click(); return; }
    $("btnBack").click();
  };
}
