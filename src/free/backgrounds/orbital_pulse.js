import {createAnimationStyle, hexToRgb} from "../../block/utils/style";
import {initAudioSource} from "../../block/utils/audio";

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.wpmg-gallery').forEach((gallery, index) =>
    attachBackgroundAnimation(gallery, index)
  );
});

const attachBackgroundAnimation = (container, index) => {
  if (!window?.wpmg) {
    window.wpmg = [];
  }

  if (!window?.wpmg[index]) {
    window.wpmg[index] = { initBackground: attachBackgroundAnimation, source: null };
  } else if (!window?.wpmg[index]?.initialized) {
    window.wpmg[index].initBackground = attachBackgroundAnimation;
  } else {
    const props = JSON.parse(container.dataset.props || '{}');
    const {background, background_options = {}} = props;
    const {
      accent = '#ffffff',
      opacity = 0.5,
      density = 0.5,
      radius = 90,
      intensity = 1,
      size = 8,
      speed = 0.2,
    } = background_options;

    if (background === 'free/orbital_pulse') {
      const audio = container.querySelector('.wpmg-audio');
      const backgroundLayer = container.querySelector('.wpmg-bg-layer');

      if (backgroundLayer && audio) {
        const ringClass = createAnimationStyle('wpmg-bg--orbital-ring', (c) => `
          .${c} {
            position:absolute;
            inset:0;
            pointer-events:none;
            overflow:hidden;
            opacity:${opacity};
          }

          .${c} .wpmg-bg--orbital-ring__particle {
            position:absolute;
            width:${size}px;
            height:${size}px;
            background:${accent};
            border-radius:50%;
            transition:opacity 0.2s linear;
            will-change:transform, opacity;
          }

          .${c} .wpmg-bg--orbital-ring__particle::after {
            content:"";
            position:absolute;
            inset:0;
            border-radius:50%;
            background:${accent};
            filter:blur(6px);
            opacity:0.9;
            pointer-events:none;
          }
        `);

        const maxParticles = 120;
        const rawCount = 120 * density;
        const particlesCount = Math.max(
          4,
          Math.min(maxParticles, Math.floor(rawCount || 0))
        );

        backgroundLayer.innerHTML = `
          <div class="${ringClass}">
            ${Array.from({length: particlesCount})
          .map((_, i) => `<div class="wpmg-bg--orbital-ring__particle" data-i="${i}"></div>`)
          .join('')}
          </div>`;

        const ring = backgroundLayer.querySelector(`.${ringClass}`);
        if (!ring) return;

        const particles = Array.from(
          ring.querySelectorAll('.wpmg-bg--orbital-ring__particle')
        );

        if (!particles.length) return;

        const rect = ring.getBoundingClientRect();
        const cx = rect.width / 2;
        const cy = rect.height / 2;

        const aspectX = rect.width > rect.height ? rect.width / rect.height : 1;
        const aspectY = rect.height > rect.width ? rect.height / rect.width : 1;

        const baseRadius =
          (Math.min(rect.width, rect.height) / 2) * (radius / 100);

        const half = size / 2;

        const state = particles.map((p, i) => ({
          angle: (i / particles.length) * Math.PI * 2,
          bandStart: Math.floor(Math.random() * 80),
          bandWidth: 10 + Math.random() * 20,
          jx: 0,
          jy: 0,
        }));

        const [analyser, ctx, data] = initAudioSource(audio, index);

        let animFrame;
        let frame = 0;

        function animate() {
          analyser.getByteFrequencyData(data);
          frame++;

          particles.forEach((p, i) => {
            const s = state[i];

            let energy = 0;
            let count = 0;
            const bandEnd = Math.min(s.bandStart + s.bandWidth, data.length);
            for (let j = s.bandStart; j < bandEnd; j++) {
              energy += data[j];
              count++;
            }
            energy = count ? energy / count : 0;

            const norm = energy / 255;

            const distortion = norm * (80 * intensity);
            const R1 = baseRadius * aspectX + distortion;
            const R2 = baseRadius * aspectY + distortion * 0.6;

            s.angle += (0.002 * speed) + (norm * 0.004 * speed);

            const x = cx + Math.cos(s.angle) * R1;
            const y = cy + Math.sin(s.angle) * R2;

            const scale = 1 + norm * (size / 10) * intensity;

            if (speed > 0 && frame % Math.max(2, Math.floor(6 / speed)) === 0) {
              s.jx = (Math.random() - 0.5) * (1.5 * speed);
              s.jy = (Math.random() - 0.5) * (1.5 * speed);
            }

            p.style.opacity = 0.3 + norm * 0.7;
            p.style.transform =
              `translate(${x - half + s.jx}px,${y - half + s.jy}px) scale(${scale})`;
          });

          animFrame = requestAnimationFrame(animate);
        }

        ctx.resume().catch(() => {}).finally(() => {
          animate();
        });

        return () => cancelAnimationFrame(animFrame);
      }
    }
  }
};
