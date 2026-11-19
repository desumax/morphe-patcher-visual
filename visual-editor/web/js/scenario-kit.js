"use strict";
// More comparison animations built from the small scenario kit (home feed, other screens, playback).

// ------------------------------------------------------------------ round 9: scenario kit
// Small phone pages for settings that have no place in the live preview. Most are "remove this
// element" pages (hidePage), the rest are short stories with a finger, toasts and sheets.
const ico7 = (n, s = 8, c = "") => I(n, "ico", `style="width:${s}px;height:${s}px;flex:none;${c ? "fill:" + c : ""}"`);
const top7 = (title = "YouTube", icons = ["cast", "bell", "search"]) => `<div style="display:flex;align-items:center;gap:5px;height:12px"><b style="font-size:7.5px;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${title}</b>${icons.map(n => ico7(n)).join("")}</div>`;
const row7 = (i, t, extra = "", sub = "") => `<div style="display:flex;gap:4px;align-items:center"><div style="width:30px;height:17px;border-radius:2px;background:${ART[i % ART.length]};flex:none;position:relative">${extra}</div><div style="min-width:0;flex:1"><div style="font-size:6.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t}</div>${sub ? `<div style="font-size:5.5px;color:#aaa;white-space:nowrap;overflow:hidden">${sub}</div>` : bar7(60, "#2a2a2a", 3)}</div></div>`;
const big7 = (i, t, extra = "") => `<div><div style="height:38px;border-radius:3px;background:${ART[i % ART.length]};position:relative">${extra}</div><div style="display:flex;gap:3px;margin-top:3px;align-items:center"><span style="width:9px;height:9px;border-radius:50%;background:${AV[i % AV.length]};flex:none"></span><span style="font-size:6.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t}</span></div></div>`;
const item7 = (icon, t, cls = "") => `<div class="${cls}" style="display:flex;gap:5px;align-items:center;padding:2px 0;white-space:nowrap">${ico7(icon)}<span>${t}</span></div>`;
const chip7 = (t, hi) => `<span style="flex:none;padding:1px 5px;border-radius:5px;background:${hi ? "#f1f1f1" : "#272727"};color:${hi ? "#0f0f0f" : "#ddd"};font-size:6px">${t}</span>`;
const chips7 = (list) => `<div style="display:flex;gap:3px;overflow:hidden">${list.map((t, i) => chip7(t, i === 0)).join("")}</div>`;
const tgt7 = (html, w) => `<div class="tgt7${w ? " w7" : ""}">${html}</div>`;
const nav7 = (tabs = ["home", "shorts", "plus", "subs", "you"]) => `<div style="position:absolute;left:0;right:0;bottom:0;height:16px;background:#0f0f0f;border-top:1px solid #222;display:flex;justify-content:space-around;align-items:center">${tabs.map(n => typeof n === "string" ? ico7(n, 8) : n).join("")}</div>`;
const sheetRows = (rows) => rows.map(r => typeof r === "string" ? `<div>${r}</div>` : item7(r[0], r[1])).join("");
function x7(dev, el) {
  const k = devScale(dev), d = dev.getBoundingClientRect(), r0 = el.getBoundingClientRect();
  const r = { left: (r0.left - d.left) / k, top: (r0.top - d.top) / k, width: r0.width / k, height: r0.height / k }, s = Math.min(r.width, r.height, 22) + 6;
  dev.insertAdjacentHTML("beforeend", `<div class="x7" style="left:${r.left + r.width / 2 - s / 2 - 3}px;top:${r.top + r.height / 2 - s / 2 - 3}px;width:${s}px;height:${s}px">${ico7("close", s, "#ff0033")}</div>`);
}
function clock7(dev, label) {
  dev.insertAdjacentHTML("beforeend", `<div class="clock7"><div class="face"><i class="h"></i><i class="m"></i></div><span>${label}</span></div>`);
  return dev.querySelector(".clock7");
}
function check7(dev, text, ok = true) { dev.insertAdjacentHTML("beforeend", `<div class="check7 ${ok ? "ok" : "no"}">${ico7(ok ? "toggle" : "close", 9, ok ? "#4caf50" : "#ff0033")}<span>${text}</span></div>`); }
// A page where one element (class tgt7) is removed when the setting is on (or added, with invert).
function hidePage(sec, key, sit, page, o = {}) {
  scen(sec, key, (box, on) => {
    situation(sit);
    box.innerHTML = device(o.dev || "port", (o.raw ? page : pageRows(page)) + (o.nav ? nav7(o.nav === true ? undefined : o.nav) : ""));
    const dev = box.querySelector(".dev"), t = [...dev.querySelectorAll(".tgt7")];
    const show = o.invert ? on : !on;
    if (o.invert) t.forEach(e => e.classList.add("gone7", "instant7"));
    at(350, () => t.forEach(e => { e.classList.remove("instant7"); if (o.invert && show) e.classList.remove("gone7"); e.classList.add("mark7"); }));
    at(1050, () => t.forEach(e => { if (!o.invert && !show) e.classList.add("gone7"); }));
    at(1700, () => t.forEach(e => e.classList.remove("mark7")));
    return show ? (o.shown || (o.invert ? "Shown" : "Shown (stock)")) : (o.hidden || (o.invert ? "Not shown (stock)" : "Removed"));
  });
}
const feed7 = (inner, title = "YouTube") => top7(title) + chips7(["All", "Music", "Live", "Gaming"]) + inner;
const search7 = (q, inner) => `<div style="display:flex;gap:4px;align-items:center">${ico7("back")}<div style="flex:1;min-width:0;height:11px;border-radius:6px;background:#272727;font-size:6.5px;line-height:11px;padding:0 5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${q}</div>${ico7("mic")}</div>` + inner;
const you7 = (inner) => top7("You", ["cast", "search", "gear"]) + `<div style="display:flex;gap:5px;align-items:center"><span style="width:18px;height:18px;border-radius:50%;background:${AV[1]}"></span><div><b style="font-size:7.5px">Kari N.</b><div style="font-size:5.5px;color:#aaa">@kari · View channel</div></div></div>` + inner;
const player7 = (i = 3, inner = "") => `<div style="height:52px;border-radius:2px;background:${ART[i]};position:relative;margin:-6px -6px 0">${inner}</div>`;
const chat7 = (rows) => rows.map(([c, n, t]) => `<div style="display:flex;gap:3px;font-size:6px;line-height:1.3"><span style="width:7px;height:7px;border-radius:50%;background:${AV[c]};flex:none"></span><span><b style="color:#aaa">${n}</b> ${t}</span></div>`).join("");

