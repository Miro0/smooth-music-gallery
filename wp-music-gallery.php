<?php
/*
 * Plugin Name:         WP Music Gallery
 * Plugin URI:          https://wpmusicgallery.com
 * Description:         Powerful Gutenberg blog that allows adding photo galleries with music and animations.
 * Requires at least:   5.6+
 * Author:              Beed Vision
 * Author URI:          https://beedvision.pl
 * License:             GPL v2 or later
 * Text Domain:         wpmusicgallery
 *
 * Version:             1.0.0
 */

namespace BeedVision\WPMusicGallery;

defined( 'ABSPATH' ) || exit;

// @TODO Register with Protected CDN with local accessibility.
register_block_type(
	__DIR__ . '/build/free'
//	__DIR__ . '/build/pro'
	, [
		'render_callback' => __NAMESPACE__ . '\\wp_music_gallery_block_render',
	]
);

function wp_music_gallery_block_render( $attributes ) {
	return '<pre class="wp-music-gallery" style="display:none;visibility:hidden;opacity:0;height:0;width:0;">' . json_encode( $attributes ) . '</pre>';
}
