import Swiper from 'swiper';
import {createAnimationStyle} from "../../block/utils/style";

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.wpmg-gallery').forEach((gallery, index) => attachBackgroundAnimation(gallery, index));
});

const attachBackgroundAnimation = (container, index) => {
  if (!window?.wpmg) {
    window.wpmg = [];
  }

  if (!window?.wpmg[index]) {
    window.wpmg[index] = {initBackground: attachBackgroundAnimation, source: null};
  } else if (!window?.wpmg[index]?.initialized) {
    window.wpmg[index].initBackground = attachBackgroundAnimation;
  } else {
    const props = JSON.parse(container.dataset.props || '{}');
    const {background, background_options = {}, photos = []} = props;
    const {blur = 10, zoom = 1.2, opacity = 0.5} = background_options;

    if (background === 'free/blurred_photos') {
      const backgroundLayer = container.querySelector('.wpmg-bg-layer');

      if (backgroundLayer) {
        const blurredPhotosClass = createAnimationStyle('wpmg-bg--blurred-photos', (c) => `
          .${c} {
            position: absolute;
            inset: 0;
            pointer-events: none;
            z-index: 40;
            overflow: hidden;
            opacity: ${opacity};   
          }
          
          .${c} img {
            position: absolute;
            top: 0;
            left: 0;
            object-fit: cover;
            width: 100%;
            height: 100%;
            opacity: 0;
            transition: opacity 0.6s ease;
          }
          
          .${c} img.visible {
            opacity: 1;
          }
        `);

        backgroundLayer.innerHTML = `
          <div class="${blurredPhotosClass}">
            ${photos.map((photo, index) => `
              <img
                data-bg-index="${index}"
                alt="${photo?.alt ?? 'Background photo ' + (index + 1)}"
                src="${photo.url}"
                loading="lazy"
                decoding="async"
                style="filter: blur(${blur}px); transform: scale(${zoom});"
              />
            `).join('')}
          </div>
        `;


        window.wpmg[index].onSlideChange = (newIndex) => {
          const imgs = container.querySelectorAll(`.${blurredPhotosClass} img`);

          imgs.forEach(img => img.classList.remove('visible'));

          const active = container.querySelector(`.${blurredPhotosClass} img[data-bg-index="${newIndex}"]`);
          if (active) {
            active.classList.add('visible');
          }
        }
      }
    }
  }
};
