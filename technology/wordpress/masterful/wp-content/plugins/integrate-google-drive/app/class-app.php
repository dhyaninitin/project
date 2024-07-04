<?php

namespace IGD;

defined( 'ABSPATH' ) || exit();


class App {

	/**
	 * Google API Client
	 *
	 * @var \Exception|false|\IGDGoogle_Client|mixed
	 */
	protected $client;

	/**
	 * Google Drive API Service
	 *
	 * @var \IGDGoogle_Service_Drive
	 */
	private $service;

	/**
	 * @var null
	 */
	protected static $instance = null;

	public $account_id = null;

	/**
	 * @throws \Exception
	 */
	public function __construct( $account_id = null ) {

		if ( empty( $account_id ) && ! empty( Account::get_active_account()['id'] ) ) {
			$account_id = Account::get_active_account()['id'];
		}

		$this->account_id = $account_id;

		$this->client = Client::instance( $account_id )->get_client();

		if ( ! class_exists( 'IGDGoogle_Service_Drive' ) ) {
			require_once IGD_PATH . '/vendors/Google-sdk/src/Google/Service/Drive.php';
		}
		$this->service = new \IGDGoogle_Service_Drive( $this->client );
	}

	/**
	 * Get files
	 *
	 * @param array $query
	 * @param null $folder
	 * @param false $is_search
	 * @param string[] $sort
	 *
	 * @return array
	 */
	public function get_files( $query = [], $folder = null, $is_search = false, $sort = [] ) {

		if ( empty( $sort ) ) {
			$sort = [ 'sortBy' => 'name', 'sortDirection' => 'asc' ];
		}

		// If no folder, get root folder files
		if ( empty( $folder ) || 'root' == $folder ) {
			$active_account = Account::get_active_account();

			if ( ! empty( $active_account['root_id'] ) ) {
				$folder = $active_account['root_id'];
			}
		}

		$folder_id = ! empty( $folder['id'] ) ? $folder['id'] : $folder;

		$default_query = array(
			'pageSize' => 999,
			'orderBy'  => "folder,name",
			'q'        => "trashed=false and '$folder_id' in parents",
			'fields'   => '*',
		);

		$query = wp_parse_args( $query, $default_query );

		// If not search, get the result from the cache
		if ( igd_is_cached_folder( $folder ) && ! $is_search ) {
			$files = Files::instance()->get( $folder_id );
		}

		// If is search or no cache exits get the files directly from server
		if ( $is_search || empty( $files ) ) {

			try {
				$results = $this->service->files->listFiles( $query );
			} catch ( \Exception $exception ) {
				return [ 'error' => '<strong>Server error</strong> - Couldn\'t connect to the Google drive API server. ' ];
			}

			$files = [];

			if ( empty( $results->getFiles() ) ) {
				return $files;
			}

			foreach ( $results->getFiles() as $item ) {
				$files[] = igd_file_map( $item, $this->account_id );
			}


			// Save files to cache
			if ( ! $is_search ) {

				//filter computer files
				if ( 'computers' == $folder ) {
					$new_files = [];

					foreach ( $files as $file ) {

						if ( ! empty( $file['parents'] ) ) {
							continue;
						}

						$new_files[] = $file;
					}

					$files = $new_files;
				}

				Files::instance()->set( $files, $folder );

				//Add folder to the cache list
				igd_update_cached_folders( $folder );
			}

		}


		// Sort files
		if ( 'recent' != $folder && ! empty( $files ) ) {

			$folder_list = [];
			$file_list   = [];

			foreach ( $files as $file ) {

				if ( igd_is_dir( $file['type'] ) ) {

					$folder_list[] = $file;
					continue;
				}

				$file_list[] = $file;
			}

			$sort = (object) $sort;

			$sort_by        = $sort->sortBy;
			$sort_direction = $sort->sortDirection == 'asc' ? SORT_ASC : SORT_DESC;

			$folder_sort_array = array_column( $folder_list, $sort_by );
			$file_sort_array   = array_column( $file_list, $sort_by );

			if ( in_array( $sort_by, [ 'created', 'updated' ] ) ) {
				$folder_sort_array = array_map( 'strtotime', $folder_sort_array );
				$file_sort_array   = array_map( 'strtotime', $file_sort_array );
			}

			array_multisort( $folder_sort_array, $sort_direction, SORT_NATURAL | SORT_FLAG_CASE, $folder_list );
			array_multisort( $file_sort_array, $sort_direction, SORT_NATURAL | SORT_FLAG_CASE, $file_list );

			$files = array_merge( $folder_list, $file_list );
		}

		return $files;
	}

