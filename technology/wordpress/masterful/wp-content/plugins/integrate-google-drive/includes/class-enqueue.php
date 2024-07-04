<?php

namespace IGD;

defined( 'ABSPATH' ) || exit();

class Enqueue {
	/**
	 * @var null
	 */
	protected static $instance = null;

	public function __construct() {
		add_action( 'wp_enqueue_scripts', [ $this, 'frontend_scripts' ] );
		add_action( 'admin_enqueue_scripts', [ $this, 'admin_scripts' ] );
	}

	public function frontend_scripts() {
		// register frontend css
		wp_register_style( 'igd-frontend', IGD_DIST . '/css/frontend.css', [
			'wp-components',
			'dashicons'
		], IGD_VERSION );

		// register frontend js
		wp_register_script( 'igd-frontend', IGD_DIST . '/js/frontend.js', array(
			'wp-element',
			'wp-components',
			'wp-block-editor',
			'wp-api-fetch',
			'wp-i18n',
			'wp-util',
		), IGD_VERSION, true );

		// enqueue scripts
		wp_enqueue_style( 'igd-frontend' );
		wp_enqueue_script( 'igd-frontend' );

		//For uploader
		wp_enqueue_script( 'wp-plupload' );

		wp_localize_script( 'igd-frontend', 'igd', array(
			'is_admin'   => is_admin(),
			'site_url'   => site_url(),
			'plugin_url' => IGD_URL,
			'admin_url'  => admin_url(),
			'ajax_url'   => admin_url( 'admin-ajax.php' ),
			'nonce'      => wp_create_nonce( 'wp_rest' ),

			'accounts'      => Account::get_accounts(),
			'activeAccount' => Account::get_active_account(),

			'settings' => igd_get_settings(),

			'isPro'      => igd_fs()->can_use_premium_code__premium_only(),
			'upgradeUrl' => igd_fs()->get_upgrade_url(),
		) );

	}

	public function admin_scripts() {

		// register admin css
		wp_register_style( 'igd-admin', IGD_DIST . '/css/admin.css', [ 'wp-components', 'dashicons' ], IGD_VERSION );

		// register admin js
		wp_register_script( 'igd-admin', IGD_DIST . '/js/admin.js', array(
			'wp-element',
			'wp-components',
			'wp-block-editor',
			'wp-api-fetch',
			'wp-i18n',
			'wp-util',
		), IGD_VERSION, true );

		// enqueue scripts
		wp_enqueue_style( 'igd-admin' );
		wp_enqueue_script( 'igd-admin' );

		// enqueue upload assets
		wp_enqueue_script( 'wp-plupload' );

		$localize_array = array(
			'is_admin'   => is_admin(),
			'site_url'   => site_url(),
			'plugin_url' => IGD_URL,
			'admin_url'  => admin_url(),
			'ajax_url'   => admin_url( 'admin-ajax.php' ),
			'nonce'      => wp_create_nonce( 'wp_rest' ),

			'accounts'      => Account::get_accounts(),
			'activeAccount' => Account::get_active_account(),

			'settings' => igd_get_settings(),

			'isPro'      => igd_fs()->can_use_premium_code__premium_only(),
			'upgradeUrl' => igd_fs()->get_upgrade_url(),
		);

		global $current_screen;
		if ( is_object( $current_screen ) ) {
			if ( in_array( $current_screen->post_type, [ 'product', 'download' ] ) ) {
				$localize_array['authUrl'] = Client::instance()->get_auth_url();
			}
		}

		wp_localize_script( 'igd-admin', 'igd', $localize_array );

	}

	/**
	 * @return Enqueue|null
	 */
	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

}

Enqueue::instance();