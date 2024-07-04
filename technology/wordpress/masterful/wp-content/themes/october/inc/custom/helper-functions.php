<?php

/**
 * Helper Functions
 *
 * @package october
 */

// Create custom html structure for comments

if ( ! function_exists( 'october_comment' ) ) {
  function october_comment( $comment, $args, $depth ) {

    $GLOBALS['comment'] = $comment;

    $reply_class = ( $comment->comment_parent ) ? 'indented' : '';
    switch ( $comment->comment_type ):
      case 'pingback':
      case 'trackback':
        ?>
          <div class="pingback">
            <?php esc_html_e( 'Pingback:', 'october' ); ?> <?php comment_author_link(); ?>
            <?php edit_comment_link( esc_html__( '(Edit)', 'october' ), '<span class="edit-link">', '</span>' ); ?>
          </div>
        <?php
      break;
      default:
        // Generate comments
        ?>
          <li id="comment-<?php comment_ID(); ?>" <?php comment_class('ct-part'); ?>>
            <div class="comment-wrapper">
              <div class="comment-image">
                <?php echo get_avatar( $comment, '75', '', esc_attr(get_the_author()), array('class'=>'rounded-circle') ); ?>
              </div>
              <div class="content">
                <div class="author">
                  <span class="author"><?php the_author(); ?></span>
                </div>
                <span class="date"><?php comment_date(); ?> (<?php comment_time(); ?>)</span>
              <?php comment_text(); ?>
              </div>
            </div>
            <div class="reply-wrapper">
              <?php
                comment_reply_link(
                  array_merge( $args,
                    array(
                      'reply_text' => esc_html__( 'Reply', 'october' ),
                      'after' => '',
                      'depth' => $depth,
                      'max_depth' => $args['max_depth']
                    )
                  )
                );
              ?>
            </div>
          </li>
        <?php
        break;
    endswitch;
  }
}

if ( ! function_exists('october_social_links' ) ) {
  function october_social_links() {
    if( function_exists('get_field') && have_rows('social_icons', 'option') ):

        while ( have_rows('social_icons', 'option') ) : the_row();

            echo '<a class="social" href="' . get_sub_field('social_link', 'option') . '" rel="nofollow"><i class="' . get_sub_field('social_icon', 'option') . '"></i></a>';

        endwhile;

    endif;
  }
}

