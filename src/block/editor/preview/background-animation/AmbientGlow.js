import {useEffect, useRef} from "@wordpress/element";

const lerp = (a, b, t) => a + (b - a) * t;

const AmbientGlow = ({accent = '#ffffff'}) => {
  const containerRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const lights = Array.from(
      container.querySelectorAll('.wpmg-bg--ambient-light')
    );

    const state = lights.map(() => ({
      value: 0,
      target: Math.random() + 0.2,
      speed: Math.random() * 0.012 + 0.008,
      cooldown: Math.random() * 1000 + 800
    }));

    let lastTime = performance.now();

    function animate(time) {
      const delta = time - lastTime;
      lastTime = time;

      state.forEach((s, i) => {
        s.cooldown -= delta;
        if (s.cooldown <= 0) {
          s.target = Math.random() + 0.2;  // 0.2–1
          s.speed = Math.random() * 0.012 + 0.008;
          s.cooldown = Math.random() * 1400 + 700;
        }

        s.value = lerp(s.value, s.target, s.speed);

        lights[i].style.opacity = s.value.toFixed(3);
      });

      animRef.current = requestAnimationFrame(animate);
    }

    animRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animRef.current);
  }, [accent]);

  return (
    <div ref={containerRef} style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 40,
    }}>
      <div
        className="wpmg-bg--ambient-light wpmg-bg--ambient-light__tl"
        style={{
          position: 'absolute',
          width: '70%',
          height: '70%',
          filter: 'blur(50px)',
          opacity: 0,
          transition: 'opacity .12s linear',
          background: `radial-gradient(circle,${accent} 0%, transparent 90%)`,
          top: '2.5%',
          left: '-2.5%',
        }}
      />
      <div
        className="wpmg-bg--ambient-light wpmg-bg--ambient-light__tr"
        style={{
          position: 'absolute',
          width: '70%',
          height: '70%',
          filter: 'blur(50px)',
          opacity: 0,
          transition: 'opacity .12s linear',
          background: `radial-gradient(circle,${accent} 0%, transparent 90%)`,
          top: '2.5%',
          right: '-2.5%',
        }}
      />
      <div
        className="wpmg-bg--ambient-light wpmg-bg--ambient-light__bl"
        style={{
          position: 'absolute',
          width: '70%',
          height: '70%',
          filter: 'blur(50px)',
          opacity: 0,
          transition: 'opacity .12s linear',
          background: `radial-gradient(circle,${accent} 0%, transparent 90%)`,
          bottom: '2.5%',
          left: '-2.5%',
        }}
      />
      <div
        className="wpmg-bg--ambient-light wpmg-bg--ambient-light__br"
        style={{
          position: 'absolute',
          width: '70%',
          height: '70%',
          filter: 'blur(50px)',
          opacity: 0,
          transition: 'opacity .12s linear',
          background: `radial-gradient(circle,${accent} 0%, transparent 90%)`,
          bottom: '2.5%',
          right: '-2.5%',
        }}
      />
    </div>
  );
};

export default AmbientGlow;
