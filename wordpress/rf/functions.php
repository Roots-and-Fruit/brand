<?php
/**
 * Roots & Fruit CDS block theme.
 *
 * Enqueues the R&F CSS (tokens + layout + components, not base.css).
 * Registers Layer B tokens when register_design_token() exists.
 *
 * @package rf-cds
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Editor styles so the canvas tracks the same kit files as the front.
 */
function rf_setup() {
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'editor-styles' );
	rf_rebuild_site_css();
	add_editor_style( 'assets/css/rf-site.css' );
}
add_action( 'after_setup_theme', 'rf_setup' );

/**
 * Editor controls for the code window. The canvas uses the same kit CSS.
 */
function rf_enqueue_editor_layout() {
	$path = get_theme_file_path( 'assets/js/editor-layout.js' );
	if ( ! is_readable( $path ) ) {
		return;
	}

	wp_enqueue_script(
		'rf-editor-layout',
		get_theme_file_uri( 'assets/js/editor-layout.js' ),
		array( 'wp-blocks', 'wp-element', 'wp-components', 'wp-block-editor', 'wp-compose', 'wp-hooks', 'wp-data', 'wp-dom-ready', 'wp-server-side-render' ),
		(string) filemtime( $path ),
		true
	);
}
add_action( 'enqueue_block_editor_assets', 'rf_enqueue_editor_layout' );

/**
 * The iframed editor layers add_editor_style() under its own reset.
 * Load the kit as a normal stylesheet so cards and code windows match the front.
 */
function rf_enqueue_editor_kit() {
	if ( ! is_admin() ) {
		return;
	}

	$path = get_theme_file_path( 'assets/css/rf-site.css' );
	if ( ! is_readable( $path ) ) {
		return;
	}

	wp_enqueue_style(
		'rf-site-editor',
		get_theme_file_uri( 'assets/css/rf-site.css' ),
		array(),
		(string) filemtime( $path )
	);
}
add_action( 'enqueue_block_assets', 'rf_enqueue_editor_kit' );

/**
 * Term hero pieces. The toolkit prints its own headings and button, so the
 * template places those fragments inside the page hero.
 */
function rf_register_term_hero_blocks() {
	register_block_type(
		'rf/term-lede',
		array(
			'api_version'     => 3,
			'title'           => __( 'Term lede', 'rf-cds' ),
			'render_callback' => 'rf_render_term_lede',
			'supports'        => array(
				'inserter' => false,
				'html'     => false,
			),
		)
	);

	register_block_type(
		'rf/term-references',
		array(
			'api_version'     => 3,
			'title'           => __( 'Term references', 'rf-cds' ),
			'render_callback' => 'rf_render_term_references',
			'supports'        => array(
				'inserter' => false,
				'html'     => false,
			),
		)
	);
}
add_action( 'init', 'rf_register_term_hero_blocks' );

/**
 * Short definition under the term title. Tooltip first, excerpt if it is empty.
 *
 * @return string
 */
function rf_render_term_lede() {
	$post_id = get_queried_object_id();
	if ( $post_id <= 0 ) {
		return '';
	}

	$text = get_post_meta( $post_id, 'cat_tooltip_content', true );
	if ( ! is_string( $text ) || '' === trim( $text ) ) {
		$text = get_the_excerpt( $post_id );
	}
	$text = trim( wp_strip_all_tags( (string) $text ) );
	if ( '' === $text ) {
		return '';
	}

	return '<p class="rf-lede">' . esc_html( $text ) . '</p>';
}

/**
 * Authority links and sources for the hero's right column.
 *
 * @return string
 */
function rf_render_term_references() {
	if ( ! class_exists( '\ContextAuthorityToolkit\Cat_Term_Single_Chrome' ) ) {
		return '';
	}

	$post_id = get_queried_object_id();
	if ( $post_id <= 0 ) {
		return '';
	}

	$chrome = new \ContextAuthorityToolkit\Cat_Term_Single_Chrome();
	$html   = $chrome->render_same_as_html( $post_id ) . rf_render_term_sources( $post_id );
	if ( '' === $html ) {
		return '';
	}

	return '<div class="rf-stack rf-term-refs">' . $html . '</div>';
}

/**
 * Sources list. Publisher and date sit on the line under the title.
 *
 * @param int $post_id Term post ID.
 * @return string
 */
function rf_render_term_sources( $post_id ) {
	$raw = get_post_meta( $post_id, 'cat_sources', true );
	if ( ! is_array( $raw ) ) {
		return '';
	}

	$items = array();
	foreach ( $raw as $source ) {
		if ( ! is_array( $source ) || empty( $source['url'] ) ) {
			continue;
		}

		$url = esc_url( trim( (string) $source['url'] ) );
		if ( '' === $url ) {
			continue;
		}

		$title = isset( $source['title'] ) ? trim( (string) $source['title'] ) : '';
		$label = '' !== $title ? $title : $url;
		$meta  = rf_term_source_meta( $source );
		$items[] = sprintf(
			'<li class="rf-term-source"><span class="rf-term-source__body"><a href="%1$s">%2$s</a>%3$s</span></li>',
			$url,
			esc_html( $label ),
			$meta
		);
	}

	if ( empty( $items ) ) {
		return '';
	}

	return sprintf(
		'<section class="cat-term-panel__sources"><h3 class="cat-term-panel__section-heading">%1$s</h3><ul class="cat-term-panel__sources-list">%2$s</ul></section>',
		esc_html__( 'Sources', 'rf-cds' ),
		implode( '', $items )
	);
}

/**
 * Publisher and formatted date for one source.
 *
 * @param array $source Source row.
 * @return string
 */
function rf_term_source_meta( $source ) {
	$parts = array();

	if ( ! empty( $source['publisher'] ) ) {
		$parts[] = '<span class="rf-term-source__publisher">' . esc_html( trim( (string) $source['publisher'] ) ) . '</span>';
	}

	$raw_date = isset( $source['datePublished'] ) ? trim( (string) $source['datePublished'] ) : '';
	$date     = rf_format_source_date( $raw_date );
	if ( '' !== $date ) {
		$parts[] = '<span class="rf-byline">' . rf_calendar_icon() . '<time datetime="' . esc_attr( $raw_date ) . '">' . $date . '</time></span>';
	}

	if ( empty( $parts ) ) {
		return '';
	}

	return '<span class="rf-term-source__meta">' . implode( '', $parts ) . '</span>';
}

/**
 * Format a Y-m-d source date with the site's general date format.
 *
 * @param string $raw Stored date.
 * @return string Escaped date, or empty when the value is not a date.
 */
function rf_format_source_date( $raw ) {
	if ( '' === $raw ) {
		return '';
	}

	$date = date_create_immutable_from_format( '!Y-m-d', $raw, wp_timezone() );
	if ( ! $date instanceof DateTimeImmutable ) {
		return '';
	}

	return esc_html( wp_date( get_option( 'date_format' ), $date->getTimestamp() ) );
}

/**
 * Calendar mark used beside dates.
 *
 * @return string
 */
function rf_calendar_icon() {
	return '<svg class="rf-icon rf-icon--calendar" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 2h2v2h6V2h2v2h3a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3V2zm12 8H5v10h14V10zM8 13h2v2H8v-2zm4 0h2v2h-2v-2z"/></svg>';
}

/**
 * The hero already shows the tooltip. Drop the copy the toolkit prepends to the body.
 *
 * @param string $content Term content.
 * @return string
 */
function rf_hide_duplicate_term_lead( $content ) {
	if ( ! is_singular( 'term' ) ) {
		return $content;
	}

	$stripped = preg_replace( '/<p class="cat-term-single-lead">.*?<\/p>/s', '', $content, 1 );
	return is_string( $stripped ) ? $stripped : $content;
}
add_filter( 'the_content', 'rf_hide_duplicate_term_lead', 31 );

/**
 * Code blocks using the Window style render with the kit code chrome.
 *
 * @param string $block_content Rendered block HTML.
 * @param array  $block         Block data.
 * @return string
 */
function rf_render_code_window( $block_content, $block ) {
	if ( 'core/code' !== ( $block['blockName'] ?? '' ) ) {
		return $block_content;
	}

	$class = (string) ( $block['attrs']['className'] ?? '' );
	if ( ! str_contains( $class, 'is-style-rf-code' ) ) {
		return $block_content;
	}

	$code = $block['attrs']['content'] ?? '';
	if ( ! is_string( $code ) || '' === $code ) {
		$code = wp_strip_all_tags( $block_content );
	}

	$language = isset( $block['attrs']['rfLanguage'] ) ? (string) $block['attrs']['rfLanguage'] : '';
	$label    = '' !== $language ? '<span class="rf-code__lang">' . esc_html( $language ) . '</span>' : '';

	return '<div class="rf-code"><div class="rf-code__chrome"><div class="rf-code__dots" aria-hidden="true"><span></span><span></span><span></span></div></div><pre class="rf-code__body"><code>' . esc_html( $code ) . '</code></pre>' . $label . '</div>';
}
add_filter( 'render_block', 'rf_render_code_window', 10, 2 );

/**
 * Research studies. Archive at /research/, each study at /research/{slug}/.
 */
function rf_register_research_type() {
	register_post_type(
		'research',
		array(
			'labels'       => array(
				'name'          => 'Research',
				'singular_name' => 'Research',
				'add_new_item'  => 'Add research',
				'edit_item'     => 'Edit research',
			),
			'public'       => true,
			'has_archive'  => true,
			'rewrite'      => array(
				'slug'       => 'research',
				'with_front' => false,
			),
			'show_in_rest' => true,
			'menu_icon'    => 'dashicons-chart-bar',
			'supports'     => array( 'title', 'editor', 'excerpt', 'thumbnail', 'custom-fields' ),
		)
	);
}
add_action( 'init', 'rf_register_research_type' );

/**
 * Plugin pages. Documentation stays in HydroKE (hydrodoc), matched by the
 * product slug to the hydrodoc_product term.
 */
function rf_register_product_types() {
	register_post_type(
		'product',
		array(
			'labels'       => array(
				'name'          => 'Products',
				'singular_name' => 'Product',
				'add_new_item'  => 'Add product',
				'edit_item'     => 'Edit product',
				'menu_name'     => 'Products',
			),
			'public'       => true,
			'has_archive'  => true,
			'rewrite'      => array(
				'slug'       => 'products',
				'with_front' => false,
			),
			'show_in_rest' => true,
			'menu_icon'    => 'dashicons-admin-plugins',
			'supports'     => array( 'title', 'editor', 'excerpt', 'thumbnail', 'custom-fields', 'revisions' ),
		)
	);

	$text_meta = array(
		'rf_promise',
		'rf_version',
		'rf_requires_wp',
		'rf_tested',
		'rf_requires_php',
		'rf_license',
		'rf_docs_product',
	);
	foreach ( $text_meta as $key ) {
		register_post_meta(
			'product',
			$key,
			array(
				'type'              => 'string',
				'single'            => true,
				'show_in_rest'      => true,
				'auth_callback'     => static function () {
					return current_user_can( 'edit_posts' );
				},
				'sanitize_callback' => 'sanitize_text_field',
			)
		);
	}

	foreach ( array( 'rf_wporg_url', 'rf_feedback_url' ) as $key ) {
		register_post_meta(
			'product',
			$key,
			array(
				'type'              => 'string',
				'single'            => true,
				'show_in_rest'      => true,
				'auth_callback'     => static function () {
					return current_user_can( 'edit_posts' );
				},
				'sanitize_callback' => 'esc_url_raw',
			)
		);
	}

	register_post_type(
		'product_update',
		array(
			'labels'       => array(
				'name'          => 'Updates',
				'singular_name' => 'Update',
				'add_new'       => 'Add update',
				'add_new_item'  => 'Add update',
				'edit_item'     => 'Edit update',
				'new_item'      => 'New update',
				'view_item'     => 'View update',
				'search_items'  => 'Search updates',
				'not_found'     => 'No updates found',
				'menu_name'     => 'Updates',
			),
			'public'       => true,
			'has_archive'  => false,
			'rewrite'      => false,
			'show_in_rest' => true,
			'show_in_menu' => 'edit.php?post_type=product',
			'supports'     => array( 'title', 'editor', 'excerpt', 'author', 'custom-fields', 'revisions' ),
		)
	);
}
add_action( 'init', 'rf_register_product_types' );

/**
 * Rewrite rules for /products/{product}/updates/ and /products/{product}/updates/{slug}/.
 */
function rf_register_product_update_rewrites() {
	add_rewrite_tag( '%rf_product_slug%', '([^/]+)' );
	add_rewrite_rule(
		'^products/([^/]+)/updates/([^/]+)/?$',
		'index.php?post_type=product_update&name=$matches[2]&rf_product_slug=$matches[1]',
		'top'
	);
	add_rewrite_rule(
		'^products/([^/]+)/updates/?$',
		'index.php?post_type=product_update&rf_product_slug=$matches[1]',
		'top'
	);
}
add_action( 'init', 'rf_register_product_update_rewrites', 11 );

/**
 * Resolve a published product from its post_name slug.
 *
 * @param string $slug Product post_name.
 * @return WP_Post|null
 */
function rf_product_by_slug( $slug ) {
	$slug = sanitize_title( (string) $slug );
	if ( '' === $slug ) {
		return null;
	}
	$posts = get_posts(
		array(
			'post_type'      => 'product',
			'post_status'    => 'publish',
			'name'           => $slug,
			'posts_per_page' => 1,
		)
	);
	return ( is_array( $posts ) && ! empty( $posts[0] ) && $posts[0] instanceof WP_Post ) ? $posts[0] : null;
}

