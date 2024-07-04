<?php

namespace KnitPay\Extensions\LearnPress;

use Pronamic\WordPress\Pay\AbstractPluginIntegration;
use Pronamic\WordPress\Pay\Payments\PaymentStatus as Core_Statuses;
use LP_Request;
use Pronamic\WordPress\Pay\Core\Util;
use Pronamic\WordPress\Pay\Payments\Payment;

/**
 * Title: Learn Press extension
 * Description:
 * Copyright: 2020-2022 Knit Pay
 * Company: Knit Pay
 *
 * @author  knitpay
 * @since   1.6.0
 */
class Extension extends AbstractPluginIntegration {
	/**
	 * Slug
	 *
	 * @var string
	 */
	const SLUG = 'learnpress';

	/**
	 * Constructs and initialize Learn Press extension.
	 */
	public function __construct() {
		parent::__construct(
			[
				'name' => __( 'Learn Press', 'pronamic_ideal' ),
			]
		);

		// Dependencies.
		$dependencies = $this->get_dependencies();

		$dependencies->add( new LearnPressDependency() );
	}

	/**
	 * Setup plugin integration.
	 *
	 * @return void
	 */
	public function setup() {
		add_filter( 'pronamic_payment_source_text_' . self::SLUG, [ $this, 'source_text' ], 10, 2 );
		add_filter( 'pronamic_payment_source_description_' . self::SLUG, [ $this, 'source_description' ], 10, 2 );
		add_filter( 'pronamic_payment_source_url_' . self::SLUG, [ $this, 'source_url' ], 10, 2 );

		// Check if dependencies are met and integration is active.
		if ( ! $this->is_active() ) {
			return;
		}

		add_filter( 'pronamic_payment_redirect_url_' . self::SLUG, [ $this, 'redirect_url' ], 10, 2 );
		add_action( 'pronamic_payment_status_update_' . self::SLUG, [ $this, 'status_update' ], 10 );

		require_once 'Gateway.php';
		require_once 'Helper.php';

		// Enable New Registeration
		add_filter( 'learn-press/checkout/enable-register', [ __CLASS__, 'enable_register' ] );
		add_filter( 'learn-press/checkout/enable-guest', [ __CLASS__, 'enable_guest' ] );

		// Add Custom Fields in Registration Form
		add_filter( 'learn-press/register-fields', [ __CLASS__, 'register_fields' ] );
		add_filter( 'learn-press/new-user-data', [ __CLASS__, 'new_user_data' ] );
		add_action( 'user_register', [ __CLASS__, 'update_phone' ] );

		// TODO: Give user access to change their phone number
		// add_action('learn-press/end-profile-basic-information-fields', array( __CLASS__,  'add_customer_profile_fields' ));

		// add_filter( 'learn-press/enable-cart', array( __CLASS__, 'enable_cart' ) );

		add_filter( 'learn_press_cart_course_url', [ __CLASS__, 'learn_press_cart_course_url' ] );

		add_filter( 'learn-press/payment-methods', [ $this, 'add_payment' ] );

		// Maybe empty cart for completed payment when handling returns.
		add_action( 'save_post_pronamic_payment', [ __CLASS__, 'maybe_empty_cart' ], 10, 1 );
	}

	public function enable_cart() {
		return true;
	}

	public function update_phone( $user_id ) {
		if ( ! empty( $_POST['reg_phone'] ) ) {
			update_user_meta( $user_id, 'phone', sanitize_text_field( $_POST['reg_phone'] ) );
		}
	}

	public static function enable_register() {
		return true;
	}

	public static function enable_guest() {
		return false;
	}

	public static function register_fields( $fields ) {
		$new_fields['reg_first_name'] = [
			'title'       => __( 'First Name', 'learnpress' ),
			'type'        => 'text',
			'placeholder' => __( 'First Name', 'learnpress' ),
			'saved'       => LP_Request::get_string( 'reg_first_name' ),
			'id'          => 'reg_first_name',
			'required'    => true,
		];
		$new_fields['reg_last_name']  = [
			'title'       => __( 'Last Name', 'learnpress' ),
			'type'        => 'text',
			'placeholder' => __( 'Last Name', 'learnpress' ),
			'saved'       => LP_Request::get_string( 'reg_last_name' ),
			'id'          => 'reg_last_name',
			'required'    => true,
		];
		$new_fields['reg_phone']      = [
			'title'       => __( 'Phone', 'learnpress' ),
			'type'        => 'text',
			'placeholder' => __( 'Phone', 'learnpress' ),
			'saved'       => LP_Request::get_string( 'reg_phone' ),
			'id'          => 'reg_phone',
			'required'    => true,
		];
		$fields                       = $new_fields + $fields;
		return $fields;
	}

