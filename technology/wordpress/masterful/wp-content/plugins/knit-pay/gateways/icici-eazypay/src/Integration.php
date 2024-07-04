<?php

namespace KnitPay\Gateways\IciciEazypay;

use Pronamic\WordPress\Pay\AbstractGatewayIntegration;
use Pronamic\WordPress\Pay\Payments\Payment;

/**
 * Title: ICICI Eazypay Integration
 * Copyright: 2020-2022 Knit Pay
 *
 * @author  Knit Pay
 * @version 6.62.0.0
 * @since   6.62.0.0
 */
class Integration extends AbstractGatewayIntegration {
	/**
	 * Construct ICICI Eazypay integration.
	 *
	 * @param array $args Arguments.
	 */
	public function __construct( $args = [] ) {
		$args = wp_parse_args(
			$args,
			[
				'id'            => 'icici-eazypay',
				'name'          => 'ICICI Eazypay',
				'url'           => 'http://go.thearrangers.xyz/icici-eazypay?utm_source=knit-pay&utm_medium=ecommerce-module&utm_campaign=module-admin&utm_content=',
				'product_url'   => 'http://go.thearrangers.xyz/icici-eazypay?utm_source=knit-pay&utm_medium=ecommerce-module&utm_campaign=module-admin&utm_content=product-url',
				'dashboard_url' => 'http://go.thearrangers.xyz/icici-eazypay?utm_source=knit-pay&utm_medium=ecommerce-module&utm_campaign=module-admin&utm_content=dashboard-url',
				'provider'      => 'icici-eazypay',
			]
		);

		parent::__construct( $args );
	}

	/**
	 * Get settings fields.
	 *
	 * @return array
	 */
	public function get_settings_fields() {
		$fields = [];

		// Merchant ID/ICID.
		$fields[] = [
			'section'  => 'general',
			'filter'   => FILTER_SANITIZE_STRING,
			'meta_key' => '_pronamic_gateway_icici_eazypay_merchant_id',
			'title'    => __( 'Merchant ID/ICID', 'knit-pay' ),
			'type'     => 'text',
			'classes'  => [ 'regular-text', 'code' ],
		];
		
		// Encryption Key.
		$fields[] = [
			'section'  => 'general',
			'filter'   => FILTER_SANITIZE_STRING,
			'meta_key' => '_pronamic_gateway_icici_eazypay_encryption_key',
			'title'    => __( 'Encryption Key', 'knit-pay' ),
			'type'     => 'text',
			'classes'  => [ 'regular-text', 'code' ],
		];
		
		// Mandatory Fields.
		$fields[] = [
			'section'     => 'general',
			'filter'      => FILTER_SANITIZE_STRING,
			'meta_key'    => '_pronamic_gateway_icici_eazypay_mandatory_fields',
			'title'       => __( 'Mandatory Fields', 'knit-pay' ),
			'type'        => 'text',
			'classes'     => [ 'regular-text', 'code' ],
			'description' => $this->fields_description(),
		];
		
		// Optional Fields.
		$fields[] = [
			'section'     => 'general',
			'filter'      => FILTER_SANITIZE_STRING,
			'meta_key'    => '_pronamic_gateway_icici_eazypay_optional_fields',
			'title'       => __( 'Optional Fields', 'knit-pay' ),
			'type'        => 'text',
			'classes'     => [ 'regular-text', 'code' ],
			'description' => $this->fields_description(),
		];

		// Return fields.
		return $fields;
	}

	public function get_config( $post_id ) {
		$config = new Config();

		$config->merchant_id      = $this->get_meta( $post_id, 'icici_eazypay_merchant_id' );
		$config->encryption_key   = $this->get_meta( $post_id, 'icici_eazypay_encryption_key' );
		$config->mandatory_fields = $this->get_meta( $post_id, 'icici_eazypay_mandatory_fields' );
		$config->optional_fields  = $this->get_meta( $post_id, 'icici_eazypay_optional_fields' );

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
	
	private function fields_description() {
		return sprintf( __( 'Available tags: %s', 'knit-pay-lang' ), sprintf( '<code>%s</code> <code>%s</code> <code>%s</code> <code>%s</code> <code>%s</code> <code>%s</code> <code>%s</code>', '{reference_no}', '{amount}', '{phone}', '{customer_name}', '{purpose}', '{order_id}', '{sub_merchant_id}' ) );
	}
}
