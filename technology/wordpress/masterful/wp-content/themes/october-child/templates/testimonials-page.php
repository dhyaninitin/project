<?php

/*
	Template Name: Testimonials Page
*/

?>

<div class="section testimonials parallax-container <?php echo esc_attr(get_theme_mod('text_alignment'), 'october'); ?>" data-parallax="scroll" data-image-src="<?php echo esc_url(get_theme_mod("main_top_image"), 'october'); ?>" data-natural-width="1200" data-natural-height="1200" id="<?php echo str_replace(' ', '', strtolower(get_the_title())); ?>">
	<div class="container">
	<div class="section-heading">
		<h2><?php the_title(); ?></h2>
		<?php the_content(); ?>
	</div>
	
	</div>
</div>