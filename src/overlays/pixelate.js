import { initAudioSource } from "../block/utils/audio";

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

  if (overlay !== "pro/pixelate") return;

  const audio = container.querySelector(".wpmg-audio");
  if (!audio) return;

  const imgs = [...container.querySelectorAll(".wpmg-image-container img")];
  if (!imgs.length) return;

  const items = [];

  let isVisible = true;
  const observer = new IntersectionObserver(
    (entries) => {
      isVisible = entries[0].isIntersecting;
    },
    { threshold: 0.1 }
  );
  observer.observe(container);

  imgs.forEach((img) => {
    const parent = img.parentElement;

    function setup() {
      const rect = parent.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        requestAnimationFrame(setup);
        return;
      }

      const dpr = window.devicePixelRatio || 1;

      let off = null;
      let octx = null;

      if (window.OffscreenCanvas) {
        off = new OffscreenCanvas(rect.width * dpr, rect.height * dpr);
        octx = off.getContext("2d", { alpha: true });
        octx.imageSmoothingEnabled = false;
        octx.scale(dpr, dpr);
      }

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

      parent.style.position = "relative";
      parent.appendChild(canvas);

      items.push({
        img,
        parent,
        canvas,
        ctx,
        off,
        octx
      });
    }

    if (!img.complete || img.naturalWidth === 0) {
      img.addEventListener("load", setup);
    } else {
      setup();
    }
  });

  const [analyser, audioCtx, data] = initAudioSource(audio, index);

  const tmp = window.OffscreenCanvas
    ? new OffscreenCanvas(1, 1)
    : document.createElement("canvas");
  const tctx = tmp.getContext("2d");
  tctx.imageSmoothingEnabled = false;

  let animFrame;

  function drawPixel(item, pixelSize) {
    const { img, parent, canvas, ctx, off, octx } = item;
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

    tmp.width = smallW;
    tmp.height = smallH;

    tctx.clearRect(0, 0, smallW, smallH);
    tctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, smallW, smallH);

    ctx.clearRect(0, 0, w, h);

    ctx.drawImage(tmp, 0, 0, smallW, smallH, 0, 0, w, h);

    if (off && octx) {
      octx.clearRect(0, 0, w, h);
      octx.drawImage(tmp, 0, 0, smallW, smallH, 0, 0, w, h);
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(off, 0, 0, w, h);
    }
  }

  function animate() {
    if (!isVisible) {
      animFrame = requestAnimationFrame(animate);
      return;
    }

    analyser.getByteFrequencyData(data);
    let sum = 0;
    for (let i = 10; i < 40; i++) sum += data[i];
    const avg = sum / 30;

    const pixelSize = 2 + Math.pow(avg / 255, 1.4) * max_size;

    const activeIndex = window?.wpmg[index]?.swiper?.realIndex || window?.wpmg[index]?.swiper?.activeIndex || 0;

    items.forEach(((item) => {
      if (item?.parent?.dataset?.swiperSlideIndex !== undefined && parseInt(activeIndex) === parseInt(item?.parent?.dataset?.swiperSlideIndex)) {
        drawPixel(item, pixelSize);
      }
    }));

    animFrame = requestAnimationFrame(animate);
  }

  audio.addEventListener("play", () => {
    audioCtx.resume().then(() => {
      items.forEach(((item) => item.canvas.style.display = 'block'));
      animate()
    });
  });

  audio.addEventListener("pause", () => {
    items.forEach(((item) => item.canvas.style.display = 'none'));
  });
};
