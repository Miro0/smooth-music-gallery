<?php
/*
 * Plugin Name:         Music Gallery
 * Plugin URI:          https://musicgallery.com
 * Description:         Powerful Gutenberg blog that allows adding photo galleries with music and animations.
 * Requires at least:   5.6
 * Author:              Smooth CDN
 * Author URI:          https://smoothcdn.com
 * License:             GPL v2 or later
 * Text Domain:         music-gallery
 *
 * Version:             1.0.0
 */

namespace BeedVision\MusicGallery;

defined( 'ABSPATH' ) || exit;

const MUSIC_GALLERY_VERSION = '1.0.0';

register_block_type(
        __DIR__ . '/build'
        , [
                'render_callback' => __NAMESPACE__ . '\\music_gallery_block_render',
        ]
);

function music_gallery_get_base_url() {
    $opts          = music_gallery_get_options();
    $serve_via_cdn = $opts['serve_via_cdn'];
    if ( $serve_via_cdn ) {
        $base_url = ( 'https://music-gallery.smoothcdn.com/' . MUSIC_GALLERY_VERSION . '/' );
    } else {
        $base_url = ( plugin_dir_url( __FILE__ ) . 'build/' );
    }

    return $base_url;
}

function music_gallery_enqueue_front_assets( $theme, $overlay_animation, $background_animation ) {
    $base_url = music_gallery_get_base_url();

    wp_enqueue_script(
            'mg-view',
            $base_url . 'view.js',
            [],
            MUSIC_GALLERY_VERSION,
            true
    );

    wp_enqueue_style(
            "mg-theme-$theme",
            $base_url . "theme/$theme.css",
            [],
            MUSIC_GALLERY_VERSION
    );

    if ( $overlay_animation ) {
        wp_enqueue_script(
                "mg-overlay-animation-script-$overlay_animation",
                $base_url . "overlay/$overlay_animation.js",
                [],
                MUSIC_GALLERY_VERSION,
                true
        );
    }

    if ( $background_animation ) {
        wp_enqueue_script(
                "mg-overlay-animation-script-$background_animation",
                $base_url . "background/$background_animation.js",
                [],
                MUSIC_GALLERY_VERSION,
                true
        );
    }
}

function music_gallery_enqueue_editor_support_assets() {
    wp_enqueue_media();
    wp_enqueue_script( 'media-views' );
    wp_enqueue_style( 'media-views' );
}

