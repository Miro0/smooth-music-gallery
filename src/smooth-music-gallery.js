import Swiper from 'swiper';
import {Pagination, Autoplay, Keyboard} from 'swiper/modules';
import {hexToRgb} from "./block/utils/style";
import 'swiper/css';
import 'swiper/css/pagination';

export const initMusicGallery = (container, index) => {
  const props = JSON.parse(container.dataset.props || '{}');
  const {photos = [], music, theme = 'default', theme_options = {}, size = 85, slides_duration = 2, background_options} = props;
  const {background_color = 'transparent'} = background_options;

  container.classList.add('visible-controls');
  container.classList.add(`theme-${theme.replace(/free\/|pro\//, '')}`);
  const bgMargin = Math.floor((100 - size) / 4);

  container.innerHTML = `
    ${music?.url ? `<div class="mg-bg-layer" style="background:${background_color}"></div>` : ''}
    <div class="mg-content" style="width:${size}%; height:${size}%;margin-top:${bgMargin}%;margin-bottom:${bgMargin}%">
      ${music?.url ? `<div class="mg-overlay-layer"></div>` : ''}
      <div class="mg-image-container">
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
      <div class="mg-controls">
        <div class="swiper-pagination--wrapper">
          <div class="swiper-pagination"></div>
        </div>
      
        <div class="mg-music-meta">
          <div class="mg-music-title">${music?.title || music?.filename || music?.name || 'Select background music'}</div>
        </div>

        <div class="mg-music-progress">
          <div class="mg-music-progress-bar">
            <div class="mg-music-progress-fill"></div>
          </div>
          <div class="mg-music-times">
            <span class="mg-music-time-current">0:00</span>
            <span class="mg-music-time-total">0:00</span>
          </div>
        </div>
        
        <div class="mg-volume--wrapper">
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value="1" 
            class="mg-volume"
            aria-label="Volume"
            title="Volume"
          >
        </div>
        <div class="mg-btn--wrapper">
          <button class="mg-btn mg-btn--small mg-prev" aria-label="Previous">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6,18V6H8V18H6M9.5,12L18,6V18L9.5,12Z" /></svg>
          </button>
          <button class="mg-btn mg-play" aria-label="Play / Pause">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M8,5.14V19.14L19,12.14L8,5.14Z" /></svg>
          </button>
          <button class="mg-btn mg-btn--small mg-next" aria-label="Next">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M16,18H18V6H16M6,18L14.5,12L6,6V18Z" /></svg>
          </button>
        </div>
        <button class="mg-btn mg-fullscreen" aria-label="Fullscreen">
          <svg class="mg-icon--expand" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10,21V19H6.41L10.91,14.5L9.5,13.09L5,17.59V14H3V21H10M14.5,10.91L19,6.41V10H21V3H14V5H17.59L13.09,9.5L14.5,10.91Z" /></svg>
          <svg class="mg-icon--collapse" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19.5,3.09L15,7.59V4H13V11H20V9H16.41L20.91,4.5L19.5,3.09M4,13V15H7.59L3.09,19.5L4.5,20.91L9,16.41V20H11V13H4Z" /></svg>
        </button>
      </div>
    </div>
    ${music?.url ? `<audio class="mg-audio" preload="auto" crossorigin="anonymous" loop src="${music.url}"></audio>` : ''}
  `;

  const themeAccentRGB = hexToRgb(theme_options?.accent ?? '#ffffff');
  const themeFrameRGB = hexToRgb(theme_options?.frame_color ?? '#111111');

  container.style.setProperty('--screen-ratio', window.innerWidth / window.innerHeight);
  container.style.setProperty('--mg-slides-duration', slides_duration);
  container.style.setProperty('--mg-theme-accent', theme_options?.accent ?? '#ffffff');
  container.style.setProperty('--mg-theme-accent--opacity', `rgba(${themeAccentRGB.r},${themeAccentRGB.g},${themeAccentRGB.b},0.5)`);
  container.style.setProperty('--mg-theme-accent--opacity-light', `rgba(${themeAccentRGB.r},${themeAccentRGB.g},${themeAccentRGB.b},0.2)`);
  container.style.setProperty('--mg-theme-frame', theme_options?.frame_color ?? '#111111');
  container.style.setProperty('--mg-theme-frame--opacity', `rgba(${themeFrameRGB.r},${themeFrameRGB.g},${themeFrameRGB.b},0.8)`);

  if (!window.mg) {
    window.mg = [];
  }

  if (window.mg[index]) {
    window.mg[index].initialized = true;
  } else {
    window.mg[index] = {initialized: true, source: null};
  }

  if (window.mg[index]?.initOverlay) {
    window.mg[index].initOverlay(container, index);
  }
  if (window.mg[index]?.initBackground) {
    window.mg[index].initBackground(container, index);
  }

  window.mg[index].swiper = new Swiper(container.querySelector('.mg-image-container'), {
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
        window.mg[index].swiper.update();
      },
      realIndexChange() {
        const activeIndex = window.mg[index].swiper.realIndex;

        if (window.mg[index]?.onSlideChange) {
          window.mg[index]?.onSlideChange(activeIndex);
        }

        if (window.mg[index]?.swiper) {
          const bullets = window.mg[index].swiper.pagination.bullets;

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

          if (theme === 'playlist') {
            const pagination = container.querySelector('.swiper-pagination');
            if (pagination) {
              pagination.scrollTop = bullets[0].clientHeight * activeIndex;
            }
          }
        }
      }
    },
  });

  if (theme === 'playlist') {
    const bullets = window.mg[index].swiper.pagination.bullets;
    bullets.forEach((bullet, bulletIndex) => {
      bullet.innerText = photos[bulletIndex].url.split('/').pop().split('\\').pop().split('.').slice(0, -1).join('.');
    });
  }

  const imgs = container.querySelectorAll('img[loading="lazy"]');
  let loadedCount = 0;
  imgs.forEach((img) => {
    img.addEventListener('load', () => {
      loadedCount++;
      if (loadedCount === imgs.length) {
        window.mg[index].swiper.update();
      }
    });
  });

  window.addEventListener('resize', () => {
    container.style.setProperty('--screen-ratio', window.innerWidth / window.innerHeight);
  });

  initControls(container, window.mg[index].swiper, slides_duration, index);
};

