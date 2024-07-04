<?php

// ACF functions

function october_generate_options_css() {
   ob_start();
   require(F_PATH . '/custom-styles.php');
   $css = ob_get_clean();

   global $wp_filesystem;

   if( is_null( $wp_filesystem ) )
       WP_Filesystem();

   $filename = T_PATH . '/assets/css/custom-styles.css';

   $wp_filesystem->put_contents($filename, $css, LOCK_EX);
   chmod($filename, 0664);
}
add_action('acf/save_post', 'october_generate_options_css', 20);

if ( ! function_exists( 'october_acf_init' ) ) {
   function october_acf_init() {

   	if( function_exists('acf_add_options_page') ) {

   		$option_page = acf_add_options_page(array(
   			'page_title' 	=> __('Theme Settings', 'october'),
   			'menu_title' 	=> __('Theme Settings', 'october'),
   			'menu_slug' 	=> 'theme-settings',
   		));

         acf_add_options_sub_page(array(
      		'page_title' 	=> __('General Options', 'october'),
      		'menu_title'	=> __('General Options', 'october'),
      		'parent_slug'	=> 'theme-settings',
      	));

         acf_add_options_sub_page(array(
      		'page_title' 	=> __('Header Options', 'october'),
      		'menu_title'	=> __('Header Options', 'october'),
      		'parent_slug'	=> 'theme-settings',
      	));

      	acf_add_options_sub_page(array(
      		'page_title' 	=> __('Footer Options', 'october'),
      		'menu_title'	=> __('Footer Options', 'october'),
      		'parent_slug'	=> 'theme-settings',
      	));

   	}

   }
}
add_action('acf/init', 'october_acf_init');

function october_acf_json_save_point( $path ) {
	$path = F_PATH . '/acf/acf-json';

	return $path;
}
add_filter( 'acf/settings/save_json', 'october_acf_json_save_point' );

function october_acf_json_load_point( $paths ) {
	unset( $paths[0] );
	$paths[] = F_PATH . '/acf/acf-json';

	return $paths;
}
add_filter( 'acf/settings/load_json', 'october_acf_json_load_point' );


?>