function music_gallery_is_block_editor_screen() {
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

function music_gallery_should_enqueue_front_assets() {
    if ( is_admin() ) {
        return false;
    }

    if ( function_exists( 'wp_is_serving_rest_request' ) && wp_is_serving_rest_request() ) {
        return false;
    }

    return true;
}

function music_gallery_block_render( $attributes ) {
    $theme                = $attributes['theme'] ?? 'default';
    $overlay_animation    = $attributes['overlay'] ?? '';
    $background_animation = $attributes['background'] ?? '';
    $photos_source        = $attributes['photos_source'] ?? 'wp';
    $music_source         = $attributes['music_source'] ?? 'wp';
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

    if ( music_gallery_should_enqueue_front_assets() ) {
        music_gallery_enqueue_front_assets( $theme, $overlay_animation, $background_animation );
    }

    return '<div class="mg-gallery" data-props="' . esc_attr( wp_json_encode( $attributes ) ) . '"></div>';
}

add_action( 'admin_init', function () {
    $base_url = music_gallery_get_base_url();

    $config = json_decode( file_get_contents( __DIR__ . '/config.json' ), true );

    foreach ( $config['themes'] as $theme ) {
        wp_register_style( "mg-theme-$theme", $base_url . "theme/$theme.css", [], MUSIC_GALLERY_VERSION );
    }

    wp_register_style(
            'mg-editor',
            $base_url . 'index.css',
            array_merge(
                    array_map( function ( $t ) {
                        return "mg-theme-$t";
                    }, $config['themes'] ),
            ),
            MUSIC_GALLERY_VERSION
    );

    register_setting(
            'music_gallery_settings',
            'music_gallery_options',
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
            'music_gallery_main',
            __( 'General Settings', 'music-gallery' ),
            '__return_null',
            'music_gallery'
    );

    add_settings_field(
            'serve_via_cdn',
            __( 'Serve gallery assets via Smooth CDN', 'music-gallery' ),
            __NAMESPACE__ . '\\music_gallery_field_serve_via_cdn',
            'music_gallery',
            'music_gallery_main'
    );

    add_settings_field(
            'show_toolbar_builder',
            __( 'Show "Create Music Gallery" in top toolbar', 'music-gallery' ),
            __NAMESPACE__ . '\\music_gallery_field_show_toolbar',
            'music_gallery',
            'music_gallery_main'
    );
} );

function music_gallery_get_options() {
    return wp_parse_args(
            get_option( 'music_gallery_options', [] ),
            [
                    'serve_via_cdn'        => false,
                    'show_toolbar_builder' => true,
            ]
    );
}

function music_gallery_field_serve_via_cdn() {
    $opts = music_gallery_get_options();
    ?>
    <label>
        <input type="checkbox" name="music_gallery_options[serve_via_cdn]"
               value="1" <?php checked( $opts['serve_via_cdn'] ); ?> />
        <?php esc_html_e( 'Enable Smooth CDN delivery for gallery assets.', 'music-gallery' ); ?>
    </label>
    <?php
}

function music_gallery_field_show_toolbar() {
    $opts = music_gallery_get_options();
    ?>
    <label>
        <input type="checkbox" name="music_gallery_options[show_toolbar_builder]"
               value="1" <?php checked( $opts['show_toolbar_builder'] ); ?> />
        <?php esc_html_e( 'Display quick access in the WordPress top admin bar.', 'music-gallery' ); ?>
    </label>
    <?php
}


function music_gallery_render_shortcode_builder_page() {
    ?>
    <div class="wrap">
        <h1><?php esc_html_e( 'Music Gallery - Shortcode Builder', 'music-gallery' ); ?></h1>

        <div id="mg-builder-root"></div>
    </div>
    <?php
}

function music_gallery_render_settings_page() {
    ?>
    <div class="wrap">
        <h1><?php esc_html_e( 'Music Gallery - Settings', 'music-gallery' ); ?></h1>

        <form method="post" action="options.php">
            <?php
            settings_fields( 'music_gallery_settings' );
            do_settings_sections( 'music_gallery' );
            submit_button();
            ?>
        </form>
    </div>
    <?php
}

function music_gallery_render_main_page() {
    ?>
    <div class="wrap music-gallery-admin">
        <h1><?php esc_html_e( 'Music Gallery', 'music-gallery' ); ?></h1>

        <img
            src="https://music-gallery.smoothcdn.com/latest/baner-1544x500.png"
            alt="Music Gallery banner"
            loading="lazy"
            decoding="async"
            width="1544"
            height="500"
            style="width: 100%; height: auto;"
        />

        <!-- Intro -->
        <div class="card" style="max-width: unset">
            <h1 style="margin-top:0;">Welcome to Music Gallery</h1>

            <p>
                Create beautiful, audio-reactive music galleries directly inside WordPress.
                Music Gallery lets you combine playlists, visuals and smooth animations
                into a modern listening experience — without coding.
            </p>

            <p>
                Optimised for performance and fully compatible with
                <strong>Smooth CDN</strong> for fast, global asset delivery.
            </p>

            <p style="margin-top:16px;">
                <a href="<?php echo esc_url( admin_url( 'admin.php?page=music_gallery--builder' ) ); ?>"
                   class="button button-secondary button-large">
                    Open Shortcode Builder
                </a>

                <a href="<?php echo esc_url( admin_url( 'admin.php?page=music_gallery--settings' ) ); ?>"
                   class="button button-secondary button-large"
                   style="margin-left:8px;">
                    Settings
                </a>
            </p>
        </div>

        <!-- Features -->
        <div style="display:flex; flex-direction: row; gap:16px; margin-top:24px; flex-wrap: wrap;">

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
                <h2>Smooth CDN Ready</h2>
                <p>
                    Serve gallery assets via Smooth CDN for global speed,
                    caching and reliable delivery in production environments.
                </p>
            </div>

        </div>

        <!-- Smooth CDN Promo -->
        <div class="card" style="margin-top:44px; padding-top: 16px; max-width: unset; border-left:6px solid #0086d1;">
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
            __( 'Music Gallery', 'music-gallery' ),
            __( 'Music Gallery', 'music-gallery' ),
            'manage_options',
            'music_gallery',
            __NAMESPACE__ . '\\music_gallery_render_main_page',
            'dashicons-format-audio',
            58
    );

    // Shortcode Builder
    add_submenu_page(
            'music_gallery',
            __( 'Shortcode Builder', 'music-gallery' ),
            __( 'Shortcode Builder', 'music-gallery' ),
            'manage_options',
            'music_gallery--builder',
            __NAMESPACE__ . '\\music_gallery_render_shortcode_builder_page'
    );

    // Settings
    add_submenu_page(
            'music_gallery',
            __( 'Settings', 'music-gallery' ),
            __( 'Settings', 'music-gallery' ),
            'manage_options',
            'music_gallery--settings',
            __NAMESPACE__ . '\\music_gallery_render_settings_page'
    );
} );

