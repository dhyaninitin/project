<?php
namespace KnitPay\Gateways\PayUmoney;

use Pronamic\WordPress\Pay\AbstractGatewayIntegration;
use Pronamic\WordPress\Pay\Plugin;
use Pronamic\WordPress\Pay\Core\IntegrationModeTrait;
use Pronamic\WordPress\Pay\Payments\Payment;
use Exception;

/**
 * Title: PayUMoney Integration
 * Copyright: 2020-2022 Knit Pay
 *
 * @author Knit Pay
 * @version 1.9.1
 * @since 1.0.0
 */
class Integration extends AbstractGatewayIntegration {
	use IntegrationModeTrait;

	/**
	 * Construct PayUmoney integration.
	 *
	 * @param array $args
	 *            Arguments.
	 */
	public function __construct( $args = [] ) {
		$args = wp_parse_args(
			$args,
			[
				'id'            => 'payumoney',
				'name'          => 'PayUMoney',
				'url'           => 'http://go.thearrangers.xyz/payu?utm_source=knit-pay&utm_medium=ecommerce-module&utm_campaign=module-admin&utm_content=',
				'product_url'   => 'http://go.thearrangers.xyz/payu?utm_source=knit-pay&utm_medium=ecommerce-module&utm_campaign=module-admin&utm_content=product-url',
				'dashboard_url' => 'http://go.thearrangers.xyz/payu?utm_source=knit-pay&utm_medium=ecommerce-module&utm_campaign=module-admin&utm_content=dashboard-url',
				'provider'      => 'payumoney',
				'supports'      => [
					'webhook',
					'webhook_log',
					'webhook_no_config',
				],
				// 'manual_url' => \__( 'http://go.thearrangers.xyz/payu', 'pronamic_ideal' ),
			]
		);

		parent::__construct( $args );

		// Actions
		$function = [ __NAMESPACE__ . '\Listener', 'listen' ];

		if ( ! has_action( 'wp_loaded', $function ) ) {
			add_action( 'wp_loaded', $function );
		}
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

		if ( empty( $config->mid ) ) {
			return $config->merchant_key;
		}
		return __( 'Merchant ID: ', 'knit-pay-lang' ) . $config->mid;
	}

	/**
	 * Get settings fields.
	 *
	 * @return array
	 */
	public function get_settings_fields() {
		$fields         = [];
		$checkout_modes = [
			[
				'options' => [
					Client::CHECKOUT_REDIRECT_MODE => 'Redirect (With Redirection Page)',
					Client::CHECKOUT_BOLT_MODE     => 'Bolt (Unstable Beta Version)',
					// Client::CHECKOUT_URL_MODE => "Redirect (Without Redirection Page)"
				],
			],
		];

		// Intro.
		$fields[] = [
			'section' => 'general',
			'type'    => 'html',
			'html'    => sprintf(
				/* translators: 1: PayUmoney */
				__( 'Account details are provided by %1$s after registration. These settings need to match with the %1$s dashboard.', 'pronamic_ideal' ),
				__( 'PayUMoney', 'pronamic_ideal' )
			),
		];

		// Warning.
		$fields[] = [
			'section' => 'general',
			'type'    => 'html',
			'html'    => '<h1><strong>Note:</strong> If the dashboard URL of your PayU account starts with payu.in instead of payumoney.com, please select PayU India in the Payment Provider above.</h1>',
		];
		
		// Get mode from Integration mode trait.
		$fields[] = $this->get_mode_settings_fields();

		// Merchant ID
		$fields[] = [
			'section'     => 'general',
			'filter'      => FILTER_SANITIZE_STRING,
			'meta_key'    => '_pronamic_gateway_payumoney_mid',
			'title'       => __( 'Merchant ID', 'knit-pay' ),
			'type'        => 'text',
			'classes'     => [
				'regular-text',
				'code',
			],
			'description' => 'Merchant ID is available at the top of the <a target="_blank" href="https://onboarding.payu.in/app/onboarding">Profile Page</a>.',
		];

		// Merchant Key
		$fields[] = [
			'section'  => 'general',
			'filter'   => FILTER_SANITIZE_STRING,
			'meta_key' => '_pronamic_gateway_payumoney_merchant_key',
			'title'    => __( 'Merchant Key', 'knit-pay' ),
			'type'     => 'text',
			'classes'  => [
				'regular-text',
				'code',
			],
			'tooltip'  => __( 'Merchant Key as mentioned in the PayUmoney dashboard at the "Integration" page.', 'knit-pay' ),
		];

		// Merchant Salt
		$fields[] = [
			'section'  => 'general',
			'filter'   => FILTER_SANITIZE_STRING,
			'meta_key' => '_pronamic_gateway_payumoney_merchant_salt',
			'title'    => __( 'Merchant Salt', 'knit-pay' ),
			'type'     => 'text',
			'classes'  => [
				'regular-text',
				'code',
			],
			'tooltip'  => __( 'Merchant Salt as mentioned in the PayUmoney dashboard at the "Integration" page.', 'knit-pay' ),
		];

		// Webhook URL.
		$fields[] = [
			'section'  => 'feedback',
			'title'    => \__( 'Successful Payment Webhook URL', 'knit-pay' ),
			'type'     => 'text',
			'classes'  => [ 'regular-text', 'code' ],
			'value'    => \home_url( '/' ),
			'readonly' => true,
			'tooltip'  => sprintf(
				/* translators: %s: PayUmoney */
				__(
					'Copy the Webhook URL to the %s dashboard to receive automatic transaction status updates.',
					'knit-pay'
				),
				__( 'PayUmoney', 'knit-pay' )
			),
		];

		$fields[] = [
			'section'  => 'feedback',
			'title'    => \__( 'Failure Payment Webhook URL', 'knit-pay' ),
			'type'     => 'text',
			'classes'  => [ 'regular-text', 'code' ],
			'value'    => \home_url( '/' ),
			'readonly' => true,
			'tooltip'  => sprintf(
				/* translators: %s: PayUmoney */
				__(
					'Copy the Webhook URL to the %s dashboard to receive automatic transaction status updates.',
					'knit-pay'
				),
				__( 'PayUmoney', 'knit-pay' )
			),
		];

		$fields[] = [
			'section'  => 'feedback',
			'title'    => \__( 'Authorization Header Key', 'knit-pay' ),
			'type'     => 'text',
			'classes'  => [ 'regular-text', 'code' ],
			'value'    => 'payumoney-webhook',
			'readonly' => true,
			'tooltip'  => sprintf(
				/* translators: %s: PayUmoney */
				__(
					'While creating webhook in %s dashboard use this as "Authorization Header Key"',
					'knit-pay'
				),
				__( 'PayUmoney', 'knit-pay' )
			),
		];

		$fields[] = [
			'section'  => 'feedback',
			'filter'   => FILTER_SANITIZE_STRING,
			'meta_key' => '_pronamic_gateway_payumoney_authorization_header_value',
			'title'    => \__( 'Authorization Header Value', 'knit-pay' ),
			'type'     => 'text',
			'classes'  => [ 'regular-text', 'code' ],
			'tooltip'  => sprintf(
				/* translators: %s: PayUmoney */
				__(
					'While creating webhook in %1$s dashboard use this as "Authorization Header Value". This should be same as in %1$s. It can be any random string.',
					'knit-pay'
				),
				__( 'PayUmoney', 'knit-pay' )
			),
		];

		// Return fields.
		return $fields;
	}

