<?php

namespace KnitPay\Gateways\Cashfree;

use Exception;

class API {

	const CONNECTION_TIMEOUT = 10;
	const API_RETRY_COUNT    = 3;

	private $api_endpoint;

	private $api_id;

	private $secret_key;

	public function __construct( $api_id, $secret_key, $test_mode ) {
		$this->api_id     = $api_id;
		$this->secret_key = $secret_key;

		$this->get_endpoint( $test_mode );
	}

	private function get_endpoint( $test_mode ) {
		if ( $test_mode ) {
			$this->api_endpoint = 'https://test.cashfree.com/';
			return;
		}
		$this->api_endpoint = 'https://api.cashfree.com/';
	}

	public function create_order_link( $data, $retry = self::API_RETRY_COUNT ) {
		if ( 0 === $retry ) {
			error_log( 'Cashfree error: Failed after 3 attempts' );
			throw new Exception( 'Something went wrong. Please try again later.' );
		}
		$endpoint = $this->api_endpoint . 'api/v1/order/create';
		$api_data = wp_parse_args( $data, $this->get_api_data() );

		$response = wp_remote_post(
			$endpoint,
			[
				'body'    => $api_data,
				'timeout' => self::CONNECTION_TIMEOUT,
			]
		);
		$result   = wp_remote_retrieve_body( $response );

		$result = json_decode( $result );
		if ( isset( $result->status ) && 'OK' === $result->status ) {
			return $result->paymentLink;
		}

		if ( isset( $result->reason ) ) {
			throw new Exception( trim( $result->reason ) );
		}
		sleep( 1 );
		return self::create_order_link( $data, --$retry );
	}

	public function get_order_status( $id, $retry = self::API_RETRY_COUNT ) {
		if ( 0 === $retry ) {
			error_log( 'Cashfree error: Failed after 3 attempts' );
			throw new Exception( 'Something went wrong. Please try again later.' );
		}

		$endpoint = $this->api_endpoint . 'api/v1/order/info/status';

		$response = wp_remote_post(
			$endpoint,
			[
				'body'    => [
					'appId'     => $this->api_id,
					'secretKey' => $this->secret_key,
					'orderId'   => $id,
				],
				'timeout' => self::CONNECTION_TIMEOUT,
			]
		);
		$result   = wp_remote_retrieve_body( $response );

		$result = json_decode( $result );
		if ( isset( $result->status ) && 'OK' === $result->status ) {
			return $result;
		}

		if ( isset( $result->reason ) ) {
		    // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_print_r
			throw new Exception( "Unable to Fetch Order Status: '$id' Server Responds " . print_R( $result->reason, true ) );
		}
		sleep( 1 );
		return self::get_order_status( $id, --$retry );
	}

	private function get_api_data() {
		return [
			'appId'     => $this->api_id,
			'secretKey' => $this->secret_key,
		];
	}
}
