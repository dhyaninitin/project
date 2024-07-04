<?php

/**
 * The template for requried actions hooks
 *
 * @package october
 */

add_action( 'widgets_init', 'october_register_widgets' );
add_action( 'wp_enqueue_scripts', 'october_enqueue_scripts' );
add_action( 'tgmpa_register', 'october_register_required_plugins' );

// Register Sidebar

if ( ! function_exists('october_register_widgets' ) ) {
	function october_register_widgets() {
		register_sidebar(
			array(
				'id' 					=> 'sidebar-1',
				'name' 				=> __( 'Sidebar' , 'october'),
				'before_widget' 	=> '<div class="widget %2$s">',
				'after_widget' 	=> '</div>',
				'before_title' 	=> '<h3 class="title-w">',
				'after_title' 		=> '</h3>',
				'description' 		=> __( 'Drag the widgets for sidebars.', 'october')
			)
		);

		register_sidebar(array(
			 'id' => 'footer-1',
			 'name' => __('First Footer Widget Area', 'october'),
			 'description' => __('The first footer widget area', 'october'),
			 'before_widget' => '<div class="widget_area">',
			 'after_widget' => '</div>',
			 'before_title' => '<span class="widget_title">',
			 'after_title' => '</span>',
		));

		register_sidebar(array(
			 'id' => 'footer-2',
			 'name' => __('Second Footer Widget Area', 'october'),
			 'description' => __('The second footer widget area', 'october'),
			 'before_widget' => '<div class="widget_area">',
			 'after_widget' => '</div>',
			 'before_title' => '<span class="widget_title">',
			 'after_title' => '</span>',
		));

		register_sidebar(array(
			 'id' => 'footer-3',
			 'name' => __('Third Footer Widget Area', 'october'),
			 'description' => __('The third footer widget area', 'october'),
			 'before_widget' => '<div class="widget_area">',
			 'after_widget' => '</div>',
			 'before_title' => '<span class="widget_title">',
			 'after_title' => '</span>',
		));

		register_sidebar(array(
			 'id' => 'footer-4',
			 'name' => __('Fourth Footer Widget Area', 'october'),
			 'description' => __('The fourth footer widget area', 'october'),
			 'before_widget' => '<div class="widget_area">',
			 'after_widget' => '</div>',
			 'before_title' => '<span class="widget_title">',
			 'after_title' => '</span>',
		));
	}
}

/**
 * Register Google fonts.
 *
 * @return string Google fonts URL for the theme.
 */

if ( ! function_exists('october_fonts_url' ) ) {
	function october_fonts_url() {
		$font_url = '';

		/*
		Translators: If there are characters in your language that are not supported
		by chosen font(s), translate this to 'off'. Do not translate into your own language.
		*/
		if ( 'off' !== esc_html_x( 'on', 'Google font: on or off', 'october' ) ) {
			$font_url = add_query_arg( 'family', 'Open+Sans:300,400,600,700,800&subset=latin,latin-ext', "//fonts.googleapis.com/css" );
		}
		return $font_url;

	}
}

