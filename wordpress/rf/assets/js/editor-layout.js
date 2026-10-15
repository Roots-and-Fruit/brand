( function ( wp ) {
	var addFilter = wp.hooks.addFilter;
	var createElement = wp.element.createElement;
	var Fragment = wp.element.Fragment;
	var InspectorControls = wp.blockEditor.InspectorControls;
	var PanelBody = wp.components.PanelBody;
	var TextControl = wp.components.TextControl;

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
