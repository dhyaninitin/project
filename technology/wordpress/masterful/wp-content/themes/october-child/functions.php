<?php

function october_enqueue_parent_theme_style() {
    /* Bootstrap CSS file */
    wp_enqueue_style('bootstrap', get_template_directory_uri() . '/assets/css/bootstrap.min.css', array(), '3.3.6', 'all');
    
    /* Font Awesome CSS file */
    wp_enqueue_style('font-awesome', get_template_directory_uri() . '/assets/css/font-awesome.min.css', array(), '4.7', 'all');
    
    /* Animation CSS file */
    wp_enqueue_style('animation', get_template_directory_uri() . '/assets/css/animate.css', array(), '', 'all');
    
    /* Owl Carousel CSS file */
    wp_enqueue_style('owl-carousel', get_template_directory_uri() . '/assets/css/owl.carousel.css', array(), '1.3.3', 'all');
    
    /* Owl Theme CSS file */
    wp_enqueue_style('owl-theme', get_template_directory_uri() . '/assets/css/owl.theme.css', array(), '1.3.3', 'all');

    /* Parent Style file */
    wp_enqueue_style('parent-style', get_template_directory_uri() . '/style.css');
}

add_action('wp_enqueue_scripts', 'october_enqueue_parent_theme_style');
add_filter( 'wp_image_editors', function() { return array( 'WP_Image_Editor_GD' ); } );

?>