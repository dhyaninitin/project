<?php

if (post_password_required()) {
	return;
}

?>

<div id="comments" class="comments-area <?php echo esc_attr(get_theme_mod('text_alignment'), 'october'); ?>">
	<div class="container">

	<?php
	if (have_comments()) : ?>
		<h4>
			<?php
				printf(
					esc_html(_nx('One comment on &ldquo;%2$s&rdquo;', '%1$s comments on &ldquo;%2$s&rdquo;', get_comments_number(), 'comments title', 'october')),
					number_format_i18n(get_comments_number()),
					'<span>' . get_the_title() . '</span>'
				);
			?>
		</h4>

		<?php if (get_comment_pages_count() > 1 && get_option('page_comments')) : ?>
		<nav id="comment-nav-above" class="navigation comment-navigation" role="navigation">
			<div class="nav-links">
				<div class="nav-previous alignleft"><?php previous_comments_link(esc_html__('< Older Comments', 'october')); ?></div>
				<div class="nav-next alignright"><?php next_comments_link(esc_html__('Newer Comments >', 'october')); ?></div>
			</div>
		</nav>
		<?php endif; ?>

		<div class="comment-list">
			<?php
				wp_list_comments(array(
					'style'      => 'div',
					'short_ping' => true,
				));
			?>
		</div>

		<?php if (get_comment_pages_count() > 1 && get_option('page_comments')) : ?>
		<nav id="comment-nav-below" class="navigation comment-navigation" role="navigation">
			<div class="nav-links">
				<div class="nav-previous alignleft"><?php previous_comments_link(esc_html__('< Older Comments', 'october')); ?></div>
				<div class="nav-next alignright"><?php next_comments_link(esc_html__('Newer Comments >', 'october')); ?></div>
			</div>
		</nav>
		<?php
		endif;

	endif;

	if (!comments_open() && get_comments_number() && post_type_supports(get_post_type(), 'comments')) : ?>
		<p class="no-comments"><?php esc_html_e('Comments are closed.', 'october'); ?></p>
	<?php
	endif;

	comment_form();
	?>

	</div>
</div>
