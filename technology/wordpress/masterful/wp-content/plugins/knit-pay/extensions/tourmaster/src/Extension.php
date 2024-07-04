<?php

namespace KnitPay\Extensions\TourMaster;

use Pronamic\WordPress\Pay\AbstractPluginIntegration;
use Pronamic\WordPress\Pay\Payments\PaymentStatus as Core_Statuses;
use Pronamic\WordPress\Pay\Payments\Payment;
use Pronamic\WordPress\Pay\Core\PaymentMethods;

/**
 * Title: Tour Master extension
 * Description:
 * Copyright: 2020-2022 Knit Pay
 * Company: Knit Pay
 *
 * @author  knitpay
 * @since   2.1.0
 */
class Extension extends AbstractPluginIntegration {
	/**
	 * Slug
	 *
	 * @var string
	 */
	const SLUG = 'tourmaster';

	/**
	 * Constructs and initialize Tour Master extension.
	 */
	public function __construct() {
		parent::__construct(
			[
				'name' => __( 'Tour Master', 'pronamic_ideal' ),
			]
		);

		// Dependencies.
		$dependencies = $this->get_dependencies();

		$dependencies->add( new TourMasterDependency() );
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
		add_action( 'pronamic_payment_status_update_' . self::SLUG, [ $this, 'status_update' ], 10 );

		require_once 'Helper.php';
		require_once 'Gateway.php';

		Gateway::instance( 'knit_pay', 'Default', null );
		$active_payment_methods = PaymentMethods::get_active_payment_methods();
		foreach ( $active_payment_methods as $payment_method ) {
			Gateway::instance( 'knit-pay-' . $payment_method, PaymentMethods::get_name( $payment_method, ucwords( $payment_method ) ), $payment_method );
		}

		add_filter( 'tourmaster_additional_payment_method', [ $this, 'tourmaster_additional_payment_method' ] );

		$this->enable_credit_card_payment_method();
	}

	public function tourmaster_additional_payment_method( $ret ) {
		$tourmaster_payment_option = tourmaster_get_option( 'payment' );

		if ( empty( $tourmaster_payment_option ) ) {
			return $ret;
		}

		$tourmaster_payment_option['payment-method'] = array_diff( $tourmaster_payment_option['payment-method'], [ 'booking' ] );
		if ( 2 < count( $tourmaster_payment_option['payment-method'] ) || ! empty( $tourmaster_payment_option['accepted-credit-card-type'] ) ) {
			$ret .= '<script type="text/javascript">';
			$ret .= '(function($){';
			$ret .= '$(".tourmaster-payment-method-wrap ").addClass("tourmaster-both-online-payment")';
			$ret .= '})(jQuery);';
			$ret .= '</script>';
		}

		return $ret;
	}

	// There is bug in tour master that it don't show any other payment method on front store if credit card option is not enabled.
	// Hence enabling credit card option if not already enabled and hiding it on front store.
	// TODO: remove it and implement it using tourmaster_custom_payment_enable filter, new tourmaster version has this filter.
	private function enable_credit_card_payment_method() {
		$tourmaster_payment_option = tourmaster_get_option( 'payment' );
		if ( empty( $tourmaster_payment_option ) ) {
			return;
		}
		if ( ! in_array( 'credit-card', $tourmaster_payment_option['payment-method'], true ) ) {
			$tourmaster_payment_option['payment-method'][]          = 'credit-card';
			$tourmaster_payment_option['accepted-credit-card-type'] = [];
			update_option( 'tourmaster_payment', $tourmaster_payment_option );
		}
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
		$tid = $payment->get_source_id();

		switch ( $payment->get_status() ) {
			case Core_Statuses::CANCELLED:
			case Core_Statuses::EXPIRED:
			case Core_Statuses::FAILURE:
				$url = add_query_arg( [], tourmaster_get_template_url( 'payment' ) );

				break;

			case Core_Statuses::SUCCESS:
				$url = add_query_arg(
					[
						'tid'            => $tid,
						'step'           => 4,
						'payment_method' => $payment->get_payment_method(),
					],
					tourmaster_get_template_url( 'payment' )
				);
				break;

			case Core_Statuses::RESERVED:
			case Core_Statuses::OPEN:
			default:
				$url = home_url( '/' );
		}

		return $url;
	}

	/**
	 * Update the status of the specified payment
	 *
	 * @param Payment $payment Payment.
	 */
	public static function status_update( Payment $payment ) {

		switch ( $payment->get_status() ) {
			case Core_Statuses::CANCELLED:
			case Core_Statuses::EXPIRED:
			case Core_Statuses::FAILURE:
				self::payment_fail_action( $payment );
				break;
			case Core_Statuses::SUCCESS:
				self::payment_success_action( $payment );

				break;
			case Core_Statuses::OPEN:
			default:
				break;
		}
	}

