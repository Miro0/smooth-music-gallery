import {BaseControl, Button} from "@wordpress/components";
import {__} from "@wordpress/i18n";
import {useBlockContext} from "../context";
import {useEffect, useMemo, useState} from "@wordpress/element";
import {AssetPickerBrowser, AssetPickerDialog} from "@smoothcdn/asset-picker/react";
import '@smoothcdn/asset-picker/styles.css';

const SMOOTHCDN_USER_SLUG = 'smoothcdn';
const SMOOTHCDN_PROJECT_SLUG = 'assets';
const SMOOTHCDN_VERSION = 'latest';

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
  const [smoothCdnAssets, setSmoothCdnAssets] = useState([]);
  const [selectedAssetPaths, setSelectedAssetPaths] = useState([]);
  const resolvedSource = source === 'smoothcdn' ? 'smoothcdn' : 'core';
  const supportsSmoothCdn = resolvedSource === 'smoothcdn' && (allowedTypes.includes('image') || allowedTypes.includes('audio'));
  const selectedUrls = useMemo(() => {
    if (multiple) {
      return Array.isArray(value)
        ? value.map((item) => item?.url).filter(Boolean)
        : [];
    }

    return value?.url ? [value.url] : [];
  }, [value, multiple]);

  const createExternalAsset = (url) => {
    const filename = url.split('/').pop()?.split('?')?.[0] || '';

    return {
      url,
      filename,
      name: filename,
    };
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
        const items = selection.map(file => file.toJSON());
        changeAttribute(name, items);
      } else {
        const file = selection.first().toJSON();
        changeAttribute(name, file);
      }
    });

    frame.open();
  };
  const openSmoothCdnMedia = () => {
    if (resolvedSource !== 'smoothcdn') {
      return;
    }

    setSmoothCdnOpen(true);
  };

  useEffect(() => {
    if (!smoothCdnOpen) {
      return;
    }

    const selectedSet = new Set(selectedUrls);
    const mappedPaths = smoothCdnAssets
      .filter((asset) => selectedSet.has(asset?.url))
      .map((asset) => asset?.path)
      .filter(Boolean);

    setSelectedAssetPaths(multiple ? mappedPaths : mappedPaths.slice(0, 1));
  }, [smoothCdnOpen, smoothCdnAssets, selectedUrls, multiple]);

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
        ? `${value.length} ${__('selected', 'smooth-music-gallery')}`
        : __('Select', 'smooth-music-gallery');
    }

    return value?.filename || value?.name || value?.url || __('Select', 'smooth-music-gallery');
  };

  const hasValue = multiple
    ? Array.isArray(value) && value.length > 0
    : resolvedSource === 'smoothcdn' ? !!value?.url : !!value?.id;

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
        <AssetPickerDialog
          open={smoothCdnOpen}
          onOpenChange={setSmoothCdnOpen}
          title={__('Select assets', 'smooth-music-gallery')}
        >
          <div className="flex max-h-[82vh] min-h-[360px] w-full flex-col gap-4">
            <AssetPickerBrowser
              open={smoothCdnOpen}
              userSlug={SMOOTHCDN_USER_SLUG}
              projectSlug={SMOOTHCDN_PROJECT_SLUG}
              version={SMOOTHCDN_VERSION}
              fileType={allowedTypes.includes('audio') ? 'audio' : 'image'}
              multiple={multiple}
              selectedAssetPaths={selectedAssetPaths}
              onSelectedAssetPathsChange={setSelectedAssetPaths}
              onAssetsChange={setSmoothCdnAssets}
            />
            <footer className="mt-1 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-3">
              <div className="text-xs text-slate-400">
                {'Selected: '}
                <span className="text-slate-200">{selectedAssetPaths.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAssetPaths([]);
                    if (multiple) {
                      changeAttribute(name, []);
                    } else {
                      changeAttribute(name, {});
                    }
                  }}
                  className="inline-flex h-9 items-center rounded-md border border-slate-700 px-3 text-sm text-slate-300 transition hover:bg-slate-900"
                >
                  {'Clear'}
                </button>
                <button
                  type="button"
                  onClick={() => setSmoothCdnOpen(false)}
                  className="inline-flex h-9 items-center rounded-md border border-slate-700 px-3 text-sm text-slate-300 transition hover:bg-slate-900"
                >
                  {'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const selectedAssets = smoothCdnAssets.filter((asset) => selectedAssetPaths.includes(asset.path));
                    const urls = selectedAssets.map((asset) => asset.url);

                    if (multiple) {
                      changeAttribute(name, urls.map((url) => createExternalAsset(url)));
                    } else {
                      changeAttribute(name, urls?.[0] ? createExternalAsset(urls[0]) : {});
                    }

                    setSmoothCdnOpen(false);
                  }}
                  className="inline-flex h-9 items-center rounded-md bg-sky-500 px-3 text-sm font-medium text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={selectedAssetPaths.length === 0}
                >
                  {'Select'}
                </button>
              </div>
            </footer>
          </div>
        </AssetPickerDialog>
      )}
    </BaseControl>
  );
};

export default MediaUpload;
