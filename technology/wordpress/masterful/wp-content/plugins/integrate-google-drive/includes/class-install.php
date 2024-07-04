<?php

namespace IGD;

defined( 'ABSPATH' ) || exit;

/**
 * Class Install
 */
class Install {

	/**
	 * Plugin activation stuffs
	 *
	 * @since 1.0.0
	 */
	public static function activate() {
		if ( ! class_exists( 'IGD\Update' ) ) {
			require_once IGD_INCLUDES . '/class-update.php';

			$updater = new Update();

			if ( $updater->needs_update() ) {
				$updater->perform_updates();
			} else {
				self::add_settings();
				self::create_default_data();
				self::create_tables();
				self::create_cache_folder();
			}
		}
	}

	public static function add_settings() {
		$settings                     = get_option( 'igd_settings' );
		$settings['integrations']     = [ 'classic-editor', 'gutenberg-editor', 'elementor' ];

		update_option( 'igd_settings', $settings );
	}

	public static function deactivate() {
		self::remove_cron_event();
	}

	private static function create_cache_folder() {

		if ( ! file_exists( IGD_CACHE_DIR ) ) {
			@mkdir( IGD_CACHE_DIR, 0755 );
		}

		if ( ! is_writable( IGD_CACHE_DIR ) ) {
			@chmod( IGD_CACHE_DIR, 0755 );
		}
	}

	public static function remove_cron_event() {
		$timestamp = wp_next_scheduled( 'igd_sync_interval' );
		if ( $timestamp ) {
			wp_unschedule_event( $timestamp, 'igd_sync_interval' );
		}
	}

	public static function create_tables() {
		global $wpdb;

		$wpdb->hide_errors();

		require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );

		$tables = [

			//shortcodes table
			"CREATE TABLE IF NOT EXISTS {$wpdb->prefix}integrate_google_drive_shortcodes(
         	id bigint(20) NOT NULL AUTO_INCREMENT,
			status varchar(3) NULL DEFAULT 'on',
			config longtext NULL,
			title varchar(255) NULL,
			created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP NULL,
			PRIMARY KEY  (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8;",


			//files table
			"CREATE TABLE IF NOT EXISTS {$wpdb->prefix}integrate_google_drive_files(
			id varchar(255) NOT NULL,
			`name` text NULL,
        	parent_id text,
    		account_id text NOT NULL,
    		`type` text NOT NULL,
    		`data` longtext,
    		is_computers TINYINT(1) DEFAULT 0,
    		is_shared_with_me TINYINT(1) DEFAULT 0,
    		is_starred TINYINT(1) DEFAULT 0,
    		is_recent INT(4) DEFAULT 0,
			PRIMARY KEY  (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8;",


			//logs table
			"CREATE TABLE IF NOT EXISTS {$wpdb->prefix}integrate_google_drive_logs(
			id INT NOT NULL AUTO_INCREMENT,
			`type` varchar(255) NULL,
			`user_id` INT NULL,
    		file_id TEXT NOT NULL,
    		file_type varchar(255) NULL,
			file_name TEXT NULL,
    		account_id TEXT NOT NULL,
    		created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY  (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8;",

		];

		foreach ( $tables as $table ) {
			dbDelta( $table );
		}

	}

	/**
	 * Create plugin settings default data
	 *
	 * @since 1.0.0
	 */
	private static function create_default_data() {

		$version      = get_option( 'igd_version', '0' );
		$install_time = get_option( 'igd_install_time', '' );

		if ( empty( $version ) ) {
			update_option( 'igd_version', IGD_VERSION );
		}

		if ( ! empty( $install_time ) ) {
			$date_format = get_option( 'date_format' );
			$time_format = get_option( 'time_format' );
			update_option( 'igd_install_time', date( $date_format . ' ' . $time_format ) );
		}


	}

}