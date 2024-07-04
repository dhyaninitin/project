<?php
/**
 * Title: Tour Master extension
 * Description:
 * Copyright: 2020-2022 Knit Pay
 * Company: Knit Pay
 *
 * @author knitpay
 * @since 2.1.0
 * @package KnitPay\Extensions\TourMaster
 */

namespace KnitPay\Extensions\TourMaster;

use Pronamic\WordPress\Money\Currency;
use Pronamic\WordPress\Pay\Plugin;
use Pronamic\WordPress\Money\Money;
use Pronamic\WordPress\Pay\Payments\Payment;

/**
 * Prevent loading this file directly
 */
defined( 'ABSPATH' ) || exit();

/**
 * Tour Master Gateway Class
 *
 * @author Gautam Garg
 */
class Gateway {

	protected $config_id;

	/**
	 *
	 * @var string
	 */
	public $id = 'knit_pay';

	public $name = 'Knit Pay';

	public $payment_method;

	/**
	 * Bootstrap
	 *
	 * @param array $args
	 *            Gateway properties.
	 */
	public function __construct( $id, $name = '', $payment_method = null ) {
		$this->payment_method = $payment_method;
		$this->id             = $id;
		$this->name           = $name;

		add_filter(
			'goodlayers_plugin_payment_option',
			[
				$this,
				'goodlayers_plugin_payment_option',
			]
		);
		add_filter(
			'goodlayers_' . $this->id . '_payment_form',
			[
				$this,
				'goodlayers_payment_form',
			],
			10,
			2
		);

		add_filter(
			'tourmaster_additional_payment_method',
			[
				$this,
				'tourmaster_additional_payment_method',
			]
		);

		add_action(
			'tourmaster_after_save_plugin_option',
			[
				$this,
				'tourmaster_after_save_plugin_option',
			]
		);

		$this->init();
	}

	public function tourmaster_after_save_plugin_option() {
		$currency_code = tourmaster_get_option( 'payment', $this->id . '-currency' );
		if ( empty( $currency_code ) ) {
			$currency_code = 'INR';
		}
		$tourmaster_general_option = tourmaster_get_option( 'general' );
		if ( empty( $tourmaster_general_option ) ) {
			return;
		}
		$currency        = Currency::get_instance( $currency_code );
		$currency_symbol = $currency->get_symbol();
		if ( empty( $currency_symbol ) ) {
			$currency_symbol = $currency_code . ' ';
		}
		$tourmaster_general_option['money-format']               = $currency_symbol . 'NUMBER';
		$tourmaster_general_option['tour-schema-price-currency'] = $currency_code;
		update_option( 'tourmaster_general', $tourmaster_general_option );
	}

	public function goodlayers_plugin_payment_option( $options ) {
		$options['payment-settings']['options']['payment-method']['options'][ $this->id ] = 'Knit Pay - ' . $this->name;

		$options[ $this->id ] = [
			'title'   => 'Knit Pay - ' . esc_html__( $this->name, 'tourmaster' ),
			'options' => [
				$this->id . '-config-id'           => [
					'title'       => esc_html__( 'Configuration', 'knit-pay' ),
					'type'        => 'combobox',
					'default'     => get_option( 'pronamic_pay_config_id' ),
					'options'     => Plugin::get_config_select_options( $this->payment_method ),
					'description' => __( 'Configurations can be created in Knit Pay gateway configurations page at <a href="' . admin_url() . 'edit.php?post_type=pronamic_gateway">"Knit Pay >> Configurations"</a>.', 'knit-pay' ),
				],
				$this->id . '-payment-description' => [
					'title'       => __( 'Payment Description', 'knit-pay' ),
					'type'        => 'text',
					'default'     => __( 'Tour Master Order {order_id}', 'knit-pay' ),
					'description' => sprintf( __( 'Available tags: %s', 'knit-pay' ), sprintf( '<code>%s</code>', '{order_id}' ) ),
				],
				$this->id . '-payment-icon'        => [
					'title'       => __( 'Payment Icon', 'knit-pay' ),
					'type'        => 'text',
					'description' => __( 'This controls the icon which the user sees during checkout. Keep it blank to use default Icon.', 'knit-pay' ),
				],
				$this->id . '-currency'            => [
					'title'       => esc_html__( 'Currency Code', 'tourmaster' ),
					'type'        => 'text',
					'default'     => 'INR',
					'description' => __( 'Most of the Indian Payment Gateways supports only INR currency. Please check with your payment gateway which currency they support.', 'knit-pay' ),
				],
			],
		];
		return $options;
	}

