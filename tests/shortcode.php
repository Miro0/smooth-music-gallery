<?php
// wp eval-file tests/shortcode.php /tmp/smoothmg-shortcodes.json

$fixtures = json_decode( file_get_contents( $args[0] ), true );

function smoothmg_test_props( $html ) {
    // The Shortcode block may leave paragraph wrappers around a block element.
    $html = preg_replace( '/<\/?p>/', '', $html );

    if ( ! preg_match( '/^\s*<div class="smoothmg-gallery" data-props=([\'"])(.*?)\1><\/div>\s*$/s', $html, $match ) ) {
        throw new RuntimeException( 'Expected exactly one gallery without leftover shortcode text: ' . $html );
    }

    return json_decode( html_entity_decode( $match[2], ENT_QUOTES, 'UTF-8' ), true );
}

function smoothmg_test_equal( $expected, $actual, $label ) {
    if ( $expected !== $actual ) {
        throw new RuntimeException( $label . ': ' . wp_json_encode( $actual ) );
    }
}

foreach ( $fixtures as $fixture ) {
    $shortcode = $fixture['shortcode'];
    $outputs = [
            do_shortcode( $shortcode ),
            apply_filters( 'the_content', '<!-- wp:shortcode -->' . $shortcode . '<!-- /wp:shortcode -->' ),
            apply_filters( 'the_content', $shortcode ),
    ];

    foreach ( $outputs as $output ) {
        $props = smoothmg_test_props( $output );
        smoothmg_test_equal( $fixture['expectedPhotos'], $props['photos'], $fixture['name'] . ' photos' );
        smoothmg_test_equal( 'video_player', $props['theme'], 'Theme after the photos array' );
        smoothmg_test_equal( '2', $props['slides_duration'], 'Duration after the photos array' );
        smoothmg_test_equal( '85', $props['size'], 'Size after the photos array' );
        smoothmg_test_equal( 'https://cdn.smoothbundle.com/smoothbundle/assets/Good%20Times%20Rolling.mp3', $props['music']['url'], 'Music' );

        foreach ( [ 'theme_options', 'overlay_options', 'background_options' ] as $key ) {
            if ( isset( $fixture['attributes'][ $key ] ) ) {
                smoothmg_test_equal( $fixture['attributes'][ $key ], $props[ $key ], $key );
            }
        }
    }

    WP_CLI::log( 'PASS: ' . $fixture['name'] . ' (direct, Shortcode block, classic content)' );
}

$legacy = "[smooth-music-gallery photos='https://example.com/one.jpg,https://example.com/two.jpg' theme_options='{\"color\":\"red\"}' ]";
$props = smoothmg_test_props( do_shortcode( $legacy ) );
smoothmg_test_equal( [ [ 'url' => 'https://example.com/one.jpg' ], [ 'url' => 'https://example.com/two.jpg' ] ], $props['photos'], 'Legacy URL list' );
smoothmg_test_equal( [ 'color' => 'red' ], $props['theme_options'], 'Legacy JSON options' );

$block = serialize_block( [
        'blockName'    => 'smoothbundle/smooth-music-gallery',
        'attrs'        => $fixtures[0]['attributes'],
        'innerBlocks'  => [],
        'innerHTML'    => '',
        'innerContent' => [],
] );
$props = smoothmg_test_props( apply_filters( 'the_content', $block ) );
smoothmg_test_equal( $fixtures[0]['expectedPhotos'], $props['photos'], 'Native Gutenberg gallery photos' );
smoothmg_test_equal( 'video_player', $props['theme'], 'Native Gutenberg gallery theme' );
smoothmg_test_equal( true, wp_script_is( 'smoothmg-view', 'enqueued' ), 'Frontend script enqueued' );
WP_CLI::success( 'Shortcode regression checks and native Gutenberg rendering passed.' );
