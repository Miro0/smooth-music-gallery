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
    window.wpmg[index] = { initOverlay: attachOverlayAnimation, source: null };
  } else if (!window?.wpmg[index]?.initialized) {
    window.wpmg[index].initOverlay = attachOverlayAnimation;
  } else {
    const props = JSON.parse(container.dataset.props || '{}');
    const { overlay, overlay_options = {} } = props;
    const {
      accent = '#ffffff',
      opacity = 0.5,
      intensity = 1,
      position = 0,
      line_height = 4,
      start_position = 0,
      speed = 0.2,
    } = overlay_options;

    if (overlay === 'pro/heartbeat_line') {
      const audio = container.querySelector('.wpmg-audio');
      const overlayLayer = container.querySelector('.wpmg-overlay-layer');

      if (!overlayLayer || !audio) return;

      // ILOŚĆ SEGMENTÓW – ZAOKRĄGLONA
      const segments = Math.max(4, Math.floor(container.getBoundingClientRect().width));

      const heartbeatClass = createAnimationStyle('wpmg-overlay--wave-lines', (c) => `
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
      const offsetY = (position / 100) * containerHeight;

      overlayLayer.innerHTML = `
        <div class="${heartbeatClass}" style="opacity:${opacity}">
          ${`<div class="wpmg-overlay--line-segment" style="transform:translateY(${offsetY}px)"></div>`.repeat(segments)}
        </div>
      `;

      const lineSegments = Array.from(
        overlayLayer.querySelectorAll('.wpmg-overlay--line-segment')
      );
      const realSegments = lineSegments.length || 1;

      const [analyser, ctx, data] = initAudioSource(audio, index);

      let animFrame;

      // 🔸 STAŁY PUNKT ODCZYTU (jak igła sejsmografu)
      const midIndex = Math.floor(realSegments / 2);
      const offsetIndex = Math.round((start_position / 50) * midIndex);
      const readIndex = Math.min(realSegments - 1, Math.max(0, midIndex + offsetIndex));

      // 🔸 Historia amplitudy – po lewej stronie od readIndex
      const history = new Array(realSegments).fill(0);

      function animate() {
        analyser.getByteFrequencyData(data);

        let sum = 0, count = 0;
        for (let i = 10; i < 50 && i < data.length; i++) {
          sum += data[i];
          count++;
        }
        const avg = count ? sum / count : 0;
        const amp = (avg / 255) * 120 * intensity;

        const shift = Math.max(1, Math.round(speed));

        // 🚨 1. PRZESUNIĘCIE HISTORII W LEWO TYLKO DO readIndex
        for (let i = 0; i < readIndex; i++) {
          history[i] = history[i + shift];
        }

        // 🚨 2. NOWY ODCZYT — wpisujemy amplitudę TYLKO DO readIndex
        history[readIndex] = amp;

        // 🚨 3. PRAWA STRONA — ZAWSZE ZERA
        for (let i = readIndex + shift; i < realSegments; i++) {
          history[i] = shift;
        }

        // 🚨 4. RYSOWANIE
        for (let i = 0; i < realSegments; i++) {
          const y = -history[i]; // wychylenie
          lineSegments[i].style.transform = `translateY(${y + offsetY}px)`;
        }

        animFrame = requestAnimationFrame(animate);
      }



      audio.addEventListener('play', () => {
        ctx.resume().then(() => animate());
      });

      return () => cancelAnimationFrame(animFrame);
    }
  }
};
