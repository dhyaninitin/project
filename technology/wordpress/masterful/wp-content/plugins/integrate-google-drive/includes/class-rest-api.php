<?php

namespace IGD;

defined( 'ABSPATH' ) || exit;


class Rest_Api_Controller {
	/** @var null */
	private static $instance = null;

	private $namespace = 'igd/v1';


	/**
	 * Rest_Api_Controller constructor.
	 *
	 */
	public function __construct() {
		add_action( 'rest_api_init', [ $this, 'register_api' ] );
	}

	/**
	 * Register rest API
	 *
	 * @since 1.0.0
	 */
	public function register_api() {


		register_rest_route( $this->namespace, '/folders/', array(
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_folders' ),
				'permission_callback' => '__return_true',
			),
		) );

		/**
		 * Get Files
		 */
		register_rest_route( $this->namespace, '/files/', array(
			array(
				'methods'             => \WP_REST_Server::ALLMETHODS,
				'callback'            => array( $this, 'get_files' ),
				'permission_callback' => '__return_true',
			),
		) );

		//Move File/ Folder
		register_rest_route( $this->namespace, '/move-file/', array(
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'move_file' ),
				'permission_callback' => '__return_true',
			),
		) );

		//handle rename
		register_rest_route( $this->namespace, '/rename/', array(
			array(
				'methods'             => \WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'handle_rename' ),
				'permission_callback' => '__return_true',
			),
		) );

		//copy file/ folder
		register_rest_route( $this->namespace, '/copy/', array(
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'handle_copy' ),
				'permission_callback' => '__return_true',
			),
		) );

		//Import file/ folder
		register_rest_route( $this->namespace, '/import/', array(
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'handle_import' ),
				'permission_callback' => '__return_true',
			),
		) );

		//delete file/ folder
		register_rest_route( $this->namespace, '/delete/', array(
			array(
				'methods'             => \WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'handle_delete' ),
				'permission_callback' => '__return_true',
			),
		) );

		//upload files
		register_rest_route( $this->namespace, '/upload/', array(
			array(
				'methods'             => \WP_REST_Server::ALLMETHODS,
				'callback'            => array( $this, 'upload' ),
				'permission_callback' => '__return_true',
			),
		) );

		//create a new folder
		register_rest_route( $this->namespace, '/new-folder/', array(
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'new_folder' ),
				'permission_callback' => '__return_true',
			),
		) );

		// Switch Account
		register_rest_route( $this->namespace, '/switch-account/', array(
			array(
				'methods'             => \WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'switch_account' ),
				'permission_callback' => '__return_true',
			),
		) );

		// Delete Account
		register_rest_route( $this->namespace, '/delete-account/', array(
			array(
				'methods'             => \WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'delete_account' ),
				'permission_callback' => '__return_true',
			),
		) );

		// Get Shortcode
		register_rest_route( $this->namespace, '/get-shortcode/', array(
			array(
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_shortcode' ),
				'permission_callback' => '__return_true',
			),
		) );

		// Update Shortcode
		register_rest_route( $this->namespace, '/update-shortcode/', array(
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'update_shortcode' ),
				'permission_callback' => '__return_true',
			),
		) );

		// Delete Shortcode
		register_rest_route( $this->namespace, '/delete-shortcode/', array(
			array(
				'methods'             => \WP_REST_Server::DELETABLE,
				'callback'            => array( $this, 'delete_shortcode' ),
				'permission_callback' => '__return_true',
			),
		) );

		// Set Permission
		register_rest_route( $this->namespace, '/set-permission/', array(
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'set_permission' ),
				'permission_callback' => '__return_true',
			),
		) );

		// Set Permission
		register_rest_route( $this->namespace, '/get-embed-content/', array(
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'get_embed_content' ),
				'permission_callback' => '__return_true',
			),
		) );

		// Save Settings
		register_rest_route( $this->namespace, '/save-settings/', array(
			array(
				'methods'             => \WP_REST_Server::EDITABLE,
				'callback'            => array( $this, 'save_settings' ),
				'permission_callback' => '__return_true',
			),
		) );

		// Update user folders
		register_rest_route( $this->namespace, '/update-user-folders/', array(
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'update_user_folders' ),
				'permission_callback' => '__return_true',
			),
		) );

		// Get users data
		register_rest_route( $this->namespace, '/get-users-data/', array(
			array(
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'get_users_data' ),
				'permission_callback' => '__return_true',
			),
		) );

	}

	/**
	 * Get users data
	 *
	 * @param $request
	 *
	 * @return void
	 */
	public function get_users_data( $request ) {
		$data = json_decode( $request->get_body(), 1 );

		$args = [];

		if ( ! empty( $data ) ) {
			$search = ! empty( $data['search'] ) ? $data['search'] : '';
			$role   = ! empty( $data['role'] ) ? $data['role'] : '';
			$page   = ! empty( [ 'page' ] ) ? $data['page'] : 1;
			$offset = 10 * ( $page - 1 );

			$args = [
				'number' => 10,
				'role'   => 'all' != $role ? $role : '',
				'offset' => $offset,
				'search' => ! empty( $search ) ? "*$search*" : '',
			];
		}

		$user_data = Private_Folders::instance()->get_user_data( $args );

		wp_send_json_success( $user_data );
	}

	/**
	 * Update user folders
	 *
	 * @param $request
	 *
	 * @return void
	 */
	public function update_user_folders( $request ) {
		$data = json_decode( $request->get_body(), 1 );

		$id      = $data['id'];
		$folders = $data['folders'];

		if ( 'GUEST' == $id ) {
			update_option( 'igd_guest_folders', $folders );
		} else {
			update_user_option( $id, 'folders', $folders );
		}

		wp_send_json_success();
	}

	/**
	 * @param $request
	 *
	 * @return void
	 */
	public function save_settings( $request ) {
		$data = json_decode( $request->get_body(), 1 );

		update_option( 'igd_settings', $data );

		wp_send_json_success();
	}

	public function get_embed_content( $request ) {
		$data           = json_decode( $request->get_body(), 1 );
		$folders        = ! empty( $data['folders'] ) ? $data['folders'] : [];
		$show_file_name = ! empty( $data['showFileName'] );

		$content = igd_get_embed_content( $folders, $show_file_name );

		wp_send_json_success( $content );
	}

	public function new_folder( $request ) {
		$data = json_decode( $request->get_body(), 1 );

		$folder_name   = sanitize_text_field( $data['name'] );
		$parent_folder = $data['parent_folder'];
		$parent_folder = ! empty( $parent_folder['id'] ) ? $parent_folder['id'] : $parent_folder;

		App::instance()->new_folder( $folder_name, $parent_folder );

		wp_send_json_success();
	}

	public function set_permission( $request ) {
		$requested = json_decode( $request->get_body(), 1 );

		$files = ! empty( $requested['files'] ) ? $requested['files'] : [];

		if ( ! empty( $files ) ) {

			foreach ( $files as $file ) {

				$download = Download::instance( $file );

				if ( ! $download->has_permission() ) {
					$download->set_permission();
				}
			}
		}

		wp_send_json_success();

	}

	/**
	 * Get shortcode
	 *
	 * @param $request
	 */
	public function get_shortcode( $request ) {
		$shortcodes = Shortcode_Builder::instance()->get_shortcode();

		$formatted = [];

		if ( ! empty( $shortcodes ) ) {
			foreach ( $shortcodes as $shortcode ) {
				$shortcode->config = unserialize( $shortcode->config );

				$formatted[] = $shortcode;
			}
		}

		wp_send_json_success( $formatted );

	}

	/**
	 * Update shortcode
	 *
	 * @param $request
	 */
	public function update_shortcode( $request ) {
		$posted = json_decode( $request->get_body(), 1 );

		$id = Shortcode_Builder::instance()->update_shortcode( $posted );


		$data = [
			'id'         => $id,
			'config'     => $posted,
			'title'      => $posted['title'],
			'status'     => $posted['status'],
			'created_at' => ! empty( $posted['created_at'] ) ? $posted['created_at'] : date( 'Y-m-d H:i:s', time() ),
		];

		wp_send_json_success( $data );
	}

	/**
	 * Delete shortcode
	 *
	 * @param $request
	 */
	public function delete_shortcode( $request ) {
		$data = json_decode( $request->get_body() );

		Shortcode_Builder::instance()->delete_shortcode( $data->id );

		wp_send_json_success();
	}

	// Delete account
	public function delete_account( $request ) {
		$data = json_decode( $request->get_body() );
		$id   = $data->id;

		Account::delete_account( $id );


		wp_send_json_success();

	}

	// Switch account
	public function switch_account( $request ) {
		$data = json_decode( $request->get_body(), 1 );
		$id   = $data['id'];

		Account::set_active_account( $id );

		wp_send_json_success( [ 'storage' => Account::get_storage_info() ] );
	}

	/**
	 * Upload files
	 *
	 * @param $request
	 */
	public function upload( $request ) {
		$folder    = ! empty( $_GET['folder'] ) ? sanitize_text_field( $_GET['folder'] ) : 'root';
		$path      = ! empty( $_POST['path'] ) ? sanitize_text_field( $_POST['path'] ) : '';
		$accountId = ! empty( $_POST['accountId'] ) ? sanitize_text_field( $_POST['accountId'] ) : '';

		echo json_encode( Uploader::instance( $accountId )->upload( $_FILES, $folder, $path ) );
		die;
	}

	/**
	 * Get folder list - used in move files
	 *
	 * @param $request
	 */
	public function get_folders( $request ) {
		$folder_id = ! empty( $request['folder_id'] ) ? $request['folder_id'] : 'root';

		$args = [
			'q' => " 'me' in owners and '{$folder_id}' in parents and trashed=false"
		];

		$files = App::instance()->get_files( $args, $folder_id );

		if ( ! empty( $files ) ) {
			$new_files = [];

			foreach ( $files as $file ) {
				if ( $file['type'] != 'application/vnd.google-apps.folder' ) {
					continue;
				}

				$new_files[] = $file;
			}

			$files = $new_files;
		}

		wp_send_json_success( $files );
	}

	public function get_files( $request ) {

		$requested = json_decode( $request->get_body(), 1 );

		$folder       = ! empty( $requested['folder'] ) ? $requested['folder'] : 'root';
		$file_numbers = ! empty( $requested['fileNumbers'] ) ? $requested['fileNumbers'] : - 1;
		$refresh      = ! empty( $requested['refresh'] );

		$sort = ! empty( $requested['sort'] ) ? $requested['sort'] : (object) [
			'sortBy'        => 'name',
			'sortDirection' => 'asc'
		];

		$args = [];

		if ( ! empty( $folder['id'] ) ) {
			$folder = $folder;
		} elseif (
			! empty( $folder ) && empty( $folder['search'] ) && ! in_array( $folder, [
				'root',
				'computers',
				'shared',
				'recent',
				'starred'
			] )
		) {
			$folder = App::instance()->get_file_by_id( $folder );
		} elseif ( empty( $folder ) ) {
			$folder = 'root';
		}

		// Reset cache
		if ( $refresh ) {
			Files::instance()->delete_account_files();

			// Delete thumbnails
			igd_delete_thumbnail_cache();

			// Delete cache folders option
			delete_option( 'igd_cached_folders' );

			// update storage info on reset
			Account::update_storage_info();
			$data['storage'] = Account::get_storage_info();
		}


		if ( 'computers' == $folder ) {

			$files = App::instance()->get_computers_files( $sort );
		} elseif ( 'shared' == $folder ) {
			$files = App::instance()->get_shared_files( $sort );
		} elseif ( 'recent' == $folder ) {

			$files = App::instance()->get_recent_files();
		} elseif ( 'starred' == $folder ) {

			$files = App::instance()->get_starred_files( $sort );
		} elseif ( ! empty( $folder['search'] ) ) {
			$folders = ! empty( $folder['folders'] ) ? $folder['folders'] : [];

			$files = App::instance()->get_search_files( $folder['search'], $folders );
		} else {

			if ( ! empty( $folder['accountId'] ) ) {
				$account_id = $folder['accountId'];
			} else if ( ! empty( Account::get_active_account()['id'] ) ) {
				$account_id = Account::get_active_account()['id'];
			}

			if(!empty($account_id)) {
				$files = App::instance( $account_id )->get_files( $args, $folder, false, $sort );
			}
		}

		// Return if the variable is not set
		if(!isset($files)){
			return;
		}

		if ( ! empty( $files['error'] ) ) {
			wp_send_json_error( $files );
		}

		// Get the breadcrumb
		$breadcrumbs = array_reverse( igd_get_breadcrumb( $folder ) );

		// Handle maximum file to show
		if ( ! empty( $file_numbers ) && $file_numbers > 0 ) {
			$files = array_slice( $files, 0, $file_numbers );
		}

		$data = [
			'files'       => $files,
			'breadcrumbs' => $breadcrumbs,
		];


		// If not rest-api call return raw data
		if ( empty( $request ) ) {
			return $data;
		}

		wp_send_json_success( $data );
	}

	public function move_file( $request ) {
		$posted = json_decode( $request->get_body(), 1 );

		$file_ids  = ! empty( $posted['file_ids'] ) ? $posted['file_ids'] : '';
		$folder_id = ! empty( $posted['folder_id'] ) ? sanitize_text_field( $posted['folder_id'] ) : Account::get_root_id();

		wp_send_json_success( App::instance()->move_file( $file_ids, $folder_id ) );
	}

	public function handle_rename( $request ) {
		$data = json_decode( $request->get_body(), 1 );

		$name    = sanitize_text_field( $data['name'] );
		$file_id = sanitize_text_field( $data['file_id'] );

		wp_send_json_success( App::instance()->rename( $name, $file_id ) );

	}

	public function handle_copy( $request ) {
		$data = json_decode( $request->get_body(), 1 );

		$files = ! empty( $data['files'] ) ? $data['files'] : [];

		wp_send_json_success( App::instance()->copy( $files ) );

	}

	public function handle_import( $request ) {
		$data = json_decode( $request->get_body(), 1 );

		$files = ! empty( $data['files'] ) ? $data['files'] : [];

		wp_send_json_success( Importer::instance()->import_file( $files ) );

	}

	public function handle_delete( $request ) {
		$data = json_decode( $request->get_body(), 1 );

		$file_ids = ! empty( $data['file_ids'] ) ? $data['file_ids'] : [];

		wp_send_json_success( App::instance()->delete( $file_ids ) );

	}

	/**
	 * @return Rest_Api_Controller|null
	 */
	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}

		return self::$instance;
	}
}


Rest_Api_Controller::instance();