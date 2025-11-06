import {
  InspectorControls,
  MediaUpload,
  MediaUploadCheck,
  ColorPalette
} from '@wordpress/block-editor';
import {
  BaseControl,
  PanelBody,
  Button,
  ComboboxControl,
  RangeControl,
  __experimentalVStack as VStack,
} from '@wordpress/components';
import {__} from '@wordpress/i18n';

const capitalizeWords = str => str.replace(/\b\w/g, c => c.toUpperCase());

export default function EditSidebar({attributes, setAttributes, config}) {
  const {
    photos,
    music,
    theme = 'default',
    slides_duration,
    aspect_ratio,
    background_animation,
    background_animation_accent_color,
    overlay_animation,
    overlay_animation_accent_color,
    image_animation,
  } = attributes;

  return (
    <InspectorControls>
      <PanelBody
        title={__('Gallery settings', 'wpmusicgallery')}
        initialOpen={true}
      >

        <MediaUploadCheck>
          <BaseControl
            label={__('Gallery images', 'wpmusicgallery')}
            help={__('Select image to be used in gallery', 'wpmusicgallery')}
            __nextHasNoMarginBottom
          >
            <div style={{display: 'flex', gap: '8px'}}>
              <MediaUpload
                onSelect={(media) => setAttributes({photos: media})}
                allowedTypes={['image']}
                multiple
                gallery
                value={photos?.map((img) => img.id)}
                render={({open}) => (
                  <Button onClick={open} variant="secondary">
                    {photos?.length
                      ? photos.length + ' ' + __('selected', 'wpmusicgallery')
                      : __('Add', 'wpmusicgallery')}
                  </Button>
                )}
              />

              {photos?.length > 0 && (
                <Button
                  onClick={() => setAttributes({photos: []})}
                  variant="secondary"
                  isDestructive
                >
                  {__('Clear', 'wpmusicgallery')}
                </Button>
              )}
            </div>
          </BaseControl>
        </MediaUploadCheck>

        <hr/>

        <MediaUploadCheck>
          <BaseControl
            label={__('Background music', 'wpmusicgallery')}
            help={__('Select music to be played as a background in gallery', 'wpmusicgallery')}
            __nextHasNoMarginBottom
          >
            <div style={{display: 'flex', gap: '8px'}}>
              <MediaUpload
                onSelect={(media) => setAttributes({music: media})}
                allowedTypes={['audio']}
                multiple={false}
                value={music?.id}
                render={({open}) => (
                  <Button onClick={open} variant="secondary">
                    {music ? music.filename : __('Add', 'wpmusicgallery')}
                  </Button>
                )}
              />
            </div>
          </BaseControl>
        </MediaUploadCheck>

        <hr/>

        <BaseControl
          label={__('Theme', 'wpmusicgallery')}
          help={__('Select general gallery theme', 'wpmusicgallery')}
          __nextHasNoMarginBottom
        >
          <ComboboxControl
            value={theme}
            options={config.themes.map((theme) => {
              const formattedTheme = capitalizeWords(theme.replace(/_/g, ' '));

              return {
                label: __(formattedTheme, 'wpmusicgallery'),
                value: theme,
              }
            })}
            onChange={(val) => setAttributes({theme: val})}
            placeholder={__('Default', 'wpmusicgallery')}
            __next40pxDefaultSize
            __nextHasNoMarginBottom
          />
        </BaseControl>

        <hr/>

        <BaseControl
          label={__('Slide change time', 'wpmusicgallery')}
          help={__('How long it will take to change slides when playing in seconds', 'wpmusicgallery')}
          __nextHasNoMarginBottom
        >
          <RangeControl
            value={slides_duration}
            onChange={(val) => setAttributes({slides_duration: val})}
            min={1}
            max={10}
            step={0.5}
            __next40pxDefaultSize
            __nextHasNoMarginBottom
          />
        </BaseControl>

        <hr/>

        <BaseControl
          label={__('Gallery ratio', 'wpmusicgallery')}
          help={__('Select if you want to force desired aspect ratio', 'wpmusicgallery')}
          __nextHasNoMarginBottom
        >
          <ComboboxControl
            value={aspect_ratio}
            options={[
              {label: __('Auto', 'wpmusicgallery'), value: ''},
              {label: '1:1', value: '1-1'},
              {label: '4:3', value: '4-3'},
              {label: '16:9', value: '16-9'},
            ]}
            placeholder={__('Auto', 'wpmusicgallery')}
            onChange={(val) => setAttributes({aspect_ratio: val})}
            __next40pxDefaultSize
            __nextHasNoMarginBottom
          />
        </BaseControl>

        <hr/>

        <BaseControl
          label={__('Background animation', 'wpmusicgallery')}
          help={__('Select type of background animation and it\'s accent color', 'wpmusicgallery')}
          __nextHasNoMarginBottom
        >
          <ComboboxControl
            value={background_animation}
            options={[
              {label: __('None', 'wpmusicgallery'), value: ''},
              ...config.background_animations.map((backgroundAnimation) => {
                const formattedName = capitalizeWords(backgroundAnimation.replace(/_/g, ' '));

                return {
                  label: __(formattedName, 'wpmusicgallery'),
                  value: backgroundAnimation,
                }
              })
            ]}
            onChange={(val) => setAttributes({background_animation: val})}
            placeholder={__('None', 'wpmusicgallery')}
            __next40pxDefaultSize
            __nextHasNoMarginBottom
          />

          <VStack spacing="4" style={{marginTop: 10}}>
            <ColorPalette
              value={background_animation_accent_color}
              onChange={(color) => setAttributes({background_animation_accent_color: color})}
            />
          </VStack>
        </BaseControl>

        <hr />

        <BaseControl
          label={__('Overlay animation', 'wpmusicgallery')}
          help={__('Select type of overlay animation and it\'s accent color', 'wpmusicgallery')}
          __nextHasNoMarginBottom
        >
          <ComboboxControl
            value={overlay_animation}
            options={[
              {label: __('None', 'wpmusicgallery'), value: ''},
              ...config.overlay_animations.map((overlayAnimation) => {
                const formattedName = capitalizeWords(overlayAnimation.replace(/_/g, ' '));

                return {
                  label: __(formattedName, 'wpmusicgallery'),
                  value: overlayAnimation,
                }
              })
            ]}
            onChange={(val) => setAttributes({overlay_animation: val})}
            placeholder={__('None', 'wpmusicgallery')}
            __next40pxDefaultSize
            __nextHasNoMarginBottom
          />

          <VStack spacing="4" style={{marginTop: 10}}>
            <ColorPalette
              value={overlay_animation_accent_color}
              onChange={(color) => setAttributes({overlay_animation_accent_color: color})}
            />
          </VStack>
        </BaseControl>

        <BaseControl
          label={__('Image animation', 'wpmusicgallery')}
          help={__('Select type of image animation', 'wpmusicgallery')}
          __nextHasNoMarginBottom
        >
          <ComboboxControl
            value={image_animation}
            options={[
              {label: __('None', 'wpmusicgallery'), value: ''},
              ...config.image_animations.map((imageAnimation) => {
                const formattedName = capitalizeWords(imageAnimation.replace(/_/g, ' '));

                return {
                  label: __(formattedName, 'wpmusicgallery'),
                  value: imageAnimation,
                }
              })
            ]}
            onChange={(val) => setAttributes({image_animation: val})}
            placeholder={__('None', 'wpmusicgallery')}
            __next40pxDefaultSize
            __nextHasNoMarginBottom
          />
        </BaseControl>

      </PanelBody>
    </InspectorControls>
  );
}
