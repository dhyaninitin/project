<?php

/*
	Template Name: Home Page
*/

?>
<?php get_header(); ?>

<!-- MAIN TOP -->
<div id="main-top" class="main-top">
	<div class="main-content">
		<div class="container content">
			<div class="row text-center">
				<h1>
					<?php if(get_theme_mod('main_top_title') != '') { ?>
						<?php echo esc_attr(get_theme_mod('main_top_title'), 'october'); ?>
						<?php }else{ ?>
						<?php bloginfo('name'); ?>
						<?php } ?>
					</h1>
			</div>
			<div class="row text-center">
				<a href="<?php echo esc_url(get_theme_mod('arrow_link', '#about'), 'october'); ?>" class="scroll-down"></a>
			</div>
		</div>
	</div>
</div>

<?php
	$args = array("post_type" => "page", "order" => "ASC", 'posts_per_page' => -1, 'post_parent' => 0);
	$the_query = new WP_Query($args);
	if(have_posts()) :
		while($the_query->have_posts()) : $the_query->the_post();
			if(basename(get_page_template()) == 'page.php') get_template_part('page', 'content');
			if(basename(get_page_template()) == 'about-page.php') get_template_part('templates/about-page', 'content');
			if(basename(get_page_template()) == 'standard-page.php') get_template_part('templates/standard-page', 'content');
		 	if(basename(get_page_template()) == 'team-page.php') get_template_part('templates/team-page', 'content');
		 	if(basename(get_page_template()) == 'services-page.php') get_template_part('templates/services-page', 'content');
		 	if(basename(get_page_template()) == 'portfolio-page.php') get_template_part('templates/portfolio-page', 'content');
		 	//if(basename(get_page_template()) == 'newsletter-page.php') get_template_part('templates/newsletter-page', 'content');
		 	if(basename(get_page_template()) == 'testimonials-page.php') get_template_part('templates/testimonials-page', 'content');
		 	if(basename(get_page_template()) == 'contact-page.php') get_template_part('templates/contact-page', 'content');
	 	endwhile;
	endif;
	wp_reset_postdata();
?>

<?php get_footer(); ?>
