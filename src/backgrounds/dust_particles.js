import { initAudioSource } from '../block/utils/audio';
import {
	createAudioReactiveAnimator,
	isMobileViewport,
} from '../block/utils/performance';
import {
	registerGalleryHook,
	registerGalleryInitializer,
} from '../block/utils/runtime';

const clamp = ( value, min, max ) => Math.min( max, Math.max( min, value ) );

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
	const { background, background_options = {} } = props;
	const {
		accent = '#ffffff',
		opacity = 0.5,
		density = 0.5,
		min_size = 8,
		max_size = 16,
	} = background_options;

	if ( background !== 'dust_particles' ) return;

	const normalizedOpacity = clamp( Number( opacity ) || 0.5, 0, 1 );
	const normalizedDensity = clamp( Number( density ) || 0.5, 0.05, 1 );
	const rawMinSize = Number( min_size ) || 8;
	const rawMaxSize = Number( max_size ) || 16;
	const normalizedMinSize = Math.max(
		1,
		Math.min( rawMinSize, rawMaxSize )
	);
	const normalizedMaxSize = Math.max(
		normalizedMinSize,
		Math.max( rawMinSize, rawMaxSize )
	);
	const mobile = isMobileViewport();
	const resolutionScale = mobile ? 0.75 : 1;
	const textureStep = mobile ? 1 : 0.5;

	const audio = container.querySelector( '.smoothmg-audio' );
	const layer = container.querySelector( '.smoothmg-bg-layer' );
	if ( ! audio || ! layer ) return;

	let isVisible = true;
	let animator = null;
	const observer = new window.IntersectionObserver(
		( entries ) => {
			isVisible = entries[ 0 ]?.isIntersecting ?? true;
			animator?.sync();
		},
		{ threshold: 0 }
	);
	observer.observe( container );

	const canvas = document.createElement( 'canvas' );
	canvas.style.position = 'absolute';
	canvas.style.inset = 0;
	canvas.style.width = '100%';
	canvas.style.height = '100%';
	canvas.style.pointerEvents = 'none';
	canvas.style.opacity = normalizedOpacity;
	layer.innerHTML = '';
	layer.appendChild( canvas );

	const ctx2 = canvas.getContext( '2d' );

	let particles = [];
	let textureCache = new Map();
	let lastWidth = 0;
	let lastHeight = 0;

	function resize() {
		const r = layer.getBoundingClientRect();
		if ( ! r.width || ! r.height ) {
			window.requestAnimationFrame( resize );
			return;
		}

		const nextWidth = Math.max(
			1,
			Math.floor( r.width * resolutionScale )
		);
		const nextHeight = Math.max(
			1,
			Math.floor( r.height * resolutionScale )
		);

		if ( lastWidth && lastHeight ) {
			const scaleX = nextWidth / lastWidth;
			const scaleY = nextHeight / lastHeight;
			for ( let i = 0; i < particles.length; i++ ) {
				const p = particles[ i ];
				p.x *= scaleX;
				p.y *= scaleY;
			}
		}

		canvas.width = nextWidth;
		canvas.height = nextHeight;
		lastWidth = nextWidth;
		lastHeight = nextHeight;
	}
	resize();
	window.addEventListener( 'resize', resize );
	document.addEventListener( 'fullscreenchange', resize );
	const resizeObserver =
		window.ResizeObserver && new window.ResizeObserver( () => resize() );
	resizeObserver?.observe( layer );

	function getTextureForSize( size ) {
		const snappedSize = Math.max(
			1,
			Math.round( size / textureStep ) * textureStep
		);
		const textureKey = snappedSize.toFixed( 2 );

		if ( textureCache.has( textureKey ) ) {
			return textureCache.get( textureKey );
		}

		const texSize = Math.max( 2, Math.ceil( snappedSize * 4 ) );
		let off;
		let octx;

		if ( window.OffscreenCanvas ) {
			off = new OffscreenCanvas( texSize, texSize );
			octx = off.getContext( '2d' );
		} else {
			off = document.createElement( 'canvas' );
			off.width = texSize;
			off.height = texSize;
			octx = off.getContext( '2d' );
		}

		const r = texSize / 2;

		octx.clearRect( 0, 0, texSize, texSize );
		octx.fillStyle = accent;
		octx.shadowColor = accent;
		octx.shadowBlur = r * 0.6;

		octx.beginPath();
		octx.arc( r, r, r * 0.4, 0, Math.PI * 2 );
		octx.fill();

		textureCache.set( textureKey, off );
		return off;
	}

	const rect = layer.getBoundingClientRect();
	const spawnWidth = Math.max(
		1,
		Math.floor( ( rect.width || 1 ) * resolutionScale )
	);
	const spawnHeight = Math.max(
		1,
		Math.floor( ( rect.height || 1 ) * resolutionScale )
	);
	const baseCount = mobile ? 96 : 220;
	const count = Math.max( 8, Math.floor( baseCount * normalizedDensity ) );

	particles = new Array( count ).fill( 0 ).map( () => {
		const size =
			normalizedMinSize +
			Math.random() * ( normalizedMaxSize - normalizedMinSize );
		return {
			x: Math.random() * spawnWidth,
			y: Math.random() * spawnHeight,
			size,
			tex: getTextureForSize( size ),
			driftX: ( Math.random() - 0.5 ) * 0.15,
			driftY: ( Math.random() - 0.5 ) * 0.15,
		};
	} );

	const third = Math.floor( count / 3 ) || 1;
	const lowP = particles.slice( 0, third );
	const midP = particles.slice( third, third * 2 );
	const highP = particles.slice( third * 2 );

	const [ analyser, audioCtx, data ] = initAudioSource( audio, index );

	const avgRange = ( arr, start, end ) => {
		const len = arr.length;
		if ( len === 0 ) return 0;
		const s = Math.max( 0, start );
		const e = Math.min( end, len - 1 );
		let sum = 0;
		let cnt = 0;
		for ( let i = s; i <= e; i++ ) {
			sum += arr[ i ];
			cnt++;
		}
		return cnt ? sum / cnt : 0;
	};

	function drawGroup( arr, bandVal, scaleMul, baseOpacity, gainOpacity ) {
		const W = canvas.width;
		const H = canvas.height;
		if ( ! W || ! H || ! arr.length ) return;

		const scale = 1 + scaleMul * bandVal;
		const alpha = clamp( baseOpacity + bandVal * gainOpacity, 0, 1 );
		const margin = 50 * resolutionScale;
		if ( alpha <= 0.01 ) return;

		ctx2.globalAlpha = alpha;

		for ( let i = 0; i < arr.length; i++ ) {
			const p = arr[ i ];
			p.x += p.driftX;
			p.y += p.driftY;

			if ( p.x < -margin ) p.x = W + margin;
			if ( p.x > W + margin ) p.x = -margin;
			if ( p.y < -margin ) p.y = H + margin;
			if ( p.y > H + margin ) p.y = -margin;

			const s = p.size * scale;

			ctx2.drawImage( p.tex, p.x - s / 2, p.y - s / 2, s, s );
		}
	}

	const renderFrame = () => {
		analyser.getByteFrequencyData( data );

		const low = avgRange( data, 0, 10 ) / 255;
		const mid = avgRange( data, 11, 40 ) / 255;
		const high = avgRange( data, 41, 90 ) / 255;

		ctx2.clearRect( 0, 0, canvas.width, canvas.height );

		drawGroup( lowP, low, 1.3, 0.25, 0.9 );
		drawGroup( midP, mid, 0.8, 0.25, 0.7 );
		drawGroup( highP, high, 0.4, 0.3, 0.5 );
		ctx2.globalAlpha = 1;
	};

	animator = createAudioReactiveAnimator( {
		audio,
		isVisible: () => isVisible,
		render: renderFrame,
		onStart: () => {
			audioCtx.resume().catch( () => {} );
		},
		mobileFps: 20,
		desktopFps: 50,
	} );
	animator.sync();

	registration.setCleanup( () => {
		animator?.dispose();
		observer.disconnect();
		window.removeEventListener( 'resize', resize );
		document.removeEventListener( 'fullscreenchange', resize );
		resizeObserver?.disconnect();
		textureCache.clear();
		textureCache = new Map();
		particles = [];

		if ( canvas.parentNode ) {
			canvas.parentNode.removeChild( canvas );
		}
	} );
};

registerGalleryInitializer( attachBackgroundAnimation );
