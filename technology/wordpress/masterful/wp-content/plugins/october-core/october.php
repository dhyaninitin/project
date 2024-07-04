<?php

/*
	Plugin Name: October
	Version: 1.1
	Description: October Customization
	Author: <a href="https://ravenbluethemes.com" title="Website Riccardo Borchi">Raven Blue Themes</a>
	Author URI: https://ravenbluethemes.com
*/

function october_services() {

	$labels = array(
		'name'               => esc_html__('Services', "october"),
		'singular_name'      => esc_html__('Services', "october"),
		'add_new'            => esc_html__('Add New', "october"),
		'add_new_item'       => esc_html__('Add New Service', "october"),
		'edit_item'          => esc_html__('Edit Service', "october"),
		'new_item'           => esc_html__('New Service', "october"),
		'all_items'          => esc_html__('All Services', "october"),
		'view_item'          => esc_html__('View Service', "october"),
		'search_items'       => esc_html__('Search Services', "october"),
		'not_found'          => esc_html__('No Service Found', "october"),
		'not_found_in_trash' => esc_html__('No Services Found In Trash', "october"),
		'parent_item_colon'  => '',
		'menu_name'          => esc_html__('Services', "october")
	);

	$args = array(
		'labels'             => $labels,
		'public'             => true,
		'publicly_queryable' => true,
		'show_ui'            => true,
		'show_in_menu'       => true,
		'query_var'          => true,
		'rewrite'            => array('slug' => 'services','with_front' => false),
		'capability_type'    => 'post',
		'has_archive'        => true,
		'hierarchical'       => false,
		'menu_position'      => null,
		'menu_icon'          => '',
		'supports'           => array('title', 'editor', 'thumbnail')
	);

	register_post_type('services', $args);

}

add_action('init', 'october_services');

/* SERVICES ADMIN COLUMNS */

function october_services_edit_columns($columns){

	$columns['cb'] = "<input type=\"checkbox\" />";
	$columns['title'] = esc_html__("Service", "october");

	return $columns;

}

add_filter("manage_edit-services_columns", "october_services_edit_columns");

function october_add_services_meta_box() {

	add_meta_box(
        "october-service-icon",
        esc_html__("Icon", "october"),
        "october_service_icon",
        "services",
        "normal",
        "high"
    );

}

add_action("admin_init", "october_add_services_meta_box");


function october_service_icon($post) {

	$values = get_post_custom($post->ID);
    $icon = isset($values['icon']) ? esc_html__($values["icon"][0], "october") : "";

?>
	<div>
        <label for="icon"><?php echo esc_html__('Enter Service Icon here:', "october"); ?></label>
        <input name="icon" id="icon" type="text" style="width: 100%; margin: 0;" value="<?php echo $icon; ?>" />
    </div>
<?php

}

