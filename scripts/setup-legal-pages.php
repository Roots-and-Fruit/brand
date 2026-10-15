<?php
/**
 * Publish Privacy Policy and Terms of Service as local pages.
 *
 * studio wp eval-file <brand-next>/scripts/setup-legal-pages.php
 */

function rf_upsert_legal_page( $slug, $title, $file ) {
	if ( ! is_readable( $file ) ) {
		WP_CLI::error( 'Missing ' . $file );
	}
	$page = get_page_by_path( $slug, OBJECT, 'page' );
	$args = array(
		'post_type'    => 'page',
		'post_status'  => 'publish',
		'post_name'    => $slug,
		'post_title'   => $title,
		'post_content' => file_get_contents( $file ),
	);
	if ( $page ) {
		$args['ID'] = $page->ID;
		$saved      = wp_update_post( $args, true );
	} else {
		$saved = wp_insert_post( $args, true );
	}
	if ( is_wp_error( $saved ) ) {
		WP_CLI::error( $saved->get_error_message() );
	}
	$post_id = (int) $saved;
	if ( 'privacy-policy' === $slug ) {
		wp_update_post(
			array(
				'ID'            => $post_id,
				'post_date'     => '2026-01-22 09:00:00',
				'post_date_gmt' => get_gmt_from_date( '2026-01-22 09:00:00' ),
			)
		);
	}
	return $post_id;
}

$dir     = dirname( __FILE__ );
$privacy = rf_upsert_legal_page( 'privacy-policy', 'Privacy Policy', $dir . '/privacy-blocks.html' );
$terms   = rf_upsert_legal_page( 'terms-of-service', 'Terms of Service', $dir . '/terms-blocks.html' );

WP_CLI::success( sprintf( 'Privacy is page %d. Terms is page %d.', $privacy, $terms ) );
