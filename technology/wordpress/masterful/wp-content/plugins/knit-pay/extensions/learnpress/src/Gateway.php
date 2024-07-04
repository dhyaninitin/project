<?php

namespace KnitPay\Extensions\LearnPress;

use Pronamic\WordPress\Money\Currency;
use Pronamic\WordPress\Money\Money;
use Pronamic\WordPress\Pay\Plugin;
use Pronamic\WordPress\Pay\Payments\Payment;
use LP_Gateway_Abstract;
use LP_Settings;

/**
 * Title: Learn Press extension
 * Description:
 * Copyright: 2020-2022 Knit Pay
 * Company: Knit Pay
 *
 * @author  knitpay
 * @since   1.6.0
 */

/**
 * Prevent loading this file directly
 */
defined( 'ABSPATH' ) || exit();

class Gateway extends LP_Gateway_Abstract {
	/**
	 * @var LP_Settings
	 */
	public $settings;

	/**
	 * @var string
	 */
	public $id = 'knit_pay';

	/**
	 * Admin label.
	 *
	 * @var string
	 */
	private $admin_label;

	/**
	 * Checkout label.
	 *
	 * @var string
	 */
	private $checkout_label;

	/**
	 * Payment method.
	 *
	 * @var string
	 */
	private $payment_method;

	/**
	 * Supports.
	 *
	 * @var array
	 */
	private $supports;

	/**
	 * Bootstrap
	 *
	 * @param array $args Gateway properties.
	 */
	public function __construct( /* $args */ ) {
		parent::__construct();
		$this->init();

		$this->id = 'knit_pay';

		$this->method_title       = __( 'Knit Pay', 'learnpress' );
		$this->method_description = __( "This payment method does not use a predefined payment method for the payment. Some payment providers list all activated payment methods for your account to choose from. Use payment method specific gateways (such as 'Instamojo') to let customers choose their desired payment method at checkout.", 'learnpress' );
		$this->icon               = '';

		$this->title       = $this->settings->get( 'title' ) ? $this->settings->get( 'title' ) : __( 'Pay Online', 'learnpress' );
		$this->description = $this->settings->get( 'description' ) ? $this->settings->get( 'description' ) : '';

	}

	public function get_settings() {

		return apply_filters(
			'learn-press/gateway-payment/' . $this->id . '/settings',
			[
				[
					'type' => 'title',
				],
				[
					'title'   => __( 'Enable', 'knit-pay' ),
					'id'      => '[enable]',
					'default' => 'no',
					'type'    => 'yes-no',
					'desc'    => esc_html__( 'Enable Knit Pay', 'knit-pay' ),
				],
				[
					'title'   => __( 'Title', 'knit-pay' ),
					'id'      => '[title]',
					'default' => $this->title,
					'type'    => 'text',
				],
				[
					'title'   => __( 'Instruction', 'knit-pay' ),
					'id'      => '[description]',
					'default' => $this->description,
					'type'    => 'textarea',
					'editor'  => [ 'textarea_rows' => 5 ],
				],
				[
					'title'   => __( 'Configuration', 'knit-pay' ),
					'id'      => '[config_id]',
					'default' => get_option( 'pronamic_pay_config_id' ),
					'type'    => 'select',
					'options' => Plugin::get_config_select_options( $this->payment_method ),
					'desc'    => 'Configurations can be created in Knit Pay gateway configurations page at <a href="' . admin_url() . 'edit.php?post_type=pronamic_gateway">"Knit Pay >> Configurations"</a>.',
				],
				[
					'title'   => __( 'Payment Description', 'knit-pay' ),
					'id'      => '[payment_description]',
					'default' => __( 'Learn Press Order {order_id}', 'knit-pay' ),
					'type'    => 'text',
					'desc'    => sprintf( __( 'Available tags: %s', 'knit-pay' ), sprintf( '<code>%s</code>', '{order_id}' ) ),
				],
				[
					'type' => 'sectionend',
				],
			]
		);
	}

	/**
	 * Init.
	 */
	private function init() {
		$this->config_id = $this->settings->get( 'config_id' );

		add_filter( 'learn-press/payment-gateway/' . $this->id . '/available', [ $this, 'is_enabled' ] );
	}

	public function process_payment( $order_id ) {

		$config_id      = $this->config_id;
		$payment_method = $this->id;

		// Use default gateway if no configuration has been set.
		if ( empty( $config_id ) ) {
			$config_id = get_option( 'pronamic_pay_config_id' );
		}

		$gateway = Plugin::get_gateway( $config_id );

		if ( ! $gateway ) {
			return false;
		}

		$gateway->set_payment_method( $payment_method );

		$order     = learn_press_get_order( $order_id );
		$user_data = get_userdata( $order->get_user_id() );

		/**
		 * Build payment.
		 */
		$payment = new Payment();

		$payment->source    = 'learnpress';
		$payment->source_id = $order_id;
		$payment->order_id  = $order_id;

		$payment->set_description( Helper::get_description( $this->settings, $order_id ) );

		$payment->title = Helper::get_title( $order_id );

		// Customer.
		$payment->set_customer( Helper::get_customer( $user_data ) );

		// Address.
		$payment->set_billing_address( Helper::get_address( $user_data ) );

		// Currency.
		$currency = Currency::get_instance( \learn_press_get_currency() );

		// Amount.
		$payment->set_total_amount( new Money( \learn_press_get_cart_total(), $currency ) );

		// Method.
		$payment->set_payment_method( $payment_method );

		// Configuration.
		$payment->config_id = $config_id;

		try {
			$payment = Plugin::start_payment( $payment );

			return [
				'redirect' => $payment->get_pay_redirect_url(),
				'result'   => $payment->get_pay_redirect_url() ? 'success' : 'fail',
			];
		} catch ( \Exception $e ) {
			$error_message = Plugin::get_default_error_message() . '<br>' . $e->getMessage();
			learn_press_add_message( $error_message, 'error' );

			return [
				'result'  => 'fail',
				'message' => $error_message,
			];
		}

		return [
			'result' => 'fail',
		];

	}
}
