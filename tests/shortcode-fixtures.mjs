// node tests/shortcode-fixtures.mjs > /tmp/smoothmg-shortcodes.json
import assert from 'node:assert/strict';
import {createShortcode} from '../src/block/utils/shortcode.js';

const photos = [
  {url: 'https://cdn.smoothbundle.com/smoothbundle/assets/Animals 4.jpg', focus: {x: 15, y: 30}},
  {url: 'https://cdn.smoothbundle.com/smoothbundle/assets/Animals 5.jpg', focus: {x: 53, y: 55}},
  {url: 'https://cdn.smoothbundle.com/smoothbundle/assets/Animals 6.jpg', focus: {x: 70, y: 30}},
];
const music = {url: 'https://cdn.smoothbundle.com/smoothbundle/assets/Good Times Rolling.mp3'};
const attributes = {
  photos,
  music,
  slides_duration: 2,
  size: 85,
  theme: 'video_player',
};
const specialPhotos = [{
  url: 'https://example.com/photo.jpg?a=1&b=2',
  filename: 'Artist\'s "photo" [1].jpg',
  alt: 'Artist\'s "photo" [1] \\ archive & literal &#91;',
  focus: {x: 25, y: 75},
}];
const options = {label: 'Artist\'s "mix" [live] \\ archive & literal &#93; <test>', values: [1, 2]};
const cases = [
  {name: 'Focused photos from the reported shortcode', attributes},
  {
    name: 'Smooth Bundle sources',
    attributes: {...attributes, photos: [], music: {}, photos_source: 'smoothbundle', music_source: 'smoothbundle', photos_cdn: photos, music_cdn: music},
  },
  {
    name: 'Quotes, brackets, backslashes and entities',
    attributes: {...attributes, photos: specialPhotos, theme_options: options, overlay_options: options, background_options: options},
  },
  {
    name: 'Simple URL list',
    attributes: {...attributes, photos: [{url: 'https://example.com/one.jpg'}, {url: 'https://example.com/two.jpg'}]},
  },
];

for (const fixture of cases) {
  fixture.shortcode = createShortcode(fixture.attributes);
  assert.ok(fixture.shortcode.startsWith('[smooth-music-gallery '));
  assert.ok(fixture.shortcode.endsWith(' ]'));
  assert.doesNotMatch(fixture.shortcode.slice(1, -1), /[\[\]\\]/);
  const selectedPhotos = fixture.attributes.photos_source === 'smoothbundle' ? fixture.attributes.photos_cdn : fixture.attributes.photos;
  fixture.expectedPhotos = selectedPhotos.map(({url, alt, focus}) => ({url, ...(alt ? {alt} : {}), ...(focus ? {focus} : {})}));
}

assert.match(cases[0].shortcode, /photos='encoded:%5B/);
assert.match(cases[2].shortcode, /%27/);
assert.match(cases[2].shortcode, /%5C/);
assert.match(cases[2].shortcode, /%26%2391%3B/);
assert.match(createShortcode({...attributes, photos: [{id: 12}, {id: 34}]}), /photos='12,34'/);

console.log(JSON.stringify(cases));
