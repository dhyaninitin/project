<?php

/**
 * Functions and Definitions
 *
 * @package october
 */

defined( 'T_URI' ) or define( 'T_URI',  get_template_directory_uri() );
defined( 'T_PATH' ) or define( 'T_PATH', get_theme_file_path() );
defined( 'F_PATH' ) or define( 'F_PATH', get_theme_file_path('/inc') );

// Admin CSS

if( ! function_exists('october_admin_css') ) {
 function october_admin_css() {
    wp_enqueue_style( 'admin-styles', T_URI . '/assets/css/admin.css' );
 }
}

add_action( 'login_head', 'october_admin_css' );
add_action( 'admin_enqueue_scripts', 'october_admin_css' );

// Framework Integration
require_once F_PATH . '/custom/actions-config.php';
require_once F_PATH . '/customizer.php';
require_once F_PATH . '/custom-header.php';
require_once F_PATH . '/custom/helper-functions.php';
require_once F_PATH . '/class-tgm-plugin-activation.php';
require_once F_PATH . '/acf/acf-config.php';

if ( ! isset( $content_width ) ) {
	$content_width = 1200;
}

if ( ! function_exists( 'october_after_setup' ) ) {
 function october_after_setup() {

    load_theme_textdomain( 'october', get_theme_file_path() . '/languages' );

    register_nav_menus(
       array(
          'primary-menu' => esc_html__( 'Primary Menu', 'october' ),
       )
    );

    add_theme_support( 'post-formats', array( 'video', 'gallery', 'audio', 'quote' ) );
    add_theme_support( 'custom-header' );
    add_theme_support( 'custom-background' );
    add_theme_support( 'automatic-feed-links' );
    add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption' ) );
    add_theme_support( 'post-thumbnails' );
    add_theme_support( 'title-tag' );
 }
}
add_action( 'after_setup_theme', 'october_after_setup' );

/* Prints HTML with meta information for the current post (category, tags and permalink) */

if(!function_exists('october_posted_in')) {
    function october_posted_in() {
    	// Retrieves tag list of current post, separated by commas.
        $tag_list = get_the_tag_list('', ', ');
        if ($tag_list) {
            $posted_in = esc_html__('This entry was posted in %1$s', 'october') . ' .' . esc_html__('and tagged', 'october') . ' %2$s.' . esc_html__('Bookmark the', 'october') . ' <a href="%3$s" title="Permalink to %4$s" rel="bookmark">' . esc_html__('&nbsp;permalink', 'october') . '</a>.';
        } elseif (is_object_in_taxonomy(get_post_type(), 'category')) {
            $posted_in = esc_html__('This entry was posted in %1$s', 'october') . ' %1$s. ' . esc_html__('Bookmark the', 'october') . ' <a href="%3$s" title="Permalink to %4$s" rel="bookmark">' . esc_html__('&nbsp;permalink', 'october') . '</a>.';
        } else {
            $posted_in = esc_html__('Bookmark the', 'october') . '<a href="%3$s" title="Permalink to %4$s" rel="bookmark">' . '&nbsp' . esc_html__('&nbsp;permalink', 'october') . '</a>.';
        }
    	// Prints the string, replacing the placeholders.
        printf(
            $posted_in, get_the_category_list(', '), $tag_list, get_permalink(), the_title_attribute('echo=0')
        );
    }
}

