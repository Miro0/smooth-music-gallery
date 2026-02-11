import { initAudioSource } from "../block/utils/audio";

document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll(".wpmg-gallery")
    .forEach((gallery, index) => attachOverlayAnimation(gallery, index));
});

const attachOverlayAnimation = (container, index) => {
  if (!window?.wpmg) {
    window.wpmg = [];
  }

  if (!window?.wpmg[index]) {
    window.wpmg[index] = { initOverlay: attachOverlayAnimation, source: null };
  } else if (!window?.wpmg[index]?.initialized) {
    window.wpmg[index].initOverlay = attachOverlayAnimation;
  } else {
    const props = JSON.parse(container.dataset.props || "{}");
    const { overlay, overlay_options = {} } = props;

    const {
      accent = "#ffffff",
      opacity = 0.5,
      intensity = 1,
      density = 0.2,
      speed = 0.2,
      size = 8
    } = overlay_options;

    if (overlay !== "pro/audio_pulse") return;

    const audio = container.querySelector(".wpmg-audio");
    const overlayLayer = container.querySelector(".wpmg-overlay-layer");
    if (!overlayLayer || !audio) return;

    let isVisible = true;
    const io = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0 }
    );
    io.observe(container);

    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.pointerEvents = "none";
    canvas.style.opacity = opacity;
    canvas.style.zIndex = "50";
    overlayLayer.innerHTML = "";
    overlayLayer.appendChild(canvas);

    const ctx2 = canvas.getContext("2d");

    let off = null;
    let octx = null;

    function setupOffscreen(w, h) {
      if (window.OffscreenCanvas) {
        off = new OffscreenCanvas(w, h);
        octx = off.getContext("2d", { alpha: true });
        octx.imageSmoothingEnabled = true;
      } else {
        off = null;
        octx = null;
      }
    }

    const width = () => canvas.width;
    const height = () => canvas.height;

    let dots = [];

    function initDots() {
      const w = width();
      const h = height();
      dots = [];

      const count = Math.max(
        3,
        Math.floor((w * density) / 5)
      );

      for (let i = 0; i < count; i++) {
        const baseSize = size + Math.random() * 16;
        const bandStart = Math.floor(Math.random() * 100);
        const bandWidth = 10 + Math.random() * 20;

        dots.push({
          x: Math.random() * w,
          y: Math.random() * h,
          baseSize,
          bandStart,
          bandWidth,
          strength: 0.4 + Math.random() * intensity,
          vx: (Math.random() * 0.2 - 0.1) * (10 * speed),
          vy: (Math.random() * 0.2 - 0.1) * (10 * speed)
        });
      }
    }

    function resize() {
      const rect = overlayLayer.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      setupOffscreen(rect.width, rect.height);
      initDots();
    }

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("fullscreenchange", resize);

    const [analyser, audioCtx, data] = initAudioSource(audio, index);

    let animFrame;

    function animate() {
      if (!isVisible) {
        animFrame = requestAnimationFrame(animate);
        return;
      }

      analyser.getByteFrequencyData(data);

      const now = performance.now();
      const targetCtx = octx || ctx2;
      const w = width();
      const h = height();

      targetCtx.clearRect(0, 0, w, h);

      for (let i = 0; i < dots.length; i++) {
        const s = dots[i];

        s.x += s.vx;
        s.y += s.vy;

        if (s.x < 0) {
          s.x = 0;
          s.vx *= -1;
        }
        if (s.x > w) {
          s.x = w;
          s.vx *= -1;
        }
        if (s.y < 0) {
          s.y = 0;
          s.vy *= -1;
        }
        if (s.y > h) {
          s.y = h;
          s.vy *= -1;
        }

        let sum = 0;
        let count = 0;
        const bandEnd = Math.min(s.bandStart + s.bandWidth, data.length);

        for (let j = s.bandStart; j < bandEnd; j++) {
          sum += data[j];
          count++;
        }

        const avg = count ? sum / count : 0;
        const pulse = (avg / 255) * s.strength;
        const wobble = Math.sin(now / 300 + i) * (0.3 * intensity);
        const scale = 1 + pulse + wobble;

        const finalScale = Math.max(0.5, Math.min(scale, 2.5));
        const baseSize = s.baseSize;
        const outerRadius = (baseSize * finalScale) / 2;

        const innerGap = baseSize >= 14 ? baseSize / 3 : 5;
        const innerRadius = Math.max(
          0,
          (baseSize * finalScale - innerGap) / 2
        );

        let alpha = 0.7 + pulse;
        alpha = Math.max(0.1, Math.min(alpha, 1));

        targetCtx.save();
        targetCtx.translate(s.x, s.y);
        targetCtx.globalAlpha = alpha;

        targetCtx.strokeStyle = accent;
        targetCtx.lineWidth = baseSize / 4;
        targetCtx.beginPath();
        targetCtx.arc(0, 0, outerRadius, 0, Math.PI * 2);
        targetCtx.stroke();

        targetCtx.beginPath();
        targetCtx.lineWidth = baseSize >= 14 ? 2 : 1;
        targetCtx.strokeStyle = accent;
        targetCtx.arc(0, 0, innerRadius, 0, Math.PI * 2);
        targetCtx.stroke();

        targetCtx.restore();
      }

      if (off && octx) {
        ctx2.clearRect(0, 0, w, h);
        ctx2.drawImage(off, 0, 0);
      }

      animFrame = requestAnimationFrame(animate);
    }

    animFrame = requestAnimationFrame(animate);

    audio.addEventListener("play", () => {
      audioCtx.resume();
    });

    return () => {
      cancelAnimationFrame(animFrame);
      io.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("fullscreenchange", resize);
    };
  }
};
