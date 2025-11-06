export const initWpMusicGallery = (container) => {
  const props = JSON.parse(container.dataset.props || '{}');
  const { photos = [], music, theme = 'default' } = props;

  container.classList.add(`theme-${theme}`);

  container.innerHTML = `
    <div class="wpmg-bg-layer"></div>
    <div class="wpmg-overlay-layer"></div>
    <div class="wpmg-content">
      <div class="wpmg-image-container swiper">
        <div class="swiper-wrapper">
          ${photos.map(photo => `
            <div class="swiper-slide">
              <img src="${photo.url}" alt="${photo.alt || ''}" />
            </div>
          `).join('')}
        </div>
        <div class="swiper-pagination"></div>
      </div>
      <div class="wpmg-controls">
        <button class="wpmg-btn wpmg-play" aria-label="Play / Pause">
          <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </button>
        <button class="wpmg-btn wpmg-fullscreen" aria-label="Fullscreen">
          <svg viewBox="0 0 24 24"><path d="M7 14h2v3h3v2H7v-5zM14 7h3v3h2V5h-5v2z"/></svg>
        </button>
      </div>
    </div>
    ${music ? `<audio class="wpmg-audio" preload="auto" src="${music.url}"></audio>` : ''}
  `;

  const swiper = new Swiper(container.querySelector('.swiper'), {
    loop: true,
    pagination: {
      el: container.querySelector('.swiper-pagination'),
      clickable: true
    },
  });

  initControls(container, swiper);
}

function initControls(container, swiper) {
  const btnPlay = container.querySelector('.wpmg-play');
  const btnFs = container.querySelector('.wpmg-fullscreen');
  const audio = container.querySelector('audio');
  let playing = false;

  btnPlay.addEventListener('click', () => {
    playing = !playing;
    if (playing) {
      swiper.autoplay?.start?.();
      audio?.play();
      btnPlay.innerHTML = `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`; // pause icon
    } else {
      swiper.autoplay?.stop?.();
      audio?.pause();
      btnPlay.innerHTML = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`; // play icon
    }
  });

  btnFs.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  });
}
