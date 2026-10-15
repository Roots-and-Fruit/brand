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
		array( 'wp-blocks', 'wp-element', 'wp-components', 'wp-block-editor', 'wp-compose', 'wp-hooks', 'wp-data', 'wp-dom-ready' ),
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
		'(function(){var forms=document.querySelectorAll("form.rf-subscribe");if(!forms.length)return;var widgets=new WeakMap();function render(){if(!window.turnstile)return;forms.forEach(function(form){var slot=form.querySelector(".rf-subscribe-turnstile");var sitekey=slot&&slot.getAttribute("data-sitekey");if(!slot||!sitekey||widgets.has(form))return;widgets.set(form,window.turnstile.render(slot,{sitekey:sitekey,action:"subscribe"}));});}window.rfSubscribeTurnstileLoad=render;var needs=false;forms.forEach(function(form){var slot=form.querySelector(".rf-subscribe-turnstile");if(slot&&slot.getAttribute("data-sitekey"))needs=true;form.addEventListener("submit",function(event){event.preventDefault();var button=form.querySelector("button");var status=form.querySelector(".rf-subscribe-status");if(button)button.disabled=true;if(status)status.textContent="";fetch("/api/subscribe",{method:"POST",body:new FormData(form)}).then(function(res){return res.json().then(function(json){return{ok:res.ok,json:json};});}).then(function(result){if(!status)return;if(result.ok&&result.json&&result.json.ok&&result.json.status==="active"){status.textContent="You\'re on the list.";form.reset();return;}if(result.ok&&result.json&&result.json.ok){status.textContent="Check your email and confirm. Then you\'re on the list.";form.reset();return;}status.textContent="That didn\'t go through. Try again in a moment.";}).catch(function(){if(status)status.textContent="That didn\'t go through. Try again in a moment.";}).then(function(){if(button)button.disabled=false;var id=widgets.get(form);if(id!==undefined&&window.turnstile)window.turnstile.reset(id);});});});if(!needs)return;var script=document.createElement("script");script.src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=rfSubscribeTurnstileLoad&render=explicit";script.async=true;script.defer=true;document.head.appendChild(script);})();'
	);
}
add_action( 'wp_enqueue_scripts', 'rf_enqueue_styles' );

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
		return str_replace(
			array( ' fetchpriority="high"', " fetchpriority='high'" ),
			'',
			$html
		);
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
}
add_action( 'init', 'rf_register_block_styles', 5 );

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
 * @param array $item { id, label, children?: array }.
 * @return string Block markup, or empty if the target is missing.
 */
function rf_navigation_item_markup( $item ) {
	if ( empty( $item['id'] ) || empty( $item['label'] ) ) {
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
	if ( ! is_home() || is_front_page() ) {
		return $content;
	}
	$text = trim( wp_strip_all_tags( $content ) );
	if ( $text === '' ) {
		return '';
	}
	return '<span class="pill pill--green">' . esc_html( $text ) . '</span>';
}
add_filter( 'render_block', 'rf_articles_category_pill', 10, 2 );

/**
 * @param int $post_id Post ID.
 * @return bool
 */
function rf_post_uses_featured_hero( $post_id ) {
	$post_id = (int) $post_id;
	if ( $post_id < 1 ) {
		return false;
	}
	if ( ! get_post_thumbnail_id( $post_id ) ) {
		return false;
	}
	return (bool) get_post_meta( $post_id, 'rf_hero_featured', true );
}

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
	$url = get_the_post_thumbnail_url( $post_id, 'full' );
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

