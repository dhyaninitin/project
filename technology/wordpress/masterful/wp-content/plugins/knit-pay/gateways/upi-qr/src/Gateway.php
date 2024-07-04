<?php
namespace KnitPay\Gateways\UpiQR;

use KnitPay\Gateways\Gateway as Core_Gateway;
use Pronamic\WordPress\Pay\Payments\Payment;
use Pronamic\WordPress\Pay\Payments\PaymentStatus;

/**
 * Title: UPI QR Gateway
 * Copyright: 2020-2022 Knit Pay
 *
 * @author Knit Pay
 * @version 1.0.0
 * @since 4.1.0
 */
class Gateway extends Core_Gateway {

	/**
	 * Constructs and initializes an UPI QR gateway
	 *
	 * @param Config $config
	 *            Config.
	 */
	public function __construct( Config $config ) {
		parent::__construct( $config );
		
		$this->config = $config;

		$this->set_method( self::METHOD_HTML_FORM );

		$this->payment_page_title = 'Payment Page';
		
		if ( wp_is_mobile() ) {
			$this->payment_page_description = $config->mobile_payment_instruction;
		} else {
			$this->payment_page_description = $config->payment_instruction;
		}
	}

	/**
	 * Get supported payment methods
	 *
	 * @see Core_Gateway::get_supported_payment_methods()
	 */
	public function get_supported_payment_methods() {
		return [
			PaymentMethods::UPI,
		];
	}

	/**
	 * Get available payment methods.
	 *
	 * @return array<int, string>
	 * @see Core_Gateway::get_available_payment_methods()
	 */
	public function get_available_payment_methods() {
		return $this->get_supported_payment_methods();
	}

	/**
	 * Start.
	 *
	 * @see Core_Gateway::start()
	 *
	 * @param Payment $payment
	 *            Payment.
	 */
	public function start( Payment $payment ) {
		$payment_currency = $payment->get_total_amount()
			->get_currency()
			->get_alphabetic_code();
		if ( isset( $payment_currency ) && 'INR' !== $payment_currency ) {
			$currency_error = 'UPI only accepts payments in Indian Rupees. If you are a store owner, kindly activate INR currency for ' . $payment->get_source() . ' plugin.';
			throw new \Exception( $currency_error );
		}

		$payment->set_transaction_id( $payment->get_id() );

		$payment->set_action_url( $payment->get_pay_redirect_url() );
	}

