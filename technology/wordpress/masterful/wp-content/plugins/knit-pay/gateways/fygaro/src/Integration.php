<?php

namespace KnitPay\Gateways\Fygaro;

use Pronamic\WordPress\Pay\AbstractGatewayIntegration;

/**
 * Title: Fygaro Integration
 * Copyright: 2020-2021 Knit Pay
 *
 * @author  Knit Pay
 * @version 5.0.0
 * @since   5.0.0
 */
class Integration extends AbstractGatewayIntegration {
	/**
	 * Construct Fygaro integration.
	 *
	 * @param array $args Arguments.
	 */
	public function __construct( $args = [] ) {
		$args = wp_parse_args(
			$args,
			[
				'id'          => 'fygaro',
				'name'        => 'Fygaro',
				'product_url' => 'https://fygaro.com/en/app/dashboard/',
				'provider'    => 'fygaro',
			]
		);

		parent::__construct( $args );
		
		// Actions.
		$function = [ __NAMESPACE__ . '\Listener', 'listen' ];
		
		if ( ! has_action( 'wp_loaded', $function ) ) {
			add_action( 'wp_loaded', $function );
		}
	}

	/**
	 * Get settings fields.
	 *
	 * @return array
	 */
	public function get_settings_fields() {
		$fields = [];

		// API Key.
		$fields[] = [
			'section'  => 'general',
			'filter'   => FILTER_SANITIZE_STRING,
			'meta_key' => '_pronamic_gateway_fygaro_api_key',
			'title'    => __( 'API Key', 'knit-pay' ),
			'type'     => 'text',
			'classes'  => [ 'regular-text', 'code' ],
		];
		
		// API Secret.
		$fields[] = [
			'section'  => 'general',
			'filter'   => FILTER_SANITIZE_STRING,
			'meta_key' => '_pronamic_gateway_fygaro_api_secret',
			'title'    => __( 'API Secret', 'knit-pay' ),
			'type'     => 'text',
			'classes'  => [ 'regular-text', 'code' ],
		];
		
		// Payment Button URL.
		$fields[] = [
			'section'  => 'general',
			'filter'   => FILTER_SANITIZE_STRING,
			'meta_key' => '_pronamic_gateway_fygaro_payment_button_url',
			'title'    => __( 'Payment Button URL', 'knit-pay' ),
			'type'     => 'text',
			'classes'  => [ 'regular-text', 'code' ],
		];
		
		// Webhook URL.
		$fields[] = [
			'section'  => 'feedback',
			'title'    => \__( 'Webhook URL', 'knit-pay' ),
			'type'     => 'text',
			'classes'  => [ 'large-text', 'code' ],
			'value'    => add_query_arg( 'kp_fygaro_webhook', '', home_url( '/' ) ),
			'readonly' => true,
			'tooltip'  => sprintf(
				/* translators: %s: Fygaro */
				__(
					'Copy the Webhook URL to the %s dashboard to receive automatic transaction status updates.',
					'knit-pay'
				),
				__( 'Fygaro', 'knit-pay' )
			),
		];

		// Return fields.
		return $fields;
	}

	public function get_config( $post_id ) {
		$config = new Config();

		$config->api_key            = $this->get_meta( $post_id, 'fygaro_api_key' );
		$config->api_secret         = $this->get_meta( $post_id, 'fygaro_api_secret' );
		$config->payment_button_url = $this->get_meta( $post_id, 'fygaro_payment_button_url' );

		return $config;
	}

	/**
	 * Get gateway.
	 *
	 * @param int $post_id Post ID.
	 * @return Gateway
	 */
	public function get_gateway( $config_id ) {
		return new Gateway( $this->get_config( $config_id ) );
	}
}
