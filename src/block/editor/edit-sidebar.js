import {Button, PanelBody} from '@wordpress/components';
import {__} from '@wordpress/i18n';

import Color from './components/Color';
import MediaUpload from './components/MediaUpload';
import Select from "./components/Select";
import Range from "./components/Range";

const blendModePresets = [
  {
    label: __('Grayscale Fade', 'music-gallery'),
    color: '#FFFFFF',
    blendMode: 'luminosity',
  },
  {
    label: __('Warm Glow', 'music-gallery'),
    color: '#FFB86C',
    blendMode: 'overlay',
  },
  {
    label: __('Cold Glow', 'music-gallery'),
    color: '#6ECBFF',
    blendMode: 'overlay',
  },
  {
    label: __('Neon Magenta', 'music-gallery'),
    color: '#FF00FF',
    blendMode: 'screen',
  },
  {
    label: __('Neon Blue', 'music-gallery'),
    color: '#00BBFF',
    blendMode: 'screen',
  },
  {
    label: __('Duotone Blue/Pink', 'music-gallery'),
    color: '#8F7AFF',
    blendMode: 'color',
  },
  {
    label: __('Vintage Fade', 'music-gallery'),
    color: '#d6b48c',
    blendMode: 'multiply',
  },
  {
    label: __('Soft Pastel Pink', 'music-gallery'),
    color: '#FFD1E8',
    blendMode: 'soft-light',
  },
  {
    label: __('Deep Contrast', 'music-gallery'),
    color: '#000000',
    blendMode: 'hard-light',
  },
  {
    label: __('Dreamy Purple', 'music-gallery'),
    color: '#C77BFF',
    blendMode: 'overlay',
  },
];


