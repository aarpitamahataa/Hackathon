// Tiny zero-dependency sound effects via the Web Audio API — no audio files to ship.

let ctx;

function getContext() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    ctx = new AudioCtx();
  }
  return ctx;
}

function tone({ freq, duration = 0.12, type = "sine", startTime = 0, gain = 0.08 }) {
  const audio = getContext();
  if (!audio) return;
  const osc = audio.createOscillator();
  const gainNode = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t0 = audio.currentTime + startTime;
  gainNode.gain.setValueAtTime(gain, t0);
  gainNode.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
  osc.connect(gainNode);
  gainNode.connect(audio.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

export function playCheck(muted) {
  if (muted) return;
  // A quick upward two-note "ding" for checking a habit off.
  tone({ freq: 660, duration: 0.09, startTime: 0 });
  tone({ freq: 880, duration: 0.14, startTime: 0.07 });
}

export function playUncheck(muted) {
  if (muted) return;
  tone({ freq: 440, duration: 0.1, type: "triangle" });
}

export function playLevelUp(muted) {
  if (muted) return;
  // A little ascending fanfare.
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) =>
    tone({ freq, duration: 0.18, startTime: i * 0.09, type: "square", gain: 0.06 }),
  );
}

export function playAllDone(muted) {
  if (muted) return;
  [392, 523.25, 659.25].forEach((freq, i) =>
    tone({ freq, duration: 0.22, startTime: i * 0.1, gain: 0.07 }),
  );
}
