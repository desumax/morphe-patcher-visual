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
  wifi: "M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8 3 3 3-3a4.237 4.237 0 0 0-6 0zm-4-4 2 2a7.074 7.074 0 0 1 10 0l2-2C15.14 9.14 8.87 9.14 5 13z",
  reset: "M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z",
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
  visibility_off: "M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z",
  gesture: "M9 11.24V7.5a2.5 2.5 0 0 1 5 0v3.74c1.21-.81 2-2.18 2-3.74C16 5.01 13.99 3 11.5 3S7 5.01 7 7.5c0 1.56.79 2.93 2 3.74zm9.84 4.63-4.54-2.26c-.17-.07-.35-.11-.54-.11H13v-6c0-.83-.67-1.5-1.5-1.5S10 6.67 10 7.5v10.74l-3.43-.72c-.08-.01-.15-.03-.24-.03-.31 0-.59.13-.79.33l-.79.8 4.94 4.94c.27.27.65.44 1.06.44h6.79c.75 0 1.33-.55 1.44-1.28l.75-5.27c.01-.07.02-.14.02-.2 0-.62-.38-1.16-.91-1.38z",
  layout: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
  palette: "M12 3a9 9 0 0 0 0 18c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3-4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z",
  layers: "M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16z",
  toggle: "M17 7H7a5 5 0 0 0 0 10h10a5 5 0 0 0 0-10zm0 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6z",
  vibrate: "M0 15h2V9H0v6zm3 2h2V7H3v10zm19-8v6h2V9h-2zm-3 8h2V7h-2v10zM16.5 3h-9C6.67 3 6 3.67 6 4.5v15c0 .83.67 1.5 1.5 1.5h9c.83 0 1.5-.67 1.5-1.5v-15c0-.83-.67-1.5-1.5-1.5zM16 19H8V5h8v14z",
  lockopen: "M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10z",
  arrow: "M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z",
  back: "M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z",
  expand: "M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6z",
  phone: "M17 1.01 7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z",
  restart: "M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z",
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
  { id: "player", icon: "play", title: "Player controls", scopes: [["PLAYER", "morphe_overlay_buttons_screen"]] },
  { id: "endscreen", icon: "tv", title: "End screen", scopes: [] },
  { id: "seekbar", icon: "gesture", title: "Seekbar & gestures", scopes: [["SEEKBAR", null], ["PLAYER", "morphe_disable_haptic_feedback"]] },
  { id: "watch", icon: "like", title: "Watch page", scopes: [["PLAYER", "morphe_action_buttons_screen"], ["PLAYER", "morphe_hide_description_components_screen"]] },
  { id: "fullscreen", icon: "full", title: "Fullscreen", scopes: [["SWIPE_CONTROLS", null], ["PLAYER", "morphe_disable_fullscreen_gestures"]] },
  { id: "feed", icon: "home", title: "Home feed", scopes: [["FEED", null], ["FEED", "morphe_hide_filter_bar_screen"]] },
  { id: "shorts", icon: "shorts", title: "Shorts", scopes: [["SHORTS", null], ["SHORTS", "morphe_shorts_player_screen"]] },
  { id: "nav", icon: "layout", title: "Navigation", scopes: [["GENERAL", "morphe_navigation_bar_screen"], ["GENERAL", "morphe_toolbar_screen"]] },
  { id: "comments", icon: "comment", title: "Comments", scopes: [["PLAYER", "morphe_comments_screen"]] },
  { id: "flyout", icon: "tune", title: "Player menu", scopes: [["PLAYER", "morphe_hide_player_flyout"]] },
  { id: "captions", icon: "cc", title: "Captions", scopes: [["PLAYER", "morphe_captions_screen"], ["PLAYER", "morphe_captions_advanced"]] },
  { id: "miniplayer", icon: "pip", title: "Miniplayer", scopes: [["PLAYER", "morphe_miniplayer_screen"], ["PLAYER", "morphe_notification_media_screen"]] },
  { id: "misc", icon: "list", title: "Misc", scopes: null },
];

// Experimental grouped layout: six screens, each split into tabs that sit right under the live preview.
// A tab is one of the screens above, so switching tabs switches the preview (and its animations) too.
const GROUPS = [
  { id: "g_player", icon: "play", title: "Player", tabs: [["player", "Controls"], ["seekbar", "Seekbar & gestures"], ["fullscreen", "Fullscreen"], ["flyout", "Player menu"]] },
  { id: "g_playback", icon: "speed", title: "Playback", tabs: [["playback", "Playback"], ["endscreen", "End screen"], ["captions", "Captions"], ["miniplayer", "Miniplayer"], ["sponsorblock", "SponsorBlock"]] },
  { id: "g_watch", icon: "like", title: "Watch page", tabs: [["watch", "Actions"], ["description", "Description"], ["comments", "Comments"], ["danmaku", "Flying comments"], ["ambient", "Ambient mode"]] },
  { id: "g_feed", icon: "home", title: "Feed", tabs: [["feed", "Home"], ["shorts", "Shorts"], ["ads", "Ads"], ["dearrow", "DeArrow"]] },
  { id: "g_browse", icon: "layout", title: "Browsing", tabs: [["channel", "Channel page"], ["explore", "Explore menu"], ["nav", "Navigation"]] },
  { id: "g_app", icon: "palette", title: "App", tabs: [["look", "App look"], ["snackbar", "Snackbar"], ["misc", "Other"]] },
];
let grouped = false;
const lastTab = {};
const groupOf = id => GROUPS.find(g => g.tabs.some(([t]) => t === id)) || GROUPS[GROUPS.length - 1];
const tabsOf = g => g.tabs.filter(([t]) => SECTIONS.some(s => s.id === t));

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

def("feed", "vis", "feed_watch_later_button native_queue_thumbnail_button hide_video_labels hide_filter_bar_in_feed hide_video_thumbnail hide_seekbar_thumbnail hide_view_count hide_upload_time hide_shorts_home hide_community_posts hide_mix_playlists hide_live_streams hide_youtube_doodles");
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
let CAT, PREF = {}, state = {}, mode = "mod", section = "player", selected = null;
const ghosts = new Set();
const LS = "morphe-visual-editor-v1";
const store = {
  load() { try { return JSON.parse(localStorage.getItem(LS) || "{}"); } catch { return {}; } },
  save() { try { localStorage.setItem(LS, JSON.stringify({ state: changedOnly(), section })); } catch { /* storage unavailable */ } },
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
function parentsOk(k) { return classicParentsOk(k) && availOk(k); }
function classicParentsOk(k) {
  const p = PREF[k]; if (!p || !p.parents || !p.parents.length) return true;
  const any = p.parents.filter(x => x.mode === "any");
  const rest = p.parents.filter(x => x.mode !== "any");
  const okRest = rest.every(x => x.mode === "not" ? !state[x.key] : !!state[x.key]);
  const okAny = !any.length || any.some(x => !!state[x.key]);
  return okRest && okAny;
}
// Morphe leaves a few titles blank because the row is a drawing of its own
const TITLE_FALLBACK = { morphe_swipe_zone_preview: "Swipe zone preview" };
const title = k => {
  const p = PREF[k]; if (!p) return k;
  return (p.title && p.title.trim()) || TITLE_FALLBACK[k] || k.replace(/^morphe_/, "").replace(/_/g, " ");
};
function entryLabel(k, v) { const e = (PREF[k]?.entries || []).find(x => String(x.value) === String(v)); return e ? e.label : String(v); }

// ------------------------------------------------------------------ component helper
// C(key, inner, {blk, cls, style, tag}) wraps a component so it can be selected, ghosted or hidden.
function C(k, inner, o = {}) {
  const full = "morphe_" + k;
  // a setting this YouTube version doesn't have: the stock element stays, but it isn't tied to a setting
  if (PREF[full] && !inVersion(full)) return `<${o.tag || "div"} class="${o.blk ? "blk" : ""}" style="position:relative;${o.style || ""}">${inner}</${o.tag || "div"}>`;
  const a = ad(full);
  const cls = ["c"];
  if (o.blk) cls.push("blk");
  if (o.cls) cls.push(o.cls);
  if (a && (a.kind === "vis" || a.kind === "overlay") && !shown(full)) cls.push("off");
  if (ghosts.has(full)) cls.push("ghost");
  if (selected === full || (o.also && selected === "morphe_" + o.also)) cls.push("sel");
  return `<${o.tag || "div"} class="${cls.join(" ")}" data-k="${full}" ${o.also ? `data-also="morphe_${o.also}"` : ""} data-label="${esc(title(full))}" style="${o.style || ""}">${inner}</${o.tag || "div"}>`;
}
const pb = (k, icon, o = {}) => C(k, `<div class="pbtn ${o.bg ? "ctrlbg" : ""}" style="${o.s ? `width:${o.s}px;height:${o.s}px` : ""}">${icon}</div>`, o);

// ------------------------------------------------------------------ scenes
const SCENES = {};

function videoFrame(i = 0, extra = "") {
  return `<div class="frame" style="background:${ART[i]}"></div>${extra}`;
}

SCENES.player = () => {
  const bgHidden = !!V("morphe_hide_player_control_buttons_background");
  const shade = bgHidden ? 0 : (Number(V("morphe_player_control_buttons_background_opacity")) / 100);
  const op = Number(V("morphe_player_overlay_opacity")) / 100;
  const qual = `<span class="badge-txt">HD</span>`;
  const list = [
    ["copy_video_link_button", I("link")], ["playback_speed_dialog_button", I("speed")], ["video_quality_dialog_button", qual],
    ["loop_video_button", I("loop")], ["mute_video_button", I("vol")], ["pip_button_overlay", I("pip")], ["reload_video_button", I("reload")],
    ["save_to_watch_later_button", I("clock")], ["playlist_panel_button", I("plist")], ["play_all_button", I("queue")],
    ["fullscreen_video_scale_button", I("crop")], ["video_delay_button_overlay", `<span class="badge-txt">ms</span>`], ["external_downloader_overlay_button", I("dl")],
  ];
  const btn = ([k, ic], extra = "") => C(k, `<div class="pbtn" style="width:32px;height:32px">${ic}</div>`, { cls: extra });
  const on = list.filter(([k]) => shown("morphe_" + k) || (mode === "mod" && selected === "morphe_" + k && !trayOpen));
  const off = list.filter(([k]) => !shown("morphe_" + k));
  const pill = off.length && mode === "mod"
    ? `<button class="traypill" data-tray aria-expanded="${trayOpen}" title="Buttons that are off">${I(trayOpen ? "close" : "plus")}<span>${off.length}</span></button>` : "";
  const tray = trayOpen && off.length && mode === "mod"
    ? `<div class="tray" role="group" aria-label="Buttons that are off"><div class="trayhead">Off · tap to preview, hold to add</div><div class="trayrow">${off.map(b => btn(b, "intray")).join("")}</div></div>` : "";
  return `<div class="video">
    ${videoFrame(0)}
    ${C("hide_player_control_buttons_background", "", { also: "player_control_buttons_background_opacity", cls: "shade", style: `position:absolute;inset:0;background:rgba(0,0,0,${shade})` })}
    <div class="ctrls" style="position:absolute;inset:0;opacity:${Math.max(op, .08)};pointer-events:none">
      <div style="position:absolute;left:6px;top:6px">${pb("hide_collapse_button", I("down"))}</div>
      <div style="position:absolute;right:6px;top:6px;display:flex;gap:2px;align-items:center">
        ${C("hide_autoplay_button", `<div class="pbtn" style="width:48px"><div class="toggle-auto">${I("play")}</div></div>`)}
        ${pb("hide_captions_button", I("cc"))}${pb("hide_cast_button", I("cast"))}${pb("hide_settings_button", I("gear"))}
      </div>
      <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:flex;gap:28px;align-items:center">
        ${pb("hide_player_previous_next_buttons", I("prev"))}
        <div class="pbtn bigbtn">${I("pause")}</div>
        ${pb("hide_player_previous_next_buttons", I("next"))}
      </div>
      <div style="position:absolute;right:6px;bottom:18px;display:flex;gap:2px;max-width:340px;align-items:center">${pill}${on.map(b => btn(b)).join("")}${pb("hide_fullscreen_button", I("full"))}</div>
      <div class="time" style="position:absolute;left:12px;bottom:24px">3:12 / 18:42</div>
      <div class="seek" style="bottom:10px"><div class="buf" style="width:40%"></div><div class="played" style="width:17%"></div><div class="knob" style="left:17%"></div></div>
    </div>
    ${tray}
  </div>`;
};
const CUSTOM_KEYS = new Set(["copy_video_link_button", "playback_speed_dialog_button", "video_quality_dialog_button", "loop_video_button", "mute_video_button", "pip_button_overlay", "reload_video_button", "save_to_watch_later_button", "playlist_panel_button", "play_all_button", "fullscreen_video_scale_button", "video_delay_button_overlay", "external_downloader_overlay_button"].map(k => "morphe_" + k));

SCENES.endscreen = () => {
  const auto = V("morphe_autoplay_mode");
  const card = (i) => `<div style="display:flex;gap:6px;align-items:center;background:rgba(0,0,0,.55);border-radius:6px;padding:4px;width:150px">${thumb(i, "width:64px;flex:none;border-radius:4px")}<div class="t2" style="color:#fff;font-size:10.5px;line-height:1.25">${esc(VIDEOS[i].t.slice(0, 38))}…</div></div>`;
  const upnext = (selected === "morphe_hide_autoplay_preview" || (auto === "AUTO" && selected !== "morphe_hide_end_screen_suggested_video"))
    ? C("hide_autoplay_preview", `<div style="width:124px;background:rgba(0,0,0,.6);border-radius:8px;padding:6px">
        <div style="font-size:10px;color:#ddd;margin-bottom:4px">Up next in <b style="color:#fff" class="cd">5</b></div>${thumb(3, "border-radius:6px")}
        <div style="font-size:10.5px;margin-top:4px;line-height:1.25">${esc(VIDEOS[3].t)}</div>
        <div style="display:flex;gap:6px;margin-top:6px"><span class="chip" style="height:22px;font-size:10.5px;padding:0 8px">Cancel</span><span class="chip" style="height:22px;font-size:10.5px;padding:0 8px;background:#fff;color:#000">Play now</span></div></div>`, { cls: "upnext" })
    : C("hide_end_screen_suggested_video", `<div style="width:124px;background:rgba(0,0,0,.6);border-radius:8px;padding:6px">
        <div style="font-size:10px;color:#ddd;margin-bottom:4px">You may also like</div>${thumb(5, "border-radius:6px")}
        <div style="font-size:10.5px;margin-top:4px;line-height:1.25">${esc(VIDEOS[5].t)}</div></div>`);
  return `<div class="video">
    ${videoFrame(1)}<div class="scrim" style="background:rgba(0,0,0,.35)"></div>
    <div style="position:absolute;left:8px;top:8px">${C("hide_end_screen_store_banner", `<div class="chip" style="height:24px;font-size:11px;background:rgba(0,0,0,.65)">${I("shop")} Official store · 4 items</div>`)}</div>
    <div style="position:absolute;right:8px;top:8px">${C("hide_info_cards", `<div class="pbtn" style="width:28px;height:28px;background:rgba(0,0,0,.5)">${I("info")}</div>`)}</div>
    <div style="position:absolute;left:10px;top:44px">${C("hide_end_screen_cards", `<div style="display:grid;gap:6px">${card(1)}${card(2)}</div>`)}</div>
    <div style="position:absolute;right:46px;top:30px">${upnext}</div>
    <div style="position:absolute;right:10px;bottom:12px">${C("hide_channel_watermark", `<div style="opacity:.8">${av(2, 26)}</div>`)}</div>
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
    <div style="position:absolute;left:50%;top:38px;transform:translateX(-50%)">${C("hide_player_gesture_hints", `<div class="toastin" style="position:static;transform:none">Pull up for precise seeking</div>`)}</div>
    <div class="pbtn bigbtn" style="position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);background:rgba(0,0,0,.3)">${I("play")}</div>
    <div id="thumbBubble" style="position:absolute;left:calc(12px + 0.42 * (100% - 24px));bottom:40px;transform:translateX(-50%)">${C("seekbar_thumbnail_preview", `<div style="width:96px">${thumb(4, "border-radius:4px;border:2px solid #fff")}<div class="time" style="text-align:center;margin-top:2px">7:51</div></div>`)}</div>
    ${C("hide_timestamp", `<div class="time">3:12 / 18:42</div>`, { style: "position:absolute;left:12px;bottom:30px" })}
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
    ${C("hide_quick_actions", `<div style="display:flex;gap:5px;overflow-x:auto;scrollbar-width:none">
      ${q("hide_quick_actions_like_button", "like", "120K")}${q("hide_quick_actions_dislike_button", "dislike", "")}${q("hide_quick_actions_comments_button", "comment", "1.4K")}
      ${q("hide_quick_actions_save_button", "save", "")}${q("hide_quick_actions_share_button", "share", "")}${q("hide_quick_actions_playlist_button", "plist", "")}
      ${q("hide_quick_actions_mix_button", "queue", "")}${q("hide_quick_actions_more_videos_button", "tv", "")}${q("hide_quick_actions_ask_button", "spark", "")}${q("hide_quick_actions_more_button", "moreh", "")}</div>`, { style: "position:absolute;left:10px;right:10px;bottom:-1px;height:24px" })}
    <div id="hud" style="position:absolute;display:none;z-index:31"></div>
    <div class="finger" id="finger"></div>
  </div>`;
};

SCENES.feed = () => {
  const layout = V("morphe_feed_card_layout");
  // Default leaves it to YouTube's A/B test, which on most accounts now sends the card layout
  const cards = layout === "CARDS" || layout === "CARDS_WITH_ACTION_BUTTONS" || layout === "DEFAULT";
  const actions = layout === "CARDS_WITH_ACTION_BUTTONS";
  const abNote = layout === "DEFAULT" && selected === "morphe_feed_card_layout" ? `<div class="demo-label" style="position:sticky;top:6px;left:8px;z-index:30;display:inline-block;margin:6px 8px 0">Default: YouTube picks per account (A/B test), often cards</div>` : "";
  const vcard = (i, opts = {}) => {
    const progress = C("hide_seekbar_thumbnail", `<div style="height:3px;background:rgba(255,255,255,.3)"><div style="height:3px;width:${opts.prog || 0}%;background:#ff0033"></div></div>`, { style: "position:absolute;left:0;right:0;bottom:0" });
    const tn = C("hide_video_thumbnail", `<div style="position:relative">${thumb(i, cards ? "border-radius:12px 12px 0 0" : "border-radius:0", `<span class="dur">${VIDEOS[i].d}</span>${opts.prog ? progress : ""}${C("feed_watch_later_button", `<span style="width:28px;height:28px;border-radius:50%;background:rgba(0,0,0,.65);display:grid;place-items:center">${I("clock", "ico", 'style="width:16px;height:16px"')}</span>`, { style: "position:absolute;right:8px;top:8px" })}${C("native_queue_thumbnail_button", `<span style="width:28px;height:28px;border-radius:50%;background:rgba(0,0,0,.65);display:grid;place-items:center">${I("queue", "ico", 'style="width:16px;height:16px"')}</span>`, { style: "position:absolute;right:42px;top:8px" })}${i === 1 ? C("hide_video_labels", `<span style="display:flex;gap:4px"><span style="padding:1px 5px;border-radius:3px;background:#f1f1f1;color:#0f0f0f;font-size:10px;font-weight:600">NEW</span><span style="padding:1px 5px;border-radius:3px;background:rgba(0,0,0,.7);font-size:10px;font-weight:600">4K</span></span>`, { style: "position:absolute;left:8px;top:8px" }) : ""}`)}</div>`, { blk: 1 });
    const meta = `<div style="display:flex;gap:10px;padding:10px 12px 12px">${av(i, 34)}<div style="flex:1;min-width:0"><div class="t1">${esc(VIDEOS[i].t)}</div>
      <div class="t2" style="display:flex;flex-wrap:wrap;gap:0 4px;margin-top:2px"><span>${VIDEOS[i].c}</span>${C("hide_view_count", `<span>· ${VIDEOS[i].v}</span>`, { tag: "span" })}${C("hide_upload_time", `<span>· ${VIDEOS[i].a}</span>`, { tag: "span" })}</div></div>${I("more", "ico", 'style="width:18px;height:18px;flex:none"')}</div>`;
    const acts = actions ? `<div style="display:flex;gap:6px;padding:0 12px 12px">${["like", "share", "save"].map(n => `<span class="chip" style="height:28px">${I(n)}</span>`).join("")}</div>` : "";
    return `<div style="${cards ? "margin:0 10px 12px;background:#1c1c1c;border-radius:12px;overflow:hidden" : "margin-bottom:6px"}">${tn}${meta}${acts}</div>`;
  };
  const logo = `<div style="width:28px;height:20px;border-radius:6px;background:#ff0033;display:grid;place-items:center">${I("play", "ico", 'style="width:14px;height:14px"')}</div><b style="font-size:17px;letter-spacing:-.4px">YouTube</b>`;
  const doodle = `<div class="doodle"><span style="background:#4285f4">Y</span><span style="background:#ea4335">o</span><span style="background:#fbbc05">u</span><span style="background:#34a853">T</span><span style="background:#ff0033">ube</span></div>`;
  return `<div style="background:#0f0f0f;height:350px;overflow-y:auto;scrollbar-width:thin" class="inner-scroll">
    ${abNote}
    <div style="display:flex;align-items:center;padding:8px 6px 4px 12px;gap:4px">
      ${C("hide_youtube_doodles", doodle, { style: "display:flex;align-items:center" })}<div class="plainlogo" style="display:flex;align-items:center;gap:4px">${logo}</div>
      <div style="flex:1"></div>${I("cast", "ico", 'style="margin:0 8px"')}${I("bell", "ico", 'style="margin:0 8px"')}${I("search", "ico", 'style="margin:0 8px"')}
    </div>
    ${C("hide_filter_bar_in_feed", `<div style="display:flex;gap:8px;padding:10px 12px;overflow-x:auto;scrollbar-width:none">${["All", "Music", "Live", "Gaming", "Podcasts", "Trains"].map((t, i) => `<span class="chip" style="${i === 0 ? "background:#f1f1f1;color:#0f0f0f" : ""}">${t}</span>`).join("")}</div>`, { blk: 1 })}
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
  const rb = (k, icon, label) => C(k, `<div style="display:grid;justify-items:center;gap:1px"><div class="pbtn" style="width:36px;height:36px;background:rgba(255,255,255,.12)">${icon}</div><span style="font-size:10px;font-weight:500;line-height:12px">${label}</span></div>`);
  return `<div style="position:relative;height:420px;background:${ART[5]};overflow:hidden" id="shortsStage">
    <div style="position:absolute;inset:0;background:linear-gradient(transparent 55%,rgba(0,0,0,.7))"></div>
    <div style="position:absolute;right:10px;top:8px;display:flex;gap:6px">${I("search")}${I("more")}</div>
    <div style="position:absolute;right:6px;bottom:${shown("morphe_hide_shorts_navigation_bar") ? 64 : 14}px;display:grid;gap:6px;justify-items:center">
      ${rb("hide_shorts_like_button", I("like"), "12K")}
      ${rb("hide_shorts_comments_button", I("comment"), "341")}${rb("hide_shorts_share_button", I("share"), "Share")}${rb("hide_shorts_save_button", I("save"), "Save")}${rb("hide_shorts_remix_button", I("remix"), "Remix")}
      ${C("hide_shorts_sound_button", `<div style="width:30px;height:30px;border-radius:8px;border:2px solid #fff;background:${ART[3]}"></div>`)}
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
  const lab = t => C("hide_navigation_button_labels", `<span style="font-size:10px;display:block;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t}</span>`, { tag: "span", style: "max-width:100%" });
  const tab = (k, icon, t, extra = "") => C(k, `<div style="display:grid;justify-items:center;gap:2px;position:relative;min-width:0">${icon}${lab(t)}${extra}</div>`, { cls: "ntab" });
  const dot = C("hide_navigation_new_content_dot", `<span style="position:absolute;left:calc(50% + 7px);top:-1px;width:7px;height:7px;border-radius:50%;background:#ff0033;display:block"></span>`, { tag: "span", style: "position:absolute;inset:0;pointer-events:auto" });
  const center = swap
    ? tab("hide_notifications_button", I("bell"), "Notifications")
    : C("hide_create_button", `<div style="width:40px;height:40px;border-radius:50%;border:1.5px solid #fff;display:grid;place-items:center;margin:0 auto">${I("plus")}</div>`, { cls: "ntab" });
  return `<div class="navbar${narrow ? " narrow" : ""}" style="display:flex;justify-content:center;align-items:center;height:52px;padding:0 4px;background:${bg};border-top:1px solid #222">
    ${tab("hide_home_button", I("home"), "Home")}${tab("hide_shorts_button", I("shorts"), "Shorts")}${center}
    ${tab("hide_subscriptions_button", I("subs"), "Subscriptions", dot)}
    ${tab("show_search_button", I("search"), "Search")}${tab("show_watch_later_button", I("clock"), "Watch later")}${tab("show_settings_button", I("gear"), "Settings")}
    <div class="ntab" style="display:grid;justify-items:center;gap:2px">${av(6, 24)}${lab("You")}</div>
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
    <div class="inner-scroll" style="position:absolute;left:0;right:0;top:56px;bottom:0;background:#212121;border-radius:14px 14px 0 0;overflow-y:auto;scrollbar-width:thin;padding-bottom:8px">
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
      ${C("secondary_caption_language", `<span style="background:rgba(8,8,8,.75);padding:2px 6px;font-size:${(fs * .9).toFixed(1)}px;color:#ffe680">${sec && sec !== "off" ? CAP_LINE[sec] || CAP_LINE.es : "(no second language)"}</span>`, { tag: "span", cls: sec && sec !== "off" ? "" : selected === "morphe_secondary_caption_language" ? "off ghost" : "off" })}</div>`, { style: "position:absolute;left:12px;right:12px;bottom:14px;display:flex;justify-content:center" })}
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

// ------------------------------------------------------------------ more sections and scenes
let fading = new Set(), trayOpen = false, baseline = {}, returnTo = null, pickerOpen = false;

const EXTRA_SECTIONS = [
  { id: "description", icon: "list", title: "Description", scopes: [["PLAYER", "morphe_hide_description_components_screen"]] },
  { id: "ambient", icon: "bright", title: "Ambient mode", scopes: [["PLAYER", "morphe_ambient_mode_screen"]] },
  { id: "danmaku", icon: "chat", title: "Flying comments", scopes: [["PLAYER", "morphe_niconico_comments_screen"]] },
  { id: "channel", icon: "you", title: "Channel page", scopes: [["FEED", "morphe_channel_screen"]] },
  { id: "explore", icon: "search", title: "Explore menu", scopes: [["FEED", "morphe_explore_menu_screen"]] },
];
{
  const watch = SECTIONS.find(s => s.id === "watch");
  watch.scopes = watch.scopes.filter(([, sub]) => sub !== "morphe_hide_description_components_screen");
  const order = ["player", "endscreen", "seekbar", "fullscreen", "flyout", "captions", "watch", "description", "comments", "ambient", "danmaku", "miniplayer", "feed", "channel", "explore", "shorts", "nav", "misc"];
  const all = [...SECTIONS, ...EXTRA_SECTIONS];
  SECTIONS.length = 0;
  order.forEach(id => SECTIONS.push(all.find(s => s.id === id)));
}