	private static function payment_fail_action( $payment ) {
		$tid                             = $payment->get_source_id();
		$payment_info['payment_method']  = $payment->get_payment_method();
		$payment_info['submission_date'] = current_time( 'mysql' );
		$payment_info['error']           = 'Payment ' . $payment->get_status();

		$payment_info['transaction_id'] = $payment->get_transaction_id();

		tourmaster_update_booking_data(
			[
				'payment_info' => wp_json_encode( $payment_info ),
			],
			[
				'id'           => $tid,
				'payment_date' => '0000-00-00 00:00:00',
			],
			[ '%s' ],
			[ '%d', '%s' ]
		);
	}

	private static function payment_success_action( Payment $payment ) {
		$tid                             = $payment->get_source_id();
		$payment_info['payment_method']  = $payment->get_payment_method();
		$payment_info['submission_date'] = current_time( 'mysql' );

		$payment_info['transaction_id'] = $payment->get_transaction_id();
		$payment_info['amount']         = $payment->get_total_amount()->get_value();
		$payment_info['payment_status'] = $payment->get_status();

		$result       = tourmaster_get_booking_data( [ 'id' => $tid ], [ 'single' => true ] );
		$pricing_info = json_decode( $result->pricing_info, true );

		$mail_type       = 'payment-made-mail';
		$admin_mail_type = 'admin-online-payment-made-mail';

		if ( ! empty( $pricing_info['deposit-price'] ) && tourmaster_compare_price( $pricing_info['deposit-price'], $payment_info['amount'] ) ) {
			$order_status = 'deposit-paid';
			if ( ! empty( $pricing_info['deposit-price-raw'] ) ) {
				$payment_info['deposit_amount'] = $pricing_info['deposit-price-raw'];
			}
			$mail_type       = 'deposit-payment-made-mail';
			$admin_mail_type = 'admin-deposit-payment-made-mail';
		} elseif ( tourmaster_compare_price( $pricing_info['pay-amount'], $payment_info['amount'] ) ) {
			$order_status = 'online-paid';
			if ( ! empty( $pricing_info['pay-amount-raw'] ) ) {
				$payment_info['pay_amount'] = $pricing_info['pay-amount-raw'];
			}
		} elseif ( $payment_info['amount'] > $pricing_info['total-price'] ) {
			$order_status = 'online-paid';
		} else {
			$order_status    = 'deposit-paid';
			$mail_type       = 'deposit-payment-made-mail';
			$admin_mail_type = 'admin-deposit-payment-made-mail';
		}

		// get old payment info.
		$payment_infos   = json_decode( $result->payment_info, true );
		$payment_infos   = tourmaster_payment_info_format( $payment_infos, $result->order_status );
		$payment_infos[] = $payment_info;

		tourmaster_update_booking_data(
			[
				'payment_info' => wp_json_encode( $payment_infos ),
				'payment_date' => current_time( 'mysql' ),
				'order_status' => $order_status,
			],
			[ 'id' => $tid ],
			[ '%s', '%s', '%s', '%s', '%s' ],
			[ '%d' ]
		);

		tourmaster_mail_notification(
			$mail_type,
			$tid,
			'',
			[
				'custom' => [
					'payment-method'    => $payment_info['payment_method'],
					'payment-date'      => tourmaster_time_format( $payment_info['submission_date'] ) . ' ' . tourmaster_date_format( $payment_info['submission_date'] ),
					'submission-date'   => tourmaster_time_format( $payment_info['submission_date'] ) . ' ' . tourmaster_date_format( $payment_info['submission_date'] ),
					'submission-amount' => tourmaster_money_format( $payment_info['amount'] ),
					'transaction-id'    => $payment_info['transaction_id'],
				],
			]
		);
		tourmaster_mail_notification(
			$admin_mail_type,
			$tid,
			'',
			[
				'custom' => [
					'payment-method'    => $payment_info['payment_method'],
					'payment-date'      => tourmaster_time_format( $payment_info['submission_date'] ) . ' ' . tourmaster_date_format( $payment_info['submission_date'] ),
					'submission-date'   => tourmaster_time_format( $payment_info['submission_date'] ) . ' ' . tourmaster_date_format( $payment_info['submission_date'] ),
					'submission-amount' => tourmaster_money_format( $payment_info['amount'] ),
					'transaction-id'    => $payment_info['transaction_id'],
				],
			]
		);
		tourmaster_send_email_invoice( $tid );
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
		$text = __( 'Tour Master', 'pronamic_ideal' ) . '<br />';

		$text .= sprintf(
			'<a href="%s">%s</a>',
			$this->source_url( '', $payment ),
			/* translators: %s: source id */
			sprintf( __( 'Order %s', 'pronamic_ideal' ), $payment->source_id )
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
		return __( 'Tour Master Order', 'knit-pay' );
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
		return add_query_arg(
			[
				'single' => $payment->source_id,
				'page'   => 'tourmaster_order',
			],
			remove_query_arg( [ 'order_id', 'from_date', 'to_date', 'action', 'id', 'export', 'post_type', 'post' ] )
		);
	}

}
