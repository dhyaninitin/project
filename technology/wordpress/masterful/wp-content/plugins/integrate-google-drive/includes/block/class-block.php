<?php

namespace IGD;

defined( 'ABSPATH' ) || exit();

class Block {
	/**
	 * @var null
	 */
	protected static $instance = null;

	public function __construct() {
		add_filter( 'block_categories_all', [ $this, 'filter_block_categories' ], 10, 2 );
		add_action( 'enqueue_block_editor_assets', [ $this, 'enqueue_editor_assets' ] );
	}

	function filter_block_categories( $block_categories, $editor_context ) {
		if ( ! empty( $editor_context->post ) ) {
			$new_categories = [
				[
					'slug'  => 'igd-category',
					'title' => __( 'Integrate Google Drive', 'integrate-google-drive' ),
					'icon'  => null,
				]
			];

			$block_categories = array_merge( $block_categories, $new_categories );
		}

		return $block_categories;
	}

	function enqueue_editor_assets() {
		wp_enqueue_script(
			'igd-blocks',
			IGD_URL . '/includes/block/build/index.js',
			array( 'wp-blocks', 'wp-i18n', 'wp-element', 'wp-data', 'wp-editor' ),
			IGD_VERSION
		);


	}

	/**
	 * @return Block|null
	 */
	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

}

Block::instance();


