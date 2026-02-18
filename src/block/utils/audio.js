export const initAudioSource = (audio, index) => {
  if (!window?.mg[index]?.ctx) {
    window.mg[index].ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  const ctx = window.mg[index].ctx;

  if (!window?.mg[index]?.source) {
    window.mg[index].source = ctx.createMediaElementSource(audio);
  }
  const source = window.mg[index].source;

  if (!window?.mg[index]?.gain) {
    window.mg[index].gain = ctx.createGain();
  }
  const gain = window.mg[index].gain;
  gain.gain.value = 0.8;

  const analyser = ctx.createAnalyser();
  analyser.fftSize = 256;

  const data = new Uint8Array(analyser.frequencyBinCount);

  source.connect(analyser);

  if (!window?.mg[index].audioConnected) {
    source.connect(gain);
    gain.connect(ctx.destination);
    window.mg[index].audioConnected = true;
  }

  return [analyser, ctx, data];
}
