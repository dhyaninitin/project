<?php
/**
 * Plugin Name: Knit Pay
 * Plugin URI: https://www.knitpay.org
 * Description: Top Indian payment gateways knitted together to integrate with major WordPress Plugins.
 *
 * Version: 6.65.3.0
 * Requires at least: 5.7
 * Requires PHP: 5.6
 *
 * WC requires at least: 2.3.0
 * WC tested up to: 5.9
 *
 * Author: KnitPay
 * Author URI: https://www.knitpay.org
 *
 * Text Domain: knit-pay-lang
 * Domain Path: /languages/
 *
 * License: GPL-3.0-or-later
 *
 * @author    KnitPay
 * @license   GPL-3.0-or-later
 * @package   KnitPay
 * @copyright 2020-2022 Knit Pay
 */

/**
 * Autoload.
 */

if ( ! defined( 'KNIT_PAY_DEBUG' ) ) {
	define( 'KNIT_PAY_DEBUG', false );
}
if ( ! defined( 'PRONAMIC_PAY_DEBUG' ) ) {
	define( 'PRONAMIC_PAY_DEBUG', false );
}

define( 'KNITPAY_URL', plugins_url( '', __FILE__ ) );
define( 'KNITPAY_DIR', plugin_dir_path( __FILE__ ) );
define( 'KNITPAY_PATH', __FILE__ );

$loader = require __DIR__ . '/vendor/autoload.php';

require KNITPAY_DIR . 'include.php';

/**
 * Bootstrap.
 */
$plugin_obj = \Pronamic\WordPress\Pay\Plugin::instance(
	array(
		'file'             => __FILE__,
		'options'          => array(), /*
	array(
			'about_page_file' => __DIR__ . '/admin/page-about.php',
		)*/
		'action_scheduler' => __DIR__ . '/packages/action-scheduler/action-scheduler.php',
	)
);
define( 'KNITPAY_VERSION', $plugin_obj->get_version() );

add_filter(
	'pronamic_pay_plugin_integrations',
	function( $integrations ) {
		// Charitable.
		$integrations[] = new \Pronamic\WordPress\Pay\Extensions\Charitable\Extension();
		
		// Contact Form 7.
		$integrations[] = new \KnitPay\Extensions\ContactForm7\Extension();

		// Easy Digital Downloads.
		$integrations[] = new \Pronamic\WordPress\Pay\Extensions\EasyDigitalDownloads\Extension();

		// Give.
		$integrations[] = new \Pronamic\WordPress\Pay\Extensions\Give\Extension();

		// Knit Pay - Payment Link.
		$integrations[] = new \KnitPay\Extensions\KnitPayPaymentLink\Extension();

		// LearnPress.
		$integrations[] = new \KnitPay\Extensions\LearnPress\Extension();

		// LifterLMS.
		$integrations[] = new \KnitPay\Extensions\LifterLMS\Extension();

		// NinjaForms.
		$integrations[] = new \Pronamic\WordPress\Pay\Extensions\NinjaForms\Extension();

		// Paid Memberships Pro.
		$integrations[] = new \KnitPay\Extensions\PaidMembershipsPro\Extension();

		// Tourmaster.
		$integrations[] = new \KnitPay\Extensions\TourMaster\Extension();

		// WPTravelEngine.
		$integrations[] = new \KnitPay\Extensions\WPTravelEngine\Extension();

		// WooCommerce.
		$integrations[] = new \Pronamic\WordPress\Pay\Extensions\WooCommerce\Extension();

		// Return integrations.
		return $integrations;
	}
);

