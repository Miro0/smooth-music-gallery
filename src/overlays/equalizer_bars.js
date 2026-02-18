import {createAnimationStyle} from "../block/utils/style";
import {initAudioSource} from "../block/utils/audio";

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.mg-gallery').forEach((gallery, index) => attachOverlayAnimation(gallery, index));
});

const attachOverlayAnimation = (container, index) => {
  if (!window?.mg) {
    window.mg = [];
  }

  if (!window?.mg[index]) {
    window.mg[index] = { initOverlay: attachOverlayAnimation, source: null };
  } else if (!window?.mg[index]?.initialized) {
    window.mg[index].initOverlay = attachOverlayAnimation;
  } else {
    const props = JSON.parse(container.dataset.props || '{}');
    const {overlay, overlay_options = {}} = props;
    const {accent = '#ffffff', opacity = 0.5, bars = 32, max_height = 95} = overlay_options;

    const barsRatio = window.innerWidth < 768 ? 0.5 : 1;

    if (overlay === 'equalizer_bars') {
      const audio = container.querySelector('.mg-audio');
      const overlayLayer = container.querySelector('.mg-overlay-layer');

      if (overlayLayer && audio) {
        const equalizerClass = createAnimationStyle('mg-overlay--equalizer-bars', (c) => `
          .${c} {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            pointer-events: none;
            z-index: 50;
            opacity: 0.2;
            gap: 3px;
          }
          .${c} .mg-overlay--equalizer-bar {
            flex: 1;
            height: 95%;
            background: #ffffff;
            border-top-left-radius: 3px;
            border-top-right-radius: 3px;
            transform-origin: bottom;
            transform: scaleY(0.01);
            will-change: transform;
            transition: background 0.2s;
          }
        `);

        overlayLayer.innerHTML = `
          <div class="${equalizerClass}" data-bars="${bars * barsRatio}" style="opacity:${opacity}; height: ${max_height}%">
            ${`<div class="mg-overlay--equalizer-bar" style="background-color:${accent}"></div>`.repeat(bars * barsRatio)}
          </div>
        `;

        const barNodes = Array.from(
          overlayLayer.querySelectorAll('.mg-overlay--equalizer-bar')
        );

        const barHeights = new Array(barNodes.length).fill(0);
        const decay = 0.005;

        const [analyser, ctx, data] = initAudioSource(audio, index);

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
