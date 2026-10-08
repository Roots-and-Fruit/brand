<?php
/**
 * Probe-only: publish /rf-layout/ with layout-home blocks inlined.
 * PowerShell strips block comments; run with `wp eval-file`.
 */
if ( method_exists( wp_get_theme(), 'delete_pattern_cache' ) ) {
	wp_get_theme()->delete_pattern_cache();
}

$pattern = WP_Block_Patterns_Registry::get_instance()->get_registered( 'rf/layout-home' );
if ( ! $pattern || empty( $pattern['content'] ) ) {
	fwrite( STDERR, "rf/layout-home is not registered.\n" );
	exit( 1 );
}

$content = $pattern['content'];
$page    = get_page_by_path( 'rf-layout' );

if ( $page ) {
	$id = wp_update_post(
		array(
			'ID'           => $page->ID,
			'post_title'   => 'Layout',
			'post_content' => $content,
			'post_status'  => 'publish',
		),
		true
	);
} else {
	$id = wp_insert_post(
		array(
			'post_type'    => 'page',
			'post_title'   => 'Layout',
			'post_name'    => 'rf-layout',
			'post_status'  => 'publish',
			'post_content' => $content,
		),
		true
	);
}

if ( is_wp_error( $id ) ) {
	fwrite( STDERR, $id->get_error_message() . PHP_EOL );
	exit( 1 );
}

echo 'rf-layout id=' . (int) $id . ' url=' . get_permalink( $id ) . ' bytes=' . strlen( $content ) . PHP_EOL;
