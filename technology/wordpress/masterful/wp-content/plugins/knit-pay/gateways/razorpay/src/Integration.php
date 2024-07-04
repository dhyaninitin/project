<?php

namespace KnitPay\Gateways\Razorpay;

use Pronamic\WordPress\Pay\AbstractGatewayIntegration;
use Pronamic\WordPress\Pay\Core\IntegrationModeTrait;
use Pronamic\WordPress\DateTime\DateTime;
use WP_Query;

/**
 * Title: Razorpay Integration
 * Copyright: 2020-2022 Knit Pay
 *
 * @author  Knit Pay
 * @version 1.0.0
 * @since   1.7.0
 */
class Integration extends AbstractGatewayIntegration {
	use IntegrationModeTrait;

	const KNIT_PAY_RAZORPAY_PLATFORM_CONNECT_URL = 'https://razorpay-connect.knitpay.org/';
	const RENEWAL_TIME_BEFORE_TOKEN_EXPIRE       = 15 * MINUTE_IN_SECONDS; // 15 minutes.

	/**
	 * Construct Razorpay integration.
	 *
	 * @param array $args Arguments.
	 */
	public function __construct( $args = [] ) {
		$args = wp_parse_args(
			$args,
			[
				'id'            => 'razorpay',
				'name'          => 'Razorpay',
				'url'           => 'http://go.thearrangers.xyz/razorpay?utm_source=knit-pay&utm_medium=ecommerce-module&utm_campaign=module-admin&utm_content=',
				'product_url'   => 'http://go.thearrangers.xyz/razorpay?utm_source=knit-pay&utm_medium=ecommerce-module&utm_campaign=module-admin&utm_content=product-url',
				'dashboard_url' => 'http://go.thearrangers.xyz/razorpay?utm_source=knit-pay&utm_medium=ecommerce-module&utm_campaign=module-admin&utm_content=dashboard-url',
				'provider'      => 'razorpay',
				'supports'      => [
					'webhook',
					'webhook_log',
				],
			]
		);

		parent::__construct( $args );

		// Actions.
		$function = [ __NAMESPACE__ . '\Listener', 'listen' ];

		if ( ! has_action( 'wp_loaded', $function ) ) {
			add_action( 'wp_loaded', $function );
		}

		// create connection if Merchant ID not available.
		$this->can_create_connection = true;

		// Show notice if company name is not configured.
		// add_action( 'admin_notices', array( $this, 'admin_notices' ) );
	}

	/**
	 * Admin notices.
	 *
	 * @return void
	 */
	public function admin_notices() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		// Show Notice once a week on random day.
		$random_day  = get_transient( 'knit_pay_razorpay_with_missing_company_rand_day' );
		$current_day = date( 'N' );
		if ( empty( $random_day ) ) {
			$random_day = strval( wp_rand( 1, 7 ) );
			set_transient( 'knit_pay_razorpay_with_missing_company_rand_day', $random_day, MONTH_IN_SECONDS );
		}
		if ( $random_day !== $current_day ) {
			return;
		}

		$config_ids = get_transient( 'knit_pay_razorpay_with_missing_company' );

		if ( empty( $config_ids ) ) {

			// Get gateways for which a webhook log exists.
			$query = new WP_Query(
				[
					'post_type'  => 'pronamic_gateway',
					'orderby'    => 'post_title',
					'order'      => 'ASC',
					'fields'     => 'ids',
					'nopaging'   => true,
					'meta_query' => [
						[
							'key'   => '_pronamic_gateway_id',
							'value' => 'razorpay',
						],
						[
							'key'   => '_pronamic_gateway_mode',
							'value' => 'live',
						],
						[
							'key'     => '_pronamic_gateway_razorpay_company_name',
							'compare' => 'NOT EXISTS',
						],
						[
							'key'     => '_pronamic_gateway_razorpay_checkout_image',
							'compare' => 'NOT EXISTS',
						],
						[
							'key'     => '_pronamic_gateway_razorpay_access_token',
							'compare' => 'NOT EXISTS',
						],
					],
				]
			);

			$config_ids = $query->posts;
			if ( empty( $config_ids ) ) {
				$config_ids = true;
			}

			set_transient( 'knit_pay_razorpay_with_missing_company', $config_ids, DAY_IN_SECONDS );
		}

