<?php
/*
 * Plugin Name:         Smooth Music Gallery
 * Description:         Powerful Gutenberg block for photo galleries with music and animations, plus a built-in Shortcode Builder.
 * Requires at least:   5.6
 * Author:              Smooth CDN
 * Author URI:          https://smoothcdn.com
 * Plugin URI:          https://smoothcdn.com/music-gallery
 * License:             GPL v2 or later
 * Text Domain:         smooth-music-gallery
 *
 * Version:             1.0.0
 */

namespace SmoothCDN\MusicGallery;

defined( 'ABSPATH' ) || exit;

const MUSIC_GALLERY_VERSION = '1.0.0';

function smooth_music_gallery_register_editor_styles() {
    $base_url = smooth_music_gallery_get_base_url();
    $config   = json_decode( file_get_contents( __DIR__ . '/config.json' ), true );

    foreach ( $config['themes'] as $theme ) {
        wp_register_style( "smoothmg-theme-$theme", $base_url . "theme/$theme.css", [], MUSIC_GALLERY_VERSION );
    }

    wp_register_style(
            'smoothmg-editor',
            $base_url . 'index.css',
            array_merge(
                    array_map( function ( $t ) {
                        return "smoothmg-theme-$t";
                    }, $config['themes'] ),
            ),
            MUSIC_GALLERY_VERSION
    );
}

function smooth_music_gallery_register_block() {
    if ( ! file_exists( __DIR__ . '/build/block.json' ) || ! file_exists( __DIR__ . '/build/index.js' ) ) {
        return;
    }

    register_block_type(
            __DIR__ . '/build'
            , [
                    'render_callback' => __NAMESPACE__ . '\\smooth_music_gallery_block_render',
            ]
    );
}

add_action( 'init', __NAMESPACE__ . '\\smooth_music_gallery_register_editor_styles', 9 );
add_action( 'init', __NAMESPACE__ . '\\smooth_music_gallery_register_block', 10 );

function smooth_music_gallery_get_base_url() {
    $opts          = smooth_music_gallery_get_options();
    $serve_via_cdn = $opts['serve_via_cdn'];
    if ( $serve_via_cdn ) {
        $base_url = ( 'https://music-gallery.smoothcdn.com/' . MUSIC_GALLERY_VERSION . '/' );
    } else {
        $base_url = ( plugin_dir_url( __FILE__ ) . 'build/' );
    }

    return $base_url;
}

function smooth_music_gallery_enqueue_front_assets( $theme, $overlay_animation, $background_animation ) {
    $base_url = smooth_music_gallery_get_base_url();

    wp_enqueue_script(
            'smoothmg-view',
            $base_url . 'view.js',
            [],
            MUSIC_GALLERY_VERSION,
            true
    );

    wp_enqueue_style(
            "smoothmg-theme-$theme",
            $base_url . "theme/$theme.css",
            [],
            MUSIC_GALLERY_VERSION
    );

    if ( $overlay_animation ) {
        wp_enqueue_script(
                "smoothmg-overlay-animation-script-$overlay_animation",
                $base_url . "overlay/$overlay_animation.js",
                [],
                MUSIC_GALLERY_VERSION,
                true
        );
    }

    if ( $background_animation ) {
        wp_enqueue_script(
                "smoothmg-overlay-animation-script-$background_animation",
                $base_url . "background/$background_animation.js",
                [],
                MUSIC_GALLERY_VERSION,
                true
        );
    }
}

function smooth_music_gallery_enqueue_editor_support_assets() {
    wp_enqueue_media();
    wp_enqueue_script( 'media-views' );
    wp_enqueue_style( 'media-views' );
}

function smooth_music_gallery_is_block_editor_screen() {
    if ( ! function_exists( 'get_current_screen' ) ) {
        return false;
    }

    $screen = get_current_screen();
    if ( ! $screen ) {
        return false;
    }

    if ( method_exists( $screen, 'is_block_editor' ) ) {
        return $screen->is_block_editor();
    }

    return false;
}

function smooth_music_gallery_should_enqueue_front_assets() {
    if ( is_admin() ) {
        return false;
    }

    if ( function_exists( 'wp_is_serving_rest_request' ) && wp_is_serving_rest_request() ) {
        return false;
    }

    return true;
}