	public function tourmaster_additional_payment_method( $ret ) {
		// Gateway.
		$gateway = Plugin::get_gateway( $this->config_id );

		$tourmaster_payment_method = tourmaster_get_option( 'payment', 'payment-method' );
		$method_enable             = in_array( $this->id, $tourmaster_payment_method, true );

		if ( ! $method_enable || empty( $gateway ) ) {
			return $ret;
		}

		$button_atts = [
			'method' => 'ajax',
			'type'   => $this->id,
		];

		$image_url = $this->get_icon_url();

		$ret .= '<div class="tourmaster-online-payment-method tourmaster-payment-' . $this->id . '">';
		$ret .= '<img src="' . $image_url . '" alt="' . $this->id . '" ';
		if ( ! empty( $button_atts['method'] ) && 'ajax' === $button_atts['method'] ) {
			$ret .= 'data-method="ajax" data-action="tourmaster_payment_selected" data-ajax="' . esc_url( TOURMASTER_AJAX_URL ) . '" ';
			if ( ! empty( $button_atts['type'] ) ) {
				$ret .= 'data-action-type="' . esc_attr( $button_atts['type'] ) . '" ';
			}
		}
		$ret .= ' />';
		$ret .= '<div class="tourmaster-payment-credit-card-type" >';

		// $ret .= '<img src="' . esc_attr( TOURMASTER_URL ) . '/images/' . 'visa' . '.png" alt="visa" />';
		// $ret .= '<img src="' . esc_attr( TOURMASTER_URL ) . '/images/' . 'master-card' . '.png" alt="master-card" />';

		$ret .= '</div>';
		$ret .= '</div>';

		$ret .= '<style>';
		$ret .= '.tourmaster-payment-' . $this->id . '{width: 100%;text-align: center;line-height: 1;}
				.tourmaster-payment-' . $this->id . ' > img {height: 76px;width: 170px;cursor: pointer;border-width: 2px;border-style: solid;border-color: transparent;transition: border-color 400ms;-moz-transition: border-color 400ms;-o-transition: border-color 400ms;-webkit-transition: border-color 400ms;background: white;}';

		$credit_card_types = tourmaster_get_option( 'payment', 'accepted-credit-card-type', [] );
		if ( empty( $credit_card_types ) ) {
			$ret .= '.tourmaster-payment-credit-card{display: none;}';
		}

		$ret .= '</style>';
		return $ret;
	}

	private function get_icon_url() {
		$jpg_file_name      = '/icon-170x76.jpg';
		$png_file_name      = '/icon-51x32@4x.png';
		$svg_file_name      = '/icon.svg';
		$file_relative_path = '/images/' . str_replace( '_', '-', $this->payment_method );
		$image_file         = KNITPAY_DIR . $file_relative_path;

		$payment_icon = tourmaster_get_option( 'payment', $this->id . '-payment-icon' );
		if ( ! empty( $payment_icon ) ) {
			return $payment_icon;
		}

		if ( file_exists( $image_file . $svg_file_name ) ) {
			return esc_attr( KNITPAY_URL ) . $file_relative_path . $svg_file_name;
		}

		if ( file_exists( $image_file . $jpg_file_name ) ) {
			return esc_attr( KNITPAY_URL ) . $file_relative_path . $jpg_file_name;
		}

		if ( file_exists( $image_file . $png_file_name ) ) {
			return esc_attr( KNITPAY_URL ) . $file_relative_path . $png_file_name;
		}

		return 'https://plugins.svn.wordpress.org/knit-pay/assets/icon.svg';
	}

