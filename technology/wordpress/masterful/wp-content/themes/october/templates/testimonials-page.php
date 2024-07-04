<?php

/*
	Template Name: Testimonials Page
*/

?>

<div class="section testimonials parallax-container <?php echo esc_attr(get_theme_mod('text_alignment'), 'october'); ?>" data-parallax="scroll" data-image-src="<?php echo esc_url(get_theme_mod("main_top_image"), 'october'); ?>" data-natural-width="1200" data-natural-height="1200" id="<?php echo str_replace(' ', '', strtolower(get_the_title())); ?>">
	<div class="section-heading">
		<h2><?php the_title(); ?></h2>
		<?php the_content(); ?>
	</div>
	<div class="section-content">
		<div class="container">
			<div id="owl-testimonials" class="owl-carousel">
				<?php 

				$custom_query = new WP_Query(array('post_type' => 'testimonials'));

				while($custom_query->have_posts()) : $custom_query->the_post(); ?>

					<div>
						<?php the_content(); ?>
						<p class="mini">- <?php the_title(); ?> -</p>
					</div>

				<?php endwhile; ?>

				<?php wp_reset_postdata(); ?>
			</div>
		</div>
	</div>
</div>