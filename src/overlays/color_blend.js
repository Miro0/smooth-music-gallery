import {createAnimationStyle} from "../block/utils/style";
import {initAudioSource} from "../block/utils/audio";

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
    const {accent = '#ffffff', blend_mode = 'multiply'} = overlay_options;

    if (overlay === 'color_blend') {
      const audio = container.querySelector('.wpmg-audio');
      const imageLayer = container.querySelector('.wpmg-image-container');

      if (imageLayer && audio) {
        const imageLayerClass = createAnimationStyle('imageLayer', (c) => `
          .${c} {
            position: absolute;
            inset: 0;
            pointer-events: none;
            overflow: hidden;
          }
          
          .${c} .wpmg-overlay--color-blend__layer {
            position: absolute;
            inset: 0;
            background: ${accent};
            opacity: 0.1;
            mix-blend-mode: ${blend_mode};
            pointer-events: none;
            will-change: opacity, background;
          }
        `);

        if (!imageLayer.querySelector('.wpmg-overlay--color-blend__layer')) {
          const overlayRoot = document.createElement('div');
          overlayRoot.className = imageLayerClass;
          overlayRoot.innerHTML = `<div class="wpmg-overlay--color-blend__layer"></div>`;
          imageLayer.appendChild(overlayRoot);
        }

        const layer = container.querySelector('.wpmg-overlay--color-blend__layer');
        if (!layer) return;

        const [analyser, ctx, data] = initAudioSource(audio, index);

        let animFrame;

        function animate() {
          analyser.getByteFrequencyData(data);

          let avg = 0;
          for (let i = 0; i < data.length; i++) avg += data[i];
          avg = avg / data.length / 255;

          const reactiveOpacity = Math.min(0.85, avg * 1.8);

          layer.style.opacity = reactiveOpacity.toFixed(3);

          animFrame = requestAnimationFrame(animate);
        }

        audio.addEventListener('play', () => {
          ctx.resume().then(() => animate());
        });

        audio.addEventListener('pause', () => {
          layer.style.opacity = 0.1;
        });

        return () => cancelAnimationFrame(animFrame);
      }
    }
  }
};
