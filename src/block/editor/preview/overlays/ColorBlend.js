import {useEffect, useRef} from "@wordpress/element";

const ColorBlend = ({accent = '#ffffff', blend_mode = 'multiply'}) => {
  const containerRef = useRef(null);
  const layerRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    let t = 0;

    function animate() {
      t += 0.04;

      const opacity = 0.4 + Math.sin(t) * 0.1;

      layer.style.opacity = opacity.toFixed(3);
      layer.style.background = accent;
      layer.style.mixBlendMode = blend_mode;

      animRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, [accent, blend_mode]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <div
        ref={layerRef}
        style={{
          position: 'absolute',
          inset: 0,
          background: accent,
          opacity: 0.1,
          mixBlendMode: blend_mode,
          transition: 'background 0.15s linear, mix-blend-mode 0.15s linear',
          willChange: 'opacity, background, mix-blend-mode',
        }}
      />
    </div>
  );
};

export default ColorBlend;
