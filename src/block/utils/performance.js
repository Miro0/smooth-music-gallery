const MOBILE_BREAKPOINT = 782;

export const isMobileViewport = () => window.innerWidth <= MOBILE_BREAKPOINT;

export const getEffectiveDpr = ( {
	mobileMax = 1.25,
	desktopMax = 2,
} = {} ) => {
	const dpr = window.devicePixelRatio || 1;
	return Math.min( dpr, isMobileViewport() ? mobileMax : desktopMax );
};

export const createAudioReactiveAnimator = ( {
	audio,
	isVisible,
	render,
	onStart,
	onStop,
	mobileFps = 30,
	desktopFps = 60,
} ) => {
	let frameId = null;
	let lastFrameTime = 0;

	const frameDuration =
		1000 / ( isMobileViewport() ? mobileFps : desktopFps );

	const isVisibleNow = () => {
		if ( typeof isVisible === 'function' ) {
			return Boolean( isVisible() );
		}

		return Boolean( isVisible );
	};

	const shouldRun = () =>
		Boolean( audio ) &&
		! audio.paused &&
		! document.hidden &&
		isVisibleNow();

	const loop = ( timestamp = performance.now() ) => {
		if ( ! shouldRun() ) {
			frameId = null;
			return;
		}

		if ( ! lastFrameTime || timestamp - lastFrameTime >= frameDuration ) {
			lastFrameTime = timestamp;
			render( timestamp );
		}

		frameId = window.requestAnimationFrame( loop );
	};

	const start = () => {
		if ( frameId || ! shouldRun() ) {
			return;
		}

		lastFrameTime = 0;
		onStart?.();
		frameId = window.requestAnimationFrame( loop );
	};

	const stop = () => {
		if ( frameId ) {
			window.cancelAnimationFrame( frameId );
			frameId = null;
		}

		lastFrameTime = 0;
		onStop?.();
	};

	const sync = () => {
		if ( shouldRun() ) {
			start();
		} else {
			stop();
		}
	};

	const onVisibilityChange = () => {
		sync();
	};

	audio.addEventListener( 'play', sync );
	audio.addEventListener( 'pause', sync );
	audio.addEventListener( 'ended', sync );
	document.addEventListener( 'visibilitychange', onVisibilityChange );

	return {
		sync,
		dispose: () => {
			stop();
			audio.removeEventListener( 'play', sync );
			audio.removeEventListener( 'pause', sync );
			audio.removeEventListener( 'ended', sync );
			document.removeEventListener(
				'visibilitychange',
				onVisibilityChange
			);
		},
	};
};
