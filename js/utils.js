// 공용 수학 / 드로잉 헬퍼

export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const rand = (lo, hi) => lo + Math.random() * (hi - lo);
export const randInt = (lo, hi) => Math.floor(rand(lo, hi + 1));
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
export const TAU = Math.PI * 2;

// 화면 흔들림 상태를 관리하는 작은 헬퍼
export function makeShake() {
  let mag = 0;
  return {
    add(m) {
      mag = Math.max(mag, m);
    },
    // dt(초) 만큼 감쇠시키고 현재 오프셋 반환
    step(dt) {
      mag *= Math.pow(0.001, dt); // 빠르게 감쇠
      if (mag < 0.3) mag = 0;
      return {
        x: rand(-mag, mag),
        y: rand(-mag, mag),
      };
    },
    get value() {
      return mag;
    },
  };
}

export function pointInRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

// 모바일(터치/coarse 포인터) 환경 여부
export function isMobile() {
  try {
    const coarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    const touch = (navigator.maxTouchPoints || 0) > 0;
    const ua = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || "");
    return !!(coarse || touch || ua);
  } catch (e) {
    return false;
  }
}
