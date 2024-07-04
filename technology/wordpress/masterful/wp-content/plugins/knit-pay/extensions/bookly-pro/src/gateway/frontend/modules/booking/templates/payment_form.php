<?php

use Pronamic\WordPress\Pay\Core\PaymentMethods;
use KnitPay\Extensions\BooklyPro\Extension;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$payment_form = '';

$active_payment_methods = Extension::get_active_payment_methods();
foreach ( $active_payment_methods as $payment_method ) {
	if ( ! get_option( 'bookly_' . $payment_method . '_enabled' ) ) {
		continue;
	}

	$payment_form .= '<div class="bookly-gateway-buttons pay-' . $payment_method . ' bookly-box bookly-nav-steps" style="display:none">';
	$payment_form .= BooklyKnitPay\Lib\Payment\KnitPay::renderForm( $form_id, $page_url, $payment_method );
	$payment_form .= '</div>';
}

$payment_form .= '<script>function disableKnitPayButton(){Ladda.create(event.submitter).start()}</script>';

echo $payment_form;
