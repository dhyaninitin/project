<!DOCTYPE html>

<html <?php language_attributes(); ?>>
	<head>
		<meta charset="<?php bloginfo('charset'); ?>">
		<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">

		<?php wp_head(); ?>
	</head>
	<body id="home" <?php body_class(); ?>>

		<!-- NAVBAR -->
		<div class="navbar fixed-top navbar-expand-xl">
			<div class="navbar-container">
				<a href="<?php echo esc_url(home_url('/')); ?>" class="navbar-title">
					<?php if(get_theme_mod('header_logo') != '') { ?>
						<img src="<?php echo esc_attr(get_theme_mod('header_logo'), 'october'); ?>" alt="<?php bloginfo('name'); ?>" />
					<?php }else{ ?>
						<?php bloginfo('name'); ?>
					<?php } ?>
				</a>
				<div class="navbar-content">
					<nav class="collapse navbar-collapse" id="main-nav">
						<?php
						if(is_front_page()) :
							wp_nav_menu(array('theme_location' => 'primary-menu'));
						else :
							wp_nav_menu(array('theme_location' => 'primary', 'menu' => 'blog-menu'));
						endif;
						?>
					</nav>
					<button class="navbar-toggler collapsed" type="button" data-toggle="collapse" data-target="#main-nav" aria-controls="main-nav" aria-expanded="false" aria-label="Toggle Navigation">
						<span class="navbar-toggler-icon"></span>
						<span class="navbar-toggler-icon"></span>
						<span class="navbar-toggler-icon"></span>
					</button>
				</div>
			</div>
		</div>
