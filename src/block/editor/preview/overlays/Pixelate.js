import {useEffect, useRef, useState} from "@wordpress/element";

const Pixelate = ({max_size = 20, photo}) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const offscreenRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !photo) return;

    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = typeof photo === "string" ? photo : photo.url;

    img.onload = () => {
      init();
    };

    function init() {
      function resize() {
        const parent = canvas.parentElement;
        if (!parent) return;

        const rect = parent.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        const dpr = window.devicePixelRatio || 1;

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        canvas.style.width = rect.width + "px";
        canvas.style.height = rect.height + "px";

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.imageSmoothingEnabled = false;

        if (window.OffscreenCanvas) {
          offscreenRef.current = new OffscreenCanvas(rect.width * dpr, rect.height * dpr);
        } else {
          const tmp = document.createElement("canvas");
          tmp.width = rect.width * dpr;
          tmp.height = rect.height * dpr;
          offscreenRef.current = tmp;
        }
      }

      resize();
      window.addEventListener("resize", resize);

      function render() {
        const parent = canvas.parentElement;
        const rect = parent.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;

        const sw = img.naturalWidth;
        const sh = img.naturalHeight;

        const dst = w / h;
        const src = sw / sh;

        let sx, sy, sWidth, sHeight;

        if (src > dst) {
          sHeight = sh;
          sWidth = sh * dst;
          sx = (sw - sWidth) / 2;
          sy = 0;
        } else {
          sWidth = sw;
          sHeight = sw / dst;
          sx = 0;
          sy = (sh - sHeight) / 2;
        }

        const t = performance.now() / 300;
        const pixelSize = 1 + (Math.sin(t) * 0.5 + 0.5) * max_size;

        const smallW = Math.max(1, Math.floor(w / pixelSize));
        const smallH = Math.max(1, Math.floor(h / pixelSize));

        const off = offscreenRef.current;
        const octx = off.getContext("2d");
        octx.imageSmoothingEnabled = false;

        if (!render.tmp) {
          render.tmp = document.createElement("canvas");
          render.tctx = render.tmp.getContext("2d");
          render.tctx.imageSmoothingEnabled = false;
        }

        const tmp = render.tmp;
        const tctx = render.tctx;

        tmp.width = smallW;
        tmp.height = smallH;

        tctx.clearRect(0, 0, smallW, smallH);
        tctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, smallW, smallH);

        // ⭐ render to offscreen
        octx.clearRect(0, 0, w, h);
        octx.drawImage(tmp, 0, 0, smallW, smallH, 0, 0, w, h);

        // ⭐ copy from offscreen to main canvas
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(off, 0, 0);

        animRef.current = requestAnimationFrame(render);
      }

      render();

      return () => {
        window.removeEventListener("resize", resize);
        cancelAnimationFrame(animRef.current);
      };
    }
  }, [max_size, photo, mounted]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 5,
      }}
    />
  );
};

export default Pixelate;
