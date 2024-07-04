<?php

$title = get_the_title();
$list_category = get_the_category();
$date = get_the_date(get_option('date_format'));
$link = get_permalink();

?>

<?php if(is_single()) { get_header(); ?>

<!-- BANNER TOP -->
<div class="banner-top" style="background-image: url(<?php echo esc_url(get_the_post_thumbnail_url()); ?>);">
	<?php if(has_post_thumbnail()) { ?><div class="banner-overlay"><?php } ?>
		<div class="banner-content">
			<div class="container text-center">
				<h1><?php echo esc_html($title); ?></h1>
				<?php if (is_sticky()) { ?>
					<p class="color text-uppercase"><?php echo __('Sticky Post', 'october'); ?></p>
				<?php } ?>
				<?php $i = 0; ?>
				<p>
				<?php foreach($list_category as $category) {
					 echo "<a href='" . get_category_link($category->cat_ID) . "'>" . esc_html($category->name) . "</a>";
					 if(count(get_the_category()) !== ++$i) {
						echo ", ";
					 }
				} ?>
				</p>
				<p><?php echo esc_html($date); ?></p>
			</div>
		</div>
	<?php if(has_post_thumbnail()) { ?></div><?php } ?>
</div>

<?php } ?>

<div class="section padding-top padding-bottom <?php echo esc_attr(get_theme_mod('text_alignment'), 'october'); ?>" id="<?php echo str_replace(' ', '', strtolower(get_the_title())); ?>">
	<?php if(is_single()) { ?><div class="container"><?php } ?>
		<div class="<?php if (is_sticky()) echo 'sticky-post'; ?>">
			<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
				<?php if(!is_single()) { ?>
				<div class="section-heading">
					<h3><a href="<?php echo esc_url($link); ?>"><?php echo esc_html($title); ?></a></h3>
					<?php if (is_sticky()) { ?>
						<p class="color text-uppercase"><?php echo __('Sticky Post', 'october'); ?></p>
					<?php } ?>
					<?php $i = 0; ?>
					<p>
					<?php foreach($list_category as $category) {
						 echo "<a href='" . get_category_link($category->cat_ID) . "'>" . esc_html($category->name) . "</a>";
						 if(count(get_the_category()) !== ++$i) {
							echo ", ";
						 }
					 } ?>
 					</p>
 					<p><?php echo esc_html($date); ?></p>
 					<?php the_post_thumbnail(); ?>
				</div>
				<?php } ?>
				<div class="section-content">
					<div class="row">
						<?php if(!is_single()) { ?>
							<?php the_excerpt(); ?>
						<?php } ?>
						<?php if(is_single() && !is_front_page()) { ?>
							<?php if (have_posts()) : while (have_posts()) : the_post(); ?>
								<?php the_content(); ?>
							<?php endwhile; endif; ?>
						<?php } ?>
						<?php if(has_tag()) { ?>
						<p class="tags"><?php the_tags('Tags: '); ?></p>
						<?php } ?>
						<?php wp_link_pages(array('before' => 'Pages: <p class="pagelinks">', 'after' => '</p>')); ?>
					</div>
				</div>
			</article>
		</div>
	<?php if(is_single()) { ?></div><?php } ?>
</div>

<?php comments_template(); ?>

<?php if(is_single()) get_footer(); ?>
