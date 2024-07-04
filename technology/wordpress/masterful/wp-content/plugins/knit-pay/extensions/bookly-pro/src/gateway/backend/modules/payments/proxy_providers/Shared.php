<?php
namespace BooklyKnitPay\Backend\Modules\Payments\ProxyProviders;

use Bookly\Lib as BooklyLib;
use Bookly\Backend\Modules\Payments\Proxy;
use KnitPay\Extensions\BooklyPro\Extension;

/**
 * Class Shared
 *
 * @package BooklyStripe\Backend\Modules\Payments\ProxyProviders
 */
class Shared extends Proxy\Shared {

	/**
	 * @inheritDoc
	 */
	public static function paymentSpecificPriceExists( $gateway ) {
		$active_payment_methods = Extension::get_active_payment_methods();
		
		if ( in_array( $gateway, $active_payment_methods ) && get_option( 'bookly_' . $gateway . '_enabled' ) ) {
			return get_option( 'bookly_' . $gateway . '_increase' ) != 0
			|| get_option( 'bookly_' . $gateway . '_addition' ) != 0;
		}
		
		return $gateway;
	}
}
