<?php

/*
	Template Name: Team Page
*/

?>

<div class="section padding-top <?php echo esc_attr(get_theme_mod('text_alignment'), 'october'); ?>" id="<?php echo wp_trim_words(strtolower(get_the_title())); ?>">
	<div class="container">
		<div class="section-heading">
			<h2><?php the_title(); ?></h2>
			<?php the_content(); ?>
		</div>
		<div class="section-content">
			<div class="row text-center">
				<?php

				$custom_query = new WP_Query(array('post_type' => 'team', 'order' => 'ASC'));

				$i = 1;

				while($custom_query->have_posts()) : $custom_query->the_post(); ?>

					<?php

					if($i == 1 || $i % 2 == 0) $effect = "fadeInLeft";
					if($i == 2 || $i % 3 == 0) $effect = "fadeInDown";
					if($i == 3 || $i % 4 == 0) $effect = "fadeInRight";

					?>

					<div class="col-md-4 col-sm-12 col-12 text-center" id="team-<?php the_ID(); ?>">
						<div class="team wow <?php echo esc_attr($effect); ?>" data-wow-duration="1s">
							<?php echo the_post_thumbnail(); ?>
							<div class="mask">
								<h2><?php the_title(); ?></h2>
								<p><?php echo get_post_meta($post->ID, 'role', true); ?></p>
								<a href="<?php echo get_post_meta($post->ID, 'facebook_url', true); ?>" class="info"><i class="fab fa-facebook"></i></a>
								<a href="<?php echo get_post_meta($post->ID, 'twitter_url', true); ?>" class="info"><i class="fab fa-twitter"></i></a>
								<a href="<?php echo get_post_meta($post->ID, 'google_plus_url', true); ?>" class="info"><i class="fab fa-google-plus"></i></a>
							</div>
						</div>
					</div>

					<?php $i++; ?>

				<?php endwhile; ?>

				<?php wp_reset_postdata(); ?>
			</div>
		</div>
	</div>
</div>
