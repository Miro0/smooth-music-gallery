import {useEffect, useRef, useState} from "@wordpress/element";
import {isMobileViewport} from "../../../utils/performance";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const DustParticles = (
  {
    accent = "#ffffff",
    opacity = 0.5,
    density = 0.5,
    min_size = 8,
    max_size = 16,
  }
) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const readyRafRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    canvas.style.width = "100%";
    canvas.style.height = "100%";

    const normalizedOpacity = clamp(Number(opacity) || 0.5, 0, 1);
    const normalizedDensity = clamp(Number(density) || 0.5, 0.05, 1);
    const rawMinSize = Number(min_size) || 8;
    const rawMaxSize = Number(max_size) || 16;
    const normalizedMinSize = Math.max(1, Math.min(rawMinSize, rawMaxSize));
    const normalizedMaxSize = Math.max(
      normalizedMinSize,
      Math.max(rawMinSize, rawMaxSize)
    );

    const mobile = isMobileViewport();
    const resolutionScale = mobile ? 0.75 : 1;
    const textureStep = mobile ? 1 : 0.5;
    const frameDuration = 1000 / (mobile ? 20 : 30);
    const baseCount = mobile ? 96 : 220;
    const count = Math.max(8, Math.floor(baseCount * normalizedDensity));

    canvas.style.opacity = normalizedOpacity;

    let particles = [];
    let lowP = [];
    let midP = [];
    let highP = [];
    let textureCache = new Map();
    let lastWidth = 0;
    let lastHeight = 0;
    let lastFrameTime = 0;
    let isVisible = true;
    let t = 0;

    function resize() {
      const rect = parent.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        return false;
      }

      const w = Math.max(1, Math.floor(rect.width * resolutionScale));
      const h = Math.max(1, Math.floor(rect.height * resolutionScale));

      if (lastWidth && lastHeight && particles.length) {
        const scaleX = w / lastWidth;
        const scaleY = h / lastHeight;

        for (let i = 0; i < particles.length; i++) {
          particles[i].x *= scaleX;
          particles[i].y *= scaleY;
        }
      }

      canvas.width = w;
      canvas.height = h;
      lastWidth = w;
      lastHeight = h;
      return true;
    }

    function getTextureForSize(size) {
      const snappedSize = Math.max(
        1,
        Math.round(size / textureStep) * textureStep
      );
      const key = snappedSize.toFixed(2);

      if (textureCache.has(key)) {
        return textureCache.get(key);
      }

      const texSize = Math.max(2, Math.ceil(snappedSize * 4));
      let off, octx;

      if (window.OffscreenCanvas) {
        off = new OffscreenCanvas(texSize, texSize);
        octx = off.getContext("2d");
      } else {
        off = document.createElement("canvas");
        off.width = texSize;
        off.height = texSize;
        octx = off.getContext("2d");
      }

      const r = texSize / 2;

      octx.clearRect(0, 0, texSize, texSize);
      octx.fillStyle = accent;
      octx.shadowColor = accent;
      octx.shadowBlur = r * 0.6;

      octx.beginPath();
      octx.arc(r, r, r * 0.4, 0, Math.PI * 2);
      octx.fill();

      textureCache.set(key, off);
      return off;
    }

    function initParticles() {
      const spawnWidth = canvas.width || 1;
      const spawnHeight = canvas.height || 1;

      particles = new Array(count).fill(0).map(() => {
        const size =
          normalizedMinSize +
          Math.random() * (normalizedMaxSize - normalizedMinSize);
        return {
          x: Math.random() * spawnWidth,
          y: Math.random() * spawnHeight,
          size,
          tex: getTextureForSize(size),
          driftX: (Math.random() - 0.5) * 0.15,
          driftY: (Math.random() - 0.5) * 0.15,
        };
      });

      const third = Math.max(1, Math.floor(count / 3));
      lowP = particles.slice(0, third);
      midP = particles.slice(third, third * 2);
      highP = particles.slice(third * 2);
    }

    function drawGroup(arr, v, scaleMul, baseOpacity, gainOpacity) {
      const W = canvas.width;
      const H = canvas.height;
      if (!W || !H || !arr.length) return;

      const scale = 1 + scaleMul * v;
      const alpha = clamp(baseOpacity + v * gainOpacity, 0, 1);
      const margin = 50 * resolutionScale;
      if (alpha <= 0.01) return;

      ctx.globalAlpha = alpha;

      for (let i = 0; i < arr.length; i++) {
        const p = arr[i];
        p.x += p.driftX;
        p.y += p.driftY;

        if (p.x < -margin) p.x = W + margin;
        if (p.x > W + margin) p.x = -margin;
        if (p.y < -margin) p.y = H + margin;
        if (p.y > H + margin) p.y = -margin;

        const s = p.size * scale;

        ctx.drawImage(p.tex, p.x - s / 2, p.y - s / 2, s, s);
      }
    }

    function renderFrame() {
      t += 0.02;

      const low = (Math.sin(t * 1.2) + 1) / 2;
      const mid = (Math.sin(t * 2.0 + 1) + 1) / 2;
      const high = (Math.sin(t * 3.3 + 2) + 1) / 2;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawGroup(lowP, low, 1.3, 0.3, 0.7);
      drawGroup(midP, mid, 0.8, 0.25, 0.6);
      drawGroup(highP, high, 0.4, 0.2, 0.4);
      ctx.globalAlpha = 1;
    }

    function stop() {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
        animRef.current = null;
      }
      lastFrameTime = 0;
    }

    function frameLoop(timestamp = performance.now()) {
      if (document.hidden || !isVisible) {
        stop();
        return;
      }

      if (!lastFrameTime || timestamp - lastFrameTime >= frameDuration) {
        lastFrameTime = timestamp;
        renderFrame();
      }

      animRef.current = requestAnimationFrame(frameLoop);
    }

    function start() {
      if (animRef.current) return;
      lastFrameTime = 0;
      animRef.current = requestAnimationFrame(frameLoop);
    }

    function syncAnimation() {
      if (document.hidden || !isVisible) {
        stop();
      } else {
        start();
      }
    }

    const visibilityHandler = () => syncAnimation();
    document.addEventListener("visibilitychange", visibilityHandler);

    const observer =
      window.IntersectionObserver &&
      new window.IntersectionObserver(
        (entries) => {
          isVisible = entries[0]?.isIntersecting ?? true;
          syncAnimation();
        },
        {threshold: 0}
      );
    observer?.observe(parent);

    const resizeHandler = () => resize();
    window.addEventListener("resize", resizeHandler);
    const resizeObserver =
      window.ResizeObserver && new window.ResizeObserver(() => resize());
    resizeObserver?.observe(parent);

    const waitForLayout = () => {
      if (!resize()) {
        readyRafRef.current = requestAnimationFrame(waitForLayout);
        return;
      }

      initParticles();
      syncAnimation();
    };
    waitForLayout();

    return () => {
      stop();
      cancelAnimationFrame(readyRafRef.current);
      document.removeEventListener("visibilitychange", visibilityHandler);
      window.removeEventListener("resize", resizeHandler);
      observer?.disconnect();
      resizeObserver?.disconnect();
      particles = [];
      lowP = [];
      midP = [];
      highP = [];
      textureCache.clear();
      textureCache = new Map();
    };
  }, [accent, opacity, density, min_size, max_size, mounted]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity: clamp(Number(opacity) || 0.5, 0, 1),
      }}
    />
  );
};

export default DustParticles;
