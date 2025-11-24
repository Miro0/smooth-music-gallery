import {useEffect, useRef, useState} from "@wordpress/element";

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
  const particlesRef = useRef([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;

    function resize() {
      const rect = parent.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      if (!w || !h) {
        requestAnimationFrame(resize);
        return;
      }
      canvas.width = w;
      canvas.height = h;
    }

    resize();
    window.addEventListener("resize", resize);

    function makeTexture(size) {
      const texSize = size * 4;
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

      return off;
    }

    const rect = parent.getBoundingClientRect();
    const count = Math.floor(240 * density);

    const particles = new Array(count).fill(0).map(() => {
      const size = min_size + Math.random() * (max_size - min_size);
      return {
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        size,
        tex: makeTexture(size),
        driftX: (Math.random() - 0.5) * 0.15,
        driftY: (Math.random() - 0.5) * 0.15,
      };
    });

    particlesRef.current = particles;

    const third = Math.max(1, Math.floor(count / 3));
    const lowP = particles.slice(0, third);
    const midP = particles.slice(third, third * 2);
    const highP = particles.slice(third * 2);

    let t = 0;

    function drawGroup(arr, v, scaleMul, baseOpacity, gainOpacity) {
      const W = canvas.width;
      const H = canvas.height;

      arr.forEach((p) => {
        p.x += p.driftX;
        p.y += p.driftY;

        // wrap
        const m = 50;
        if (p.x < -m) p.x = W + m;
        if (p.x > W + m) p.x = -m;
        if (p.y < -m) p.y = H + m;
        if (p.y > H + m) p.y = -m;

        const scale = 1 + scaleMul * v;
        const s = p.size * scale;

        const alpha = Math.max(
          0,
          Math.min(1, baseOpacity + v * gainOpacity)
        );

        ctx.globalAlpha = alpha;
        ctx.drawImage(p.tex, p.x - s / 2, p.y - s / 2, s, s);
      });
    }

    function animate() {
      const pts = particlesRef.current;
      if (!pts || !canvas.width || !canvas.height) {
        animRef.current = requestAnimationFrame(animate);
        return;
      }

      t += 0.02;

      const low = (Math.sin(t * 1.2) + 1) / 2;
      const mid = (Math.sin(t * 2.0 + 1) + 1) / 2;
      const high = (Math.sin(t * 3.3 + 2) + 1) / 2;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawGroup(lowP, low, 1.3, 0.3, 0.7);
      drawGroup(midP, mid, 0.8, 0.25, 0.6);
      drawGroup(highP, high, 0.4, 0.2, 0.4);

      animRef.current = requestAnimationFrame(animate);
    }

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [accent, opacity, density, min_size, max_size, mounted]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity,
      }}
    />
  );
};

export default DustParticles;