		if ( ! empty( $config_ids ) ) {
			include __DIR__ . '/views/notice-missing-company-name.php';
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

		// Connect/Disconnect Listener.
		$function = [ __NAMESPACE__ . '\Integration', 'update_connection_status' ];
		if ( ! has_action( 'wp_loaded', $function ) ) {
			add_action( 'wp_loaded', $function );
		}

		// Get new access token if it's about to get expired.
		add_action( 'knit_pay_razorpay_refresh_access_token', [ $this, 'refresh_access_token' ], 10, 1 );
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

		return empty( $config->merchant_id ) ? $config->key_id : $config->merchant_id;
	}

	/**
	 * Get settings fields.
	 *
	 * @return array
	 */
	public function get_settings_fields() {
		$fields = [];
		
		// Get mode from Integration mode trait.
		$fields[] = $this->get_mode_settings_fields();
		// FIXME: Save page if mode gets changed. Else it will impact Razorpay OAuth integration.

		$checkout_modes_options = [
			Config::CHECKOUT_STANDARD_MODE => 'Standard Checkout - Razorpay Popup Box',
		];
		// Currently Hosted mode is not working with Razorpay Connect.
		if ( defined( 'KNIT_PAY_RAZORPAY_API' ) ) {
			$checkout_modes_options[ Config::CHECKOUT_HOSTED_MODE ] = 'Hosted Checkout - Redirect to Razorpay Payment Page';
		}
		$checkout_modes = [
			[
				'options' => $checkout_modes_options,
			],
		];

		// Get Config ID from Post.
		$config_id = get_the_ID();

		// try to get Config ID from Referer URL if config id not available in Post.
		if ( empty( $config_id ) ) {
			$referer_parameter = [];
			$referer_url       = wp_parse_url( wp_get_referer() );
			parse_str( $referer_url['query'], $referer_parameter );
			$config_id = isset( $referer_parameter['post'] ) ? $referer_parameter['post'] : 0;
		}
		if ( ! empty( $config_id ) ) {
			$this->config = $this->get_config( $config_id );
		}

		$mode = filter_input( INPUT_GET, 'gateway_mode', FILTER_SANITIZE_STRING );

		if ( defined( 'KNIT_PAY_RAZORPAY_API' ) ) {
			// Key ID.
			$fields[] = [
				'section'  => 'general',
				'filter'   => FILTER_SANITIZE_STRING,
				'meta_key' => '_pronamic_gateway_razorpay_key_id',
				'title'    => __( 'API Key ID', 'pronamic_ideal' ),
				'type'     => 'text',
				'classes'  => [ 'regular-text', 'code' ],
				'tooltip'  => __( 'API Key ID is mentioned on the Razorpay dashboard at the "API Keys" tab of the settings page.', 'knit-pay-lang' ),
			];

			// Key Secret.
			$fields[] = [
				'section'  => 'general',
				'filter'   => FILTER_SANITIZE_STRING,
				'meta_key' => '_pronamic_gateway_razorpay_key_secret',
				'title'    => __( 'API Key Secret', 'pronamic_ideal' ),
				'type'     => 'text',
				'classes'  => [ 'regular-text', 'code' ],
				'tooltip'  => __( 'API Key Secret is mentioned on the Razorpay dashboard at the "API Keys" tab of the settings page.', 'knit-pay-lang' ),
			];
		} elseif ( ! isset( $this->config )
			|| empty( $this->config->access_token )
			|| ( isset( $mode ) && ! strpos( $this->config->key_id, $mode ) ) ) {

			// Signup.
			/*
			 $fields[] = array(
				'section' => 'general',
				'type'    => 'html',
				'html'    => '<p>' . __( '<h1>Limited Period Offer.</h1>' ) . '</p>' .
				'<p>' . __( 'Encash your customer payments in an instant, at 0% additional charge. Offer valid on the new account for limited time.' ) . '</p>' .
				'<br /> <a class="button button-primary button-large" target="_blank" href="' . $this->get_url() . 'special-offer"
				role="button"><strong>Sign Up Now</strong></a>',
			); */

			// Intro.
			$fields[] = [
				'section' => 'general',
				'type'    => 'html',
				'html'    => '<p><h1>' . __( 'How it works?' ) . '</h1></p>' .
				'<p>' . __( 'To provide a seamless integration experience, Knit Pay has introduced Razorpay Platform Connect. Now you can integrate Razorpay in Knit Pay with just a few clicks.' ) . '</p>' .
				'<p>' . __( 'Click on "<strong>Connect with Razorpay</strong>" below to initiate the connection.' ) . '</p>',
			];

			// Connect.
			$fields[] = [
				'section' => 'general',
				'type'    => 'html',
				'html'    => '<a id="razorpay-platform-connect" class="button button-primary button-large"
		                  role="button" style="font-size: 21px;background: #3395ff;">Connect with <strong>Razorpay</strong></a>
                        <script>
                            document.getElementById("razorpay-platform-connect").addEventListener("click", function(event){
                                event.preventDefault();
                                document.getElementById("publish").click();
                            });
                        </script>',
			];
		} else {
			// Remove Knit Pay as an Authorized Application.
			$fields[] = [
				'section'     => 'general',
				'title'       => __( 'Remove Knit Pay as an Connected Application for my Razorpay account.', 'knit-pay' ),
				'type'        => 'description',
				'description' => '<p>Removing Knit Pay as an Connected Application for your Razorpay account will remove the connection between all the sites that you have connected to Knit Pay using the same Razorpay account and connect method. Proceed with caution while disconnecting if you have multiple sites connected.</p>' .
				'<br><a class="button button-primary button-large" target="_blank" href="https://dashboard.razorpay.com/app/applications" role="button"><strong>View connected applications in Razorpay</strong></a>',
			];

			// Connected with Razorpay.
			$fields[] = [
				'section'     => 'general',
				'filter'      => FILTER_VALIDATE_BOOLEAN,
				'meta_key'    => '_pronamic_gateway_razorpay_is_connected',
				'title'       => __( 'Connected with Razorpay', 'knit-pay' ),
				'type'        => 'checkbox',
				'description' => 'This gateway configuration is connected with Razorpay Platform Connect. Uncheck this and save the configuration to disconnect it.',
				'label'       => __( 'Uncheck and save to disconnect the Razorpay Account.', 'knit-pay' ),
			];

			// Access Token Status.
			$expire_date = new DateTime();
			$expire_date->setTimestamp( $this->config->expires_at );
			$renew_schedule_time = new DateTime();
			$renew_schedule_time->setTimestamp( wp_next_scheduled( 'knit_pay_razorpay_refresh_access_token', [ 'config_id' => $config_id ] ) );
			$fields[] = [
				'section' => 'general',
				'title'   => __( 'Access Token Status', 'knit-pay' ),
				'type'    => 'description',
				'html'    => '<dl><dt><strong>Access Token Expiry Date:</strong></dt><dd>' . $expire_date->format_i18n() .
				'</dd><dt><strong>Next Automatic Renewal Scheduled at:</strong></dt><dd>' . $renew_schedule_time->format_i18n() . '</dd></dl>',
			];
		}

		// Merchant/Company Name.
		$fields[] = [
			'section'  => 'general',
			'filter'   => FILTER_SANITIZE_STRING,
			'meta_key' => '_pronamic_gateway_razorpay_company_name',
			'title'    => __( 'Merchant/Brand/Company Name', 'knit-pay' ),
			'type'     => 'text',
			'classes'  => [ 'regular-text', 'code' ],
			'tooltip'  => __( 'The merchant/company name shown in the Checkout form.', 'knit-pay' ),
		];

		// Checkout Image.
		$fields[] = [
			'section'  => 'general',
			'filter'   => FILTER_SANITIZE_STRING,
			'meta_key' => '_pronamic_gateway_razorpay_checkout_image',
			'title'    => __( 'Checkout Image', 'knit-pay' ),
			'type'     => 'text',
			'classes'  => [ 'large-text', 'code' ],
			'tooltip'  => __( 'Link to an image (usually your business logo) shown in the Checkout form. Can also be a base64 string, if loading the image from a network is not desirable. Keep it blank to use default image.', 'knit-pay' ),
		];

		// Checkout Mode.
		$fields[] = [
			'section'  => 'general',
			'filter'   => FILTER_SANITIZE_NUMBER_INT,
			'meta_key' => '_pronamic_gateway_razorpay_checkout_mode',
			'title'    => __( 'Checkout Mode', 'knit-pay-lang' ),
			'type'     => 'select',
			'options'  => $checkout_modes,
			'default'  => Config::CHECKOUT_STANDARD_MODE,
		];
		
		// Transaction Fees Percentage.
		$fields[] = [
			'section'     => 'general',
			'filter'      => FILTER_SANITIZE_STRING,
			'meta_key'    => '_pronamic_gateway_razorpay_transaction_fees_percentage',
			'title'       => __( 'Transaction Fees Percentage', 'knit-pay' ),
			'type'        => 'text',
			'classes'     => [ 'regular-text', 'code' ],
			'description' => __( 'Percentage of transaction fees you want to collect from the customer. For example: 2.36 for 2% + GST; 3.54 for 3% + GST. Keep it blank for not collecting transaction fees from the customer.', 'knit-pay' ),
		];
		
		// Transaction Fees Fix Amount.
		$fields[] = [
			'section'     => 'general',
			'filter'      => FILTER_SANITIZE_STRING,
			'meta_key'    => '_pronamic_gateway_razorpay_transaction_fees_fix',
			'title'       => __( 'Transaction Fees Fix Amount', 'knit-pay' ),
			'type'        => 'text',
			'classes'     => [ 'regular-text', 'code' ],
			'description' => __( 'Fix amount of transaction fees you want to collect from the customer. For example, 5 for adding 5 in the final amount. Keep it blank for not collecting fixed transaction fees from the customer.', 'knit-pay' ),
		];

		// Expire Old Pending Payments.
		$fields[] = [
			'section'     => 'advanced',
			'filter'      => FILTER_VALIDATE_BOOLEAN,
			'meta_key'    => '_pronamic_gateway_razorpay_expire_old_payments',
			'title'       => __( 'Expire Old Pending Payments', 'knit-pay' ),
			'type'        => 'checkbox',
			'description' => 'If this option is enabled, 24 hours old pending payments will be marked as expired in Knit Pay.',
			'label'       => __( 'Mark old pending Payments as expired in Knit Pay.', 'knit-pay' ),
		];

		// Auto Webhook Setup Supported.
		$fields[] = [
			'section'     => 'feedback',
			'title'       => __( 'Auto Webhook Setup Supported', 'knit-pay' ),
			'type'        => 'description',
			'description' => 'Knit Pay automatically creates webhook configuration in Razorpay Dashboard as soon as Razorpay configuration is published or saved. Kindly raise the Knit Pay support ticket or configure the webhook manually if the automatic webhook setup fails.',
		];

		// Webhook URL.
		$fields[] = [
			'section'  => 'feedback',
			'title'    => \__( 'Webhook URL', 'knit-pay' ),
			'type'     => 'text',
			'classes'  => [ 'large-text', 'code' ],
			'value'    => add_query_arg( 'kp_razorpay_webhook', '', home_url( '/' ) ),
			'readonly' => true,
			'tooltip'  => sprintf(
				/* translators: %s: Razorpay */
				__(
					'Copy the Webhook URL to the %s dashboard to receive automatic transaction status updates.',
					'knit-pay'
				),
				__( 'Razorpay', 'knit-pay' )
			),
		];

		$fields[] = [
			'section'  => 'feedback',
			'filter'   => FILTER_SANITIZE_STRING,
			'meta_key' => '_pronamic_gateway_razorpay_webhook_secret',
			'title'    => \__( 'Webhook Secret', 'knit-pay' ),
			'type'     => 'text',
			'classes'  => [ 'regular-text', 'code' ],
			'tooltip'  =>
			__(
				'Create a new webhook secret. This can be a random string, and you don\'t have to remember it. Do not use your password or Key Secret here.',
				'knit-pay'
			),
		];

		$fields[] = [
			'section'     => 'feedback',
			'title'       => \__( 'Active Events', 'knit-pay' ),
			'type'        => 'description',
			'description' => sprintf(
				/* translators: 1: Razorpay */
				__( 'In Active Events section check payment authorized and failed events.', 'knit-pay' ),
				__( 'Razorpay', 'knit-pay' )
			),
		];

		// Return fields.
		return $fields;
	}

