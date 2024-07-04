<?php
/**
 * Knit Pay Settings.
 */
use Pronamic\WordPress\Pay\Plugin;

$wp_travel_engine_settings = get_option( 'wp_travel_engine_settings' );
?>
<div style="margin-bottom: 40px;" class="wpte-info-block">
	<b><?php _e( 'Note:', 'knit-pay' ); ?></b>
	<p><?php _e( 'WP Travel Engine has done major changes in payment processing in v 4.3.0 and the new version of WP Travel Engine Payments is currently not stable and still under development. Knit Pay now compatible with the new version of WP Travel Engine and will not work with the old version of WP Travel Engine.', 'knit-pay' ); ?></p>
	<p>This version is currently under Beta and you might face some issues while using it. Kindly report the issue to Knit Pay if you find any bugs.</p>
</div>
		
<div class="wpte-field wpte-select wpte-floated">
	<label class="wpte-field-label"><?php esc_html_e( 'Configuration', 'wp-travel-engine' ); ?></label>
	<select name="wp_travel_engine_settings[knit_pay_config_id]">
			<?php
			// TODO Add remaining settings

			// TODO: remove hardcoded
			$payment_method = 'knit_pay';
			$configurations = Plugin::get_config_select_options( $payment_method );
			$default        = $wp_travel_engine_settings['knit_pay_config_id'];
			if ( empty( $default ) ) {
				$default = get_option( 'pronamic_pay_config_id' );
			}
			foreach ( $configurations as $key => $configuration ) :
				?>
				<option
				<?php selected( $default, $key ); ?>
			value="<?php echo esc_attr( $key ); ?>"><?php echo esc_html( $configuration ); ?></option>
				<?php
			endforeach;
			?>
		</select> <span class="wpte-tooltip"><?php echo ( 'Configurations can be created in Knit Pay gateway configurations page at <a href="' . admin_url() . 'edit.php?post_type=pronamic_gateway">"Knit Pay >> Configurations"</a>.' ); ?></span>
</div>
<?php
