import { initAudioSource } from "../block/utils/audio";

document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll(".smoothmg-gallery")
    .forEach((gallery, index) => attachOverlayAnimation(gallery, index));
});

const attachOverlayAnimation = (container, index) => {

  if (!window?.mg) window.mg = [];

  if (!window.mg[index]) {
    window.mg[index] = { initOverlay: attachOverlayAnimation, source: null };
    return;
  }

  const props = JSON.parse(container.dataset.props || "{}");
  const { overlay, overlay_options = {} } = props;

  const {
    accent = "#ffffff",
    opacity = 0.95,
    intensity = 1,
    position = 0,
    line_height = 3,
    speed = 0.5,
    smoothness = 0.5,
  } = overlay_options;

  if (overlay !== "heartbeat_line") return;

  const audio = container.querySelector(".smoothmg-audio");
  const overlayLayer = container.querySelector(".smoothmg-overlay-layer");
  if (!overlayLayer || !audio) return;

  let isVisible = true;
  const observer = new IntersectionObserver(
    (entries) => {
      isVisible = entries[0]?.isIntersecting ?? true;
    },
    { threshold: 0 }
  );
  observer.observe(container);

  const canvas = document.createElement("canvas");
  canvas.style.position = "absolute";
  canvas.style.inset = "0";
  canvas.style.pointerEvents = "none";
  canvas.style.opacity = opacity;
  overlayLayer.appendChild(canvas);

  const ctx2 = canvas.getContext("2d");

  let off = null;
  let octx = null;

  function setupOffscreen(width, height) {
    if (window.OffscreenCanvas) {
      off = new OffscreenCanvas(width, height);
      octx = off.getContext("2d", { alpha: true });
      octx.imageSmoothingEnabled = true;
    } else {
      off = null;
      octx = null;
    }
  }

  const width = () => canvas.width;
  const height = () => canvas.height;
  const baseOffsetY = () =>
    height() / 2 + (position / 50) * (height() / 2);

  let history = [];
  let shiftAccumulator = 0;
  let started = false;

  function resize() {
    const rect = overlayLayer.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    setupOffscreen(rect.width, rect.height);

    history = new Array(canvas.width).fill(0);
  }

  resize();
  window.addEventListener("resize", resize);
  document.addEventListener("fullscreenchange", resize);

  const [analyser, audioCtx, data] = initAudioSource(audio, index);

  function animate() {
    if (!isVisible) {
      requestAnimationFrame(animate);
      return;
    }

    let currentAmp = 0;

    if (!audio.paused) {
      analyser.getByteFrequencyData(data);

      let sum = 0, count = 0;
      for (let i = 10; i < 50 && i < data.length; i++) {
        sum += data[i];
        count++;
      }

      const avg = count ? sum / count : 0;
      currentAmp = (avg / 255) * 100 * intensity;
    }

    const lastAmp = history[history.length - 1] ?? 0;
    const smoothedAmp =
      lastAmp + (currentAmp - lastAmp) * smoothness;

    shiftAccumulator += speed;
    const shift = Math.floor(shiftAccumulator);
    shiftAccumulator -= shift;

    if (shift > 0) {
      const W = width();
      const newHist = new Array(W);

      for (let x = 0; x < W - shift; x++) {
        newHist[x] = history[x + shift];
      }

      const last = history[W - 1 - shift] ?? 0;

      for (let x = W - shift; x < W; x++) {
        newHist[x] = last;
      }

      history = newHist;
    }

    history[history.length - 1] = smoothedAmp;

    const targetCtx = octx || ctx2;
    targetCtx.clearRect(0, 0, width(), height());

    const baseY = baseOffsetY();

    function drawLine(color, shadowBlur, shadowColor) {
      targetCtx.lineWidth = line_height;
      targetCtx.lineCap = "round";
      targetCtx.lineJoin = "round";
      targetCtx.strokeStyle = color;
      targetCtx.shadowBlur = shadowBlur;
      targetCtx.shadowColor = shadowColor;

      targetCtx.beginPath();
      for (let x = 0; x < history.length; x++) {
        const y = baseY - history[x];
        if (x === 0) targetCtx.moveTo(x, y);
        else targetCtx.lineTo(x, y);
      }
      targetCtx.stroke();
    }

    drawLine(accent, 0, "transparent");
    drawLine(accent, line_height * 0.8, accent);
    drawLine(accent + "99", line_height * 2, accent);

    if (off && octx) {
      ctx2.clearRect(0, 0, width(), height());
      ctx2.drawImage(off, 0, 0);
    }

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);

  audio.addEventListener("play", () => {
    if (!started) {
      started = true;
      audioCtx.resume();
    }
  });
};
