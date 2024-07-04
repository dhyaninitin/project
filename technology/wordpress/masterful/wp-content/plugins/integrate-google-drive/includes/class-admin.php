<?php

namespace IGD;

defined( 'ABSPATH' ) || exit;

class Admin {
	/**
	 * @var null
	 */
	protected static $instance = null;

	public function __construct() {
		add_action( 'admin_menu', [ $this, 'admin_menu' ] );

		add_action( 'admin_notices', [ $this, 'admin_notices' ] );
		add_action( 'admin_init', [ $this, 'init_update' ] );
	}

	public function init_update() {

		if ( ! class_exists( 'Update_1_0_5' ) && current_user_can( 'manage_options' ) ) {
			include_once IGD_INCLUDES . '/class-update.php';

			$updater = Update::instance();
			if ( $updater->needs_update() ) {
				$updater->perform_updates();
			}
		}
	}

	public function admin_menu() {

		add_menu_page( __( 'Integrate Google Drive', 'integrate-google-drive' ), __( 'Google Drive', 'integrate-google-drive' ), 'manage_options',
			'integrate-google-drive', [ 'IGD\App', 'view' ], IGD_DIST . '/images/drive.png', 30
		);

		add_submenu_page( 'integrate-google-drive', 'File Browser - Integrate Google Drive', 'File Browser', 'manage_options', 'integrate-google-drive' );

		add_submenu_page( 'integrate-google-drive', 'Shortcode Builder - Integrate Google Drive', 'Shortcode Builder', 'manage_options', 'integrate-google-drive-shortcode-builder', [
			'IGD\Shortcode_Builder',
			'view'
		], 90 );

		add_submenu_page( 'integrate-google-drive', 'Private Folders',
			__( 'Private Folders', 'integrate-google-drive' ), 'manage_options', 'integrate-google-drive-private-folders', [
				'IGD\Private_Folders',
				'view'
			], 90
		);

		add_submenu_page( 'integrate-google-drive', 'Getting Started - Integrate Google Drive',
			__( 'Getting Started', 'integrate-google-drive' ), 'manage_options', 'integrate-google-drive-getting-started', [
				$this,
				'render_getting_started_page'
			], 90
		);

		add_submenu_page( 'integrate-google-drive', 'Settings - Integrate Google Drive',
			__( 'Settings', 'integrate-google-drive' ), 'manage_options', 'integrate-google-drive-settings', [
				$this,
				'render_settings_page'
			], 90
		);
	}

	public function admin_notices() {

		$accounts = Account::get_accounts();

		if ( ! empty( $accounts ) ) {
			foreach ( $accounts as $id => $account ) {

				if ( ! empty( $account['lost'] ) ) {

					$msg = sprintf( '<div class="flex items-center"> <strong>Integrate Google Drive</strong> lost authorization for account <strong>%s</strong>. <a class="button" href="%s">Refresh</a></div>',
						$account['email'], admin_url( 'admin.php?page=integrate-google-drive-settings' ) );

					igd()->add_notice( 'error igd-lost-auth-notice', $msg );
				}

			}
		}

	}

	public function render_getting_started_page() { ?>
        <div class="wrap">
            <div id="igd-getting-started"></div>
        </div>
	<?php }

	public function render_settings_page() {
		$auth_url = Client::instance()->get_auth_url();
		?>
        <script>
            const igdAuthUrl = '<?php echo $auth_url; ?>';
        </script>

        <div class="wrap">
            <div id="igd-settings" class="igd-settings"></div>
        </div>
	<?php }

	/**
	 * @return Admin|null
	 */
	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

}

Admin::instance();