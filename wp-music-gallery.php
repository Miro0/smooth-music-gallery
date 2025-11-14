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

register_block_type(
	__DIR__ . '/build'
	, [
		'render_callback' => __NAMESPACE__ . '\\wp_music_gallery_block_render',
	]
);

function wp_music_gallery_block_render( $attributes ) {
	$theme             = $attributes['theme'] ?? 'default';
	$overlay_animation = $attributes['overlay_animation'] ?? '';

	// @TODO Front assets should be served via Protected CDN. They should come from local when there's DEV flag only.
	$plugin_url = plugin_dir_url( __FILE__ ); // OR $plugin_url = 'https://cdn.moj-serwis.com/...';

	wp_enqueue_style(
		"wpmg-theme-$theme",
		$plugin_url . "build/$theme.css",
		[],
		'1.0.0'
	);

	if ( $overlay_animation ) {
		wp_enqueue_script(
			"wpmg-overlay-animation-script-$overlay_animation",
			$plugin_url . "build/$overlay_animation.js",
			[],
			'1.0.0'
		);

		wp_enqueue_style(
			"wpmg-overlay-animation-style-$overlay_animation",
			$plugin_url . "build/$overlay_animation.css",
			[],
			'1.0.0'
		);
	}


	return '<div class="wpmg-gallery" data-props="' . esc_attr( wp_json_encode( $attributes ) ) . '"></div>';
}

add_action('init', function() {

	$cdn = get_option('wpmg_use_cdn') === 'yes';
	$plugin_url = plugin_dir_url(__FILE__);
	$cdn_base   = 'https://cdn.twojcdn.com/wpmg/';
	$base       = $cdn ? $cdn_base : $plugin_url . 'build/';

	$config = json_decode(file_get_contents(__DIR__.'/config.json'), true);

	foreach ($config['themes'] as $theme) {
		wp_register_style("wpmg-theme-$theme", $base . "$theme.css", [], '1.0.0');
	}

	foreach ($config['overlay_animations'] as $overlay) {
		wp_register_style("wpmg-overlay-$overlay", $base . "$overlay.css", [], '1.0.0');
	}

	foreach ($config['background_animations'] as $bg) {
		wp_register_style("wpmg-bg-$bg", $base . "$bg.css", [], '1.0.0');
	}

	wp_register_style(
		'wpmg-editor',
		false,
		array_merge(
			array_map(function($t) {
				return "wpmg-theme-$t";
			}, $config['themes']),
			array_map(function($o) {
				return "wpmg-overlay-$o";
			}, $config['overlay_animations']),
			array_map(function($b) {
				return "wpmg-bg-$b";
			}, $config['background_animations'])
		)
	);
});
