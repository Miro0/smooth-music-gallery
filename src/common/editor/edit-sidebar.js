import {
  InspectorControls,
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

import {BlockContext} from "./context";
import MediaUpload from './components/MediaUpload';
import Select from "./components/Select";

const capitalizeWords = str => str.replace(/\b\w/g, c => c.toUpperCase());

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
    image_animation,
    image_animation_options,
  } = attributes;

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
            options={config.themes}
            label={__('Theme', 'wpmusicgallery')}
            help={__('Select general gallery theme', 'wpmusicgallery')}
            placeholder={__('Default', 'wpmusicgallery')}
          />

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

          {/*<BaseControl*/}
          {/*  label={__('Background animation', 'wpmusicgallery')}*/}
          {/*  help={__('Select type of background animation and it\'s accent color', 'wpmusicgallery')}*/}
          {/*  __nextHasNoMarginBottom*/}
          {/*>*/}
          {/*  <ComboboxControl*/}
          {/*    value={background_animation}*/}
          {/*    options={[*/}
          {/*      {label: __('None', 'wpmusicgallery'), value: ''},*/}
          {/*      ...config.background_animations.map((backgroundAnimation) => {*/}
          {/*        const formattedName = capitalizeWords(backgroundAnimation.replace(/_/g, ' '));*/}

          {/*        return {*/}
          {/*          label: __(formattedName, 'wpmusicgallery'),*/}
          {/*          value: backgroundAnimation,*/}
          {/*        }*/}
          {/*      })*/}
          {/*    ]}*/}
          {/*    onChange={(val) => setAttributes({background_animation: val})}*/}
          {/*    placeholder={__('None', 'wpmusicgallery')}*/}
          {/*    __next40pxDefaultSize*/}
          {/*    __nextHasNoMarginBottom*/}
          {/*  />*/}

          {/*  <VStack spacing="4" style={{marginTop: 10}}>*/}
          {/*    <ColorPalette*/}
          {/*      value={background_animation_accent_color}*/}
          {/*      onChange={(color) => setAttributes({background_animation_accent_color: color})}*/}
          {/*    />*/}
          {/*  </VStack>*/}
          {/*</BaseControl>*/}

          <hr/>

          {/*<BaseControl*/}
          {/*  label={__('Overlay animation', 'wpmusicgallery')}*/}
          {/*  help={__('Select type of overlay animation and it\'s accent color', 'wpmusicgallery')}*/}
          {/*  __nextHasNoMarginBottom*/}
          {/*>*/}
          {/*  <ComboboxControl*/}
          {/*    value={overlay_animation}*/}
          {/*    options={[*/}
          {/*      {label: __('None', 'wpmusicgallery'), value: ''},*/}
          {/*      ...config.overlay_animations.map((overlayAnimation) => {*/}
          {/*        const formattedName = capitalizeWords(overlayAnimation.replace(/_/g, ' '));*/}

          {/*        return {*/}
          {/*          label: __(formattedName, 'wpmusicgallery'),*/}
          {/*          value: overlayAnimation,*/}
          {/*        }*/}
          {/*      })*/}
          {/*    ]}*/}
          {/*    onChange={(val) => setAttributes({overlay_animation: val})}*/}
          {/*    placeholder={__('None', 'wpmusicgallery')}*/}
          {/*    __next40pxDefaultSize*/}
          {/*    __nextHasNoMarginBottom*/}
          {/*  />*/}

          {/*  <VStack spacing="4" style={{marginTop: 10}}>*/}
          {/*    <ColorPalette*/}
          {/*      value={overlay_animation_accent_color}*/}
          {/*      onChange={(color) => setAttributes({overlay_animation_accent_color: color})}*/}
          {/*    />*/}
          {/*  </VStack>*/}
          {/*</BaseControl>*/}

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
    </BlockContext.Provider>
  );
}