const DESC = [
  ["hide_video_details_section", "Details", "1.2M views · 3 days ago · #cabin #norway"],
  ["hide_ai_generated_video_summary_section", "✦ Summary", "A two-week build of a 12 m² cabin using reclaimed pine."],
  ["hide_ask_section", "Ask", "Ask questions about this video"],
  ["hide_hype_points", "Hype", "2,410 points this week"],
  ["hide_key_concepts_section", "Key concepts", "Timber framing · Wood stove · Insulation"],
  ["hide_chapters_section", "Chapters", "0:00 Intro · 2:14 Foundation · 7:40 Walls · 12:04 Stove"],
  ["hide_search_inside_this_video_section", "Search inside this video", "Find moments by keyword"],
  ["hide_transcript_section", "Transcript", "Follow along using the transcript"],
  ["hide_how_this_was_made_section", "How this was made", "Altered or synthetic content: No"],
  ["hide_corrections_section", "Corrections", "1:20 The wall is 2.4 m, not 2.6 m"],
  ["hide_attributes_section", "Music", "Northern Lights · Midnight Tapes"],
  ["hide_featured_links_section", "Featured links", "fjordtimber.no · Tool list"],
  ["hide_featured_videos_section", "Featured videos", "Part 1 · Part 2 · Roofing"],
  ["hide_featured_playlists_section", "Featured playlists", "Cabin build (14 videos)"],
  ["hide_featured_channels_section", "Featured channels", "Slow Rails · Darkroom Diaries"],
  ["hide_channel_links_section", "Channel links", "Instagram · Patreon"],
  ["hide_hashtag_section", "Hashtags", "#cabin #norway #woodworking"],
  ["hide_info_cards_section", "Info cards", "Part 1 of the build · Video"],
  ["hide_explore_section", "Explore", "Explore more in Woodworking"],
  ["hide_explore_course_section", "Course", "Timber framing basics · 8 lessons"],
  ["hide_course_progress_section", "Course progress", "Lesson 3 of 8 completed"],
  ["hide_quizzes_section", "Quiz", "Which joint holds the roof beam?"],
  ["hide_explore_podcast_section", "Podcast", "Fjord & Timber Talks"],
];
// The description sheet as YouTube draws it: player on top, sheet with title, stats, text, then each
// section in its own shape (chapter strip, music row, chips, link rows, channel row at the end).
SCENES.description = () => {
  const H = (t, extra = "") => `<div style="display:flex;align-items:center;gap:6px;padding:14px 14px 8px"><b style="font-size:15px;flex:1">${t}</b>${extra}</div>`;
  const strip = items => `<div style="display:flex;gap:8px;padding:0 14px;overflow-x:auto;scrollbar-width:none">${items}</div>`;
  const linkRow = (icon, t, sub) => `<div style="display:flex;gap:12px;align-items:center;padding:6px 14px">${I(icon, "ico", 'style="fill:#aaa;flex:none"')}<div style="min-width:0"><div style="font-size:13px">${t}</div><div class="t2" style="color:#3ea6ff">${sub}</div></div></div>`;
  const btn = t => `<div style="margin:6px 14px 2px"><span class="chip" style="height:32px;background:transparent;border:1px solid #555;width:100%;justify-content:center">${t}</span></div>`;
  const SEC = {
    hide_video_details_section: () => `<div style="padding:4px 14px 6px"><div style="font-size:16px;font-weight:600;line-height:1.3">${esc(VIDEOS[0].t)}</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);text-align:center;margin:12px 0 10px">${[["48K", "Likes"], ["1.2M", "Views"], ["14 Nov", "2026"]].map(([a, b]) => `<div><b style="font-size:16px">${a}</b><div class="t2">${b}</div></div>`).join("")}</div>
      <div style="font-size:13px;line-height:1.45">Two weeks, one 12 m² cabin and a lot of reclaimed pine. <span style="color:#3ea6ff">#cabin #norway</span></div></div>`,
    hide_ai_generated_video_summary_section: () => `<div style="margin:10px 14px 0;padding:10px 12px;border-radius:12px;background:linear-gradient(135deg,rgba(62,166,255,.14),rgba(180,120,255,.12))"><div style="display:flex;gap:6px;align-items:center;font-size:12px;font-weight:600">${I("spark", "ico", 'style="width:16px;height:16px"')}Summary</div><div style="font-size:12.5px;margin-top:4px;line-height:1.4">A two-week build of a 12 m² cabin using reclaimed pine, with a wood stove.</div></div>`,
    hide_ask_section: () => `<div style="padding:10px 14px 0"><span class="chip" style="height:32px;background:rgba(255,255,255,.1)">${I("spark")} Ask about this video</span></div>`,
    hide_hype_points: () => `<div style="display:flex;gap:10px;align-items:center;margin:10px 14px 0;padding:8px 12px;border-radius:12px;background:#2c2c2c">${I("fire", "ico", 'style="fill:#ff8a3d"')}<div><b style="font-size:13px">2,410 hype points</b><div class="t2">#4 in Woodworking this week</div></div></div>`,
    hide_key_concepts_section: () => H("Key concepts") + `<div style="display:flex;flex-wrap:wrap;gap:6px;padding:0 14px">${["Timber framing", "Wood stove", "Insulation", "Off-grid"].map(t => `<span class="chip" style="height:28px">${t}</span>`).join("")}</div>`,
    hide_chapters_section: () => H("Chapters", `<span class="t2">View all</span>`) + strip([["0:00", "Intro", 0], ["2:14", "Foundation", 3], ["7:40", "Walls", 4], ["12:04", "Stove", 6]].map(([t, n, i]) => `<div style="width:118px;flex:none">${thumb(i, "border-radius:8px")}<div style="font-size:12px;margin-top:4px">${n}</div><div class="t2" style="color:#3ea6ff">${t}</div></div>`).join("")),
    hide_search_inside_this_video_section: () => `<div style="margin:12px 14px 0;display:flex;align-items:center;gap:8px;height:36px;border-radius:18px;background:#2c2c2c;padding:0 12px;color:#aaa;font-size:13px">${I("search", "ico", 'style="width:18px;height:18px;fill:#aaa"')}Search inside this video</div>`,
    hide_transcript_section: () => H("Transcript") + `<div class="t2" style="padding:0 14px">Follow along using the transcript.</div>` + btn("Show transcript"),
    hide_how_this_was_made_section: () => H("How this was made") + `<div style="display:flex;gap:10px;padding:0 14px;align-items:flex-start">${I("info", "ico", 'style="fill:#aaa;flex:none"')}<div style="font-size:12.5px">Altered or synthetic content<div class="t2">Sound or visuals were not significantly edited or digitally generated.</div></div></div>`,
    hide_corrections_section: () => H("Corrections") + `<div style="padding:0 14px;font-size:12.5px"><span style="color:#3ea6ff">1:20</span> The wall is 2.4 m, not 2.6 m</div>`,
    hide_attributes_section: () => H("Music") + `<div style="display:flex;gap:10px;align-items:center;padding:0 14px"><div style="width:44px;height:44px;border-radius:6px;background:${ART[7]};flex:none"></div><div><div style="font-size:13px">Northern Lights</div><div class="t2">Midnight Tapes · Fjord Sessions</div></div></div>` + btn(`${I("music")} Music`),
    hide_featured_links_section: () => H("Featured links") + linkRow("link", "Tool list", "fjordtimber.no/tools") + linkRow("link", "Plans", "fjordtimber.no/plans"),
    hide_featured_videos_section: () => H("Featured videos") + strip([1, 2, 5].map(i => `<div style="width:140px;flex:none">${thumb(i, "border-radius:8px")}<div style="font-size:12px;margin-top:4px">${esc(VIDEOS[i].t.slice(0, 32))}…</div></div>`).join("")),
    hide_featured_playlists_section: () => H("Featured playlists") + `<div style="display:flex;gap:10px;padding:0 14px;align-items:center"><div style="width:120px;position:relative;flex:none">${thumb(4, "border-radius:8px")}<span class="dur">${I("plist", "ico", 'style="width:12px;height:12px;vertical-align:-2px"')} 14</span></div><div><div style="font-size:13px">Cabin build</div><div class="t2">Fjord & Timber · Playlist</div></div></div>`,
    hide_featured_channels_section: () => H("Featured channels") + strip([[1, "Slow Rails"], [3, "Darkroom Diaries"], [5, "Pocket Science"]].map(([i, n]) => `<div style="display:grid;justify-items:center;gap:4px;width:84px;flex:none">${av(i, 52)}<div style="font-size:11.5px;text-align:center">${n}</div></div>`).join("")),
    hide_channel_links_section: () => H("Channel links") + linkRow("link", "Instagram", "instagram.com/fjordtimber") + linkRow("heart", "Patreon", "patreon.com/fjordtimber"),
    hide_hashtag_section: () => `<div style="padding:10px 14px 0;font-size:13px;color:#3ea6ff">#cabin #norway #woodworking #offgrid</div>`,
    hide_info_cards_section: () => H("Info cards") + `<div style="display:flex;gap:10px;padding:0 14px;align-items:center">${thumb(2, "width:96px;border-radius:6px;flex:none")}<div style="font-size:12.5px">Part 1 of the build<div class="t2">Video</div></div></div>`,
    hide_explore_section: () => H("Explore more") + `<div style="margin:0 14px;padding:10px 12px;border-radius:12px;background:#2c2c2c;display:flex;gap:10px;align-items:center">${I("tv")}<div style="font-size:13px">Woodworking<div class="t2">Topic</div></div></div>`,
    hide_explore_course_section: () => H("Course") + `<div style="margin:0 14px;padding:10px 12px;border-radius:12px;background:#2c2c2c;display:flex;gap:10px;align-items:center">${thumb(3, "width:72px;border-radius:6px;flex:none")}<div style="font-size:13px">Timber framing basics<div class="t2">8 lessons · Free</div></div></div>`,
    hide_course_progress_section: () => `<div style="margin:10px 14px 0"><div style="font-size:12.5px">Lesson 3 of 8 completed</div><div style="height:4px;border-radius:2px;background:#3a3a3a;margin-top:6px"><div style="width:37%;height:4px;border-radius:2px;background:#3ea6ff"></div></div></div>`,
    hide_quizzes_section: () => H("Quiz") + `<div style="margin:0 14px;padding:10px 12px;border-radius:12px;border:1px solid #444;font-size:13px">Which joint holds the roof beam?<div style="display:flex;gap:6px;margin-top:8px">${["Mortise", "Dovetail", "Lap"].map(t => `<span class="chip" style="height:28px">${t}</span>`).join("")}</div></div>`,
    hide_explore_podcast_section: () => H("Podcast") + `<div style="display:flex;gap:10px;padding:0 14px;align-items:center"><div style="width:52px;height:52px;border-radius:8px;background:${ART[6]};flex:none"></div><div style="font-size:13px">Fjord & Timber Talks<div class="t2">Podcast · 32 episodes</div></div></div>`,
  };
  const sec = ([k, t, b]) => C(k, SEC[k] ? SEC[k]() : H(esc(t)) + `<div class="t2" style="padding:0 14px">${esc(b)}</div>`, { blk: 1 });
  return `<div style="background:#0f0f0f;height:350px;position:relative;overflow:hidden">
    <div style="height:84px;position:relative">${videoFrame(0)}</div>
    <div class="inner-scroll" style="position:absolute;left:0;right:0;top:70px;bottom:0;background:#212121;border-radius:14px 14px 0 0;overflow-y:auto;scrollbar-width:thin;padding-bottom:14px">
      <div style="width:36px;height:4px;border-radius:2px;background:#555;margin:8px auto 0"></div>
      <div style="display:flex;align-items:center;padding:6px 14px 2px;border-bottom:1px solid #333"><b style="font-size:17px;flex:1;padding:6px 0">Description</b>${I("close", "ico", 'style="width:20px;height:20px"')}</div>
      ${DESC.map(sec).join("")}
      <div style="display:flex;align-items:center;gap:10px;padding:16px 14px 6px;margin-top:10px;border-top:1px solid #333">${av(0, 36)}<div style="flex:1;min-width:0"><div class="t1">${VIDEOS[0].c}</div><div class="t2">412K subscribers</div></div>
        ${C("hide_subscribe_button", `<span class="chip" style="background:#f1f1f1;color:#0f0f0f;height:30px">Subscribe</span>`)}</div>
      <div style="display:flex;gap:8px;padding:6px 14px">${["Videos", "About"].map(t => `<span class="chip" style="height:32px;flex:1;justify-content:center;background:transparent;border:1px solid #555">${t}</span>`).join("")}</div>
    </div></div>`;
};

SCENES.ambient = () => {
  const off = !!V("morphe_disable_ambient_mode");
  const enh = !!V("morphe_enhanced_ambient_mode");
  const strength = enh ? Number(V("morphe_enhanced_ambient_mode_strength")) / 100 : .55;
  const blur = enh ? 30 + Number(V("morphe_enhanced_ambient_mode_blur")) : 40;
  return `<div style="background:#0f0f0f;height:300px;position:relative;overflow:hidden;padding:26px 30px">
    ${C("disable_ambient_mode", `<div style="position:absolute;inset:0;background:${ART[0]};filter:blur(${blur}px) saturate(1.6);opacity:${strength};transform:scale(1.1)"></div>`, { style: "position:absolute;left:10px;right:10px;top:6px;height:200px" })}
    <div style="position:relative;border-radius:12px;overflow:hidden">${thumb(0, "border-radius:0")}</div>
    <div style="position:relative;margin-top:14px"><div class="t1">${esc(VIDEOS[0].t)}</div><div class="t2">${VIDEOS[0].v} · ${VIDEOS[0].a}</div></div>
    ${enh ? `<div class="demo-label" style="top:auto;bottom:8px">Enhanced ambient mode</div>` : ""}${off ? "" : ""}
  </div>`;
};

const DANMAKU = ["8888888", "the stove!!", "cosy", "草", "need this cabin", "wow the view", "who else is here in 2026", "beautiful", "the snow sound", "lol", "this is so calming", "ASMR vibes"];
const danmakuClock = { phase: 0, last: 0, period: 1 };
SCENES.danmaku = () => {
  const on = !!V("morphe_niconico_comments");
  const fs = Number(V("morphe_niconico_comments_font_size")) || 20;
  const op = (Number(V("morphe_niconico_comments_opacity")) || 100) / 100;
  const area = (Number(V("morphe_niconico_comments_display_area")) || 100) / 100;
  const dur = Number(V("morphe_niconico_comments_travel_duration")) || 7;
  const lanes = Math.max(1, Math.floor(203 * area / (fs * .8)));
  // Keep the flight position across re-renders: phase advances with time at the old speed,
  // so changing size, opacity, area or duration never restarts the comments.
  const period = dur * .55, now = performance.now();
  if (danmakuClock.last) danmakuClock.phase += (now - danmakuClock.last) / 1000 / danmakuClock.period;
  danmakuClock.last = now; danmakuClock.period = period;
  const items = on ? DANMAKU.map((t, i) => { const f = (danmakuClock.phase + i * 1.7 / DANMAKU.length) % 1; return `<span style="position:absolute;white-space:nowrap;left:100%;top:${(i % lanes) * fs * .8}px;font-size:${fs * .6}px;font-weight:700;color:#fff;text-shadow:0 0 2px #000,0 0 2px #000;animation:fly ${period}s linear ${-f * period}s infinite">${esc(t)}</span>`; }).join("") : "";
  return `<div class="video">${videoFrame(0)}<div class="scrim" style="opacity:.15"></div>
    <style>@keyframes fly{from{transform:translateX(0)}to{transform:translateX(calc(-360px - 100%))}}</style>
    ${C("niconico_comments", `<div style="position:absolute;left:0;right:0;top:0;height:${area * 100}%;overflow:hidden;opacity:${op};outline:${on ? "1px dashed rgba(255,255,255,.18)" : "0"}">${items}</div>`, { style: "position:absolute;inset:0", also: "niconico_comments_display_area" })}
    ${on ? "" : `<div class="demo-label">Flying comments are off</div>`}
  </div>`;
};