	public function get_root_files( $sort = [] ) {
		$args['q'] = "'me' in owners and trashed=false and 'root' in parents";

		return $this->get_files( $args, 'root', false, $sort );
	}

	public function get_computers_files( $sort = [] ) {
		$args['q'] = "'me' in owners and mimeType='application/vnd.google-apps.folder' and trashed=false";

		return $this->get_files( $args, 'computers', false, $sort );
	}

	public function get_recent_files() {
		$args['orderBy'] = "recency desc";
		$args['q']       = "mimeType!='application/vnd.google-apps.folder' and trashed=false";

		return $this->get_files( $args, 'recent' );
	}

	public function get_starred_files( $sort = [] ) {
		$args['q'] = "starred=true";

		return $this->get_files( $args, 'starred', false, $sort );
	}

	public function get_shared_files( $sort = [] ) {
		$args['q'] = "sharedWithMe=true";

		return $this->get_files( $args, 'shared', false, $sort );
	}

	public function get_search_files( $query, $folders = [] ) {
		// Order by not supported in fullText search
		$args['orderBy'] = '';

		$parents_query = '';

		if ( ! empty( $folders )
		     && ! array_intersect( [ 'root', 'shared', 'computers', 'recent', 'starred' ], $folders ) ) {

			$look_in_to = [];

			foreach ( $folders as $folder_id ) {

				if ( ! in_array( $folder_id, [ 'root', 'computers', 'shared', 'recent', 'starred' ] ) ) {
					$look_in_to[] = $folder_id;
				} elseif ( $folder_id == 'root' ) {
					$look_in_to[] = Account::get_root_id();
				}

				$child_folders = igd_get_all_child_folders( $folder_id );
				$look_in_to    = array_merge( $look_in_to, $child_folders );
			}

			// Maximum 99 parents per request
			$look_in_to = array_slice( $look_in_to, 0, 99 );

			$parents_query = " and ('" . implode( "' in parents or '", $look_in_to ) . "' in parents) ";
		}

		$args['q'] = "fullText contains '{$query}' {$parents_query} and trashed = false ";

		return $this->get_files( $args, '', true );

	}

	/**
	 * Get file item by file id
	 *
	 * @param $id
	 *
	 * @return array|false|mixed|void
	 */
	public function get_file_by_id( $id ) {

		if ( $id == Account::get_root_id() ) {
			return;
		}


		// Get cache file
		$file = Files::instance()->get_file_by_id( $id );

		// If no cache file then get file from server
		if ( ! $file ) {
			$item = App::instance()->getService()->files->get( $id, [
				'supportsAllDrives' => true,
				'fields'            => '*'
			] );

			$file = igd_file_map( $item, $this->account_id );

			Files::instance()->add_file( $file );
		}

		return $file;
	}

	/**
	 * Get file item by file name
	 *
	 * @param $name
	 * @param null $parent_folder
	 *
	 * @return false|mixed
	 */
	public function get_file_by_name( $name, $parent_folder = null ) {

		$items = $this->get_files( [], $parent_folder );

		$file = false;

		if ( ! empty( $items ) ) {
			foreach ( $items as $item ) {
				if ( $item['name'] == $name ) {
					$file = $item;
					break;
				}
			}
		}

		return $file;
	}

	/**
	 * Create new folder
	 *
	 * @param $folder_name
	 * @param $parent_folder
	 *
	 * @return array
	 */
	public function new_folder( $folder_name, $parent_folder ) {

		if ( empty( $parent_folder ) || 'root' == $parent_folder ) {
			$parent_folder = Account::get_active_account()['root_id'];
		}

		$parent_folder_id = ! empty( $parent_folder['id'] ) ? $parent_folder['id'] : $parent_folder;

		$params = [
			'fields'              => '*',
			'supportsAllDrives'   => true,
			'enforceSingleParent' => true
		];

		$request = App::instance()->getService()->files->create( new \IGDGoogle_Service_Drive_DriveFile( [
			'name'     => $folder_name,
			'parents'  => [ $parent_folder_id ],
			'mimeType' => 'application/vnd.google-apps.folder'
		] ), $params );

		// add new folder to cache
		$item = [
			'id'          => $request->id,
			'name'        => $folder_name,
			'type'        => 'application/vnd.google-apps.folder',
			'parents'     => [ $parent_folder_id ],
			'iconLink'    => 'https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.folder',
			'webViewLink' => "https://drive.google.com/drive/folders/{$request->id}",
		];

		Files::instance()->add_file( $item );

		return $item;
	}

