import { initMusicGallery } from '../smooth-music-gallery';
import { registerGalleryInitializer } from './utils/runtime';

registerGalleryInitializer( ( gallery, index ) => {
	if (
		window?.mg?.[ index ]?.initialized &&
		window?.mg?.[ index ]?.container === gallery
	) {
		return;
	}

	initMusicGallery( gallery, index );
} );
