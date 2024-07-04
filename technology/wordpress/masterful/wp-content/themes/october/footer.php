		<!-- SOCIAL -->
		<?php
		if(get_theme_mod('social_facebook') != '' && get_theme_mod('social_twitter') != '' && get_theme_mod('social_instagram') != '' && get_theme_mod('social_linkedin') != '') {
			$col = "col-md-3 col-sm-3 col-12";
		}
		if((get_theme_mod('social_facebook') == '' && get_theme_mod('social_twitter') != '' && get_theme_mod('social_instagram') != '' && get_theme_mod('social_linkedin') != '') || (get_theme_mod('social_facebook') != '' && get_theme_mod('social_twitter') == '' && get_theme_mod('social_instagram') != '' && get_theme_mod('social_linkedin') != '') || (get_theme_mod('social_facebook') != '' && get_theme_mod('social_twitter') != '' && get_theme_mod('social_instagram') == '' && get_theme_mod('social_linkedin') != '') || (get_theme_mod('social_facebook') != '' && get_theme_mod('social_twitter') != '' && get_theme_mod('social_instagram') != '' && get_theme_mod('social_linkedin') == '')) {
			$col = "col-md-4 col-sm-4 col-12";
		}
		if((get_theme_mod('social_facebook') == '' && get_theme_mod('social_twitter') == '' && get_theme_mod('social_instagram') != '' && get_theme_mod('social_linkedin') != '') || (get_theme_mod('social_facebook') != '' && get_theme_mod('social_twitter') != '' && get_theme_mod('social_instagram') == '' && get_theme_mod('social_linkedin') == '') || (get_theme_mod('social_facebook') == '' && get_theme_mod('social_twitter') != '' && get_theme_mod('social_instagram') == '' && get_theme_mod('social_linkedin') != '') || (get_theme_mod('social_facebook') != '' && get_theme_mod('social_twitter') == '' && get_theme_mod('social_instagram') != '' && get_theme_mod('social_linkedin') == '') || (get_theme_mod('social_facebook') == '' && get_theme_mod('social_twitter') != '' && get_theme_mod('social_instagram') != '' && get_theme_mod('social_linkedin') == '') || (get_theme_mod('social_facebook') != '' && get_theme_mod('social_twitter') == '' && get_theme_mod('social_instagram') == '' && get_theme_mod('social_linkedin') != '')) {
			$col = "col-md-6 col-sm-6 col-12";
		}
		if((get_theme_mod('social_facebook') == '' && get_theme_mod('social_twitter') == '' && get_theme_mod('social_instagram') == '' && get_theme_mod('social_linkedin') != '') || (get_theme_mod('social_facebook') == '' && get_theme_mod('social_twitter') == '' && get_theme_mod('social_instagram') != '' && get_theme_mod('social_linkedin') == '') || (get_theme_mod('social_facebook') == '' && get_theme_mod('social_twitter') != '' && get_theme_mod('social_instagram') == '' && get_theme_mod('social_linkedin') == '') || (get_theme_mod('social_facebook') != '' && get_theme_mod('social_twitter') == '' && get_theme_mod('social_instagram') == '' && get_theme_mod('social_linkedin') == '')) {
			$col = "col-md-12 col-sm-12 col-12";
		}
		?>
		<div class="section social padding-top">
			<?php if(get_theme_mod('social_facebook') != '' || get_theme_mod('social_twitter') != '' || get_theme_mod('social_instagram') != '' || get_theme_mod('social_linkedin') != '') { ?>
				<div class="section-content">
					<div class="row">
						<?php if(get_theme_mod('social_facebook') != '') { ?>
						<div class="<?php echo esc_attr($col); ?> text-center facebook">
							<a href="<?php echo esc_url(get_theme_mod('social_facebook'), 'october'); ?>">
								<i class="fab fa-facebook"></i>
							</a>
						</div>
						<?php } ?>
						<?php if(get_theme_mod('social_twitter') != '') { ?>
						<div class="<?php echo esc_attr($col); ?> text-center twitter">
							<a href="<?php echo esc_url(get_theme_mod('social_twitter'), 'october'); ?>">
								<i class="fab fa-twitter"></i>
							</a>
						</div>
						<?php } ?>
						<?php if(get_theme_mod('social_instagram') != '') { ?>
						<div class="<?php echo esc_attr($col); ?> text-center instagram">
							<a href="<?php echo esc_url(get_theme_mod('social_instagram'), 'october'); ?>">
								<i class="fab fa-instagram"></i>
							</a>
						</div>
						<?php } ?>
						<?php if(get_theme_mod('social_linkedin') != '') { ?>
						<div class="<?php echo esc_attr($col); ?> text-center linkedin">
							<a href="<?php echo esc_url(get_theme_mod('social_linkedin'), 'october'); ?>">
								<i class="fab fa-linkedin"></i>
							</a>
						</div>
						<?php } ?>
					</div>
				</div>
			<?php } ?>
		</div>

		<!-- FOOTER -->
		<footer class="section <?php echo esc_attr(get_theme_mod('text_alignment'), 'october'); ?>">
			<div class="container">
				<?php if(is_active_sidebar('footer-widget-area-1') && is_active_sidebar('footer-widget-area-2') && is_active_sidebar('footer-widget-area-3') && is_active_sidebar('footer-widget-area-4')) : ?>
					<div class="col-md-3 col-sm-3 col-xs-3">
						<div class="section padding-top padding-bottom">
							<?php dynamic_sidebar('footer-widget-area-1'); ?>
						</div>
					</div>
					<div class="col-md-3 col-sm-3 col-xs-3">
						<div class="section padding-top padding-bottom">
							<?php dynamic_sidebar('footer-widget-area-2'); ?>
						</div>
					</div>
					<div class="col-md-3 col-sm-3 col-xs-3">
						<div class="section padding-top padding-bottom">
							<?php dynamic_sidebar('footer-widget-area-3'); ?>
						</div>
					</div>
					<div class="col-md-3 col-sm-3 col-xs-3">
						<div class="section padding-top padding-bottom">
							<?php dynamic_sidebar('footer-widget-area-4'); ?>
						</div>
					</div>
				<?php endif; ?>
				<?php if(is_active_sidebar('footer-widget-area-1') && is_active_sidebar('footer-widget-area-2') && is_active_sidebar('footer-widget-area-3') && !is_active_sidebar('footer-widget-area-4')) : ?>
					<div class="col-md-4 col-sm-4 col-xs-4">
						<div class="section padding-top padding-bottom">
							<?php dynamic_sidebar('footer-widget-area-1'); ?>
						</div>
					</div>
					<div class="col-md-4 col-sm-4 col-xs-4">
						<div class="section padding-top padding-bottom">
							<?php dynamic_sidebar('footer-widget-area-2'); ?>
						</div>
					</div>
					<div class="col-md-4 col-sm-4 col-xs-4">
						<div class="section padding-top padding-bottom">
							<?php dynamic_sidebar('footer-widget-area-3'); ?>
						</div>
					</div>
				<?php endif; ?>
				<?php if(is_active_sidebar('footer-widget-area-1') && is_active_sidebar('footer-widget-area-2') && !is_active_sidebar('footer-widget-area-3') && !is_active_sidebar('footer-widget-area-4')) : ?>
					<div class="col-md-6 col-sm-6 col-xs-6">
						<div class="section padding-top padding-bottom">
							<?php dynamic_sidebar('footer-widget-area-1'); ?>
						</div>
					</div>
					<div class="col-md-6 col-sm-6 col-xs-6">
						<div class="section padding-top padding-bottom">
							<?php dynamic_sidebar('footer-widget-area-2'); ?>
						</div>
					</div>
				<?php endif; ?>
				<?php if(is_active_sidebar('footer-widget-area-1') && !is_active_sidebar('footer-widget-area-2') && !is_active_sidebar('footer-widget-area-3') && !is_active_sidebar('footer-widget-area-4')) : ?>
					<div class="col-md-12 col-sm-12 col-12">
						<div class="section padding-top padding-bottom">
							<?php dynamic_sidebar('footer-widget-area-1'); ?>
						</div>
					</div>
				<?php endif; ?>
				<p class="copyright">&copy; <?php echo date('Y'); ?>. <?php bloginfo('name'); ?>.  <?php echo esc_html__('All Rights Reserved', 'october'); ?>.</p>
			</div>
		</footer>
		<div class="back-to-top">
			<a href="#top"><i class="fas fa-angle-up"></i></a>
		</div>

		<?php wp_footer(); ?>
	</body>
</html>
