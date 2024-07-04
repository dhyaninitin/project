<?php

namespace IGD;

defined( 'ABSPATH' ) || exit();


class Download {
	/**
	 * @var null
	 */
	protected static $instance = null;

	/**
	 * Google API Client
	 *
	 * @var \Exception|false|\IGDGoogle_Client|mixed
	 */
	private $client;

	private $file;
	private $mimetype;
	private $proxy = false;
	private $is_stream = true;
	private $download_method;

	/**
	 * @throws \Exception
	 */
	public function __construct( $file, $mimetype = 'default', $proxy = false ) {
		$this->file     = $file;
		$this->mimetype = $mimetype;
		$this->proxy    = $proxy;

		$this->client = Client::instance()->get_client();
	}

	/**
	 * Start Download Process
	 * @throws \IGDGoogle_IO_Exception
	 */
	public function start_download() {
		$this->set_download_method();

		$this->process_download();
	}

	/**
	 * Process Download
	 *
	 * @throws \IGDGoogle_IO_Exception
	 */
	private function process_download() {

		if ( 'proxy' === $this->get_download_method() ) {

			if ( 'default' === $this->mimetype ) {
				if ( $this->is_stream ) {
					$this->stream_content();
				} else {
					$this->export_content();
				}
			} else {
				$this->export_content();
			}

		} elseif ( 'redirect' === $this->get_download_method() ) {
			if ( 'default' === $this->mimetype ) {
				$this->redirect_to_content();
			} else {
				$this->export_content();
			}
		}

		exit();
	}

	public function stream_content() {
		// Stop WP from buffering
		if ( 0 === ob_get_level() ) {
			ob_start();
		}
		ob_end_clean();

		$chunk_size = min( igd_get_free_memory_available() - ( 1024 * 1024 * 5 ), 1024 * 1024 * 50 ); // Chunks of 50MB or less if memory isn't sufficient

		$size = $this->file['size'];

		$length = $size;           // Content length
		$start  = 0;               // Start byte
		$end    = $size - 1;       // End byte
		header( 'Accept-Ranges: bytes' );
		header( 'Content-Type: ' . $this->file['type'] );

		$seconds_to_cache = 60 * 60 * 24;
		$ts               = gmdate( 'D, d M Y H:i:s', time() + $seconds_to_cache ) . ' GMT';
		header( "Expires: {$ts}" );
		header( 'Pragma: cache' );
		header( "Cache-Control: max-age={$seconds_to_cache}" );

		if ( isset( $_SERVER['HTTP_RANGE'] ) ) {
			$c_end = $end;
			list( , $range ) = explode( '=', $_SERVER['HTTP_RANGE'], 2 );

			if ( false !== strpos( $range, ',' ) ) {
				header( 'HTTP/1.1 416 Requested Range Not Satisfiable' );
				header( "Content-Range: bytes {$start}-{$end}/{$size}" );

				exit;
			}

			if ( '-' == $range ) {
				$c_start = $size - substr( $range, 1 );
			} else {
				$range   = explode( '-', $range );
				$c_start = (int) $range[0];

				if ( isset( $range[1] ) && is_numeric( $range[1] ) ) {
					$c_end = (int) $range[1];
				} else {
					$c_end = $size;
				}

				if ( $c_end - $c_start > $chunk_size ) {
					$c_end = $c_start + $chunk_size;
				}
			}
			$c_end = ( $c_end > $end ) ? $end : $c_end;

			if ( $c_start > $c_end || $c_start > $size - 1 || $c_end >= $size ) {
				header( 'HTTP/1.1 416 Requested Range Not Satisfiable' );
				header( "Content-Range: bytes {$start}-{$end}/{$size}" );

				exit;
			}

			$start = $c_start;

			$end    = $c_end;
			$length = $end - $start + 1;
			header( 'HTTP/1.1 206 Partial Content' );
		}

		header( "Content-Range: bytes {$start}-{$end}/{$size}" );
		header( 'Content-Length: ' . $length );

		$chunk_start = $start;

		set_time_limit( 0 );

		while ( $chunk_start <= $end ) {
			//Output the chunk

			$chunk_end = ( ( ( $chunk_start + $chunk_size ) > $end ) ? $end : $chunk_start + $chunk_size );
			$this->stream_get_chunk( $chunk_start, $chunk_end );

			$chunk_start = $chunk_end + 1;
		}
	}

