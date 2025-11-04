<?php
/*
 * Plugin Name:         WP Music Gallery
 * Plugin URI:          https://wpmusicgallery.com
 * Description:         Creates photo gallery with music and animation.
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
define('WP_MUSIC_GALLERY_PATH', plugin_dir_path(__FILE__));
define('WPMusicGallery_URL', plugin_dir_url(__FILE__));

require __DIR__ . '/includes/autoload.php';

new Admin;
