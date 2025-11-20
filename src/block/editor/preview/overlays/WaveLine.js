import {useEffect, useRef} from "@wordpress/element";

const WaveLine = ({accent = '#ffffff', opacity = 0.5, intensity = 1, position = 0, line_height = 4}) => {
  const containerRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const elements = Array.from(
      container.querySelectorAll('.wpmg-overlay--line-segment')
    );

    let offset = (position / 100) * container.getBoundingClientRect().height;
    setTimeout(() => {
      offset = (position / 100) * container.getBoundingClientRect().height;
    }, 10);

    function animate() {
      const t = performance.now() / 800;

      elements.forEach((segment, i) => {
        const x = i / elements.length;
        const wave = Math.sin((x + t) * Math.PI * 2);
        const previewAmp = 35 * (intensity / 2);
        const y = wave * previewAmp;
        segment.style.transform = `translateY(${y + offset}px)`;
      });

      animRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, [position, intensity]);

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
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'none',
        zIndex: 50,
      }}
    >
      {Array.from({length: 240}).map((_, i) => (
        <div
          key={i}
          className="wpmg-overlay--line-segment"
          style={{
            flex: 1,
            height: `${line_height}px`,
            background: `linear-gradient(180deg, ${accent}55 0%, ${accent} 10%, ${accent} 90%, ${accent}55 100%)`,
            boxShadow: `0 0 6px ${accent},0 0 14px ${accent}66`,
          }}
        />
      ))}
    </div>
  );
};

export default WaveLine;
