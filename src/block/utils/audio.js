export const initAudioSource = (audio, index) => {
  if (!window?.wpmg[index]?.ctx) {
    window.wpmg[index].ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  const ctx = window.wpmg[index].ctx;

  if (!window?.wpmg[index]?.source) {
    window.wpmg[index].source = ctx.createMediaElementSource(audio);
  }
  const source = window.wpmg[index].source;

  if (!window?.wpmg[index]?.gain) {
    window.wpmg[index].gain = ctx.createGain();
  }
  const gain = window.wpmg[index].gain;
  gain.gain.value = 0.8;

  const analyser = ctx.createAnalyser();
  analyser.fftSize = 256;

  const data = new Uint8Array(analyser.frequencyBinCount);

  source.connect(analyser);

  if (!window?.wpmg[index].audioConnected) {
    source.connect(gain);
    gain.connect(ctx.destination);
    window.wpmg[index].audioConnected = true;
  }

  return [analyser, ctx, data];
}
