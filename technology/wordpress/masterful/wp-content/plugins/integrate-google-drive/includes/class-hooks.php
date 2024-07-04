<?php

namespace IGD;

defined( 'ABSPATH' ) || exit();


class Hooks {
	/**
	 * @var null
	 */
	protected static $instance = null;

	public function __construct() {

		//Handle oAuth authorization
		add_action( 'admin_init', [ $this, 'handle_authorization' ] );

		// Stream
		add_action( 'wp_ajax_igd_stream', [ $this, 'stream_content' ] );
		add_action( 'wp_ajax_nopriv_igd_stream', [ $this, 'stream_content' ] );

		// Download
		add_action( 'wp_ajax_igd_download_zip', [ $this, 'download_zip' ] );
		add_action( 'wp_ajax_nopriv_igd_download_zip', [ $this, 'download_zip' ] );

		// Generate thumbnail
		add_action( 'wp_ajax_igd_get_preview_thumbnail', [ $this, 'get_preview_thumbnail' ] );
		add_action( 'wp_ajax_nopriv_igd_get_preview_thumbnail', [ $this, 'get_preview_thumbnail' ] );

		// Remove admin notices from plugin pages
		add_action( 'admin_head', [ $this, 'remove_admin_notices' ] );

		//own app config
		$settings = get_option( 'igd_settings' );
		if ( ! empty( $settings['ownApp'] ) && ! empty( $settings['clientID'] ) && ! empty( $settings['clientSecret'] ) ) {

			add_filter( 'igd/client_id', function () use ( $settings ) {
				return $settings['clientID'];
			} );

			add_filter( 'igd/client_secret', function () use ( $settings ) {
				return $settings['clientSecret'];
			} );

			add_filter( 'igd/redirect_uri', function () use ( $settings ) {
				return IGD_URL . '/app/authorize.php';
			} );
		}

		//Handle uninstall
		igd_fs()->add_action( 'after_uninstall', [ $this, 'uninstall' ] );

		// add new cron schedules
		add_filter( 'cron_schedules', [ $this, 'cron_schedules' ] );
		add_action( 'init', [ $this, 'init_cron_job' ] );

		// Sync cloud files
		add_action( 'igd_sync_interval', [ $this, 'sync' ] );

		// IGD render form upload field data
		add_filter( 'igd_render_form_field_data', [ $this, 'render_form_field_data' ], 10, 2 );

		// Preview content
		add_action( 'wp_ajax_igd_preview', [ $this, 'preview' ] );
		add_action( 'wp_ajax_nopriv_igd_preview', [ $this, 'preview' ] );

	}

	public function preview() {
		$file_id    = sanitize_text_field( $_REQUEST['file_id'] );
		$account_id = sanitize_text_field( $_REQUEST['account_id'] );

		$preview_url = igd_get_embed_url( $file_id, $account_id );

		if ( ! $preview_url ) {
			_e( 'Something went wrong! Preview not available', 'integrate-google-drive' );
			die();
		}

		header( 'Location: ' . $preview_url );

		die();
	}

	public function render_form_field_data( $data, $as_html ) {
		$uploaded_files = json_decode( $data, 1 );

		if ( empty( $uploaded_files ) ) {
			return $data;
		}

		$first_file = $uploaded_files[0];
		$parent_id  = $first_file['parents'][0];

		$folder_location = sprintf( '<a href="https://drive.google.com/drive/folders/%s">Google Drive</a>', $parent_id );
		$formatted_value = sprintf( '%d file(s) uploaded to %s:', count( $uploaded_files ), $folder_location );

		// Render TEXT only
		if ( ! $as_html ) {
			$formatted_value .= "\r\n";
			foreach ( $uploaded_files as $file ) {
				$formatted_value .= $file['name'] . "\r\n";
			}

			return $formatted_value;
		}

		// Render HTML
		ob_start();
		$current = 0;

		echo $formatted_value; ?>
        <table cellpadding="0" cellspacing="0" width="100%" border="0"
               style="cellspacing:0;line-height:22px;border:none;table-layout:auto;width:100%;">
			<?php foreach ( $uploaded_files as $file ) { ?>
                <tr style="<?php echo ( $current % 2 ) ? 'background: #fafafa;' : ''; ?> height: 26px;">
                    <td style="width:20px;padding-right:10px;padding-left:5px;border:none;">
                        <img alt="" height="16" src="<?php echo $file['iconLink']; ?>"
                             style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:16px;max-width:16px;"
                             width="16">
                    </td>
                    <td style="padding-right:10px;border:none;">
                        <a href="<?php printf( 'https://drive.google.com/file/d/%s/view?usp=drivesdk', $file['id'] ); ?>"
                           target="_blank"><?php echo $file['name']; ?></a>
                    </td>
                </tr>
				<?php
				++ $current;
			} ?>
        </table>
		<?php

		//Remove any newlines
		return trim( preg_replace( '/\s+/', ' ', ob_get_clean() ) );
	}

	public function cron_schedules( $schedules ) {
		$settings = get_option( 'igd_settings' );
		$interval = ! empty( $settings['syncInterval'] ) ? $settings['syncInterval'] : 259200;

		if ( 'never' != $interval ) {
			$schedules['igd_sync_interval'] = [
				'interval' => $interval,
				'display'  => __( 'Integrate Google Drive Synchronize Interval', 'integrate-google-drive' )
			];
		}

		return $schedules;
	}