/**
* @ return null
* @ param none
* @ loads all the js and css script to frontend
*/
if ( ! function_exists('october_enqueue_scripts' ) ) {
	function october_enqueue_scripts() {

		// Theme Options
		$october = wp_get_theme();

		// Include CSS
		wp_enqueue_style( 'bootstrap', T_URI . '/assets/css/bootstrap.min.css', '', apply_filters( 'october_version_filter', $october->get( 'Version' ) ) );
		wp_enqueue_style( 'animate', T_URI . '/assets/css/animate.min.css', array(), apply_filters( 'october_version_filter', $october->get( 'Version' ) ) );
		wp_enqueue_style( 'font-awesome', 'https://use.fontawesome.com/releases/v5.8.2/css/all.css', array(), apply_filters( 'october_version_filter', $october->get( 'Version' ) ) );
		wp_enqueue_style( 'owl-carousel', T_URI . '/assets/css/owl.carousel.min.css', '', apply_filters( 'october_version_filter', $october->get( 'Version' ) ) );
		wp_enqueue_style( 'owl-theme', T_URI . '/assets/css/owl.theme.default.min.css', '', apply_filters( 'october_version_filter', $october->get( 'Version' ) ) );
		wp_enqueue_style( 'october-core',  T_URI . '/assets/css/style.min.css', '', apply_filters( 'october_version_filter', $october->get( 'Version' )) );
		if(file_exists(T_PATH . '/assets/css/custom-styles.css')) {
			wp_enqueue_style( 'custom-styles',  T_URI . '/assets/css/custom-styles.css', '', apply_filters( 'october_version_filter', $october->get( 'Version' )) );
		}

		/* Theme main style file */
		wp_enqueue_style(
		  'custom-style',
		  get_stylesheeT_URI()
		);
		$url_main_top = esc_url(get_theme_mod("main_top_image"), 'october');
		$url_about = esc_url(get_theme_mod("about_image"), 'october');
		$custom_css = "
		 .main-top {
			  background: url($url_main_top) 100% center no-repeat;
			  background-size: cover;
		  }

		  .about .image {
			  background-image: url($url_about);
		  }";
		wp_add_inline_style('custom-style', $custom_css);

		// Include Scripts
		wp_enqueue_script( 'bootstrap', T_URI . '/assets/js/bootstrap.min.js', array('jquery'), apply_filters( 'october_version_filter', $october->get( 'Version' )) , true );
		wp_enqueue_script( 'jquery.easing', T_URI . '/assets/js/jquery.easing.min.js', array('jquery'), apply_filters( 'october_version_filter', $october->get( 'Version' )) , true );
		wp_enqueue_script( 'jquery.magnific-popup', T_URI . '/assets/js/jquery.magnific-popup.min.js', array('jquery'), apply_filters( 'october_version_filter', $october->get( 'Version' )) , true );
		wp_enqueue_script( 'jquery.localScroll', T_URI . '/assets/js/jquery.localScroll.min.js', array('jquery'), apply_filters( 'october_version_filter', $october->get( 'Version' )) , true );
		wp_enqueue_script( 'jquery.scrollTo', T_URI . '/assets/js/jquery.scrollTo.min.js', array('jquery'), apply_filters( 'october_version_filter', $october->get( 'Version' )) , true );
		wp_enqueue_script( 'owl-carousel', T_URI . '/assets/js/owl.carousel.min.js', array('jquery'), apply_filters( 'october_version_filter', $october->get( 'Version' )) , true );
		wp_enqueue_script( 'parallax', T_URI . '/assets/js/parallax.min.js', array('jquery'), apply_filters( 'october_version_filter', $october->get( 'Version' )) , true );
		wp_enqueue_script( 'wow', T_URI . '/assets/js/wow.min.js', array('jquery'), apply_filters( 'october_version_filter', $october->get( 'Version' )) , true );
		wp_enqueue_script( 'october-script', T_URI . '/assets/js/script.js', array('jquery'), apply_filters( 'october_version_filter', $october->get( 'Version' ) ), true  );

		/* Add custom fonts, used in the main stylesheet */
		wp_enqueue_style('october-fonts', october_fonts_url(), array(), null);

		// Add TinyMCE Style
		add_editor_style();

		if ( is_singular() ) {
			wp_enqueue_script( 'comment-reply' );
		}

		// Add Custom CSS
		if(function_exists('get_field') && !empty(get_field('custom_css', 'option'))) {
			wp_add_inline_style( 'october-style', get_field('custom_css', 'option') );
		}

		// Add Custom JS
		if(function_exists('get_field') && !empty(get_field('custom_js', 'option'))) {
			wp_add_inline_script( 'october-script', get_field('custom_js', 'option') );
		}

	}
}

// Include Plugins

