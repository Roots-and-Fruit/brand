<?php
/**
 * Fill the Services page from the Hugo services content.
 * The front page had been this same page. Point it back at Home.
 *
 * studio wp eval-file <brand-next>/scripts/setup-services-page.php
 */

$blocks = dirname( __FILE__ ) . '/services-blocks.html';
if ( ! is_readable( $blocks ) ) {
	WP_CLI::error( 'Missing services-blocks.html.' );
}

$services = get_page_by_path( 'services', OBJECT, 'page' );
$home     = get_page_by_path( 'home', OBJECT, 'page' );
if ( ! $services || ! $home ) {
	WP_CLI::error( 'Expected published pages at /services and /home.' );
}

$updated = wp_update_post(
	array(
		'ID'           => $services->ID,
		'post_title'   => 'R&F Growth Services',
		'post_excerpt' => 'Services designed to fit you and your team.',
		'post_content' => file_get_contents( $blocks ),
	),
	true
);
if ( is_wp_error( $updated ) ) {
	WP_CLI::error( $updated->get_error_message() );
}

update_option( 'show_on_front', 'page' );
update_option( 'page_on_front', $home->ID );

WP_CLI::success( sprintf( 'Services is page %d. Front page is now Home (%d).', $services->ID, $home->ID ) );
