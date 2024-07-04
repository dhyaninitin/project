<?php

namespace IGD\Elementor;

use Elementor\Controls_Manager;
use Elementor\Widget_Base;

defined( 'ABSPATH' ) || exit();

class Shortcodes_Widget extends Widget_Base {

	public function get_name() {
		return 'igd_shortcodes';
	}

	public function get_title() {
		return __( 'Module Shortcodes', 'integrate-google-drive' );
	}

	public function get_icon() {
		return 'eicon-shortcode';
	}

	public function get_categories() {
		return [ 'integrate_google_drive' ];
	}

	public function get_keywords() {
		return [
			"google drive",
			"drive",
			"shortcode",
			"module",
			"cloud",
			"shortcode"
		];
	}

	public function _register_controls() {

		$this->start_controls_section( '_section_module_shortcodes',
			[
				'label' => __( 'Module Shortcode', 'integrate-google-drive' ),
				'tab'   => Controls_Manager::TAB_CONTENT,
			] );


		$this->add_control( 'shortcode_id',
			[
				'label'       => __( 'Select Shortcode Module', 'integrate-google-drive' ),
				'type'        => Controls_Manager::SELECT,
				'label_block' => true,
				'options'     => igd_get_shortcodes_array()
			] );


		$this->end_controls_section();
	}

	public function render() {
		$settings = $this->get_settings_for_display();
		extract( $settings );

		if ( ! empty( $shortcode_id ) ) {
			echo do_shortcode( '[integrate_google_drive id="' . $shortcode_id . '"]' );
		} else {
			echo '<p>' . __( 'Please select a shortcode module.', 'integrate-google-drive' ) . '</p>';
		}
	}

}