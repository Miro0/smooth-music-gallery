import {__} from '@wordpress/i18n';
import {useBlockProps} from '@wordpress/block-editor';
import EditSidebar from "../common/editor/edit-sidebar";
import CONFIG from './config';
import './editor.scss';

export default function Edit(props) {
  return (
    <>
      <EditSidebar {...props} config={CONFIG} />

      <p {...useBlockProps()}>
        {__('Wp Music Gallery – FREE!', 'wp-music-gallery')}
      </p>
    </>
  );
}
