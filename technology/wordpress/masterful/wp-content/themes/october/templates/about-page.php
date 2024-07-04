<?php

/*
	Template Name: About Page
*/

?>

<?php if(get_theme_mod('about_title_1') != '' && get_theme_mod('about_title_2') != '' && get_theme_mod('about_title_3') != '') { ?>

<div class="section top">
	<div class="section-content">
		<div class="row text-center">
			<div class="col-md-4 col-sm-12 col-12 box1">
				<i class="fas <?php echo esc_attr(get_theme_mod('about_icon_1'), 'october'); ?>"></i>
				<h2><?php echo esc_attr(get_theme_mod('about_title_1'), 'october'); ?></h2>
				<p class="hidden-xs"><?php echo esc_attr(get_theme_mod('about_text_1'), 'october'); ?></p>
			</div>
			<div class="col-md-4 col-sm-12 col-12 box2">
				<i class="fas <?php echo esc_attr(get_theme_mod('about_icon_2'), 'october'); ?>"></i>
				<h2><?php echo esc_attr(get_theme_mod('about_title_2'), 'october'); ?></h2>
				<p class="hidden-xs"><?php echo esc_attr(get_theme_mod('about_text_2'), 'october'); ?></p>
			</div>
			<div class="col-md-4 col-sm-12 col-12 box3">
				<i class="fas <?php echo esc_attr(get_theme_mod('about_icon_3'), 'october'); ?>"></i>
				<h2><?php echo esc_attr(get_theme_mod('about_title_3'), 'october'); ?></h2>
				<p class="hidden-xs"><?php echo esc_attr(get_theme_mod('about_text_3'), 'october'); ?></p>
			</div>
		</div>
	</div>
</div>

<?php } ?>

<div class="section about padding-top padding-bottom <?php echo esc_attr(get_theme_mod('text_alignment'), 'october'); ?>" id="<?php echo str_replace(' ', '', strtolower(get_the_title())); ?>">
	<div class="container">
		<div class="section-heading">
			<h2><?php the_title(); ?></h2>
			<p><?php echo esc_attr(get_theme_mod('about_subtitle'), 'october'); ?></p>
		</div>
		<div class="section-content">
			<?php the_content(); ?>
		</div>
    </div>
</div>
<!--div class="section dark">
	<div class="container">
		<div class="col-md-12 col-sm-12 col-12 wow fadeInDown" data-wow-duration="1s" data-wow-delay="0.5s">
			<h2><?php echo esc_attr(get_theme_mod('call_to_action'), 'october'); ?></h2>
		</div>
		<div class="col-md-12 col-sm-12 col-12 text-center wow fadeInUp" data-wow-duration="1s" data-wow-delay="1s">
			<a href="<?php echo esc_attr(get_theme_mod('call_to_action_link'), 'october'); ?>" class="btn"><?php echo esc_attr(get_theme_mod('call_to_action_button'), 'october'); ?></a>
		</div>
	</div>
</div-->
