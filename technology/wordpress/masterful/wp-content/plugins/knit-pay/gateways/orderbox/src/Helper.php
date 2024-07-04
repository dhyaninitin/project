<?php

namespace KnitPay\Gateways\OrderBox;

use Pronamic\WordPress\Pay\Address;
use Pronamic\WordPress\Pay\AddressHelper;
use Pronamic\WordPress\Pay\ContactName;
use Pronamic\WordPress\Pay\ContactNameHelper;
use Pronamic\WordPress\Pay\CustomerHelper;

/**
 * Title: Orderbox Helper
 * Copyright: 2020-2022 Knit Pay
 *
 * @author  Knit Pay
 * @version 6.65.0.0
 * @since   6.65.0.0
 */
class Helper {

	private static function get_phone( $payment_data ) {
		return '+' . self::get_value_from_array( $payment_data, 'telNoCc' ) . self::get_value_from_array( $payment_data, 'telNo' );
	}

	/**
	 * Get value from array.
	 *
	 * @param array  $array Array.
	 * @param string $key   Key.
	 * @return string|null
	 */
	public static function get_value_from_array( $array, $key ) {
		if ( ! array_key_exists( $key, $array ) ) {
			return null;
		}

		return $array[ $key ];
	}

	/**
	 * Get customer from order.
	 */
	public static function get_customer( $payment_data ) {
		return CustomerHelper::from_array(
			[
				'name'    => self::get_name( $payment_data ),
				'email'   => self::get_value_from_array( $payment_data, 'emailAddr' ),
				'phone'   => self::get_phone( $payment_data ),
				'user_id' => null,
			]
		);
	}

	/**
	 * Get name from order.
	 *
	 * @return ContactName|null
	 */
	public static function get_name( $payment_data ) {
		$name = self::get_value_from_array( $payment_data, 'name' );
		
		$last_name  = ( strpos( $name, ' ' ) === false ) ? '' : preg_replace( '#.*\s([\w-]*)$#', '$1', $name );
		$first_name = trim( preg_replace( '#' . preg_quote( $last_name, '#' ) . '#', '', $name ) );
		
		if ( empty( $first_name ) ) {
			$first_name = ' ';
		}
		if ( empty( $last_name ) ) {
			$last_name = ' ';
		}
		
		return ContactNameHelper::from_array(
			[
				'first_name' => $first_name,
				'last_name'  => $last_name,
			]
		);
	}

	/**
	 * Get address from order.
	 *
	 * @return Address|null
	 */
	public static function get_address( $payment_data ) {

		return AddressHelper::from_array(
			[
				'name'         => self::get_name( $payment_data ),
				'line_1'       => self::get_value_from_array( $payment_data, 'address1' ),
				'line_2'       => self::get_value_from_array( $payment_data, 'address2' ),
				'postal_code'  => self::get_value_from_array( $payment_data, 'zip' ),
				'city'         => self::get_value_from_array( $payment_data, 'city' ),
				'region'       => self::get_value_from_array( $payment_data, 'state' ),
				'country_code' => self::get_value_from_array( $payment_data, 'country' ),
				'email'        => self::get_value_from_array( $payment_data, 'emailAddr' ),
				'phone'        => self::get_phone( $payment_data ),
			]
		);
	}
}
