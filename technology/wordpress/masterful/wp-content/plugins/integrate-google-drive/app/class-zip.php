<?php

namespace IGD;

defined( 'ABSPATH' ) || exit();

class Zip {
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

	/**
	 * Download files
	 *
	 * @var
	 */
	private $files;
	private $zip_handler;
	private $file_name;
	private $bytes_so_far;

	public function __construct( $files ) {
		$this->files = $files;

		$account_id   = ! empty( $files[0]['accountId'] ) ? $files[0]['accountId'] : Account::get_active_account()['id'];

		$this->client = Client::instance( $account_id )->get_client();

		if ( ! class_exists( 'ZipStream' ) ) {
			require_once IGD_PATH . '/vendors/ZipStream/vendor/autoload.php';
		}
	}

	/**
	 * Start ZIP Download Proces
	 */
	public function do_zip() {
		$this->start();
		$this->create_zip_handler();
		$this->list_files();
		$this->end();

		exit();
	}

	public function start() {
		ignore_user_abort( false );

		$this->file_name = "drive-download-" . time() . ".zip";

		// Stop WP from buffering
		if ( ob_get_level() > 0 ) {
			ob_end_clean();
		} else {
			flush();
		}

	}

	public function create_zip_handler() {

		$options = new \ZipStream\Option\Archive();
		$options->setSendHttpHeaders( true );
		$options->setFlushOutput( true );
		$options->setContentType( 'application/octet-stream' );
		header( 'X-Accel-Buffering: no' );

		// create a new zip-stream object
		$this->zip_handler = new \ZipStream\ZipStream( $this->file_name, $options );

	}

	public function list_files() {
		$files   = [];
		$folders = [];
		$size    = 0;

		if ( ! empty( $this->files ) ) {
			foreach ( $this->files as $file ) {
				$list = igd_get_files_recursive( $file );

				$files   = array_merge( $files, $list['files'] );
				$folders = array_merge( $folders, $list['folders'] );
				$size    += $list['size'];
			}
		}

		//Add folders
		$this->add_folders( $folders );

		//Add files
		$this->add_files( $files );
	}

	public function add_folders( $folders ) {
		if ( ! empty( $folders ) ) {
			foreach ( $folders as $key => $folder ) {
				$this->zip_handler->addFile( $folder, '' );
			}
		}
	}

	public function add_files( $files ) {

		if ( ! empty( $files ) ) {
			foreach ( $files as $key => $file ) {
				$this->add_file_to_zip( $file );
			}
		}
	}

	public function add_file_to_zip( $file ) {
		@set_time_limit( 0 );

		$download_stream = fopen( 'php://temp/maxmemory:' . ( 5 * 1024 * 1024 ), 'r+' );

		$request = new \IGDGoogle_Http_Request( $file['downloadLink'], 'GET' );

		$this->client->getIo()->setOptions( [
			CURLOPT_FOLLOWLOCATION => true,
			CURLOPT_RETURNTRANSFER => false,
			CURLOPT_FILE           => $download_stream,
			CURLOPT_HEADER         => false,
			CURLOPT_CONNECTTIMEOUT => 900,
			CURLOPT_TIMEOUT        => 900,
		] );

		try {
			$this->client->getAuth()->authenticatedRequest( $request );
			curl_close( $this->client->getIo()->getHandler() );
		} catch ( \Exception $exception ) {
			fclose( $download_stream );
			error_log( 'Google Drive to WP - Error: ' . sprintf( 'API Error on line %s: %s', __LINE__, $exception->getMessage() ) );

			return;
		}

		rewind( $download_stream );

		$this->bytes_so_far += $file['size'];

		$fileOptions = new \ZipStream\Option\File();

		if ( ! empty( $file['updated'] ) ) {
			$date = new \DateTime();
			$date->setTimestamp( strtotime( $file['updated'] ) );
			$fileOptions->setTime( $date );
		}

		$fileOptions->setComment( (string) $file['description'] );

		try {
			$this->zip_handler->addFileFromStream( trim( $file['path'], '/' ), $download_stream, $fileOptions );

		} catch ( \Exception $exception ) {
			error_log( 'Google Drive to WP - Error: ' . sprintf( 'Error creating ZIP file %s: %s', __LINE__, $exception->getMessage() ) );

			exit();
		}

		fclose( $download_stream );
	}

	public function end() {
		$this->zip_handler->finish();
	}

	/**
	 * @return Zip|null
	 */
	public static function instance( $files ) {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self( $files );
		}

		return self::$instance;
	}

}