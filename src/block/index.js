import {registerBlockType} from '@wordpress/blocks';
import Edit from './edit';
import logo from "../../assets/logo.svg";
import metadata from '../block.json';
import './editor-controls.scss';

registerBlockType(metadata.name, {
  icon: <img src={logo} alt="Smooth Music Gallery" style={{ maxWidth: '24px', aspectRatio: 1 }} />,
  edit: Edit,
});
