import { initAudioSource } from '../block/utils/audio';
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
	const { background, background_options = {} } = props;

	const {
		accent = '#ffffff',
		opacity = 0.5,
		density = 0.5,
		radius = 90,
		intensity = 1,
		size = 8,
		speed = 0.2,
	} = background_options;

	if ( background !== 'orbital_pulse' ) return;

	const audio = container.querySelector( '.smoothmg-audio' );
	const backgroundLayer = container.querySelector( '.smoothmg-bg-layer' );

	if ( ! backgroundLayer || ! audio ) return;

	let isVisible = true;
	const observer = new window.IntersectionObserver(
		( entries ) => {
			isVisible = entries[ 0 ]?.isIntersecting ?? true;
		},
		{ threshold: 0 }
	);
	observer.observe( container );

	const canvas = document.createElement( 'canvas' );
	canvas.style.position = 'absolute';
	canvas.style.inset = '0';
	canvas.style.pointerEvents = 'none';
	canvas.style.opacity = opacity;
	backgroundLayer.innerHTML = '';
	backgroundLayer.appendChild( canvas );

	const ctx2 = canvas.getContext( '2d' );

	let off = null;
	let octx = null;

	function setupOffscreen( w, h ) {
		if ( window.OffscreenCanvas ) {
			off = new OffscreenCanvas( w, h );
		} else {
			const tmp = document.createElement( 'canvas' );
			tmp.width = w;
			tmp.height = h;
			off = tmp;
		}
		octx = off.getContext( '2d' );
		octx.imageSmoothingEnabled = true;
	}

	const width = () => canvas.width;
	const height = () => canvas.height;

	let cx = 0;
	let cy = 0;
	let aspectX = 1;
	let aspectY = 1;
	let baseRadius = 0;

	const particlesCount = Math.floor( 240 * density );

	const particles = [];

	function initParticles() {
		particles.length = 0;

		for ( let i = 0; i < particlesCount; i++ ) {
			particles.push( {
				angle: ( i / particlesCount ) * Math.PI * 2,
				bandStart: Math.floor( Math.random() * 80 ),
				bandWidth: 10 + Math.random() * 20,
				jx: 0,
				jy: 0,
			} );
		}
	}

	function resize() {
		const rect = backgroundLayer.getBoundingClientRect();
		const w = Math.max( 1, Math.floor( rect.width ) );
		const h = Math.max( 1, Math.floor( rect.height ) );

		canvas.width = w;
		canvas.height = h;

		setupOffscreen( w, h );

		cx = w / 2;
		cy = h / 2;

		aspectX = w > h ? w / h : 1;
		aspectY = h > w ? h / w : 1;

		baseRadius = ( Math.min( w, h ) / 2 ) * ( radius / 100 );

		if ( ! particles.length ) {
			initParticles();
		}
	}

	resize();
	window.addEventListener( 'resize', resize );
	document.addEventListener( 'fullscreenchange', resize );

	const [ analyser, , data ] = initAudioSource( audio, index );

	let animFrame = null;
	let frame = 0;

	function animate() {
		if ( ! isVisible ) {
			animFrame = window.requestAnimationFrame( animate );
			return;
		}

		analyser.getByteFrequencyData( data );
		frame++;

		const W = width();
		const H = height();

		const targetCtx = octx || ctx2;
		targetCtx.clearRect( 0, 0, W, H );

		for ( let i = 0; i < particles.length; i++ ) {
			const s = particles[ i ];

			let energy = 0;
			let count = 0;
			const bandEnd = Math.min( s.bandStart + s.bandWidth, data.length );
			for ( let j = s.bandStart; j < bandEnd; j++ ) {
				energy += data[ j ];
				count++;
			}
			energy = count ? energy / count : 0;

			const norm = energy / 255;

			const distortion = norm * ( 80 * intensity );
			const R1 = baseRadius * aspectX + distortion;
			const R2 = baseRadius * aspectY + distortion * 0.6;

			s.angle += 0.002 * speed + norm * 0.004 * speed;

			const x = cx + Math.cos( s.angle ) * R1;
			const y = cy + Math.sin( s.angle ) * R2;

			const scale = 1 + norm * ( size / 10 ) * intensity;
			const radiusPx = ( size / 2 ) * scale;

			if (
				speed > 0 &&
				frame % Math.max( 2, Math.floor( 6 / speed ) ) === 0
			) {
				s.jx = ( Math.random() - 0.5 ) * ( 1.5 * speed );
				s.jy = ( Math.random() - 0.5 ) * ( 1.5 * speed );
			}

			const alpha = 0.3 + norm * 0.7;

			targetCtx.save();
			targetCtx.globalAlpha = Math.max( 0, Math.min( 1, alpha ) );
			targetCtx.fillStyle = accent;
			targetCtx.shadowColor = accent;
			targetCtx.shadowBlur = 6 * intensity;

			targetCtx.beginPath();
			targetCtx.arc( x + s.jx, y + s.jy, radiusPx, 0, Math.PI * 2 );
			targetCtx.fill();

			targetCtx.restore();
		}

		if ( off && octx ) {
			ctx2.clearRect( 0, 0, W, H );
			ctx2.drawImage( off, 0, 0 );
		}

		animFrame = window.requestAnimationFrame( animate );
	}

	animate();

	registration.setCleanup( () => {
		window.cancelAnimationFrame( animFrame );
		observer.disconnect();
		window.removeEventListener( 'resize', resize );
		document.removeEventListener( 'fullscreenchange', resize );

		if ( canvas.parentNode ) {
			canvas.parentNode.removeChild( canvas );
		}
	} );
};

registerGalleryInitializer( attachBackgroundAnimation );
