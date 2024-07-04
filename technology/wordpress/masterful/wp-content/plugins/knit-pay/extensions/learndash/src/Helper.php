<?php

namespace KnitPay\Extensions\LearnDash;

use Pronamic\WordPress\Pay\Address;
use Pronamic\WordPress\Pay\AddressHelper;
use Pronamic\WordPress\Pay\ContactName;
use Pronamic\WordPress\Pay\ContactNameHelper;
use Pronamic\WordPress\Pay\CustomerHelper;
use LearnDash_Settings_Section;
use LearnDash_User_Status_Widget;

/**
 * Title: Learn Dash LMS Helper
 * Description:
 * Copyright: 2020-2022 Knit Pay
 * Company: Knit Pay
 *
 * @author  knitpay
 * @since   2.7.0
 */
class Helper {

	public static function get_course_data( $course_id ) {
		 $course = get_post( $course_id );

		if ( ! $course ) {
			return false;
		}

		$user_id = get_current_user_id();
		$user    = null;

		if ( 0 != $user_id ) {
			$user = get_userdata( $user_id );
		}

		if ( learndash_get_post_type_slug( 'course' ) === $course->post_type ) {
			$course_price          = learndash_get_setting( $course->ID, 'course_price' );
			$course_price_type     = learndash_get_setting( $course->ID, 'course_price_type' );
			$course_plan_id        = 'learndash-course-' . $course->ID;
			$course_interval_count = get_post_meta( $course->ID, 'course_price_billing_p3', true );
			$course_interval       = get_post_meta( $course->ID, 'course_price_billing_t3', true );
		} elseif ( learndash_get_post_type_slug( 'group' ) === $course->post_type ) {
			$course_price          = learndash_get_setting( $course->ID, 'group_price' );
			$course_price_type     = learndash_get_setting( $course->ID, 'group_price_type' );
			$course_plan_id        = 'learndash-group-' . $course->ID;
			$course_interval_count = get_post_meta( $course->ID, 'group_price_billing_p3', true );
			$course_interval       = get_post_meta( $course->ID, 'group_price_billing_t3', true );
		}

		switch ( $course_interval ) {
			case 'D':
				$course_interval = 'day';
				break;

			case 'W':
				$course_interval = 'week';
				break;

			case 'M':
				$course_interval = 'month';
				break;

			case 'Y':
				$course_interval = 'year';
				break;
		}

		$course_image = get_the_post_thumbnail_url( $course->ID, 'medium' );
		$course_name  = $course->post_title;
		$course_id    = $course->ID;

		$course_price = preg_replace( '/.*?(\d+(?:\.?\d+))/', '$1', $course_price );

		$payment_info = compact( 'user_id', 'user', 'course_id', 'course_image', 'course_name', 'course_plan_id', 'course_price', 'course_price_type', 'course_interval', 'course_interval_count' );
		return $payment_info;

	}

	/**
	 * Get title.
	 *
	 * @param array $course_data.
	 * @return string
	 */
	public static function get_title( $course_data ) {
		return $course_data['course_name'];
	}

	/**
	 * Get description.
	 *
	 * @param array $config
	 * @param array $course_data.
	 * @return string
	 */
	public static function get_description( $config, $course_data ) {
		$description = $config['payment_description'];

		if ( empty( $description ) ) {
			$description = self::get_title( $course_data );
		}

		// Replacements.
		$replacements = [
			'{course_id}'   => $course_data['course_id'],
			'{course_name}' => $course_data['course_name'],
		];

		return strtr( $description, $replacements );
	}

	/**
	 * Get currency
	 *
	 * @see LearnDash_User_Status_Widget::learndash_30_get_currency_symbol()
	 * @return string
	 */
	public static function get_currency_alphabetic_code() {

		$options          = get_option( 'sfwd_cpt_options' );
		$currency_setting = class_exists( 'LearnDash_Settings_Section' ) ? LearnDash_Settings_Section::get_section_setting( 'LearnDash_Settings_Section_PayPal', 'paypal_currency' ) : null;
		$currency         = '';
		$stripe_settings  = get_option( 'learndash_stripe_settings' );

		if ( ! function_exists( 'is_plugin_active' ) ) {
			include_once ABSPATH . 'wp-admin/includes/plugin.php';
		}
		if ( is_plugin_active( 'learndash-stripe/learndash-stripe.php' ) && ! empty( $stripe_settings ) && ! empty( $stripe_settings['currency'] ) ) {
			$currency = $stripe_settings['currency'];
		} elseif ( isset( $currency_setting ) || ! empty( $currency_setting ) ) {
			$currency = $currency_setting;
		} elseif ( isset( $options['modules'] ) && isset( $options['modules']['sfwd-courses_options'] ) && isset( $options['modules']['sfwd-courses_options']['sfwd-courses_paypal_currency'] ) ) {
			$currency = $options['modules']['sfwd-courses_options']['sfwd-courses_paypal_currency'];
		}

		return $currency;
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
	public static function get_customer( $course_data ) {
		return CustomerHelper::from_array(
			[
				'name'    => self::get_name( $course_data ),
				'email'   => self::get_value_from_object( $course_data['user'], 'user_email' ),
				'phone'   => null,
				'user_id' => self::get_value_from_object( $course_data['user'], 'ID' ),
			]
		);
	}

	/**
	 * Get name from order.
	 *
	 * @return ContactName|null
	 */
	public static function get_name( $course_data ) {
		return ContactNameHelper::from_array(
			[
				'first_name' => self::get_value_from_object( $course_data['user'], 'first_name' ),
				'last_name'  => self::get_value_from_object( $course_data['user'], 'last_name' ),
			]
		);
	}

	/**
	 * Get address from order.
	 *
	 * @return Address|null
	 */
	public static function get_address( $course_data ) {

		return AddressHelper::from_array(
			[
				'name'  => self::get_name( $course_data ),
				'email' => self::get_value_from_object( $course_data['user'], 'user_email' ),
			]
		);
	}
}
