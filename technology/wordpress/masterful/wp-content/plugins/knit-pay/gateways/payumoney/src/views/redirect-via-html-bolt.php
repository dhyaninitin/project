<?php
/**
 * Redirect via HTML
 *
 * @author    Knit Pay
 * @copyright 2020-2022 Knit Pay
 * @license   GPL-3.0-or-later
 * @package   KnitPay\Gateways\PayUmoney
 */
?>
<!DOCTYPE html>

<html <?php language_attributes(); ?>>
<head>
<!-- <meta charset="<?php bloginfo( 'charset' ); ?>" /> -->

<title><?php esc_html_e( 'Redirecting…', 'pronamic_ideal' ); ?></title>

		<?php
		// TODO use default page and remove this page.

		wp_print_styles( 'pronamic-pay-redirect' );

		// TODO: LIVE
		$head  = '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" >';
		$head .= '<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js"></script>';
		$head .= '<script id="bolt" src="' . $this->client->get_bolt_url() . '" bolt-color="' . $bolt_color . '" bolt-logo="' . $bolt_logo . '"></script>';

		$head .= '<script id="bolt-call" src="' . plugins_url( '', dirname( __FILE__ ) ) . '/js/bolt.js"></script>';

		echo $head;

		?>
		
		<script>
		// Break out of iframe.
		if ( window.top.location !== window.location ) {
			window.top.location = window.location;
		}
		</script>
	</head>

	<?php

	$auto_submit = true;

	if ( PRONAMIC_PAY_DEBUG ) {
		$auto_submit = false;
	}

	$onload = $auto_submit ? 'document.forms[0].submit();' : '';

	?>

	<body onload="<?php esc_attr( $onload ); ?>">
	<div class="pronamic-pay-redirect-page">
		<div class="pronamic-pay-redirect-container">
			<h1><?php esc_html_e( 'Redirecting…', 'pronamic_ideal' ); ?></h1>

			<p>
					<?php esc_html_e( 'You will be automatically redirected to the online payment environment.', 'pronamic_ideal' ); ?>
				</p>

			<p>
					<?php esc_html_e( 'Please click the button below if you are not automatically redirected.', 'pronamic_ideal' ); ?>
				</p>

				<?php

    // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				// echo $this->get_output_html($payment);
				echo $this->get_form_html( $payment, $auto_submit );

				?>
			</div>
	</div>
</body>
</html>
