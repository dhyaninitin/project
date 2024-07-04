<?php

namespace IGD;

defined( 'ABSPATH' ) || exit();


class TinyMCE {
	/**
	 * @var null
	 */
	protected static $instance = null;

	public function __construct() {
		add_filter( 'mce_buttons', [ $this, 'add_buttons' ] );
		add_filter( 'mce_external_plugins', [ $this, 'add_plugins' ] );

		//todo -
		//add_filter( 'mce_css', [ $this, 'enqueue_css' ] );
	}

	public function add_buttons( $buttons ) {
		$buttons[] = 'integrate_google_drive';

		return $buttons;
	}

	public function add_plugins( $plugins ) {
		$plugins['igd_tinymce_js'] = IGD_DIST . '/js/tinymce.js';

		return $plugins;
	}

	public function enqueue_css( $mce_css ) {
		if ( ! empty( $mce_css ) ) {
			$mce_css .= ',';
		}

		$mce_css .= IGD_DIST . '/css/tinymce.css';

		return $mce_css;
	}

	/**
	 * @return TinyMCE|null
	 */
	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

}

TinyMCE::instance();