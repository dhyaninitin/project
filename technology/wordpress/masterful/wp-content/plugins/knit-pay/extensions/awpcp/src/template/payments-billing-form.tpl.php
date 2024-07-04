<p><?php _ex( 'Please fill in the billing information in the form below to place your payment.', 'awpcp billing form', 'knit-pay' ); ?></p>

<form class="awpcp-billing-form" method="post">

	<fieldset>
		<div class="awpcp-form-spacer clearfix">
			<label for="awpcp-billing-first-name"><?php _e( 'First Name', 'knit-pay' ); ?></label>
			<input class="textfield required" id="awpcp-billing-first-name" type="text" size="50" name="first_name" value="<?php echo $data->first_name; ?>" data-bind="value: first_name">
		</div>

		<div class="awpcp-form-spacer clearfix">
			<label for="awpcp-billing-last-name"><?php _e( 'Last Name', 'knit-pay' ); ?></label>
			<input class="textfield required" id="awpcp-billing-last-name" type="text" size="50" name="last_name" value="<?php echo $data->last_name; ?>" data-bind="value: last_name">
		</div>

		<div class="awpcp-form-spacer clearfix">
			<label for="awpcp-billing-email"><?php _e( 'Email', 'knit-pay' ); ?></label>
			<input class="textfield required" id="awpcp-billing-email" type="text" size="50" name="email" value="<?php echo $data->user_email; ?>" data-bind="value: email">
		</div>

		 <div class="awpcp-form-spacer clearfix">
			<label for="awpcp-billing-phone"><?php _e( 'Phone', 'knit-pay' ); ?></label>
			<input class="textfield required" id="awpcp-billing-phone" type="text" size="50" name="phone" value="<?php echo $data->phone; ?>" data-bind="value: phone">
		</div>
	</fieldset>
	
	<?php
	if ( isset( $knitpay_error ) ) {
		echo '<div style="display: block;" class="awpcp-message awpcp-error">' . $knitpay_error . '</div>';
	}
	?>
	<p class="awpcp-form-submit">
		<input class="button" type="submit" value="<?php _e( 'Continue', 'knit-pay' ); ?>" id="submit" name="submit">
		<input class="button" type="submit" value="<?php _e( 'Cancel', 'knit-pay' ); ?>" id="submit" name="cancel">
	</p>
</form>
