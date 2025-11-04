<?php

namespace BeedVision\WPMusicGallery;

class Admin {
	public function __construct() {
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_scripts' ] );
	}

	public function enqueue_scripts() {
		wp_enqueue_style( 'wpmusicgallery-admin', PDF2WP_URL . 'assets/admin.css', [], '1.0.0' );
		wp_enqueue_script( 'wpmusicgallery-admin', PDF2WP_URL . 'assets/admin.js', [ 'jquery' ], '1.0.0', true );
	}
}