/**
 * Build /products/{product}/updates/{slug}/ permalinks for product_update posts.
 *
 * @param string  $post_link Default link.
 * @param WP_Post $post      Post object.
 * @return string
 */
function rf_product_update_permalink( $post_link, $post ) {
	if ( ! $post instanceof WP_Post || 'product_update' !== $post->post_type ) {
		return $post_link;
	}

	$parent_id    = (int) $post->post_parent;
	$product_slug = $parent_id > 0 ? (string) get_post_field( 'post_name', $parent_id ) : '';
	if ( '' === $product_slug ) {
		return $post_link;
	}

	return home_url( '/products/' . $product_slug . '/updates/' . $post->post_name . '/' );
}
add_filter( 'post_type_link', 'rf_product_update_permalink', 10, 2 );

/**
 * Archive URL for a product's updates (/products/{product}/updates/).
 *
 * @param int $product_id Product post ID.
 * @return string
 */
function rf_product_updates_url( $product_id ) {
	$product_id = (int) $product_id;
	if ( $product_id <= 0 ) {
		return '';
	}
	$slug = (string) get_post_field( 'post_name', $product_id );
	if ( '' === $slug ) {
		return '';
	}
	return home_url( '/products/' . $slug . '/updates/' );
}

/**
 * Published updates for a product, newest first.
 *
 * @param int $product_id Product post ID.
 * @param int $limit      Max posts (-1 for all).
 * @return WP_Post[]
 */
function rf_product_updates( $product_id, $limit = -1 ) {
	$product_id = (int) $product_id;
	if ( $product_id <= 0 ) {
		return array();
	}
	$posts = get_posts(
		array(
			'post_type'      => 'product_update',
			'post_status'    => 'publish',
			'post_parent'    => $product_id,
			'posts_per_page' => (int) $limit,
			'orderby'        => 'date',
			'order'          => 'DESC',
		)
	);
	return is_array( $posts ) ? $posts : array();
}

/**
 * Scope the main product_update archive query to the requested product and return all updates in full.
 *
 * @param WP_Query $query Main query.
 */
function rf_product_update_query( $query ) {
	if ( is_admin() || ! $query->is_main_query() ) {
		return;
	}

	if ( 'product_update' !== $query->get( 'post_type' ) ) {
		return;
	}

	$slug = (string) $query->get( 'rf_product_slug' );
	if ( '' === $slug ) {
		return;
	}

	$product = rf_product_by_slug( $slug );
	if ( ! $product ) {
		$query->set( 'post__in', array( 0 ) );
		return;
	}

	if ( '' === (string) $query->get( 'name' ) ) {
		$query->is_archive           = true;
		$query->is_post_type_archive = true;
		$query->is_home              = false;
		$query->is_singular          = false;
		$query->set( 'post_parent', (int) $product->ID );
		$query->set( 'posts_per_page', -1 );
		$query->set( 'orderby', 'date' );
		$query->set( 'order', 'DESC' );
	}
}
add_action( 'pre_get_posts', 'rf_product_update_query' );

/**
 * Ensure /products/{product}/updates/ and /products/{product}/updates/{slug}/ match a real product.
 */
function rf_validate_product_update_route() {
	if ( is_admin() ) {
		return;
	}

	$slug = (string) get_query_var( 'rf_product_slug' );
	if ( '' === $slug ) {
		return;
	}

	$product = rf_product_by_slug( $slug );
	if ( ! $product ) {
		global $wp_query;
		$wp_query->set_404();
		status_header( 404 );
		return;
	}

	if ( is_singular( 'product_update' ) ) {
		$post = get_queried_object();
		if ( ! $post instanceof WP_Post || (int) $post->post_parent !== (int) $product->ID ) {
			global $wp_query;
			$wp_query->set_404();
			status_header( 404 );
		}
	}
}
add_action( 'template_redirect', 'rf_validate_product_update_route', 1 );

/**
 * Current product post for a product_update archive or single screen.
 *
 * @return WP_Post|null
 */
function rf_current_update_product() {
	$slug = (string) get_query_var( 'rf_product_slug' );
	if ( '' !== $slug ) {
		return rf_product_by_slug( $slug );
	}
	if ( is_singular( 'product_update' ) ) {
		$post = get_queried_object();
		if ( $post instanceof WP_Post && $post->post_parent > 0 ) {
			$parent = get_post( (int) $post->post_parent );
			return ( $parent instanceof WP_Post && 'product' === $parent->post_type ) ? $parent : null;
		}
	}
	return null;
}

/**
 * Format the archive title on /products/{product}/updates/ as "{Product} Updates".
 *
 * @param string $title Archive title.
 * @return string
 */
function rf_product_update_archive_title( $title ) {
	if ( is_post_type_archive( 'product_update' ) ) {
		$product = rf_current_update_product();
		if ( $product instanceof WP_Post ) {
			return get_the_title( $product ) . ' Updates';
		}
	}
	return $title;
}
add_filter( 'get_the_archive_title', 'rf_product_update_archive_title' );

/**
 * Eyebrow link on /products/{product}/updates/ and /products/{product}/updates/{slug}/.
 *
 * @return string
 */
function rf_render_product_updates_eyebrow() {
	$product = rf_current_update_product();
	if ( ! $product instanceof WP_Post ) {
		return '';
	}

	$product_url  = get_permalink( $product );
	$product_name = get_the_title( $product );
	if ( is_singular( 'product_update' ) ) {
		$updates_url = rf_product_updates_url( $product->ID );
		return sprintf(
			'<p class="rf-meta"><a href="%1$s">%2$s</a> · <a href="%3$s">Updates</a></p>',
			esc_url( $product_url ),
			esc_html( $product_name ),
			esc_url( $updates_url )
		);
	}

	return sprintf(
		'<p class="rf-meta"><a href="%1$s">%2$s</a></p>',
		esc_url( $product_url ),
		esc_html( $product_name )
	);
}

/**
 * Lede paragraph on /products/{product}/updates/.
 *
 * @return string
 */
function rf_render_product_updates_lede() {
	$product = rf_current_update_product();
	if ( ! $product instanceof WP_Post ) {
		return '';
	}

	return sprintf(
		'<p class="rf-lede">Short release notes, fixes, and changes for %s.</p>',
		esc_html( get_the_title( $product ) )
	);
}

/**
 * Product archive lists plugins by title.
 *
 * @param WP_Query $query Main query.
 */
function rf_product_archive_order( $query ) {
	if ( is_admin() || ! $query->is_main_query() || ! $query->is_post_type_archive( 'product' ) ) {
		return;
	}

	$query->set( 'orderby', 'title' );
	$query->set( 'order', 'ASC' );
}
add_action( 'pre_get_posts', 'rf_product_archive_order' );

/**
 * Hero line, download button, facts, and the HydroKE docs for this plugin.
 */
function rf_register_product_blocks() {
	$hidden = array(
		'inserter' => false,
		'html'     => false,
	);

	register_block_type(
		'rf/product-promise',
		array(
			'api_version'     => 3,
			'title'           => __( 'Product promise', 'rf-cds' ),
			'render_callback' => 'rf_render_product_promise',
			'supports'        => $hidden,
		)
	);
	register_block_type(
		'rf/product-lede',
		array(
			'api_version'     => 3,
			'title'           => __( 'Product lede', 'rf-cds' ),
			'render_callback' => 'rf_render_product_lede',
			'supports'        => $hidden,
		)
	);
	register_block_type(
		'rf/product-actions',
		array(
			'api_version'     => 3,
			'title'           => __( 'Product actions', 'rf-cds' ),
			'render_callback' => 'rf_render_product_actions',
			'supports'        => $hidden,
		)
	);
	register_block_type(
		'rf/product-shot',
		array(
			'api_version'     => 3,
			'title'           => __( 'Product shot', 'rf-cds' ),
			'render_callback' => 'rf_render_product_shot',
			'supports'        => $hidden,
		)
	);
	register_block_type(
		'rf/product-facts',
		array(
			'api_version'     => 3,
			'title'           => __( 'Product facts', 'rf-cds' ),
			'render_callback' => 'rf_render_product_facts',
			'supports'        => $hidden,
		)
	);
	register_block_type(
		'rf/product-docs',
		array(
			'api_version'     => 3,
			'title'           => __( 'Product docs', 'rf-cds' ),
			'render_callback' => 'rf_render_product_docs',
			'supports'        => $hidden,
		)
	);
	register_block_type(
		'rf/product-feedback',
		array(
			'api_version'     => 3,
			'title'           => __( 'Product feedback', 'rf-cds' ),
			'render_callback' => 'rf_render_product_feedback',
			'supports'        => $hidden,
		)
	);
	register_block_type(
		'rf/product-updates-eyebrow',
		array(
			'api_version'     => 3,
			'title'           => __( 'Product updates eyebrow', 'rf-cds' ),
			'render_callback' => 'rf_render_product_updates_eyebrow',
			'supports'        => $hidden,
		)
	);
	register_block_type(
		'rf/product-updates-lede',
		array(
			'api_version'     => 3,
			'title'           => __( 'Product updates lede', 'rf-cds' ),
			'render_callback' => 'rf_render_product_updates_lede',
			'supports'        => $hidden,
		)
	);
}
add_action( 'init', 'rf_register_product_blocks' );

/**
 * @return string
 */
function rf_render_product_promise() {
	$post_id = rf_product_context_id();
	if ( $post_id <= 0 ) {
		return '';
	}

	$text = trim( (string) get_post_meta( $post_id, 'rf_promise', true ) );
	if ( '' === $text ) {
		return '';
	}

	return '<p class="rf-display rf-display--md">' . esc_html( $text ) . '</p>';
}

/**
 * @return string
 */
function rf_render_product_lede() {
	if ( ! is_singular( 'product' ) ) {
		return '';
	}

	$post_id = get_queried_object_id();
	if ( $post_id <= 0 ) {
		return '';
	}

	$text = trim( wp_strip_all_tags( (string) get_post_field( 'post_excerpt', $post_id ) ) );
	if ( '' === $text ) {
		return '';
	}

	return '<p class="rf-lede">' . esc_html( $text ) . '</p>';
}

/**
 * @return string
 */
function rf_render_product_actions() {
	$post_id = rf_product_context_id();
	if ( $post_id <= 0 ) {
		return '';
	}

	$wporg   = esc_url( (string) get_post_meta( $post_id, 'rf_wporg_url', true ) );
	$version = trim( (string) get_post_meta( $post_id, 'rf_version', true ) );
	$buttons = '';

	if ( '' !== $wporg ) {
		$buttons .= '<div class="wp-block-button btn btn--cta"><a class="wp-block-button__link wp-element-button" href="' . $wporg . '">Download on WordPress.org</a></div>';
	}
	$docs_url = rf_product_docs_url( $post_id );
	if ( '' !== $docs_url ) {
		$buttons .= '<div class="wp-block-button btn btn--tertiary"><a class="wp-block-button__link wp-element-button" href="' . esc_url( $docs_url ) . '">Documentation</a></div>';
	}
	if ( array() !== rf_product_updates( $post_id, 1 ) ) {
		$updates_url = rf_product_updates_url( $post_id );
		if ( '' !== $updates_url ) {
			$buttons .= '<div class="wp-block-button btn btn--tertiary"><a class="wp-block-button__link wp-element-button" href="' . esc_url( $updates_url ) . '">Updates</a></div>';
		}
	}
	if ( '' === $buttons ) {
		return '';
	}

	$bits = array( 'By Matt Cromwell', 'Free' );
	if ( '' !== $version ) {
		$bits[] = 'Version ' . $version;
	}

	return '<div class="wp-block-buttons rf-cluster">' . $buttons . '</div><p class="rf-meta">' . esc_html( implode( ' · ', $bits ) ) . '</p>';
}

/**
 * Featured image, used as the hero shot on the right.
 *
 * @return string
 */
function rf_render_product_shot() {
	$post_id = rf_product_context_id();
	if ( $post_id <= 0 ) {
		return '';
	}

	$thumb_id = (int) get_post_thumbnail_id( $post_id );
	if ( $thumb_id <= 0 ) {
		return '';
	}

	$image = wp_get_attachment_image_src( $thumb_id, 'large' );
	if ( ! is_array( $image ) || empty( $image[0] ) ) {
		return '';
	}

	$alt = trim( (string) get_post_meta( $thumb_id, '_wp_attachment_image_alt', true ) );
	if ( '' === $alt ) {
		$alt = get_the_title( $post_id );
	}

	return sprintf(
		'<img class="rf-frame rf-frame--fit" src="%1$s" alt="%2$s" width="%3$d" height="%4$d" />',
		esc_url( $image[0] ),
		esc_attr( $alt ),
		(int) $image[1],
		(int) $image[2]
	);
}

/**
 * Plugin details, the fact list from the kit's plugin page.
 *
 * @return string
 */