if(!function_exists('october_customize_register')) {
    function october_customize_register($wp_customize) {
    	$wp_customize->remove_section('static_front_page');

    	// GENERAL
    	$wp_customize->add_section("general", array(
    		"title" => esc_html__("General Settings", "october"),
    		"priority" => 190
    	));

    	$wp_customize->add_setting("text_alignment", array(
    		"transport" => "postMessage", "sanitize_callback" => "esc_html",
    		"default" => "text-left"
    	));

    	$wp_customize->add_control(new WP_Customize_Control(
    		$wp_customize,
    		"text_alignment",
    		array(
    			"label" => esc_html__("Text Alignment", "october"),
    			"section" => "general",
    			"settings" => "text_alignment",
    			"type" => "select",
    			"choices" => array(
                    'text-left'   => esc_html__('Left', 'october'),
                    'text-center'  => esc_html__('Center', 'october'),
                    'text-right'  => esc_html__('Right', 'october')
            	)
    		)
    	));

    	// HEADER
    	$wp_customize->add_section("header", array(
    		"title" => esc_html__("Header Settings", "october"),
    		"priority" => 200
    	));

    	$wp_customize->add_setting("header_logo", array(
    		"transport" => "postMessage", "sanitize_callback" => "esc_html"
    	));

    	$wp_customize->add_control(new WP_Customize_Image_Control(
    		$wp_customize,
    		"header_logo",
    		array(
    			"label" => esc_html__("Header Logo", "october"),
    			"section" => "header",
    			"settings" => "header_logo"
    		)
    	));

    	// MAIN TOP
    	$wp_customize->add_section("main_top", array(
    		"title" => esc_html__("Main Top Settings", "october"),
    		"priority" => 210
    	));

    	$wp_customize->add_setting("main_top_title", array(
    		"transport" => "postMessage", "sanitize_callback" => "esc_html"
    	));

    	$wp_customize->add_control(new WP_Customize_Control(
    		$wp_customize,
    		"main_top_title",
    		array(
    			"label" => esc_html__("Main Top Title", "october"),
    			"section" => "main_top",
    			"settings" => "main_top_title",
    			"type" => "text"
    		)
    	));

    	$wp_customize->add_setting("main_top_image", array(
    		"transport" => "postMessage", "sanitize_callback" => "esc_html"
    	));

    	$wp_customize->add_control(new WP_Customize_Image_Control(
    		$wp_customize,
    		"main_top_image",
    		array(
    			"label" => esc_html__("Main Top Background Image", "october"),
    			"section" => "main_top",
    			"settings" => "main_top_image"
    		)
    	));

        $wp_customize->add_setting("arrow_link", array(
            "default" => "#aboutus",
            "transport" => "postMessage", "sanitize_callback" => "esc_html"
        ));

        $wp_customize->add_control(new WP_Customize_Control(
            $wp_customize,
            "arrow_link",
            array(
                "label" => esc_html__("Main Top Arrow Link", "october"),
                "section" => "main_top",
                "settings" => "arrow_link",
                "type" => "text"
            )
        ));

    	// ABOUT
    	$wp_customize->add_section("about", array(
    		"title" => esc_html__("About Settings", "october"),
    		"priority" => 220
    	));

    	$wp_customize->add_setting("about_icon_1", array(
    		"transport" => "postMessage", "sanitize_callback" => "esc_html"
    	));

    	$wp_customize->add_control(new WP_Customize_Control(
    		$wp_customize,
    		"about_icon_1",
    		array(
    			"label" => esc_html__("About Icon #1", "october"),
    			"section" => "about",
    			"settings" => "about_icon_1",
    			"type" => "text"
    		)
    	));

    	$wp_customize->add_setting("about_title_1", array(
    		"transport" => "postMessage", "sanitize_callback" => "esc_html"
    	));

    	$wp_customize->add_control(new WP_Customize_Control(
    		$wp_customize,
    		"about_title_1",
    		array(
    			"label" => esc_html__("About Title #1", "october"),
    			"section" => "about",
    			"settings" => "about_title_1",
    			"type" => "text"
    		)
    	));

    	$wp_customize->add_setting("about_text_1", array(
    		"transport" => "postMessage", "sanitize_callback" => "esc_html"
    	));

    	$wp_customize->add_control(new WP_Customize_Control(
    		$wp_customize,
    		"about_text_1",
    		array(
    			"label" => esc_html__("About Text #1", "october"),
    			"section" => "about",
    			"settings" => "about_text_1",
    			"type" => "textarea"
    		)
    	));

    	$wp_customize->add_setting("about_icon_2", array(
    		"transport" => "postMessage", "sanitize_callback" => "esc_html"
    	));

    	$wp_customize->add_control(new WP_Customize_Control(
    		$wp_customize,
    		"about_icon_2",
    		array(
    			"label" => esc_html__("About Icon #2", "october"),
    			"section" => "about",
    			"settings" => "about_icon_2",
    			"type" => "text"
    		)
    	));

    	$wp_customize->add_setting("about_title_2", array(
    		"transport" => "postMessage", "sanitize_callback" => "esc_html"
    	));

    	$wp_customize->add_control(new WP_Customize_Control(
    		$wp_customize,
    		"about_title_2",
    		array(
    			"label" => esc_html__("About Title #2", "october"),
    			"section" => "about",
    			"settings" => "about_title_2",
    			"type" => "text"
    		)
    	));

    	$wp_customize->add_setting("about_text_2", array(
    		"transport" => "postMessage", "sanitize_callback" => "esc_html"
    	));

    	$wp_customize->add_control(new WP_Customize_Control(
    		$wp_customize,
    		"about_text_2",
    		array(
    			"label" => esc_html__("About Text #2", "october"),
    			"section" => "about",
    			"settings" => "about_text_2",
    			"type" => "textarea"
    		)
    	));

    	$wp_customize->add_setting("about_icon_3", array(
    		"transport" => "postMessage", "sanitize_callback" => "esc_html"
    	));

    	$wp_customize->add_control(new WP_Customize_Control(
    		$wp_customize,
    		"about_icon_3",
    		array(
    			"label" => esc_html__("About Icon #3", "october"),
    			"section" => "about",
    			"settings" => "about_icon_3",
    			"type" => "text"
    		)
    	));

    	$wp_customize->add_setting("about_title_3", array(
    		"transport" => "postMessage", "sanitize_callback" => "esc_html"
    	));

    	$wp_customize->add_control(new WP_Customize_Control(
    		$wp_customize,
    		"about_title_3",
    		array(
    			"label" => esc_html__("About Title #3", "october"),
    			"section" => "about",
    			"settings" => "about_title_3",
    			"type" => "text"
    		)
    	));

    	$wp_customize->add_setting("about_text_3", array(
    		"transport" => "postMessage", "sanitize_callback" => "esc_html"
    	));

    	$wp_customize->add_control(new WP_Customize_Control(
    		$wp_customize,
    		"about_text_3",
    		array(
    			"label" => esc_html__("About Text #3", "october"),
    			"section" => "about",
    			"settings" => "about_text_3",
    			"type" => "textarea"
    		)
    	));

    	$wp_customize->add_setting("about_subtitle", array(
    		"transport" => "postMessage", "sanitize_callback" => "esc_html"
    	));

    	$wp_customize->add_control(new WP_Customize_Control(
    		$wp_customize,
    		"about_subtitle",
    		array(
    			"label" => esc_html__("About Subtitle", "october"),
    			"section" => "about",
    			"settings" => "about_subtitle",
    			"type" => "text"
    		)
    	));

    	$wp_customize->add_setting("call_to_action", array(
    		"transport" => "postMessage", "sanitize_callback" => "esc_html"
    	));

    	$wp_customize->add_control(new WP_Customize_Control(
    		$wp_customize,
    		"call_to_action",
    		array(
    			"label" => esc_html__("Call to Action Text", "october"),
    			"section" => "about",
    			"settings" => "call_to_action",
    			"type" => "text"
    		)
    	));

    	$wp_customize->add_setting("call_to_action_button", array(
    		"transport" => "postMessage", "sanitize_callback" => "esc_html"
    	));

    	$wp_customize->add_control(new WP_Customize_Control(
    		$wp_customize,
    		"call_to_action_button",
    		array(
    			"label" => esc_html__("Call to Action Button", "october"),
    			"section" => "about",
    			"settings" => "call_to_action_button",
    			"type" => "text"
    		)
    	));

    	$wp_customize->add_setting("call_to_action_link", array(
    		"transport" => "postMessage", "sanitize_callback" => "esc_html"
    	));

    	$wp_customize->add_control(new WP_Customize_Control(
    		$wp_customize,
    		"call_to_action_link",
    		array(
    			"label" => esc_html__("Call to Action Link", "october"),
    			"section" => "about",
    			"settings" => "call_to_action_link",
    			"type" => "text"
    		)
    	));

    	$wp_customize->add_setting("call_to_action", array(
    		"transport" => "postMessage", "sanitize_callback" => "esc_html"
    	));

    	$wp_customize->add_control(new WP_Customize_Control(
    		$wp_customize,
    		"call_to_action",
    		array(
    			"label" => esc_html__("Call to Action Text", "october"),
    			"section" => "about",
    			"settings" => "call_to_action",
    			"type" => "text"
    		)
    	));

    	// SERVICES
    	$wp_customize->add_section("services", array(
    		"title" => esc_html__("Services Settings", "october"),
    		"priority" => 240
    	));

    	$wp_customize->add_setting("services_text", array(
    		"transport" => "postMessage", "sanitize_callback" => "esc_html"
    	));

    	$wp_customize->add_control(new WP_Customize_Control(
    		$wp_customize,
    		"services_text",
    		array(
    			"label" => esc_html__("Services Text", "october"),
    			"section" => "services",
    			"settings" => "services_text",
    			"type" => "textarea"
    		)
    	));

    	// PORTFOLIO
    	$wp_customize->add_section("portfolio", array(
    		"title" => esc_html__("Portfolio Settings", "october"),
    		"priority" => 260
    	));

    	$wp_customize->add_setting("portfolio_button", array(
    		"default" => "PURCHASE NOW",
    		"transport" => "postMessage", "sanitize_callback" => "esc_html"
    	));

    	$wp_customize->add_control(new WP_Customize_Control(
    		$wp_customize,
    		"portfolio_button",
    		array(
    			"label" => esc_html__("Portfolio Button", "october"),
    			"section" => "portfolio",
    			"settings" => "portfolio_button",
    			"type" => "text"
    		)
    	));

    	$wp_customize->add_setting("portfolio_button_link", array(
    		"transport" => "postMessage", "sanitize_callback" => "esc_html"
    	));

    	$wp_customize->add_control(new WP_Customize_Control(
    		$wp_customize,
    		"portfolio_button_link",
    		array(
    			"label" => esc_html__("Portfolio Button Link", "october"),
    			"section" => "portfolio",
    			"settings" => "portfolio_button_link",
    			"type" => "text"
    		)
    	));

    	// NEWSLETTER
    	$wp_customize->add_section("newsletter", array(
    		"title" => esc_html__("Newsletter Settings", "october"),
    		"priority" => 270
    	));

    	$wp_customize->add_setting("newsletter_form_shortcode", array(
    		"transport" => "postMessage", "sanitize_callback" => "esc_html"
    	));

    	$wp_customize->add_control(new WP_Customize_Control(
    		$wp_customize,
    		"newsletter_form_shortcode",
    		array(
    			"label" => esc_html__("Newsletter Form Shortcode", "october"),
    			"section" => "newsletter",
    			"settings" => "newsletter_form_shortcode",
    			"type" => "text"
    		)
    	));

    	// CONTACT
    	$wp_customize->add_section("contact", array(
    		"title" => esc_html__("Contact Settings", "october"),
    		"priority" => 300
    	));

    	$wp_customize->add_setting("contact_address_title", array(
    		"transport" => "postMessage", "sanitize_callback" => "esc_html"
    	));

    	$wp_customize->add_control(new WP_Customize_Control(
    		$wp_customize,
    		"contact_address_title",
    		array(
    			"label" => esc_html__("Contact Address Title", "october"),
    			"section" => "contact",
    			"settings" => "contact_address_title",
    			"type" => "text"
    		)
    	));

    	$wp_customize->add_setting("contact_address_text", array(
    		"transport" => "postMessage", "sanitize_callback" => "esc_html"
    	));

    	$wp_customize->add_control(new WP_Customize_Control(
    		$wp_customize,
    		"contact_address_text",
    		array(
    			"label" => esc_html__("Contact Address Text", "october"),
    			"section" => "contact",
    			"settings" => "contact_address_text",
    			"type" => "textarea"
    		)
    	));

    	$wp_customize->add_setting("contact_phone_title", array(
    		"transport" => "postMessage", "sanitize_callback" => "esc_html"
    	));

    	$wp_customize->add_control(new WP_Customize_Control(
    		$wp_customize,
    		"contact_phone_title",
    		array(
    			"label" => esc_html__("Contact Phone Title", "october"),
    			"section" => "contact",
    			"settings" => "contact_phone_title",
    			"type" => "text"
    		)
    	));

    	$wp_customize->add_setting("contact_phone_text", array(
    		"transport" => "postMessage", "sanitize_callback" => "esc_html"
    	));

    	$wp_customize->add_control(new WP_Customize_Control(
    		$wp_customize,
    		"contact_phone_text",
    		array(
    			"label" => esc_html__("Contact Phone Text", "october"),
    			"section" => "contact",
    			"settings" => "contact_phone_text",
    			"type" => "textarea"
    		)
    	));

    	$wp_customize->add_setting("contact_email_title", array(
    		"transport" => "postMessage", "sanitize_callback" => "esc_html"
    	));

    	$wp_customize->add_control(new WP_Customize_Control(
    		$wp_customize,
    		"contact_email_title",
    		array(
    			"label" => esc_html__("Contact Email Title", "october"),
    			"section" => "contact",
    			"settings" => "contact_email_title",
    			"type" => "text"
    		)
    	));

    	$wp_customize->add_setting("contact_email_text", array(
    		"transport" => "postMessage", "sanitize_callback" => "esc_html"
    	));

    	$wp_customize->add_control(new WP_Customize_Control(
    		$wp_customize,
    		"contact_email_text",
    		array(
    			"label" => esc_html__("Contact Email Text", "october"),
    			"section" => "contact",
    			"settings" => "contact_email_text",
    			"type" => "textarea"
    		)
    	));

    	$wp_customize->add_setting("contact_button", array(
    		"default" => "SEND",
    		"transport" => "postMessage", "sanitize_callback" => "esc_html"
    	));

    	$wp_customize->add_control(new WP_Customize_Control(
    		$wp_customize,
    		"contact_button",
    		array(
    			"label" => esc_html__("Contact Button", "october"),
    			"section" => "contact",
    			"settings" => "contact_button",
    			"type" => "text"
    		)
    	));

    	$wp_customize->add_setting("contact_form_shortcode", array(
    		"transport" => "postMessage", "sanitize_callback" => "esc_html"
    	));

    	$wp_customize->add_control(new WP_Customize_Control(
    		$wp_customize,
    		"contact_form_shortcode",
    		array(
    			"label" => esc_html__("Contact Form 7 Shortcode", "october"),
    			"section" => "contact",
    			"settings" => "contact_form_shortcode",
    			"type" => "text"
    		)
    	));

    	// SOCIAL
    	$wp_customize->add_section("social", array(
    		"title" => esc_html__("Social Settings", "october"),
    		"priority" => 310
    	));

    	$wp_customize->add_setting("social_facebook", array(
    		"transport" => "postMessage", "sanitize_callback" => "esc_html"
    	));

    	$wp_customize->add_control(new WP_Customize_Control(
    		$wp_customize,
    		"social_facebook",
    		array(
    			"label" => esc_html__("Social Facebook", "october"),
    			"section" => "social",
    			"settings" => "social_facebook",
    			"type" => "text"
    		)
    	));

    	$wp_customize->add_setting("social_twitter", array(
    		"transport" => "postMessage", "sanitize_callback" => "esc_html"
    	));

    	$wp_customize->add_control(new WP_Customize_Control(
    		$wp_customize,
    		"social_twitter",
    		array(
    			"label" => esc_html__("Social Twitter", "october"),
    			"section" => "social",
    			"settings" => "social_twitter",
    			"type" => "text"
    		)
    	));

    	$wp_customize->add_setting("social_instagram", array(
    		"transport" => "postMessage", "sanitize_callback" => "esc_html"
    	));

    	$wp_customize->add_control(new WP_Customize_Control(
    		$wp_customize,
    		"social_instagram",
    		array(
    			"label" => esc_html__("Social Instagram", "october"),
    			"section" => "social",
    			"settings" => "social_instagram",
    			"type" => "text"
    		)
    	));

    	$wp_customize->add_setting("social_linkedin", array(
    		"transport" => "postMessage", "sanitize_callback" => "esc_html"
    	));

    	$wp_customize->add_control(new WP_Customize_Control(
    		$wp_customize,
    		"social_linkedin",
    		array(
    			"label" => esc_html__("Social LinkedIn", "october"),
    			"section" => "social",
    			"settings" => "social_linkedin",
    			"type" => "text"
    		)
    	));
    }
}

add_action("customize_register", "october_customize_register");

add_theme_support('align-wide');

add_theme_support('align-full');

add_theme_support('editor-styles');

add_editor_style('assets/css/style-editor.css');

add_editor_style( october_fonts_url() );

?>
