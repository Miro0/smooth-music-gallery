import {useBlockProps, InspectorControls, MediaUpload, MediaUploadCheck, RichText} from '@wordpress/block-editor';
import {PanelBody, Button, SelectControl} from '@wordpress/components';

export default function EditSidebar({attributes, setAttributes}) {
  return (
    <InspectorControls>
      <PanelBody
        title="Ustawienia PRO"
        initialOpen={true}
      >

      </PanelBody>
    </InspectorControls>
  )
}
