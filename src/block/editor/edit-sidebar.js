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
    attributes
  });

  // @TODO Handle theme PRO blockage.
  // @TODO Handle per animation specific settings + PRO blockage.
  // @TODO Probably easiest to ping Powered CDN to check pro assets and if fails - show error below Powered by... - check should be done once per Editor session or rarer.
  return (
    <BlockContext.Provider value={{
      changeAttribute: (name, value) => {
        let newValuesToSet = {};
        if (name.includes('.')) {
          let [parent, child] = name.split('.');

          newValuesToSet[parent] = {
            ...(attributes[parent] || {}),
            [child]: value,
          };
        } else {
          newValuesToSet = {[name]: value};
        }

        setAttributes(newValuesToSet);
      }
    }}>
      <InspectorControls>
        {/*<p style={{ paddingRight: '16px', paddingLeft: '52px' }}>Powered by <a href="https://protectedcdn.com" target="_blank">Protected CDN</a></p>*/}

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
            options={config.themes}
            label={__('Theme', 'wpmusicgallery')}
            help={__('Select general gallery theme', 'wpmusicgallery')}
            placeholder={__('[Free] Default', 'wpmusicgallery')}
          />

          <hr/>

          <Range
            name="slides_duration"
            value={slides_duration}
            label={__('Slide change time', 'wpmusicgallery')}
            help={__('How long it will take to change slides when playing in seconds', 'wpmusicgallery')}
          />

          <hr/>

          {music?.filename && (
            <>
              <Select
                name="overlay_animation"
                value={overlay_animation}
                options={config.overlay_animations}
                label={__('Overlay animation', 'wpmusicgallery')}
                help={__('Select type of overlay animation', 'wpmusicgallery')}
                placeholder={__('None', 'wpmusicgallery')}
              />

              {overlay_animation && (
                <>
                  <Color
                    name="overlay_animation_options.accent"
                    value={overlay_animation_options?.accent ?? '#ffffff'}
                    label={__('Accent color', 'wpmusicgallery')}
                  />
                  <Range
                    name="overlay_animation_options.opacity"
                    value={overlay_animation_options?.opacity ?? 0.5}
                    label={__('Opacity', 'wpmusicgallery')}
                    min={0.1}
                    max={1}
                    step={0.05}
                  />

                  {overlay_animation === 'free/equalizer_bars' && (
                    <>
                      <Range
                        name="overlay_animation_options.bars"
                        value={overlay_animation_options?.bars ?? 32}
                        label={__('Amount of bars', 'wpmusicgallery')}
                        help={__('On mobile this amount is split by half', 'wpmusicgallery')}
                        min={16}
                        max={128}
                        step={1}
                      />
                      <Range
                        name="overlay_animation_options.max_height"
                        value={overlay_animation_options?.max_height ?? 95}
                        label={__('Max height of bars', 'wpmusicgallery')}
                        help={__('How much space of gallery area bars can take in percentage', 'wpmusicgallery')}
                        min={10}
                        max={100}
                        step={1}
                      />
                    </>
                  )}

                  {overlay_animation === 'free/wave_line' && (
                    <>
                      <Range
                        name="overlay_animation_options.position"
                        value={overlay_animation_options?.position ?? 0}
                        label={__('Position [%]', 'wpmusicgallery')}
                        help={__('Where 0 is center, -50 is top and 50 is bottom', 'wpmusicgallery')}
                        min={-50}
                        max={50}
                        step={1}
                      />
                      <Range
                        name="overlay_animation_options.line_height"
                        value={overlay_animation_options?.line_height ?? 4}
                        label={__('Line thickness', 'wpmusicgallery')}
                        min={1}
                        max={120}
                        step={1}
                      />
                      <Range
                        name="overlay_animation_options.intensity"
                        value={overlay_animation_options?.intensity ?? 1}
                        label={__('Intensity', 'wpmusicgallery')}
                        help={__('How strong wave amplitude can be', 'wpmusicgallery')}
                        min={0.2}
                        max={3}
                        step={0.2}
                      />
                    </>
                  )}
                </>
              )}

              <hr/>

              <Select
                name="background_animation"
                value={background_animation}
                options={config.background_animations}
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
                </>
              )}
            </>
          )}
        </PanelBody>
      </InspectorControls>
    </BlockContext.Provider>
  );
}
