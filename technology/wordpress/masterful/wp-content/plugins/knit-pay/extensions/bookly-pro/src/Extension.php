<?php

namespace KnitPay\Extensions\BooklyPro;

use Pronamic\WordPress\Pay\AbstractPluginIntegration;
use Pronamic\WordPress\Pay\Payments\PaymentStatus as Core_Statuses;
use Pronamic\WordPress\Pay\Core\Util;
use Pronamic\WordPress\Pay\Payments\Payment;
use Bookly\Lib as BooklyLib;
use Bookly\Lib\Config as BooklyConfig;
use Pronamic\WordPress\Pay\Core\PaymentMethods;

/**
 * Title: Bookly Pro extension
 * Description:
 * Copyright: 2020-2022 Knit Pay
 * Company: Knit Pay
 *
 * @author  knitpay
 * @since   3.4
 */
class Extension extends AbstractPluginIntegration {
	/**
	 * Slug
	 *
	 * @var string
	 */
	const SLUG = 'bookly-pro';

	/**
	 * Constructs and initialize Bookly Pro extension.
	 */
	public function __construct() {
		parent::__construct(
			[
				'name' => __( 'Bookly Pro', 'knit-pay' ),
			]
		);

		// Dependencies.
		$dependencies = $this->get_dependencies();

		$dependencies->add( new BooklyProDependency() );
	}

	/**
	 * Setup plugin integration.
	 *
	 * @return void
	 */
	public function setup() {
		add_filter( 'pronamic_payment_source_text_' . self::SLUG, [ $this, 'source_text' ], 10, 2 );
		add_filter( 'pronamic_payment_source_description_' . self::SLUG, [ $this, 'source_description' ], 10, 2 );
		add_filter( 'pronamic_payment_source_url_' . self::SLUG, [ $this, 'source_url' ], 10, 2 );

		// Check if dependencies are met and integration is active.
		if ( ! $this->is_active() ) {
			return;
		}

		add_filter( 'pronamic_payment_redirect_url_' . self::SLUG, [ $this, 'redirect_url' ], 10, 2 );
		
		add_action( 'plugins_loaded', [ $this, 'init_gateway' ] );
		
		// FIXME check if webhook is possible or not. Refer /bookly-addon-stripe/frontend/modules/stripe/Ajax.php
		
		// TODO check the solution for paymentStepDisabled() function;
		// Bookly don't allow to accept payment if official payment gateway addons are not enabled.
		// This is a workaround to make change in Bookly code so that Thirdparty payment gateway become supported.
		if ( class_exists( '\Bookly\Lib\Config' ) && BooklyConfig::paymentStepDisabled() ) {
			$edited_code      = 'return false;';
			$reflector        = new \ReflectionClass( '\Bookly\Lib\Config' );
			$config_file_path = $reflector->getFileName();
			$filecontent      = file_get_contents( $config_file_path );
			$pos              = strpos( $filecontent, 'return ! ( self::payLocallyEnabled()' );
			$filecontent      = substr( $filecontent, 0, $pos ) . $edited_code . "\r\n\t\t" . substr( $filecontent, $pos );
			file_put_contents( $config_file_path, $filecontent );
		}
	}

	/**
	 * Initialize Gateway
	 */
	public static function init_gateway() {
		require_once 'gateway/autoload.php';
		\BooklyKnitPay\Lib\Plugin::init();
	}

	/**
	 * Payment redirect URL filter.
	 *
	 * @param string  $url     Redirect URL.
	 * @param Payment $payment Payment.
	 *
	 * @return string
	 */
	public static function redirect_url( $url, $payment ) {
		// Bookly don't support updating payment and booking status via webhook.
		// So, updating status while redirection.
		self::update_bookly_payment_and_booking_status( $payment );
		
		if ( Core_Statuses::ON_HOLD === $payment->get_status() ) {
			return $url;
		}

		$remove_parameters = [ 'bookly_action', 'bookly_fid', 'error_msg' ];

		$booking_form_url = $payment->get_meta( 'booking_form_url' );

		if ( ! $booking_form_url ) {
			return $url;
		}

		return remove_query_arg( $remove_parameters, $booking_form_url );
	}

