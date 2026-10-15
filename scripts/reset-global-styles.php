<?php
/**
 * Remove saved Site Editor overrides from the active theme's Global Styles post.
 *
 * Run from the target Studio site:
 * studio wp eval-file <absolute-path>/scripts/reset-global-styles.php
 */

$posts = get_posts(
	array(
		'post_type'      => 'wp_global_styles',
		'post_status'    => array( 'publish', 'draft' ),
		'posts_per_page' => -1,
	)
);

$clean = wp_json_encode(
	array(
		'version'                     => 3,
		'isGlobalStylesUserThemeJSON' => true,
	)
);

foreach ( $posts as $post ) {
	$result = wp_update_post(
		array(
			'ID'           => $post->ID,
			'post_content' => $clean,
		),
		true
	);

	if ( is_wp_error( $result ) ) {
		WP_CLI::error( $result->get_error_message() );
	}
}

WP_CLI::success( sprintf( 'Reset %d Global Styles post(s).', count( $posts ) ) );
