import { initAudioSource } from '../block/utils/audio';
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
	const { max_size = 20 } = overlay_options;

	if ( overlay !== 'pixelate' ) return;

	const audio = container.querySelector( '.smoothmg-audio' );
	if ( ! audio ) return;

	const imgs = [
		...container.querySelectorAll( '.smoothmg-image-container img' ),
	];
	if ( ! imgs.length ) return;

	const items = [];
	const imageLoadHandlers = [];
	const overlayLayer = container.querySelector( '.smoothmg-overlay-layer' );

	let isVisible = true;
	const observer = new window.IntersectionObserver(
		( entries ) => {
			isVisible = entries[ 0 ].isIntersecting;
		},
		{ threshold: 0.1 }
	);
	observer.observe( container );

	const syncItemSize = ( item ) => {
		const rect = item.parent.getBoundingClientRect();
		const w = rect.width;
		const h = rect.height;
		const dpr = window.devicePixelRatio || 1;

		if ( ! w || ! h ) return;

		const nextWidth = Math.max( 1, Math.round( w * dpr ) );
		const nextHeight = Math.max( 1, Math.round( h * dpr ) );

		if (
			item.canvas.width !== nextWidth ||
			item.canvas.height !== nextHeight
		) {
			item.canvas.width = nextWidth;
			item.canvas.height = nextHeight;
			item.canvas.style.width = w + 'px';
			item.canvas.style.height = h + 'px';
			item.ctx.imageSmoothingEnabled = false;
			item.ctx.setTransform( dpr, 0, 0, dpr, 0, 0 );
		}

		if (
			item.off &&
			item.octx &&
			( item.off.width !== nextWidth || item.off.height !== nextHeight )
		) {
			item.off.width = nextWidth;
			item.off.height = nextHeight;
			item.octx = item.off.getContext( '2d', { alpha: true } );
			item.octx.imageSmoothingEnabled = false;
			item.octx.setTransform( dpr, 0, 0, dpr, 0, 0 );
		}
	};
	const syncAllCanvasSizes = () => {
		items.forEach( ( item ) => syncItemSize( item ) );
	};

	imgs.forEach( ( img ) => {
		const parent = img.parentElement;

		function setup() {
			const rect = parent.getBoundingClientRect();
			if ( ! rect.width || ! rect.height ) {
				window.requestAnimationFrame( setup );
				return;
			}

			const dpr = window.devicePixelRatio || 1;

			let off = null;
			let octx = null;

			if ( window.OffscreenCanvas ) {
				off = new OffscreenCanvas(
					rect.width * dpr,
					rect.height * dpr
				);
				octx = off.getContext( '2d', { alpha: true } );
				octx.imageSmoothingEnabled = false;
				octx.setTransform( dpr, 0, 0, dpr, 0, 0 );
			}

			const canvas = document.createElement( 'canvas' );
			canvas.width = rect.width * dpr;
			canvas.height = rect.height * dpr;
			canvas.style.width = rect.width + 'px';
			canvas.style.height = rect.height + 'px';
			canvas.style.position = 'absolute';
			canvas.style.top = '0';
			canvas.style.left = '0';
			canvas.style.pointerEvents = 'none';
			canvas.style.zIndex = '10';

			const ctx = canvas.getContext( '2d' );
			ctx.imageSmoothingEnabled = false;
			ctx.setTransform( dpr, 0, 0, dpr, 0, 0 );

			parent.style.position = 'relative';
			parent.appendChild( canvas );

			items.push( {
				img,
				parent,
				canvas,
				ctx,
				off,
				octx,
			} );

			syncItemSize( items[ items.length - 1 ] );
		}

		if ( ! img.complete || img.naturalWidth === 0 ) {
			img.addEventListener( 'load', setup );
			imageLoadHandlers.push( [ img, setup ] );
		} else {
			setup();
		}
	} );

	const [ analyser, audioCtx, data ] = initAudioSource( audio, index );

	const tmp = window.OffscreenCanvas
		? new OffscreenCanvas( 1, 1 )
		: document.createElement( 'canvas' );
	const tctx = tmp.getContext( '2d' );
	tctx.imageSmoothingEnabled = false;

	window.addEventListener( 'resize', syncAllCanvasSizes );
	document.addEventListener( 'fullscreenchange', syncAllCanvasSizes );
	const resizeObserver =
		window.ResizeObserver &&
		overlayLayer &&
		new window.ResizeObserver( () => syncAllCanvasSizes() );
	resizeObserver?.observe( overlayLayer );

	let animFrame = null;

	function drawPixel( item, pixelSize ) {
		const { img, parent, ctx, off, octx } = item;
		const rect = parent.getBoundingClientRect();
		const w = rect.width;
		const h = rect.height;

		if ( w === 0 || h === 0 ) return;

		syncItemSize( item );

		const sw = img.naturalWidth;
		const sh = img.naturalHeight;
		if ( ! sw || ! sh ) return;

		const dstRatio = w / h;
		const srcRatio = sw / sh;

		let sx;
		let sy;
		let sWidth;
		let sHeight;
		if ( srcRatio > dstRatio ) {
			sHeight = sh;
			sWidth = sHeight * dstRatio;
			sx = ( sw - sWidth ) / 2;
			sy = 0;
		} else {
			sWidth = sw;
			sHeight = sw / dstRatio;
			sx = 0;
			sy = ( sh - sHeight ) / 2;
		}

		const smallW = Math.max( 1, Math.floor( w / pixelSize ) );
		const smallH = Math.max( 1, Math.floor( h / pixelSize ) );

		tmp.width = smallW;
		tmp.height = smallH;

		tctx.clearRect( 0, 0, smallW, smallH );
		tctx.drawImage( img, sx, sy, sWidth, sHeight, 0, 0, smallW, smallH );

		ctx.clearRect( 0, 0, w, h );

		ctx.drawImage( tmp, 0, 0, smallW, smallH, 0, 0, w, h );

		if ( off && octx ) {
			octx.clearRect( 0, 0, w, h );
			octx.drawImage( tmp, 0, 0, smallW, smallH, 0, 0, w, h );
			ctx.clearRect( 0, 0, w, h );
			ctx.drawImage( off, 0, 0, w, h );
		}
	}

	function animate() {
		if ( ! isVisible ) {
			animFrame = window.requestAnimationFrame( animate );
			return;
		}

		analyser.getByteFrequencyData( data );
		let sum = 0;
		for ( let i = 10; i < 40; i++ ) sum += data[ i ];
		const avg = sum / 30;

		const pixelSize = 2 + Math.pow( avg / 255, 1.4 ) * max_size;

		const activeIndex =
			window?.mg[ index ]?.swiper?.realIndex ||
			window?.mg[ index ]?.swiper?.activeIndex ||
			0;

		items.forEach( ( item ) => {
			if (
				item?.parent?.dataset?.swiperSlideIndex !== undefined &&
				parseInt( activeIndex ) ===
					parseInt( item?.parent?.dataset?.swiperSlideIndex )
			) {
				drawPixel( item, pixelSize );
			}
		} );

		animFrame = window.requestAnimationFrame( animate );
	}

	const onPlay = () => {
		audioCtx.resume().then( () => {
			items.forEach( ( item ) => {
				item.canvas.style.display = 'block';
			} );

			if ( ! animFrame ) {
				animate();
			}
		} );
	};

	const onPause = () => {
		items.forEach( ( item ) => {
			item.canvas.style.display = 'none';
		} );
	};

	audio.addEventListener( 'play', onPlay );
	audio.addEventListener( 'pause', onPause );

	registration.setCleanup( () => {
		window.cancelAnimationFrame( animFrame );
		animFrame = null;
		observer.disconnect();
		window.removeEventListener( 'resize', syncAllCanvasSizes );
		document.removeEventListener( 'fullscreenchange', syncAllCanvasSizes );
		resizeObserver?.disconnect();
		audio.removeEventListener( 'play', onPlay );
		audio.removeEventListener( 'pause', onPause );

		imageLoadHandlers.forEach( ( [ img, setup ] ) => {
			img.removeEventListener( 'load', setup );
		} );

		items.forEach( ( item ) => {
			if ( item.canvas?.parentNode ) {
				item.canvas.parentNode.removeChild( item.canvas );
			}
		} );
	} );
};

registerGalleryInitializer( attachOverlayAnimation );
