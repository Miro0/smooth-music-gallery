import {BaseControl, Button} from "@wordpress/components";
import {MediaUploadCheck, MediaUpload as MediaUploadCore} from "@wordpress/block-editor";
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
  const {setAttributes} = useBlockContext();

  return (
    <MediaUploadCheck>
      <BaseControl
        label={label}
        help={help}
        __nextHasNoMarginBottom
      >
        <div style={{display: 'flex', gap: '8px'}}>
          <MediaUploadCore
            onSelect={(media) => setAttributes({[name]: media})}
            allowedTypes={allowedTypes}
            multiple={multiple}
            gallery={multiple}
            value={multiple ? value?.map(({id}) => id) : value?.id}
            render={({open}) => (
              <Button onClick={open} variant="secondary">
                {multiple && (
                  value?.length
                    ? value.length + ' ' + __('selected', 'wpmusicgallery')
                    : __('Select', 'wpmusicgallery')
                )}
                {!multiple && (
                  value?.filename ? value.filename : __('Select', 'wpmusicgallery')
                )}
              </Button>
            )}
          />

          {((multiple && value?.length > 0) || value?.id) && (
            <Button
              onClick={() => setAttributes({[name]: multiple ? [] : {}})}
              variant="secondary"
              isDestructive
            >
              {__('Clear', 'wpmusicgallery')}
            </Button>
          )}
        </div>
      </BaseControl>
    </MediaUploadCheck>
  )
}

export default MediaUpload;
