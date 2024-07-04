<?php

namespace KnitPay\Extensions\LearnDash;

use Pronamic\WordPress\Money\Currency;
use Pronamic\WordPress\Money\Money;
use Pronamic\WordPress\Pay\Plugin;
use Pronamic\WordPress\Pay\Payments\Payment;
use LearnDash_Custom_Label;
use LearnDash_Settings_Section;

/**
 * Title: Learn Dash LMS extension
 * Description:
 * Copyright: 2020-2022 Knit Pay
 * Company: Knit Pay
 *
 * @author  knitpay
 * @since   2.7.0
 */

/**
 * Prevent loading this file directly
 */
defined( 'ABSPATH' ) || exit();

class Gateway {

	protected $config_id;
	protected $payment_description;

		/**
		 * @var string
		 */
		public $id = 'knit_pay';

	/**
	 * Payment method.
	 *
	 * @var string
	 */
	private $payment_method;

	/**
	 * Bootstrap
	 *
	 * @param array $args Gateway properties.
	 */
	public function __construct() {

		$this->id      = 'knit_pay';
		$this->options = get_option( 'learndash_settings_' . $this->id, [] );

		require 'LearnDashSettingsPage.php';
		require 'LearnDashSettingsSectionKnitPay.php';

		add_action(
			'learndash_settings_pages_init',
			function() {
				LearnDashSettingsPage::add_page_instance();
			}
		);

		add_action(
			'learndash_settings_sections_init',
			function() {
				LearnDashSettingsSectionKnitPay::add_section_instance();
			}
		);

		// Show Payment Button.
		add_filter( 'learndash_payment_button', [ $this, 'payment_button' ], 10, 2 );

		add_action( 'wp_ajax_nopriv_ld_' . $this->id . '_init_checkout', [ $this, 'ajax_init_checkout' ] );
		add_action( 'wp_ajax_ld_' . $this->id . '_init_checkout', [ $this, 'ajax_init_checkout' ] );

	}

	/**
	 * AJAX function handler for init checkout
	 *
	 * @uses ld_knit_pay_init_checkout WP AJAX action string
	 * @return void
	 */
	public function ajax_init_checkout() {
		if ( ! $this->is_transaction_legit() ) {
			wp_die( __( 'Cheatin\' huh?', 'knit-pay' ) );
		}

		$course_id = intval( $_GET['course_id'] );

		$config_id      = $this->options['config_id'];
		$payment_method = $this->id;

		// Use default gateway if no configuration has been set.
		if ( empty( $config_id ) ) {
			$config_id = get_option( 'pronamic_pay_config_id' );
		}

		$gateway = Plugin::get_gateway( $config_id );

		if ( ! $gateway ) {
			return false;
		}

		$gateway->set_payment_method( $payment_method );

		$course_data = Helper::get_course_data( $course_id );

		/**
		 * Build payment.
		 */
		$payment = new Payment();

		$payment->source    = 'learndash';
		$payment->source_id = $course_id;
		$payment->order_id  = $course_id;

		$payment->set_description( Helper::get_description( $this->options, $course_data ) );

		$payment->title = Helper::get_title( $course_data );

		// Customer.
		$payment->set_customer( Helper::get_customer( $course_data ) );

		// Address.
		$payment->set_billing_address( Helper::get_address( $course_data ) );

		// Currency.
		$currency = Currency::get_instance( Helper::get_currency_alphabetic_code() );

		// Amount.
		$payment->set_total_amount( new Money( $course_data['course_price'], $currency ) );

		// Method.
		$payment->set_payment_method( $payment_method );

		// Configuration.
		$payment->config_id = $config_id;

		try {
			$payment = Plugin::start_payment( $payment );

			// Execute a redirect.
			echo wp_json_encode(
				[
					'status'       => 'success',
					'redirect_url' => $payment->get_pay_redirect_url(),
				]
			);
			exit;
		} catch ( \Exception $e ) {
			echo wp_json_encode(
				[
					'status'    => 'error',
					'error_msg' => $e->getMessage(),
				]
			);
			exit;
		}
	}

	/**
	 * Check if Knit Pay transaction is legit
	 *
	 * @param  array $post     Transaction form submit $_POST
	 * @return boolean          True if legit, false otherwise
	 */
	public function is_transaction_legit() {

		if ( wp_verify_nonce( $_GET['knit_pay_nonce'], $this->id . '-nonce-' . $_GET['course_id'] . $_GET['price'] ) ) {
			return true;
		} else {
			return false;
		}
	}

