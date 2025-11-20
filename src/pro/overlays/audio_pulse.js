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
    let {accent = '#ffffff', opacity = 0.5, intensity = 1, density = 0.2, speed = 0.2, size = 8} = overlay_options;

    if (overlay === 'pro/audio_pulse') {
      const audio = container.querySelector('.wpmg-audio');
      const overlayLayer = container.querySelector('.wpmg-overlay-layer');

      if (overlayLayer && audio) {
        const equalizerClass = createAnimationStyle('wpmg-overlay--audio-pulse', (c) => `
          .${c} {
            position:absolute;
            inset:0;
            pointer-events:none;
            z-index:50;
          }
          
          .${c} .wpmg-overlay--audio-pulse__dot {
            position:absolute;
            border-radius:50%;
            border: ${parseInt(size / 4, 10)}px solid ${accent};
            transform: scale(1);
            transition:opacity 0.15s linear;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .${c} .wpmg-overlay--audio-pulse__dot:after {
            content: '';
            position:absolute;
            border-radius:50%;
            border: ${size >= 14 ? 2 : 1}px solid ${accent};
            width: calc(100% - ${size >= 14 ? parseInt(size / 3, 10) : 5}px);
            height: calc(100% - ${size >= 14 ? parseInt(size / 3, 10) : 5}px);
          }
        `);

        overlayLayer.innerHTML = `
          <div class="${equalizerClass}" style="opacity:${opacity}">
            ${Array.from({length: container.getBoundingClientRect().width * density / 5}).map(() =>
              `<div class="wpmg-overlay--audio-pulse__dot"></div>`
            ).join('')}
          </div>
        `;

        const rect = overlayLayer.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        const dots = Array.from(container.querySelectorAll('.wpmg-overlay--audio-pulse__dot'));

        const dotState = dots.map(() => {
          return {
            x: Math.random() * width,
            y: Math.random() * height,
            size: size + Math.random() * 16,
            bandStart: Math.floor(Math.random() * 100),
            bandWidth: 10 + Math.random() * 20,
            strength: 0.4 + Math.random() * intensity,
            vx: (Math.random() * 0.2 - 0.1) * (10 * speed),
            vy: (Math.random() * 0.2 - 0.1) * (10 * speed)
          };
        });

        dots.forEach((dot, i) => {
          const s = dotState[i];
          dot.style.transform = `translate(${s.x}px, ${s.y}px) scale(1)`;
          dot.style.width = `${s.size}px`;
          dot.style.height = `${s.size}px`;
        });

        const [analyser, ctx, data] = initAudioSource(audio, index);

        let animFrame;

        function animate() {
          analyser.getByteFrequencyData(data);

          dots.forEach((dot, i) => {
            const s = dotState[i];

            s.x += s.vx;
            s.y += s.vy;

            if (s.x < 0)  { s.x = 0;  s.vx *= -1; }
            if (s.x > width) { s.x = width; s.vx *= -1; }
            if (s.y < 0)  { s.y = 0;  s.vy *= -1; }
            if (s.y > height) { s.y = height; s.vy *= -1; }

            let sum = 0;
            let count = 0;
            const end = Math.min(s.bandStart + s.bandWidth, data.length);

            for (let j = s.bandStart; j < end; j++) {
              sum += data[j];
              count++;
            }

            const avg = sum / count;
            const pulse = (avg / 255) * s.strength;

            const wobble = Math.sin((performance.now() / 300) + i) * (0.3 * intensity);

            const scale = 1 + pulse + wobble;

            dot.style.transform = `translate(${s.x}px, ${s.y}px) scale(${scale})`;
            dot.style.opacity = 0.7 + pulse;
          });

          animFrame = requestAnimationFrame(animate);
        }

        animate();

        return () => cancelAnimationFrame(animFrame);
      }
    }
  }
};
