function hash(str) {
  let h = 0, i = 0, len = str.length;
  while (i < len) h = (h << 5) - h + str.charCodeAt(i++) | 0;
  return "h" + Math.abs(h).toString(36);
}

function injectHashedStyle(id, cssText) {
  if (document.getElementById(id)) return;

  const style = document.createElement("style");
  style.id = id;

  const minified = cssText
    .replace(/\s+/g, " ")
    .replace(/\n/g, "")
    .trim();

  style.textContent = minified;
  document.head.appendChild(style);
}

export function createAnimationStyle(name, cssBuilder) {
  const className = `wpmg-${name}-${hash(name + Math.random())}`;

  const css = cssBuilder(className);
  injectHashedStyle(`style-${className}`, css);

  return className;
}

export function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return { r, g, b };
}