	/**
	 * Output modified payment button
	 *
	 * @param  string $default_button Learndash default payment button
	 * @param  array  $params         Button parameters
	 * @return string                 Modified button
	 */
	public function payment_button( $default_button, $params = null ) {

		if ( ! isset( $this->options['enable'] ) ) {
			return $default_button;
		}

		if ( isset( $this->options['login_required'] ) && ! is_user_logged_in() ) {
			return $default_button;
		}

		$course_id    = $params['post']->ID;
		$course_price = $params['price'];

		// Also ensure the price it not zero
		if ( ( ! isset( $params['price'] ) ) || ( empty( $params['price'] ) ) ) {
			return $default_button;
		}

		$this->default_button = $default_button;

		if ( isset( $params['post'] ) ) {
			$this->course = $params['post'];
		} else {
			$this->course = get_post( get_the_ID() );
		}

		if ( $this->is_paypal_active() ) {
			$button_text = apply_filters( 'learndash_' . $this->id . '_purchase_button_text', $this->options['title'] );
		} else {
			if ( class_exists( 'LearnDash_Custom_Label' ) ) {
				if ( $this->course->post_type === 'sfwd-courses' ) {
					$button_text = apply_filters( 'learndash_' . $this->id . '_purchase_button_text', LearnDash_Custom_Label::get_label( 'button_take_this_course' ) );
				} elseif ( $this->course->post_type === 'groups' ) {
					$button_text = apply_filters( 'learndash_' . $this->id . '_purchase_button_text', LearnDash_Custom_Label::get_label( 'button_take_this_group' ) );
				}
			} else {
				if ( $this->course->post_type === 'sfwd-courses' ) {
					$button_text = apply_filters( 'learndash_' . $this->id . '_purchase_button_text', __( 'Take This Course', 'knit-pay' ) );
				} elseif ( $this->course->post_type === 'groups' ) {
					$button_text = apply_filters( 'learndash_' . $this->id . '_purchase_button_text', __( 'Enroll in Group', 'knit-pay' ) );
				}
			}
		}

		$gateway_button  = '';
		$gateway_button .= '<div class="learndash_checkout_button learndash_' . $this->id . '_button">';
		$gateway_button .= '<form class="learndash-' . $this->id . '-checkout" name="" action="" method="post">';
		$gateway_button .= '<input type="hidden" name="action" value="ld_' . $this->id . '_init_checkout" />';
		$gateway_button .= '<input type="hidden" name="course_id" value="' . $course_id . '" />';
		$gateway_button .= '<input type="hidden" name="price" value="' . $course_price . '" />';

		$button_nonce    = wp_create_nonce( $this->id . '-nonce-' . $course_id . $course_price );
		$gateway_button .= '<input type="hidden" name="' . $this->id . '_nonce" value="' . $button_nonce . '" />';

		$gateway_button .= '<input class="learndash-' . $this->id . '-checkout-button btn-join button" type="submit" value="' . $button_text . '">';
		$gateway_button .= '</form>';
		$gateway_button .= '</div>';

		?>
		<style type="text/css">

			.checkout-dropdown-button .learndash_checkout_button .btn-join {
				background-color: #fff !important;
				color: #000 !important; 
				font-weight: normal !important;
				font-size: 16px !important;
			}

			.checkout-dropdown-button .learndash_checkout_button .btn-join:hover {
				background-color: #F5F5F5 !important;
				color: #000 !important;
			}
		</style>
		<?php

		$gateway_button .= '<script>
	    jQuery(".learndash-' . $this->id . '-checkout").submit(function( event ) {
            event.preventDefault();

            jQuery(".checkout-dropdown-button").hide();
           jQuery(".learndash_checkout_buttons").addClass("ld-loading");
	        
	        jQuery.get("' . admin_url( 'admin-ajax.php' ) . '",{
                    "action": "ld_' . $this->id . '_init_checkout", 
                    "course_id": "' . $course_id . '",
                    "price": "' . $course_price . '",
                    "' . $this->id . '_nonce": "' . $button_nonce . '"},
	        function (msg) { 
                 msg = JSON.parse(msg);
                 if ("success" == msg.status) {
                    window.location.replace(msg.redirect_url);
                } else {
                    alert(msg.error_msg);
                }
                jQuery(".learndash_checkout_buttons").removeClass("ld-loading");
            });
	        
	    });
	        
	    </script>';

		return $default_button . $gateway_button;
	}

	/**
	 * Check if PayPal is used or not.
	 *
	 * @return boolean True if active, false otherwise.
	 */
	public function is_paypal_active() {
		if ( version_compare( LEARNDASH_VERSION, '2.4.0', '<' ) ) {
			$ld_options   = learndash_get_option( 'sfwd-courses' );
			$paypal_email = isset( $ld_options['paypal_email'] ) ? $ld_options['paypal_email'] : '';
		} else {
			$paypal_email = LearnDash_Settings_Section::get_section_setting( 'LearnDash_Settings_Section_PayPal', 'paypal_email' );
		}

		return ( ! empty( $paypal_email ) );
	}
}
