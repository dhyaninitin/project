<?php

namespace KnitPay\Extensions\LearnDash;

use Pronamic\WordPress\Pay\AbstractPluginIntegration;
use Pronamic\WordPress\Pay\Payments\PaymentStatus as Core_Statuses;
use LearnDash_Stripe_Integration_Base;
use Pronamic\WordPress\Pay\Payments\Payment;

/**
 * Title: Learn Dash LMS extension
 * Description:
 * Copyright: 2020-2022 Knit Pay
 * Company: Knit Pay
 *
 * @author  knitpay
 * @since   2.7.0
 */
class Extension extends AbstractPluginIntegration {
	/**
	 * Slug
	 *
	 * @var string
	 */
	const SLUG = 'learndash';

	/**
	 * Constructs and initialize Learn Dash LMS extension.
	 */
	public function __construct() {
		parent::__construct(
			[
				'name' => __( 'Learn Dash', 'pronamic_ideal' ),
			]
		);

		// Dependencies.
		$dependencies = $this->get_dependencies();

		$dependencies->add( new LearnDashDependency() );
	}

	/**
	 * Setup plugin integration.
	 *
	 * @return void
	 */
	public function setup() {
		add_filter( 'pronamic_payment_source_text_' . self::SLUG, [ $this, 'source_text' ], 10, 2 );
		add_filter( 'pronamic_payment_source_description_' . self::SLUG, [ $this, 'source_description' ], 10, 2 );
		add_filter( 'pronamic_payment_source_url_' . self::SLUG, [ $this, 'source_url' ], 10, 2 );

		// Check if dependencies are met and integration is active.
		if ( ! $this->is_active() ) {
			return;
		}

		add_filter( 'pronamic_payment_redirect_url_' . self::SLUG, [ $this, 'redirect_url' ], 10, 2 );
		add_action( 'pronamic_payment_status_update_' . self::SLUG, [ $this, 'status_update' ], 10 );

		require_once 'Gateway.php';
		require_once 'Helper.php';

		new Gateway();
	}

	/**
	 * Payment redirect URL filter.
	 *
	 * @param string  $url     Redirect URL.
	 * @param Payment $payment Payment.
	 *
	 * @return string
	 */
	public static function redirect_url( $url, $payment ) {
		$course_id = (int) $payment->get_order_id();

		// Redirecting to course Page.
		return get_permalink( $course_id );
	}

	/**
	 * Update the status of the specified payment
	 *
	 * @param Payment $payment Payment.
	 */
	public static function status_update( Payment $payment ) {
		$course_id      = (int) $payment->get_source_id();
		$user_id        = 0;
		$transaction_id = $payment->get_transaction_id();
		$course         = get_post( $course_id );
		$customer       = $payment->get_customer();

		// Get/Create user if user_id does not exists.
		if ( empty( $user_id ) && ! empty( $customer->get_email() ) ) {
			$user_id = self::get_user( $customer->get_email() );
		}
		if ( empty( $user_id ) ) {
			return;
		}
		$user = get_userdata( $user_id );

		switch ( $payment->get_status() ) {
			case Core_Statuses::CANCELLED:
			case Core_Statuses::EXPIRED:
			case Core_Statuses::FAILURE:
				self::remove_course_access( $course_id, $user_id );

				break;
			case Core_Statuses::SUCCESS:
				// Associate course with user
				self::add_course_access( $course_id, $user_id );

				// Log transaction
				$ld_transaction_id = self::record_transaction( $course, $user_id, $user->user_email, $transaction_id );
				$payment->set_source_id( $ld_transaction_id ); // FIXME don't update source id
				$payment->save();
				break;
			case Core_Statuses::OPEN:
			default:
		}

	}

	/**
	 * Source column
	 *
	 * @param string  $text    Source text.
	 * @param Payment $payment Payment.
	 *
	 * @return string $text
	 */
	public function source_text( $text, Payment $payment ) {
		$text = __( 'Learn Dash LMS', 'pronamic_ideal' ) . '<br />';

		if ( $payment->get_source_id() === $payment->get_order_id() ) {
			$text .= sprintf(
				'<a href="%s">%s</a>',
				get_edit_post_link( $payment->get_source_id() ),
				/* translators: %s: source id */
				sprintf( __( 'Course %s', 'pronamic_ideal' ), $payment->get_source_id() )
			);
			return $text;
		}

		$text .= sprintf(
			'<a href="%s">%s</a>',
			get_edit_post_link( $payment->get_source_id() ),
			/* translators: %s: source id */
			sprintf( __( 'Transaction %s', 'pronamic_ideal' ), $payment->get_source_id() )
		);
		return $text;
	}

	/**
	 * Source description.
	 *
	 * @param string  $description Description.
	 * @param Payment $payment     Payment.
	 *
	 * @return string
	 */
	public function source_description( $description, Payment $payment ) {
		if ( $payment->get_source_id() === $payment->get_order_id() ) {
			return __( 'Learn Dash LMS Course', 'knit-pay' );
		}
		return __( 'Learn Dash LMS Transaction', 'knit-pay' );
	}

