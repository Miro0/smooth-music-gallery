import {createAnimationStyle, hexToRgb} from "../../block/utils/style";
import {initAudioSource} from "../../block/utils/audio";

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.wpmg-gallery').forEach((gallery, index) => attachBackgroundAnimation(gallery, index));
});

function avgRange(data, start, end) {
  start = Math.max(0, Math.floor(start));
  end = Math.min(data.length, Math.floor(end));

  let sum = 0;
  let count = end - start;

  if (count <= 0) return 0;

  for (let i = start; i < end; i++) {
    sum += data[i];
  }

  return sum / count;
}


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
    const {background_animation, background_animation_options = {}} = props;
    const {accent = '#ffffff'} = background_animation_options;

    if (background_animation === 'free/ambient_glow') {
      const audio = container.querySelector('.wpmg-audio');
      const backgroundLayer = container.querySelector('.wpmg-bg-layer');

      if (backgroundLayer && audio) {
        const ambientClass = createAnimationStyle('wpmg-bg--ambient', (c) => `
          .${c} {
            position:absolute;inset:0;pointer-events:none;z-index:40;
          }
          .${c} .wpmg-bg--ambient-light {
            position:absolute;
            width:70%;
            height:70%;
            filter:blur(50px);
            opacity:0.2;
            transition:opacity .12s linear,transform .12s linear;
            background:radial-gradient(circle,var(--glow-color) 0%, transparent 90%);
          }
          .${c} .wpmg-bg--ambient-light__tl {top:2.5%;left:-2.5%;}
          .${c} .wpmg-bg--ambient-light__tr {top:2.5%;right:-2.5%;}
          .${c} .wpmg-bg--ambient-light__bl {bottom:2.5%;left:-2.5%;}
          .${c} .wpmg-bg--ambient-light__br {bottom:2.5%;right:-2.5%;}
        `);

        backgroundLayer.innerHTML = `
          <div class="${ambientClass}">
            <div class="wpmg-bg--ambient-light wpmg-bg--ambient-light__tl"></div>
            <div class="wpmg-bg--ambient-light wpmg-bg--ambient-light__tr"></div>
            <div class="wpmg-bg--ambient-light wpmg-bg--ambient-light__bl"></div>
            <div class="wpmg-bg--ambient-light wpmg-bg--ambient-light__br"></div>
          </div>`;

        const ambient = backgroundLayer.querySelector(`.${ambientClass}`);
        const lights = ambient.querySelectorAll('.wpmg-bg--ambient-light');

        const rgb = hexToRgb(accent);
        const baseColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

        lights.forEach((el) => {
          el.style.setProperty("--glow-color", baseColor);
        });

        const [analyser, ctx, data] = initAudioSource(audio, index);

        let smoothBass = 0;
        let smoothMid = 0;
        let smoothHigh = 0;
        const smoothing = 0.12;

        let animFrame;

        function animate() {
          analyser.getByteFrequencyData(data);

          const bass = avgRange(data, 0, 40) / 255;
          const mid = avgRange(data, 40, 80) / 255;
          const high = avgRange(data, 80, 256) / 255;

          smoothBass = smoothBass * (1 - smoothing) + bass * smoothing;
          smoothMid = smoothMid * (1 - smoothing) + mid * smoothing;
          smoothHigh = smoothHigh * (1 - smoothing) + high * smoothing;

          ambient.querySelector('.wpmg-bg--ambient-light__tl').style.opacity = 0.2 + smoothMid;
          ambient.querySelector('.wpmg-bg--ambient-light__tr').style.opacity = 0.2 + smoothHigh;
          ambient.querySelector('.wpmg-bg--ambient-light__bl').style.opacity = 0.2 + smoothBass;
          ambient.querySelector('.wpmg-bg--ambient-light__br').style.opacity = 0.2 + smoothHigh;

          requestAnimationFrame(animate);
        }

        audio.addEventListener('play', () => {
          ctx.resume().then(() => animate());
        });

        return () => cancelAnimationFrame(animFrame);
      }
    }
  }
};
