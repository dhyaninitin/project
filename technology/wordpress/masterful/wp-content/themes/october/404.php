<?php get_header(); ?>

	<div id="main-content" class="main-content">
		<div id="main" class="section padding-top <?php echo esc_attr(get_theme_mod('text_alignment'), 'october'); ?>" role="main">
			<div class="container">
				<div class="section-heading">
					<h2><?php echo esc_html__('Ops! That page can&rsquo;t be found.', 'october'); ?></h2>
					<p><?php echo esc_html__('It looks like nothing was found at this location.', 'october'); ?></p>
				</div>
				<div class="section-content text-center">
					<a href="<?php echo esc_url(home_url('/')); ?>" class="btn btn-primary"><?php echo esc_html__('HOMEPAGE', 'october'); ?></a>
				</div>
			</div>
		</div>
	</div>

<?php get_footer(); ?>