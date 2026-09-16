// Synthesized via the Web Audio API rather than an audio file so the splash
// screen doesn't need to ship/load a media asset for one short effect.
export function playTickSound() {
  try {
    const AudioContextClass = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioContextClass();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(1800, ctx.currentTime);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.06);
    oscillator.onended = () => ctx.close();
  } catch {
    // Browsers that block un-prompted audio (autoplay policies) or lack
    // Web Audio support simply won't get the tick; the splash still works.
  }
}
