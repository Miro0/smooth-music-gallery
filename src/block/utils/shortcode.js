function encodeShortcodeAttribute(value) {
  const text = String(value);
  // HTML entities can be decoded before WordPress parses the shortcode.
  if (/[&'"\\[\]<>]/.test(text) || text.startsWith('encoded:')) {
    return `encoded:${encodeURIComponent(text).replace(/'/g, '%27')}`;
  }

  return text;
}

export function normalizeMediaSource(source) {
  return source === 'smoothbundle' ? 'smoothbundle' : 'core';
}

export function createShortcode(attributes) {
  try {
    if (attributes) {
      const photosSource = normalizeMediaSource(attributes?.photos_source);
      const musicSource = normalizeMediaSource(attributes?.music_source);
      const selectedPhotos = photosSource === 'smoothbundle' ? (attributes?.photos_cdn || []) : (attributes?.photos || []);
      const currentMusic = musicSource === 'smoothbundle' ? (attributes?.music_cdn || {}) : (attributes?.music || {});
      const parts = ['[smooth-music-gallery'];

      Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'photos_cdn' || key === 'music_cdn' || key === 'photos_source' || key === 'music_source') {
          return;
        }

        if (value !== '') {
          if (key === 'photos') {
            if (selectedPhotos.length > 0) {
              const shouldSerializeAsJson = selectedPhotos.some((item) => item?.focus);
              const photos = shouldSerializeAsJson
                ? JSON.stringify(selectedPhotos)
                : selectedPhotos
                    .map((item) => item?.id || item?.url)
                    .filter(Boolean)
                    .join(',');

              if (photos) {
                parts.push(`${key}='${encodeShortcodeAttribute(photos)}'`);
              }
            }
          } else if (key === 'music') {
            const music = currentMusic?.id || currentMusic?.url;
            if (music) {
              parts.push(`${key}='${encodeShortcodeAttribute(music)}'`);
            }
          } else if (typeof value === 'object') {
            if (Object.keys(value).length > 0) {
              parts.push(`${key}='${encodeShortcodeAttribute(JSON.stringify(value))}'`);
            }
          } else {
            parts.push(`${key}='${encodeShortcodeAttribute(value)}'`);
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
