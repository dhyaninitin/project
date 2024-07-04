<?php

namespace IGD;

defined( 'ABSPATH' ) || exit;
class Integration
{
    private static  $instance = null ;
    public function __construct()
    {
        // Block editor
        if ( $this->is_active( 'gutenberg-editor' ) ) {
            require_once IGD_INCLUDES . '/block/class-block.php';
        }
        // Classic editor
        if ( $this->is_active( 'classic-editor' ) ) {
            require_once IGD_INCLUDES . '/class-tinymce.php';
        }
        // Elementor
        if ( $this->is_active( 'elementor' ) ) {
            require_once IGD_INCLUDES . '/elementor/class-elementor.php';
        }
    }
    
    private function is_active( $key )
    {
        $settings = get_option( 'igd_settings', [] );
        $integrations = ( !empty($settings['integrations']) ? $settings['integrations'] : [] );
        return in_array( $key, $integrations );
    }
    
    public static function instance()
    {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

}
Integration::instance();