// ---------- Home feed
// The feed goes stale while you are away. Stock: YouTube pulls a refresh by itself and your place is gone.
// On: nothing happens until you pull down yourself.
SCN_HOLD.morphe_disable_auto_feed_refresh = 4600;
scen("feed", "disable_auto_feed_refresh", (box, on) => {
  situation("You scrolled to a video, then left the app for a while");
  const mark = `<span class="bm7" style="position:absolute;right:-3px;top:-3px;padding:0 3px;border-radius:3px;background:#3ea6ff;color:#000;font-size:5px;font-weight:700">YOUR SPOT</span>`;
  box.innerHTML = device("port", pageRows(feed7(`<div class="fd7" style="display:grid;gap:5px;transition:opacity .25s">${big7(3, "Building a tiny cabin")}${row7(4, "Night train to Bodø")}<div style="position:relative;outline:1.5px solid #3ea6ff;outline-offset:1px;border-radius:2px">${row7(5, "Why ice is slippery")}${mark}</div>${row7(2, "Lo-fi beats")}</div>`)));
  const dev = box.querySelector(".dev"), fd = dev.querySelector(".fd7"), f = dev.querySelector(".finger"), W = dev.clientWidth, H = dev.clientHeight;
  const spinner = () => { dev.insertAdjacentHTML("beforeend", `<div class="spin7"><i></i></div>`); return dev.querySelector(".spin7"); };
  let c;
  at(300, () => { c = clock7(dev, "40 min later, the feed is old"); });
  at(1400, () => { c.remove(); });
  if (!on) {
    at(1600, () => spinner());
    at(2400, () => { fd.style.opacity = 0; later(() => { fd.innerHTML = `${big7(6, "Stove install, part 2")}${row7(0, "Shorts you missed")}${row7(1, "Live: northern lights")}${row7(7, "Top 10 axes")}`; fd.style.opacity = 1; dev.querySelector(".spin7")?.remove(); }, 260); });
    at(2900, () => toast7(dev, "Refreshed itself, your spot is lost", "82%"));
  } else {
    at(1600, () => { const sp = spinner(); sp.classList.add("dead"); });
    at(1850, () => x7(dev, dev.querySelector(".spin7")));
    at(2400, () => { dev.querySelectorAll(".spin7,.x7").forEach(e => e.remove()); check7(dev, "Same videos, same spot"); dev.querySelector(".check7").style.top = "74%"; });
    // you can still refresh whenever you want, by pulling down
    at(3300, () => { dev.querySelector(".check7")?.remove(); fingerTo(f, W * .5, H * .25, 0); });
    at(3400, () => fingerTo(f, W * .5, H * .45, 500));
    at(3700, () => spinner());
    at(4100, () => { f.classList.remove("show"); toast7(dev, "Pull down to refresh anytime", "82%"); });
  }
  return on ? "The feed stays as you left it; refresh by pulling down" : "The feed refreshes by itself and you lose your place (stock)";
});
scen("feed", "feed_long_press_menu", (box, on) => {
  situation("Holding a video in the feed");
  box.innerHTML = device("port", pageRows(feed7(`${big7(3, "Building a tiny cabin")}${row7(4, "Night train to Bodø")}`)));
  const dev = box.querySelector(".dev"), f = box.querySelector("#scFinger"); const W = dev.clientWidth, H = dev.clientHeight;
  at(250, () => holdAt(f, W * .5, H * .3));
  at(1100, () => { f.classList.remove("hold", "show"); if (on) sheet7(dev, sheetRows([["clock", "Save to Watch later"], ["plist", "Save to playlist"], ["dl", "Download"], ["share", "Share"], ["close", "Not interested"]])); else { dev.querySelector(".pg7").style.filter = "brightness(.6)"; toast7(dev, "Inline preview plays", "40%"); } });
  return on ? "Hold a video: its menu opens" : "Hold a video: it starts an inline preview (stock)";
});
hidePage("feed", "feed_view_count", "Video rows in the feed", feed7(`<div><div style="height:38px;border-radius:3px;background:${ART[4]}"></div><div style="display:flex;gap:3px;margin-top:3px"><span style="width:9px;height:9px;border-radius:50%;background:${AV[1]};flex:none"></span><div style="min-width:0;flex:1"><div style="font-size:6.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Night train to Bodø</div><div style="display:flex;gap:2px;padding:2px 0;font-size:5.5px;color:#aaa;white-space:nowrap">Fjord ${tgt7("· 1.2M views", 1)} · 3d</div></div></div></div><div><div style="height:38px;border-radius:3px;background:${ART[2]}"></div><div style="display:flex;gap:3px;margin-top:3px"><span style="width:9px;height:9px;border-radius:50%;background:${AV[2]};flex:none"></span><div style="min-width:0;flex:1"><div style="font-size:6.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Cabin build, part 2</div><div style="display:flex;gap:2px;padding:2px 0;font-size:5.5px;color:#aaa;white-space:nowrap">Fjord ${tgt7("· 84K views", 1)} · 1w</div></div></div></div><div><div style="height:38px;border-radius:3px;background:${ART[5]}"></div><div style="display:flex;gap:3px;margin-top:3px"><span style="width:9px;height:9px;border-radius:50%;background:${AV[3]};flex:none"></span><div style="min-width:0;flex:1"><div style="font-size:6.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Why ice is slippery</div><div style="display:flex;gap:2px;padding:2px 0;font-size:5.5px;color:#aaa;white-space:nowrap">Pocket ${tgt7("· 410K views", 1)} · 2d</div></div></div></div>`), { invert: true, shown: "View counts are shown where YouTube left them out", hidden: "Some rows have no view count (stock)" });
hidePage("feed", "hide_account_menu", "The account menu", you7(`<div style="display:grid;gap:1px">${item7("clock", "History")}${item7("plist", "Playlists")}${tgt7(item7("spark", "Get YouTube Premium"))}${item7("dl", "Downloads")}${tgt7(item7("dollar", "Purchases and memberships"))}</div>`), { hidden: "Menu items you filtered are removed" });
hidePage("feed", "hide_album_cards", "Searching for an artist", search7("midnight tapes", tgt7(`<div style="display:flex;gap:4px;align-items:center;padding:3px;border-radius:3px;background:#1b1b1b"><div style="width:22px;height:22px;background:${ART[6]};border-radius:2px"></div><div style="font-size:6.5px">Neon Fjord<div style="font-size:5.5px;color:#aaa">Album · 2025</div></div></div>`) + row7(2, "Midnight Tapes live") + row7(3, "Lo-fi to study to")));
hidePage("feed", "hide_artist_cards", "Searching for an artist", search7("midnight tapes", tgt7(`<div style="display:flex;gap:5px;align-items:center;padding:3px;border-radius:3px;background:#1b1b1b"><span style="width:22px;height:22px;border-radius:50%;background:${AV[4]}"></span><div style="font-size:6.5px">Midnight Tapes<div style="font-size:5.5px;color:#aaa">Artist · 1.1M subscribers</div></div></div>`) + row7(2, "Midnight Tapes live") + row7(3, "Lo-fi to study to")));
hidePage("feed", "hide_channel_buttons", "A channel row in search", search7("fjord timber", `<div style="display:flex;gap:5px;align-items:center"><span style="width:20px;height:20px;border-radius:50%;background:${AV[0]}"></span><div style="font-size:6.5px;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Fjord & Timber<div style="font-size:5.5px;color:#aaa">412K subscribers</div></div>${tgt7(`<span style="display:inline-block;padding:2px 5px;border-radius:6px;background:#f1f1f1;color:#000;font-size:6px">Subscribe</span>`, 1)}</div>` + row7(3, "Building a tiny cabin")));
hidePage("feed", "hide_compact_banner", "Home feed: a small banner and the empty dividers", feed7(tgt7(`<div style="display:flex;gap:4px;align-items:center;padding:3px 4px;border-radius:4px;background:#1f2a3a;font-size:6px">${ico7("info", 8)}<span style="flex:1">Your feed is paused. <span style="color:#3ea6ff">Turn on history</span></span>${ico7("close", 7)}</div>`) + big7(3, "Building a tiny cabin") + tgt7(`<div style="height:7px;border-top:1px solid #2a2a2a;border-bottom:1px solid #2a2a2a;background:repeating-linear-gradient(45deg,#161616 0 3px,#0f0f0f 3px 6px)"></div>`) + row7(4, "Night train to Bodø") + tgt7(`<div style="height:7px;border-top:1px solid #2a2a2a;border-bottom:1px solid #2a2a2a;background:repeating-linear-gradient(45deg,#161616 0 3px,#0f0f0f 3px 6px)"></div>`) + row7(5, "Why ice is slippery")), { hidden: "Compact banners (small notices like this) and the empty divider strips are removed" });
hidePage("feed", "hide_feed_flyout_menu", "The ⋮ menu of a video", feed7(big7(3, "Building a tiny cabin")) + `<div style="background:#212121;border-radius:6px 6px 0 0;padding:4px;display:grid;gap:1px;margin:0 -6px -6px">${item7("clock", "Save to Watch later")}${tgt7(item7("spark", "Ask about this video"))}${item7("share", "Share")}${tgt7(item7("flag", "Report"))}</div>`, { hidden: "Menu items you filtered are removed" });
hidePage("feed", "hide_floating_microphone_button", "The search screen", search7("", `<div style="display:grid;gap:3px">${item7("clock", "cabin build")}${item7("clock", "lo-fi beats")}${item7("clock", "night train")}</div><div style="height:30px"></div>` + tgt7(`<div style="display:flex;justify-content:center"><span style="width:20px;height:20px;border-radius:50%;background:#ff0033;display:grid;place-items:center">${ico7("mic", 10)}</span></div>`)));
hidePage("feed", "hide_get_premium_button", "The You tab", you7(tgt7(`<div style="padding:3px 5px;border-radius:4px;background:#ff0033;font-size:6.5px;text-align:center">Get YouTube Premium</div>`) + `<div style="display:grid;gap:1px">${item7("clock", "History")}${item7("plist", "Playlists")}</div>`));
hidePage("feed", "hide_handle", "The account menu", you7("").replace("@kari · View channel", `<span class="tgt7 w7" style="display:inline-flex">@kari ·&nbsp;</span>View channel`), { raw: false, hidden: "Your @handle is not shown" });
hidePage("feed", "hide_help_feedback_menu", "Settings in the account menu", you7(`<div style="display:grid;gap:1px">${item7("gear", "Settings")}${item7("eye", "Your data in YouTube")}${tgt7(item7("help", "Help & feedback"))}</div>`));
hidePage("feed", "hide_history_shelf", "The You tab", you7(tgt7(`<div><b style="font-size:7px">History</b><div style="display:flex;gap:3px;margin-top:2px">${[2, 4, 6].map(i => `<div style="width:26px;height:15px;border-radius:2px;background:${ART[i]}"></div>`).join("")}</div></div>`) + `<div style="display:grid;gap:1px">${item7("plist", "Playlists")}${item7("dl", "Downloads")}</div>`));
hidePage("feed", "hide_image_shelf", "Search results", search7("aurora", tgt7(`<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:2px">${[0, 5, 7].map(i => `<div style="height:18px;border-radius:2px;background:${ART[i]}"></div>`).join("")}</div>`) + row7(2, "Aurora timelapse 4K")));
hidePage("feed", "hide_invite_to_message_card", "Home feed", feed7(tgt7(`<div style="padding:4px;border-radius:4px;background:#1b1b1b;font-size:6px">${ico7("chat", 7)} Invite friends to message on YouTube</div>`) + big7(3, "Building a tiny cabin")));
hidePage("feed", "hide_latest_videos_button", "Subscriptions", top7("Subscriptions", ["search"]) + `<div style="display:flex;gap:4px">${[0, 1, 2, 3].map(i => `<span style="width:13px;height:13px;border-radius:50%;background:${AV[i]}"></span>`).join("")}</div>` + tgt7(`<div style="padding:2px 6px;border-radius:6px;background:#272727;font-size:6px;display:inline-block">Latest videos ›</div>`) + row7(3, "Building a tiny cabin"));
hidePage("feed", "hide_movies_section", "Home feed", feed7(big7(3, "Building a tiny cabin") + tgt7(`<div><b style="font-size:7px">Movies for you</b><div style="display:flex;gap:3px;margin-top:2px">${[1, 6, 7].map(i => `<div style="width:20px;height:28px;border-radius:2px;background:${ART[i]}"></div>`).join("")}</div></div>`)));
hidePage("feed", "hide_notifications_menu_header", "Tapping the bell: the Notifications screen", top7("Notifications", ["search", "gear"]) + tgt7(`<div style="display:flex;gap:4px;align-items:center;padding:4px;border-radius:4px;background:#1b1b1b;font-size:6px;line-height:1.3">${ico7("bell", 9)}<span style="flex:1">Get notified about the channels you like. <span style="color:#3ea6ff">Learn more</span></span></div>`) + row7(2, "Fjord & Timber uploaded", "", "2 hours ago") + row7(4, "Pocket Science is live", "", "5 hours ago") + row7(6, "Midnight Tapes premieres Friday", "", "1 day ago"), { hidden: "The header with the help link is gone; notifications start at the top" });
hidePage("feed", "hide_notify_me_button", "An upcoming premiere in the feed", feed7(big7(6, "Premieres Friday 18:00", `<span style="position:absolute;left:3px;bottom:3px;padding:0 3px;border-radius:2px;background:rgba(0,0,0,.7);font-size:5px">UPCOMING</span>`) + `<div style="display:flex;justify-content:flex-end;margin-top:-2px">${tgt7(`<span style="padding:2px 6px;border-radius:7px;background:#f1f1f1;color:#000;font-size:6px;display:inline-flex;gap:2px;align-items:center">${ico7("bell", 7, "#000")}Notify me</span>`, 1)}</div>` + row7(3, "Building a tiny cabin")), { hidden: "No reminder button on upcoming streams and premieres" });
hidePage("feed", "hide_search_term_thumbnails", "Search suggestions", search7("cab", `<div style="display:grid;gap:3px">${["cabin build", "cabin tour", "cabin in the woods"].map((t, i) => `<div style="display:flex;gap:4px;align-items:center;font-size:6.5px">${ico7("search", 7)}<span style="flex:1">${t}</span>${tgt7(`<div style="width:20px;height:11px;border-radius:2px;background:${ART[i + 2]}"></div>`, 1)}</div>`).join("")}</div>`));
hidePage("feed", "hide_show_more_button", "Search results", search7("cabin", row7(2, "Cabin build in 30 days") + row7(3, "Cabin tour") + tgt7(`<div style="text-align:center;font-size:6px;padding:2px;border:1px solid #333;border-radius:8px">Show more</div>`) + row7(4, "Off-grid cabin")));
hidePage("feed", "hide_subscribed_channels_bar", "Subscriptions", top7("Subscriptions", ["search"]) + tgt7(`<div style="display:flex;gap:4px">${[0, 1, 2, 3, 4].map(i => `<span style="width:13px;height:13px;border-radius:50%;background:${AV[i]}"></span>`).join("")}</div>`) + row7(3, "Building a tiny cabin") + row7(5, "Why ice is slippery"));
hidePage("feed", "hide_subscribed_channels_bar_names", "Subscriptions", top7("Subscriptions", ["search"]) + `<div style="display:flex;gap:5px">${["Fjord", "Pocket", "Tapes", "Nico"].map((n, i) => `<div style="display:grid;justify-items:center;gap:1px"><span style="width:13px;height:13px;border-radius:50%;background:${AV[i]}"></span>${tgt7(`<span style="font-size:5px">${n}</span>`)}</div>`).join("")}</div>` + row7(3, "Building a tiny cabin"));
hidePage("feed", "hide_unavailable_videos_hidden_banner", "A playlist with removed videos", top7("Road trip mix", ["search", "more"]) + tgt7(`<div style="padding:3px;border-radius:3px;background:#1b1b1b;font-size:6px;color:#aaa">2 unavailable videos are hidden</div>`) + row7(1, "Night train to Bodø") + row7(2, "Lo-fi beats"));
hidePage("feed", "hide_web_search_results", "Search results", search7("how to split wood", row7(2, "Splitting wood the easy way") + tgt7(`<div style="padding:3px;border-radius:3px;background:#1b1b1b;font-size:6px">${ico7("search", 7)} Results from the web · wikihow.com</div>`) + row7(3, "Axe vs maul")));
hidePage("feed", "hide_you_may_like_section", "Search results", search7("cabin", row7(2, "Cabin build in 30 days") + tgt7(`<div><b style="font-size:6.5px">You may also like</b>${row7(6, "Tiny house tour")}</div>`) + row7(3, "Cabin tour")));
// the four flyout additions above share one scene: an item added to the video menu
for (const [k, icon, text] of [["ads_channel_whitelist_flyout_menu", "dollar", "Allow ads on this channel"], ["ask_summarize_flyout_menu", "spark", "Summarize with Ask"], ["playback_speed_channel_whitelist_flyout_menu", "speed", "Use normal speed on this channel"], ["aislist_submit_flyout_menu", "flag", "Report as AI slop"]])
  hidePage("feed", k, "The ⋮ menu of a video", feed7(big7(3, "Building a tiny cabin")) + `<div style="background:#212121;border-radius:6px 6px 0 0;padding:4px;display:grid;gap:1px;margin:0 -6px -6px">${item7("clock", "Save to Watch later")}${tgt7(item7(icon, text))}${item7("share", "Share")}</div>`, { invert: true, shown: `“${text}” is added to the menu`, hidden: "Not in the menu (stock)" });
