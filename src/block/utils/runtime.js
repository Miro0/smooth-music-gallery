const GALLERY_SELECTOR = '.smoothmg-gallery';
const RUNTIME_KEY = '__smoothmgRuntime';
const INDEX_DATASET_KEY = 'smoothmgIndex';

const isElementNode = ( node ) => Boolean( node ) && node.nodeType === 1;

const parseIndex = ( value ) => {
	if ( value === undefined || value === null || value === '' ) {
		return null;
	}

	const index = Number.parseInt( value, 10 );
	if ( ! Number.isInteger( index ) || index < 0 ) {
		return null;
	}

	return index;
};

const ensureMgStore = () => {
	if ( ! window.mg ) {
		window.mg = [];
	}

	return window.mg;
};

const getRuntimeState = () => {
	if ( ! window[ RUNTIME_KEY ] ) {
		window[ RUNTIME_KEY ] = {
			initializers: new Set(),
			observer: null,
		};
	}

	return window[ RUNTIME_KEY ];
};

const collectGalleriesFromNode = ( node ) => {
	if ( ! isElementNode( node ) ) {
		return [];
	}

	const galleries = [];

	if ( node.matches( GALLERY_SELECTOR ) ) {
		galleries.push( node );
	}

	galleries.push( ...node.querySelectorAll( GALLERY_SELECTOR ) );

	return galleries;
};

const uniqueGalleries = ( galleries ) => Array.from( new Set( galleries ) );

const runInitializer = ( initializer, galleries ) => {
	galleries.forEach( ( gallery, fallbackIndex ) => {
		const preferredIndex = parseIndex(
			gallery.dataset?.[ INDEX_DATASET_KEY ]
		);
		const { index } = ensureGalleryInstance(
			gallery,
			preferredIndex ?? fallbackIndex
		);
		initializer( gallery, index );
	} );
};

const runAllInitializers = ( galleries ) => {
	const runtime = getRuntimeState();
	runtime.initializers.forEach( ( initializer ) => {
		runInitializer( initializer, galleries );
	} );
};

const isIndexAvailableForContainer = ( store, index, container ) => {
	const instance = store[ index ];

	return (
		! instance || ! instance.container || instance.container === container
	);
};

const findAvailableIndex = ( store, startIndex, container ) => {
	let index = Math.max( 0, startIndex );

	while ( ! isIndexAvailableForContainer( store, index, container ) ) {
		index += 1;
	}

	return index;
};

const resolveGalleryIndex = ( store, container, preferredIndex = 0 ) => {
	const assignedIndex = parseIndex(
		container.dataset?.[ INDEX_DATASET_KEY ]
	);
	if (
		assignedIndex !== null &&
		isIndexAvailableForContainer( store, assignedIndex, container )
	) {
		return assignedIndex;
	}

	const safePreferred =
		Number.isInteger( preferredIndex ) && preferredIndex >= 0
			? preferredIndex
			: 0;

	return findAvailableIndex( store, safePreferred, container );
};

const stopSwiper = ( instance ) => {
	if ( ! instance?.swiper || typeof instance.swiper.destroy !== 'function' ) {
		return;
	}

	try {
		instance.swiper.destroy( true, true );
	} catch ( error ) {
		// noop
	}

	instance.swiper = null;
};

const cleanupGalleryFromNode = ( gallery ) => {
	const index = parseIndex( gallery.dataset?.[ INDEX_DATASET_KEY ] );
	if ( index === null ) {
		return;
	}

	const store = ensureMgStore();
	const instance = store[ index ];
	if ( ! instance || instance.container !== gallery ) {
		return;
	}

	runInstanceCleanup( instance );
	stopSwiper( instance );
	delete store[ index ];
};

const startObserver = () => {
	const runtime = getRuntimeState();
	if ( runtime.observer || typeof window.MutationObserver === 'undefined' ) {
		return;
	}

	const observe = () => {
		if ( runtime.observer || ! document.body ) {
			return;
		}

		runtime.observer = new window.MutationObserver( ( mutations ) => {
			const addedGalleries = [];

			mutations.forEach( ( mutation ) => {
				mutation.addedNodes.forEach( ( node ) => {
					addedGalleries.push( ...collectGalleriesFromNode( node ) );
				} );

				mutation.removedNodes.forEach( ( node ) => {
					collectGalleriesFromNode( node ).forEach( ( gallery ) => {
						cleanupGalleryFromNode( gallery );
					} );
				} );
			} );

			const uniqueAdded = uniqueGalleries( addedGalleries );
			if ( uniqueAdded.length > 0 ) {
				runAllInitializers( uniqueAdded );
			}
		} );

		runtime.observer.observe( document.body, {
			childList: true,
			subtree: true,
		} );
	};

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', observe, {
			once: true,
		} );
		return;
	}

	observe();
};

export const ensureGalleryInstance = ( container, preferredIndex = 0 ) => {
	const store = ensureMgStore();
	const index = resolveGalleryIndex( store, container, preferredIndex );

	if ( ! store[ index ] ) {
		store[ index ] = { source: null };
	}

	store[ index ].container = container;
	container.dataset[ INDEX_DATASET_KEY ] = String( index );

	return {
		index,
		instance: store[ index ],
	};
};

export const runInstanceCleanup = (
	instance,
	cleanupKeys = [ 'cleanupCore', 'cleanupOverlay', 'cleanupBackground' ]
) => {
	if ( ! instance ) {
		return;
	}

	cleanupKeys.forEach( ( cleanupKey ) => {
		const cleanup = instance[ cleanupKey ];
		if ( typeof cleanup === 'function' ) {
			try {
				cleanup();
			} catch ( error ) {
				// noop
			}
		}

		instance[ cleanupKey ] = null;
	} );
};

export const registerGalleryHook = (
	container,
	preferredIndex,
	hookKey,
	hookFn
) => {
	const { index, instance } = ensureGalleryInstance(
		container,
		preferredIndex
	);
	const cleanupKey =
		hookKey === 'initOverlay' ? 'cleanupOverlay' : 'cleanupBackground';

	instance[ hookKey ] = hookFn;
	runInstanceCleanup( instance, [ cleanupKey ] );

	return {
		index,
		instance,
		active: Boolean( instance.initialized ),
		setCleanup( cleanup ) {
			instance[ cleanupKey ] =
				typeof cleanup === 'function' ? cleanup : null;
		},
	};
};

export const registerGalleryInitializer = ( initializer ) => {
	const runtime = getRuntimeState();

	runtime.initializers.add( initializer );

	const run = () => {
		const galleries = Array.from(
			document.querySelectorAll( GALLERY_SELECTOR )
		);
		if ( galleries.length > 0 ) {
			runInitializer( initializer, galleries );
		}
	};

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', run, { once: true } );
	} else {
		run();
	}

	startObserver();

	return () => {
		runtime.initializers.delete( initializer );
	};
};
