import {createAnimationStyle} from "../../block/utils/style";
import {initAudioSource} from "../../block/utils/audio";

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.wpmg-gallery').forEach((gallery, index) => attachOverlayAnimation(gallery, index));
});

const attachOverlayAnimation = (container, index) => {
  if (!window?.wpmg) {
    window.wpmg = [];
  }

  if (!window?.wpmg[index]) {
    window.wpmg[index] = {initOverlay: attachOverlayAnimation, source: null};
  } else if (!window?.wpmg[index]?.initialized) {
    window.wpmg[index].initOverlay = attachOverlayAnimation;
  } else {
    const props = JSON.parse(container.dataset.props || '{}');
    const {overlay, overlay_options = {}} = props;
    const {accent = '#ffffff', opacity = 0.5, intensity = 1, position = 0, line_height = 4} = overlay_options;

    if (overlay === 'free/wave_line') {
      const audio = container.querySelector('.wpmg-audio');
      const overlayLayer = container.querySelector('.wpmg-overlay-layer');

      const segments = container.getBoundingClientRect().width / 4;

      if (overlayLayer && audio) {
        const equalizerClass = createAnimationStyle('wpmg-overlay--wave-lines', (c) => `
          .${c} {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            pointer-events: none;
            z-index: 50;
          }
          
          .${c} .wpmg-overlay--line-segment {
            flex: 1;
            height: ${line_height}px;
            background: linear-gradient(180deg, ${accent}55 0%, ${accent} 10%, ${accent} 90%, ${accent}55 100%);
            box-shadow:
              0 0 6px ${accent},
              0 0 14px ${accent}66;
            }
        `);

        const containerHeight = overlayLayer.getBoundingClientRect().height;
        const offset = (position / 100) * containerHeight;

        overlayLayer.innerHTML = `
          <div class="${equalizerClass}" style="opacity:${opacity}">
            ${`<div class="wpmg-overlay--line-segment" style="transform:translateY(${offset}px)"></div>`.repeat(segments)}
          </div>
        `;

        const lineSegments = Array.from(container.querySelectorAll('.wpmg-overlay--line-segment'));

        const [analyser, ctx, data] = initAudioSource(audio, index);

        let animFrame;

        function animate() {
          analyser.getByteFrequencyData(data);

          let sum = 0, count = 0;
          for (let i = 10; i < 50; i++) {
            sum += data[i];
            count++;
          }
          const avg = sum / count;
          const amp = (avg / 255) * 35 * intensity;

          const t = performance.now() / 600;

          lineSegments.forEach((segment, i) => {
            const x = i / segments;
            const wave = Math.sin((x + t) * Math.PI * 2);
            const y = wave * amp;

            segment.style.transform = `translateY(${y + offset}px)`;
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
