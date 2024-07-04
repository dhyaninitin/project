<?php

/**
 * Theme Customizer
 *
 * @package october
 */

if (!function_exists('october_customize_preview_js')) {
	function october_customize_preview_js() {
		wp_enqueue_script( 'october_customizer', T_URI . '/assets/js/customizer.js', array( 'customize-preview' ), null, true );

		wp_localize_script( 'october_customizer', 'wp_customizer', array(
			'ajax_url' => admin_url( 'admin-ajax.php' ),
			'theme_url' => get_theme_file_path(),
			'site_name' => get_bloginfo( 'name' )
		));
	}
}
add_action( 'customize_preview_init', 'october_customize_preview_js' );

if (!function_exists('october_button_customize_js')) {
	function october_button_customize_js(){
		wp_enqueue_script( 'october_customizer', T_URI . '/assets/js/customizer.js', array( 'customize-controls' ), null, true );
	}
}
add_action( 'customize_controls_enqueue_scripts', 'october_button_customize_js' );
