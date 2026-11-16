// Tiny helpers for reading URL parameters such as ?debug=1 or ?input=gaze.

const params = new URLSearchParams(window.location.search);

/** Value of ?name=..., or the fallback when the parameter is missing. */
export function param(name, fallback = null) {
  return params.has(name) ? params.get(name) : fallback;
}

/**
 * Are the debug helpers (grid, axes, position labels, event log) on?
 * ?debug=1 or ?debug=0 wins. Otherwise each page decides with <body data-debug="on|off">.
 */
export function isDebug() {
  const fromUrl = param('debug');
  if (fromUrl !== null) return fromUrl !== '0';
  return document.body.dataset.debug === 'on';
}

/** URL of the bundled MSDF font (works in dev, in dist/ and under a sub-path). */
export const FONT_URL = new URL('../fonts/Roboto-msdf.json', window.location.href).href;

/** Settings every text entity needs: our local font, and `negate: false` for this font's atlas. */
export const TEXT_BASE = { font: FONT_URL, negate: false };
