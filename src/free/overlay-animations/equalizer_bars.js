import './equalizer_bars.scss';

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.wpmg-gallery').forEach((gallery, index) => attachOverlayAnimation(gallery, index));
});

const attachOverlayAnimation = (container, index) => {
  if (!window?.wpmg) {
    window.wpmg = [];
  }

  if (!window?.wpmg[index]) {
    window.wpmg[index] = { initOverlay: attachOverlayAnimation, source: null };
  } else if (!window?.wpmg[index]?.initialized) {
    window.wpmg[index].initOverlay = attachOverlayAnimation;
  } else {
    const props = JSON.parse(container.dataset.props || '{}');
    const {overlay_animation, overlay_animation_options = {}} = props;
    const {accent = '#ffffff', opacity = 0.5, bars = 32, max_height = 95} = overlay_animation_options;

    const barsRatio = window.innerWidth < 768 ? 0.5 : 1;

    if (overlay_animation === 'free/equalizer_bars') {
      const audio = container.querySelector('.wpmg-audio');
      const overlayLayer = container.querySelector('.wpmg-overlay-layer');

      if (overlayLayer && audio) {
        overlayLayer.innerHTML = `
      <div class="wpmg-overlay--equalizer-bars" data-bars="${bars * barsRatio}" style="opacity:${opacity}; height: ${max_height}%">
        ${`<div class="wpmg-overlay--equalizer-bar" style="background-color:${accent}"></div>`.repeat(bars * barsRatio)}
      </div>
      `;

        const barNodes = Array.from(
          overlayLayer.querySelectorAll('.wpmg-overlay--equalizer-bar')
        );

        const barHeights = new Array(barNodes.length).fill(0);
        const decay = 0.005;

        if (!window?.wpmg[index]?.ctx) {
          window.wpmg[index].ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        const ctx = window.wpmg[index].ctx;

        if (!window?.wpmg[index]?.source) {
          window.wpmg[index].source = ctx.createMediaElementSource(audio);
        }
        const source = window.wpmg[index].source;

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        const data = new Uint8Array(analyser.frequencyBinCount);

        source.connect(analyser);
        analyser.connect(ctx.destination);

        let animFrame;

        function animate() {
          analyser.getByteFrequencyData(data);

          const slice = Math.floor(data.length / barNodes.length);

          barNodes.forEach((bar, i) => {
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
  }
};
