<?php
/**
 * Title: Subscribe
 * Slug: rf/subscribe
 * Categories: rf
 * Inserter: true
 */
?>
<!-- wp:html -->
<form class="rf-copy rf-subscribe" method="post" action="/api/subscribe">
		<p class="rf-meta">Subscribe</p>
		<p>More context and resources, straight from Matt.</p>
		<div class="field">
			<label for="pattern-subscribe-name">Name</label>
			<input class="input" id="pattern-subscribe-name" type="text" name="name" autocomplete="name" maxlength="100">
		</div>
		<div class="field">
			<label for="pattern-subscribe-email">Email</label>
			<input class="input" id="pattern-subscribe-email" type="email" name="email" autocomplete="email" required maxlength="254">
		</div>
		<div class="rf-subscribe-turnstile" data-sitekey="0x4AAAAAAFV-KGUd_wkXmGBY" data-action="subscribe"></div>
		<button class="btn btn--primary" type="submit">Subscribe</button>
		<p class="rf-meta rf-subscribe-status" role="status"></p>
	</form>
<!-- /wp:html -->