if(!function_exists('october_register_required_plugins')) {
	function october_register_required_plugins() {

		$plugins = array(

			array(
				'name'     					=> 'October Core', // The plugin name
				'slug'     					=> 'october-core', // The plugin slug (typically the folder name)
				'source'   					=> T_PATH . '/plugins/october-core.zip', // The plugin source
				'required' 					=> true, // If false, the plugin is only 'recommended' instead of required
				'version' 					=> '1.1', // E.g. 1.0.0. If set, the active plugin must be this version or higher, otherwise a notice is presented
				'force_activation' 		=> false, // If true, plugin is activated upon theme activation and cannot be deactivated until theme switch
				'force_deactivation' 	=> false, // If true, plugin is deactivated upon theme switch, useful for theme-specific plugins
				'external_url' 			=> '', // If set, overrides default API URL and points to an external URL
			),
			array(
				'name'     					=> 'Advanced Custom Fields PRO', // The plugin name
				'slug'     					=> 'advanced-custom-fields-pro', // The plugin slug (typically the folder name)
				'source'   					=> T_PATH . '/plugins/advanced-custom-fields-pro.zip', // The plugin source
				'required' 					=> false, // If false, the plugin is only 'recommended' instead of required
				'version' 					=> '', // E.g. 1.0.0. If set, the active plugin must be this version or higher, otherwise a notice is presented
				'force_activation' 		=> false, // If true, plugin is activated upon theme activation and cannot be deactivated until theme switch
				'force_deactivation' 	=> false, // If true, plugin is deactivated upon theme switch, useful for theme-specific plugins
				'external_url' 			=> '', // If set, overrides default API URL and points to an external URL
			),
			array(
				'name'     					=> 'Contact Form 7', // The plugin name
				'slug'     					=> 'contact-form-7', // The plugin slug (typically the folder name)
				'required' 					=> false, // If false, the plugin is only 'recommended' instead of required
				'version' 					=> '', // E.g. 1.0.0. If set, the active plugin must be this version or higher, otherwise a notice is presented
				'force_activation' 		=> false, // If true, plugin is activated upon theme activation and cannot be deactivated until theme switch
				'force_deactivation' 	=> false, // If true, plugin is deactivated upon theme switch, useful for theme-specific plugins
				'external_url' 			=> '', // If set, overrides default API URL and points to an external URL
			),
			array(
				'name'     					=> 'MailChimp for WordPress', // The plugin name
				'slug'     					=> 'mailchimp-for-wp', // The plugin slug (typically the folder name)
				'required' 					=> false, // If false, the plugin is only 'recommended' instead of required
				'version' 					=> '', // E.g. 1.0.0. If set, the active plugin must be this version or higher, otherwise a notice is presented
				'force_activation' 		=> false, // If true, plugin is activated upon theme activation and cannot be deactivated until theme switch
				'force_deactivation' 	=> false, // If true, plugin is deactivated upon theme switch, useful for theme-specific plugins
				'external_url' 			=> '', // If set, overrides default API URL and points to an external URL
			),
			array(
				'name' 						=> 'Envato Market', // The plugin name
				'slug' 						=> 'envato-market', // The plugin slug (typically the folder name)
				'source' 					=> T_PATH . '/plugins/envato-market.zip',
				'required' 					=> false, // If false, the plugin is only 'recommended' instead of required
				'version' 					=> '', // E.g. 1.0.0. If set, the active plugin must be this version or higher, otherwise a notice is presented
				'force_activation' 		=> false, // If true, plugin is activated upon theme activation and cannot be deactivated until theme switch
				'force_deactivation' 	=> false, // If true, plugin is deactivated upon theme switch, useful for theme-specific plugins
				'external_url' 			=> '', // If set, overrides default API URL and points to an external URL
			),
			array(
				'name' 						=> 'One Click Demo Import', // The plugin name
				'slug' 						=> 'one-click-demo-import', // The plugin slug (typically the folder name)
				'required' 					=> false, // If false, the plugin is only 'recommended' instead of required
				'version' 					=> '', // E.g. 1.0.0. If set, the active plugin must be this version or higher, otherwise a notice is presented
				'force_activation' 		=> false, // If true, plugin is activated upon theme activation and cannot be deactivated until theme switch
				'force_deactivation' 	=> false, // If true, plugin is deactivated upon theme switch, useful for theme-specific plugins
				'external_url' 			=> '', // If set, overrides default API URL and points to an external URL
			),


		);

		/**
		 * Array of configuration settings. Amend each line as needed.
		 * If you want the default strings to be available under your own theme domain,
		 * leave the strings uncommented.
		 * Some of the strings are added into a sprintf, so see the comments at the
		 * end of each line for what each argument will be.
		 */
		$config = array(
			'domain'       								=> 'october', // Text domain - likely want to be the same as your theme.
			'default_path' 								=> '', // Default absolute path to pre-packaged plugins
			'menu'         								=> 'tgmpa-install-plugins', // Menu slug
			'has_notices'      							=> true, // Show admin notices or not
			'is_automatic'    							=> true, // Automatically activate plugins after installation or not
			'message' 										=> '', // Message to output right before the plugins table
			'strings'      								=> array(
			'page_title'                       		=> __( 'Install Required Plugins', 'october' ),
			'menu_title'                       		=> __( 'Install Plugins', 'october' ),
			'installing'                       		=> __( 'Installing Plugin: %s', 'october' ), // %1$s = plugin name
			'oops'                             		=> __( 'Something went wrong with the plugin API.', 'october' ),
			'notice_can_install_required'     		=> _n_noop( 'This theme requires the following plugin: %1$s.', 'This theme requires the following plugins: %1$s.', 'october' ), // %1$s = plugin name(s)
			'notice_can_install_recommended'			=> _n_noop( 'This theme recommends the following plugin: %1$s.', 'This theme recommends the following plugins: %1$s.', 'october' ), // %1$s = plugin name(s)
			'notice_cannot_install'  					=> _n_noop( 'Sorry, but you do not have the correct permissions to install the %s plugin. Contact the administrator of this site for help on getting the plugin installed.', 'Sorry, but you do not have the correct permissions to install the %s plugins. Contact the administrator of this site for help on getting the plugins installed.', 'october' ), // %1$s = plugin name(s)
			'notice_can_activate_required'    		=> _n_noop( 'The following required plugin is currently inactive: %1$s.', 'The following required plugins are currently inactive: %1$s.', 'october' ), // %1$s = plugin name(s)
			'notice_can_activate_recommended'		=> _n_noop( 'The following recommended plugin is currently inactive: %1$s.', 'The following recommended plugins are currently inactive: %1$s.', 'october' ), // %1$s = plugin name(s)
			'notice_cannot_activate' 					=> _n_noop( 'Sorry, but you do not have the correct permissions to activate the %s plugin. Contact the administrator of this site for help on getting the plugin activated.', 'Sorry, but you do not have the correct permissions to activate the %s plugins. Contact the administrator of this site for help on getting the plugins activated.', 'october' ), // %1$s = plugin name(s)
			'notice_ask_to_update' 						=> _n_noop( 'The following plugin needs to be updated to its latest version to ensure maximum compatibility with this theme: %1$s.', 'The following plugins need to be updated to their latest version to ensure maximum compatibility with this theme: %1$s.', 'october' ), // %1$s = plugin name(s)
			'notice_cannot_update' 						=> _n_noop( 'Sorry, but you do not have the correct permissions to update the %s plugin. Contact the administrator of this site for help on getting the plugin updated.', 'Sorry, but you do not have the correct permissions to update the %s plugins. Contact the administrator of this site for help on getting the plugins updated.', 'october' ), // %1$s = plugin name(s)
			'install_link' 					  			=> _n_noop( 'Begin installing plugin', 'Begin installing plugins', 'october' ),
			'activate_link' 				  				=> _n_noop( 'Activate installed plugin', 'Activate installed plugins', 'october' ),
			'return'                           		=> __( 'Return to Required Plugins Installer', 'october' ),
			'plugin_activated'                 		=> __( 'Plugin activated successfully.', 'october' ),
			'complete' 										=> __( 'All plugins installed and activated successfully. %s', 'october' ), // %1$s = dashboard link
			'nag_type'										=> 'updated' // Determines admin notice type - can only be 'updated' or 'error'
			)
		);

		tgmpa($plugins, $config);

	}
}

