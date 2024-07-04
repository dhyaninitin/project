<?php
namespace BooklyKnitPay\Frontend\Modules\KnitPay;

use Bookly\Lib as BooklyLib;
use BooklyKnitPay\Lib;

/**
 * Class Controller
 *
 * @package Bookly\Frontend\Modules\KnitPay
 */
class Controller extends BooklyLib\Base\Component {

	/**
	 * Checkout.
	 */
	public static function checkout( $payment_method ) {
		$form_id  = self::parameter( 'bookly_fid' );
		$userData = new BooklyLib\UserBookingData( $form_id );
		if ( $userData->load() ) {
			Lib\Payment\KnitPay::paymentPage( $form_id, $userData, self::parameter( 'response_url' ), $payment_method );
		}
	}
}