	public function init_cron_job() {

		$settings = get_option( 'igd_settings' );

		$hook     = 'igd_sync_interval';
		$interval = ! empty( $settings['syncInterval'] ) ? $settings['syncInterval'] : 259200;

		if ( 'never' != $interval ) {

			$scheduled_interval = igd_get_scheduled_interval( $hook );

			// If settings changed clear previous hook
			if ( $scheduled_interval != $interval ) {
				wp_clear_scheduled_hook( $hook );
			}

			if ( ! wp_next_scheduled( $hook ) ) {
				wp_schedule_event( time(), 'igd_sync_interval', $hook );
			}
		} else {
			wp_clear_scheduled_hook( $hook );
		}
	}

	public function uninstall() {

		//Remove cron
		$timestamp = wp_next_scheduled( 'igd_sync_interval' );
		if ( $timestamp ) {
			wp_unschedule_event( $timestamp, 'igd_sync_interval' );
		}

		//Delete data
		if ( igd_get_settings( 'deleteData', false ) ) {
			delete_option( 'igd_tokens' );
			delete_option( 'igd_accounts' );
			delete_option( 'igd_settings' );
			delete_option( 'igd_guest_folders' );

			delete_option( 'igd_cached_folders' );
			igd_delete_thumbnail_cache();
		}

	}

	public function remove_admin_notices() {
		global $current_screen;

		if ( ! empty( $current_screen ) && ! in_array( $current_screen->id, [
				'toplevel_page_integrate-google-drive',
				'google-drive_page_integrate-google-drive-shortcode-builder',
				'google-drive_page_integrate-google-drive-getting-started',
				'google-drive_page_integrate-google-drive-private-folders',
				'google-drive_page_integrate-google-drive-settings',
			] ) ) {
			return;
		}

		remove_all_actions( 'admin_notices' );
		remove_all_actions( 'all_admin_notices' );
	}

	public function handle_authorization() {

		if ( isset( $_GET['action'] ) && 'authorization' == sanitize_key( $_GET['action'] ) ) {

			$client = Client::instance();

			$client->create_access_token();

			$redirect = admin_url( 'admin.php?page=integrate-google-drive-settings' );

			echo '<script type="text/javascript">window.opener.parent.location.href = "' . $redirect . '"; window.close();</script>';
			die();
		}
	}

	public function sync() {

		// Delete files
		Files::instance()->delete_account_files();

		// Delete folder cache
		delete_option( 'igd_cached_folders' );

		error_log( "Cache reset - " . date( "Y-m-d H:i:s" ) );
	}

	public function get_preview_thumbnail() {
		$id         = sanitize_text_field( $_REQUEST['id'] );
		$account_id = ! empty( $_REQUEST['accountId'] ) ? $_REQUEST['accountId'] : Account::get_active_account()['id'];

		$file = App::instance( $account_id )->get_file_by_id( $id );

		$size = sanitize_key( $_REQUEST['size'] );

		if ( 'large' === $size ) {
			$thumbnail_attributes = '=s0';
		} else if ( 'gallery' === $size ) {
			$thumbnail_attributes = '=h300-nu-iv1';
		} else {
			$thumbnail_attributes = '=w200-h190-p-k-nu-iv1';
		}

		$thumbnail_file = $id . $thumbnail_attributes . '.png';

		if (
			file_exists( IGD_CACHE_DIR . '/thumbnails/' . $thumbnail_file )
			&& ( filemtime( IGD_CACHE_DIR . '/thumbnails/' . $thumbnail_file ) === strtotime( $file['updated'] ) )
		) {
			$url = IGD_CACHE_URL . '/thumbnails/' . $thumbnail_file;

			$img_info = getimagesize( $url );
			header( "Content-type: {$img_info['mime']}" );
			readfile( $url );

			exit();
		}

		$download_link = "https://lh3.google.com/u/0/d/{$id}{$thumbnail_attributes}";

		try {
			$client = Client::instance()->get_client();

			$request = new \IGDGoogle_Http_Request( $download_link, 'GET' );

			$client->getIo()->setOptions( [
				CURLOPT_SSL_VERIFYPEER => false,
				CURLOPT_FOLLOWLOCATION => true
			] );

			$httpRequest = $client->getAuth()->authenticatedRequest( $request );

			if ( ! file_exists( IGD_CACHE_DIR . '/thumbnails' ) ) {
				@mkdir( IGD_CACHE_DIR . '/thumbnails', 0755 );
			}

			if ( ! is_writable( IGD_CACHE_DIR . '/thumbnails' ) ) {
				@chmod( IGD_CACHE_DIR . '/thumbnails', 0755 );
			}

			// Save the thumbnail locally
			$headers = $httpRequest->getResponseHeaders();

			if ( ! stristr( $headers['content-type'], 'image' ) ) {
				return;
			}

			@file_put_contents( IGD_CACHE_DIR . '/thumbnails/' . $thumbnail_file, $httpRequest->getResponseBody() ); //New SDK: $response->getBody()
			touch( IGD_CACHE_DIR . '/thumbnails/' . $thumbnail_file, strtotime( $file['updated'] ) );

			echo $httpRequest->getResponseBody();

		} catch ( \Exception $e ) {
			echo $e->getMessage();
		}

		exit();
	}

	public function stream_content() {
		$id = ! empty( $_REQUEST['id'] ) ? sanitize_text_field( $_REQUEST['id'] ) : '';

		$file = App::instance()->get_file_by_id( $id );

		Download::instance( $file )->start_download();

		exit();
	}

	public function download_zip() {
		$file_ids = ! empty( $_REQUEST['file_ids'] ) ? json_decode( base64_decode( sanitize_text_field( $_REQUEST['file_ids'] ) ) ) : [];
		igd_download_zip( $file_ids );
	}

	/**
	 * @return Hooks|null
	 */
	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

}

Hooks::instance();