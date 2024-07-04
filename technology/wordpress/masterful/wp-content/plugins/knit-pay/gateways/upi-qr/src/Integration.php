<?php

namespace KnitPay\Gateways\UpiQR;

use Pronamic\WordPress\Pay\AbstractGatewayIntegration;
use Pronamic\WordPress\Pay\Payments\Payment;
use Pronamic\WordPress\Pay\Payments\PaymentStatus;

/**
 * Title: UPI QR Integration
 * Copyright: 2020-2022 Knit Pay
 *
 * @author  Knit Pay
 * @version 1.0.0
 * @since   4.1.0
 */
class Integration extends AbstractGatewayIntegration {
	/**
	 * Construct UPI QR integration.
	 *
	 * @param array $args Arguments.
	 */
	public function __construct( $args = [] ) {
		$args = wp_parse_args(
			$args,
			[
				'id'       => 'upi-qr',
				'name'     => 'UPI QR (Beta)',
				'url'      => 'http://go.thearrangers.xyz/',
				'provider' => 'upi-qr',
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

		$utm_parameter = '?utm_source=knit-pay&utm_medium=ecommerce-module&utm_campaign=module-admin&utm_content=help-signup';

		$fields[] = [
			'section' => 'general',
			'type'    => 'html',
			'html'    => '<strong>Note:</strong> This payment method is currently in the Beta stage, which means you might face issues while using it. ' .

			'In case you find any issue or you have any feedback to improve it, feel free to <a target="_blank" href="https://www.knitpay.org/contact-us/">contact us</a>.',
		];

		// Steps to Integrate.
		$fields[] = [
			'section' => 'general',
			'type'    => 'html',
			'html'    => '<p>' . __( '<strong>Steps to Integrate UPI QR</strong>' ) . '</p>' .

			'<ol>
                <li>Signup at any UPI-enabled App. If you will signup using provided signup URLs and use the referral codes, you might also get a bonus after making few payments.
                    <ul>
                        <li>- <a target="_blank" href="' . $this->get_url() . 'open-money' . $utm_parameter . '">Open Money</a></li>
                        <li>- <a target="_blank" href="' . $this->get_url() . 'gpay' . $utm_parameter . '">Google Pay</a> Referral Code: Z05o0</li>
                        <li>- <a target="_blank" href="' . $this->get_url() . 'phonepe' . $utm_parameter . '">PhonePe</a></li>
                        <li>- <a target="_blank" href="' . $this->get_url() . 'amazon-pay' . $utm_parameter . '">Amazon Pay</a> Referral Code: K1ZESF</li>
                        <li>- <a target="_blank" href="' . $this->get_url() . 'bharatpe' . $utm_parameter . '">BharatPe (' . $this->get_url() . 'bharatpe)</a> - Open referral link on phone to get upto 1000 free BharatPe Runs.</li>
                        <li>- <a target="_blank" href="https://play.google.com/store/search?q=upi&c=apps">More UPI Apps</a></li>
                    </ul>
                </li>
		    
                <li>Link your Bank Account and generate a UPI ID/VPA.</li>
		    
                <li>Use this VPA/UPI ID on the configuration page below.
                <br><strong>Kindly use the correct VPA/UPI ID. In case of wrong settings, payments will get credited to the wrong bank account. Knit Pay will not be responsible for any of your lose.</strong></li>
		    
                <li>Save the settings.</li>
		    
                <li>Before going live, make a test payment of ₹1 and check that you are receiving this payment in the correct bank account.</li>
		    
            </ol>',
		];

		// How does it work.
		$fields[] = [
			'section' => 'general',
			'type'    => 'html',
			'html'    => '<p>' . __( '<strong>How does it work?</strong>' ) . '</p>' .

			'<ol>
                <li>On the payment screen, the customer scans the QR code using any UPI-enabled mobile app and makes the payment.</li>
		    
                <li>The customer enters the transaction ID and submits the payment form.</li>
		    
                <li>Payment remains on hold. Merchant manually checks the payment and mark it as complete on the "Knit Pay" Payments page.</li>
		    
                <li>Automatic tracking is not available in the UPI QR payment method. You can signup at other supported free payment gateways to get an automatic payment tracking feature.
                    <br><a target="_blank" href="https://www.knitpay.org/indian-payment-gateways-supported-in-knit-pay/">Indian Payment Gateways Supported in Knit Pay</a>
                </li>
		    
            </ol>',
		];

		// Payee name or business name.
		$fields[] = [
			'section'  => 'general',
			'filter'   => FILTER_SANITIZE_STRING,
			'meta_key' => '_pronamic_gateway_upi_qr_payee_name',
			'title'    => __( 'Payee Name or Business Name', 'knit-pay' ),
			'type'     => 'text',
			'classes'  => [ 'regular-text', 'code' ],
		];

		// UPI VPA ID
		$fields[] = [
			'section'  => 'general',
			'filter'   => FILTER_SANITIZE_STRING,
			'meta_key' => '_pronamic_gateway_upi_qr_vpa',
			'title'    => __( 'UPI VPA ID', 'knit-pay' ),
			'type'     => 'text',
			'classes'  => [ 'regular-text', 'code' ],
			'tooltip'  => __( 'UPI/VPA ID which you want to use to receive the payment.', 'knit-pay' ),
		];

		// Merchant category code.
		$fields[] = [
			'section'     => 'general',
			'filter'      => FILTER_SANITIZE_STRING,
			'meta_key'    => '_pronamic_gateway_upi_qr_merchant_category_code',
			'title'       => __( 'Merchant Category Code', 'knit-pay' ),
			'type'        => 'text',
			'classes'     => [ 'regular-text', 'code' ],
			'tooltip'     => __( 'four-digit ISO 18245 merchant category code (MCC) to classify your business.', 'knit-pay' ),
			'description' => 'You can refer to below links to find out your MCC.<br>' .
							 '<a target="_blank" href="https://www.citibank.com/tts/solutions/commercial-cards/assets/docs/govt/Merchant-Category-Codes.pdf">Citi Bank - Merchant Category Codes</a><br>' .
							 '<a target="_blank" href="https://docs.checkout.com/resources/codes/merchant-category-codes">Checkout.com - Merchant Category Codes</a><br>',
		];
		
		// Payment Instruction.
		$fields[] = [
			'section'  => 'general',
			'filter'   => FILTER_SANITIZE_STRING,
			'meta_key' => '_pronamic_gateway_upi_qr_payment_instruction',
			'title'    => __( 'Payment Instruction', 'knit-pay' ),
			'type'     => 'text',
			'classes'  => [ 'large-text', 'code' ],
			'default'  => __( 'Scan the QR Code with any UPI apps like BHIM, Paytm, Google Pay, PhonePe, or any Banking UPI app to make payment for this order. After successful payment, enter the UPI Reference ID or Transaction Number submit the form. We will manually verify this payment against your 12-digits UPI Reference ID or Transaction Number (eg. 001422121258).', 'knit-pay' ),
			'tooltip'  => __( 'It will be displayed to customers while making payment using destop devices.', 'knit-pay' ),
		];
		
		// Payment Instruction.
		$fields[] = [
			'section'  => 'general',
			'filter'   => FILTER_SANITIZE_STRING,
			'meta_key' => '_pronamic_gateway_upi_qr_mobile_payment_instruction',
			'title'    => __( 'Mobile Payment Instruction', 'knit-pay' ),
			'type'     => 'text',
			'classes'  => [ 'large-text', 'code' ],
			'default'  => __( 'Scan the QR Code with any UPI apps like BHIM, Paytm, Google Pay, PhonePe, or any Banking UPI app to make payment for this order. After successful payment, enter the UPI Reference ID or Transaction Number submit the form. We will manually verify this payment against your 12-digits UPI Reference ID or Transaction Number (eg. 001422121258).', 'knit-pay' ),
			'tooltip'  => __( 'It will be displayed to customers while making payment using mobile devices.', 'knit-pay' ),
		];
		
		// Payment Success Status.
		$payment_success_statuses = [
			[
				'options' => [
					PaymentStatus::ON_HOLD => PaymentStatus::ON_HOLD,
					PaymentStatus::OPEN    => __( 'Pending', 'knit-pay-lang' ),
					PaymentStatus::SUCCESS => PaymentStatus::SUCCESS,
				],
			],
		];
		$fields[]                 = [
			'section'  => 'general',
			'filter'   => FILTER_SANITIZE_STRING,
			'meta_key' => '_pronamic_gateway_upi_qr_payment_success_status',
			'title'    => __( 'Payment Success Status', 'knit-pay-lang' ),
			'type'     => 'select',
			'options'  => $payment_success_statuses,
			'default'  => PaymentStatus::ON_HOLD,
		];
		
		// Send Email.
		$fields[] = [
			'section'  => 'general',
			'filter'   => FILTER_VALIDATE_BOOLEAN,
			'meta_key' => '_pronamic_gateway_upi_qr_hide_mobile_qr',
			'title'    => __( 'Hide Mobile QR Code', 'knit-pay' ),
			'type'     => 'checkbox',
			'default'  => false,
			'label'    => __( 'Select to Hide QR Code on Mobile.', 'knit-pay' ),
		];

		// Return fields.
		return $fields;
	}

	public function get_config( $post_id ) {
		$config = new Config();

		$config->vpa                        = $this->get_meta( $post_id, 'upi_qr_vpa' );
		$config->payee_name                 = $this->get_meta( $post_id, 'upi_qr_payee_name' );
		$config->merchant_category_code     = $this->get_meta( $post_id, 'upi_qr_merchant_category_code' );
		$config->payment_instruction        = $this->get_meta( $post_id, 'upi_qr_payment_instruction' );
		$config->mobile_payment_instruction = $this->get_meta( $post_id, 'upi_qr_mobile_payment_instruction' );
		$config->payment_success_status     = $this->get_meta( $post_id, 'upi_qr_payment_success_status' );
		$config->hide_mobile_qr             = $this->get_meta( $post_id, 'upi_qr_hide_mobile_qr' );
		
		if ( empty( $config->payment_success_status ) ) {
			$config->payment_success_status = PaymentStatus::ON_HOLD;
		}

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
