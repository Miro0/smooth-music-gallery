import './equalizer_bars.scss';

document.addEventListener('DOMContentLoaded', () => {
  const init = () => document.querySelectorAll('.wpmg-gallery').forEach(attachOverlayAnimation);

  if (window?.wpmg?.initialized) {
    init();
  } else if (window.wpmg) {
    window.wpmg.initOverlay = init;
  } else {
    window.wpmg = { initOverlay: init };
  }
});

const attachOverlayAnimation = (container) => {
  const props = JSON.parse(container.dataset.props || '{}');
  const { overlay_animation } = props;

  if (overlay_animation === 'equalizer_bars') {
    const audio = container.querySelector('.wpmg-audio');
    const overlayLayer = container.querySelector('.wpmg-overlay-layer');

    if (overlayLayer && audio) {
      overlayLayer.innerHTML = `
      <div class="wpmg-overlay--equalizer-bars" data-bars="32">
        ${'<div class="wpmg-overlay--equalizer-bar"></div>'.repeat(32)}
      </div>
      `;

      const bars = Array.from(
        overlayLayer.querySelectorAll('.wpmg-overlay--equalizer-bar')
      );

      const barHeights = new Array(bars.length).fill(0);
      const decay = 0.005;

      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const source = ctx.createMediaElementSource(audio);
      const analyser = ctx.createAnalyser();

      analyser.fftSize = 256;
      const data = new Uint8Array(analyser.frequencyBinCount);

      source.connect(analyser);
      analyser.connect(ctx.destination);

      let animFrame;

      function animate() {
        analyser.getByteFrequencyData(data);

        const slice = Math.floor(data.length / bars.length);

        bars.forEach((bar, i) => {
          let start = i * slice;
          let sum = 0;

          for (let j = start; j < start + slice; j++) {
            sum += data[j] || 0;
          }

          const avg = sum / slice;     // 0–255
          const normalized = avg / 255; // 0–1
          const min = 0.01;
          const target = Math.max(min, normalized);

          if (target > barHeights[i]) {
            barHeights[i] = target;
          } else {
            // miękkie opadanie
            barHeights[i] = Math.max(min, barHeights[i] - decay);
          }

          bar.style.transform = `scaleY(${barHeights[i]})`;
        });

        animFrame = requestAnimationFrame(animate);
      }

      audio.addEventListener('play', () => {
        ctx.resume().then(() => animate());
      });

      return () => cancelAnimationFrame(animFrame);
    }
  }
};
