<?php

namespace KnitPay\Extensions\KnitPayPaymentLink;

use Pronamic\WordPress\Html\Element;
use Pronamic\WordPress\Money\Currency;
use Pronamic\WordPress\Money\Money;
use Pronamic\WordPress\Pay\Plugin;
use Pronamic\WordPress\Pay\Util;
use Pronamic\WordPress\Pay\Payments\Payment;

/**
 * Title: Knit Pay - Payment Link Gateway
 * Description:
 * Copyright: 2020-2022 Knit Pay
 * Company: Knit Pay
 *
 * @author  knitpay
 * @since   4.6.0
 */

/**
 * Prevent loading this file directly
 */
defined( 'ABSPATH' ) || exit();

class Gateway {

	/**
	 * Bootstrap
	 */
	public function __construct() {

		// Actions.
		add_action( 'admin_init', [ $this, 'admin_init' ] );

		add_action( 'wp_ajax_knit_pay_create_payment_link', [ $this, 'ajax_create_payment_link' ] );
	}

	/**
	 * Admin initialize.
	 *
	 * @return void
	 */
	public function admin_init() {

		// Settings - General.
		add_settings_section(
			'knit_pay_create_payment_link',
			__( 'Create Payment Link', 'pronamic_ideal' ),
			function () {
				// TODO remove it after few months.
				echo '<p>';
				esc_html_e( 'Payment Link is a new feature of Knit Pay developed to help you generate branded payment links directly from WordPress Dashboard without using Payment Gateway Dashboard. If you have suggestions to improve it, feel free to contact us.', 'knit-pay-lang' );
				echo '</p>';
			},
			'knit_pay_payment_link'
		);

		// Amount.
		add_settings_field(
			'knit_pay_payment_link_amount',
			__( 'Amount (in INR) *', 'knit-pay' ),
			[ $this, 'input_field' ],
			'knit_pay_payment_link',
			'knit_pay_create_payment_link',
			[
				'label_for' => 'knit_pay_payment_link_amount',
				'type'      => 'number',
				'required'  => '',
				'min'       => 1,
				'class'     => 'regular-text',
			]
		);

		// Payment For.
		add_settings_field(
			'knit_pay_payment_link_payment_description',
			__( 'Payment For', 'knit-pay' ),
			[ $this, 'input_field' ],
			'knit_pay_payment_link',
			'knit_pay_create_payment_link',
			[
				'description' => __( 'Payment Purpose/Description', 'knit-pay-lang' ),
				'label_for'   => 'knit_pay_payment_link_payment_description',
				'type'        => 'text',
				'class'       => 'regular-text',
			]
		);

		// Ref Id.
		add_settings_field(
			'knit_pay_payment_link_payment_ref_id',
			__( 'Reference Id', 'knit-pay' ),
			[ $this, 'input_field' ],
			'knit_pay_payment_link',
			'knit_pay_create_payment_link',
			[
				'label_for' => 'knit_pay_payment_link_payment_ref_id',
				'type'      => 'text',
				'class'     => 'regular-text',
			]
		);

		// Customer Name.
		add_settings_field(
			'knit_pay_payment_link_customer_name',
			__( 'Customer Name', 'knit-pay' ),
			[ $this, 'input_field' ],
			'knit_pay_payment_link',
			'knit_pay_create_payment_link',
			[
				'description' => __( 'For some payment gateways, Customer Name is a mandatory field.', 'knit-pay-lang' ),
				'label_for'   => 'knit_pay_payment_link_customer_name',
				'type'        => 'text',
				'class'       => 'regular-text',
			]
		);

		// Customer Email.
		add_settings_field(
			'knit_pay_payment_link_customer_email',
			__( 'Customer Email', 'knit-pay' ),
			[ $this, 'input_field' ],
			'knit_pay_payment_link',
			'knit_pay_create_payment_link',
			[
				'description' => __( 'For some payment gateways, Customer Email is a mandatory field.', 'knit-pay-lang' ),
				'label_for'   => 'knit_pay_payment_link_customer_email',
				'type'        => 'email',
				'class'       => 'regular-text',
			]
		);

		// Customer Phone.
		add_settings_field(
			'knit_pay_payment_link_customer_phone',
			__( 'Customer Phone', 'knit-pay' ),
			[ $this, 'input_field' ],
			'knit_pay_payment_link',
			'knit_pay_create_payment_link',
			[
				'description' => __( 'For some payment gateways, Customer Phone is a mandatory field.', 'knit-pay-lang' ),
				'label_for'   => 'knit_pay_payment_link_customer_phone',
				'type'        => 'tel',
				'class'       => 'regular-text',
			]
		);

		// Payment Gateway Configuration.
		add_settings_field(
			'knit_pay_payment_link_config_id',
			__( 'Payment Gateway Configuration', 'pronamic_ideal' ),
			[ $this, 'select_configuration' ],
			'knit_pay_payment_link',
			'knit_pay_create_payment_link',
			[
				'description' => __( 'Configurations can be created in Knit Pay gateway configurations page at <a href="' . admin_url() . 'edit.php?post_type=pronamic_gateway">"Knit Pay >> Configurations"</a>.', 'knit-pay-lang' ) . '<br>' . __( 'Visit the "Knit Pay >> Settings" page to set Default Gateway Configuration.', 'knit-pay-lang' ),
				'label_for'   => 'knit_pay_payment_link_config_id',
				'class'       => 'regular-text',
			]
		);
	}

