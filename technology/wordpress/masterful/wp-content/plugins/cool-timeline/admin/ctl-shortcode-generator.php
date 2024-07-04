<?php
/**
 *
 * This file is responsible for creating all admin settings in Timeline Builder (post)
 */
if (!defined("ABSPATH")) {
    exit('Can not load script outside of WordPress Enviornment!');
}

if (!class_exists('CTL_free_shortcode_generator')) {
    class CTL_free_shortcode_generator
    {

/**
 * The unique instance of the plugin.
 *
 */
        private static $instance;

        /**
         * Gets an instance of our plugin.
         *
         */
        public static function get_instance()
        {
            if (null === self::$instance) {
                self::$instance = new self();
            }

            return self::$instance;
        }

        /**
         * The Constructor
         */
        public function __construct()
        {
            // register actions

          
           
            $this->CTL_free_shortcode_generator();
            add_action('admin_print_styles', array($this, 'ctl_custom_shortcode_style'));

        }


        public function ctl_custom_shortcode_style()
        {
            echo '<style>
        span.dashicon.dashicons.dashicons-ctl-custom-icon:before {
        content:"";
        background: url(' . COOL_TIMELINE_PLUGIN_URL . 'assets/images/timeline-icon2-32x32.png);
        background-size: contain;
        background-repeat: no-repeat;
        height: 20px;
        display: block;

        }
           #wp-content-wrap a[data-modal-id="ctl_timeline_shortcode"]:before {
        content: "";
        background: url(' . COOL_TIMELINE_PLUGIN_URL . 'assets/images/cool-timeline-icon.svg);
        background-size: contain;
        background-repeat: no-repeat;
        height: 17px;
        display: inline-block;
        margin: 0px 1px -3px 0;
        width: 20px;
        }
        #wp-content-wrap a[data-modal-id="ctl_timeline_shortcode"] {
       // background: #000;
       // border-color: #000;
        }
        .csf-shortcode-single .csf-modal-content {
            height: 655px !important;

        }
        
        #ctl-modal-ctl_timeline_shortcode .ctl-modal-inner {
            height: 500px !important;
            // overflow: auto;          
        }
        #ctl-modal-ctl_timeline_shortcode .ctl-modal-content {            
            // overflow: hidden !important; 
            height:400px !important;        
            // min-height: -webkit-fill-available;
        }  
       
        </style>';
        }

        public function CTL_free_shortcode_generator()
        {
            $id = isset($GLOBALS['_GET']['post'])?$GLOBALS['_GET']['post']:'';
            $post_type = isset($GLOBALS['_GET']['post_type'])?$GLOBALS['_GET']['post_type']:get_post_type($id);
            if($post_type!=='page' && $post_type!=='post' && $post_type!='') { 
                return;
            }
            if (class_exists('CTL')) {

                //
                // Set a unique slug-like ID
                $prefix = 'ctl_timeline_shortcode';              

                //
                // Create a shortcoder
                CTL::createShortcoder($prefix, array(
                    'button_title' => 'Add Timeline Shortcode',
                    'insert_title' => 'Insert shortcode',
                    'gutenberg' => array(
                        'title' => 'Cool Timeline Shortcode Generator',
                        'icon' => 'ctl-custom-icon',
                        'description' => 'Cool Timeline Shortcode Generator Block.',
                        'category' => 'widgets',
                        'keywords' => array('shortcode', 'ctl','cooltimeline','timeline'),
                    ),
                ));

                //
                // A basic shortcode

                CTL::createSection($prefix, array(
                    'title' => 'Cool Timeline Shortcode',
                    'view' => 'normal', // View model of the shortcode. `normal` `contents` `group` `repeater`
                    'shortcode' => 'cool-timeline', // Set a unique slug-like name of shortcode.
                    'fields' => array(

                        array(
                            'id' => 'layout',
                            'type' => 'select',
                            'title' => 'Select Layout',                                                                                
                            'default' => 'default',
                            'desc'=>'Select your timeline Layout',                            
                            'options' => array(
                                'default' => 'Vertical',
                                'horizontal' => 'Horizontal',
                                'one-side' => 'One Side Layout',
                                'simple' => 'Simple Layout',
                                'compact' => 'Compact Layout',
                            ),
                             'attributes' => array(
                                'style' => 'width: 50%;',
                            ),
                        ),
                         array(
                            'id' => 'skin',
                            'type' => 'select',
                            'title' => 'Select Skin',                                   
                            'default' => 'default', 
                            'dependency' => array( 'layout', '!=', 'horizontal' ),
                            'options' => array(
                                'default' => 'Default',
                                'clean' => 'Clean',                               
                            ),
                            'desc'=>'Create Light, Dark or Colorful Timeline', 
                             'attributes' => array(
                                'style' => 'width: 50%;',
                            ),
                        ),
                        array(
                            'id' => 'date-format',
                            'type' => 'select',
                            'title' => 'Select Date Formats', 
                            'default' => 'F j',                           
                             'options' => array(
                                'F j' => 'F j',
                                'F j Y' => 'F j Y',
                                'Y-m-d' => 'Y-m-d',
                                'm/d/Y' => 'm/d/Y',  
                                'd/m/Y' => 'd/m/Y', 
                                 'F j Y g:i A' => 'F j Y g:i A',  
                                 'Y' => 'Y',
                            ),
                            'desc'=>'Timeline Stories dates formats', 
                            'attributes' => array(
                                'style' => 'width: 50%;',
                            ),
                        ),
                        array(
                            'id' => 'show-posts',
                            'type' => 'text',
                            'title' => 'Display Pers Page?',                           
                            'default' => '10',              
                             'desc'=>'You Can Show Pagination After These Posts In Vertical Timeline.',            
                            'attributes' => array(
                                'style' => 'width: 50%;',
                            ),
                        ),
                        array(
                            'id' => 'animation',
                            'type' => 'select',
                            'title' => 'Animation',
                            'default' =>'none',
                            'dependency' => array( 'layout', '!=', 'horizontal' ),
                            'options' => array(
                                'none' =>'none',
                                'fade-up' => 'fadeInUp',
                            ),
                            'attributes' => array(
                                'style' => 'width: 50%;',
                            ),
                        ),
                          array(
                            'id' => 'icons',
                            'type' => 'select',
                            'title' => 'Icons',
                            'default' =>'NO',                            
                            'options' => array(
                                'NO' => 'NO',
                                'YES' => 'YES',                                
                            ),
                            'desc'=>'Display Icons In Timeline Stories. By default Is Dot',
                            'attributes' => array(
                                'style' => 'width: 50%;',
                            ),
                        ),

                        array(
                            'id' => 'order',
                            'type' => 'select',
                            'title' => 'Stories Order?',
                            'default' =>'DESC',                            
                            'options' => array(
                                'DESC' => 'DESC',
                                'ASC' => 'ASC',
                            ),
                            'attributes' => array(
                                'style' => 'width: 50%;',
                            ),
                             'desc'=>'<span>Timeline Stories order like:- DESC(2017-1900) , ASC(1900-2017)</span>',
                        ),
                        array(
                            'id' => 'story-content',
                            'type' => 'select',
                            'title' => 'Stories Description?',
                            'default' =>'short',
                            'options' => array(
                                'short' => 'Summary',
                                'full' => 'Full Text',                                
                            ),
                           'desc'=>'<span>Summary:- Short description<br>Full:- All content with formated text.</span>',
                            'attributes' => array(
                                'style' => 'width: 50%;',
                            ),

                        ),                      
                        

                    )
                    ));

              

            }
        

            
        }

    }

}

new CTL_free_shortcode_generator();