	/**
	 * Move Files
	 *
	 * @param $file_ids
	 * @param $newParentId
	 *
	 * @return string|void
	 */
	public function move_file( $file_ids, $newParentId ) {

		try {

			$emptyFileMetadata = new \IGDGoogle_Service_Drive_DriveFile();

			if ( ! empty( $file_ids ) ) {
				foreach ( $file_ids as $file_id ) {
					// Retrieve the existing parents to remove
					$file = $this->get_file_by_id( $file_id );

					$previousParents = join( ',', $file['parents'] );

					// Move the file to the new folder
					$file = $this->service->files->update( $file_id, $emptyFileMetadata, array(
						'addParents'    => $newParentId,
						'removeParents' => $previousParents,
						'fields'        => '*'
					) );

					//Update cached file
					if ( $file->getId() ) {
						Files::instance()->update_file( [
							'parent_id' => $newParentId,
							'data'      => serialize( igd_file_map( $file, $this->account_id ) ),
						], [ 'id' => $file_id ] );
					}

				}
			}

		} catch ( \Exception $e ) {
			return "An error occurred: " . $e->getMessage();
		}
	}

	/**
	 * Rename file
	 *
	 * @param $name
	 * @param $file_id
	 *
	 * @return \IGDGoogle_Http_Request|\IGDGoogle_Service_Drive_DriveFile|string
	 */
	public function rename( $name, $file_id ) {
		try {

			$fileMetadata = new \IGDGoogle_Service_Drive_DriveFile();
			$fileMetadata->setName( $name );

			// Move the file to the new folder
			$file = $this->service->files->update( $file_id, $fileMetadata, array(
				'fields' => '*',
			) );

			//Update cached file
			if ( $file->getId() ) {
				Files::instance()->update_file( [
					'name' => $name,
					'data' => serialize( igd_file_map( $file, $this->account_id ) ),
				], [ 'id' => $file_id ] );
			}

			return $file;
		} catch ( \Exception $e ) {
			return "An error occurred: " . $e->getMessage();
		}
	}

	/**
	 * Copy Files
	 *
	 * @param $files
	 *
	 * @return string|void
	 * @throws \Exception
	 */
	public function copy( $files ) {
		$client = Client::instance()->get_client();

		try {
			$client->setUseBatch( true );

			$batch    = new \IGDGoogle_Http_Batch( $client );
			$metaData = new \IGDGoogle_Service_Drive_DriveFile();

			foreach ( $files as $file ) {
				$metaData->setName( 'Copy of ' . $file['name'] );

				$batch->add( $this->service->files->copy( $file['id'], $metaData, [ 'fields' => '*' ] ) );
			}

			$batch_result = $batch->execute();

			foreach ( $batch_result as $file ) {
				if ( ! empty( $file->getId() ) ) {
					$file = igd_file_map( $file, $this->account_id );
					Files::instance()->add_file( $file );
				}
			}

		} catch ( \Exception $e ) {
			$client->setUseBatch( false );

			return "An error occurred: " . $e->getMessage();
		}
	}

	/**
	 * Delete files
	 *
	 * @param $file_ids
	 *
	 * @return string|void
	 */
	public function delete( $file_ids ) {
		try {
			$client = Client::instance()->get_client();
			$client->setUseBatch( true );

			$batch = new \IGDGoogle_Http_Batch( $client );

			foreach ( $file_ids as $file_id ) {
				$batch->add( $this->service->files->delete( $file_id ) );
				Files::instance()->delete( [ 'id' => $file_id ] );
			}

			$result = $batch->execute();

		} catch ( \Exception $e ) {
			return "An error occurred: " . $e->getMessage();
		}
	}

	/**
	 * Google Drive Service Instance
	 *
	 * @return \IGDGoogle_Service_Drive
	 */
	public function getService() {
		return $this->service;
	}

	/**
	 * Render File Browser
	 */
	public static function view() {
		$auth_url = Client::instance()->get_auth_url();
		?>
        <script>
            const igdAuthUrl = '<?php echo $auth_url; ?>';
        </script>
        <div class="wrap m-0">
            <div id="igd-app" class="h-full"></div>
        </div>
	<?php }

	/**
	 * @return App|null
	 */
	public static function instance( $account_id = null ) {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self( $account_id );
		}

		return self::$instance;
	}

}