	public function get_config( $post_id ) {
		$config = new Config();

		$config->mid           = $this->get_meta( $post_id, 'payumoney_mid' );
		$config->merchant_key  = $this->get_meta( $post_id, 'payumoney_merchant_key' );
		$config->merchant_salt = $this->get_meta( $post_id, 'payumoney_merchant_salt' );
		// $config->auth_header                = $this->get_meta( $post_id, 'payumoney_auth_header' );
		// PayU no more supports Bolt Mode.
		// $config->checkout_mode              = $this->get_meta( $post_id, 'payumoney_checkout_mode' );
		$config->authorization_header_value = $this->get_meta( $post_id, 'payumoney_authorization_header_value' );
		if ( empty( $config->checkout_mode ) ) {
			$config->checkout_mode = Client::CHECKOUT_REDIRECT_MODE;
		}

		$config->mode = $this->get_meta( $post_id, 'mode' );

		return $config;
	}

	/**
	 * Get gateway.
	 *
	 * @param int $post_id
	 *            Post ID.
	 * @return Gateway
	 */
	public function get_gateway( $config_id ) {
		$config  = $this->get_config( $config_id );
		$gateway = new Gateway( $config, $config_id );
		
		$mode = Gateway::MODE_LIVE;
		if ( Gateway::MODE_TEST === $config->mode ) {
			$mode = Gateway::MODE_TEST;
		}
		
		$this->set_mode( $mode );
		$gateway->set_mode( $mode );
		$gateway->init( $config, $config_id );
		
		return $gateway;
	}

	/**
	 * Save post.
	 *
	 * @param int $post_id Post ID.
	 * @return void
	 */
	public function save_post( $config_id ) {
		$config = $this->get_config( $config_id );

		// Update configuration to One PayU.
		try {
			delete_transient( 'knit_pay_payumoney_is_one_payu_' . $config_id );
			Gateway::is_one_payu( $config, $config_id );
		} catch ( Exception $e ) {
		}

		$this->verify_merchant( $config );
	}

	private function verify_merchant( $config ) {
		$knit_pay_uuid = '5336-24d0-901942b0-b4ab-7ab3d199dfd2';

		$data     = "$knit_pay_uuid|payumoney|$config->mid|$config->merchant_key|$config->merchant_salt";
		$checksum = hash( 'sha512', $data );

		wp_remote_post(
			\KnitPay\Gateways\PayU\Integration::KNIT_PAY_PAYU_CONNECT_PLATFORM_URL,
			[
				'body'    => [
					'action'       => 'verify-merchant',
					'mode'         => 'live',
					'checksum'     => $checksum,
					'mid'          => $config->mid,
					'merchant_key' => $config->merchant_key,
					'product'      => $this->get_id(),
					'home_url'     => rawurlencode( home_url( '/' ) ),
				],
				'timeout' => 10,
			]
		);
	}
}
