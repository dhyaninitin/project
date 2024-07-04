<?php

// TODO add review notice similar to wpforms

function knit_pay_dependency_autoload( $class ) {
	if ( preg_match( '/^KnitPay\\\\(.+)?([^\\\\]+)$/U', ltrim( $class, '\\' ), $match ) ) {
		$extension_dir = KNITPAY_DIR . strtolower( str_replace( '\\', DIRECTORY_SEPARATOR, preg_replace( '/([a-z])([A-Z])/', '$1-$2', $match[1] ) ) );
		if ( ! is_dir( $extension_dir ) ) {
			$extension_dir = KNITPAY_DIR . strtolower( str_replace( '\\', DIRECTORY_SEPARATOR, preg_replace( '/([a-z])([A-Z])/', '$1$2', $match[1] ) ) );
		}

		$file = $extension_dir
		. 'src' . DIRECTORY_SEPARATOR
		. $match[2]
		. '.php';
		if ( is_readable( $file ) ) {
			require_once $file;
		}
	}
}
spl_autoload_register( 'knit_pay_dependency_autoload' );

// Gateway.
require_once KNITPAY_DIR . 'gateways/Gateway.php';
require_once KNITPAY_DIR . 'gateways/IntegrationModeTrait.php';

// Add Knit Pay Deactivate Confirmation Box on Plugin Page
require_once 'includes/plugin-deactivate-confirmation.php';

// Add Supported Extension and Gateways Sub-menu in Knit Pay Menu
require_once 'includes/supported-extension-gateway-submenu.php';

if ( ! function_exists( 'ppp' ) ) {
	function ppp( $a = '' ) {
		print_r( $a );
	}
}

if ( ! function_exists( 'ddd' ) ) {
	function ddd( $a = '' ) {
		echo nl2br( $a . PHP_EOL . PHP_EOL . PHP_EOL . PHP_EOL . PHP_EOL . PHP_EOL );
		debug_print_backtrace( DEBUG_BACKTRACE_IGNORE_ARGS );
		die( $a );
	}
}
