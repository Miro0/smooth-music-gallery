import {initMusicGallery} from "../smooth-music-gallery";

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.smoothmg-gallery').forEach((gallery, index) => initMusicGallery(gallery, index));
});
