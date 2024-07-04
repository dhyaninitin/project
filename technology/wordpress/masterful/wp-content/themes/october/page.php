<?php if(is_page() && !is_front_page()) {

	get_header(); ?>

	<!-- BANNER TOP -->
	<div class="banner-top" style="background-image: url(<?php echo esc_url(get_the_post_thumbnail_url()); ?>);">
		<div class="banner-content">
		<div class="banner-overlay">
			<div class="container text-center">
				<h1><?php the_title(); ?></h1>
			</div>
		</div>
		</div>
	</div>

	<div class="section padding-top <?php echo esc_attr(get_theme_mod('text_alignment'), 'october'); ?>" id="<?php echo str_replace(' ', '', strtolower(get_the_title())); ?>">
		<div class="container">
			<div class="section-content">
				<div class="row">
					<?php if(is_page() && !is_front_page()) { ?>
						<?php if (have_posts()) : while (have_posts()) : the_post(); ?>
							<?php the_content(); ?>
						<?php endwhile; endif; ?>
					<?php } ?>
				</div>
			</div>
			<?php wp_link_pages(); ?>
		</div>
	</div>

	<?php comments_template(); ?>

	<?php get_footer();

} ?>
