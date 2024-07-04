<?php get_header(); ?>

    <div class="section padding-top <?php echo esc_attr(get_theme_mod('text_alignment'), 'october'); ?>">
		<div class="container">
			<div class="section-heading">

				<?php if (have_posts()) : ?>

				<h2><?php printf(__('Category Archives: %s', 'october'), single_cat_title('', false )); ?></h2>

				<?php
					$term_description = term_description();
					if (!empty($term_description)) :
						printf('<div class="taxonomy-description">%s</div>', $term_description);
					endif;
				?>

			</div>
			<div class="section-content">
				<div class="row">

		            <?php
		                while (have_posts()) : the_post();

	                		get_template_part('single', 'content');

			            endwhile;
			        else :
		                get_template_part('content', 'none');
	                endif;
			        ?>

				</div>
			</div>
        </div>
    </div>

<?php get_footer(); ?>