scen("feed", "open_channel_of_live_avatar", (box, on) => {
  situation("Tapping the avatar of a live stream");
  box.innerHTML = device("port", pageRows(feed7(`<div style="position:relative">${big7(5, "Live: northern lights")}<span style="position:absolute;left:3px;top:3px;background:#cc0000;font-size:5px;font-weight:700;padding:0 3px;border-radius:2px">LIVE</span></div>`)));
  const dev = box.querySelector(".dev"), f = box.querySelector("#scFinger"); const W = dev.clientWidth, H = dev.clientHeight;
  at(250, () => fingerTo(f, 11, H * .41)); at(600, () => tapF(f));
  at(850, () => { f.classList.remove("show"); dev.querySelector(".pg7").innerHTML = on ? top7("Pocket Science", ["search", "more"]) + `<div style="height:16px;border-radius:2px;background:${ART[5]}"></div><div style="display:flex;gap:4px;align-items:center"><span style="width:14px;height:14px;border-radius:50%;background:${AV[5]}"></span><b style="font-size:7px">Pocket Science</b></div>${row7(1, "Live now")}${row7(2, "Why ice is slippery")}` : player7(5, `<span style="position:absolute;left:3px;top:3px;background:#cc0000;font-size:5px;font-weight:700;padding:0 3px;border-radius:2px">LIVE</span>`) + chat7([[1, "ola", "wow!!"], [2, "mia", "green!"], [3, "ken", "😍"]]); });
  return on ? "The avatar opens the channel" : "The avatar opens the live stream (stock)";
});
scen("feed", "playlist_long_press_drag", (box, on) => {
  situation("Reordering a playlist");
  box.innerHTML = device("port", pageRows(top7("Road trip mix", ["search", "more"]) + `<div class="pl7" style="display:grid;gap:4px;position:relative">${[1, 2, 3, 4].map(i => `<div class="pi7" style="transition:transform .3s">${row7(i, ["Night train to Bodø", "Lo-fi beats", "Fjord drive", "Coffee jazz"][i - 1])}</div>`).join("")}</div>`));
  const dev = box.querySelector(".dev"), f = box.querySelector("#scFinger"), it = dev.querySelectorAll(".pi7"); const W = dev.clientWidth, H = dev.clientHeight;
  at(250, () => holdAt(f, W * .5, H * .15));
  at(1000, () => { if (!on) { f.classList.remove("hold", "show"); sheet7(dev, sheetRows([["clock", "Save to Watch later"], ["close", "Remove from playlist"]])); return; } it[0].style.transform = "scale(1.05)"; it[0].style.background = "#333"; });
  at(1300, () => { if (!on) return; fingerTo(f, W * .5, H * .37, 600); it[0].style.transform = "translateY(42px) scale(1.05)"; it[1].style.transform = "translateY(-21px)"; it[2].style.transform = "translateY(-21px)"; });
  at(2000, () => { if (!on) return; f.classList.remove("hold", "show"); it[0].style.transform = "translateY(42px)"; it[0].style.background = ""; });
  return on ? "Hold anywhere on a row and drag it to a new place" : "Hold opens the menu; drag only from the small handle (stock)";
});
scen("feed", "playlist_wide_drag_handles", (box, on) => {
  situation("Grabbing a playlist row to move it");
  box.innerHTML = device("port", pageRows(top7("Road trip mix", ["search", "more"]) + [1, 2, 3].map(i => `<div style="display:flex;gap:3px;align-items:center"><div class="hd7" style="width:${on ? 16 : 6}px;align-self:stretch;display:grid;place-items:center;border-radius:2px;background:${on ? "rgba(62,166,255,.18)" : "transparent"}">${ico7("list", 6, "#aaa")}</div><div style="flex:1">${row7(i, ["Night train to Bodø", "Lo-fi beats", "Fjord drive"][i - 1])}</div></div>`).join("")));
  const dev = box.querySelector(".dev"), f = box.querySelector("#scFinger"); const H = dev.clientHeight;
  at(300, () => holdAt(f, on ? 13 : 9, H * .17));
  at(1000, () => { f.classList.remove("hold", "show"); toast7(dev, on ? "Easy to grab" : "Small target, often missed", "80%"); });
  return on ? "A wide drag handle on each row" : "A thin drag handle (stock)";
});
scen("feed", "post_image_download", (box, on) => {
  situation("Holding an image in a community post");
  box.innerHTML = device("port", pageRows(`<div style="display:flex;gap:4px;align-items:center"><span style="width:12px;height:12px;border-radius:50%;background:${AV[3]}"></span><b style="font-size:7px">Pocket Science</b></div><div style="font-size:6.5px">Frost patterns this morning ❄️</div><div style="height:60px;border-radius:4px;background:${ART[0]}"></div>`));
  const dev = box.querySelector(".dev"), f = box.querySelector("#scFinger"); const W = dev.clientWidth, H = dev.clientHeight;
  at(250, () => holdAt(f, W * .5, H * .45));
  at(1000, () => { f.classList.remove("hold", "show"); if (on) sheet7(dev, sheetRows([["dl", "Download image"], ["link", "Copy image link"]])); else toast7(dev, "Nothing happens", "60%"); });
  at(1700, () => { if (on) { dev.querySelectorAll(".sh7, .shs7").forEach(e => e.remove()); toast7(dev, "Saved to Pictures"); } });
  return on ? "Hold an image: download it" : "Images in posts can't be saved (stock)";
});
scen("feed", "post_translate", (box, on) => {
  situation("A community post in another language");
  box.innerHTML = device("port", pageRows(`<div style="display:flex;gap:4px;align-items:center"><span style="width:12px;height:12px;border-radius:50%;background:${AV[0]}"></span><b style="font-size:7px">Fjord & Timber</b></div><div class="tx7" style="font-size:6.5px;line-height:1.35;transition:opacity .25s">Taket er ferdig! Neste uke: vedovnen.</div>${on ? `<div class="tb7" style="font-size:6px;color:#3ea6ff;display:flex;gap:2px;align-items:center">${ico7("translate", 7, "#3ea6ff")}Translate</div>` : ""}<div style="height:34px;border-radius:4px;background:${ART[3]}"></div>`));
  const dev = box.querySelector(".dev"), f = box.querySelector("#scFinger"); const W = dev.clientWidth, H = dev.clientHeight;
  if (!on) { at(400, () => toast7(dev, "No translate button", "80%")); return "Posts stay in their language (stock)"; }
  at(300, () => fingerTo(f, W * .25, H * .2)); at(650, () => tapF(f));
  at(900, () => { f.classList.remove("show"); const t = dev.querySelector(".tx7"); t.style.opacity = 0; later(() => { t.textContent = "The roof is done! Next week: the wood stove."; t.style.opacity = 1; }, 260); dev.querySelector(".tb7").innerHTML = "Show original"; });
  return "A Translate button under posts in other languages";
});
scen("feed", "native_queue_fetch_on_scroll", (box, on) => {
  situation("Scrolling to the end of the queue");
  box.innerHTML = device("port", pageRows(top7("Queue", ["more"]) + `<div class="q7" style="display:grid;gap:4px;transition:transform .6s var(--ease)">${[1, 2, 3, 4].map(i => row7(i, "Queued video " + i)).join("")}</div>`));
  const dev = box.querySelector(".dev"), f = box.querySelector("#scFinger"), q = dev.querySelector(".q7"); const W = dev.clientWidth, H = dev.clientHeight;
  at(250, () => fingerTo(f, W * .5, H * .75)); at(500, () => { fingerTo(f, W * .5, H * .3, 600); q.style.transform = "translateY(-40px)"; });
  at(1200, () => { f.classList.remove("show"); if (on) { q.insertAdjacentHTML("beforeend", `<div style="font-size:6px;color:#aaa;text-align:center">Loading more…</div>`); later(() => { q.lastChild.remove(); q.insertAdjacentHTML("beforeend", [5, 6].map(i => row7(i, "Up next " + i)).join("")); }, 500); } else q.insertAdjacentHTML("beforeend", `<div style="font-size:6px;color:#aaa;text-align:center">End of queue</div>`); });
  return on ? "More videos load as you reach the end" : "The queue just ends (stock)";
});
scen("feed", "restore_original_titles", (box, on) => {
  situation("A video with a translated title");
  box.innerHTML = device("port", pageRows(feed7(`${big7(3, "")}<div class="tt7" style="font-size:7px;font-weight:600;transition:opacity .25s">Ich habe eine winzige Hütte gebaut</div>${row7(4, "Nachtzug nach Bodø")}`)));
  const dev = box.querySelector(".dev"), t = dev.querySelector(".tt7");
  at(700, () => { if (!on) return; t.style.opacity = 0; later(() => { t.textContent = "I built a tiny cabin"; t.style.opacity = 1; }, 260); });
  at(1200, () => toast7(dev, on ? "The creator's original title" : "Auto-translated title (stock)", "84%"));
  return on ? "Titles show as the creator wrote them" : "Titles are auto-translated to your language (stock)";
});
hidePage("feed", "playlist_hide_removal_snackbar", "Removing a video from a playlist", top7("Road trip mix", ["search", "more"]) + row7(1, "Night train to Bodø") + row7(2, "Lo-fi beats") + `<div style="height:40px"></div>` + tgt7(`<div style="display:flex;justify-content:space-between;align-items:center;gap:4px;padding:3px 5px;border-radius:3px;background:#f1f1f1;color:#000;font-size:6px"><span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">Removed from Road trip mix</span><b style="color:#065fd4;flex:none">UNDO</b></div>`), { hidden: "No “Removed” snackbar after each removal" });
for (const [k, where, text] of [["hide_aislist_blocklist_home", "Home feed", "AI-generated channel"], ["hide_aislist_blocklist_search", "Search results", "AI-generated channel"]])
  hidePage("feed", k, where, (/Search/.test(where) ? search7("history facts", "") : feed7("")) + row7(2, "Real video") + tgt7(row7(7, "10 CRAZY facts (AI voice)", "", text)) + row7(3, "Another real video"), { hidden: "Videos from channels on the AI slop list are removed" });
for (const [k, where] of [["hide_aislist_warnlist_home", "Home feed"], ["hide_aislist_warnlist_search", "Search results"]])
  hidePage("feed", k, where, (/Search/.test(where) ? search7("space news", "") : feed7("")) + row7(2, "Real video") + tgt7(row7(6, "Space news daily", "", "⚠ on the AI warn list")) + row7(3, "Another real video"), { hidden: "Videos from channels on the warn list are removed" });
for (const [k, where, page] of [["hide_filter_bar_in_comments", "Comments", top7("Comments", ["sort", "close"])], ["hide_filter_bar_in_history", "History", top7("History", ["search", "more"])], ["hide_filter_bar_in_related_videos", "Up next", player7(3)], ["hide_filter_bar_in_search", "Search results", search7("cabin", "")]])
  hidePage("feed", k, where, page + tgt7(chips7(["All", "Videos", "Shorts", "Unwatched"])) + row7(2, "Building a tiny cabin") + row7(4, "Night train to Bodø"));
hidePage("feed", "hide_keyword_content_comments", "Comments with filtered words", top7("Comments", ["sort", "close"]) + cmt7(2, "Lovely build!") + tgt7(cmt7(4, "FREE GIFT CARDS click my profile")) + cmt7(3, "Subscribed for part 2"), { hidden: "Comments with your keywords are removed" });

