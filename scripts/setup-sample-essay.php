<?php
/**
 * Replace the sample essay with the plugin-reviews article.
 *
 * studio wp eval-file <brand-next>/scripts/setup-sample-essay.php
 */

$blocks = dirname( __FILE__ ) . '/sample-essay-blocks.html';
if ( ! is_readable( $blocks ) ) {
	WP_CLI::error( 'Missing sample-essay-blocks.html. Run node scripts/build-sample-essay.mjs first.' );
}

$post = get_page_by_path( 'sample-essay', OBJECT, 'post' );
if ( ! $post ) {
	WP_CLI::error( 'No post at sample-essay.' );
}

$updated = wp_update_post(
	array(
		'ID'           => $post->ID,
		'post_title'   => 'What 3,400 WordPress Plugin Reviews Tell You About What Makes a Great Plugin',
		'post_excerpt' => 'I pulled the top reasons people leave one-star and five-star WordPress plugin reviews. The pattern is a playbook for product businesses.',
		'post_content' => file_get_contents( $blocks ),
		'post_date'    => '2026-08-08 08:00:00',
		'post_date_gmt'=> '2026-08-08 06:00:00',
	),
	true
);

if ( is_wp_error( $updated ) ) {
	WP_CLI::error( $updated->get_error_message() );
}

$term = term_exists( 'Marketing', 'category' );
if ( ! $term ) {
	$term = wp_insert_term( 'Marketing', 'category' );
}
if ( is_wp_error( $term ) ) {
	WP_CLI::error( $term->get_error_message() );
}
$term_id = is_array( $term ) ? (int) $term['term_id'] : (int) $term;
wp_set_post_categories( $post->ID, array( $term_id ) );

$author = (int) $post->post_author;
wp_update_user(
	array(
		'ID'           => $author,
		'display_name' => 'Matt Cromwell',
		'nickname'     => 'Matt Cromwell',
	)
);

WP_CLI::success( sprintf( 'Sample essay %d now carries the plugin-reviews article.', $post->ID ) );
