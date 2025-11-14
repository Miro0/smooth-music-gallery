import { useEffect, useRef } from "@wordpress/element";

const EqualizerBars = ({ bars = 32, accent = '#ffffff', opacity = 0.5, max_height = 95 }) => {
  const containerRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const elements = Array.from(
      container.querySelectorAll('.wpmg-overlay--equalizer-bar')
    );

    const state = elements.map(() => ({
      value: 0.1,
      target: Math.random(),
      speed: 0.02 + Math.random() * 0.02,
      hold: Math.random() * 30
    }));

    function animate() {
      elements.forEach((bar, i) => {
        const s = state[i];

        if (s.hold <= 0) {
          s.target = 0.1 + Math.random() * 0.9;
          s.hold = 10 + Math.random() * 30;
        }

        s.hold -= 1;

        s.value += (s.target - s.value) * (0.05 + Math.random() * 0.05);
        s.value += (Math.random() - 0.5) * 0.01;

        if (s.value < 0.05) s.value = 0.05;
        if (s.value > 1.0) s.value = 1.0;

        bar.style.transform = `scaleY(${s.value})`;
      });

      animRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, [bars]);

  return (
    <div
      ref={containerRef}
      className="wpmg-overlay--equalizer-bars"
      style={{ opacity, height: `${max_height}%` }}
    >
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className="wpmg-overlay--equalizer-bar"
          style={{ backgroundColor: accent }}
        />
      ))}
    </div>
  );
};

export default EqualizerBars;
