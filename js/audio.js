// WebAudio 기반 효과음 합성 + 모바일 햅틱
// 오디오 파일 에셋 없이 코드로 소리를 만든다.

let ctx = null;
let muted = false;

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) ctx = new AC();
  }
  // 브라우저 자동재생 정책: 사용자 제스처 후 resume 필요
  if (ctx && ctx.state === "suspended") ctx.resume();
  return ctx;
}

// 첫 사용자 입력 시 오디오 컨텍스트 깨우기 (main에서 호출)
export function unlockAudio() {
  ac();
}

export function setMuted(v) {
  muted = v;
}
export function isMuted() {
  return muted;
}
export function toggleMuted() {
  muted = !muted;
  return muted;
}

function envGain(c, t0, peak, attack, decay) {
  const g = c.createGain();
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(peak, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + decay);
  return g;
}

// 화이트노이즈 버퍼 (재사용)
let noiseBuf = null;
function noiseBuffer(c) {
  if (noiseBuf) return noiseBuf;
  const len = c.sampleRate * 1.0;
  noiseBuf = c.createBuffer(1, len, c.sampleRate);
  const data = noiseBuf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return noiseBuf;
}

function playNoise(dur, peak, filterFreq, t0) {
  const c = ac();
  if (!c || muted) return;
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c);
  const filt = c.createBiquadFilter();
  filt.type = "bandpass";
  filt.frequency.value = filterFreq;
  filt.Q.value = 0.8;
  const g = envGain(c, t0, peak, 0.001, dur);
  src.connect(filt).connect(g).connect(c.destination);
  src.start(t0);
  src.stop(t0 + dur + 0.05);
}

function playTone(type, freqStart, freqEnd, dur, peak, t0) {
  const c = ac();
  if (!c || muted) return;
  const osc = c.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freqStart, t0);
  osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), t0 + dur);
  const g = envGain(c, t0, peak, 0.003, dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

// === 효과음 프리셋 ===

// 유리 깨지는 소리
export function playCrack() {
  const c = ac();
  if (!c) return;
  const t = c.currentTime;
  playNoise(0.18, 0.5, 3200, t);
  playNoise(0.12, 0.3, 6000, t + 0.01);
  playTone("triangle", 900, 200, 0.12, 0.25, t);
}

// 정강이 타격 (퍽!)
export function playSlap() {
  const c = ac();
  if (!c) return;
  const t = c.currentTime;
  playNoise(0.06, 0.6, 1800, t);
  playTone("sine", 160, 60, 0.12, 0.5, t);
}

// 지능 뽑기 (뿅)
export function playPop() {
  const c = ac();
  if (!c) return;
  const t = c.currentTime;
  playTone("sine", 220, 760, 0.1, 0.35, t);
}

// 승리 / 완료 팡파레
export function playWin() {
  const c = ac();
  if (!c) return;
  const t = c.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((f, i) => playTone("triangle", f, f, 0.22, 0.3, t + i * 0.1));
}

// 가벼운 UI 클릭
export function playClick() {
  const c = ac();
  if (!c) return;
  const t = c.currentTime;
  playTone("square", 600, 600, 0.04, 0.12, t);
}

// 모바일 진동 햅틱 (안드로이드 크롬 지원; 미지원 환경은 무시됨)
export function vibrate(pattern) {
  if (muted) return;
  if (navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      /* 무시 */
    }
  }
}
