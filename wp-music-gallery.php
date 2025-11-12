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

// @TODO Register with Protected CDN for production ready build.
register_block_type(
	__DIR__ . '/build/free'
//	__DIR__ . '/build/pro'
	, [
		'render_callback' => __NAMESPACE__ . '\\wp_music_gallery_block_render',
	]
);

function wp_music_gallery_block_render( $attributes ) {
	$theme  = $attributes['theme'] ?? 'default';

	$plugin_url = plugin_dir_url( __FILE__ ); // OR $plugin_url = 'https://cdn.moj-serwis.com/...';

	wp_enqueue_style(
		"wpmg-theme-$theme",
		$plugin_url . "build/free/$theme.scss.css",
		[],
		'1.0.0'
	);

	return '<div class="wpmg-gallery" data-props="' . esc_attr( wp_json_encode( $attributes ) ) . '"></div>';
}