SCENES.channel = () => `<div class="inner-scroll" style="background:#0f0f0f;height:350px;overflow-y:auto;scrollbar-width:thin">
  <div style="height:70px;background:${ART[3]}"></div>
  <div style="display:flex;gap:12px;padding:12px">${av(0, 64)}<div style="min-width:0"><div style="font-size:20px;font-weight:700">${VIDEOS[0].c}</div><div class="t2">@fjordtimber · 412K subscribers · 230 videos</div>
    ${C("hide_links_preview", `<div class="t2" style="color:#ddd;margin-top:4px">fjordtimber.no and 3 more links</div>`)}</div></div>
  <div style="display:flex;gap:8px;padding:0 12px 10px;flex-wrap:wrap">
    ${C("hide_subscribe_button_in_channel_page", `<span class="chip" style="background:#f1f1f1;color:#0f0f0f">Subscribe</span>`)}
    ${C("hide_join_button", `<span class="chip" style="background:transparent;border:1px solid #555">Join</span>`)}
    ${C("hide_store_button", `<span class="chip">${I("shop")} Store</span>`)}
    ${C("hide_community_button", `<span class="chip">${I("chat")} Community</span>`)}
  </div>
  <div style="display:flex;gap:18px;padding:6px 12px 0;border-bottom:1px solid #333;font-size:14px;font-weight:500">${["Home", "Videos", "Shorts", "Live", "Posts", "Store"].map((t, i) => `<span style="padding-bottom:8px;${i === 0 ? "border-bottom:2px solid #fff" : "color:#aaa"}">${t}</span>`).join("")}</div>
  ${C("hide_filter_bar_in_channel_page", `<div style="display:flex;gap:8px;padding:10px 12px">${["Latest", "Popular", "Oldest"].map((t, i) => `<span class="chip" style="height:28px;${i === 0 ? "background:#f1f1f1;color:#0f0f0f" : ""}">${t}</span>`).join("")}</div>`, { blk: 1 })}
  ${C("hide_members_shelf", `<div style="padding:8px 12px"><b style="font-size:15px">Members-only videos</b><div style="display:flex;gap:8px;margin-top:8px">${[4, 5].map(i => thumb(i, "width:150px;flex:none")).join("")}</div></div>`, { blk: 1 })}
  <div style="display:flex;gap:10px;padding:10px 12px"><div style="position:relative;width:150px;flex:none">${thumb(1)}${C("hide_members_only_chip", `<span style="position:absolute;left:4px;top:4px;background:#2ba640;font-size:10px;font-weight:700;padding:1px 5px;border-radius:3px">Members only</span>`, { tag: "span", style: "position:absolute;inset:0" })}</div><div><div class="t1" style="font-size:13px">Behind the build: the stove</div><div class="t2">Members only · 2 days ago</div></div></div>
  ${C("hide_posts_shelf", `<div style="margin:6px 12px 12px;border:1px solid #333;border-radius:12px;padding:12px"><b style="font-size:13px">Posts</b><div style="font-size:13px;margin-top:6px">Roof video drops Friday. What should we build next?</div></div>`, { blk: 1 })}
</div>`;

const EXPLORE = [["hide_music_menu", "music", "Music"], ["hide_movies_menu", "tv", "Movies & TV"], ["hide_live_menu", "speed", "Live"], ["hide_gaming_menu", "vr", "Gaming"], ["hide_news_menu", "list", "News"], ["hide_sports_menu", "fire", "Sports"], ["hide_learning_menu", "help", "Learning"], ["hide_courses_menu", "layers", "Courses"], ["hide_fashion_menu", "spark", "Fashion & Beauty"], ["hide_podcasts_menu", "mic", "Podcasts"], ["hide_playables_menu", "play", "Playables"], ["hide_shopping_menu", "shop", "Shopping"], ["hide_hype_menu", "fire", "Hype"], ["hide_memberships_menu", "you", "Memberships"]];
const MORE_YT = [["hide_youtube_premium_menu", "YouTube Premium"], ["hide_youtube_studio_menu", "YouTube Studio"], ["hide_youtube_music_menu", "YouTube Music"], ["hide_youtube_kids_menu", "YouTube Kids"], ["hide_youtube_create_menu", "YouTube Create"], ["hide_youtube_works_menu", "YouTube Works"]];
SCENES.explore = () => {
  const row = (k, ic, t, red) => C(k, `<div style="display:flex;align-items:center;gap:20px;padding:9px 18px">${I(ic, "ico", red ? 'style="fill:#ff0033"' : "")}<span style="font-size:14px">${t}</span></div>`, { blk: 1 });
  return `<div class="inner-scroll" style="background:#0f0f0f;height:350px;overflow-y:auto;scrollbar-width:thin">
    ${C("hide_explore_button", `<div style="padding:12px 18px 4px;font-size:16px;font-weight:700">Explore</div>`, { blk: 1 })}
    ${EXPLORE.map(([k, ic, t]) => row(k, ic, t)).join("")}
    <div style="padding:12px 18px 4px;font-size:16px;font-weight:700;border-top:1px solid #333;margin-top:6px">More from YouTube</div>
    ${MORE_YT.map(([k, t]) => row(k, "play", t, true)).join("")}
    ${C("hide_privacy_tos_footer", `<div class="t2" style="padding:12px 18px 16px">Privacy Policy · Terms of Service</div>`, { blk: 1 })}
  </div>`;
};

// Extra adapters on existing scenes, for coverage
def("description", "vis", DESC.map(d => d[0]).join(" ") + " hide_subscribe_button");
def("ambient", "vis", "disable_ambient_mode");
def("ambient", "style", "enhanced_ambient_mode enhanced_ambient_mode_strength enhanced_ambient_mode_blur");
def("danmaku", "behaviour", "niconico_comments");
def("danmaku", "style", "niconico_comments_font_size niconico_comments_opacity niconico_comments_display_area niconico_comments_travel_duration");
def("channel", "vis", "hide_links_preview hide_subscribe_button_in_channel_page hide_join_button hide_store_button hide_community_button hide_filter_bar_in_channel_page hide_members_shelf hide_members_only_chip hide_posts_shelf");
def("explore", "vis", ["hide_explore_button", "hide_privacy_tos_footer", ...EXPLORE.map(e => e[0]), ...MORE_YT.map(e => e[0])].join(" "));
def("watch", "vis", "hide_crowdfunding_box hide_emergency_box hide_medical_panels");
def("flyout", "vis", "hide_player_flyout_quality_header hide_player_flyout_quality_footer hide_player_flyout_captions_header hide_player_flyout_captions_footer hide_player_flyout_audio_track_footer");
def("comments", "vis", "hide_comments_top_fans_button hide_comments_gifs_and_images hide_comments_by_members_header");
def("feed", "vis", "hide_post_like_dislike_buttons hide_post_dislike_button hide_post_comment_button hide_post_share_button hide_post_comments_preview hide_horizontal_shelves hide_playables hide_surveys hide_ticket_shelf");
def("seekbar", "style", "fullscreen_large_seekbar");

// Patch extra components into existing scenes without rewriting them
{
  const wrap = (id, fn) => { const base = SCENES[id]; SCENES[id] = () => fn(base()); };
  wrap("comments", html => html
    .replace('<b style="font-size:16px">Comments</b>', `<b style="font-size:16px">Comments</b>${C("hide_comments_top_fans_button", `<span class="chip" style="height:24px;font-size:11px;padding:0 8px;background:#3a3a3a">Top fans</span>`, { tag: "span" })}`)
    .replace(/(Kom igjen! Taket trenger en egen video\.)/, `$1${C("hide_comments_gifs_and_images", `<div style="width:120px;height:68px;border-radius:8px;margin-top:6px;background:${ART[4]}"></div>`)}`)
    .replace(/(<div style="display:flex;align-items:center;gap:8px;padding:6px 12px 8px">)/, `${C("hide_comments_by_members_header", `<div style="margin:0 12px 6px;padding:6px 10px;border-radius:8px;background:#1f3324;font-size:12px">Comments by members</div>`, { blk: 1 })}$1`));
  wrap("feed", html => html
    .replace(/(<div style="display:flex;gap:16px;margin-top:10px" class="t2">)[\s\S]*?(<\/div><\/div>)/, `<div style="display:flex;gap:14px;margin-top:10px;align-items:center" class="t2">
      ${C("hide_post_like_dislike_buttons", `<span style="display:flex;gap:10px;align-items:center">${I("like", "ico", 'style="width:18px;height:18px;fill:#aaa"')}2.1K ${C("hide_post_dislike_button", I("dislike", "ico", 'style="width:18px;height:18px;fill:#aaa"'), { tag: "span" })}</span>`, { tag: "span" })}
      ${C("hide_post_comment_button", `<span style="display:flex;gap:4px;align-items:center">${I("comment", "ico", 'style="width:18px;height:18px;fill:#aaa"')}340</span>`, { tag: "span" })}
      ${C("hide_post_share_button", I("share", "ico", 'style="width:18px;height:18px;fill:#aaa"'), { tag: "span" })}</div>
      ${C("hide_post_comments_preview", `<div class="t2" style="margin-top:8px;color:#ccc">@sam: Because of a thin water layer!</div>`)}</div>`)
    .replace(/(<div class="c[^"]*" data-k="morphe_hide_mix_playlists")/, `${C("hide_horizontal_shelves", `<div style="padding:0 12px 14px"><b style="font-size:15px">Breaking news</b><div style="display:flex;gap:8px;margin-top:8px;overflow:hidden">${[1, 2, 3].map(i => thumb(i, "width:140px;flex:none")).join("")}</div></div>`, { blk: 1 })}
      ${C("hide_playables", `<div style="margin:0 12px 14px;padding:10px 12px;border-radius:12px;background:#1d2a3a;display:flex;gap:10px;align-items:center">${I("vr")}<div><div class="t1" style="font-size:13px">Playables</div><div class="t2">Play instant games on YouTube</div></div></div>`, { blk: 1 })}
      ${C("hide_surveys", `<div style="margin:0 12px 14px;padding:10px 12px;border-radius:12px;border:1px solid #333"><div class="t1" style="font-size:13px">How are your recommendations?</div><div style="display:flex;gap:6px;margin-top:8px">${["Great", "OK", "Bad"].map(t => `<span class="chip" style="height:26px">${t}</span>`).join("")}</div></div>`, { blk: 1 })}
      ${C("hide_ticket_shelf", `<div style="margin:0 12px 14px;padding:10px 12px;border-radius:12px;background:#272727"><div class="t1" style="font-size:13px">Tickets · Midnight Tapes live in Oslo</div><div class="t2">Sat, 21 Nov · Rockefeller</div></div>`, { blk: 1 })}$1`));
  wrap("seekbar", html => !V("morphe_custom_seekbar_thumb") ? html : html.replace('<div class="knob" id="knob" style="', `<div class="knob" id="knob" data-thumb="${V("morphe_custom_seekbar_thumb_scale_type") === "ORIGINAL" ? "big" : "fit"}" style="`));
  wrap("seekbar", html => V("morphe_fullscreen_large_seekbar") ? html.replace('id="seek" style="position:relative;left:0;right:0;height:4px;', 'id="seek" style="position:relative;left:0;right:0;height:9px;') : html);
}

// Player menu sub-sheets: the header and footer settings belong to the Quality, Captions and
// Audio track sheets, so selecting one of them opens that sheet in the preview.
const FLY_SUB = {
  morphe_hide_player_flyout_quality_header: "quality", morphe_hide_player_flyout_quality_footer: "quality",
  morphe_hide_player_flyout_captions_header: "captions", morphe_hide_player_flyout_captions_footer: "captions",
  morphe_hide_player_flyout_audio_track_footer: "audio",
};
let flySub = null;
{
  const base = SCENES.flyout;
  const opt = (t, sel, sub = "") => `<div style="display:flex;align-items:center;gap:14px;padding:10px 18px"><span style="width:20px;display:grid;place-items:center">${sel ? '<span style="width:8px;height:8px;border-radius:50%;background:#f1f1f1;display:block"></span>' : ""}</span><div><div style="font-size:14px">${t}</div>${sub ? `<div class="t2">${sub}</div>` : ""}</div></div>`;
  const SHEETS = {
    quality: () => `${C("hide_player_flyout_quality_header", `<div style="padding:2px 18px 8px;font-size:15px;font-weight:500">Quality for current video</div>`, { blk: 1 })}
      ${opt("Auto (recommended)", true, "Adjusts to give you the best experience")}${opt("Higher picture quality", false, "Uses more data")}${opt("Data saver", false, "Lower picture quality")}${opt("Advanced", false, "Select a specific resolution")}
      ${C("hide_player_flyout_quality_footer", `<div class="t2" style="padding:8px 18px 12px;border-top:1px solid #333;margin-top:4px">Applies to this video only. To change quality for all videos, go to Settings › Video quality preferences</div>`, { blk: 1 })}`,
    captions: () => `${C("hide_player_flyout_captions_header", `<div style="padding:2px 18px 8px;font-size:15px;font-weight:500">Captions</div>`, { blk: 1 })}
      ${opt("Turn off captions", true)}${opt("English (auto-generated)", false)}${opt("Norwegian", false)}${opt("Auto-translate", false)}
      ${C("hide_player_flyout_captions_footer", `<div style="padding:10px 18px 12px;border-top:1px solid #333;margin-top:4px;display:flex;align-items:center;gap:14px">${I("gear")}<span style="font-size:14px">Caption preferences</span></div>`, { blk: 1 })}`,
    audio: () => `<div style="padding:2px 18px 8px;font-size:15px;font-weight:500">Audio track</div>
      ${opt("English (original)", true)}${opt("Spanish (dubbed)", false)}${opt("German (dubbed)", false)}
      ${C("hide_player_flyout_audio_track_footer", `<div class="t2" style="padding:8px 18px 12px;border-top:1px solid #333;margin-top:4px">Dubbed tracks are generated automatically. The original track is marked as original.</div>`, { blk: 1 })}`,
  };
  SCENES.flyout = () => {
    flySub = FLY_SUB[selected] || null;
    if (!flySub) return base();
    return `<div style="background:#0f0f0f;height:350px;position:relative;overflow:hidden">
      <div style="height:100px;position:relative">${videoFrame(4)}<div class="scrim" style="opacity:.6"></div></div>
      <div style="position:absolute;left:0;right:0;top:56px;bottom:0;background:#212121;border-radius:14px 14px 0 0;overflow-y:auto;scrollbar-width:thin" class="inner-scroll">
        <div style="width:36px;height:4px;border-radius:2px;background:#555;margin:8px auto 6px"></div>
        ${SHEETS[flySub]()}
      </div></div>`;
  };
}

// ------------------------------------------------------------------ scenario animations (standard canvas)
// Every scenario uses the same frame: fade the preview to black (220 ms), caption top-left with the
// setting and its new state, device illustration in the middle, one-line outcome at the bottom,
// a progress line, then fade back (220 ms). Body length is SC_HOLD.
const SC_FADE = 220, SC_HOLD = 3000;
const SCN_HOLD = {}; // per-scenario body length when a story needs longer than SC_HOLD
const SCN = {};
const scen = (section, keys, fn) => keys.split(/\s+/).forEach(k => { A["morphe_" + k] = { section, kind: "scenario" }; SCN["morphe_" + k] = fn; });
// Device illustration. Content that depends on orientation goes in .dv-video (the player area)
// and .dv-below (the page under the player); CSS lays both out for .port and .land, so a
// scenario can rotate the phone with rotate() and nothing ends up covering anything else.
const DEV_SIZE = { port: [92, 172], land: [190, 108], duo: [206, 186] };
// Two phones side by side (stock on the left, the setting on the right), scaled together as one.
const duo7 = (left, right) => `<div class="duo7"><div class="dl7"><span>Off</span>${device("port", left)}</div><div class="dl7"><span class="on">On</span>${device("port", right)}</div></div>`;
function device(orient, inner, extra = "") {
  const [w, h] = DEV_SIZE[orient];
  return `<div class="dev ${orient}" style="width:${w}px;height:${h}px;${extra}"><div class="waves l"></div><div class="waves r"></div>${inner}<div class="finger" id="scFinger">${I("gesture")}</div></div>`;
}
const playerArea = (i, overlay = "") => `<div class="dv-video" style="background:${ART[i]}">${overlay}</div><div class="dv-below"><i></i><i></i><i></i></div>`;
function rotate(dev, orient) { const [w, h] = DEV_SIZE[orient]; dev.classList.remove("port", "land"); dev.classList.add(orient); dev.style.width = w + "px"; dev.style.height = h + "px"; fitDev(orient); }
// The phone in a scenario is drawn at a fixed small size (so all coordinates stay simple) and then
// scaled up to fill the space the canvas has, between the caption line and the footer.
function fitScale(w, h) {
  const canvas = $("canvas"), sit = canvas.querySelector(".sit"), availW = canvas.clientWidth - 28, availH = canvas.clientHeight - 64 - (sit ? sit.offsetHeight + 8 : 0) - 10;
  return Math.max(.35, Math.min(3, availW / (w + 6), availH / (h + 6)));
}
function fitDev(orient) {
  const canvas = $("canvas"), box = canvas.querySelector(".scbox"), duo = box && box.querySelector(".duo7"), dev = duo || (box && box.querySelector(".dev")); if (!dev) return;
  const o = duo ? "duo" : orient || (dev.classList.contains("land") ? "land" : "port"), [w, h] = DEV_SIZE[o];
  const sc = fitScale(w, h);
  dev.style.scale = sc.toFixed(3);
  box.style.width = Math.round((w + 6) * sc) + "px"; box.style.height = Math.round((h + 6) * sc) + "px";
}
const devScale = dev => (dev.getBoundingClientRect().width / (dev.offsetWidth || 1)) || 1;
function situation(text) { const el = document.querySelector("#canvas .sit"); if (!el) return; el.style.opacity = 0; setTimeout(() => { el.textContent = text; el.style.opacity = 1; }, 160); }
function setFoot(text) { const el = document.querySelector("#canvas .foot"); if (el) el.textContent = text; }
function buzz(dev, on) {
  if (!on) return;
  dev.classList.remove("buzz"); void dev.offsetWidth; dev.classList.add("buzz");
  dev.querySelectorAll(".waves").forEach(w => { w.classList.remove("go"); void w.offsetWidth; w.classList.add("go"); });
  try { navigator.vibrate && navigator.vibrate(40); } catch { /* not supported */ }
}
// steps belong to the scenario that scheduled them; a replaced scenario never runs its leftover steps
const at = (ms, f) => { const tk = scenarioToken; return setTimeout(() => { if (tk.alive && tk === scenarioToken) f(); }, ms); };
function fingerTo(f, x, y, ms = 0) { f.style.transition = ms ? `left ${ms}ms var(--ease), top ${ms}ms var(--ease), opacity 120ms` : "opacity 120ms"; f.style.left = x + "px"; f.style.top = y + "px"; f.classList.add("show"); }
function tapF(f) { f.classList.remove("tap"); void f.offsetWidth; f.classList.add("tap"); }
const miniSeek = (pct = 30, marks = []) => `<div class="msk" style="position:absolute;left:8%;right:8%;bottom:16%;height:3px;background:rgba(255,255,255,.3)"><div class="mp" style="position:absolute;left:0;top:0;bottom:0;width:${pct}%;background:#ff0033;transition:width .9s linear"></div>${marks.map(m => `<i style="position:absolute;left:${m}%;top:-1px;width:2px;height:5px;background:#000"></i>`).join("")}</div>`;
const miniVideo = (i = 0, h = "100%") => `<div style="position:absolute;left:0;right:0;top:0;height:${h};background:${ART[i]}"></div>`;
function haptic(eventLabel, script) {
  return (box, disabled) => {
    const portrait = script.portrait;
    box.innerHTML = device(portrait ? "port" : "land", portrait ? `${miniVideo(1, "34%")}<div style="position:absolute;left:0;right:0;top:34%;bottom:0;background:#0f0f0f"></div>` : `${miniVideo(1)}${miniSeek(30, [45, 62, 80])}`);
    const dev = box.querySelector(".dev"), f = box.querySelector("#scFinger");
    script.run(dev, f, () => buzz(dev, !disabled));
    return disabled ? `${eventLabel}: no vibration` : `${eventLabel}: phone vibrates`;
  };
}
scen("seekbar", "disable_haptic_feedback_chapters", haptic("Crossing a chapter", { run(dev, f, b) {
  const W = dev.clientWidth, H = dev.clientHeight, y = H * .84 - 2, x0 = W * .3;
  at(100, () => fingerTo(f, x0, y)); at(300, () => { fingerTo(f, W * .85, y, 1500); dev.querySelector(".mp").style.width = "85%"; });
  [0.45, 0.62, 0.80].forEach(m => at(300 + 1500 * (m * W - x0) / (W * .85 - x0), b));
} }));
scen("seekbar", "disable_haptic_feedback_precise_seeking", haptic("Entering precise seeking", { run(dev, f, b) {
  const W = dev.clientWidth, H = dev.clientHeight;
  at(100, () => fingerTo(f, W * .4, H * .84)); at(400, () => fingerTo(f, W * .4, H * .45, 600));
  at(1000, () => { b(); dev.insertAdjacentHTML("beforeend", `<div style="position:absolute;left:6%;right:6%;top:30%;display:flex;gap:2px">${[1, 2, 3, 4].map(i => `<div style="flex:1;aspect-ratio:16/9;background:${ART[i]}"></div>`).join("")}</div>`); });
} }));
scen("seekbar", "disable_haptic_feedback_seek_undo", haptic("Release to cancel", { run(dev, f, b) {
  const W = dev.clientWidth, H = dev.clientHeight;
  at(100, () => fingerTo(f, W * .3, H * .84)); at(300, () => { fingerTo(f, W * .7, H * .84, 700); dev.querySelector(".mp").style.width = "70%"; });
  at(1100, () => fingerTo(f, W * .7, H * .2, 500)); at(1600, () => { b(); dev.querySelector(".mp").style.width = "30%"; dev.insertAdjacentHTML("beforeend", `<div class="toastin" style="top:8px;font-size:9px">Release to cancel</div>`); });
} }));
scen("seekbar", "disable_haptic_feedback_tap_and_hold", haptic("Tap and hold for 2x", { run(dev, f, b) {
  const W = dev.clientWidth, H = dev.clientHeight;
  at(150, () => { fingerTo(f, W * .55, H * .45); f.classList.add("hold"); }); at(800, () => { b(); dev.insertAdjacentHTML("beforeend", `<div class="toastin" style="top:8px;font-size:9px">2x ▸▸</div>`); });
  at(2000, () => f.classList.remove("hold"));
} }));
scen("seekbar", "disable_haptic_feedback_zoom", haptic("Pinch to zoom snaps to fill", { run(dev, f, b) {
  const W = dev.clientWidth, H = dev.clientHeight; const v = dev.firstElementChild.nextElementSibling.nextElementSibling;
  at(150, () => fingerTo(f, W * .45, H * .5)); at(400, () => { fingerTo(f, W * .8, H * .25, 700); v.style.transition = "transform .7s"; v.style.transform = "scale(1.25)"; });
  at(1100, () => { b(); dev.insertAdjacentHTML("beforeend", `<div class="toastin" style="top:8px;font-size:9px">Zoomed to fill</div>`); });
} }));
scen("fullscreen", "swipe_haptic_feedback", (box, on) => {
  box.innerHTML = device("land", `${miniVideo(6)}`);
  const dev = box.querySelector(".dev"), f = box.querySelector("#scFinger"); const W = dev.clientWidth, H = dev.clientHeight;
  at(100, () => fingerTo(f, W * .82, H * .8)); at(300, () => fingerTo(f, W * .82, H * .2, 1400));
  [500, 800, 1100, 1400].forEach(t => at(t, () => buzz(dev, on)));
  return on ? "Swiping volume or brightness: a tick at each step" : "Swiping volume or brightness: no ticks";
});
// Where a component really sits in the live preview, as fractions of its video frame, so a
// scenario draws its button in the same place. Measured before the canvas covers the stage;
// the fallback is used when the component is not on screen (switched off or in the tray).
function anchor(k, fx, fy) {
  const el = [...document.querySelectorAll(`#stage [data-k="${k}"]`)].find(e => e.offsetParent && !e.classList.contains("intray"));
  const frame = el && el.closest(".video");
  if (!el || !frame) return [fx, fy];
  const r = el.getBoundingClientRect(), b = frame.getBoundingClientRect();
  if (!r.width || !b.width) return [fx, fy];
  return [(r.left + r.width / 2 - b.left) / b.width, (r.top + r.height / 2 - b.top) / b.height];
}
const at_ = (fx, fy, size) => `position:absolute;left:calc(${(fx * 100).toFixed(1)}% - ${size / 2}px);top:calc(${(fy * 100).toFixed(1)}% - ${size / 2}px);width:${size}px;height:${size}px`;
scen("player", "fullscreen_video_scale_button_fullscreen_only", (box, on) => {
  const [fx, fy] = anchor("morphe_fullscreen_video_scale_button", .78, .86);
  const btn = `<div class="scb" style="${at_(fx, fy, 18)};border-radius:5px;background:rgba(0,0,0,.45);display:grid;place-items:center;transition:opacity .4s var(--ease)">${I("crop", "ico", 'style="width:13px;height:13px"')}</div>`;
  box.innerHTML = device("port", playerArea(0, btn));
  const dev = box.querySelector(".dev"), b = box.querySelector(".scb");
  // Start in the new state: with the option on, the portrait player never shows the button.
  situation("Portrait player");
  b.style.opacity = on ? "0" : "1";
  setFoot(on ? "Portrait: no video scale button" : "Portrait: the button is shown");
  at(1300, () => { situation("Fullscreen"); rotate(dev, "land"); b.style.opacity = "1"; setFoot("Fullscreen: the button is shown"); });
  at(2500, () => { situation("Portrait player"); rotate(dev, "port"); b.style.opacity = on ? "0" : "1"; setFoot(on ? "Back in portrait: hidden again" : "Back in portrait: still shown"); });
  return on ? "Portrait: no video scale button" : "Portrait: the button is shown";
});
scen("player", "copy_video_link_with_timestamp_button", (box, on) => {
  const [fx, fy] = anchor("morphe_copy_video_link_button", .8, .86);
  box.innerHTML = device("land", `${miniVideo(0)}<div style="${at_(fx, fy, 18)};display:grid;place-items:center;border-radius:50%;background:rgba(0,0,0,.3)">${I("link", "ico", 'style="width:13px;height:13px"')}</div>${miniSeek(17)}`);
  const dev = box.querySelector(".dev"), f = box.querySelector("#scFinger"); const W = dev.clientWidth, H = dev.clientHeight;
  const toast = t => { dev.querySelectorAll(".toastin").forEach(e => e.remove()); dev.insertAdjacentHTML("beforeend", `<div class="toastin" style="top:8px;font-size:9px">${t}</div>`); };
  at(100, () => fingerTo(f, W * fx, H * fy)); at(450, () => tapF(f));
  at(600, () => { situation("Tap"); toast(`Copied: youtu.be/cAb1n${on ? "?t=192" : ""}`); });
  at(1500, () => f.classList.add("hold")); at(2000, () => { f.classList.remove("hold"); situation("Tap and hold"); toast(`Copied: youtu.be/cAb1n${on ? "" : "?t=192"}`); });
  return on ? "Tap copies the link with the current time; hold copies it without" : "Tap copies the plain link; hold adds the current time";
});
scen("player", "loop_video", (box, on) => {
  box.innerHTML = device("land", `${miniVideo(2)}${miniSeek(80)}`);
  const dev = box.querySelector(".dev"); const mp = dev.querySelector(".mp");
  at(100, () => { mp.style.width = "100%"; });
  at(1100, () => { if (on) { mp.style.transition = "none"; mp.style.width = "0%"; dev.insertAdjacentHTML("beforeend", `<div class="toastin" style="top:40%;font-size:10px">⟲ Replaying</div>`); } else dev.insertAdjacentHTML("beforeend", `<div style="position:absolute;inset:0;background:rgba(0,0,0,.6);display:grid;place-items:center;font-size:10px">Up next</div>`); });
  return on ? "At the end the video starts again" : "At the end YouTube moves on";
});
scen("shorts", "shorts_autoplay", (box, on) => {
  situation("A Short is ending");
  box.innerHTML = device("port", `<div class="sh" style="position:absolute;left:0;right:0;top:0;height:200%;transition:transform .5s var(--ease)"><div style="height:50%;background:${ART[5]}"></div><div style="height:50%;background:${ART[7]}"></div></div>${miniSeek(70)}`);
  const dev = box.querySelector(".dev"); const mp = dev.querySelector(".mp");
  at(100, () => { mp.style.width = "100%"; });
  at(1100, () => { mp.style.transition = "none"; mp.style.width = "0%"; if (on) dev.querySelector(".sh").style.transform = "translateY(-50%)"; else dev.insertAdjacentHTML("beforeend", `<div class="toastin" style="top:40%;font-size:9px">⟲ Repeats</div>`); });
  return on ? "When a Short ends, the next one starts" : "When a Short ends, it repeats";
});
scen("seekbar", "disable_chapter_skip_double_tap", (box, disabled) => {
  box.innerHTML = device("land", `${miniVideo(3)}${miniSeek(30, [45, 70])}`);
  const dev = box.querySelector(".dev"), f = box.querySelector("#scFinger"); const W = dev.clientWidth, H = dev.clientHeight;
  at(100, () => fingerTo(f, W * .8, H * .45)); at(350, () => tapF(f)); at(550, () => tapF(f));
  at(700, () => { dev.querySelector(".mp").style.width = disabled ? "35%" : "45%"; dev.insertAdjacentHTML("beforeend", `<div class="toastin" style="top:8px;font-size:9px">${disabled ? "+10 seconds" : "Next chapter ▸"}</div>`); });
  return disabled ? "Double-tap skips 10 seconds" : "Double-tap can jump to the next chapter (stock)";
});
scen("seekbar", "speed_tap_and_hold", (box) => {
  const v = state.morphe_speed_tap_and_hold;
  box.innerHTML = device("land", `${miniVideo(4)}${miniSeek(30)}`);
  const dev = box.querySelector(".dev"), f = box.querySelector("#scFinger"); const W = dev.clientWidth, H = dev.clientHeight;
  at(150, () => { fingerTo(f, W * .5, H * .45); f.classList.add("hold"); });
  at(600, () => { dev.querySelector(".mp").style.transition = "width 1.2s linear"; dev.querySelector(".mp").style.width = "75%"; dev.insertAdjacentHTML("beforeend", `<div class="toastin" style="top:8px;font-size:9px">${v}x ▸▸</div>`); });
  at(2000, () => f.classList.remove("hold"));
  return `Hold the video: plays at ${v}x`;
});

// ------------------------------------------------------------------ YouTube version model
// The preview follows the YouTube build being patched. Versions are the targets Morphe lists in
// patches/.../youtube/shared/Constants.kt. Rules mirror version checks in Settings.java:
//   MINIPLAYER_TYPE default is MODERN_4 on 21.29+, where YouTube removed the other types,
//   VIDEO_ACTION_BAR_LAYOUT default is DEFAULT (channel inside the action bar) on 21.36+, CLASSIC before.
// The native editor will not need a picker: the patched app knows its own version.
const YT_VERSIONS = ["21.45.82", "21.44.528", "21.43.523", "21.30.216", "21.28.208", "21.23.492", "20.51.39", "20.26.46"];
const YT_EXPERIMENTAL = new Set(["21.45.82", "21.44.528", "21.43.523"]);
let ytVersion = YT_VERSIONS[0];
const vNum = v => v.split(".").slice(0, 2).map(Number);
const ytAtLeast = (maj, min) => { const [a, b] = vNum(ytVersion); return a > maj || (a === maj && b >= min); };
// Everything below is driven by the catalogue, so new version checks in Morphe show up here
// after regenerating it: "when" (preference only registered on some versions), "entryVariants"
// (list entries that differ by version), "versionDefault" (default that differs by version) and
// "availability" (Setting.Availability rules, which can also depend on the version).
const ytV = (maj, min) => ytAtLeast(maj, min);
const unknownAssume = name => !/spoof/i.test(name); // device checks pass; "is spoofing" checks do not
const compiled = new Map();
function evalRule(expr, getter) {
  if (!expr) return true;
  let fn = compiled.get(expr);
  if (fn === undefined) { try { fn = new Function("S", "V", "U", `return (${expr});`); } catch { fn = null; } compiled.set(expr, fn); }
  if (!fn) return true;
  try { return !!fn(getter, ytV, unknownAssume); } catch { return true; }
}
const inVersion = k => { const p = PREF[k]; return !p || evalRule(p.when, () => null); };
const availOk = k => { const p = PREF[k]; return !p || !p.availability || evalRule(p.availability, x => (x in PREF ? V(x) : null)); };
// Lists Morphe builds at runtime (caption languages from YouTube's translation list, the user's own
// custom speeds). The preview uses a representative copy.
const LANGS = [["en", "English"], ["es", "Spanish"], ["fr", "French"], ["de", "German"], ["it", "Italian"], ["pt", "Portuguese"], ["ja", "Japanese"], ["ko", "Korean"], ["zh-Hans", "Chinese (Simplified)"], ["ru", "Russian"], ["ar", "Arabic"], ["hi", "Hindi"]];
const CAP_LINE = { en: "the pancake needs to rest for one minute", es: "el panqueque necesita reposar un minuto", fr: "la crêpe doit reposer une minute", de: "der Pfannkuchen muss eine Minute ruhen", it: "il pancake deve riposare un minuto", pt: "a panqueca precisa descansar um minuto", ja: "パンケーキは1分休ませます", ko: "팬케이크는 1분 동안 두세요", "zh-Hans": "煎饼需要静置一分钟", ru: "блину нужно отдохнуть минуту", ar: "تحتاج الفطيرة إلى الراحة لمدة دقيقة", hi: "पैनकेक को एक मिनट आराम चाहिए" };
const speedList = () => String(V("morphe_custom_playback_speeds") || "0.25 0.5 0.75 1.0 1.25 1.5 1.75 2.0").split(/[\s,]+/).filter(Boolean).map(Number).filter(n => n > 0);
const RUNTIME_ENTRIES = {
  morphe_preferred_caption_language: () => [{ label: "Off", value: "off" }, { label: "App language", value: "default" }, ...LANGS.map(([v, l]) => ({ label: l, value: v }))],
  morphe_secondary_caption_language: () => [{ label: "Off", value: "off" }, ...LANGS.map(([v, l]) => ({ label: l, value: v }))],
  morphe_playback_speed_default: () => [{ label: "Auto", value: "-2.0" }, ...speedList().map(n => ({ label: n + "x", value: String(n) }))],
  morphe_shorts_playback_speed_default: () => [{ label: "Auto", value: "-2.0" }, ...speedList().map(n => ({ label: n + "x", value: String(n) }))],
  morphe_playback_audio_pitch_default: () => [{ label: "Auto", value: "-2.0" }, ...[0.5, 0.75, 0.9, 1.1, 1.25, 1.5].map(n => ({ label: n + "x", value: String(n) }))],
};
// "Off or a choice" lists show as a switch; the choice appears under it once switched on.
const OFF_LIST = new Set(["morphe_secondary_caption_language"]);
const offListPick = {};
function entriesFor(k) {
  if (RUNTIME_ENTRIES[k]) return RUNTIME_ENTRIES[k]();
  const p = PREF[k];
  const v = (p.entryVariants || []).find(x => evalRule(x.when, () => null));
  return v ? v.entries : (p.entries || []);
}
function versionDefault(k) { const d = PREF[k].versionDefault; return d ? (evalRule(d.when, () => null) ? d.then : d.else) : undefined; }
function applyVersion() {
  for (const k in PREF) {
    const p = PREF[k];
    const nd = versionDefault(k);
    const vals = entriesFor(k).map(e => e.value);
    const target = nd !== undefined ? nd : defaults[k];
    const fix = v => { let x = v === defaults[k] ? target : v; if (vals.length && !vals.includes(String(x))) x = vals.includes(String(target)) ? target : vals[0]; return x; };
    if (nd !== undefined || (p.entryVariants && vals.length)) {
      state[k] = coerceVal(k, fix(state[k])); baseline[k] = coerceVal(k, fix(baseline[k]));
      defaults[k] = coerceVal(k, vals.length && !vals.includes(String(target)) ? vals[0] : target);
      if (nd !== undefined) STOCK[k] = defaults[k];
    }
  }
  if (selected && !inVersion(selected)) selected = null;
}
function coerceVal(k, v) { const t = PREF[k].type; return (t === "integer" || t === "long" || t === "float") && v !== "" && v != null ? Number(v) : v; }

// ------------------------------------------------------------------ watch page, per action bar layout
SCENES.watch = () => {
  const layout = V("morphe_video_action_bar_layout");
  const modern = layout === "DEFAULT", minimal = layout === "MINIMAL", two = layout === "CLASSIC_TWO_ROWS";
  const ryd = !!V("morphe_ryd_enabled");
  const dislike = ryd ? (V("morphe_ryd_dislike_percentage") ? "4%" : "2.1K") : "";
  const act = (k, icon, label) => C(k, `<div class="chip" ${minimal ? 'style="padding:0 9px"' : ""}>${I(icon)}${minimal ? "" : label}</div>`);
  const likeChip = C("hide_like_dislike_button", `<div class="chip likechip" style="padding:0;gap:0"><span style="display:flex;gap:6px;align-items:center;padding:0 10px 0 12px;border-right:1px solid #444">${I("like")}${minimal ? "" : `<span class="rollnum" data-n="48">48K</span>`}</span><span style="padding:0 12px;display:flex;gap:6px;align-items:center">${I("dislike")}${C("ryd_enabled", minimal || !dislike ? "" : `<span>${dislike}</span>`, { tag: "span", also: "ryd_dislike_percentage" })}</span></div>`);
  // 21.36+ default layout: the channel lives at the start of the action bar ("compact_channel_bar").
  const channelChip = C("hide_channel_profile_button", `<div class="chip" style="padding:0 4px 0 4px;gap:6px">${C("hide_channel_bar", av(0, 26), { tag: "span" })}${minimal ? "" : `<span style="font-size:12.5px">Fjord & Timber</span>`}${C("hide_channel_profile_subscribe_button", `<span class="chip" style="height:26px;background:#f1f1f1;color:#0f0f0f;font-size:12px;padding:0 10px">Subscribe</span>`, { tag: "span" })}</div>`);
  const joinChip = C("hide_join_membership_button", `<div class="chip" style="background:transparent;border:1px solid #555">${minimal ? I("heart") : "Join"}</div>`);
  const actions = [modern || minimal ? channelChip + joinChip : "", likeChip, act("hide_comments_button", "comment", "1.2K"), act("hide_share_button", "share", "Share"), act("hide_remix_button", "remix", "Remix"), act("hide_thanks_button", "dollar", "Thanks"),
    act("hide_download_button", "dl", "Download"), act("hide_clip_button", "clip", "Clip"), act("hide_save_button", "save", "Save"), act("hide_ask_button", "spark", "Ask"),
    act("hide_hype_button", "fire", "Hype"), act("hide_shop_button", "shop", "Shop"), act("hide_connect_button", "link", "Connect"), act("hide_promote_button", "speed", "Promote"), act("hide_stop_ads_button", "close", "Stop ads"),
    act("hide_report_button", "flag", "Report"), act("hide_more_button", "moreh", "")].join("");
  const rowStyle = two ? "display:flex;flex-wrap:wrap;gap:8px" : "display:flex;gap:8px;overflow-x:auto;scrollbar-width:none";
  const classicBar = C("hide_channel_bar", `<div style="display:flex;align-items:center;gap:10px;padding:10px 12px">${av(0, 32)}<div style="flex:1;min-width:0"><span class="t1">${VIDEOS[0].c}</span> <span class="t2">412K</span></div>
      ${C("hide_join_membership_button", `<div class="chip" style="background:transparent;border:1px solid #555">Join</div>`)}
      <div class="chip" style="background:#f1f1f1;color:#0f0f0f">Subscribe</div></div>`, { blk: 1 });
  return `<div style="background:#0f0f0f;height:330px;overflow-y:auto;scrollbar-width:thin" class="inner-scroll">
    <div style="height:96px;position:relative">${videoFrame(0)}<div class="seek" style="bottom:0;left:0;right:0;border-radius:0"><div class="played" style="width:30%"></div></div></div>
    <div style="padding:10px 12px ${modern ? 8 : 0}px">
      <div style="font-size:17px;font-weight:500;line-height:1.3">${esc(VIDEOS[0].t)}</div>
      <div class="t2" style="margin-top:4px"><span class="rollnum" data-n="1.2">1.2M</span> views · ${VIDEOS[0].a} <b style="color:#fff">...more</b></div>
    </div>
    ${modern || minimal ? "" : classicBar}
    ${C("hide_action_bar", `<div style="${rowStyle};padding:12px 12px 10px;margin-top:-12px">${actions}</div>`, { blk: 1 })}
    ${C("hide_comments_section", `<div style="margin:0 12px 10px;background:#272727;border-radius:12px;padding:10px 12px">
        <div class="t1">Comments <span class="t2">1.2K</span></div>
        ${C("hide_comments_preview_comment", `<div style="display:flex;gap:8px;margin-top:8px;align-items:center">${av(4, 24)}<div class="t2" style="color:#ddd;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">The wood stove at 12:04 is pure cosiness</div></div>`)}
      </div>`, { blk: 1 })}
    ${C("hide_info_panels", `<div style="margin:0 12px 10px;border:1px solid #333;border-radius:12px;padding:10px 12px;display:flex;gap:10px">${I("info", "ico", 'style="fill:#aaa;flex:none"')}<div><div class="t1" style="font-size:13px">Norway · Context</div><div class="t2">Norway is a Nordic country in Northern Europe. Wikipedia</div></div></div>`, { blk: 1 })}
    ${C("hide_player_related_videos", `<div style="padding:0 12px 12px;display:grid;gap:10px">${[2, 3].map(i => `<div style="display:flex;gap:10px">${thumb(i, "width:150px;flex:none")}<div style="min-width:0"><div class="t1" style="font-size:13px">${esc(VIDEOS[i].t)}</div><div class="t2">${VIDEOS[i].c} · ${VIDEOS[i].v}</div></div></div>`).join("")}</div>`, { blk: 1 })}
  </div>`;
};
def("watch", "vis", "hide_channel_profile_button hide_channel_profile_subscribe_button hide_comments_button hide_connect_button");
def("watch", "style", "ryd_enabled ryd_dislike_percentage");
// Extra panels (emergency, medical, crowdfunding) go above the related videos on every layout.
const watchExtras = html => html
    .replace(/(<div class="c[^"]*" data-k="morphe_hide_player_related_videos")/, `${C("hide_emergency_box", `<div style="margin:0 12px 10px;background:#3b1f1f;border-radius:12px;padding:10px 12px"><div class="t1" style="font-size:13px">Emergency information</div><div class="t2">Call 112 for emergency services in Norway</div></div>`, { blk: 1 })}
      ${C("hide_medical_panels", `<div style="margin:0 12px 10px;border:1px solid #333;border-radius:12px;padding:10px 12px"><div class="t1" style="font-size:13px">Health info from a licensed source</div><div class="t2">Carbon monoxide safety · NHS</div></div>`, { blk: 1 })}
      ${C("hide_crowdfunding_box", `<div style="margin:0 12px 10px;background:#272727;border-radius:12px;padding:10px 12px;display:flex;gap:10px;align-items:center">${I("heart", "ico", 'style="fill:#f06292;flex:none"')}<div><div class="t1" style="font-size:13px">Support the cabin on Patreon</div><div class="t2">Crowdfunding</div></div></div>`, { blk: 1 })}$1`);
{ const base = SCENES.watch; SCENES.watch = () => watchExtras(base()); }

// ------------------------------------------------------------------ miniplayer, one design per type
SCENES.miniplayer = () => {
  const type = V("morphe_miniplayer_type");
  const round = !V("morphe_miniplayer_disable_rounded_corners");
  const glass = !!V("morphe_miniplayer_glass");
  const docked = !!V("morphe_miniplayer_docked");
  const op = Number(V("morphe_miniplayer_opacity")) / 100;
  const w = Math.max(130, Math.min(260, Number(V("morphe_miniplayer_width_dip")) || 192));
  const ttl = (extra = "") => C("miniplayer_hide_title", `<div style="min-width:0;${extra}"><div style="font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(VIDEOS[0].t)}</div><div class="t2" style="font-size:11px">${VIDEOS[0].c}</div></div>`, { style: "flex:1;min-width:0" });
  const ic = (n, s = 20) => I(n, "ico", `style="width:${s}px;height:${s}px"`);
  const surface = glass ? "background:rgba(40,40,40,.55);backdrop-filter:blur(14px) saturate(1.4);-webkit-backdrop-filter:blur(14px) saturate(1.4);border:1px solid rgba(255,255,255,.12)" : "background:#212121";
  const radius = round || glass ? 14 : 0;
  const prog = `<div style="position:absolute;left:0;right:0;bottom:0;height:2px;background:rgba(255,255,255,.25)"><div style="width:30%;height:2px;background:#ff0033"></div></div>`;
  const pos = docked ? "right:0;bottom:52px" : "right:10px;bottom:62px";
  let mini = "";
  if (type === "DISABLED") mini = `<div class="demo-label" style="top:auto;bottom:66px;left:12px">Miniplayer disabled: closing the player stops the video</div>`;
  else if (type === "DEFAULT" || type === "MINIMAL" || type === "MINIMAL_BAR" || type === "MINIMAL_BAR_2") {
    // Bar miniplayers: a strip above the navigation bar.
    const minimal = type !== "DEFAULT";
    const bar2 = type === "MINIMAL_BAR_2";
    mini = `<div class="mini" style="position:absolute;left:${docked || !glass ? 0 : 8}px;right:${docked || !glass ? 0 : 8}px;bottom:${docked || !glass ? 52 : 60}px;${surface};border-radius:${docked ? 0 : glass ? 14 : 0}px;overflow:hidden;display:flex;align-items:center;gap:10px;padding-right:6px;opacity:${op};height:${bar2 ? 44 : 54}px">
      <div style="width:${minimal ? (bar2 ? 0 : 64) : 96}px;flex:none;display:${bar2 ? "none" : "block"}">${thumb(0, "border-radius:0")}</div>
      ${bar2 ? `<div style="width:8px"></div>` : ""}${ttl()}
      ${C("miniplayer_hide_overlay_buttons", `<div style="display:flex">${minimal ? "" : `<span style="margin:6px">${ic("prev")}</span>`}<span style="margin:6px">${ic("pause", 24)}</span>${minimal ? "" : `<span style="margin:6px">${ic("next")}</span>`}<span style="margin:6px">${ic("close")}</span></div>`)}
      ${prog}</div>`;
  } else {
    // Floating miniplayers (Modern 1 to 4). Each type draws its controls differently.
    const ov = {
      MODERN_1: `<div style="position:absolute;inset:0;background:rgba(0,0,0,.35);display:flex;justify-content:space-between;padding:4px">${ic("full", 18)}<div style="display:flex;gap:12px;align-self:center">${ic("prev")}${ic("pause", 28)}${ic("next")}</div>${ic("close", 18)}</div>`,
      MODERN_2: `<div style="position:absolute;inset:0;background:linear-gradient(rgba(0,0,0,.55),transparent 40%,transparent 60%,rgba(0,0,0,.55));padding:4px"><div style="display:flex;justify-content:space-between">${ic("full", 18)}${ic("close", 18)}</div><div style="position:absolute;left:0;right:0;bottom:6px;display:flex;justify-content:center;gap:18px">${ic("reload", 18)}${ic("pause", 22)}${ic("reload", 18).replace("<svg", '<svg style="transform:scaleX(-1)"')}</div></div>`,
      MODERN_3: `<div style="position:absolute;right:4px;top:4px;display:flex;gap:6px;background:rgba(0,0,0,.45);border-radius:12px;padding:2px 6px">${ic("pause", 18)}${ic("close", 18)}</div>`,
      MODERN_4: `<div style="position:absolute;inset:0;display:grid;place-items:center;background:rgba(0,0,0,.25)"><div style="width:40px;height:40px;border-radius:50%;background:rgba(0,0,0,.55);display:grid;place-items:center">${ic("pause", 24)}</div><div style="position:absolute;right:4px;top:4px">${ic("close", 18)}</div><div style="position:absolute;left:4px;top:4px">${ic("full", 18)}</div></div>`,
    }[type === "TABLET" ? "MODERN_1" : type] || "";
    const below = type === "MODERN_3" ? `<div style="display:flex;align-items:center;gap:6px;padding:6px 8px">${ttl()}</div>` : type === "MODERN_2" ? `<div style="padding:4px 8px 6px">${ttl()}</div>` : "";
    mini = `<div class="mini" style="position:absolute;${pos};width:${w}px;opacity:${op};${type === "MODERN_2" || type === "MODERN_3" ? surface + ";" : ""}border-radius:${docked ? `${radius}px 0 0 0` : radius + "px"};overflow:hidden;box-shadow:0 6px 18px rgba(0,0,0,.6)">
      <div style="position:relative">${thumb(0, "border-radius:0")}${C("miniplayer_hide_overlay_buttons", ov, { style: "position:absolute;inset:0" })}${prog}</div>
      ${below}
      ${type === "MODERN_1" || type === "MODERN_4" ? C("miniplayer_hide_title", `<div style="position:absolute;left:0;right:0;bottom:2px;padding:10px 6px 4px;background:linear-gradient(transparent,rgba(0,0,0,.8));font-size:10.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(VIDEOS[0].t)}</div>`, { style: "position:absolute;left:0;right:0;bottom:0" }) : ""}
    </div>`;
  }
  const resume = C("miniplayer_disable_resuming", `<div style="${surface};border-radius:14px;padding:8px;display:flex;gap:8px;align-items:center"><div style="width:72px;flex:none;border-radius:8px;overflow:hidden">${thumb(1, "border-radius:0")}</div><div style="min-width:0;flex:1"><div class="t2" style="font-size:10.5px">Continue watching</div><div style="font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(VIDEOS[1].t)}</div></div>${ic("close", 18)}</div>`, { also: "miniplayer_disable_resuming", style: "position:absolute;left:10px;right:10px;top:60px;z-index:2" });
  const notAvail = "";
  return `<div style="background:#0f0f0f;height:350px;position:relative;overflow:hidden" id="miniStage">
    <div style="margin:8px 10px;background:#2b2b2b;border-radius:16px;padding:10px 12px;display:flex;gap:10px;align-items:center">
      <div style="width:40px;height:40px;border-radius:8px;background:${ART[0]};flex:none"></div>
      <div style="flex:1;min-width:0"><div style="font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(VIDEOS[0].t)}</div><div class="t2">YouTube · media notification</div>
        ${C("disable_notification_media_seekbar", `<div style="height:3px;background:#555;border-radius:2px;margin-top:6px"><div style="width:30%;height:3px;background:#fff;border-radius:2px"></div></div>`)}</div>
      <div style="display:flex;align-items:center">${C("hide_notification_media_prev_next", I("prev", "ico", 'style="width:20px;height:20px;margin:4px"'))}${I("pause", "ico", 'style="margin:4px"')}${C("hide_notification_media_prev_next", I("next", "ico", 'style="width:20px;height:20px;margin:4px"'))}</div>
    </div>
    <div style="padding:0 12px">${thumb(3)}<div style="display:flex;gap:10px;padding:10px 0">${av(3, 34)}<div><div class="t1">${esc(VIDEOS[3].t)}</div><div class="t2">${VIDEOS[3].c} · ${VIDEOS[3].v}</div></div></div></div>
    ${resume}${mini}${notAvail}
    <div style="position:absolute;left:0;right:0;bottom:0">${navBarStatic()}</div>
    <div class="finger" id="finger"></div>
  </div>`;
};
def("miniplayer", "vis", "miniplayer_disable_resuming");

def("miniplayer", "style", "miniplayer_glass miniplayer_docked");

// ------------------------------------------------------------------ SponsorBlock
SECTIONS.splice(SECTIONS.findIndex(s => s.id === "captions") + 1, 0, { id: "sponsorblock", icon: "skip", title: "SponsorBlock", scopes: [["SPONSORBLOCK", null]] });
P.skip = "M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z";
// Segment categories: Morphe builds these rows in code (not in the patch's preference list), so the
// catalogue misses them. Keys, defaults and colours follow Settings.java.
const SB_BEHAVIOUR = [{ label: "Skip automatically", value: "skip" }, { label: "Skip automatically once", value: "skip-once" }, { label: "Show a skip button", value: "manual-skip" }, { label: "Show in seekbar", value: "seekbar-only" }, { label: "Disable", value: "ignore" }];
const SB_CATS = [["sponsor", "Sponsor", "skip-once", "#00d400"], ["selfpromo", "Unpaid/Self promotion", "manual-skip", "#ffff00"], ["interaction", "Interaction reminder", "manual-skip", "#cc00ff"], ["highlight", "Highlight", "manual-skip", "#ff1684"], ["hook", "Hook/Greetings", "ignore", "#395699"], ["intro", "Intermission/Intro animation", "manual-skip", "#00ffff"], ["outro", "Endcards/Credits", "manual-skip", "#0202ed"], ["preview", "Preview/Recap", "ignore", "#008fd6"], ["filler", "Filler tangent/Jokes", "ignore", "#7300ff"], ["music_offtopic", "Music: Non-music section", "manual-skip", "#ff9900"]];
const SB_SEGS = { sponsor: [8, 9], selfpromo: [46, 5], interaction: [30, 3], intro: [0, 3], outro: [88, 12], highlight: [60, 1], filler: [70, 6], music_offtopic: [20, 4], preview: [3, 2], hook: [36, 2] };
SCENES.sponsorblock = () => {
  const on = !!V("morphe_sb_enabled");
  const sq = !!V("morphe_sb_square_layout");
  const compact = !!V("morphe_sb_compact_skip_button");
  const r = sq ? 2 : 18;
  const noseg = !!V("morphe_sb_video_length_without_segments");
  const segs = on ? SB_CATS.filter(([k]) => SB_SEGS[k] && V("morphe_sb_" + k) !== "ignore").map(([k, , , col]) => `<i data-seg="${k}" style="position:absolute;left:${SB_SEGS[k][0]}%;width:${SB_SEGS[k][1]}%;top:0;bottom:0;background:${String(V("morphe_sb_" + k + "_color") || col).replace(/^#..(......)$/, "#$1")}"></i>`).join("") : "";
  return `<div class="video">${videoFrame(2)}<div class="scrim" style="opacity:.35"></div>
    <div style="position:absolute;right:8px;top:6px;display:flex;gap:4px">
      ${on ? C("sb_create_new_segment", `<div class="pbtn" style="width:34px;height:34px;border-radius:${sq ? 4 : 17}px;background:rgba(0,0,0,.35)">${I("plus")}</div>`) : ""}
      ${on ? C("sb_voting_button", `<div class="pbtn" style="width:34px;height:34px;border-radius:${sq ? 4 : 17}px;background:rgba(0,0,0,.35)">${I("like")}</div>`) : ""}
    </div>
    ${on ? C("sb_compact_skip_button", `<div class="sbskip" style="display:flex;align-items:center;gap:6px;height:34px;padding:0 ${compact ? 10 : 14}px;border-radius:${r}px;background:rgba(0,0,0,.72);border:1px solid rgba(255,255,255,.25);font-size:12.5px;font-weight:500">${I("skip", "ico", 'style="width:18px;height:18px"')}${compact ? "Skip" : "Skip sponsor"}</div>`, { style: "position:absolute;right:12px;bottom:46px", also: "sb_square_layout" }) : ""}
    <div class="time" style="position:absolute;left:12px;bottom:24px">1:30 / ${on && noseg ? `16:12 <span style="color:#9be89b">(14:20)</span>` : "16:12"}</div>
    ${C("sb_enabled", `<div class="seek" style="bottom:10px;overflow:visible"><div class="buf" style="width:60%"></div>${segs}<div class="played" style="width:9%"></div><div class="knob" style="left:9%"></div></div>`, { also: "sb_video_length_without_segments", style: "position:absolute;left:0;right:0;bottom:0;height:20px" })}
    ${on ? "" : `<div class="demo-label">SponsorBlock is off</div>`}
    <div class="finger" id="finger"></div>
  </div>`;
};
def("sponsorblock", "style", "sb_enabled sb_square_layout sb_compact_skip_button sb_video_length_without_segments");
def("sponsorblock", "vis", "sb_create_new_segment sb_voting_button");
def("sponsorblock", "style", SB_CATS.map(c => "sb_" + c[0]).join(" "));
def("sponsorblock", "style", "sb_create_new_segment_step");
scen("sponsorblock", "sb_toast_on_skip", (box, on) => {
  situation("A sponsor segment starts");
  box.innerHTML = device("land", `${miniVideo(2)}<div class="msk" style="position:absolute;left:8%;right:8%;bottom:16%;height:3px;background:rgba(255,255,255,.3)"><i style="position:absolute;left:30%;width:25%;top:0;bottom:0;background:#00d400"></i><div class="mp" style="position:absolute;left:0;top:0;bottom:0;width:20%;background:#ff0033;transition:width .9s linear"></div></div>`);
  const dev = box.querySelector(".dev"), mp = dev.querySelector(".mp");
  at(200, () => { mp.style.width = "30%"; });
  at(1100, () => { mp.style.transition = "width .15s"; mp.style.width = "55%"; if (on) dev.insertAdjacentHTML("beforeend", `<div class="toastin" style="bottom:8px;top:auto;font-size:9px">Skipped sponsor</div>`); });
  return on ? "The segment is skipped and a notice appears" : "The segment is skipped silently";
});
scen("sponsorblock", "sb_auto_hide_skip_button", (box, on) => {
  situation("Inside a segment");
  box.innerHTML = device("land", `${miniVideo(2)}<div class="sk" style="position:absolute;right:8px;bottom:22px;font-size:9px;background:rgba(0,0,0,.75);border:1px solid #666;border-radius:9px;padding:2px 7px;transition:opacity .4s">Skip sponsor ▸</div>`);
  const sk = box.querySelector(".sk");
  if (on) at(1600, () => { sk.style.opacity = "0"; setFoot("The button fades after the set duration"); });
  return on ? "The Skip button shows, then fades" : "The Skip button stays for the whole segment";
});

// ------------------------------------------------------------------ fullscreen gestures (scenarios)
const gestureScen = (key, orient, from, to, label, result) => scen("fullscreen", key, (box, disabled) => {
  situation(orient === "land" ? "Fullscreen" : "Portrait player");
  box.innerHTML = device(orient, orient === "land" ? miniVideo(6) : playerArea(6));
  const dev = box.querySelector(".dev"), f = box.querySelector("#scFinger"); const W = dev.clientWidth, H = dev.clientHeight;
  at(100, () => fingerTo(f, W * from[0], H * from[1])); at(350, () => fingerTo(f, W * to[0], H * to[1], 700));
  at(1100, () => {
    if (disabled) { dev.insertAdjacentHTML("beforeend", `<div class="toastin" style="top:40%;font-size:9px">Nothing happens</div>`); return; }
    result(dev);
  });
  return disabled ? `${label}: ignored` : `${label}: ${result.text}`;
});
// swap what the device shows (fullscreen video vs portrait watch page) as it turns
function devContent(dev, html) {
  [...dev.children].forEach(c => { if (!c.classList.contains("waves") && !c.classList.contains("finger")) { c.style.transition = "opacity .2s"; c.style.opacity = "0"; setTimeout(() => c.remove(), 200); } });
  const tmp = document.createElement("div"); tmp.innerHTML = html;
  const f = dev.querySelector(".finger");
  [...tmp.children].forEach(c => { c.style.opacity = "0"; c.style.transition = "opacity .3s .15s"; dev.insertBefore(c, f); requestAnimationFrame(() => requestAnimationFrame(() => { c.style.opacity = ""; })); });
}
// the phone turns visibly (its screen rotates with it), then the app lays out for the new orientation
function turn(dev, orient, then) {
  const cur = dev.classList.contains("land") ? "land" : "port";
  if (cur === orient) { if (then) then(); return; }
  // while it turns, the phone is scaled so its rotated outline still fits the preview
  const [w, h] = DEV_SIZE[cur];
  dev.querySelectorAll(".finger").forEach(f => f.classList.remove("show"));
  dev.style.transition = "transform .5s var(--ease), scale .5s var(--ease)"; dev.style.transform = `rotate(${orient === "land" ? -90 : 90}deg)`;
  dev.style.scale = Math.min(parseFloat(dev.style.scale) || 1, fitScale(h, w)).toFixed(3);
  setTimeout(() => { dev.style.transition = "none"; dev.style.transform = ""; rotate(dev, orient); if (then) then(); }, 520);
}
const r1 = dev => turn(dev, "port", () => devContent(dev, playerArea(6))); r1.text = "leaves fullscreen";
gestureScen("disable_fullscreen_dragged_down_gesture", "land", [.5, .25], [.5, .85], "Swipe down in fullscreen", r1);
const r2 = dev => turn(dev, "land", () => devContent(dev, miniVideo(6))); r2.text = "enters fullscreen";
gestureScen("disable_fullscreen_pulled_up_gesture", "port", [.5, .3], [.5, .08], "Swipe up on the player", r2);
const r3 = dev => { const v = dev.querySelector(".dv-video"); if (v) { v.style.transition = "transform .4s"; v.style.transform = "translateY(70%) scale(.5)"; } }; r3.text = "shrinks to the miniplayer";
gestureScen("disable_fullscreen_sliding_down_gesture", "port", [.5, .1], [.5, .45], "Swipe down on the player", r3);
scen("fullscreen", "disable_fullscreen_zoom_gesture", (box, disabled) => {
  situation("Fullscreen, two fingers spread");
  box.innerHTML = device("land", `<div class="zv" style="position:absolute;left:10%;right:10%;top:0;bottom:0;background:${ART[6]};transition:all .5s var(--ease)"></div>`);
  const dev = box.querySelector(".dev"), f1 = box.querySelector("#scFinger"), zv = box.querySelector(".zv"); const W = dev.clientWidth, H = dev.clientHeight;
  const f2 = f1.cloneNode(true); f2.id = ""; dev.appendChild(f2);
  at(150, () => { fingerTo(f1, W * .44, H * .55); fingerTo(f2, W * .56, H * .45); });
  at(420, () => { fingerTo(f1, W * .2, H * .85, 600); fingerTo(f2, W * .8, H * .15, 600); });
  at(800, () => { if (!disabled) { zv.style.left = "0"; zv.style.right = "0"; zv.style.transform = "scale(1.1)"; } });
  at(1150, () => { f1.classList.remove("show"); f2.classList.remove("show"); if (disabled) dev.insertAdjacentHTML("beforeend", `<div class="toastin" style="top:40%;font-size:9px">Nothing happens</div>`); });
  return disabled ? "Pinch does nothing: the video stays fitted" : "Pinch: the video zooms to fill the screen";
});

scen("fullscreen", "restore_pinch_to_zoom", (box, on) => {
  situation("Fullscreen, two fingers spread");
  box.innerHTML = device("land", `<div class="zv" style="position:absolute;left:10%;right:10%;top:0;bottom:0;background:${ART[6]};transform-origin:50% 50%;transition:transform .12s linear"></div>`);
  const dev = box.querySelector(".dev"), f1 = box.querySelector("#scFinger"), zv = box.querySelector(".zv"); const W = dev.clientWidth, H = dev.clientHeight;
  const f2 = f1.cloneNode(true); f2.id = ""; dev.appendChild(f2);
  at(150, () => { fingerTo(f1, W * .44, H * .55); fingerTo(f2, W * .56, H * .45); });
  // stock YouTube snaps between fitted and filled; Morphe's restore follows the fingers up to its max scale
  [1.15, 1.3, 1.45, 1.6].forEach((sc, i) => at(420 + i * 160, () => {
    fingerTo(f1, W * (.44 - .08 * (i + 1)), H * (.55 + .07 * (i + 1)), 160); fingerTo(f2, W * (.56 + .08 * (i + 1)), H * (.45 - .07 * (i + 1)), 160);
    if (on) zv.style.transform = `scale(${sc})`;
    else if (i === 1) { zv.style.transition = "all .3s var(--ease)"; zv.style.left = "0"; zv.style.right = "0"; zv.style.transform = "scale(1.08)"; }
  }));
  at(1250, () => { f1.classList.remove("show"); f2.classList.remove("show"); });
  return on ? "Pinch: zoom follows your fingers, step by step" : "Pinch: the video only snaps from fitted to filled";
});

// ------------------------------------------------------------------ swipe controls: overlay style settings feed the swipe demo
def("fullscreen", "style", "swipe_overlay_background_opacity swipe_overlay_progress_volume_color swipe_overlay_progress_brightness_color swipe_overlay_progress_speed_color swipe_text_overlay_size swipe_zone_width");
def("fullscreen", "gesture", "swipe_top_zone");
def("fullscreen", "style", "swipe_zone_preview swipe_speed_zone_height");
scen("fullscreen", "swipe_change_video", (box, on) => {
  situation("Fullscreen, swipe sideways");
  box.innerHTML = device("land", `<div class="sv" style="position:absolute;inset:0;display:flex;width:200%;transition:transform .45s var(--ease)"><div style="flex:1;background:${ART[6]}"></div><div style="flex:1;background:${ART[2]}"></div></div>`);
  const dev = box.querySelector(".dev"), f = box.querySelector("#scFinger"); const W = dev.clientWidth, H = dev.clientHeight;
  at(100, () => fingerTo(f, W * .8, H * .5)); at(350, () => fingerTo(f, W * .2, H * .5, 500));
  at(800, () => { if (on) box.querySelector(".sv").style.transform = "translateX(-50%)"; else dev.insertAdjacentHTML("beforeend", `<div class="toastin" style="top:40%;font-size:9px">Nothing happens</div>`); });
  return on ? "Swipe sideways: next video" : "Swipe sideways: nothing (stock)";
});
scen("fullscreen", "swipe_press_to_engage", (box, on) => {
  situation("Fullscreen, right edge");
  box.innerHTML = device("land", miniVideo(6));
  const dev = box.querySelector(".dev"), f = box.querySelector("#scFinger"); const W = dev.clientWidth, H = dev.clientHeight;
  at(100, () => { fingerTo(f, W * .82, H * .8); if (on) f.classList.add("hold"); });
  at(on ? 900 : 300, () => { f.classList.remove("hold"); fingerTo(f, W * .82, H * .2, 800); dev.insertAdjacentHTML("beforeend", `<div class="toastin" style="top:40%;font-size:9px">🔊 Volume</div>`); });
  return on ? "Hold first, then swipe: avoids accidental changes" : "Any swipe on the edge changes volume";
});
scen("fullscreen", "volume_boost", (box, on) => {
  situation("Swiping up at full volume");
  box.innerHTML = device("land", `${miniVideo(6)}<div class="vb" style="position:absolute;left:50%;top:40%;transform:translate(-50%,-50%);font-size:9px;background:rgba(0,0,0,.7);border-radius:8px;padding:3px 8px">🔊 100%</div>`);
  const dev = box.querySelector(".dev"), f = box.querySelector("#scFinger"), vb = box.querySelector(".vb"); const W = dev.clientWidth, H = dev.clientHeight;
  at(100, () => fingerTo(f, W * .82, H * .7)); at(350, () => fingerTo(f, W * .82, H * .15, 900));
  at(900, () => { vb.textContent = on ? "🔊 Boost 130%" : "🔊 100% (max)"; if (on) vb.style.color = "#ffb74d"; });
  return on ? "Past maximum the volume is boosted" : "Volume stops at maximum";
});

// ------------------------------------------------------------------ shorts player extras
SCENES.shorts = (base => () => {
  let html = base();
  const paused = `${C("hide_shorts_paused_overlay_buttons", `<div style="display:flex;gap:10px">${["Remix", "Save music"].map((t, i) => i === 1 ? C("hide_shorts_save_sound_button", `<span class="chip" style="height:28px;background:rgba(0,0,0,.55)">${I("music")} ${t}</span>`, { tag: "span" }) : `<span class="chip" style="height:28px;background:rgba(0,0,0,.55)">${I("remix")} ${t}</span>`).join("")}</div>`, { style: "position:absolute;left:50%;top:30%;transform:translateX(-50%)" })}`;
  const top = `<div style="position:absolute;left:10px;top:8px;display:flex;gap:6px;align-items:center">
    ${C("hide_shorts_new_posts_button", `<span class="chip" style="height:26px;font-size:11.5px;background:rgba(0,0,0,.5)">New posts</span>`, { tag: "span" })}
    ${C("hide_shorts_upcoming_button", `<span class="chip" style="height:26px;font-size:11.5px;background:rgba(0,0,0,.5)">${I("bell")} Upcoming</span>`, { tag: "span" })}
    ${C("hide_shorts_auto_dubbed_label", `<span class="chip" style="height:22px;font-size:10.5px;background:rgba(0,0,0,.5)">Auto-dubbed</span>`, { tag: "span" })}</div>`;
  const hint = C("hide_shorts_gesture_hints", `<div class="toastin" style="position:static;transform:none">Swipe up for more</div>`, { style: "position:absolute;left:50%;top:52%;transform:translateX(-50%)" });
  return html.replace('<div id="heart"', paused + top + hint + '<div id="heart"');
})(SCENES.shorts);
// Shorts "more" menu: picking one of its settings opens the sheet, as on the phone
const SHORTS_SHEET = new Set(["morphe_hide_shorts_flyout_audio_track", "morphe_hide_shorts_flyout_captions", "morphe_shorts_playback_speed_flyout_button"]);
SCENES.shorts = (base => () => {
  let html = base().replace('id="shortsStage"', `id="shortsStage" data-icons="${esc(V("morphe_shorts_icon_style") || "AUTO")}"`);
  if (!SHORTS_SHEET.has(selected)) return html;
  const row = (k, icon, t) => { const r = `<div style="display:flex;align-items:center;gap:16px;padding:11px 18px">${I(icon)}<span style="font-size:14px">${t}</span></div>`; return k ? C(k, r, { blk: 1 }) : r; };
  const sheet = `<div style="position:absolute;inset:0;background:rgba(0,0,0,.45);z-index:25"></div>
    <div style="position:absolute;left:0;right:0;bottom:0;z-index:26;background:#212121;border-radius:14px 14px 0 0;padding:6px 0 10px;animation:sheetup .28s var(--ease)">
      <div style="width:36px;height:4px;border-radius:2px;background:#555;margin:2px auto 6px"></div>
      ${row(null, "tune", "Quality")}${row("hide_shorts_flyout_captions", "cc", "Captions")}${row("shorts_playback_speed_flyout_button", "speed", "Playback speed")}
      ${row("hide_shorts_flyout_audio_track", "music", "Audio track")}${row(null, "info", "Description")}${row(null, "flag", "Report")}${row(null, "help", "Send feedback")}
    </div>`;
  return html.replace('<div class="finger" id="finger"></div>', sheet + '<div class="finger" id="finger"></div>');
})(SCENES.shorts);
def("shorts", "vis", "hide_shorts_flyout_audio_track hide_shorts_flyout_captions shorts_playback_speed_flyout_button");
def("shorts", "style", "shorts_icon_style");
def("shorts", "vis", "hide_shorts_paused_overlay_buttons hide_shorts_save_sound_button hide_shorts_new_posts_button hide_shorts_upcoming_button hide_shorts_auto_dubbed_label hide_shorts_gesture_hints");

// ------------------------------------------------------------------ navigation: glass bar
{
  const base = navBar;
  navBar = function (plain) {
    const html = base(plain);
    if (!V("morphe_navigation_bar_glass") || V("morphe_hide_navigation_bar")) return html;
    const opa = (Number(V("morphe_navigation_bar_glass_opacity")) || 0) / 100;
    const size = (Number(V("morphe_navigation_bar_glass_height")) || 100) / 100;
    const round = !!V("morphe_navigation_bar_glass_round");
    return html.replace(/^<div style="display:flex;justify-content:([a-z-]+);gap:(\d+)px;align-items:center;height:52px;background:[^;]+;border-top:1px solid #222">/,
      (m, j, g) => `<div style="display:flex;justify-content:space-around;gap:${g}px;align-items:center;height:${Math.round(52 * size)}px;margin:0 ${Math.round(14 / size)}px 8px;border-radius:${round ? 999 : 18}px;background:rgba(40,40,40,${Math.max(opa, .08)});backdrop-filter:blur(14px) saturate(1.4);-webkit-backdrop-filter:blur(14px) saturate(1.4);border:1px solid rgba(255,255,255,.12);transform:scale(${size});transform-origin:bottom center">`);
  };
}
def("nav", "style", "navigation_bar_glass navigation_bar_glass_opacity navigation_bar_glass_height navigation_bar_glass_round");
scen("nav", "disable_auto_hide_navigation_bar", (box, on) => {
  situation("Scrolling the home feed");
  box.innerHTML = device("port", `<div class="feedscroll" style="position:absolute;left:0;right:0;top:0;transition:transform 1s var(--ease)">${[0, 1, 2, 3, 4].map(i => `<div style="height:46px;margin:6px;background:${ART[i]};border-radius:4px"></div>`).join("")}</div><div class="nb" style="position:absolute;left:0;right:0;bottom:0;height:16px;background:#0f0f0f;border-top:1px solid #333;transition:transform .35s var(--ease)"></div>`);
  at(300, () => { box.querySelector(".feedscroll").style.transform = "translateY(-90px)"; if (!on) box.querySelector(".nb").style.transform = "translateY(100%)"; });
  return on ? "The navigation bar stays while scrolling" : "The navigation bar slides away while scrolling";
});
scen("nav", "navigation_bar_animations", (box, on) => {
  situation("Switching tabs");
  box.innerHTML = device("port", `<div class="pg" style="position:absolute;inset:0 0 16px 0;background:${ART[1]};transition:${on ? "opacity .4s, transform .4s" : "none"}"></div><div style="position:absolute;left:0;right:0;bottom:0;height:16px;background:#0f0f0f;border-top:1px solid #333"></div>`);
  const dev = box.querySelector(".dev"), f = box.querySelector("#scFinger"), pg = box.querySelector(".pg"); const W = dev.clientWidth, H = dev.clientHeight;
  at(150, () => fingerTo(f, W * .35, H - 8)); at(400, () => tapF(f));
  at(450, () => { if (on) { pg.style.opacity = "0"; pg.style.transform = "translateX(-12px)"; setTimeout(() => { pg.style.transition = "none"; pg.style.background = ART[5]; pg.style.transform = "translateX(12px)"; void pg.offsetWidth; pg.style.transition = "opacity .4s, transform .4s"; pg.style.opacity = "1"; pg.style.transform = "none"; }, 400); } else pg.style.background = ART[5]; });
  return on ? "The new tab slides and fades in" : "The new tab appears instantly";
});

// ------------------------------------------------------------------ miniplayer gestures (scenarios)
const miniDev = () => `${playerArea(3)}<div class="mp2" style="position:absolute;right:6px;bottom:20px;width:40px;height:23px;border-radius:4px;background:${ART[0]};box-shadow:0 2px 6px #000;transition:all .55s var(--ease)"></div><div style="position:absolute;left:0;right:0;bottom:0;height:14px;background:#0f0f0f;border-top:1px solid #333"></div>`;
scen("miniplayer", "miniplayer_disable_drag_and_drop", (box, disabled) => {
  situation("Dragging the miniplayer");
  box.innerHTML = device("port", miniDev());
  const dev = box.querySelector(".dev"), f = box.querySelector("#scFinger"), m = box.querySelector(".mp2"); const W = dev.clientWidth, H = dev.clientHeight;
  at(150, () => { fingerTo(f, W - 26, H - 31); f.classList.add("hold"); });
  at(500, () => { fingerTo(f, 26, H * .45, 700); if (!disabled) { m.style.right = (W - 46) + "px"; m.style.bottom = (H * .55 - 11) + "px"; } });
  at(1300, () => { f.classList.remove("hold"); if (disabled) dev.insertAdjacentHTML("beforeend", `<div class="toastin" style="top:20%;font-size:8px">Stays put</div>`); });
  return disabled ? "The miniplayer stays in its corner" : "Drag it to any corner";
});
scen("miniplayer", "miniplayer_disable_horizontal_drag", (box, disabled) => {
  situation("Flinging the miniplayer sideways");
  box.innerHTML = device("port", miniDev());
  const dev = box.querySelector(".dev"), f = box.querySelector("#scFinger"), m = box.querySelector(".mp2"); const W = dev.clientWidth, H = dev.clientHeight;
  at(150, () => fingerTo(f, W - 26, H - 31)); at(400, () => { fingerTo(f, W + 10, H - 31, 400); if (!disabled) { m.style.right = "-60px"; m.style.opacity = "0"; } });
  at(1000, () => { if (disabled) dev.insertAdjacentHTML("beforeend", `<div class="toastin" style="top:20%;font-size:8px">Stays open</div>`); else dev.insertAdjacentHTML("beforeend", `<div class="toastin" style="top:20%;font-size:8px">Closed</div>`); });
  return disabled ? "A sideways fling does not close it" : "A sideways fling closes it (stock)";
});
scen("miniplayer", "miniplayer_swipe_up_expand", (box, on) => {
  situation("Swiping the miniplayer up");
  box.innerHTML = device("port", miniDev());
  const dev = box.querySelector(".dev"), f = box.querySelector("#scFinger"), m = box.querySelector(".mp2"); const W = dev.clientWidth, H = dev.clientHeight;
  at(150, () => fingerTo(f, W - 26, H - 31)); at(400, () => fingerTo(f, W - 26, H * .3, 500));
  at(800, () => { if (on) { m.style.right = "0"; m.style.bottom = (H * .66) + "px"; m.style.width = W + "px"; m.style.height = (H * .34) + "px"; m.style.borderRadius = "0"; } else { m.style.bottom = (H - 40) + "px"; } });
  return on ? "Swipe up opens the full player" : "Swipe up moves the miniplayer to the top";
});

// ------------------------------------------------------------------ player: rolling numbers, exit fullscreen
scen("watch", "disable_rolling_number_animations", (box, disabled) => {
  situation("You tap Like");
  box.innerHTML = device("port", `${playerArea(0)}<div style="position:absolute;left:6px;top:42%;display:flex;gap:4px;align-items:center;font-size:10px;background:#272727;border-radius:9px;padding:2px 7px">👍 <span class="rn" style="display:inline-block;overflow:hidden;height:13px;line-height:13px"><span class="rni" style="display:block;transition:transform .5s var(--ease)">48,201<br>48,202</span></span></div>`);
  const dev = box.querySelector(".dev"), f = box.querySelector("#scFinger"), rni = box.querySelector(".rni"); const H = dev.clientHeight;
  at(150, () => fingerTo(f, 14, H * .42 + 7)); at(450, () => tapF(f));
  at(550, () => { if (disabled) { rni.style.transition = "none"; } rni.style.transform = "translateY(-13px)"; });
  return disabled ? "The count changes instantly" : "The count rolls to the new number";
});
scen("player", "exit_fullscreen", (box) => {
  const v = state.morphe_exit_fullscreen;
  const startLand = v === "LANDSCAPE" || v === "PORTRAIT_LANDSCAPE" || v === "DISABLED";
  situation("The video ends in fullscreen");
  box.innerHTML = device("land", `${playerArea(4, `<div class="msk" style="position:absolute;left:8%;right:8%;bottom:12%;height:3px;background:rgba(255,255,255,.3)"><div class="mp" style="position:absolute;left:0;top:0;bottom:0;width:80%;background:#ff0033;transition:width .9s linear"></div></div>`)}`);
  const dev = box.querySelector(".dev"); const mp = dev.querySelector(".mp");
  at(100, () => { mp.style.width = "100%"; });
  at(1100, () => { if (v === "DISABLED") dev.insertAdjacentHTML("beforeend", `<div class="toastin" style="top:40%;font-size:9px">Stays in fullscreen</div>`); else rotate(dev, "port"); });
  return v === "DISABLED" ? "The player stays in fullscreen" : `Leaves fullscreen when the video ends (${entryLabel("morphe_exit_fullscreen", v).toLowerCase()})`;
});

// ------------------------------------------------------------------ Ads, App look, Snackbar, Playback, DeArrow
SECTIONS.push(
  { id: "ads", icon: "dollar", title: "Ads", scopes: [["ADS", null]] },
  { id: "look", icon: "palette", title: "App look", scopes: [["GENERAL", null], ["GENERAL", "morphe_custom_filter_screen"], ["GENERAL", "morphe_series_tracker_screen"]] },
  { id: "snackbar", icon: "chat", title: "Snackbar", scopes: [["GENERAL", "morphe_snackbar_screen"]] },
  { id: "playback", icon: "speed", title: "Playback", scopes: [["VIDEO", null], ["VIDEO", "morphe_vot_screen"], ["PLAYER", null], ["PLAYER", "morphe_loop_count_screen"], ["PLAYER", "morphe_live_chat_translate_screen"], ["PLAYER", "morphe_external_downloader_screen"]] },
  { id: "dearrow", icon: "eye", title: "DeArrow", scopes: [["DEARROW", null]] },
);
SECTIONS.find(s => s.id === "watch").scopes.push(["RETURN_YOUTUBE_DISLIKE", null]);
SECTIONS.find(s => s.id === "feed").scopes.push(["FEED", "morphe_post_buttons_screen"], ["FEED", "morphe_hide_aislist_screen"], ["FEED", "morphe_hide_keyword_content_screen"]);

SCENES.ads = () => {
  const card = (k, inner, o = {}) => C(k, inner, { blk: 1, ...o });
  return `<div class="inner-scroll" style="background:#0f0f0f;max-height:350px;overflow-y:auto">
    <div style="position:relative;height:118px;background:${ART[1]}">
      ${C("hide_video_ads", `<div style="position:absolute;inset:0;background:${ART[5]};display:flex;align-items:flex-end;justify-content:space-between;padding:8px"><span style="font-size:11px;background:#ffcc00;color:#000;font-weight:700;padding:1px 5px;border-radius:3px">Ad · 0:05</span><span class="chip" style="height:26px;font-size:11.5px;background:rgba(0,0,0,.7)">Skip ▸|</span></div>`, { style: "position:absolute;inset:0" })}
      ${C("hide_paid_promotion_labels", `<span style="font-size:11px;background:rgba(0,0,0,.7);padding:2px 6px;border-radius:3px">Includes paid promotion</span>`, { style: "position:absolute;left:8px;top:8px" })}
      ${C("hide_player_popup_ads", `<div style="display:flex;gap:6px;align-items:center;background:#fff;color:#000;border-radius:8px;padding:4px 8px 4px 4px;font-size:11px"><div style="width:26px;height:26px;border-radius:5px;background:${ART[7]}"></div><div><b>Pocket Planner</b><div style="color:#555">Install · Free</div></div></div>`, { style: "position:absolute;right:8px;top:8px" })}
      <div class="seek" style="bottom:0;left:0;right:0;border-radius:0"><div class="played" style="width:22%"></div></div>
    </div>
    <div style="padding:10px 12px 4px"><div class="t1" style="font-size:15px">${esc(VIDEOS[1].t)}</div><div class="t2">${VIDEOS[1].c} · ${VIDEOS[1].v}</div></div>
    ${card("hide_merchandise_banners", `<div style="margin:6px 12px;padding:10px;border-radius:12px;background:#272727;display:flex;gap:10px;align-items:center">${I("shop")}<div><div class="t1" style="font-size:13px">Switch Lab merch</div><div class="t2">Keycap set · €29</div></div></div>`)}
    ${card("hide_creator_store_shelf", `<div style="padding:6px 12px"><div class="t1" style="font-size:13px;margin-bottom:6px">Store</div><div style="display:flex;gap:8px">${[2, 3, 4].map(i => `<div style="width:90px"><div style="aspect-ratio:1;border-radius:8px;background:${ART[i]}"></div><div class="t2" style="font-size:11px;margin-top:3px">€${12 + i * 5}</div></div>`).join("")}</div></div>`)}
    ${card("hide_shopping_links", `<div style="margin:6px 12px;font-size:12.5px;color:#3ea6ff">${I("link", "ico", 'style="width:14px;height:14px;fill:#3ea6ff;vertical-align:-2px"')} Products in this video · 3 links</div>`)}
    ${card("hide_youtube_premium_promotions", `<div style="margin:8px 12px;padding:10px 12px;border-radius:12px;background:linear-gradient(90deg,#3a0d12,#1d1d1d)"><div class="t1" style="font-size:13px">Try YouTube Premium</div><div class="t2">Ad-free, background play, downloads</div></div>`)}
    ${card("hide_self_sponsor_ads", `<div style="margin:8px 12px;padding:10px 12px;border-radius:12px;border:1px solid #333"><div class="t2" style="font-size:11px">Sponsored by the creator</div><div class="t1" style="font-size:13px">Get 20% off at switchlab.shop</div></div>`)}
    ${card("hide_general_ads", `<div style="margin:8px 12px 12px;border-radius:12px;overflow:hidden;background:#1c1c1c">${thumb(6, "border-radius:0")}<div style="display:flex;gap:8px;padding:8px 10px;align-items:center"><span style="font-size:10.5px;background:#ffcc00;color:#000;font-weight:700;padding:0 4px;border-radius:3px">Sponsored</span><div class="t1" style="font-size:13px;flex:1">Learn to code in 30 days</div><span class="chip" style="height:26px;background:#3ea6ff;color:#000;font-size:11.5px">Sign up</span></div></div>`)}
  </div>`;
};
def("ads", "vis", "hide_video_ads hide_paid_promotion_labels hide_player_popup_ads hide_merchandise_banners hide_creator_store_shelf hide_shopping_links hide_youtube_premium_promotions hide_self_sponsor_ads hide_general_ads");

// A full Android status bar: clock and notification icons left, system icons right
function statusBar() {
  const sv = (d, w = 13) => `<svg viewBox="0 0 24 24" style="width:${w}px;height:${w}px;fill:#e8e8e8;flex:none"><path d="${d}"/></svg>`;
  const left = [P.play, "M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z", P.chat, P.dl].map(d => sv(d, 11)).join("");
  const wifi = "M12 21l3.6-4.8A6 6 0 0 0 12 15a6 6 0 0 0-3.6 1.2L12 21zm0-18C7.95 3 4.21 4.34 1.2 6.6L3 9c2.5-1.88 5.62-3 9-3s6.5 1.12 9 3l1.8-2.4C19.79 4.34 16.05 3 12 3zm0 6c-2.7 0-5.19.89-7.2 2.4L6.6 13.8A8.97 8.97 0 0 1 12 12c2.02 0 3.88.67 5.4 1.8l1.8-2.4C17.19 9.89 14.7 9 12 9z";
  const sig = "M2 22h20V2L2 22z", alarm = "M22 5.72l-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72zM7.88 3.39 6.6 1.86 2 5.71l1.29 1.53 4.59-3.85zM12 4c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm1 9.41V8h-2v6.41l4.29 4.3 1.41-1.42L13 13.41z";
  const bat = `<span style="display:inline-flex;align-items:center;gap:2px;font-size:10px">78%<span style="width:18px;height:9px;border:1.3px solid #e8e8e8;border-radius:2.5px;padding:1px;display:inline-block;position:relative"><i style="display:block;height:100%;width:78%;background:#e8e8e8;border-radius:1px"></i></span></span>`;
  return `<div style="height:22px;display:flex;align-items:center;gap:5px;padding:0 12px;font-size:11.5px;color:#e8e8e8"><b style="font-weight:500;margin-right:3px">9:41</b>${left}<span style="flex:1"></span>${sv(alarm, 11)}${sv(wifi)}${sv(sig, 11)}<span style="font-size:9.5px;font-weight:600">5G</span>${bat}</div>`;
}
const THEME_DARK = { APP_DEFAULT: "#0f0f0f", PURE_BLACK: "#000000", MATERIAL_YOU_PURE_BLACK: "#000000", MATERIAL_YOU_NEUTRAL: "#1b1b1f", MATERIAL_YOU_PRIMARY: "#1a2433", MATERIAL_YOU_SECONDARY: "#22262e", MATERIAL_YOU_TERTIARY: "#2a2230", CATPPUCCIN_MOCHA: "#1e1e2e" };
SCENES.look = () => {
  const t = V("morphe_theme_color_dark");
  const bg = t === "CUSTOM" ? String(V("morphe_theme_color_dark_custom") || "#0f0f0f").replace(/^#(..)(......)$/, "#$2") : (THEME_DARK[t] || "#0f0f0f");
  const font = V("morphe_custom_font_type") === "SYSTEM" ? "system-ui, sans-serif" : V("morphe_custom_font_type") === "CUSTOM" ? "Georgia, serif" : "inherit";
  const wide = V("morphe_searchbar_type") === "EXTRA_WIDE";
  const grad = !!V("morphe_gradient_loading_screen");
  return `<div style="background:${bg};height:330px;position:relative;overflow:hidden;font-family:${font};transition:background .3s">
    ${C("hide_status_bar", statusBar(), { blk: 1 })}
    <div style="display:flex;align-items:center;gap:8px;padding:6px 10px 6px 12px">
      ${wide ? "" : `<div style="width:24px;height:17px;border-radius:5px;background:#ff0033"></div><b style="font-size:16px;letter-spacing:-.4px">YouTube</b><div style="flex:1"></div>`}
      ${C("searchbar_type", wide ? `<div style="flex:1;display:flex;align-items:center;gap:8px;height:34px;border-radius:17px;background:rgba(255,255,255,.1);padding:0 12px;color:#aaa;font-size:13px;min-width:250px">${I("search", "ico", 'style="width:18px;height:18px;fill:#aaa"')}Search YouTube</div>` : `<div class="pbtn">${I("search")}</div>`, { style: wide ? "flex:1" : "" })}
      <div class="pbtn">${I("bell")}</div>
    </div>
    ${C("gradient_loading_screen", `<div style="margin:6px 12px;height:110px;border-radius:12px;background:${grad ? "linear-gradient(110deg,#222 30%,#3a3a3a 50%,#222 70%) 0 0/300% 100%;animation:shimmer 1.4s linear infinite" : "#272727"}"></div>
      <div style="margin:8px 12px;height:12px;width:70%;border-radius:6px;background:#272727"></div><div style="margin:6px 12px;height:12px;width:45%;border-radius:6px;background:#272727"></div>`, { blk: 1 })}
    <div style="display:flex;gap:10px;padding:10px 12px">${av(2, 32)}<div><div class="t1">${esc(VIDEOS[2].t)}</div><div class="t2">${VIDEOS[2].c} · ${VIDEOS[2].v}</div></div></div>
    <style>@keyframes shimmer{to{background-position:-300% 0}}</style>
  </div>`;
};
def("look", "vis", "hide_status_bar");
def("look", "style", "theme_color_dark theme_color_dark_custom custom_font_type searchbar_type gradient_loading_screen");

SCENES.snackbar = () => {
  const custom = !!V("morphe_custom_snackbar_theme");
  const bg = custom ? String(V("morphe_custom_snackbar_color_dark") || "#212121") : "#212121";
  const r = custom ? Number(V("morphe_custom_snackbar_corner_radius")) || 0 : 8;
  const stroke = custom ? String(V("morphe_custom_snackbar_stroke_color") || "#00000000") : "#00000000";
  const hex8 = h => { const m = /^#(..)(......)$/.exec(h); return m ? `#${m[2]}${m[1]}` : h; };
  return `<div style="background:#0f0f0f;height:300px;position:relative;overflow:hidden">
    ${thumb(0, "border-radius:0")}
    <div style="display:flex;gap:10px;padding:10px 12px">${av(0, 32)}<div><div class="t1">${esc(VIDEOS[0].t)}</div><div class="t2">${VIDEOS[0].c}</div></div></div>
    ${C("hide_snackbar", `<div style="display:flex;align-items:center;gap:10px;padding:12px 14px;background:${hex8(bg)};border-radius:${r}px;border:1px solid ${hex8(stroke)};box-shadow:0 4px 12px rgba(0,0,0,.5);font-size:13px">Saved to Watch later<span style="margin-left:auto;color:#3ea6ff;font-weight:500">Change</span></div>`, { style: "position:absolute;left:12px;right:12px;bottom:14px", also: "custom_snackbar_theme" })}
  </div>`;
};
def("snackbar", "vis", "hide_snackbar");
def("snackbar", "style", "custom_snackbar_theme custom_snackbar_color_dark custom_snackbar_corner_radius custom_snackbar_stroke_color");


// ------------------------------------------------------------------ section order with the new ones
{
  const order = ["player", "endscreen", "seekbar", "fullscreen", "flyout", "captions", "sponsorblock", "playback", "watch", "description", "comments", "ambient", "danmaku", "miniplayer", "feed", "channel", "explore", "shorts", "nav", "ads", "look", "snackbar", "dearrow", "misc"];
  const all = [...SECTIONS]; SECTIONS.length = 0;
  order.forEach(id => { const s = all.find(x => x.id === id); if (s) SECTIONS.push(s); });
}

let scenarioToken = { alive: false };
function playScenario(k, prevValue) {
  const fn = SCN[k]; if (!fn) return;
  scenarioToken.alive = false;
  const token = scenarioToken = { alive: true };
  const canvas = $("canvas"); const stick = $("stick");
  const wasHidden = stick.hidden || stick.classList.contains("noscene");
  if (wasHidden) { stick.hidden = false; stick.classList.remove("noscene"); $("stage").innerHTML = `<div style="height:320px"></div>`; }
  const on = !!V(k);
  const valueTxt = PREF[k].type === "boolean" ? (on ? "On" : "Off") : (entriesFor(k).find(e => sameVal(e.value, V(k)))?.label || String(V(k)));
  canvas.innerHTML = `<div class="cap"><b>${esc(title(k))}</b><span class="st ${on ? "on" : ""}">${esc(valueTxt)}</span></div><div class="sit"></div><div class="scbox" style="display:grid;place-items:center"></div><div class="foot"></div><div class="prog"></div>`;
  canvas.classList.add("show");
  const prev = prevValue !== undefined ? prevValue : PREF[k].type === "boolean" ? !V(k) : V(k);
  const foot = fn(canvas.querySelector(".scbox"), V(k), prev);
  fitDev();
  if (foot && !canvas.querySelector(".foot").textContent) canvas.querySelector(".foot").textContent = foot;
  const prog = canvas.querySelector(".prog");
  const hold = SCN_HOLD[k] || SC_HOLD;
  prog.animate([{ width: "0%" }, { width: "100%" }], { duration: hold, delay: SC_FADE, fill: "forwards" });
  setTimeout(() => {
    if (!token.alive) return;
    canvas.classList.remove("show");
    setTimeout(() => { if (!token.alive) return; token.alive = false; canvas.innerHTML = ""; if (wasHidden && !SCENES[section]) { stick.hidden = !grouped; stick.classList.add("noscene"); $("stage").innerHTML = ""; } }, SC_FADE);
  }, SC_FADE + hold);
}
function stopScenario() { scenarioToken.alive = false; $("canvas").classList.remove("show"); }

// ------------------------------------------------------------------ demos (gesture / behaviour), faster loop
const LOOP_MS = 1500;
let demoTimer = null, demoStep = 0;
function stopDemo() { clearInterval(demoTimer); demoTimer = null; document.querySelectorAll("#stage .demo-label.dyn").forEach(n => { n.style.opacity = "0"; setTimeout(() => n.remove(), 250); }); }
function label(text, bad, ms) {
  const st = $("stage");
  st.querySelectorAll(".demo-label.dyn").forEach(n => n.remove());
  const d = document.createElement("div");
  d.className = "demo-label dyn" + (bad ? " bad" : "");
  d.textContent = text;
  st.firstElementChild?.appendChild(d);
  if (ms) setTimeout(() => { d.style.opacity = "0"; setTimeout(() => d.remove(), 300); }, ms);
}
const ENDSCREEN_SEL = new Set(["morphe_hide_autoplay_preview", "morphe_hide_end_screen_suggested_video"]);
function finger() { return document.querySelector("#stage .finger"); }
function place(f, x, y, ms) { f.style.transition = ms ? `left ${ms}ms var(--ease), top ${ms}ms var(--ease), opacity 120ms` : "opacity 120ms"; f.style.left = x + "px"; f.style.top = y + "px"; f.classList.add("show"); }
function hideF(f, after) { setTimeout(() => { f.classList.remove("show", "hold"); }, after); }
function tapAt(x, y) { const f = finger(); if (!f) return; place(f, x, y); f.classList.remove("tap"); void f.offsetWidth; f.classList.add("tap"); hideF(f, 520); }
function fmt(total, pct) { const s = Math.round(total * pct / 100); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; }
function setSeek(pct) { const p = $("played"), k = $("knob"); if (p) p.style.width = pct + "%"; if (k) k.style.left = pct + "%"; }
function showPill(text, ms = 1100) {
  const st = $("stage").firstElementChild; if (!st) return;
  const d = document.createElement("div"); d.className = "toastin"; d.style.top = "14px"; d.textContent = text; st.appendChild(d);
  setTimeout(() => d.remove(), ms);
}
const DEMOS = {
  morphe_tap_to_seek(on) {
    const seek = $("seek"); if (!seek) return;
    const st = $("stage").getBoundingClientRect(), r = seek.getBoundingClientRect();
    const pct = [72, 30, 55, 88, 12][demoStep % 5];
    tapAt(r.left - st.left + r.width * pct / 100, r.top - st.top + r.height / 2);
    if (on) { setTimeout(() => setSeek(pct), 120); label(`Tap on seekbar: jumps to ${fmt(18 * 60 + 42, pct)}`); }
    else label("Tap on seekbar: nothing happens. Stock YouTube needs a drag.", true);
  },
  morphe_slide_to_seek(on) {
    const f = finger(); if (!f) return; const W = $("stage").clientWidth;
    place(f, W * .3, 90); f.classList.add("hold");
    if (on) { label("Press and hold the video, then slide: seeks"); setTimeout(() => { place(f, W * .7, 90, 700); setSeek(60); }, 250); }
    else { label("Press and hold the video: plays at 2x speed (stock)", true); showPill("2x ▸▸"); }
    hideF(f, 1150);
  },
  morphe_disable_precise_seeking_gesture(disabled) {
    const film = $("film"), f = finger(); if (!film || !f) return; const st = $("stage");
    place(f, st.clientWidth * .42, st.clientHeight - 40);
    setTimeout(() => place(f, st.clientWidth * .42, st.clientHeight - 110, 450), 120);
    if (!disabled) { setTimeout(() => { film.style.display = "flex"; }, 450); label("Pull up on the seekbar: precise seeking opens"); }
    else label("Pull up on the seekbar: precise seeking stays off", true);
    setTimeout(() => { film.style.display = "none"; }, 1250); hideF(f, 1150);
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
  morphe_swipe_overlay_background_opacity() { DEMOS.morphe_swipe_overlay_style(); },
  morphe_swipe_text_overlay_size() { DEMOS.morphe_swipe_overlay_style(); },
  morphe_swipe_overlay_progress_volume_color() { swipeDemo("right", "VOLUME"); },
  morphe_swipe_overlay_progress_brightness_color() { swipeDemo("left", "BRIGHTNESS"); },
  morphe_swipe_overlay_progress_speed_color() { swipeDemo("right", "SPEED"); },
  morphe_swipe_zone_width() { swipeZones(1400, true); label(`Left and right zones: ${V("morphe_swipe_zone_width")}% of the width each`, false, 1400); },
  morphe_swipe_seek(on) {
    const f = finger(); if (!f) return; const W = $("stage").clientWidth;
    place(f, W * .35, 80); setTimeout(() => place(f, W * .7, 80, 650), 150);
    if (on) { label("Swipe sideways in fullscreen: +1:30, release to seek"); showPill("+1:30  ▸▸"); } else label("Swipe sideways: does nothing (stock)", true);
    hideF(f, 1100);
  },
  morphe_disable_shorts_double_tap_to_like(disabled) {
    const W = $("stage").clientWidth;
    tapAt(W * .45, 170); setTimeout(() => tapAt(W * .45, 170), 180);
    const h = $("heart");
    if (!disabled && h) { setTimeout(() => { h.style.transform = "translate(-50%,-50%) scale(1)"; }, 260); setTimeout(() => { h.style.transform = "translate(-50%,-50%) scale(0)"; }, 900); label("Double-tap: likes the Short (stock)"); }
    else label("Double-tap: does nothing, no accidental likes", true);
  },
  morphe_autoplay_mode(v) {
    const cd = document.querySelector("#stage .cd");
    if (cd) { let n = 5; cd.textContent = n; const t = setInterval(() => { n--; if (n < 1 || !document.body.contains(cd)) { clearInterval(t); return; } cd.textContent = n; }, 250); }
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
    else { let i = 0; line.textContent = ""; const t = setInterval(() => { if (!document.body.contains(line) || i >= words.length) { clearInterval(t); return; } line.textContent += (i ? " " : "") + words[i++]; }, 120); label("Word by word: text shifts as spoken (stock)"); }
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
  if (ms) { setTimeout(() => z.classList.add("out"), ms); setTimeout(() => z.remove(), ms + 400); }
}
function swipeDemo(side, action, prefix = "") {
  const st = $("stage"), f = finger(), hud = $("hud"); if (!f || !hud) return;
  const zw = Math.max(5, Math.min(50, Number(V("morphe_swipe_zone_width")) || 37)) / 100;
  const W = st.clientWidth, H = st.firstElementChild.clientHeight, x = side === "top" ? W * .5 : side === "left" ? W * zw / 2 : W * (1 - zw / 2);
  swipeZones();
  if (side === "top") { place(f, W * .35, H * .12); setTimeout(() => place(f, W * .65, H * .12, 800), 120); }
  else { place(f, x, H * .75); setTimeout(() => place(f, x, H * .25, 800), 120); }
  const sideName = side === "top" ? "Top" : side === "left" ? "Left" : "Right";
  if (!action || action === "OFF") { label(`${sideName} swipe: does nothing (off)`, true); hud.style.display = "none"; }
  else {
    const ic = action === "VOLUME" ? "vol" : action === "BRIGHTNESS" ? "bright" : "speed";
    const style = state.morphe_swipe_overlay_style || "HORIZONTAL";
    const circ = style.startsWith("CIRCULAR"), vert = style.startsWith("VERTICAL"), min = style.includes("MINIMAL");
    const bgA = (Number(V("morphe_swipe_overlay_background_opacity")) || 0) / 100;
    const col = argb(V(action === "VOLUME" ? "morphe_swipe_overlay_progress_volume_color" : action === "BRIGHTNESS" ? "morphe_swipe_overlay_progress_brightness_color" : "morphe_swipe_overlay_progress_speed_color"), "#fff");
    const ts = Math.max(8, Math.min(30, Number(V("morphe_swipe_text_overlay_size")) || 14)) * .8;
    const txt = `<span style="font-size:${ts}px;font-weight:600;color:#fff">${action === "SPEED" ? "1.5x" : "60"}</span>`;
    let inner;
    if (circ) inner = `<div style="width:64px;height:64px;border-radius:50%;background:conic-gradient(${col} var(--p,0%),rgba(255,255,255,.25) 0);display:grid;place-items:center"><div style="width:52px;height:52px;border-radius:50%;background:rgba(0,0,0,${Math.max(bgA, .3)});display:grid;place-items:center">${I(ic)}${txt}</div></div>`;
    else if (vert) inner = `<div style="display:grid;justify-items:center;gap:6px;background:${min ? "transparent" : `rgba(0,0,0,${bgA})`};padding:8px;border-radius:14px">${I(ic)}<div style="width:6px;height:80px;background:rgba(255,255,255,.25);border-radius:3px;position:relative"><div style="position:absolute;bottom:0;left:0;right:0;height:var(--p,0%);background:${col};border-radius:3px"></div></div>${txt}</div>`;
    else inner = `<div style="display:flex;align-items:center;gap:8px;background:${min ? "transparent" : `rgba(0,0,0,${bgA})`};padding:8px 12px;border-radius:18px">${I(ic)}<div style="width:110px;height:5px;background:rgba(255,255,255,.25);border-radius:3px;position:relative"><div style="position:absolute;left:0;top:0;bottom:0;width:var(--p,0%);background:${col};border-radius:3px"></div></div>${txt}</div>`;
    hud.innerHTML = inner; hud.style.display = "block";
    if (style === "HORIZONTAL_MINIMAL_TOP") { hud.style.left = "50%"; hud.style.right = "auto"; hud.style.top = "12px"; hud.style.transform = "translateX(-50%)"; }
    else if (vert) { hud.style.left = side === "left" ? "auto" : "14px"; hud.style.right = side === "left" ? "14px" : "auto"; hud.style.top = "50%"; hud.style.transform = "translateY(-50%)"; }
    else { hud.style.left = "50%"; hud.style.right = "auto"; hud.style.top = "50%"; hud.style.transform = "translate(-50%,-50%)"; }
    let p = 20; hud.style.setProperty("--p", p + "%");
    const t = setInterval(() => { p += 10; hud.style.setProperty("--p", Math.min(p, 90) + "%"); if (p > 90) clearInterval(t); }, 80);
    label(`${prefix}${sideName} swipe: ${entryLabel("morphe_swipe_" + side + "_zone", action) || action.toLowerCase()}`);
    setTimeout(() => { hud.style.display = "none"; }, 1200);
  }
  hideF(f, 1050);
}
function startDemo(k) {
  stopDemo();
  const fn = DEMOS[k]; if (!fn) return;
  demoStep = 0;
  const run = () => { if (selected !== k) return stopDemo(); fn(V(k)); demoStep++; };
  setTimeout(run, 60);
  demoTimer = setInterval(run, LOOP_MS);
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
    const played = $("played"), knob = $("knob"), tl = bub && bub.querySelector(".time");
    [played, knob].forEach(e => e && (e.style.transition = "none"));
    if (bub) { bub.classList.add("dragging"); bub.style.opacity = on ? "1" : "0"; }
    const frame = pct => {
      setSeek(pct); place(f, xAt(pct) - st.left, y);
      if (bub) { const half = 50, x = Math.min(Math.max(xAt(pct) - pr.left, half + 4), pr.width - half - 4); bub.style.left = x + "px"; }
      if (tl) tl.textContent = fmt(total, pct);
    };
    frame(p0); f.classList.add("hold");
    const t0 = performance.now() + 180, dur = 1000, tok = demoTimer;
    const step = now => {
      if (demoTimer !== tok || !document.body.contains(seek)) return;
      const t = Math.min(1, Math.max(0, (now - t0) / dur)), e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      frame(p0 + (p1 - p0) * e);
      if (t < 1) requestAnimationFrame(step);
      else setTimeout(() => { if (demoTimer !== tok) return; f.classList.remove("show", "hold"); if (bub) { bub.classList.remove("dragging"); bub.style.left = ""; bub.style.opacity = ""; } if (tl) tl.textContent = "7:51"; [played, knob].forEach(e => e && (e.style.transition = "")); setSeek(p0); }, 450);
    };
    requestAnimationFrame(step);
    label(on ? "Drag the seekbar: a thumbnail follows your finger" : "Drag the seekbar: no thumbnail, only the time", !on);
  },
  morphe_hide_player_gesture_hints(hidden) {
    const f = finger(); if (!f) return; const st = $("stage");
    const hint = document.querySelector('#stage [data-k="morphe_hide_player_gesture_hints"]');
    place(f, st.clientWidth * .42, st.clientHeight - 16); setTimeout(() => place(f, st.clientWidth * .42, st.clientHeight - 90, 600), 120);
    if (hint) { hint.style.transition = "opacity .2s"; hint.style.opacity = "0"; setTimeout(() => { hint.style.opacity = hidden ? "0" : "1"; }, 300); setTimeout(() => { hint.style.opacity = ""; }, 1400); }
    label(hidden ? "Pull up on the seekbar: no hint appears" : "Pull up on the seekbar: the hint explains the gesture", hidden);
    hideF(f, 1100);
  },
});
const liveDev = (rew) => `${miniVideo(5)}<span style="position:absolute;left:8px;top:7px;font-size:8px;font-weight:700;background:#cc0000;padding:1px 4px;border-radius:2px">LIVE</span><div class="msk" style="position:absolute;left:8%;right:8%;bottom:16%;height:3px;background:rgba(255,255,255,.3)"><div class="buf" style="position:absolute;left:${rew}%;right:0;top:0;bottom:0;background:rgba(255,255,255,.35)"></div><div class="mp" style="position:absolute;left:0;top:0;bottom:0;width:100%;background:#ff0033;transition:width .9s var(--ease)"></div></div>`;
scen("seekbar", "live_stream_dvr", (box, on) => {
  situation("A live stream that blocks rewinding");
  box.innerHTML = device("land", liveDev(on ? 0 : 96));
  const dev = box.querySelector(".dev"), f = box.querySelector("#scFinger"), mp = dev.querySelector(".mp"); const W = dev.clientWidth, H = dev.clientHeight;
  at(150, () => fingerTo(f, W * .9, H * .84)); at(450, () => { fingerTo(f, W * .35, H * .84, 900); if (on) mp.style.width = "35%"; });
  at(1400, () => dev.insertAdjacentHTML("beforeend", `<div class="toastin" style="top:8px;font-size:9px">${on ? "−1:12:40 · rewinding" : "This stream can't be rewound"}</div>`));
  return on ? "You can drag back on any live stream" : "Rewinding is blocked on this stream (stock)";
});
scen("seekbar", "expand_live_stream_dvr_duration", (box, on) => {
  situation("Dragging back on a long live stream");
  box.innerHTML = device("land", liveDev(on ? 0 : 70));
  const dev = box.querySelector(".dev"), f = box.querySelector("#scFinger"), mp = dev.querySelector(".mp"); const W = dev.clientWidth, H = dev.clientHeight;
  at(150, () => fingerTo(f, W * .9, H * .84)); at(450, () => { fingerTo(f, W * .1, H * .84, 1000); mp.style.width = on ? "3%" : "70%"; });
  at(1500, () => dev.insertAdjacentHTML("beforeend", `<div class="toastin" style="top:8px;font-size:9px">${on ? "−3 days · stream start" : "Stops at −4:00:00"}</div>`));
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
    setTimeout(() => ed.remove(), 1450);
  },
  morphe_sb_create_new_segment_step() { DEMOS.morphe_sb_create_new_segment(true); },
  morphe_sb_voting_button(on) {
    const st = $("stage").firstElementChild; if (!st || !on) { label("The voting button is hidden", true, 1300); return; }
    st.querySelectorAll(".sbedit").forEach(n => n.remove());
    const ed = document.createElement("div"); ed.className = "sbedit";
    ed.innerHTML = `<span class="chip">${I("like", "ico", 'style="width:14px;height:14px"')} Upvote</span><span class="chip">${I("dislike", "ico", 'style="width:14px;height:14px"')} Downvote</span><span class="chip">Change category</span>`;
    st.appendChild(ed); label("Vote on the segments of this video", false, 1300); setTimeout(() => ed.remove(), 1450);
  },
});
// Shared pieces for small "phone" scenarios: a page made of rows, a toast, a sheet.
const pageRows = (rows) => `<div class="pg7" style="position:absolute;inset:0;background:#0f0f0f;padding:6px;display:grid;grid-template-columns:minmax(0,1fr);grid-auto-rows:max-content;gap:5px;align-content:start;font-size:7px;color:#ddd">${rows}</div>`;
const bar7 = (w = 100, c = "#2a2a2a", h = 6) => `<i style="display:block;height:${h}px;width:${w}%;border-radius:3px;background:${c}"></i>`;
const cmt7 = (i, txt) => `<div class="cm7" style="display:flex;gap:4px;align-items:flex-start;padding:3px;border-radius:4px;transition:background .2s"><span style="width:12px;height:12px;border-radius:50%;background:${AV[i % AV.length]};flex:none"></span><span style="line-height:1.3">${txt}</span></div>`;
function toast7(dev, text, top = "78%") { dev.querySelectorAll(".t7").forEach(n => n.remove()); dev.insertAdjacentHTML("beforeend", `<div class="toastin t7" style="top:${top};font-size:8px;padding:3px 8px">${text}</div>`); }
function sheet7(dev, rows) { dev.insertAdjacentHTML("beforeend", `<div class="sh7" style="position:absolute;left:0;right:0;bottom:0;background:#212121;border-radius:8px 8px 0 0;padding:6px;display:grid;gap:4px;font-size:7.5px;animation:sheetup .25s var(--ease);z-index:5">${rows}</div>`); }
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
  situation("Comments panel");
  const list = ["The wood stove at 12:04 is pure cosiness", "Which stove model is that?", "Subscribed for part 2", "Stove + rain = perfect"];
  box.innerHTML = device("port", pageRows(`<div style="display:flex;align-items:center;gap:4px"><b style="font-size:8px;flex:1">Comments</b>${on ? `<span class="srch7" style="width:10px;height:10px;display:grid;place-items:center">${I("search", "ico", 'style="width:10px;height:10px"')}</span>` : ""}</div><div class="q7" style="height:0;overflow:hidden;transition:height .25s"><div style="height:12px;border-radius:6px;background:#2c2c2c;padding:0 5px;line-height:12px;color:#aaa"></div></div>${list.map((t, i) => cmt7(i + 1, t)).join("")}`));
  const dev = box.querySelector(".dev"), f = box.querySelector("#scFinger"); const W = dev.clientWidth, H = dev.clientHeight;
  if (!on) { at(300, () => toast7(dev, "No search in comments", "60%")); return "No way to search the loaded comments (stock)"; }
  at(200, () => fingerTo(f, W * .88, H * .055)); at(550, () => tapF(f));
  at(750, () => { f.classList.remove("show"); dev.querySelector(".q7").style.height = "14px"; });
  const q = dev.querySelector(".q7 div"); "stove".split("").forEach((ch, i) => at(950 + i * 110, () => { q.textContent += ch; }));
  at(1600, () => dev.querySelectorAll(".cm7").forEach((c, i) => { if (!/stove/i.test(list[i])) { c.style.transition = "opacity .25s, height .3s"; c.style.opacity = "0"; setTimeout(() => { c.style.display = "none"; }, 260); } }));
  return "Search button: shows only the loaded comments with your words";
});
scen("channel", "channel_search", (box, on) => {
  situation("A channel page");
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
    setTimeout(() => {
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
  at(900, () => { f.classList.remove("hold", "show"); if (!on) { toast7(dev, "Nothing happens", "60%"); return; } const w = dev.querySelector(".w7"); w.style.background = "rgba(62,166,255,.45)"; w.style.borderRadius = "2px"; dev.insertAdjacentHTML("beforeend", `<div class="toastin" style="top:6%;font-size:7.5px;padding:3px 8px;background:#333">Copy · Select all · Share</div>`); });
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
  if (on) { d.style.opacity = "0"; at(500, () => d.style.opacity = "1"); at(800, () => d.style.opacity = "0"); at(1000, () => toast7(dev, "Accepted for you", "70%")); return "The dialog is accepted automatically (age limits still apply)"; }
  at(700, () => toast7(dev, "Playback waits for you", "82%"));
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
def("playback", "style", "playback_speed_default video_quality_default_wifi video_quality_default_mobile disable_hdr_video force_hdr_video video_codec playback_audio_pitch_default custom_playback_speeds custom_speed_menu");
Object.assign(DEMOS, {
  morphe_remember_playback_speed_last_selected_toast(on) { if (on) showPill("Changed default speed to: 1.5x", 1300); label(on ? "A toast confirms the new default speed" : "No toast when the default speed changes", !on, 1300); },
  morphe_remember_video_quality_last_selected_toast(on) { if (on) showPill("Changed default Wi-Fi quality to: 1080p", 1300); label(on ? "A toast confirms the new default quality" : "No toast when the default quality changes", !on, 1300); },
  morphe_skip_silence(on) {
    const t = $("pbTime"); if (!t) return;
    t.textContent = "3:12 / 18:42"; label(on ? "A quiet pause: skipped" : "A quiet pause: plays through (stock)", !on, 1300);
    if (on) setTimeout(() => { t.style.transition = "color .2s"; t.style.color = "#3ea6ff"; t.textContent = "3:14 / 18:42"; showPill("Skipped 2 s of silence", 900); setTimeout(() => { t.style.color = ""; }, 600); }, 500);
  },
});
def("playback", "behaviour", "remember_playback_speed_last_selected_toast remember_video_quality_last_selected_toast skip_silence");
// Comments: context lines (pinned, creator heart), gift cards, and a scrollable panel
{ const base = SCENES.comments; SCENES.comments = () => base()
    .replace('<div style="position:absolute;left:0;right:0;top:44px;bottom:0;background:#212121;border-radius:14px 14px 0 0;overflow-y:auto;scrollbar-width:thin">', '<div class="inner-scroll" style="position:absolute;left:0;right:0;top:44px;bottom:0;background:#212121;border-radius:14px 14px 0 0;overflow-y:auto;scrollbar-width:thin;padding-bottom:10px">')
    .replace(/(<div style="display:flex;gap:10px;padding:10px 12px">)/, `${C("hide_comments_contexts", `<div class="t2" style="padding:6px 12px 0 50px;display:flex;gap:6px;align-items:center;font-size:11.5px">${I("lock", "ico", 'style="width:12px;height:12px;fill:#aaa"')}Pinned by @fjordtimber</div>`, { blk: 1 })}$1`)
    .replace(/(<\/div>\s*<\/div>\s*)$/, `${C("hide_comments_gift_animation_and_cards", `<div style="margin:6px 12px;padding:10px 12px;border-radius:12px;background:linear-gradient(90deg,#3b2a12,#2a2a2a);display:flex;gap:10px;align-items:center">${I("gift", "ico", 'style="fill:#ffb74d"')}<div><b style="font-size:12.5px">@carpenter_jo sent 5 gifts</b><div class="t2">Gifted memberships to the community</div></div></div>`, { blk: 1 })}
      <div style="display:flex;gap:10px;padding:10px 12px">${av(7, 28)}<div style="flex:1"><div class="t2">@slowrails · 5h ${I("heart", "ico", 'style="width:12px;height:12px;fill:#ff4e45;vertical-align:-2px"')}</div><div style="font-size:13.5px;margin-top:2px">Which stove model is that?</div></div></div>$1`); }
def("comments", "vis", "hide_comments_contexts hide_comments_gift_animation_and_cards");
{ const base = SCENES.player; SCENES.player = () => base().replace(/^\s*<div/, `<div data-icons="${esc(V("morphe_player_icon_style") || "AUTO")}"`); }
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
    setTimeout(() => { if (document.body.contains(nb)) nb.classList.toggle("narrow", on); }, 650);
    label(on ? "Narrow buttons: grouped in the middle, easier to reach" : "Default: buttons spread over the whole width", !on, 1300);
  },
});

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
    at(2400, () => { fd.style.opacity = 0; setTimeout(() => { fd.innerHTML = `${big7(6, "Stove install, part 2")}${row7(0, "Shorts you missed")}${row7(1, "Live: northern lights")}${row7(7, "Top 10 axes")}`; fd.style.opacity = 1; dev.querySelector(".spin7")?.remove(); }, 260); });
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
  at(1700, () => { if (on) { dev.querySelector(".sh7")?.remove(); toast7(dev, "Saved to Pictures"); } });
  return on ? "Hold an image: download it" : "Images in posts can't be saved (stock)";
});
scen("feed", "post_translate", (box, on) => {
  situation("A community post in another language");
  box.innerHTML = device("port", pageRows(`<div style="display:flex;gap:4px;align-items:center"><span style="width:12px;height:12px;border-radius:50%;background:${AV[0]}"></span><b style="font-size:7px">Fjord & Timber</b></div><div class="tx7" style="font-size:6.5px;line-height:1.35;transition:opacity .25s">Taket er ferdig! Neste uke: vedovnen.</div>${on ? `<div class="tb7" style="font-size:6px;color:#3ea6ff;display:flex;gap:2px;align-items:center">${ico7("translate", 7, "#3ea6ff")}Translate</div>` : ""}<div style="height:34px;border-radius:4px;background:${ART[3]}"></div>`));
  const dev = box.querySelector(".dev"), f = box.querySelector("#scFinger"); const W = dev.clientWidth, H = dev.clientHeight;
  if (!on) { at(400, () => toast7(dev, "No translate button", "80%")); return "Posts stay in their language (stock)"; }
  at(300, () => fingerTo(f, W * .25, H * .2)); at(650, () => tapF(f));
  at(900, () => { f.classList.remove("show"); const t = dev.querySelector(".tx7"); t.style.opacity = 0; setTimeout(() => { t.textContent = "The roof is done! Next week: the wood stove."; t.style.opacity = 1; }, 260); dev.querySelector(".tb7").innerHTML = "Show original"; });
  return "A Translate button under posts in other languages";
});
scen("feed", "native_queue_fetch_on_scroll", (box, on) => {
  situation("Scrolling to the end of the queue");
  box.innerHTML = device("port", pageRows(top7("Queue", ["more"]) + `<div class="q7" style="display:grid;gap:4px;transition:transform .6s var(--ease)">${[1, 2, 3, 4].map(i => row7(i, "Queued video " + i)).join("")}</div>`));
  const dev = box.querySelector(".dev"), f = box.querySelector("#scFinger"), q = dev.querySelector(".q7"); const W = dev.clientWidth, H = dev.clientHeight;
  at(250, () => fingerTo(f, W * .5, H * .75)); at(500, () => { fingerTo(f, W * .5, H * .3, 600); q.style.transform = "translateY(-40px)"; });
  at(1200, () => { f.classList.remove("show"); if (on) { q.insertAdjacentHTML("beforeend", `<div style="font-size:6px;color:#aaa;text-align:center">Loading more…</div>`); setTimeout(() => { q.lastChild.remove(); q.insertAdjacentHTML("beforeend", [5, 6].map(i => row7(i, "Up next " + i)).join("")); }, 500); } else q.insertAdjacentHTML("beforeend", `<div style="font-size:6px;color:#aaa;text-align:center">End of queue</div>`); });
  return on ? "More videos load as you reach the end" : "The queue just ends (stock)";
});
scen("feed", "restore_original_titles", (box, on) => {
  situation("A video with a translated title");
  box.innerHTML = device("port", pageRows(feed7(`${big7(3, "")}<div class="tt7" style="font-size:7px;font-weight:600;transition:opacity .25s">Ich habe eine winzige Hütte gebaut</div>${row7(4, "Nachtzug nach Bodø")}`)));
  const dev = box.querySelector(".dev"), t = dev.querySelector(".tt7");
  at(700, () => { if (!on) return; t.style.opacity = 0; setTimeout(() => { t.textContent = "I built a tiny cabin"; t.style.opacity = 1; }, 260); });
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
  at(1200, () => { dev.querySelector(".t7")?.remove(); if (on) { x7(dev, ly); setTimeout(() => { dev.querySelector(".x7")?.remove(); check7(dev, "Layout stays the same"); }, 600); } else { ly.style.opacity = 0; setTimeout(() => { ly.innerHTML = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:3px">${[3, 4, 5, 6].map(i => `<div style="height:22px;border-radius:3px;background:${ART[i]}"></div>`).join("")}</div>`; ly.style.opacity = 1; }, 300); } });
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
  at(600, () => dev.insertAdjacentHTML("beforeend", on ? `<div class="toastin" style="bottom:24px;top:auto;font-size:7px;padding:3px 8px;border-radius:4px;background:#323232">Saved to Watch later</div>` : `<div style="position:absolute;left:4px;right:4px;bottom:20px;display:flex;justify-content:space-between;padding:4px 6px;border-radius:8px;background:#f1f1f1;color:#000;font-size:6.5px;animation:sheetup .25s">Saved to Watch later<b style="color:#065fd4">Change</b></div>`));
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
  at(700, () => { if (!on) return; v.style.opacity = 0; setTimeout(() => { v.textContent = V("morphe_spoof_app_version_target") || "19.01.34"; v.style.opacity = 1; toast7(dev, "Old layout comes back", "82%"); }, 260); });
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
scen("captions", "set_caption_cookies", (box, on) => {
  situation("Captions on a video that needs sign-in");
  box.innerHTML = device("port", pageRows(player7(3, `<span class="cp7" style="position:absolute;left:50%;bottom:4px;transform:translateX(-50%);font-size:6px;background:rgba(0,0,0,.75);padding:0 3px;white-space:nowrap"></span>`) + row7(2, "Up next")));
  const dev = box.querySelector(".dev");
  at(600, () => { dev.querySelector(".cp7").textContent = on ? "Today: the roof" : "Captions unavailable"; });
  return on ? "Captions load with your saved cookies" : "Some captions fail without cookies (stock)";
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
  box.innerHTML = device("port", `<div style="position:absolute;inset:0;background:#222;display:grid;place-items:center;font-size:6.5px;color:#aaa">Other app</div><div class="toastin" style="top:6px;font-size:6px;padding:2px 6px">${ico7("music", 7)} Playing: Short 1</div>`);
  const dev = box.querySelector(".dev");
  at(1000, () => { dev.querySelector(".toastin").innerHTML = on ? `${ico7("music", 7)} Playing: Short 2` : `${ico7("pause", 7)} Short 1 · ended`; });
  return on ? "The next Short plays in the background" : "Playback stops at the end of the Short (stock)";
});
scen("shorts", "shorts_disable_background_playback", (box, on) => {
  situation("Leaving the app during a Short");
  box.innerHTML = device("port", `<div style="position:absolute;inset:0;background:${ART[5]}"></div>`);
  const dev = box.querySelector(".dev");
  at(600, () => { dev.innerHTML = `<div style="position:absolute;inset:0;background:#222;display:grid;place-items:center;font-size:6.5px;color:#aaa">Home screen</div><div class="toastin" style="top:6px;font-size:6px;padding:2px 6px">${on ? `${ico7("pause", 7)} Short paused` : `${ico7("music", 7)} Short keeps playing`}</div>`; });
  return on ? "Shorts stop when you leave the app" : "Shorts keep playing in the background like videos (patched default)";
});
scen("shorts", "shorts_remember_playback_speed", (box, on) => {
  situation("Changing speed on a Short, then swiping");
  box.innerHTML = device("port", `<div class="sv7" style="position:absolute;inset:0;background:${ART[5]};transition:transform .4s var(--ease)"></div><div class="sp7 toastin" style="top:8px;font-size:7px;padding:2px 6px">1.5×</div>`);
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
  box.innerHTML = device("land", `<div style="position:absolute;inset:0;background:${ART[3]}"></div><div style="position:absolute;left:50%;top:6px;transform:translateX(-50%);font-size:6px;background:rgba(0,0,0,.6);padding:1px 5px;border-radius:5px;display:flex;gap:2px">${ico7("lock", 7)}Locked</div>`);
  const dev = box.querySelector(".dev"), f = box.querySelector("#scFinger"); const W = dev.clientWidth, H = dev.clientHeight;
  at(300, () => fingerTo(f, W * .82, H * .7)); at(500, () => fingerTo(f, W * .82, H * .3, 500));
  at(1100, () => { f.classList.remove("show"); if (on) toast7(dev, "Ignored while locked", "50%"); else dev.insertAdjacentHTML("beforeend", `<div class="toastin" style="top:40%;font-size:7px">${ico7("vol", 8)} 80%</div>`); });
  return on ? "Swipe gestures do nothing while locked" : "Swipes still change volume when locked (stock)";
});
scen("fullscreen", "swipe_lowest_value_enable_auto_brightness", (box, on) => {
  situation("Swiping brightness all the way down");
  box.innerHTML = device("land", `<div class="br7" style="position:absolute;inset:0;background:${ART[3]};transition:filter .6s"></div>`);
  const dev = box.querySelector(".dev"), f = box.querySelector("#scFinger"); const W = dev.clientWidth, H = dev.clientHeight;
  at(300, () => fingerTo(f, W * .18, H * .3)); at(500, () => { fingerTo(f, W * .18, H * .85, 700); dev.querySelector(".br7").style.filter = "brightness(.35)"; });
  at(1300, () => { f.classList.remove("show"); dev.insertAdjacentHTML("beforeend", `<div class="toastin" style="top:40%;font-size:7px">${ico7("bright", 8)} ${on ? "Auto" : "0%"}</div>`); if (on) dev.querySelector(".br7").style.filter = "brightness(.8)"; });
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
  box.innerHTML = device("port", pageRows(player7(3, `<span class="cd7" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:7px;background:rgba(0,0,0,.6);padding:1px 5px;border-radius:5px;white-space:nowrap;display:flex;gap:2px;align-items:center">Next in 5</span>`) + `<b style="font-size:6.5px">Road trip mix · 2 / 12</b>` + row7(2, "Night train") + row7(4, "Lo-fi beats")));
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
  box.innerHTML = duo7(pageRows(feed), pageRows(feed));
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
  story(left, false); story(right, true);
  at(4400, () => situation("2 · Then you open a live stream"));
  return "Stock panels jump open; with the setting on they wait for your tap";
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
scen("playback", "force_fullscreen_landscape", (box, on) => {
  situation("Fullscreen on a vertical video");
  box.innerHTML = device("port", watch7(`<div style="position:absolute;left:40%;right:40%;top:0;bottom:0;background:${ART[6]}"></div>`));
  const dev = box.querySelector(".dev"), f = box.querySelector("#scFinger"); const W = dev.clientWidth;
  at(300, () => fingerTo(f, W - 8, 44)); at(600, () => tapF(f));
  at(850, () => { f.classList.remove("show"); if (on) { rotate(dev, "land"); dev.innerHTML = `<div style="position:absolute;inset:0;background:#000"></div><div style="position:absolute;left:38%;right:38%;top:0;bottom:0;background:${ART[6]}"></div>`; } else dev.innerHTML = `<div style="position:absolute;inset:0;background:#000"></div><div style="position:absolute;left:0;right:0;top:20%;bottom:20%;background:${ART[6]}"></div>`; });
  return on ? "Fullscreen always turns the phone sideways" : "Vertical videos stay upright in fullscreen (stock)";
});
hidePage("playback", "fullscreen_playlist_panel", "A playlist in fullscreen", `<div style="position:absolute;inset:0;background:${ART[3]}"></div><div class="tgt7" style="position:absolute;right:0;top:0;bottom:0;width:38%;background:rgba(15,15,15,.92);padding:4px;display:grid;gap:3px;align-content:start;font-size:5.5px"><b>Road trip mix</b>${[1, 2, 4].map(i => `<div style="display:flex;gap:2px"><span style="width:14px;height:8px;background:${ART[i]}"></span>Video ${i}</div>`).join("")}</div>`, { dev: "land", raw: true, invert: true, shown: "The playlist sits beside the video in fullscreen", hidden: "Leave fullscreen to see the playlist (stock)" });
for (const [k, label, icon] of [["hide_ask_gemini_button", "Ask", "spark"], ["hide_chapters_timeline_button", "Chapters", "list"], ["hide_live_chat_replay_button", "Live chat replay", "chat"], ["hide_sync_button", "Sync", "reload"]])
  hidePage("playback", k, "Under the video", player7(3) + `<b style="font-size:7px">Building a tiny cabin</b><div style="display:flex;gap:3px;align-items:center;overflow:hidden;padding:2px">${chip7("Like")}${tgt7(`<span style="display:inline-flex;gap:2px;align-items:center;padding:1px 5px;border-radius:5px;background:#272727;font-size:6px;white-space:nowrap">${ico7(icon, 6)}${label}</span>`, 1)}${chip7("Share")}</div>` + row7(2, "Up next"));
hidePage("playback", "hide_subscribers_community_guidelines", "Before posting in a channel's community", top7("Fjord & Timber", ["more"]) + tgt7(`<div style="padding:3px;border-radius:3px;background:#1b1b1b;font-size:6px">Please follow the community guidelines · Got it</div>`) + cmt7(2, "Love the roof!"));
hidePage("playback", "hide_tap_and_hold_gradient", "Holding the video for 2× speed", `<div style="position:absolute;inset:0;background:${ART[3]}"></div><div class="tgt7" style="position:absolute;left:0;right:0;top:0;height:40%;background:linear-gradient(rgba(0,0,0,.75),transparent)"></div><div style="position:absolute;left:50%;top:6px;transform:translateX(-50%);font-size:6px">2× ▶▶</div>`, { dev: "land", raw: true });
hidePage("playback", "hide_timed_reactions", "Comments under a live replay", player7(3, `<div class="tgt7" style="position:absolute;right:4px;bottom:4px;display:grid;gap:1px;font-size:8px"><span>❤️</span><span>😂</span><span>🔥</span></div>`) + row7(2, "Up next"));
scen("playback", "on_the_go", (box, on) => {
  situation("Turning off the screen while a video plays");
  box.innerHTML = device("port", watch7());
  const dev = box.querySelector(".dev");
  at(600, () => { dev.innerHTML = `<div style="position:absolute;inset:0;background:#000"></div><div class="toastin" style="top:40%;font-size:6.5px;padding:2px 6px">${on ? `${ico7("music", 7)} Audio keeps playing` : `${ico7("pause", 7)} Paused`}</div>`; });
  return on ? "Audio-only mode when the screen goes off" : "The video pauses (stock)";
});
scen("playback", "sanitize_video_subtitle", (box, on) => {
  situation("The line under a video title");
  box.innerHTML = device("port", pageRows(player7(3) + `<b style="font-size:7px">Building a tiny cabin</b><div class="sb7" style="font-size:5.5px;color:#aaa;transition:opacity .25s">1.2M views · 3 days ago · #diy #cabin #offgrid ...more</div>` + row7(2, "Up next")));
  const dev = box.querySelector(".dev");
  at(700, () => { if (!on) return; const s = dev.querySelector(".sb7"); s.style.opacity = 0; setTimeout(() => { s.textContent = "1.2M views · 3 days ago"; s.style.opacity = 1; }, 260); });
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
  box.innerHTML = device("port", watch7(`<span class="lc8" style="position:absolute;right:3px;top:3px;font-size:6px;background:rgba(0,0,0,.6);padding:0 3px;border-radius:4px">${on ? "Loop 1" : ""}</span>`));
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
    box.innerHTML = device("port", watch7(`<span class="rv7" style="position:absolute;right:3px;top:3px;font-size:6px;background:rgba(0,0,0,.6);padding:0 3px;border-radius:4px">${val}</span>`));
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
      const par = MANUAL_PARENT[k] && set.has(MANUAL_PARENT[k].key) ? MANUAL_PARENT[k].key : (PREF[k].parents || []).map(x => x.key).find(ok) || (shared ? null : avKeys[0]);
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
const sectionOf = k => SECTIONS.find(s => MEMBERS[s.id].live.includes(k) || MEMBERS[s.id].misc.includes(k))?.id || "misc";

// ------------------------------------------------------------------ rendering
const $ = id => document.getElementById(id);
const secInfo = () => SECTIONS.find(s => s.id === section);

function renderBar() {
  const s = secInfo(), g = groupOf(section);
  $("secLabel").textContent = grouped ? g.title : s.title;
  $("secIcon").innerHTML = `<path d="${P[grouped ? g.icon : s.icon] || P.list}"/>`;
  renderTabs();
  const pick = (x, i) => {
    const m = MEMBERS[x.id];
    const sub = `${m.live.length + m.misc.length} settings`;
    return `<button class="pick" role="menuitem" data-sec="${x.id}" aria-current="${x.id === section}" style="transition-delay:${Math.min(i, 12) * 12}ms"><span class="pi">${I(x.icon)}</span><span><div class="pt">${esc(x.title)}</div><div class="ps">${sub}</div></span></button>`;
  };
  const vis = SECTIONS.filter(x => SCENES[x.id]), plain = SECTIONS.filter(x => !SCENES[x.id]);
  const gpick = (x, i) => { const n = tabsOf(x).reduce((a, [t]) => a + MEMBERS[t].live.length + MEMBERS[t].misc.length, 0); return `<button class="pick" role="menuitem" data-group="${x.id}" aria-current="${x === g}" style="transition-delay:${i * 12}ms"><span class="pi">${I(x.icon)}</span><span><div class="pt">${esc(x.title)}</div><div class="ps">${tabsOf(x).map(([, t]) => esc(t)).join(" · ")}</div><div class="ps">${n} settings</div></span></button>`; };
  $("pickGrid").innerHTML = (grouped ? `<div class="pg pvis pgroups">${GROUPS.map(gpick).join("")}</div>` : `<div class="pg pvis">${vis.map(pick).join("")}</div>` + `<div class="plaincard"><div class="ph">${I("list")}No preview · standard settings</div><div class="pg">${plain.map(pick).join("")}</div></div>`)
    + `<div class="themerow"><div class="themetog" data-theme-toggle role="menuitemcheckbox" aria-checked="${theme === "m3"}"><span class="pi">${I("palette")}</span><div class="tt">Morphe design</div><span class="sw" role="presentation" aria-checked="${theme === "m3"}"></span></div>`
    + `<button class="ordreset" data-order-reset ${customOrder ? "" : "disabled"} title="Hold a screen to move it. This restores Morphe's order.">${I("reset")}Reset order</button></div>`
    + `<div class="themerow simrow"><div class="themetog" data-simple-toggle role="menuitemcheckbox" aria-checked="${simple}"><span class="pi">${I("visibility_off")}</span><div class="tt">Hide shown UI element settings<small>Remove UI elements by double-tapping or holding them in the preview. The list only shows hidden elements.</small></div><span class="sw" role="presentation" aria-checked="${simple}"></span></div></div>`
    + `<div class="themerow simrow"><div class="themetog" data-group-toggle role="menuitemcheckbox" aria-checked="${grouped}"><span class="pi">${I("layers")}</span><div class="tt">Group screens into tabs<small>Six screens instead of ${SECTIONS.length}. Each one has tabs right under the live preview, and every tab brings its own preview.</small></div><span class="sw" role="presentation" aria-checked="${grouped}"></span></div></div>`;
  $("btnReset").disabled = mode !== "mod" || !Object.keys(PREF).some(k => JSON.stringify(state[k]) !== JSON.stringify(defaults[k]));
}
function renderTabs() {
  const box = $("tabs"); if (!box) return;
  $("stick").classList.toggle("grouped", grouped);
  if (!grouped) { box.innerHTML = ""; return; }
  const g = groupOf(section);
  box.innerHTML = tabsOf(g).map(([id, t]) => `<button class="tab7" role="tab" data-tab="${id}" aria-selected="${id === section}">${esc(t)}</button>`).join("");
  const cur = box.querySelector('[aria-selected="true"]');
  if (cur) box.scrollTo({ left: cur.offsetLeft - (box.clientWidth - cur.offsetWidth) / 2, behavior: "smooth" });
}
// Screen menu order: Morphe's own order by default (its settings screens, then their sub-screens);
// hold a card to drag it somewhere else. The custom order is saved; Reset order restores Morphe's.
let customOrder = null, morpheOrder = [];
function computeMorpheOrder() {
  const titleOf = scr => (CAT.screens && CAT.screens[scr]) || scr || "~";
  const rank = id => {
    const m = MEMBERS[id]; const keys = m ? [...m.live, ...m.misc] : [];
    if (!keys.length) return "~~";
    const count = {}; keys.forEach(k => { const p = PREF[k]; const t = titleOf(p.screen) + "|" + (p.subScreenTitle || ""); count[t] = (count[t] || 0) + 1; });
    return Object.entries(count).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];
  };
  morpheOrder = [...SECTIONS].map(s => [s.id, s.id === "misc" ? "~~~" : rank(s.id)]).sort((a, b) => a[1].localeCompare(b[1])).map(x => x[0]);
}
function applyOrder() {
  if (!morpheOrder.length) computeMorpheOrder();
  const ids = customOrder ? [...customOrder.filter(id => SECTIONS.some(s => s.id === id)), ...morpheOrder.filter(id => !customOrder.includes(id))] : morpheOrder;
  const all = [...SECTIONS]; SECTIONS.length = 0;
  ids.forEach(id => { const s = all.find(x => x.id === id); if (s && !SECTIONS.includes(s)) SECTIONS.push(s); });
  all.forEach(s => { if (!SECTIONS.includes(s)) SECTIONS.push(s); });
}
let pickDrag = null, pickSuppress = false;
$("pickGrid").addEventListener("pointerdown", e => {
  const card = e.target.closest(".pick"); if (!card || e.button > 0) return;
  pickDrag = { card, x: e.clientX, y: e.clientY, on: false, t: setTimeout(() => {
    if (!pickDrag) return; pickDrag.on = true; card.classList.add("lifted"); card.parentElement.classList.add("arranging");
    try { card.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    if (navigator.vibrate) try { navigator.vibrate(12); } catch { /* ignore */ }
  }, LONG) };
});
$("pickGrid").addEventListener("pointermove", e => {
  if (!pickDrag) return;
  if (!pickDrag.on) { if (Math.hypot(e.clientX - pickDrag.x, e.clientY - pickDrag.y) > 10) { clearTimeout(pickDrag.t); pickDrag = null; } return; }
  e.preventDefault();
  const { card } = pickDrag, grid = card.parentElement;
  card.style.transform = `translate(${e.clientX - pickDrag.x}px, ${e.clientY - pickDrag.y}px) scale(1.04)`;
  // hit-test on layout boxes (not transformed ones, which are mid-slide)
  const g = grid.getBoundingClientRect(), px = e.clientX - g.left, py = e.clientY - g.top;
  const over = [...grid.children].find(c => c !== card && px >= c.offsetLeft && px <= c.offsetLeft + c.offsetWidth && py >= c.offsetTop && py <= c.offsetTop + c.offsetHeight);
  if (over) {
    const before = { left: card.offsetLeft, top: card.offsetTop };
    const list = [...grid.children]; const after = list.indexOf(over) > list.indexOf(card);
    // FLIP the siblings so they slide into place
    const first = new Map(list.map(c => [c, [c.offsetLeft, c.offsetTop]]));
    grid.insertBefore(card, after ? over.nextSibling : over);
    list.forEach(c => { if (c === card) return; const [l, t] = first.get(c); if (l !== c.offsetLeft || t !== c.offsetTop) c.animate([{ transform: `translate(${l - c.offsetLeft}px, ${t - c.offsetTop}px)` }, { transform: "none" }], { duration: 180, easing: "cubic-bezier(.2,0,0,1)" }); });
    pickDrag.x += card.offsetLeft - before.left; pickDrag.y += card.offsetTop - before.top;
    card.style.transform = `translate(${e.clientX - pickDrag.x}px, ${e.clientY - pickDrag.y}px) scale(1.04)`;
  }
}, { passive: false });
function endPickDrag() {
  if (!pickDrag) return;
  clearTimeout(pickDrag.t);
  if (pickDrag.on) {
    const { card } = pickDrag; card.classList.remove("lifted"); card.parentElement.classList.remove("arranging");
    card.animate([{ transform: card.style.transform }, { transform: "none" }], { duration: 160, easing: "cubic-bezier(.2,0,0,1)" }); card.style.transform = "";
    customOrder = [...$("pickGrid").querySelectorAll(".pick")].map(c => c.dataset.sec);
    if (JSON.stringify(customOrder) === JSON.stringify(morpheOrder.filter(id => customOrder.includes(id)))) customOrder = null;
    applyOrder(); store.save(); pickSuppress = true; setTimeout(() => { pickSuppress = false; }, 50);
    const rb = document.querySelector("[data-order-reset]"); if (rb) rb.disabled = !customOrder;
  }
  pickDrag = null;
}
$("pickGrid").addEventListener("pointerup", endPickDrag);
$("pickGrid").addEventListener("pointercancel", endPickDrag);
$("pickGrid").addEventListener("contextmenu", e => { if (e.target.closest(".pick")) e.preventDefault(); });
function setPicker(open) {
  pickerOpen = open;
  $("picker").classList.toggle("open", open); $("pickScrim").classList.toggle("open", open);
  $("secPill").setAttribute("aria-expanded", String(open));
}

let stageHold = 0;
let renderCount = 0;
function renderStage() {
  if (stageHold) return;
  const st = $("stage");
  const scene = SCENES[section];
  $("stick").hidden = !scene && !grouped;
  $("stick").classList.toggle("noscene", !scene);
  if (!scene) { st.innerHTML = ""; return; }
  const same = st.dataset.sec === section; st.dataset.sec = section; renderCount++;
  if (!same) { ghosts.clear(); fading.clear(); }
  const scrollers = same ? [...st.querySelectorAll(".inner-scroll")].map(e => e.scrollTop) : [];
  const hscroll = same ? [...st.querySelectorAll("[data-hs]")].map(e => e.scrollLeft) : [];
  st.className = "stage" + (mode === "orig" ? " original" : "");
  st.innerHTML = scene().replace(/background:#0f0f0f/g, "background:var(--app-bg,#0f0f0f)");
  st.querySelectorAll(".finger").forEach(f => { if (!f.firstChild) f.innerHTML = I("gesture"); });
  st.querySelectorAll(".inner-scroll").forEach((e, i) => { if (scrollers[i]) e.scrollTop = scrollers[i]; });
  st.querySelectorAll('[style*="overflow-x:auto"]').forEach((e, i) => { e.dataset.hs = ""; if (hscroll[i]) e.scrollLeft = hscroll[i]; });
  hugComponents(st);
}
// Many components are drawn as a wrapper around one card that carries its own margins. The outline,
// flash and ghost dashes belong to the card, not to the full-width wrapper, so move the card's margins
// (and its corner radius) onto the wrapper. Layout stays the same.
const MARGINS = ["marginTop", "marginRight", "marginBottom", "marginLeft"];
function hugComponents(root) {
  root.querySelectorAll(".c").forEach(c => {
    if (c.children.length !== 1 || c.childNodes.length > 1 && [...c.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return;
    const ch = c.firstElementChild, cs = ch.style;
    if (!MARGINS.some(m => cs[m]) || c.style.padding || c.style.background) return;
    const own = getComputedStyle(ch);
    MARGINS.forEach(m => { if (own[m] && own[m] !== "0px" && own[m] !== "auto") { c.style[m] = own[m]; ch.style[m] = "0px"; } });
    if (own.borderTopLeftRadius !== "0px") c.style.borderRadius = own.borderTopLeftRadius;
  });
  // a left-aligned card narrower than its block wrapper: shrink the wrapper to the card
  root.querySelectorAll(".c.blk, div.c").forEach(hugWidth);
}
function hugWidth(c) {
  {
    if (c.children.length !== 1 || c.style.width) return;
    const r = c.getBoundingClientRect(), q = c.firstElementChild.getBoundingClientRect();
    if (!r.width || q.width > r.width - 6 || Math.abs(q.left - r.left) > 1) return;
    const cs = getComputedStyle(c); if (cs.display !== "block" || getComputedStyle(c.parentElement).display.includes("flex")) return;
    c.style.width = "fit-content";
  }
}

function stateChip(k) {
  const a = A[k], p = PREF[k], v = V(k);
  if (p.type === "boolean") {
    if (a && (a.kind === "vis" || a.kind === "overlay")) return shown(k) ? `<span class="state on">Shown</span>` : `<span class="state off">Hidden</span>`;
    return v ? `<span class="state on">On</span>` : `<span class="state">Off</span>`;
  }
  return "";
}
function summaryFor(k) { const p = PREF[k]; const v = V(k); if (p.type === "boolean") return (v ? p.summaryOn : p.summaryOff) || p.summary || ""; return p.summary || ""; }
const RANGES = { font_size: [8, 48], travel_duration: [2, 15], width_dip: [100, 400], caption_scale: [50, 300], corner_radius: [0, 24], blur: [0, 100], smoothing: [0, 100], dim_duration: [0, 10] };
const sameVal = (a, b) => String(a) === String(b) || (a !== "" && b !== "" && a != null && b != null && !isNaN(a) && !isNaN(b) && Number(a) === Number(b));
function controlFor(k) {
  const p = PREF[k]; const v = V(k); const dis = !parentsOk(k) ? "disabled" : "";
  const ents = entriesFor(k).filter(e => !(OFF_LIST.has(k) && e.value === "off"));
  if (OFF_LIST.has(k) && String(v) === "off") return "";
  if (ents.length && ents.length <= 8) return `<div class="ctl">${ents.map(e => `<button class="opt" data-set="${k}" data-val="${esc(e.value)}" aria-pressed="${sameVal(e.value, v)}" ${dis}>${esc(e.label)}</button>`).join("")}</div>`;
  if (ents.length) return `<div class="ctl"><select data-set="${k}" ${dis} aria-label="${esc(title(k))}">${ents.map(e => `<option value="${esc(e.value)}" ${sameVal(e.value, v) ? "selected" : ""}>${esc(e.label)}</option>`).join("")}</select></div>`;
  if (p.type === "integer" || p.type === "float" || p.type === "long") {
    const r = Object.entries(RANGES).find(([n]) => k.includes(n));
    if (r || /opacity|scale|strength|display_area/.test(k)) {
      const [min, max] = r ? r[1] : [0, 100];
      return `<div class="ctl"><input type="range" min="${min}" max="${max}" step="1" value="${v}" data-set="${k}" ${dis} aria-label="${esc(title(k))}"><span class="val" data-val-of="${k}">${v}</span></div>`;
    }
    return `<div class="ctl"><input type="number" value="${v}" data-set="${k}" ${dis} aria-label="${esc(title(k))}" step="${p.type === "float" ? "0.05" : "1"}"></div>`;
  }
  if (p.type === "string") {
    if (/color/.test(k) && /^#/.test(String(v))) return `<div class="ctl"><input type="color" value="#${String(v).slice(-6)}" data-set="${k}" ${dis} aria-label="${esc(title(k))}"><span class="val">${esc(v)}</span></div>`;
    if (String(p.default ?? "").includes("\n") || /strings|phrases|speeds|whitelist|filter/.test(k)) return `<div class="ctl"><textarea data-set="${k}" ${dis} aria-label="${esc(title(k))}">${esc(v)}</textarea></div>`;
    return `<div class="ctl"><input type="text" value="${esc(v)}" data-set="${k}" ${dis} aria-label="${esc(title(k))}"></div>`;
  }
  return "";
}
const whereOf = x => { const s = sectionOf(x); return s !== section ? ` (${esc(SECTIONS.find(z => z.id === s)?.title || "Misc")})` : ""; };
function needText(k) {
  if (!classicParentsOk(k)) return "Needs " + PREF[k].parents.map(x => `“${esc(title(x.key))}” ${x.mode === "not" ? "off" : "on"}${whereOf(x.key)}`).join(", ");
  const av = String(PREF[k].availability || ""), sk = [...new Set([...av.matchAll(/S\("([^"]+)"\)/g)].map(m => m[1]))].filter(x => PREF[x] && inVersion(x));
  if (sk.length > 1 && av.includes("||")) return `Available once any of these is on: ${sk.map(x => `“${esc(title(x))}”${whereOf(x)}`).join(", ")}`;
  const ap = (PREF[k].availabilityParents || []).filter(x => PREF[x]);
  return ap.length ? `Not available with the current ${ap.map(x => `“${esc(title(x))}”`).join(", ")}` : "Not available here";
}
// The setting to visit so that k becomes available.
function blockerOf(k) {
  const p = PREF[k];
  if (!classicParentsOk(k)) return (p.parents.find(x => x.mode === "not" ? !!state[x.key] : !state[x.key]) || p.parents[0]).key;
  const cands = availKeys(k).filter(x => PREF[x] && inVersion(x));
  // prefer a setting on this screen (e.g. a DeArrow title place) over one on another screen
  return cands.find(x => sectionOf(x) === section) || cands[0] || null;
}
const availKeys = k => [...new Set([...(PREF[k].availabilityParents || []), ...[...String(PREF[k].availability || "").matchAll(/S\("([^"]+)"\)/g)].map(m => m[1])])].filter(x => x !== k);
const dependsOn = (k, parent) => PREF[k].parents.some(x => x.key === parent) || availKeys(k).includes(parent);
// The setting on another screen that k was unlocked through (via the popup): k then offers "More" to reach it again.
const borrowedParent = k => [...PREF[k].parents.map(x => x.key), ...availKeys(k)].find(x => borrowed[section] && borrowed[section].has(x) && sectionOf(x) !== section);

function rowHTML(k, live) {
  const p = PREF[k]; const a = A[k];
  const chg = mode === "mod" && JSON.stringify(state[k]) !== JSON.stringify(defaults[k]);
  const dis = !parentsOk(k);
  const isBool = p.type === "boolean";
  const info = !p.type || p.type === "screen" || p.widget === "NonInteractivePreference" || p.widget === "IntentPreference";
  let right = "", ctl = "";
  if (OFF_LIST.has(k)) { right = `<button class="sw" role="switch" data-sw="${k}" aria-checked="${String(V(k)) !== "off"}" aria-label="${esc(title(k))}"></button>`; ctl = controlFor(k); }
  else if (live && a.kind !== "scenario") { right = stateChip(k); if (!isBool) ctl = controlFor(k); }
  else if (isBool) right = `<button class="sw" role="switch" data-sw="${k}" aria-checked="${!!V(k)}" aria-label="${esc(title(k))}"></button>`;
  else if (!info) ctl = controlFor(k);
  const cls = ["row", live ? "live" : "fallback"];
  if (selected === k) cls.push("sel");
  if (dis) cls.push("dis");
  if (PARENT_OF[k]) { if (k === peekKid) cls.push("peek"); else if (!kidVisible(k)) cls.push("hide"); }
  if (live && (a.kind === "vis" || a.kind === "overlay") && !shown(k)) cls.push("offstate");
  const sum = info ? (p.summary || (p.type === "screen" ? "Opens a sub-screen in Morphe settings" : "Information")) : summaryFor(k);
  const blk = dis ? blockerOf(k) : null;
  const bp = dis ? null : borrowedParent(k);
  const goto = blk ? `<button class="goto" data-goto="${k}">${sectionOf(blk) !== section ? "Change it here" : "Take me there"} ${I("arrow")}</button>`
    : bp ? `<button class="goto more" data-more="${k}" data-target="${bp}" title="${esc(title(bp))}">More ${I("arrow")}</button>` : "";
  const need = dis ? `<div class="need2">${needText(k)}</div>` : "";
  const tags = "";
  const kids = KIDS[k] ? KIDS[k].filter(x => kidVisible(x) || x === peekKid).length : 0;
  const kidbtn = kids ? `<button class="kidbtn" data-kidtoggle="${k}" aria-expanded="${!collapsed.has(k)}" aria-label="${kids} sub-options">${kids}${I("expand")}</button>`
    : KIDS[k] ? `<span class="kidhid">Sub-settings hidden</span>` : "";
  const over = /^(hide|show) in /i.test(title(k)) && p.subScreenTitle ? `<div class="over">${esc(p.subScreenTitle)}</div>` : "";
  return `<div class="${cls.join(" ")}" data-row="${k}" data-k="${k}" tabindex="0">
    <div class="txt">${over}<div class="ttl">${ttlHTML(title(k), (dis ? I("lock", "lk") : "") + (chg ? '<span class="changed-dot" title="Changed from default"></span>' : "") + tags + kidbtn)}</div>
      ${sum ? `<div class="sum">${esc(sum)}</div>` : ""}${need}${ctl}</div>${right || goto ? `<div class="side">${right}${goto}</div>` : ""}</div>`;
}
// The last word of a title and the badges after it never wrap apart, so a sub-options pill can't end up alone on a line.
function ttlHTML(t, after) { if (!after) return esc(t); const i = t.lastIndexOf(" "); return `${esc(t.slice(0, i + 1))}<span class="nw">${esc(t.slice(i + 1))}${after}</span>`; }
const groupHTML = (name, icon, keys, live) => keys.length ? `<div class="gtitle">${I(icon)}${name} · ${keys.length}</div><div class="group">${keys.map(k => rowHTML(k, live)).join("")}</div>` : "";

// Rows follow the order their components appear in the preview, top to bottom, left to right
// (doodle and top bar first). Settings without a component (scenarios) keep their order after them.
// Measured once per screen with every hidden component drawn, so toggling never reshuffles the list.
let posCache = { sec: null, pos: {} };
const LAYOUT = {
  fullscreen: [
    ["On the player", ["hide_video_title", "hide_player_related_videos_overlay", "hide_quick_actions", "fullscreen_video_scale"]],
    ["Swipe zones", ["swipe_left_zone", "swipe_right_zone", "swipe_top_zone", "swipe_zone_preview", "swipe_zone_width"]],
    ["Shared by every swipe zone", ["swipe_overlay_style", "swipe_overlay_background_opacity", "swipe_overlay_progress_brightness_color", "swipe_overlay_progress_volume_color", "swipe_overlay_progress_speed_color", "swipe_text_overlay_size", "swipe_haptic_feedback", "swipe_press_to_engage", "volume_boost", "swipe_ignore_when_locked", "swipe_lowest_value_enable_auto_brightness", "swipe_save_and_restore_brightness"]],
    ["Swipe to seek", ["swipe_seek"]],
    ["Entering and leaving fullscreen", ["disable_fullscreen_dragged_down_gesture", "disable_fullscreen_pulled_up_gesture", "disable_fullscreen_sliding_down_gesture"]],
    ["Pinch to zoom", ["disable_fullscreen_zoom_gesture", "restore_pinch_to_zoom"]],
  ],
};
function stagePositions() {
  const st = $("stage");
  if (posCache.sec === section || st.dataset.sec !== section) return posCache.pos;
  const pos = {}, sr = st.getBoundingClientRect();
  st.classList.add("measure");
  st.querySelectorAll("[data-k], [data-also]").forEach(e => {
    const k = e.dataset.k || e.dataset.also, r = e.getBoundingClientRect(); if (!r.width && !r.height) return;
    let y = r.top - sr.top, x = r.left - sr.left;
    for (let q = e.parentElement; q && q !== st; q = q.parentElement) { y += q.scrollTop; x += q.scrollLeft; }
    const v = Math.round(y / 14) * 10000 + Math.max(0, Math.round(x));
    if (pos[k] === undefined || v < pos[k]) pos[k] = v;
    if (e.dataset.also && e.dataset.k && (pos[e.dataset.k] === undefined || v < pos[e.dataset.k])) pos[e.dataset.k] = v;
  });
  st.classList.remove("measure");
  posCache = { sec: section, pos };
  return pos;
}
function byPosition(keys) {
  const pos = stagePositions(), idx = new Map(keys.map((k, i) => [k, i]));
  const at = k => pos[k] !== undefined ? pos[k] : null;
  const placed = keys.filter(k => at(k) !== null).sort((a, b) => at(a) - at(b) || idx.get(a) - idx.get(b));
  return [...placed, ...keys.filter(k => at(k) === null)];
}
let lastVis = { sec: null, keys: new Set() };
let peekKid = null, lastOpen = new Set(), lastDis = { sec: null, keys: new Set() };
const collapsed = new Set();
function renderList() {
  if (searching) return renderSearch();
  const m = MEMBERS[section];
  let html = "";
  const isLive = k => m.live.includes(k);
  const wantOpen = new Set();
  // Experimental "hide shown UI element settings": a component you can see is removed in the preview
  // itself, so its row leaves the list. Its adjustments (sliders, styles) stay, as plain rows.
  const simpleHide0 = k => simple && isLive(k) && A[k] && (A[k].kind === "vis" || A[k].kind === "overlay") && shown(k) && parentsOk(k) && !!document.querySelector(`#stage [data-k="${k}"]`);
  const pin = simplePin && simpleHide0(simplePin) ? simplePin : null;
  const simpleHide = k => k !== pin && simpleHide0(k);
  const withKids = k => {
    if (simpleHide(k)) return (KIDS[k] || []).filter(x => kidVisible(x) && !simpleHide(x) && x !== pin).map(x => rowHTML(x, isLive(x))).join("");
    let out = rowHTML(k, isLive(k));
    const ks = KIDS[k];
    if (ks) {
      const any = ks.some(x => kidVisible(x) || x === peekKid);
      if (any && (!collapsed.has(k) || ks.includes(peekKid))) wantOpen.add(k);
      out += `<div class="kids ${lastOpen.has(k) ? "open" : ""}" data-kids-of="${k}"><div class="kin">${ks.map(x => rowHTML(x, isLive(x))).join("")}</div></div>`;
    }
    return out;
  };
  if (section !== "misc") {
    if (pin) html += `<div class="group pin7"><div class="subhead">Tapped in the preview</div>${PARENT_OF[pin] ? rowHTML(pin, true) : withKids(pin)}</div>`;
    const top = m.live.filter(k => !PARENT_OF[k] && k !== pin);
    const ordered = byPosition(top);
    const rest = m.misc.filter(k => !PARENT_OF[k]);
    let live = "";
    const lay = LAYOUT[section];
    if (lay) {
      // screens with a lot of related settings get small captions so it is clear what belongs together
      const used = new Set();
      for (const [cap, ks] of lay) {
        const inSec = ks.map(x => "morphe_" + x).filter(x => ordered.includes(x)); inSec.forEach(x => used.add(x));
        const body = inSec.map(withKids).join("");
        if (body) live += `<div class="subhead">${esc(cap)}</div>${body}`;
      }
      const left = ordered.filter(x => !used.has(x)).map(withKids).join("");
      if (left) live = left + live;
    } else live = ordered.map(withKids).join("");
    if (simple && !live && !pin) html += `<div class="secnote" style="padding:16px 20px">Nothing on this screen is hidden. Double-tap or hold an element in the preview to hide it.</div>`;
    if (live) html += `<div class="group">${live}</div>`;
    if (rest.length) html += `${ordered.length ? `<div class="sechead">More settings<span class="nolive">No live preview or animation</span></div>` : ""}<div class="group">${rest.map(withKids).join("")}</div>`;
  } else {
    html += `<div class="secnote" style="padding-top:12px">Settings that no screen above shows yet, grouped by their Morphe settings screen. They work exactly as in Morphe.</div>`;
    const groups = {};
    for (const k of m.misc) {
      if (PARENT_OF[k]) continue;
      const p = PREF[k];
      const g = (p.screenTitle || "Unplaced") + (p.subScreenTitle ? " › " + p.subScreenTitle : "");
      (groups[g] = groups[g] || []).push(k);
    }
    for (const g of Object.keys(groups).sort()) html += `<div class="gtitle">${esc(g)} · ${groups[g].length}</div><div class="group">${groups[g].map(withKids).join("")}</div>`;
  }
  const list = $("list");
  list.innerHTML = html;
  // animate sub-option groups and rows from their previous state to the new one
  void list.offsetHeight;
  const sameSec = lastVis.sec === section;
  const nowVis = new Set();
  list.querySelectorAll(".kids .row").forEach(r => {
    const k = r.dataset.row, vis = !r.classList.contains("hide"), box = r.closest(".kids"), grp = box.dataset.kidsOf;
    if (vis) nowVis.add(k);
    if (!sameSec) return;
    const was = lastVis.keys.has(k);
    if (was && !vis) {
      // keep it on screen while it folds away, then hide it
      r.classList.remove("hide");
      if (wantOpen.has(grp) && lastOpen.has(grp)) { const an = sizeAnim(r, false); const end = () => { r.classList.add("hide"); r.getAnimations().forEach(a => a.cancel()); }; if (an) an.onfinish = end; else end(); }
      else setTimeout(() => r.classList.add("hide"), 300);
    } else if (!was && vis && lastOpen.has(grp) && wantOpen.has(grp)) sizeAnim(r, true);
  });
  list.querySelectorAll(".kids").forEach(e => e.classList.toggle("open", wantOpen.has(e.dataset.kidsOf)));
  lastOpen = wantOpen; lastVis = { sec: section, keys: nowVis };
  // rows that just became available on this screen get the unlock animation
  const dis = new Set([...list.querySelectorAll(".row.dis")].map(r => r.dataset.row));
  if (lastDis.sec === section) lastDis.keys.forEach(k => { if (!dis.has(k)) { const r = list.querySelector(`[data-row="${k}"]`); if (r && !r.classList.contains("hide")) unlockFx(r); } });
  lastDis = { sec: section, keys: dis };
}
function unlockFx(row) {
  row.classList.remove("unlock"); void row.offsetWidth; row.classList.add("unlock");
  row.querySelectorAll(".ulk").forEach(e => e.remove());
  const u = document.createElement("div"); u.className = "ulk";
  u.innerHTML = `<svg viewBox="0 0 24 24"><path class="sh" d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0" fill="none" stroke="var(--m-success)" stroke-width="2.2" stroke-linecap="round"/><rect x="6" y="10.5" width="12" height="9.5" rx="2.2"/></svg>`;
  row.appendChild(u); setTimeout(() => { u.remove(); row.classList.remove("unlock"); }, 950);
}

// ------------------------------------------------------------------ search
let searching = false, query = "";
function setSearch(on) {
  if (on === searching) return;
  searching = on;
  $("app").classList.toggle("searching", on);
  $("btnSearch").setAttribute("aria-expanded", String(on));
  $("q").tabIndex = on ? 0 : -1; $("qClose").tabIndex = on ? 0 : -1;
  if (on) { stopDemo(); stopScenario(); setPicker(false); $("q").value = query; setTimeout(() => $("q").focus(), 60); $("scroller").scrollTop = 0; renderList(); }
  else { $("q").blur(); renderStage(); renderList(); }
}
function renderSearch() {
  const q = query.trim().toLowerCase();
  const all = CAT.preferences.filter(p => inVersion(p.key));
  if (!q) { $("list").innerHTML = `<div class="shint">Type to search all ${all.length} settings. Matches update as you type.</div>`; return; }
  const words = q.split(/\s+/).filter(Boolean);
  const hits = [];
  for (const p of all) {
    const sec = SECTIONS.find(s => s.id === sectionOf(p.key));
    const hay = `${title(p.key)} ${p.summary || ""} ${p.summaryOn || ""} ${p.summaryOff || ""} ${p.subScreenTitle || ""} ${sec ? sec.title : ""} ${p.key}`.toLowerCase();
    if (!words.every(w => hay.includes(w))) continue;
    const t = title(p.key).toLowerCase();
    hits.push({ p, sec, score: (t.startsWith(q) ? 0 : t.includes(q) ? 1 : 2) });
  }
  hits.sort((a, b) => a.score - b.score || SECTIONS.indexOf(a.sec) - SECTIONS.indexOf(b.sec));
  const mark = t => { let h = esc(t); for (const w of words) h = h.replace(new RegExp(`(${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig"), "<mark>$1</mark>"); return h; };
  $("list").innerHTML = hits.length
    ? `<div class="sechead">${hits.length} result${hits.length > 1 ? "s" : ""}</div><div class="group">${hits.slice(0, 120).map(({ p, sec }) => {
        const par = PARENT_OF[p.key];
        return `<div class="sres" data-res="${p.key}" tabindex="0"><div class="ttl">${mark(title(p.key))}</div><div class="where">${esc(sec ? sec.title : "Misc")}${par ? ` › ${esc(title(par))}` : ""}</div>${summaryFor(p.key) ? `<div class="sum">${esc(summaryFor(p.key))}</div>` : ""}</div>`;
      }).join("")}</div>`
    : `<div class="shint">No settings match “${esc(query)}”.</div>`;
}
$("btnSearch").onclick = () => setSearch(true);
$("qClose").onclick = () => { query = ""; setSearch(false); };
$("q").addEventListener("input", e => { query = e.target.value; renderSearch(); });
$("q").addEventListener("keydown", e => { if (e.key === "Escape") { query = ""; setSearch(false); } if (e.key === "Enter") { const f = $("list").querySelector("[data-res]"); if (f) openResult(f.dataset.res); } });
function openResult(k) { setSearch(false); returnTo = null; goToSetting(k); }

function renderInspector() {
  const k = selected, p = k && PREF[k];
  if (!p) $("selCard").innerHTML = `<h2>Selected</h2><p>Nothing selected. Tap a component in the preview or a row in the list.</p>`;
  else {
    const a = A[k];
    const src = p.sourceFile ? `<a href="https://github.com/MorpheApp/morphe-patches/blob/main/${esc(p.sourceFile)}" target="_blank" rel="noopener">${esc(p.sourceFile.split("/").pop())}</a>` : "–";
    $("selCard").innerHTML = `<h2>Selected</h2><h3>${esc(title(k))}</h3><p>${esc(p.summary || summaryFor(k) || "")}</p>
      <dl class="kv">
        <dt>Key</dt><dd>${esc(k)}</dd>
        <dt>Adapter</dt><dd><span class="pill">${a ? (a.kind === "scenario" ? "ScenarioAnimation" : KIND_NAME[a.kind]) : KIND_NAME.fallback}</span></dd>
        <dt>Type</dt><dd>${esc(p.type || p.widget)}${p.rebootApp ? ' · <span style="color:var(--m-warning)">restarts app</span>' : ""}</dd>
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
  const anim = Object.keys(A).filter(k => PREF[k] && isAnimated(k)).length;
  $("covCard").innerHTML = `<h2>Coverage</h2>
    <div class="statrow"><div><div class="big">${live}</div><span>visualized</span></div><div><div class="big">${anim}</div><span>animated</span></div><div><div class="big">${total - live}</div><span>in Misc</span></div><div><div class="big">${total}</div><span>prefs found</span></div></div>
    <div class="cov">${SECTIONS.filter(s => s.id !== "misc").map(s => { const m = MEMBERS[s.id]; const t = m.live.length + m.misc.length; return `<div class="r"><span>${s.title}</span><div class="bar"><i style="width:${t ? (m.live.length / t * 100) : 0}%"></i></div><span class="num">${m.live.length}/${t}</span></div>`; }).join("")}</div>
    <p style="margin-top:12px;font-size:12px">Source: <span style="font-family:var(--mono)">${esc(CAT.source)}</span></p>`;
  const ch = changedOnly(); const n = Object.keys(ch).length;
  $("chgCard").innerHTML = `<h2>Changed settings</h2><p>${n ? `${n} setting${n > 1 ? "s" : ""} differ from Morphe's defaults. Saved in this browser only.` : "All settings are at Morphe's defaults."}</p>
    ${n ? `<pre class="json" id="json">${esc(JSON.stringify(ch, null, 1))}</pre>` : ""}
    <div class="btnrow">${n ? `<button class="btn" id="copyJson">Copy as JSON</button><button class="btn danger" id="resetAll">Reset all</button>` : ""}</div>`;
  const cp = $("copyJson");
  if (cp) cp.onclick = () => { const txt = JSON.stringify(ch, null, 1); (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => snack("Copied changed settings"), () => selectPre()); };
  const rs = $("resetAll");
  if (rs) rs.onclick = () => { const before = { ...state }; Object.assign(state, defaults); commit(); snack("Reset all settings to defaults", () => { Object.assign(state, before); commit(); }); };
}
function selectPre() { const pre = $("json"); if (!pre) return; const r = document.createRange(); r.selectNodeContents(pre); const s = getSelection(); s.removeAllRanges(); s.addRange(r); snack("Press Ctrl+C to copy"); }

function renderAll() { renderBar(); renderStage(); renderList(); renderInspector(); applyLayout(); store.save(); }
function commit() { applyAppColors(); renderBar(); renderStage(); renderList(); renderInspector(); store.save(); }

// ------------------------------------------------------------------ restart handling
const pendingRestart = () => Object.keys(PREF).filter(k => PREF[k].rebootApp && JSON.stringify(state[k]) !== JSON.stringify(baseline[k]));
function openDialog(html) { $("dlgBox").innerHTML = html; $("dlg").classList.add("open"); setTimeout(() => $("dlgBox").querySelector("button")?.focus(), 50); }
function closeDialog() { $("dlg").classList.remove("open"); }
function restartDialog() {
  const keys = pendingRestart();
  openDialog(`<div class="di">${I("restart")}</div><h2 id="dlgTitle">Restart to apply</h2>
    <p>${keys.length} setting${keys.length > 1 ? "s" : ""} only take effect after YouTube restarts.</p>
    <ul>${keys.map(k => `<li>${esc(title(k))}</li>`).join("")}</ul>
    <div class="acts"><button class="dbtn primary" id="dRestart">Restart now</button><button class="dbtn tonal" id="dStay">Keep editing</button></div>`);
  $("dRestart").onclick = () => { closeDialog(); $("restarting").classList.add("on"); setTimeout(() => { baseline = { ...state }; storeBaseline(); renderBar(); $("restarting").classList.remove("on"); snack("YouTube restarted. All changes are applied."); }, 1400); };
  $("dStay").onclick = closeDialog;
}
function storeBaseline() { try { localStorage.setItem(LS + "-baseline", JSON.stringify(baseline)); } catch { /* storage unavailable */ } }
$("btnBack").onclick = () => {
  if (pendingRestart().length) return restartDialog();
  const app = $("app"); app.classList.remove("exitflash"); void app.offsetWidth; app.classList.add("exitflash");
  setTimeout(() => snack("Back to Morphe settings (demo: the editor reopens)"), 350);
};
// Settings from other screens changed through the popup count as part of this screen for Reset.
const borrowed = {};
function borrowPopup(k, target) {
  const sec = SECTIONS.find(z => z.id === sectionOf(target)), p = PREF[target];
  const where = [p.screenTitle, p.subScreenTitle].filter(Boolean).join(" › ");
  openDialog(`<h2 id="dlgTitle">${esc(title(target))}</h2>
    <p class="dlgwhere">Lives on the <b>${esc(sec ? sec.title : "Misc")}</b> screen${where ? ` · in Morphe: ${esc(where)}` : ""}. “${esc(title(k))}” needs it.</p>
    <div class="dlglist">${rowHTML(target, false).replace('class="row', 'class="row inpop')}</div>
    <div class="acts"><button class="dbtn tonal" id="dDone">Done</button></div>`);
  const box = $("dlgBox");
  const after = () => {
    (borrowed[section] = borrowed[section] || new Set()).add(target);
    const r = box.querySelector(".dlglist"); if (r) r.innerHTML = rowHTML(target, false).replace('class="row', 'class="row inpop');
    commit();
    if (parentsOk(k)) setTimeout(() => { closeDialog(); const row = document.querySelector(`[data-row="${k}"]`); if (row) { scrollRowIntoView(k); unlockFx(row); } select(k); }, 350);
  };
  box.onclick = e => {
    if (e.target.id === "dDone") return closeDialog();
    const sw = e.target.closest("[data-sw]"), opt = e.target.closest("button.opt[data-set]");
    if (sw) { ensureMod(); state[target] = !state[target]; after(); }
    else if (opt) { ensureMod(); state[target] = coerce(target, opt.dataset.val); after(); }
  };
  box.onchange = e => { const t = e.target; if (!t.dataset || t.dataset.set !== target) return; ensureMod(); state[target] = t.type === "range" || t.type === "number" ? Number(t.value) : coerce(target, t.value); after(); };
}
// Reset sits next to search and asks whether to reset this preview's screen or every setting.
const changedKeys = keys => keys.filter(k => JSON.stringify(state[k]) !== JSON.stringify(defaults[k]));
const screenChanges = () => changedKeys([...new Set([...sectionKeys(), ...(borrowed[section] || [])])]);
const allChanges = () => changedKeys(Object.keys(PREF));
function doReset(keys, all, label) {
  if (!keys.length) return;
  const before = {}; keys.forEach(k => { before[k] = state[k]; state[k] = defaults[k]; });
  const lent = all ? { ...borrowed } : { [section]: borrowed[section] };
  if (all) Object.keys(borrowed).forEach(x => delete borrowed[x]); else delete borrowed[section];
  commit(); snack(`Reset ${keys.length} setting${keys.length > 1 ? "s" : ""} ${label}`, () => { Object.assign(state, before); Object.entries(lent).forEach(([x, v]) => { if (v) borrowed[x] = v; }); commit(); });
}
$("btnReset").onclick = () => {
  const scr = screenChanges(), all = allChanges(), name = SECTIONS.find(x => x.id === section)?.title || "this screen";
  if (!all.length) return snack("Nothing to reset: everything is at its default");
  const n = x => `${x} change${x === 1 ? "" : "s"}`;
  openDialog(`<h2 id="dlgTitle">Reset settings?</h2><p>Put settings back to Morphe's defaults.</p>
    <div class="choice"><button data-reset="screen" ${scr.length ? "" : "disabled"}><span>Only ${esc(name)}</span><small>${n(scr.length)}</small></button>
    <button data-reset="all"><span>Everything</span><small>${n(all.length)}</small></button></div>
    <div class="acts"><button class="dbtn tonal" id="dCancel">Cancel</button></div>`);
  $("dlgBox").onclick = e => {
    const b = e.target.closest("[data-reset]");
    if (e.target.id === "dCancel") return closeDialog();
    if (!b || b.disabled) return;
    closeDialog();
    if (b.dataset.reset === "all") doReset(allChanges(), true, "everywhere"); else doReset(screenChanges(), false, `on ${name}`);
  };
};
// hide the top bar while scrolling down, show it again on the way up
var progScrollUntil = 0;
{
  let lastY = 0, acc = 0;
  $("scroller").addEventListener("scroll", () => {
    const sc = $("scroller"), y = sc.scrollTop, app = $("app"), d = y - lastY; lastY = y;
    if (app.classList.contains("searching") || pickerOpen) { app.classList.remove("barhidden"); acc = 0; return; }
    // only your own scrolling moves the bar: jumps to a setting (and holds) leave it where it is
    if (performance.now() < progScrollUntil || press) { acc = 0; return; }
    acc = Math.sign(d) === Math.sign(acc) ? acc + d : d;
    const bar = document.querySelector(".appbar"); if (bar && !app.classList.contains("barhidden")) app.style.setProperty("--abh", bar.offsetHeight + "px");
    if (y < 8) app.classList.remove("barhidden");
    else if (acc > 24) app.classList.add("barhidden");
    else if (acc < -24) app.classList.remove("barhidden");
  }, { passive: true });
}
$("dlg").addEventListener("click", e => { if (e.target.id === "dlg") closeDialog(); });

// ------------------------------------------------------------------ interactions
let snackTimer = null, undoFn = null;
function snack(msg, undo) {
  $("snackMsg").innerHTML = msg; undoFn = undo || null; $("snackUndo").hidden = !undo;
  $("snack").classList.add("show"); clearTimeout(snackTimer);
  snackTimer = setTimeout(() => $("snack").classList.remove("show"), 3200);
}
$("canvas").addEventListener("click", () => stopScenario());
$("snackUndo").onclick = () => { if (undoFn) undoFn(); undoFn = null; $("snack").classList.remove("show"); };

function highlight(k, flash = true, reveal = false) {
  document.querySelectorAll(".sel").forEach(e => e.classList.remove("sel", "selin"));
  document.querySelectorAll(`[data-k="${k}"], [data-row="${k}"], [data-also="${k}"]`).forEach(e => e.classList.add("sel"));
  const els = [...document.querySelectorAll(`#stage [data-k="${k}"], #stage [data-also="${k}"]`)];
  const finish = () => els.forEach(e => {
    fitOutline(e);
    // big components (bars, shelves) only glow: scaling them up looked like the whole preview jumping
    if (flash) { const big = e.offsetWidth > $("stage").clientWidth * .5 || e.offsetHeight > 80; e.classList.remove("flash", "flat"); void e.offsetWidth; e.classList.add("flash"); e.classList.toggle("flat", big); setTimeout(() => e.classList.remove("flash", "flat"), 520); }
  });
  if (!reveal || skipReveal) { skipReveal = false; return finish(); }
  // wait until a growing (ghost-revealed or restored) element has its full size, then scroll to it
  const liveEls = () => [...document.querySelectorAll(`#stage [data-k="${k}"], #stage [data-also="${k}"]`)];
  const go = () => { if (selected !== k) return; const live = liveEls(); els.splice(0, els.length, ...live); setTimeout(finish, revealInStage(live) ? 340 : 0); };
  setTimeout(() => {
    if (selected !== k) return;
    const growing = liveEls().flatMap(e => e.getAnimations()).filter(a => a.playState === "running" && isFinite(a.effect?.getComputedTiming().endTime) && a.effect?.getComputedTiming().fill !== "forwards");
    if (growing.length) Promise.all(growing.map(a => a.finished.catch(() => {}))).then(go); else go();
  }, 60);
}
let skipReveal = false;
// Scrollable boxes inside the preview (feeds, action bars, chip rows) scroll so the selected
// element is centred before it flashes. Works for overflow:hidden strips too.
function scrollBoxes(el) {
  const out = [], stage = $("stage");
  for (let p = el.parentElement; p && p !== stage; p = p.parentElement) {
    const cs = getComputedStyle(p);
    const sx = !p.classList.contains("inner-scroll") && p.scrollWidth > p.clientWidth + 1 && p.scrollHeight <= p.clientHeight + 1 && /auto|scroll|hidden/.test(cs.overflowX);
    const sy = p.scrollHeight > p.clientHeight + 1 && /auto|scroll|hidden/.test(cs.overflowY);
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
      if (dx || dy) { box.scrollBy({ left: dx, top: dy, behavior: "smooth" }); moved = true; }
    });
  });
  return moved;
}
// The selection outline sits outside the element; when that would be clipped by the preview edge,
// draw it inside instead.
function fitOutline(el) {
  let clip = $("stage");
  for (let p = el.parentElement; p && p !== $("stage"); p = p.parentElement) { const cs = getComputedStyle(p); if (cs.overflowX !== "visible" || cs.overflowY !== "visible") { clip = p; break; } }
  const r = el.getBoundingClientRect(), b = clip.getBoundingClientRect();
  el.classList.toggle("selin", r.left < b.left + 4 || r.right > b.right - 4 || r.top < b.top + 4);
}
function scrollRowIntoView(k, center) {
  const row = document.querySelector(`[data-row="${k}"]`); if (!row) return;
  const sc = $("scroller"), two = $("content").offsetWidth >= 600 && !$("content").classList.contains("stacked"), stickH = two ? 0 : $("stick").offsetHeight;
  const top = row.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop;
  const target = center ? top - stickH - (sc.clientHeight - stickH) / 2 + row.offsetHeight / 2 : top - stickH - 8;
  if (center || top < sc.scrollTop + stickH || top + row.offsetHeight > sc.scrollTop + sc.clientHeight) { progScrollUntil = performance.now() + 900; sc.scrollTo({ top: target, behavior: "smooth" }); }
}
// Tapping something in the preview brings the setting card that controls it to the middle of the list.
// A sub-option inside a collapsed parent opens it first; in "hide shown UI element settings" mode the
// card (which that mode leaves out) is pinned at the very top of the list.
let simplePin = null;
function rowForStage(k) {
  if (simple) {
    const was = simplePin; simplePin = k;
    if (!document.querySelector(`#list [data-row="${k}"]`) || was !== k) renderList();
    if (simplePin === k && document.querySelector(`#list .pin7 [data-row="${k}"]`)) { progScrollUntil = performance.now() + 900; $("scroller").scrollTo({ top: 0, behavior: "smooth" }); return; }
  }
  const par = PARENT_OF[k];
  if (par && !kidVisible(k)) { peekKid = k; collapsed.delete(par); renderList(); setTimeout(() => scrollRowIntoView(k, true), 300); setTimeout(() => pointToParents(k), 700); return; }
  if (par && collapsed.has(par)) { collapsed.delete(par); lastOpen.add(par); const box = document.querySelector(`[data-kids-of="${par}"]`); if (box) box.classList.add("open"); document.querySelector(`[data-kidtoggle="${par}"]`)?.setAttribute("aria-expanded", "true"); setTimeout(() => scrollRowIntoView(k, true), 300); return; }
  scrollRowIntoView(k, true);
}
function select(k, from) {
  const prevSel = selected;
  selected = k;
  const dropGhost = prevSel && prevSel !== k && ghosts.has(prevSel) ? prevSel : null, renders = renderCount;
  if (section === "flyout" && (FLY_SUB[k] || null) !== flySub) renderStage();
  if (section === "player" && mode === "mod") {
    // the tray of 13 buttons only opens from its own pill; selecting a hidden one previews it in place
    if (trayOpen && from !== "stage") trayOpen = false;
    if (CUSTOM_KEYS.has(k) || CUSTOM_KEYS.has(prevSel)) renderStage();
  }
  if (section === "endscreen" && (ENDSCREEN_SEL.has(k) || ENDSCREEN_SEL.has(prevSel))) renderStage();
  if (section === "shorts" && (SHORTS_SHEET.has(k) || SHORTS_SHEET.has(prevSel))) renderStage();
  if (section === "feed" && (k === "morphe_feed_card_layout" || prevSel === "morphe_feed_card_layout")) renderStage();
  if (section === "captions" && (k === "morphe_secondary_caption_language" || prevSel === "morphe_secondary_caption_language")) renderStage();
  // a hidden setting stays revealed while it is selected; it collapses once you move to another one
  if (dropGhost) { if (renders === renderCount) unghost(dropGhost); else { clearGhost(dropGhost); renderStage(); } }
  highlight(k, true, from !== "stage");
  renderInspector();
  if (from === "stage") rowForStage(k);
  if (from === "list" && mode === "mod" && A[k] && (A[k].kind === "vis" || A[k].kind === "overlay") && !shown(k) && document.querySelector(`#stage [data-k="${k}"]`)) ghost(k);
  if (DEMOS[k]) startDemo(k); else stopDemo();
  if (SCN[k] && from) playScenario(k); else if (from && k !== prevSel) stopScenario();
  const a = A[k];
  const notApplicable = a && (a.kind === "vis" || a.kind === "overlay") && a.section === section && !CUSTOM_KEYS.has(k) && !document.querySelector(`#stage [data-k="${k}"], #stage [data-also="${k}"]`);
  if (notApplicable && SCENES[section]) {
    const why = k === "morphe_hide_end_screen_suggested_video" ? "Appears only when autoplay is off. Set Autoplay mode to Off to see it."
      : k === "morphe_hide_autoplay_preview" ? "Appears only when autoplay is on."
      : /^morphe_miniplayer_/.test(k) ? "Not part of the current miniplayer type." : "Not shown in the current layout.";
    label(why, true, 2600);
  }
  if (!parentsOk(k)) pointToParents(k);
}
function pointToParents(k) {
  for (const key of [...PREF[k].parents.map(x => x.key), ...(PREF[k].availabilityParents || [])]) {
    document.querySelectorAll(`[data-row="${key}"], #stage [data-k="${key}"]`).forEach(el => { el.classList.remove("attn"); void el.offsetWidth; el.classList.add("attn"); });
  }
}
const ghostTimers = new Map();
const stageEls = k => document.querySelectorAll(`#stage [data-k="${k}"]`);
function clearGhost(k) { (ghostTimers.get(k) || []).forEach(clearTimeout); ghostTimers.delete(k); ghosts.delete(k); fading.delete(k); stageEls(k).forEach(e => { e.classList.remove("leaving", "ghost-out"); e.getAnimations().forEach(a => a.cancel()); }); }
function ghost(k, grow = true) {
  const already = ghosts.has(k) || fading.has(k);
  clearGhost(k);
  ghosts.add(k);
  stageEls(k).forEach(e => { e.getAnimations().forEach(a => a.cancel()); e.classList.remove("ghost-out", "leaving"); e.classList.add("ghost"); hugWidth(e); if (grow && !already && !e.classList.contains("intray")) sizeAnim(e, true); });
}
function unghost(k) {
  (ghostTimers.get(k) || []).forEach(clearTimeout);
  ghosts.delete(k); fading.add(k);
  stageEls(k).forEach(e => { e.classList.remove("sel", "selin", "flash"); if (e.classList.contains("intray")) e.classList.add("ghost-out"); else { e.classList.add("leaving"); sizeAnim(e, false, 420); } });
  const t2 = setTimeout(() => { fading.delete(k); ghostTimers.delete(k); stageEls(k).forEach(e => { e.classList.remove("ghost", "ghost-out", "leaving", "sizing", "sizew", "sizei"); e.getAnimations().forEach(a => a.cancel()); }); }, 440);
  ghostTimers.set(k, [t2]);
}

// Settings with a value (number, colour, text) can't flip on a hold: jump to their control instead.
function focusControl(k) {
  if (selected !== k) select(k);
  scrollRowIntoView(k);
  const row = document.querySelector(`[data-row="${k}"]`); if (!row) return;
  const ctl = row.querySelector("input,select,textarea,button.opt");
  row.classList.remove("nudge"); void row.offsetWidth; row.classList.add("nudge");
  if (ctl) setTimeout(() => ctl.focus({ preventScroll: true }), 250);
}
function toggle(k) {
  const p = PREF[k];
  if (mode === "orig") setMode("mod");
  if (!parentsOk(k)) { pointToParents(k); snack(needText(k)); return; }
  const before = state[k];
  if (OFF_LIST.has(k)) { if (String(state[k]) === "off") state[k] = offListPick[k] || entriesFor(k).find(e => e.value !== "off" && e.value !== "en").value; else { offListPick[k] = state[k]; state[k] = "off"; } }
  else if (p.type === "boolean") state[k] = !state[k];
  else if (entriesFor(k).length && !p.entries) { const vals = entriesFor(k).map(e => e.value); const i = vals.findIndex(x => String(x) === String(state[k]) || Number(x) === Number(state[k])); state[k] = coerce(k, vals[(i + 1) % vals.length]); }
  else if (p.entries && p.entries.length) { const vals = entriesFor(k).map(e => e.value); const i = vals.indexOf(String(state[k])); state[k] = coerce(k, vals[(i + 1) % vals.length]); }
  else { focusControl(k); return; }
  const visual = A[k] && (A[k].kind === "vis" || A[k].kind === "overlay");
  const wasShown = visual ? (isHideKey(k) ? !before : !!before) : null;
  const wasGhost = ghosts.has(k) || fading.has(k);
  clearGhost(k);
  const nowShown = visual ? shown(k) : null;
  if (visual && wasShown && !nowShown) {
    // collapse the visible component first, then draw the new layout
    const els = [...stageEls(k)].filter(e => !e.classList.contains("intray") && e.offsetParent);
    if (els.length) {
      stageHold++;
      const done = () => { if (!stageHold) return; stageHold = 0; renderStage(); if (selected) highlight(selected); };
      els.forEach(e => e.classList.remove("pressing", "charging"));
      // scroll the component into view first so you see it go
      const wait = revealInStage(els) ? 360 : 0; skipReveal = true;
      setTimeout(() => { els.forEach(e => sizeAnim(e, false)); setTimeout(done, SIZE_MS + 20); }, wait);
    }
  }
  afterChange(k, before);
  if (visual && !wasShown && nowShown) stageEls(k).forEach(e => { if (wasGhost || e.closest(".tray")) { e.classList.remove("reveal"); void e.offsetWidth; e.classList.add("reveal"); } else sizeAnim(e, true); });
}
// Collapse or expand a component along the axis it takes space in.
const SIZE_MS = 280;
function axisOf(el) {
  const cs = getComputedStyle(el);
  if (cs.position === "absolute" || cs.position === "fixed") return "none";
  const ps = el.parentElement ? getComputedStyle(el.parentElement) : null;
  if (ps && ps.display.includes("flex") && !ps.flexDirection.startsWith("column")) return "w";
  if (ps && !ps.display.includes("flex") && !ps.display.includes("grid") && cs.display.startsWith("inline")) return "w";
  return "h";
}
function sizeAnim(el, show, ms = SIZE_MS) {
  const ax = axisOf(el), r = el.getBoundingClientRect(), cs = getComputedStyle(el);
  let full, zero;
  if (ax === "w") {
    // in a flex row the gap would stay behind and jump away at the end, so pull it in with a negative margin
    const gap = parseFloat(getComputedStyle(el.parentElement).columnGap) || 0;
    full = { width: r.width + "px", marginLeft: cs.marginLeft, marginRight: cs.marginRight, opacity: 1 }; zero = { width: "0px", marginLeft: "0px", marginRight: -gap + "px", opacity: 0 };
    el.classList.add("sizew");
    if (cs.display === "inline") el.classList.add("sizei");
  }
  else if (ax === "h") { full = { height: r.height + "px", marginTop: cs.marginTop, marginBottom: cs.marginBottom, opacity: 1 }; zero = { height: "0px", marginTop: "0px", marginBottom: "0px", opacity: 0 }; }
  else { full = { opacity: 1, transform: cs.transform === "none" ? "scale(1)" : cs.transform }; zero = { opacity: 0, transform: (cs.transform === "none" ? "" : cs.transform + " ") + "scale(.8)" }; }
  if (!r.width && !r.height && ax !== "none") return null;
  el.classList.add("sizing");
  const a = el.animate(show ? [zero, full] : [full, zero], { duration: ms, easing: "cubic-bezier(.4,0,.2,1)", fill: show ? "none" : "forwards" });
  // a collapsed element keeps overflow:hidden until it is hidden for good, otherwise its content
  // would paint at full size for a frame between the end of the animation and display:none
  if (show) a.onfinish = a.oncancel = () => el.classList.remove("sizing", "sizew", "sizei");
  return a;
}
function afterChange(k, before) {
  if (peekKid && kidVisible(peekKid)) peekKid = null;
  commit(); select(k);
  const sb = document.querySelector(".stagebox"); if (sb) { sb.classList.remove("changed"); void sb.offsetWidth; sb.classList.add("changed"); }
  try { navigator.vibrate && navigator.vibrate(20); } catch { /* ignore */ }
  if (SCN[k]) playScenario(k, before);
  // teleport back to the setting that was waiting on this one
  if (returnTo && parentsOk(returnTo.key) && dependsOn(returnTo.key, k)) {
    const back = returnTo; returnTo = null;
    setTimeout(() => goToSetting(back.key, () => {
      const row = document.querySelector(`[data-row="${back.key}"]`);
      if (row) unlockFx(row);
      snack(`<b>${esc(title(back.key))}</b> is unlocked`);
    }), 650);
  }
}
// Colour inputs only take #RRGGBB; keep the alpha byte of Morphe's #AARRGGBB values.
function fromColor(k, hex) { const cur = String(state[k] || ""); const alpha = cur.length === 9 ? cur.slice(1, 3) : ""; return ("#" + alpha + hex.slice(1)).toUpperCase(); }
function ensureMod() { if (mode === "orig") { mode = "mod"; $("btnOrig").setAttribute("aria-pressed", "false"); $("btnMod").setAttribute("aria-pressed", "true"); } }
function coerce(k, v) { const t = PREF[k].type; if (t === "integer" || t === "long" || t === "float") return Number(v); if (t === "boolean") return v === true || v === "true"; return v; }

function switchSection(id, after) {
  if (id === section) { after && after(); return; }
  const from = SECTIONS.findIndex(s => s.id === section), to = SECTIONS.findIndex(s => s.id === id);
  const content = $("content"); content.style.setProperty("--dir", (to > from ? -24 : 24) + "px");
  content.classList.remove("swap-in"); content.classList.add("swap-out");
  stopDemo(); stopScenario();
  setTimeout(() => {
    section = id; selected = null; peekKid = null; trayOpen = false; simplePin = null; lastTab[groupOf(id).id] = id;
    $("scroller").scrollTop = 0; renderAll();
    content.classList.remove("swap-out"); void content.offsetWidth; content.classList.add("swap-in");
    after && setTimeout(after, 120);
  }, 120);
}
function goToSetting(k, after) {
  switchSection(sectionOf(k), () => {
    const par = PARENT_OF[k];
    const hidden = par && !kidVisible(k);
    if (hidden || (par && collapsed.has(par))) { if (hidden) peekKid = k; collapsed.delete(par); renderList(); }
    select(k);
    setTimeout(() => scrollRowIntoView(k, true), par ? 300 : 0);
    setTimeout(() => {
      const row = document.querySelector(`[data-row="${k}"]`);
      if (row) { row.classList.remove("attn"); void row.offsetWidth; row.classList.add("attn"); }
      if (hidden) setTimeout(() => pointToParents(k), 450);
      after && after();
    }, par ? 520 : 380);
  });
}

// press handling (tap vs hold), shared by stage and list
let press = null, lastTap = null;
const LONG = 480;
// Mouse drag scrolls the preview's feeds and strips, like a finger would on the phone.
let drag = null;
function scrollTargets(t) {
  const out = []; const stage = $("stage");
  for (let p = t; p && p !== stage && p.nodeType === 1; p = p.parentElement) {
    const cs = getComputedStyle(p);
    if (!p.classList.contains("inner-scroll") && p.scrollWidth > p.clientWidth + 1 && /auto|scroll/.test(cs.overflowX)) out.push([p, "x"]);
    if (p.scrollHeight > p.clientHeight + 1 && /auto|scroll/.test(cs.overflowY)) out.push([p, "y"]);
  }
  return out;
}
function down(e) {
  if (e.button > 0) return;
  if (e.pointerType === "mouse" && e.target.closest("#stage")) drag = { x: e.clientX, y: e.clientY, t: e.target, on: false };
  // tapping a switch flips it straight away (the row itself keeps tap = select, hold = switch)
  if (e.target.closest(".sw")) return;
  if (e.target.closest("input,select,textarea,button.opt,.goto,.kidbtn,.replay,[data-tray]")) return;
  const el = e.target.closest("[data-k]"); if (!el) return;
  const k = el.dataset.k; const from = el.closest("#stage") ? "stage" : "list";
  el.classList.add("pressing");
  if (from === "stage" && el.classList.contains("off")) { (ghostTimers.get(k) || []).forEach(clearTimeout); ghostTimers.delete(k); el.classList.remove("ghost-out"); el.classList.add("charging"); }
  press = { el, k, from, x: e.clientX, y: e.clientY, long: false };
  // holding a preview element brings its setting into view while the hold is still charging
  if (from === "stage") press.peek = setTimeout(() => { if (!press || press.k !== k) return; document.querySelectorAll(".row.sel").forEach(r => r.classList.remove("sel")); document.querySelector(`[data-row="${k}"]`)?.classList.add("sel"); rowForStage(k); }, 160);
  press.t = setTimeout(() => { if (!press) return; press.long = true; el.classList.remove("pressing"); if (from === "stage" && selected !== k) { if (ghosts.has(selected)) unghost(selected); selected = k; highlight(k, false); renderInspector(); } toggle(k); if (from === "stage") setTimeout(() => scrollRowIntoView(k, true), 30); }, LONG);
}
function cancelPress() { if (press) { clearTimeout(press.t); clearTimeout(press.peek); press.el.classList.remove("pressing", "charging"); press = null; } }
function move(e) {
  if (press && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 10) cancelPress();
  if (!drag || !(e.buttons & 1)) { drag = null; return; }
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
  if (!drag.on && Math.hypot(dx, dy) < 8) return;
  if (!drag.on) { drag.on = true; const ts = scrollTargets(drag.t); drag.box = (ts.find(([, ax]) => ax === (Math.abs(dx) > Math.abs(dy) ? "x" : "y")) || ts[0] || [null])[0]; $("stage").classList.add("dragging"); }
  if (drag.box) { drag.box.scrollLeft -= dx; drag.box.scrollTop -= dy; }
  drag.x = e.clientX; drag.y = e.clientY;
}
document.addEventListener("pointerup", () => { if (drag) { drag = null; $("stage").classList.remove("dragging"); } });
function up() {
  if (!press) return;
  clearTimeout(press.t); clearTimeout(press.peek); press.el.classList.remove("pressing", "charging");
  const { k, from, long } = press; press = null;
  if (long) return;
  const now = performance.now();
  if (lastTap && lastTap.k === k && now - lastTap.t < 330) { lastTap = null; toggle(k); return; }
  lastTap = { k, t: now };
  const a = A[k];
  if (mode === "mod" && a && (a.kind === "vis" || a.kind === "overlay") && !shown(k)) {
    if (from === "stage") ghost(k, false);
    select(k, from);
    if (from !== "stage" && document.querySelector(`#stage [data-k="${k}"]`)) ghost(k);
  } else select(k, from);
}
["stage", "list"].forEach(id => {
  const el = $(id);
  el.addEventListener("pointerdown", down); el.addEventListener("pointermove", move);
  el.addEventListener("pointerup", up); el.addEventListener("pointercancel", cancelPress);
  el.addEventListener("pointerleave", e => { if (e.target === el) cancelPress(); });
  el.addEventListener("contextmenu", e => { if (e.target.closest("[data-k]")) e.preventDefault(); });
});
$("stage").addEventListener("click", e => {
  if (e.target.closest("[data-tray]")) { trayOpen = !trayOpen; renderStage(); if (selected) highlight(selected); return; }
  if (trayOpen && !e.target.closest(".tray") && !e.target.closest("[data-k]")) { trayOpen = false; renderStage(); if (selected) highlight(selected); }
});
// mouse wheel scrolls horizontal strips (action bars, chips)
$("app").addEventListener("wheel", e => {
  if (!e.target.closest("#stage") || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
  const ts = scrollTargets(e.target);
  const y = ts.find(([b, ax]) => ax === "y" && (e.deltaY > 0 ? b.scrollTop + b.clientHeight < b.scrollHeight - 1 : b.scrollTop > 0));
  if (y) return; // native vertical scroll
  const x = ts.find(([, ax]) => ax === "x");
  if (x) { x[0].scrollLeft += e.deltaY; e.preventDefault(); }
}, { passive: false });
$("list").addEventListener("keydown", e => {
  const row = e.target.closest("[data-row]"); if (!row || e.target !== row) return;
  if (e.key === "Enter") { select(row.dataset.row, "list"); e.preventDefault(); }
  if (e.key === " ") { toggle(row.dataset.row); e.preventDefault(); }
});
$("list").addEventListener("click", e => {
  const res = e.target.closest("[data-res]");
  if (res) { openResult(res.dataset.res); return; }
  const kb = e.target.closest("[data-kidtoggle]");
  if (kb) {
    const k = kb.dataset.kidtoggle, open = collapsed.has(k);
    if (open) collapsed.delete(k); else collapsed.add(k);
    kb.setAttribute("aria-expanded", String(open));
    const box = document.querySelector(`[data-kids-of="${k}"]`); if (box) box.classList.toggle("open", open);
    if (open) lastOpen.add(k); else lastOpen.delete(k);
    return;
  }
  const mo = e.target.closest("[data-more]");
  if (mo) { borrowPopup(mo.dataset.more, mo.dataset.target); return; }
  const go = e.target.closest("[data-goto]");
  if (go) {
    const k = go.dataset.goto; const target = blockerOf(k); if (!target) return;
    if (sectionOf(target) !== section) { borrowPopup(k, target); return; }
    returnTo = { key: k }; goToSetting(target);
    snack(PREF[target].type === "boolean" ? `Switch <b>${esc(title(target))}</b> by holding it, and you'll be brought back` : `Change <b>${esc(title(target))}</b>, and you'll be brought back`);
    return;
  }
  const rp = e.target.closest("[data-replay]");
  const sw = e.target.closest("[data-sw]");
  if (sw) { const k = sw.dataset.sw; if (A[k]) toggle(k); else { select(k); toggle(k); } return; }
  const opt = e.target.closest("button.opt[data-set]");
  if (opt) { ensureMod(); const k = opt.dataset.set; const before = state[k]; state[k] = coerce(k, opt.dataset.val); afterChange(k, before); }
});
$("list").addEventListener("input", e => {
  const t = e.target; const k = t.dataset && t.dataset.set; if (!k || t.tagName === "SELECT") return;
  if (t.type === "range" || t.type === "color") {
    ensureMod();
    state[k] = t.type === "range" ? Number(t.value) : fromColor(k, t.value);
    const lab = document.querySelector(`[data-val-of="${k}"]`); if (lab) lab.textContent = t.value;
    selected = k; renderStage(); highlight(k);
  }
});
$("list").addEventListener("change", e => {
  const t = e.target; const k = t.dataset && t.dataset.set; if (!k) return;
  ensureMod();
  const before = state[k];
  state[k] = t.type === "range" || t.type === "number" ? Number(t.value) : t.type === "color" ? fromColor(k, t.value) : coerce(k, t.value);
  if (t.type === "range" || t.type === "color") { commit(); select(k); if (returnTo) afterChange(k, before); } else afterChange(k, before);
});

$("secPill").onclick = () => setPicker(!pickerOpen);
$("tabs").addEventListener("click", e => { const t = e.target.closest("[data-tab]"); if (!t || t.dataset.tab === section) return; returnTo = null; switchSection(t.dataset.tab); });
$("pickScrim").onclick = () => setPicker(false);
$("pickGrid").addEventListener("click", e => {
  if (pickSuppress) return;
  if (e.target.closest("[data-simple-toggle]")) { simple = !simple; renderBar(); renderList(); store.save(); snack(simple ? "List shows hidden elements only. Double-tap or hold an element in the preview to hide it" : "List shows every setting again"); return; }
  if (e.target.closest("[data-group-toggle]")) { grouped = !grouped; renderBar(); renderStage(); store.save(); snack(grouped ? "Screens are grouped. Switch tabs right under the preview" : "Every screen is listed on its own again"); return; }
  const gb = e.target.closest("[data-group]");
  if (gb) { const g = GROUPS.find(x => x.id === gb.dataset.group), tabs = tabsOf(g); setPicker(false); returnTo = null; switchSection(lastTab[g.id] && tabs.some(([t]) => t === lastTab[g.id]) ? lastTab[g.id] : tabs[0][0]); return; }
  if (e.target.closest("[data-theme-toggle]")) { theme = theme === "m3" ? "yt" : "m3"; applyTheme(); renderBar(); store.save(); return; }
  if (e.target.closest("[data-order-reset]")) {
    openDialog(`<div class="di">${I("reset")}</div><h2 id="dlgTitle">Reset screen order?</h2><p>The screens go back to Morphe's own order. Your settings are not changed.</p><div class="acts"><button class="dbtn primary" data-dlg-ok>Reset</button><button class="dbtn tonal" data-dlg-cancel>Cancel</button></div>`);
    $("dlgBox").querySelector("[data-dlg-cancel]").onclick = closeDialog;
    $("dlgBox").querySelector("[data-dlg-ok]").onclick = () => { customOrder = null; applyOrder(); renderBar(); store.save(); closeDialog(); snack("Screens are back in Morphe's order"); };
    return;
  }
  const b = e.target.closest("[data-sec]"); if (!b) return; setPicker(false); returnTo = null; switchSection(b.dataset.sec); });
document.addEventListener("keydown", e => { if (e.key === "Escape") { setPicker(false); closeDialog(); if (searching) { query = ""; setSearch(false); } } });
function setMode(m) {
  mode = m;
  $("btnOrig").setAttribute("aria-pressed", String(m === "orig")); $("btnMod").setAttribute("aria-pressed", String(m === "mod"));
  commit(); if (selected) select(selected);
}
$("btnOrig").onclick = () => setMode("orig");
$("btnMod").onclick = () => setMode("mod");

// ------------------------------------------------------------------ theme and tablet layout
let theme = "yt", simple = false;
function applyTheme() { const ph = $("phone"); ph.classList.toggle("theme-yt", theme !== "m3"); ph.classList.toggle("theme-m3", theme === "m3"); applyAppColors(); }
// Morphe's theme patch (Pure black / AMOLED, Material You, Catppuccin, custom) changes YouTube's
// background, so the preview and, in the YouTube look, the editor itself follow it.
function appBg() {
  if (mode === "orig") return "#0f0f0f";
  const t = state.morphe_theme_color_dark;
  if (t === "CUSTOM") return String(state.morphe_theme_color_dark_custom || "#0f0f0f").replace(/^#(..)(......)$/, "#$2");
  return (typeof THEME_DARK !== "undefined" && THEME_DARK[t]) || "#0f0f0f";
}
function lift(hex, amt) { const n = parseInt(hex.slice(1), 16); const c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.min(255, Math.round(v + (255 - v) * amt))); return "#" + c.map(v => v.toString(16).padStart(2, "0")).join(""); }
function applyAppColors() {
  const ph = $("phone"), bg = appBg();
  ph.style.setProperty("--app-bg", bg);
  if (theme === "m3") { ["--m-bg", "--m-surface", "--m-c", "--m-c-high", "--m-c-highest"].forEach(v => ph.style.removeProperty(v)); return; }
  ph.style.setProperty("--m-bg", bg); ph.style.setProperty("--m-surface", bg); ph.style.setProperty("--m-c", bg);
  ph.style.setProperty("--m-c-high", lift(bg, .13)); ph.style.setProperty("--m-c-highest", lift(bg, .22));
}
// Sections whose preview is a 16:9 player: on a portrait tablet they sit on top, list below in two columns.
const WIDE = new Set(["player", "endscreen", "seekbar", "fullscreen", "captions", "sponsorblock", "danmaku"]);
function applyLayout() {
  const ed = document.querySelector(".editor"); if (!ed) return;
  const st = ed.clientWidth >= 600 && ed.clientHeight >= ed.clientWidth * 0.95 && WIDE.has(section);
  $("content").classList.toggle("stacked", st);
}
window.addEventListener("resize", applyLayout);

// ------------------------------------------------------------------ devices and UI scale
const DEVICES = [
  { id: "phone", label: "Phone", w: 400, h: 820 },
  { id: "land", label: "Phone landscape", w: 860, h: 420 },
  { id: "tablet", label: "Tablet", w: 820, h: 1100 },
  { id: "desktop", label: "Desktop", w: 1180, h: 760, desktop: true },
];
let device_ = "phone", uiScale = 100;
function applyDevice() {
  const d = DEVICES.find(x => x.id === device_);
  const ph = $("phone");
  ph.style.width = d.w + "px"; ph.style.height = d.h + "px"; ph.classList.toggle("desktop", !!d.desktop);
  $("app").style.zoom = uiScale / 100;
  const avail = Math.min(window.innerWidth - 40, d.w), availH = window.innerHeight - 40;
  const s = Math.min(1, avail / d.w, Math.max(.45, availH / d.h));
  ph.style.transform = s < 1 ? `scale(${s})` : "";
  $("devwrap").style.width = d.w * s + "px"; $("devwrap").style.height = d.h * s + "px";
  applyLayout();
  $("devBtns").innerHTML = DEVICES.map(x => `<button class="btn" data-dev="${x.id}" aria-pressed="${x.id === device_}">${x.label}</button>`).join("");
}
$("devBtns").addEventListener("click", e => { const b = e.target.closest("[data-dev]"); if (!b) return; device_ = b.dataset.dev; applyDevice(); store.save(); });
$("uiScale").addEventListener("input", e => { uiScale = Number(e.target.value); $("uiScaleOut").textContent = uiScale + "%"; applyDevice(); });
window.addEventListener("resize", () => { if (window.innerWidth > 860) applyDevice(); else { $("phone").style.transform = ""; $("devwrap").style.width = ""; $("devwrap").style.height = ""; $("phone").style.width = ""; $("phone").style.height = ""; } });

// ------------------------------------------------------------------ first-run tutorial
// Loops on its own; OK appears after two full loops, or once every page has been opened by hand.
// Tapping a page jumps there and stops the automatic advance (the page's animation still plays).
const TUT_STEPS = [
  { cap: "Tap a button to select it", sub: "Its setting is highlighted in the list below" },
  { cap: "Hold it to switch it off", sub: "It disappears, just like in the real app" },
  { cap: "Tap its row to peek", sub: "You see it for a moment, the setting stays off" },
  { cap: "Hold it while it shows to bring it back", sub: "Hold again any time to undo" },
  { cap: "Double-tap works too", sub: "Double-tap a button or its row to switch it" },
  { cap: "Or use the switch", sub: "Every setting is also a row in the list" },
];
const TUT_STEP_MS = 2600;
let tutTimer = null, tutAnims = [];
function runTutorial() {
  const t = $("tut");
  t.innerHTML = `<h2>Visual settings</h2><p class="tsub">See what each Morphe setting changes</p>
    <div class="tstage"><div class="tbtns"><div class="tb" id="tbCC">${I("cc")}</div><div class="tb" id="tbCast">${I("cast")}<div class="tring" id="tring"></div></div><div class="tb">${I("gear")}</div></div>
      <div style="position:absolute;left:12px;right:12px;bottom:12px;height:3px;background:rgba(255,255,255,.3)"><div style="width:30%;height:3px;background:#ff0033"></div></div></div>
    <div class="tlist" id="tlist"><div class="tl-t">Hide Cast button<small id="tlSum">Shown</small></div><span class="sw" id="tlSw" role="presentation" aria-checked="false"></span><div class="tl-bar" id="tlBar"></div></div>
    <div class="finger tfinger" id="tFinger">${I("gesture")}</div>
    <div class="steps" role="tablist" aria-label="Tutorial pages">${TUT_STEPS.map((_, n) => `<button role="tab" data-step="${n}" aria-label="Page ${n + 1}"><i></i></button>`).join("")}</div>
    <div class="tcap" id="tcap"></div><button class="ok" id="tutOk">OK</button><div class="wait" id="tutWait">Watch twice, or open every page, to continue</div>`;
  t.classList.add("on");
  let step = 0, loops = 0, manual = false; const seen = new Set();
  const cast = $("tbCast"), f = $("tFinger"), ring = $("tring"), row = $("tlist"), sw = $("tlSw"), sum = $("tlSum"), bar = $("tlBar");
  const box = t.getBoundingClientRect.bind(t);
  const at2 = (ms, fn) => tutAnims.push(setTimeout(fn, ms));
  const centerOf = el => { const r = el.getBoundingClientRect(), b = box(); return [r.left - b.left + r.width / 2, r.top - b.top + r.height / 2]; };
  const move = (el, ms, dx = 0, dy = 0) => { const [x, y] = centerOf(el); f.style.transition = ms ? `left ${ms}ms var(--ease), top ${ms}ms var(--ease), opacity 160ms` : "opacity 160ms"; f.style.left = (x + dx) + "px"; f.style.top = (y + dy) + "px"; f.classList.add("show"); };
  const tap = () => { f.classList.remove("tap"); void f.offsetWidth; f.classList.add("tap"); };
  const hold = (r, el) => { f.classList.add("hold"); r.classList.remove("go"); void r.offsetWidth; r.classList.add("go"); };
  const setHidden = h => { sw.setAttribute("aria-checked", String(h)); sum.textContent = h ? "Hidden" : "Shown"; };
  const show = () => {
    tutAnims.forEach(clearTimeout); tutAnims = [];
    seen.add(step);
    t.querySelectorAll(".steps button").forEach((b, n) => { b.classList.toggle("on", n === step); b.setAttribute("aria-selected", String(n === step)); b.classList.toggle("done", seen.has(n)); });
    $("tcap").innerHTML = `${TUT_STEPS[step].cap}<small>${TUT_STEPS[step].sub}</small>`;
    f.classList.remove("tap", "hold"); ring.classList.remove("go"); bar.classList.remove("go"); row.classList.remove("sel");
    if (step === 0) {
      cast.className = "tb"; setHidden(false);
      move(cast, 0, 0, 120);
      at2(60, () => move(cast, 700));
      at2(900, () => { tap(); cast.classList.add("sel"); row.classList.add("sel"); });
      at2(2100, () => f.classList.remove("show"));
    }
    if (step === 1) {
      cast.className = "tb sel"; row.classList.add("sel"); setHidden(false); move(cast, 0);
      at2(400, () => hold(ring));
      at2(400 + 480, () => { f.classList.remove("hold"); setHidden(true); ring.classList.remove("go"); });
      at2(1000, () => { cast.className = "tb off"; });
      at2(1700, () => f.classList.remove("show"));
    }
    if (step === 2) {
      cast.className = "tb off"; setHidden(true); move(row, 0, -40, 30);
      at2(60, () => move(row, 500, -40));
      at2(700, () => { tap(); row.classList.add("sel"); cast.className = "tb ghost"; });
      at2(2000, () => { cast.className = "tb off"; });
      at2(2200, () => f.classList.remove("show"));
    }
    if (step === 3) {
      cast.className = "tb off"; setHidden(true); row.classList.add("sel"); move(row, 0, -40);
      at2(100, () => { cast.className = "tb ghost"; });
      at2(450, () => move(cast, 450));
      at2(1000, () => hold(ring));
      at2(1000 + 480, () => { cast.className = "tb sel reveal"; f.classList.remove("hold"); setHidden(false); });
      at2(2300, () => f.classList.remove("show"));
    }
    if (step === 4) {
      cast.className = "tb sel"; row.classList.add("sel"); setHidden(false); move(cast, 0, 0, 60);
      at2(60, () => move(cast, 500));
      at2(700, tap); at2(860, () => { tap(); setHidden(true); cast.className = "tb off"; });
      at2(1500, () => move(row, 450, -40));
      at2(2000, tap); at2(2160, () => { tap(); setHidden(false); cast.className = "tb sel reveal"; });
      at2(2500, () => f.classList.remove("show"));
    }
    if (step === 5) {
      cast.className = "tb"; setHidden(false); move(sw, 0, 0, 40);
      at2(60, () => move(sw, 500));
      at2(700, () => { tap(); setHidden(true); row.classList.add("sel"); cast.className = "tb off"; });
      at2(1700, () => { tap(); setHidden(false); cast.className = "tb reveal"; });
      at2(2300, () => f.classList.remove("show"));
    }
  };
  const okCheck = () => { if (loops >= 2 || seen.size === TUT_STEPS.length && manual) { $("tutOk").classList.add("show"); $("tutWait").textContent = ""; } };
  show();
  clearInterval(tutTimer);
  tutTimer = setInterval(() => {
    if (manual) return;
    step = (step + 1) % TUT_STEPS.length;
    if (step === 0) loops++;
    okCheck(); show();
  }, TUT_STEP_MS);
  t.querySelector(".steps").addEventListener("click", e => {
    const b = e.target.closest("[data-step]"); if (!b) return;
    manual = true; step = Number(b.dataset.step); show(); okCheck();
  });
  $("tutOk").onclick = () => { clearInterval(tutTimer); tutAnims.forEach(clearTimeout); t.classList.remove("on"); try { localStorage.setItem(LS + "-tutorial", "1"); } catch { /* storage unavailable */ } };
}
$("replayTut").onclick = runTutorial;

function tick() { const d = new Date(); $("clock").textContent = `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`; }

// ------------------------------------------------------------------ boot
async function boot() {
  try { const r = await fetch("catalogue.json"); CAT = await r.json(); }
  catch (err) { $("list").innerHTML = `<div class="secnote" style="padding:20px 16px">Could not load catalogue.json. Serve this folder over HTTP (for example <code>python3 -m http.server</code>) and reload.</div>`; return; }
  CAT.preferences.push(...SB_CATS.map(([k, t, d]) => ({ key: "morphe_sb_" + k, title: t, summary: "What SponsorBlock does with this kind of segment", widget: "ListPreference", type: "string", default: d, rebootApp: false, parents: [{ key: "morphe_sb_enabled", mode: "all" }], customAvailability: [], screen: "SPONSORBLOCK", subScreen: null, synthetic: true, entries: SB_BEHAVIOUR })).filter(p => !CAT.preferences.some(x => x.key === p.key)));
  for (const p of CAT.preferences) { PREF[p.key] = p; defaults[p.key] = initialValue(p); }
  Object.assign(state, defaults);
  const saved = store.load();
  if (saved.state) for (const k in saved.state) if (k in PREF) state[k] = saved.state[k];
  baseline = { ...state };
  try { const b = JSON.parse(localStorage.getItem(LS + "-baseline") || "null"); if (b) for (const k in b) if (k in PREF) baseline[k] = b[k]; } catch { /* storage unavailable */ }
  if (saved.section && SECTIONS.some(s => s.id === saved.section)) section = saved.section;
  if (saved.theme === "m3") theme = "m3";
  if (saved.simple) simple = true;
  if (saved.grouped) grouped = true;
  if (saved.tabs) Object.assign(lastTab, saved.tabs);
  applyTheme();
  if (saved.device && DEVICES.some(d => d.id === saved.device)) device_ = saved.device;
  if (CAT.youtubeVersions && CAT.youtubeVersions.length) {
    YT_VERSIONS.length = 0; YT_EXPERIMENTAL.clear();
    CAT.youtubeVersions.forEach(v => { YT_VERSIONS.push(v.version); if (v.experimental) YT_EXPERIMENTAL.add(v.version); });
    ytVersion = YT_VERSIONS[0];
  }
  if (saved.yt && YT_VERSIONS.includes(saved.yt)) ytVersion = saved.yt;
  applyVersion();
  $("ytVer").innerHTML = YT_VERSIONS.map(v => `<option value="${v}" ${v === ytVersion ? "selected" : ""}>${v}${YT_EXPERIMENTAL.has(v) ? " (experimental)" : ""}</option>`).join("");
  $("ytVer").onchange = e => { ytVersion = e.target.value; applyVersion(); trayOpen = false; buildMembers(); commit(); };
  buildMembers();
  if (Array.isArray(saved.order)) customOrder = saved.order;
  if (saved.borrowed && typeof saved.borrowed === "object") for (const [sec, ks] of Object.entries(saved.borrowed)) if (Array.isArray(ks)) borrowed[sec] = new Set(ks.filter(x => PREF[x]));
  applyOrder();
  renderAll();
  if (window.innerWidth > 860) applyDevice(); else $("devBtns").innerHTML = "";
  tick(); setInterval(tick, 30000);
  let seen = false; try { seen = localStorage.getItem(LS + "-tutorial") === "1"; } catch { /* storage unavailable */ }
  if (!seen) runTutorial();
}
store.save = function () { try { localStorage.setItem(LS, JSON.stringify({ state: changedOnly(), section, device: device_, yt: ytVersion, theme, simple, grouped, tabs: lastTab, order: customOrder, borrowed: Object.fromEntries(Object.entries(borrowed).map(([s, v]) => [s, [...v]])) })); localStorage.setItem(LS + "-baseline", JSON.stringify(baseline)); } catch { /* storage unavailable */ } };
boot();
})();