	private function stream_get_chunk( $start, $end ) {

		$request = new \IGDGoogle_Http_Request( $this->get_api_url(), 'GET', [ 'Range' => 'bytes=' . $start . '-' . $end ] );
		$request->disableGzip();

		$this->client->getIo()->setOptions(
			[
				CURLOPT_RETURNTRANSFER => false,
				CURLOPT_FOLLOWLOCATION => true,
				CURLOPT_RANGE          => null,
				CURLOPT_NOBODY         => null,
				CURLOPT_HEADER         => false,
				CURLOPT_WRITEFUNCTION  => [ $this, 'stream_chunk_to_output' ],
				CURLOPT_CONNECTTIMEOUT => null,
				CURLOPT_TIMEOUT        => null,
			]
		);

		$this->client->getAuth()->authenticatedRequest( $request );
	}

	public function stream_chunk_to_output( $ch, $str ) {
		echo $str;

		return strlen( $str );
	}

	public function export_content() {
		// Stop WP from buffering
		if ( 0 === ob_get_level() ) {
			ob_start();
		}
		ob_end_clean();

		$export_link = $this->file['exportLinks'][ $this->mimetype ];
		if ( empty( $export_link ) || ! $this->has_permission() || 'proxy' == $this->get_download_method() ) {
			// Only use export link if publicly accessible
			$export_link = $this->get_api_url();
		} else {
			header( 'Location: ' . $export_link );

			return;
		}

		$request     = new \IGDGoogle_Http_Request( $export_link, 'GET' );
		$httpRequest = $this->client->getAuth()->authenticatedRequest( $request );
		$headers     = $httpRequest->getResponseHeaders();

		if ( isset( $headers['location'] ) ) {
			header( 'Location: ' . $headers['location'] );
		} else {
			foreach ( $headers as $key => $header ) {
				if ( 'transfer-encoding' === $key ) {
					continue;
				}

				if ( is_array( $header ) ) {
					header( "{$key}: " . implode( ' ', $header ) );
				} else {
					header( "{$key}: " . str_replace( "\n", ' ', $header ) );
				}
			}
		}

		echo $httpRequest->getResponseBody();
	}

	public function get_api_url() {
		if ( 'default' !== $this->mimetype ) {
			return 'https://www.googleapis.com/drive/v3/files/' . $this->file['id'] . '/export?alt=media&mimeType=' . $this->mimetype;
		}

		return 'https://www.googleapis.com/drive/v3/files/' . $this->file['id'] . '?alt=media';
	}

	/**
	 * Set Download Method
	 *
	 * @return string
	 * @throws \IGDGoogle_IO_Exception
	 */
	public function set_download_method() {

		if ( $this->proxy ) {
			$this->download_method = 'proxy';
		}

		// Files larger than 25MB can only be streamed unfortunately
		// There isn't a direct download link available for those files and
		// a cookie security check by Google prevents them to be downloaded directly.
		if ( $this->file['size'] > 25165824 ) {
			return $this->download_method = 'proxy';
		}

		$copy_disabled = $this->file['copyRequiresWriterPermission'];
		if ( $copy_disabled ) {
			return $this->download_method = 'proxy';
		}

		// Is file already shared ?
		$is_shared = $this->has_permission();
		if ( $is_shared ) {
			return $this->download_method = 'redirect';
		}

		// File permissions
		$file_permissions = (array) $this->file['permissions'];

		// Can the sharing permissions of the file be updated via the plugin?
		$can_update_permissions = ( $manage_permissions = true && $file_permissions['can_share'] );
		if ( ! $can_update_permissions ) {
			return $this->download_method = 'proxy';
		}

		// Update the Sharing Permissions
		$is_sharing_permission_updated = $this->set_permission();
		if ( ! $is_sharing_permission_updated ) {
			return $this->download_method = 'proxy';
		}

		return $this->download_method = 'redirect';

	}

