=== Smooth Music Gallery ===
Contributors: smoothcdn
Tags: gallery, music, audio, gutenberg, shortcode
Requires at least: 5.6
Tested up to: 6.9
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Create modern photo galleries with background music, visual themes, and audio-reactive effects in Gutenberg or with shortcodes.

== Description ==

Smooth Music Gallery lets you build immersive photo galleries enhanced with background music and animated visual effects.

You can use it in two ways:

* Gutenberg block for native block editor workflows.
* Shortcode Builder for classic editors and third-party page builders.

Main features:

* Add multiple images and background music.
* Choose gallery themes.
* Add overlay effects.
* Add background effects.
* Configure gallery size and slide timing.
* Generate shortcode from a visual builder.
* Optional gallery asset delivery via Smooth CDN.

== Installation ==

1. Upload the plugin folder to `/wp-content/plugins/`, or install it from the WordPress Plugins screen.
2. Activate the plugin through the `Plugins` screen in WordPress.
3. Use the `Smooth Music Gallery` block in Gutenberg, or open `Smooth Music Gallery -> Shortcode Builder` in wp-admin.

== Frequently Asked Questions ==

= Can I use this without Gutenberg? =

Yes. Use the Shortcode Builder in wp-admin to generate a shortcode and paste it anywhere your builder supports shortcodes.

= Can I use my own media from the WordPress Media Library? =

Yes. You can select images and audio directly from the Media Library.

= Can I use Smooth CDN assets? =

Yes. The plugin includes Smooth CDN asset selection in the editor.

= Can I serve frontend gallery scripts and styles from Smooth CDN? =

Yes. In plugin settings you can enable **Serve gallery assets via Smooth CDN**. This is optional and disabled by default.

== Source Code ==

This plugin includes compiled JavaScript and CSS files inside the `build/` directory.

Human-readable source files are included in the `src/` directory.

Examples:

* `build/background/*.js` → generated from `src/backgrounds/*.js`
* `build/overlay/*.js` → generated from `src/overlays/*.js`
* `build/theme/*.css` → generated from `src/themes/*.scss`

The plugin uses an npm build process to compile these assets.

To rebuild the assets locally:

1. npm install
2. npm run build

The repository also includes the build configuration (`package.json`).

== External Services ==

Smooth Music Gallery can optionally connect to Smooth CDN to let administrators browse sample assets in the editor.

* Service: Smooth CDN Asset Picker (`https://cdn.smoothcdn.com`)
* Purpose: Browse and select optional sample image/audio files.
* Trigger: Requests are sent only when an administrator selects the **Smooth CDN assets** source and opens the picker dialog.
* Data sent: Standard browser request data (IP address, user agent, referrer) and picker query parameters (for example file type, project slug, version).
* Frontend behavior: If a gallery uses external Smooth CDN URLs, visitor browsers request those media files directly from Smooth CDN.
* Service: Smooth CDN Gallery Asset Delivery (`https://music-gallery.smoothcdn.com`)
* Purpose: Optional delivery of this plugin's frontend gallery scripts/styles.
* Trigger: Requests are sent only when an administrator enables **Serve gallery assets via Smooth CDN** in plugin settings.
* Data sent: Standard browser request data (IP address, user agent, referrer) when the frontend gallery loads those assets.
* Terms of Service: `https://smoothcdn.com/terms`
* Privacy Policy: `https://smoothcdn.com/privacy`

The external service is optional. The plugin works without it by using only the WordPress Media Library.

== Screenshots ==

1. Gutenberg editor sidebar with gallery controls.
2. Gallery preview with music controls and effects.
3. Shortcode Builder in wp-admin.
4. Generated shortcode ready to paste into pages.

== Changelog ==

= 1.0.0 =

* Initial public release.
* Gutenberg block with image, music, theme, overlay, and background controls.
* Shortcode Builder for non-block workflows.
* Frontend gallery runtime with audio controls and animations.

== Upgrade Notice ==

= 1.0.0 =

Initial release.
