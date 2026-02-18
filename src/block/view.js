import {initMusicGallery} from "../smooth-music-gallery";

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.mg-gallery').forEach((gallery, index) => initMusicGallery(gallery, index));
});