function initControls(container, swiper, slides_duration, index) {
  const content = container.querySelector('.mg-content');
  const btnPlay = container.querySelector('.mg-play');
  const btnPrev = container.querySelector('.mg-prev');
  const btnNext = container.querySelector('.mg-next');
  const btnFullscreen = container.querySelector('.mg-fullscreen');
  const audio = container.querySelector('.mg-audio');
  const volumeSlider = container.querySelector('.mg-volume');
  const bar = container.querySelector('.mg-music-progress-bar');
  const fill = container.querySelector('.mg-music-progress-fill');
  const current = container.querySelector('.mg-music-time-current');
  const total = container.querySelector('.mg-music-time-total');

  if (audio && volumeSlider) {
    volumeSlider.value = 0.8;
    volumeSlider.addEventListener('input', () => {
      if (window.mg[index].gain) {
        window.mg[index].gain.gain.value = parseFloat(volumeSlider.value);
      }
    });
  }

  if (audio && total) {
    audio.addEventListener('loadedmetadata', () => {
      total.textContent = format(audio.duration);
    });
  }

  if (audio && fill) {
    audio.addEventListener('timeupdate', () => {
      const p = (audio.currentTime / audio.duration) * 100;
      fill.style.width = `${p}%`;
      current.textContent = format(audio.currentTime);
    });
  }

  if (bar) {
    let isSeeking = false;

    function updateSeek(e) {
      const rect = bar.getBoundingClientRect();
      const x = Math.min(Math.max(e.clientX - rect.left, 0), rect.width);
      const pct = x / rect.width;

      fill.style.width = `${pct * 100}%`;

      if (audio.duration && isSeeking) {
        const newTime = audio.duration * pct;
        current.textContent = format(newTime);
        audio.currentTime = newTime;
      }
    }

    bar.addEventListener('pointerdown', (e) => {
      isSeeking = true;
      bar.setPointerCapture(e.pointerId);
      updateSeek(e);
    });

    bar.addEventListener('pointermove', (e) => {
      if (isSeeking) updateSeek(e);
    });

    bar.addEventListener('pointerup', (e) => {
      isSeeking = false;
      bar.releasePointerCapture(e.pointerId);
    });

    bar.addEventListener('pointerleave', () => {
      isSeeking = false;
    });
  }

  function format(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' + s : s}`;
  }

  let playing = false;
  let controlsTimeout = null;
  const pausePlayback = () => {
    if (!playing) {
      return;
    }

    playing = false;
    swiper.autoplay.stop();
    audio?.pause();

    btnPlay?.classList.remove("is-loading");
    if (btnPlay) {
      btnPlay.innerHTML = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
    }

    container.classList.remove('is-playing');
  };
  const pauseOtherInstances = () => {
    window.mg?.forEach((instance, instanceIndex) => {
      if (instanceIndex !== index && typeof instance?.pause === 'function') {
        instance.pause();
      }
    });
  };

  window.mg[index].pause = pausePlayback;

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
        pausePlayback();
        return;
      }

      pauseOtherInstances();
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
        container.classList.add('mg--fullscreen');
      } else {
        document.exitFullscreen();
        container.classList.remove('mg--fullscreen');
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