	/**
	 * Get Download Method
	 *
	 * @return mixed
	 */
	public function get_download_method() {
		return $this->download_method;
	}

	/**
	 * @throws \IGDGoogle_IO_Exception
	 */
	public function redirect_to_content() {

		// Check if redirect url is still present in database and redirect user
		$transient_key = 'igd_stream_' . $this->file['id'];

		$content_url = get_transient( $transient_key );

		if ( ! empty( $content_url ) && filter_var( $content_url, FILTER_VALIDATE_URL ) ) {
			header( 'Location: ' . $content_url );

			exit();
		}


		// Get the direct download link
		$request = new \IGDGoogle_Http_Request( "https://drive.google.com/uc?id={$this->file['id']}&export=download", 'GET' );

		$this->client->getIo()->setOptions( [ CURLOPT_FOLLOWLOCATION => 0 ] );

		$httpRequest = $this->client->getIo()->makeRequest( $request );
		$headers     = $httpRequest->getResponseHeaders();

		// If the file meets a virus scan warning, do another request
		if ( isset( $headers['set-cookie'] ) && false !== strpos( $headers['set-cookie'], 'download_warning' ) ) {
			preg_match( '/download_warning.*=(.*);/iU', $headers['set-cookie'], $confirm );
			$new_download_link = $this->get_content_url() . '&confirm=' . $confirm[1];

			$request = new \IGDGoogle_Http_Request( $new_download_link, 'HEAD', [ 'Cookie' => $headers['set-cookie'] ] );

			$this->client->getIo()->setOptions( [
				CURLOPT_FOLLOWLOCATION => 0,
				CURLOPT_HTTP_VERSION   => CURL_HTTP_VERSION_1_1,
				CURLOPT_NOBODY         => true
			] );

			curl_close( $this->client->get_library()->getIo()->getHandler() );

			usleep( 500000 );

			$httpRequest = $this->client->getIo()->makeRequest( $request );
			$headers     = $httpRequest->getResponseHeaders();
		}

		if ( ! empty( $headers['location'] ) ) {
			header( 'Location: ' . esc_url( $headers['location'] ) );
			set_transient( $transient_key, esc_url( $headers['location'] ), MINUTE_IN_SECONDS * 4 );
		} else {
			error_log( 'Integrate Google Drive - Error: ' . sprintf( 'Google Error on line %s: Download redirect for %s denied by Google likely due to hitting limits of the Fair Use Policy.', __LINE__, $this->file['id'] ) );
		}


		echo $httpRequest->getResponseBody();

		exit();
	}

