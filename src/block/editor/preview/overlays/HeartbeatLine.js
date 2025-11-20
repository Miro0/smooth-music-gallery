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
  const animRef = useRef(null);
  const historyRef = useRef([]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const container = containerRef.current;
      if (!container) return;

      let canvas = canvasRef.current;
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvasRef.current = canvas;
        canvas.style.position = 'absolute';
        canvas.style.inset = '0';
        canvas.style.pointerEvents = 'none';
        canvas.style.opacity = opacity;
        container.appendChild(canvas);
      }

      const ctx2 = canvas.getContext('2d');

      const width = () => canvas.width;
      const height = () => canvas.height;

      function resize() {
        const rect = container.getBoundingClientRect();
        const newW = Math.floor(rect.width);
        const oldHist = historyRef.current;
        const oldW = oldHist.length;

        canvas.width = newW;
        canvas.height = rect.height;

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

      let shiftAccumulator = 0;

      const baseOffsetY = () =>
        height() / 2 + (position / 50) * (height() / 2);

      let t = 0;

      function draw() {
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
          const W = width();
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

        ctx2.clearRect(0, 0, width(), height());
        const baseY = baseOffsetY();

        ctx2.lineWidth = line_height;
        ctx2.strokeStyle = accent;
        ctx2.shadowBlur = 0;
        ctx2.lineCap = 'round';
        ctx2.lineJoin = 'round';

        ctx2.beginPath();
        for (let x = 0; x < historyRef.current.length; x++) {
          const y = baseY - historyRef.current[x];
          if (x === 0) ctx2.moveTo(x, y);
          else ctx2.lineTo(x, y);
        }
        ctx2.stroke();

        ctx2.lineWidth = line_height;
        ctx2.strokeStyle = accent;
        ctx2.shadowColor = accent;
        ctx2.shadowBlur = line_height * 0.8;

        ctx2.beginPath();
        for (let x = 0; x < historyRef.current.length; x++) {
          const y = baseY - historyRef.current[x];
          if (x === 0) ctx2.moveTo(x, y);
          else ctx2.lineTo(x, y);
        }
        ctx2.stroke();

        ctx2.lineWidth = line_height;
        ctx2.strokeStyle = accent + "99";
        ctx2.shadowBlur = line_height * 2;
        ctx2.shadowColor = accent;

        ctx2.beginPath();
        for (let x = 0; x < historyRef.current.length; x++) {
          const y = baseY - historyRef.current[x];
          if (x === 0) ctx2.moveTo(x, y);
          else ctx2.lineTo(x, y);
        }
        ctx2.stroke();

        animRef.current = requestAnimationFrame(draw);
      }

      draw();

      return () => {
        cancelAnimationFrame(animRef.current);
        if (canvasRef.current) {
          canvasRef.current.remove();
          canvasRef.current = null;
        }
      };
    }
  }, [accent, opacity, intensity, position, line_height, speed, smoothness, mounted]);

  return (
    <div
      ref={containerRef}
      style={{
        opacity,
        height: `100%`,
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        pointerEvents: 'none',
        zIndex: 50,
      }}
    />
  );
};

export default HeartbeatLine;
