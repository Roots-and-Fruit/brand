<?php
/**
 * Title: Page hero
 * Slug: rf/page-hero
 * Categories: rf
 * Inserter: true
 * Block Types: core/post-content
 * Post Types: page
 */
?>
<!-- wp:group {"align":"full","className":"page-hero rf-copy","backgroundColor":"panel","style":{"border":{"bottom":{"color":"var:custom|panel-deep","width":"4px","style":"solid"}},"spacing":{"padding":{"top":"var:preset|spacing|space-7","bottom":"var:preset|spacing|space-7"}}},"layout":{"type":"constrained","contentSize":"1200px"}} -->
<div class="wp-block-group alignfull page-hero rf-copy has-panel-background-color has-background" style="border-bottom-color:var(--wp--custom--panel-deep);border-bottom-style:solid;border-bottom-width:4px;padding-top:var(--wp--preset--spacing--space-7);padding-bottom:var(--wp--preset--spacing--space-7)">
<!-- wp:post-title {"level":1,"className":"rf-display rf-display--lg"} /-->

<!-- wp:paragraph {"className":"rf-display rf-display--md"} -->
<p class="rf-display rf-display--md">A short line under the title.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"className":"rf-lede"} -->
<p class="rf-lede">One or two sentences on what this page is for.</p>
<!-- /wp:paragraph -->

<!-- wp:buttons {"className":"rf-cluster"} -->
<div class="wp-block-buttons rf-cluster">
<!-- wp:button {"className":"btn btn--cta"} -->
<div class="wp-block-button btn btn--cta"><a class="wp-block-button__link wp-element-button" href="#book">Book a discovery call</a></div>
<!-- /wp:button -->

<!-- wp:button {"className":"btn btn--tertiary"} -->
<div class="wp-block-button btn btn--tertiary"><a class="wp-block-button__link wp-element-button" href="#packages">See the packages</a></div>
<!-- /wp:button -->
</div>
<!-- /wp:buttons -->
</div>
<!-- /wp:group -->
