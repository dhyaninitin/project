<?php
/**
 * Admin View: Notice - Missing Instamojo Email
 *
 * @author    Knit Pay
 * @copyright 2020-2022 Knit Pay
 * @license   GPL-3.0-or-later
 */

use Pronamic\WordPress\Pay\Admin\AdminGatewayPostType;

if ( ! defined( 'WPINC' ) ) {
	die;
}

// Get Razorpay config IDs without company name.
$config_ids = get_transient( 'knit_pay_instamojo_with_missing_email' );

if ( ! is_array( $config_ids ) ) {
	return;
}

// Build gateways list.
$gateways = [];

foreach ( $config_ids as $config_id ) :
	if ( AdminGatewayPostType::POST_TYPE !== get_post_type( $config_id ) ) {
		continue;
	}

	$gateways[] = sprintf(
		'<a href="%1$s" title="%2$s">%2$s</a>',
		get_edit_post_link( $config_id ),
		get_the_title( $config_id )
	);

endforeach;

// Don't show notice if non of the gateways exists.
if ( empty( $gateways ) ) {
	// Delete transient.
	delete_transient( 'knit_pay_instamojo_with_missing_email' );

	return;
}

?>
<div class="notice notice-warning">
	<p>
		<strong><?php esc_html_e( 'Knit Pay', 'knit-pay' ); ?></strong> —
		<?php

		$message = sprintf(
			/* translators: 1: configuration link(s) */
			_n(
				'The "Instamojo Account Email Address" field is missing in the configuration. Kindly configure it on %1$s Configuration.',
				'The "Instamojo Account Email Address" field is missing in the configuration. Kindly configure it on %1$s Configurations.',
				count( $config_ids ),
				'knit-pay'
			),
			implode( ', ', $gateways ) // WPCS: xss ok.
		);

		echo wp_kses(
			$message,
			[
				'a' => [
					'href'  => true,
					'title' => true,
				],
			]
		);

		?>
	</p>
</div>
