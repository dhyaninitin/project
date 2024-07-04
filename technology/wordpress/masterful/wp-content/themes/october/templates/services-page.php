<?php

/*
	Template Name: Services Page
*/

?>

<div class="section services padding-top <?php echo esc_attr(get_theme_mod('text_alignment'), 'october'); ?>" id="<?php echo str_replace(' ', '', strtolower(get_the_title())); ?>">
	<div class="container">
		<div class="section-heading">
			<h2><?php the_title(); ?></h2>
			<?php the_content(); ?>
		</div>
		<div class="section-content">
			<?php if(get_theme_mod('services_text') != '') {
				echo "<p>" . esc_attr(get_theme_mod('services_text'), 'october') . "</p>";
			} ?>
			<div class="row text-center">
				<?php

				$custom_query = new WP_Query(array('post_type' => 'services'));

				$i = 1;

				while($custom_query->have_posts()) : $custom_query->the_post(); ?>

					<?php

					if($i < 5 || $i > 8) $effect = "fadeInLeft";
					if($i > 4 || $i > 12) $effect = "fadeInRight";

					?>

					<div class="fact col-xs-6 col-md-3 col-lg-3 wow <?php echo esc_attr($effect); ?>" data-wow-duration="1s">
						<i class="fas <?php echo get_post_meta($post->ID, 'icon', true); ?>"></i>
						<h4><?php the_title(); ?></h4>
						<?php the_content(); ?>
					</div>

					<?php $i++; ?>

				<?php endwhile; ?>

				<?php wp_reset_postdata(); ?>
			</div>
		</div>
    </div>
</div>