function rf_render_product_facts() {
	$post_id = rf_product_context_id();
	if ( $post_id <= 0 ) {
		return '';
	}

	$rows = array(
		'Version'            => (string) get_post_meta( $post_id, 'rf_version', true ),
		'Requires WordPress' => (string) get_post_meta( $post_id, 'rf_requires_wp', true ),
		'Tested up to'       => (string) get_post_meta( $post_id, 'rf_tested', true ),
		'Requires PHP'       => (string) get_post_meta( $post_id, 'rf_requires_php', true ),
		'License'            => (string) get_post_meta( $post_id, 'rf_license', true ),
	);

	$items = '';
	foreach ( $rows as $label => $value ) {
		$value = trim( $value );
		if ( '' === $value ) {
			continue;
		}
		$items .= '<div><dt>' . esc_html( $label ) . '</dt><dd>' . esc_html( $value ) . '</dd></div>';
	}
	if ( '' === $items ) {
		return '';
	}

	return '<div class="rf-facts"><p class="rf-facts__title">Plugin details</p><dl>' . $items . '</dl></div>';
}

/**
 * @return string
 */
function rf_render_product_docs() {
	$post_id = rf_product_context_id();
	if ( $post_id <= 0 ) {
		return '';
	}

	$docs = rf_product_docs( $post_id );
	if ( array() === $docs ) {
		return '';
	}

	$items = '';
	foreach ( $docs as $doc ) {
		$items .= sprintf(
			'<li><a href="%1$s">%2$s</a></li>',
			esc_url( get_permalink( $doc ) ),
			esc_html( get_the_title( $doc ) )
		);
	}

	return '<section id="documentation" class="rf-stack"><h2 class="rf-display rf-display--md">Documentation</h2><p>These notes live with the rest of the docs. Start with the one that matches what you are trying to do.</p><ul>' . $items . '</ul></section>';
}

/**
 * Discussion board for this plugin. The URL is the GitHub discussions page.
 *
 * @return string
 */
function rf_render_product_feedback() {
	$post_id = rf_product_context_id();
	if ( $post_id <= 0 ) {
		return '';
	}

	$url = esc_url( (string) get_post_meta( $post_id, 'rf_feedback_url', true ) );
	if ( '' === $url ) {
		return '';
	}

	return '<section class="surface surface--panel rf-copy"><h2 class="rf-display rf-display--md">Have feedback?</h2><p>I read the discussion board. A bug, a setup that did not work, or an idea you want in the plugin. That is the place.</p><div class="wp-block-buttons rf-cluster"><div class="wp-block-button btn btn--tertiary"><a class="wp-block-button__link wp-element-button" href="' . $url . '">Join the discussion</a></div></div></section>';
}

/**
 * Product ID when the current view is a product.
 *
 * @return int
 */
function rf_product_context_id() {
	if ( ! is_singular( 'product' ) ) {
		return 0;
	}

	return (int) get_queried_object_id();
}

/**
 * HydroKE product term that holds this plugin's docs.
 *
 * @param int $product_id Product ID.
 * @return string
 */
/**
 * Docs index for this plugin. HydroKE's product term is /docs/{slug}/.
 *
 * @param int $product_id Product ID.
 * @return string
 */
function rf_product_docs_url( $product_id ) {
	if ( ! taxonomy_exists( 'hydrodoc_product' ) ) {
		return '';
	}

	$slug = rf_product_docs_slug( $product_id );
	if ( '' === $slug ) {
		return '';
	}

	$term = get_term_by( 'slug', $slug, 'hydrodoc_product' );
	if ( ! $term instanceof WP_Term ) {
		return '';
	}

	$url = get_term_link( $term );
	return is_wp_error( $url ) ? '' : $url;
}

function rf_product_docs_slug( $product_id ) {
	$slug = trim( (string) get_post_meta( $product_id, 'rf_docs_product', true ) );
	if ( '' === $slug ) {
		$slug = (string) get_post_field( 'post_name', $product_id );
	}

	return sanitize_title( $slug );
}

/**
 * Published HydroKE docs for this product.
 *
 * @param int $product_id Product ID.
 * @return WP_Post[]
 */
function rf_product_docs( $product_id ) {
	if ( ! taxonomy_exists( 'hydrodoc_product' ) ) {
		return array();
	}

	$slug = rf_product_docs_slug( $product_id );
	if ( '' === $slug ) {
		return array();
	}

	$docs = get_posts(
		array(
			'post_type'      => 'hydrodoc',
			'post_status'    => 'publish',
			'posts_per_page' => 50,
			'orderby'        => array(
				'menu_order' => 'ASC',
				'title'      => 'ASC',
			),
			'tax_query'      => array(
				array(
					'taxonomy' => 'hydrodoc_product',
					'field'    => 'slug',
					'terms'    => $slug,
				),
			),
		)
	);

	return is_array( $docs ) ? $docs : array();
}

/**
 * @param int $product_id Product ID.
 * @return bool
 */
function rf_product_has_docs( $product_id ) {
	return array() !== rf_product_docs( $product_id );
}

/**
 * Product fields the hero reads.
 */
function rf_product_meta_box() {
	add_meta_box(
		'rf-product-details',
		'Plugin details',
		'rf_render_product_meta_box',
		'product',
		'side'
	);
}
add_action( 'add_meta_boxes', 'rf_product_meta_box' );

/**
 * @param WP_Post $post Product.
 */
function rf_render_product_meta_box( $post ) {
	wp_nonce_field( 'rf_product_meta', 'rf_product_meta_nonce' );
	$fields = array(
		'rf_promise'       => array( 'Line under the title', 'text' ),
		'rf_wporg_url'     => array( 'WordPress.org URL', 'url' ),
		'rf_version'       => array( 'Version', 'text' ),
		'rf_requires_wp'   => array( 'Requires WordPress', 'text' ),
		'rf_tested'        => array( 'Tested up to', 'text' ),
		'rf_requires_php'  => array( 'Requires PHP', 'text' ),
		'rf_license'       => array( 'License', 'text' ),
		'rf_docs_product'  => array( 'HydroKE product slug', 'text' ),
		'rf_feedback_url'  => array( 'Discussion board URL', 'url' ),
	);
	foreach ( $fields as $key => $field ) {
		$value = (string) get_post_meta( $post->ID, $key, true );
		printf(
			'<p><label for="%1$s">%2$s</label><br /><input type="%3$s" class="widefat" id="%1$s" name="%1$s" value="%4$s" /></p>',
			esc_attr( $key ),
			esc_html( $field[0] ),
			esc_attr( $field[1] ),
			esc_attr( $value )
		);
	}
}

/**
 * @param int $post_id Product ID.
 */
function rf_save_product_meta( $post_id ) {
	if ( ! isset( $_POST['rf_product_meta_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['rf_product_meta_nonce'] ) ), 'rf_product_meta' ) ) {
		return;
	}
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}
	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}

	$text_keys = array( 'rf_promise', 'rf_version', 'rf_requires_wp', 'rf_tested', 'rf_requires_php', 'rf_license', 'rf_docs_product' );
	$url_keys  = array( 'rf_wporg_url', 'rf_feedback_url' );
	foreach ( $text_keys as $key ) {
		$value = isset( $_POST[ $key ] ) ? sanitize_text_field( wp_unslash( $_POST[ $key ] ) ) : '';
		update_post_meta( $post_id, $key, $value );
	}
	foreach ( $url_keys as $key ) {
		$value = isset( $_POST[ $key ] ) ? esc_url_raw( wp_unslash( $_POST[ $key ] ) ) : '';
		update_post_meta( $post_id, $key, $value );
	}
}
add_action( 'save_post_product', 'rf_save_product_meta' );

/**
 * Product selector meta box and admin list columns for Updates (product_update).
 */
function rf_product_update_meta_box() {
	add_meta_box(
		'rf-update-product',
		'Product',
		'rf_render_product_update_meta_box',
		'product_update',
		'side',
		'high'
	);
}
add_action( 'add_meta_boxes', 'rf_product_update_meta_box' );

/**
 * @param WP_Post $post Update post.
 */
function rf_render_product_update_meta_box( $post ) {
	wp_nonce_field( 'rf_product_update_parent', 'rf_product_update_parent_nonce' );
	$products = get_posts(
		array(
			'post_type'      => 'product',
			'post_status'    => array( 'publish', 'draft', 'pending', 'private' ),
			'posts_per_page' => -1,
			'orderby'        => 'title',
			'order'          => 'ASC',
		)
	);
	$current = (int) $post->post_parent;
	echo '<p><label class="screen-reader-text" for="rf_update_product_id">Product</label>';
	echo '<select class="widefat" id="rf_update_product_id" name="rf_update_product_id">';
	echo '<option value="0">' . esc_html__( 'Select a product…', 'rf-cds' ) . '</option>';
	foreach ( is_array( $products ) ? $products : array() as $product ) {
		if ( ! $product instanceof WP_Post ) {
			continue;
		}
		printf(
			'<option value="%1$d" %2$s>%3$s</option>',
			(int) $product->ID,
			selected( $current, (int) $product->ID, false ),
			esc_html( get_the_title( $product ) )
		);
	}
	echo '</select></p>';
	echo '<p class="description">Associates this update with a product at <code>/products/{slug}/updates/</code>. Put the one-sentence plugin feed summary in the Excerpt box.</p>';
}

/**
 * Save the associated product ID into post_parent on product_update.
 *
 * @param array<string, mixed> $data    Sanitized post data.
 * @param array<string, mixed> $postarr Raw post data.
 * @return array<string, mixed>
 */
function rf_product_update_save_parent( $data, $postarr ) {
	if ( 'product_update' !== ( $data['post_type'] ?? '' ) ) {
		return $data;
	}
	if ( empty( $data['post_author'] ) ) {
		$data['post_author'] = 1;
	}
	if ( ! isset( $_POST['rf_product_update_parent_nonce'] ) ) {
		return $data;
	}
	if ( ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['rf_product_update_parent_nonce'] ) ), 'rf_product_update_parent' ) ) {
		return $data;
	}
	if ( isset( $_POST['rf_update_product_id'] ) ) {
		$parent_id = absint( $_POST['rf_update_product_id'] );
		if ( $parent_id > 0 && 'product' === get_post_type( $parent_id ) ) {
			$data['post_parent'] = $parent_id;
		} else {
			$data['post_parent'] = 0;
		}
	}
	unset( $postarr );
	return $data;
}
add_filter( 'wp_insert_post_data', 'rf_product_update_save_parent', 10, 2 );

/**
 * Add Product column to the Updates admin list table.
 *
 * @param array<string, string> $columns Existing columns.
 * @return array<string, string>
 */
function rf_product_update_columns( $columns ) {
	$next = array();
	foreach ( $columns as $key => $label ) {
		$next[ $key ] = $label;
		if ( 'title' === $key ) {
			$next['rf_product'] = 'Product';
		}
	}
	return $next;
}
add_filter( 'manage_product_update_posts_columns', 'rf_product_update_columns' );

/**
 * Render the Product column cell on the Updates admin list table.
 *
 * @param string $column  Column slug.
 * @param int    $post_id Update post ID.
 */
function rf_product_update_column_content( $column, $post_id ) {
	if ( 'rf_product' !== $column ) {
		return;
	}
	$parent_id = (int) get_post_field( 'post_parent', $post_id );
	if ( $parent_id <= 0 || 'product' !== get_post_type( $parent_id ) ) {
		echo '—';
		return;
	}
	$url = add_query_arg(
		array(
			'post_type'     => 'product_update',
			'rf_product_id' => $parent_id,
		),
		admin_url( 'edit.php' )
	);
	printf( '<a href="%1$s">%2$s</a>', esc_url( $url ), esc_html( get_the_title( $parent_id ) ) );
}
add_action( 'manage_product_update_posts_custom_column', 'rf_product_update_column_content', 10, 2 );

/**
 * Filter dropdown by Product on the Updates admin list table.
 *
 * @param string $post_type Current post type.
 */
function rf_product_update_admin_filter( $post_type ) {
	if ( 'product_update' !== $post_type ) {
		return;
	}
	$products = get_posts(
		array(
			'post_type'      => 'product',
			'post_status'    => array( 'publish', 'draft', 'pending', 'private' ),
			'posts_per_page' => -1,
			'orderby'        => 'title',
			'order'          => 'ASC',
		)
	);
	if ( empty( $products ) ) {
		return;
	}
	$selected = isset( $_GET['rf_product_id'] ) ? absint( $_GET['rf_product_id'] ) : 0; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
	echo '<select name="rf_product_id">';
	echo '<option value="0">' . esc_html__( 'All products', 'rf-cds' ) . '</option>';
	foreach ( $products as $product ) {
		if ( ! $product instanceof WP_Post ) {
			continue;
		}
		printf(
			'<option value="%1$d" %2$s>%3$s</option>',
			(int) $product->ID,
			selected( $selected, (int) $product->ID, false ),
			esc_html( get_the_title( $product ) )
		);
	}
	echo '</select>';
}
add_action( 'restrict_manage_posts', 'rf_product_update_admin_filter' );

/**
 * Apply the Product filter dropdown on the Updates admin list table.
 *
 * @param WP_Query $query Admin query.
 */
function rf_product_update_admin_filter_query( $query ) {
	if ( ! is_admin() || ! $query->is_main_query() || 'product_update' !== $query->get( 'post_type' ) ) {
		return;
	}
	$product_id = isset( $_GET['rf_product_id'] ) ? absint( $_GET['rf_product_id'] ) : 0; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
	if ( $product_id > 0 ) {
		$query->set( 'post_parent', $product_id );
	}
}
add_action( 'parse_query', 'rf_product_update_admin_filter_query' );

/**
 * Copy-citation button on a research study.
 */
