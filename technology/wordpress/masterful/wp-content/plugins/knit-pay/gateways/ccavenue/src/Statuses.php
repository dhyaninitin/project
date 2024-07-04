<?php

namespace KnitPay\Gateways\CCAvenue;

use Pronamic\WordPress\Pay\Payments\PaymentStatus as Core_Statuses;

/**
 * Title: CCAvenue Statuses
 * Copyright: 2020-2022 Knit Pay
 *
 * @author  Knit Pay
 * @version 1.0.0
 * @since   2.3.0
 */
class Statuses {
	/**
	 * SUCCESS
	 *
	 * @var string
	 *
	 * @link https://dashboard.ccavenue.com/resources/integrationKit.do#response_parameters_doc
	 */
	const SUCCESS = 'Success';

	/**
	 * FAILURE.
	 *
	 * @var string
	 *
	 * @link https://dashboard.ccavenue.com/resources/integrationKit.do#response_parameters_doc
	 */
	const FAILURE = 'Failure';

	const ABORTED   = 'Aborted';
	const INVALID   = 'Invalid';
	const INITIATED = 'Initiated';

	/**
	 * Transform an CCAvenue status to an Knit Pay status
	 *
	 * @param string $status
	 *
	 * @return string
	 */
	public static function transform( $status ) {
		switch ( $status ) {
			case self::SUCCESS:
				return Core_Statuses::SUCCESS;

			case self::FAILURE:
			case self::INVALID:
				return Core_Statuses::FAILURE;

			case self::ABORTED:
				return Core_Statuses::CANCELLED;

			case self::INITIATED:
			default:
				return Core_Statuses::OPEN;
		}
	}
}
