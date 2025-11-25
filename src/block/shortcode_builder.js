import {__} from '@wordpress/i18n';
import {useState, useMemo} from '@wordpress/element';
import {
  TextareaControl,
  Button,
  Notice,
  Card,
  CardBody,
  CardHeader,
} from '@wordpress/components';

import {BlockContext} from "./editor/context";
import Edit from '../block/edit';
import EditSidebar from "./editor/edit-sidebar";
import config from "../../config.json";
import './shortcode_builder.scss';

function createShortcode(attributes) {
  const parts = ['[wp-music-gallery'];

  Object.entries(attributes).forEach(([key, value]) => {
    parts.push(`${key}="${value}"`);
  })

  parts.push(']');

  return parts.join(' ');
}

const App = () => {
  const [attributes, setAttributes] = useState({
    anchor: 'shortcode',
    id: 'shortcode',
    photos: [],
    music: {},
    theme: 'default',
    theme_options: {},
    overlay: '',
    overlay_options: {},
    background: '',
    background_options: {},
  });
  const [copyState, setCopyState] = useState(null);

  const shortcode = useMemo(() => createShortcode(attributes), [attributes]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortcode);
      setCopyState('success');
      setTimeout(() => setCopyState(null), 2000);
    } catch (e) {
      setCopyState('error');
      setTimeout(() => setCopyState(null), 3000);
    }
  };

  const changeAttribute = (name, value) => {
    let newValuesToSet = {...attributes};
    if (name.includes('.')) {
      let [parent, child] = name.split('.');

      newValuesToSet[parent] = {
        ...(attributes[parent] || {}),
        [child]: value,
      };
    } else {
      newValuesToSet = {[name]: value};
    }

    setAttributes(newValuesToSet);
  };

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
      <Card>
        <CardHeader>
          <strong>{__('Shortcode Builder', 'wpmusicgallery')}</strong>
        </CardHeader>
        <CardBody>
          <div style={{display: 'flex', flexDirection: 'row', gap: 2}}>
            <div style={{width: '70%'}}>
              <Edit
                attributes={attributes}
                setAttributes={setAttributes}
              />
            </div>
            <div style={{width: '30%'}}>
              <BlockContext.Provider value={{changeAttribute}}>
                <EditSidebar attributes={attributes} setAttributes={setAttributes} config={config}/>
              </BlockContext.Provider>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <strong>{__('Shortcode', 'wpmusicgallery')}</strong>
          <small>{__('Copy and paste generated shortcode whereever You want to use it', 'wpmusicgallery')}</small>
        </CardHeader>
        <CardBody>
          <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
            <TextareaControl
              label={__('Shortcode', 'wpmusicgallery')}
              value={shortcode}
              readOnly
              rows={4}
            />

            <Button
              variant="secondary"
              onClick={onCopy}
            >
              {__('Kopiuj do schowka', 'wpmusicgallery')}
            </Button>

            {copyState === 'success' && (
              <Notice
                status="success"
                isDismissible={false}
              >
                {__('Skopiowano shortcode.', 'wpmusicgallery')}
              </Notice>
            )}

            {copyState === 'error' && (
              <Notice
                status="error"
                isDismissible={false}
              >
                {__('Nie udało się skopiować shortcode (brak dostępu do schowka).', 'wpmusicgallery')}
              </Notice>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('wpmg-builder-root');
  if (!root) return;

  const {createRoot} = wp.element || {};
  if (createRoot) {
    const r = createRoot(root);
    r.render(<App/>);
  } else {
    wp.element.render(<App/>, root);
  }
});
