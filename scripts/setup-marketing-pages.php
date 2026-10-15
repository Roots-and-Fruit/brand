<?php
/**
 * Fill Home, Case Studies, and About Matt from the Hugo pages.
 *
 * studio wp eval-file <brand-next>/scripts/setup-marketing-pages.php
 */

function rf_upsert_page( $slug, $title, $file ) {
	if ( ! is_readable( $file ) ) {
		WP_CLI::error( 'Missing ' . $file );
	}

	$content = file_get_contents( $file );
	$page    = get_page_by_path( $slug, OBJECT, 'page' );
	$args    = array(
		'post_type'    => 'page',
		'post_status'  => 'publish',
		'post_name'    => $slug,
		'post_title'   => $title,
		'post_content' => $content,
	);

	if ( $page ) {
		$args['ID'] = $page->ID;
		$updated    = wp_update_post( $args, true );
		if ( is_wp_error( $updated ) ) {
			WP_CLI::error( $updated->get_error_message() );
		}
		return (int) $page->ID;
	}

	$created = wp_insert_post( $args, true );
	if ( is_wp_error( $created ) ) {
		WP_CLI::error( $created->get_error_message() );
	}
	return (int) $created;
}

$dir  = dirname( __FILE__ );
$home = rf_upsert_page( 'home', 'Roots & Fruit', $dir . '/home-blocks.html' );
$cases = rf_upsert_page( 'case-studies', 'Case Studies', $dir . '/case-studies-blocks.html' );
$about = rf_upsert_page( 'about-matt', 'About Matt', $dir . '/about-blocks.html' );

update_option( 'show_on_front', 'page' );
update_option( 'page_on_front', $home );

WP_CLI::success( sprintf( 'Home %d, Case Studies %d, About Matt %d. Front page is Home.', $home, $cases, $about ) );