function rf_research_copy_script() {
	if ( ! is_singular( 'research' ) ) {
		return;
	}
	wp_register_script( 'rf-research-copy', false, array(), wp_get_theme()->get( 'Version' ), true );
	wp_enqueue_script( 'rf-research-copy' );
	wp_add_inline_script(
		'rf-research-copy',
		'(function(){document.querySelectorAll("[data-rf-copy-target]").forEach(function(button){button.addEventListener("click",function(){var node=document.querySelector(button.getAttribute("data-rf-copy-target"));if(!node||!navigator.clipboard)return;var label=button.textContent;navigator.clipboard.writeText(node.innerText).then(function(){button.textContent="Copied";setTimeout(function(){button.textContent=label;},1600);});});});})();'
	);
}
add_action( 'wp_enqueue_scripts', 'rf_research_copy_script' );

/**
 * Opt-in: use the featured image as the article hero wash.
 * Default is paper-deep, no photo.
 */
function rf_register_hero_featured_meta() {
	register_post_meta(
		'post',
		'rf_hero_featured',
		array(
			'type'              => 'boolean',
			'single'            => true,
			'default'           => false,
			'show_in_rest'      => true,
			'auth_callback'     => static function () {
				return current_user_can( 'edit_posts' );
			},
			'sanitize_callback' => 'rest_sanitize_boolean',
		)
	);
}
add_action( 'init', 'rf_register_hero_featured_meta' );

/**
 * Front-end kit CSS. Skip base.css — theme.json owns element styles.
 */
function rf_site_css_sources() {
	return array(
		'fonts.css',
		'tokens.css',
		'layouts.css',
		'components.css',
		'disclosure.css',
		'elements.css',
		'block-styles.css',
		'site-chrome.css',
	);
}

/**
 * One front-end stylesheet. Relative font and illustration paths stay valid
 * because the bundle lives next to the source files.
 *
 * @return int|false Newest source mtime, or false when a source is missing.
 */
function rf_rebuild_site_css() {
	$dir  = get_theme_file_path( 'assets/css' );
	$dest = $dir . '/rf-site.css';
	$newest = 0;
	$parts  = array();

	foreach ( rf_site_css_sources() as $file ) {
		$path = $dir . '/' . $file;
		if ( ! is_readable( $path ) ) {
			return false;
		}
		$mtime = (int) filemtime( $path );
		if ( $mtime > $newest ) {
			$newest = $mtime;
		}
		$parts[] = trim( (string) file_get_contents( $path ) );
	}

	if ( is_readable( $dest ) && (int) filemtime( $dest ) >= $newest ) {
		return $newest;
	}

	$banner = "/* Roots & Fruit site CSS. Built from the kit files. Do not edit. */\n";
	file_put_contents( $dest, $banner . implode( "\n\n", $parts ) . "\n" );
	return $newest;
}

/**
 * Front-end kit CSS. Skip base.css — theme.json owns element styles.
 */
function rf_enqueue_styles() {
	$version = wp_get_theme()->get( 'Version' );
	$built   = rf_rebuild_site_css();
	$bundle  = get_theme_file_path( 'assets/css/rf-site.css' );
	$ver     = ( $built && is_readable( $bundle ) ) ? (string) filemtime( $bundle ) : $version;

	wp_enqueue_style( 'rf-site', get_theme_file_uri( 'assets/css/rf-site.css' ), array(), $ver );

	wp_register_script( 'rf-avatar', false, array(), $version, true );
	wp_enqueue_script( 'rf-avatar' );
	wp_add_inline_script(
		'rf-avatar',
		'(function(){document.querySelectorAll("img[data-rf-avatar]").forEach(function(img){var url=img.getAttribute("data-rf-avatar");if(!url)return;var probe=new Image();probe.onload=function(){img.src=url;};probe.src=url;});})();'
	);

	wp_register_script( 'rf-book-call', false, array(), $version, true );
	wp_enqueue_script( 'rf-book-call' );
	wp_add_inline_script(
		'rf-book-call',
		'(function(){var open=document.getElementById("book-call");var dialog=document.getElementById("book-call-dialog");if(!open||!dialog||typeof dialog.showModal!=="function")return;var frame=dialog.querySelector("iframe");var src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ3ppbL0MPMX6sWRuqOiZrdPF-VNMCpJUiWb-VU4Fx0stlefldCYrcQzBy_tjhAcWmBMK0grqe5d?gv=true";open.addEventListener("click",function(){if(frame&&!frame.getAttribute("src"))frame.src=src;dialog.showModal();});dialog.addEventListener("click",function(event){if(event.target===dialog||(event.target.closest&&event.target.closest("[data-book-close]")))dialog.close();});})();'
	);

	wp_register_script( 'rf-subscribe', false, array(), $version, true );
	wp_enqueue_script( 'rf-subscribe' );
	wp_add_inline_script(
		'rf-subscribe',
		'(function(){var forms=document.querySelectorAll("form.rf-subscribe");if(!forms.length)return;var widgets=new WeakMap(),scriptRequested=false;function render(){if(!window.turnstile)return;forms.forEach(function(form){var slot=form.querySelector(".rf-subscribe-turnstile");var sitekey=slot&&slot.getAttribute("data-sitekey");if(!slot||!sitekey||widgets.has(form))return;widgets.set(form,window.turnstile.render(slot,{sitekey:sitekey,action:"subscribe"}));});}window.rfSubscribeTurnstileLoad=render;function loadTurnstile(cb){if(window.turnstile){cb();return;}if(!scriptRequested){scriptRequested=true;var script=document.createElement("script");script.src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=rfSubscribeTurnstileLoad&render=explicit";script.async=true;script.defer=true;document.head.appendChild(script);}var tries=0;(function wait(){if(window.turnstile)return cb();if(tries++>80)return;setTimeout(wait,75);})();}forms.forEach(function(form){var slot=form.querySelector(".rf-subscribe-turnstile");if(!slot||!slot.getAttribute("data-sitekey"))return;form.addEventListener("focusin",function(e){if(e.target&&e.target.name==="email")loadTurnstile(render);},{once:true});form.addEventListener("submit",function(event){event.preventDefault();var button=form.querySelector("button");var status=form.querySelector(".rf-subscribe-status");function post(){if(button)button.disabled=true;if(status)status.textContent="";fetch("/api/subscribe",{method:"POST",body:new FormData(form)}).then(function(res){return res.json().then(function(json){return{ok:res.ok,json:json};});}).then(function(result){if(!status)return;if(result.ok&&result.json&&result.json.ok&&result.json.status==="active"){status.textContent="You\'re on the list.";form.reset();return;}if(result.ok&&result.json&&result.json.ok){status.textContent="Check your email and confirm. Then you\'re on the list.";form.reset();return;}status.textContent="That didn\'t go through. Try again in a moment.";}).catch(function(){if(status)status.textContent="That didn\'t go through. Try again in a moment.";}).then(function(){if(button)button.disabled=false;var id=widgets.get(form);if(id!==undefined&&window.turnstile)window.turnstile.reset(id);});}if(!widgets.has(form)){loadTurnstile(function(){render();setTimeout(post,120);});return;}post();});});})();'
	);

	if ( is_home() && ! is_front_page() ) {
		wp_register_script( 'rf-articles-filter', false, array(), $version, true );
		wp_enqueue_script( 'rf-articles-filter' );
		wp_add_inline_script(
			'rf-articles-filter',
			'(function(){var root=document.querySelector(".rf-articles-index");if(!root)return;var buttons=Array.prototype.slice.call(root.querySelectorAll("[data-rf-filter]"));if(!buttons.length)return;var lead=root.querySelector("[data-rf-lead]");var moreHead=root.querySelector("[data-rf-more-head]");var cards=Array.prototype.slice.call(root.querySelectorAll("[data-rf-topic]"));var status=root.querySelector("[data-rf-filter-status]");var total=status?parseInt(status.getAttribute("data-rf-total")||"0",10):cards.length;function apply(slug,updateHash){var activeBtn=null;buttons.forEach(function(btn){var match=btn.getAttribute("data-rf-filter")===slug;btn.classList.toggle("is-active",match);btn.setAttribute("aria-pressed",match?"true":"false");if(match)activeBtn=btn;});if(!activeBtn){slug="all";buttons.forEach(function(btn){var match=btn.getAttribute("data-rf-filter")==="all";btn.classList.toggle("is-active",match);btn.setAttribute("aria-pressed",match?"true":"false");if(match)activeBtn=btn;});}if(slug==="all"){if(lead)lead.hidden=false;if(moreHead)moreHead.hidden=false;cards.forEach(function(card){card.hidden=card.getAttribute("data-rf-lead-mirror")==="true";});if(status)status.textContent=(total===1?"1 essay":total+" essays");}else{if(lead)lead.hidden=true;if(moreHead)moreHead.hidden=true;var shown=0;cards.forEach(function(card){var match=card.getAttribute("data-rf-topic")===slug;card.hidden=!match;if(match)shown++;});if(status){var label=activeBtn?activeBtn.getAttribute("data-rf-label")||slug:slug;status.textContent=shown+(shown===1?" essay":" essays")+" in "+label;}}if(updateHash&&window.history&&typeof window.history.replaceState==="function"){var next=slug==="all"?window.location.pathname+window.location.search:window.location.pathname+window.location.search+"#topic="+encodeURIComponent(slug);window.history.replaceState(null,"",next);}}buttons.forEach(function(btn){btn.addEventListener("click",function(){apply(btn.getAttribute("data-rf-filter")||"all",true);});});var hashMatch=(window.location.hash||"").match(/^#topic=([a-z0-9-]+)$/i);if(hashMatch)apply(decodeURIComponent(hashMatch[1]).toLowerCase(),false);})();'
		);
	}
}
add_action( 'wp_enqueue_scripts', 'rf_enqueue_styles' );

/**
 * Open a native .rf-dialog from [data-rf-dialog-open]. Escape closes it.
 * The support form posts to /api/contact after Turnstile.
 */
function rf_dialog_script() {
	echo '<script>(function(){var buttons=document.querySelectorAll("[data-rf-dialog-open]");buttons.forEach(function(btn){btn.addEventListener("click",function(event){var dialog=document.getElementById(btn.getAttribute("data-rf-dialog-open"));if(!dialog||typeof dialog.showModal!=="function")return;event.preventDefault();if(!dialog.open)dialog.showModal();});});document.querySelectorAll("dialog.rf-dialog").forEach(function(dialog){dialog.addEventListener("click",function(event){if(event.target===dialog||(event.target.closest&&event.target.closest("[data-rf-dialog-close]")))dialog.close();});dialog.addEventListener("close",function(){var opener=document.querySelector("[data-rf-dialog-open=\""+dialog.id+"\"]");if(opener)opener.focus();});});var form=document.getElementById("rf-support-form");if(!form)return;var widget,scriptRequested=false;function render(){if(!window.turnstile||widget!==undefined)return;var slot=form.querySelector(".rf-support-turnstile");var sitekey=slot&&slot.getAttribute("data-sitekey");if(!slot||!sitekey)return;widget=window.turnstile.render(slot,{sitekey:sitekey,action:"contact"});}function loadTurnstile(cb){if(window.turnstile){cb();return;}if(!scriptRequested){scriptRequested=true;var script=document.createElement("script");script.src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";script.async=true;script.defer=true;document.head.appendChild(script);}var tries=0;(function wait(){if(window.turnstile)return cb();if(tries++>80)return;setTimeout(wait,75);})();}form.addEventListener("focusin",function(e){if(e.target&&e.target.name==="email")loadTurnstile(render);});form.addEventListener("submit",function(event){event.preventDefault();var button=form.querySelector("button[type=submit]");var status=form.querySelector(".rf-support-status");function post(){if(button)button.disabled=true;if(status)status.textContent="";fetch("/api/contact",{method:"POST",body:new FormData(form)}).then(function(res){return res.json().then(function(json){return{ok:res.ok,json:json};});}).then(function(result){if(!status)return;if(result.ok&&result.json&&result.json.ok){status.textContent="Sent. I will write back to that email.";form.reset();return;}status.textContent="That didn\'t go through. Try again in a moment.";}).catch(function(){if(status)status.textContent="That didn\'t go through. Try again in a moment.";}).then(function(){if(button)button.disabled=false;if(widget!==undefined&&window.turnstile)window.turnstile.reset(widget);});}if(widget===undefined){loadTurnstile(function(){render();setTimeout(post,120);});return;}post();});})();</script>';
}
add_action( 'wp_footer', 'rf_dialog_script' );

/**
 * Product screenshots open in the gallery dialog at the file's own size.
 */
