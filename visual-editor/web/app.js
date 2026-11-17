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
function parentsOk(k) { return classicParentsOk(k) && availOk(k); }
function classicParentsOk(k) {
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
  if (fading.has(full)) cls.push("ghost", "leaving");
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
  const on = list.filter(([k]) => shown("morphe_" + k));
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
  const upnext = auto === "AUTO"
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
SCENES.description = () => `<div class="inner-scroll" style="background:#212121;height:350px;overflow-y:auto;scrollbar-width:thin">
  <div style="display:flex;align-items:center;gap:10px;padding:12px 14px 6px"><b style="font-size:17px;flex:1">Description</b>${I("close", "ico", 'style="width:20px;height:20px"')}</div>
  <div style="display:flex;align-items:center;gap:10px;padding:4px 14px 10px">${av(0, 30)}<span class="t1" style="flex:1">${VIDEOS[0].c}</span>
    ${C("hide_subscribe_button", `<span class="chip" style="background:#f1f1f1;color:#0f0f0f;height:30px">Subscribe</span>`)}</div>
  ${DESC.map(([k, t, b]) => C(k, `<div style="margin:0 12px 8px;padding:9px 12px;border-radius:10px;background:#2c2c2c"><div class="t1" style="font-size:13px">${esc(t)}</div><div class="t2" style="margin-top:2px">${esc(b)}</div></div>`, { blk: 1 })).join("")}
</div>`;

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
  wrap("watch", html => html
    .replace(/(<div class="c[^"]*" data-k="morphe_hide_player_related_videos")/, `${C("hide_emergency_box", `<div style="margin:0 12px 10px;background:#3b1f1f;border-radius:12px;padding:10px 12px"><div class="t1" style="font-size:13px">Emergency information</div><div class="t2">Call 112 for emergency services in Norway</div></div>`, { blk: 1 })}
      ${C("hide_medical_panels", `<div style="margin:0 12px 10px;border:1px solid #333;border-radius:12px;padding:10px 12px"><div class="t1" style="font-size:13px">Health info from a licensed source</div><div class="t2">Carbon monoxide safety · NHS</div></div>`, { blk: 1 })}
      ${C("hide_crowdfunding_box", `<div style="margin:0 12px 10px;background:#272727;border-radius:12px;padding:10px 12px;display:flex;gap:10px;align-items:center">${I("heart", "ico", 'style="fill:#f06292;flex:none"')}<div><div class="t1" style="font-size:13px">Support the cabin on Patreon</div><div class="t2">Crowdfunding</div></div></div>`, { blk: 1 })}$1`));
  wrap("flyout", html => html
    .replace(/(data-k="morphe_hide_player_flyout_quality"[\s\S]*?<\/div><\/div>)/, `$1${C("hide_player_flyout_quality_header", `<div class="t2" style="padding:0 18px 2px 58px">Header: Quality for current video</div>`, { blk: 1 })}${C("hide_player_flyout_quality_footer", `<div class="t2" style="padding:0 18px 6px 58px">Footer: Change default quality in Settings</div>`, { blk: 1 })}`)
    .replace(/(data-k="morphe_hide_player_flyout_captions"[\s\S]*?<\/div><\/div>)/, `$1${C("hide_player_flyout_captions_header", `<div class="t2" style="padding:0 18px 2px 58px">Header: Captions</div>`, { blk: 1 })}${C("hide_player_flyout_captions_footer", `<div class="t2" style="padding:0 18px 6px 58px">Footer: Caption preferences</div>`, { blk: 1 })}`)
    .replace(/(data-k="morphe_hide_player_flyout_audio_track"[\s\S]*?<\/div><\/div>)/, `$1${C("hide_player_flyout_audio_track_footer", `<div class="t2" style="padding:0 18px 6px 58px">Footer: Original audio is marked</div>`, { blk: 1 })}`));
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
  wrap("seekbar", html => V("morphe_fullscreen_large_seekbar") ? html.replace('id="seek" style="position:relative;left:0;right:0;height:4px;', 'id="seek" style="position:relative;left:0;right:0;height:9px;') : html);
}

// ------------------------------------------------------------------ scenario animations (standard canvas)
// Every scenario uses the same frame: fade the preview to black (220 ms), caption top-left with the
// setting and its new state, device illustration in the middle, one-line outcome at the bottom,
// a progress line, then fade back (220 ms). Body length is SC_HOLD.
const SC_FADE = 220, SC_HOLD = 3000;
const SCN = {};
const scen = (section, keys, fn) => keys.split(/\s+/).forEach(k => { A["morphe_" + k] = { section, kind: "scenario" }; SCN["morphe_" + k] = fn; });
// Device illustration. Content that depends on orientation goes in .dv-video (the player area)
// and .dv-below (the page under the player); CSS lays both out for .port and .land, so a
// scenario can rotate the phone with rotate() and nothing ends up covering anything else.
const DEV_SIZE = { port: [92, 172], land: [190, 108] };
function device(orient, inner, extra = "") {
  const [w, h] = DEV_SIZE[orient];
  return `<div class="dev ${orient}" style="width:${w}px;height:${h}px;${extra}"><div class="waves l"></div><div class="waves r"></div>${inner}<div class="finger" id="scFinger">${I("gesture")}</div></div>`;
}
const playerArea = (i, overlay = "") => `<div class="dv-video" style="background:${ART[i]}">${overlay}</div><div class="dv-below"><i></i><i></i><i></i></div>`;
function rotate(dev, orient) { const [w, h] = DEV_SIZE[orient]; dev.classList.remove("port", "land"); dev.classList.add(orient); dev.style.width = w + "px"; dev.style.height = h + "px"; }
function situation(text) { const el = document.querySelector("#canvas .sit"); if (!el) return; el.style.opacity = 0; setTimeout(() => { el.textContent = text; el.style.opacity = 1; }, 160); }
function setFoot(text) { const el = document.querySelector("#canvas .foot"); if (el) el.textContent = text; }
function buzz(dev, on) {
  if (!on) return;
  dev.classList.remove("buzz"); void dev.offsetWidth; dev.classList.add("buzz");
  dev.querySelectorAll(".waves").forEach(w => { w.classList.remove("go"); void w.offsetWidth; w.classList.add("go"); });
  try { navigator.vibrate && navigator.vibrate(40); } catch { /* not supported */ }
}
const at = (ms, f) => setTimeout(() => { if (scenarioToken.alive) f(); }, ms);
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
scen("player", "fullscreen_video_scale_button_fullscreen_only", (box, on, prev) => {
  const btn = `<div class="scb" style="position:absolute;right:5px;bottom:5px;width:20px;height:20px;border-radius:5px;background:rgba(0,0,0,.45);display:grid;place-items:center;transition:opacity .4s var(--ease)">${I("crop", "ico", 'style="width:14px;height:14px"')}</div>`;
  box.innerHTML = device("port", playerArea(0, btn));
  const dev = box.querySelector(".dev"), b = box.querySelector(".scb");
  situation("Portrait player");
  b.style.opacity = prev ? "0" : "1";
  at(650, () => { b.style.opacity = on ? "0" : "1"; setFoot(on ? "Portrait: the button fades out" : "Portrait: the button fades in"); });
  at(1700, () => { situation("Fullscreen"); rotate(dev, "land"); b.style.opacity = "1"; setFoot("Fullscreen: the button is shown either way"); });
  return on ? "Portrait: the button fades out" : "Portrait: the button fades in";
});
scen("player", "copy_video_link_with_timestamp_button", (box, on) => {
  box.innerHTML = device("land", `${miniVideo(0)}<div style="position:absolute;right:8px;top:8px">${I("link", "ico", 'style="width:18px;height:18px"')}</div>${miniSeek(17)}`);
  const dev = box.querySelector(".dev"), f = box.querySelector("#scFinger"); const W = dev.clientWidth;
  at(100, () => fingerTo(f, W - 17, 17)); at(400, () => tapF(f));
  at(600, () => dev.insertAdjacentHTML("beforeend", `<div class="toastin" style="bottom:10px;top:auto;font-size:9px">Copied: youtu.be/cAb1n${on ? "?t=192" : ""}</div>`));
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
function entriesFor(k) {
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
    const fix = v => (v === defaults[k] ? target : (vals.length && !vals.includes(String(v)) ? (vals.includes(String(target)) ? target : vals[0]) : v));
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
  const actions = [modern || minimal ? channelChip : "", likeChip, act("hide_comments_button", "comment", "1.2K"), act("hide_share_button", "share", "Share"), act("hide_remix_button", "remix", "Remix"), act("hide_thanks_button", "dollar", "Thanks"),
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
    ${C("hide_action_bar", `<div style="${rowStyle};padding:0 12px 10px">${actions}</div>`, { blk: 1 })}
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
  const resume = C("miniplayer_disable_resuming", `<div style="position:absolute;left:10px;right:10px;top:60px;${surface};border-radius:14px;padding:8px;display:flex;gap:8px;align-items:center;z-index:2"><div style="width:72px;flex:none;border-radius:8px;overflow:hidden">${thumb(1, "border-radius:0")}</div><div style="min-width:0;flex:1"><div class="t2" style="font-size:10.5px">Continue watching</div><div style="font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(VIDEOS[1].t)}</div></div>${ic("close", 18)}</div>`, { also: "miniplayer_disable_resuming" });
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
SCENES.sponsorblock = () => {
  const on = !!V("morphe_sb_enabled");
  const sq = !!V("morphe_sb_square_layout");
  const compact = !!V("morphe_sb_compact_skip_button");
  const r = sq ? 2 : 18;
  const noseg = !!V("morphe_sb_video_length_without_segments");
  const segs = on ? `<i style="position:absolute;left:8%;width:9%;top:0;bottom:0;background:#00d400"></i><i style="position:absolute;left:46%;width:5%;top:0;bottom:0;background:#ffff00"></i><i style="position:absolute;left:88%;width:12%;top:0;bottom:0;background:#0202ed"></i>` : "";
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
const r1 = dev => rotate(dev, "port"); r1.text = "leaves fullscreen";
gestureScen("disable_fullscreen_dragged_down_gesture", "land", [.5, .25], [.5, .85], "Swipe down in fullscreen", r1);
const r2 = dev => rotate(dev, "land"); r2.text = "enters fullscreen";
gestureScen("disable_fullscreen_pulled_up_gesture", "port", [.5, .3], [.5, .08], "Swipe up on the player", r2);
const r3 = dev => { const v = dev.querySelector(".dv-video"); if (v) { v.style.transition = "transform .4s"; v.style.transform = "translateY(70%) scale(.5)"; } }; r3.text = "shrinks to the miniplayer";
gestureScen("disable_fullscreen_sliding_down_gesture", "port", [.5, .1], [.5, .45], "Swipe down on the player", r3);
scen("fullscreen", "disable_fullscreen_zoom_gesture", (box, disabled) => {
  situation("Fullscreen, two fingers");
  box.innerHTML = device("land", `<div class="zv" style="position:absolute;left:10%;right:10%;top:0;bottom:0;background:${ART[6]};transition:all .6s var(--ease)"></div>`);
  const dev = box.querySelector(".dev"), f = box.querySelector("#scFinger"), zv = box.querySelector(".zv"); const W = dev.clientWidth, H = dev.clientHeight;
  at(150, () => fingerTo(f, W * .45, H * .5)); at(400, () => fingerTo(f, W * .8, H * .2, 600));
  at(900, () => { if (!disabled) { zv.style.left = "-5%"; zv.style.right = "-5%"; zv.style.top = "-10%"; zv.style.bottom = "-10%"; } });
  return disabled ? "Pinch: the video stays fitted" : "Pinch: the video zooms to fill the screen";
});

// ------------------------------------------------------------------ swipe controls: overlay style settings feed the swipe demo
def("fullscreen", "style", "swipe_overlay_background_opacity swipe_overlay_progress_volume_color swipe_overlay_progress_brightness_color swipe_overlay_progress_speed_color swipe_text_overlay_size swipe_zone_width");
def("fullscreen", "gesture", "swipe_top_zone");
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

// ------------------------------------------------------------------ section order with the new ones
{
  const order = ["player", "endscreen", "seekbar", "fullscreen", "flyout", "captions", "sponsorblock", "watch", "description", "comments", "ambient", "danmaku", "miniplayer", "feed", "channel", "explore", "shorts", "nav", "misc"];
  const all = [...SECTIONS]; SECTIONS.length = 0;
  order.forEach(id => { const s = all.find(x => x.id === id); if (s) SECTIONS.push(s); });
}

let scenarioToken = { alive: false };
function playScenario(k, prevValue) {
  const fn = SCN[k]; if (!fn) return;
  scenarioToken.alive = false;
  const token = scenarioToken = { alive: true };
  const canvas = $("canvas"); const stick = $("stick");
  const wasHidden = stick.hidden;
  if (wasHidden) { stick.hidden = false; $("stage").innerHTML = `<div style="height:200px"></div>`; }
  const on = !!V(k);
  const valueTxt = PREF[k].type === "boolean" ? (on ? "On" : "Off") : String(V(k));
  canvas.innerHTML = `<div class="cap"><b>${esc(title(k))}</b><span class="st ${on ? "on" : ""}">${esc(valueTxt)}</span></div><div class="sit"></div><div class="scbox" style="display:grid;place-items:center"></div><div class="foot"></div><div class="prog"></div>`;
  canvas.classList.add("show");
  const prev = prevValue !== undefined ? prevValue : PREF[k].type === "boolean" ? !V(k) : V(k);
  const foot = fn(canvas.querySelector(".scbox"), V(k), prev);
  if (foot && !canvas.querySelector(".foot").textContent) canvas.querySelector(".foot").textContent = foot;
  const prog = canvas.querySelector(".prog");
  prog.animate([{ width: "0%" }, { width: "100%" }], { duration: SC_HOLD, delay: SC_FADE, fill: "forwards" });
  setTimeout(() => {
    if (!token.alive) return;
    canvas.classList.remove("show");
    setTimeout(() => { if (!token.alive) return; token.alive = false; canvas.innerHTML = ""; if (wasHidden && section === "misc") { stick.hidden = true; } }, SC_FADE);
  }, SC_FADE + SC_HOLD);
}
function stopScenario() { scenarioToken.alive = false; $("canvas").classList.remove("show"); }

// ------------------------------------------------------------------ demos (gesture / behaviour), faster loop
const LOOP_MS = 1500;
let demoTimer = null, demoStep = 0;
function stopDemo() { clearInterval(demoTimer); demoTimer = null; }
function label(text, bad) {
  const st = $("stage");
  st.querySelectorAll(".demo-label.dyn").forEach(n => n.remove());
  const d = document.createElement("div");
  d.className = "demo-label dyn" + (bad ? " bad" : "");
  d.textContent = text;
  st.firstElementChild?.appendChild(d);
}
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
  morphe_swipe_overlay_style() { swipeDemo("right", V("morphe_swipe_right_zone") !== "OFF" ? V("morphe_swipe_right_zone") : "VOLUME"); },
  morphe_swipe_top_zone(v) { swipeDemo("top", v); },
  morphe_swipe_overlay_background_opacity() { DEMOS.morphe_swipe_overlay_style(); },
  morphe_swipe_text_overlay_size() { DEMOS.morphe_swipe_overlay_style(); },
  morphe_swipe_overlay_progress_volume_color() { swipeDemo("right", "VOLUME"); },
  morphe_swipe_overlay_progress_brightness_color() { swipeDemo("left", "BRIGHTNESS"); },
  morphe_swipe_overlay_progress_speed_color() { swipeDemo("right", "SPEED"); },
  morphe_swipe_zone_width() { swipeDemo(demoStep % 2 ? "left" : "right", demoStep % 2 ? (V("morphe_swipe_left_zone") || "BRIGHTNESS") : (V("morphe_swipe_right_zone") || "VOLUME")); },
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
    if (chip && !disabled) { chip.animate([{ boxShadow: "0 0 0 0 rgba(62,166,255,0)" }, { boxShadow: "0 0 14px 4px rgba(62,166,255,.8)" }, { boxShadow: "0 0 0 0 rgba(62,166,255,0)" }], { duration: 1100 }); label("Creator says \"hit like\": button glows (stock)"); }
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
function swipeZones() {
  const st = $("stage").firstElementChild; if (!st) return;
  st.querySelectorAll(".zones").forEach(z => z.remove());
  const zw = Math.max(5, Math.min(50, Number(V("morphe_swipe_zone_width")) || 37));
  const top = V("morphe_swipe_top_zone") && V("morphe_swipe_top_zone") !== "OFF";
  const z = document.createElement("div"); z.className = "zones";
  z.innerHTML = `<i style="left:0;width:${zw}%"></i><i style="right:0;width:${zw}%"></i>${top ? `<i style="left:${zw}%;right:${zw}%;top:0;height:22%"></i>` : ""}`;
  st.appendChild(z); setTimeout(() => z.classList.add("out"), 900); setTimeout(() => z.remove(), 1300);
}
function swipeDemo(side, action) {
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
    label(`${sideName} swipe: ${entryLabel("morphe_swipe_" + side + "_zone", action)}`);
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

// ------------------------------------------------------------------ section membership
let MEMBERS = {};
function inScope(p, scopes) { return scopes.some(([s, sub]) => p.screen === s && (p.subScreen || null) === sub); }
function buildMembers() {
  MEMBERS = {};
  SECTIONS.forEach(s => (MEMBERS[s.id] = { live: [], misc: [] }));
  const assigned = new Set();
  for (const k in A) if (PREF[k] && MEMBERS[A[k].section] && inVersion(k)) { MEMBERS[A[k].section].live.push(k); assigned.add(k); }
  for (const p of CAT.preferences) {
    if (assigned.has(p.key) || !inVersion(p.key)) continue;
    const s = SECTIONS.find(s => s.scopes && inScope(p, s.scopes));
    (s ? MEMBERS[s.id].misc : MEMBERS.misc.misc).push(p.key);
  }
}
const sectionOf = k => SECTIONS.find(s => MEMBERS[s.id].live.includes(k) || MEMBERS[s.id].misc.includes(k))?.id || "misc";

// ------------------------------------------------------------------ rendering
const $ = id => document.getElementById(id);
const secInfo = () => SECTIONS.find(s => s.id === section);

function renderBar() {
  const s = secInfo();
  $("secLabel").textContent = s.title;
  $("secIcon").innerHTML = `<path d="${P[s.icon] || P.list}"/>`;
  $("pickGrid").innerHTML = SECTIONS.map((x, i) => {
    const m = MEMBERS[x.id];
    const sub = x.id === "misc" ? `${m.misc.length} settings` : `${m.live.length} visual · ${m.misc.length} misc`;
    return `<button class="pick" role="menuitem" data-sec="${x.id}" aria-current="${x.id === section}" style="transition-delay:${Math.min(i, 12) * 12}ms"><span class="pi">${I(x.icon)}</span><span><div class="pt">${esc(x.title)}</div><div class="ps">${sub}</div></span></button>`;
  }).join("");
  const n = pendingRestart().length;
  $("rcount").textContent = n;
  $("rchip").classList.toggle("show", n > 0);
}
function setPicker(open) {
  pickerOpen = open;
  $("picker").classList.toggle("open", open); $("pickScrim").classList.toggle("open", open);
  $("secPill").setAttribute("aria-expanded", String(open));
}

let stageHold = 0;
function renderStage() {
  if (stageHold) return;
  const st = $("stage");
  const scene = SCENES[section];
  $("stick").hidden = !scene;
  if (!scene) { st.innerHTML = ""; return; }
  const scrollers = [...st.querySelectorAll(".inner-scroll")].map(e => e.scrollTop);
  const hscroll = [...st.querySelectorAll("[data-hs]")].map(e => e.scrollLeft);
  st.className = "stage" + (mode === "orig" ? " original" : "");
  st.innerHTML = scene();
  st.querySelectorAll(".finger").forEach(f => { if (!f.firstChild) f.innerHTML = I("gesture"); });
  st.querySelectorAll(".inner-scroll").forEach((e, i) => { if (scrollers[i]) e.scrollTop = scrollers[i]; });
  st.querySelectorAll('[style*="overflow-x:auto"]').forEach((e, i) => { e.dataset.hs = ""; if (hscroll[i]) e.scrollLeft = hscroll[i]; });
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
function controlFor(k) {
  const p = PREF[k]; const v = V(k); const dis = !parentsOk(k) ? "disabled" : "";
  const ents = entriesFor(k);
  if (ents.length && ents.length <= 8) return `<div class="ctl">${ents.map(e => `<button class="opt" data-set="${k}" data-val="${esc(e.value)}" aria-pressed="${String(e.value) === String(v)}" ${dis}>${esc(e.label)}</button>`).join("")}</div>`;
  if (ents.length) return `<div class="ctl"><select data-set="${k}" ${dis} aria-label="${esc(title(k))}">${ents.map(e => `<option value="${esc(e.value)}" ${String(e.value) === String(v) ? "selected" : ""}>${esc(e.label)}</option>`).join("")}</select></div>`;
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
function needText(k) {
  if (!classicParentsOk(k)) return "Needs " + PREF[k].parents.map(x => `“${esc(title(x.key))}” ${x.mode === "not" ? "off" : "on"}`).join(", ");
  const ap = (PREF[k].availabilityParents || []).filter(x => PREF[x]);
  return ap.length ? `Not available with the current ${ap.map(x => `“${esc(title(x))}”`).join(", ")}` : "Not available here";
}
// The setting to visit so that k becomes available.
function blockerOf(k) {
  const p = PREF[k];
  if (!classicParentsOk(k)) return (p.parents.find(x => x.mode === "not" ? !!state[x.key] : !state[x.key]) || p.parents[0]).key;
  return (p.availabilityParents || []).find(x => PREF[x] && inVersion(x)) || null;
}
const dependsOn = (k, parent) => PREF[k].parents.some(x => x.key === parent) || (PREF[k].availabilityParents || []).includes(parent);

function rowHTML(k, live) {
  const p = PREF[k]; const a = A[k]; const kind = live ? (a.kind === "scenario" ? "behaviour" : a.kind) : "fallback";
  const chg = mode === "mod" && JSON.stringify(state[k]) !== JSON.stringify(defaults[k]);
  const dis = !parentsOk(k);
  const isBool = p.type === "boolean";
  const info = !p.type || p.type === "screen" || p.widget === "NonInteractivePreference" || p.widget === "IntentPreference";
  let right = "", ctl = "";
  if (live && a.kind !== "scenario") { right = stateChip(k); if (!isBool) ctl = controlFor(k); }
  else if (isBool) right = `<button class="sw" role="switch" data-sw="${k}" aria-checked="${!!V(k)}" aria-label="${esc(title(k))}"></button>`;
  else if (!info) ctl = controlFor(k);
  const cls = ["row", live ? "live" : "fallback"];
  if (selected === k) cls.push("sel");
  if (dis) cls.push("dis");
  if (live && (a.kind === "vis" || a.kind === "overlay") && !shown(k)) cls.push("offstate");
  const sum = info ? (p.summary || (p.type === "screen" ? "Opens a sub-screen in Morphe settings" : "Information")) : summaryFor(k);
  const need = dis ? `<div class="sum need">${I("lock", "ico", 'style="width:14px;height:14px;fill:currentColor"')}${needText(k)}${blockerOf(k) ? `<button class="goto" data-goto="${k}">Take me there ${I("arrow")}</button>` : ""}</div>` : "";
  const tags = isAnimated(k) ? `<span class="tag">${I("play")}Animated</span>` : "";
  return `<div class="${cls.join(" ")}" data-row="${k}" data-k="${k}" tabindex="0">
    <div class="txt"><div class="ttl">${esc(title(k))}${chg ? '<span class="changed-dot" title="Changed from default"></span>' : ""}${tags}</div>
      ${sum ? `<div class="sum">${esc(sum)}</div>` : ""}${need}${ctl}</div>${right}</div>`;
}
const groupHTML = (name, icon, keys, live) => keys.length ? `<div class="gtitle">${I(icon)}${name} · ${keys.length}</div><div class="group">${keys.map(k => rowHTML(k, live)).join("")}</div>` : "";

let miscQuery = "";
function renderList() {
  const m = MEMBERS[section];
  let html = "";
  if (section !== "misc") {
    const ordered = [...m.live.filter(isAnimated), ...m.live.filter(k => !isAnimated(k))];
    html += `<div class="sechead">Live view <span>${m.live.length} visual · ${m.misc.length} misc</span></div>`;
    if (ordered.length) html += `<div class="group">${ordered.map(k => rowHTML(k, true)).join("")}</div>`;
    if (m.misc.length) {
      html += `<div class="sechead">Misc <span>no visual adapter currently available</span></div><div class="secnote">These use their normal Morphe widget. When an adapter is written for one, it moves up into Live view by itself.</div>`;
      html += `<div class="group">${m.misc.map(k => rowHTML(k, false)).join("")}</div>`;
    }
  } else {
    html += `<div class="search"><svg viewBox="0 0 24 24"><path d="${P.search}"/></svg><input id="miscSearch" placeholder="Search ${m.misc.length} settings" value="${esc(miscQuery)}" aria-label="Search settings"></div>`;
    html += `<div class="secnote" style="padding-top:10px">Every Morphe YouTube setting that no Live view screen claims yet, grouped by its original settings screen. No visual adapter is currently available for these.</div>`;
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
    for (const g of names) html += `<div class="gtitle">${esc(g)} · ${groups[g].length}</div><div class="group">${groups[g].map(k => rowHTML(k, false)).join("")}</div>`;
  }
  $("list").innerHTML = html;
  const s = $("miscSearch");
  if (s) s.addEventListener("input", e => { miscQuery = e.target.value; const pos = e.target.selectionStart; renderList(); const n = $("miscSearch"); n.focus(); n.setSelectionRange(pos, pos); });
}

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

function renderAll() { renderBar(); renderStage(); renderList(); renderInspector(); store.save(); }
function commit() { renderBar(); renderStage(); renderList(); renderInspector(); store.save(); }

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
$("rchip").onclick = restartDialog;
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

function highlight(k) {
  document.querySelectorAll(".sel").forEach(e => e.classList.remove("sel"));
  document.querySelectorAll(`[data-k="${k}"], [data-row="${k}"], [data-also="${k}"]`).forEach(e => e.classList.add("sel"));
}
function scrollRowIntoView(k, center) {
  const row = document.querySelector(`[data-row="${k}"]`); if (!row) return;
  const sc = $("scroller"), two = $("content").offsetWidth >= 600, stickH = two ? 0 : $("stick").offsetHeight;
  const top = row.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop;
  const target = center ? top - stickH - (sc.clientHeight - stickH) / 2 + row.offsetHeight / 2 : top - stickH - 8;
  if (center || top < sc.scrollTop + stickH || top + row.offsetHeight > sc.scrollTop + sc.clientHeight) sc.scrollTo({ top: target, behavior: "smooth" });
}
function select(k, from) {
  selected = k;
  if (section === "player" && mode === "mod") {
    const want = CUSTOM_KEYS.has(k) && !shown(k);
    if (want !== trayOpen) { trayOpen = want; renderStage(); }
  }
  highlight(k);
  renderInspector();
  if (from === "stage") scrollRowIntoView(k);
  if (from === "list") {
    const el = document.querySelector(`#stage [data-k="${k}"]`);
    const box = el && el.closest(".inner-scroll");
    if (el && box) { const r = el.getBoundingClientRect(), b = box.getBoundingClientRect(); if (r.top < b.top || r.bottom > b.bottom) box.scrollBy({ top: r.top - b.top - 40, behavior: "smooth" }); }
  }
  if (from === "list" && mode === "mod" && A[k] && (A[k].kind === "vis" || A[k].kind === "overlay") && !shown(k) && document.querySelector(`#stage [data-k="${k}"]`)) ghost(k);
  if (DEMOS[k]) startDemo(k); else stopDemo();
  if (SCN[k] && from) playScenario(k);
  const a = A[k];
  const notApplicable = a && (a.kind === "vis" || a.kind === "overlay") && a.section === section && !document.querySelector(`#stage [data-k="${k}"], #stage [data-also="${k}"]`);
  if (notApplicable && SCENES[section]) {
    const why = k === "morphe_hide_end_screen_suggested_video" ? "Appears only when autoplay is off. Set Autoplay mode to Off to see it."
      : k === "morphe_hide_autoplay_preview" ? "Appears only when autoplay is on."
      : /^morphe_miniplayer_/.test(k) ? "Not part of the current miniplayer type." : "Not shown in the current layout.";
    label(why, true);
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
function ghost(k) {
  const already = ghosts.has(k) || fading.has(k);
  clearGhost(k);
  ghosts.add(k);
  stageEls(k).forEach(e => { e.getAnimations().forEach(a => a.cancel()); e.classList.remove("ghost-out", "leaving"); e.classList.add("ghost"); if (!already && !e.classList.contains("intray")) sizeAnim(e, true); });
  const t1 = setTimeout(() => {
    ghosts.delete(k); fading.add(k);
    stageEls(k).forEach(e => { if (e.classList.contains("intray")) e.classList.add("ghost-out"); else { e.classList.add("leaving"); sizeAnim(e, false, 420); } });
    const t2 = setTimeout(() => { fading.delete(k); ghostTimers.delete(k); stageEls(k).forEach(e => { e.classList.remove("ghost", "ghost-out", "leaving"); e.getAnimations().forEach(a => a.cancel()); }); }, 440);
    ghostTimers.set(k, [t2]);
  }, 1600);
  ghostTimers.set(k, [t1]);
}

function toggle(k) {
  const p = PREF[k];
  if (mode === "orig") setMode("mod");
  if (!parentsOk(k)) { pointToParents(k); snack(needText(k)); return; }
  const before = state[k];
  if (p.type === "boolean") state[k] = !state[k];
  else if (p.entries && p.entries.length) { const vals = entriesFor(k).map(e => e.value); const i = vals.indexOf(String(state[k])); state[k] = coerce(k, vals[(i + 1) % vals.length]); }
  else { snack("Use the control in the list to change this one"); return; }
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
      els.forEach(e => { e.classList.remove("pressing", "charging"); sizeAnim(e, false); });
      setTimeout(done, SIZE_MS + 20);
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
  if (ax === "w") { full = { width: r.width + "px", marginLeft: cs.marginLeft, marginRight: cs.marginRight, opacity: 1 }; zero = { width: "0px", marginLeft: "0px", marginRight: "0px", opacity: 0 }; }
  else if (ax === "h") { full = { height: r.height + "px", marginTop: cs.marginTop, marginBottom: cs.marginBottom, opacity: 1 }; zero = { height: "0px", marginTop: "0px", marginBottom: "0px", opacity: 0 }; }
  else { full = { opacity: 1, transform: cs.transform === "none" ? "scale(1)" : cs.transform }; zero = { opacity: 0, transform: (cs.transform === "none" ? "" : cs.transform + " ") + "scale(.8)" }; }
  if (!r.width && !r.height && ax !== "none") return null;
  el.classList.add("sizing");
  const a = el.animate(show ? [zero, full] : [full, zero], { duration: ms, easing: "cubic-bezier(.4,0,.2,1)", fill: show ? "none" : "forwards" });
  a.onfinish = () => { el.classList.remove("sizing"); };
  return a;
}
function afterChange(k, before) {
  const p = PREF[k];
  commit(); select(k);
  try { navigator.vibrate && navigator.vibrate(20); } catch { /* ignore */ }
  if (SCN[k]) playScenario(k, before);
  // teleport back to the setting that was waiting on this one
  if (returnTo && parentsOk(returnTo.key) && dependsOn(returnTo.key, k)) {
    const back = returnTo; returnTo = null;
    setTimeout(() => goToSetting(back.key, () => {
      const row = document.querySelector(`[data-row="${back.key}"]`);
      if (row) { row.classList.remove("unlock"); void row.offsetWidth; row.classList.add("unlock"); }
      snack(`<b>${esc(title(back.key))}</b> is unlocked`);
    }), 650);
  }
}
// Colour inputs only take #RRGGBB; keep the alpha byte of Morphe's #AARRGGBB values.
function fromColor(k, hex) { const cur = String(state[k] || ""); const alpha = cur.length === 9 ? cur.slice(1, 3) : ""; return ("#" + alpha + hex.slice(1)).toUpperCase(); }
function ensureMod() { if (mode === "orig") { mode = "mod"; $("btnOrig").setAttribute("aria-pressed", "false"); $("btnMod").setAttribute("aria-pressed", "true"); $("hint").textContent = "Tap to select · hold to switch"; } }
function coerce(k, v) { const t = PREF[k].type; if (t === "integer" || t === "long" || t === "float") return Number(v); if (t === "boolean") return v === true || v === "true"; return v; }

function switchSection(id, after) {
  if (id === section) { after && after(); return; }
  const from = SECTIONS.findIndex(s => s.id === section), to = SECTIONS.findIndex(s => s.id === id);
  const content = $("content"); content.style.setProperty("--dir", (to > from ? -24 : 24) + "px");
  content.classList.remove("swap-in"); content.classList.add("swap-out");
  stopDemo(); stopScenario();
  setTimeout(() => {
    section = id; selected = null; miscQuery = ""; trayOpen = false;
    $("scroller").scrollTop = 0; renderAll();
    content.classList.remove("swap-out"); void content.offsetWidth; content.classList.add("swap-in");
    after && setTimeout(after, 120);
  }, 120);
}
function goToSetting(k, after) {
  switchSection(sectionOf(k), () => {
    select(k); scrollRowIntoView(k, true);
    const row = document.querySelector(`[data-row="${k}"]`);
    setTimeout(() => { if (row) { row.classList.remove("attn"); void row.offsetWidth; row.classList.add("attn"); } after && after(); }, 380);
  });
}

// press handling (tap vs hold), shared by stage and list
let press = null;
const LONG = 480;
function down(e) {
  if (e.button > 0) return;
  if (e.target.closest("input,select,textarea,button.opt,.sw,.goto,.replay,[data-tray]")) return;
  const el = e.target.closest("[data-k]"); if (!el) return;
  const k = el.dataset.k; const from = el.closest("#stage") ? "stage" : "list";
  el.classList.add("pressing");
  if (from === "stage" && el.classList.contains("off")) { (ghostTimers.get(k) || []).forEach(clearTimeout); ghostTimers.delete(k); el.classList.remove("ghost-out"); el.classList.add("charging"); }
  press = { el, k, from, x: e.clientX, y: e.clientY, long: false };
  press.t = setTimeout(() => { if (!press) return; press.long = true; el.classList.remove("pressing"); toggle(k); }, LONG);
}
function cancelPress() { if (press) { clearTimeout(press.t); press.el.classList.remove("pressing", "charging"); press = null; } }
function move(e) { if (press && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 10) cancelPress(); }
function up() {
  if (!press) return;
  clearTimeout(press.t); press.el.classList.remove("pressing", "charging");
  const { k, from, long } = press; press = null;
  if (long) return;
  const a = A[k];
  if (mode === "mod" && a && (a.kind === "vis" || a.kind === "overlay") && !shown(k)) {
    select(k, from);
    if (document.querySelector(`#stage [data-k="${k}"]`)) ghost(k);
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
  const h = e.target.closest('[style*="overflow-x:auto"], .picker');
  if (h && !h.classList.contains("picker") && Math.abs(e.deltaY) > Math.abs(e.deltaX) && h.scrollWidth > h.clientWidth) { h.scrollLeft += e.deltaY; e.preventDefault(); }
}, { passive: false });
$("list").addEventListener("keydown", e => {
  const row = e.target.closest("[data-row]"); if (!row || e.target !== row) return;
  if (e.key === "Enter") { select(row.dataset.row, "list"); e.preventDefault(); }
  if (e.key === " ") { toggle(row.dataset.row); e.preventDefault(); }
});
$("list").addEventListener("click", e => {
  const go = e.target.closest("[data-goto]");
  if (go) {
    const k = go.dataset.goto; const target = blockerOf(k); if (!target) return;
    returnTo = { key: k }; goToSetting(target);
    snack(PREF[target].type === "boolean" ? `Switch <b>${esc(title(target))}</b> by holding it, and you'll be brought back` : `Change <b>${esc(title(target))}</b>, and you'll be brought back`);
    return;
  }
  const rp = e.target.closest("[data-replay]");
  const sw = e.target.closest("[data-sw]");
  if (sw) { const k = sw.dataset.sw; select(k); toggle(k); return; }
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
$("pickScrim").onclick = () => setPicker(false);
$("pickGrid").addEventListener("click", e => { const b = e.target.closest("[data-sec]"); if (!b) return; setPicker(false); returnTo = null; switchSection(b.dataset.sec); });
document.addEventListener("keydown", e => { if (e.key === "Escape") { setPicker(false); closeDialog(); } });
function setMode(m) {
  mode = m;
  $("btnOrig").setAttribute("aria-pressed", String(m === "orig")); $("btnMod").setAttribute("aria-pressed", String(m === "mod"));
  $("hint").textContent = m === "orig" ? "Stock YouTube, read-only" : "Tap to select · hold to switch";
  commit(); if (selected) select(selected);
}
$("btnOrig").onclick = () => setMode("orig");
$("btnMod").onclick = () => setMode("mod");

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
  for (const p of CAT.preferences) { PREF[p.key] = p; defaults[p.key] = initialValue(p); }
  Object.assign(state, defaults);
  const saved = store.load();
  if (saved.state) for (const k in saved.state) if (k in PREF) state[k] = saved.state[k];
  baseline = { ...state };
  try { const b = JSON.parse(localStorage.getItem(LS + "-baseline") || "null"); if (b) for (const k in b) if (k in PREF) baseline[k] = b[k]; } catch { /* storage unavailable */ }
  if (saved.section && SECTIONS.some(s => s.id === saved.section)) section = saved.section;
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
  renderAll();
  if (window.innerWidth > 860) applyDevice(); else $("devBtns").innerHTML = "";
  tick(); setInterval(tick, 30000);
  let seen = false; try { seen = localStorage.getItem(LS + "-tutorial") === "1"; } catch { /* storage unavailable */ }
  if (!seen) runTutorial();
}
store.save = function () { try { localStorage.setItem(LS, JSON.stringify({ state: changedOnly(), section, slots: showSlots, device: device_, yt: ytVersion })); localStorage.setItem(LS + "-baseline", JSON.stringify(baseline)); } catch { /* storage unavailable */ } };
boot();
})();
