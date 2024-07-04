<?php
namespace KnitPay\Gateways\Razorpay;

use Pronamic\WordPress\Pay\Plugin;
use Pronamic\WordPress\Pay\Payments\PaymentStatus;
use Razorpay\Api\Api;
use Razorpay\Api\Errors;

/**
 * Title: Razorpay Webhook Listner
 * Copyright: 2020-2022 Knit Pay
 *
 * @author Knit Pay
 * @version 1.0.0
 * @since 2.2.4.0
 */
class Listener {


	public static function listen() {
		if ( ! filter_has_var( INPUT_GET, 'kp_razorpay_webhook' ) ) {
			return;
		}

		$post_body = file_get_contents( 'php://input' );
		$data      = json_decode( $post_body, true );

		if ( json_last_error() !== 0 ) {
			exit;
		}

		if ( empty( $data['event'] ) ) {
			exit;
		}

		$event_type = explode( '.', $data['event'] )[0];

		switch ( $event_type ) {
			case 'payment':
				$razorpay_payment = $data['payload']['payment']['entity'];
				if ( ! isset( $razorpay_payment['notes']['knitpay_payment_id'] ) ) {
					exit;
				}
				$payment = get_pronamic_payment( $razorpay_payment['notes']['knitpay_payment_id'] );
				if ( is_null( $payment ) ) {
					exit;
				}

				$razorpay_integration = new Integration();
				$config               = $razorpay_integration->get_config( $payment->get_config_id() );

				if ( ! self::verify_webhook_signature( $post_body, $config ) ) {
					exit;
				}

				if ( empty( $config->merchant_id ) && isset( $data['account_id'] ) ) {
					$merchant_id = str_replace( 'acc_', '', $data['account_id'] );

					update_post_meta( $payment->get_config_id(), '_pronamic_gateway_razorpay_merchant_id', $merchant_id );
					wp_remote_post(
						Integration::KNIT_PAY_RAZORPAY_PLATFORM_CONNECT_URL,
						[
							'body'    => [
								'admin_url'   => rawurlencode( home_url( '/' ) ),
								'action'      => 'check-connection',
								'merchant_id' => $merchant_id,
								'mode'        => $config->mode,
								'auth_type'   => $razorpay_payment['notes']['auth_type'] . ' Webhook',
							],
							'timeout' => 10,
						]
					);
				}

				break;
			/*
			 case 'subscription':
				if ( 'subscription.charged' !== $data['event'] || ! array_key_exists( 'knitpay_subscription_id', $data['payload']['subscription']['entity']['notes'] ) ) {
					exit;
				}

				$knitpay_subscription_id  = $data['payload']['subscription']['entity']['notes']['knitpay_subscription_id'];
				$razorpay_subscription_id = $data['payload']['subscription']['entity']['id'];
				$razorpay_order_id        = $data['payload']['payment']['entity']['order_id'];

				if ( ! is_null( get_pronamic_payment_by_meta( '_pronamic_payment_razorpay_order_id', $razorpay_order_id ) ) ) {
					exit;
				}

				$subscription = \get_pronamic_subscription( $knitpay_subscription_id );

				if ( ! isset( $subscription ) ) {
					exit;
				}

				if ( ! self::verify_webhook_signature( $post_body, $subscription->get_config_id() ) ) {
					exit;
				}

				// First Payment
				if ( PaymentStatus::SUCCESS !== $subscription->get_first_payment()->get_status() ) {
					$payment = get_pronamic_payment_by_meta( '_pronamic_payment_razorpay_subscription_id', $razorpay_subscription_id );
					if ( ! isset( $payment ) ) {
						exit;
					}
					break;
				}

				$payment = pronamic_pay_plugin()->subscriptions_module->start_next_period_payment( $subscription );

				$payment->set_meta( 'razorpay_order_id', $razorpay_order_id );
				$payment->set_meta( 'razorpay_subscription_id', $razorpay_subscription_id );
				break; */
			default:
				exit;
		}

		if ( null === $payment ) {
			exit;
		}

		// Add note.
		$note = sprintf(
		/* translators: %s: Razorpay */
			__( 'Webhook requested by %s.', 'knit-pay' ),
			__( 'Razorpay', 'knit-pay' )
		);

		$payment->add_note( $note );

		// Log webhook request.
		do_action( 'pronamic_pay_webhook_log_payment', $payment );

		// Update payment.
		Plugin::update_payment( $payment, false );
		exit;
	}

	private static function verify_webhook_signature( $post_body, $config ) {
		$webhook_secret = $config->webhook_secret;

		$api = new Api( $config->key_id, $config->key_secret );

		$razorpay_signature = isset( $_SERVER['HTTP_X_RAZORPAY_SIGNATURE'] ) ? $_SERVER['HTTP_X_RAZORPAY_SIGNATURE'] : '';

		if ( ! empty( $razorpay_signature ) || isset( $webhook_secret ) ) {
			try {
				$api->utility->verifyWebhookSignature(
					$post_body,
					$razorpay_signature,
					$webhook_secret
				);
			} catch ( Errors\SignatureVerificationError $e ) {
				return false;
			}
		}
		return true;
	}
}