function rf_shot_dialog() {
	if ( ! is_singular( 'product' ) ) {
		return;
	}

	$post = get_post();
	if ( ! $post || ! str_contains( (string) $post->post_content, 'is-style-rf-shot' ) ) {
		return;
	}

	echo '<dialog class="rf-gallery__dialog rf-edge--thick" id="rf-shot-dialog" aria-label="' . esc_attr__( 'Screenshot', 'rf' ) . '">';
	echo '<div class="rf-gallery__dialog-stage"><div class="rf-gallery__dialog-scroll"><img alt=""></div></div>';
	echo '<div class="rf-gallery__dialog-foot">';
	echo '<p class="rf-gallery__dialog-caption"></p>';
	echo '<button type="button" class="rf-gallery__close" data-shot-close>';
	echo '<svg class="rf-gallery__close-icon" viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><circle cx="10" cy="10" r="7.25" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M7.2 7.2 12.8 12.8M12.8 7.2 7.2 12.8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
	echo esc_html__( 'Close', 'rf' );
	echo '</button></div></dialog>';
	echo '<script>(function(){var buttons=Array.prototype.slice.call(document.querySelectorAll(".is-style-rf-shot"));var dialog=document.getElementById("rf-shot-dialog");if(!buttons.length||!dialog||typeof dialog.showModal!=="function")return;var img=dialog.querySelector("img");var cap=dialog.querySelector(".rf-gallery__dialog-caption");var foot=dialog.querySelector(".rf-gallery__dialog-foot");var opener=null;var closing=false;var reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;var growMs=680;var ease="cubic-bezier(0.22, 1, 0.36, 1)";function sourceImg(){return opener?opener.querySelector("img"):null;}function fill(i){var source=buttons[i].querySelector("img");if(!source)return;img.src=source.currentSrc||source.src;img.alt=source.alt||"";img.width=source.width||"";img.height=source.height||"";if(cap)cap.textContent=source.alt||"";dialog.setAttribute("aria-label",source.alt||"Screenshot");}function shift(from,to){return{x:(from.left+from.width/2)-(to.left+to.width/2),y:(from.top+from.height/2)-(to.top+to.height/2),s:Math.max(from.width/to.width,0.08)};}function play(el,frames,ms,delay){if(!el||reduce)return null;return el.animate(frames,{duration:ms,delay:delay||0,easing:ease,fill:"both"});}function clearMotion(){dialog.getAnimations().forEach(function(a){a.cancel();});if(foot)foot.getAnimations().forEach(function(a){a.cancel();});}function grow(source){clearMotion();closing=false;dialog.showModal();if(reduce||!source)return;var from=source.getBoundingClientRect();var to=dialog.getBoundingClientRect();if(!to.width||!from.width)return;var d=shift(from,to);play(dialog,[{transform:"translate("+d.x+"px,"+d.y+"px) scale("+d.s+")",borderWidth:"0px"},{transform:"none",borderWidth:"6px"}],growMs);play(foot,[{opacity:0},{opacity:1}],growMs,160);if(!reduce)dialog.animate([{opacity:0},{opacity:1}],{duration:growMs,easing:ease,fill:"both",pseudoElement:"::backdrop"});}function shrink(){if(closing||!dialog.open)return;if(reduce){dialog.close();return;}closing=true;clearMotion();var shot=sourceImg();var from=dialog.getBoundingClientRect();var to=shot?shot.getBoundingClientRect():null;var anim=null;if(to&&to.width&&from.width){var d=shift(to,from);anim=play(dialog,[{transform:"none",borderWidth:"6px"},{transform:"translate("+d.x+"px,"+d.y+"px) scale("+d.s+")",borderWidth:"0px"}],520);}play(foot,[{opacity:1},{opacity:0}],280);if(!reduce)dialog.animate([{opacity:1},{opacity:0}],{duration:520,easing:ease,fill:"both",pseudoElement:"::backdrop"});var done=function(){clearMotion();closing=false;dialog.close();};if(anim)anim.onfinish=done;else done();}buttons.forEach(function(btn,i){btn.setAttribute("tabindex","0");btn.setAttribute("role","button");btn.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();btn.click();}});btn.addEventListener("click",function(){opener=btn;fill(i);grow(btn.querySelector("img")||btn);});});dialog.addEventListener("click",function(event){if(event.target===dialog||(event.target.closest&&event.target.closest("[data-shot-close]")))shrink();});dialog.addEventListener("cancel",function(event){event.preventDefault();shrink();});dialog.addEventListener("close",function(){closing=false;if(opener)opener.focus();});})();</script>';
}
add_action( 'wp_footer', 'rf_shot_dialog' );

/**
 * Circle control just outside the left edge of a long article or doc.
 */
function rf_back_to_top() {
	if ( ! is_singular( array( 'post', 'hydrodoc' ) ) ) {
		return;
	}

	echo '<div id="rf-page-top"></div>';
	echo '<a class="rf-back-top" href="#rf-page-top">';
	echo '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
	echo '<span class="screen-reader-text">' . esc_html__( 'Back to top', 'rf' ) . '</span>';
	echo '</a>';
	echo '<script>(function(){var link=document.querySelector(".rf-back-top");if(!link)return;var toggle=function(){link.classList.toggle("is-visible",window.scrollY>480);};toggle();window.addEventListener("scroll",toggle,{passive:true});})();</script>';
}
add_action( 'wp_body_open', 'rf_back_to_top' );

/**
 * Let CSS size the Site Logo. Core prints width/height attributes (and
 * sometimes an inline width) which would otherwise need !important to beat.
 */
function rf_logo_image_attributes( $attr ) {
	unset( $attr['width'], $attr['height'], $attr['style'] );
	return $attr;
}
add_filter( 'get_custom_logo_image_attributes', 'rf_logo_image_attributes' );

/**
 * Load compiler identity defaults (brand.json → brand-defaults.json).
 *
 * @return array{name:string,tagline:string,mark:string}|null
 */
function rf_brand_defaults() {
	$path = get_theme_file_path( 'brand-defaults.json' );
	if ( ! is_readable( $path ) ) {
		return null;
	}
	$data = json_decode( (string) file_get_contents( $path ), true );
	if ( empty( $data['name'] ) || ! is_string( $data['name'] ) ) {
		return null;
	}
	return array(
		'name'    => $data['name'],
		'tagline' => isset( $data['tagline'] ) ? (string) $data['tagline'] : '',
		'mark'    => isset( $data['mark'] ) ? (string) $data['mark'] : 'assets/mark.svg',
	);
}

/**
 * Seed Site Title and Tagline from the kit defaults.
 *
 * First run (or theme switch): always apply. Later compiles: only if WP still
 * holds the last seeded name, so a hand-edited identity is left alone.
 */
function rf_seed_site_identity() {
	$defaults = rf_brand_defaults();
	if ( ! $defaults ) {
		return;
	}

	$hash     = md5( $defaults['name'] . "\n" . $defaults['tagline'] );
	$stored   = get_option( 'rf_identity_hash' );
	$owned    = get_option( 'rf_identity_seed_name' );
	$blogname = (string) get_option( 'blogname' );

	if ( $stored === $hash ) {
		return;
	}

	$unseeded = ( false === $owned || '' === $owned );
	$still_ours = ( $owned && $blogname === $owned );
	if ( $unseeded || $still_ours ) {
		update_option( 'blogname', $defaults['name'] );
		update_option( 'blogdescription', $defaults['tagline'] );
		update_option( 'rf_identity_seed_name', $defaults['name'] );
	}

	update_option( 'rf_identity_hash', $hash );
}
add_action( 'after_switch_theme', 'rf_seed_site_identity' );
add_action( 'init', 'rf_seed_site_identity', 5 );

/**
 * If Core has no Site Logo, use the R&F fallback mark shipped in the theme.
 *
 * @param string $html  Block HTML.
 * @return string
 */
function rf_render_site_logo_fallback( $html ) {
	if ( is_string( $html ) && preg_match( '/<img\s/i', $html ) ) {
		$html = str_replace(
			array( ' fetchpriority="high"', " fetchpriority='high'" ),
			'',
			$html
		);

		$logo_id = (int) get_theme_mod( 'custom_logo' );
		if ( $logo_id > 0 ) {
			$image = wp_get_attachment_image(
				$logo_id,
				'medium',
				false,
				array(
					'class'    => 'custom-logo',
					'decoding' => 'async',
				)
			);
			if ( is_string( $image ) && '' !== $image ) {
				$with_sized_logo = preg_replace( '/<img[^>]*>/', $image, $html, 1 );
				if ( is_string( $with_sized_logo ) && '' !== $with_sized_logo ) {
					return $with_sized_logo;
				}
			}
		}

		return $html;
	}

	$defaults = rf_brand_defaults();
	$rel      = $defaults && ! empty( $defaults['mark'] ) ? $defaults['mark'] : 'assets/mark.svg';
	$path     = get_theme_file_path( $rel );
	if ( ! is_readable( $path ) ) {
		return $html;
	}

	$url  = get_theme_file_uri( $rel );
	$name = get_bloginfo( 'name' );
	return sprintf(
		'<div class="wp-block-site-logo"><a href="%s" class="custom-logo-link" rel="home"><img src="%s" class="custom-logo" alt="%s" /></a></div>',
		esc_url( home_url( '/' ) ),
		esc_url( $url ),
		esc_attr( $name )
	);
}
add_filter( 'render_block_core/site-logo', 'rf_render_site_logo_fallback' );

/**
 * Intrinsic width/height for theme assets and common embeds (CLS).
 *
 * @param string $url Image URL.
 * @return array{0:int,1:int}|null
 */
function rf_intrinsic_image_size_for_url( $url ) {
	if ( ! is_string( $url ) || '' === $url ) {
		return null;
	}

	$url = html_entity_decode( $url, ENT_QUOTES | ENT_HTML5, 'UTF-8' );

	if ( str_starts_with( $url, 'data:image/png;base64,' ) ) {
		$binary = base64_decode( substr( $url, 22 ), true );
		if ( is_string( $binary ) && strlen( $binary ) >= 24 && str_starts_with( $binary, "\x89PNG\r\n\x1a\n" ) ) {
			$width  = unpack( 'N', substr( $binary, 16, 4 ) );
			$height = unpack( 'N', substr( $binary, 20, 4 ) );
			if ( is_array( $width ) && is_array( $height ) ) {
				return array( (int) $width[1], (int) $height[1] );
			}
		}
	}

	$needles = array(
		'assets/articles/one-star.png'              => array( 1080, 1080 ),
		'assets/articles/five-star.png'             => array( 1080, 1080 ),
		'assets/articles/write-cursor-skills-1680.png' => array( 1680, 882 ),
		'assets/illustrations/roots-1.svg'        => array( 1536, 1024 ),
		'R&F_Icon_1000px.svg'                       => array( 1000, 1000 ),
		'banner-772x250.jpg'                        => array( 772, 250 ),
	);

	foreach ( $needles as $needle => $size ) {
		if ( str_contains( $url, $needle ) ) {
			return $size;
		}
	}

	if ( str_contains( $url, 'avatars.githubusercontent.com' ) ) {
		return array( 40, 40 );
	}

	if ( str_contains( $url, '/wp-content/themes/rf/assets/' ) ) {
		$path = wp_parse_url( $url, PHP_URL_PATH );
		if ( is_string( $path ) && preg_match( '#/wp-content/themes/rf/(.+)$#', $path, $m ) ) {
			$file = get_theme_file_path( $m[1] );
			if ( is_readable( $file ) ) {
				$info = wp_getimagesize( $file );
				if ( is_array( $info ) ) {
					return array( (int) $info[0], (int) $info[1] );
				}
			}
		}
	}

	return null;
}

/**
 * Add width/height (and a smaller src for the cursor-skills hero art).
 *
 * @param string       $filtered_image Rendered img tag.
 * @param string       $context        Context passed by Core.
 * @param int|string   $attachment_id  Attachment ID when known.
 * @return string
 */
function rf_content_img_tag_dimensions( $filtered_image, $context, $attachment_id ) {
	if ( ! is_string( $filtered_image ) || ! preg_match( '/<img\b/i', $filtered_image ) ) {
		return $filtered_image;
	}

	$has_width  = (bool) preg_match( '/\bwidth=["\']?\d+/i', $filtered_image );
	$has_height = (bool) preg_match( '/\bheight=["\']?\d+/i', $filtered_image );
	if ( $has_width && $has_height ) {
		return $filtered_image;
	}

	$src = '';
	if ( preg_match( '/\bsrc=["\']([^"\']+)["\']/i', $filtered_image, $match ) ) {
		$src = $match[1];
	}

	if ( $src && str_contains( $src, 'write-cursor-skills.png' ) && ! str_contains( $src, 'write-cursor-skills-1680' ) ) {
		$small = get_theme_file_uri( 'assets/articles/write-cursor-skills-1680.png' );
		$large = get_theme_file_uri( 'assets/articles/write-cursor-skills.png' );
		$filtered_image = str_replace( $src, esc_url( $small ), $filtered_image );
		$src            = $small;
		if ( ! preg_match( '/\bsrcset=/i', $filtered_image ) ) {
			$srcset = esc_attr( $small . ' 1680w, ' . $large . ' 2400w' );
			$filtered_image = preg_replace(
				'/<img\b/i',
				'<img srcset="' . $srcset . '" sizes="(min-width: 840px) 840px, 100vw"',
				$filtered_image,
				1
			);
		}
	}

	$size = null;
	$attachment_id = (int) $attachment_id;
	if ( $attachment_id > 0 ) {
		$meta = wp_get_attachment_metadata( $attachment_id );
		if ( is_array( $meta ) && ! empty( $meta['width'] ) && ! empty( $meta['height'] ) ) {
			$size = array( (int) $meta['width'], (int) $meta['height'] );
		}
	}
	if ( ! $size && $src ) {
		$size = rf_intrinsic_image_size_for_url( $src );
	}
	if ( ! $size ) {
		return $filtered_image;
	}

	list( $width, $height ) = $size;
	if ( ! $has_width ) {
		$filtered_image = preg_replace( '/<img\b/i', '<img width="' . $width . '"', $filtered_image, 1 );
	}
	if ( ! $has_height ) {
		$filtered_image = preg_replace( '/<img\b/i', '<img height="' . $height . '"', $filtered_image, 1 );
	}

	return $filtered_image;
}
add_filter( 'wp_content_img_tag', 'rf_content_img_tag_dimensions', 10, 3 );

