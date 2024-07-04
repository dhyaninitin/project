<?php
namespace KnitPay\Gateways\PayUmoney;

use Pronamic\WordPress\Pay\Core\XML\Security;
use stdClass;
use Exception;
use WP_Error;

/**
 * Title: PayUmoney Client
 * Copyright: 2020-2022 Knit Pay
 *
 * @author Knit Pay
 * @version 1.9.1
 * @since 1.0.0
 */
class Client {

	const LIVE_URL = 'https://secure.payu.in';

	const TEST_URL = 'https://sandboxsecure.payu.in';

	const BOLT_LIVE_URL = 'https://checkout-static.citruspay.com/bolt/run/bolt.min.js';

	const BOLT_TEST_URL = 'https://sboxcheckout-static.citruspay.com/bolt/run/bolt.min.js';

	const API_LIVE_URL = 'https://www.payumoney.com';

	const API_TEST_URL = 'https://www.payumoney.com/sandbox';

	const CHECKOUT_REDIRECT_MODE = 0;

	const CHECKOUT_BOLT_MODE = 1;

	const CHECKOUT_URL_MODE = 2;


	/**
	 * merchant_key.
	 *
	 * @var string
	 */
	private $merchant_key;

	private $merchant_salt;

	private $mode;

	private $payment_server_url;

	private $bolt_url;

	private $api_url;

	/**
	 * Construct and initialize an PayUmoney Client
	 *
	 * @param Config $config
	 */
	public function __construct( Config $config ) {
		$this->payment_server_url = self::LIVE_URL;
		$this->bolt_url           = self::BOLT_LIVE_URL;
		$this->api_url            = self::API_LIVE_URL;
		$this->merchant_key       = $config->merchant_key;
		$this->merchant_salt      = $config->merchant_salt;
		$this->auth_header        = $config->auth_header;
		$this->mode               = $config->mode;
	}

	public function get_action_url( $data ) {
		$response = wp_remote_post(
			$this->payment_server_url . '/_payment',
			[
				'body'        => $data,
				'redirection' => 0,
			]
		);

		if ( $response instanceof WP_Error ) {
			throw new Exception( 'Something went wrong. Please try again later.' );
		}

		if ( ! $response['headers']->offsetExists( 'location' ) ) {
			throw new Exception( 'Payment link could not be generated. Kindly check the API keys and try again.' );
		}
		return $response['headers']->offsetGet( 'location' );
	}

	public function get_payment_response( $transaction_id ) {
		$data     = [
			'merchantKey'            => $this->merchant_key,
			'merchantTransactionIds' => $transaction_id,
		];
		$response = wp_remote_post(
			$this->get_api_url() . '/payment/op/getPaymentResponse',
			[
				'body'    => $data,
				'headers' => 'authorization:' . $this->auth_header,
			]
		);

		if ( $response instanceof WP_Error ) {
			throw new Exception( 'Something went wrong. Please try again later.' );
		}

		$result = wp_remote_retrieve_body( $response );

		$result = json_decode( $result );
		if ( isset( $result->status ) && 0 === $result->status ) {
			return $result->result[0]->postBackParam;
		}

		if ( isset( $result->message ) ) {
			throw new Exception( trim( $result->message ) );
		}
		throw new Exception( 'Something went wrong. Please try again later.' );
	}

	public function get_merchant_transaction_status( $transaction_id ) {
		$data     = [
			'merchantKey'            => $this->merchant_key,
			'merchantTransactionIds' => $transaction_id,
		];
		$response = wp_remote_post(
			$this->get_api_url() . '/payment/payment/chkMerchantTxnStatus',
			[
				'body'    => $data,
				'headers' => 'authorization:' . $this->auth_header,
			]
		);

		if ( $response instanceof WP_Error ) {
			throw new Exception( 'Something went wrong. Please try again later.' );
		}

		$result = wp_remote_retrieve_body( $response );

		$result = json_decode( $result );
		if ( isset( $result->status ) && 0 === $result->status ) {
			return $result->result[0];
		}

		if ( isset( $result->message ) ) {
			throw new Exception( trim( $result->message ) );
		}
		throw new Exception( 'Something went wrong. Please try again later.' );
	}

	/**
	 * Set the payment server URL
	 *
	 * @param string $url
	 *            an URL
	 */
	public function set_payment_server_url( $url ) {
		$this->payment_server_url = $url;
	}

	public function get_payment_server_url() {
		return $this->payment_server_url;
	}

	public function set_bolt_url( $url ) {
		$this->bolt_url = $url;
	}

	public function get_bolt_url() {
		return $this->bolt_url;
	}

	public function set_api_url( $url ) {
		$this->api_url = $url;
	}

	public function get_api_url() {
		return $this->api_url;
	}
}
