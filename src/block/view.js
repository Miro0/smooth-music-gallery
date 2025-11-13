import {initWpMusicGallery} from "./front/core";

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.wpmg-gallery').forEach(initWpMusicGallery);
});
