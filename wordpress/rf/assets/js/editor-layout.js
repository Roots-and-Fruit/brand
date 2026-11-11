( function ( wp ) {
	var addFilter = wp.hooks.addFilter;
	var createElement = wp.element.createElement;
	var Fragment = wp.element.Fragment;
	var InspectorControls = wp.blockEditor.InspectorControls;
	var useBlockProps = wp.blockEditor.useBlockProps;
	var PanelBody = wp.components.PanelBody;
	var Disabled = wp.components.Disabled;
	var TextControl = wp.components.TextControl;
	var ServerSideRender = wp.serverSideRender;

	var templateBlocks = [
		[ 'rf/articles-index', 'Articles archive', 'book-alt', true ],
		[ 'rf/term-lede', 'Term lede', 'editor-paragraph', false ],
		[ 'rf/term-references', 'Term references', 'admin-links', false ],
		[ 'rf/product-promise', 'Product promise', 'editor-quote', false ],
		[ 'rf/product-lede', 'Product lede', 'editor-paragraph', false ],
		[ 'rf/product-actions', 'Product actions', 'button', false ],
		[ 'rf/product-shot', 'Product shot', 'format-image', false ],
		[ 'rf/product-facts', 'Product facts', 'list-view', false ],
		[ 'rf/product-docs', 'Product docs', 'media-document', false ],
		[ 'rf/product-feedback', 'Product feedback', 'format-chat', false ],
		[ 'rf/product-updates-eyebrow', 'Product updates eyebrow', 'tag', false ],
		[ 'rf/product-updates-lede', 'Product updates lede', 'editor-paragraph', false ],
	];

	templateBlocks.forEach( function ( item ) {
		var blockName = item[ 0 ];
		var blockTitle = item[ 1 ];
		var blockIcon = item[ 2 ];
		var previewLive = item[ 3 ];

		if ( wp.blocks.getBlockType( blockName ) ) {
			return;
		}

		wp.blocks.registerBlockType( blockName, {
			apiVersion: 3,
			title: blockTitle,
			icon: blockIcon,
			category: 'theme',
			supports: {
				inserter: false,
				html: false,
			},
			edit: function () {
				var blockProps = useBlockProps(
					previewLive
						? { style: { maxWidth: 'none', width: '100%', marginInline: '0' } }
						: undefined
				);

				if ( previewLive && ServerSideRender ) {
					return createElement(
						'div',
						blockProps,
						createElement(
							Disabled,
							null,
							createElement( ServerSideRender, {
								block: blockName,
							} )
						)
					);
				}

				return createElement(
					'div',
					blockProps,
					createElement(
						'p',
						{ className: 'rf-meta', style: { margin: 0 } },
						blockTitle + ' (template block)'
					)
				);
			},
			save: function () {
				return null;
			},
		} );
	} );

	addFilter( 'blocks.registerBlockType', 'rf/code-language', function ( settings, name ) {
		if ( 'core/code' !== name ) {
			return settings;
		}

		settings.attributes = Object.assign( {}, settings.attributes, {
			rfLanguage: {
				type: 'string',
				default: '',
			},
		} );

		return settings;
	} );

	var withCodeWindow = wp.compose.createHigherOrderComponent( function ( BlockEdit ) {
		return function ( props ) {
			if ( 'core/code' !== props.name ) {
				return createElement( BlockEdit, props );
			}

			var className = props.attributes.className || '';
			var isWindow = className.indexOf( 'is-style-rf-code' ) !== -1;
			if ( ! isWindow ) {
				return createElement( BlockEdit, props );
			}

			var language = props.attributes.rfLanguage || '';

			return createElement(
				Fragment,
				null,
				createElement(
					'div',
					{ className: 'rf-code rf-code--editor' },
					createElement(
						'div',
						{ className: 'rf-code__chrome', 'aria-hidden': 'true' },
						createElement(
							'div',
							{ className: 'rf-code__dots' },
							createElement( 'span' ),
							createElement( 'span' ),
							createElement( 'span' )
						)
					),
					createElement( BlockEdit, props ),
					language
						? createElement( 'span', { className: 'rf-code__lang' }, language )
						: null
				),
				createElement(
					InspectorControls,
					null,
					createElement(
						PanelBody,
						{ title: 'Code window', initialOpen: true },
						createElement( TextControl, {
							label: 'Language',
							value: language,
							onChange: function ( value ) {
								props.setAttributes( { rfLanguage: value } );
							},
						} )
					)
				)
			);
		};
	}, 'withRfCodeWindow' );

	addFilter( 'editor.BlockEdit', 'rf/code-window', withCodeWindow );

	function markTermCanvas() {
		var editor = wp.data.select( 'core/editor' );
		if ( ! editor || typeof editor.getCurrentPostType !== 'function' ) {
			return;
		}
		var type = editor.getCurrentPostType();
		if ( ! type ) {
			return;
		}
		var frame = document.querySelector( 'iframe[name="editor-canvas"]' );
		if ( ! frame || ! frame.contentDocument || ! frame.contentDocument.body ) {
			return;
		}
		frame.contentDocument.body.classList.toggle( 'rf-editing-term', 'term' === type );
	}

	wp.domReady( function () {
		wp.data.subscribe( markTermCanvas );
		markTermCanvas();
	} );
} )( window.wp );
