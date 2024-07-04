<?php

namespace KnitPay\Extensions\LearnPress;

use Pronamic\WordPress\Pay\Address;
use Pronamic\WordPress\Pay\AddressHelper;
use Pronamic\WordPress\Pay\ContactName;
use Pronamic\WordPress\Pay\ContactNameHelper;
use Pronamic\WordPress\Pay\CustomerHelper;
use LP_Settings;
use WP_User;

/**
 * Title: LearnPress Helper
 * Description:
 * Copyright: 2020-2022 Knit Pay
 * Company: Knit Pay
 *
 * @author  knitpay
 * @since   1.6.0
 */
class Helper {

	/**
	 * Get title.
	 *
	 * @param int $order_id Order ID.
	 * @return string
	 */
	public static function get_title( $order_id ) {
		/* translators: %s: Learn Press Order */
		return sprintf( __( 'Learn Press Order %s', 'knit-pay' ), $order_id );
	}

	/**
	 * Get description.
	 *
	 * @param LP_Settings $settings Knit Pay Settings.
	 * @param int         $order_id Order ID.
	 * @return string
	 */
	public static function get_description( LP_Settings $settings, $order_id ) {
		$description = $settings->get( 'payment_description' );

		if ( empty( $description ) ) {
			$description = self::get_title( $order_id );
		}

		// Replacements.
		$replacements = [
			'{order_id}' => $order_id,
		];

		return strtr( $description, $replacements );
	}

	/**
	 * Get value from object.
	 *
	 * @param object $object Object.
	 * @param string $key   Key.
	 * @return string|null
	 */
	private static function get_value_from_object( $object, $var ) {
		if ( isset( $object->{$var} ) ) {
			return $object->{$var};
		}
		return null;
	}

	/**
	 * Get customer from order.
	 */
	public static function get_customer( WP_User $user_data ) {
		return CustomerHelper::from_array(
			[
				'name'    => self::get_name( $user_data ),
				'email'   => self::get_value_from_object( $user_data, 'user_email' ),
				'phone'   => self::get_value_from_object( $user_data, 'phone' ),
				'user_id' => $user_data->ID,
			]
		);
	}

	/**
	 * Get name from order.
	 *
	 * @return ContactName|null
	 */
	public static function get_name( $user_data ) {
		return ContactNameHelper::from_array(
			[
				'first_name' => self::get_value_from_object( $user_data, 'first_name' ),
				'last_name'  => self::get_value_from_object( $user_data, 'last_name' ),
			]
		);
	}

	/**
	 * Get address from order.
	 *
	 * @return Address|null
	 */
	public static function get_address( WP_User $user_data ) {
		return AddressHelper::from_array(
			[
				'name'  => self::get_name( $user_data ),
				'email' => self::get_value_from_object( $user_data, 'user_email' ),
				'phone' => self::get_value_from_object( $user_data, 'phone' ),
			]
		);
	}
}
