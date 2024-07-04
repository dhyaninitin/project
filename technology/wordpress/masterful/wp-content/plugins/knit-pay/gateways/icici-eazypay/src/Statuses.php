<?php

namespace KnitPay\Gateways\IciciEazypay;

use Pronamic\WordPress\Pay\Payments\PaymentStatus as Core_Statuses;

/**
 * Title: ICICI Eazypay Statuses
 * Copyright: 2020-2022 Knit Pay
 *
 * @author  Knit Pay
 * @version 6.62.0.0
 * @since   6.62.0.0
 */
class Statuses {

	const RECONCILIATION_IN_PROGRESS = 'RIP';
	
	const SETTLEMENT_IN_PROGRESS = 'SIP';
	
	const SUCCESS = 'Success';
	
	const NOT_INITIATED = 'NotInitiated';
	
	const TRANSACTION_INITIATED = 'Transaction Initiated';

	const FAILED = 'FAILED';
	
	const TIMEOUT = 'TIMEOUT';
	
	const TRANSACTION_EXPIRED = 'Transaction Expired';

	/**
	 * Transform an ICICI Eazypay status to an Knit Pay status
	 *
	 * @param string $status
	 *
	 * @return string
	 */
	public static function transform( $status ) {
		switch ( $status ) {
			case self::SUCCESS:
			case self::RECONCILIATION_IN_PROGRESS:
			case self::SETTLEMENT_IN_PROGRESS:
				return Core_Statuses::SUCCESS;

			case self::FAILED:
				return Core_Statuses::FAILURE;

			case self::TRANSACTION_INITIATED:
			case self::NOT_INITIATED:
			default:
				return Core_Statuses::OPEN;
		}
	}
}
