<?php

namespace KnitPay\Gateways\CCAvenue;

use Pronamic\WordPress\Pay\Core\GatewayConfig;

/**
 * Title: CCAvenue Config
 * Copyright: 2020-2022 Knit Pay
 *
 * @author  Knit Pay
 * @version 1.0.0
 * @since   2.3.0
 */
class Config extends GatewayConfig {
	public $merchant_id;

	public $access_code;
	public $working_key;
}
