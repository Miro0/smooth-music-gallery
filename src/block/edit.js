import {useBlockProps} from '@wordpress/block-editor';
import EditSidebar from "./editor/edit-sidebar";
import CONFIG from './config';

export default function Edit(props) {
  const {photos = [], theme = 'default'} = props.attributes;

  return (
    <>
      <EditSidebar {...props} config={CONFIG}/>

      <p {...useBlockProps()}>
        <div className={`wpmg-gallery theme-${theme} visible-controls`}>
          <div className="wpmg-bg-layer"></div>
          <div className="wpmg-content">
            <div className="wpmg-overlay-layer"></div>
            <div className="wpmg-image-container swiper">
              <div className="swiper-wrapper">
                <div className="swiper-slide">
                  {photos[0]?.src && (
                    <img
                      alt={photos[0]?.alt ?? 'WP Music Gallery preview'}
                      src={photos[0].src}
                      loading="lazy"
                      decoding="async"
                      style="object-fit: cover; width: 100%; height: 100%;"
                    />
                  )}
                </div>
              </div>
              <div className="swiper-pagination"></div>
            </div>

            <div className="wpmg-controls">
              <button className="wpmg-btn wpmg-play" aria-label="Play / Pause">
                <svg viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
              <button className="wpmg-btn wpmg-fullscreen" aria-label="Fullscreen">
                <svg viewBox="0 0 24 24">
                  <path d="M7 14h2v3h3v2H7v-5zM14 7h3v3h2V5h-5v2z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </p>
    </>
  );
}
