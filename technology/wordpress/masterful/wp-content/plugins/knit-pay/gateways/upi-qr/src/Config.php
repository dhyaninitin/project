<?php

namespace KnitPay\Gateways\UpiQR;

use Pronamic\WordPress\Pay\Core\GatewayConfig;

/**
 * Title: UPI QR Config
 * Copyright: 2020-2022 Knit Pay
 *
 * @author  Knit Pay
 * @version 1.0.0
 * @since   4.1.0
 */
class Config extends GatewayConfig {
	public $payee_name;

	public $vpa;

	public $merchant_category_code;
	
	public $payment_instruction;
	
	public $mobile_payment_instruction;
	
	public $payment_success_status;
	
	public $hide_mobile_qr;
}
