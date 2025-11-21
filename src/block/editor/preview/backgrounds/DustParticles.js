import {useEffect, useRef, useState} from "@wordpress/element";

const DustParticles = (
  {
    accent = '#ffffff',
    opacity = 0.5,
    density = 0.5,
    min_size = 8,
    max_size = 16
  }
) => {
  const containerRef = useRef(null);
  const animRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const container = containerRef.current;
    if (!container) return;

    const particles = Array.from(
      container.querySelectorAll('.wpmg-bg--dust-particles__particle')
    );

    particles.forEach(el => {
      el.style.left = Math.random() * 100 + "%";
      el.style.top = Math.random() * 100 + "%";

      const size = min_size + Math.random() * (max_size - min_size);
      el.style.width = size + "px";
      el.style.height = size + "px";

      const blur = 2 + Math.random() * 10;
      const spread = 2 + Math.random() * 10;
      el.style.boxShadow = `0 0 ${blur}px ${spread}px ${accent}`;

      el.style.animationDelay = `-${Math.random() * 12}s`;
    });

    const thirds = Math.floor(particles.length / 3);
    const lowParticles  = particles.slice(0, thirds);
    const midParticles  = particles.slice(thirds, thirds * 2);
    const highParticles = particles.slice(thirds * 2);

    let t = 0;

    const animate = () => {
      t += 0.02;

      const low  = (Math.sin(t * 1.2) + 1) / 2; // 0–1
      const mid  = (Math.sin(t * 2.0 + 1) + 1) / 2;
      const high = (Math.sin(t * 3.3 + 2) + 1) / 2;

      lowParticles.forEach(el => {
        el.style.transform = `scale(${1 + low * 1.3})`;
        el.style.opacity = 0.3 + low * 0.7;
      });

      midParticles.forEach(el => {
        el.style.transform = `scale(${1 + mid * 0.8})`;
        el.style.opacity = 0.25 + mid * 0.6;
      });

      highParticles.forEach(el => {
        el.style.transform = `scale(${1 + high * 0.4})`;
        el.style.opacity = 0.2 + high * 0.4;
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animRef.current);
  }, [mounted, accent, density, min_size, max_size]);

  return (
    <>
      <style>
        {`
        @keyframes dust-float {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(-10px, -20px) scale(1.2); }
          100% { transform: translate(0, 0) scale(1); }
        }
        `}
      </style>

      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
          opacity,
        }}
      >
        {Array.from({length: Math.round(120 * density)}).map((_, i) => (
          <div
            key={i}
            className="wpmg-bg--dust-particles__particle"
            style={{
              position: 'absolute',
              borderRadius: '50%',
              background: accent,
              animation: 'dust-float 12s infinite ease-in-out',
              transform: 'translate(0,0) scale(1)',
              willChange: 'transform, opacity',
            }}
          />
        ))}
      </div>
    </>
  );
};

export default DustParticles;