function smooth_music_gallery_block_render( $attributes ) {
    $theme                = $attributes['theme'] ?? 'default';
    $overlay_animation    = $attributes['overlay'] ?? '';
    $background_animation = $attributes['background'] ?? '';
    $photos_source        = $attributes['photos_source'] ?? 'core';
    $music_source         = $attributes['music_source'] ?? 'core';
    $photos               = ( $photos_source === 'smoothcdn' ) ? ( $attributes['photos_cdn'] ?? [] ) : ( $attributes['photos'] ?? [] );
    $music                = ( $music_source === 'smoothcdn' ) ? ( $attributes['music_cdn'] ?? [] ) : ( $attributes['music'] ?? [] );
    if ( empty( $photos ) ) {
        $photos = ( $photos_source === 'smoothcdn' ) ? ( $attributes['photos'] ?? [] ) : ( $attributes['photos_cdn'] ?? [] );
    }
    if ( empty( $music ) ) {
        $music = ( $music_source === 'smoothcdn' ) ? ( $attributes['music'] ?? [] ) : ( $attributes['music_cdn'] ?? [] );
    }

    if ( ! empty( $photos ) && count( $photos ) > 0 ) {
        foreach ( $photos as $photo_key => $photo ) {
            $photo_url = $photo['url'] ?? '';
            if ( empty( $photo_url ) && ! empty( $photo['id'] ) ) {
                $photo_url = wp_get_attachment_image_url( $photo['id'], 'full' );
            }

            $photos[ $photo_key ] = [
                    'url' => $photo_url,
            ];
        }
        $attributes['photos'] = $photos;
    }

    if ( ! empty( $music ) ) {
        $music_id    = $music['id'] ?? null;
        $music_title = $music['title'] ?? ( $music_id ? get_the_title( $music_id ) : '' );
        $music_url   = $music['url'] ?? ( $music_id ? wp_get_attachment_url( $music_id ) : '' );

        $attributes['music'] = [
                'title' => $music_title,
                'url'   => $music_url,
        ];
    }

    if ( smooth_music_gallery_should_enqueue_front_assets() ) {
        smooth_music_gallery_enqueue_front_assets( $theme, $overlay_animation, $background_animation );
    }

    return '<div class="smoothmg-gallery" data-props="' . esc_attr( wp_json_encode( $attributes ) ) . '"></div>';
}

add_action( 'admin_init', function () {
    register_setting(
            'smooth_music_gallery_settings',
            'smooth_music_gallery_options',
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
            'smooth_music_gallery_main',
            __( 'Plugin Settings', 'smooth-music-gallery' ),
            '__return_null',
            'smooth_music_gallery'
    );

    add_settings_field(
            'serve_via_cdn',
            __( 'Serve gallery assets via Smooth CDN', 'smooth-music-gallery' ),
            __NAMESPACE__ . '\\smooth_music_gallery_field_serve_via_cdn',
            'smooth_music_gallery',
            'smooth_music_gallery_main'
    );

    add_settings_field(
            'show_toolbar_builder',
            __( 'Show "Create Smooth Music Gallery" in top toolbar', 'smooth-music-gallery' ),
            __NAMESPACE__ . '\\smooth_music_gallery_field_show_toolbar',
            'smooth_music_gallery',
            'smooth_music_gallery_main'
    );
} );

function smooth_music_gallery_get_options() {
    return wp_parse_args(
            get_option( 'smooth_music_gallery_options', [] ),
            [
                    'serve_via_cdn'        => false,
                    'show_toolbar_builder' => true,
            ]
    );
}

function smooth_music_gallery_field_serve_via_cdn() {
    $opts = smooth_music_gallery_get_options();
    ?>
    <label>
        <input type="checkbox" name="smooth_music_gallery_options[serve_via_cdn]"
               value="1" <?php checked( $opts['serve_via_cdn'] ); ?> />
        <?php esc_html_e( 'Enable Smooth CDN delivery for frontend gallery scripts and styles.', 'smooth-music-gallery' ); ?>
    </label>
    <?php
}

function smooth_music_gallery_field_show_toolbar() {
    $opts = smooth_music_gallery_get_options();
    ?>
    <label>
        <input type="checkbox" name="smooth_music_gallery_options[show_toolbar_builder]"
               value="1" <?php checked( $opts['show_toolbar_builder'] ); ?> />
        <?php esc_html_e( 'Display quick access in the WordPress top admin bar.', 'smooth-music-gallery' ); ?>
    </label>
    <?php
}


function smooth_music_gallery_render_shortcode_builder_page() {
    ?>
    <div class="wrap">
        <div id="smoothmg-builder-root"></div>
    </div>
    <?php
}

function smooth_music_gallery_render_settings_page() {
    ?>
    <div class="wrap">
        <form method="post" action="options.php">
            <?php
            settings_fields( 'smooth_music_gallery_settings' );
            do_settings_sections( 'smooth_music_gallery' );
            submit_button();
            ?>
        </form>
    </div>
    <?php
}

