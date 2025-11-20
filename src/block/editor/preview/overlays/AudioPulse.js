import {useEffect, useRef} from "@wordpress/element";

const AudioPulse = ({accent = '#ffffff', opacity = 0.5, intensity = 1, density = 0.2, speed = 0.2, size = 8}) => {
  const containerRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.getBoundingClientRect().width;
    let height = container.getBoundingClientRect().height;
    setTimeout(() => {
      // @TODO - not updating all related properties.
      width = container.getBoundingClientRect().width;
      height = container.getBoundingClientRect().height;
    }, 10);

    const dotCount = Math.max(1, Math.floor(width * density / 10));

    const dots = Array.from(container.querySelectorAll('.wpmg-overlay--audio-pulse__dot'))
      .slice(0, dotCount);

    const state = dots.map(() => ({
      px: Math.random() * width,
      py: Math.random() * height,
      size: size + Math.random() * 16,
      bandStart: Math.floor(Math.random() * 100),
      bandWidth: 10 + Math.random() * 20,
      strength: 0.4 + Math.random() * intensity,
      vx: (Math.random() * 0.2 - 0.1) * (10 * speed),
      vy: (Math.random() * 0.2 - 0.1) * (10 * speed)
    }));

    dots.forEach((dot, i) => {
      const s = state[i];
      dot.style.width = `${s.size}px`;
      dot.style.height = `${s.size}px`;
      dot.style.transform = `translate(${s.px}px, ${s.py}px) scale(1)`;
    });

    function animate(t) {
      const wobbleBase = Math.sin(t / 300);

      dots.forEach((dot, i) => {
        const s = state[i];

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

        const pulse = (Math.sin((t / 200) + i) * 0.5 + 0.5) * s.strength;
        const wobble = wobbleBase * (0.3 * intensity);

        const scale = 1 + pulse + wobble;

        dot.style.transform = `translate(${s.px}px, ${s.py}px) scale(${scale})`;
        dot.style.opacity = 0.7 + pulse;
      });

      animRef.current = requestAnimationFrame(animate);
    }

    animRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animRef.current);
  }, [intensity, density, speed, size]);

  return (
    <>
      <style>
        {`
        .wpmg-overlay--audio-pulse__dot:after {
          content: '';
          position:absolute;
          border-radius:50%;
          border: ${size >= 14 ? 2 : 1}px solid ${accent};
          width: calc(100% - ${size >= 14 ? parseInt(size / 3, 10) : 5}px);
          height: calc(100% - ${size >= 14 ? parseInt(size / 3, 10) : 5}px);
        }
      `}
      </style>
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
          overflow: 'hidden',
        }}
      >
        {Array.from({length: 325 * density}).map((_, i) => (
          <div
            key={i}
            className="wpmg-overlay--audio-pulse__dot"
            style={{
              position: 'absolute',
              borderRadius: '50%',
              border: `${parseInt(size / 4, 10)}px solid ${accent}`,
              transform: 'scale(1)',
              transition: 'opacity 0.15s linear',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        ))}
      </div>
    </>
  );
};

export default AudioPulse;
