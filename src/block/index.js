import {registerBlockType} from '@wordpress/blocks';
import Edit from './edit';
import metadata from '../block.json';

registerBlockType(metadata.name, {
  icon: <img src="https://music-gallery.smoothcdn.com/latest/logo.svg" alt="Smooth Music Gallery" style={{ maxWidth: '24px', aspectRatio: 1 }} />,
  edit: Edit,
});
