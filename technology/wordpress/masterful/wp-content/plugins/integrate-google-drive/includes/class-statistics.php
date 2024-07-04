<?php

namespace IGD;

class Statistics {

	private static $instance = null;

	public function __construct() {
		add_action( 'admin_menu', array( $this, 'add_menu_page' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_scripts' ) );

		add_action( 'wp_ajax_igd_log', array( $this, 'insert_log' ) );
		add_action( 'wp_ajax_nopriv_igd_log', array( $this, 'insert_log' ) );

		add_action( 'wp_ajax_igd_get_logs', array( $this, 'get_logs' ) );
		add_action( 'wp_ajax_nopriv_igd_get_logs', array( $this, 'get_logs' ) );
	}

	public function add_menu_page() {
		add_submenu_page( 'integrate-google-drive', 'Statistics - Integrate Google Drive',
			__( 'Statistics', 'integrate-google-drive' ), 'manage_options', 'integrate-google-drive-statistics', [
				'IGD\Statistics',
				'view'
			], 90
		);
	}

	public function get_logs() {
		$start_date = ! empty( $_POST['start_date'] ) ? sanitize_text_field( $_POST['start_date'] ) : '';
		$end_date   = ! empty( $_POST['end_date'] ) ? sanitize_text_field( $_POST['end_date'] ) : '';
		$end_date   = $end_date . ' 23:59:59';

		$data = [
			'downloads' => $this->get_top_items( $start_date, $end_date, 'download' ),
			'uploads'   => $this->get_top_items( $start_date, $end_date, 'upload' ),
			'streams'   => $this->get_top_items( $start_date, $end_date, 'stream' ),
			'previews'  => $this->get_top_items( $start_date, $end_date, 'preview' ),

			'downloadUsers' => $this->get_top_users( $start_date, $end_date, 'download' ),
			'uploadUsers'   => $this->get_top_users( $start_date, $end_date, 'upload' ),
			'streamUsers'   => $this->get_top_users( $start_date, $end_date, 'stream' ),
			'previewUsers'  => $this->get_top_users( $start_date, $end_date, 'preview' ),

			'events' => $this->get_events( $start_date, $end_date ),
		];

		wp_send_json_success( $data );
	}

	public function get_top_items( $start_date, $end_date, $type ) {

		global $wpdb;
		$table_name = $wpdb->prefix . 'integrate_google_drive_logs';

		$sql = "SELECT *, COUNT(id) as total FROM $table_name 
                WHERE type = '$type' AND created_at BETWEEN '$start_date' AND '$end_date'
                GROUP BY file_id
                ORDER BY total DESC
                LIMIT 25
                ";

		$results = $wpdb->get_results( $sql );

		return $results;

	}

	public function get_top_users( $start_date, $end_date, $type ) {

		global $wpdb;
		$table_name = $wpdb->prefix . 'integrate_google_drive_logs';

		$sql = "SELECT user_id, COUNT(id) as total FROM $table_name 
                WHERE type = '$type' AND created_at BETWEEN '$start_date' AND '$end_date'
                GROUP BY user_id
                ORDER BY total DESC
                LIMIT 25
                ";

		$results = $wpdb->get_results( $sql );

		$data = [];

		if ( ! empty( $results ) ) {
			foreach ( $results as $result ) {

				$gravatar = '<img src="' . IGD_DIST . '/images/user-icon.png" height="32px" />';

				if ( $result->user_id ) {
					$user = get_user_by( 'id', $result->user_id );
					$name = $user->user_login;

					// Gravatar
					if ( function_exists( 'get_wp_user_avatar_url' ) ) {
						$gravatar = get_wp_user_avatar( $user->user_email, 32 );
					} else {
						$gravatar = get_avatar( $user->user_email, 32 );
					}
				} else {
					$name = 'Guest';
				}

				$data[] = [
					'user_id' => $result->user_id,
					'avatar'  => $gravatar,
					'name'    => $name,
					'count'   => $result->total
				];
			}
		}

		return $data;
	}

	public function get_events( $start_date, $end_date ) {

		global $wpdb;
		$table_name = $wpdb->prefix . 'integrate_google_drive_logs';

		$sql = "SELECT * FROM $table_name 
WHERE created_at BETWEEN '$start_date' AND '$end_date'
ORDER BY created_at DESC
                LIMIT 999
";

		$results = $wpdb->get_results( $sql );

		$data = [];

		if ( ! empty( $results ) ) {
			foreach ( $results as $result ) {
				$item = $result;

				if ( $result->user_id ) {
					$user           = get_user_by( 'id', $result->user_id );
					$item->username = $user->user_login;
				} else {
					$item->username = 'Guest';
				}

				$data[] = $item;
			}
		}

		return $data;
	}

	public function insert_log() {
		$file = $_POST['file'];
		$type = ! empty( $_POST['type'] ) ? sanitize_text_field( $_POST['type'] ) : '';

		global $wpdb;
		$table_name = $wpdb->prefix . 'integrate_google_drive_logs';

		$user_id = get_current_user_id();

		$wpdb->insert(
			$table_name,
			array(
				'type'       => $type,
				'user_id'    => $user_id,
				'file_id'    => $file['id'],
				'file_name'  => $file['name'],
				'file_type'  => $file['type'],
				'account_id' => $file['accountId'],
				'created_at' => current_time( 'mysql' )
			),
			array( '%s', '%d', '%s', '%s', '%s', '%s', '%s', )
		);

		wp_send_json_success();
	}

	public function enqueue_scripts() {
		wp_enqueue_style( 'igd-statistics', IGD_DIST . '/css/statistics.css' );
		wp_enqueue_script( 'igd-statistics', IGD_DIST . '/js/statistics.js', array(
			'wp-element',
			'wp-components',
			'wp-block-editor',
			'wp-api-fetch',
			'wp-i18n',
			'wp-util',
			'jquery-ui-datepicker'
		), IGD_VERSION, true );
	}

	public static function view() { ?>
        <div id="igd-statistics" class="igd-statistics"></div>
	<?php }

	public static function instance() {
		if ( null === self::$instance ) {
			self::$instance = new self;
		}

		return self::$instance;
	}

}

new Statistics();