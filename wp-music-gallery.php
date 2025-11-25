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
    $theme                = $attributes['theme'] ?? 'default';
    $overlay_animation    = $attributes['overlay'] ?? '';
    $background_animation = $attributes['background'] ?? '';

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
    }

    if ( $background_animation ) {
        wp_enqueue_script(
                "wpmg-overlay-animation-script-$background_animation",
                $plugin_url . "build/$background_animation.js",
                [],
                '1.0.0'
        );
    }


    return '<div class="wpmg-gallery" data-props="' . esc_attr( wp_json_encode( $attributes ) ) . '"></div>';
}

add_action( 'init', function () {
    // @TODO Front assets should be served via Protected CDN. They should come from local when there's DEV flag only.
    $cdn        = get_option( 'wpmg_use_cdn' ) === 'yes';
    $plugin_url = plugin_dir_url( __FILE__ );
    $cdn_base   = 'https://cdn.twojcdn.com/wpmg/';
    $base       = $cdn ? $cdn_base : $plugin_url . 'build/';

    $config = json_decode( file_get_contents( __DIR__ . '/config.json' ), true );

    foreach ( $config['themes'] as $theme ) {
        wp_register_style( "wpmg-theme-$theme", $base . "$theme.css", [], '1.0.0' );
    }

    wp_register_style(
            'wpmg-editor',
            false,
            array_merge(
                    array_map( function ( $t ) {
                        return "wpmg-theme-$t";
                    }, $config['themes'] ),
            )
    );
} );

function wp_music_gallery_render_shortcode_builder_page() {
    ?>
    <div class="wrap">
        <h1><?php esc_html_e( 'WP Music Gallery – Shortcode Builder', 'wp-music-gallery' ); ?></h1>
        <p><?php esc_html_e( 'Skonfiguruj galerię i skopiuj shortcode, aby użyć go w dowolnym page builderze.', 'wp-music-gallery' ); ?></p>

        <div id="wpmg-builder-root"></div>

        <noscript>
            <p><?php esc_html_e( 'Aby używać Shortcode Buildera, włącz JavaScript w przeglądarce.', 'wp-music-gallery' ); ?></p>
        </noscript>
    </div>
    <?php
}

add_action( 'admin_menu', function () {
    add_menu_page(
            __( 'WP Music Gallery', 'wp-music-gallery' ),
            __( 'WP Music Gallery', 'wp-music-gallery' ),
            'manage_options',
            'wp_music_gallery--builder',
            __NAMESPACE__ . '\\wp_music_gallery_render_shortcode_builder_page',
            'dashicons-format-audio',
            58
    );
} );

add_action( 'admin_enqueue_scripts', function ( $hook ) {
    if ( $hook !== 'toplevel_page_wp_music_gallery--builder' ) {
        return;
    }

    $base   = plugin_dir_url( __FILE__ ) . 'build/';
    $config = json_decode( file_get_contents( __DIR__ . '/config.json' ), true );
    foreach ( $config['themes'] as $theme ) {
        wp_enqueue_style( "wpmg-theme-$theme", $base . "$theme.css", [], '1.0.0' );
    }
    wp_enqueue_style(
            'wpmg-editor',
            false,
            array_merge(
                    array_map( function ( $t ) {
                        return "wpmg-theme-$t";
                    }, $config['themes'] ),
            )
    );
    wp_enqueue_style( 'wpmg-shortcode-builder', $base . 'admin/shortcode_builder.css' );

    wp_enqueue_media();
    wp_enqueue_script( 'media-views' );
    wp_enqueue_style( 'media-views' );

    wp_enqueue_style( 'wp-color-picker' );
    wp_enqueue_script( 'wp-color-picker' );

    wp_enqueue_script( 'wp-element' );
    wp_enqueue_script( 'wp-components' );
    wp_enqueue_script( 'wp-i18n' );
    wp_enqueue_script( 'wp-block-editor' );
    wp_enqueue_script( 'wp-editor' );
    wp_enqueue_script( 'wp-dom-ready' );
    wp_enqueue_script( 'wp-hooks' );

    wp_enqueue_style( 'wp-components' );
    wp_enqueue_style( 'wp-edit-blocks' );
    wp_enqueue_style( 'wp-edit-post' );

    wp_enqueue_script(
            'wpmg-sc-builder',
            plugin_dir_url( __FILE__ ) . 'build/admin/shortcode_builder.js',
            [
                    'wp-element',
                    'wp-components',
                    'wp-i18n',
                    'wp-block-editor',
                    'wp-editor',
                    'wp-color-picker',
                    'media-views'
            ],
            '1.0.0',
            true
    );
} );

add_shortcode( 'wp_music_gallery', function ( $attributes ) {
    $attributes = shortcode_atts(
            [
                    'photos'             => [],
                    'music'              => [],
                    'theme'              => 'default',
                    'size'               => 90,
                    'slides_duration'    => 2,
                    'background'         => '',
                    'background_options' => [],
                    'overlay'            => '',
                    'overlay_options'    => '',
            ],
            $attributes,
            'wp_music_gallery'
    );

    return wp_music_gallery_block_render( $attributes );
} );
