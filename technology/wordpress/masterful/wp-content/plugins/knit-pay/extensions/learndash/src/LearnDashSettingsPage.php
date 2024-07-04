<?php

namespace KnitPay\Extensions\LearnDash;

use LearnDash_Settings_Page;

/**
 * LearnDash Settings Page Knit Pay.
 *
 * Copyright: 2020-2022 Knit Pay
 * Company: Knit Pay
 *
 * @author  knitpay
 * @since   2.7.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ( class_exists( 'LearnDash_Settings_Page' ) ) && ( ! class_exists( 'LearnDash_Settings_Page_KnitPay' ) ) ) {
	/**
	 * Class to create the settings page.
	 */
	class LearnDashSettingsPage extends LearnDash_Settings_Page {

		/**
		 * Public constructor for class
		 */
		public function __construct() {
			$this->id = 'knit_pay';

			$this->parent_menu_page_url  = 'admin.php?page=learndash_lms_settings';
			$this->menu_page_capability  = LEARNDASH_ADMIN_CAPABILITY_CHECK;
			$this->settings_page_id      = 'learndash_lms_settings_' . $this->id;
			$this->settings_page_title   = esc_html__( 'Knit Pay Settings', 'knit-pay' );
			$this->settings_tab_title    = $this->settings_page_title;
			$this->settings_tab_priority = 20;
			$this->show_quick_links_meta = false;
			parent::__construct();
		}
	}
}
