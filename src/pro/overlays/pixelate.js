import { initAudioSource } from "../../block/utils/audio";

document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll(".wpmg-gallery")
    .forEach((gallery, index) => attachOverlayAnimation(gallery, index));
});

const attachOverlayAnimation = (container, index) => {
  if (!window?.wpmg) window.wpmg = [];

  if (!window.wpmg[index]) {
    window.wpmg[index] = { initOverlay: attachOverlayAnimation, source: null };
    return;
  }

  const props = JSON.parse(container.dataset.props || "{}");
  const { overlay, overlay_options = {} } = props;
  const { max_size = 20 } = overlay_options;

  if (overlay === "pro/pixelate") {
    const audio = container.querySelector(".wpmg-audio");
    if (!audio) return;

    const imgs = container.querySelectorAll(".wpmg-image-container img");
    if (!imgs.length) return;

    const items = [];

    imgs.forEach(img => {
      const containerEl = img.parentElement;

      function setup() {
        const rect = containerEl.getBoundingClientRect();
        if (!rect.width || !rect.height) {
          requestAnimationFrame(setup);
          return;
        }

        const dpr = window.devicePixelRatio || 1;

        const canvas = document.createElement("canvas");

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        canvas.style.width = rect.width + "px";
        canvas.style.height = rect.height + "px";

        canvas.style.position = "absolute";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.pointerEvents = "none";
        canvas.style.zIndex = "10";

        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;

        ctx.scale(dpr, dpr);

        containerEl.style.position = "relative";
        containerEl.appendChild(canvas);

        items.push({
          img,
          canvas,
          ctx,
          parent: containerEl
        });
      }

      if (!img.complete || img.naturalWidth === 0) {
        img.addEventListener("load", setup);
      } else {
        setup();
      }
    });

    const [analyser, audioCtx, data] = initAudioSource(audio, index);
    let animFrame;

    function drawPixel(item, pixelSize) {
      const { img, canvas, ctx, parent } = item;

      const rect = parent.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      if (w === 0 || h === 0) return;

      const sw = img.naturalWidth;
      const sh = img.naturalHeight;
      if (!sw || !sh) return;

      const dstRatio = w / h;
      const srcRatio = sw / sh;

      let sx, sy, sWidth, sHeight;

      if (srcRatio > dstRatio) {
        sHeight = sh;
        sWidth = sHeight * dstRatio;
        sx = (sw - sWidth) / 2;
        sy = 0;
      } else {
        sWidth = sw;
        sHeight = sw / dstRatio;
        sx = 0;
        sy = (sh - sHeight) / 2;
      }

      const smallW = Math.max(1, Math.floor(w / pixelSize));
      const smallH = Math.max(1, Math.floor(h / pixelSize));

      if (!drawPixel.tmp) {
        drawPixel.tmp = document.createElement("canvas");
        drawPixel.tctx = drawPixel.tmp.getContext("2d");
        drawPixel.tctx.imageSmoothingEnabled = false;
      }

      const tmp = drawPixel.tmp;
      const tctx = drawPixel.tctx;

      tmp.width = smallW;
      tmp.height = smallH;

      ctx.clearRect(0, 0, w, h);

      tctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, smallW, smallH);

      ctx.drawImage(tmp, 0, 0, smallW, smallH, 0, 0, w, h);
    }

    function animate() {
      analyser.getByteFrequencyData(data);

      let sum = 0;
      for (let i = 10; i < 40; i++) sum += data[i];
      const avg = sum / 30;

      const pixelSize = 2 + Math.pow(avg / 255, 1.4) * max_size;

      items.forEach(item => drawPixel(item, pixelSize));

      animFrame = requestAnimationFrame(animate);
    }

    audio.addEventListener("play", () => {
      audioCtx.resume().then(() => animate());
    });
  }
};
