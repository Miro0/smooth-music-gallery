import {useBlockProps} from '@wordpress/block-editor';
import {__} from '@wordpress/i18n';
import EditSidebar from "./editor/edit-sidebar";
import AmbientGlow from "./editor/preview/background-animation/AmbientGlow";
import EqualizerBars from "./editor/preview/overlay-animation/EqualizerBars";
import WaveLine from "./editor/preview/overlay-animation/WaveLine";
import config from '../../config.json';
import AudioPulse from "./editor/preview/overlay-animation/AudioPulse";

export default function Edit(props) {
  const {photos = [], theme = 'default'} = props.attributes;

  return (
    <>
      <EditSidebar {...props} config={config}/>

      <p {...useBlockProps()}>
        <div className={`wpmg-gallery theme-${theme.replace(/free\/|pro\//, '')} visible-controls-on-hover`}>
          <div className="wpmg-bg-layer">
            {props.attributes?.music?.filename && props.attributes?.background_animation === 'free/ambient_glow' &&
              <AmbientGlow {...props.attributes?.background_animation_options} />
            }
          </div>
          <div className="wpmg-content">
            <div className="wpmg-overlay-layer">
              {props.attributes?.music?.filename && props.attributes?.overlay_animation === 'free/equalizer_bars' &&
                <EqualizerBars {...props.attributes?.overlay_animation_options} />
              }
              {props.attributes?.music?.filename && props.attributes?.overlay_animation === 'free/wave_line' &&
                <WaveLine {...props.attributes?.overlay_animation_options} />
              }
              {props.attributes?.music?.filename && props.attributes?.overlay_animation === 'pro/audio_pulse' &&
                <AudioPulse {...props.attributes?.overlay_animation_options} />
              }
            </div>
            <div className="wpmg-image-container swiper">
              <div className="swiper-wrapper">
                <div className="swiper-slide">
                  {photos[0]?.url ? (
                    <img
                      alt={photos[0]?.alt ?? 'WP Music Gallery preview'}
                      src={photos[0].url}
                      loading="lazy"
                      decoding="async"
                      style={{objectFit: 'cover', width: '100%', height: '100%'}}
                    />
                  ) : (
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      height: '100%',
                      borderRadius: '12px',
                      background: "radial-gradient(#e0e0e0 1px, transparent 1px)",
                      backgroundSize: "10px 10px",
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#444',
                      textAlign: 'center',
                      padding: '20px',
                    }}>
                      <svg
                        viewBox="0 0 24 24"
                        style={{
                          width: '36px',
                          height: '36px',
                          opacity: 0.6,
                        }}
                      >
                        <path
                          d="M20 5v14H4V5h16m0-2H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m-7.5 10.5l-2.5 3l-1.5-2l-2.5 3h12l-3.5-4.5l-2.5 3Z"
                        />
                      </svg>
                      <div>{__('No images added to gallery', 'wpmusicgallery')}</div>
                    </div>
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
