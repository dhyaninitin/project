<?php

namespace IGD;

defined( 'ABSPATH' ) || exit();


class Shortcode_Builder {
	/**
	 * @var null
	 */
	protected static $instance = null;

	public function __construct() {
	}

	public function get_shortcode( $id = null ) {
		global $wpdb;

		$table = $wpdb->prefix . 'integrate_google_drive_shortcodes';

		if ( $id ) {
			$result = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table WHERE id=%d", $id ) );
		} else {
			$result = $wpdb->get_results( "SELECT * FROM $table" );
		}

		return $result;

	}

	public function update_shortcode( $posted ) {
		global $wpdb;

		$table  = $wpdb->prefix . 'integrate_google_drive_shortcodes';
		$id     = ! empty( $posted['id'] ) ? intval( $posted['id'] ) : '';
		$status = ! empty( $posted['status'] ) ? sanitize_key( $posted['status'] ) : 'on';
		$title  = ! empty( $posted['title'] ) ? sanitize_text_field( $posted['title'] ) : '';

		$data = [
			'title'  => $title,
			'status' => $status,
			'config' => serialize( $posted ),
		];

		$data_format = [ '%s', '%s', '%s' ];

		if ( $id ) {
			$wpdb->update( $table, $data, [ 'id' => $id ], $data_format, [ '%d' ] );
		} else {
			$wpdb->insert( $table, $data, $data_format );
		}

		return $id ?: $wpdb->insert_id;

	}

	public function delete_shortcode( $id ) {
		global $wpdb;
		$table = $wpdb->prefix . 'integrate_google_drive_shortcodes';

		$wpdb->delete( $table, [ 'id' => $id ], [ '%d' ] );
	}

	public static function view() {
		$auth_url = Client::instance()->get_auth_url();
		?>
        <script>
            const igdAuthUrl = '<?php echo $auth_url; ?>';
        </script>
        <div class="wrap">
            <div id="igd-shortcode-builder" class="h-full"></div>
        </div>
	<?php }

	/**
	 * @return Shortcode_Builder|null
	 */
	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

}

Shortcode_Builder::instance();