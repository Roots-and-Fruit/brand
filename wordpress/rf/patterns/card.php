<?php
/**
 * Title: Card
 * Slug: rf/card
 * Categories: rf
 * Inserter: true
 */
?>
<!-- wp:group {"tagName":"article","className":"rf-card","layout":{"type":"default"}} -->
<article class="wp-block-group rf-card">
	<!-- wp:paragraph {"className":"rf-meta"} -->
	<p class="rf-meta">Note</p>
	<!-- /wp:paragraph -->

	<!-- wp:heading {"level":3,"className":"rf-card__title"} -->
	<h3 class="wp-block-heading rf-card__title">A plugin note</h3>
	<!-- /wp:heading -->

	<!-- wp:paragraph -->
	<p>The pattern stays in the editor. The popup reads from that same pattern.</p>
	<!-- /wp:paragraph -->

	<!-- wp:group {"tagName":"footer","className":"rf-card__foot","layout":{"type":"default"}} -->
	<footer class="wp-block-group rf-card__foot">
		<!-- wp:buttons -->
		<div class="wp-block-buttons">
			<!-- wp:button {"className":"btn btn--tertiary btn--sm"} -->
			<div class="wp-block-button btn btn--tertiary btn--sm"><a class="wp-block-button__link wp-element-button">Open</a></div>
			<!-- /wp:button -->
		</div>
		<!-- /wp:buttons -->
	</footer>
	<!-- /wp:group -->
</article>
<!-- /wp:group -->
