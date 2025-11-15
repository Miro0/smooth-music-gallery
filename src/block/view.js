import {initWpMusicGallery} from "../wp-music-gallery";

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.wpmg-gallery').forEach((gallery, index) => initWpMusicGallery(gallery, index));
});
