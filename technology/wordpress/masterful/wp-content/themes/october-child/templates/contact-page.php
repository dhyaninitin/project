<?php

/*
	Template Name: Contact Page
*/

?>

<div class="section contact padding-top <?php echo esc_attr(get_theme_mod('text_alignment'), 'october'); ?>" id="<?php echo str_replace(' ', '', strtolower(get_the_title())); ?>">
	<div class="container">
		<div class="section-heading">
			<h2><?php the_title(); ?></h2>
			<?php the_content(); ?>
		</div>
		<div class="section-content">
			<div class="container">
				<div class="row">
					<!--div class="col-md-4 col-sm-4 col-12 text-left">
						<div class="contact-info">
							<ul class="list-unstyled">
								<li>
									<h2><i class="fas fa-home"></i> <?php echo esc_attr(get_theme_mod('contact_address_title', 'ADDRESS'), 'october'); ?></h2>
									<p><?php echo esc_attr(get_theme_mod('contact_address_text', get_option('')), 'october'); ?></p>
								</li>
								<li>
									<h2><i class="fas fa-phone"></i> <?php echo esc_attr(get_theme_mod('contact_phone_title', 'PHONE'), 'october'); ?></h2>
									<p><?php echo esc_attr(get_theme_mod('contact_phone_text', get_option(''), 'october')); ?></p>
								</li>
								<li>
									<h2><i class="fas fa-envelope"></i> <?php echo esc_attr(get_theme_mod('contact_email_title', 'EMAIL'), 'october'); ?></h2>
									<p><a href="mailto:<?php echo esc_attr(get_theme_mod('contact_email_text', get_option('admin_email')), 'october'); ?>"><?php echo esc_attr(get_theme_mod('contact_email_text', get_option('admin_email')), 'october'); ?></a></p>
								</li>
							</ul>
						</div>
					</div-->
					<div class="col-md-12 col-sm-12 col-12">
						<div class="contact-form">
							<div class="alert"></div>
							<?php echo do_shortcode('[contact-form-7 id="137" title="Contact Form"]'); ?>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
