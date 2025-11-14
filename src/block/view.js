import {initWpMusicGallery} from "../wp-music-gallery";

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.wpmg-gallery').forEach(initWpMusicGallery);
});
