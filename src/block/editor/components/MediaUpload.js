import {BaseControl, Button} from "@wordpress/components";
import {__} from "@wordpress/i18n";
import {useBlockContext} from "../context";

const MediaUpload = (
  {
    name,
    value,
    label,
    help,
    allowedTypes = ['image'],
    multiple = false,
  }
) => {
  const {changeAttribute} = useBlockContext();

  const openMedia = () => {
    const frame = wp.media({
      title: __('Select media', 'wp-music-gallery'),
      multiple: multiple,
      library: {type: allowedTypes},
    });

    frame.on('select', () => {
      const selection = frame.state().get('selection');

      if (multiple) {
        const items = selection.map(file => file.toJSON());
        changeAttribute(name, items);
      } else {
        const file = selection.first().toJSON();
        changeAttribute(name, file);
      }
    });

    frame.open();
  };

  const clearValue = () => {
    if (multiple) {
      changeAttribute(name, []);
    } else {
      changeAttribute(name, {});
    }
  };

  const renderLabel = () => {
    if (multiple) {
      return value?.length
        ? `${value.length} ${__('selected', 'wp-music-gallery')}`
        : __('Select', 'wp-music-gallery');
    }

    return value?.filename ? value.filename : __('Select', 'wp-music-gallery');
  };

  const hasValue = multiple
    ? Array.isArray(value) && value.length > 0
    : !!value?.id;

  return (
    <BaseControl label={label} help={help} __nextHasNoMarginBottom>
      <div style={{display: 'flex', gap: '8px'}}>
        <Button onClick={openMedia} variant="secondary">
          {renderLabel()}
        </Button>

        {hasValue && (
          <Button
            onClick={clearValue}
            variant="secondary"
            isDestructive
          >
            {__('Clear', 'wp-music-gallery')}
          </Button>
        )}
      </div>
    </BaseControl>
  );
};

export default MediaUpload;
