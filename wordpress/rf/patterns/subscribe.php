<?php
/**
 * Title: Subscribe
 * Slug: rf/subscribe
 * Categories: rf
 * Inserter: true
 */
?>
<!-- wp:group {"className":"is-style-rf-surface rf-rail-subscribe","layout":{"type":"default"}} -->
<div class="wp-block-group is-style-rf-surface rf-rail-subscribe">
	<!-- wp:html -->
<form class="rf-copy rf-subscribe" method="post" action="/api/subscribe">
		<div class="rf-subscribe__head">
			<span class="rf-subscribe__icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/></svg></span>
			<div class="rf-subscribe__titles">
				<p class="rf-meta">Newsletter</p>
				<p class="rf-subscribe__title">Field notes from Matt</p>
			</div>
		</div>
		<p class="rf-subscribe__lede">More context and resources, straight from Matt.</p>
		<div class="field">
			<label for="pattern-subscribe-name">Name</label>
			<input class="input" id="pattern-subscribe-name" type="text" name="name" autocomplete="name" maxlength="100">
		</div>
		<div class="field">
			<label for="pattern-subscribe-email">Email</label>
			<input class="input" id="pattern-subscribe-email" type="email" name="email" autocomplete="email" required maxlength="254">
		</div>
		<div class="rf-subscribe-turnstile" data-sitekey="0x4AAAAAAFV-KGUd_wkXmGBY" data-action="subscribe"></div>
		<button class="btn btn--primary rf-subscribe__submit" type="submit"><span>Subscribe</span><svg class="rf-btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></button>
		<p class="rf-meta rf-subscribe-status" role="status"></p>
	</form>
<!-- /wp:html -->
</div>
<!-- /wp:group -->
