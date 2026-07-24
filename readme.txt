=== Smooth Music Gallery ===
Contributors: smoothcdn
Tags: gallery, music, audio, gutenberg, shortcode
Requires at least: 5.6
Tested up to: 7.0.2
Requires PHP: 7.4
Stable tag: 1.1.0
Donate link: https://smoothbundle.com/pricing
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Create immersive photo galleries with music, stylish visual effects, and Smooth Bundle integration for Gutenberg and shortcodes.

== Description ==

Smooth Music Gallery helps you turn ordinary image galleries into rich, interactive experiences with background music, animated effects, and modern presentation styles.

Whether you are building a landing page, an artist portfolio, a wedding gallery, a travel story, or a product showcase, the plugin gives you an easy way to make galleries feel more alive and memorable.

You can use it in two simple ways:

* Gutenberg block for native block editor workflows.
* Shortcode Builder for classic editors and third-party page builders.

What you can do with Smooth Music Gallery:

* Add your own images and background music in a few clicks.
* Choose from ready-made gallery themes to match different styles and moods.
* Add animated overlay effects and dynamic background effects for a more engaging look.
* Create audio-reactive visuals that move with the music.
* Adjust gallery size and slide timing to fit your layout.
* Build galleries visually and generate a shortcode for any page or builder.
* Use media from the WordPress Media Library or optional Smooth Bundle assets.
* Optionally serve gallery frontend assets through Smooth Bundle.

Perfect for creators, photographers, musicians, agencies, event sites, and anyone who wants a gallery that feels more premium than a standard slider.

== Installation ==

1. Upload the plugin folder to `/wp-content/plugins/`, or install it from the WordPress Plugins screen.
2. Activate the plugin through the `Plugins` screen in WordPress.
3. Use the `Smooth Music Gallery` block in Gutenberg, or open `Smooth Music Gallery -> Shortcode Builder` in wp-admin.

== Frequently Asked Questions ==

= Can I use this without Gutenberg? =

Yes. Use the Shortcode Builder in wp-admin to generate a shortcode and paste it anywhere your builder supports shortcodes.

= Can I use my own media from the WordPress Media Library? =

Yes. You can select images and audio directly from the Media Library.

= Can I use Smooth Bundle assets? =

Yes. The plugin includes Smooth Bundle asset selection in the editor.

= Can I serve frontend gallery scripts and styles from Smooth Bundle? =

Yes. In plugin settings you can enable **Serve gallery assets via Smooth Bundle**. This is optional and disabled by default.

== Source Code ==

The source code for this plugin is publicly available in the repository:

https://github.com/Miro0/smooth-music-gallery

== External Services ==

Smooth Music Gallery can optionally connect to Smooth Bundle to let administrators browse sample assets in the editor.

* Service: Smooth Bundle Asset Picker (`https://cdn.smoothbundle.com`)
* Purpose: Browse and select optional sample image/audio files.
* Trigger: Requests are sent only when an administrator selects the **Smooth Bundle assets** source and opens the picker dialog.
* Data sent: Standard browser request data (IP address, user agent, referrer) and picker query parameters (for example file type, project slug, version).
* Frontend behavior: If a gallery uses external Smooth Bundle URLs, visitor browsers request those media files directly from Smooth Bundle.
* Service: Smooth Bundle Gallery Asset Delivery (`https://music-gallery.smoothbundle.com`)
* Purpose: Optional delivery of this plugin's frontend gallery scripts/styles.
* Trigger: Requests are sent only when an administrator enables **Serve gallery assets via Smooth Bundle** in plugin settings.
* Data sent: Standard browser request data (IP address, user agent, referrer) when the frontend gallery loads those assets.
* Terms of Service: `https://smoothbundle.com/terms`
* Privacy Policy: `https://smoothbundle.com/privacy`

The external service is optional. The plugin works without it by using only the WordPress Media Library.

== Screenshots ==

1. Gutenberg editor sidebar with gallery controls.
2. Gallery preview with music controls and effects.
3. Shortcode Builder in wp-admin.
4. Generated shortcode ready to paste into pages.

== Changelog ==

= 1.1.0 =

* Rebranded from Smooth CDN to Smooth Bundle.

= 1.0.7 =

* Maintenance update.

= 1.0.6 =

* Safari bugs fixed.

= 1.0.5 =

* PHP warnings fixed.
* Menu icon changed to custom one.

= 1.0.4 =

* Minor bug fixed.

= 1.0.3 =

* Minor bug fixed.

= 1.0.2 =

* Added support for focus point.

= 1.0.1 =

* Improved plugin readme and public release metadata.
* Added plugin asset support for WordPress.org screenshots and icons.
* Improved WordPress.org release workflow and packaging.

= 1.0.0 =

* Initial public release.
* Gutenberg block with image, music, theme, overlay, and background controls.
* Shortcode Builder for non-block workflows.
* Frontend gallery runtime with audio controls and animations.

== Upgrade Notice ==

= 1.1.0 =

Rebranded from Smooth CDN to Smooth Bundle.

= 1.0.7 =

Maintenance update.

= 1.0.6 =

Maintenance update.

= 1.0.5 =

Maintenance update.

= 1.0.4 =

Minor bug fixed.

= 1.0.3 =

Minor bug fixed.

= 1.0.2 =

Update plugin to add focus point support.

= 1.0.1 =

Recommended update with improved WordPress.org release metadata and packaging.

= 1.0.0 =

Initial release.
