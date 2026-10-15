<?php
/**
 * Publish the organism-pattern demo.
 *
 * The headings and descriptions belong to this page. The sections below
 * them are the compiler-written pattern files, unchanged.
 *
 * studio wp eval-file <brand-next>/scripts/setup-pattern-demo.php
 */

$sections = array(
	array(
		'title'       => 'Quote',
		'description' => 'A quotation and an attribution. The cream edge comes from the theme default.',
		'file'        => 'quote.php',
	),
	array(
		'title'       => 'Key takeaways',
		'description' => 'A short ordered list for an article sidebar or the top of a post. Moss title, orange numbers, and an orange left rule.',
		'file'        => 'takeaways.php',
	),
	array(
		'title'       => 'Service offer',
		'description' => 'One engagement, the full width of the column. White fill, cream edge, a small moss button, and a light-green quote band.',
		'file'        => 'offer.php',
	),
	array(
		'title'       => 'Portrait quote',
		'description' => 'The same quotation with a photo, a name, and a role. A core Quote block cannot hold the image, so this is its own pattern.',
		'file'        => 'quote-portrait.php',
	),
	array(
		'title'       => 'Review card',
		'description' => 'One review: a rating, a title, the words, a person, and a date. A row of these is the card grid, not this pattern.',
		'file'        => 'review.php',
	),
	array(
		'title'       => 'Card',
		'description' => 'One thing someone can open. An eyebrow, a title, a short body, and an action under a hairline.',
		'file'        => 'card.php',
	),
	array(
		'title'       => 'Facts',
		'description' => 'Client, date, services, and a link. The cream edge is the same one a card uses.',
		'file'        => 'facts.php',
	),
	array(
		'title'       => 'Steps',
		'description' => 'A mark column and a sentence. This is not the key takeaways list.',
		'file'        => 'steps.php',
	),
	array(
		'title'       => 'Stat row',
		'description' => 'Three numbers. A fourth would be a leftover tile.',
		'file'        => 'stats.php',
	),
	array(
		'title'       => 'People',
		'description' => 'A square photo, a name, and a role. The circular portrait stays on the service offer.',
		'file'        => 'people.php',
	),
	array(
		'title'       => 'Photo cluster',
		'description' => 'One lead picture and two beside it. Each picture uses the cream edge.',
		'file'        => 'shots.php',
	),
	array(
		'title'       => 'Logo row',
		'description' => 'Client marks in a row. Each image has the client name as its alt text.',
		'file'        => 'logo-row.php',
	),
	array(
		'title'       => 'Icon card',
		'description' => 'A card with a check, an arrow, or a mail glyph. The glyph is a mask, so the pattern holds no inline SVG.',
		'file'        => 'icon-card.php',
	),
	array(
		'title'       => 'Icon list',
		'description' => 'The same glyphs in a list. The title and the line stay editable.',
		'file'        => 'icon-list.php',
	),
	array(
		'title'       => 'Subscribe',
		'description' => 'The same form as the articles hero and the post rail. It posts to /api/subscribe.',
		'file'        => 'subscribe.php',
	),
);

$content = '';
foreach ( $sections as $section ) {
	$path = get_theme_file_path( 'patterns/' . $section['file'] );
	if ( ! is_readable( $path ) ) {
		WP_CLI::error( 'Missing pattern file: ' . $path );
	}

	$pattern = file_get_contents( $path );
	$markup  = strstr( $pattern, '<!--' );
	if ( ! is_string( $markup ) || '' === trim( $markup ) ) {
		WP_CLI::error( 'Pattern has no block markup: ' . $section['file'] );
	}

	$content .= sprintf(
		"<!-- wp:heading {\"level\":2} -->\n<h2 class=\"wp-block-heading\">%s</h2>\n<!-- /wp:heading -->\n\n<!-- wp:paragraph -->\n<p>%s</p>\n<!-- /wp:paragraph -->\n\n%s\n\n",
		$section['title'],
		$section['description'],
		trim( $markup )
	);
}

$existing = get_page_by_path( 'pattern-demo', OBJECT, 'page' );
$post_id  = wp_insert_post(
	array(
		'ID'           => $existing ? $existing->ID : 0,
		'post_type'    => 'page',
		'post_status'  => 'publish',
		'post_title'   => 'Pattern demo',
		'post_name'    => 'pattern-demo',
		'post_excerpt' => 'Organism patterns: quote, takeaways, offer, review, card, and the case-study pieces, plus subscribe.',
		'post_content' => trim( $content ),
	),
	true
);

if ( is_wp_error( $post_id ) ) {
	WP_CLI::error( $post_id->get_error_message() );
}

WP_CLI::success( sprintf( 'Pattern demo is ready at post %d.', $post_id ) );
