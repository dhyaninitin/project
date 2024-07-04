<?php

/*
	Template Name: Portfolio Page
*/

?>

<div class="section portfolio padding-top <?php echo esc_attr(get_theme_mod('text_alignment'), 'october'); ?>" id="our-happy-place">
	<div class="container">
		<div class="section-heading">
			<h2><?php the_title(); ?></h2>
			<?php the_content(); ?>
		</div>
	</div>
	</div>
	<!--div class="section-content">
		<div class="work-item-wrapper">
			<div class="row work-item-list">
				<?php

				$custom_query = new WP_Query(array('post_type' => 'portfolio', 'order' => 'ASC'));

				while($custom_query->have_posts()) : $custom_query->the_post(); ?>

					<div class="col-md-4 col-sm-6 col-12 work-item" id="project-<?php the_ID(); ?>">
						<?php the_post_thumbnail(); ?>
						<div class="image-overlay">
							<?php if (function_exists('get_field') && !get_field('disable_popup')) { ?>
							<a href="<?php echo esc_url(the_post_thumbnail_url()); ?>" class="media-popup" title="<?php the_title(); ?>">
							<?php }else{ ?>
							<a href="<?php echo esc_url(the_permalink()); ?>" title="<?php the_title(); ?>">
							<?php } ?>
								<div class="work-item-info">
									<h3><?php the_title(); ?></h3>
									<?php the_content(); ?>
									<i class="fas fa-search-plus"></i>
								</div>
							</a>
						</div>
					</div>

				<?php endwhile; ?>

				<?php wp_reset_postdata(); ?>
			</div>
		</div>
	</div>
</div-->
<!--div id="purchase" class="section dark">
	<div class="section-content">
		<div class="container partner-table">
			<div class="col-md-12 col-sm-12 col-12 text-center partner">
				<a href="<?php echo esc_attr(get_theme_mod('portfolio_button_link'), 'october'); ?>" class="btn"><?php echo esc_html(get_theme_mod('portfolio_button', 'PURCHASE NOW'), 'october'); ?></a>
			</div>
		</div>
	</div>
	</div-->

<div class="section padding-top <?php echo esc_attr(get_theme_mod('text_alignment'), 'october'); ?>" id="paid_content">
	<div class="container">
		<div class="section-heading">
			<h2>Paid Content</h2>
			<p><em>Free Monthly Sessions for Fitness Instructors’ Community</em></p>
			<a class="link_btn" href="/access-content" target="_blank" rel="noopener">Get Access</a>
		</div>
	</div>
</div>

	<div class="section portfolio padding-top <?php echo esc_attr(get_theme_mod('text_alignment'), 'october'); ?>" id="blog">
	<div class="container">
		<div class="section-heading">
			<h2>Blog</h2>
			<?php echo do_shortcode( '[display_medium_posts handle="@shwetaskul"]' ); ?>
		</div>
	</div>
</div>
