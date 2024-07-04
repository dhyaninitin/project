<?php
namespace KnitPay\Gateways\PayU;

use Pronamic\WordPress\Number\Number;
use Pronamic\WordPress\Pay\Core\Gateway as Core_Gateway;
use Pronamic\WordPress\Pay\Payments\Payment;
use Pronamic\WordPress\Pay\Payments\PaymentStatus as Core_Statuses;
use Pronamic\WordPress\Money\Money;
use Exception;

/**
 * Title: PayU Gateway
 * Copyright: 2020-2022 Knit Pay
 *
 * @author Knit Pay
 * @version 5.4.0
 * @since 5.4.0
 */
class Gateway extends Core_Gateway {

	/**
	 * Client.
	 *
	 * @var Client
	 */
	private $client;

	/**
	 * Initializes an PayU gateway
	 *
	 * @param Config $config
	 *            Config.
	 */
	public function init( Config $config ) {

		
		$this->config = $config;

		$this->set_method( self::METHOD_HTML_FORM );

		// Supported features.
		 $this->supports = [
			 'payment_status_request',
			 'refunds',
		 ];

		 // Client.
		 $this->client = new Client( $config, self::MODE_TEST === $config->mode );
	}

	/**
	 * Get supported payment methods
	 *
	 * @see Core_Gateway::get_supported_payment_methods()
	 */
	public function get_supported_payment_methods() {
		return [
			PaymentMethods::CREDIT_CARD,
			PaymentMethods::PAY_U,
		];
	}

	/**
	 * Get available payment methods.
	 *
	 * @return array<int, string>
	 * @see Core_Gateway::get_available_payment_methods()
	 */
	public function get_available_payment_methods() {
		return $this->get_supported_payment_methods();
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
		/*
		 if ( ! $this->config->is_connected ) {
			$error       = 'PayU is not connected. If you are a store owner, integrate PayU and try again.';
			$this->error = new WP_Error( 'payu_error', $error );
			return;
		} */

		if ( empty( $this->config->mid ) ) {
			 $error = 'PayU Merchant ID is missing. Kindly enter the correct Merchant ID on the PayU configuration page.';
			 throw new \Exception( $error );
		}

		if ( '0.00' === $payment->get_total_amount()->number_format( null, '.', '' ) ) {
			throw new \Exception( 'The amount can not be zero.' );
		}

		$payment_currency = $payment->get_total_amount()->get_currency()->get_alphabetic_code();
		if ( isset( $payment_currency ) && 'INR' !== $payment_currency ) {
			$currency_error = 'PayU only accepts payments in Indian Rupees. If you are a store owner, kindly activate INR currency for ' . $payment->get_source() . ' plugin.';
			throw new \Exception( $currency_error );
		}

		$payment->set_transaction_id( $payment->key . '_' . $payment->get_id() );
		$payment->set_action_url( $this->client->get_payment_server_url() . '/_payment' );
	}

	/**
	 * Update status of the specified payment.
	 *
	 * @param Payment $payment
	 *            Payment.
	 */
	public function update_status( Payment $payment ) {
		if ( Core_Statuses::SUCCESS === $payment->get_status() ) {
			return;
		}

			$transaction = $this->client->verify_payment( $payment->get_transaction_id() );
		if ( $transaction->txnid !== $payment->get_transaction_id() ) {
			$payment->add_note( 'Something went wrong: ' . print_r( $transaction, true ) );
			return;
		}

		if ( isset( $transaction->status ) ) {
			$transaction_status = $transaction->status;

			if ( Statuses::SUCCESS === $transaction_status ) {
				$payment->set_transaction_id( $transaction->mihpayid );
			}

			$note = '<strong>PayU Transaction Details:</strong><br><pre>' . print_r( $transaction, true ) . '</pre>';

			$payment->set_status( Statuses::transform( $transaction_status ) );
			$payment->add_note( $note );
		}

	}

