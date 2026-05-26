// 게임 엔진 코어: 풀스크린 캔버스, DPR 스케일링, 게임 루프, 씬 관리, 통합 포인터 입력
import { unlockAudio } from "./audio.js";

/**
 * Scene 인터페이스 (모든 메서드 선택적):
 *   enter(engine)        씬 진입
 *   exit(engine)         씬 이탈
 *   update(dt)           dt: 초 단위 경과시간
 *   render(ctx, w, h)
 *   onPointerDown(x, y, id)
 *   onPointerMove(x, y, id)
 *   onPointerUp(x, y, id)
 */

export const engine = {
  canvas: null,
  ctx: null,
  w: 0,
  h: 0,
  dpr: 1,
  scene: null,
  _scenes: {},
  _last: 0,
  _running: false,

  init() {
    this.canvas = document.getElementById("game");
    this.ctx = this.canvas.getContext("2d");
    this._resize();
    window.addEventListener("resize", () => this._resize());

    // 통합 포인터 입력 (마우스 + 터치)
    const xy = (e) => {
      const r = this.canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top, id: e.pointerId };
    };
    let firstGesture = false;
    const wake = () => {
      if (!firstGesture) {
        firstGesture = true;
        unlockAudio();
      }
    };
    this.canvas.addEventListener("pointerdown", (e) => {
      wake();
      const p = xy(e);
      this.scene?.onPointerDown?.(p.x, p.y, p.id);
    });
    this.canvas.addEventListener("pointermove", (e) => {
      const p = xy(e);
      this.scene?.onPointerMove?.(p.x, p.y, p.id);
    });
    this.canvas.addEventListener("pointerup", (e) => {
      const p = xy(e);
      this.scene?.onPointerUp?.(p.x, p.y, p.id);
    });
    // 컨텍스트 메뉴(우클릭/롱탭) 방지
    this.canvas.addEventListener("contextmenu", (e) => e.preventDefault());
  },

  _resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const cssW = this.canvas.clientWidth || window.innerWidth;
    const cssH = this.canvas.clientHeight || window.innerHeight;
    this.w = cssW;
    this.h = cssH;
    this.canvas.width = Math.round(cssW * this.dpr);
    this.canvas.height = Math.round(cssH * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.scene?.onResize?.(this.w, this.h);
  },

  register(name, scene) {
    this._scenes[name] = scene;
  },

  setScene(name, ...args) {
    if (this.scene?.exit) this.scene.exit(this);
    this.scene = this._scenes[name];
    if (!this.scene) throw new Error("Unknown scene: " + name);
    this.scene.enter?.(this, ...args);
  },

  start() {
    if (this._running) return;
    this._running = true;
    this._last = performance.now();
    const loop = (now) => {
      if (!this._running) return;
      let dt = (now - this._last) / 1000;
      this._last = now;
      if (dt > 0.05) dt = 0.05; // 탭 전환 등으로 인한 큰 점프 방지
      this.scene?.update?.(dt);
      this.ctx.clearRect(0, 0, this.w, this.h);
      this.scene?.render?.(this.ctx, this.w, this.h);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  },
};
