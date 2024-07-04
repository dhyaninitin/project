<?php

/*
	Template Name: Blog Page
*/

?>

<?php get_header(); ?>

<div class="container">
	<div class="row">
		<div class="<?php if (is_sticky()) echo 'sticky-post'; if(is_active_sidebar('sidebar-1')) { echo ' col-lg-9 col-12'; } ?>">

		<?php
			$paged = (get_query_var('paged')) ? get_query_var('paged') : 1;
			$args = array("post_type" => "post", "order" => "DESC", 'paged' => $paged);
			$the_query = new WP_Query($args);
			if(have_posts()) :
				while($the_query->have_posts()) : $the_query->the_post();
					get_template_part('single', 'content');
			 	endwhile;
			 	?>

			 	<div class="container padding-top">
				 	<div class="nav-previous alignleft"><?php echo get_next_posts_link('< Older Entries', $the_query->max_num_pages); ?></div>
					<div class="nav-next alignright"><?php echo get_previous_posts_link('Newer Entries >'); ?></div>
				</div>

				<?php
			endif;
			wp_reset_postdata();
		?>

		</div>

		<?php get_sidebar(); ?>

	</div>
</div>

<?php get_footer(); ?>
