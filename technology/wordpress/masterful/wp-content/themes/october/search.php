<?php get_header(); ?>

	<section id="primary" class="section padding-top <?php echo esc_attr(get_theme_mod('text_alignment'), 'october'); ?>">
		<main id="main" class="site-main" role="main">
			<div class="container">

				<?php
				if (have_posts()) : ?>

					<div class="section-heading">
						<h2><?php printf(esc_html__('Search Results for: %s', 'october'), '<span>' . get_search_query() . '</span>'); ?></h2>
					</div>

					<?php

					while (have_posts() ) : the_post();

						get_template_part('single', 'search');

					endwhile;
					?>

					<div class="container padding-top">
					 	<div class="nav-previous alignleft"><?php echo get_next_posts_link('< Older Entries'); ?></div>
						<div class="nav-next alignright"><?php echo get_previous_posts_link('Newer Entries >'); ?></div>
					</div>

					<?php

				else :
					?>

					<h2><?php printf(esc_html__('The search for "%s" did not return any results', 'october'), '<span>' . get_search_query() . '</span>'); ?></h2>

					<?php
				endif; ?>

			</div>
		</main>
	</section>

<?php get_footer(); ?>
