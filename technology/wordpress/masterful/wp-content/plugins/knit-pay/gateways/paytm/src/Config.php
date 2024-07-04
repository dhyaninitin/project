<?php

namespace KnitPay\Gateways\Paytm;

use Pronamic\WordPress\Pay\Core\GatewayConfig;

/**
 * Title: Paytm Config
 * Copyright: 2020-2022 Knit Pay
 *
 * @author  Knit Pay
 * @version 4.9.0
 * @since   4.9.0
 */
class Config extends GatewayConfig {
	public $merchant_id;

	public $merchant_key;

	public $website;

	public $expire_old_payments;
}
