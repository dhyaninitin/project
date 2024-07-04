<?php
namespace BooklyKnitPay\Lib\ProxyProviders;

use Bookly\Lib as BooklyLib;
use BooklyKnitPay\Lib;
use BooklyKnitPay\Frontend\Modules\KnitPay;
use Pronamic\WordPress\Pay\Core\PaymentMethods;
use KnitPay\Extensions\BooklyPro\Extension;
use Pronamic\WordPress\Pay\Payments\PaymentStatus;

/**
 * Class Shared
 *
 * @package BooklyKnitPay\Lib\ProxyProviders
 */
class Shared extends BooklyLib\Proxy\Shared {
	/**
	 * @inheritdoc
	 */
	public static function applyGateway( BooklyLib\CartInfo $cart_info, $gateway ) {
		$active_payment_methods = Extension::get_active_payment_methods();
		
		if ( ! in_array( $gateway, $active_payment_methods ) ) {
			return $cart_info;
		}
		
		if ( get_option( 'bookly_' . $gateway . '_enabled' ) ) {
			$cart_info->setGateway( $gateway );
		}
		
		return $cart_info;
	}
	
	/**
	 * @inheritDoc
	 */
	public static function doDailyRoutine() {
		// Added support for Knit Pay Payment methods if not supported.
		
		/** @global \wpdb $wpdb */
		global $wpdb;
		
		$active_payment_methods = Extension::get_active_payment_methods();
		
		$payment_method_string = implode( '", "', $active_payment_methods );
		$payment_method_string = ', "' . $payment_method_string . '"';

		$table_name = $wpdb->prefix . 'bookly_payments';
		$query      = 'ALTER TABLE `%s` CHANGE `type` `type` ENUM("local", "free", "paypal", "authorize_net", "stripe", "2checkout", "payu_biz", "payu_latam", "payson", "mollie", "woocommerce", "cloud_stripe" %s) NOT NULL DEFAULT "local"';
		
		$wpdb->query( sprintf( $query, $table_name, $payment_method_string ) );
	}
	
	/**
	 * @inheritDoc
	 */
	public static function prepareOutdatedUnpaidPayments( $payments ) {
		$active_payment_methods = Extension::get_active_payment_methods();        
		foreach ( $active_payment_methods as $payment_method ) {
			$timeout = (int) get_option( 'bookly_' . $payment_method . '_timeout' );
			if ( $timeout ) {
				$payments = array_merge(
					$payments,
					BooklyLib\Entities\Payment::query()
					->where( 'type', $payment_method )
					->where( 'status', BooklyLib\Entities\Payment::STATUS_PENDING )
					->whereLt( 'created_at', date_create( current_time( 'mysql' ) )->modify( sprintf( '- %s seconds', $timeout ) )->format( 'Y-m-d H:i:s' ) )
					->fetchCol( 'id' )
				);
			}
		}
		
		// Updating status in Knit Pay Payment.
		foreach ( $payments as $bookly_payment_id ) {
			$payment = get_pronamic_payment_by_meta( '_pronamic_payment_source_id', $bookly_payment_id );
			
			if ( null === $payment ) {
				continue;
			}
			
			// Add note.
			$note = __( 'Payment status updated by Bookly.', 'knit-pay' );
			$payment->add_note( $note );
			
			$payment->set_status( PaymentStatus::EXPIRED );
			$payment->save();
		}
		
		return $payments;
	}
	
	/**
	 * @inheritdoc
	 */
	public static function handleRequestAction( $action ) {
		$active_payment_methods = Extension::get_active_payment_methods();
		foreach ( $active_payment_methods as $payment_method ) {
			if ( ! get_option( 'bookly_' . $payment_method . '_enabled' ) ) {
				continue;
			}
			
			if ( $action === $payment_method . '-checkout' ) {
				KnitPay\Controller::checkout( $payment_method );
				break;
			}
		}
	}
	
	/**
	 * @inheritDoc
	 */
	public static function showPaymentSpecificPrices( $show ) {
		$active_payment_methods = Extension::get_active_payment_methods();
		foreach ( $active_payment_methods as $payment_method ) {
			if ( $show ) {
				return $show;
			}
			
			if ( ! get_option( 'bookly_' . $payment_method . '_enabled' ) ) {
				continue;
			}
			
			$show = (float) get_option( 'bookly_' . $payment_method . '_increase' ) != 0 || (float) get_option( 'bookly_' . $payment_method . '_addition' ) != 0;
		}
		
		return $show;
	}
}