	/**
	 * Get form HTML.
	 *
	 * @param Payment $payment     Payment to get form HTML for.
	 * @param bool    $auto_submit Flag to auto submit.
	 * @return string
	 * @throws \Exception When payment action URL is empty.
	 */
	public function get_form_html( Payment $payment, $auto_submit = false ) {
		$hide_pay_button = false; // TODO make dynamic
		
		if ( ! wp_is_mobile() ) {
			$hide_pay_button = true;
		}

		// wp_enqueue_script( 'upiwc-qr-code' );
		$data    = $this->get_output_fields( $payment );
		$pay_uri = add_query_arg( $data, 'upi://pay' );
		$html    = '<hr>';
		
		// Show Pay Button after delay.
		
		$html .= '<script type="text/javascript">
                    // Get time after 30 seconds
                    var countDownDate = new Date().getTime() + 30000;
    		    
                    // Update the count down every 1 second
                    var x = setInterval(function() {
    		    
                          // Get today\'s date and time
                          var now = new Date().getTime();
    		    
                          // Find the distance between now and the count down date
                          var distance = countDownDate - now;
    		    
                          // Time calculations for seconds
                          var seconds = Math.ceil((distance % (1000 * 60)) / 1000);
    		    
                          // Output the result in an element with id="timmer"
                          document.getElementById("timmer").innerHTML = seconds + "s";
    		    
                          // If the count down is over, write some text
                          if (distance < 0) {
                            clearInterval(x);
                            document.getElementById("transaction-details").removeAttribute("style");
                            document.getElementById("delay-info").remove();
                          }
                    }, 1000);
                </script>';
		
		if ( ! ( wp_is_mobile() && $this->config->hide_mobile_qr ) ) {
			$html .= '<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>';
			$html .= '<script src="' . KNITPAY_URL . '/gateways/upi-qr/src/js/jquery.qrcode.min.js"></script>';
			$html .= '<div><strong>Scan the QR Code</strong></div><div class="qrcode"></div>';
			$html .= '<script type="text/javascript">
                        $(document).ready(function() {
                            $(".qrcode").qrcode("' . $pay_uri . '");
                        });
                      </script>';
		}
		
		if ( ! ( $hide_pay_button || $this->config->hide_mobile_qr ) ) {
			$html .= '<p>or</p>';
		}

		if ( ! $hide_pay_button ) {
			$html .= '<a class="pronamic-pay-btn" href="' . $pay_uri . '" style="font-size: 15px;">Click here to make the payment</a>';
		}

		$html .= '<hr>';

		// Pay Button.
		$form_inner  = '<span id="transaction-details" style="display: none;"><br><br><label for="transaction_id">Transaction ID:</label>
            <input required type="text" id="transaction_id" name="transaction_id"><br><br>';
		$form_inner .= sprintf(
			'<input class="pronamic-pay-btn" type="submit" name="pay" value="%s" />',
			__( 'Submit', 'pronamic_ideal' )
		);
		$form_inner .= '&nbsp;&nbsp;</span>';
		$form_inner .= "<div id='delay-info'>The \"Submit\" button will be visible after <span id='timmer'>30s</span>.<br><br></div>";
		
		// Cancel Button.
		$form_inner .= sprintf(
			'<input class="pronamic-pay-btn" type="submit" name="pay" value="%s" />',
			__( 'Cancel', 'pronamic_ideal' )
		);

		$html .= sprintf(
			'<form id="pronamic_ideal_form" name="pronamic_ideal_form" method="post" action="%s">%s</form>',
			esc_attr( $payment->get_return_url() ),
			$form_inner
		);

		return $html;

	}

	/**
	 * Get output inputs.
	 *
	 * @see Core_Gateway::get_output_fields()
	 *
	 * @param Payment $payment
	 *            Payment.
	 *
	 * @return array
	 */
	public function get_output_fields( Payment $payment ) {
		$vpa        = $this->config->vpa;
		$payee_name = rawurlencode( $this->config->payee_name );
		if ( empty( $payee_name ) ) {
			$payee_name = get_bloginfo();
		}
		if ( empty( $payee_name ) ) {
			throw new \Exception( 'The Payee Name is blank. Kindly set it from the UPI QR Configuration page.' );
		}
		if ( empty( $vpa ) ) {
			throw new \Exception( 'UPI ID is blank. Kindly set it from the UPI QR Configuration page.' );
		}

		// @see https://developers.google.com/pay/india/api/web/create-payment-method
		$data['pa'] = $vpa;
		$data['pn'] = $payee_name;
		if ( ! empty( $this->config->merchant_category_code ) ) {
			$data['mc'] = $this->config->merchant_category_code;
		}
		$data['tr'] = $payment->get_id();
		// $data['url'] = ''; // Invoice/order details URL
		$data['am'] = $payment->get_total_amount()->number_format( null, '.', '' );
		$data['cu'] = $payment->get_total_amount()->get_currency()->get_alphabetic_code();

		// $data['tid'] = $payment->get_transaction_id();
		$data['tn'] = rawurlencode( substr( trim( ( $payment->get_description() ) ), 0, 75 ) );

		return $data;
	}

	/**
	 * Update status of the specified payment.
	 *
	 * @param Payment $payment
	 *            Payment.
	 */
	public function update_status( Payment $payment ) {
		$transaction_id = filter_input( INPUT_POST, 'transaction_id', FILTER_SANITIZE_STRING );

		if ( empty( $transaction_id ) ) {
			$payment->add_note( 'Transaction ID not provided' );
			$payment->set_status( PaymentStatus::FAILURE );
			return;
		}

		$payment->set_transaction_id( $transaction_id );
		$payment->set_status( $this->config->payment_success_status );
	}
}
