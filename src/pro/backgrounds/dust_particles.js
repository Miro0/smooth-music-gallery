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
      min_size = 8,
      max_size = 16
    } = background_options;

    if (background === 'pro/dust_particles') {
      const audio = container.querySelector('.wpmg-audio');
      const backgroundLayer = container.querySelector('.wpmg-bg-layer');

      if (backgroundLayer && audio) {
        const dustParticlesClass = createAnimationStyle('wpmg-bg--dust-particles', (c) => `
          .${c} {
            position: absolute;
            inset: 0;
            overflow: hidden;
            pointer-events: none;
            opacity:${opacity};
          }

          .${c} .wpmg-bg--dust-particles__particle {
            position: absolute;
            border-radius: 50%;
            background: ${accent};
            animation: dust-float 12s infinite ease-in-out;
            transform: translate(0,0) scale(1);
            will-change: transform, opacity;
          }
          
          @keyframes dust-float {
            0%   { transform: translate(0, 0) scale(1); }
            50%  { transform: translate(-10px, -20px) scale(1.2); }
            100% { transform: translate(0, 0) scale(1); }
          }
        `);

        const particlesCount = Math.floor(120 * density);

        backgroundLayer.innerHTML = `
          <div class="${dustParticlesClass}">
            ${Array.from({length: particlesCount})
              .map((_, i) => `<div class="wpmg-bg--dust-particles__particle" data-i="${i}"></div>`)
              .join('')}
          </div>`;

        const dustContainer = backgroundLayer.querySelector(`.${dustParticlesClass}`);
        if (!dustContainer) return;

        const particles = Array.from(
          dustContainer.querySelectorAll('.wpmg-bg--dust-particles__particle')
        );

        if (!particles.length) return;

        particles.forEach(el => {
          el.style.left = Math.random() * 100 + "%";
          el.style.top = Math.random() * 100 + "%";
          const blur = 2 + Math.random() * 10;
          const spread = 2 + Math.random() * 10;

          el.style.boxShadow = `0 0 ${blur}px ${spread}px ${accent}`;

          const size = min_size + Math.random() * (max_size - min_size);
          el.style.width = size + "px";
          el.style.height = size + "px";

          el.style.animationDelay = `-${Math.random() * 12}s`;
        });

        const [analyser, ctx, data] = initAudioSource(audio, index);

        const thirds = Math.floor(particles.length / 3);
        const lowParticles  = particles.slice(0, thirds);
        const midParticles  = particles.slice(thirds, thirds * 2);
        const highParticles = particles.slice(thirds * 2);

        const avgInRange = (d, start, end) => {
          let sum = 0;
          for (let i = start; i <= end; i++) sum += d[i];
          return sum / (end - start + 1);
        };

        let animFrame;

        function animate() {
          analyser.getByteFrequencyData(data);

          const low  = avgInRange(data, 0, 10) / 255;
          const mid  = avgInRange(data, 11, 40) / 255;
          const high = avgInRange(data, 41, 90) / 255;

          lowParticles.forEach(el => {
            el.style.transform = `scale(${1 + low * 1.3})`;
            el.style.opacity = 0.25 + low * 0.9;
          });

          midParticles.forEach(el => {
            el.style.transform = `scale(${1 + mid * 0.8})`;
            el.style.opacity = 0.25 + mid * 0.7;
          });

          highParticles.forEach(el => {
            el.style.transform = `scale(${1 + high * 0.4})`;
            el.style.opacity = 0.3 + high * 0.5;
          });

          animFrame = requestAnimationFrame(animate);
        }

        animate();

        return () => cancelAnimationFrame(animFrame);
      }
    }
  }
};
