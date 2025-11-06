import {__} from '@wordpress/i18n';
import {useBlockProps} from '@wordpress/block-editor';
import EditSidebar from "./edit-sidebar";
import './editor.scss';

export default function Edit(props) {
  return (
    <>
      <EditSidebar {...props} />

      <p {...useBlockProps()}>
        {__('Wp Music Gallery – PRO!', 'wp-music-gallery')}
      </p>
    </>
  );
}
