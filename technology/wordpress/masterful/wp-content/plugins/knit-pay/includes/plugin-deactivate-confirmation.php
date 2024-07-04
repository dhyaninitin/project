<?php
// TODO improve it WTE
add_action( 'admin_footer', 'knitpay_enqueue_scripts_deactivate_confirm', 30 );

/**
 * Show confirmation popup box if user tries to deactivate Plugin
 */
function knitpay_enqueue_scripts_deactivate_confirm() {
	 $current_screen = get_current_screen();
	if ( 'plugins' !== $current_screen->id ) {
		return;
	}
	wp_enqueue_script(
		'jquery-ui-dialog',
		'',
		array(
			'jquery',
			'jquery-ui',
		)
	);
	wp_enqueue_style( 'wp-jquery-ui-dialog' );

	echo '
<div id="knitpay-deactivation-confirm"
	style="max-width: 800px;display: none;">
	<p>
		<span class="dashicons dashicons-warning"
			style="float: left; margin: 12px 12px 20px 0;"></span>If you need any
		help with setup or anything else, kindly contact us on Whatsapp at
		+917738456813.
	</p>
</div>
<script>
window.onload = function () {
	document.querySelector(\'[data-slug="knit-pay"] .deactivate a\').addEventListener(\'click\', function (event) {
		event.preventDefault()
		var urlRedirect = document.querySelector(\'[data-slug="knit-pay"] .deactivate a\').getAttribute(\'href\');

		jQuery(document).ready(function ($) {
			$("#knitpay-deactivation-confirm").dialog({
				title: \'Deactivate Knit Pay?\',
				resizable: false,
				height: "auto",
				width: 400,
				modal: true,
				closeOnEscape: true,
				buttons: {
					"Whatsapp Us": function () {
						$(this).dialog("close");
						var redirectWindow = window.open("https://wa.me/917738456813", \'_blank\');
						redirectWindow.location;
					},
					"Deactivate": function () {
						$(this).dialog("close");
						window.location.href = urlRedirect;
					},
					"Close": function () {
						$(this).dialog("close");
					}
				}
			});
		});
	})
}
</script>';
}
