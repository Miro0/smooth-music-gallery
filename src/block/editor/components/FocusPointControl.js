import {BaseControl, Button, FocalPointPicker, SelectControl} from "@wordpress/components";
import {__} from "@wordpress/i18n";
import {useEffect, useMemo, useState} from "@wordpress/element";
import {fromFocalPointPickerValue, toFocalPointPickerValue} from "../../utils/media";

const getImageLabel = (item, index) => {
  const fileLabel = item?.filename || item?.title || item?.name || item?.alt;

  if (fileLabel) {
    return fileLabel;
  }

  const urlLabel = item?.url?.split('/')?.pop()?.split('?')?.[0];

  if (urlLabel) {
    return urlLabel;
  }

  return `${__('Image', 'smooth-music-gallery')} ${index + 1}`;
};

export default function FocusPointControl({
  name,
  value = [],
  setAttributes,
  label,
  help,
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const images = Array.isArray(value)
    ? value
        .map((item, index) => ({
          item,
          originalIndex: index,
        }))
        .filter(({item}) => item?.url)
    : [];

  useEffect(() => {
    if (selectedIndex >= images.length) {
      setSelectedIndex(0);
    }
  }, [images.length, selectedIndex]);

  const imageOptions = useMemo(() => {
    return images.map(({item}, index) => ({
      label: getImageLabel(item, index),
      value: String(index),
    }));
  }, [images]);

  if (!images.length) {
    return null;
  }

  const selectedImage = images[selectedIndex] || images[0];
  const updateSelectedImage = (changes) => {
    const nextImages = value.map((item, index) => {
      if (index !== selectedImage.originalIndex) {
        return item;
      }

      return {
        ...item,
        ...changes,
      };
    });

    setAttributes({
      [name]: nextImages,
    });
  };

  const resetFocusPoint = () => {
    const nextImages = value.map((item, index) => {
      if (index !== selectedImage.originalIndex) {
        return item;
      }

      const {focus, ...nextItem} = item;

      return nextItem;
    });

    setAttributes({
      [name]: nextImages,
    });
  };

  return (
    <BaseControl
      label={label}
      help={help}
      __nextHasNoMarginBottom
    >
      <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
        {images.length > 1 && (
          <SelectControl
            label={__('Image', 'smooth-music-gallery')}
            value={String(selectedIndex)}
            options={imageOptions}
            onChange={(nextValue) => setSelectedIndex(Number(nextValue))}
            __next40pxDefaultSize
            __nextHasNoMarginBottom
          />
        )}

        <FocalPointPicker
          label={__('Focus point', 'smooth-music-gallery')}
          hideLabelFromVision
          url={selectedImage.item.url}
          value={toFocalPointPickerValue(selectedImage.item?.focus)}
          onDrag={(nextPoint) => updateSelectedImage({focus: fromFocalPointPickerValue(nextPoint)})}
          onChange={(nextPoint) => updateSelectedImage({focus: fromFocalPointPickerValue(nextPoint)})}
          __nextHasNoMarginBottom
        />

        <div style={{fontSize: '12px', color: '#6b7280'}}>
          {__('Drag the marker to keep the important part of the image visible when using cover cropping.', 'smooth-music-gallery')}
        </div>

        <Button
          variant="secondary"
          onClick={resetFocusPoint}
        >
          {__('Reset focus point', 'smooth-music-gallery')}
        </Button>
      </div>
    </BaseControl>
  );
}
