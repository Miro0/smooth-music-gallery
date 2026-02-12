import {__} from '@wordpress/i18n';
import {useEffect, useRef} from "@wordpress/element";
import {useBlockProps, InspectorControls} from '@wordpress/block-editor';
import EditSidebar from "./editor/edit-sidebar";

import {BlockContext} from "./editor/context";

import AmbientGlow from "./editor/preview/backgrounds/AmbientGlow";
import BlurredPhotos from "./editor/preview/backgrounds/BlurredPhotos";
import DustParticles from "./editor/preview/backgrounds/DustParticles";
import OrbitalPulse from "./editor/preview/backgrounds/OrbitalPulse";

import AudioPulse from "./editor/preview/overlays/AudioPulse";
import ColorBlend from "./editor/preview/overlays/ColorBlend";
import EqualizerBars from "./editor/preview/overlays/EqualizerBars";
import HeartbeatLine from "./editor/preview/overlays/HeartbeatLine";
import Pixelate from "./editor/preview/overlays/Pixelate";
import WaveLine from "./editor/preview/overlays/WaveLine";

import config from '../../config.json';
import {hexToRgb} from "./utils/style";

export default function Edit(props) {
  const {attributes, setAttributes} = props;

  const containerRef = useRef();

  const {
    photos = [],
    music = {},
    theme = 'default',
    theme_options = {},
    size = 85,
    background_options = {},
  } = attributes;

  const {background_color = 'transparent'} = background_options;
  const bgMargin = Math.floor((100 - size) / 4);

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

    setAttributes(newValuesToSet);
  };

  useEffect(() => {
    const themeAccentRGB = hexToRgb(theme_options?.accent ?? '#ffffff');
    const themeFrameRGB = hexToRgb(theme_options?.frame_color ?? '#111111');

    containerRef?.current?.style?.setProperty('--wpmg-theme-accent', theme_options?.accent ?? '#ffffff');
    containerRef?.current?.style?.setProperty('--wpmg-theme-accent--opacity', `rgba(${themeAccentRGB.r},${themeAccentRGB.g},${themeAccentRGB.b},0.5)`);
    containerRef?.current?.style?.setProperty('--wpmg-theme-accent--opacity-light', `rgba(${themeAccentRGB.r},${themeAccentRGB.g},${themeAccentRGB.b},0.2)`);
    containerRef?.current?.style?.setProperty('--wpmg-theme-frame', theme_options?.frame_color ?? '#111111');
    containerRef?.current?.style?.setProperty('--wpmg-theme-frame--opacity', `rgba(${themeFrameRGB.r},${themeFrameRGB.g},${themeFrameRGB.b},0.8)`);
  }, [theme_options]);

  return (
    <>
      <BlockContext.Provider value={{changeAttribute}}>
        <InspectorControls>
          <EditSidebar {...props} config={config}/>
        </InspectorControls>
      </BlockContext.Provider>

      <p {...useBlockProps()}>
        <div className={`wpmg-gallery theme-${theme?.replace(/free\/|pro\//, '')} visible-controls`} ref={containerRef}>
          <div
            className="wpmg-bg-layer"
            style={{
              background: background_color,
            }}
          >
            {props.attributes?.background === 'ambient_glow' &&
              <AmbientGlow {...props.attributes?.background_options} />
            }
            {props.attributes?.background === 'blurred_photos' &&
              <BlurredPhotos {...props.attributes?.background_options} photo={photos[0]}/>
            }
            {props.attributes?.background === 'dust_particles' &&
              <DustParticles {...props.attributes?.background_options}/>
            }
            {props.attributes?.background === 'orbital_pulse' &&
              <OrbitalPulse {...props.attributes?.background_options} />
            }
          </div>
          <div className="wpmg-content" style={{
            width: `${size}%`,
            height: `${size}%`,
            marginTop: `${bgMargin}%`,
            marginBottom: `${bgMargin}%`,
          }}>
            <div className="wpmg-overlay-layer">
              {props.attributes?.overlay === 'audio_pulse' &&
                <AudioPulse {...props.attributes?.overlay_options} />
              }
              {props.attributes?.overlay === 'equalizer_bars' &&
                <EqualizerBars {...props.attributes?.overlay_options} />
              }
              {props.attributes?.overlay === 'heartbeat_line' &&
                <HeartbeatLine {...props.attributes?.overlay_options} />
              }
              {props.attributes?.overlay === 'wave_line' &&
                <WaveLine {...props.attributes?.overlay_options} />
              }
            </div>
            <div className="wpmg-image-container swiper">
              <div className="swiper-wrapper">
                {props.attributes?.overlay === 'color_blend' &&
                  <ColorBlend {...props.attributes?.overlay_options} />
                }
                <div className="swiper-slide">
                  {photos[0]?.url ? (
                    <>
                      <img
                        alt={photos[0]?.alt ?? 'WP Music Gallery preview'}
                        src={photos[0].url}
                        loading="lazy"
                        decoding="async"
                        style={{objectFit: 'cover', width: '100%', height: '100%'}}
                      />
                      {props.attributes?.overlay === 'pixelate' &&
                        <Pixelate {...props.attributes?.overlay_options} photo={photos[0]}/>
                      }
                    </>
                  ) : (
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      height: '100%',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.8)',
                      backgroundSize: "10px 10px",
                      boxSizing: 'border-box',
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
                      <div>{__('No images added to gallery', 'wp-music-gallery')}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="wpmg-controls">
              <div className="swiper-pagination--wrapper">
                <div className="swiper-pagination">
                  <span className="swiper-pagination-bullet swiper-pagination-bullet-active">
                    {theme === 'playlist' && photos[0]?.url?.split('/')?.pop()?.split('\\')?.pop()?.split('.')?.slice(0, -1)?.join('.')}
                  </span>
                  {Array.from({length: photos.length - 1}).map(() => (
                    <span className="swiper-pagination-bullet"/>
                  ))}
                </div>
              </div>

              <div className="wpmg-music-meta">
                <div className="wpmg-music-title">{music?.title || music?.filename || music?.name || ''}</div>
              </div>

              <div className="wpmg-music-progress">
                <div className="wpmg-music-progress-bar">
                  <div className="wpmg-music-progress-fill"></div>
                </div>
                <div className="wpmg-music-times">
                  <span className="wpmg-music-time-current">0:00</span>
                  <span className="wpmg-music-time-total">0:00</span>
                </div>
              </div>

              <div className="wpmg-volume--wrapper">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value="1"
                  className="wpmg-volume"
                  data-label="Volume"
                />
              </div>
              <div className="wpmg-btn--wrapper">
                <button className="wpmg-btn wpmg-btn--small wpmg-prev" aria-label="Previous">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M6,18V6H8V18H6M9.5,12L18,6V18L9.5,12Z"/>
                  </svg>
                </button>
                <button className="wpmg-btn wpmg-play" aria-label="Play / Pause">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M8,5.14V19.14L19,12.14L8,5.14Z"/>
                  </svg>
                </button>
                <button className="wpmg-btn wpmg-btn--small wpmg-next" aria-label="Next">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M16,18H18V6H16M6,18L14.5,12L6,6V18Z"/>
                  </svg>
                </button>
              </div>
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
