<?php

namespace IGD;

defined('ABSPATH') || exit();


class Account {

	/**
	 * @var string
	 */
	private static $accounts_option_key = 'igd_accounts';

	/**
	 * @param $id
	 *
	 * @return array|false|mixed|null
	 */
	public static function get_accounts( $id = null ) {
		$accounts = array_filter( (array) get_option( self::$accounts_option_key ) );

		if ( $id ) {
			return ! empty( $accounts[ $id ] ) ? $accounts[ $id ] : false;
		}

		return ! empty( $accounts ) ? $accounts : false;
	}

	/**
	 * Add new account or update previous account
	 *
	 * @param $data
	 */
	public static function update_account( $data ) {
		$accounts = self::get_accounts();

		$accounts[ $data['id'] ] = $data;

		update_option( self::$accounts_option_key, $accounts );
	}

	public static function get_active_account() {
		$accounts = self::get_accounts();

		$active_account = [];

		if ( ! empty( $accounts ) ) {
			foreach ( $accounts as $account ) {
				if ( ! empty( $account['active'] ) ) {
					$active_account = $account;
					break;
				}
			}
		}


		if ( empty( $active_account ) && ! empty( $accounts ) ) {
			$active_account = reset( $accounts );
		}

		return $active_account;
	}

	/**
	 * @param string $account_id
	 *
	 * @return bool
	 */
	public static function set_active_account( $account_id ) {
		$accounts = self::get_accounts();

		$active_account = self::get_active_account();
		if ( ! empty( $active_account ) ) {
			$accounts[ $active_account['id'] ]['active'] = false;
		}

		$accounts[ $account_id ]['active'] = true;

		return update_option( self::$accounts_option_key, $accounts );
	}

	/**
	 * Get storage info
	 *
	 * @return array|mixed
	 */
	public static function get_storage_info( $account_id = null ) {

		if ( ! $account_id ) {
			$active_account = self::get_active_account();
			$account_id     = $active_account['id'];
		}

		if ( empty( $account_id ) ) {
			return;
		}

		$accounts = self::get_accounts();
		$data     = $accounts[ $account_id ];

		return $data['storage'];

	}

	/**
	 * @param $account_id
	 *
	 * @return void
	 */
	public static function update_storage_info( $account_id = null ) {
		if ( ! $account_id ) {
			$active_account = self::get_active_account();
			$account_id     = $active_account['id'];
		}

		$about = App::instance()->getService()->about->get( [ 'fields' => 'storageQuota' ] );

		$accounts = self::get_accounts();
		$data     = $accounts[ $account_id ];

		$data['storage'] = [
			'usage' => $about->getStorageQuota()->getUsage(),
			'limit' => $about->getStorageQuota()->getLimit(),
		];

		self::update_account( $data );
	}

	/**
	 * @param $account_id
	 *
	 * @return void
	 */
	public static function delete_account( $account_id ) {
		$accounts = self::get_accounts();

		$removed_account = $accounts[ $account_id ];

		//remove account data from saved accounts
		unset( $accounts[ $account_id ] );

		$active_account = self::get_active_account();

		// Update active account
		if ( $account_id == $active_account['id'] ) {
			if ( count( $accounts ) ) {
				self::set_active_account( array_key_first( $accounts ) );
			}
		}

		// Delete all the account files
		Files::instance()->delete_account_files();

		//delete token
		$authorization = new Authorization( $removed_account );
		$authorization->remove_token();


		//save updated accounts
		update_option( self::$accounts_option_key, $accounts );
	}

	public static function get_root_id( $account_id = null ) {
		if ( ! $account_id ) {
			$active_account = self::get_active_account();
			$account_id     = $active_account['id'];
		}

		$account = self::get_accounts( $account_id );

		return $account['root_id'];

	}

}

