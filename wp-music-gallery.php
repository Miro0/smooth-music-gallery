<?php
/*
 * Plugin Name:         WP Music Gallery
 * Plugin URI:          https://wpmusicgallery.com
 * Description:         Powerful Gutenberg blog that allows adding photo galleries with music and animations.
 * Requires at least:   5.6+
 * Author:              Beed Vision
 * Author URI:          https://beedvision.pl
 * License:             GPL v2 or later
 * Text Domain:         wp-music-gallery
 *
 * Version:             1.0.0
 */

namespace BeedVision\WPMusicGallery;

defined( 'ABSPATH' ) || exit;

const WP_MUSIC_GALLERY_VERSION = '1.0.0';

register_block_type(
        __DIR__ . '/build'
        , [
                'render_callback' => __NAMESPACE__ . '\\wp_music_gallery_block_render',
        ]
);

function wp_music_gallery_get_base_url() {
    $opts          = wp_music_gallery_get_options();
    $serve_via_cdn = $opts['serve_via_cdn'];
    if ( $serve_via_cdn ) {
        $base_url = ( 'https://wp-music-gallery.smoothcdn.com/' . WP_MUSIC_GALLERY_VERSION . '/' );
    } else {
        $base_url = ( plugin_dir_url( __FILE__ ) . 'build/' );
    }

    return $base_url;
}

function wp_music_gallery_block_render( $attributes ) {
    $theme                = $attributes['theme'] ?? 'default';
    $overlay_animation    = $attributes['overlay'] ?? '';
    $background_animation = $attributes['background'] ?? '';

    if ( count( $attributes['photos'] ) > 0 ) {
        foreach ( $attributes['photos'] as $photo_key => $photo ) {
            $attributes['photos'][ $photo_key ] = [
                    'url' => $photo['url'] ?? wp_get_attachment_image_url( $photo['id'], 'full' ),
            ];
        }
    }

    if ( ! empty( $attributes['music'] ) ) {
        $attributes['music'] = [
                'title' => $attributes['music']['title'] ?? get_the_title( $attributes['music']['id'] ),
                'url'   => $attributes['music']['url'] ?? wp_get_attachment_url( $attributes['music']['id'] ),
        ];
    }

    $base_url = wp_music_gallery_get_base_url();

    wp_enqueue_script(
            'wpmg-view',
            $base_url . 'view.js',
            [],
            WP_MUSIC_GALLERY_VERSION,
    );

    wp_enqueue_style(
            "wpmg-theme-$theme",
            $base_url . "theme/$theme.css",
            [],
            WP_MUSIC_GALLERY_VERSION
    );

    if ( $overlay_animation ) {
        wp_enqueue_script(
                "wpmg-overlay-animation-script-$overlay_animation",
                $base_url . "overlay/$overlay_animation.js",
                [],
                WP_MUSIC_GALLERY_VERSION
        );
    }

    if ( $background_animation ) {
        wp_enqueue_script(
                "wpmg-overlay-animation-script-$background_animation",
                $base_url . "background/$background_animation.js",
                [],
                WP_MUSIC_GALLERY_VERSION
        );
    }

    return '<div class="wpmg-gallery" data-props="' . esc_attr( wp_json_encode( $attributes ) ) . '"></div>';
}

