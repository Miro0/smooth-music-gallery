import { createAnimationStyle } from '../block/utils/style';
import { initAudioSource } from '../block/utils/audio';
import { createAudioReactiveAnimator } from '../block/utils/performance';
import {
	registerGalleryHook,
	registerGalleryInitializer,
} from '../block/utils/runtime';

const attachOverlayAnimation = ( container, index ) => {
	const registration = registerGalleryHook(
		container,
		index,
		'initOverlay',
		attachOverlayAnimation
	);
	index = registration.index;

	if ( ! registration.active ) {
		return;
	}

	const props = JSON.parse( container.dataset.props || '{}' );
	const { overlay, overlay_options = {} } = props;
	const { accent = '#ffffff', blend_mode = 'multiply' } = overlay_options;

	if ( overlay !== 'color_blend' ) {
		return;
	}

	const audio = container.querySelector( '.smoothmg-audio' );
	const imageLayer = container.querySelector( '.smoothmg-image-container' );

	if ( ! imageLayer || ! audio ) {
		return;
	}

	const imageLayerClass = createAnimationStyle(
		'imageLayer',
		( c ) => `
    .${ c } {
      position: absolute;
      inset: 0;
      pointer-events: none;
      overflow: hidden;
    }

    .${ c } .smoothmg-overlay--color-blend__layer {
      position: absolute;
      inset: 0;
      background: ${ accent };
      opacity: 0.1;
      mix-blend-mode: ${ blend_mode };
      pointer-events: none;
      will-change: opacity, background;
    }
  `
	);

	let overlayRoot = imageLayer.querySelector( `.${ imageLayerClass }` );
	if ( ! overlayRoot ) {
		overlayRoot = document.createElement( 'div' );
		overlayRoot.className = imageLayerClass;
		overlayRoot.innerHTML =
			'<div class="smoothmg-overlay--color-blend__layer"></div>';
		imageLayer.appendChild( overlayRoot );
	}

	const layer = overlayRoot.querySelector(
		'.smoothmg-overlay--color-blend__layer'
	);
	if ( ! layer ) return;

	const [ analyser, ctx, data ] = initAudioSource( audio, index );

	const renderFrame = () => {
		analyser.getByteFrequencyData( data );

		let avg = 0;
		for ( let i = 0; i < data.length; i++ ) avg += data[ i ];
		avg = avg / data.length / 255;

		const reactiveOpacity = Math.min( 0.85, avg * 1.8 );
		layer.style.opacity = reactiveOpacity.toFixed( 3 );
	};

	const animator = createAudioReactiveAnimator( {
		audio,
		isVisible: true,
		render: renderFrame,
		onStart: () => {
			ctx.resume();
		},
		onStop: () => {
			layer.style.opacity = 0.1;
		},
		mobileFps: 30,
		desktopFps: 60,
	} );
	animator.sync();

	registration.setCleanup( () => {
		animator.dispose();

		if ( overlayRoot && overlayRoot.parentNode ) {
			overlayRoot.parentNode.removeChild( overlayRoot );
		}
	} );
};

registerGalleryInitializer( attachOverlayAnimation );
