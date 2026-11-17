/*
 * Morphe Visual Settings Editor: web preview.
 *
 * Everything below reads catalogue.json, which tools/extract_catalogue.py generates from a
 * morphe-patches checkout. Nothing about a preference (key, type, default, title, summary,
 * entries, dependencies) is typed by hand here. This file only adds the *visual* layer:
 *
 *   SECTIONS   which catalogue screens feed each Live View tab
 *   ADAPTERS   which preference keys have a visual adapter, and of which kind
 *   SCENES     the mock YouTube UI each tab draws, tagging components with their key
 *
 * Any preference without an adapter falls back to its ordinary widget under "Misc".
 */
(() => {
"use strict";

// ------------------------------------------------------------------ icons
const P = {
  cast: "M1 18v3h3c0-1.66-1.34-3-3-3zm0-4v2c2.76 0 5 2.24 5 5h2c0-3.87-3.13-7-7-7zm0-4v2c4.97 0 9 4.03 9 9h2c0-6.08-4.93-11-11-11zm20-7H3c-1.1 0-2 .9-2 2v3h2V5h18v14h-7v2h7c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z",
  cc: "M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1c0 .55-.45 1-1 1h-3c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1z",
  gear: "M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6a3.6 3.6 0 1 1 0-7.2 3.6 3.6 0 0 1 0 7.2z",
  down: "M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z",
  full: "M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z",
  prev: "M6 6h2v12H6zm3.5 6 8.5 6V6z",
  next: "M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z",
  play: "M8 5v14l11-7z",
  pause: "M6 19h4V5H6v14zm8-14v14h4V5h-4z",
  like: "M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z",
  dislike: "M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z",
  share: "M14 9V5l7 7-7 7v-4.1c-5 0-8.5 1.6-11 5.1 1-5 4-10 11-11z",
  dl: "M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z",
  comment: "M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z",
  more: "M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z",
  moreh: "M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z",
  home: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
  plus: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
  subs: "M20 8H4V6h16v2zm-2-6H6v2h12V2zm4 10v8c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2v-8c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2zm-6 4-6-3.27v6.53L16 16z",
  you: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
  bell: "M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z",
  search: "M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",
  mic: "M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z",
  loop: "M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0 0 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 0 0 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z",
  mute: "M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.8 8.8 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z",
  vol: "M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z",
  bright: "M20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69zM12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12zm0-10a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  pip: "M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 1.98 2 1.98h18c1.1 0 2-.88 2-1.98V5c0-1.1-.9-2-2-2zm0 16.01H3V4.98h18v14.03z",
  reload: "M17.65 6.35A7.96 7.96 0 0 0 12 4a8 8 0 1 0 7.73 10h-2.08A6 6 0 1 1 12 6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z",
  link: "M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z",
  speed: "M20.38 8.57l-1.23 1.85a8 8 0 0 1-.22 7.58H5.07A8 8 0 0 1 15.58 6.85l1.85-1.23A10 10 0 0 0 3.35 19a2 2 0 0 0 1.72 1h13.85a2 2 0 0 0 1.74-1 10 10 0 0 0-.27-10.44zm-9.79 6.84a2 2 0 0 0 2.83 0l5.66-8.49-8.49 5.66a2 2 0 0 0 0 2.83z",
  clock: "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z",
  plist: "M3 10h11v2H3zm0-4h11v2H3zm0 8h7v2H3zm13-1v8l6-4z",
  save: "M14 10H3v2h11v-2zm0-4H3v2h11V6zm4 8v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM3 16h7v-2H3v2z",
  crop: "M17 15h2V7c0-1.1-.9-2-2-2H9v2h8v8zM7 17V1H5v4H1v2h4v10c0 1.1.9 2 2 2h10v4h2v-4h4v-2H7z",
  flag: "M14.4 6 14 4H5v17h2v-7h5.6l.4 2h7V6z",
  remix: "M10.59 9.17 5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z",
  clip: "M9.64 7.64c.23-.5.36-1.05.36-1.64a4 4 0 1 0-4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36A3.9 3.9 0 0 0 6 14a4 4 0 1 0 4 4c0-.59-.13-1.14-.36-1.64L12 14l7 7h3v-1L9.64 7.64zM6 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 12a2 2 0 1 1 0-4 2 2 0 0 1 0 4zM19 3l-6 6 2 2 7-7V3z",
  shop: "M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm6 16H6V8h2v2h2V8h4v2h2V8h2v12z",
  spark: "M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z",
  music: "M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z",
  info: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z",
  translate: "M12.87 15.07l-2.54-2.51.03-.03A17.5 17.5 0 0 0 14.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7 1.62-4.33L19.12 17h-3.24z",
  lock: "M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z",
  timer: "M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61 1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42A8.96 8.96 0 0 0 12 4a9 9 0 1 0 9 9c0-2.12-.74-4.07-1.97-5.61zM12 20a7 7 0 1 1 0-14 7 7 0 0 1 0 14z",
  help: "M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z",
  tune: "M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z",
  chat: "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z",
  fire: "M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67z",
  close: "M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
  sort: "M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z",
  heart: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
  dollar: "M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z",
  emoji: "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z",
  gift: "M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68A3.01 3.01 0 0 0 9 2C7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 12 7.4l3.38 4.6L17 10.83 14.92 8H20v6z",
  shorts: "M17.77 10.32l-1.2-.5L18 9.06a3.74 3.74 0 0 0-3.5-6.62L6 6.94a3.74 3.74 0 0 0 .23 6.74l1.2.49L6 14.93a3.75 3.75 0 0 0 3.5 6.63l8.5-4.5a3.74 3.74 0 0 0-.23-6.74zM10 14.65v-5.3L15 12l-5 2.65z",
  queue: "M4 6h12v2H4zm0 4h12v2H4zm0 4h8v2H4zm10 0v6l5-3z",
  vr: "M20.74 6H3.21C2.55 6 2 6.57 2 7.28v10.44c0 .7.55 1.28 1.23 1.28h4.79c.52 0 .96-.33 1.14-.79l1.4-3.48c.23-.59.79-1.01 1.44-1.01s1.21.42 1.45 1.01l1.39 3.48c.19.46.63.79 1.11.79h4.79c.71 0 1.26-.57 1.26-1.28V7.28c0-.7-.55-1.28-1.26-1.28zM7.5 14.62c-1.17 0-2.13-.95-2.13-2.12 0-1.17.96-2.13 2.13-2.13s2.12.96 2.12 2.13-.95 2.12-2.12 2.12zm9 0c-1.17 0-2.13-.95-2.13-2.12 0-1.17.96-2.13 2.13-2.13s2.12.96 2.12 2.13-.95 2.12-2.12 2.12z",
  tv: "M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z",
  eye: "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z",
  gesture: "M9 11.24V7.5a2.5 2.5 0 0 1 5 0v3.74c1.21-.81 2-2.18 2-3.74C16 5.01 13.99 3 11.5 3S7 5.01 7 7.5c0 1.56.79 2.93 2 3.74zm9.84 4.63-4.54-2.26c-.17-.07-.35-.11-.54-.11H13v-6c0-.83-.67-1.5-1.5-1.5S10 6.67 10 7.5v10.74l-3.43-.72c-.08-.01-.15-.03-.24-.03-.31 0-.59.13-.79.33l-.79.8 4.94 4.94c.27.27.65.44 1.06.44h6.79c.75 0 1.33-.55 1.44-1.28l.75-5.27c.01-.07.02-.14.02-.2 0-.62-.38-1.16-.91-1.38z",
  layout: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
  palette: "M12 3a9 9 0 0 0 0 18c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3-4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z",
  layers: "M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16z",
  toggle: "M17 7H7a5 5 0 0 0 0 10h10a5 5 0 0 0 0-10zm0 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6z",
  list: "M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z",
};
const I = (n, cls = "ico", extra = "") => `<svg class="${cls}" viewBox="0 0 24 24" ${extra}><path d="${P[n] || P.info}"/></svg>`;
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Dummy artwork: gradients only, no external images.
const ART = [
  "radial-gradient(circle at 70% 30%,#ffd27a 0 12%,transparent 13%),linear-gradient(180deg,#2b4c7e 0%,#5a7fb5 55%,#2f5233 56%,#1d3320 100%)",
  "radial-gradient(circle at 30% 60%,#ff6b6b 0 18%,transparent 19%),linear-gradient(135deg,#232526,#414345)",
  "linear-gradient(160deg,#614385,#516395)",
  "radial-gradient(ellipse at 50% 120%,#f7971e 0 40%,transparent 41%),linear-gradient(180deg,#0f2027,#2c5364)",
  "linear-gradient(135deg,#134e5e,#71b280)",
  "radial-gradient(circle at 40% 40%,#fff3 0 20%,transparent 21%),linear-gradient(135deg,#c94b4b,#4b134f)",
  "linear-gradient(180deg,#355c7d,#6c5b7b,#c06c84)",
  "radial-gradient(circle at 75% 70%,#f9d423 0 14%,transparent 15%),linear-gradient(135deg,#1f4037,#99f2c8)",
];
const AV = ["#e57373", "#64b5f6", "#81c784", "#ffb74d", "#ba68c8", "#4db6ac", "#f06292", "#a1887f"];
const VIDEOS = [
  { t: "Building a tiny cabin in the Norwegian forest", c: "Fjord & Timber", v: "1.2M views", a: "3 days ago", d: "18:42" },
  { t: "I tried every budget mechanical keyboard so you don't have to", c: "Switch Lab", v: "486K views", a: "1 week ago", d: "24:10" },
  { t: "Night train from Oslo to Bodø: 18 hours north", c: "Slow Rails", v: "2.9M views", a: "2 months ago", d: "41:05" },
  { t: "The physics of a perfect skipping stone", c: "Pocket Science", v: "731K views", a: "5 days ago", d: "12:37" },
  { t: "Lo-fi beats for late night coding", c: "Midnight Tapes", v: "9.1M views", a: "1 year ago", d: "2:00:00" },
  { t: "Restoring a 1974 film camera", c: "Darkroom Diaries", v: "212K views", a: "4 days ago", d: "16:03" },
];
const thumb = (i, style = "", extra = "") => `<div class="thumb" style="background:${ART[i % ART.length]};aspect-ratio:16/9;${style}">${extra}</div>`;
const av = (i, s = 36) => `<div class="av" style="width:${s}px;height:${s}px;background:${AV[i % AV.length]}"></div>`;

// ------------------------------------------------------------------ sections
// scopes: [screen, subScreen] pairs from the catalogue. A preference that has no adapter
// but lives in one of a section's scopes is listed under that section's Misc.
const SECTIONS = [
  { id: "player", title: "Player controls", scopes: [["PLAYER", "morphe_overlay_buttons_screen"]] },
  { id: "endscreen", title: "End screen", scopes: [] },
  { id: "seekbar", title: "Seekbar & gestures", scopes: [["SEEKBAR", null], ["PLAYER", "morphe_disable_haptic_feedback"]] },
  { id: "watch", title: "Watch page", scopes: [["PLAYER", "morphe_action_buttons_screen"], ["PLAYER", "morphe_hide_description_components_screen"]] },
  { id: "fullscreen", title: "Fullscreen", scopes: [["SWIPE_CONTROLS", null], ["PLAYER", "morphe_disable_fullscreen_gestures"]] },
  { id: "feed", title: "Home feed", scopes: [["FEED", null], ["FEED", "morphe_hide_filter_bar_screen"]] },
  { id: "shorts", title: "Shorts", scopes: [["SHORTS", null], ["SHORTS", "morphe_shorts_player_screen"]] },
  { id: "nav", title: "Navigation", scopes: [["GENERAL", "morphe_navigation_bar_screen"], ["GENERAL", "morphe_toolbar_screen"]] },
  { id: "comments", title: "Comments", scopes: [["PLAYER", "morphe_comments_screen"]] },
  { id: "flyout", title: "Player menu", scopes: [["PLAYER", "morphe_hide_player_flyout"]] },
  { id: "captions", title: "Captions", scopes: [["PLAYER", "morphe_captions_screen"], ["PLAYER", "morphe_captions_advanced"]] },
  { id: "miniplayer", title: "Miniplayer", scopes: [["PLAYER", "morphe_miniplayer_screen"], ["PLAYER", "morphe_notification_media_screen"]] },
  { id: "misc", title: "Misc", scopes: null },
];

// ------------------------------------------------------------------ adapters
// Kinds mirror the proposed native adapters:
//   vis       VisibilityPreview  (hide/show a component)
//   overlay   OverlayPreview     (overlay or card populated with dummy content)
//   gesture   GesturePreview     (animated touch demo, plays while selected)
//   layout    LayoutPreview      (arrangement / ordering choice)
//   style     StylePreview       (opacity, size, colour, shape)
//   behaviour BehaviourPreview   (playback behaviour, animated)
// Keys are written without the "morphe_" prefix.
const A = {};
const def = (section, kind, keys, extra = {}) => keys.split(/\s+/).filter(Boolean).forEach(k => { A["morphe_" + k] = { section, kind, ...extra }; });

def("player", "vis", "hide_collapse_button hide_autoplay_button hide_captions_button hide_cast_button hide_settings_button hide_player_previous_next_buttons hide_fullscreen_button");
def("player", "vis", "copy_video_link_button playback_speed_dialog_button video_quality_dialog_button loop_video_button mute_video_button pip_button_overlay reload_video_button save_to_watch_later_button playlist_panel_button play_all_button fullscreen_video_scale_button video_delay_button_overlay external_downloader_overlay_button");
def("player", "style", "hide_player_control_buttons_background player_control_buttons_background_opacity player_overlay_opacity");

def("endscreen", "overlay", "hide_end_screen_cards hide_autoplay_preview hide_end_screen_suggested_video");
def("endscreen", "vis", "hide_info_cards hide_channel_watermark hide_end_screen_store_banner");
def("endscreen", "behaviour", "autoplay_mode");

def("seekbar", "vis", "hide_seekbar hide_timestamp seekbar_thumbnail_preview hide_player_gesture_hints");
def("seekbar", "gesture", "tap_to_seek slide_to_seek disable_precise_seeking_gesture");
def("seekbar", "style", "seekbar_custom_color seekbar_custom_color_primary seekbar_custom_color_accent");

def("watch", "vis", "hide_channel_bar hide_join_membership_button hide_action_bar hide_like_dislike_button hide_share_button hide_remix_button hide_thanks_button hide_download_button hide_clip_button hide_save_button hide_report_button hide_shop_button hide_ask_button hide_hype_button hide_promote_button hide_stop_ads_button hide_more_button hide_comments_section hide_comments_preview_comment hide_info_panels");
def("watch", "overlay", "hide_player_related_videos");
def("watch", "layout", "video_action_bar_layout");
def("watch", "behaviour", "disable_like_subscribe_glow");

def("fullscreen", "vis", "hide_video_title hide_quick_actions hide_quick_actions_like_button hide_quick_actions_dislike_button hide_quick_actions_comments_button hide_quick_actions_save_button hide_quick_actions_share_button hide_quick_actions_more_button hide_quick_actions_playlist_button hide_quick_actions_mix_button hide_quick_actions_more_videos_button hide_quick_actions_ask_button");
def("fullscreen", "overlay", "hide_player_related_videos_overlay");
def("fullscreen", "gesture", "swipe_left_zone swipe_right_zone swipe_seek");
def("fullscreen", "style", "fullscreen_video_scale swipe_overlay_style");

def("feed", "vis", "hide_filter_bar_in_feed hide_video_thumbnail hide_seekbar_thumbnail hide_view_count hide_upload_time hide_shorts_home hide_community_posts hide_mix_playlists hide_live_streams hide_youtube_doodles");
def("feed", "layout", "feed_card_layout");

def("shorts", "vis", "hide_shorts_like_button hide_shorts_comments_button hide_shorts_share_button hide_shorts_remix_button hide_shorts_sound_button hide_shorts_save_button hide_shorts_channel_bar hide_shorts_subscribe_button hide_shorts_join_button hide_shorts_video_title hide_shorts_sound_metadata_label hide_shorts_location_label hide_shorts_full_video_link_label hide_shorts_info_panel hide_shorts_tagged_products hide_shorts_shop_button hide_shorts_use_template_button hide_shorts_effect_button hide_shorts_green_screen_button hide_shorts_hashtag_button hide_shorts_super_thanks_button hide_shorts_ai_button hide_shorts_preview_comment hide_shorts_navigation_bar hide_shorts_use_sound_button");
def("shorts", "gesture", "disable_shorts_double_tap_to_like");

def("nav", "vis", "hide_navigation_bar hide_home_button hide_shorts_button hide_create_button hide_subscriptions_button hide_notifications_button hide_navigation_button_labels show_search_button show_settings_button show_watch_later_button hide_navigation_new_content_dot");
def("nav", "vis", "hide_toolbar_create_button hide_toolbar_notification_button hide_toolbar_search_button hide_toolbar_chat_button show_toolbar_settings_button");
def("nav", "layout", "swap_create_with_notifications_button header_logo");
def("nav", "style", "narrow_navigation_buttons navigation_bar_style");

def("comments", "vis", "hide_comments_filter_bar_options hide_comments_ai_chat_summary hide_comments_community_guidelines hide_comments_channel_guidelines hide_comments_emoji_button hide_comments_timestamp_button hide_comments_gif_button hide_comments_thanks_button hide_comments_create_a_short_button hide_comments_dislike_button hide_comments_translate_button hide_comments_menu_button hide_comments_gift_button hide_comments_info_button");

def("flyout", "vis", "hide_player_flyout_quality hide_player_flyout_captions hide_player_flyout_speed hide_player_flyout_sleep_timer hide_player_flyout_loop_video hide_player_flyout_ambient_mode hide_player_flyout_lock_screen hide_player_flyout_stable_volume hide_player_flyout_audio_track hide_player_flyout_listen_with_youtube_music hide_player_flyout_watch_in_vr hide_player_flyout_on_the_go hide_player_flyout_additional_settings hide_player_flyout_help pip_button_flyout video_delay_button_flyout");

def("captions", "style", "caption_scale secondary_caption_language");
def("captions", "behaviour", "stable_caption_blocks");
def("captions", "vis", "captions_in_pip");

def("miniplayer", "layout", "miniplayer_type");
def("miniplayer", "vis", "miniplayer_hide_title miniplayer_hide_overlay_buttons hide_notification_media_prev_next disable_notification_media_seekbar");
def("miniplayer", "style", "miniplayer_disable_rounded_corners miniplayer_opacity miniplayer_width_dip");

// Stock (unpatched YouTube) value overrides, where "false" is not stock.
const STOCK = {
  morphe_seekbar_thumbnail_preview: true,
  morphe_swap_create_with_notifications_button: false,
  morphe_autoplay_mode: "AUTO",
  morphe_miniplayer_type: "DEFAULT",
  morphe_player_overlay_opacity: 100,
  morphe_player_control_buttons_background_opacity: 30,
  morphe_caption_scale: 100,
  morphe_secondary_caption_language: "off",
  morphe_fullscreen_video_scale: "DEFAULT",
  morphe_video_action_bar_layout: "DEFAULT",
  morphe_feed_card_layout: "DEFAULT",
  morphe_header_logo: "DEFAULT",
  morphe_navigation_bar_style: "DEFAULT",
  morphe_miniplayer_opacity: 100,
  morphe_miniplayer_width_dip: 192,
  morphe_swipe_left_zone: "OFF",
  morphe_swipe_right_zone: "OFF",
};

const KIND_ICON = { vis: "eye", overlay: "layers", gesture: "gesture", layout: "layout", style: "palette", behaviour: "loop", fallback: "list" };
const KIND_NAME = { vis: "VisibilityPreview", overlay: "OverlayPreview", gesture: "GesturePreview", layout: "LayoutPreview", style: "StylePreview", behaviour: "BehaviourPreview", fallback: "FallbackPreference" };

// ------------------------------------------------------------------ state
let CAT, PREF = {}, state = {}, mode = "mod", section = "player", selected = null, showSlots = true;
const ghosts = new Set();
const LS = "morphe-visual-editor-v1";
const store = {
  load() { try { return JSON.parse(localStorage.getItem(LS) || "{}"); } catch { return {}; } },
  save() { try { localStorage.setItem(LS, JSON.stringify({ state: changedOnly(), section, slots: showSlots })); } catch { /* storage unavailable */ } },
};

function initialValue(p) {
  let d = p.default;
  const vals = (p.entries || []).map(e => e.value);
  if (p.type === "boolean") return d === true;
  if (p.type === "integer" || p.type === "long" || p.type === "float") {
    if (typeof d === "number") return d;
    if (vals.length) return Number(vals[0]);
    return 0;
  }
  if (p.type === "enum") {
    if (vals.length && !vals.includes(d)) return vals[0];
    return d;
  }
  return d ?? "";
}
const defaults = {};
function changedOnly() { const o = {}; for (const k in state) if (JSON.stringify(state[k]) !== JSON.stringify(defaults[k])) o[k] = state[k]; return o; }

const ad = k => A[k];
const isHideKey = k => /(^|_)hide_|^morphe_disable_/.test(k) && !/^morphe_disable_.*(gesture|double_tap)/.test(k);
function stockOf(k) {
  if (k in STOCK) return STOCK[k];
  const p = PREF[k];
  if (!p) return false;
  if (p.type === "boolean") return false;
  return defaults[k];
}
const V = k => (mode === "orig" ? stockOf(k) : state[k]);
function shown(k) { const v = V(k); return isHideKey(k) ? !v : !!v; }
function parentsOk(k) {
  const p = PREF[k]; if (!p || !p.parents || !p.parents.length) return true;
  const any = p.parents.filter(x => x.mode === "any");
  const rest = p.parents.filter(x => x.mode !== "any");
  const okRest = rest.every(x => x.mode === "not" ? !state[x.key] : !!state[x.key]);
  const okAny = !any.length || any.some(x => !!state[x.key]);
  return okRest && okAny;
}
const title = k => {
  const p = PREF[k]; if (!p) return k;
  const t = p.title || k.replace(/^morphe_/, "").replace(/_/g, " ");
  // Some Morphe titles only make sense inside their sub-screen ("Hide in feeds" under "Filter bar").
  return /^(hide|show) in /i.test(t) && p.subScreenTitle ? `${p.subScreenTitle}: ${t.charAt(0).toLowerCase()}${t.slice(1)}` : t;
};
function entryLabel(k, v) { const e = (PREF[k]?.entries || []).find(x => String(x.value) === String(v)); return e ? e.label : String(v); }

// ------------------------------------------------------------------ component helper
// C(key, inner, {blk, cls, style, tag}) wraps a component so it can be selected, ghosted or hidden.
function C(k, inner, o = {}) {
  const full = "morphe_" + k;
  const a = ad(full);
  const cls = ["c"];
  if (o.blk) cls.push("blk");
  if (o.cls) cls.push(o.cls);
  if (a && (a.kind === "vis" || a.kind === "overlay") && !shown(full)) cls.push("off");
  if (ghosts.has(full)) cls.push("ghost");
  if (selected === full) cls.push("sel");
  return `<${o.tag || "div"} class="${cls.join(" ")}" data-k="${full}" data-label="${esc(title(full))}" style="${o.style || ""}">${inner}</${o.tag || "div"}>`;
}
const pb = (k, icon, o = {}) => C(k, `<div class="pbtn ${o.bg ? "ctrlbg" : ""}" style="${o.s ? `width:${o.s}px;height:${o.s}px` : ""}">${icon}</div>`, o);

// ------------------------------------------------------------------ scenes
const SCENES = {};

function videoFrame(i = 0, extra = "") {
  return `<div class="frame" style="background:${ART[i]}"></div>${extra}`;
}

SCENES.player = () => {
  const bgHidden = !!V("morphe_hide_player_control_buttons_background");
  const bgOp = bgHidden ? 0 : (Number(V("morphe_player_control_buttons_background_opacity")) / 100);
  const op = Number(V("morphe_player_overlay_opacity")) / 100;
  const qual = `<span class="badge-txt">HD</span>`;
  const custom = [
    ["copy_video_link_button", I("link")], ["playback_speed_dialog_button", I("speed")], ["video_quality_dialog_button", qual],
    ["loop_video_button", I("loop")], ["mute_video_button", I("vol")], ["pip_button_overlay", I("pip")], ["reload_video_button", I("reload")],
    ["save_to_watch_later_button", I("clock")], ["playlist_panel_button", I("plist")], ["play_all_button", I("queue")],
    ["fullscreen_video_scale_button", I("crop")], ["video_delay_button_overlay", `<span class="badge-txt">ms</span>`], ["external_downloader_overlay_button", I("dl")],
  ].map(([k, ic]) => C(k, `<div class="pbtn" style="width:32px;height:32px">${ic}</div>`, { cls: "mini" })).join("");
  return `<div class="video" style="--ctrl-bg:${bgOp}">
    ${videoFrame(0)}
    <div class="scrim" style="opacity:${op}"></div>
    <div style="position:absolute;inset:0;opacity:${Math.max(op, .08)}">
      <div style="position:absolute;left:6px;top:6px">${pb("hide_collapse_button", I("down"))}</div>
      <div style="position:absolute;right:6px;top:6px;display:flex;gap:2px;align-items:center">
        ${C("hide_autoplay_button", `<div class="pbtn" style="width:48px"><div class="toggle-auto">${I("play")}</div></div>`)}
        ${pb("hide_captions_button", I("cc"))}${pb("hide_cast_button", I("cast"))}${pb("hide_settings_button", I("gear"))}
      </div>
      ${C("hide_player_control_buttons_background", `<div style="display:flex;gap:28px;align-items:center">
          ${pb("hide_player_previous_next_buttons", I("prev"), { bg: 1 })}
          <div class="pbtn ctrlbg bigbtn">${I("pause")}</div>
          ${pb("hide_player_previous_next_buttons", I("next"), { bg: 1 })}
        </div>`, { style: "position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);padding:4px;border-radius:40px" })}
      <div style="position:absolute;right:6px;bottom:18px;display:flex;flex-wrap:wrap-reverse;justify-content:flex-end;gap:2px;max-width:330px;align-items:center">${custom}${pb("hide_fullscreen_button", I("full"))}</div>
      <div class="time" style="position:absolute;left:12px;bottom:24px">3:12 / 18:42</div>
      <div class="seek" style="bottom:10px"><div class="buf" style="width:40%"></div><div class="played" style="width:17%"></div><div class="knob" style="left:17%"></div></div>
    </div>
  </div>`;
};

SCENES.endscreen = () => {
  const auto = V("morphe_autoplay_mode");
  const card = (i) => `<div style="display:flex;gap:6px;align-items:center;background:rgba(0,0,0,.55);border-radius:6px;padding:4px;width:150px">${thumb(i, "width:64px;flex:none;border-radius:4px")}<div class="t2" style="color:#fff;font-size:10.5px;line-height:1.25">${esc(VIDEOS[i].t.slice(0, 38))}…</div></div>`;
  const upnext = auto === "AUTO"
    ? C("hide_autoplay_preview", `<div style="width:140px;background:rgba(0,0,0,.6);border-radius:8px;padding:6px">
        <div style="font-size:10px;color:#ddd;margin-bottom:4px">Up next in <b style="color:#fff" class="cd">5</b></div>${thumb(3, "border-radius:6px")}
        <div style="font-size:10.5px;margin-top:4px;line-height:1.25">${esc(VIDEOS[3].t)}</div>
        <div style="display:flex;gap:6px;margin-top:6px"><span class="chip" style="height:22px;font-size:10.5px;padding:0 8px">Cancel</span><span class="chip" style="height:22px;font-size:10.5px;padding:0 8px;background:#fff;color:#000">Play now</span></div></div>`, { cls: "upnext" })
    : C("hide_end_screen_suggested_video", `<div style="width:140px;background:rgba(0,0,0,.6);border-radius:8px;padding:6px">
        <div style="font-size:10px;color:#ddd;margin-bottom:4px">You may also like</div>${thumb(5, "border-radius:6px")}
        <div style="font-size:10.5px;margin-top:4px;line-height:1.25">${esc(VIDEOS[5].t)}</div></div>`);
  return `<div class="video">
    ${videoFrame(1)}<div class="scrim" style="background:rgba(0,0,0,.35)"></div>
    <div style="position:absolute;left:8px;top:8px">${C("hide_end_screen_store_banner", `<div class="chip" style="height:24px;font-size:11px;background:rgba(0,0,0,.65)">${I("shop")} Official store · 4 items</div>`)}</div>
    <div style="position:absolute;right:8px;top:8px">${C("hide_info_cards", `<div class="pbtn" style="width:28px;height:28px;background:rgba(0,0,0,.5)">${I("info")}</div>`)}</div>
    <div style="position:absolute;left:10px;top:44px">${C("hide_end_screen_cards", `<div style="display:grid;gap:6px">${card(1)}${card(2)}</div>`)}</div>
    <div style="position:absolute;right:10px;top:42px">${upnext}</div>
    <div style="position:absolute;right:10px;bottom:10px">${C("hide_channel_watermark", `<div style="opacity:.8">${av(2, 26)}</div>`)}</div>
    <div class="seek" style="bottom:4px"><div class="played" style="width:100%"></div></div>
  </div>`;
};

SCENES.seekbar = () => {
  const custom = V("morphe_seekbar_custom_color");
  const c1 = custom ? V("morphe_seekbar_custom_color_primary") : "#ff0033";
  const c2 = custom ? V("morphe_seekbar_custom_color_accent") : "#ff0033";
  const seekStyle = custom ? `--seek-1:${c1};` : "";
  return `<div class="video" style="${seekStyle}">
    ${videoFrame(3)}<div class="scrim" style="opacity:.35"></div>
    <div style="position:absolute;left:50%;top:10px;transform:translateX(-50%)">${C("hide_player_gesture_hints", `<div class="toastin" style="position:static;transform:none">Pull up for precise seeking</div>`)}</div>
    <div class="pbtn bigbtn" style="position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);background:rgba(0,0,0,.3)">${I("play")}</div>
    <div id="thumbBubble" style="position:absolute;left:calc(12px + 0.42 * (100% - 24px));bottom:40px;transform:translateX(-50%)">${C("seekbar_thumbnail_preview", `<div style="width:96px">${thumb(4, "border-radius:4px;border:2px solid #fff")}<div class="time" style="text-align:center;margin-top:2px">7:51</div></div>`)}</div>
    ${C("hide_timestamp", `<div class="time">3:12 / 18:42</div>`, { style: "position:absolute;left:12px;bottom:22px" })}
    ${C("hide_seekbar", `<div class="seek" id="seek" style="position:relative;left:0;right:0;height:4px;${custom ? `background:linear-gradient(90deg,rgba(255,255,255,.3),rgba(255,255,255,.3))` : ""}">
        <div class="buf" style="width:55%"></div><div class="played" id="played" style="width:17%;${custom ? `background:linear-gradient(90deg,${c1},${c2})` : ""};transition:width .35s"></div>
        <div class="knob" id="knob" style="left:17%;transition:left .35s;${custom ? `background:${c2}` : ""}"></div></div>`, { style: "position:absolute;left:12px;right:12px;bottom:10px;padding:6px 0" })}
    <div id="film" style="position:absolute;left:0;right:0;bottom:30px;display:none;gap:3px;padding:0 12px;justify-content:center">${[0, 1, 2, 3, 4].map(i => thumb(i + 1, "width:58px;border-radius:3px")).join("")}</div>
    <div class="finger" id="finger"></div>
  </div>`;
};

SCENES.watch = () => {
  const layout = V("morphe_video_action_bar_layout");
  const minimal = layout === "MINIMAL";
  const two = layout === "CLASSIC_TWO_ROWS";
  const act = (k, icon, label) => C(k, `<div class="chip" ${minimal ? 'style="padding:0 9px"' : ""}>${I(icon)}${minimal ? "" : label}</div>`);
  const likeChip = C("hide_like_dislike_button", `<div class="chip likechip" style="padding:0;gap:0"><span style="display:flex;gap:6px;align-items:center;padding:0 10px 0 12px;border-right:1px solid #444">${I("like")}${minimal ? "" : "48K"}</span><span style="padding:0 12px;display:flex">${I("dislike")}</span></div>`);
  const actions = [likeChip, act("hide_share_button", "share", "Share"), act("hide_remix_button", "remix", "Remix"), act("hide_thanks_button", "dollar", "Thanks"),
    act("hide_download_button", "dl", "Download"), act("hide_clip_button", "clip", "Clip"), act("hide_save_button", "save", "Save"), act("hide_ask_button", "spark", "Ask"),
    act("hide_hype_button", "fire", "Hype"), act("hide_shop_button", "shop", "Shop"), act("hide_promote_button", "speed", "Promote"), act("hide_stop_ads_button", "close", "Stop ads"),
    act("hide_report_button", "flag", "Report"), act("hide_more_button", "moreh", "")].join("");
  const rowStyle = two ? "display:flex;flex-wrap:wrap;gap:8px" : "display:flex;gap:8px;overflow-x:auto;scrollbar-width:none";
  return `<div style="background:#0f0f0f;height:330px;overflow-y:auto;scrollbar-width:thin" class="inner-scroll">
    <div style="height:96px;position:relative">${videoFrame(0)}<div class="seek" style="bottom:0;left:0;right:0;border-radius:0"><div class="played" style="width:30%"></div></div></div>
    <div style="padding:10px 12px 0">
      <div style="font-size:17px;font-weight:500;line-height:1.3">${esc(VIDEOS[0].t)}</div>
      <div class="t2" style="margin-top:4px">${VIDEOS[0].v} · ${VIDEOS[0].a} <b style="color:#fff">...more</b></div>
    </div>
    ${C("hide_channel_bar", `<div style="display:flex;align-items:center;gap:10px;padding:10px 12px">${av(0, 32)}<div style="flex:1;min-width:0"><span class="t1">${VIDEOS[0].c}</span> <span class="t2">412K</span></div>
      ${C("hide_join_membership_button", `<div class="chip" style="background:transparent;border:1px solid #555">Join</div>`)}
      <div class="chip" style="background:#f1f1f1;color:#0f0f0f">Subscribe</div></div>`)}
    ${C("hide_action_bar", `<div style="${rowStyle};padding:0 12px 10px">${actions}</div>`)}
    ${C("hide_comments_section", `<div style="margin:0 12px 10px;background:#272727;border-radius:12px;padding:10px 12px">
        <div class="t1">Comments <span class="t2">1.2K</span></div>
        ${C("hide_comments_preview_comment", `<div style="display:flex;gap:8px;margin-top:8px;align-items:center">${av(4, 24)}<div class="t2" style="color:#ddd;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">The wood stove at 12:04 is pure cosiness</div></div>`)}
      </div>`, { blk: 1 })}
    ${C("hide_info_panels", `<div style="margin:0 12px 10px;border:1px solid #333;border-radius:12px;padding:10px 12px;display:flex;gap:10px">${I("info", "ico", 'style="fill:#aaa;flex:none"')}<div><div class="t1" style="font-size:13px">Norway · Context</div><div class="t2">Norway is a Nordic country in Northern Europe. Wikipedia</div></div></div>`, { blk: 1 })}
    ${C("hide_player_related_videos", `<div style="padding:0 12px 12px;display:grid;gap:10px">${[2, 3].map(i => `<div style="display:flex;gap:10px">${thumb(i, "width:150px;flex:none")}<div style="min-width:0"><div class="t1" style="font-size:13px">${esc(VIDEOS[i].t)}</div><div class="t2">${VIDEOS[i].c} · ${VIDEOS[i].v}</div></div></div>`).join("")}</div>`, { blk: 1 })}
  </div>`;
};

SCENES.fullscreen = () => {
  const scale = V("morphe_fullscreen_video_scale");
  const vstyle = scale === "STRETCH" ? "left:0;right:0;top:0;bottom:0" : scale === "ZOOM" ? "left:-12%;right:-12%;top:-12%;bottom:-12%" : "left:9%;right:9%;top:0;bottom:0";
  const q = (k, ic, label) => C(k, `<div class="chip" style="height:26px;font-size:11px;padding:0 9px;background:rgba(255,255,255,.14)">${I(ic)}${label}</div>`);
  return `<div class="video" style="background:#000">
    <div class="frame" style="${vstyle};position:absolute;background:${ART[6]}"></div>
    <div class="scrim" style="opacity:.4"></div>
    ${C("hide_video_title", `<div style="font-size:13px;font-weight:500;max-width:240px;line-height:1.25">${esc(VIDEOS[2].t)}</div>`, { style: "position:absolute;left:12px;top:10px" })}
    <div style="position:absolute;right:8px;top:4px;display:flex">${I("cc", "ico", 'style="margin:8px 6px"')}${I("gear", "ico", 'style="margin:8px 6px"')}</div>
    <div class="pbtn bigbtn" style="position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);background:rgba(0,0,0,.3)">${I("pause")}</div>
    ${C("hide_player_related_videos_overlay", `<div style="display:flex;gap:6px;padding:6px 8px;background:linear-gradient(transparent,rgba(0,0,0,.8))"><div class="t2" style="color:#fff;writing-mode:vertical-rl;transform:rotate(180deg);font-size:10px">More videos</div>${[1, 4, 5].map(i => `<div style="width:96px">${thumb(i, "border-radius:4px")}<div style="font-size:9.5px;line-height:1.2;margin-top:2px">${esc(VIDEOS[i].t.slice(0, 30))}…</div></div>`).join("")}</div>`, { cls: "moreoverlay", style: "position:absolute;left:0;right:0;bottom:46px" })}
    <div class="time" style="position:absolute;left:12px;bottom:30px">21:40 / 41:05</div>
    <div class="seek" style="bottom:24px"><div class="played" style="width:52%"></div><div class="knob" style="left:52%"></div></div>
    ${C("hide_quick_actions", `<div style="display:flex;gap:5px;overflow:hidden">
      ${q("hide_quick_actions_like_button", "like", "120K")}${q("hide_quick_actions_dislike_button", "dislike", "")}${q("hide_quick_actions_comments_button", "comment", "1.4K")}
      ${q("hide_quick_actions_save_button", "save", "")}${q("hide_quick_actions_share_button", "share", "")}${q("hide_quick_actions_playlist_button", "plist", "")}
      ${q("hide_quick_actions_mix_button", "queue", "")}${q("hide_quick_actions_more_videos_button", "tv", "")}${q("hide_quick_actions_ask_button", "spark", "")}${q("hide_quick_actions_more_button", "moreh", "")}</div>`, { style: "position:absolute;left:10px;right:10px;bottom:-1px;height:24px" })}
    <div id="hud" style="position:absolute;display:none;z-index:31"></div>
    <div class="finger" id="finger"></div>
  </div>`;
};

SCENES.feed = () => {
  const layout = V("morphe_feed_card_layout");
  const cards = layout === "CARDS" || layout === "CARDS_WITH_ACTION_BUTTONS";
  const actions = layout === "CARDS_WITH_ACTION_BUTTONS";
  const vcard = (i, opts = {}) => {
    const progress = C("hide_seekbar_thumbnail", `<div style="height:3px;background:rgba(255,255,255,.3)"><div style="height:3px;width:${opts.prog || 0}%;background:#ff0033"></div></div>`, { style: "position:absolute;left:0;right:0;bottom:0" });
    const tn = C("hide_video_thumbnail", `<div style="position:relative">${thumb(i, cards ? "border-radius:12px 12px 0 0" : "border-radius:0", `<span class="dur">${VIDEOS[i].d}</span>${opts.prog ? progress : ""}`)}</div>`, { blk: 1 });
    const meta = `<div style="display:flex;gap:10px;padding:10px 12px 12px">${av(i, 34)}<div style="flex:1;min-width:0"><div class="t1">${esc(VIDEOS[i].t)}</div>
      <div class="t2" style="display:flex;flex-wrap:wrap;gap:0 4px;margin-top:2px"><span>${VIDEOS[i].c}</span>${C("hide_view_count", `<span>· ${VIDEOS[i].v}</span>`, { tag: "span" })}${C("hide_upload_time", `<span>· ${VIDEOS[i].a}</span>`, { tag: "span" })}</div></div>${I("more", "ico", 'style="width:18px;height:18px;flex:none"')}</div>`;
    const acts = actions ? `<div style="display:flex;gap:6px;padding:0 12px 12px">${["like", "share", "save"].map(n => `<span class="chip" style="height:28px">${I(n)}</span>`).join("")}</div>` : "";
    return `<div style="${cards ? "margin:0 10px 12px;background:#1c1c1c;border-radius:12px;overflow:hidden" : "margin-bottom:6px"}">${tn}${meta}${acts}</div>`;
  };
  return `<div style="background:#0f0f0f;height:350px;overflow-y:auto;scrollbar-width:thin" class="inner-scroll">
    ${C("hide_youtube_doodles", `<div style="margin:8px 12px 0;padding:8px 12px;border-radius:10px;background:linear-gradient(90deg,#2a2a72,#009ffd);font-size:12px;font-weight:500">Today's Doodle: World Science Day</div>`, { blk: 1 })}
    ${C("hide_filter_bar_in_feed", `<div style="display:flex;gap:8px;padding:10px 12px;overflow:hidden">${["All", "Music", "Live", "Gaming", "Podcasts", "Trains"].map((t, i) => `<span class="chip" style="${i === 0 ? "background:#f1f1f1;color:#0f0f0f" : ""}">${t}</span>`).join("")}</div>`, { blk: 1 })}
    ${vcard(0, { prog: 64 })}
    ${C("hide_shorts_home", `<div style="padding:4px 12px 14px"><div style="display:flex;gap:6px;align-items:center;margin-bottom:8px">${I("shorts", "ico", 'style="fill:#ff0033"')}<b style="font-size:16px">Shorts</b></div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">${[5, 6, 7].map(i => `<div style="aspect-ratio:9/16;border-radius:8px;background:${ART[i]};position:relative"><div style="position:absolute;left:6px;bottom:6px;right:6px;font-size:11px;font-weight:500">${["Snow in 3 seconds", "Cat vs cucumber", "Tiny pancakes"][i - 5]}</div></div>`).join("")}</div></div>`, { blk: 1 })}
    ${C("hide_community_posts", `<div style="margin:0 12px 14px;border:1px solid #333;border-radius:12px;padding:12px"><div style="display:flex;gap:8px;align-items:center">${av(3, 24)}<span class="t1" style="font-size:13px">Pocket Science</span><span class="t2">· 1 day ago</span></div><div style="font-size:13.5px;margin-top:8px;line-height:1.4">Next week: why ice is slippery. Guess the answer below!</div><div style="display:flex;gap:16px;margin-top:10px" class="t2">${I("like", "ico", 'style="width:18px;height:18px;fill:#aaa"')} 2.1K ${I("comment", "ico", 'style="width:18px;height:18px;fill:#aaa"')} 340</div></div>`, { blk: 1 })}
    ${C("hide_mix_playlists", `<div style="display:flex;gap:10px;padding:0 12px 14px"><div style="width:150px;flex:none;position:relative">${thumb(4)}<div style="position:absolute;right:0;top:0;bottom:0;width:44%;background:rgba(0,0,0,.7);display:grid;place-items:center;border-radius:0 8px 8px 0">${I("queue")}</div></div><div><div class="t1" style="font-size:13px">Mix: Lo-fi beats</div><div class="t2">Midnight Tapes, Nujabes and more</div></div></div>`, { blk: 1 })}
    ${vcard(1)}
    ${C("hide_live_streams", `<div style="position:relative">${vcard(2)}<span style="position:absolute;left:${cards ? 18 : 8}px;top:8px;background:#cc0000;font-size:11px;font-weight:700;padding:1px 5px;border-radius:3px">LIVE</span></div>`, { blk: 1 })}
  </div>`;
};

SCENES.shorts = () => {
  const rb = (k, icon, label) => C(k, `<div style="display:grid;justify-items:center;gap:2px"><div class="pbtn" style="width:44px;height:44px;background:rgba(255,255,255,.12)">${icon}</div><span style="font-size:11px;font-weight:500">${label}</span></div>`);
  return `<div style="position:relative;height:420px;background:${ART[5]};overflow:hidden" id="shortsStage">
    <div style="position:absolute;inset:0;background:linear-gradient(transparent 55%,rgba(0,0,0,.7))"></div>
    <div style="position:absolute;right:10px;top:8px;display:flex;gap:6px">${I("search")}${I("more")}</div>
    <div style="position:absolute;right:6px;bottom:${shown("morphe_hide_shorts_navigation_bar") ? 64 : 14}px;display:grid;gap:10px;justify-items:center">
      ${rb("hide_shorts_like_button", I("like"), "12K")}
      <div style="display:grid;justify-items:center;gap:2px"><div class="pbtn" style="width:44px;height:44px;background:rgba(255,255,255,.12)">${I("dislike")}</div><span style="font-size:11px">Dislike</span></div>
      ${rb("hide_shorts_comments_button", I("comment"), "341")}${rb("hide_shorts_share_button", I("share"), "Share")}${rb("hide_shorts_save_button", I("save"), "Save")}${rb("hide_shorts_remix_button", I("remix"), "Remix")}
      ${C("hide_shorts_sound_button", `<div style="width:34px;height:34px;border-radius:8px;border:2px solid #fff;background:${ART[3]}"></div>`)}
    </div>
    <div style="position:absolute;left:10px;right:70px;bottom:${shown("morphe_hide_shorts_navigation_bar") ? 60 : 12}px;display:grid;gap:6px">
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        ${C("hide_shorts_tagged_products", `<span class="chip" style="height:26px;font-size:11.5px;background:rgba(0,0,0,.5)">${I("shop")} 2 products</span>`)}
        ${C("hide_shorts_shop_button", `<span class="chip" style="height:26px;font-size:11.5px;background:rgba(0,0,0,.5)">${I("shop")} Shop</span>`)}
        ${C("hide_shorts_use_template_button", `<span class="chip" style="height:26px;font-size:11.5px;background:rgba(0,0,0,.5)">Use template</span>`)}
        ${C("hide_shorts_effect_button", `<span class="chip" style="height:26px;font-size:11.5px;background:rgba(0,0,0,.5)">${I("spark")} Effect</span>`)}
        ${C("hide_shorts_green_screen_button", `<span class="chip" style="height:26px;font-size:11.5px;background:rgba(0,0,0,.5)">Green screen</span>`)}
        ${C("hide_shorts_use_sound_button", `<span class="chip" style="height:26px;font-size:11.5px;background:rgba(0,0,0,.5)">${I("music")} Use sound</span>`)}
        ${C("hide_shorts_super_thanks_button", `<span class="chip" style="height:26px;font-size:11.5px;background:rgba(0,0,0,.5)">${I("dollar")} Thanks</span>`)}
        ${C("hide_shorts_ai_button", `<span class="chip" style="height:26px;font-size:11.5px;background:rgba(0,0,0,.5)">${I("spark")} Ask</span>`)}
      </div>
      ${C("hide_shorts_info_panel", `<div style="background:rgba(0,0,0,.5);border-radius:8px;padding:6px 8px;font-size:11px">${I("info", "ico", 'style="width:14px;height:14px;display:inline;vertical-align:-2px"')} Context: Snowflakes form around dust particles.</div>`)}
      ${C("hide_shorts_channel_bar", `<div style="display:flex;align-items:center;gap:8px">${av(5, 30)}<b style="font-size:13px">@tinykitchen</b>
          ${C("hide_shorts_subscribe_button", `<span class="chip" style="height:28px;background:#f1f1f1;color:#0f0f0f">Subscribe</span>`)}
          ${C("hide_shorts_join_button", `<span class="chip" style="height:28px;background:transparent;border:1px solid #fff">Join</span>`)}</div>`)}
      ${C("hide_shorts_video_title", `<div style="font-size:13.5px;line-height:1.3">Tiny pancakes for a tiny breakfast ${C("hide_shorts_hashtag_button", `<span style="color:#9ecbff">#cooking</span>`, { tag: "span" })}</div>`)}
      ${C("hide_shorts_preview_comment", `<div style="font-size:11.5px;color:#ddd;display:flex;gap:6px;align-items:center">${av(1, 18)}"I need these in my life"</div>`)}
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        ${C("hide_shorts_sound_metadata_label", `<span style="font-size:11.5px">${I("music", "ico", 'style="width:14px;height:14px;display:inline;vertical-align:-3px"')} Original sound · tinykitchen</span>`, { tag: "span" })}
        ${C("hide_shorts_location_label", `<span style="font-size:11.5px">📍 Lisbon</span>`, { tag: "span" })}
        ${C("hide_shorts_full_video_link_label", `<span style="font-size:11.5px">${I("play", "ico", 'style="width:14px;height:14px;display:inline;vertical-align:-3px"')} Full video</span>`, { tag: "span" })}
      </div>
    </div>
    ${C("hide_shorts_navigation_bar", navBarStatic(), { style: "position:absolute;left:0;right:0;bottom:0" })}
    <div id="heart" style="position:absolute;left:50%;top:40%;transform:translate(-50%,-50%) scale(0);transition:transform .25s;z-index:30">${I("heart", "ico", 'style="width:80px;height:80px;fill:#ff0033"')}</div>
    <div class="finger" id="finger"></div>
  </div>`;
};

function navBar(plain) {
  const swap = !!V("morphe_swap_create_with_notifications_button");
  const narrow = !!V("morphe_narrow_navigation_buttons");
  const style = V("morphe_navigation_bar_style");
  const bg = plain ? "rgba(15,15,15,.96)" : style === "TRANSLUCENT" ? "rgba(15,15,15,.7)" : style === "TRANSPARENT" ? "transparent" : style === "OPAQUE" ? "#000" : "#0f0f0f";
  const lab = t => C("hide_navigation_button_labels", `<span style="font-size:10px">${t}</span>`, { tag: "span" });
  const tab = (k, icon, t, extra = "") => C(k, `<div style="display:grid;justify-items:center;gap:2px;padding:0 6px;position:relative">${icon}${lab(t)}${extra}</div>`);
  const dot = C("hide_navigation_new_content_dot", `<span style="position:absolute;right:10px;top:-1px;width:7px;height:7px;border-radius:50%;background:#ff0033;display:block"></span>`, { tag: "span", style: "position:absolute;inset:0;pointer-events:auto" });
  const center = swap
    ? tab("hide_notifications_button", I("bell"), "Notifications")
    : C("hide_create_button", `<div style="width:40px;height:40px;border-radius:50%;border:1.5px solid #fff;display:grid;place-items:center">${I("plus")}</div>`);
  return `<div style="display:flex;justify-content:${narrow ? "center" : "space-around"};gap:${narrow ? 8 : 0}px;align-items:center;height:52px;background:${bg};border-top:1px solid #222">
    ${tab("hide_home_button", I("home"), "Home")}${tab("hide_shorts_button", I("shorts"), "Shorts")}${center}
    ${tab("hide_subscriptions_button", I("subs"), "Subscriptions", dot)}
    ${tab("show_search_button", I("search"), "Search")}${tab("show_watch_later_button", I("clock"), "Watch later")}${tab("show_settings_button", I("gear"), "Settings")}
    <div style="display:grid;justify-items:center;gap:2px;padding:0 6px">${av(6, 24)}${lab("You")}</div>
  </div>`;
}

SCENES.nav = () => {
  const logo = V("morphe_header_logo");
  const logoTxt = logo === "PREMIUM" ? "Premium" : logo === "MORPHE" ? "Morphe" : "YouTube";
  const swap = !!V("morphe_swap_create_with_notifications_button");
  const tb = (k, icon) => C(k, `<div class="pbtn">${icon}</div>`);
  return `<div style="background:#0f0f0f;height:330px;position:relative;overflow:hidden">
    <div style="display:flex;align-items:center;padding:6px 6px 6px 12px;gap:2px">
      ${C("header_logo", `<div style="display:flex;align-items:center;gap:4px"><div style="width:28px;height:20px;border-radius:6px;background:${logo === "MORPHE" ? "#1e5aa8" : "#ff0033"};display:grid;place-items:center">${I("play", "ico", 'style="width:14px;height:14px"')}</div><b style="font-size:17px;letter-spacing:-.4px">${logoTxt}</b></div>`)}
      <div style="flex:1"></div>
      ${I("cast", "ico", 'style="margin:0 8px"')}${tb("hide_toolbar_chat_button", I("chat"))}
      ${swap ? tb("hide_toolbar_create_button", I("plus")) : tb("hide_toolbar_notification_button", I("bell"))}
      ${tb("hide_toolbar_search_button", I("search"))}${tb("show_toolbar_settings_button", I("gear"))}
    </div>
    <div style="display:flex;gap:8px;padding:4px 12px 10px">${["All", "New to you", "Music"].map((t, i) => `<span class="chip" style="${i === 0 ? "background:#f1f1f1;color:#0f0f0f" : ""}">${t}</span>`).join("")}</div>
    ${thumb(2, "border-radius:0")}
    <div style="display:flex;gap:10px;padding:10px 12px">${av(2, 34)}<div><div class="t1">${esc(VIDEOS[2].t)}</div><div class="t2">${VIDEOS[2].c} · ${VIDEOS[2].v}</div></div></div>
    ${C("hide_navigation_bar", navBar(false), { style: "position:absolute;left:0;right:0;bottom:0" })}
  </div>`;
};

SCENES.comments = () => {
  const cm = (i, name, txt, likes) => `<div style="display:flex;gap:10px;padding:10px 12px">${av(i, 28)}<div style="flex:1;min-width:0">
    <div class="t2">@${name} · 2d</div><div style="font-size:13.5px;line-height:1.4;margin-top:2px">${txt}</div>
    ${C("hide_comments_translate_button", `<div style="font-size:12px;color:#3ea6ff;margin-top:4px">Translate to English</div>`)}
    <div style="display:flex;gap:16px;align-items:center;margin-top:6px" class="t2">${I("like", "ico", 'style="width:16px;height:16px;fill:#aaa"')}${likes}
      ${C("hide_comments_dislike_button", I("dislike", "ico", 'style="width:16px;height:16px;fill:#aaa"'))}${I("comment", "ico", 'style="width:16px;height:16px;fill:#aaa"')}
      ${C("hide_comments_gift_button", I("gift", "ico", 'style="width:16px;height:16px;fill:#aaa"'))}</div></div>
    ${C("hide_comments_menu_button", I("more", "ico", 'style="width:18px;height:18px"'))}</div>`;
  return `<div style="background:#0f0f0f;height:350px;position:relative;overflow:hidden">
    <div style="height:60px;position:relative">${videoFrame(0)}</div>
    <div style="position:absolute;left:0;right:0;top:44px;bottom:0;background:#212121;border-radius:14px 14px 0 0;overflow-y:auto;scrollbar-width:thin">
      <div style="width:36px;height:4px;border-radius:2px;background:#555;margin:8px auto"></div>
      <div style="display:flex;align-items:center;padding:0 12px 6px;gap:8px"><b style="font-size:16px">Comments</b><span class="t2">1.2K</span><div style="flex:1"></div>
        ${C("hide_comments_info_button", I("info", "ico", 'style="width:20px;height:20px"'))}${I("sort", "ico", 'style="width:20px;height:20px"')}${I("close", "ico", 'style="width:20px;height:20px"')}</div>
      ${C("hide_comments_filter_bar_options", `<div style="display:flex;gap:8px;padding:2px 12px 8px">${["Top", "Newest", "Timed"].map((t, i) => `<span class="chip" style="height:28px;${i === 0 ? "background:#f1f1f1;color:#0f0f0f" : "background:#3a3a3a"}">${t}</span>`).join("")}</div>`, { blk: 1 })}
      ${C("hide_comments_ai_chat_summary", `<div style="margin:0 12px 8px;padding:8px 10px;border-radius:10px;background:#2c2c3a;font-size:12.5px;line-height:1.4">${I("spark", "ico", 'style="width:14px;height:14px;display:inline;vertical-align:-2px;fill:#b9a3ff"')} Viewers love the wood stove and want a follow-up on the roof.</div>`, { blk: 1 })}
      ${C("hide_comments_community_guidelines", `<div class="t2" style="padding:0 12px 6px">Remember to keep comments respectful and to follow our Community Guidelines</div>`, { blk: 1 })}
      ${C("hide_comments_channel_guidelines", `<div class="t2" style="padding:0 12px 6px">Channel guidelines: no spoilers please</div>`, { blk: 1 })}
      <div style="display:flex;align-items:center;gap:8px;padding:6px 12px 8px">${av(6, 26)}<div style="flex:1;color:#aaa;font-size:13px">Add a comment...</div>
        ${C("hide_comments_emoji_button", I("emoji", "ico", 'style="width:20px;height:20px"'))}${C("hide_comments_timestamp_button", I("clock", "ico", 'style="width:20px;height:20px"'))}
        ${C("hide_comments_gif_button", `<span class="badge-txt">GIF</span>`)}${C("hide_comments_thanks_button", I("dollar", "ico", 'style="width:20px;height:20px"'))}</div>
      ${C("hide_comments_create_a_short_button", `<div style="margin:0 12px 6px"><span class="chip" style="height:28px;background:#3a3a3a">${I("shorts")} Create a Short</span></div>`, { blk: 1 })}
      ${cm(2, "nordiclight", 'The wood stove at <span style="color:#3ea6ff">12:04</span> is pure cosiness', "2.4K")}
      ${cm(5, "carpenter_jo", "Kom igjen! Taket trenger en egen video.", "381")}
    </div>
  </div>`;
};

SCENES.flyout = () => {
  const row = (k, icon, t, val = "") => C(k, `<div style="display:flex;align-items:center;gap:16px;padding:11px 18px">${I(icon)}<span style="flex:1;font-size:14px">${t}</span><span class="t2">${val}</span></div>`, { blk: 1 });
  return `<div style="background:#0f0f0f;height:350px;position:relative;overflow:hidden">
    <div style="height:100px;position:relative">${videoFrame(4)}<div class="scrim" style="opacity:.6"></div></div>
    <div style="position:absolute;left:0;right:0;top:56px;bottom:0;background:#212121;border-radius:14px 14px 0 0;overflow-y:auto;scrollbar-width:thin;padding-bottom:8px">
      <div style="width:36px;height:4px;border-radius:2px;background:#555;margin:8px auto 4px"></div>
      ${row("hide_player_flyout_quality", "tune", "Quality", "Auto (1080p)")}${row("hide_player_flyout_captions", "cc", "Captions", "Off")}
      ${row("hide_player_flyout_speed", "speed", "Playback speed", "Normal")}${row("hide_player_flyout_sleep_timer", "timer", "Sleep timer", "Off")}
      ${row("hide_player_flyout_loop_video", "loop", "Loop video", "Off")}${row("hide_player_flyout_ambient_mode", "bright", "Ambient mode", "On")}
      ${row("hide_player_flyout_lock_screen", "lock", "Lock screen")}${row("hide_player_flyout_stable_volume", "vol", "Stable volume", "On")}
      ${row("hide_player_flyout_audio_track", "music", "Audio track", "English (original)")}${row("pip_button_flyout", "pip", "Picture-in-picture")}
      ${row("video_delay_button_flyout", "clock", "Video delay", "0 ms")}${row("hide_player_flyout_listen_with_youtube_music", "music", "Listen with YouTube Music")}
      ${row("hide_player_flyout_watch_in_vr", "vr", "Watch in VR")}${row("hide_player_flyout_on_the_go", "gesture", "On the go")}
      ${row("hide_player_flyout_additional_settings", "gear", "Additional settings")}${row("hide_player_flyout_help", "help", "Help & feedback")}
    </div>
  </div>`;
};

SCENES.captions = () => {
  const scale = Number(V("morphe_caption_scale")) / 100;
  const sec = V("morphe_secondary_caption_language");
  const fs = (14 * scale).toFixed(1);
  return `<div class="video">${videoFrame(7)}<div class="scrim" style="opacity:.15"></div>
    ${C("caption_scale", `<div style="display:grid;justify-items:center;gap:2px"><span id="capLine" style="background:rgba(8,8,8,.75);padding:2px 6px;font-size:${fs}px;line-height:1.3">the pancake needs to rest for one minute</span>
      ${C("secondary_caption_language", `<span style="background:rgba(8,8,8,.75);padding:2px 6px;font-size:${(fs * .9).toFixed(1)}px;color:#ffe680">${sec && sec !== "off" ? "la panqueca necesita reposar un minuto" : "(no second language)"}</span>`, { tag: "span", cls: sec && sec !== "off" ? "" : "off" })}</div>`, { style: "position:absolute;left:12px;right:12px;bottom:14px;display:flex;justify-content:center" })}
    ${C("captions_in_pip", `<div style="width:110px;position:relative;border-radius:6px;overflow:hidden;border:1px solid #444">${thumb(7, "border-radius:0")}<span style="position:absolute;left:4px;right:4px;bottom:3px;background:rgba(8,8,8,.8);font-size:7.5px;text-align:center">rest for one minute</span></div>`, { style: "position:absolute;right:8px;top:8px" })}
  </div>`;
};

SCENES.miniplayer = () => {
  const type = V("morphe_miniplayer_type");
  const round = !V("morphe_miniplayer_disable_rounded_corners");
  const op = Number(V("morphe_miniplayer_opacity")) / 100;
  const w = Math.max(140, Math.min(260, Number(V("morphe_miniplayer_width_dip")) || 192));
  let mini = "";
  if (type === "DISABLED") mini = `<div class="demo-label" style="top:auto;bottom:66px;left:12px">Miniplayer disabled: closing the player stops the video</div>`;
  else if (type === "DEFAULT" || type === "MINIMAL" || type === "MINIMAL_BAR_2") {
    const minimal = type !== "DEFAULT";
    mini = `<div style="position:absolute;left:0;right:0;bottom:52px;background:#212121;display:flex;align-items:center;gap:10px;padding-right:8px;opacity:${op}">
      <div style="width:${minimal ? 70 : 96}px;flex:none">${thumb(0, "border-radius:0")}</div>
      ${C("miniplayer_hide_title", `<div style="min-width:0"><div style="font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(VIDEOS[0].t)}</div><div class="t2">${VIDEOS[0].c}</div></div>`, { style: "flex:1;min-width:0" })}
      ${C("miniplayer_hide_overlay_buttons", `<div style="display:flex">${I("pause", "ico", 'style="margin:6px"')}${I("close", "ico", 'style="margin:6px"')}</div>`)}
      <div style="position:absolute;left:0;right:0;top:0;height:2px;background:#555"><div style="width:30%;height:2px;background:#ff0033"></div></div></div>`;
  } else {
    mini = `<div style="position:absolute;right:10px;bottom:62px;width:${w}px;opacity:${op}">
      <div style="position:relative;border-radius:${round ? 12 : 0}px;overflow:hidden;box-shadow:0 6px 18px rgba(0,0,0,.6)">${thumb(0, "border-radius:0")}
        ${C("miniplayer_hide_overlay_buttons", `<div style="position:absolute;inset:0;background:rgba(0,0,0,.35);display:flex;justify-content:space-between;padding:4px">${I("full", "ico", 'style="width:18px;height:18px"')}<div style="display:flex;gap:10px;align-self:center">${I("prev", "ico", 'style="width:20px;height:20px"')}${I("pause", "ico", 'style="width:26px;height:26px"')}${I("next", "ico", 'style="width:20px;height:20px"')}</div>${I("close", "ico", 'style="width:18px;height:18px"')}</div>`, { style: "position:absolute;inset:0" })}
      </div>
      ${C("miniplayer_hide_title", `<div style="font-size:11.5px;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(VIDEOS[0].t)}</div>`)}
    </div>`;
  }
  return `<div style="background:#0f0f0f;height:350px;position:relative;overflow:hidden">
    <div style="margin:8px 10px;background:#2b2b2b;border-radius:16px;padding:10px 12px;display:flex;gap:10px;align-items:center">
      <div style="width:40px;height:40px;border-radius:8px;background:${ART[0]};flex:none"></div>
      <div style="flex:1;min-width:0"><div style="font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(VIDEOS[0].t)}</div><div class="t2">YouTube · media notification</div>
        ${C("disable_notification_media_seekbar", `<div style="height:3px;background:#555;border-radius:2px;margin-top:6px"><div style="width:30%;height:3px;background:#fff;border-radius:2px"></div></div>`)}</div>
      <div style="display:flex;align-items:center">${C("hide_notification_media_prev_next", I("prev", "ico", 'style="width:20px;height:20px;margin:4px"'))}${I("pause", "ico", 'style="margin:4px"')}${C("hide_notification_media_prev_next", I("next", "ico", 'style="width:20px;height:20px;margin:4px"'))}</div>
    </div>
    <div style="padding:0 12px">${thumb(3)}<div style="display:flex;gap:10px;padding:10px 0">${av(3, 34)}<div><div class="t1">${esc(VIDEOS[3].t)}</div><div class="t2">${VIDEOS[3].c} · ${VIDEOS[3].v}</div></div></div></div>
    ${mini}
    <div style="position:absolute;left:0;right:0;bottom:0">${navBarStatic()}</div>
  </div>`;
};
function navBarStatic() {
  return `<div style="display:flex;justify-content:space-around;align-items:center;height:52px;background:#0f0f0f;border-top:1px solid #222">${["home", "shorts", "plus", "subs", "you"].map(n => I(n)).join("")}</div>`;
}

// ------------------------------------------------------------------ demos (gesture / behaviour)
let demoTimer = null, demoStep = 0;
function stopDemo() { clearInterval(demoTimer); demoTimer = null; }
function label(text, bad) {
  const st = document.getElementById("stage");
  st.querySelectorAll(".demo-label.dyn").forEach(n => n.remove());
  const d = document.createElement("div");
  d.className = "demo-label dyn" + (bad ? " bad" : "");
  d.textContent = text;
  st.firstElementChild?.appendChild(d);
}
function tapAt(x, y) {
  const f = document.getElementById("finger"); if (!f) return;
  f.style.left = x + "px"; f.style.top = y + "px";
  f.classList.remove("tap"); void f.offsetWidth; f.classList.add("tap");
}
const DEMOS = {
  morphe_tap_to_seek(on) {
    const seek = document.getElementById("seek"); if (!seek) return;
    const st = document.getElementById("stage").getBoundingClientRect(), r = seek.getBoundingClientRect();
    const pct = [72, 30, 55, 88, 12][demoStep % 5];
    tapAt(r.left - st.left + r.width * pct / 100, r.top - st.top + r.height / 2);
    if (on) {
      setTimeout(() => { setSeek(pct); }, 180);
      label(`Tap on seekbar: jumps to ${fmt(18 * 60 + 42, pct)}`);
    } else label("Tap on seekbar: nothing happens. Stock YouTube needs a drag.", true);
  },
  morphe_slide_to_seek(on) {
    const st = document.getElementById("stage"); const f = document.getElementById("finger"); if (!f) return;
    const W = st.clientWidth;
    f.style.transition = "none"; f.style.left = W * .3 + "px"; f.style.top = "90px"; f.style.opacity = "1"; f.style.transform = "translate(-50%,-50%) scale(.7)";
    if (on) {
      label("Press and hold the video, then slide: seeks");
      setTimeout(() => { f.style.transition = "left 1.2s ease-in-out"; f.style.left = W * .7 + "px"; setSeek(60); }, 350);
    } else {
      label("Press and hold the video: plays at 2x speed (stock)", true);
      showPill("2x ▸▸");
    }
    setTimeout(() => { f.style.opacity = "0"; f.style.transition = ""; }, 1900);
  },
  morphe_disable_precise_seeking_gesture(on) {
    const film = document.getElementById("film"); const f = document.getElementById("finger"); if (!film || !f) return;
    const st = document.getElementById("stage");
    f.style.transition = "none"; f.style.left = st.clientWidth * .42 + "px"; f.style.top = st.clientHeight - 40 + "px"; f.style.opacity = "1"; f.style.transform = "translate(-50%,-50%) scale(.7)";
    setTimeout(() => { f.style.transition = "top .7s"; f.style.top = st.clientHeight - 110 + "px"; }, 200);
    if (!on) { setTimeout(() => { film.style.display = "flex"; }, 700); label("Pull up on the seekbar: precise seeking film strip opens"); }
    else label("Pull up on the seekbar: precise seeking stays off", true);
    setTimeout(() => { film.style.display = "none"; f.style.opacity = "0"; f.style.transition = ""; }, 2000);
  },
  morphe_swipe_left_zone(v) { swipeDemo("left", v); },
  morphe_swipe_right_zone(v) { swipeDemo("right", v); },
  morphe_swipe_overlay_style() { swipeDemo("right", state.morphe_swipe_right_zone !== "OFF" ? state.morphe_swipe_right_zone : "VOLUME"); },
  morphe_swipe_seek(on) {
    const st = document.getElementById("stage"); const f = document.getElementById("finger"); if (!f) return;
    f.style.transition = "none"; f.style.left = st.clientWidth * .35 + "px"; f.style.top = "80px"; f.style.opacity = "1"; f.style.transform = "translate(-50%,-50%) scale(.7)";
    setTimeout(() => { f.style.transition = "left 1s"; f.style.left = st.clientWidth * .7 + "px"; }, 250);
    if (on) { label("Swipe sideways in fullscreen: +1:30, release to seek"); showPill("+1:30  ▸▸"); } else label("Swipe sideways: does nothing (stock)", true);
    setTimeout(() => { f.style.opacity = "0"; f.style.transition = ""; }, 1700);
  },
  morphe_disable_shorts_double_tap_to_like(disabled) {
    const st = document.getElementById("stage");
    tapAt(st.clientWidth * .45, 170); setTimeout(() => tapAt(st.clientWidth * .45, 170), 220);
    const h = document.getElementById("heart");
    if (!disabled && h) { setTimeout(() => { h.style.transform = "translate(-50%,-50%) scale(1)"; }, 300); setTimeout(() => { h.style.transform = "translate(-50%,-50%) scale(0)"; }, 1100); label("Double-tap: likes the Short (stock)"); }
    else label("Double-tap: does nothing, no accidental likes", true);
  },
  morphe_autoplay_mode(v) {
    const cd = document.querySelector("#stage .cd");
    if (cd) { let n = 5; cd.textContent = n; const t = setInterval(() => { n--; if (n < 1 || !document.body.contains(cd)) { clearInterval(t); return; } cd.textContent = n; }, 400); }
    label(`Autoplay: ${entryLabel("morphe_autoplay_mode", v)}`, v === "OFF");
  },
  morphe_disable_like_subscribe_glow(disabled) {
    const chip = document.querySelector("#stage .likechip");
    if (chip && !disabled) { chip.animate([{ boxShadow: "0 0 0 0 rgba(62,166,255,.0)" }, { boxShadow: "0 0 14px 4px rgba(62,166,255,.8)" }, { boxShadow: "0 0 0 0 rgba(62,166,255,0)" }], { duration: 1400 }); label("Creator says \"hit like\": button glows (stock)"); }
    else label("Creator says \"hit like\": no glow", true);
  },
  morphe_stable_caption_blocks(on) {
    const line = document.getElementById("capLine"); if (!line) return;
    const words = "the pancake needs to rest for one minute".split(" ");
    if (on) { line.textContent = words.join(" "); line.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300 }); label("Stable blocks: whole sentence appears at once"); }
    else { let i = 0; line.textContent = ""; const t = setInterval(() => { if (!document.body.contains(line) || i >= words.length) { clearInterval(t); return; } line.textContent += (i ? " " : "") + words[i++]; }, 170); label("Word by word: text shifts as it is spoken (stock)"); }
  },
};
function fmt(total, pct) { const s = Math.round(total * pct / 100); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; }
function setSeek(pct) { const p = document.getElementById("played"), k = document.getElementById("knob"); if (p) p.style.width = pct + "%"; if (k) k.style.left = pct + "%"; }
function showPill(text) {
  const st = document.getElementById("stage").firstElementChild; if (!st) return;
  const d = document.createElement("div"); d.className = "toastin"; d.style.top = "14px"; d.textContent = text; st.appendChild(d);
  setTimeout(() => d.remove(), 1600);
}
function swipeDemo(side, action) {
  const st = document.getElementById("stage"); const f = document.getElementById("finger"); const hud = document.getElementById("hud"); if (!f || !hud) return;
  const W = st.clientWidth, H = st.firstElementChild.clientHeight;
  const x = side === "left" ? W * .2 : W * .8;
  f.style.transition = "none"; f.style.left = x + "px"; f.style.top = H * .75 + "px"; f.style.opacity = "1"; f.style.transform = "translate(-50%,-50%) scale(.7)";
  setTimeout(() => { f.style.transition = "top 1.1s ease-in-out"; f.style.top = H * .25 + "px"; }, 200);
  if (!action || action === "OFF") { label(`${side === "left" ? "Left" : "Right"} side swipe: does nothing (off)`, true); hud.style.display = "none"; }
  else {
    const ic = action === "VOLUME" ? "vol" : action === "BRIGHTNESS" ? "bright" : "speed";
    const style = state.morphe_swipe_overlay_style || "HORIZONTAL";
    const circ = style.startsWith("CIRCULAR"), vert = style.startsWith("VERTICAL"), min = style.includes("MINIMAL");
    let inner;
    if (circ) inner = `<div style="width:64px;height:64px;border-radius:50%;background:conic-gradient(#fff var(--p,0%),rgba(255,255,255,.25) 0);display:grid;place-items:center"><div style="width:52px;height:52px;border-radius:50%;background:rgba(0,0,0,.75);display:grid;place-items:center">${I(ic)}</div></div>`;
    else if (vert) inner = `<div style="display:grid;justify-items:center;gap:6px;background:${min ? "transparent" : "rgba(0,0,0,.6)"};padding:8px;border-radius:14px">${I(ic)}<div style="width:6px;height:80px;background:rgba(255,255,255,.25);border-radius:3px;position:relative"><div class="hb" style="position:absolute;bottom:0;left:0;right:0;height:var(--p,0%);background:#fff;border-radius:3px"></div></div></div>`;
    else inner = `<div style="display:flex;align-items:center;gap:8px;background:${min ? "transparent" : "rgba(0,0,0,.6)"};padding:8px 12px;border-radius:18px">${I(ic)}<div style="width:110px;height:5px;background:rgba(255,255,255,.25);border-radius:3px;position:relative"><div style="position:absolute;left:0;top:0;bottom:0;width:var(--p,0%);background:#fff;border-radius:3px"></div></div></div>`;
    hud.innerHTML = inner; hud.style.display = "block";
    if (style === "HORIZONTAL_MINIMAL_TOP") { hud.style.left = "50%"; hud.style.top = "12px"; hud.style.transform = "translateX(-50%)"; }
    else if (vert) { hud.style.left = side === "left" ? "auto" : "14px"; hud.style.right = side === "left" ? "14px" : "auto"; hud.style.top = "50%"; hud.style.transform = "translateY(-50%)"; }
    else { hud.style.left = "50%"; hud.style.right = "auto"; hud.style.top = "50%"; hud.style.transform = "translate(-50%,-50%)"; }
    let p = 20; hud.style.setProperty("--p", p + "%");
    const t = setInterval(() => { p += 8; hud.style.setProperty("--p", Math.min(p, 90) + "%"); if (p > 90) clearInterval(t); }, 110);
    label(`${side === "left" ? "Left" : "Right"} side swipe: ${entryLabel("morphe_swipe_" + side + "_zone", action)}`);
    setTimeout(() => { hud.style.display = "none"; }, 1900);
  }
  setTimeout(() => { f.style.opacity = "0"; f.style.transition = ""; }, 1500);
}
function startDemo(k) {
  stopDemo();
  const fn = DEMOS[k]; if (!fn) return;
  demoStep = 0;
  const run = () => { if (selected !== k) return stopDemo(); fn(V(k)); demoStep++; };
  setTimeout(run, 60);
  demoTimer = setInterval(run, 2600);
}

// ------------------------------------------------------------------ section membership
let MEMBERS = {}; // section id -> {live:[keys], misc:[keys]}
function inScope(p, scopes) { return scopes.some(([s, sub]) => p.screen === s && (p.subScreen || null) === sub); }
function buildMembers() {
  MEMBERS = {};
  SECTIONS.forEach(s => (MEMBERS[s.id] = { live: [], misc: [] }));
  const assigned = new Set();
  for (const k in A) if (PREF[k]) { MEMBERS[A[k].section].live.push(k); assigned.add(k); }
  for (const p of CAT.preferences) {
    if (assigned.has(p.key)) continue;
    const s = SECTIONS.find(s => s.scopes && inScope(p, s.scopes));
    (s ? MEMBERS[s.id].misc : MEMBERS.misc.misc).push(p.key);
  }
}

// ------------------------------------------------------------------ rendering
const $ = id => document.getElementById(id);

function renderTabs() {
  $("tabs").innerHTML = SECTIONS.map(s => {
    const n = s.id === "misc" ? MEMBERS.misc.misc.length : MEMBERS[s.id].live.length;
    return `<button class="tab" role="tab" data-sec="${s.id}" aria-selected="${s.id === section}">${s.title}<span class="n">${n}</span></button>`;
  }).join("");
}

function renderStage() {
  const st = $("stage");
  const scene = SCENES[section];
  $("stick").hidden = !scene;
  if (!scene) { st.innerHTML = ""; return; }
  const scrollers = [...st.querySelectorAll(".inner-scroll")].map(e => e.scrollTop);
  st.className = "stage " + (showSlots ? "slots" : "noslots") + (mode === "orig" ? " original" : "");
  st.innerHTML = scene();
  st.querySelectorAll(".inner-scroll").forEach((e, i) => { if (scrollers[i]) e.scrollTop = scrollers[i]; });
}

function stateChip(k) {
  const a = A[k], p = PREF[k], v = V(k);
  if (p.type === "boolean") {
    if (a && (a.kind === "vis" || a.kind === "overlay")) return shown(k) ? `<span class="state on">Shown</span>` : `<span class="state off">Hidden</span>`;
    return v ? `<span class="state on">On</span>` : `<span class="state">Off</span>`;
  }
  return "";
}
function summaryFor(k) {
  const p = PREF[k]; const v = state[k];
  if (p.type === "boolean") return (v ? p.summaryOn : p.summaryOff) || p.summary || "";
  return p.summary || "";
}

function controlFor(k, compact) {
  const p = PREF[k]; const v = state[k]; const dis = mode === "orig" || !parentsOk(k) ? "disabled" : "";
  if (p.entries && p.entries.length && p.entries.length <= 8 && !compact) {
    return `<div class="ctl">${p.entries.map(e => `<button class="opt" data-set="${k}" data-val="${esc(e.value)}" aria-pressed="${String(e.value) === String(v)}" ${dis}>${esc(e.label)}</button>`).join("")}</div>`;
  }
  if (p.entries && p.entries.length) {
    return `<div class="ctl"><select data-set="${k}" ${dis} aria-label="${esc(title(k))}">${p.entries.map(e => `<option value="${esc(e.value)}" ${String(e.value) === String(v) ? "selected" : ""}>${esc(e.label)}</option>`).join("")}</select></div>`;
  }
  if (p.type === "integer" || p.type === "float" || p.type === "long") {
    const isPct = /opacity|scale|strength|display_area/.test(k);
    if (isPct || /width_dip|radius|blur/.test(k)) {
      const max = /width_dip/.test(k) ? 400 : /caption_scale/.test(k) ? 300 : 100;
      const min = /width_dip/.test(k) ? 100 : /caption_scale/.test(k) ? 50 : 0;
      return `<div class="ctl"><input type="range" min="${min}" max="${max}" step="1" value="${v}" data-set="${k}" ${dis} aria-label="${esc(title(k))}"><span class="val" data-val-of="${k}">${v}</span></div>`;
    }
    return `<div class="ctl"><input type="number" value="${v}" data-set="${k}" ${dis} aria-label="${esc(title(k))}" step="${p.type === "float" ? "0.05" : "1"}"></div>`;
  }
  if (p.type === "string") {
    if (/color/.test(k) && /^#/.test(String(v))) return `<div class="ctl"><input type="color" value="${String(v).slice(0, 7)}" data-set="${k}" ${dis} aria-label="${esc(title(k))}"><span class="val">${esc(v)}</span></div>`;
    if (String(p.default ?? "").includes("\n") || /strings|phrases|speeds|whitelist|filter/.test(k)) return `<div class="ctl"><textarea data-set="${k}" ${dis} aria-label="${esc(title(k))}">${esc(v)}</textarea></div>`;
    return `<div class="ctl"><input type="text" value="${esc(v)}" data-set="${k}" ${dis} aria-label="${esc(title(k))}"></div>`;
  }
  return "";
}

function rowHTML(k, live) {
  const p = PREF[k]; const a = A[k]; const kind = live ? a.kind : "fallback";
  const chg = JSON.stringify(state[k]) !== JSON.stringify(defaults[k]);
  const dis = !parentsOk(k);
  const isBool = p.type === "boolean";
  const info = !p.type || p.type === "screen" || p.widget === "NonInteractivePreference" || p.widget === "IntentPreference";
  let right = "", ctl = "";
  if (live) { right = stateChip(k); if (!isBool) ctl = controlFor(k); }
  else if (isBool) right = `<button class="sw" role="switch" data-sw="${k}" aria-checked="${!!state[k]}" ${dis || mode === "orig" ? "disabled" : ""} aria-label="${esc(title(k))}"></button>`;
  else if (!info) ctl = controlFor(k);
  const cls = ["row", live ? "live" : "fallback"];
  if (selected === k) cls.push("sel");
  if (dis) cls.push("dis");
  if (live && (a.kind === "vis" || a.kind === "overlay") && !shown(k)) cls.push("offstate");
  const sum = info ? (p.summary || (p.type === "screen" ? "Opens a sub-screen in Morphe settings" : "Information")) : summaryFor(k);
  const need = dis ? `<div class="sum" style="color:#f2b84b">Needs: ${p.parents.map(x => (x.mode === "not" ? "“" + title(x.key) + "” off" : "“" + title(x.key) + "” on")).join(", ")}</div>` : "";
  return `<div class="${cls.join(" ")}" data-row="${k}" ${live ? `data-k="${k}"` : ""}>
    <div class="kind" title="${KIND_NAME[kind]}">${I(KIND_ICON[kind])}</div>
    <div class="txt"><div class="ttl">${esc(title(k))}${chg ? '<span class="changed-dot" title="Changed from default"></span>' : ""}${p.rebootApp ? '<span class="reboot">restart</span>' : ""}</div>
      ${sum ? `<div class="sum">${esc(sum)}</div>` : ""}${need}${ctl}</div>${right}</div>`;
}

let miscQuery = "";
function renderList() {
  const m = MEMBERS[section];
  let html = "";
  if (section !== "misc") {
    html += `<div class="sechead">Live view <span>${m.live.length} visual · ${m.misc.length} misc</span></div>`;
    html += m.live.map(k => rowHTML(k, true)).join("");
    if (m.misc.length) {
      html += `<div class="sechead">Misc <span>no visual adapter yet</span></div><div class="secnote">These use their normal Morphe widget. When an adapter is written for one, it moves up into Live view by itself.</div>`;
      html += m.misc.map(k => rowHTML(k, false)).join("");
    }
  } else {
    html += `<div class="search"><svg viewBox="0 0 24 24"><path d="${P.search}"/></svg><input id="miscSearch" placeholder="Search ${m.misc.length} settings" value="${esc(miscQuery)}" aria-label="Search settings"></div>`;
    html += `<div class="secnote" style="padding-top:10px">Every Morphe YouTube preference that no Live view section claims yet, grouped by its original settings screen.</div>`;
    const q = miscQuery.trim().toLowerCase();
    const groups = {};
    for (const k of m.misc) {
      const p = PREF[k];
      if (q && !(`${title(k)} ${k} ${p.summary || ""}`.toLowerCase().includes(q))) continue;
      const g = (p.screenTitle || "Unplaced") + (p.subScreenTitle ? " › " + p.subScreenTitle : "");
      (groups[g] = groups[g] || []).push(k);
    }
    const names = Object.keys(groups).sort();
    if (!names.length) html += `<div class="secnote">No settings match “${esc(miscQuery)}”.</div>`;
    for (const g of names) html += `<div class="grp">${esc(g)} · ${groups[g].length}</div>` + groups[g].map(k => rowHTML(k, false)).join("");
  }
  $("list").innerHTML = html;
  const s = $("miscSearch");
  if (s) s.addEventListener("input", e => { miscQuery = e.target.value; const pos = e.target.selectionStart; renderList(); const n = $("miscSearch"); n.focus(); n.setSelectionRange(pos, pos); });
}

function renderInspector() {
  const k = selected, p = k && PREF[k];
  if (!p) {
    $("selCard").innerHTML = `<h2>Selected</h2><p>Nothing selected. Tap a component in the preview or a row in the list.</p>`;
  } else {
    const a = A[k];
    const src = p.sourceFile ? `<a href="https://github.com/MorpheApp/morphe-patches/blob/main/${esc(p.sourceFile)}" target="_blank" rel="noopener">${esc(p.sourceFile.split("/").pop())}</a>` : "–";
    $("selCard").innerHTML = `<h2>Selected</h2><h3>${esc(title(k))}</h3><p>${esc(p.summary || summaryFor(k) || "")}</p>
      <dl class="kv">
        <dt>Key</dt><dd>${esc(k)}</dd>
        <dt>Adapter</dt><dd><span class="pill">${a ? KIND_NAME[a.kind] : KIND_NAME.fallback}</span></dd>
        <dt>Type</dt><dd>${esc(p.type || p.widget)}${p.rebootApp ? ' · <span style="color:var(--warn)">restarts app</span>' : ""}</dd>
        <dt>Default</dt><dd>${esc(JSON.stringify(defaults[k]))}</dd>
        <dt>Current</dt><dd>${esc(JSON.stringify(state[k]))}</dd>
        <dt>Stock</dt><dd>${esc(JSON.stringify(stockOf(k)))}</dd>
        <dt>Screen</dt><dd>${esc([p.screenTitle, p.subScreenTitle].filter(Boolean).join(" › ") || "–")}</dd>
        <dt>Patch</dt><dd>${esc(p.patch || "(internal)")}</dd>
        <dt>Source</dt><dd>${src}</dd>
        ${p.parents && p.parents.length ? `<dt>Depends on</dt><dd>${p.parents.map(x => esc((x.mode === "not" ? "!" : "") + x.key)).join("<br>")}</dd>` : ""}
      </dl>`;
  }
  const total = CAT.preferences.length;
  const live = Object.keys(A).filter(k => PREF[k]).length;
  const missing = Object.keys(A).filter(k => !PREF[k]);
  $("covCard").innerHTML = `<h2>Coverage</h2>
    <div class="statrow"><div><div class="big">${live}</div><span>visualized</span></div><div><div class="big">${total - live}</div><span>in Misc</span></div><div><div class="big">${total}</div><span>prefs found</span></div></div>
    <div class="cov">${SECTIONS.filter(s => s.id !== "misc").map(s => { const m = MEMBERS[s.id]; const t = m.live.length + m.misc.length; return `<div class="r"><span>${s.title}</span><div class="bar"><i style="width:${t ? (m.live.length / t * 100) : 0}%"></i></div><span class="num">${m.live.length}/${t}</span></div>`; }).join("")}</div>
    <p style="margin-top:12px;font-size:12px">Source: <span style="font-family:var(--mono)">${esc(CAT.source)}</span>${missing.length ? `<br>Adapters without a matching pref: ${missing.length}` : ""}</p>`;
  const ch = changedOnly();
  const n = Object.keys(ch).length;
  $("chgCard").innerHTML = `<h2>Changed settings</h2><p>${n ? `${n} setting${n > 1 ? "s" : ""} differ from Morphe's defaults. Saved in this browser only.` : "All settings are at Morphe's defaults."}</p>
    ${n ? `<pre class="json" id="json">${esc(JSON.stringify(ch, null, 1))}</pre>` : ""}
    <div class="btnrow">${n ? `<button class="btn" id="copyJson">Copy as JSON</button><button class="btn danger" id="resetAll">Reset all</button>` : ""}</div>`;
  const cp = $("copyJson");
  if (cp) cp.onclick = () => { const txt = JSON.stringify(ch, null, 1); navigator.clipboard?.writeText(txt).then(() => snack("Copied changed settings"), () => selectPre()); };
  const rs = $("resetAll");
  if (rs) rs.onclick = () => { const before = { ...state }; Object.assign(state, defaults); commit(); snack("Reset all settings to defaults", () => { Object.assign(state, before); commit(); }); };
}
function selectPre() { const pre = $("json"); if (!pre) return; const r = document.createRange(); r.selectNodeContents(pre); const s = getSelection(); s.removeAllRanges(); s.addRange(r); snack("Press Ctrl+C to copy"); }

function renderAll() { renderTabs(); renderStage(); renderList(); renderInspector(); store.save(); }
function commit() { renderStage(); renderList(); renderInspector(); store.save(); }

// ------------------------------------------------------------------ interactions
let snackTimer = null, undoFn = null;
function snack(msg, undo) {
  $("snackMsg").innerHTML = msg;
  undoFn = undo || null;
  $("snackUndo").hidden = !undo;
  $("snack").classList.add("show");
  clearTimeout(snackTimer);
  snackTimer = setTimeout(() => $("snack").classList.remove("show"), 3200);
}
$("snackUndo").onclick = () => { if (undoFn) undoFn(); undoFn = null; $("snack").classList.remove("show"); };

function select(k, from) {
  selected = k;
  document.querySelectorAll(".sel").forEach(e => e.classList.remove("sel"));
  document.querySelectorAll(`[data-k="${k}"], [data-row="${k}"]`).forEach(e => e.classList.add("sel"));
  renderInspector();
  if (from === "stage") {
    const row = document.querySelector(`[data-row="${k}"]`);
    if (row) {
      const sc = $("scroller"), stickH = $("stick").offsetHeight;
      const top = row.offsetTop - stickH - 8;
      if (row.offsetTop < sc.scrollTop + stickH || row.offsetTop + row.offsetHeight > sc.scrollTop + sc.clientHeight) sc.scrollTo({ top, behavior: "smooth" });
    }
  }
  if (from === "list") {
    const el = document.querySelector(`#stage [data-k="${k}"]`);
    const box = el && el.closest(".inner-scroll");
    if (el && box) { const r = el.getBoundingClientRect(), b = box.getBoundingClientRect(); if (r.top < b.top || r.bottom > b.bottom) box.scrollBy({ top: r.top - b.top - 40, behavior: "smooth" }); }
  }
  const a = A[k];
  if (a && (a.kind === "gesture" || a.kind === "behaviour" || DEMOS[k])) startDemo(k); else stopDemo();
  const notApplicable = a && section === a.section && !document.querySelector(`#stage [data-k="${k}"]`);
  if (notApplicable && SCENES[section]) {
    const why = k === "morphe_hide_end_screen_suggested_video" ? "Appears only when autoplay is off. Set Autoplay mode to Off to see it."
      : k === "morphe_hide_autoplay_preview" ? "Appears only when autoplay is on."
      : /^morphe_miniplayer_/.test(k) ? "Not part of the current miniplayer type." : "Not shown in the current layout.";
    label(why, true);
  }
}

function ghost(k) {
  ghosts.add(k);
  renderStage();
  document.querySelectorAll(`#stage [data-k="${k}"]`).forEach(e => e.classList.add("sel"));
  setTimeout(() => { ghosts.delete(k); renderStage(); }, 1800);
}

function toggle(k) {
  const p = PREF[k];
  if (mode === "orig") { snack("Switch to <b>Modified</b> to change settings"); return; }
  if (!parentsOk(k)) { snack(`Needs ${p.parents.map(x => "“" + esc(title(x.key)) + "”" + (x.mode === "not" ? " off" : " on")).join(", ")}`); return; }
  const before = state[k];
  if (p.type === "boolean") state[k] = !state[k];
  else if (p.entries && p.entries.length) { const vals = p.entries.map(e => e.value); const i = vals.indexOf(String(state[k])); state[k] = coerce(k, vals[(i + 1) % vals.length]); }
  else { snack("Use the control in the list to change this one"); return; }
  commit();
  select(k);
  document.querySelectorAll(`#stage [data-k="${k}"]`).forEach(e => { e.classList.add("flash"); });
  if (navigator.vibrate) try { navigator.vibrate(20); } catch { /* ignore */ }
  const a = A[k];
  const now = p.type === "boolean" ? (a && (a.kind === "vis" || a.kind === "overlay") ? (shown(k) ? "shown" : "hidden") : (state[k] ? "on" : "off")) : entryLabel(k, state[k]);
  snack(`<b>${esc(title(k))}</b>: ${esc(now)}${p.rebootApp ? " · needs app restart" : ""}<br><code>${esc(k)} = ${esc(JSON.stringify(state[k]))}</code>`, () => { state[k] = before; commit(); select(k); });
}
function coerce(k, v) {
  const t = PREF[k].type;
  if (t === "integer" || t === "long" || t === "float") return Number(v);
  if (t === "boolean") return v === true || v === "true";
  return v;
}

// press handling (tap vs long-press), shared by stage and list
let press = null;
const LONG = 480;
function down(e) {
  if (e.button > 0) return;
  if (e.target.closest("input,select,textarea,button.opt,.sw")) return;
  const el = e.target.closest("[data-k]");
  if (!el) return;
  const k = el.dataset.k;
  const from = el.closest("#stage") ? "stage" : "list";
  el.classList.add("pressing");
  press = { el, k, from, x: e.clientX, y: e.clientY, long: false };
  press.t = setTimeout(() => {
    if (!press) return;
    press.long = true; el.classList.remove("pressing");
    toggle(k);
  }, LONG);
}
function cancelPress() { if (press) { clearTimeout(press.t); press.el.classList.remove("pressing"); press = null; } }
function move(e) { if (press && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 10) cancelPress(); }
function up() {
  if (!press) return;
  clearTimeout(press.t); press.el.classList.remove("pressing");
  const { k, from, long } = press; press = null;
  if (long) return;
  const a = A[k];
  if (mode === "mod" && a && (a.kind === "vis" || a.kind === "overlay") && !shown(k) && document.querySelector(`#stage [data-k="${k}"]`)) {
    select(k, from); ghost(k);
    label("Preview only: the setting still hides it");
  } else select(k, from);
}
["stage", "list"].forEach(id => {
  const el = $(id);
  el.addEventListener("pointerdown", down);
  el.addEventListener("pointermove", move);
  el.addEventListener("pointerup", up);
  el.addEventListener("pointercancel", cancelPress);
  el.addEventListener("pointerleave", e => { if (e.target === el) cancelPress(); });
  el.addEventListener("contextmenu", e => { if (e.target.closest("[data-k]")) e.preventDefault(); });
});
// keyboard: Enter selects, Space toggles
$("list").addEventListener("keydown", e => {
  const row = e.target.closest("[data-row]"); if (!row || e.target !== row) return;
  if (e.key === "Enter") { select(row.dataset.row, "list"); e.preventDefault(); }
  if (e.key === " ") { toggle(row.dataset.row); e.preventDefault(); }
});

// list controls
$("list").addEventListener("click", e => {
  const sw = e.target.closest("[data-sw]");
  if (sw) { const k = sw.dataset.sw; select(k, "list"); toggle(k); return; }
  const opt = e.target.closest("button.opt[data-set]");
  if (opt) { const k = opt.dataset.set; const before = state[k]; state[k] = coerce(k, opt.dataset.val); commit(); select(k, "list"); snack(`<b>${esc(title(k))}</b>: ${esc(entryLabel(k, state[k]))}`, () => { state[k] = before; commit(); }); }
});
$("list").addEventListener("input", e => {
  const t = e.target; const k = t.dataset && t.dataset.set; if (!k || t.tagName === "SELECT") return;
  if (t.type === "range" || t.type === "color") {
    state[k] = t.type === "range" ? Number(t.value) : t.value.toUpperCase();
    const lab = document.querySelector(`[data-val-of="${k}"]`); if (lab) lab.textContent = t.value;
    if (selected !== k) { selected = k; }
    renderStage(); document.querySelectorAll(`#stage [data-k="${k}"]`).forEach(x => x.classList.add("sel"));
  }
});
$("list").addEventListener("change", e => {
  const t = e.target; const k = t.dataset && t.dataset.set; if (!k) return;
  state[k] = t.type === "range" ? Number(t.value) : t.type === "number" ? Number(t.value) : t.type === "color" ? t.value.toUpperCase() : coerce(k, t.value);
  commit(); select(k);
});

$("tabs").addEventListener("click", e => {
  const b = e.target.closest("[data-sec]"); if (!b) return;
  section = b.dataset.sec; selected = null; stopDemo(); miscQuery = "";
  $("scroller").scrollTop = 0;
  renderAll();
  b.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
});
$("btnOrig").onclick = () => { mode = "orig"; $("btnOrig").setAttribute("aria-pressed", "true"); $("btnMod").setAttribute("aria-pressed", "false"); $("hint").textContent = "Stock YouTube, read-only"; commit(); if (selected) select(selected); };
$("btnMod").onclick = () => { mode = "mod"; $("btnMod").setAttribute("aria-pressed", "true"); $("btnOrig").setAttribute("aria-pressed", "false"); $("hint").textContent = "Tap to select · long-press to toggle"; commit(); if (selected) select(selected); };
$("slots").onchange = e => { showSlots = e.target.checked; renderStage(); store.save(); };

function tick() { const d = new Date(); $("clock").textContent = `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`; }

// ------------------------------------------------------------------ boot
async function boot() {
  try {
    const r = await fetch("catalogue.json");
    CAT = await r.json();
  } catch (err) {
    $("list").innerHTML = `<div class="secnote" style="padding:20px 16px">Could not load catalogue.json. Serve this folder over HTTP (for example <code>python3 -m http.server</code>) and reload.</div>`;
    return;
  }
  for (const p of CAT.preferences) { PREF[p.key] = p; defaults[p.key] = initialValue(p); }
  Object.assign(state, defaults);
  const saved = store.load();
  if (saved.state) for (const k in saved.state) if (k in PREF) state[k] = saved.state[k];
  if (saved.section && SECTIONS.some(s => s.id === saved.section)) section = saved.section;
  if (typeof saved.slots === "boolean") { showSlots = saved.slots; $("slots").checked = showSlots; }
  buildMembers();
  renderAll();
  tick(); setInterval(tick, 30000);
  // make list rows keyboard reachable
  new MutationObserver(() => document.querySelectorAll("#list [data-row]").forEach(r => r.tabIndex = 0)).observe($("list"), { childList: true });
  document.querySelectorAll("#list [data-row]").forEach(r => r.tabIndex = 0);
}
boot();
})();
