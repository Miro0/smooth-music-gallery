import {initWpMusicGallery} from "../common/front/core";

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.wpmg-gallery').forEach(initWpMusicGallery);
});
