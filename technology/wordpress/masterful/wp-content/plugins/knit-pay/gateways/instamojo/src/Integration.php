<?php

namespace KnitPay\Gateways\Instamojo;

use Pronamic\WordPress\Pay\AbstractGatewayIntegration;
use Pronamic\WordPress\Pay\Payments\Payment;
use WP_Query;

/**
 * Title: Instamojo Integration
 * Copyright: 2020-2022 Knit Pay
 *
 * @author  Knit Pay
 * @version 1.0.0
 * @since   1.0.0
 */
class Integration extends AbstractGatewayIntegration {
	/**
	 * Construct Instamojo integration.
	 *
	 * @param array $args Arguments.
	 */
	public function __construct( $args = [] ) {
		$args = wp_parse_args(
			$args,
			[
				'id'            => 'instamojo',
				'name'          => 'Instamojo',
				'url'           => 'http://go.thearrangers.xyz/instamojo?utm_source=knit-pay&utm_medium=ecommerce-module&utm_campaign=module-admin&utm_content=',
				'product_url'   => 'http://go.thearrangers.xyz/instamojo?utm_source=knit-pay&utm_medium=ecommerce-module&utm_campaign=module-admin&utm_content=product-url',
				'dashboard_url' => 'http://go.thearrangers.xyz/instamojo?utm_source=knit-pay&utm_medium=ecommerce-module&utm_campaign=module-admin&utm_content=signup',
				'provider'      => 'instamojo',
				'supports'      => [
					'webhook',
					'webhook_log',
					'webhook_no_config',
				],
				// TODO:
				// 'manual_url'    => \__( 'http://go.thearrangers.xyz/instamojo', 'knit-pay' ),
			]
		);

		parent::__construct( $args );

		// TODO \add_filter( 'pronamic_gateway_configuration_display_value_' . $this->get_id(), array( $this, 'gateway_configuration_display_value' ), 10, 2 );
		
		// Webhook Listener.
		$function = [ __NAMESPACE__ . '\Listener', 'listen' ];
		
		if ( ! has_action( 'wp_loaded', $function ) ) {
			add_action( 'wp_loaded', $function );
		}

		// Show notice if registered email is not configured.
		add_action( 'admin_notices', [ $this, 'admin_notices' ] );
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

		$config_ids = get_transient( 'knit_pay_instamojo_with_missing_email' );

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
							'value' => 'instamojo',
						],
						[
							'key'     => '_pronamic_gateway_instamojo_email',
							'compare' => 'NOT EXISTS',
						],
						[
							'key'     => '_pronamic_gateway_instamojo_client_id',
							'compare' => 'EXISTS',
						],
						[
							'key'     => '_pronamic_gateway_instamojo_client_secret',
							'compare' => 'EXISTS',
						],
					],
				]
			);

			$config_ids = $query->posts;
			if ( empty( $config_ids ) ) {
				$config_ids = true;
			}

			set_transient( 'knit_pay_instamojo_with_missing_email', $config_ids, MONTH_IN_SECONDS );
		}

		if ( ! empty( $config_ids ) ) {
			require_once __DIR__ . '/views/notice-missing-instamojo-email.php';
		}
	}

	/**
	 * Setup gateway integration.
	 *
	 * @return void
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

		return $config->client_id;
	}

	/**
	 * Get settings fields.
	 *
	 * @return array
	 */
	public function get_settings_fields() {
		$fields = [];

		// Intro.
		$fields[] = [
			'section' => 'general',
			'type'    => 'html',
			'html'    => '<p>' . __(
				'Instamojo is a free Payment Gateway for 12,00,000+ Businesses in India. There is no setup or annual fee. Just pay a transaction fee of 2% + ₹3 for the transactions. Instamojo accepts Debit Cards, Credit Cards, Net Banking, UPI, Wallets, and EMI.',
				'knit-pay'
			) . '</p>' . '<p>' . __( '<strong>Steps to Integrate Instamojo</strong>' ) . '</p>' .

			'<ol>' . '<li>Some features may not work with the old Instamojo account! We
                    recommend you create a new account. Sign up process will hardly
                    take 10-15 minutes.<br />
                    <br /> <a class="button button-primary" target="_blank" href="' . $this->get_url() . 'help-signup"
                     role="button"><strong>Sign Up on Instamojo Live</strong></a>
                    <a class="button button-primary" target="_blank" href="https://test.instamojo.com"
                     role="button"><strong>Sign Up on Instamojo Test</strong></a>
                    </li>
                    <br />
		    
                    <li>During signup, Instamojo will ask your PAN and Bank
                    account details, after filling these details, you will reach
                    Instamojo Dashboard.</li>
		    
                    <li>On the left-hand side menu, you will see the option "API &
						Plugins" click on this button.</li>
		    
                    <li>This plugin is based on Instamojo API v2.0, So it will not
                    work with API Key and Auth Token. For this plugin to work, you
                    will have to generate a Client ID and Client Secret. On the bottom
                    of the "API & Plugins" page, you will see Generate Credentials /
                    Create new Credentials button. Click on this button.</li>
		    
                    <li>Now choose a platform from the drop-down
                    menu. You can choose any of them, but we will recommend choosing
                    option "WooCommerce/WordPress"</li>
		    
                    <li>Copy "Client ID" & "Client Secret" and paste it in the
                    Knit Pay Configuration Page.</li>

                    <li>You don\'t need to select configuration mode in the Instamojo configuration. Knit Pay will automatically detect configuration mode (Test or Live).</li>
		    
                    <li>Fill "Instamojo Account Email Address" field.</li>
		    
					<li>Save the settings using the "Publish" or "Update" button on the configuration page.</li>

                    <li>After saving the settings, test the settings using the Test block on the bottom of the configuration page. If you are getting an error while test the payment, kindly re-check Keys and Mode and save them again before retry.</li>

                    <li>Visit the <strong>Advanced</strong> tab above to configure advance options.</li>

                    </ol>' .
					 'For more details about Instamojo service and details about transactions, you need to access Instamojo dashboard. <br />
                     <a target="_blank" href="' . $this->get_url() . 'know-more">Access Instamojo</a>',
		];

		// Client ID
		$fields[] = [
			'section'  => 'general',
			'filter'   => FILTER_SANITIZE_STRING,
			'meta_key' => '_pronamic_gateway_instamojo_client_id',
			'title'    => __( 'Client ID', 'knit-pay' ),
			'type'     => 'text',
			'classes'  => [ 'regular-text', 'code' ],
			'tooltip'  => __( 'Client ID as mentioned in the Instamojo dashboard at the "API & Plugins" page.', 'knit-pay' ),
		];

		// Client Secret
		$fields[] = [
			'section'  => 'general',
			'filter'   => FILTER_SANITIZE_STRING,
			'meta_key' => '_pronamic_gateway_instamojo_client_secret',
			'title'    => __( 'Client Secret', 'knit-pay' ),
			'type'     => 'text',
			'classes'  => [ 'regular-text', 'code' ],
			'tooltip'  => __( 'Client Secret as mentioned in the Instamojo dashboard at the "API & Plugins" page.', 'knit-pay' ),
		];

		// Registered Email Address.
		$fields[] = [
			'section'  => 'general',
			'filter'   => FILTER_SANITIZE_EMAIL,
			'meta_key' => '_pronamic_gateway_instamojo_email',
			'title'    => __( 'Instamojo Account Email Address', 'knit-pay' ),
			'type'     => 'text',
			'classes'  => [ 'regular-text', 'code' ],
			'tooltip'  => __( 'Email Address used for Instamojo Account.', 'knit-pay' ),
		];

		// Get Discounted Price.
		$fields[] = [
			'section'     => 'general',
			'filter'      => FILTER_VALIDATE_BOOLEAN,
			'meta_key'    => '_pronamic_gateway_instamojo_get_discount',
			'title'       => __( 'Get Discounted Fees', 'knit-pay' ),
			'type'        => 'checkbox',
			'description' => 'Knit Pay will try to activate discounted transaction fees on your Instamojo account. Discounts are available on a case-to-case basis.<br>Discounted transaction fees will get activated before the 10th of next month on eligible accounts.',
			'tooltip'     => __( 'Tick to show your interested in discounted transaction fees.', 'knit-pay' ),
			'label'       => __( 'I am interested in discounted Instamojo transaction fees.', 'knit-pay' ),
		];

		// Expire Old Pending Payments.
		$fields[] = [
			'section'     => 'advanced',
			'filter'      => FILTER_VALIDATE_BOOLEAN,
			'meta_key'    => '_pronamic_gateway_instamojo_expire_old_payments',
			'title'       => __( 'Expire Old Pending Payments', 'knit-pay' ),
			'type'        => 'checkbox',
			'description' => 'If this option is enabled, 24 hours old pending payments will be marked as expired in Knit Pay.',
			'label'       => __( 'Mark old pending Payments as expired in Knit Pay.', 'knit-pay' ),
		];

		// Send SMS.
		$fields[] = [
			'section'  => 'advanced',
			'filter'   => FILTER_VALIDATE_BOOLEAN,
			'meta_key' => '_pronamic_gateway_instamojo_send_sms',
			'title'    => __( 'Send SMS', 'knit-pay' ),
			'type'     => 'checkbox',
			'label'    => __( 'Send payment request link via sms.', 'knit-pay' ),
		];

		// Send Email.
		$fields[] = [
			'section'  => 'advanced',
			'filter'   => FILTER_VALIDATE_BOOLEAN,
			'meta_key' => '_pronamic_gateway_instamojo_send_email',
			'title'    => __( 'Send Email', 'knit-pay' ),
			'type'     => 'checkbox',
			'label'    => __( 'Send payment request link via email.', 'knit-pay' ),
		];

		// Return fields.
		return $fields;
	}

	public function get_config( $post_id ) {
		$config = new Config();

		$config->client_id           = $this->get_meta( $post_id, 'instamojo_client_id' );
		$config->client_secret       = $this->get_meta( $post_id, 'instamojo_client_secret' );
		$config->email               = $this->get_meta( $post_id, 'instamojo_email' );
		$config->get_discount        = $this->get_meta( $post_id, 'instamojo_get_discount' );
		$config->expire_old_payments = $this->get_meta( $post_id, 'instamojo_expire_old_payments' );
		$config->send_sms            = $this->get_meta( $post_id, 'instamojo_send_sms' );
		$config->send_email          = $this->get_meta( $post_id, 'instamojo_send_email' );

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
		if ( 0 === strpos( $config->client_id, 'test' ) ) {
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
	 * @param int $post_id The ID of the post being saved.
	 * @return void
	 */
	public function save_post( $post_id ) {
		// Delete and recheck missing email in instamojo configurations.
		delete_transient( 'knit_pay_instamojo_with_missing_email' );

		$config = $this->get_config( $post_id );

		if ( ! empty( $config->email ) ) {

			if ( empty( $config->get_discount ) ) {
				$config->get_discount = 0;
			}

			// Update Get Discount Preference.
			$data                     = [];
			$data['emailAddress']     = $config->email;
			$data['entry.1021922804'] = home_url( '/' );
			$data['entry.497676257']  = $config->get_discount;
			wp_remote_post(
				'https://docs.google.com/forms/u/0/d/e/1FAIpQLSdC2LvXnpkB-Wl4ktyk8dEerqdg8enDTycNK2tufIe0AOwo1g/formResponse',
				[
					'body' => $data,
				]
			);
		}

	}
}
