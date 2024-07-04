<?php
namespace KnitPay\Gateways\Test;

use Pronamic\WordPress\Pay\Core\Gateway as Core_Gateway;

use Exception;
use KnitPay\Gateways\Easebuzz\Gateway as Parent_Gateway;
use Pronamic\WordPress\Pay\Payments\Payment;
use Pronamic\WordPress\Pay\Payments\PaymentStatus;


/**
 * Title: Test Gateway
 * Copyright: 2020-2022 Knit Pay
 *
 * @author Knit Pay
 * @version 1.0.0
 * @since 2.5.4
 */
class Gateway extends Parent_Gateway {

	const NAME = 'test';

	/**
	 * Constructs and initializes an Test gateway
	 *
	 * @param Config $config
	 *            Config.
	 */
	public function __construct( Config $config ) {
		$config->merchant_key  = 'GEBOB2W8MM';
		$config->merchant_salt = 'C462OM5IAV';
		$config->mode          = 'test';

		parent::__construct( $config );
		
		$this->config = $config;

		$this->supports = [];

		$this->set_method( self::METHOD_HTML_FORM );
	}

	/**
	 * Get supported payment methods
	 *
	 * @see Parent_Gateway::get_supported_payment_methods()
	 */
	public function get_supported_payment_methods() {
		return [];
	}

	/**
	 * Start.
	 *
	 * @see Core_Gateway::start()
	 *
	 * @param Payment $payment
	 *            Payment.
	 */
	public function start( Payment $payment ) {

		if ( empty( $this->config->checkout_mode ) ) {
			// Update gateway results in payment.
			$payment->set_transaction_id( $payment->key . '_' . $payment->get_id() );
			$payment->set_action_url( $payment->get_return_url() );
			return;
		}

		parent::start( $payment );
	}

	/**
	 * Update status of the specified payment.
	 *
	 * @param Payment $payment
	 *            Payment.
	 */
	public function update_status( Payment $payment ) {
		if ( PaymentStatus::SUCCESS === $payment->get_status() ) {
			return;
		}
		
		if ( ! empty( $this->config->checkout_mode ) ) {
			return parent::update_status( $payment );
		}

		if ( ! isset( $_POST['pay'] ) ) {
			$payment->set_status( PaymentStatus::FAILURE );
			return;
		}

		switch ( $_POST['pay'] ) {
			case 'Success':
				$payment->set_status( PaymentStatus::SUCCESS );
				break;
			case 'Cancel':
				$payment->set_status( PaymentStatus::CANCELLED );
				break;
			default:
				$payment->set_status( PaymentStatus::FAILURE );
		}
	}

	/**
	 * Get form HTML.
	 *
	 * @param Payment $payment     Payment to get form HTML for.
	 * @param bool    $auto_submit Flag to auto submit.
	 * @return string
	 * @throws \Exception When payment action URL is empty.
	 */
	public function get_form_html( Payment $payment, $auto_submit = false ) {
		if ( ! empty( $this->config->checkout_mode ) ) {
			return parent::get_form_html( $payment, $auto_submit );
		}

		$customer = $payment->get_customer();

		$form_inner = '';

		$form_inner .= '<hr><h2>' . __( 'Customer Details', 'knit-pay' ) . '</h2><dl class="alignleft">';
		$form_inner .= '<dt>Customer Name</dt><dd>' . $customer->get_name() . '</dd>';
		$form_inner .= '<dt>Customer Email</dt><dd>' . $customer->get_email() . '</dd>';
		if ( ! ( empty( $payment->get_billing_address() ) || empty( $payment->get_billing_address()->get_phone() ) ) ) {
			$form_inner .= '<dt>Customer Phone</dt><dd>' . $payment->get_billing_address()->get_phone() . '</dd>';
		}
		$form_inner .= '</dl><br><hr>';

		$form_inner .= sprintf(
			'<input class="pronamic-pay-btn" type="submit" name="pay" value="%s" />',
			__( 'Success', 'pronamic_ideal' )
		);
		$form_inner .= '&nbsp;&nbsp;';
		$form_inner .= sprintf(
			'<input class="pronamic-pay-btn" type="submit" name="pay" value="%s" />',
			__( 'Cancel', 'pronamic_ideal' )
		);

		$action_url = $payment->get_action_url();

		if ( empty( $action_url ) ) {
			throw new \Exception( 'Action URL is empty, can not get form HTML.' );
		}

		$html = sprintf(
			'<form id="pronamic_ideal_form" name="pronamic_ideal_form" method="post" action="%s">%s</form>',
			esc_attr( $action_url ),
			$form_inner
		);

		return $html;

	}
}
