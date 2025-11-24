import {useEffect, useRef, useState} from "@wordpress/element";

const OrbitalPulse = (
  {
    accent = "#ffffff",
    opacity = 0.5,
    density = 0.5,
    radius = 90,
    size = 8,
    speed = 0.2,
  }
) => {
  const containerRef = useRef(null);
  const animRef = useRef(null);
  const canvasRef = useRef(null);
  const offscreenRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;

    const container = containerRef.current;
    if (!container) return;

    cancelAnimationFrame(animRef.current);
    if (canvasRef.current) {
      canvasRef.current.remove();
      canvasRef.current = null;
    }

    let canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.inset = 0;
    canvas.style.pointerEvents = "none";
    canvas.style.opacity = opacity;
    container.appendChild(canvas);
    canvasRef.current = canvas;

    const ctx2 = canvas.getContext("2d");

    function createOffscreen(w, h) {
      let off;
      if (window.OffscreenCanvas) {
        off = new OffscreenCanvas(w, h);
      } else {
        off = document.createElement("canvas");
        off.width = w;
        off.height = h;
      }
      offscreenRef.current = off;
    }

    let width = 0;
    let height = 0;
    let cx = 0;
    let cy = 0;
    let aspectX = 1;
    let aspectY = 1;
    let baseRadius = 0;

    const particles = [];

    function initParticles(count) {
      particles.length = 0;
      for (let i = 0; i < count; i++) {
        particles.push({
          angle: (i / count) * Math.PI * 2,
        });
      }
    }

    function resizeAndInit() {
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        requestAnimationFrame(resizeAndInit);
        return;
      }

      width = Math.floor(rect.width);
      height = Math.floor(rect.height);

      canvas.width = width;
      canvas.height = height;

      createOffscreen(width, height);

      cx = width / 2;
      cy = height / 2;

      aspectX = width > height ? width / height : 1;
      aspectY = height > width ? height / width : 1;

      baseRadius = (Math.min(width, height) / 2) * (radius / 100);

      const count = Math.floor(240 * density);
      initParticles(count);

      startAnimation();
    }

    requestAnimationFrame(resizeAndInit);

    function startAnimation() {
      const off = offscreenRef.current;
      const octx = off.getContext("2d");

      const half = size / 2;
      const spd = Math.max(0, Math.min(1, speed));

      function frameLoop() {
        octx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
          const s = particles[i];

          s.angle += 0.002 * spd;

          const x = cx + Math.cos(s.angle) * (baseRadius * aspectX);
          const y = cy + Math.sin(s.angle) * (baseRadius * aspectY);

          octx.save();
          octx.globalAlpha = 1;
          octx.fillStyle = accent;
          octx.shadowColor = accent;
          octx.shadowBlur = 6;

          octx.beginPath();
          octx.arc(x, y, half, 0, Math.PI * 2);
          octx.fill();
          octx.restore();
        }

        ctx2.clearRect(0, 0, width, height);
        ctx2.drawImage(off, 0, 0);

        animRef.current = requestAnimationFrame(frameLoop);
      }

      animRef.current = requestAnimationFrame(frameLoop);
    }

    return () => {
      cancelAnimationFrame(animRef.current);
      if (canvasRef.current) {
        canvasRef.current.remove();
        canvasRef.current = null;
      }
    };
  }, [accent, opacity, density, radius, size, speed, mounted]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        opacity,
      }}
    ></div>
  );
};

export default OrbitalPulse;
