<?php

namespace KnitPay\Gateways\CCAvenue;

use Pronamic\WordPress\Pay\AbstractGatewayIntegration;
use Pronamic\WordPress\Pay\Core\IntegrationModeTrait;
use Pronamic\WordPress\Pay\Payments\Payment;
use Pronamic\WordPress\Pay\Plugin;

/**
 * Title: CCAvenue Integration
 * Copyright: 2020-2022 Knit Pay
 *
 * @author  Knit Pay
 * @version 1.0.0
 * @since   2.3.0
 */
class Integration extends AbstractGatewayIntegration {
	use IntegrationModeTrait;
	
	/**
	 * Construct CCAvenue integration.
	 *
	 * @param array $args Arguments.
	 */
	public function __construct( $args = [] ) {
		$args = wp_parse_args(
			$args,
			[
				'id'          => 'ccavenue',
				'name'        => 'CCAvenue',
				'url'         => 'http://go.thearrangers.xyz/ccavenue?utm_source=knit-pay&utm_medium=ecommerce-module&utm_campaign=module-admin&utm_content=',
				'product_url' => 'http://go.thearrangers.xyz/ccavenue?utm_source=knit-pay&utm_medium=ecommerce-module&utm_campaign=module-admin&utm_content=product-url',
				'provider'    => 'ccavenue',
			]
		);

		parent::__construct( $args );
	}

	/**
	 * Setup.
	 */
	public function setup() {
		// Display ID on Configurations page.
		\add_filter(
			'pronamic_gateway_configuration_display_value_' . $this->get_id(),
			[ $this, 'gateway_configuration_display_value' ],
			10,
			2
		);

		// handle_returns.
		$function = [ __NAMESPACE__ . '\Integration', 'handle_returns' ];
		if ( ! has_action( 'wp_loaded', $function ) ) {
			add_action( 'wp_loaded', $function );
		}
	}

	/**
	 * Gateway configuration display value.
	 *
	 * @param string $display_value Display value.
	 * @param int    $post_id       Gateway configuration post ID.
	 * @return string
	 */
	public function gateway_configuration_display_value( $display_value, $post_id ) {
		$config = $this->get_config( $post_id );

		return $config->merchant_id;
	}

	/**
	 * Get settings fields.
	 *
	 * @return array
	 */
	public function get_settings_fields() {
		$fields = [];

		if ( ! defined( 'KNIT_PAY_CCAVENUE' ) ) {
			$fields[] = [
				'section' => 'general',
				'type'    => 'html',
				'html'    => sprintf(
					/* translators: 1: CCAvenue */
					__( 'Knit Pay supports %1$s with a Premium Addon. But you can get this premium addon for free. Contact us to know more.%2$s', 'knit-pay' ),
					__( 'CCAvenue', 'knit-pay' ),
					'<br><br><a class="button button-primary" target="_blank" href="' . $this->get_url() . 'know-more"
                     role="button"><strong>Click Here to Know More</strong></a>'
				),
			];
			return $fields;
		}
		
		// Get mode from Integration mode trait.
		$fields[] = $this->get_mode_settings_fields();

		// Merchant ID
		$fields[] = [
			'section'  => 'general',
			'filter'   => FILTER_SANITIZE_STRING,
			'meta_key' => '_pronamic_gateway_ccavenue_merchant_id',
			'title'    => __( 'Merchant ID', 'knit-pay' ),
			'type'     => 'text',
			'classes'  => [ 'regular-text', 'code' ],
			'tooltip'  => __( 'This is the identifier for your CCAvenue merchant Account.', 'knit-pay' ),
		];

		// Access Code
		$fields[] = [
			'section'  => 'general',
			'filter'   => FILTER_SANITIZE_STRING,
			'meta_key' => '_pronamic_gateway_ccavenue_access_code',
			'title'    => __( 'Access Code', 'knit-pay' ),
			'type'     => 'text',
			'classes'  => [ 'regular-text', 'code' ],
			'tooltip'  => __( 'This is the access code for your application.', 'knit-pay' ),
		];

		// Working Key
		$fields[] = [
			'section'  => 'general',
			'filter'   => FILTER_SANITIZE_STRING,
			'meta_key' => '_pronamic_gateway_ccavenue_working_key',
			'title'    => __( 'Working Key', 'knit-pay' ),
			'type'     => 'text',
			'classes'  => [ 'regular-text', 'code' ],
			'tooltip'  => __( 'Ensure you are using the correct key while encrypting requests from different URLs registered with CCAvenue.', 'knit-pay' ),
		];

		// Return fields.
		return $fields;
	}

	public function get_config( $post_id ) {
		$config = new Config();

		$config->merchant_id = $this->get_meta( $post_id, 'ccavenue_merchant_id' );
		$config->access_code = $this->get_meta( $post_id, 'ccavenue_access_code' );
		$config->working_key = $this->get_meta( $post_id, 'ccavenue_working_key' );
		$config->mode        = $this->get_meta( $post_id, 'mode' );

		return $config;
	}

	/**
	 * Get gateway.
	 *
	 * @param int $post_id Post ID.
	 * @return Gateway
	 */
	public function get_gateway( $config_id ) {
		$config  = $this->get_config( $config_id );
		$gateway = new Gateway( $config );
		
		$mode = Gateway::MODE_LIVE;
		if ( Gateway::MODE_TEST === $config->mode ) {
			$mode = Gateway::MODE_TEST;
		}
		
		$this->set_mode( $mode );
		$gateway->set_mode( $mode );
		$gateway->init( $config );
		
		return $gateway;
	}

	public static function handle_returns() {
		if ( ! filter_has_var( INPUT_GET, 'knitpay_ccavenue_payment_id' ) ) {
			return;
		}

		$payment_id = filter_input( INPUT_GET, 'knitpay_ccavenue_payment_id', FILTER_SANITIZE_NUMBER_INT );

		$payment = get_pronamic_payment( $payment_id );

		if ( null === $payment ) {
			return;
		}

		// Check if we should redirect.
		$should_redirect = true;

		/**
		 * Filter whether or not to allow redirects on payment return.
		 *
		 * @param bool    $should_redirect Flag to indicate if redirect is allowed on handling payment return.
		 * @param Payment $payment         Payment.
		 */
		$should_redirect = apply_filters( 'pronamic_pay_return_should_redirect', $should_redirect, $payment );

		try {
			Plugin::update_payment( $payment, $should_redirect );
		} catch ( \Exception $e ) {
			self::render_exception( $e );

			exit;
		}
	}
}
