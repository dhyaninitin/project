<?php

namespace IGD;

defined( 'ABSPATH' ) || exit();


class Files {
	/**
	 * @var null
	 */
	protected static $instance = null;

	private $table;
	private $account_id;

	public function __construct( $account_id = null ) {

		if ( empty( $account_id ) ) {
			$active_account = Account::get_active_account();
			if ( $active_account ) {
				$account_id = $active_account['id'];
			}
		}

		$this->account_id = $account_id;

		global $wpdb;
		$this->table = $wpdb->prefix . 'integrate_google_drive_files';
	}

	/**
	 * Get files
	 *
	 * @param $parent_id
	 *
	 * @return array
	 */
	public function get( $parent_id ) {
		global $wpdb;

		$where = [
			'account_id' => $this->account_id,
		];

		if ( 'computers' == $parent_id ) {
			$where['is_computers'] = 1;
		} elseif ( 'shared' == $parent_id ) {
			$where['is_shared_with_me'] = 1;
		} elseif ( 'starred' == $parent_id ) {
			$where['is_starred'] = 1;
		} elseif ( 'recent' == $parent_id ) {
			$where['is_recent'] = '!=0';
		} else {
			$where['parent_id'] = $parent_id;
		}

		$where_placeholder = '';
		$where_value       = [];

		foreach ( $where as $key => $value ) {
			if ( 'is_recent' == $key ) {
				$where_placeholder .= " AND $key $value ORDER BY `is_recent` ASC";
			} else {
				$where_value[]     = $value;
				$where_placeholder .= " AND $key=%s";
			}

		}

		$sql = $wpdb->prepare( "SELECT data FROM {$this->table} WHERE 1 {$where_placeholder}", $where_value );

		$items = $wpdb->get_results( $sql, ARRAY_A );

		$files = [];

		if ( ! empty( $items ) ) {
			foreach ( $items as $item ) {
				$files[] = unserialize( $item['data'] );
			}
		}

		return $files;
	}

	/**
	 * Set files
	 *
	 * @param $files
	 * @param $folder
	 *
	 * @return void
	 */
	public function set( $files, $folder = '' ) {

		if ( ! empty( $files ) ) {
			foreach ( $files as $key => $file ) {
				$this->add_file( $file, $folder, $key );
			}
		}
	}

	/**
	 * Get cached file by ID
	 *
	 * @param $id
	 *
	 * @return false|mixed
	 */
	public function get_file_by_id( $id ) {
		global $wpdb;

		$sql  = $wpdb->prepare( "SELECT data FROM {$this->table} WHERE id = %s", $id );
		$item = $wpdb->get_row( $sql, ARRAY_A );

		return ! empty( $item['data'] ) ? unserialize( $item['data'] ) : false;
	}

	/**
	 * @param $file
	 * @param $folder
	 *
	 * @return void
	 */
	public function add_file( $file, $folder = '', $key = null ) {
		global $wpdb;

		$is_computers      = 'computers' == $folder;
		$is_shared_with_me = 'shared' == $folder || ! empty( $file['sharedWithMeTime'] );
		$is_starred        = 'starred' == $folder || ! empty( $file['starred'] );
		$is_recent         = 'recent' == $folder ? $key + 1 : null;

		$sql = $wpdb->prepare( "
	INSERT INTO {$this->table}(id, name, parent_id, account_id, type, data, is_computers, is_shared_with_me, is_starred, is_recent) 
	VALUES (%s,%s,%s,%s,%s,%s,%d,%d,%d,%d )
	ON DUPLICATE KEY UPDATE is_shared_with_me=%d,is_starred=%d,is_recent=%d
	", [
			$file['id'],
			$file['name'],
			! empty( $file['parents'] ) ? $file['parents'][0] : '',
			$this->account_id,
			$file['type'],
			serialize( $file ),
			$is_computers,
			$is_shared_with_me,
			$is_starred,
			$is_recent,

			$is_shared_with_me,
			$is_starred,
			$is_recent,
		] );

		$wpdb->query( $sql );

	}

	/**
	 * @return void
	 */
	public function delete_account_files() {
		global $wpdb;

		$wpdb->delete( $this->table, [ 'account_id' => $this->account_id ], [ '%s' ] );
	}

	/**
	 * @param $data
	 * @param $where
	 * @param $format
	 * @param $where_format
	 *
	 * @return void
	 */
	public function update_file( $data, $where, $format = [], $where_format = [] ) {
		global $wpdb;

		$wpdb->update( $this->table, $data, $where, $format, $where_format );

	}

	/**
	 * @param $where
	 * @param $where_format
	 *
	 * @return void
	 */
	public function delete( $where, $where_format = [] ) {
		global $wpdb;

		$wpdb->delete( $this->table, $where, $where_format );
	}

	/**
	 * @return Files|null
	 */
	public static function instance( $account_id = null ) {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self( $account_id );
		}

		return self::$instance;
	}

}

Files::instance();