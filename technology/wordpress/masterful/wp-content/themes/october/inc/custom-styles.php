:root {
  <?php if(!empty(get_field('text_color', 'option'))) { ?> --text-color: <?php the_field('text_color', 'option'); ?>; <?php } ?>
  <?php if(!empty(get_field('primary_color', 'option'))) { ?> --primary-color: <?php the_field('primary_color', 'option'); ?>; <?php } ?>
  <?php if(!empty(get_field('light_color', 'option'))) { ?> --light-color: <?php the_field('light_color', 'option'); ?>; <?php } ?>
  <?php if(!empty(get_field('dark_color', 'option'))) { ?> --dark-color: <?php the_field('dark_color', 'option'); ?>; <?php } ?>
  <?php if(!empty(get_field('header_background_color', 'option'))) { ?> --header-background: <?php the_field('header_background_color', 'option'); ?>; <?php } ?>
  <?php if(!empty(get_field('header_text_color', 'option'))) { ?> --header-color: <?php the_field('header_text_color', 'option'); ?>; <?php } ?>
  <?php if(!empty(get_field('footer_background_color', 'option'))) { ?> --footer-background: <?php the_field('footer_background_color', 'option'); ?>; <?php } ?>
  <?php if(!empty(get_field('footer_text_color', 'option'))) { ?> --footer-color: <?php the_field('footer_text_color', 'option'); ?>; <?php } ?>
  <?php if(!empty(get_field('font_size', 'option'))) { ?> --font-size: <?php the_field('font_size', 'option'); ?>px; <?php } ?>
}
