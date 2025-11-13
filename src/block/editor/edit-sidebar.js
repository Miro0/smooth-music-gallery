import {InspectorControls} from '@wordpress/block-editor';
import {PanelBody} from '@wordpress/components';
import {__} from '@wordpress/i18n';

import {BlockContext} from "./context";
import Color from './components/Color';
import MediaUpload from './components/MediaUpload';
import Select from "./components/Select";
import Range from "./components/Range";

export default function EditSidebar({attributes, setAttributes, config}) {
  const {
    photos,
    music,
    theme = 'default',
    slides_duration,
    background_animation,
    background_animation_options,
    overlay_animation,
    overlay_animation_options,
  } = attributes;

  console.log({
    overlay_animation_options
  });

  // @TODO Handle dot notation in setAttributes/
  // @TODO Handle theme PRO blockage.
  // @TODO Handle per animation specific settings + PRO blockage.
  return (
    <BlockContext.Provider value={{setAttributes}}>
      <InspectorControls>
        <PanelBody
          title={__('Gallery settings', 'wpmusicgallery')}
          initialOpen={true}
        >
          <MediaUpload
            name="photos"
            value={photos}
            label={__('Images', 'wpmusicgallery')}
            help={__('Select image to be used in gallery', 'wpmusicgallery')}
            multiple={true}
          />

          <hr/>

          <MediaUpload
            name="music"
            value={music}
            label={__('Background music', 'wpmusicgallery')}
            help={__('Select music to be played as a background in gallery', 'wpmusicgallery')}
            allowedTypes={['audio']}
          />

          <hr/>

          <Select
            name="theme"
            value={theme}
            options={[...config.themes.free, ...config.themes.pro]}
            label={__('Theme', 'wpmusicgallery')}
            help={__('Select general gallery theme', 'wpmusicgallery')}
            placeholder={__('Default', 'wpmusicgallery')}
          />

          <hr/>

          <Range
            name="slides_duration"
            value={slides_duration}
            label={__('Slide change time', 'wpmusicgallery')}
            help={__('How long it will take to change slides when playing in seconds', 'wpmusicgallery')}
          />

          <hr/>

          <Select
            name="background_animation"
            value={background_animation}
            options={[...config.background_animations.free, ...config.background_animations.pro]}
            label={__('Background animation', 'wpmusicgallery')}
            help={__('Select type of background animation', 'wpmusicgallery')}
            placeholder={__('None', 'wpmusicgallery')}
          />

          {background_animation && (
            <>
              <Color
                name="background_animation_options.accent"
                value={background_animation_options?.accent}
                label={__('Accent color', 'wpmusicgallery')}
              />

              <Color
                name="background_animation_options.accent"
                value={background_animation_options?.accent}
                label={__('Accent color', 'wpmusicgallery')}
              />
            </>
          )}

          <hr/>

          <Select
            name="overlay_animation"
            value={overlay_animation}
            options={[...config.overlay_animations.free, ...config.overlay_animations.pro]}
            label={__('Overlay animation', 'wpmusicgallery')}
            help={__('Select type of overlay animation', 'wpmusicgallery')}
            placeholder={__('None', 'wpmusicgallery')}
          />

          {overlay_animation && (
            <>
              <Color
                name="overlay_animation_options.accent"
                value={overlay_animation_options?.accent}
                label={__('Accent color', 'wpmusicgallery')}
              />
            </>
          )}

        </PanelBody>
      </InspectorControls>
    </BlockContext.Provider>
  );
}
