<?php
/**
 * Publish the six live articles and delete every other post.
 *
 * studio wp eval-file <brand-next>/scripts/setup-articles.php
 */

$dir = dirname( __FILE__ ) . '/articles';
$manifest = json_decode( (string) file_get_contents( $dir . '/manifest.json' ), true );
if ( ! is_array( $manifest ) || ! $manifest ) {
	WP_CLI::error( 'Missing articles/manifest.json. Run node scripts/build-articles.mjs first.' );
}

$keep = array();
foreach ( $manifest as $article ) {
	$html = $dir . '/' . $article['slug'] . '.html';
	if ( ! is_readable( $html ) ) {
		WP_CLI::error( 'Missing ' . $html );
	}

	$existing = get_page_by_path( $article['slug'], OBJECT, 'post' );
	if ( ! $existing && 'create-products-customers-love' === $article['slug'] ) {
		$existing = get_page_by_path( 'sample-essay', OBJECT, 'post' );
	}

	$args = array(
		'post_type'     => 'post',
		'post_status'   => 'publish',
		'post_name'     => $article['slug'],
		'post_title'    => $article['title'],
		'post_excerpt'  => $article['excerpt'],
		'post_content'  => file_get_contents( $html ),
		'post_date'     => $article['date'] . ' 09:00:00',
		'post_date_gmt' => get_gmt_from_date( $article['date'] . ' 09:00:00' ),
	);
	if ( $existing ) {
		$args['ID'] = $existing->ID;
		$saved = wp_update_post( $args, true );
	} else {
		$saved = wp_insert_post( $args, true );
	}
	if ( is_wp_error( $saved ) ) {
		WP_CLI::error( $saved->get_error_message() );
	}
	$post_id = (int) $saved;

	$term = term_exists( $article['category'], 'category' );
	if ( ! $term ) {
		$term = wp_insert_term( $article['category'], 'category' );
	}
	if ( is_wp_error( $term ) ) {
		WP_CLI::error( $term->get_error_message() );
	}
	$term_id = is_array( $term ) ? (int) $term['term_id'] : (int) $term;
	wp_set_post_categories( $post_id, array( $term_id ) );

	$author = (int) get_post_field( 'post_author', $post_id );
	wp_update_user(
		array(
			'ID'           => $author,
			'display_name' => 'Matt Cromwell',
			'nickname'     => 'Matt Cromwell',
		)
	);

	$keep[] = $post_id;
	WP_CLI::log( sprintf( '%s is post %d, dated %s', $article['slug'], $post_id, $article['date'] ) );
}

$removed = array();
$posts = get_posts(
	array(
		'post_type'      => 'post',
		'post_status'    => array( 'publish', 'draft', 'pending', 'future', 'private', 'trash' ),
		'posts_per_page' => -1,
		'fields'         => 'ids',
	)
);
foreach ( $posts as $post_id ) {
	if ( in_array( (int) $post_id, $keep, true ) ) {
		continue;
	}
	$title = get_the_title( $post_id );
	wp_delete_post( $post_id, true );
	$removed[] = $title;
}

WP_CLI::success(
	sprintf(
		'Published %d articles. Deleted %d other posts%s.',
		count( $keep ),
		count( $removed ),
		$removed ? ': ' . implode( ', ', $removed ) : ''
	)
);
