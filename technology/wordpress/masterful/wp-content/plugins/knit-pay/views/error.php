<?php
/**
 * Error
 *
 * @author    Pronamic <info@pronamic.eu>
 * @copyright 2005-2022 Pronamic
 * @license   GPL-3.0-or-later
 * @package   Pronamic\WordPress\Pay
 */

if ( is_wp_error( $pay_error ) ) : ?>

	<div class="error">
		<?php

		foreach ( $pay_error->get_error_codes() as $code ) {
			?>
			<dl>
				<dt><?php esc_html_e( 'Code', 'pronamic_ideal' ); ?></dt>
				<dd><?php echo esc_html( $code ); ?></dd>

				<dt><?php esc_html_e( 'Message', 'pronamic_ideal' ); ?></dt>
				<dd><?php echo esc_html( $pay_error->get_error_message( $code ) ); ?></dd>
			</dl>

			<?php
		}

		?>
	</div>

<?php endif; ?>