	public static function new_user_data( $new_user ) {
		$fields      = \LP_Shortcode_Register_Form::get_register_fields();
		$field_names = wp_list_pluck( $fields, 'id' );
		$args        = call_user_func_array( [ 'LP_Request', 'get_list' ], $field_names );

		$new_user['first_name'] = $args['reg_first_name'];
		$new_user['last_name']  = $args['reg_last_name'];

		return $new_user;
	}

	public static function add_customer_profile_fields( $profile ) {
		// TODO: Give user access to change their phone number
	}

	public static function add_payment( $methods ) {
		$new_method['knit_pay'] = '\KnitPay\Extensions\LearnPress\Gateway';

		return $new_method + $methods;
	}

	/**
	 * Payment redirect URL filter.
	 *
	 * @param string  $url     Redirect URL.
	 * @param Payment $payment Payment.
	 *
	 * @return string
	 */
	public static function redirect_url( $url, $payment ) {

		$source_id = (int) $payment->get_source_id();
		$order     = learn_press_get_order( $source_id );
		if ( ! $order ) {
			return $url;
		}

		$gateway = new Gateway();

		switch ( $payment->get_status() ) {
			case Core_Statuses::CANCELLED:
			case Core_Statuses::EXPIRED:
			case Core_Statuses::FAILURE:
				learn_press_add_message(
					sprintf(
						'Payment with Payment ID: %s, Transaction ID: %s Failed.',
						$payment->get_id(),
						$payment->transaction_id
					),
					'error'
				);
				$url = esc_url( get_permalink( get_option( 'learn_press_checkout_page_id' ) ) );
				break;

			case Core_Statuses::SUCCESS:
				$url = esc_url( $gateway->get_return_url( $order ) );
				break;

			case Core_Statuses::RESERVED:
			case Core_Statuses::OPEN:
			default:
				$url = home_url( '/' );
		}

		return $url;
	}

	/**
	 * Maybe empty cart for succesful payment.
	 *
	 * @param int $post_id Post ID.
	 *
	 * @return void
	 */
	public static function maybe_empty_cart( $post_id ) {
		// Only empty cart when handling returns.
		if ( ! Util::input_has_vars( INPUT_GET, [ 'payment', 'key' ] ) ) {
			return;
		}

		$payment = get_pronamic_payment( $post_id );

		// Only empty for completed payments.
		if ( ! $payment || $payment->get_status() !== Core_Statuses::SUCCESS ) {
			return;
		}

		learn_press_clear_cart_after_payment();
	}

	/**
	 * Update the status of the specified payment
	 *
	 * @param Payment $payment Payment.
	 */
	public static function status_update( Payment $payment ) {
		$source_id = (int) $payment->get_source_id();

		$order = learn_press_get_order( $source_id );
		if ( ! $order ) {
			return;
		}

		switch ( $payment->get_status() ) {
			case Core_Statuses::CANCELLED:
			case Core_Statuses::EXPIRED:
				$order->update_status( 'cancelled' );

				break;
			case Core_Statuses::FAILURE:
				$order->update_status( 'failed' );

				break;
			case Core_Statuses::SUCCESS:
				$order->payment_complete();
				$order->add_note(
					sprintf(
						"%s payment completed with Transaction Id of '%s'",
						$payment->get_payment_method(),
						$payment->transaction_id
					)
				);

				break;
			case Core_Statuses::OPEN:
			default:
				$order->update_status( 'pending' );

				break;
		}
	}

	/**
	 * Source column
	 *
	 * @param string  $text    Source text.
	 * @param Payment $payment Payment.
	 *
	 * @return string $text
	 */
	public function source_text( $text, Payment $payment ) {
		$text = __( 'Learn Press', 'pronamic_ideal' ) . '<br />';

		$text .= sprintf(
			'<a href="%s">%s</a>',
			get_edit_post_link( $payment->source_id ),
			/* translators: %s: source id */
			sprintf( __( 'Order %s', 'pronamic_ideal' ), $payment->source_id )
		);

		return $text;
	}

	/**
	 * Source description.
	 *
	 * @param string  $description Description.
	 * @param Payment $payment     Payment.
	 *
	 * @return string
	 */
	public function source_description( $description, Payment $payment ) {
		return __( 'Learn Press Order', 'pronamic_ideal' );
	}

	/**
	 * Source URL.
	 *
	 * @param string  $url     URL.
	 * @param Payment $payment Payment.
	 *
	 * @return string
	 */
	public function source_url( $url, Payment $payment ) {
		return get_edit_post_link( $payment->source_id );
	}

}
