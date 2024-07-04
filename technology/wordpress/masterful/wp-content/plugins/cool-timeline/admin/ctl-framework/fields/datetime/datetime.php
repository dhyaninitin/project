<?php if ( ! defined( 'ABSPATH' ) ) { die; } // Cannot access pages directly.
/**
 *
 * Field: Date picker
 *
 * @since 1.0.0
 * @version 1.0.0
 *
 */

class CTL_Field_datetime extends CTL_Fields {
	
//class CSFramework_Option_date_picker extends CSFramework_Options {


	public function __construct( $field, $value = '', $unique = '' ) {
		parent::__construct( $field, $value, $unique );
	}

	public function render() {
		add_action('admin_footer', 'wpc_admin_datetimepicker_js_function');
		echo $this->field_before();
		
		echo '<input type="text" name="'. $this->field_name() .'" id="'.$this->field_name().'" value="'. esc_attr( $this->value ) .'" class="ctl-date-picker" ' . $this->field_attributes() .'/>';
		echo $this->field_after();

		wp_register_script( 'ctl-flatpickr-script',COOL_TIMELINE_PLUGIN_URL.'/assets/js/flatpickr.js', array('jquery'), COOL_TIMELINE_CURRENT_VERSION, true);
		wp_register_style( 'ctl-flatpickr-styles', COOL_TIMELINE_PLUGIN_URL.'/assets/css/flatpickr.css' );
		
		wp_enqueue_style('ctl-flatpickr-styles');		
		wp_enqueue_script('ctl-flatpickr-script');

	}
}

function wpc_admin_datetimepicker_js_function() {
	echo '<script>jQuery(function() {
			jQuery(".ctl-date-picker").flatpickr({
				dateFormat: "m/d/Y h:i K",
				enableTime: true,
				minuteIncrement:1,
				defaultMinute:0,
				minDate:"01/01/1800",
				maxDate:"12/31/2050", 	 
			}); 
		});
	</script>';
}







 




















/* 

if ( ! class_exists( 'CSF_Field_datetime' ) ) {
	class CSF_Field_datetime extends CSF_Fields {
		//class CSFramework_Option_date_picker extends CSFramework_Options {
  
	  public function __construct( $field, $value = '', $unique = '', $where = '', $parent = '' ) {
		parent::__construct( $field, $value, $unique, $where, $parent );
	  }
  
	  public function render() {        
		add_action('admin_footer', 'wpc_admin_datetimepicker_js_function');
		add_action('admin_footer', 'wpc_admin_datetimepicker_css_function');
		$default_settings = array(
		  'dateFormat' => 'm/d/Y h:m a',
		);
  
		$settings = ( ! empty( $this->field['settings'] ) ) ? $this->field['settings'] : array();
		$settings = wp_parse_args( $settings, $default_settings );
  
		echo $this->field_before();
  
		if ( ! empty( $this->field['from_to'] ) ) {
  
		  $args = wp_parse_args( $this->field, array(
			'text_from' => esc_html__( 'From', 'csf' ),
			'text_to'   => esc_html__( 'To', 'csf' ),
		  ) );
  
		  $value = wp_parse_args( $this->value, array(
			'from' => '',
			'to'   => '',
		  ) );
  
		  echo '<label class="csf--from">'. esc_attr( $args['text_from'] ) .' <input type="text" name="'. esc_attr( $this->field_name( '[from]' ) ) .'" value="'. esc_attr( $value['from'] ) .'"'. $this->field_attributes() .'/></label>';
		  echo '<label class="csf--to">'. esc_attr( $args['text_to'] ) .' <input type="text" name="'. esc_attr( $this->field_name( '[to]' ) ) .'" value="'. esc_attr( $value['to'] ) .'"'. $this->field_attributes() .'/></label>';
  
		} else {
  
		  echo '<input type="text" name="'. esc_attr( $this->field_name() ) .'" value="'. esc_attr( $this->value ) .'"'. $this->field_attributes() .'/>';
  
		}
  
		echo '<div class="csf-date-settings" data-settings="'. esc_attr( json_encode( $settings ) ) .'"></div>';
  
		echo $this->field_after();
		
	  }
	  public function wpc_admin_datetimepicker_js_function() {
		echo '<script>jQuery(function() { jQuery(".ctl-date-picker").datetimepicker(); });</script>';
	}
	
	
	public function wpc_admin_datetimepicker_css_function() {
		echo '<style>.ui-state-default .ui-icon {background-image: none !important;}</style>';
	}
	  public function enqueue() {
  
		
		wp_enqueue_script('jquery-ui-datepicker' );
		
		wp_enqueue_script('jquery-ui-datetimepicker', esc_url( 'cdn.jsdelivr.net/jquery.ui.timepicker.addon/1.4.5/jquery-ui-timepicker-addon.min.js' ) );
		
		wp_enqueue_style('jquery-ui-style', esc_url( 'ajax.googleapis.com/ajax/libs/jqueryui/1.8.2/themes/smoothness/jquery-ui.css' ) );

	  }
  
	}
  }
 */