function smooth_music_gallery_render_main_page() {
    ?>
    <div class="wrap smooth-music-gallery-admin">
        <img
            src="<?php echo esc_url( plugin_dir_url( __FILE__ ) . 'assets/baner-1544x500.svg' ); ?>"
            alt="Smooth Music Gallery banner"
            loading="lazy"
            decoding="async"
            width="1544"
            height="500"
            style="width: 100%; height: auto;"
        />

        <!-- Intro -->
        <div class="card" style="max-width: unset">
            <h1 style="margin-top:0;">Welcome to Smooth Music Gallery</h1>

            <p>
                Create beautiful, audio-reactive music galleries directly inside WordPress.
                Smooth Music Gallery lets you combine playlists, visuals and smooth animations
                into a modern listening experience — without coding.
            </p>

            <p>
                Optimised for performance and fully compatible with
                <strong>Smooth CDN</strong> for fast, global asset delivery.
            </p>

            <p style="margin-top:16px;">
                <a href="<?php echo esc_url( admin_url( 'admin.php?page=smooth_music_gallery--builder' ) ); ?>"
                   class="button button-secondary button-large">
                    Open Shortcode Builder
                </a>

                <a href="<?php echo esc_url( admin_url( 'admin.php?page=smooth_music_gallery--settings' ) ); ?>"
                   class="button button-secondary button-large"
                   style="margin-left:8px;">
                    Settings
                </a>
            </p>
        </div>

        <!-- Features -->
        <div style="display:flex; flex-direction: row; gap:16px; flex-wrap: wrap;">

            <div class="card" style="width: calc((100% / 3) - 11px);">
                <h2>Audio-Reactive Visuals</h2>
                <p>
                    Dynamic backgrounds, overlays and themes that respond to music
                    and create an immersive gallery experience.
                </p>
            </div>

            <div class="card" style="width: calc((100% / 3) - 11px);">
                <h2>Fast & Lightweight</h2>
                <p>
                    Carefully optimised scripts and assets ensure smooth playback
                    and excellent performance on all devices.
                </p>
            </div>

            <div class="card" style="width: calc((100% / 3) - 11px);">
                <h2>Flexible Asset Sources</h2>
                <p>
                    Choose assets from the WordPress Media Library
                    or from optional Smooth CDN sample collections.
                </p>
            </div>

        </div>

        <!-- Smooth CDN Promo -->
        <div class="card" style="margin-top:20px; padding-top: 16px; max-width: unset; border-left:6px solid #0086d1;">
            <h2 style="margin-top:0;">Powered by Smooth CDN</h2>

            <p>
                Smooth CDN is a developer-first asset delivery platform designed for
                modern WordPress plugins and web applications.
            </p>

            <p>
                Host images, audio and gallery assets globally, reduce load times
                and keep your media pipeline simple.
            </p>

            <p>
                <a href="https://smoothcdn.com" target="_blank" class="button button-primary">
                    Learn more about Smooth CDN
                </a>
            </p>
        </div>
    </div>
    <?php
}

add_action( 'admin_menu', function () {

    // Parent menu
    add_menu_page(
            __( 'Smooth Music Gallery', 'smooth-music-gallery' ),
            __( 'Smooth Music Gallery', 'smooth-music-gallery' ),
            'manage_options',
            'smooth_music_gallery',
            __NAMESPACE__ . '\\smooth_music_gallery_render_main_page',
            'dashicons-format-audio',
            58
    );

    // Shortcode Builder
    add_submenu_page(
            'smooth_music_gallery',
            __( 'Shortcode Builder', 'smooth-music-gallery' ),
            __( 'Shortcode Builder', 'smooth-music-gallery' ),
            'manage_options',
            'smooth_music_gallery--builder',
            __NAMESPACE__ . '\\smooth_music_gallery_render_shortcode_builder_page'
    );

    // Settings
    add_submenu_page(
            'smooth_music_gallery',
            __( 'Settings', 'smooth-music-gallery' ),
            __( 'Settings', 'smooth-music-gallery' ),
            'manage_options',
            'smooth_music_gallery--settings',
            __NAMESPACE__ . '\\smooth_music_gallery_render_settings_page'
    );
} );

add_action( 'admin_bar_menu', function ( $wp_admin_bar ) {
    $opts = smooth_music_gallery_get_options();

    if ( ! $opts['show_toolbar_builder'] ) {
        return;
    }

    $wp_admin_bar->add_node( [
            'id'     => 'smooth-music-gallery-builder',
            'parent' => 'new-content',
            'title'  => __( 'Smooth Music Gallery', 'smooth-music-gallery' ),
            'href'   => admin_url( 'admin.php?page=smooth_music_gallery--builder' ),
            'meta'   => [ 'class' => 'smooth-music-gallery-toolbar' ],
    ] );

}, 100 );