add_action('tgmpa_register', 'october_register_required_plugins');

function october_ocdi_import_files() {
  return array(
    array(
      'import_file_name'             => 'Demo Import',
      'local_import_file'            => trailingslashit( T_PATH ) . '/inc/demo/content.xml',
      'local_import_widget_file'     => trailingslashit( T_PATH ) . '/inc/demo/widgets.wie',
      'local_import_customizer_file' => trailingslashit( T_PATH ) . '/inc/demo/customizer.dat',
      'import_preview_image_url'     => T_PATH . '/screenshot.png',
      'preview_url'                  => 'https://october.ravenbluethemes.com/',
    ),
  );
}
add_filter( 'pt-ocdi/import_files', 'october_ocdi_import_files' );

function october_ocdi_after_import_setup() {
	// Assign menus to their locations.
	$main_menu = get_term_by( 'name', 'Main Menu', 'nav_menu' );

	$locations = get_theme_mod('nav_menu_locations');
	$locations['primary-menu'] = $main_menu->term_id;
	set_theme_mod( 'nav_menu_locations', $locations );

	// Assign front page and posts page (blog page).
	$front_page_id = get_page_by_title( 'Home' );
	$blog_page_id  = get_page_by_title( 'Blog' );

	update_option( 'show_on_front', 'page' );
	update_option( 'page_on_front', $front_page_id->ID );
	update_option( 'page_for_posts', $blog_page_id->ID );
}
add_action( 'pt-ocdi/after_import', 'october_ocdi_after_import_setup' );

add_filter( 'pt-ocdi/regenerate_thumbnails_in_content_import', '__return_false' );

add_filter( 'pt-ocdi/disable_pt_branding', '__return_true' );
