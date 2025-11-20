import {useEffect, useRef, useState} from "@wordpress/element";

const OrbitalPulse = (
  {
    accent = '#ffffff',
    opacity = 0.5,
    density = 0.5,
    radius = 90,
    size = 8,
    speed = 0.2,
  }
) => {
  const containerRef = useRef(null);
  const animRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const container = containerRef.current;
      if (!container) return;

      const particles = Array.from(
        container.querySelectorAll('.wpmg-bg--orbital-ring__particle')
      );

      const rect = container.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;

      const aspectX = rect.width > rect.height ? rect.width / rect.height : 1;
      const aspectY = rect.height > rect.width ? rect.height / rect.width : 1;

      const baseRadius = Math.min(rect.width, rect.height) / 2 * (radius / 100);

      const half = size / 2;
      const spd = Math.max(0, Math.min(1, speed));

      const state = particles.map((_, i) => ({
        angle: (i / particles.length) * Math.PI * 2,
      }));

      const animate = () => {
        particles.forEach((p, i) => {
          const s = state[i];

          s.angle += 0.002 * spd;

          const x = cx + Math.cos(s.angle) * (baseRadius * aspectX);
          const y = cy + Math.sin(s.angle) * (baseRadius * aspectY);

          p.style.transform = `translate(${x - half}px, ${y - half}px)`;
        });

        animRef.current = requestAnimationFrame(animate);
      };

      animRef.current = requestAnimationFrame(animate);
    }

    return () => cancelAnimationFrame(animRef.current);
  }, [mounted, accent, density, radius, size, speed]);

  return (
    <>
      <style>
        {`
        .wpmg-bg--orbital-ring__particle::after {
          content:"";
          position:absolute;
          inset:0;
          border-radius:50%;
          background:${accent};
          filter:blur(6px);
          opacity:0.9;
          pointer-events:none;
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
            className="wpmg-bg--orbital-ring__particle"
            style={{
              position: 'absolute',
              width: `${size}px`,
              height: `${size}px`,
              background: accent,
              borderRadius: '50%',
              willChange: 'transform',
            }}
          />
        ))}
      </div>
    </>
  );
};

export default OrbitalPulse;
