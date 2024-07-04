<?php
/**
 * Plugin upgrade notice
 *
 * Used to show an extra note when a big change is coming.
 *
 **/

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$file   ='cooltimeline.php';
$folder = basename( COOL_TIMELINE_PLUGIN_DIR );
$hook = "in_plugin_update_message-{$folder}/{$file}";
add_action( $hook, 'ctl_free_in_plugin_update_message', 10, 2 ); // 10:priority, 2:arguments #

/**
 * Show inline plugin update message from remote readme.txt `== Upgrade Notice ==` section.
 *
 * @param array  $args     Unused parameter.
 * @param object $response Plugin update response.
 */
function ctl_free_in_plugin_update_message( $args, $response ) {
	
	$new_version    = $response->new_version;
	$upgrade_notice = ctl_get_upgrade_notice( $new_version );

	/**
	 * Filter the inline plugin upgrade notice message.
	 *
	 * @since unknown
	 *
	 * @param string $message
	 */
	echo apply_filters(
		'ctl_free_in_plugin_update_message',
		$upgrade_notice ? '</p>' . wp_kses_post( $upgrade_notice ) . '<p class="dummmy" style="display: none;">' : ''
	); // phpcs:ignore WordPress.XSS.EscapeOutput.OutputNotEscaped
}


/**
 * Get the upgrade notice from hosted readme.txt file.
 *
 * @param string $version Plugin's new version.
 * @return string
 */
function ctl_get_upgrade_notice( $version ) {
	$transient_name = 'ctl_upgrade_notice_' . $version;
	$upgrade_notice = get_transient( $transient_name );
	
	$response = '';

	if ( false === $upgrade_notice ) {

		// @todo Use a filter and properly override in Pro code.
	//	if (get_option('ect-type')!=false && get_option('ect-type')=="FREE") {
	//	$response = wp_safe_remote_get( 'http://feedback.coolplugins.net/wp-content/uploads/2021/09/readme.txt' );
		//} else {
		$response = wp_safe_remote_get( 'https://plugins.trac.wordpress.org/browser/cool-timeline/trunk/readme.txt' );
		//}
		if ( ! is_wp_error( $response ) && ! empty( $response['body'] ) ) {
			$upgrade_notice = ctl_free_parse_update_notice( $response['body'], $version );
			set_transient( $transient_name, $upgrade_notice, HOUR_IN_SECONDS * 12 );
		}
	}
	return $upgrade_notice;
}

/**
 * Parse update notice from readme.txt file.
 *
 * @since 3.5.0
 *
 * @param  string $content readme.txt file content.
 * @param  string $new_version Plugin's new version.
 * @return string
 */
function ctl_free_parse_update_notice( $content, $new_version ) {
	$notice_regexp          = '~==\s*Upgrade Notice\s*==\s*=\s*(.*)\s*=(.*)(=\s*' . preg_quote( $new_version ) . '\s*=|$)~Uis';
	$upgrade_notice         = '';
	$upgrade_notice_version = '';
	
	if ( version_compare( COOL_TIMELINE_CURRENT_VERSION, $new_version, '>' ) ) {
		return '';
	}
	$matches = null;
	if ( preg_match( $notice_regexp, $content, $matches ) ) {
		$notices = (array) preg_split( '~[\r\n]+~', trim( $matches[2] ) );
		$upgrade_notice_version = trim( $matches[1] );
	
		if ( version_compare( COOL_TIMELINE_CURRENT_VERSION, $upgrade_notice_version, '<' ) ) {
			$upgrade_notice .= '<div class="ect-plugin-upgrade-notice">';

			foreach ( $notices as $index => $line ) {
				$upgrade_notice .= preg_replace( '~\[([^\]]*)\]\(([^\)]*)\)~', '<a href="${2}">${1}</a>', $line );
			}

			$upgrade_notice .= '</div>';
		}
	}

	return wp_kses_post( $upgrade_notice );
}
