<?php

namespace IGD;

defined( 'ABSPATH' ) || exit();


class Shortcode {
	/**
	 * @var null
	 */
	protected static $instance = null;

	public function __construct() {
		add_shortcode( 'integrate_google_drive', [ $this, 'render_shortcode' ] );
	}

	/**
	 * @param $atts
	 *
	 * @return false|string|void
	 */
	public function render_shortcode( $atts, $data = null ) {
        

		// Get the shortcode ID from attributes
		if ( ! empty( $data ) ) {
			$id = rand();
		} elseif ( ! empty( $atts['id'] ) ) {
			$id = intval( $atts['id'] );

			if ( $id ) {
				$shortcode = Shortcode_Builder::instance()->get_shortcode( $id );
				if ( ! empty( $shortcode ) ) {
					$data = unserialize( $shortcode->config );
				}
			}
		} else {
			// Get the shortcode ID from the block
			global $post;

			$blocks = parse_blocks( $post->post_content );

			if ( ! empty( $blocks ) ) {
				foreach ( $blocks as $key => $block ) {
					if ( ! empty( $block['blockName'] ) && $block['blockName'] == 'igd/shortcode-builder' ) {
						$id = "block_$key";

						if ( ! empty( $block['attrs']['data'] ) ) {
							$data = $block['attrs']['data'];
						}
						break;
					}
				}
			}
		}

		// If the shortcode is not found, return nothing
		if ( empty( $data ) ) {
			return;
		}


		$status = ! empty( $data['status'] ) ? $data['status'] : 'on';

		// Check shortcode status
		if ( 'off' == $status ) {
			return;
		}

		// Check if the shortcode could be rendered
		$should_show = false;

		$display_for = !empty($data['displayFor']) ? $data['displayFor'] : 'everyone';

		if ( 'everyone' == $display_for ) {
			$should_show = true;
		} elseif ( 'loggedIn' == $display_for && is_user_logged_in() ) {
			$display_users    = $data['displayUsers'];
			$display_everyone = $data['displayEveryone'];
			$display_except   = $data['displayExcept'];

			$roles = array_filter( $display_users, function ( $item ) {
				return is_string( $item );
			} );

			$except_roles = array_filter( $display_except, function ( $item ) {
				return is_string( $item );
			} );

			$current_user = wp_get_current_user();

			if ( ! $display_everyone ) {

				if ( ! empty( $roles ) ) {

					if ( in_array( 'everyone', $roles ) ) { // Check if everyone
						$should_show = true;
					} elseif ( ! empty( array_intersect( $current_user->roles, $roles ) ) ) { // If matches roles
						$should_show = true;
					}
				}

				if ( in_array( $current_user->ID, $display_users ) ) { // If current user_id
					$should_show = true;
				}

			} else {

				if (
					! in_array( $current_user->ID, $display_except ) &&
					empty( array_intersect( $current_user->roles, $except_roles ) )
				) {
					$should_show = true;
				}
			}

		}

		if ( ! $should_show ) {
			return;
		}

		// Check if private folders
		$all_folders     = ! empty( $data['allFolders'] );
		$private_folders = !empty($data['privateFolders']) ? $data['privateFolders'] : false;

		if ( ! $all_folders && $private_folders ) {
			$data['folders'] = is_user_logged_in() ? get_user_option( 'folders' ) : get_option( 'igd_guest_folders' );

			if ( empty( $data['folders'] ) ) {
				return;
			}

		}


		ob_start(); ?>
        <div class="igd select-none" data-id="<?php echo $id; ?>"></div>

        <script type="application/json"
                id="igd_shortcode_data_<?php echo $id; ?>"><?php echo json_encode( $data ); ?></script>

		<?php
		return ob_get_clean();

	}

	/**
	 * @return Shortcode|null
	 */
	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

}

Shortcode::instance();