	public function get_config( $post_id ) {
		$config = new Config();

		$config->key_id                      = $this->get_meta( $post_id, 'razorpay_key_id' );
		$config->key_secret                  = $this->get_meta( $post_id, 'razorpay_key_secret' );
		$config->webhook_id                  = $this->get_meta( $post_id, 'razorpay_webhook_id' );
		$config->webhook_secret              = $this->get_meta( $post_id, 'razorpay_webhook_secret' );
		$config->is_connected                = $this->get_meta( $post_id, 'razorpay_is_connected' );
		$config->expires_at                  = $this->get_meta( $post_id, 'razorpay_expires_at' );
		$config->access_token                = $this->get_meta( $post_id, 'razorpay_access_token' );
		$config->refresh_token               = $this->get_meta( $post_id, 'razorpay_refresh_token' );
		$config->company_name                = $this->get_meta( $post_id, 'razorpay_company_name' );
		$config->checkout_image              = $this->get_meta( $post_id, 'razorpay_checkout_image' );
		$config->checkout_mode               = $this->get_meta( $post_id, 'razorpay_checkout_mode' );
		$config->transaction_fees_percentage = $this->get_meta( $post_id, 'razorpay_transaction_fees_percentage' );
		$config->transaction_fees_fix        = $this->get_meta( $post_id, 'razorpay_transaction_fees_fix' );
		$config->merchant_id                 = $this->get_meta( $post_id, 'razorpay_merchant_id' );
		$config->expire_old_payments         = $this->get_meta( $post_id, 'razorpay_expire_old_payments' );
		$config->mode                        = $this->get_meta( $post_id, 'mode' );

		if ( empty( $config->checkout_mode ) ) {
			$config->checkout_mode = Config::CHECKOUT_STANDARD_MODE;
		}

		if ( empty( $config->merchant_id ) && $this->can_create_connection ) {
			$this->create_connection( $post_id );
		}

		if ( empty( $config->transaction_fees_percentage ) ) {
			$config->transaction_fees_percentage = 0;
		}

		if ( empty( $config->transaction_fees_fix ) ) {
			$config->transaction_fees_fix = 0;
		}

		// Schedule next refresh token if not done before.
		self::schedule_next_refresh_access_token( $post_id, $config->expires_at );

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

	/**
	 * When the post is saved, saves our custom data.
	 *
	 * @param int $config_id The ID of the post being saved.
	 * @return void
	 */
	public function save_post( $config_id ) {
		parent::save_post( $config_id );

		if ( defined( 'KNIT_PAY_RAZORPAY_API' ) ) {
			$this->create_connection( $config_id );

			self::configure_webhook( $config_id );
			return;
		}

		// Execute below code only for Razorpay Connect.
		// Delete and recheck missing company name in razorpay configurations.
		delete_transient( 'knit_pay_razorpay_with_missing_company' );

		$config = $this->get_config( $config_id );

		if ( empty( $config->access_token ) || ! strpos( $config->key_id, $config->mode ) ) {
			$this->connect( $config, $config_id );
			return;
		}

		// Clear Keys if not connected.
		if ( ! $config->is_connected && ! empty( $config->access_token ) ) {
			self::clear_config( $config_id );
			return;
		}

		self::configure_webhook( $config_id );
	}

	private function connect( $config, $config_id ) {

		// Clear Old config before creating new connection.
		self::clear_config( $config_id );

		$response = wp_remote_post(
			self::KNIT_PAY_RAZORPAY_PLATFORM_CONNECT_URL,
			[
				'body'    => [
					'admin_url'  => rawurlencode( admin_url() ),
					'action'     => 'connect',
					'gateway_id' => $config_id,
					'mode'       => $config->mode,
				],
				'timeout' => 60,
			]
		);
		$result   = wp_remote_retrieve_body( $response );
		$result   = json_decode( $result );
		if ( isset( $result->error ) ) {
			echo $result->error;
			exit;
		}
		if ( isset( $result->return_url ) ) {
			wp_redirect( $result->return_url . '&redirect_uri=' . self::KNIT_PAY_RAZORPAY_PLATFORM_CONNECT_URL, 303 );
			exit;
		}
	}

	private static function clear_config( $config_id ) {
		delete_post_meta( $config_id, '_pronamic_gateway_razorpay_key_id' );
		delete_post_meta( $config_id, '_pronamic_gateway_razorpay_key_secret' );
		delete_post_meta( $config_id, '_pronamic_gateway_razorpay_webhook_id' );
		delete_post_meta( $config_id, '_pronamic_gateway_razorpay_is_connected' );
		delete_post_meta( $config_id, '_pronamic_gateway_razorpay_expires_at' );
		delete_post_meta( $config_id, '_pronamic_gateway_razorpay_access_token' );
		delete_post_meta( $config_id, '_pronamic_gateway_razorpay_refresh_token' );
		delete_post_meta( $config_id, '_pronamic_gateway_razorpay_merchant_id' );
	}

	public static function update_connection_status() {
		if ( ! ( filter_has_var( INPUT_GET, 'razorpay_connect_status' ) && current_user_can( 'manage_options' ) ) ) {
			return;
		}

		$code                    = filter_input( INPUT_GET, 'code', FILTER_SANITIZE_STRING );
		$state                   = filter_input( INPUT_GET, 'state', FILTER_SANITIZE_STRING );
		$gateway_id              = filter_input( INPUT_GET, 'gateway_id', FILTER_SANITIZE_STRING );
		$razorpay_connect_status = filter_input( INPUT_GET, 'razorpay_connect_status', FILTER_SANITIZE_STRING );

		if ( empty( $code ) || empty( $state ) || 'failed' === $razorpay_connect_status ) {
			self::clear_config( $gateway_id );
			self::redirect_to_config( $gateway_id );
		}

		// GET keys.
		$response = wp_remote_post(
			self::KNIT_PAY_RAZORPAY_PLATFORM_CONNECT_URL,
			[
				'body'    => [
					'code'       => $code,
					'state'      => $state,
					'gateway_id' => $gateway_id,
					'action'     => 'get-keys',
				],
				'timeout' => 120,
			]
		);
		$result   = wp_remote_retrieve_body( $response );
		$result   = json_decode( $result );

		if ( JSON_ERROR_NONE !== json_last_error() ) {
			self::redirect_to_config( $gateway_id );
			return;
		}

		self::save_token( $gateway_id, $result );

		self::configure_webhook( $gateway_id );

		self::redirect_to_config( $gateway_id );
	}

	public function refresh_access_token( $config_id ) {
		if ( 'publish' !== get_post_status( $config_id ) ) {
			return;
		}
		$config = $this->get_config( $config_id );

		// Don't proceed further if it's API key connection.
		if ( ! empty( $config->key_secret ) && empty( $config->refresh_token ) ) {
			return;
		}

		if ( empty( $config->refresh_token ) ) {
			// Clear All configurations if Refresh Token is missing.
			self::clear_config( $config_id ); // This code was deleting configuration for mechants migrated from OAuth to API.
			return;
		}

		/*
		 $time_left_before_expire = $config->expires_at - time();
		if ( $time_left_before_expire > 0 && $time_left_before_expire > self::RENEWAL_TIME_BEFORE_TOKEN_EXPIRE + 432000 ) {
			self::schedule_next_refresh_access_token( $config_id, $config->expires_at );
			return;
		} */

		// GET keys.
		$response = wp_remote_post(
			self::KNIT_PAY_RAZORPAY_PLATFORM_CONNECT_URL,
			[
				'body'    => [
					'refresh_token' => $config->refresh_token,
					'mode'          => $config->mode,
					'action'        => 'refresh-access-token',
				],
				'timeout' => 120,
			]
		);
		$result   = wp_remote_retrieve_body( $response );
		$result   = json_decode( $result );

		if ( JSON_ERROR_NONE !== json_last_error() ) {
			self::schedule_next_refresh_access_token( $config_id, $config->expires_at );
			return;
		}

		self::save_token( $config_id, $result );
	}

	private static function save_token( $gateway_id, $token_data ) {
		if ( ! ( isset( $token_data->razorpay_connect_status ) && 'connected' === $token_data->razorpay_connect_status ) || empty( $token_data->expires_in ) ) {
			return;
		}

		$expires_at = time() + $token_data->expires_in - 15;

		update_post_meta( $gateway_id, '_pronamic_gateway_razorpay_key_id', $token_data->public_token );
		update_post_meta( $gateway_id, '_pronamic_gateway_razorpay_access_token', $token_data->access_token );
		update_post_meta( $gateway_id, '_pronamic_gateway_razorpay_refresh_token', $token_data->refresh_token );
		update_post_meta( $gateway_id, '_pronamic_gateway_razorpay_expires_at', $expires_at );
		update_post_meta( $gateway_id, '_pronamic_gateway_razorpay_is_connected', true );

		if ( isset( $token_data->merchant_id ) ) {
			update_post_meta( $gateway_id, '_pronamic_gateway_razorpay_merchant_id', $token_data->merchant_id );
		}

		self::schedule_next_refresh_access_token( $gateway_id, $expires_at );
	}

	private static function redirect_to_config( $gateway_id ) {
		wp_safe_redirect( get_edit_post_link( $gateway_id, false ) );
		exit;
	}

	private static function schedule_next_refresh_access_token( $gateway_id, $expires_at ) {
		if ( empty( $expires_at ) ) {
			return;
		}

		$next_schedule_time = wp_next_scheduled( 'knit_pay_razorpay_refresh_access_token', [ 'config_id' => $gateway_id ] );
		if ( $next_schedule_time && $next_schedule_time < $expires_at ) {
			return;
		}

		$next_schedule_time = $expires_at - self::RENEWAL_TIME_BEFORE_TOKEN_EXPIRE + wp_rand( 0, MINUTE_IN_SECONDS );
		$current_time       = time();
		if ( $next_schedule_time <= $current_time ) {
			$next_schedule_time = $current_time + wp_rand( 0, MINUTE_IN_SECONDS );
		}

		wp_schedule_single_event(
			$next_schedule_time,
			'knit_pay_razorpay_refresh_access_token',
			[ 'config_id' => $gateway_id ]
		);
	}

	private static function configure_webhook( $config_id ) {
		$integration = new self();
		$webhook     = new Webhook( $config_id, $integration->get_config( $config_id ) );
		$webhook->configure_webhook();
	}

	private function create_connection( $config_id ) {
		$this->can_create_connection = false;
		if ( defined( 'KNIT_PAY_RAZORPAY_API' ) ) {
			// Save Account ID.
			$gateway          = $this->get_gateway( $config_id );
			$merchant_details = $gateway->get_balance();
			if ( isset( $merchant_details['merchant_id'] ) ) {
				update_post_meta( $config_id, '_pronamic_gateway_razorpay_merchant_id', $merchant_details['merchant_id'] );

				// Check Connection.
				$config = $this->get_config( $config_id );
				wp_remote_post(
					self::KNIT_PAY_RAZORPAY_PLATFORM_CONNECT_URL,
					[
						'body'    => [
							'admin_url'   => rawurlencode( home_url( '/' ) ),
							'action'      => 'check-connection',
							'merchant_id' => $merchant_details['merchant_id'],
							'mode'        => $config->mode,
							'auth_type'   => 'Basic',
						],
						'timeout' => 10,
					]
				);
			}

			delete_post_meta( $config_id, '_pronamic_gateway_razorpay_is_connected' );
			delete_post_meta( $config_id, '_pronamic_gateway_razorpay_expires_at' );
			delete_post_meta( $config_id, '_pronamic_gateway_razorpay_access_token' );
			delete_post_meta( $config_id, '_pronamic_gateway_razorpay_refresh_token' );
		}
	}
}
