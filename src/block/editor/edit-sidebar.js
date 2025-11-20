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
    size,
    slides_duration,
    background,
    background_options,
    overlay,
    overlay_options,
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
          title={__('Gallery', 'wpmusicgallery')}
          initialOpen={false}
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
            name="size"
            value={size ?? 85}
            label={__('Size', 'wpmusicgallery')}
            help={__('How much space gallery takes and leaves space for background', 'wpmusicgallery')}
            min={50}
            max={90}
            step={1}
          />

          <hr/>

          <Range
            name="slides_duration"
            value={slides_duration}
            label={__('Slide change time', 'wpmusicgallery')}
            help={__('How long it will take to change slides when playing in seconds', 'wpmusicgallery')}
          />
        </PanelBody>

        <PanelBody
          title={__('Overlay', 'wpmusicgallery')}
          initialOpen={false}
        >
          <Select
            name="overlay"
            value={overlay}
            options={config.overlays}
            label={__('Overlay', 'wpmusicgallery')}
            help={__('Select type of overlay', 'wpmusicgallery')}
            placeholder={__('None', 'wpmusicgallery')}
          />

          {overlay && (
            <>
              <Color
                name="overlay_options.accent"
                value={overlay_options?.accent ?? '#ffffff'}
                label={__('Accent color', 'wpmusicgallery')}
              />
              <Range
                name="overlay_options.opacity"
                value={overlay_options?.opacity ?? 0.5}
                label={__('Opacity', 'wpmusicgallery')}
                min={0.1}
                max={1}
                step={0.05}
              />

              {overlay === 'free/equalizer_bars' && (
                <>
                  <Range
                    name="overlay_options.bars"
                    value={overlay_options?.bars ?? 32}
                    label={__('Amount of bars', 'wpmusicgallery')}
                    help={__('On mobile this amount is split by half', 'wpmusicgallery')}
                    min={16}
                    max={128}
                    step={1}
                  />
                  <Range
                    name="overlay_options.max_height"
                    value={overlay_options?.max_height ?? 95}
                    label={__('Max height of bars', 'wpmusicgallery')}
                    help={__('How much space of gallery area bars can take in percentage', 'wpmusicgallery')}
                    min={10}
                    max={100}
                    step={1}
                  />
                </>
              )}

              {overlay === 'free/wave_line' && (
                <>
                  <Range
                    name="overlay_options.position"
                    value={overlay_options?.position ?? 0}
                    label={__('Position [%]', 'wpmusicgallery')}
                    help={__('Where 0 is center, -50 is top and 50 is bottom', 'wpmusicgallery')}
                    min={-50}
                    max={50}
                    step={1}
                  />
                  <Range
                    name="overlay_options.line_height"
                    value={overlay_options?.line_height ?? 4}
                    label={__('Line thickness', 'wpmusicgallery')}
                    min={1}
                    max={120}
                    step={1}
                  />
                  <Range
                    name="overlay_options.intensity"
                    value={overlay_options?.intensity ?? 1}
                    label={__('Intensity', 'wpmusicgallery')}
                    help={__('How strong wave amplitude can be', 'wpmusicgallery')}
                    min={0.2}
                    max={3}
                    step={0.2}
                  />
                </>
              )}

              {overlay === 'pro/audio_pulse' && (
                <>
                  <Range
                    name="overlay_options.intensity"
                    value={overlay_options?.intensity ?? 1}
                    label={__('Intensity', 'wpmusicgallery')}
                    help={__('How much dots can stretch', 'wpmusicgallery')}
                    min={0.1}
                    max={1}
                    step={0.1}
                  />
                  <Range
                    name="overlay_options.density"
                    value={overlay_options?.density ?? 0.2}
                    label={__('Density', 'wpmusicgallery')}
                    help={__('Amount of dots', 'wpmusicgallery')}
                    min={0.1}
                    max={1}
                    step={0.1}
                  />
                  <Range
                    name="overlay_options.speed"
                    value={overlay_options?.speed ?? 0.2}
                    label={__('Speed', 'wpmusicgallery')}
                    help={__('Movement speed', 'wpmusicgallery')}
                    min={0.1}
                    max={1}
                    step={0.1}
                  />
                  <Range
                    name="overlay_options.size"
                    value={overlay_options?.size ?? 8}
                    label={__('Size', 'wpmusicgallery')}
                    help={__('Size of dots', 'wpmusicgallery')}
                    min={6}
                    max={40}
                    step={1}
                  />
                </>
              )}
            </>
          )}
        </PanelBody>

        <PanelBody
          title={__('Background', 'wpmusicgallery')}
          initialOpen={false}
        >
          <Select
            name="background"
            value={background}
            options={config.backgrounds}
            label={__('Background', 'wpmusicgallery')}
            help={__('Select type of background', 'wpmusicgallery')}
            placeholder={__('None', 'wpmusicgallery')}
          />

          <Color
            name="background_options.background_color"
            value={background_options?.background_color}
            label={__('Background color', 'wpmusicgallery')}
          />

          {background && background !== 'free/blurred_photos' && (
            <Color
              name="background_options.accent"
              value={background_options?.accent}
              label={__('Accent color', 'wpmusicgallery')}
            />
          )}

          {background === 'free/ambient_glow' && (
            <>
              <Range
                name="background_options.intensity"
                value={background_options?.intensity ?? 1}
                label={__('Intensity', 'wpmusicgallery')}
                help={__('How strong ambient lights are', 'wpmusicgallery')}
                min={1}
                max={2}
                step={0.1}
              />
            </>
          )}

          {background === 'free/blurred_photos' && (
            <>
              <Range
                name="background_options.blur"
                value={background_options?.blur ?? 20}
                label={__('Blur', 'wpmusicgallery')}
                min={5}
                max={50}
                step={1}
              />
              <Range
                name="background_options.zoom"
                value={background_options?.zoom ?? 2}
                label={__('Zoom', 'wpmusicgallery')}
                min={1}
                max={3}
                step={0.1}
              />
              <Range
                name="background_options.opacity"
                value={background_options?.opacity ?? 0.5}
                label={__('Opacity', 'wpmusicgallery')}
                min={0.1}
                max={1}
                step={0.1}
              />
            </>
          )}

          {background === 'pro/orbital_pulse' && (
            <>
              <Range
                name="background_options.intensity"
                value={background_options?.intensity ?? 1}
                label={__('Intensity', 'wpmusicgallery')}
                help={__('How much dots amplitude big is', 'wpmusicgallery')}
                min={0.1}
                max={2}
                step={0.1}
              />
              <Range
                name="background_options.size"
                value={background_options?.size ?? 8}
                label={__('Size', 'wpmusicgallery')}
                help={__('Size of dots', 'wpmusicgallery')}
                min={2}
                max={40}
                step={1}
              />
              <Range
                name="background_options.density"
                value={background_options?.density ?? 0.5}
                label={__('Density', 'wpmusicgallery')}
                help={__('Amount of dots', 'wpmusicgallery')}
                min={0.1}
                max={1}
                step={0.1}
              />
              <Range
                name="background_options.radius"
                value={background_options?.radius ?? 90}
                label={__('Radius', 'wpmusicgallery')}
                min={60}
                max={100}
                step={1}
              />
              <Range
                name="background_options.opacity"
                value={background_options?.opacity ?? 0.5}
                label={__('Opacity', 'wpmusicgallery')}
                min={0.1}
                max={1}
                step={0.1}
              />
              <Range
                name="overlay_options.speed"
                value={overlay_options?.speed ?? 0.2}
                label={__('Speed', 'wpmusicgallery')}
                help={__('Movement speed', 'wpmusicgallery')}
                min={0.1}
                max={1}
                step={0.1}
              />
            </>
          )}
        </PanelBody>
      </InspectorControls>
    </BlockContext.Provider>
  );
}
