import { initAudioSource } from "../../block/utils/audio";

document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll(".wpmg-gallery")
    .forEach((gallery, index) => attachOverlayAnimation(gallery, index));
});

const attachOverlayAnimation = (container, index) => {
  if (!window?.wpmg) window.wpmg = [];

  if (!window.wpmg[index]) {
    window.wpmg[index] = { initOverlay: attachOverlayAnimation, source: null };
    return;
  } else if (!window.wpmg[index]?.initialized) {
    window.wpmg[index].initOverlay = attachOverlayAnimation;
    return;
  }

  const props = JSON.parse(container.dataset.props || "{}");
  const { overlay, overlay_options = {} } = props;
  const {
    accent = "#ffffff",
    opacity = 0.5,
    intensity = 1,
    position = 0,
    line_height = 4,
  } = overlay_options;

  if (overlay !== "free/wave_line") return;

  const audio = container.querySelector(".wpmg-audio");
  const overlayLayer = container.querySelector(".wpmg-overlay-layer");
  if (!overlayLayer || !audio) return;

  const canvas = document.createElement("canvas");
  canvas.style.position = "absolute";
  canvas.style.inset = "0";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "50";
  canvas.style.opacity = opacity;
  overlayLayer.appendChild(canvas);

  const ctx = canvas.getContext("2d");

  let off = null;
  let octx = null;

  let cssW = 0;
  let cssH = 0;
  let segments = 0;
  let segmentWidth = 0;
  let baseY = 0;
  let gradient = null;

  const dpr = window.devicePixelRatio || 1;

  const makeGradient = (context) => {
    const g = context.createLinearGradient(0, 0, 0, line_height);
    g.addColorStop(0.0, accent + "55");
    g.addColorStop(0.1, accent);
    g.addColorStop(0.9, accent);
    g.addColorStop(1.0, accent + "55");
    return g;
  };

  function resize() {
    const rect = overlayLayer.getBoundingClientRect();
    cssW = rect.width;
    cssH = rect.height;

    if (!cssW || !cssH) return;

    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    canvas.style.width = cssW + "px";
    canvas.style.height = cssH + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (window.OffscreenCanvas) {
      off = new OffscreenCanvas(cssW * dpr, cssH * dpr);
      octx = off.getContext("2d");
      octx.setTransform(dpr, 0, 0, dpr, 0, 0);
      octx.imageSmoothingEnabled = true;
    } else {
      off = null;
      octx = null;
    }

    segments = Math.max(4, Math.floor(cssW / 4));
    segmentWidth = cssW / segments;

    baseY = (cssH * 0.25) + (cssH * position / 200);

    const targetCtx = octx || ctx;
    gradient = makeGradient(targetCtx);
  }

  resize();
  window.addEventListener("resize", resize);
  document.addEventListener("fullscreenchange", resize);

  const [analyser, audioCtx, data] = initAudioSource(audio, index);

  let animFrame = null;
  let isVisible = true;

  const observer = new IntersectionObserver(
    (entries) => {
      isVisible = entries[0]?.isIntersecting ?? true;
    },
    { threshold: 0.1 }
  );
  observer.observe(container);

  function drawFrame(time) {
    if (!cssW || !cssH) return;

    const targetCtx = octx || ctx;

    targetCtx.clearRect(0, 0, cssW, cssH);

    analyser.getByteFrequencyData(data);

    let sum = 0;
    let count = 0;
    for (let i = 10; i < 50 && i < data.length; i++) {
      sum += data[i];
      count++;
    }
    const avg = count ? sum / count : 0;

    const amp = (avg / 255) * 35 * intensity;
    const t = time / 600;

    for (let i = 0; i < segments; i++) {
      const xNorm = i / segments;
      const wave = Math.sin((xNorm + t) * Math.PI * 2);
      const y = baseY + wave * amp;

      const x = i * segmentWidth;

      targetCtx.save();
      targetCtx.translate(x, y - line_height / 2);

      targetCtx.fillStyle = gradient;

      targetCtx.shadowColor = accent + "66";
      targetCtx.shadowBlur = 14;
      targetCtx.fillRect(0, 0, segmentWidth, line_height);

      targetCtx.shadowColor = accent;
      targetCtx.shadowBlur = 6;
      targetCtx.fillRect(0, 0, segmentWidth, line_height);

      targetCtx.restore();
    }

    if (off && octx) {
      ctx.clearRect(0, 0, cssW, cssH);
      ctx.drawImage(off, 0, 0);
    }
  }

  function loop(time) {
    if (isVisible) {
      drawFrame(time);
    }
    animFrame = requestAnimationFrame(loop);
  }

  animFrame = requestAnimationFrame(loop);

  return () => {
    observer.disconnect();
    cancelAnimationFrame(animFrame);
    animFrame = null;
    window.removeEventListener("resize", resize);
    document.removeEventListener("fullscreenchange", resize);
    canvas.remove();
  };
};
