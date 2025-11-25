import {Button, PanelBody} from '@wordpress/components';
import {__} from '@wordpress/i18n';

import Color from './components/Color';
import MediaUpload from './components/MediaUpload';
import Select from "./components/Select";
import Range from "./components/Range";

const blendModePresets = [
  {
    label: __('Grayscale Fade', 'wpmusicgallery'),
    color: '#FFFFFF',
    blendMode: 'luminosity',
  },
  {
    label: __('Warm Glow', 'wpmusicgallery'),
    color: '#FFB86C',
    blendMode: 'overlay',
  },
  {
    label: __('Cold Glow', 'wpmusicgallery'),
    color: '#6ECBFF',
    blendMode: 'overlay',
  },
  {
    label: __('Neon Magenta', 'wpmusicgallery'),
    color: '#FF00FF',
    blendMode: 'screen',
  },
  {
    label: __('Neon Blue', 'wpmusicgallery'),
    color: '#00BBFF',
    blendMode: 'screen',
  },
  {
    label: __('Duotone Blue/Pink', 'wpmusicgallery'),
    color: '#8F7AFF',
    blendMode: 'color',
  },
  {
    label: __('Vintage Fade', 'wpmusicgallery'),
    color: '#d6b48c',
    blendMode: 'multiply',
  },
  {
    label: __('Soft Pastel Pink', 'wpmusicgallery'),
    color: '#FFD1E8',
    blendMode: 'soft-light',
  },
  {
    label: __('Deep Contrast', 'wpmusicgallery'),
    color: '#000000',
    blendMode: 'hard-light',
  },
  {
    label: __('Dreamy Purple', 'wpmusicgallery'),
    color: '#C77BFF',
    blendMode: 'overlay',
  },
];


export default function EditSidebar({attributes, setAttributes, config}) {
  const {
    photos,
    music,
    theme = 'default',
    theme_options = {},
    size,
    slides_duration,
    background,
    background_options,
    overlay,
    overlay_options,
  } = attributes;

  // @TODO Handle theme PRO blockage.
  // @TODO Handle per animation specific settings + PRO blockage.
  // @TODO Probably easiest to ping Powered CDN to check pro assets and if fails - show error below Powered by... - check should be done once per Editor session or rarer.
  return (
    <>
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

        <Color
          name="theme_options.accent"
          value={theme_options?.accent ?? '#ffffff'}
          label={__('Accent color', 'wpmusicgallery')}
        />

        <Color
          name="theme_options.frame_color"
          value={theme_options?.frame_color ?? '#111111'}
          label={__('Frame color', 'wpmusicgallery')}
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
            {overlay === 'pro/color_blend' && (
              <>
                <PanelBody
                  title={__('Presets', 'wpmusicgallery')}
                  initialOpen={false}
                >
                  <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                    {blendModePresets.map(({label, color, blendMode}, index) => (
                      <Button
                        key={`color-blend-preset-${index}`}
                        variant="secondary"
                        text={label}
                        onClick={() => {
                          setTimeout(() => {
                            setAttributes({
                              overlay_options: {
                                ...overlay_options,
                                accent: color,
                                blend_mode: blendMode,
                              }
                            })
                          }, 0);
                        }}
                        __next40pxDefaultSize
                      />
                    ))}
                  </div>
                </PanelBody>

                <hr/>
              </>
            )}

            {overlay !== 'pro/pixelate' && (
              <Color
                name="overlay_options.accent"
                value={overlay_options?.accent ?? '#ffffff'}
                label={__('Accent color', 'wpmusicgallery')}
              />
            )}

            {overlay !== 'pro/color_blend' && overlay !== 'pro/pixelate' && (
              <Range
                name="overlay_options.opacity"
                value={overlay_options?.opacity ?? 0.5}
                label={__('Opacity', 'wpmusicgallery')}
                min={0.1}
                max={1}
                step={0.05}
              />
            )}

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

            {(overlay === 'free/wave_line' || overlay === 'pro/heartbeat_line') && (
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
                  max={40}
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

            {(overlay === 'pro/heartbeat_line') && (
              <>
                <Range
                  name="overlay_options.smoothness"
                  value={overlay_options?.smoothness ?? 0.5}
                  label={__('Smoothness', 'wpmusicgallery')}
                  help={__('Amplitude smoothness', 'wpmusicgallery')}
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
                  max={60}
                  step={1}
                />
              </>
            )}

            {overlay === 'pro/color_blend' && (
              <>
                <Select
                  name="overlay_options.blend_mode"
                  value={overlay_options?.blend_mode ?? 'multiply'}
                  label={__('Color blend', 'wpmusicgallery')}
                  help={__('How overlay color blends in with gallery', 'wpmusicgallery')}
                  options={[
                    'multiply',
                    'screen',
                    'overlay',
                    'darken',
                    'lighten',
                    'color-dodge',
                    'color-burn',
                    'hard-light',
                    'soft-light',
                    'difference',
                    'exclusion',
                    'hue',
                    'saturation',
                    'color',
                    'luminosity',
                  ]}
                />
              </>
            )}

            {overlay === 'pro/pixelate' && (
              <>
                <Range
                  name="overlay_options.max_size"
                  value={overlay_options?.max_size ?? 20}
                  label={__('Max size', 'wpmusicgallery')}
                  help={__('Maximum size of pixel', 'wpmusicgallery')}
                  min={2}
                  max={80}
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

        {background && background !== 'pro/blurred_photos' && (
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

        {background === 'free/orbital_pulse' && (
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
              max={60}
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
              name="background_options.speed"
              value={background_options?.speed ?? 0.2}
              label={__('Speed', 'wpmusicgallery')}
              help={__('Movement speed', 'wpmusicgallery')}
              min={0.1}
              max={1}
              step={0.1}
            />
          </>
        )}

        {background === 'pro/blurred_photos' && (
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

        {background === 'pro/dust_particles' && (
          <>
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
              name="background_options.opacity"
              value={background_options?.opacity ?? 0.5}
              label={__('Opacity', 'wpmusicgallery')}
              min={0.1}
              max={1}
              step={0.1}
            />
            <Range
              name="background_options.min_size"
              value={background_options?.min_size ?? 8}
              label={__('Min size', 'wpmusicgallery')}
              help={__('Minimum size of dust particle', 'wpmusicgallery')}
              min={1}
              max={background_options?.max_size ?? 16}
              step={1}
            />
            <Range
              name="background_options.max_size"
              value={background_options?.max_size ?? 16}
              label={__('Max size', 'wpmusicgallery')}
              help={__('Maximum size of dust particle', 'wpmusicgallery')}
              min={background_options?.min_size ?? 8}
              max={120}
              step={1}
            />
          </>
        )}
      </PanelBody>
    </>

  );
}