add_action( 'admin_enqueue_scripts', function ( $hook ) {
    if ( smooth_music_gallery_is_block_editor_screen() ) {
        smooth_music_gallery_enqueue_editor_support_assets();
    }

    if ( $hook !== 'smooth-music-gallery_page_smooth_music_gallery--builder' ) {
        return;
    }

    $base   = plugin_dir_url( __FILE__ ) . 'build/';
    $config = json_decode( file_get_contents( __DIR__ . '/config.json' ), true );
    foreach ( $config['themes'] as $theme ) {
        wp_enqueue_style( "smoothmg-theme-$theme", $base . "theme/$theme.css", [], MUSIC_GALLERY_VERSION );
    }
    wp_enqueue_style(
            'smoothmg-editor',
            $base . 'index.css',
            array_merge(
                    array_map( function ( $t ) {
                        return "smoothmg-theme-$t";
                    }, $config['themes'] ),
            ),
            MUSIC_GALLERY_VERSION
    );
    wp_enqueue_style( 'smoothmg-shortcode-builder', $base . 'admin/shortcode_builder.css', [], MUSIC_GALLERY_VERSION );

    smooth_music_gallery_enqueue_editor_support_assets();

    $shortcode_builder_asset_path = __DIR__ . '/build/admin/shortcode_builder.asset.php';
    $shortcode_builder_asset      = file_exists( $shortcode_builder_asset_path )
            ? include $shortcode_builder_asset_path
            : [
                    'dependencies' => [],
                    'version'      => MUSIC_GALLERY_VERSION,
            ];

    wp_enqueue_script(
            'smoothmg-sc-builder',
            plugin_dir_url( __FILE__ ) . 'build/admin/shortcode_builder.js',
            $shortcode_builder_asset['dependencies'],
            $shortcode_builder_asset['version'],
            true
    );
} );

add_action( 'enqueue_block_editor_assets', function () {
    smooth_music_gallery_enqueue_editor_support_assets();
} );

add_shortcode( 'smooth-music-gallery', function ( $attributes ) {
    $attributes = shortcode_atts(
            [
                    'photos'             => '',
                    'photos_cdn'         => '',
                    'photos_source'      => 'core',
                    'music'              => '',
                    'music_cdn'          => '',
                    'music_source'       => 'core',
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
            'smooth_music_gallery'
    );

    if ( ! empty( $attributes['photos'] ) ) {
        $photo_values     = explode( ',', $attributes['photos'] );
        $formatted_photos = [];
        foreach ( $photo_values as $photo_value ) {
            $photo_value = trim( $photo_value );
            if ( empty( $photo_value ) ) {
                continue;
            }

            if ( is_numeric( $photo_value ) ) {
                $formatted_photos[] = [
                        'id' => $photo_value,
                ];
            } else {
                $formatted_photos[] = [
                        'url' => esc_url_raw( $photo_value ),
                ];
            }
        }
        $attributes['photos'] = $formatted_photos;
    }
    if ( ! empty( $attributes['photos_cdn'] ) ) {
        $photo_values     = explode( ',', $attributes['photos_cdn'] );
        $formatted_photos = [];
        foreach ( $photo_values as $photo_value ) {
            $photo_value = trim( $photo_value );
            if ( empty( $photo_value ) ) {
                continue;
            }

            if ( is_numeric( $photo_value ) ) {
                $formatted_photos[] = [
                        'id' => $photo_value,
                ];
            } else {
                $formatted_photos[] = [
                        'url' => esc_url_raw( $photo_value ),
                ];
            }
        }
        $attributes['photos_cdn'] = $formatted_photos;
    }
    if ( ! empty( $attributes['music'] ) ) {
        if ( is_numeric( $attributes['music'] ) ) {
            $attributes['music'] = [ 'id' => $attributes['music'] ];
        } else {
            $attributes['music'] = [ 'url' => esc_url_raw( $attributes['music'] ) ];
        }
    }
    if ( ! empty( $attributes['music_cdn'] ) ) {
        if ( is_numeric( $attributes['music_cdn'] ) ) {
            $attributes['music_cdn'] = [ 'id' => $attributes['music_cdn'] ];
        } else {
            $attributes['music_cdn'] = [ 'url' => esc_url_raw( $attributes['music_cdn'] ) ];
        }
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


    return smooth_music_gallery_block_render( $attributes );
} );
