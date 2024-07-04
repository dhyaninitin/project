<?php get_header(); ?>

<!-- BANNER TOP -->
<div class="banner-top" style="background-image: url(<?php echo esc_url(get_the_post_thumbnail_url(get_option( 'page_for_posts' ), 'full')); ?>);">
	<div class="banner-overlay">
		<div class="banner-content">
			<div class="container text-center">
				<h1><?php echo get_the_title( get_option('page_for_posts', true) ); ?></h1>
			</div>
		</div>
	</div>
</div>

<?php

$content_class = '';

if(is_active_sidebar('sidebar-1') && function_exists('get_field') && get_field('sidebar', 'option') && function_exists('get_field') && get_field('sidebar_position', 'option') == 'left') {
	 $content_class .= 'pl-5';
}

if(is_active_sidebar('sidebar-1') && ((function_exists('get_field') && get_field('sidebar', 'option') && get_field('sidebar_position', 'option') == 'right') || !function_exists('get_field'))) {
	 $content_class .= 'pr-5';
}

?>

<div class="container">

	<?php if(is_active_sidebar('sidebar-1')) { ?>

		<div class="row">
			<?php if(function_exists('get_field') && get_field('sidebar', 'option') && get_field('sidebar_position', 'option') == 'left') {
				get_sidebar();
			}

			if((function_exists('get_field') && get_field('sidebar', 'option')) || !function_exists('get_field')) { ?>
				<div class="col-lg-9 col-12 <?php echo esc_attr($content_class); ?>">
			<?php } ?>

	<?php } ?>

	<?php
		$args = array("post_type" => "post", "order" => "DESC");
		$the_query = new WP_Query($args);
		if(have_posts()) :
			while($the_query->have_posts()) : $the_query->the_post();
				get_template_part('single', 'content');
		 	endwhile;
		endif;
		wp_reset_postdata();
	?>

	<?php if(is_active_sidebar('sidebar-1')) { ?>

		</div>

	<?php if((function_exists('get_field') && get_field('sidebar', 'option') && get_field('sidebar_position', 'option') == 'right') || !function_exists('get_field')) { ?>

		<?php get_sidebar(); ?>

	<?php } ?>

		</div>

	<?php } ?>

</div>

<?php get_footer(); ?>