	/**
	 * Source URL.
	 *
	 * @param string  $url     URL.
	 * @param Payment $payment Payment.
	 *
	 * @return string
	 */
	public function source_url( $url, Payment $payment ) {
			return get_edit_post_link( $payment->get_source_id() );
	}

	/**
	 * Associate course with user
	 *
	 * @param  int $course_id Post ID of a course
	 * @param  int $user_id   ID of a user
	 *
	 * @see LearnDash_Stripe_Integration_Base::add_course_access
	 */
	public static function add_course_access( $course_id, $user_id ) {
		$course_id = absint( $course_id );
		$user_id   = absint( $user_id );

		if ( ( ! empty( $course_id ) ) && ( ! empty( $user_id ) ) ) {
			if ( learndash_get_post_type_slug( 'course' ) === get_post_type( $course_id ) ) {
				ld_update_course_access( $user_id, $course_id );
			} elseif ( learndash_get_post_type_slug( 'group' ) === get_post_type( $course_id ) ) {
				ld_update_group_access( $user_id, $course_id );
			}
		}
	}

	/**
	 * Remove course access from user
	 *
	 * @param  int $course_id LearnDash course ID
	 * @param  int $user_id   User ID
	 *
	 * @see LearnDash_Stripe_Integration_Base::remove_course_access
	 */
	public static function remove_course_access( $course_id, $user_id ) {
		$course_id = absint( $course_id );
		$user_id   = absint( $user_id );

		if ( ( ! empty( $course_id ) ) && ( ! empty( $user_id ) ) ) {
			if ( learndash_get_post_type_slug( 'course' ) === get_post_type( $course_id ) ) {
				ld_update_course_access( $user_id, $course_id, true );
			} elseif ( learndash_get_post_type_slug( 'group' ) === get_post_type( $course_id ) ) {
				ld_update_group_access( $user_id, $course_id, true );
			}
		}
	}

	/**
	 * Record transaction in database
	 *
	 * @param  array  $transaction  Transaction data passed through $_POST
	 * @param  int    $course    WP_Post of a course
	 * @param  int    $user_id      ID of a user
	 * @param  string $user_email   Email of the user
	 */
	public static function record_transaction( $course, $user_id, $user_email, $transaction_id ) {
		// ld_debug( 'Starting Transaction Creation.' );

		$transaction['user_id']        = $user_id;
		$transaction['course_id']      = $course->ID;
		$transaction['transaction_id'] = $transaction_id;

		$course_title = $course->post_title;

		// ld_debug( 'Course Title: ' . $course_title );

		$ld_transaction_id = wp_insert_post(
			[
				'post_title'  => "Course {$course_title} Purchased By {$user_email}",
				'post_type'   => 'sfwd-transactions',
				'post_status' => 'publish',
				'post_author' => $user_id,
			]
		);

		// ld_debug( 'Created Transaction. Post Id: ' . $post_id );

		foreach ( $transaction as $key => $value ) {
			update_post_meta( $ld_transaction_id, $key, $value );
		}

		return $ld_transaction_id;
	}

	/**
	 * Get user ID of the customer
	 *
	 * @param  string $email       User email address
	 * @return int                 WP_User ID
	 */
	public static function get_user( $email ) {
		$user = get_user_by( 'email', $email );

		if ( false === $user ) {
			$password = wp_generate_password( 18, true, false );
			$new_user = self::create_user( $email, $password, $email );

			if ( ! is_wp_error( $new_user ) ) {
				$user_id = $new_user;

				// Need to allow for older versions of WP.
				global $wp_version;
				if ( version_compare( $wp_version, '4.3.0', '<' ) ) {
					wp_new_user_notification( $user_id, $password );
				} elseif ( version_compare( $wp_version, '4.3.0', '==' ) ) {
					wp_new_user_notification( $user_id, 'both' );
				} elseif ( version_compare( $wp_version, '4.3.1', '>=' ) ) {
					wp_new_user_notification( $user_id, null, 'both' );
				}
			}
		} else {
			$user_id = $user->ID;
		}

		return $user_id;
	}

	/**
	 * Create user if not exists
	 *
	 * @param  string $username
	 * @param  string $password
	 * @return int               Newly created user ID
	 */
	public static function create_user( $email, $password, $username ) {
		if ( apply_filters( 'learndash_knit_pay_create_short_username', false ) ) {
			$username = preg_replace( '/(.*)\@(.*)/', '$1', $email );
		}

		if ( username_exists( $username ) ) {
			$random_chars = str_shuffle( substr( md5( time() ), 0, 5 ) );
			$username     = $username . '-' . $random_chars;
		}

		$user_id = wp_create_user( $username, $password, $email );

		do_action( 'learndash_knit_pay_after_create_user', $user_id );

		return $user_id;
	}

}
