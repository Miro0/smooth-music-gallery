import {useEffect, useRef, useState} from "@wordpress/element";

const WaveLine = (
  {
    accent = "#ffffff",
    opacity = 0.5,
    intensity = 1,
    position = 0,
    line_height = 4
  }
) => {
  const containerRef = useRef(null);
  const animRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const container = containerRef.current;
    if (!container) return;


    cancelAnimationFrame(animRef.current);
    const oldCanvas = container.querySelector("canvas");
    if (oldCanvas) oldCanvas.remove();

    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.pointerEvents = "none";
    canvas.style.opacity = opacity;
    canvas.style.zIndex = 50;

    container.appendChild(canvas);

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
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      cssW = rect.width;
      cssH = rect.height;

      canvas.width = cssW * dpr;
      canvas.height = cssH * dpr;
      canvas.style.width = cssW + "px";
      canvas.style.height = cssH + "px";

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (window.OffscreenCanvas) {
        off = new OffscreenCanvas(cssW * dpr, cssH * dpr);
        octx = off.getContext("2d");
        octx.setTransform(dpr, 0, 0, dpr, 0, 0);
      } else {
        off = null;
        octx = null;
      }

      segments = Math.max(4, Math.floor(cssW / 4));
      segmentWidth = cssW / segments;

      baseY = (cssH * 0.25) + (cssH * position / 200);

      gradient = makeGradient(octx || ctx);
    }

    resize();
    window.addEventListener("resize", resize);

    // FAKE AUDIO
    const fakeAmp = (time) =>
      (Math.sin(time / 500) * 0.5 + 0.5) * (35 * intensity);

    function drawFrame(time) {
      if (!cssW || !cssH) return;

      const targetCtx = octx || ctx;
      targetCtx.clearRect(0, 0, cssW, cssH);

      const amp = fakeAmp(time);
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
      drawFrame(time);
      animRef.current = requestAnimationFrame(loop);
    }

    animRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      if (canvas) canvas.remove();
    };
  }, [accent, opacity, intensity, position, line_height, mounted]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    />
  );
};

export default WaveLine;
