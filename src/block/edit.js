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
    photos_cdn = [],
    photos_source = 'wp',
    music = {},
    music_cdn = {},
    music_source = 'wp',
    theme = 'default',
    theme_options = {},
    size = 85,
    background_options = {},
  } = attributes;
  const selectedPhotos = photos_source === 'smoothcdn' ? photos_cdn : photos;
  const currentMusic = music_source === 'smoothcdn' ? music_cdn : music;

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

    containerRef?.current?.style?.setProperty('--mg-theme-accent', theme_options?.accent ?? '#ffffff');
    containerRef?.current?.style?.setProperty('--mg-theme-accent--opacity', `rgba(${themeAccentRGB.r},${themeAccentRGB.g},${themeAccentRGB.b},0.5)`);
    containerRef?.current?.style?.setProperty('--mg-theme-accent--opacity-light', `rgba(${themeAccentRGB.r},${themeAccentRGB.g},${themeAccentRGB.b},0.2)`);
    containerRef?.current?.style?.setProperty('--mg-theme-frame', theme_options?.frame_color ?? '#111111');
    containerRef?.current?.style?.setProperty('--mg-theme-frame--opacity', `rgba(${themeFrameRGB.r},${themeFrameRGB.g},${themeFrameRGB.b},0.8)`);
  }, [theme_options]);

  return (
    <>
      <BlockContext.Provider value={{changeAttribute}}>
        <InspectorControls>
          <EditSidebar {...props} config={config}/>
        </InspectorControls>
      </BlockContext.Provider>

      <p {...useBlockProps()}>
        <div className={`mg-gallery theme-${theme?.replace(/free\/|pro\//, '')} visible-controls`} ref={containerRef}>
          <div
            className="mg-bg-layer"
            style={{
              background: background_color,
            }}
          >
            {props.attributes?.background === 'ambient_glow' &&
              <AmbientGlow {...props.attributes?.background_options} />
            }
            {props.attributes?.background === 'blurred_photos' &&
              <BlurredPhotos {...props.attributes?.background_options} photo={selectedPhotos[0]}/>
            }
            {props.attributes?.background === 'dust_particles' &&
              <DustParticles {...props.attributes?.background_options}/>
            }
            {props.attributes?.background === 'orbital_pulse' &&
              <OrbitalPulse {...props.attributes?.background_options} />
            }
          </div>
          <div className="mg-content" style={{
            width: `${size}%`,
            height: `${size}%`,
            marginTop: `${bgMargin}%`,
            marginBottom: `${bgMargin}%`,
          }}>
            <div className="mg-overlay-layer">
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
            <div className="mg-image-container swiper">
              <div className="swiper-wrapper">
                {props.attributes?.overlay === 'color_blend' &&
                  <ColorBlend {...props.attributes?.overlay_options} />
                }
                <div className="swiper-slide">
                  {selectedPhotos[0]?.url ? (
                    <>
                      <img
                        alt={selectedPhotos[0]?.alt ?? 'Music Gallery preview'}
                        src={selectedPhotos[0].url}
                        loading="lazy"
                        decoding="async"
                        style={{objectFit: 'cover', width: '100%', height: '100%'}}
                      />
                      {props.attributes?.overlay === 'pixelate' &&
                        <Pixelate {...props.attributes?.overlay_options} photo={selectedPhotos[0]}/>
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
                      <div>{__('No images added to gallery', 'music-gallery')}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mg-controls">
              <div className="swiper-pagination--wrapper">
                <div className="swiper-pagination">
                  <span className="swiper-pagination-bullet swiper-pagination-bullet-active">
                    {theme === 'playlist' && selectedPhotos[0]?.url?.split('/')?.pop()?.split('\\')?.pop()?.split('.')?.slice(0, -1)?.join('.')}
                  </span>
                  {Array.from({length: selectedPhotos.length - 1}).map(() => (
                    <span className="swiper-pagination-bullet"/>
                  ))}
                </div>
              </div>

              <div className="mg-music-meta">
                <div className="mg-music-title">{currentMusic?.title || currentMusic?.filename || currentMusic?.name || ''}</div>
              </div>

              <div className="mg-music-progress">
                <div className="mg-music-progress-bar">
                  <div className="mg-music-progress-fill"></div>
                </div>
                <div className="mg-music-times">
                  <span className="mg-music-time-current">0:00</span>
                  <span className="mg-music-time-total">0:00</span>
                </div>
              </div>

              <div className="mg-volume--wrapper">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value="1"
                  className="mg-volume"
                  data-label="Volume"
                />
              </div>
              <div className="mg-btn--wrapper">
                <button className="mg-btn mg-btn--small mg-prev" aria-label="Previous">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M6,18V6H8V18H6M9.5,12L18,6V18L9.5,12Z"/>
                  </svg>
                </button>
                <button className="mg-btn mg-play" aria-label="Play / Pause">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M8,5.14V19.14L19,12.14L8,5.14Z"/>
                  </svg>
                </button>
                <button className="mg-btn mg-btn--small mg-next" aria-label="Next">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M16,18H18V6H16M6,18L14.5,12L6,6V18Z"/>
                  </svg>
                </button>
              </div>
              <button className="mg-btn mg-fullscreen" aria-label="Fullscreen">
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
