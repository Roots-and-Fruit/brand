<?php
/**
 * Seed the local probe's existing showcase pages with R&F patterns.
 * Run through Studio: studio wp eval-file <this file>
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$pages = array(
	'start'    => 'rf/landing',
	'sections' => 'rf/catalog',
	'layout'   => 'rf/layout-home',
	'pieces'   => 'rf/allowlist',
	'offer'    => 'rf/landing',
	'pricing'  => 'rf/pricing',
);

foreach ( $pages as $page_slug => $pattern_slug ) {
	$page = get_page_by_path( $page_slug, OBJECT, 'page' );
	$pattern = WP_Block_Patterns_Registry::get_instance()->get_registered( $pattern_slug );

	if ( ! $page ) {
		WP_CLI::warning( 'Missing page: ' . $page_slug );
		continue;
	}
	if ( ! $pattern ) {
		WP_CLI::error( 'Missing R&F pattern: ' . $pattern_slug );
	}

	wp_update_post(
		array(
			'ID'           => $page->ID,
			'post_content' => '<!-- wp:pattern {"slug":"' . esc_attr( $pattern_slug ) . '"} /-->',
		)
	);
	WP_CLI::log( 'Seeded /' . $page_slug . '/ with ' . $pattern_slug );
}

$start = get_page_by_path( 'start', OBJECT, 'page' );
if ( $start ) {
	update_option( 'page_on_front', $start->ID );
	update_option( 'show_on_front', 'page' );
}

WP_CLI::success( 'R&F probe pages seeded.' );