	/**
	 * Input Field.
	 *
	 * @param array $args Arguments.
	 * @return void
	 */
	public function input_field( $args ) {
		$args['id']   = $args['label_for'];
		$args['name'] = $args['label_for'];

		$element = new Element( 'input', $args );
		$element->output();

		if ( isset( $args['description'] ) ) {
			printf(
				'<p class="pronamic-pay-description description">%s</p>',
	            // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				$args['description']
			);
		}
	}

	/**
	 * Input page.
	 *
	 * @param array $args Arguments.
	 * @return void
	 */
	public function select_configuration( $args ) {
		$args['id']   = $args['label_for'];
		$args['name'] = $args['label_for'];

		$configurations    = Plugin::get_config_select_options();
		$configurations[0] = __( '— Default Gateway —', 'knit-pay-lang' );

		$configuration_options              = [];
		$configuration_options[]['options'] = $configurations;

		printf(
			'<select %s>%s</select>',
	        // @codingStandardsIgnoreStart
	        Util::array_to_html_attributes( $args ),
	        Util::select_options_grouped( $configuration_options, get_option( 'pronamic_pay_config_id' ) )
	        // @codingStandardsIgnoreEnd
		);

		if ( isset( $args['description'] ) ) {
			printf(
				'<p class="pronamic-pay-description description">%s</p>',
	            // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				$args['description']
			);
		}
	}

	public function ajax_create_payment_link() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		if ( ! wp_verify_nonce( filter_input( INPUT_GET, 'knit_pay_nonce', FILTER_SANITIZE_STRING ), 'knit_pay_create_payment_link' ) ) {
			wp_die( __( 'Cheatin\' huh?', 'knit-pay' ) );
		}

		$config_id      = filter_input( INPUT_GET, 'config_id', FILTER_SANITIZE_NUMBER_INT );
		$payment_method = 'knit_pay';

		// Use default gateway if no configuration has been set.
		if ( empty( $config_id ) ) {
			$config_id = get_option( 'pronamic_pay_config_id' );
		}

		$gateway = Plugin::get_gateway( $config_id );

		if ( ! $gateway ) {
			return false;
		}

		$gateway->set_payment_method( $payment_method );

		/**
		 * Build payment.
		 */
		$payment = new Payment();

		$payment->source    = 'knit-pay-payment-link';
		$payment->source_id = filter_input( INPUT_GET, 'payment_ref_id', FILTER_SANITIZE_STRING );
		$payment->order_id  = uniqid();

		$payment->set_description( Helper::get_description( $payment ) );

		$payment->title = Helper::get_title( $payment );

		// Customer.
		$payment->set_customer( Helper::get_customer() );

		// Address.
		$payment->set_billing_address( Helper::get_address() );

		// Currency.
		$currency = Currency::get_instance( 'INR' ); // TODO

		// Amount.
		$payment->set_total_amount( new Money( filter_input( INPUT_GET, 'amount', FILTER_SANITIZE_NUMBER_FLOAT ), $currency ) );

		// Method.
		$payment->set_payment_method( $payment_method );

		// Configuration.
		$payment->config_id = $config_id;

		try {
			$payment = Plugin::start_payment( $payment );

			// Execute a redirect.
			echo wp_json_encode(
				[
					'status'       => 'success',
					'redirect_url' => $payment->get_pay_redirect_url(),
				]
			);
			exit;
		} catch ( \Exception $e ) {
			echo wp_json_encode(
				[
					'status'    => 'error',
					'error_msg' => $e->getMessage(),
				]
			);
			exit;
		}
	}

	public static function instance() {
		return new self();
	}
}
