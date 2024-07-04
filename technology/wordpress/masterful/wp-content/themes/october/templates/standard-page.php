<?php

/*
	Template Name: Standard Page
*/

?>

<div class="section padding-top <?php echo esc_attr(get_theme_mod('text_alignment'), 'october'); ?>" id="<?php echo str_replace(' ', '', strtolower(get_the_title())); ?>">
	<div class="container">
		<div class="section-heading">
			<h2><?php the_title(); ?></h2>
		</div>
		<div class="section-content">
			<div class="row">
				<?php the_content(); ?>
			</div>
		</div>
	</div>
</div>

<?php comments_template(); ?>