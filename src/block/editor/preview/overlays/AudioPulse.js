import {useEffect, useRef, useState} from "@wordpress/element";

const AudioPulse = (
  {
    accent = '#ffffff',
    opacity = 0.5,
    intensity = 1,
    density = 0.2,
    speed = 0.2,
    size = 8
  }
) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const offscreenRef = useRef(null);
  const animRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;

    const container = containerRef.current;
    if (!container) return;

    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvasRef.current = canvas;
      canvas.style.position = "absolute";
      canvas.style.inset = 0;
      canvas.style.pointerEvents = "none";
      canvas.style.opacity = opacity;
      container.appendChild(canvas);
    }
    const ctx2 = canvas.getContext("2d");

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

    let width = 0;
    let height = 0;
    let dots = [];

    function initDots() {
      const count = Math.floor((width * density) / 10);
      dots = [];

      for (let i = 0; i < count; i++) {
        dots.push({
          px: Math.random() * width,
          py: Math.random() * height,
          size: size + Math.random() * 16,
          bandStart: Math.floor(Math.random() * 100),
          bandWidth: 10 + Math.random() * 20,
          strength: 0.4 + Math.random() * intensity,
          vx: (Math.random() * 0.2 - 0.1) * (10 * speed),
          vy: (Math.random() * 0.2 - 0.1) * (10 * speed)
        });
      }
    }

    function resize() {
      const rect = container.getBoundingClientRect();
      width = Math.floor(rect.width);
      height = Math.floor(rect.height);

      canvas.width = width;
      canvas.height = height;

      setupOffscreen(width, height);
      initDots();
    }

    resize();
    window.addEventListener("resize", resize);

    function animate(ts) {
      const off = offscreenRef.current;
      const octx = off.getContext("2d");
      octx.clearRect(0, 0, width, height);

      const wobbleBase = Math.sin(ts / 300);

      for (let i = 0; i < dots.length; i++) {
        const s = dots[i];

        s.px += s.vx;
        s.py += s.vy;

        if (s.px < 0) {
          s.px = 0;
          s.vx *= -1;
        }
        if (s.px > width) {
          s.px = width;
          s.vx *= -1;
        }
        if (s.py < 0) {
          s.py = 0;
          s.vy *= -1;
        }
        if (s.py > height) {
          s.py = height;
          s.vy *= -1;
        }

        const pulse = (Math.sin((ts / 200) + i) * 0.5 + 0.5) * s.strength;
        const wobble = wobbleBase * (0.3 * intensity);
        const scale = 1 + pulse + wobble;
        const finalScale = Math.max(0.5, Math.min(scale, 2.5));

        const outerRadius = (s.size * finalScale) / 2;

        const innerGap = s.size >= 14 ? s.size / 3 : 5;
        const innerRadius = Math.max(
          0,
          (s.size * finalScale - innerGap) / 2
        );

        const alpha = Math.max(0.1, Math.min(1, 0.7 + pulse));

        octx.save();
        octx.globalAlpha = alpha;
        octx.translate(s.px, s.py);

        octx.strokeStyle = accent;
        octx.lineWidth = s.size / 4;
        octx.beginPath();
        octx.arc(0, 0, outerRadius, 0, Math.PI * 2);
        octx.stroke();

        octx.strokeStyle = accent;
        octx.lineWidth = s.size >= 14 ? 2 : 1;
        octx.beginPath();
        octx.arc(0, 0, innerRadius, 0, Math.PI * 2);
        octx.stroke();

        octx.restore();
      }

      ctx2.clearRect(0, 0, width, height);
      ctx2.drawImage(off, 0, 0);

      animRef.current = requestAnimationFrame(animate);
    }

    animRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);

      if (canvasRef.current) {
        canvasRef.current.remove();
        canvasRef.current = null;
      }
    };
  }, [accent, opacity, intensity, density, speed, size, mounted]);

  return (
    <div
      ref={containerRef}
      style={{
        opacity,
        height: "100%",
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        pointerEvents: "none",
        zIndex: 50,
        overflow: "hidden",
      }}
    ></div>
  );
};

export default AudioPulse;
