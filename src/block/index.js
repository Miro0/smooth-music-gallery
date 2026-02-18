import {registerBlockType} from '@wordpress/blocks';
import Edit from './edit';
import metadata from '../block.json';

registerBlockType(metadata.name, {
  icon: <img src="https://cdn.smoothcdn.com/smoothcdn/smooth-music-gallery/latest/logo.png" alt="Smooth Music Gallery" style={{ maxWidth: '24px', aspectRatio: 1 }} />,
  edit: Edit,
});