add_action( 'admin_init', function () {
    $base_url = wp_music_gallery_get_base_url();

    $config = json_decode( file_get_contents( __DIR__ . '/config.json' ), true );

    foreach ( $config['themes'] as $theme ) {
        wp_register_style( "wpmg-theme-$theme", $base_url . "theme/$theme.css", [], WP_MUSIC_GALLERY_VERSION );
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

    register_setting(
            'wp_music_gallery_settings',
            'wp_music_gallery_options',
            [
                    'type'              => 'array',
                    'sanitize_callback' => function ( $input ) {
                        return [
                                'serve_via_cdn'        => ! empty( $input['serve_via_cdn'] ),
                                'show_toolbar_builder' => ! empty( $input['show_toolbar_builder'] ),
                        ];
                    },
                    'default'           => [
                            'serve_via_cdn'        => false,
                            'show_toolbar_builder' => true,
                    ],
            ]
    );

    add_settings_section(
            'wp_music_gallery_main',
            __( 'General Settings', 'wp-music-gallery' ),
            '__return_null',
            'wp_music_gallery'
    );

    add_settings_field(
            'serve_via_cdn',
            __( 'Serve gallery assets via Smooth CDN', 'wp-music-gallery' ),
            __NAMESPACE__ . '\\wp_music_gallery_field_serve_via_cdn',
            'wp_music_gallery',
            'wp_music_gallery_main'
    );

    add_settings_field(
            'show_toolbar_builder',
            __( 'Show "Create Shortcode Builder" in top toolbar', 'wp-music-gallery' ),
            __NAMESPACE__ . '\\wp_music_gallery_field_show_toolbar',
            'wp_music_gallery',
            'wp_music_gallery_main'
    );
} );

function wp_music_gallery_get_options() {
    return wp_parse_args(
            get_option( 'wp_music_gallery_options', [] ),
            [
                    'serve_via_cdn'        => false,
                    'show_toolbar_builder' => true,
            ]
    );
}

function wp_music_gallery_field_serve_via_cdn() {
    $opts = wp_music_gallery_get_options();
    ?>
    <label>
        <input type="checkbox" name="wp_music_gallery_options[serve_via_cdn]"
               value="1" <?php checked( $opts['serve_via_cdn'] ); ?> />
        <?php esc_html_e( 'Enable Smooth CDN delivery for gallery assets.', 'wp-music-gallery' ); ?>
    </label>
    <?php
}

function wp_music_gallery_field_show_toolbar() {
    $opts = wp_music_gallery_get_options();
    ?>
    <label>
        <input type="checkbox" name="wp_music_gallery_options[show_toolbar_builder]"
               value="1" <?php checked( $opts['show_toolbar_builder'] ); ?> />
        <?php esc_html_e( 'Display quick access in the WordPress top admin bar.', 'wp-music-gallery' ); ?>
    </label>
    <?php
}


function wp_music_gallery_render_shortcode_builder_page() {
    ?>
    <div class="wrap">
        <h1><?php esc_html_e( 'WP Music Gallery – Shortcode Builder', 'wp-music-gallery' ); ?></h1>

        <div id="wpmg-builder-root"></div>
    </div>
    <?php
}

function wp_music_gallery_render_settings_page() {
    ?>
    <div class="wrap">
        <h1><?php esc_html_e( 'WP Music Gallery Settings', 'wp-music-gallery' ); ?></h1>

        <form method="post" action="options.php">
            <?php
            settings_fields( 'wp_music_gallery_settings' );
            do_settings_sections( 'wp_music_gallery' );
            submit_button();
            ?>
        </form>
    </div>
    <?php
}

add_action( 'admin_menu', function () {

    // Parent menu
    add_menu_page(
            __( 'WP Music Gallery', 'wp-music-gallery' ),
            __( 'WP Music Gallery', 'wp-music-gallery' ),
            'manage_options',
            'wp_music_gallery',
            '__return_null',
            'dashicons-format-audio',
            58
    );

    // Shortcode Builder
    add_submenu_page(
            'wp_music_gallery',
            __( 'Shortcode Builder', 'wp-music-gallery' ),
            __( 'Shortcode Builder', 'wp-music-gallery' ),
            'manage_options',
            'wp_music_gallery--builder',
            __NAMESPACE__ . '\\wp_music_gallery_render_shortcode_builder_page'
    );

    // Settings
    add_submenu_page(
            'wp_music_gallery',
            __( 'Settings', 'wp-music-gallery' ),
            __( 'Settings', 'wp-music-gallery' ),
            'manage_options',
            'wp_music_gallery--settings',
            __NAMESPACE__ . '\\wp_music_gallery_render_settings_page'
    );
} );

add_action( 'admin_bar_menu', function ( $wp_admin_bar ) {
    $opts = wp_music_gallery_get_options();

    if ( ! $opts['show_toolbar_builder'] ) {
        return;
    }

    $wp_admin_bar->add_node( [
            'id'     => 'wp-music-gallery-builder',
            'parent' => 'new-content',
            'title'  => __( 'Shortcode Builder', 'wp-music-gallery' ),
            'href'   => admin_url( 'admin.php?page=wp_music_gallery--builder' ),
            'meta'   => [ 'class' => 'wp-music-gallery-toolbar' ],
    ] );

}, 100 );

add_action( 'admin_enqueue_scripts', function ( $hook ) {
    if ( $hook !== 'wp-music-gallery_page_wp_music_gallery--builder' ) {
        return;
    }

    $base   = plugin_dir_url( __FILE__ ) . 'build/';
    $config = json_decode( file_get_contents( __DIR__ . '/config.json' ), true );
    foreach ( $config['themes'] as $theme ) {
        wp_enqueue_style( "wpmg-theme-$theme", $base . "theme/$theme.css", [], WP_MUSIC_GALLERY_VERSION );
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
            WP_MUSIC_GALLERY_VERSION,
            true
    );
} );

add_shortcode( 'wp-music-gallery', function ( $attributes ) {
    $attributes = shortcode_atts(
            [
                    'photos'             => '',
                    'music'              => '',
                    'theme'              => 'default',
                    'theme_options'      => '',
                    'size'               => 85,
                    'slides_duration'    => 2,
                    'background'         => '',
                    'background_options' => '',
                    'overlay'            => '',
                    'overlay_options'    => '',
            ],
            $attributes,
            'wp_music_gallery'
    );

    if ( ! empty( $attributes['photos'] ) ) {
        $photo_ids        = explode( ',', $attributes['photos'] );
        $formatted_photos = [];
        foreach ( $photo_ids as $photo_id ) {
            $formatted_photos[] = [
                    'id' => $photo_id,
            ];
        }
        $attributes['photos'] = $formatted_photos;
    }

    if ( ! empty( $attributes['music'] ) ) {
        $attributes['music'] = [ 'id' => $attributes['music'] ];
    }

    if ( ! empty( $attributes['theme_options'] ) ) {
        $attributes['theme_options'] = json_decode( $attributes['theme_options'], true );
    }

    if ( ! empty( $attributes['background_options'] ) ) {
        $attributes['background_options'] = json_decode( $attributes['background_options'], true );
    }

    if ( ! empty( $attributes['overlay_options'] ) ) {
        $attributes['overlay_options'] = json_decode( $attributes['overlay_options'], true );
    }


    return wp_music_gallery_block_render( $attributes );
} );
