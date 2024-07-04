<?php

namespace IGD;

defined( 'ABSPATH' ) || exit;

use IGD\Elementor\Shortcodes_Widget;
use IGD\Elementor\Module_Widget;

class Elementor {
	/**
	 * @var null
	 */
	protected static $instance = null;

	public function __construct() {
		add_action( 'elementor/elements/categories_registered', [ $this, 'add_categories' ] );
		add_action( 'elementor/widgets/register', [$this, 'register_widgets'] );
		add_action( 'elementor/frontend/before_enqueue_scripts', [ $this, 'elementor_scripts' ] );
	}

	public function elementor_scripts() {
		wp_enqueue_script( 'igd-elementor', IGD_DIST . '/js/elementor.js', [ 'jquery', 'wp-i18n' ], IGD_VERSION, true );
	}

	public function register_widgets( $widgets_manager ) {
		include_once IGD_INCLUDES . '/elementor/class-elementor-shortcodes-widget.php';
		include_once IGD_INCLUDES . '/elementor/class-elementor-module-widget.php';
		$widgets_manager->register_widget_type( new Shortcodes_Widget() );
		$widgets_manager->register_widget_type( new Module_Widget() );
	}

	public function add_categories( $elements_manager ) {
		$elements_manager->add_category( 'integrate_google_drive', [
				'title' => __( 'Integrate Google Drive', 'integrate-google-drive' ),
				'icon'  => 'fa fa-plug',
			]
		);
	}

	/**
	 * @return Elementor|null
	 */
	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

}

Elementor::instance();