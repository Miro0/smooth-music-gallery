import {useEffect, useRef, useState} from "@wordpress/element";

const HeartbeatLine = (
  {
    accent = '#ffffff',
    opacity = 0.95,
    intensity = 1,
    position = 0,
    line_height = 3,
    speed = 0.5,
    smoothness = 0.25,
  }
) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const offscreenRef = useRef(null);
  const animRef = useRef(null);
  const historyRef = useRef([]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;

    const container = containerRef.current;
    if (!container) return;

    let canvas = canvasRef.current;

    if (!canvas) {
      canvas = document.createElement("canvas");
      canvasRef.current = canvas;
      canvas.style.position = "absolute";
      canvas.style.inset = "0";
      canvas.style.pointerEvents = "none";
      canvas.style.opacity = opacity;
      container.appendChild(canvas);
    }

    const ctx2 = canvas.getContext("2d");

    const width = () => canvas.width;
    const height = () => canvas.height;

    function setupOffscreen(w, h) {
      if (window.OffscreenCanvas) {
        offscreenRef.current = new OffscreenCanvas(w, h);
      } else {
        const tmp = document.createElement("canvas");
        tmp.width = w;
        tmp.height = h;
        offscreenRef.current = tmp;
      }
    }

    function resize() {
      const rect = container.getBoundingClientRect();
      const newW = Math.floor(rect.width);
      const newH = Math.floor(rect.height);

      const oldHist = historyRef.current;
      const oldW = oldHist.length;

      canvas.width = newW;
      canvas.height = newH;

      setupOffscreen(newW, newH);

      if (oldW === 0) {
        historyRef.current = new Array(newW).fill(0);
        return;
      }

      const newHist = new Array(newW);
      for (let x = 0; x < newW; x++) {
        const t = x / (newW - 1);
        const idx = t * (oldW - 1);
        const i0 = Math.floor(idx);
        const i1 = Math.min(oldW - 1, i0 + 1);
        const frac = idx - i0;
        newHist[x] = oldHist[i0] * (1 - frac) + oldHist[i1] * frac;
      }

      historyRef.current = newHist;
    }

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("fullscreenchange", resize);

    let shiftAccumulator = 0;
    let t = 0;

    function draw() {
      const off = offscreenRef.current;
      const octx = off.getContext("2d");

      const W = width();
      const H = height();

      const simulatedAmp =
        Math.abs(Math.sin(t * 0.04)) * 100 * intensity;
      t += 1;

      const lastAmp = historyRef.current[historyRef.current.length - 1] ?? 0;
      const smoothedAmp =
        lastAmp + (simulatedAmp - lastAmp) * smoothness;

      shiftAccumulator += speed;
      const shift = Math.floor(shiftAccumulator);
      shiftAccumulator -= shift;

      if (shift > 0) {
        const newHist = new Array(W);

        for (let x = 0; x < W - shift; x++) {
          newHist[x] = historyRef.current[x + shift];
        }

        const last = historyRef.current[W - 1 - shift] ?? 0;

        for (let x = W - shift; x < W; x++) {
          newHist[x] = last;
        }

        historyRef.current = newHist;
      }

      historyRef.current[historyRef.current.length - 1] = smoothedAmp;

      octx.clearRect(0, 0, W, H);
      const baseY = H / 2 + (position / 50) * (H / 2);

      function drawLine(color, shadowBlur, shadowColor) {
        octx.lineWidth = line_height;
        octx.lineCap = "round";
        octx.lineJoin = "round";
        octx.strokeStyle = color;
        octx.shadowBlur = shadowBlur;
        octx.shadowColor = shadowColor;

        octx.beginPath();
        for (let x = 0; x < historyRef.current.length; x++) {
          const y = baseY - historyRef.current[x];
          if (x === 0) octx.moveTo(x, y);
          else octx.lineTo(x, y);
        }
        octx.stroke();
      }

      drawLine(accent, 0, "transparent");
      drawLine(accent, line_height * 0.8, accent);
      drawLine(accent + "99", line_height * 2, accent);

      ctx2.clearRect(0, 0, W, H);
      ctx2.drawImage(off, 0, 0);

      animRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      document.removeEventListener("fullscreenchange", resize);

      if (canvasRef.current) {
        canvasRef.current.remove();
        canvasRef.current = null;
      }
    };
  }, [
    mounted,
    accent,
    opacity,
    intensity,
    position,
    line_height,
    speed,
    smoothness
  ]);

  return (
    <div
      ref={containerRef}
      style={{
        opacity,
        height: "100%",
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 50,
      }}
    />
  );
};

export default HeartbeatLine;