if ( ! function_exists('october_breadcrumbs' ) ) {
   function october_breadcrumbs() {
     $delimiter = '/';
     $home = 'Home';
     $before = '<span class="current">';
     $after = '</span>';

     if ( !is_home() && !is_front_page() || is_paged() ) {

       global $post;
       $homeLink = home_url();
       echo '<a href="' . $homeLink . '">' . $home . '</a> ' . $delimiter . ' ';

       if ( is_search() ) {
         echo wp_kses_post($before . __('Search', 'october') . $after);
       }

       if ( is_category() ) {
         global $wp_query;
         $cat_obj = $wp_query->get_queried_object();
         $thisCat = $cat_obj->term_id;
         $thisCat = get_category($thisCat);
         $parentCat = get_category($thisCat->parent);
         if ($thisCat->parent != 0) echo(get_category_parents($parentCat, TRUE, ' ' . $delimiter . ' '));
         echo wp_kses_post($before . single_cat_title('', false) . $after);

       } elseif ( is_day() ) {
         echo '<a href="' . get_year_link(get_the_time('Y')) . '">' . get_the_time('Y') . '</a> ' . $delimiter . ' ';
         echo '<a href="' . get_month_link(get_the_time('Y'),get_the_time('m')) . '">' . get_the_time('F') . '</a> ' . $delimiter . ' ';
         echo wp_kses_post($before . get_the_time('d') . $after);

       } elseif ( is_month() ) {
         echo '<a href="' . get_year_link(get_the_time('Y')) . '">' . get_the_time('Y') . '</a> ' . $delimiter . ' ';
         echo wp_kses_post($before . get_the_time('F') . $after);

       } elseif ( is_year() ) {
         echo wp_kses_post($before . get_the_time('Y') . $after);

       } elseif ( is_single() && !is_attachment() ) {
         if ( get_post_type() != 'post' ) {
           $post_type = get_post_type_object(get_post_type());
           $slug = $post_type->rewrite;
           echo '<a href="' . $homeLink . '/' . $slug['slug'] . '/">' . $post_type->labels->singular_name . '</a> ' . $delimiter . ' ';
           echo wp_kses_post($before . get_the_title() . $after);
         } else {
           $cat = get_the_category(); $cat = $cat[0];
           echo get_category_parents($cat, TRUE, ' ' . $delimiter . ' ');
           echo wp_kses_post($before . get_the_title() . $after);
         }

       } elseif ( is_attachment() ) {
         $parent = get_post($post->post_parent);
         $cat = get_the_category($parent->ID); $cat = $cat[0];
         echo get_category_parents($cat, TRUE, ' ' . $delimiter . ' ');
         echo '<a href="' . get_permalink($parent) . '">' . $parent->post_title . '</a> ' . $delimiter . ' ';
         echo wp_kses_post($before . get_the_title() . $after);

       } elseif ( is_page() && !$post->post_parent ) {
         echo wp_kses_post($before . get_the_title() . $after);

       } elseif ( is_page() && $post->post_parent ) {
         $parent_id  = $post->post_parent;
         $breadcrumbs = array();
         while ($parent_id) {
           $page = get_page($parent_id);
           $breadcrumbs[] = '<a href="' . get_permalink($page->ID) . '">' . get_the_title($page->ID) . '</a>';
           $parent_id  = $page->post_parent;
         }
         $breadcrumbs = array_reverse($breadcrumbs);
         foreach ($breadcrumbs as $crumb) echo wp_kses_post($crumb . ' ' . $delimiter . ' ');
         echo wp_kses_post($before . get_the_title() . $after);

       } elseif ( is_tag() ) {
         echo wp_kses_post($before . single_tag_title('', false) . $after);

       } elseif ( is_author() ) {
         global $author;
         $userdata = get_userdata($author);
         echo wp_kses_post($before . $userdata->display_name . $after);

       } elseif ( is_404() ) {
         echo wp_kses_post($before . 'Error 404' . $after);
       }

       if ( get_query_var('paged') ) {
         if ( is_category() || is_day() || is_month() || is_year() || is_search() || is_tag() || is_author() ) echo ' (';
         echo __('Page', 'october') . ' ' . get_query_var('paged');
         if ( is_category() || is_day() || is_month() || is_year() || is_search() || is_tag() || is_author() ) echo ')';
       }

     }
   }
}

// Get categories for shortcode

if ( ! function_exists('october_element_values' ) ) {
  function october_element_values() {

    $args = array(
      'type'     => 'post',
      'taxonomy' => 'category'
    );

    $categories = get_categories( $args );
    $list = array();

    foreach ( $categories as $category ) {
      $list[$category->name] = $category->term_id;
    }
    return $list;
  }
}

// Change excerpt end

if ( ! function_exists('october_excerpt_more' ) ) {
  function october_excerpt_more( $more ) {
    return '...';
  }
}
add_filter('excerpt_more', 'october_excerpt_more');


if ( ! function_exists('october_wp_link_pages' ) ) {
  function october_wp_link_pages() {
    get_post_format();
  }
}

// Get categories for shortcode

if ( ! function_exists('october_categories' ) ) {
  function october_categories() {

    $args = array(
      'type'     => 'post',
      'taxonomy' => 'category'
    );

    $categories = get_categories( $args );
    $list = array();

    foreach ( $categories as $category ) {
      $list[$category->name] = $category->slug;
    }
    return $list;
  }
}

// Change excerpt length

if ( ! function_exists('october_excerpt_length' ) ) {
  function october_excerpt_length( $length ) {
    return 22;
  }
}
add_filter( 'excerpt_length', 'october_excerpt_length', 999 );

// Remove role attribute from search form

if ( ! function_exists('october_valid_search_form' ) ) {
  function october_valid_search_form ($form) {
    return str_replace('role="search" ', '', $form);
  }
}
add_filter('get_search_form', 'october_valid_search_form');
