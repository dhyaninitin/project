<?php

namespace IGD;

defined( 'ABSPATH' ) || exit();

class Uploader {

	/**
	 * @var null
	 */
	protected static $instance = null;

	private $chunk_size_bytes = 5 * 1024 * 1024;

	private $client;
	private $service;

	/**
	 * @throws \Exception
	 */
	public function __construct( $account_id = null ) {
		$this->client  = Client::instance( $account_id )->get_client();
		$this->service = App::instance( $account_id )->getService();
	}

	public function upload( $files, $folder = 'root', $path = '' ) {

		if ( empty( $files ) || $files['file']['error'] ) {
			die( $files['file']['error'] );
		}

		// Create folder structure if needed
		if ( ! empty( $path ) ) {
			$last_folders = $this->create_folder_structure( $path, $folder );

			$path_key = trim( $path, '/' );

			$folder = $last_folders[ $path_key ];
		}

		$file = $files['file'];

		try {

			$this->client->setDefer( true );

			$params = [
				'fields'              => '*',
				'supportsAllDrives'   => true,
				'enforceSingleParent' => true
			];

			$parent_id = ! empty( $folder['id'] ) ? $folder['id'] : $folder;

			$request = $this->service->files->create( new \IGDGoogle_Service_Drive_DriveFile( [
				'name'     => $file['name'],
				'parents'  => [ $parent_id ],
				'mimeType' => $file['type']
			] ), $params );

			$media = new \IGDGoogle_Http_MediaFileUpload( $this->client, $request, $file['type'], null, true, $this->chunk_size_bytes );
			$media->setFileSize( $file['size'] );

			$status      = false;
			$fileHandler = fopen( $file['tmp_name'], 'rb' );

			while ( ! $status and ! feof( $fileHandler ) ) {
				//@set_time_limit( 60 );

				$chunk  = fread( $fileHandler, $this->chunk_size_bytes );
				$status = $media->nextChunk( $chunk );
			}

			fclose( $fileHandler );

			$this->client->setDefer( false );

			if ( $status ) {
				$file = igd_file_map( $status );
				Files::instance()->add_file( $file, $parent_id );

				return $file;
			}

		} catch ( \Exception $exception ) {
			die( $exception->getMessage() );
		}

	}

	public function create_folder_structure( $path, $parent_folder = 'root' ) {

		$folders = array_filter( explode( '/', $path ) );

		$last_folders = [];

		foreach ( $folders as $key => $name ) {

			// current folder path
			$folder_path = implode( '/', array_slice( $folders, 0, $key + 1 ) );

			$last_folder = array_slice( $last_folders, 0, $key );
			$last_folder = ! empty( $last_folder ) ? end( $last_folder ) : $parent_folder;

			//check if folder is already exists
			$folder_exists = App::instance()->get_file_by_name( $name, $last_folder );

			if ( $folder_exists ) {
				$last_folders[ $folder_path ] = $folder_exists['id'];

				continue;
			}

			// Create folder if not exists
			try {

				// add last folder id to the array
				$last_folders[ $folder_path ] = App::instance()->new_folder( $name, $last_folder );

			} catch ( \Exception $ex ) {

				error_log( 'Google Drive to WP - Message: ' . sprintf( 'Failed to create new folders: %s', $ex->getMessage() ) );
			}

		}

		return $last_folders;

	}

	/**
	 * @return Uploader|null
	 */
	public static function instance( $account_id = null ) {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self( $account_id );
		}

		return self::$instance;
	}

}