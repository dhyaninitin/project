<?php

namespace KnitPay\Extensions\LearnDash;

use LearnDash_Settings_Section;

/**
 * LearnDash Settings Section for Knit Pay Metabox.
 *
 * Copyright: 2020-2022 Knit Pay
 * Company: Knit Pay
 *
 * @author  knitpay
 * @since   2.7.0
 */

use Pronamic\WordPress\Pay\Plugin;
use Pronamic\WordPress\Pay\Core\PaymentMethods;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ( class_exists( 'LearnDash_Settings_Section' ) ) && ( ! class_exists( 'LearnDash_Settings_Section_KnitPay' ) ) ) {
	/**
	 * Class to create the settings section.
	 */
	class LearnDashSettingsSectionKnitPay extends LearnDash_Settings_Section {

		/**
		 * Protected constructor for class
		 */
		protected function __construct() {
			$this->id             = 'knit_pay';
			$this->payment_method = $this->id;

			$this->settings_page_id = 'learndash_lms_settings_' . $this->id;

			// This is the 'option_name' key used in the wp_options table.
			$this->setting_option_key = 'learndash_settings_' . $this->id;

			// This is the HTML form field prefix used.
			$this->setting_field_prefix = 'learndash_settings_' . $this->id;

			// Used within the Settings API to uniquely identify this section.
			$this->settings_section_key = 'settings_' . $this->id;

			// Section label/header.
			$this->settings_section_label = esc_html__( 'Knit Pay Settings', 'knit-pay' );

			$this->reset_confirm_message = esc_html__( 'Are you sure want to reset the Knit Pay values?', 'knit-pay' );

			parent::__construct();
		}

		/**
		 * Initialize the metabox settings fields.
		 */
		public function load_settings_fields() {

			$this->setting_option_fields = [
				'enable'              => [
					'name'      => 'enable',
					'type'      => 'checkbox',
					'label'     => esc_html__( 'Enable Knit Pay', 'knit-pay' ),
					'help_text' => esc_html__( 'Check to enable the Knit Pay Payments.', 'knit-pay' ),
					'value'     => isset( $this->setting_option_values['enable'] ) ? $this->setting_option_values['enable'] : 'no',
					'options'   => [
						'yes' => esc_html__( 'Enable Knit Pay?', 'knit-pay' ),
					],
				],
				'login_required'      => [
					'name'      => 'login_required',
					'type'      => 'checkbox',
					'label'     => esc_html__( 'User Login Required to Make Payment', 'knit-pay' ),
					'help_text' => esc_html__( 'In some payment gateways, it is mandatory to have a user account to initiate payment. If any payment gateway doesn\'t work while keeping this option OFF, try making it ON.', 'knit-pay' ),
					'value'     => isset( $this->setting_option_values['login_required'] ) ? $this->setting_option_values['login_required'] : 'no',
					'options'   => [
						'yes' => esc_html__( 'Make it mandatory for users to login before they can make payment.', 'knit-pay' ),
					],
				],
				'title'               => [
					'name'      => 'title',
					'type'      => 'text',
					'label'     => esc_html__( 'Title', 'knit-pay' ),
					'help_text' => esc_html__( 'This controls the title which the user sees during checkout.', 'knit-pay' ),
					'value'     => ( ( isset( $this->setting_option_values['title'] ) ) && ( ! empty( $this->setting_option_values['title'] ) ) ) ? $this->setting_option_values['title'] : 'Knit Pay',
					'class'     => 'regular-text',
				],
				'config_id'           => [
					'name'      => 'config_id',
					'type'      => 'select',
					'label'     => esc_html__( 'Configuration', 'knit-pay' ),
					'help_text' => __( 'Configurations can be created in Knit Pay gateway configurations page at <a href="' . admin_url() . 'edit.php?post_type=pronamic_gateway">"Knit Pay >> Configurations"</a>.', 'knit-pay' ),
					'value'     => ( ( isset( $this->setting_option_values['config_id'] ) ) && ( ! empty( $this->setting_option_values['config_id'] ) ) ) ? $this->setting_option_values['config_id'] : get_option( 'pronamic_pay_config_id' ),
					'options'   => Plugin::get_config_select_options( $this->payment_method ),
				],
				'payment_description' => [
					'name'      => 'payment_description',
					'type'      => 'text',
					'label'     => __( 'Payment Description', 'knit-pay' ),
					'help_text' => sprintf( __( 'Available tags: %s', 'pronamic_ideal' ), sprintf( '<code>%s</code>', '{course_id}, {course_name}' ) ),
					'value'     => ( ( isset( $this->setting_option_values['payment_description'] ) ) && ( ! empty( $this->setting_option_values['payment_description'] ) ) ) ? $this->setting_option_values['payment_description'] : '{course_name}',
					'class'     => 'regular-text',
				],
			];

			/** This filter is documented in includes/settings/settings-metaboxes/class-ld-settings-metabox-course-access-settings.php */
			$this->setting_option_fields = apply_filters( 'learndash_settings_fields', $this->setting_option_fields, $this->settings_section_key );

			parent::load_settings_fields();
		}
	}
}