	/**
	 * Update the status of the specified payment
	 *
	 * @param Payment $payment Payment.
	 */
	public static function update_bookly_payment_and_booking_status( Payment $payment ) {
		$bookly_payment_id = (int) $payment->get_source_id();
		$bookly_form_id    = $payment->get_meta( 'bookly_form_id' );

		$user_data      = new BooklyLib\UserBookingData( $bookly_form_id );
		$bookly_payment = new BooklyLib\Entities\Payment();

		if ( ! $bookly_form_id ) {
			return;
		}

		if ( ! $user_data->load() || ! $bookly_payment->load( $bookly_payment_id ) ) {
			return;
		}

		switch ( $payment->get_status() ) {
			case Core_Statuses::CANCELLED:
			case Core_Statuses::EXPIRED:
			case Core_Statuses::FAILURE:
				$user_data->setPaymentStatus( $payment->get_payment_method(), 'cancelled' );
				foreach ( BooklyLib\Entities\CustomerAppointment::query()->where( 'payment_id', $user_data->getPaymentId() )->find() as $ca ) {
					BooklyLib\Utils\Log::deleteEntity( $ca, __METHOD__ );
					$ca->deleteCascade();
				}

				$bookly_payment->delete();

				break;
			case Core_Statuses::SUCCESS:
				$bookly_payment->setStatus( BooklyLib\Entities\Payment::STATUS_COMPLETED )->save();

				if ( $order = BooklyLib\DataHolders\Booking\Order::createFromPayment( $bookly_payment ) ) {
					BooklyLib\Notifications\Cart\Sender::send( $order );
				}
				foreach (
					BooklyLib\Entities\Appointment::query( 'a' )
					->leftJoin( 'CustomerAppointment', 'ca', 'a.id = ca.appointment_id' )
					->where( 'ca.payment_id', $bookly_payment->getId() )->find() as $appointment
					) {
						BooklyLib\Proxy\Pro::syncGoogleCalendarEvent( $appointment );
						BooklyLib\Proxy\OutlookCalendar::syncEvent( $appointment );
				}

				$user_data->setPaymentStatus( $payment->get_payment_method(), 'success' );

				break;
			case Core_Statuses::OPEN:
			default:
				$user_data->setPaymentStatus( $payment->get_payment_method(), BooklyLib\Entities\Payment::STATUS_PENDING );

				break;
		}
		$user_data->sessionSave();
	}

	/**
	 * Source column
	 *
	 * @param string  $text    Source text.
	 * @param Payment $payment Payment.
	 *
	 * @return string $text
	 */
	public function source_text( $text, Payment $payment ) {
		$text = __( 'Bookly', 'pronamic_ideal' ) . '<br />';

		$text .= sprintf(
			'<a href="%s">%s</a>',
			add_query_arg( 'page', 'bookly-payments', admin_url( 'admin.php' ) ),
			/* translators: %s: source id */
			sprintf( __( 'Payment %s', 'pronamic_ideal' ), $payment->source_id )
		);

		return $text;
	}

	/**
	 * Source description.
	 *
	 * @param string  $description Description.
	 * @param Payment $payment     Payment.
	 *
	 * @return string
	 */
	public function source_description( $description, Payment $payment ) {
		return __( 'Bookly Payment', 'pronamic_ideal' );
	}

	/**
	 * Source URL.
	 *
	 * @param string  $url     URL.
	 * @param Payment $payment Payment.
	 *
	 * @return string
	 */
	public function source_url( $url, Payment $payment ) {
		return add_query_arg( 'page', 'bookly-payments', admin_url( 'admin.php' ) );
	}
	
	public static function get_active_payment_methods() {
		$payment_methods        = PaymentMethods::get_active_payment_methods();
		$active_payment_methods = [ 'knit_pay' => 'knit_pay' ];
		
		foreach ( $payment_methods as $payment_method ) {
			$active_payment_methods[ $payment_method ] = 'knit_pay_' . $payment_method;
		}
		
		return $active_payment_methods;
	}

}