	public function goodlayers_payment_form( $ret = '', $tid = '' ) {
		// Gateway.
		$gateway = Plugin::get_gateway( $this->config_id );

		if ( empty( $gateway ) ) {
			return $ret;
		}

		$gateway->set_payment_method( $this->payment_method );

		$booking_data = \tourmaster_get_booking_data( [ 'id' => $tid ], [ 'single' => true ] );
		$billing_info = json_decode( $booking_data->billing_info );

		/**
		 * Build payment.
		 */
		$payment = new Payment();

		$payment->source    = 'tourmaster';
		$payment->source_id = $tid;
		$payment->order_id  = $tid;

		$payment->set_description( Helper::get_description( $this->id, $tid ) );

		$payment->title = Helper::get_title( $tid );

		// Customer.
		$payment->set_customer( Helper::get_customer( $billing_info ) );

		// Address.
		$payment->set_billing_address( Helper::get_address( $billing_info ) );

		// Currency.
		$currency = Currency::get_instance( \tourmaster_get_option( 'payment', $this->id . '-currency' ) );

		// Amount.
		$payment->set_total_amount( new Money( Helper::get_amount( $tid ), $currency ) );

		// Method.
		$payment->set_payment_method( $this->payment_method );

		// Configuration.
		$payment->config_id = $this->config_id;

		try {
			$payment = Plugin::start_payment( $payment );

			ob_start();
			if ( ! empty( $payment->get_pay_redirect_url() ) ) {
				?>
<input type="hidden"
	value="<?php echo $payment->get_pay_redirect_url(); ?>"
	id="<?php echo $this->id; ?>_url" name="<?php echo $this->id; ?>_url">
<div><?php esc_html_e( 'Please wait while we redirect you to payment page.', 'knit-pay' ); ?></div>
<script type="text/javascript">
					   (function($){
						document.location = $("#<?php echo $this->id; ?>_url").val();
					})(jQuery);
			   </script>

				<?php
			} else {
				?>
<div><?php esc_html_e( 'There was an error generating the payment. Please refresh the page and try again.', 'knit-pay' ); ?></div>
				<?php
			}
		} catch ( \Exception $e ) {
			?>
<div class="tourmaster-notification-box tourmaster-failure"><p><?php echo $e->getMessage(); ?></p><p><?php esc_html_e( 'There was an error generating the payment. Please refresh the page and try again.', 'tourmaster' ); ?></p></div>
			<?php
		}

		$ret = ob_get_contents();
		ob_end_clean();

		return $ret;
	}

	/**
	 * Init.
	 */
	private function init() {
		$payment_option = tourmaster_get_option( 'payment' );

		// TODO: Remove these 2 if blocks after June 2021. If block updates old config to new format.
		if ( isset( $payment_option[ $this->payment_method . '-config-id' ] ) ) {
			if ( in_array( $this->payment_method, $payment_option['payment-method'], true ) ) {
				$payment_option['payment-method'][] = $this->id;
				$payment_option['payment-method']   = array_diff( $payment_option['payment-method'], [ $this->payment_method ] );
			}
			$payment_option[ $this->id . '-config-id' ]           = $payment_option[ $this->payment_method . '-config-id' ];
			$payment_option[ $this->id . '-currency' ]            = $payment_option[ $this->payment_method . '-currency' ];
			$payment_option[ $this->id . '-payment-description' ] = $payment_option[ $this->payment_method . '-payment-description' ];

			unset( $payment_option[ $this->payment_method . '-config-id' ] );
			unset( $payment_option[ $this->payment_method . '-currency' ] );
			unset( $payment_option[ $this->payment_method . '-payment-description' ] );
			update_option( 'tourmaster_payment', $payment_option );
		}

		$this->config_id = tourmaster_get_option( 'payment', $this->id . '-config-id' );

		if ( empty( $this->config_id ) ) {
			$this->config_id = get_option( 'pronamic_pay_config_id' );
		}
	}

	/**
	 * Instance.
	 *
	 * @param string $id gateway
	 *
	 * @return Plugin
	 */
	public static function instance( $id, $name = '', $payment_method = null ) {
		return new self( $id, $name, $payment_method );
	}
}
