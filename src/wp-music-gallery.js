import Swiper from 'swiper';
import {Pagination, Autoplay, Keyboard} from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

export const initWpMusicGallery = (container, index) => {
  const props = JSON.parse(container.dataset.props || '{}');
  const {photos = [], music, theme = 'default', size = 85, slides_duration = 2, background_options} = props;
  const {background_color = 'transparent'} = background_options;

  container.classList.add('visible-controls');
  container.classList.add(`theme-${theme.replace(/free\/|pro\//, '')}`);

  container.innerHTML = `
    ${music?.url ? `<div class="wpmg-bg-layer" style="background:${background_color}"></div>` : ''}
    <div class="wpmg-content" style="width:${size}%; height:${size}%;">
      ${music?.url ? `<div class="wpmg-overlay-layer"></div>` : ''}
      <div class="wpmg-image-container">
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
        <div class="swiper-pagination--wrapper">
          <div class="swiper-pagination"></div>
        </div>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          value="1" 
          class="wpmg-volume"
          aria-label="Volume"
          title="Volume"
        >
        <div class="wpmg-btn--wrapper">
          <button class="wpmg-btn wpmg-btn--small wpmg-prev" aria-label="Previous">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6,18V6H8V18H6M9.5,12L18,6V18L9.5,12Z" /></svg>
          </button>
          <button class="wpmg-btn wpmg-play" aria-label="Play / Pause">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M8,5.14V19.14L19,12.14L8,5.14Z" /></svg>
          </button>
          <button class="wpmg-btn wpmg-btn--small wpmg-next" aria-label="Next">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M16,18H18V6H16M6,18L14.5,12L6,6V18Z" /></svg>
          </button>
        </div>
        <button class="wpmg-btn wpmg-fullscreen" aria-label="Fullscreen">
          <svg class="wpmg-icon--expand" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10,21V19H6.41L10.91,14.5L9.5,13.09L5,17.59V14H3V21H10M14.5,10.91L19,6.41V10H21V3H14V5H17.59L13.09,9.5L14.5,10.91Z" /></svg>
          <svg class="wpmg-icon--collapse" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19.5,3.09L15,7.59V4H13V11H20V9H16.41L20.91,4.5L19.5,3.09M4,13V15H7.59L3.09,19.5L4.5,20.91L9,16.41V20H11V13H4Z" /></svg>
        </button>
      </div>
    </div>
    ${theme === 'free/video_player' ? `<style>.wpmg-gallery.theme-video_player.is-playing .swiper-pagination-bullet-active::after {transition: transform linear ${slides_duration}s;}</style>` : ''}
    ${music?.url ? `<audio class="wpmg-audio" preload="auto" loop src="${music.url}"></audio>` : ''}
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

  window.wpmg[index].swiper = new Swiper(container.querySelector('.wpmg-image-container'), {
    modules: [Pagination, Autoplay, Keyboard],

    loop: true,
    observer: true,
    observeParents: true,
    watchSlidesProgress: true,
    preloadImages: false,
    speed: 300,

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
        window.wpmg[index].swiper.update();
      },
      realIndexChange() {
        const activeIndex = window.wpmg[index].swiper.realIndex;

        if (window.wpmg[index]?.onSlideChange) {
          window.wpmg[index]?.onSlideChange(activeIndex);
        }

        if (window.wpmg[index]?.swiper) {
          const bullets = window.wpmg[index].swiper.pagination.bullets;

          bullets.forEach((bullet) => {
            bullet.classList.remove('swiper-pagination-bullet-active');
            bullet.classList.remove('swiper-pagination-bullet-before-active');
          });

          requestAnimationFrame(() => {
            bullets.forEach((bullet, index) => {
              if (index < activeIndex) {
                bullet.classList.add('swiper-pagination-bullet-before-active');
              } else if (index === activeIndex) {
                bullet.classList.add('swiper-pagination-bullet-active');
              }
            });
          });
        }
      }
    },
  });

  const imgs = container.querySelectorAll('img[loading="lazy"]');
  let loadedCount = 0;
  imgs.forEach((img) => {
    img.addEventListener('load', () => {
      loadedCount++;
      if (loadedCount === imgs.length) {
        window.wpmg[index].swiper.update();
      }
    });
  });

  initControls(container, window.wpmg[index].swiper, slides_duration, index);
};

function initControls(container, swiper, slides_duration, index) {
  const content = container.querySelector('.wpmg-content');
  const btnPlay = container.querySelector('.wpmg-play');
  const btnPrev = container.querySelector('.wpmg-prev');
  const btnNext = container.querySelector('.wpmg-next');
  const btnFullscreen = container.querySelector('.wpmg-fullscreen');
  const audio = container.querySelector('.wpmg-audio');
  const volumeSlider = container.querySelector('.wpmg-volume');

  if (audio && volumeSlider) {
    volumeSlider.value = 0.8;
    volumeSlider.addEventListener('input', () => {
      if (window.wpmg[index].gain) {
        window.wpmg[index].gain.gain.value = parseFloat(volumeSlider.value);
      }
    });
  }

  let playing = false;
  let controlsTimeout = null;

  window.addEventListener('pointermove', (event) => {
    if (container.classList.contains('visible-controls')) return;

    const rect = content.getBoundingClientRect();

    if (
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom
    ) {
      clearTimeout(controlsTimeout);
      container.classList.add('visible-controls');
      controlsTimeout = setTimeout(() => {
        container.classList.remove('visible-controls');
      }, 3000);
    }
  }, {passive: true});

  if (btnPlay) {
    btnPlay.addEventListener('click', async () => {
      if (playing) {
        playing = false;

        swiper.autoplay.stop();
        audio?.pause();
        // audio.currentTime = 0; // Time reset.

        btnPlay.innerHTML = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;

        container.classList.remove('is-playing');
        return;
      }

      playing = true;

      container.classList.add('is-playing');
      btnPlay.classList.add("is-loading");

      swiper.params.autoplay = {
        delay: slides_duration * 1000,
        disableOnInteraction: false,
      };

      swiper.autoplay.start();
      audio?.play();

      btnPlay.classList.remove("is-loading");

      btnPlay.innerHTML = `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;

      container.classList.add('visible-controls');
      controlsTimeout = setTimeout(() => {
        container.classList.remove('visible-controls');
      }, 1000);
    });
  }

  if (btnFullscreen) {
    btnFullscreen.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        container.requestFullscreen();
        container.classList.add('wpmg--fullscreen');
      } else {
        document.exitFullscreen();
        container.classList.remove('wpmg--fullscreen');
      }

      const activeBullet = container.querySelector('.swiper-pagination-bullet-active');
      if (activeBullet) {
        activeBullet.classList.remove('swiper-pagination-bullet-active');
        requestAnimationFrame(() => {
          activeBullet.classList.add('swiper-pagination-bullet-active');
        });
      }
    });
  }

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      swiper?.slidePrev();
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      swiper?.slideNext();
    });
  }
}

