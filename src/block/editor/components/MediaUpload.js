import {BaseControl, Button} from "@wordpress/components";
import {__} from "@wordpress/i18n";
import {useBlockContext} from "../context";
import {useMemo, useState} from "@wordpress/element";
import {AssetPickerModal} from "@smoothbundle/asset-picker/react";
import {normalizeFocusPoint} from "../../utils/media";
import '@smoothbundle/asset-picker/styles.css';

const SMOOTHBUNDLE_USER_SLUG = 'smoothbundle';
const SMOOTHBUNDLE_PROJECT_SLUG = 'assets';
const SMOOTHBUNDLE_VERSION = 'latest';

const MediaUpload = (
  {
    name,
    value,
    label,
    help,
    allowedTypes = ['image'],
    multiple = false,
    source = 'core',
  }
) => {
  const {changeAttribute} = useBlockContext();
  const [smoothCdnOpen, setSmoothCdnOpen] = useState(false);
  const resolvedSource = source === 'smoothbundle' ? 'smoothbundle' : 'core';
  const supportsSmoothCdn = resolvedSource === 'smoothbundle' && (allowedTypes.includes('image') || allowedTypes.includes('audio'));
  const selectedUrls = useMemo(() => {
    if (multiple) {
      return Array.isArray(value)
        ? value.map((item) => item?.url).filter(Boolean)
        : [];
    }

    return value?.url ? [value.url] : [];
  }, [value, multiple]);

  const currentItems = useMemo(() => {
    if (multiple) {
      return Array.isArray(value) ? value : [];
    }

    return value ? [value] : [];
  }, [value, multiple]);

  const getExistingAsset = (asset) => {
    return currentItems.find((item) => {
      if (asset?.id && item?.id) {
        return asset.id === item.id;
      }

      if (asset?.url && item?.url) {
        return asset.url === item.url;
      }

      return false;
    });
  };

  const mergeExistingFocus = (asset) => {
    const existingAsset = getExistingAsset(asset);
    const existingFocus = normalizeFocusPoint(existingAsset?.focus);

    if (!existingFocus) {
      return asset;
    }

    return {
      ...asset,
      focus: existingFocus,
    };
  };

  const createExternalAsset = (asset) => {
    if (!asset?.url) {
      return null;
    }

    const filename = asset.name || asset.url.split('/').pop()?.split('?')?.[0] || '';
    const existingAsset = getExistingAsset(asset);
    const focus = asset?.meta?.focus;
    const normalizedFocus = normalizeFocusPoint(existingAsset?.focus) || normalizeFocusPoint(focus);

    const nextAsset = {
      url: asset.url,
      filename,
      name: asset.name || filename,
    };

    if (normalizedFocus) {
      nextAsset.focus = normalizedFocus;
    }

    return nextAsset;
  };

  const mapSelectedSmoothCdnAssets = (assets) => {
    const formattedAssets = assets
      .map((asset) => createExternalAsset(asset))
      .filter(Boolean);

    if (multiple) {
      return formattedAssets;
    }

    return formattedAssets[0] || {};
  };

  const clearValue = () => {
    if (multiple) {
      changeAttribute(name, []);
    } else {
      changeAttribute(name, {});
    }
  };

  const openMedia = () => {
    if (resolvedSource !== 'core') {
      return;
    }

    const frame = wp.media({
      title: __('Select media', 'smooth-music-gallery'),
      multiple: multiple,
      library: {type: allowedTypes},
    });

    frame.on('open', () => {
      const selection = frame.state().get('selection');
      const selectedIds = multiple
        ? (Array.isArray(value) ? value.map((item) => item?.id).filter(Boolean) : [])
        : (value?.id ? [value.id] : []);

      selectedIds.forEach((id) => {
        const attachment = wp.media.attachment(id);
        attachment.fetch();
        selection.add(attachment);
      });
    });

    frame.on('select', () => {
      const selection = frame.state().get('selection');

      if (multiple) {
        const items = selection.map(file => mergeExistingFocus(file.toJSON()));
        changeAttribute(name, items);
      } else {
        const file = mergeExistingFocus(selection.first().toJSON());
        changeAttribute(name, file);
      }
    });

    frame.open();
  };

  const openSmoothCdnMedia = () => {
    if (resolvedSource !== 'smoothbundle') {
      return;
    }

    setSmoothCdnOpen(true);
  };

  const renderLabel = () => {
    if (multiple) {
      return value?.length
        ? `${value.length} ${__('selected', 'smooth-music-gallery')}`
        : __('Select', 'smooth-music-gallery');
    }

    return value?.filename || value?.name || value?.url || __('Select', 'smooth-music-gallery');
  };

  const hasValue = multiple
    ? Array.isArray(value) && value.length > 0
    : resolvedSource === 'smoothbundle' ? !!value?.url : !!value?.id;

  return (
    <BaseControl label={label} help={help} __nextHasNoMarginBottom>
      <div style={{display: 'flex', gap: '8px'}}>
        {resolvedSource === 'core' && (
          <Button onClick={openMedia} variant="secondary">
            {renderLabel()}
          </Button>
        )}

        {supportsSmoothCdn && (
          <Button onClick={openSmoothCdnMedia} variant="secondary">
            {renderLabel()}
          </Button>
        )}
      </div>
      <div style={{display: 'flex', gap: '8px', marginTop: '8px'}}>
        {hasValue && (
          <Button
            onClick={clearValue}
            variant="secondary"
            isDestructive
          >
            {__('Clear', 'smooth-music-gallery')}
          </Button>
        )}
      </div>
      {supportsSmoothCdn && (
        <AssetPickerModal
          open={smoothCdnOpen}
          onOpenChange={setSmoothCdnOpen}
          title={__('Select assets', 'smooth-music-gallery')}
          userSlug={SMOOTHBUNDLE_USER_SLUG}
          projectSlug={SMOOTHBUNDLE_PROJECT_SLUG}
          version={SMOOTHBUNDLE_VERSION}
          fileType={allowedTypes.includes('audio') ? 'audio' : 'image'}
          multiple={multiple}
          selected={selectedUrls}
          onSelectionChange={(selectedUrlsFromPicker, selectedAssets) => {
            const resolvedAssets = selectedAssets?.length
              ? selectedAssets
              : selectedUrlsFromPicker.map((url) => ({url}));

            changeAttribute(name, mapSelectedSmoothCdnAssets(resolvedAssets));
          }}
          onClear={clearValue}
        />
      )}
    </BaseControl>
  );
};

export default MediaUpload;
