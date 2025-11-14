import {registerBlockType} from '@wordpress/blocks';
import Edit from './edit';
import icon from '../../assets/icon-512.png';
import metadata from '../block.json';

registerBlockType(metadata.name, {
  icon: <img src={icon} alt="WP Music Gallery" style={{ maxWidth: '24px', aspectRatio: 1 }} />,
  edit: Edit,
});