export default function EditSidebar({attributes, setAttributes, config}) {
  const {
    photos,
    photos_cdn = [],
    photos_source = 'wp',
    music,
    music_cdn = {},
    music_source = 'wp',
    theme = 'default',
    theme_options = {},
    size,
    slides_duration,
    background,
    background_options,
    overlay,
    overlay_options,
  } = attributes;

  return (
    <>
      <p style={{ paddingRight: '16px', paddingLeft: '52px', paddingBottom: '12px' }}>Powered by <a style={{ color: '#0ea5e9' }} href="https://smoothcdn.com" target="_blank">Smooth CDN</a></p>

      <PanelBody
        title={__('Gallery', 'music-gallery')}
        initialOpen={false}
      >
        <Select
          name="photos_source"
          value={photos_source}
          options={[
            {label: __('Media Library', 'music-gallery'), value: 'wp'},
            {label: __('Smooth CDN assets', 'music-gallery'), value: 'smoothcdn'},
          ]}
          label={__('Images source', 'music-gallery')}
          help={__('Choose where images should be selected from', 'music-gallery')}
        />

        <MediaUpload
          name={photos_source === 'smoothcdn' ? 'photos_cdn' : 'photos'}
          value={photos_source === 'smoothcdn' ? photos_cdn : photos}
          label={__('Images', 'music-gallery')}
          help={__('Select image to be used in gallery. Hold SHIFT to select multiple images', 'music-gallery')}
          multiple={true}
          source={photos_source === 'smoothcdn' ? 'smoothcdn' : 'wp'}
        />

        <hr/>

        <Select
          name="music_source"
          value={music_source}
          options={[
            {label: __('Media Library', 'music-gallery'), value: 'wp'},
            {label: __('Smooth CDN assets', 'music-gallery'), value: 'smoothcdn'},
          ]}
          label={__('Music source', 'music-gallery')}
          help={__('Choose where background music should be selected from', 'music-gallery')}
        />

        <MediaUpload
          name={music_source === 'smoothcdn' ? 'music_cdn' : 'music'}
          value={music_source === 'smoothcdn' ? music_cdn : music}
          label={__('Background music', 'music-gallery')}
          help={__('Select music to be played as a background in gallery', 'music-gallery')}
          allowedTypes={['audio']}
          source={music_source === 'smoothcdn' ? 'smoothcdn' : 'wp'}
        />

        <hr/>

        <Select
          name="theme"
          value={theme}
          options={config.themes}
          label={__('Theme', 'music-gallery')}
          help={__('Select general gallery theme', 'music-gallery')}
          placeholder={__('Default', 'music-gallery')}
        />

        <Color
          name="theme_options.accent"
          value={theme_options?.accent ?? '#ffffff'}
          label={__('Accent color', 'music-gallery')}
        />

        <Color
          name="theme_options.frame_color"
          value={theme_options?.frame_color ?? '#111111'}
          label={__('Frame color', 'music-gallery')}
        />

        <hr/>

        <Range
          name="size"
          value={size ?? 85}
          label={__('Size', 'music-gallery')}
          help={__('How much space gallery takes and leaves space for background', 'music-gallery')}
          min={70}
          max={90}
          step={1}
        />

        <hr/>

        <Range
          name="slides_duration"
          value={slides_duration}
          label={__('Slide change time', 'music-gallery')}
          help={__('How long it will take to change slides when playing in seconds', 'music-gallery')}
        />
      </PanelBody>

      <PanelBody
        title={__('Overlay', 'music-gallery')}
        initialOpen={false}
      >
        <Select
          name="overlay"
          value={overlay}
          options={config.overlays}
          label={__('Overlay', 'music-gallery')}
          help={__('Select type of overlay', 'music-gallery')}
          placeholder={__('None', 'music-gallery')}
        />

        {overlay && (
          <>
            {overlay === 'color_blend' && (
              <>
                <PanelBody
                  title={__('Presets', 'music-gallery')}
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

            {overlay !== 'pixelate' && (
              <Color
                name="overlay_options.accent"
                value={overlay_options?.accent ?? '#ffffff'}
                label={__('Accent color', 'music-gallery')}
              />
            )}

            {overlay !== 'color_blend' && overlay !== 'pixelate' && (
              <Range
                name="overlay_options.opacity"
                value={overlay_options?.opacity ?? 0.5}
                label={__('Opacity', 'music-gallery')}
                min={0.1}
                max={1}
                step={0.05}
              />
            )}

            {overlay === 'equalizer_bars' && (
              <>
                <Range
                  name="overlay_options.bars"
                  value={overlay_options?.bars ?? 32}
                  label={__('Amount of bars', 'music-gallery')}
                  help={__('On mobile this amount is split by half', 'music-gallery')}
                  min={16}
                  max={128}
                  step={1}
                />
                <Range
                  name="overlay_options.max_height"
                  value={overlay_options?.max_height ?? 95}
                  label={__('Max height of bars', 'music-gallery')}
                  help={__('How much space of gallery area bars can take in percentage', 'music-gallery')}
                  min={10}
                  max={100}
                  step={1}
                />
              </>
            )}

            {(overlay === 'wave_line' || overlay === 'heartbeat_line') && (
              <>
                <Range
                  name="overlay_options.position"
                  value={overlay_options?.position ?? 0}
                  label={__('Position [%]', 'music-gallery')}
                  help={__('Where 0 is center, -50 is top and 50 is bottom', 'music-gallery')}
                  min={-50}
                  max={50}
                  step={1}
                />
                <Range
                  name="overlay_options.line_height"
                  value={overlay_options?.line_height ?? 4}
                  label={__('Line thickness', 'music-gallery')}
                  min={1}
                  max={40}
                  step={1}
                />
                <Range
                  name="overlay_options.intensity"
                  value={overlay_options?.intensity ?? 1}
                  label={__('Intensity', 'music-gallery')}
                  help={__('How strong wave amplitude can be', 'music-gallery')}
                  min={0.2}
                  max={3}
                  step={0.2}
                />
              </>
            )}

            {(overlay === 'heartbeat_line') && (
              <>
                <Range
                  name="overlay_options.smoothness"
                  value={overlay_options?.smoothness ?? 0.5}
                  label={__('Smoothness', 'music-gallery')}
                  help={__('Amplitude smoothness', 'music-gallery')}
                  min={0.1}
                  max={1}
                  step={0.1}
                />
                <Range
                  name="overlay_options.speed"
                  value={overlay_options?.speed ?? 0.2}
                  label={__('Speed', 'music-gallery')}
                  help={__('Movement speed', 'music-gallery')}
                  min={0.1}
                  max={1}
                  step={0.1}
                />
              </>
            )}

            {overlay === 'audio_pulse' && (
              <>
                <Range
                  name="overlay_options.intensity"
                  value={overlay_options?.intensity ?? 1}
                  label={__('Intensity', 'music-gallery')}
                  help={__('How much dots can stretch', 'music-gallery')}
                  min={0.1}
                  max={1}
                  step={0.1}
                />
                <Range
                  name="overlay_options.density"
                  value={overlay_options?.density ?? 0.2}
                  label={__('Density', 'music-gallery')}
                  help={__('Amount of dots', 'music-gallery')}
                  min={0.1}
                  max={1}
                  step={0.1}
                />
                <Range
                  name="overlay_options.speed"
                  value={overlay_options?.speed ?? 0.2}
                  label={__('Speed', 'music-gallery')}
                  help={__('Movement speed', 'music-gallery')}
                  min={0.1}
                  max={1}
                  step={0.1}
                />
                <Range
                  name="overlay_options.size"
                  value={overlay_options?.size ?? 8}
                  label={__('Size', 'music-gallery')}
                  help={__('Size of dots', 'music-gallery')}
                  min={6}
                  max={60}
                  step={1}
                />
              </>
            )}

            {overlay === 'color_blend' && (
              <>
                <Select
                  name="overlay_options.blend_mode"
                  value={overlay_options?.blend_mode ?? 'multiply'}
                  label={__('Color blend', 'music-gallery')}
                  help={__('How overlay color blends in with gallery', 'music-gallery')}
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

            {overlay === 'pixelate' && (
              <>
                <Range
                  name="overlay_options.max_size"
                  value={overlay_options?.max_size ?? 20}
                  label={__('Max size', 'music-gallery')}
                  help={__('Maximum size of pixel', 'music-gallery')}
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
        title={__('Background', 'music-gallery')}
        initialOpen={false}
      >
        <Select
          name="background"
          value={background}
          options={config.backgrounds}
          label={__('Background', 'music-gallery')}
          help={__('Select type of background', 'music-gallery')}
          placeholder={__('None', 'music-gallery')}
        />

        <Color
          name="background_options.background_color"
          value={background_options?.background_color}
          label={__('Background color', 'music-gallery')}
        />

        {background && background !== 'blurred_photos' && (
          <Color
            name="background_options.accent"
            value={background_options?.accent}
            label={__('Accent color', 'music-gallery')}
          />
        )}

        {background === 'ambient_glow' && (
          <>
            <Range
              name="background_options.intensity"
              value={background_options?.intensity ?? 1}
              label={__('Intensity', 'music-gallery')}
              help={__('How strong ambient lights are', 'music-gallery')}
              min={1}
              max={2}
              step={0.1}
            />
          </>
        )}

        {background === 'orbital_pulse' && (
          <>
            <Range
              name="background_options.intensity"
              value={background_options?.intensity ?? 1}
              label={__('Intensity', 'music-gallery')}
              help={__('How much dots amplitude big is', 'music-gallery')}
              min={0.1}
              max={2}
              step={0.1}
            />
            <Range
              name="background_options.size"
              value={background_options?.size ?? 8}
              label={__('Size', 'music-gallery')}
              help={__('Size of dots', 'music-gallery')}
              min={2}
              max={60}
              step={1}
            />
            <Range
              name="background_options.density"
              value={background_options?.density ?? 0.5}
              label={__('Density', 'music-gallery')}
              help={__('Amount of dots', 'music-gallery')}
              min={0.1}
              max={1}
              step={0.1}
            />
            <Range
              name="background_options.radius"
              value={background_options?.radius ?? 90}
              label={__('Radius', 'music-gallery')}
              min={60}
              max={100}
              step={1}
            />
            <Range
              name="background_options.opacity"
              value={background_options?.opacity ?? 0.5}
              label={__('Opacity', 'music-gallery')}
              min={0.1}
              max={1}
              step={0.1}
            />
            <Range
              name="background_options.speed"
              value={background_options?.speed ?? 0.2}
              label={__('Speed', 'music-gallery')}
              help={__('Movement speed', 'music-gallery')}
              min={0.1}
              max={1}
              step={0.1}
            />
          </>
        )}

        {background === 'blurred_photos' && (
          <>
            <Range
              name="background_options.blur"
              value={background_options?.blur ?? 20}
              label={__('Blur', 'music-gallery')}
              min={5}
              max={50}
              step={1}
            />
            <Range
              name="background_options.zoom"
              value={background_options?.zoom ?? 2}
              label={__('Zoom', 'music-gallery')}
              min={1}
              max={3}
              step={0.1}
            />
            <Range
              name="background_options.opacity"
              value={background_options?.opacity ?? 0.5}
              label={__('Opacity', 'music-gallery')}
              min={0.1}
              max={1}
              step={0.1}
            />
          </>
        )}

        {background === 'dust_particles' && (
          <>
            <Range
              name="background_options.density"
              value={background_options?.density ?? 0.5}
              label={__('Density', 'music-gallery')}
              help={__('Amount of dots', 'music-gallery')}
              min={0.1}
              max={1}
              step={0.1}
            />
            <Range
              name="background_options.opacity"
              value={background_options?.opacity ?? 0.5}
              label={__('Opacity', 'music-gallery')}
              min={0.1}
              max={1}
              step={0.1}
            />
            <Range
              name="background_options.min_size"
              value={background_options?.min_size ?? 8}
              label={__('Min size', 'music-gallery')}
              help={__('Minimum size of dust particle', 'music-gallery')}
              min={1}
              max={background_options?.max_size ?? 16}
              step={1}
            />
            <Range
              name="background_options.max_size"
              value={background_options?.max_size ?? 16}
              label={__('Max size', 'music-gallery')}
              help={__('Maximum size of dust particle', 'music-gallery')}
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