/**
 * The static site has no search. Drop the SearchAction Slim SEO adds to every page.
 *
 * @param bool $enabled Whether the schema entity is active.
 * @return bool
 */
function rf_disable_search_action_schema( $enabled ) {
	return false;
}
add_filter( 'slim_seo_schema_searchaction_enable', 'rf_disable_search_action_schema' );

/**
 * Author archives are excluded from the static export. Send those links to About Matt.
 *
 * @param string $link Author archive URL.
 * @return string
 */
function rf_author_link_to_about( $link ) {
	return home_url( '/about-matt/' );
}
add_filter( 'author_link', 'rf_author_link_to_about' );

/**
 * About Matt is a person page. Name the same profiles already linked in the copy.
 *
 * @param array $graph Schema graph.
 * @return array
 */
function rf_about_person_schema( $graph ) {
	if ( ! is_page( 'about-matt' ) ) {
		return $graph;
	}

	$graph[] = array(
		'@type'  => 'Person',
		'@id'    => home_url( '/about-matt/#matt' ),
		'name'   => 'Matt Cromwell',
		'url'    => home_url( '/about-matt/' ),
		'sameAs' => array(
			'https://mattcromwell.com/',
			'https://de.linkedin.com/in/mattcromwell',
			'https://profiles.wordpress.org/webdevmattcrom/',
			'https://x.com/learnwithmattc',
			'https://wpproducttalk.com/',
		),
	);

	return $graph;
}
add_filter( 'slim_seo_schema_graph', 'rf_about_person_schema' );

/**
 * Recipe category + button / Group styles.
 */
function rf_register_block_styles() {
	register_block_pattern_category(
		'rf',
		array( 'label' => __( 'Roots & Fruit sections', 'rf-cds' ) )
	);

	register_block_style(
		'core/code',
		array(
			'name'  => 'rf-code',
			'label' => __( 'Window', 'rf-cds' ),
		)
	);

	register_block_style(
		'core/image',
		array(
			'name'  => 'rf-shot',
			'label' => __( 'Screenshot', 'rf-cds' ),
		)
	);

	register_block_style(
		'core/details',
		array(
			'name'  => 'rf-disclosure',
			'label' => __( 'Disclosure', 'rf-cds' ),
		)
	);
}
add_action( 'init', 'rf_register_block_styles', 5 );

/**
 * FAQPage JSON-LD from Disclosure-styled details blocks.
 */
function rf_product_faq_schema() {
	if ( ! is_singular( 'product' ) ) {
		return;
	}

	$post = get_post();
	if ( ! $post ) {
		return;
	}

	$entities = array();
	$walk     = function ( $blocks ) use ( &$walk, &$entities ) {
		foreach ( $blocks as $block ) {
			if ( ! is_array( $block ) ) {
				continue;
			}
			$name  = $block['blockName'] ?? '';
			$class = (string) ( $block['attrs']['className'] ?? '' );
			if ( 'core/details' === $name && str_contains( $class, 'is-style-rf-disclosure' ) ) {
				$question = trim( wp_strip_all_tags( (string) ( $block['attrs']['summary'] ?? '' ) ) );
				$answer   = '';
				foreach ( $block['innerBlocks'] as $inner ) {
					$answer .= ' ' . trim( wp_strip_all_tags( (string) ( $inner['innerHTML'] ?? '' ) ) );
				}
				$answer = trim( $answer );
				if ( '' !== $question && '' !== $answer ) {
					$entities[] = array(
						'@type'          => 'Question',
						'name'           => $question,
						'acceptedAnswer' => array(
							'@type' => 'Answer',
							'text'  => $answer,
						),
					);
				}
			}
			if ( ! empty( $block['innerBlocks'] ) ) {
				$walk( $block['innerBlocks'] );
			}
		}
	};
	$walk( parse_blocks( $post->post_content ) );
	if ( array() === $entities ) {
		return;
	}

	$graph = array(
		'@context'   => 'https://schema.org',
		'@type'      => 'FAQPage',
		'mainEntity' => $entities,
	);
	echo '<script type="application/ld+json">' . wp_json_encode( $graph, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) . "</script>\n";
}
add_action( 'wp_head', 'rf_product_faq_schema' );

/**
 * New pages start with the Page hero pattern. Existing pages are unchanged.
 *
 * @param string  $content Default post content.
 * @param WP_Post $post    Post being created.
 */
function rf_default_page_content( $content, $post ) {
	if ( ! $post instanceof WP_Post || 'page' !== $post->post_type ) {
		return $content;
	}
	if ( '' !== trim( (string) $content ) ) {
		return $content;
	}
	$path = get_theme_file_path( 'patterns/page-hero.php' );
	if ( ! is_readable( $path ) ) {
		return $content;
	}
	$markup = strstr( (string) file_get_contents( $path ), '<!--' );
	return is_string( $markup ) ? trim( $markup ) : $content;
}
add_filter( 'default_content', 'rf_default_page_content', 10, 2 );

/**
 * Feed design-tokens.json to the unpublished / MU-plugin registry.
 */
function rf_register_design_tokens() {
	if ( ! function_exists( 'register_design_token' ) ) {
		return;
	}

	$path = get_theme_file_path( 'design-tokens.json' );
	if ( ! is_readable( $path ) ) {
		return;
	}

	$data = json_decode( (string) file_get_contents( $path ), true );
	if ( empty( $data['tokens'] ) || ! is_array( $data['tokens'] ) ) {
		return;
	}

	foreach ( $data['tokens'] as $token ) {
		if ( empty( $token['id'] ) || empty( $token['label'] ) || empty( $token['type'] ) ) {
			continue;
		}

		register_design_token(
			$token['id'],
			array(
				'label'   => $token['label'],
				'type'    => $token['type'],
				'default' => isset( $token['default'] ) ? $token['default'] : '',
				'scope'   => isset( $token['scope'] ) ? $token['scope'] : 'global',
			)
		);
	}
}
add_action( 'init', 'rf_register_design_tokens', 20 );

/**
 * One showcase nav node as a Core navigation-link or navigation-submenu.
 *
 * A page or post uses `id`. A public archive uses `archive` (post type name).
 *
 * @param array $item { label, id?: int, archive?: string, children?: array }.
 * @return string Block markup, or empty if the target is missing.
 */
function rf_navigation_item_markup( $item ) {
	if ( empty( $item['label'] ) ) {
		return '';
	}

	if ( ! empty( $item['archive'] ) && is_string( $item['archive'] ) ) {
		$archive = get_post_type_archive_link( $item['archive'] );
		if ( ! is_string( $archive ) || '' === $archive ) {
			return '';
		}
		$attrs = wp_json_encode(
			array(
				'label' => $item['label'],
				'url'   => $archive,
				'kind'  => 'custom',
			)
		);
	} else {
		if ( empty( $item['id'] ) ) {
			return '';
		}
		$id   = (int) $item['id'];
		$post = get_post( $id );
		if ( ! $post || 'publish' !== $post->post_status ) {
			return '';
		}
		$type = get_post_type( $id );
		if ( ! in_array( $type, array( 'page', 'post' ), true ) ) {
			return '';
		}

		$attrs = wp_json_encode(
			array(
				'label' => $item['label'],
				'type'  => $type,
				'id'    => $id,
				'url'   => get_permalink( $id ),
				'kind'  => 'post-type',
			)
		);
	}

	$inner = '';
	if ( ! empty( $item['children'] ) && is_array( $item['children'] ) ) {
		foreach ( $item['children'] as $child ) {
			$inner .= rf_navigation_item_markup( $child );
		}
	}

	if ( '' !== $inner ) {
		return sprintf(
			"<!-- wp:navigation-submenu %s -->\n%s<!-- /wp:navigation-submenu -->\n",
			$attrs,
			$inner
		);
	}

	return sprintf( "<!-- wp:navigation-link %s /-->\n", $attrs );
}

/**
 * Header Navigation is empty in the template so this fallback can own the walk.
 * Probe seed writes rf_showcase_nav (nested). Until then, Core's page-list fallback stays.
 *
 * @param array|null $fallback Parsed fallback blocks.
 * @return array|null
 */
function rf_navigation_showcase_fallback( $fallback ) {
	$pages = get_option( 'rf_showcase_nav' );
	if ( ! is_array( $pages ) || empty( $pages ) ) {
		return $fallback;
	}

	$markup = '';
	foreach ( $pages as $item ) {
		$markup .= rf_navigation_item_markup( $item );
	}

	if ( '' === $markup ) {
		return $fallback;
	}

	$parsed = parse_blocks( $markup );
	$parsed = array_values(
		array_filter(
			$parsed,
			static function ( $block ) {
				return ! empty( $block['blockName'] );
			}
		)
	);

	return $parsed;
}
add_filter( 'block_core_navigation_render_fallback', 'rf_navigation_showcase_fallback' );

/**
 * Missing Gravatars 404 instead of showing the mystery-person default.
 *
 * @param array $args Avatar data.
 * @return array
 */
function rf_avatar_default_404( $args ) {
	$args['default'] = '404';
	return $args;
}
add_filter( 'pre_get_avatar_data', 'rf_avatar_default_404' );

/**
 * Print the R&F fallback mark first. Same-origin uploads stay as-is.
 * A remote URL (Gravatar) is probed in the browser; if it loads, it replaces the mark.
 *
 * @param string $avatar      HTML img.
 * @param mixed  $id_or_email Unused.
 * @param int    $size        Unused.
 * @param string $default     Unused.
 * @param string $alt         Unused.
 * @param array  $args        Avatar args; url is the resolved src.
 * @return string
 */
function rf_avatar_placeholder_html( $avatar, $id_or_email, $size, $default, $alt, $args ) {
	unset( $id_or_email, $size, $default, $alt );
	if ( ! is_string( $avatar ) || ! str_contains( $avatar, '<img' ) ) {
		return $avatar;
	}
	$mark   = get_theme_file_uri( 'assets/mark.svg' );
	$remote = isset( $args['url'] ) ? (string) $args['url'] : '';
	if ( $remote === '' || str_contains( $remote, $mark ) ) {
		return $avatar;
	}
	$home_host   = wp_parse_url( home_url(), PHP_URL_HOST );
	$remote_host = wp_parse_url( $remote, PHP_URL_HOST );
	if ( $home_host && $remote_host && strcasecmp( (string) $home_host, (string) $remote_host ) === 0 ) {
		return $avatar;
	}
	$avatar = preg_replace( '/\s+srcset=("|\')(.*?)\\1/i', '', $avatar );
	$avatar = preg_replace( '/\s+sizes=("|\')(.*?)\\1/i', '', $avatar );
	$avatar = preg_replace(
		'/src=("|\')(.*?)\\1/i',
		'src=$1' . esc_url( $mark ) . '$1 data-rf-avatar=$1' . esc_url( $remote ) . '$1',
		$avatar,
		1
	);
	return $avatar;
}
add_filter( 'get_avatar', 'rf_avatar_placeholder_html', 10, 6 );

/**
 * Core query-title is empty on the Posts page (`is_home()` is not an archive).
 * Use the Posts page title so the template does not hardcode "Articles".
 *
 * @param string $content Rendered block HTML.
 * @param array  $block   Parsed block.
 * @return string
 */
function rf_query_title_posts_page( $content, $block ) {
	if ( ( $block['blockName'] ?? '' ) !== 'core/query-title' ) {
		return $content;
	}
	if ( ! is_home() || is_front_page() ) {
		return $content;
	}
	$page_id = (int) get_option( 'page_for_posts' );
	if ( $page_id < 1 ) {
		return $content;
	}
	$title = get_the_title( $page_id );
	if ( $title === '' ) {
		return $content;
	}
	$level = isset( $block['attrs']['level'] ) ? (int) $block['attrs']['level'] : 1;
	if ( $level < 1 || $level > 6 ) {
		$level = 1;
	}
	$tag     = 'h' . $level;
	$classes = array( 'wp-block-query-title' );
	$extra   = $block['attrs']['className'] ?? '';
	if ( is_string( $extra ) ) {
		foreach ( preg_split( '/\s+/', trim( $extra ) ) as $token ) {
			$clean = sanitize_html_class( $token );
			if ( '' !== $clean ) {
				$classes[] = $clean;
			}
		}
	}
	return sprintf(
		'<%1$s class="%2$s">%3$s</%1$s>',
		$tag,
		esc_attr( implode( ' ', $classes ) ),
		esc_html( $title )
	);
}
add_filter( 'render_block', 'rf_query_title_posts_page', 10, 2 );

/**
 * The articles index shows the category as a pill, not a link.
 * Category archives are excluded from the static export.
 *
 * @param string $content Rendered block HTML.
 * @param array  $block   Parsed block.
 * @return string
 */
