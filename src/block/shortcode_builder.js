import {__} from '@wordpress/i18n';
import {useState, useMemo, useRef, useEffect} from '@wordpress/element';
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
  try {
    if (attributes) {
      const parts = ['[wp-music-gallery'];

      Object.entries(attributes).forEach(([key, value]) => {
        if (value !== '') {
          if (key === 'photos') {
            if (value?.length > 0) {
              parts.push(`${key}='${value.map((item => item.id)).join(',')}'`);
            }
          } else if (key === 'music') {
            if (value?.id) {
              parts.push(`${key}='${value.id}'`);
            }
          } else if (typeof value === 'object') {
            if (Object.keys(value).length > 0) {
              parts.push(`${key}='${JSON.stringify(value)}'`);
            }
          } else {
            parts.push(`${key}='${value}'`);
          }
        }
      });

      parts.push(']');

      return parts.join(' ');
    }
  } catch (e) {
    // Just omit creating shortcode and debug attributes.
  }

  return '';
}

const App = () => {
  const [attributes, setAttributes] = useState({
    photos: [],
    music: {},
    slides_duration: 2,
    size: 85,
    theme: 'default',
    theme_options: {},
    overlay: '',
    overlay_options: {},
    background: '',
    background_options: {},
  });
  const [copyState, setCopyState] = useState(null);
  const [mounted, setMounted] = useState(false);
  const textareaRef = useRef();

  const shortcode = useMemo(() => createShortcode(attributes), [attributes]);

  useEffect(() => {
    setMounted(true);

    const storageCache = localStorage.getItem('wpmg-shortcode-builder');
    if (storageCache) {
      setAttributes(JSON.parse(storageCache));
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('wpmg-shortcode-builder', JSON.stringify(attributes));
    }
  }, [attributes]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortcode);
      setCopyState('success');
      setTimeout(() => setCopyState(null), 2000);
    } catch (e) {
      try {
        textareaRef.current.select();
        document.execCommand('copy');
        requestAnimationFrame(() => {
          window.getSelection().removeAllRanges();
        });
        setCopyState('success');
        setTimeout(() => setCopyState(null), 2000);
      } catch (e) {
        setCopyState('error');
        setTimeout(() => setCopyState(null), 3000);
      }
    }
  };

  const changeAttribute = (name, value) => {
    let newValuesToSet = {};
    if (name.includes('.')) {
      let [parent, child] = name.split('.');

      newValuesToSet[parent] = {
        ...(attributes[parent] || {}),
        [child]: value,
      };
    } else {
      newValuesToSet = {[name]: value};
    }

    setAttributes({
      ...attributes,
      ...newValuesToSet
    });
  };

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
      <Card>
        <CardHeader>
          <strong>{__('Shortcode Builder', 'wp-music-gallery')}</strong>
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

          <Button
            variant="secondary"
            onClick={() => {
              setAttributes({
                photos: [],
                music: {},
                slides_duration: 2,
                size: 85,
                theme: 'default',
                theme_options: {},
                overlay: '',
                overlay_options: {},
                background: '',
                background_options: {},
              });
            }}
          >
            {__('Clear gallery', 'wp-music-gallery')}
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <strong>{__('Shortcode', 'wp-music-gallery')}</strong>
          <small>{__('Copy and paste generated shortcode whereever You want to use it', 'wp-music-gallery')}</small>
        </CardHeader>
        <CardBody>
          <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
            <TextareaControl
              ref={textareaRef}
              label={__('Shortcode', 'wp-music-gallery')}
              value={shortcode}
              readOnly
              rows={4}
              __nextHasNoMarginBottom
            />

            <Button
              variant="secondary"
              onClick={onCopy}
            >
              {__('Copy to clipboard', 'wp-music-gallery')}
            </Button>

            {copyState === 'success' && (
              <Notice
                status="success"
                isDismissible={false}
              >
                {__('Shortcode copied', 'wp-music-gallery')}
              </Notice>
            )}

            {copyState === 'error' && (
              <Notice
                status="error"
                isDismissible={false}
              >
                {__('Couldn\'t proceed with copy', 'wp-music-gallery')}
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
