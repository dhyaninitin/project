<?php

/**
 * Custom Header
 *
 * @package october
 */

if (!function_exists('october_custom_header_setup')) {
	function october_custom_header_setup() {
		add_theme_support( 'custom-header', apply_filters( 'october_custom_header_args', array(
			'default-image'          => '',
			'default-text-color'     => '',
			'width'                  => 1000,
			'height'                 => 250,
			'flex-height'            => true,
			'wp-head-callback'       => 'october_header_style',
		) ) );

	}
}
add_action( 'after_setup_theme', 'october_custom_header_setup' );

if ( ! function_exists( 'october_header_style' ) ) {
	function october_header_style() {
		$header_image = get_header_image();

		if ( !empty($header_image) ) : ?>
		<style type="text/css">
			.navbar {
		    	background-image: url(<?php echo esc_url( $header_image ); ?>);
				background-position: center;
				background-size: cover;
				background-repeat: no-repeat;
			}
		</style>
		<?php
	   endif;
	}
}
