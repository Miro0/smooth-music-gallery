import { createAnimationStyle } from '../block/utils/style';
import {
	registerGalleryHook,
	registerGalleryInitializer,
} from '../block/utils/runtime';

const attachBackgroundAnimation = ( container, index ) => {
	const registration = registerGalleryHook(
		container,
		index,
		'initBackground',
		attachBackgroundAnimation
	);
	index = registration.index;

	if ( ! registration.active ) {
		return;
	}

	const props = JSON.parse( container.dataset.props || '{}' );
	const { background, background_options = {}, photos = [] } = props;
	const { blur = 10, zoom = 1.2, opacity = 0.5 } = background_options;

	if ( background !== 'blurred_photos' ) {
		return;
	}

	const backgroundLayer = container.querySelector( '.smoothmg-bg-layer' );

	if ( ! backgroundLayer ) {
		return;
	}

	const blurredPhotosClass = createAnimationStyle(
		'smoothmg-bg--blurred-photos',
		( c ) => `
    .${ c } {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 40;
      overflow: hidden;
      opacity: ${ opacity };
    }

    .${ c } img {
      position: absolute;
      top: 0;
      left: 0;
      object-fit: cover;
      width: 100%;
      height: 100%;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .${ c } img.visible {
      opacity: 1;
    }
  `
	);

	backgroundLayer.innerHTML = `
    <div class="${ blurredPhotosClass }">
      ${ photos
			.map(
				( photo, photoIndex ) => `
        <img
          data-bg-index="${ photoIndex }"
          alt="${ photo?.alt ?? 'Background photo ' + ( photoIndex + 1 ) }"
          src="${ photo.url }"
          loading="lazy"
          decoding="async"
          style="filter: blur(${ blur }px); transform: scale(${ zoom });"
        />
      `
			)
			.join( '' ) }
    </div>
  `;

	const initialSlide = container.querySelector(
		`.${ blurredPhotosClass } img[data-bg-index="0"]`
	);
	if ( initialSlide ) {
		initialSlide.classList.add( 'visible' );
	}

	const onSlideChange = ( newIndex ) => {
		const imgs = container.querySelectorAll(
			`.${ blurredPhotosClass } img`
		);

		imgs.forEach( ( img ) => img.classList.remove( 'visible' ) );

		const active = container.querySelector(
			`.${ blurredPhotosClass } img[data-bg-index="${ newIndex }"]`
		);
		if ( active ) {
			active.classList.add( 'visible' );
		}
	};

	registration.instance.onSlideChange = onSlideChange;

	registration.setCleanup( () => {
		if ( registration.instance.onSlideChange === onSlideChange ) {
			registration.instance.onSlideChange = null;
		}
	} );
};

registerGalleryInitializer( attachBackgroundAnimation );
