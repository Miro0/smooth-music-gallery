import {initAudioSource} from "../../block/utils/audio";

document.addEventListener('DOMContentLoaded', () => {
  document
    .querySelectorAll('.wpmg-gallery')
    .forEach((gallery, index) => attachOverlayAnimation(gallery, index));
});

const attachOverlayAnimation = (container, index) => {

  if (!window?.wpmg) window.wpmg = [];

  if (!window.wpmg[index]) {
    window.wpmg[index] = {initOverlay: attachOverlayAnimation, source: null};
  } else if (!window.wpmg[index]?.initialized) {
    window.wpmg[index].initOverlay = attachOverlayAnimation;
  } else {
    const props = JSON.parse(container.dataset.props || '{}');
    const {overlay, overlay_options = {}} = props;

    const {
      accent = '#ffffff',
      opacity = 0.95,
      intensity = 1,
      position = 0,
      line_height = 3,
      speed = 0.5,
      smoothness = 0.5
    } = overlay_options;

    if (overlay !== 'pro/heartbeat_line') return;

    const audio = container.querySelector('.wpmg-audio');
    const overlayLayer = container.querySelector('.wpmg-overlay-layer');

    if (!overlayLayer || !audio) return;

    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.opacity = opacity;
    overlayLayer.appendChild(canvas);

    const ctx2 = canvas.getContext('2d');

    function resize() {
      const rect = overlayLayer.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('fullscreenchange', resize);

    const width = () => canvas.width;
    const height = () => canvas.height;

    const baseOffsetY = () => (
      height() / 2 + (position / 50) * (height() / 2)
    );

    const [analyser, ctx, data] = initAudioSource(audio, index);

    let history = new Array(width()).fill(0);
    let shiftAccumulator = 0;

    let started = false;
    animate();

    function animate() {

      let currentAmp = 0;

      if (!audio.paused) {
        analyser.getByteFrequencyData(data);

        let sum = 0, count = 0;
        for (let i = 10; i < 50 && i < data.length; i++) {
          sum += data[i];
          count++;
        }

        const avg = count ? sum / count : 0;
        currentAmp = (avg / 255) * 100 * intensity;
      }

      const lastAmp = history[history.length - 1] ?? 0;
      const smoothedAmp = lastAmp + (currentAmp - lastAmp) * smoothness;

      shiftAccumulator += speed;
      const shift = Math.floor(shiftAccumulator);
      shiftAccumulator -= shift;

      if (shift > 0) {
        const W = width();
        const newHist = new Array(W);

        for (let x = 0; x < W - shift; x++) {
          newHist[x] = history[x + shift];
        }

        const last = history[W - 1 - shift] ?? 0;
        for (let x = W - shift; x < W; x++) {
          newHist[x] = last;
        }

        history = newHist;
      }

      history[history.length - 1] = smoothedAmp;

      ctx2.clearRect(0, 0, width(), height());
      const baseY = baseOffsetY();

      ctx2.lineWidth = line_height;
      ctx2.strokeStyle = accent;
      ctx2.shadowBlur = 0;
      ctx2.lineCap = 'round';
      ctx2.lineJoin = 'round';
      ctx2.beginPath();
      for (let x = 0; x < history.length; x++) {
        const y = baseY - history[x];
        if (x === 0) ctx2.moveTo(x, y);
        else ctx2.lineTo(x, y);
      }
      ctx2.stroke();

      ctx2.lineWidth = line_height;
      ctx2.strokeStyle = accent;
      ctx2.shadowColor = accent;
      ctx2.shadowBlur = line_height * 0.8;
      ctx2.beginPath();
      for (let x = 0; x < history.length; x++) {
        const y = baseY - history[x];
        if (x === 0) ctx2.moveTo(x, y);
        else ctx2.lineTo(x, y);
      }
      ctx2.stroke();

      ctx2.lineWidth = line_height;
      ctx2.strokeStyle = accent + "99";
      ctx2.shadowBlur = line_height * 2;
      ctx2.shadowColor = accent;
      ctx2.beginPath();
      for (let x = 0; x < history.length; x++) {
        const y = baseY - history[x];
        if (x === 0) ctx2.moveTo(x, y);
        else ctx2.lineTo(x, y);
      }
      ctx2.stroke();

      requestAnimationFrame(animate);
    }

    audio.addEventListener('play', () => {
      if (!started) {
        started = true;
        ctx.resume();
      }
    });
  }
};
