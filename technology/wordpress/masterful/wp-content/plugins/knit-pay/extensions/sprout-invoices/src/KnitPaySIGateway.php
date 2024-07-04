<?php

use KnitPay\Extensions\SproutInvoices\Helper;
use Pronamic\WordPress\Money\Currency;
use Pronamic\WordPress\Money\Money;
use Pronamic\WordPress\Pay\Plugin;
use Pronamic\WordPress\Pay\Payments\Payment;

class KnitPaySIGateway extends SI_Offsite_Processors {
	const TITLE_OPTION               = 'si_knit_pay_title';
	const PAYMENT_DESCRIPTION_OPTION = 'si_knit_pay_payment_description';
	const CONFIGURATION_ID_OPTION    = 'si_knit_pay_config_id';

	const PAYMENT_METHOD = 'Knit Pay';
	const PAYMENT_SLUG   = 'knit_pay';

	protected static $instance;

	private static $title_setting;
	private static $payment_description_setting;
	private static $config_id_setting;

	public static function get_instance() {
		if ( ! ( isset( self::$instance ) && is_a( self::$instance, __CLASS__ ) ) ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	public function get_payment_method() {
		return self::PAYMENT_METHOD;
	}

	public function get_slug() {
		return self::PAYMENT_SLUG;
	}

	public static function register() {
		self::add_payment_processor( __CLASS__, __( 'Knit Pay', 'sprout-invoices' ) );
	}

	public static function public_name() {
		return __( 'Knit Pay', 'sprout-invoices' );
	}

	public static function checkout_options() {
		$option = [
			'icons' => '',
			'label' => self::$title_setting,
			'cc'    => [],
		];
		return $option;
	}

	protected function __construct() {
		parent::__construct();
		self::$title_setting               = get_option( self::TITLE_OPTION, 'Pay Online' );
		self::$payment_description_setting = get_option( self::PAYMENT_DESCRIPTION_OPTION, 'Invoice {invoice_id}' );
		self::$config_id_setting           = get_option( self::CONFIGURATION_ID_OPTION, get_option( 'pronamic_pay_config_id' ) );

		add_action( 'si_checkout_action_' . SI_Checkouts::PAYMENT_PAGE, [ $this, 'send_offsite' ], 0, 1 );
	}

	/**
	 * Hooked on init add the settings page and options.
	 */
	public static function register_settings( $settings = [] ) {
		// Settings
		$settings['payments'] = [
			'si_knit_pay_settings' => [
				'title'    => __( 'Knit Pay', 'sprout-invoices' ),
				'weight'   => 200,
				'settings' => [
					self::TITLE_OPTION               => [
						'label'  => __( 'Title', 'knit-pay-lang' ),
						'option' => [
							'type'    => 'text',
							'default' => self::$title_setting,
						],
					],
					self::CONFIGURATION_ID_OPTION    => [
						'label'  => __( 'Configuration', 'sprout-invoices' ),
						'option' => [
							'type'        => 'select',
							'options'     => Plugin::get_config_select_options( self::PAYMENT_SLUG ),
							'default'     => self::$config_id_setting,
							'description' => 'Configurations can be created in Knit Pay gateway configurations page at <strong>"Knit Pay >> Configurations"</strong>.',
						],
					],
					self::PAYMENT_DESCRIPTION_OPTION => [
						'label'  => __( 'Payment Description', 'knit-pay-lang' ),
						'option' => [
							'type'        => 'text',
							'default'     => self::$payment_description_setting,
							'description' => sprintf( __( 'Available tags: %s', 'knit-pay' ), sprintf( '<code>%s %s</code>', '{invoice_id}', '{invoice_name}' ) ),
						],
					],
				],
			],
		];

			return $settings;
	}

	/**
	 * Instead of redirecting to the SIcheckout page,
	 * redirect to payment gateway.
	 *
	 * @param SI_Checkouts $checkout
	 * @return void
	 */
	public function send_offsite( SI_Checkouts $checkout ) {

		// Check to see if the payment processor being used is for this payment processor
		if ( ! is_a( $checkout->get_processor(), __CLASS__ ) ) { // FUTURE have parent class handle this smarter'r
			return;
		}

		// No form to validate
		remove_action( 'si_checkout_action_' . SI_Checkouts::PAYMENT_PAGE, [ $checkout, 'process_payment_page' ] );

		$config_id      = self::$config_id_setting;
		$payment_method = 'knit_pay';

		// Use default gateway if no configuration has been set.
		if ( empty( $config_id ) ) {
			$config_id = get_option( 'pronamic_pay_config_id' );
		}

		$gateway = Plugin::get_gateway( $config_id );

		if ( ! $gateway ) {
			return;
		}

		$gateway->set_payment_method( $payment_method );

		$invoice        = $checkout->get_invoice();
		$payment_amount = ( si_has_invoice_deposit( $invoice->get_id() ) ) ? $invoice->get_deposit() : $invoice->get_balance();

		/**
		 * Build payment.
		 */
		$payment = new Payment();

		$payment->source    = 'sprout-invoices';
		$payment->source_id = $invoice->get_id();
		$payment->order_id  = $invoice->get_id();

		$payment->set_description( Helper::get_description( $invoice, self::$payment_description_setting ) );

		$payment->title = Helper::get_title( $invoice );

		// Customer.
		$payment->set_customer( Helper::get_customer( $invoice ) );

		// Address.
		$payment->set_billing_address( Helper::get_address( $invoice ) );

		// Currency.
		$currency = Currency::get_instance( self::get_currency_code( $invoice->get_id() ) );

		// Amount.
		$payment->set_total_amount( new Money( $payment_amount, $currency ) );

		// Method.
		$payment->set_payment_method( $payment_method );

		// Configuration.
		$payment->config_id = $config_id;

		try {
			$payment = Plugin::start_payment( $payment );

			// create new payment
			$si_payment_id = SI_Payment::new_payment(
				[
					'payment_method' => self::get_payment_method(),
					'invoice'        => $invoice->get_id(),
					'amount'         => $payment_amount,
					'data'           => [
						'knit_pay_payment_id'     => $payment->get_id(),
						'knit_pay_transaction_id' => $payment->get_transaction_id(),
					],
				],
				SI_Payment::STATUS_PENDING
			);

			$payment->set_meta( 'si_payment_id', $si_payment_id );
			$payment->save();

			// Execute a redirect.
			wp_redirect( $payment->get_pay_redirect_url() );
			exit();
		} catch ( \Exception $e ) {
			self::set_message( $e->getMessage(), self::MESSAGE_STATUS_ERROR );
		}
	}

	/**
	 * Process a payment
	 *
	 * @param SI_Checkouts $checkout
	 * @param SI_Invoice   $invoice
	 * @return SI_Payment|bool false if the payment failed, otherwise a Payment object
	 */
	public function process_payment( SI_Checkouts $checkout, SI_Invoice $invoice ) {
		return false;
	}

	//
	// Utility //
	//

	private function get_currency_code( $invoice_id ) {
		$invoice          = SI_Invoice::get_instance( $invoice_id );
		$invoice_currency = $invoice->get_currency();

		return apply_filters( 'si_currency_code', $invoice_currency, $invoice_id, self::PAYMENT_METHOD );
	}
}