// ---------- other screens
hidePage("ads", "hide_fullscreen_ads", "Opening a video", player7(3) + row7(2, "Up next") + row7(4, "Up next") + `<div class="tgt7" style="position:absolute;inset:0;max-height:200px;background:#fff;color:#000;display:grid;place-items:center;font-size:7px;z-index:4"><div style="text-align:center"><b>Ad · 0:05</b><div style="font-size:6px">Install Pocket Planner</div></div></div>`, { hidden: "No full-screen ad before the video" });
hidePage("channel", "hide_channel_tab", "A channel page", top7("Fjord & Timber", ["search", "more"]) + `<div style="height:18px;border-radius:2px;background:${ART[3]}"></div><div style="display:flex;gap:6px;font-size:6px;border-bottom:1px solid #333;padding-bottom:2px"><span>Home</span><span>Videos</span>${tgt7("<span>Shorts</span>", 1)}${tgt7("<span>Store</span>", 1)}<span>Posts</span></div>` + row7(2, "Building a tiny cabin"), { hidden: "Channel tabs you filtered are removed" });
scen("look", "disable_layout_updates", (box, on) => {
  situation("YouTube tests a new layout on you");
  box.innerHTML = device("port", pageRows(feed7(`<div class="ly7" style="display:grid;gap:5px;transition:opacity .3s">${big7(3, "Building a tiny cabin")}${row7(4, "Night train to Bodø")}</div>`)));
  const dev = box.querySelector(".dev"), ly = dev.querySelector(".ly7");
  at(500, () => toast7(dev, "Server: try layout B", "50%"));
  at(1200, () => { dev.querySelector(".t7")?.remove(); if (on) { x7(dev, ly); later(() => { dev.querySelector(".x7")?.remove(); check7(dev, "Layout stays the same"); }, 600); } else { ly.style.opacity = 0; later(() => { ly.innerHTML = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:3px">${[3, 4, 5, 6].map(i => `<div style="height:22px;border-radius:3px;background:${ART[i]}"></div>`).join("")}</div>`; ly.style.opacity = 1; }, 300); } });
  return on ? "Server-side layout experiments are ignored" : "YouTube can switch your layout at any time (stock)";
});
scen("look", "fix_status_bar_layout", (box, on) => {
  situation("Opening a video");
  box.innerHTML = device("port", `<div style="position:absolute;left:0;right:0;top:0;height:8px;background:#000;font-size:5px;display:flex;justify-content:space-between;padding:0 4px;align-items:center;z-index:3"><span>9:41</span><span>5G ▮</span></div>` + `<div class="pv7" style="position:absolute;left:0;right:0;top:${on ? 8 : 0}px;height:52px;background:${ART[3]};transition:top .3s"></div><div style="position:absolute;left:5px;right:5px;top:66px;display:grid;gap:4px">${bar7(90)}${bar7(70)}</div>`);
  const dev = box.querySelector(".dev");
  at(700, () => toast7(dev, on ? "Video sits below the status bar" : "Status bar covers the video", "78%"));
  return on ? "The status bar no longer overlaps the player" : "On some devices the status bar overlaps the top of the player (stock)";
});
scen("look", "native_snackbar", (box, on) => {
  situation("Saving a video to a playlist");
  box.innerHTML = device("port", pageRows(feed7(big7(3, "Building a tiny cabin") + row7(4, "Night train to Bodø"))) + nav7());
  const dev = box.querySelector(".dev");
  at(600, () => dev.insertAdjacentHTML("beforeend", on ? `<div class="toastin" style="bottom:24px;top:auto;border-radius:4px;background:#323232">Saved to Watch later</div>` : `<div style="position:absolute;left:4px;right:4px;bottom:20px;display:flex;justify-content:space-between;padding:4px 6px;border-radius:8px;background:#f1f1f1;color:#000;font-size:6.5px;animation:sheetup .25s">Saved to Watch later<b style="color:#065fd4">Change</b></div>`));
  return on ? "Android's own snackbar style" : "YouTube's own snackbar (stock)";
});
hidePage("look", "override_youtube_music_buttons", "Tapping a YouTube Music link", feed7(big7(6, "Midnight Tapes · Neon Fjord")) + tgt7(`<div style="padding:3px;border-radius:4px;background:#1b1b1b;font-size:6px;display:flex;gap:3px;align-items:center">${ico7("music", 7, "#ff0033")}Opens your patched YouTube Music</div>`), { invert: true, shown: "Music buttons open your chosen YouTube Music app", hidden: "Music buttons open the stock YouTube Music (stock)" });
hidePage("look", "settings_search_history", "Searching in settings", search7("speed", `<div style="display:grid;gap:3px">${tgt7(item7("clock", "seekbar"))}${tgt7(item7("clock", "captions"))}${item7("gear", "Playback speed")}</div>`), { invert: true, shown: "Your recent settings searches are listed", hidden: "No search history (stock)" });
scen("look", "show_menu_icons", (box, on) => {
  situation("The ⋮ menu of a video");
  box.innerHTML = device("port", pageRows(feed7(big7(3, "Building a tiny cabin"))) + `<div style="position:absolute;left:0;right:0;bottom:0;background:#212121;border-radius:6px 6px 0 0;padding:5px;display:grid;gap:3px;font-size:6.5px">${[["clock", "Save to Watch later"], ["plist", "Save to playlist"], ["share", "Share"], ["flag", "Report"]].map(([i, t]) => `<div style="display:flex;gap:5px;align-items:center"><span class="mi7" style="display:inline-flex;transition:width .3s,opacity .3s;overflow:hidden;width:${on ? 0 : 8}px;opacity:${on ? 0 : 1}">${ico7(i)}</span>${t}</div>`).join("")}</div>`);
  const dev = box.querySelector(".dev");
  at(700, () => dev.querySelectorAll(".mi7").forEach(e => { e.style.width = on ? "8px" : "0px"; e.style.opacity = on ? 1 : 0; }));
  return on ? "Menus show an icon next to each item" : "Text-only menu items (stock on some versions)";
});
scen("look", "spoof_app_version", (box, on) => {
  situation("Pretending to be an older YouTube");
  box.innerHTML = device("port", pageRows(top7("Settings", ["search"]) + `<div style="display:grid;gap:3px;font-size:6.5px"><div>About</div><div style="color:#aaa">App version</div><b class="v7" style="font-size:8px;transition:opacity .25s">20.44.38</b></div>` + feed7(big7(3, ""))));
  const dev = box.querySelector(".dev"), v = dev.querySelector(".v7");
  at(700, () => { if (!on) return; v.style.opacity = 0; later(() => { v.textContent = V("morphe_spoof_app_version_target") || "19.01.34"; v.style.opacity = 1; toast7(dev, "Old layout comes back", "82%"); }, 260); });
  return on ? "YouTube serves the layout of the chosen version" : "YouTube sees the real version (stock)";
});
// Morphe: "Use the theme color for text and icons". Stock keeps text and icons white; on, they take the theme colour.
scen("look", "theme_color_change_foreground", (box, on) => {
  situation("Your custom theme colour is teal");
  const items = [["clock", "History"], ["plist", "Playlists"], ["dl", "Downloads"], ["gear", "Settings"]];
  box.innerHTML = device("port", pageRows(top7("You", ["cast", "search", "gear"]) + `<div style="display:grid;gap:3px">${items.map(([i, t]) => `<div class="fg7" style="display:flex;gap:5px;align-items:center;font-size:7px;color:#f1f1f1;fill:#f1f1f1;transition:color .4s,fill .4s">${I(i, "ico", 'style="width:9px;height:9px;fill:inherit;transition:fill .4s"')}<span>${t}</span></div>`).join("")}</div><div style="height:10px;border-radius:5px;background:#26a69a;width:60%"></div>`));
  const dev = box.querySelector(".dev");
  dev.querySelectorAll(".pg7 > div:first-child svg").forEach(e => { e.style.transition = "fill .4s"; });
  at(800, () => { if (!on) return; dev.querySelectorAll(".fg7").forEach(e => { e.style.color = "#4db6ac"; e.style.fill = "#4db6ac"; }); dev.querySelectorAll(".pg7 > div:first-child svg").forEach(e => { e.style.fill = "#4db6ac"; }); });
  at(1300, () => toast7(dev, on ? "Text and icons take the theme colour" : "Text and icons stay white", "78%"));
  return on ? "Text and icons use your theme colour" : "Text and icons stay white (stock)";
});
scen("look", "custom_filter", (box, on) => {
  situation("Your own custom filter");
  box.innerHTML = device("port", pageRows(feed7(big7(3, "Building a tiny cabin") + tgt7(`<div style="padding:3px;border-radius:3px;background:#1b1b1b;font-size:6px">Sponsored shelf you don't want</div>`) + row7(4, "Night train to Bodø"))));
  const dev = box.querySelector(".dev"), t = dev.querySelector(".tgt7");
  at(400, () => t.classList.add("mark7")); at(1100, () => { if (on) t.classList.add("gone7"); }); at(1700, () => t.classList.remove("mark7"));
  return on ? "Components matching your filter strings are removed" : "No custom filter (stock)";
});
hidePage("look", "series_tracker", "Watching a series", player7(3, `<span style="position:absolute;left:3px;bottom:3px;font-size:5.5px;background:rgba(0,0,0,.7);padding:0 3px;border-radius:2px">Ep 4</span>`) + tgt7(`<div style="display:flex;gap:3px;align-items:center;font-size:6px;padding:3px;border-radius:3px;background:#1b1b1b">${ico7("list", 7)}Cabin build · 3 of 12 watched${bar7(20, "#3ea6ff", 3)}</div>`) + row7(2, "Episode 5"), { invert: true, shown: "Your progress through a series is tracked", hidden: "No series tracker (stock)" });
hidePage("nav", "disable_toolbar_navigation_tabs", "The top bar on a tablet", `<div style="display:flex;gap:6px;align-items:center;font-size:6.5px"><b>YouTube</b>${tgt7(`<span style="display:inline-flex;gap:5px"><span>Home</span><span>Shorts</span><span>Subs</span></span>`, 1)}<span style="flex:1"></span>${ico7("search")}</div>` + big7(3, "Building a tiny cabin"), { dev: "land", hidden: "No navigation tabs in the top bar" });
hidePage("nav", "hide_toolbar_microphone_button", "The search bar", search7("", "").replace(ico7("mic"), tgt7(ico7("mic"), 1)) + `<div style="display:grid;gap:3px">${item7("clock", "cabin build")}${item7("clock", "lo-fi beats")}</div>`);
hidePage("watch", "hide_quick_actions_live_chat_button", "Live stream in fullscreen", `<div style="position:absolute;inset:0;background:${ART[5]}"></div><div style="position:absolute;right:4px;top:10px;display:grid;gap:4px">${[ico7("like", 10), ico7("comment", 10)].map(x => `<span style="width:14px;height:14px;border-radius:50%;background:rgba(0,0,0,.5);display:grid;place-items:center">${x}</span>`).join("")}${tgt7(`<span style="width:14px;height:14px;border-radius:50%;background:rgba(0,0,0,.5);display:grid;place-items:center">${ico7("chat", 10)}</span>`)}</div>`, { dev: "land", raw: true });
scen("ambient", "disable_fullscreen_ambient_mode", (box, on) => {
  situation("Ambient glow in fullscreen");
  box.innerHTML = device("land", `<div class="am7" style="position:absolute;inset:0;background:radial-gradient(circle at 50% 50%, ${ART[5].match(/#[0-9a-f]{6}/i)?.[0] || "#345"}aa, #000 70%);transition:opacity .5s"></div><div style="position:absolute;left:28%;right:28%;top:14%;bottom:14%;background:${ART[5]};border-radius:2px"></div>`);
  const dev = box.querySelector(".dev");
  at(700, () => { if (on) dev.querySelector(".am7").style.opacity = 0; toast7(dev, on ? "Plain black around the video" : "Colours glow around the video", "86%"); });
  return on ? "No ambient glow in fullscreen" : "Ambient glow in fullscreen too (stock)";
});
scen("captions", "auto_translate_additional_languages", (box, on) => {
  situation("Auto-translate menu in captions");
  box.innerHTML = device("port", pageRows(player7(3) + `<div style="background:#212121;border-radius:5px;padding:4px;display:grid;gap:2px;font-size:6.5px"><b>Auto-translate</b>${["English", "German", "Spanish"].map(t => `<div>${t}</div>`).join("")}<div class="mo7" style="display:grid;gap:2px"></div></div>`));
  const dev = box.querySelector(".dev");
  at(700, () => { if (on) dev.querySelector(".mo7").innerHTML = ["Norwegian", "Icelandic", "Welsh", "Yoruba"].map(t => `<div style="color:#3ea6ff;animation:sheetup .25s">${t}</div>`).join(""); });
  return on ? "More languages in the auto-translate list" : "Only the default languages (stock)";
});
scen("captions", "fix_transcript", (box, on) => {
  situation("Opening the transcript");
  box.innerHTML = device("port", pageRows(player7(3) + `<b style="font-size:7px">Transcript</b><div class="tr7" style="display:grid;gap:3px;font-size:6px"></div>`));
  const dev = box.querySelector(".dev"), tr = dev.querySelector(".tr7");
  at(500, () => { tr.innerHTML = on ? ["0:00 Welcome back to the cabin", "0:04 Today: the roof", "0:09 First the beams"].map(t => `<div>${t}</div>`).join("") : `<div style="color:#aaa">Transcript unavailable</div>`; });
  return on ? "The transcript loads" : "The transcript fails to load on patched builds (stock)";
});
for (const [k, sit, html] of [
  ["hide_comments_carousel", "Comments under a video", `<div style="display:flex;gap:3px;overflow:hidden">${[2, 4, 6].map(i => `<div style="width:30px;height:20px;border-radius:3px;background:#272727;flex:none;font-size:5px;padding:2px">Top comment</div>`).join("")}</div>`],
  ["hide_comments_live_chat_donators_bar", "Live chat", `<div style="display:flex;gap:3px">${[1, 3, 5].map(i => `<span style="padding:0 4px;border-radius:6px;background:${["#1e88e5", "#ffb300", "#e53935"][i % 3]};font-size:5.5px">€${i * 2}</span>`).join("")}</div>`],
  ["hide_comments_live_chat_scroll_to_bottom_button", "Scrolling up in live chat", `<div style="display:flex;justify-content:center"><span style="width:14px;height:14px;border-radius:50%;background:#3ea6ff;display:grid;place-items:center">${ico7("down", 9, "#000")}</span></div>`],
  ["hide_comments_live_chat_tooltips", "Live chat", `<div style="padding:3px;border-radius:3px;background:#3ea6ff;color:#000;font-size:6px">Tip: tap a message to reply</div>`],
  ["hide_comments_zero_state", "A video with no comments yet", `<div style="text-align:center;font-size:6px;color:#aaa;padding:6px">${ico7("comment", 12, "#aaa")}<div>No comments yet. Start the conversation</div></div>`]]) {
  const isChat = /live chat/i.test(sit);
  hidePage("comments", k, sit, player7(5) + (isChat ? chat7([[1, "ola", "so pretty"], [2, "mia", "green!!"]]) + tgt7(html) + chat7([[3, "ken", "😍"]]) : top7("Comments", ["sort", "close"]) + tgt7(html) + cmt7(2, "Lovely build!")));
}
hidePage("comments", "hide_comments_section_in_home_feed", "Home feed with inline comments", feed7(big7(3, "Building a tiny cabin") + tgt7(`<div style="padding:3px;border-radius:3px;background:#1b1b1b">${cmt7(2, "Lovely build!")}</div>`) + row7(4, "Night train to Bodø")));
scen("comments", "minimal_comments_button", (box, on) => {
  situation("The comments entry under a video");
  box.innerHTML = device("port", pageRows(player7(3) + `<b style="font-size:7px">Building a tiny cabin</b><div class="cb7" style="transition:all .3s;overflow:hidden;border-radius:5px;background:#272727;padding:${on ? "2px 6px" : "4px"};font-size:6px;${on ? "width:max-content" : ""}">${on ? `${ico7("comment", 7)} 341` : `<b>Comments 341</b>${cmt7(2, "Lovely build!")}`}</div>${row7(2, "Up next")}`));
  return on ? "A small comments button instead of the preview card" : "A large comments card with a preview (stock)";
});
scen("comments", "sanitize_comments_highlighted_search_links", (box, on) => {
  situation("A comment with a highlighted word");
  box.innerHTML = device("port", pageRows(top7("Comments", ["sort", "close"]) + cmt7(2, `Which <span class="hl7" style="color:#3ea6ff;white-space:nowrap">${I("search", "ico", 'style="width:6px;height:6px;fill:#3ea6ff;display:inline-block;vertical-align:-1px;margin-right:1px"')}wood stove</span> is that?`) + cmt7(3, "Subscribed for part 2")));
  const dev = box.querySelector(".dev");
  at(700, () => { if (!on) return; const h = dev.querySelector(".hl7"); h.innerHTML = "wood stove"; h.style.color = "inherit"; });
  return on ? "Words in comments are plain text, not search links" : "YouTube turns some words into search links (stock)";
});
scen("shorts", "disable_shorts_resuming_on_startup", (box, on) => {
  situation("Opening the app after watching Shorts");
  box.innerHTML = device("port", `<div style="position:absolute;inset:0;display:grid;place-items:center;background:#000"><div style="width:24px;height:17px;border-radius:5px;background:#ff0033;display:grid;place-items:center">${ico7("play", 10)}</div></div>`);
  const dev = box.querySelector(".dev");
  at(700, () => { dev.innerHTML = on ? pageRows(feed7(big7(3, "Building a tiny cabin") + row7(4, "Night train to Bodø"))) + nav7() : `<div style="position:absolute;inset:0;background:${ART[5]}"></div><div style="position:absolute;right:4px;bottom:20px;display:grid;gap:4px">${ico7("like", 10)}${ico7("comment", 10)}${ico7("share", 10)}</div>` + nav7(); });
  return on ? "The app opens on Home" : "The app reopens straight into Shorts (stock)";
});
for (const [k, where, page] of [
  ["hide_shorts_channel", "A channel page", top7("Fjord & Timber", ["search", "more"]) + `<div style="display:flex;gap:6px;font-size:6px"><span>Videos</span><span>Live</span></div>`],
  ["hide_shorts_history", "History", top7("History", ["search", "more"])],
  ["hide_shorts_notifications", "Notifications", top7("Notifications", ["gear"])],
  ["hide_shorts_search", "Search results", search7("cabin", "")],
  ["hide_shorts_subscriptions", "Subscriptions", top7("Subscriptions", ["search"])]])
  hidePage("shorts", k, where, page + row7(2, "Building a tiny cabin") + tgt7(`<div><div style="display:flex;gap:3px;align-items:center;font-size:6.5px">${ico7("shorts", 8, "#ff0033")}<b>Shorts</b></div><div style="display:flex;gap:3px;margin-top:2px">${[5, 6, 7].map(i => `<div style="width:18px;height:30px;border-radius:2px;background:${ART[i]}"></div>`).join("")}</div></div>`) + row7(4, "Night train to Bodø"));
hidePage("shorts", "hide_shorts_video_description", "A Short", `<div style="position:absolute;inset:0;background:${ART[5]}"></div><div style="position:absolute;left:5px;bottom:8px;right:20px;font-size:6px;display:grid;gap:2px"><b>@fjordtimber</b>${tgt7("<div>Roof day! Part 4 of the cabin build #diy #cabin</div>")}</div>`, { raw: true });
hidePage("shorts", "hide_shorts_live_preview", "Shorts feed", `<div style="position:absolute;inset:0;background:${ART[5]}"></div>` + `<div class="tgt7" style="position:absolute;left:5px;top:10px;padding:2px 4px;border-radius:3px;background:#cc0000;font-size:6px">LIVE · Northern lights</div>`, { raw: true });
hidePage("shorts", "hide_shorts_search_suggestions", "A Short", `<div style="position:absolute;inset:0;background:${ART[5]}"></div><div class="tgt7" style="position:absolute;left:5px;right:5px;top:12px;padding:2px 4px;border-radius:6px;background:rgba(0,0,0,.6);font-size:6px;display:flex;gap:3px;align-items:center">${ico7("search", 7)}Search “cabin roof”</div>`, { raw: true });
scen("shorts", "shorts_autoplay_background", (box, on) => {
  situation("A Short ends while the app is in the background");
  box.innerHTML = device("port", `<div style="position:absolute;inset:0;background:#222;display:grid;place-items:center;font-size:6.5px;color:#aaa">Other app</div><div class="toastin" style="top:6px">${ico7("music", 7)} Playing: Short 1</div>`);
  const dev = box.querySelector(".dev");
  at(1000, () => { dev.querySelector(".toastin").innerHTML = on ? `${ico7("music", 7)} Playing: Short 2` : `${ico7("pause", 7)} Short 1 · ended`; });
  return on ? "The next Short plays in the background" : "Playback stops at the end of the Short (stock)";
});
scen("shorts", "shorts_disable_background_playback", (box, on) => {
  situation("Leaving the app during a Short");
  box.innerHTML = device("port", `<div style="position:absolute;inset:0;background:${ART[5]}"></div>`);
  const dev = box.querySelector(".dev");
  at(600, () => { dev.innerHTML = `<div style="position:absolute;inset:0;background:#222;display:grid;place-items:center;font-size:6.5px;color:#aaa">Home screen</div><div class="toastin" style="top:6px">${on ? `${ico7("pause", 7)} Short paused` : `${ico7("music", 7)} Short keeps playing`}</div>`; });
  return on ? "Shorts stop when you leave the app" : "Shorts keep playing in the background like videos (patched default)";
});
scen("shorts", "shorts_remember_playback_speed", (box, on) => {
  situation("Changing speed on a Short, then swiping");
  box.innerHTML = device("port", `<div class="sv7" style="position:absolute;inset:0;background:${ART[5]};transition:transform .4s var(--ease)"></div><div class="sp7 toastin" style="top:8px">1.5×</div>`);
  const dev = box.querySelector(".dev"), f = box.querySelector("#scFinger"); const W = dev.clientWidth, H = dev.clientHeight;
  at(500, () => fingerTo(f, W * .5, H * .7)); at(700, () => { fingerTo(f, W * .5, H * .25, 400); dev.querySelector(".sv7").style.transform = "translateY(-100%)"; });
  at(1200, () => { f.classList.remove("show"); dev.querySelector(".sv7").style.cssText += `;transition:none;transform:none;background:${ART[6]}`; dev.querySelector(".sp7").textContent = on ? "1.5×" : "1×"; });
  return on ? "The next Short keeps your speed" : "Every Short starts at normal speed (stock)";
});
scen("shorts", "skip_live_shorts", (box, on) => {
  situation("Swiping through Shorts");
  box.innerHTML = device("port", `<div class="sv7" style="position:absolute;inset:0;background:${ART[5]};transition:transform .4s var(--ease)"></div>`);
  const dev = box.querySelector(".dev"), f = box.querySelector("#scFinger"), sv = dev.querySelector(".sv7"); const W = dev.clientWidth, H = dev.clientHeight;
  at(400, () => fingerTo(f, W * .5, H * .7)); at(600, () => { fingerTo(f, W * .5, H * .25, 400); sv.style.transform = "translateY(-100%)"; });
  at(1100, () => { f.classList.remove("show"); sv.style.cssText = `position:absolute;inset:0;background:${on ? ART[6] : ART[0]}`; if (!on) dev.insertAdjacentHTML("beforeend", `<span style="position:absolute;left:5px;top:8px;background:#cc0000;font-size:6px;padding:0 3px;border-radius:2px">LIVE</span>`); else toast7(dev, "Live Short skipped", "50%"); });
  return on ? "Live streams in the Shorts feed are skipped" : "Live streams show up between Shorts (stock)";
});
scen("fullscreen", "swipe_ignore_when_locked", (box, on) => {
  situation("Swiping while the screen is locked");
  box.innerHTML = device("land", `<div style="position:absolute;inset:0;background:${ART[3]}"></div><div class="toastin" style="top:6px">${ico7("lock", 9)} Locked</div>`);
  const dev = box.querySelector(".dev"), f = box.querySelector("#scFinger"); const W = dev.clientWidth, H = dev.clientHeight;
  at(300, () => fingerTo(f, W * .82, H * .7)); at(500, () => fingerTo(f, W * .82, H * .3, 500));
  at(1100, () => { f.classList.remove("show"); if (on) { toast7(dev, "Ignored while locked", "50%"); } else dev.insertAdjacentHTML("beforeend", `<div class="toastin" style="top:40%">${ico7("vol", 11)} 80%</div>`); });
  return on ? "Swipe gestures do nothing while locked" : "Swipes still change volume when locked (stock)";
});
scen("fullscreen", "swipe_lowest_value_enable_auto_brightness", (box, on) => {
  situation("Swiping brightness all the way down");
  box.innerHTML = device("land", `<div class="br7" style="position:absolute;inset:0;background:${ART[3]};transition:filter .6s"></div>`);
  const dev = box.querySelector(".dev"), f = box.querySelector("#scFinger"); const W = dev.clientWidth, H = dev.clientHeight;
  at(300, () => fingerTo(f, W * .18, H * .3)); at(500, () => { fingerTo(f, W * .18, H * .85, 700); dev.querySelector(".br7").style.filter = "brightness(.35)"; });
  at(1300, () => { f.classList.remove("show"); dev.insertAdjacentHTML("beforeend", `<div class="toastin" style="top:40%">${ico7("bright", 8)} ${on ? "Auto" : "0%"}</div>`); if (on) dev.querySelector(".br7").style.filter = "brightness(.8)"; });
  return on ? "Below the lowest level, brightness switches to automatic" : "It stays at the lowest level (stock)";
});
scen("fullscreen", "swipe_save_and_restore_brightness", (box, on) => {
  situation("Leaving fullscreen after dimming the video");
  box.innerHTML = device("land", `<div class="br7" style="position:absolute;inset:0;background:${ART[3]};filter:brightness(.45)"></div>`);
  const dev = box.querySelector(".dev");
  at(600, () => { rotate(dev, "port"); dev.innerHTML = pageRows(player7(3) + row7(2, "Up next") + row7(4, "Up next")); dev.querySelector(".pg7").style.filter = on ? "none" : "brightness(.45)"; toast7(dev, on ? "Your normal brightness is back" : "Still dimmed", "80%"); });
  return on ? "Brightness goes back to your system level outside fullscreen" : "The swipe brightness stays everywhere (stock)";
});
// ---------- Playback
const watch7 = (inner = "") => pageRows(player7(3, inner) + `<b style="font-size:7px">Building a tiny cabin</b>` + row7(2, "Up next · Night train") + row7(4, "Up next · Lo-fi beats"));
scen("playback", "autoplay_control", (box, on) => {
  situation("A video ends");
  box.innerHTML = device("port", watch7(`<div class="ap7" style="position:absolute;right:3px;top:3px;display:flex;gap:2px;align-items:center;font-size:5.5px">${on ? `<span style="padding:0 3px;border-radius:5px;background:rgba(0,0,0,.6)">${ico7("play", 6)} Auto</span>` : ""}</div>`));
  const dev = box.querySelector(".dev");
  at(800, () => toast7(dev, on ? "Autoplay follows your rule: next in playlist only" : "Next video starts automatically", "60%"));
  return on ? "A player button and a rule decide what plays next" : "YouTube decides (stock)";
});
scen("playback", "disable_playlist_autoplay", (box, on) => {
  situation("End of a video in a playlist");
  box.innerHTML = device("port", pageRows(player7(3, `<span class="cd7 toastin" style="top:50%;translate:0 -50%;white-space:nowrap">Next in 5</span>`) + `<b style="font-size:6.5px">Road trip mix · 2 / 12</b>` + row7(2, "Night train") + row7(4, "Lo-fi beats")));
  const dev = box.querySelector(".dev"), cd = dev.querySelector(".cd7");
  [4, 3, 2].forEach((n, i) => at(400 + i * 300, () => { cd.textContent = "Next in " + n; }));
  at(1400, () => { cd.innerHTML = on ? `${ico7("pause", 7)} Stopped` : `${ico7("play", 7)} Playing 3 / 12`; });
  return on ? "Playlists stop after each video" : "Playlists play on (stock)";
});
// Two acts (playlist, then live stream), stock and patched side by side whatever the switch is set to.
// Stock: the panel jumps up on its own and buries the page. On: it waits as a small bar until tapped.
SCN_HOLD.morphe_disable_player_popup_panels = 8400;
scen("playback", "disable_player_popup_panels", (box) => {
  situation("1 · You open a video from a playlist");
  const desc = `<div class="ds7" style="display:grid;gap:3px"><b style="font-size:7px" class="tt7">Night train to Bodø</b><div style="display:flex;gap:3px">${chip7("Like")}${chip7("Share")}${chip7("Save")}</div><div style="font-size:6px;color:#aaa">Comments 312</div>${chat7([[1, "ola", "this view!"], [2, "mia", "take me there"], [3, "ken", "pure calm"]])}</div>`;
  const feed = `<div class="fd7" style="display:grid;gap:5px">${top7()}${row7(2, "Road trip mix", "", "Playlist · 12 videos")}${row7(4, "Lo-fi beats")}${row7(1, "Northern lights LIVE", `<span style="position:absolute;left:1px;bottom:1px;font-size:4.5px;background:#f03;padding:0 2px;border-radius:2px">LIVE</span>`, "1.2K watching")}${row7(5, "Cabin build")}</div>`;
  const sides = duoValues("morphe_disable_player_popup_panels");
  box.innerHTML = duo7(pageRows(feed), pageRows(feed), sides);
  const bar = (label) => `<div class="pb7" style="position:absolute;left:4px;right:4px;bottom:4px;height:15px;border-radius:4px;background:#272727;display:flex;align-items:center;gap:3px;padding:0 5px;font-size:6px;z-index:3;animation:sheetup .3s var(--ease)">${ico7(label[0], 7)}<span style="flex:1;white-space:nowrap;overflow:hidden">${label[1]}</span>${ico7("expand", 7)}</div>`;
  const panel = (title, rows) => `<div class="pp7" style="position:absolute;left:0;right:0;top:52px;bottom:0;background:#1b1b1b;border-radius:5px 5px 0 0;padding:5px;display:grid;gap:3px;align-content:start;font-size:6px;animation:sheetup .35s var(--ease);z-index:4"><div style="width:16px;height:2px;border-radius:1px;background:#555;justify-self:center"></div><b style="font-size:6.5px">${title}</b>${rows}</div>`;
  const story = (dev, on) => {
    const pg = dev.querySelector(".pg7"), f = dev.querySelector(".finger"), W = dev.clientWidth, H = dev.clientHeight;
    const openWatch = (art, live) => { pg.innerHTML = player7(art, live ? `<span style="position:absolute;left:3px;top:3px;font-size:5px;background:#f03;padding:0 3px;border-radius:2px">LIVE</span>` : "") + desc; if (live) pg.querySelector(".tt7").textContent = "Northern lights · live"; };
    const popAct = (t0, label, title, rows) => {
      at(t0, () => dev.insertAdjacentHTML("beforeend", bar(label)));
      if (!on) {
        // the bar buzzes with a spark, jumps open by itself, and a red frame marks the page it now covers
        at(t0 + 700, () => { const b = dev.querySelector(".pb7"); b.insertAdjacentHTML("beforeend", `<span style="position:absolute;left:50%;top:-10px;transform:translateX(-50%);animation:pop .2s">${ico7("spark", 9, "#ffcc00")}</span>`); b.style.animation = "buzz .25s 3"; });
        at(t0 + 1250, () => { dev.querySelectorAll(".pb7").forEach(e => e.remove()); dev.insertAdjacentHTML("beforeend", panel(title, rows)); });
        at(t0 + 1750, () => { dev.insertAdjacentHTML("beforeend", `<div class="cv7" style="position:absolute;left:3px;right:3px;top:54px;bottom:3px;border:1.5px dashed #ff0033;border-radius:5px;z-index:5;animation:ghostin .2s"></div>`); toast7(dev, `${ico7("spark", 7, "#ffcc00")} Opened by itself`, "13%"); });
      } else {
        // the bar stays put with a lock; only the finger's tap opens it
        at(t0 + 700, () => { const b = dev.querySelector(".pb7"); b.style.boxShadow = "0 0 0 1.5px #4caf50"; b.insertAdjacentHTML("beforeend", `<span style="position:absolute;right:-3px;top:-6px;width:11px;height:11px;border-radius:50%;background:#4caf50;display:grid;place-items:center;animation:pop .2s">${ico7("lock", 7, "#000")}</span>`); toast7(dev, "Stays a small bar", "13%"); });
        at(t0 + 1500, () => { dev.querySelectorAll(".t7").forEach(e => e.remove()); fingerTo(f, W * .5, H - 12, 0); f.style.opacity = 0; requestAnimationFrame(() => { f.style.opacity = ""; fingerTo(f, W * .5, H - 12); }); });
        at(t0 + 1900, () => tapF(f));
        at(t0 + 2100, () => { f.classList.remove("show"); dev.querySelectorAll(".pb7").forEach(e => e.remove()); dev.insertAdjacentHTML("beforeend", panel(title, rows)); toast7(dev, `${ico7("toggle", 7, "#4caf50")} Opens on your tap`, "13%"); });
      }
    };
    at(350, () => fingerTo(f, W * .35, 36)); at(800, () => tapF(f));
    at(1050, () => { f.classList.remove("show"); openWatch(2, false); });
    popAct(1250, ["plist", "Playlist · 2 / 12"], "Road trip mix · 2 / 12", [1, 2, 4, 5].map(i => row7(i, "Video " + i)).join(""));
    at(4400, () => { dev.querySelectorAll(".pp7,.pb7,.cv7,.t7").forEach(e => e.remove()); pg.innerHTML = feed; });
    at(4600, () => fingerTo(f, W * .35, 78)); at(5000, () => tapF(f));
    at(5250, () => { f.classList.remove("show"); openWatch(1, true); });
    popAct(5450, ["chat", "Live chat"], "Live chat", chat7([[1, "ola", "so pretty"], [2, "mia", "green!!"], [3, "ken", "😍"], [4, "liv", "where is this?"], [5, "bo", "hi from Oslo"]]));
  };
  const [left, right] = box.querySelectorAll(".dev");
  story(left, sides[0][0]); story(right, sides[1][0]);
  at(4400, () => situation("2 · Then you open a live stream"));
  return `Stock panels jump open; set to ${sides.find(x => x[0] === true)[1]} they wait for your tap`;
});
// A long session with nobody touching the phone, shown as a run of videos with a clock.
SCN_HOLD.morphe_continue_watching_prompt = 5200;
scen("playback", "continue_watching_prompt", (box, v) => {
  situation("Autoplay runs for hours, nobody touches the phone");
  const vids = [[3, "Building a tiny cabin"], [2, "Night train to Bodø"], [4, "Lo-fi beats to relax"], [5, "Rain on a tin roof"]];
  box.innerHTML = device("port", pageRows(player7(3, `<span class="tm7" style="position:absolute;left:3px;bottom:3px;font-size:5.5px;background:rgba(0,0,0,.6);padding:0 3px;border-radius:3px">0:58</span><span class="pz7" style="position:absolute;left:0;bottom:0;height:2px;background:#f03;width:0"></span>`) + `<b class="tt7" style="font-size:7px">Building a tiny cabin</b><div class="run7" style="display:flex;gap:2px;align-items:center;font-size:5.5px;color:#aaa;white-space:nowrap;overflow:hidden">${ico7("clock", 7, "#aaa")}<span class="hrs7">0 h idle</span></div>` + row7(2, "Up next · Night train") + row7(4, "Up next · Lo-fi beats")));
  const dev = box.querySelector(".dev"), pv = dev.querySelector(".pg7 > div"), pz = dev.querySelector(".pz7"), hrs = dev.querySelector(".hrs7"), run = dev.querySelector(".run7");
  const play = (i, ms) => { const [art, t] = vids[i]; pv.style.background = ART[art]; dev.querySelector(".tt7").textContent = t; hrs.textContent = `${i + 1} h idle`; run.insertAdjacentHTML("beforeend", `<span style="width:7px;height:4px;border-radius:1px;background:${ART[art]};animation:pop .2s"></span>`); pz.style.transition = "none"; pz.style.width = "0"; void pz.offsetWidth; pz.style.transition = `width ${ms}ms linear`; pz.style.width = "100%"; };
  const prompt = (ghost) => `<div class="pr7" style="position:absolute;left:8px;right:8px;top:62%;background:#212121;border-radius:6px;padding:5px;font-size:6.5px;display:grid;gap:4px;z-index:5;animation:pop .25s;${ghost ? "color:#999;filter:grayscale(1);outline:1.5px dashed #888;outline-offset:1px" : ""}"><b>Video paused. Continue watching?</b><div style="text-align:right;color:#3ea6ff">Yes</div></div>`;
  play(0, 700);
  if (v === "DEFAULT") {
    at(800, () => play(1, 700));
    at(1600, () => { pz.style.transition = "none"; pz.style.width = "40%"; pv.style.filter = "brightness(.45)"; pv.insertAdjacentHTML("beforeend", `<span style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)">${ico7("pause", 14)}</span>`); dev.insertAdjacentHTML("beforeend", prompt(false)); });
    at(2500, () => { hrs.textContent = "Paused"; run.style.color = "#ff6b6b"; });
    at(3200, () => toast7(dev, "Playback waits for you", "86%"));
  } else if (v === "DISABLED") {
    // the stock prompt tries to appear, gets crossed out, and the run of videos simply continues
    at(800, () => play(1, 700));
    at(1550, () => { dev.insertAdjacentHTML("beforeend", prompt(true)); });
    at(1850, () => x7(dev, dev.querySelector(".pr7")));
    at(2300, () => { dev.querySelectorAll(".pr7,.x7").forEach(e => { e.style.transition = "opacity .25s"; e.style.opacity = 0; }); play(2, 900); });
    at(2650, () => dev.querySelectorAll(".pr7,.x7").forEach(e => e.remove()));
    at(3250, () => play(3, 900));
    at(3500, () => { check7(dev, "Keeps playing"); dev.querySelector(".check7").style.top = "70%"; });
  } else {
    // no pause prompt; every handover shows the autoplay countdown first
    const cd = (t0, next) => {
      at(t0, () => { pz.style.transition = "none"; pz.style.width = "100%"; dev.insertAdjacentHTML("beforeend", `<div class="cd7" style="position:absolute;left:6px;right:6px;top:12px;background:rgba(0,0,0,.8);border-radius:5px;padding:4px;font-size:6px;z-index:5;display:flex;gap:4px;align-items:center;animation:pop .25s"><span class="rg7" style="width:12px;height:12px;border-radius:50%;border:1.5px solid #fff;display:grid;place-items:center;font-size:6px;font-weight:700">5</span><span style="flex:1">Up next</span><span style="color:#3ea6ff">Cancel</span></div>`); });
      [4, 3, 2, 1].forEach((n, i) => at(t0 + 150 + i * 150, () => { const r = dev.querySelector(".rg7"); if (r) r.textContent = n; }));
      at(t0 + 800, () => { dev.querySelectorAll(".cd7").forEach(e => e.remove()); play(next, 800); });
    };
    cd(800, 1); cd(2400, 2);
    at(4000, () => { check7(dev, "Never pauses"); dev.querySelector(".check7").style.top = "70%"; });
  }
  return v === "DEFAULT" ? "YouTube pauses and asks 'Continue watching?' (stock)" : v === "ALWAYS_COUNTDOWN" ? "No pause prompt; the autoplay countdown shows before every next video" : "No prompt at all: playback just keeps going";
});
scen("playback", "do_not_remember_loop_video", (box, on) => {
  situation("Loop was on, then you open the next video");
  box.innerHTML = device("port", watch7(`<span class="lp7" style="position:absolute;right:3px;top:3px;width:12px;height:12px;border-radius:50%;background:rgba(62,166,255,.9);display:grid;place-items:center">${ico7("loop", 8, "#000")}</span>`));
  const dev = box.querySelector(".dev"), f = box.querySelector("#scFinger"); const W = dev.clientWidth, H = dev.clientHeight;
  at(300, () => fingerTo(f, W * .5, H * .45)); at(600, () => tapF(f));
  at(850, () => { f.classList.remove("show"); dev.querySelector(".pg7 > div").style.background = ART[2]; const l = dev.querySelector(".lp7"); if (on) l.style.background = "rgba(0,0,0,.5)"; toast7(dev, on ? "Loop is off again" : "Still looping", "80%"); });
  return on ? "Loop switches off for each new video" : "Loop stays on for the next videos (stock)";
});
// Morphe (ForceFullscreenLandscapePatch): on tablets and other large screens only (phones already open
// fullscreen in landscape), entering fullscreen turns the screen to landscape, and leaving it brings back
// the orientation it had before. Stock: a tablet held upright stays upright, the video letterboxed.
scen("playback", "force_fullscreen_landscape", (box, on) => {
  situation("A tablet held upright: tapping fullscreen");
  box.innerHTML = device("port", playerArea(3));
  const dev = box.querySelector(".dev"), f = box.querySelector("#scFinger"); const W = dev.clientWidth;
  at(300, () => fingerTo(f, W - 10, 44)); at(600, () => tapF(f));
  at(850, () => {
    f.classList.remove("show");
    if (on) turnTo(dev, "land", miniVideo(3));
    else devContent(dev, `<div style="position:absolute;inset:0;background:#000"></div><div style="position:absolute;left:0;right:0;top:50%;height:30%;translate:0 -50%;background:${ART[3]}"></div>`);
  });
  return on ? "Fullscreen turns the tablet's screen to landscape" : "Fullscreen stays upright: the video is letterboxed (stock)";
});
// Morphe (FullscreenPlaylistPanelPatch): on tablets, opening the playlist panel in fullscreen keeps
// fullscreen and shows the panel over the player. Stock: opening it leaves fullscreen first.
scen("playback", "fullscreen_playlist_panel", (box, on) => {
  situation("A tablet in fullscreen: opening the playlist");
  const list = `<b style="font-size:6px">Road trip mix · 2 / 12</b>${[1, 2, 4, 5].map(i => `<div style="display:flex;gap:3px;align-items:center;font-size:5.5px"><span style="width:16px;height:9px;flex:none;background:${ART[i]}"></span>Video ${i}</div>`).join("")}`;
  box.innerHTML = device("land", `<div class="pv7" style="position:absolute;left:0;top:0;width:100%;height:100%;background:${ART[3]};transition:all .45s var(--ease)"></div><span style="position:absolute;right:6px;top:5px;z-index:2">${ico7("plist", 9)}</span>`);
  const dev = box.querySelector(".dev"), f = box.querySelector("#scFinger"), pv = dev.querySelector(".pv7"); const W = dev.clientWidth;
  at(300, () => fingerTo(f, W - 9, 9)); at(600, () => tapF(f));
  at(850, () => {
    f.classList.remove("show");
    if (on) dev.insertAdjacentHTML("beforeend", `<div style="position:absolute;right:0;top:0;bottom:0;width:40%;background:rgba(15,15,15,.92);padding:5px;display:grid;gap:3px;align-content:start;z-index:3;animation:slidein7 .35s var(--ease)">${list}</div>`);
    else {
      // out of fullscreen: the watch page, video top left, the playlist beside it
      Object.assign(pv.style, { width: "58%", height: "60%", left: "4px", top: "4px", borderRadius: "3px" });
      later(() => { dev.insertAdjacentHTML("beforeend", `<div style="position:absolute;left:4px;top:calc(60% + 8px);font-size:6px"><b>Building a tiny cabin</b></div><div style="position:absolute;right:4px;top:4px;bottom:4px;width:36%;background:#1b1b1b;border-radius:3px;padding:4px;display:grid;gap:3px;align-content:start;animation:ghostin .3s">${list}</div>`); toast7(dev, "Left fullscreen", "84%"); }, 300);
    }
  });
  return on ? "The playlist opens over the fullscreen video" : "Opening the playlist leaves fullscreen (stock)";
});
for (const [k, label, icon] of [["hide_ask_gemini_button", "Ask", "spark"], ["hide_chapters_timeline_button", "Chapters", "list"], ["hide_live_chat_replay_button", "Live chat replay", "chat"], ["hide_sync_button", "Sync", "reload"]])
  hidePage("playback", k, "Under the video", player7(3) + `<b style="font-size:7px">Building a tiny cabin</b><div style="display:flex;gap:3px;align-items:center;overflow:hidden;padding:2px">${chip7("Like")}${tgt7(`<span style="display:inline-flex;gap:2px;align-items:center;padding:1px 5px;border-radius:5px;background:#272727;font-size:6px;white-space:nowrap">${ico7(icon, 6)}${label}</span>`, 1)}${chip7("Share")}</div>` + row7(2, "Up next"));
hidePage("playback", "hide_subscribers_community_guidelines", "Before posting in a channel's community", top7("Fjord & Timber", ["more"]) + tgt7(`<div style="padding:3px;border-radius:3px;background:#1b1b1b;font-size:6px">Please follow the community guidelines · Got it</div>`) + cmt7(2, "Love the roof!"));
hidePage("playback", "hide_tap_and_hold_gradient", "Holding the video for 2× speed", `<div style="position:absolute;inset:0;background:${ART[3]}"></div><div class="tgt7" style="position:absolute;left:0;right:0;top:0;height:40%;background:linear-gradient(rgba(0,0,0,.75),transparent)"></div><div class="toastin" style="top:6px;z-index:2">2× ▶▶</div>`, { dev: "land", raw: true });
hidePage("playback", "hide_timed_reactions", "Comments under a live replay", player7(3, `<div class="tgt7" style="position:absolute;right:4px;bottom:4px;display:grid;gap:1px;font-size:8px"><span>❤️</span><span>😂</span><span>🔥</span></div>`) + row7(2, "Up next"));
scen("playback", "on_the_go", (box, on) => {
  situation("Turning off the screen while a video plays");
  box.innerHTML = device("port", watch7());
  const dev = box.querySelector(".dev");
  at(600, () => { dev.innerHTML = `<div style="position:absolute;inset:0;background:#000"></div><div class="toastin" style="top:40%">${on ? `${ico7("music", 7)} Audio keeps playing` : `${ico7("pause", 7)} Paused`}</div>`; });
  return on ? "Audio-only mode when the screen goes off" : "The video pauses (stock)";
});
scen("playback", "sanitize_video_subtitle", (box, on) => {
  situation("The line under a video title");
  box.innerHTML = device("port", pageRows(player7(3) + `<b style="font-size:7px">Building a tiny cabin</b><div class="sb7" style="font-size:5.5px;color:#aaa;transition:opacity .25s">1.2M views · 3 days ago · #diy #cabin #offgrid ...more</div>` + row7(2, "Up next")));
  const dev = box.querySelector(".dev");
  at(700, () => { if (!on) return; const s = dev.querySelector(".sb7"); s.style.opacity = 0; later(() => { s.textContent = "1.2M views · 3 days ago"; s.style.opacity = 1; }, 260); });
  return on ? "Hashtags and extras are removed from the line" : "Hashtags and extras clutter the line (stock)";
});
for (const [k, icon, text] of [["save_to_watch_later_flyout_button", "clock", "Save to Watch later"], ["feed_download_flyout_button", "dl", "Download with your app"], ["shorts_download_flyout_button", "dl", "Download this Short"]])
  hidePage("playback", k, "The ⋮ menu of a video", feed7(big7(3, "Building a tiny cabin")) + `<div style="background:#212121;border-radius:6px 6px 0 0;padding:4px;display:grid;gap:1px;margin:0 -6px -6px">${item7("plist", "Save to playlist")}${tgt7(item7(icon, text))}${item7("share", "Share")}</div>`, { invert: true, shown: `“${text}” is added to the menu`, hidden: "Not in the menu (stock)" });
scen("playback", "seek_notification_media_prev_next", (box, on) => {
  situation("The media notification");
  box.innerHTML = device("port", `<div style="position:absolute;inset:0;background:#1b1b1b"></div><div style="position:absolute;left:4px;right:4px;top:10px;padding:4px;border-radius:6px;background:#2a2a2a;font-size:6px;display:grid;gap:3px"><b>Building a tiny cabin</b><div style="display:flex;justify-content:space-around" class="nb7"></div></div>`);
  const dev = box.querySelector(".dev");
  at(300, () => { dev.querySelector(".nb7").innerHTML = (on ? ["prev", "pause", "next"] : ["prev", "pause", "next"]).map((n, i) => `<span style="display:grid;justify-items:center;font-size:5px">${ico7(n, 9)}${on && i !== 1 ? (i ? "+10 s" : "−10 s") : ""}</span>`).join(""); });
  return on ? "Previous and next seek back and forward instead" : "Previous and next change the video (stock)";
});
scen("playback", "download_force_4k", (box, on) => {
  situation("Downloading a video");
  box.innerHTML = device("port", pageRows(player7(3) + `<div style="background:#212121;border-radius:5px;padding:4px;display:grid;gap:2px;font-size:6.5px"><b>Download quality</b><div>360p</div><div>720p</div><div class="q4" style="color:${on ? "#3ea6ff" : "#555"}">${on ? "2160p (4K)" : "2160p · Premium"}</div></div>`));
  return on ? "4K downloads are offered" : "4K downloads are locked (stock)";
});
scen("playback", "live_chat_translate", (box, on) => {
  situation("Live chat in other languages");
  box.innerHTML = device("port", pageRows(player7(5) + `<div class="lc7" style="display:grid;gap:3px">${chat7([[1, "yuki", "めっちゃ綺麗"], [2, "lars", "Så vakkert!"], [3, "ana", "¡Qué bonito!"]])}</div>`));
  const dev = box.querySelector(".dev");
  at(800, () => { if (on) dev.querySelector(".lc7").innerHTML = chat7([[1, "yuki", "So beautiful <i style='color:#3ea6ff'>(ja)</i>"], [2, "lars", "So beautiful! <i style='color:#3ea6ff'>(no)</i>"], [3, "ana", "How pretty! <i style='color:#3ea6ff'>(es)</i>"]]); });
  return on ? "Chat messages are translated" : "Chat stays in its languages (stock)";
});
scen("playback", "loop_count", (box, on) => {
  situation("A looping video");
  box.innerHTML = device("port", watch7(`<span class="lc8 badge7" style="right:3px;top:3px">${on ? "Loop 1" : ""}</span>`));
  const dev = box.querySelector(".dev");
  [2, 3, 4].forEach((n, i) => at(500 + i * 450, () => { if (on) dev.querySelector(".lc8").textContent = "Loop " + n; }));
  return on ? "A counter shows how many times it looped" : "No loop counter (stock)";
});
scen("playback", "advanced_video_quality_menu", (box, on) => {
  situation("Tapping Quality");
  box.innerHTML = device("port", pageRows(player7(3)) + `<div style="position:absolute;left:0;right:0;bottom:0;background:#212121;border-radius:6px 6px 0 0;padding:5px;display:grid;gap:3px;font-size:6.5px;animation:sheetup .25s">${on ? ["1080p60", "720p60", "480p", "360p", "Auto"].map(t => `<div>${t}</div>`).join("") : ["Auto (recommended)", "Higher picture quality", "Data saver", "Advanced ›"].map(t => `<div>${t}</div>`).join("")}</div>`);
  return on ? "The full list of resolutions opens directly" : "A simplified menu first (stock)";
});
for (const [k, sit, offTxt, onTxt] of [
  ["disable_drc_audio", "Quiet and loud parts of a video", "Loudness is evened out", "Full dynamic range"],
  ["disable_playback_speed_music", "Music videos at 1.5×", "Music plays at your speed", "Music always plays at 1×"],
  ["force_original_audio", "A video with dubbed audio tracks", "Dubbed track in your language", "Original audio track"],
  ["remember_live_stream_position", "Coming back to a live stream", "Jumps to live", "Resumes where you were"],
  ["video_delay_bluetooth_only", "Audio delay correction", "Applied always", "Only with Bluetooth audio"],
  ["video_quality_prioritize", "Choosing quality on a slow network", "Lowers quality when needed", "Holds your quality, buffers instead"]]) {
  scen("playback", k, (box, on) => {
    situation(sit);
    box.innerHTML = device("port", watch7(`<div class="wave7" style="position:absolute;left:6px;right:6px;bottom:6px;height:12px;display:flex;gap:1px;align-items:center">${Array.from({ length: 22 }, (_, i) => `<i style="flex:1;background:#fff;opacity:.85;height:${on && k === "disable_drc_audio" ? 20 + (i * 37 % 80) : 45 + (i * 13 % 20)}%;transition:height .4s"></i>`).join("")}</div>`));
    const dev = box.querySelector(".dev");
    at(600, () => toast7(dev, on ? onTxt : offTxt, "78%"));
    return on ? onTxt : offTxt + " (stock)";
  });
}
scen("playback", "hide_premium_video_quality", (box, on) => {
  situation("The quality list");
  box.innerHTML = device("port", pageRows(player7(3)) + `<div style="position:absolute;left:0;right:0;bottom:0;background:#212121;border-radius:6px 6px 0 0;padding:5px;display:grid;gap:3px;font-size:6.5px">${tgt7(`<div>1080p Premium <span style="color:#aaa">· enhanced bitrate</span></div>`)}<div>1080p</div><div>720p</div><div>Auto</div></div>`);
  const dev = box.querySelector(".dev"), t = dev.querySelector(".tgt7");
  at(400, () => t.classList.add("mark7")); at(1100, () => { if (on) t.classList.add("gone7"); }); at(1700, () => t.classList.remove("mark7"));
  return on ? "Premium-only qualities are removed from the list" : "Premium qualities you can't use are listed (stock)";
});
for (const [k, what, val] of [["remember_playback_speed_last_selected", "speed", "1.5×"], ["remember_shorts_quality_last_selected", "Shorts quality", "720p"], ["remember_video_quality_last_selected", "quality", "1080p"]]) {
  scen("playback", k, (box, on) => {
    situation(`Picking a ${what}, then opening another video`);
    box.innerHTML = device("port", watch7(`<span class="rv7 badge7" style="right:3px;top:3px">${val}</span>`));
    const dev = box.querySelector(".dev");
    at(800, () => { dev.querySelector(".pg7 > div").style.background = ART[6]; dev.querySelector(".rv7").textContent = on ? val : (what === "speed" ? "1×" : "Auto"); toast7(dev, on ? `Your ${what} is kept` : `Back to the default ${what}`, "80%"); });
    return on ? `The last ${what} you picked becomes the default` : `Each video starts at the default ${what} (stock)`;
  });
}
scen("playback", "vot_enabled", (box, on) => {
  situation("A video in a language you don't speak");
  box.innerHTML = device("port", watch7(`<span class="vo7" style="position:absolute;left:50%;bottom:4px;transform:translateX(-50%);font-size:6px;background:rgba(0,0,0,.75);padding:0 4px;white-space:nowrap;border-radius:3px">🗣 Привет, друзья!</span>`));
  const dev = box.querySelector(".dev");
  at(800, () => { if (on) dev.querySelector(".vo7").innerHTML = "🎧 Hi, friends! <span style='color:#3ea6ff'>(voice-over)</span>"; });
  return on ? "A translated voice-over plays over the video" : "Original voice only (stock)";
});
hidePage("dearrow", "dearrow_connection_toast", "DeArrow can't reach its server", feed7(big7(3, "Building a tiny cabin")) + `<div style="height:20px"></div>` + tgt7(`<div style="padding:3px 5px;border-radius:8px;background:#323232;font-size:6px;text-align:center">DeArrow is temporarily unavailable</div>`), { invert: true, shown: "A toast tells you when DeArrow is down", hidden: "Fails silently" });

function inScope(p, scopes) { return scopes.some(([s, sub]) => p.screen === s && (p.subScreen || null) === sub); }
function buildMembers() {
  MEMBERS = {};
  SECTIONS.forEach(s => (MEMBERS[s.id] = { live: [], misc: [] }));
  const assigned = new Set();
  for (const k in A) if (PREF[k] && MEMBERS[A[k].section] && inVersion(k)) { MEMBERS[A[k].section].live.push(k); assigned.add(k); }
  for (const p of CAT.preferences) {
    if (assigned.has(p.key) || !inVersion(p.key) || p.type === "screen") continue; // sub-screen links are navigation, not settings
    const s = SECTIONS.find(s => s.scopes && inScope(p, s.scopes));
    (s ? MEMBERS[s.id].misc : MEMBERS.misc.misc).push(p.key);
  }
  buildKids();
}
// Sub-options: a setting that depends on another setting of the same screen sits under it,
// offset, and only shows while that dependency is met. MANUAL_PARENT adds groupings that
// Morphe does not express as a dependency.
const MANUAL_PARENT = {
  // the list of speeds is what the custom speed menu shows
  morphe_custom_playback_speeds: { key: "morphe_custom_speed_menu" },
  // restoring free pinch zoom means nothing while pinch is switched off altogether
  morphe_restore_pinch_to_zoom: { key: "morphe_disable_fullscreen_zoom_gesture", mode: "not" },
  morphe_player_overlay_opacity: { key: "morphe_hide_player_control_buttons_background", always: true },
  // with the swap on, Create lives in the top bar (its own toggle there); this one only acts on the bottom bar
  morphe_hide_create_button: { key: "morphe_swap_create_with_notifications_button", mode: "not" },
  morphe_hide_toolbar_notification_button: { key: "morphe_swap_create_with_notifications_button", mode: "not" },
  // with the glass bar on, the style only decides Default vs Translucent, which glass already overrides
  morphe_navigation_bar_style: { key: "morphe_navigation_bar_glass", mode: "not" },
};
const NOT_PARENT = { morphe_navigation_bar_glass: "morphe_navigation_bar_style" }; // avoid a loop with the line above
let DIRECT_PARENT = {};
let PARENT_OF = {}, KIDS = {};
function buildKids() {
  PARENT_OF = {}; KIDS = {};
  for (const s of SECTIONS) {
    const keys = [...MEMBERS[s.id].live, ...MEMBERS[s.id].misc], set = new Set(keys);
    for (const k of keys) {
      const ok = x => x !== k && x !== NOT_PARENT[k] && set.has(x);
      const av = String(PREF[k].availability || "");
      const avKeys = [...new Set([...(PREF[k].availabilityParents || []), ...[...av.matchAll(/S\("([^"]+)"\)/g)].map(m => m[1])])].filter(ok);
      // a setting that unlocks when ANY of several settings is on (DeArrow titles in any place, any swipe
      // zone) is not a sub-option of one of them: nesting it under the first made it pop up under a
      // parent that was never touched. It stays a normal row that is greyed out until one is on.
      const shared = avKeys.length > 1 && av.includes("||");
      // with several required parents, the nearest one is the one that itself needs the others
      // (Audio time stretching needs the speed menu and Audio pitch controls: it belongs under the latter)
      const ps = (PREF[k].parents || []).map(x => x.key).filter(ok);
      const near = ps.find(x => ps.some(y => y !== x && (PREF[x]?.parents || []).some(z => z.key === y))) || ps[0];
      const par = MANUAL_PARENT[k] && set.has(MANUAL_PARENT[k].key) ? MANUAL_PARENT[k].key : near || (shared ? null : avKeys[0]);
      if (par) PARENT_OF[k] = par;
    }
  }
  DIRECT_PARENT = { ...PARENT_OF };
  for (const k in PARENT_OF) { let r = PARENT_OF[k], g = 0; while (PARENT_OF[r] && g++ < 6) r = PARENT_OF[r]; PARENT_OF[k] = r; }
  for (const k in PARENT_OF) (KIDS[PARENT_OF[k]] = KIDS[PARENT_OF[k]] || []).push(k);
}
function kidVisible(k, depth = 0) {
  const m = MANUAL_PARENT[k];
  if (m && m.always) return true;
  if (m && (m.mode === "not" ? !!state[m.key] : !state[m.key])) return false;
  if (!(classicParentsOk(k) && availOk(k))) return false;
  // a sub-sub-option also hides with its own parent
  const d = DIRECT_PARENT[k];
  return !d || !PARENT_OF[d] || depth > 6 || kidVisible(d, depth + 1);
}
const sectionKeys = () => MEMBERS[section] ? [...MEMBERS[section].live, ...MEMBERS[section].misc] : [];
const sectionOf0 = k => SECTIONS.find(s => MEMBERS[s.id].live.includes(k) || MEMBERS[s.id].misc.includes(k))?.id || "misc";
// A Morphe sub-screen (Captions, Miniplayer...) is not a row: it leads to the editor screen that
// holds most of its settings.
const screenSecCache = {};
function screenSection(k) {
  if (screenSecCache[k]) return screenSecCache[k];
  const n = {};
  for (const p of CAT.preferences) if (p.subScreen === k && p.type !== "screen" && inVersion(p.key)) { const s = sectionOf0(p.key); n[s] = (n[s] || 0) + 1; }
  const best = Object.entries(n).sort((a, b) => b[1] - a[1])[0];
  return (screenSecCache[k] = best ? best[0] : "misc");
}
const sectionOf = k => PREF[k] && PREF[k].type === "screen" ? screenSection(k) : sectionOf0(k);
// Where a screen is, in the words of the current layout: "Captions", or "Playback › Captions" with tabs.
function placeLabel(id) {
  if (grouped) { const g = groupOf(id), t = g.tabs.find(([x]) => x === id); return `${g.title} › ${t ? t[1] : id}`; }
  return SECTIONS.find(s => s.id === id)?.title || "Other";
}
