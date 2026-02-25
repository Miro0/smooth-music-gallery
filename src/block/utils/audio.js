export const initAudioSource = ( audio, index ) => {
	if ( ! window?.mg ) {
		window.mg = [];
	}

	if ( ! window.mg[ index ] ) {
		window.mg[ index ] = { source: null };
	}

	const instance = window.mg[ index ];

	if ( ! instance.ctx ) {
		instance.ctx = new ( window.AudioContext ||
			window.webkitAudioContext )();
	}
	const ctx = instance.ctx;

	if ( instance.audioElement && instance.audioElement !== audio ) {
		try {
			instance.source?.disconnect();
		} catch ( error ) {
			// noop
		}

		try {
			instance.gain?.disconnect();
		} catch ( error ) {
			// noop
		}

		instance.source = null;
		instance.gain = null;
		instance.audioConnected = false;
	}

	if ( ! instance.source ) {
		instance.source = ctx.createMediaElementSource( audio );
		instance.audioElement = audio;
	}
	const source = instance.source;

	if ( ! instance.gain ) {
		instance.gain = ctx.createGain();
	}
	const gain = instance.gain;
	gain.gain.value = 0.8;

	const analyser = ctx.createAnalyser();
	analyser.fftSize = 256;

	const data = new Uint8Array( analyser.frequencyBinCount );

	source.connect( analyser );

	if ( ! instance.audioConnected ) {
		source.connect( gain );
		gain.connect( ctx.destination );
		instance.audioConnected = true;
	}

	return [ analyser, ctx, data ];
};