function october_save_service($post_id) {

    if(defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;

    if(isset($_POST['icon'])) { update_post_meta($post_id, "icon", $_POST["icon"]); }

}

add_action('save_post', 'october_save_service');

function october_clients() {

	$labels = array(
		'name'               => esc_html__('Clients', "october"),
		'singular_name'      => esc_html__('Clients', "october"),
		'add_new'            => esc_html__('Add New', "october"),
		'add_new_item'       => esc_html__('Add New client', "october"),
		'edit_item'          => esc_html__('Edit Client', "october"),
		'new_item'           => esc_html__('New Client', "october"),
		'all_items'          => esc_html__('All Clients', "october"),
		'view_item'          => esc_html__('View Client', "october"),
		'search_items'       => esc_html__('Search Clients', "october"),
		'not_found'          => esc_html__('No Client Found', "october"),
		'not_found_in_trash' => esc_html__('No Clients Found In Trash', "october"),
		'parent_item_colon'  => '',
		'menu_name'          => esc_html__('Clients', "october")
	);

	$args = array(
		'labels'             => $labels,
		'public'             => true,
		'publicly_queryable' => true,
		'show_ui'            => true,
		'show_in_menu'       => true,
		'query_var'          => true,
		'rewrite'            => array('slug' => 'clients','with_front' => false),
		'capability_type'    => 'post',
		'has_archive'        => true,
		'hierarchical'       => false,
		'menu_position'      => null,
		'menu_icon'          => '',
		'supports'           => array('title', 'editor', 'thumbnail')
	);

	register_post_type('clients', $args);

}

add_action('init', 'october_clients');

/* CLIENTS ADMIN COLUMNS */

function october_clients_edit_columns($columns){

	$columns['cb'] = "<input type=\"checkbox\" />";
	$columns['title'] = esc_html__("Client", "october");

	return $columns;

}

add_filter("manage_edit-clients_columns", "october_clients_edit_columns");

function october_remove_pages_editor_clients() {
    remove_post_type_support('clients', 'editor');
}

add_action('init', 'october_remove_pages_editor_clients');


function october_add_clients_meta_box() {

	add_meta_box(
        "october-client-url",
        esc_html__("Client URL", "october"),
        "october_client_url",
        "clients",
        "normal",
        "high"
    );

}

add_action("admin_init", "october_add_clients_meta_box");

function october_client_url($post) {

	$values = get_post_custom($post->ID);
    $url = isset($values['url']) ? esc_html__($values["url"][0], "october") : "";

?>
	<div>
        <label for="url"><?php echo esc_html__('Enter Client URL here:', "october"); ?></label>
        <input name="url" id="url" type="text" style="width: 100%; margin: 0;" value="<?php echo $url; ?>" />
    </div>
<?php

}

function october_save_client($post_id) {

    if(defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;

    if(isset($_POST['url'])) { update_post_meta($post_id, "url", $_POST["url"]); }

}

add_action('save_post', 'october_save_client');

function october_portfolio() {

	$labels = array(
		'name'               => esc_html__('Portfolio', "october"),
		'singular_name'      => esc_html__('Portfolio', "october"),
		'add_new'            => esc_html__('Add New', "october"),
		'add_new_item'       => esc_html__('Add New project', "october"),
		'edit_item'          => esc_html__('Edit Project', "october"),
		'new_item'           => esc_html__('New Project', "october"),
		'all_items'          => esc_html__('All Projects', "october"),
		'view_item'          => esc_html__('View Project', "october"),
		'search_items'       => esc_html__('Search Projects', "october"),
		'not_found'          => esc_html__('No Projects Found', "october"),
		'not_found_in_trash' => esc_html__('No Projects Found In Trash', "october"),
		'parent_item_colon'  => '',
		'menu_name'          => esc_html__('Portfolio', "october")
	);

	$args = array(
		'labels'             => $labels,
		'public'             => true,
		'publicly_queryable' => true,
		'show_ui'            => true,
		'show_in_menu'       => true,
		'query_var'          => true,
		'rewrite'            => array('slug' => 'portfolio','with_front' => false),
		'capability_type'    => 'post',
		'has_archive'        => true,
		'hierarchical'       => false,
		'menu_position'      => null,
		'menu_icon'          => '',
		'supports'           => array('title', 'editor', 'thumbnail')
	);

	register_post_type('portfolio', $args);

}

add_action('init', 'october_portfolio');

/* PORTFOLIO ADMIN COLUMNS */

function october_portfolio_edit_columns($columns){

	$columns['cb'] = "<input type=\"checkbox\" />";
	$columns['title'] = esc_html__("Project Title", "october");

	return $columns;

}

add_filter("manage_edit-portfolio_columns", "october_portfolio_edit_columns");

function october_team() {

	$labels = array(
		'name'               => esc_html__('Team', "october"),
		'singular_name'      => esc_html__('Team', "october"),
		'add_new'            => esc_html__('Add New', "october"),
		'add_new_item'       => esc_html__('Add New Team Member', "october"),
		'edit_item'          => esc_html__('Edit Team Member', "october"),
		'new_item'           => esc_html__('New Team Member', "october"),
		'all_items'          => esc_html__('All Team Members', "october"),
		'view_item'          => esc_html__('View Team Member', "october"),
		'search_items'       => esc_html__('Search Team Members', "october"),
		'not_found'          => esc_html__('No Team Member Found', "october"),
		'not_found_in_trash' => esc_html__('No Team Members Found In Trash', "october"),
		'parent_item_colon'  => '',
		'menu_name'          => esc_html__('Team', "october")
	);

	$args = array(
		'labels'             => $labels,
		'public'             => true,
		'publicly_queryable' => true,
		'show_ui'            => true,
		'show_in_menu'       => true,
		'query_var'          => true,
		'rewrite'            => array('slug' => 'team','with_front' => false),
		'capability_type'    => 'post',
		'has_archive'        => true,
		'hierarchical'       => false,
		'menu_position'      => null,
		'menu_icon'          => '',
		'supports'           => array('title', 'editor', 'thumbnail')
	);

	register_post_type('team', $args);

}

add_action('init', 'october_team');

/* TEAM ADMIN COLUMNS */

function october_team_edit_columns($columns) {

	$columns['cb'] = "<input type=\"checkbox\" />";
	$columns['title'] = esc_html__("Team Member", "october");

	return $columns;

}

add_filter("manage_edit-team_columns", "october_team_edit_columns");

function october_remove_pages_editor_team() {
    remove_post_type_support('team', 'editor');
}

add_action('init', 'october_remove_pages_editor_team');

function october_add_team_meta_box() {

	add_meta_box(
        "october-team-role",
        esc_html__("Role", "october"),
        "october_team_role",
        "team",
        "normal",
        "high"
    );

	add_meta_box(
        "october-team-socials-url",
        esc_html__("Social Network", "october"),
        "october_team_socials_url",
        "team",
        "normal",
        "high"
    );

}

add_action("admin_init", "october_add_team_meta_box");

function october_team_role($post) {

	$values = get_post_custom($post->ID);
    $role = isset($values['role']) ? esc_html__($values["role"][0], "october") : "";

?>
	<div>
        <label for="role"><?php echo esc_html__('Enter Role here:', "october"); ?></label>
        <input name="role" id="role" type="text" style="width: 100%; margin: 0;" value="<?php echo $role; ?>" />
    </div>
<?php

}

function october_team_socials_url($post) {

	$values = get_post_custom($post->ID);
    $facebook_url = isset($values['facebook_url']) ? esc_url($values["facebook_url"][0]) : "";
    $twitter_url = isset($values['twitter_url']) ? esc_url($values["twitter_url"][0]) : "";
    $instagram_url = isset($values['instagram_url']) ? esc_url($values["instagram_url"][0]) : "";

?>
	<div>
        <label for="facebook_url"><?php echo esc_html__('Enter Facebook URL here:', "october"); ?></label>
        <input name="facebook_url" id="facebook-url" type="text" style="width: 100%; margin: 0;" value="<?php echo $facebook_url; ?>" />
    </div>

    <div>
        <label for="twitter_url"><?php echo esc_html__('Enter Twitter URL here:', "october"); ?></label>
        <input name="twitter_url" id="twitter-url" type="text" style="width: 100%; margin: 0;" value="<?php echo $twitter_url; ?>" />
    </div>

    <div>
        <label for="instagram_url"><?php echo esc_html__('Enter Instagram URL here:', "october"); ?></label>
        <input name="instagram_url" id="instagram-url" type="text" style="width: 100%; margin: 0;" value="<?php echo $instagram_url; ?>" />
    </div>
<?php

}

function october_save_team_member($post_id) {

    if(defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;

    if(isset($_POST['role'])) { update_post_meta($post_id, "role", $_POST["role"]); }
    if(isset($_POST['facebook_url'])) { update_post_meta($post_id, "facebook_url", $_POST["facebook_url"]); }
    if(isset($_POST['twitter_url'])) { update_post_meta($post_id, "twitter_url", $_POST["twitter_url"]); }
    if(isset($_POST['instagram_url'])) { update_post_meta($post_id, "instagram_url", $_POST["instagram_url"]); }

}

add_action('save_post', 'october_save_team_member');

function october_testimonials() {

	$labels = array(
		'name'               => esc_html__('Testimonials', "october"),
		'singular_name'      => esc_html__('Testimonials', "october"),
		'add_new'            => esc_html__('Add New', "october"),
		'add_new_item'       => esc_html__('Add New Testimonial', "october"),
		'edit_item'          => esc_html__('Edit Testimonial', "october"),
		'new_item'           => esc_html__('New Testimonial', "october"),
		'all_items'          => esc_html__('All Testimonials', "october"),
		'view_item'          => esc_html__('View Testimonial', "october"),
		'search_items'       => esc_html__('Search Testimonials', "october"),
		'not_found'          => esc_html__('No Testimonial Found', "october"),
		'not_found_in_trash' => esc_html__('No Testimonials Found In Trash', "october"),
		'parent_item_colon'  => '',
		'menu_name'          => esc_html__('Testimonials', "october")
	);

	$args = array(
		'labels'             => $labels,
		'public'             => true,
		'publicly_queryable' => true,
		'show_ui'            => true,
		'show_in_menu'       => true,
		'query_var'          => true,
		'rewrite'            => array('slug' => 'testimonials','with_front' => false),
		'capability_type'    => 'post',
		'has_archive'        => true,
		'hierarchical'       => false,
		'menu_position'      => null,
		'menu_icon'          => '',
		'supports'           => array('title', 'editor', 'thumbnail')
	);

	register_post_type('testimonials', $args);

}

add_action('init', 'october_testimonials');

/* TESTIMONIALS ADMIN COLUMNS */

function october_testimonials_edit_columns($columns){

	$columns['cb'] = "<input type=\"checkbox\" />";
	$columns['title'] = esc_html__("Testimonial", "october");

	return $columns;

}

add_filter("manage_edit-testimonials_columns", "october_testimonials_edit_columns");

?>
