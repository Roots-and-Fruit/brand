<?php
/**
 * Create the stable runtime fixture used by the compiler's block-style gate.
 *
 * Run from the target Studio site:
 * studio wp eval-file <absolute-path>/scripts/setup-style-fixture.php
 */

$content = <<<'BLOCKS'
<!-- wp:group {"className":"is-style-rf-surface","layout":{"type":"constrained"}} -->
<div class="wp-block-group is-style-rf-surface">
	<!-- wp:heading {"level":2} -->
	<h2 class="wp-block-heading">Surface fixture</h2>
	<!-- /wp:heading -->

	<!-- wp:paragraph -->
	<p>This page verifies compiler-owned block styles.</p>
	<!-- /wp:paragraph -->

	<!-- wp:buttons -->
	<div class="wp-block-buttons">
		<!-- wp:button {"className":"is-style-rf-accent"} -->
		<div class="wp-block-button is-style-rf-accent"><a class="wp-block-button__link wp-element-button">Accent fixture</a></div>
		<!-- /wp:button -->
	</div>
	<!-- /wp:buttons -->
</div>
<!-- /wp:group -->
BLOCKS;

$existing = get_page_by_path( 'style-fixture', OBJECT, 'page' );
$post_id  = wp_insert_post(
	array(
		'ID'           => $existing ? $existing->ID : 0,
		'post_type'    => 'page',
		'post_status'  => 'publish',
		'post_title'   => 'Style Fixture',
		'post_name'    => 'style-fixture',
		'post_content' => $content,
	),
	true
);

if ( is_wp_error( $post_id ) ) {
	WP_CLI::error( $post_id->get_error_message() );
}

WP_CLI::success( sprintf( 'Style fixture is ready at post %d.', $post_id ) );