	/**
	 * Redirect via HTML.
	 *
	 * @see Core_Gateway::get_output_fields()
	 *
	 * @param Payment $payment
	 *            Payment.
	 */
	public function get_output_fields( Payment $payment ) {
		$merchant_key  = $this->config->merchant_key;
		$merchant_salt = $this->config->merchant_salt;

		$txnid  = $payment->get_transaction_id();
		$amount = $payment->get_total_amount()->number_format( null, '.', '' );
		
		$product_info = esc_attr( $payment->get_description() );
		if ( empty( $product_info ) ) {
			$product_info = preg_replace( '/[^!-~\s]/', '', $payment->get_description() );
		}

		$first_name = '';
		$last_name  = '';
		$customer   = $payment->get_customer();
		if ( null !== $customer->get_name() ) {
			$first_name = $customer->get_name()->get_first_name();
			$last_name  = $customer->get_name()->get_last_name();
		}
		$email = $customer->get_email();

		$phone     = '';
		$address   = '';
		$address_2 = '';
		$city      = '';
		$state     = '';
		$country   = '';
		$zipcode   = '';

		$billing_address = $payment->get_billing_address();
		if ( null !== $billing_address ) {
			if ( ! empty( $billing_address->get_phone() ) ) {
				$phone = $billing_address->get_phone();
			}
			$address   = $billing_address->get_line_1();
			$address_2 = $billing_address->get_line_2();
			$city      = $billing_address->get_city();
			$state     = $billing_address->get_region();
			$country   = $billing_address->get_country();
			$zipcode   = $billing_address->get_postal_code();
		}

		$udf1 = PHP_VERSION;
		$udf2 = KNITPAY_VERSION;
		$udf3 = $payment->get_source();
		$udf4 = home_url( '/' );
		$udf5 = 'Knit Pay';

		// @see: https://devguide.payu.in/docs/collect-additional-charges/
		$transaction_fees   = $this->get_transaction_fees( $payment->get_total_amount(), $this->config->transaction_fees_percentage, $this->config->transaction_fees_fix );
		$additional_charges = "CC:{$transaction_fees},DC:{$transaction_fees},NB:{$transaction_fees},UPI:{$transaction_fees},CASH:{$transaction_fees},EMI:{$transaction_fees}";

		$str = "{$merchant_key}|{$txnid}|{$amount}|{$product_info}|{$first_name}|{$email}|{$udf1}|{$udf2}|{$udf3}|{$udf4}|{$udf5}||||||{$merchant_salt}|{$additional_charges}";

		$hash = strtolower( hash( 'sha512', $str ) );

		$return_url = $payment->get_return_url();

		return [
			'key'                => $merchant_key,
			'txnid'              => $txnid,
			'amount'             => $amount,
			'productinfo'        => $product_info,
			'firstname'          => $first_name,
			'lastname'           => $last_name,
			'address1'           => $address,
			'address2'           => $address_2,
			'city'               => $city,
			'state'              => $state,
			'country'            => $country,
			'zipcode'            => $zipcode,
			'email'              => $email,
			'phone'              => $phone,
			'surl'               => $return_url,
			'furl'               => $return_url,
			'hash'               => $hash,
			'udf1'               => $udf1,
			'udf2'               => $udf2,
			'udf3'               => $udf3,
			'udf4'               => $udf4,
			'udf5'               => $udf5,
			'additional_charges' => $additional_charges,
			// 'pg'               => 'DC' //TODO @see https://devguide.payu.in/docs/developers-guide/checkout/payu-prebuilt-checkout-overview/prebuilt-checkout-integration/
		];
	}

	/**
	 * Create refund.
	 *
	 * @param string $transaction_id Transaction ID.
	 * @param Money  $amount         Amount to refund.
	 * @param string $description    Refund reason.
	 * @return string
	 */
	public function create_refund( $transaction_id, Money $amount, $description = null ) {
		return $this->client->cancel_refund_transaction( $transaction_id, uniqid( 'refund_' ), $amount->number_format( null, '.', '' ) );
	}

	private function get_transaction_fees( Money $amount, $transaction_fees_percentage, $transaction_fees_fix ) {
		if ( empty( $transaction_fees_percentage ) && empty( $transaction_fees_fix ) ) {
			return 0;
		}

		try {
			$transaction_fees_percentage = Number::from_string( $transaction_fees_percentage );
			if ( 59 < $transaction_fees_percentage->get_value() || 0 > $transaction_fees_percentage->get_value() ) {
				throw new Exception( 'Transaction Fees Percentage should be between 0 and 59.' );
			}
			$transaction_fees_fix_amount = new Money( $transaction_fees_fix, $amount->get_currency() );
		} catch ( \Exception $e ) {
			throw new Exception( 'Invalid Transaction Fees. ' . $e->getMessage() );
		}

		// Transaction Fees calculated using Percentage.
		$transaction_fees = $amount->multiply( $transaction_fees_percentage )->divide( ( new Number( 100 ) )->subtract( $transaction_fees_percentage ) );

		// Transaction Fees after addition of Fix Transaction Fees.
		$transaction_fees = $transaction_fees->add( $transaction_fees_fix_amount );

		return $transaction_fees->number_format( null, '.', '' );
	}
}
