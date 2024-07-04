<?php

namespace KnitPay\Extensions\SproutInvoices;

use Pronamic\WordPress\Pay\AbstractPluginIntegration;
use Pronamic\WordPress\Pay\Payments\Payment;
use Pronamic\WordPress\Pay\Payments\PaymentStatus as Core_Statuses;
use SI_Payment;

/**
 * Title: Sprout Invoices extension
 * Description:
 * Copyright: 2020-2022 Knit Pay
 * Company: Knit Pay
 *
 * @author  knitpay
 * @since   5.8.0
 */
class Extension extends AbstractPluginIntegration {
	/**
	 * Slug
	 *
	 * @var string
	 */
	const SLUG = 'sprout-invoices';

	/**
	 * Constructs and initialize Sprout Invoices extension.
	 */
	public function __construct() {
		parent::__construct(
			[
				'name' => __( 'Sprout Invoices', 'pronamic_ideal' ),
			]
		);

		// Dependencies.
		$dependencies = $this->get_dependencies();

		$dependencies->add( new SproutInvoicesDependency() );
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

		add_action( 'si_payment_processors_loaded', [ $this, 'init_gateway' ] );
	}



	/**
	 * Initialize Gateway
	 */
	public static function init_gateway() {
		require_once 'KnitPaySIGateway.php';
		\KnitPaySIGateway::register();
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
		$invoice_id = (int) $payment->get_source_id();

		return get_permalink( $invoice_id );
	}

	/**
	 * Update the status of the specified payment
	 *
	 * @param Payment $payment Payment.
	 */
	public static function status_update( Payment $payment ) {
		$si_payment_id = (int) $payment->get_meta( 'si_payment_id' );
		$si_payment    = SI_Payment::get_instance( $si_payment_id );

		if ( ! is_a( $si_payment, 'SI_Payment' ) ) {
			return;
		}

		$si_payment->set_transaction_id( $payment->get_transaction_id() );

		$si_payment_data                            = $si_payment->get_data();
		$si_payment_data['knit_pay_transaction_id'] = $payment->get_transaction_id();
		$si_payment->set_data( $si_payment_data );

		switch ( $payment->get_status() ) {
			case Core_Statuses::CANCELLED:
			case Core_Statuses::EXPIRED:
			case Core_Statuses::FAILURE:
				$si_payment->set_status( SI_Payment::STATUS_CANCELLED );

				break;
			case Core_Statuses::SUCCESS:
				$si_payment->set_status( SI_Payment::STATUS_COMPLETE );

				break;
			case Core_Statuses::OPEN:
			default:
				$si_payment->set_status( SI_Payment::STATUS_PENDING );

				break;
		}
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
		$text = __( 'Sprout Invoice', 'pronamic_ideal' ) . '<br />';

		$text .= sprintf(
			'<a href="%s">%s</a>',
			get_edit_post_link( $payment->source_id ),
			/* translators: %s: source id */
			sprintf( __( 'ID %s', 'pronamic_ideal' ), $payment->source_id )
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
		return __( 'Sprout Invoice ID', 'pronamic_ideal' );
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
		return get_edit_post_link( $payment->source_id );
	}

}
