<?php

namespace IGD;

class Private_Folders {
	/**
	 * @var null
	 */
	protected static $instance = null;

	public function __construct() {

	}

	/**
	 * Get users data
	 *
	 * @return array
	 */
	public function get_user_data( $args = [] ) {

		$default = [
			'number'  => 999,
			'offset'  => 0,
			'role'    => '',
			'search'  => '',
			'order'   => 'asc',
			'orderby' => 'ID',
			'fields'  => 'all_with_meta',
		];

		$args = wp_parse_args( $args, $default );

		$users_query = new \WP_User_Query( $args );

		$data = [
			'roles' => count_users()["avail_roles"],
			'total' => $users_query->get_total(),
		];

		$results = $users_query->get_results();

		// Users Data
		$users = [];

		$guest_folders = get_option( 'igd_guest_folders' );

		// Guest Data
		$users[] = [
			'id'       => 'GUEST',
			'avatar'   => '<img src="' . IGD_DIST . '/images/user-icon.png" height="32"/>',
			'username' => esc_html__( 'Guest Users', 'integrate-google-drive' ),
			'name'     => __( 'Default folders for guests and non-linked users', 'integrate-google-drive' ),
			'email'    => '',
			'role'     => '',
			'folders'  => ! empty( $guest_folders ) ? $guest_folders : [],
		];

		foreach ( $results as $user ) {

			// Gravatar
			if ( function_exists( 'get_wp_user_avatar_url' ) ) {
				$display_gravatar = get_wp_user_avatar( $user->user_email, 32 );
			} else {
				$display_gravatar = get_avatar( $user->user_email, 32 );

				if (!$display_gravatar ) {
					//Gravatar is disabled, show default image.
					$display_gravatar = '<img src="' . IGD_DIST . '/images/user-icon.png" height="32px" />';
				}
			}

			$folders = get_user_option( 'folders', $user->ID );

			$users[] = [
				'id'       => $user->ID,
				'avatar'   => $display_gravatar,
				'username' => $user->user_login,
				'name'     => $user->display_name,
				'email'    => $user->user_email,
				'role'     => implode( ', ', $this->get_role_list( $user ) ),
				'folders'  => ! empty( $folders ) ? $folders : [],
			];
		}

		$data['users'] = $users;

		return $data;
	}

	/**
	 * Get user role list
	 *
	 * @param $user
	 *
	 * @return mixed|void
	 */
	public function get_role_list( $user ) {

		$wp_roles = wp_roles();

		$role_list = [];
		foreach ( $user->roles as $role ) {
			if ( isset( $wp_roles->role_names[ $role ] ) ) {
				$role_list[ $role ] = translate_user_role( $wp_roles->role_names[ $role ] );
			}
		}

		if ( empty( $role_list ) ) {
			$role_list['none'] = _x( 'None', 'No user roles', 'integrate-google-drive' );
		}

		return apply_filters( 'get_role_list', $role_list, $user );
	}

	public static function view() {
		$auth_url = Client::instance()->get_auth_url();
		?>
        <script>
            const igdUserData = <?php echo json_encode( self::instance()->get_user_data( [ 'number' => 10 ] ) ) ?>;
            const igdAuthUrl = '<?php echo $auth_url; ?>';
        </script>

        <div class="wrap">
            <div id="igd-private-folders-app"></div>
        </div>
	<?php }

	/**
	 * @return Private_Folders|null
	 */
	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

}

Private_Folders::instance();