	/**
	 * Check if file is public
	 *
	 * @param string[] $permission_role
	 * @param false $force_update
	 *
	 * @return bool
	 * @throws \IGDGoogle_IO_Exception
	 */
	public function has_permission( $permission_role = [ 'reader', 'writer' ], $force_update = false ) {
		$permission_type   = 'anyone';
		$permission_domain = null;

		$file_permissions = $this->file['permissions'];

		$users = $file_permissions['users'];

		// If the permissions are not yet set, grab them via the API
		if ( ( empty( $users ) && $file_permissions['can_share'] ) || $force_update ) {
			$users = [];

			$params = [
				'fields'            => 'kind,nextPageToken,permissions(kind,id,type,role,domain,permissionDetails(permissionType,role))',
				'pageSize'          => 100,
				'supportsAllDrives' => true,
			];

			$nextpagetoken = null;

			// Get all files in folder
			while ( $nextpagetoken || null === $nextpagetoken ) {
				try {
					if ( null !== $nextpagetoken ) {
						$params['pageToken'] = $nextpagetoken;
					}

					$more_permissions = App::instance()->getService()->permissions->listPermissions( $this->file['id'], $params );
					$users            = array_merge( $users, $more_permissions->getPermissions() );
					$nextpagetoken    = ( null !== $more_permissions->getNextPageToken() ) ? $more_permissions->getNextPageToken() : false;
				} catch ( \Exception $ex ) {
					error_log( '[Google Drive to WP - Error]: ' . sprintf( 'API Error on line %s: %s', __LINE__, $ex->getMessage() ) );

					return false;
				}
			}

			$permission_users = [];
			foreach ( $users as $user ) {
				$permission_users[ $user->getId() ] = [
					'type'   => $user->getType(),
					'role'   => $user->getRole(),
					'domain' => $user->getDomain()
				];
			}

			$this->file['permissions']['users'] = $permission_users;

			Files::instance()->update_file(
				[ 'data' => serialize( $this->file ) ],
				[ 'id' => $this->file['id'] ]
			);

		}

		$users = (array) $file_permissions['users'];

		if ( count( $users ) > 0 ) {
			foreach ( $users as $user ) {

				$user = (array) $user;

				if ( ( $user['type'] == $permission_type ) && ( in_array( $user['role'], $permission_role ) ) && ( $user['domain'] == $permission_domain ) ) {
					return true;
				}
			}
		}

		/* For shared files not owned by account, the sharing permissions cannot be viewed or set.
		 * In that case, just check if the file is public shared
		 */
		if ( in_array( 'reader', $permission_role ) ) {
			$check_url = 'https://drive.google.com/file/d/' . $this->file['id'] . '/view';

			// Add Resources key to give permission to access the item via a shared link
			if ( $this->file['resourceKey'] ) {
				$check_url .= "&resourcekey={$this->file['resourceKey']}";
			}

			$request = new \IGDGoogle_Http_Request( $check_url, 'GET' );

			$this->client->getIo()->setOptions( [ CURLOPT_FOLLOWLOCATION => 0 ] );

			$httpRequest = $this->client->getIo()->makeRequest( $request );
			curl_close( $this->client->getIo()->getHandler() );

			if ( 200 == $httpRequest->getResponseHttpCode() ) {

				$users['anyoneWithLink'] = [
					'domain' => $permission_domain,
					'role'   => "reader",
					'type'   => "anyone",
				];

				$this->file['permissions']['users'] = $users;

				Files::instance()->update_file(
					[ 'data' => serialize( $this->file ) ],
					[ 'id' => $this->file['id'] ]
				);

				return true;
			}
		}

		return false;
	}

	/**
	 * Set file permission to public
	 *
	 * @param string $permission_role
	 *
	 * @return bool
	 */
	public function set_permission( $permission_role = 'reader' ) {
		$permission_type   = 'anyone';
		$permission_domain = null;

		$file_permissions = (array) $this->file['permissions'];

		// Check if manage permission is allowed
		$manage_permissions = true;

		// Set new permission if needed
		if ( $manage_permissions && $file_permissions['can_share'] ) {
			$new_permission = new \IGDGoogle_Service_Drive_Permission();
			$new_permission->setType( $permission_type );
			$new_permission->setRole( $permission_role );
			$new_permission->setAllowFileDiscovery( false );

			if ( null !== $permission_domain ) {
				$new_permission->setDomain( $permission_domain );
			}

			$params = [
				'supportsAllDrives' => true,
			];

			try {
				$updated_permission = App::instance()->getService()->permissions->create( $this->file['id'], $new_permission, $params );

				$users                                 = (array) $file_permissions['users'];
				$users[ $updated_permission->getId() ] = [
					'type'   => $updated_permission->getType(),
					'role'   => $updated_permission->getRole(),
					'domain' => $updated_permission->getDomain()
				];

				$this->file['permissions']['users'] = $users;

				Files::instance()->update_file(
					[ 'data' => serialize( $this->file ) ],
					[ 'id' => $this->file['id'] ]
				);

				return true;
			} catch ( \Exception $ex ) {
				error_log( '[Google Drive to WP Error]: ' . sprintf( 'API Error on line %s: %s', __LINE__, $ex->getMessage() ) );

				return false;
			}
		}

		return false;
	}

	/**
	 * @return Download|null
	 * @throws \Exception
	 */
	public static function instance( $file ) {

		if ( is_null( self::$instance ) ) {
			self::$instance = new self( $file );
		}

		return self::$instance;
	}

}