import { initAudioSource } from "../block/utils/audio";

document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll(".wpmg-gallery")
    .forEach((gallery, index) => attachBackgroundAnimation(gallery, index));
});

const attachBackgroundAnimation = (container, index) => {
  if (!window?.wpmg) {
    window.wpmg = [];
  }

  if (!window.wpmg[index]) {
    window.wpmg[index] = { initBackground: attachBackgroundAnimation, source: null };
  } else if (!window.wpmg[index]?.initialized) {
    window.wpmg[index].initBackground = attachBackgroundAnimation;
  } else {
    // Tu dopiero lecimy z właściwą animacją
    const props = JSON.parse(container.dataset.props || "{}");
    const { background, background_options = {} } = props;
    const {
      accent = "#ffffff",
      opacity = 0.5,
      density = 0.5,
      min_size = 8,
      max_size = 16,
    } = background_options;

    if (background !== "pro/dust_particles") return;

    const audio = container.querySelector(".wpmg-audio");
    const layer = container.querySelector(".wpmg-bg-layer");
    if (!audio || !layer) return;

    let isVisible = true;
    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0 }
    );
    observer.observe(container);

    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.inset = 0;
    canvas.style.pointerEvents = "none";
    canvas.style.opacity = opacity;
    layer.innerHTML = "";
    layer.appendChild(canvas);

    const ctx2 = canvas.getContext("2d");

    function resize() {
      const r = layer.getBoundingClientRect();
      if (!r.width || !r.height) {
        requestAnimationFrame(resize);
        return;
      }
      canvas.width = r.width;
      canvas.height = r.height;
    }
    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("fullscreenchange", resize);

    function makeTextureForSize(size) {
      const texSize = size * 4;
      let off, octx;

      if (window.OffscreenCanvas) {
        off = new OffscreenCanvas(texSize, texSize);
        octx = off.getContext("2d");
      } else {
        off = document.createElement("canvas");
        off.width = texSize;
        off.height = texSize;
        octx = off.getContext("2d");
      }

      const r = texSize / 2;

      octx.clearRect(0, 0, texSize, texSize);
      octx.fillStyle = accent;
      octx.shadowColor = accent;
      octx.shadowBlur = r * 0.6;

      octx.beginPath();
      octx.arc(r, r, r * 0.4, 0, Math.PI * 2);
      octx.fill();

      return off;
    }

    const rect = layer.getBoundingClientRect();
    const count = Math.floor(240 * density);

    const particles = new Array(count).fill(0).map(() => {
      const size = min_size + Math.random() * (max_size - min_size);
      return {
        x: Math.random() * (rect.width || 1),
        y: Math.random() * (rect.height || 1),
        size,
        tex: makeTextureForSize(size),
        driftX: (Math.random() - 0.5) * 0.15,
        driftY: (Math.random() - 0.5) * 0.15,
      };
    });

    const third = Math.floor(count / 3) || 1;
    const lowP = particles.slice(0, third);
    const midP = particles.slice(third, third * 2);
    const highP = particles.slice(third * 2);

    const [analyser, audioCtx, data] = initAudioSource(audio, index);

    const avgRange = (arr, start, end) => {
      const len = arr.length;
      if (len === 0) return 0;
      const s = Math.max(0, start);
      const e = Math.min(end, len - 1);
      let sum = 0;
      let cnt = 0;
      for (let i = s; i <= e; i++) {
        sum += arr[i];
        cnt++;
      }
      return cnt ? sum / cnt : 0;
    };

    let animFrame;

    function drawGroup(arr, bandVal, scaleMul, baseOpacity, gainOpacity) {
      const W = canvas.width;
      const H = canvas.height;
      const scaleFactor = scaleMul * bandVal;
      const opacityVal = (v) =>
        Math.max(0, Math.min(1, baseOpacity + v * gainOpacity));

      arr.forEach((p) => {
        p.x += p.driftX;
        p.y += p.driftY;

        const margin = 50;
        if (p.x < -margin) p.x = W + margin;
        if (p.x > W + margin) p.x = -margin;
        if (p.y < -margin) p.y = H + margin;
        if (p.y > H + margin) p.y = -margin;

        const scale = 1 + scaleFactor;
        const s = p.size * scale;

        const alpha = opacityVal(bandVal);

        ctx2.globalAlpha = alpha;
        ctx2.drawImage(p.tex, p.x - s / 2, p.y - s / 2, s, s);
      });
    }

    function animate() {
      if (!isVisible) {
        animFrame = requestAnimationFrame(animate);
        return;
      }

      analyser.getByteFrequencyData(data);

      const low = avgRange(data, 0, 10) / 255;
      const mid = avgRange(data, 11, 40) / 255;
      const high = avgRange(data, 41, 90) / 255;

      ctx2.clearRect(0, 0, canvas.width, canvas.height);

      drawGroup(lowP, low, 1.3, 0.25, 0.9);
      drawGroup(midP, mid, 0.8, 0.25, 0.7);
      drawGroup(highP, high, 0.4, 0.3, 0.5);

      animFrame = requestAnimationFrame(animate);
    }

    animate();

    audio.addEventListener("play", () => {
      audioCtx.resume().catch(() => {});
    });

    return () => {
      cancelAnimationFrame(animFrame);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("fullscreenchange", resize);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }
};
