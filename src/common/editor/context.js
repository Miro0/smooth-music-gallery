import { createContext, useContext } from '@wordpress/element';
export const BlockContext = createContext(null);
export const useBlockContext = () => useContext(BlockContext);