function rf_articles_category_pill( $content, $block ) {
	if ( ( $block['blockName'] ?? '' ) !== 'core/post-terms' ) {
		return $content;
	}
	if ( ( $block['attrs']['term'] ?? '' ) !== 'category' ) {
		return $content;
	}
	$on_index = is_home() && ! is_front_page();
	$on_essay = is_singular( 'post' );
	if ( ! $on_index && ! $on_essay ) {
		return $content;
	}
	$text = html_entity_decode( trim( wp_strip_all_tags( $content ) ), ENT_QUOTES | ENT_HTML5, 'UTF-8' );
	if ( $text === '' ) {
		return '';
	}
	if ( strcasecmp( $text, 'Uncategorized' ) === 0 ) {
		$text = 'Essay';
	}
	if ( $on_essay ) {
		return '<span class="rf-meta">' . esc_html( $text ) . '</span>';
	}
	return '<span class="pill pill--green">' . esc_html( $text ) . '</span>';
}
add_filter( 'render_block', 'rf_articles_category_pill', 10, 2 );

/**
 * Load all published essays on the Articles index so client-side topic filtering sees the full archive.
 *
 * @param WP_Query $query Main query.
 */
function rf_articles_index_query( $query ) {
	if ( is_admin() || ! $query->is_main_query() ) {
		return;
	}
	if ( $query->is_home() && ! $query->is_front_page() ) {
		$query->set( 'posts_per_page', 50 );
	}
}
add_action( 'pre_get_posts', 'rf_articles_index_query' );

/**
 * Register the Articles archive dynamic block used in templates/home.html.
 */
function rf_register_articles_index_block() {
	register_block_type(
		'rf/articles-index',
		array(
			'api_version'     => 3,
			'title'           => __( 'Articles archive', 'rf-cds' ),
			'render_callback' => 'rf_render_articles_index',
			'supports'        => array(
				'inserter' => false,
				'html'     => false,
			),
		)
	);
}
add_action( 'init', 'rf_register_articles_index_block' );

/**
 * Verified outline icons from Supericons for the Articles archive.
 *
 * @param string $name  Icon key.
 * @param string $class Optional SVG class attribute.
 * @return string
 */
function rf_article_svg_icon( $name, $class = '' ) {
	$cls = '' !== $class ? ' class="' . esc_attr( $class ) . '"' : '';
	switch ( $name ) {
		case 'sparkles':
			return '<svg' . $cls . ' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/></svg>';
		case 'clock':
			return '<svg' . $cls . ' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"/><path d="M12 7v5l3 3"/></svg>';
		case 'layers':
			return '<svg' . $cls . ' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/></svg>';
		case 'compass':
			return '<svg' . $cls . ' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"/></svg>';
		case 'terminal-agent':
			return '<svg' . $cls . ' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="4.5" width="18" height="15" rx="2"/><path d="M6.5 9.5l3.2 2.7-3.2 2.7M11.5 15.5H16"/><path d="M17.2 7.2l.5 1.2 1.2.5-1.2.5-.5 1.2-.5-1.2-1.2-.5 1.2-.5z" fill="currentColor" stroke="none"/></svg>';
		case 'agent-face':
			return '<svg' . $cls . ' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="4.5" y="7" width="15" height="11" rx="3.5"/><path d="M12 7V4.5"/><circle cx="12" cy="3.4" r="1" fill="currentColor" stroke="none"/><path d="M9 11.5v2M15 11.5v2M9.5 16h5"/></svg>';
		case 'workflow':
			return '<svg' . $cls . ' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/></svg>';
		case 'blocks':
			return '<svg' . $cls . ' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M10 22V7a1 1 0 0 0-1-1H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a1 1 0 0 0-1-1H2"/><rect x="14" y="2" width="8" height="8" rx="1"/></svg>';
		case 'circle-star':
			return '<svg' . $cls . ' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10"/><path d="M11.051 7.616a1 1 0 0 1 1.909.024l.737 1.452a1 1 0 0 0 .737.535l1.634.256a1 1 0 0 1 .588 1.806l-1.172 1.168a1 1 0 0 0-.282.866l.259 1.613a1 1 0 0 1-1.541 1.134l-1.465-.75a1 1 0 0 0-.912 0l-1.465.75a1 1 0 0 1-1.539-1.133l.258-1.613a1 1 0 0 0-.282-.867l-1.156-1.152a1 1 0 0 1 .572-1.822l1.633-.256a1 1 0 0 0 .737-.535z"/></svg>';
		case 'microphone':
			return '<svg' . $cls . ' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M9 5a3 3 0 0 1 3 -3a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3a3 3 0 0 1 -3 -3l0 -5"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M8 21l8 0"/><path d="M12 17l0 4"/></svg>';
		case 'growth':
			return '<svg' . $cls . ' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M16.5 15a4.5 4.5 0 0 0 -4.5 4.5m4.5 -8.5a4.5 4.5 0 0 0 -4.5 4.5m4.5 -8.5a4.5 4.5 0 0 0 -4.5 4.5m-4 3.5c2.21 0 4 2.015 4 4.5m-4 -8.5c2.21 0 4 2.015 4 4.5m-4 -8.5c2.21 0 4 2.015 4 4.5m0 -7.5v6"/></svg>';
		case 'newspaper':
			return '<svg' . $cls . ' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M15 18h-5"/><path d="M18 14h-8"/><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0v-9a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="10" y="6" rx="1"/></svg>';
		case 'arrow-right':
			return '<svg' . $cls . ' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
		case 'leaf-caret':
			return '<svg' . $cls . ' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 32" width="15" height="14" aria-hidden="true" focusable="false"><path fill="var(--rf-green-1)" d="M6 5L30 16L6 16Z"/><path fill="var(--rf-green-2)" d="M6 16L30 16L6 27Z"/><path fill="none" stroke="var(--rf-brown)" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round" d="M6 5L30 16L6 27Z"/></svg>';
		case 'book-open':
		default:
			return '<svg' . $cls . ' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>';
	}
}

/**
 * Resolve topic label, slug, icon, tile tone, and pill class for a post.
 *
 * @param int $post_id Post ID.
 * @return array{slug:string,label:string,icon:string,tone:string,pill:string,order:int}
 */
function rf_article_topic_meta( $post_id ) {
	$terms = get_the_category( $post_id );
	$slug  = 'essay';
	$label = 'Essay';

	if ( is_array( $terms ) && ! empty( $terms[0] ) && $terms[0] instanceof WP_Term ) {
		$raw_slug  = sanitize_title( $terms[0]->slug );
		$raw_label = trim( html_entity_decode( $terms[0]->name, ENT_QUOTES | ENT_HTML5, 'UTF-8' ) );
		if ( '' !== $raw_slug && 'uncategorized' !== $raw_slug && '' !== $raw_label ) {
			$slug  = $raw_slug;
			$label = $raw_label;
		}
	}

	if ( in_array( $slug, array( 'product-strategy', 'strategy', 'product' ), true ) ) {
		return array(
			'slug'  => $slug,
			'label' => $label,
			'icon'  => 'compass',
			'tone'  => 'strategy',
			'pill'  => 'pill--green',
			'order' => 10,
		);
	}
	if ( in_array( $slug, array( 'ai-workflows', 'ai', 'skills', 'workflows' ), true ) ) {
		return array(
			'slug'  => $slug,
			'label' => $label,
			'icon'  => 'terminal-agent',
			'tone'  => 'ai',
			'pill'  => 'pill--orange',
			'order' => 20,
		);
	}
	if ( in_array( $slug, array( 'marketing', 'growth' ), true ) ) {
		return array(
			'slug'  => $slug,
			'label' => $label,
			'icon'  => 'growth',
			'tone'  => 'marketing',
			'pill'  => 'pill--green',
			'order' => 30,
		);
	}
	if ( in_array( $slug, array( 'news', 'announcements' ), true ) ) {
		return array(
			'slug'  => $slug,
			'label' => $label,
			'icon'  => 'newspaper',
			'tone'  => 'news',
			'pill'  => '',
			'order' => 40,
		);
	}

	return array(
		'slug'  => $slug,
		'label' => $label,
		'icon'  => 'book-open',
		'tone'  => 'strategy',
		'pill'  => 'pill--green',
		'order' => 50,
	);
}

/**
 * Choose a subject-specific Supericon for an individual essay card, falling back to its topic icon.
 *
 * @param WP_Post $post       Post object.
 * @param string  $topic_icon Default topic icon key.
 * @return string
 */
function rf_article_card_icon( $post, $topic_icon ) {
	$haystack = strtolower( $post->post_name . ' ' . $post->post_title );
	if ( str_contains( $haystack, 'robots' ) || str_contains( $haystack, 'crawler' ) ) {
		return 'agent-face';
	}
	if ( str_contains( $haystack, 'cursor' ) || str_contains( $haystack, 'cli' ) ) {
		return 'terminal-agent';
	}
	if ( str_contains( $haystack, 'skill' ) || str_contains( $haystack, 'workflow' ) ) {
		return 'workflow';
	}
	if ( str_contains( $haystack, 'static' ) || str_contains( $haystack, 'rebuilt' ) ) {
		return 'blocks';
	}
	if ( str_contains( $haystack, 'review' ) || str_contains( $haystack, 'star' ) ) {
		return 'circle-star';
	}
	if ( str_contains( $haystack, 'tavern' ) || str_contains( $haystack, 'conversation' ) || str_contains( $haystack, 'interview' ) ) {
		return 'microphone';
	}
	if ( 'launch' === $post->post_name || str_contains( $haystack, 'launching' ) ) {
		return 'growth';
	}
	return $topic_icon;
}

/**
 * Estimated reading time in minutes at ~220 words per minute.
 *
 * @param string $content Raw post content.
 * @return int
 */
function rf_article_reading_minutes( $content ) {
	$plain = trim( wp_strip_all_tags( preg_replace( '/<!--.*?-->/s', ' ', (string) $content ) ) );
	if ( '' === $plain ) {
		return 1;
	}
	$words = preg_split( '/\s+/u', $plain, -1, PREG_SPLIT_NO_EMPTY );
	$count = is_array( $words ) ? count( $words ) : 0;
	return max( 1, (int) ceil( $count / 220 ) );
}

/**
 * Extract structured Key Takeaways items from post_content when present.
 *
 * @param string $content Raw post content.
 * @param int    $limit   Maximum items to return.
 * @return string[] Sanitized HTML list-item bodies.
 */
function rf_article_takeaways( $content, $limit = 4 ) {
	if ( ! preg_match( '/<ol\b[^>]*\brf-keytakeaways\b[^>]*>(.*?)<\/ol>/is', (string) $content, $list_match ) ) {
		return array();
	}
	if ( ! preg_match_all( '/<li\b[^>]*>(.*?)<\/li>/is', $list_match[1], $item_matches ) ) {
		return array();
	}

	$allowed = array(
		'strong' => array(),
		'em'     => array(),
		'code'   => array(),
	);
	$items = array();
	foreach ( $item_matches[1] as $raw_item ) {
		$clean = trim( wp_kses( $raw_item, $allowed ) );
		if ( '' !== $clean ) {
			$items[] = $clean;
		}
		if ( count( $items ) >= $limit ) {
			break;
		}
	}
	return $items;
}

/**
 * Clean one-paragraph excerpt for an essay card.
 *
 * @param WP_Post $post Post object.
 * @return string
 */
function rf_article_clean_excerpt( $post ) {
	$excerpt = trim( html_entity_decode( wp_strip_all_tags( (string) $post->post_excerpt ), ENT_QUOTES | ENT_HTML5, 'UTF-8' ) );
	if ( '' !== $excerpt ) {
		return $excerpt;
	}
	$body = preg_replace( '/<div\b[^>]*\brf-takeaways\b[^>]*>.*?<\/div>/is', ' ', (string) $post->post_content );
	$text = trim( html_entity_decode( wp_strip_all_tags( (string) $body ), ENT_QUOTES | ENT_HTML5, 'UTF-8' ) );
	return wp_trim_words( $text, 28, '…' );
}

/**
 * Render the Articles archive: topic filter bar, lead spotlight, and scannable essay cards.
 *
 * @return string
 */