add_filter(
	'pronamic_pay_gateways',
	function( $gateways ) {
		// Cashfree.
		$gateways[] = new \KnitPay\Gateways\Cashfree\Integration();

		// CCAvenue.
		// $gateways[] = new \KnitPay\Gateways\CCAvenue\Integration();

		// Instamojo.
		$gateways[] = new \KnitPay\Gateways\Instamojo\Integration();

		// Manual.
		$gateways[] = new \KnitPay\Gateways\Manual\Integration();

		// Open Money.
		$gateways[] = new \KnitPay\Gateways\OpenMoney\Integration();

		// PayU.
		// Activate Razorpay API for all.
		if ( ! defined( 'KNIT_PAY_PAYU' ) ) {
			define( 'KNIT_PAY_PAYU', true );
		}
		if ( ! defined( 'KNIT_PAY_PAYU_BIZ_API' ) ) {
			define( 'KNIT_PAY_PAYU_BIZ_API', true );
		}
		$gateways[] = new \KnitPay\Gateways\PayU\Integration();
		$gateways[] = new \KnitPay\Gateways\PayUmoney\Integration();

		// Easebuzz.
		$gateways[] = new \KnitPay\Gateways\Easebuzz\Integration();

		// RazorPay.
		// Activate Razorpay API for all.
		if ( ! defined( 'KNIT_PAY_RAZORPAY_API' ) && ! defined( 'KNIT_PAY_RAZORPAY_CONNECT' ) ) {
			define( 'KNIT_PAY_RAZORPAY_API', true );
		}
		$gateways[] = new \KnitPay\Gateways\Razorpay\Integration();

		// Stripe Connect.
		$gateways[] = new \KnitPay\Gateways\Stripe\Connect\Integration();

		// Test.
		$gateways[] = new \KnitPay\Gateways\Test\Integration();

		// UPI QR.
		$gateways[] = new \KnitPay\Gateways\UpiQR\Integration();

		// Return gateways.
		return $gateways;
	}
);

/**
 * Backward compatibility.
 */
global $pronamic_ideal;

$pronamic_ideal = pronamic_pay_plugin();


// Show Error If no configuration Found
function knitpay_admin_no_config_error() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}

	if ( 0 === wp_count_posts( 'pronamic_gateway' )->publish ) {
		$class              = 'notice notice-error';
		$url                = admin_url() . 'post-new.php?post_type=pronamic_gateway';
		$link               = '<a href="' . $url . '">' . __( 'Knit Pay >> Configurations', 'knit-pay' ) . '</a>';
		$supported_gateways = '<br><a href="https://www.knitpay.org/indian-payment-gateways-supported-in-knit-pay/">' . __( 'Check the list of Supported Payment Gateways', 'knit-pay' ) . '</a>';
		$message            = sprintf( __( '<b>Knit Pay:</b> No Payment Gateway configuration was found. %1$s and visit %2$s to add the first configuration before start using Knit Pay.', 'knit-pay' ), $supported_gateways, $link );

		printf( '<div class="%1$s"><p>%2$s</p></div>', esc_attr( $class ), $message );
	}
}
add_action( 'admin_notices', 'knitpay_admin_no_config_error' );


// Add custom link on plugin page
function knitpay_filter_plugin_action_links( array $actions ) {
	return array_merge(
		array(
			'configurations' => '<a href="edit.php?post_type=pronamic_gateway">' . esc_html__( 'Configurations', 'knit-pay' ) . '</a>',
			'payments'       => '<a href="edit.php?post_type=pronamic_payment">' . esc_html__( 'Payments', 'knit-pay' ) . '</a>',
		),
		$actions
	);
}
$plugin = plugin_basename( __FILE__ );
add_filter( "network_admin_plugin_action_links_$plugin", 'knitpay_filter_plugin_action_links' );
add_filter( "plugin_action_links_$plugin", 'knitpay_filter_plugin_action_links' );


// Added to fix Razorpay double ? issue in callback URL
function knitpay_fix_get_url() {
	$current_url = home_url( $_SERVER['REQUEST_URI'] );
	if ( 1 < substr_count( $current_url, '?' ) ) {
		$current_url = str_replace_n( '?', '&', $current_url, 2 );
		wp_redirect( $current_url );
		exit;
	}
}
// https://vijayasankarn.wordpress.com/2017/01/03/string-replace-nth-occurrence-php/
function str_replace_n( $search, $replace, $subject, $occurrence ) {
	$search = preg_quote( $search );
	return preg_replace( "/^((?:(?:.*?$search){" . --$occurrence . "}.*?))$search/", "$1$replace", $subject );
}
add_action( 'init', 'knitpay_fix_get_url', 0 );

add_action( 'plugins_loaded', 'plugins_loaded', -10 );
function plugins_loaded() {
	if ( \defined( 'KNIT_PAY_ENGINE_THEMES' ) ) {
		require_once KNITPAY_DIR . 'extensions/enginethemes/init.php';
	}
}
