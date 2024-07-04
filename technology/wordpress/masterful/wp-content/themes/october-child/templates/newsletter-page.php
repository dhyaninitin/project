<?php

/*
	Template Name: Newsletter Page
*/

?>

<div class="section newsletter">
	<div class="section-content">
		<div class="container">
			<div class="col-md-12 col-sm-12 col-12 text-center">
				<h3 class="wow fadeInDown" data-wow-duration="1s"><?php the_title(); ?></h3>
				<?php the_content(); ?>
			</div>
			<div class="col-md-12 col-sm-12 col-12 text-center">
				<?php echo do_shortcode(str_replace('&quot;', '"', get_theme_mod('newsletter_form_shortcode'))); ?>
			</div>
		</div>
	</div>
</div>

<?php

$custom_query = new WP_Query(array('post_type' => 'clients'));

if($custom_query->have_posts()) :

?>

<div id="clients" class="section">
	<div class="section-content">
		<div id="owl-clients" class="owl-carousel">
			<?php 

			$custom_query = new WP_Query(array('post_type' => 'clients'));

			while($custom_query->have_posts()) : $custom_query->the_post(); ?>

				<div>
					<a href="<?php echo get_post_meta($post->ID, 'url', true); ?>"><?php the_post_thumbnail(); ?></a>
				</div>

			<?php endwhile; ?>

			<?php wp_reset_postdata(); ?>
		</div>
	</div>
</div>

<?php

endif;

?>