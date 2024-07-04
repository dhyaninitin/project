<?php
namespace KnitPay\Gateways\Razorpay;

use Pronamic\WordPress\Money\Money;
use Pronamic\WordPress\Number\Number;
use Pronamic\WordPress\Pay\Address;
use Pronamic\WordPress\Pay\Core\Gateway as Core_Gateway;
use Pronamic\WordPress\Pay\Payments\Payment;
use Pronamic\WordPress\Pay\Payments\PaymentStatus;
use Pronamic\WordPress\Pay\Subscriptions\Subscription;
use Razorpay\Api\Api;
use Razorpay\Api\Errors\BadRequestError;
use Razorpay\Api\Errors\ServerError;
use Requests_Exception;
use WP_Error;

/**
 * Title: Razorpay Gateway
 * Copyright: 2020-2022 Knit Pay
 *
 * @author Knit Pay
 * @version 1.0.0
 * @since   1.7.0
 */
class Gateway extends Core_Gateway {
	const NAME = 'razorpay';

	/**
	 * Initializes an Razorpay gateway
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

		if ( defined( 'KNIT_PAY_RAZORPAY_SUBSCRIPTION' ) ) {
			$this->supports = wp_parse_args(
				$this->supports,
				[
					'recurring_credit_card',
					'recurring',
				]
			);
		}
	}

	/**
	 * Get supported payment methods
	 *
	 * @see Core_Gateway::get_supported_payment_methods()
	 */
	public function get_supported_payment_methods() {
		return [
			PaymentMethods::CREDIT_CARD,
			PaymentMethods::RAZORPAY,
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
		if ( PaymentStatus::SUCCESS === $payment->get_status() ) {
			return;
		}

		$payment_currency = $payment->get_total_amount()->get_currency()->get_alphabetic_code();

		$api = $this->get_razorpay_api();

		$customer = $payment->get_customer();

		// Recurring payment method.
		$subscription = $payment->get_subscription();

		$is_subscription_payment = ( $subscription && $this->supports( 'recurring' ) );

		if ( $is_subscription_payment ) {
			$this->create_razorpay_subscription( $api, $payment, $subscription, $customer, $payment_currency );
		} else {
			$this->create_razorpay_order( $api, $payment, $customer, $payment_currency );
		}

		$payment->set_transaction_id( $payment->key . '_' . $payment->get_id() );
		$payment->set_action_url( $payment->get_pay_redirect_url() );
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

		if ( empty( $payment->get_transaction_id() ) ) {
			return;
		}

		$razorpay_order_id = $payment->get_meta( 'razorpay_order_id' );
		if ( empty( $razorpay_order_id ) ) {
			$payment->add_note( 'razorpay_order_id is not set.' );
			$payment->set_status( PaymentStatus::FAILURE );
			return;
		}

		$action = filter_input( INPUT_GET, 'action', FILTER_SANITIZE_STRING );

		$api = $this->get_razorpay_api();

			$razorpay_order = $api->order->fetch( $razorpay_order_id );

			// No further execution if payment is not attemped yet.
		if ( empty( $razorpay_order->attempts ) ) {
			if ( isset( $action ) && Statuses::CANCELLED === $action ) {
				$payment->set_status( Statuses::transform( $action ) );
				return;
			}

			$payment->add_note( 'Payment not attempted for order_id: ' . $razorpay_order_id );

			$this->expire_old_payment( $payment );
			return;
		}

			// Fetch payments for this order.
			$razorpay_payments = $api->order->fetch( $razorpay_order_id )->payments();

			// Get Last payment from array of payments as default Razorpay payment.
			$razorpay_payment = $razorpay_payments->items[0];

			// If order is paid, get the payment which is authorized/captured/refunded.
		foreach ( $razorpay_payments->items as $razorpay_payment_item ) {
			if ( Statuses::CREATED !== $razorpay_payment_item->status && Statuses::FAILED !== $razorpay_payment_item->status ) {
				$razorpay_payment = $razorpay_payment_item;
			}
		}

			$this->update_payment_status( $payment, $razorpay_payment );
	}

	private function update_payment_status( $payment, $razorpay_payment, $razorpay_subscription_id = null ) {
		/*
		 TODO: It was creating conflict with razorpay Offers feature. Razorpay Payment contains lesser amount if offer was applied.
		 Remove it after Dec 2021 if not required.
		if ( floatval( $razorpay_payment->amount ) !== $payment->get_total_amount()->number_format( null, '.', '' ) * 100 ) {
			return;
		} */

		$razorpay_subscription_id = $payment->get_meta( 'razorpay_subscription_id' );

		$note = '<strong>Razorpay Parameters:</strong>';
		if ( ! empty( $razorpay_subscription_id ) ) {
			$note .= '<br>subscription_id: ' . $razorpay_subscription_id;
		}
		$note .= '<br>payment_id: ' . $razorpay_payment->id;
		$note .= '<br>order_id: ' . $razorpay_payment->order_id;
		if ( ! empty( $razorpay_payment->invoice_id ) ) {
			$note .= '<br>invoice_id: ' . $razorpay_payment->invoice_id;
		}
		$note .= '<br>Status: ' . $razorpay_payment->status;
		if ( ! empty( $razorpay_payment->error_description ) ) {
			$note .= '<br>error_description: ' . $razorpay_payment->error_description;
		}

		$payment->add_note( $note );
		$payment->set_status( Statuses::transform( $razorpay_payment->status ) );

		if ( PaymentStatus::SUCCESS === $payment->get_status() ) {
			$this->update_missing_payment_details( $payment, $razorpay_payment );
			$payment->set_transaction_id( $razorpay_payment->id );
		}
	}

	private function create_razorpay_order( $api, Payment $payment, $customer, $payment_currency ) {
		$this->razorpay_order_id = $payment->get_meta( 'razorpay_order_id' );

		// Return if order id already exists for this payments.
		if ( $this->razorpay_order_id ) {
			return;
		}

		$amount = $this->get_amount_with_transaction_fees( $payment->get_total_amount(), $this->config->transaction_fees_percentage, $this->config->transaction_fees_fix );

		if ( ! isset( $amount ) ) {
			return;
		}

		$razorpay_order_data = [
			'receipt'         => $payment->key . '_' . $payment->get_id(),
			'amount'          => $amount->get_minor_units()->format( 0, '.', '' ),
			'currency'        => $payment_currency,
			'notes'           => $this->get_notes( $payment ),
			'payment_capture' => 1, // TODO: 1 for auto capture. give admin option to set auto capture. do re-search to see if razorpay has deprecate it or not.
		];

			$razorpay_order          = $api->order->create( $razorpay_order_data );
			$this->razorpay_order_id = $razorpay_order['id'];
			$payment->set_meta( 'razorpay_order_id', $this->razorpay_order_id );
			$payment->add_note( 'Razorpay order_id: ' . $this->razorpay_order_id );
	}

	private function create_razorpay_subscription( $api, Payment $payment, Subscription $subscription, $customer, $payment_currency ) {

		$razorpay_subscription_id = $payment->get_meta( 'razorpay_subscription_id' );

		// Return if subscription already exists for this payments.
		if ( $razorpay_subscription_id ) {
			return;
		}

		// Don't create new Razorpay subscription if this subscription has more than 1 payment.
		if ( 1 !== count( $subscription->get_payments() ) ) {
			return;
		}

		$payment_periods = $payment->get_periods();
		if ( is_null( $payment_periods ) ) {
			throw new \Exception( 'Periods is not set.' );
		}
		$subscription_period = $payment_periods[0];

		$subscription_phase = $subscription_period->get_phase();

		switch ( substr( $subscription_phase->get_interval()->get_specification(), -1, 1 ) ) {
			case 'D':
				$period = 'daily';
				break;
			case 'W':
				$period = 'weekly';
				break;
			case 'M':
				$period = 'monthly';
				break;
			case 'Y':
				$period = 'yearly';
				break;
			default:
				return;
		}

			$plan_data                                      = [
				'period'   => $period,
				'interval' => substr( $subscription_phase->get_interval()->get_specification(), -2, 1 ),
				'item'     => [
					'name'     => $subscription->description,
					'amount'   => $subscription_phase->get_amount()->get_minor_units()->format( 0, '.', '' ),
					'currency' => $payment_currency,
				],
				'notes'    => $this->get_notes( $payment ),
			];
			$plan_data['notes']['knitpay_subscription_id']  = $subscription->get_id();
			$plan_data['notes']['knitpay_subscription_key'] = $subscription->get_key();
			$razorpay_plan                                  = $api->plan->create( $plan_data );

			$total_count = $this->get_max_count_for_period( $period, $subscription_phase->get_total_periods() );

			// TODO: Bug, total periods not updated in subscription
			// $subscription_phase->set_total_periods($total_count);

			$subscription_data                                      = [
				'plan_id'         => $razorpay_plan->id,
				'total_count'     => $total_count,
				'customer_notify' => 1,
				'addons'          => [],
				'notes'           => $this->get_notes( $payment ),
				'notify_info'     => [
					'notify_phone' => $payment->get_billing_address()->get_phone(),
					'notify_email' => $customer->get_email(),
				],
			];
			$subscription_data['notes']['knitpay_subscription_id']  = $subscription->get_id();
			$subscription_data['notes']['knitpay_subscription_key'] = $subscription->get_key();

			$razorpay_subscription = $api->subscription->create( $subscription_data );
			$razorpay_invoices     = $api->invoice->all( [ 'subscription_id' => $razorpay_subscription->id ] );

			// Save Subscription and Plan ID.
			$subscription->set_meta( 'razorpay_subscription_id', $razorpay_subscription->id );
			$subscription->set_meta( 'razorpay_plan_id,', $razorpay_plan->id );

			$payment->set_meta( 'razorpay_order_id', $razorpay_invoices->items[0]->order_id );
			$payment->set_meta( 'razorpay_subscription_id', $razorpay_subscription->id );
	}

	private function get_max_count_for_period( $period, $total_count ) {
		switch ( $period ) {
			case 'daily':
				return min( $total_count, 36500 );
			case 'weekly':
				return min( $total_count, 5200 );
			case 'monthly':
				return min( $total_count, 1200 );
			case 'yearly':
				return min( $total_count, 100 );
			default:
				return;
		}
	}

	/**
	 * Get form HTML.
	 *
	 * @see Core_Gateway::get_form_html()
	 *
	 * @param Payment $payment     Payment to get form HTML for.
	 * @param bool    $auto_submit Flag to auto submit.
	 * @return string
	 * @throws \Exception When payment action URL is empty.
	 */
	public function get_form_html( Payment $payment, $auto_submit = false ) {
		if ( PaymentStatus::SUCCESS === $payment->get_status() || PaymentStatus::EXPIRED === $payment->get_status() ) {
			wp_safe_redirect( $payment->get_return_redirect_url() );
		}

		switch ( $this->config->checkout_mode ) {
			case Config::CHECKOUT_STANDARD_MODE:
				$data      = $this->get_standard_output_fields( $payment );
				$data_json = wp_json_encode( $data );

				require 'checkout/manual.php';

				if ( $auto_submit ) {
					$html = '<script type="text/javascript">document.getElementById("rzp-button1").click();</script>';
				}

				return $html;
			case Config::CHECKOUT_HOSTED_MODE:
				$payment->set_action_url( 'https://api.razorpay.com/v1/checkout/embedded' );
				return parent::get_form_html( $payment, $auto_submit );

			default:
		}
	}

	/**
	 * Get output inputs.
	 *
	 * @param Payment $payment Payment.
	 *
	 * @see Core_Gateway::get_output_fields()
	 *
	 * @return array
	 * @since 2.8.1
	 */
	public function get_output_fields( Payment $payment ) {
		$fields = $this->get_default_output_fields( $payment );

		$customer        = $payment->get_customer();
		$billing_address = $payment->get_billing_address();

		$fields['key_id'] = $this->config->key_id;

		$fields['prefill[name]']  = substr( trim( ( html_entity_decode( $customer->get_name(), ENT_QUOTES, 'UTF-8' ) ) ), 0, 45 );
		$fields['prefill[email]'] = $customer->get_email();
		if ( isset( $billing_address ) && ! empty( $billing_address->get_phone() ) ) {
			$fields['prefill[contact]'] = $billing_address->get_phone();
		}

		if ( empty( $fields['name'] ) ) {
			$fields['name'] = 'Pay via Razorpay';
		}

		// $fields['method'] = 'netbanking'; // TODO payment method. https://razorpay.com/docs/payment-gateway/web-integration/hosted/checkout-options/

		$fields['cancel_url'] = add_query_arg( 'action', 'cancelled', $payment->get_return_url() );

		return $fields;
	}

	public function get_standard_output_fields( Payment $payment ) {
		$fields = $this->get_default_output_fields( $payment );

		$customer        = $payment->get_customer();
		$billing_address = $payment->get_billing_address();

		$fields['key']     = $this->config->key_id;
		$fields['prefill'] = [
			'name'  => substr( trim( ( html_entity_decode( $customer->get_name(), ENT_QUOTES, 'UTF-8' ) ) ), 0, 45 ),
			'email' => $customer->get_email(),
			// 'method' => 'netbanking', // TODO: payment method. https://razorpay.com/docs/payment-gateway/web-integration/standard/checkout-options/
		];
		if ( isset( $billing_address ) && ! empty( $billing_address->get_phone() ) ) {
			$fields['prefill']['contact'] = $billing_address->get_phone();
		}

		$fields['theme'] = [
			// 'color' => '#F37254', // TODO
			'backdrop_color' => '#f0f0f0',
		];

		return $fields;
	}

	/**
	 * Get output inputs.
	 *
	 * @param Payment $payment Payment.
	 *
	 * @see Core_Gateway::get_output_fields()
	 *
	 * @return array
	 * @since 2.8.1
	 */
	public function get_default_output_fields( Payment $payment ) {
		$payment_currency         = $payment->get_total_amount()->get_currency()->get_alphabetic_code();
		$razorpay_order_id        = $payment->get_meta( 'razorpay_order_id' );
		$razorpay_subscription_id = $payment->get_meta( 'razorpay_subscription_id' );

		$company_name = $this->config->company_name;
		if ( empty( $company_name ) ) {
			$company_name = get_bloginfo( 'name' );
		}

		// @see https://razorpay.com/docs/payment-gateway/web-integration/standard/checkout-options/
		// @see https://razorpay.com/docs/payment-gateway/web-integration/hosted/checkout-options/
		$data = [
			'name'            => $company_name,
			'description'     => $payment->get_description(),
			'order_id'        => $razorpay_order_id,
			'subscription_id' => $razorpay_subscription_id,
			'callback_url'    => $payment->get_return_url(),
			'timeout'         => 900,
		];

		if ( ! empty( $this->config->checkout_image ) ) {
			$data['image'] = $this->config->checkout_image;
		}

		return $data;
	}

	protected function get_razorpay_api() {
		$api = new Api( $this->config->key_id, $this->config->key_secret );

		if ( ! empty( $this->config->access_token ) ) {
			$api->setHeader( 'Authorization', 'Bearer ' . $this->config->access_token );
		}

		return $api;
	}

	private function get_notes( Payment $payment ) {
		$notes = [
			'knitpay_payment_id'     => $payment->get_id(),
			'knitpay_extension'      => $payment->get_source(),
			'knitpay_source_id'      => $payment->get_source_id(),
			'knitpay_order_id'       => $payment->get_order_id(),
			'knitpay_version'        => KNITPAY_VERSION,
			'website_url'            => home_url( '/' ),
			'razorpay_checkout_mode' => $this->config->checkout_mode,
		];

		$customer      = $payment->get_customer();
		$customer_name = substr( trim( ( html_entity_decode( $customer->get_name(), ENT_QUOTES, 'UTF-8' ) ) ), 0, 45 );
		if ( ! empty( $customer_name ) ) {
			$notes = [
				'customer_name' => $customer_name,
			] + $notes;
		}

		$notes['auth_type'] = 'Bearer';
		if ( empty( $this->config->access_token ) ) {
			$notes['auth_type'] = 'Basic';
		}

		return $notes;
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
		$api = $this->get_razorpay_api();

		$razorpay_payment = $api->payment->fetch( $transaction_id );
		$refund           = $razorpay_payment->refund(
			[
				'amount' => $amount->get_minor_units()->format( 0, '.', '' ),
				'notes'  => [
					'Comment'         => $description,
					'knitpay_version' => KNITPAY_VERSION,
					'website_url'     => home_url( '/' ),
				],
			]
		);
		return $refund['id'];
	}

	private function expire_old_payment( $payment ) {
		// Make payment status as expired for payment older than 1 day.
		if ( DAY_IN_SECONDS < time() - $payment->get_date()->getTimestamp() && $this->config->expire_old_payments ) {
			$payment->set_status( PaymentStatus::EXPIRED );
		}
	}

	private function update_missing_payment_details( Payment $payment, $razorpay_payment ) {
		$customer = $payment->get_customer();
		$address  = $payment->get_billing_address();
		if ( ! isset( $address ) ) {
			$address = new Address();
		}

		if ( empty( $customer->get_email() ) ) {
			$address->set_email( $razorpay_payment->email );
			$customer->set_email( $razorpay_payment->email );
			$payment->email = $razorpay_payment->email;

			$user = get_user_by( 'email', $razorpay_payment->email );
			if ( false !== $user ) {
				$payment->user_id = $user->ID;
			}
		}

		if ( empty( $customer->get_phone() ) ) {
			$address->set_phone( $razorpay_payment->contact );
			$customer->set_phone( $razorpay_payment->contact );
		}

		$payment->set_customer( $customer );
		$payment->set_billing_address( $address );
	}

	public function get_balance() {
		$api = $this->get_razorpay_api();

		try {
			return $api->request->request( 'GET', 'balance' );
		} catch ( BadRequestError $e ) {
			$this->error = new WP_Error( 'razorpay_error', $e->getMessage() );
		} catch ( Requests_Exception $e ) {
			$this->error = new WP_Error( 'razorpay_error', $e->getMessage() );
		} catch ( ServerError $e ) {
			$this->error = new WP_Error( 'razorpay_error', $e->getMessage() );
		}
	}

	private function get_amount_with_transaction_fees( Money $amount, $transaction_fees_percentage, $transaction_fees_fix ) {
		if ( empty( $transaction_fees_percentage ) && empty( $transaction_fees_fix ) ) {
			return $amount;
		}

		try {
			$transaction_fees_percentage = Number::from_string( $transaction_fees_percentage );
			if ( 59 < $transaction_fees_percentage->get_value() ) {
				throw new \Exception( 'The maximum allowed Transaction Fees Percentage is 59.' );
			}
			$transaction_fees_fix_amount = new Money( $transaction_fees_fix, $amount->get_currency() );
		} catch ( \Exception $e ) {
			throw new \Exception( 'Invalid Transaction Fees. ' . $e->getMessage() );
		}

		$transaction_fees_percentage_divide = ( new Number( 100 ) )->subtract( $transaction_fees_percentage )->divide( new Number( 100 ) );
		$amount                             = $amount->divide( $transaction_fees_percentage_divide ); // Amount after addition Transaction Fees Percentage.

		$amount = $amount->add( $transaction_fees_fix_amount ); // Amount after addition of Fix Transaction Fees.

		return $amount;
	}
}