function rf_render_articles_index() {
	global $wp_query;

	$posts = array();
	if ( $wp_query instanceof WP_Query && $wp_query->is_home() && ! empty( $wp_query->posts ) ) {
		foreach ( $wp_query->posts as $candidate ) {
			if ( $candidate instanceof WP_Post && 'post' === $candidate->post_type && 'publish' === $candidate->post_status ) {
				$posts[] = $candidate;
			}
		}
	}

	if ( empty( $posts ) ) {
		$posts = get_posts(
			array(
				'post_type'      => 'post',
				'post_status'    => 'publish',
				'posts_per_page' => 50,
				'orderby'        => 'date',
				'order'          => 'DESC',
			)
		);
	}

	if ( empty( $posts ) ) {
		return '';
	}

	$topics = array();
	$items  = array();
	foreach ( $posts as $post ) {
		$topic = rf_article_topic_meta( $post->ID );
		$slug  = $topic['slug'];
		if ( ! isset( $topics[ $slug ] ) ) {
			$topics[ $slug ]          = $topic;
			$topics[ $slug ]['count'] = 0;
		}
		++$topics[ $slug ]['count'];

		$items[] = array(
			'post'      => $post,
			'url'       => get_permalink( $post ),
			'title'     => html_entity_decode( get_the_title( $post ), ENT_QUOTES | ENT_HTML5, 'UTF-8' ),
			'excerpt'   => rf_article_clean_excerpt( $post ),
			'iso_date'  => get_the_date( 'Y-m-d', $post ),
			'date'      => get_the_date( 'F j, Y', $post ),
			'minutes'   => rf_article_reading_minutes( $post->post_content ),
			'takeaways' => rf_article_takeaways( $post->post_content, 4 ),
			'topic'     => $topic,
			'card_icon' => rf_article_card_icon( $post, $topic['icon'] ),
		);
	}

	uasort(
		$topics,
		static function ( $a, $b ) {
			if ( $a['order'] !== $b['order'] ) {
				return $a['order'] <=> $b['order'];
			}
			return strcmp( $a['label'], $b['label'] );
		}
	);

	$total       = count( $items );
	$count_label = 1 === $total ? '1 essay' : $total . ' essays';

	$filter_buttons = sprintf(
		'<button type="button" class="pill rf-filter-pill is-active" data-rf-filter="all" data-rf-label="All" aria-pressed="true">%1$s<span>All</span><span class="rf-filter-pill__count">%2$d</span></button>',
		rf_article_svg_icon( 'layers', 'pill__icon' ),
		$total
	);

	if ( count( $topics ) > 1 ) {
		foreach ( $topics as $topic ) {
			$filter_buttons .= sprintf(
				'<button type="button" class="pill rf-filter-pill" data-rf-filter="%1$s" data-rf-label="%2$s" aria-pressed="false">%3$s<span>%4$s</span><span class="rf-filter-pill__count">%5$d</span></button>',
				esc_attr( $topic['slug'] ),
				esc_attr( $topic['label'] ),
				rf_article_svg_icon( $topic['icon'], 'pill__icon' ),
				esc_html( $topic['label'] ),
				(int) $topic['count']
			);
		}
	}

	$lead       = $items[0];
	$lead_aside = '';
	if ( ! empty( $lead['takeaways'] ) ) {
		$li_markup = '';
		foreach ( $lead['takeaways'] as $point ) {
			$li_markup .= '<li>' . $point . '</li>';
		}
		$lead_aside = sprintf(
			'<aside class="rf-card__lead-aside" aria-label="%1$s"><p class="rf-meta rf-card__lead-kicker">%1$s</p><ol class="rf-keytakeaways">%2$s</ol></aside>',
			esc_html__( 'Key takeaways', 'rf-cds' ),
			$li_markup
		);
	}

	$lead_classes = 'rf-card rf-card--lead surface--logo' . ( '' !== $lead_aside ? ' has-takeaways' : '' );
	$lead_html    = sprintf(
		'<article class="%1$s" data-rf-lead><div class="rf-card__lead-main"><div class="rf-card__lead-eyebrow"><span class="pill pill--orange">%2$s<span>Latest essay</span></span><span class="rf-card__lead-topic">%3$s<span>%4$s</span></span></div><h2 class="wp-block-post-title rf-card__lead-title"><a href="%5$s">%6$s</a></h2><p class="rf-card__lead-excerpt">%7$s</p><div class="rf-card__lead-foot"><a class="btn btn--tertiary rf-card__lead-cta" href="%5$s"><span>Read the essay</span>%8$s</a><span class="rf-card__lead-meta"><time datetime="%9$s">%10$s</time><span aria-hidden="true">·</span><span class="rf-card__readtime">%11$s<span>%12$d min read</span></span></span></div></div>%13$s</article>',
		esc_attr( $lead_classes ),
		rf_article_svg_icon( 'sparkles', 'pill__icon' ),
		rf_article_svg_icon( $lead['topic']['icon'], 'rf-meta-icon' ),
		esc_html( $lead['topic']['label'] ),
		esc_url( $lead['url'] ),
		esc_html( $lead['title'] ),
		esc_html( $lead['excerpt'] ),
		rf_article_svg_icon( 'arrow-right', 'rf-btn-icon' ),
		esc_attr( $lead['iso_date'] ),
		esc_html( $lead['date'] ),
		rf_article_svg_icon( 'clock', 'rf-meta-icon' ),
		(int) $lead['minutes'],
		$lead_aside
	);

	$feed_cards = '';
	foreach ( $items as $index => $item ) {
		$mirror_attr = 0 === $index ? ' hidden data-rf-lead-mirror="true"' : '';
		$pill_class  = trim( 'pill ' . $item['topic']['pill'] );
		$peek_html   = '';

		if ( ! empty( $item['takeaways'] ) ) {
			$peek_items = array_slice( $item['takeaways'], 0, 3 );
			$peek_li    = '';
			foreach ( $peek_items as $point ) {
				$peek_li .= '<li>' . $point . '</li>';
			}
			$peek_count = count( $peek_items );
			$peek_label = sprintf(
				/* translators: %d: number of key takeaways */
				_n( 'Preview %d key takeaway', 'Preview %d key takeaways', $peek_count, 'rf-cds' ),
				$peek_count
			);
			$peek_html = sprintf(
				'<details class="rf-card__peek"><summary class="rf-card__peek-summary"><span class="rf-card__peek-label">%1$s</span>%2$s</summary><div class="rf-card__peek-panel"><ol class="rf-keytakeaways">%3$s</ol></div></details>',
				esc_html( $peek_label ),
				rf_article_svg_icon( 'leaf-caret', 'rf-disclosure__arrow rf-card__peek-arrow' ),
				$peek_li
			);
		}

		$feed_cards .= sprintf(
			'<article class="rf-card rf-card--essay" data-rf-topic="%1$s"%2$s><div class="rf-card__essay-row"><span class="rf-card__topic-tile rf-card__topic-tile--%3$s" aria-hidden="true">%4$s</span><div class="rf-card__essay-main"><div class="rf-card__essay-meta"><span class="%5$s">%6$s</span><span class="rf-card__essay-byline"><time datetime="%7$s">%8$s</time><span aria-hidden="true">·</span><span class="rf-card__readtime">%9$s<span>%10$d min read</span></span></span></div><h2 class="wp-block-post-title rf-card__essay-title"><a href="%11$s">%12$s</a></h2><p class="rf-card__essay-excerpt">%13$s</p>%14$s</div><a class="rf-card__essay-go" href="%11$s" tabindex="-1" aria-hidden="true">%15$s</a></div></article>',
			esc_attr( $item['topic']['slug'] ),
			$mirror_attr,
			esc_attr( $item['topic']['tone'] ),
			rf_article_svg_icon( $item['card_icon'], 'rf-card__topic-svg' ),
			esc_attr( $pill_class ),
			esc_html( $item['topic']['label'] ),
			esc_attr( $item['iso_date'] ),
			esc_html( $item['date'] ),
			rf_article_svg_icon( 'clock', 'rf-meta-icon' ),
			(int) $item['minutes'],
			esc_url( $item['url'] ),
			esc_html( $item['title'] ),
			esc_html( $item['excerpt'] ),
			$peek_html,
			rf_article_svg_icon( 'arrow-right', 'rf-card__go-icon' )
		);
	}

	$more_head = $total > 1
		? '<div class="rf-articles-subhead" data-rf-more-head><p class="rf-meta">More essays</p><span class="rf-articles-subhead__rule" aria-hidden="true"></span></div>'
		: '';

	return sprintf(
		'<section class="articles-list rf-articles-index" aria-label="%1$s"><div class="rf-articles-toolbar"><div class="rf-articles-filters" role="group" aria-label="%2$s">%3$s</div><p class="rf-small rf-articles-status" data-rf-filter-status data-rf-total="%4$d" role="status" aria-live="polite">%5$s</p></div>%6$s%7$s<div class="rf-articles-feed" data-rf-feed>%8$s</div></section>',
		esc_attr__( 'Published essays', 'rf-cds' ),
		esc_attr__( 'Filter essays by topic', 'rf-cds' ),
		$filter_buttons,
		(int) $total,
		esc_html( $count_label ),
		$lead_html,
		$more_head,
		$feed_cards
	);
}

/**
 * Category archives are not published. Keep them out of breadcrumbs and the sitemap.
 *
 * @param array<int, array<string, string>> $links Breadcrumb links.
 * @return array<int, array<string, string>>
 */
function rf_strip_category_breadcrumbs( $links ) {
	$terms = get_terms(
		array(
			'taxonomy'   => 'category',
			'hide_empty' => false,
		)
	);
	if ( is_wp_error( $terms ) || ! is_array( $links ) ) {
		return $links;
	}
	$urls = array();
	foreach ( $terms as $term ) {
		$link = get_term_link( $term );
		if ( ! is_wp_error( $link ) ) {
			$urls[] = untrailingslashit( $link );
		}
	}
	return array_values(
		array_filter(
			$links,
			static function ( $link ) use ( $urls ) {
				$url = untrailingslashit( (string) ( $link['url'] ?? '' ) );
				return ! in_array( $url, $urls, true );
			}
		)
	);
}
add_filter( 'slim_seo_breadcrumbs_links', 'rf_strip_category_breadcrumbs' );

/**
 * @param array<int, string> $taxonomies Taxonomies Slim SEO would list.
 * @return array<int, string>
 */
function rf_slim_seo_skip_category_sitemap( $taxonomies ) {
	return array_values( array_diff( (array) $taxonomies, array( 'category' ) ) );
}
add_filter( 'slim_seo_sitemap_taxonomies', 'rf_slim_seo_skip_category_sitemap' );

/**
 * @param int $post_id Post ID.
 * @return bool
 */
function rf_post_uses_featured_hero( $post_id ) {
	$post_id = (int) $post_id;
	if ( $post_id < 1 ) {
		return false;
	}
	$own_thumb = (int) get_post_meta( $post_id, '_thumbnail_id', true );
	if ( $own_thumb < 1 ) {
		return false;
	}
	return (bool) get_post_meta( $post_id, 'rf_hero_featured', true );
}

/**
 * Site-wide featured / OG fallback (asset-lab card). Stored at setup time.
 *
 * @return int Attachment ID, or 0 when unset.
 */
function rf_default_featured_attachment_id() {
	return (int) get_option( 'rf_default_featured_attachment_id', 0 );
}

/**
 * Use the default card when a published page or post has no featured image set.
 *
 * @param int|''     $thumbnail_id Attachment ID.
 * @param int|WP_Post $post        Post ID or object.
 * @return int|''
 */
function rf_default_post_thumbnail_id( $thumbnail_id, $post ) {
	if ( $thumbnail_id ) {
		return $thumbnail_id;
	}
	$post = get_post( $post );
	if ( ! $post instanceof WP_Post ) {
		return $thumbnail_id;
	}
	if ( ! in_array( $post->post_type, array( 'post', 'page' ), true ) ) {
		return $thumbnail_id;
	}
	if ( 'publish' !== $post->post_status ) {
		return $thumbnail_id;
	}
	$default = rf_default_featured_attachment_id();
	return $default > 0 ? $default : $thumbnail_id;
}
add_filter( 'post_thumbnail_id', 'rf_default_post_thumbnail_id', 10, 2 );

/**
 * Sidebar checkbox under Featured image: use that photo as the hero wash.
 */
function rf_hero_featured_meta_box() {
	add_meta_box(
		'rf-hero-featured',
		'Hero background',
		'rf_hero_featured_meta_box_html',
		'post',
		'side',
		'default'
	);
}
add_action( 'add_meta_boxes', 'rf_hero_featured_meta_box' );

/**
 * @param WP_Post $post Post.
 */
function rf_hero_featured_meta_box_html( $post ) {
	wp_nonce_field( 'rf_hero_featured', 'rf_hero_featured_nonce' );
	$on = (bool) get_post_meta( $post->ID, 'rf_hero_featured', true );
	echo '<p>';
	echo '<label><input type="checkbox" name="rf_hero_featured" value="1"' . checked( $on, true, false ) . '> Use the featured image as the hero background</label>';
	echo '</p>';
	echo '<p class="description">Off is a paper wash. On needs a featured image.</p>';
}

/**
 * @param int $post_id Post ID.
 */
function rf_hero_featured_save( $post_id ) {
	if ( ! isset( $_POST['rf_hero_featured_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['rf_hero_featured_nonce'] ) ), 'rf_hero_featured' ) ) {
		return;
	}
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}
	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}
	$on = ! empty( $_POST['rf_hero_featured'] );
	update_post_meta( $post_id, 'rf_hero_featured', $on );
}
add_action( 'save_post_post', 'rf_hero_featured_save' );

/**
 * When the setting is on, paint the featured image on the article hero.
 *
 * @param string $content Rendered HTML.
 * @param array  $block   Parsed block.
 * @return string
 */
function rf_article_hero_featured_background( $content, $block ) {
	if ( ( $block['blockName'] ?? '' ) !== 'core/group' ) {
		return $content;
	}
	$class = $block['attrs']['className'] ?? '';
	if ( ! str_contains( $class, 'rf-article-hero' ) ) {
		return $content;
	}
	if ( ! is_singular( 'post' ) ) {
		return $content;
	}
	$post_id = get_the_ID();
	if ( ! rf_post_uses_featured_hero( $post_id ) ) {
		return $content;
	}
	$url = get_the_post_thumbnail_url( $post_id, 'large' );
	if ( ! $url ) {
		return $content;
	}
	$content = preg_replace(
		'/class="([^"]*rf-article-hero[^"]*)"/',
		'class="$1 has-rf-featured-hero"',
		$content,
		1
	);
	$var = '--rf-hero-image:url(' . esc_url( $url ) . ')';
	if ( preg_match( '/<div[^>]*rf-article-hero[^>]*style="/', $content ) ) {
		$content = preg_replace(
			'/(<div[^>]*rf-article-hero[^>]*style=")/',
			'$1' . $var . ';',
			$content,
			1
		);
	}
	return $content;
}
add_filter( 'render_block', 'rf_article_hero_featured_background', 10, 2 );