add_action( 'admin_bar_menu', function ( $wp_admin_bar ) {
    $opts = music_gallery_get_options();

    if ( ! $opts['show_toolbar_builder'] ) {
        return;
    }

    $wp_admin_bar->add_node( [
            'id'     => 'music-gallery-builder',
            'parent' => 'new-content',
            'title'  => __( 'Music Gallery', 'music-gallery' ),
            'href'   => admin_url( 'admin.php?page=music_gallery--builder' ),
            'meta'   => [ 'class' => 'music-gallery-toolbar' ],
    ] );

}, 100 );

add_action( 'admin_enqueue_scripts', function ( $hook ) {
    if ( music_gallery_is_block_editor_screen() ) {
        music_gallery_enqueue_editor_support_assets();
    }

    if ( $hook !== 'music-gallery_page_music_gallery--builder' ) {
        return;
    }

    $base   = plugin_dir_url( __FILE__ ) . 'build/';
    $config = json_decode( file_get_contents( __DIR__ . '/config.json' ), true );
    foreach ( $config['themes'] as $theme ) {
        wp_enqueue_style( "mg-theme-$theme", $base . "theme/$theme.css", [], MUSIC_GALLERY_VERSION );
    }
    wp_enqueue_style(
            'mg-editor',
            $base . 'index.css',
            array_merge(
                    array_map( function ( $t ) {
                        return "mg-theme-$t";
                    }, $config['themes'] ),
            ),
            MUSIC_GALLERY_VERSION
    );
    wp_enqueue_style( 'mg-shortcode-builder', $base . 'admin/shortcode_builder.css', [], MUSIC_GALLERY_VERSION );

    music_gallery_enqueue_editor_support_assets();

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

    $shortcode_builder_asset_path = __DIR__ . '/build/admin/shortcode_builder.asset.php';
    $shortcode_builder_asset      = file_exists( $shortcode_builder_asset_path )
            ? include $shortcode_builder_asset_path
            : [
                    'dependencies' => [
                            'react',
                            'react-dom',
                            'react-jsx-runtime',
                            'wp-element',
                            'wp-components',
                            'wp-i18n',
                            'wp-block-editor',
                            'wp-editor',
                            'wp-color-picker',
                            'media-views',
                    ],
                    'version'      => MUSIC_GALLERY_VERSION,
            ];

    wp_enqueue_script(
            'mg-sc-builder',
            plugin_dir_url( __FILE__ ) . 'build/admin/shortcode_builder.js',
            $shortcode_builder_asset['dependencies'],
            $shortcode_builder_asset['version'],
            true
    );
} );

add_action( 'enqueue_block_editor_assets', function () {
    music_gallery_enqueue_editor_support_assets();
} );

add_shortcode( 'music-gallery', function ( $attributes ) {
    $attributes = shortcode_atts(
            [
                    'photos'             => '',
                    'photos_cdn'         => '',
                    'photos_source'      => 'wp',
                    'music'              => '',
                    'music_cdn'          => '',
                    'music_source'       => 'wp',
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
            'music_gallery'
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


    return music_gallery_block_render( $attributes );
} );
