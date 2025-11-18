import Swiper from 'swiper';
import {Pagination, Autoplay, Keyboard} from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

export const initWpMusicGallery = (container, index) => {
  const props = JSON.parse(container.dataset.props || '{}');
  const {photos = [], music, theme = 'default', slides_duration = 2} = props;

  container.classList.add('visible-controls');
  container.classList.add(`theme-${theme.replace(/free\/|pro\//, '')}`);

  container.innerHTML = `
    ${music?.url ? `<div class="wpmg-bg-layer"></div>` : ''}
    <div class="wpmg-content">
      ${music?.url ? `<div class="wpmg-overlay-layer"></div>` : ''}
      <div class="wpmg-image-container swiper">
      <div class="swiper-wrapper">
        ${photos
    .map(
      (photo) => `
              <div class="swiper-slide">
                <img 
                  src="${photo.url}" 
                  alt="${photo.alt || ''}" 
                  loading="lazy" 
                  decoding="async" 
                  style="object-fit: cover; width: 100%; height: 100%;" 
                />
              </div>
            `
    )
    .join('')}
        </div>
      </div>
      <div class="wpmg-controls">
        <div class="swiper-pagination"></div>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          value="1" 
          orient="vertical"
          class="wpmg-volume"
        >
        <button class="wpmg-btn wpmg-play" aria-label="Play / Pause">
          <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </button>
        <button class="wpmg-btn wpmg-fullscreen" aria-label="Fullscreen">
          <svg class="on" viewBox="0 0 24 24"><path d="M7 14h2v3h3v2H7v-5zM14 7h3v3h2V5h-5v2z"/></svg>
        </button>
      </div>
    </div>
    ${music?.url ? `<audio class="wpmg-audio" preload="auto" src="${music.url}"></audio>` : ''}
  `;

  if (!window.wpmg) {
    window.wpmg = [];
  }

  if (window.wpmg[index]) {
    window.wpmg[index].initialized = true;
  } else {
    window.wpmg[index] = {initialized: true, source: null};
  }

  if (window.wpmg[index]?.initOverlay) {
    window.wpmg[index].initOverlay(container, index);
  }
  if (window.wpmg[index]?.initBackground) {
    window.wpmg[index].initBackground(container, index);
  }

  const swiper = new Swiper(container.querySelector('.swiper'), {
    modules: [Pagination, Autoplay, Keyboard],

    loop: true,
    observer: true,
    observeParents: true,
    watchSlidesProgress: true,
    preloadImages: false,

    keyboard: {
      enabled: true,
      onlyInViewport: true,
    },

    pagination: {
      el: container.querySelector('.swiper-pagination'),
      clickable: true,
    },

    autoplay: false,

    on: {
      imagesReady() {
        swiper.update();
      },
    },
  });

  const imgs = container.querySelectorAll('img[loading="lazy"]');
  let loadedCount = 0;
  imgs.forEach((img) => {
    img.addEventListener('load', () => {
      loadedCount++;
      if (loadedCount === imgs.length) {
        swiper.update();
      }
    });
  });

  initControls(container, swiper, slides_duration, index);
};

function initControls(container, swiper, slides_duration, index) {
  const content = container.querySelector('.wpmg-content');
  const btnPlay = container.querySelector('.wpmg-play');
  const btnFullscreen = container.querySelector('.wpmg-fullscreen');
  const audio = container.querySelector('.wpmg-audio');
  const volumeSlider = container.querySelector('.wpmg-volume');

  if (audio && volumeSlider) {
    volumeSlider.value = 0.8;
    volumeSlider.addEventListener('input', () => {
      if (window.wpmg[index].gain) {
        window.wpmg[index].gain.gain.value = parseFloat(volumeSlider.value);
        mouseMove();
      }
    });
  }

  let playing = false;
  let controlsTimeout = null;

  const mouseMove = () => {
    clearTimeout(controlsTimeout);
    container.classList.add('visible-controls');
    controlsTimeout = setTimeout(() => {
      container.classList.remove('visible-controls');
    }, 3000);
  }

  if (btnPlay) {
    btnPlay.addEventListener('click', async () => {
      mouseMove();

      if (playing) {
        playing = false;

        swiper.autoplay.stop();
        audio?.pause();
        // audio.currentTime = 0; // Time reset.

        btnPlay.innerHTML = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;

        container.classList.add('visible-controls');
        clearTimeout(controlsTimeout);
        content.removeEventListener('mouseenter', mouseMove);
        return;
      }

      playing = true;

      btnPlay.classList.add("is-loading");

      swiper.params.autoplay = {
        delay: slides_duration * 1000,
        disableOnInteraction: false,
      };

      swiper.autoplay.start();
      audio?.play();

      btnPlay.classList.remove("is-loading");

      btnPlay.innerHTML = `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;

      controlsTimeout = setTimeout(() => {
        container.classList.remove('visible-controls');
      }, 1000);

      content.addEventListener('mouseenter', mouseMove);
    });
  }

  if (btnFullscreen) {
    btnFullscreen.addEventListener('click', () => {
      mouseMove();

      if (!document.fullscreenElement) {
        container.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    });
  }
}

