<?php

namespace KnitPay\Gateways\Stripe;

use Pronamic\WordPress\Pay\Core\GatewayConfig;

/**
 * Title: Stripe Config
 * Copyright: 2020-2022 Knit Pay
 *
 * @author  Knit Pay
 * @version 1.0.0
 * @since   3.1.0
 */
class Config extends GatewayConfig {
	public $publishable_key;

	public $secret_key;

	public $test_publishable_key;

	public $test_secret_key;

	public $payment_currency;

	public $exchange_rate;

	public $enabled_payment_methods;

	public function get_secret_key() {
		if ( Gateway::MODE_TEST === $this->mode && ! empty( $this->test_secret_key ) ) {
			return $this->test_secret_key;
		}
		return $this->secret_key;
	}

	public function is_live_set() {
		return ! ( empty( $this->secret_key ) || empty( $this->publishable_key ) );
	}

	public function is_test_set() {
		return ! ( empty( $this->test_secret_key ) || empty( $this->test_publishable_key ) );
	}

	public function get_publishable_key() {
		if ( Gateway::MODE_TEST === $this->mode && ! empty( $this->test_publishable_key ) ) {
			return $this->test_publishable_key;
		}
		return $this->publishable_key;
	}

	public function type_cast( $instance, $class_name ) {
		return unserialize(
			sprintf(
				'O:%d:"%s"%s',
				strlen( $class_name ),
				$class_name,
				strstr( strstr( serialize( $instance ), '"' ), ':' )
			)
		);
	}
}
