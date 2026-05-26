// 게임3: 정강이 때려 종강 — 정강이를 타격해 종강 게이지를 채운다
import { engine } from "../engine.js";
import { drawBackground, drawGauge, drawSpeechBubble, drawButton, drawBanner, Confetti } from "../ui.js";
import { drawProfessor, shinHitRect } from "../characters.js";
import { drawTopControls, handleTopControls } from "../sceneutil.js";
import { clamp, pointInRect, makeShake } from "../utils.js";
import { stageRect, topBarBottom, buttonH, bottomPad, fitCharacter } from "../layout.js";
import { playSlap, playWin, vibrate } from "../audio.js";

const SMART = 0.85;
const PER_HIT = 1 / 12;

function lineFor(p, done) {
  if (done) return "아이고~ 종강이야!!";
  if (p < 0.3) return "수업 더 들어야지~";
  if (p < 0.7) return "아야! 왜 때려!";
  return "조, 조금만 더 하면...";
}

const shin = {
  progress: 0,
  flinchT: 0,
  shake: makeShake(),
  done: false,
  confetti: null,
  resetPressed: false,
  miss: [],
  t: 0,

  _layout(W, h) {
    const top = topBarBottom(W);
    const gaugeY = top + 28;
    const gaugeH = 18;
    const hudBottom = gaugeY + gaugeH + 12;
    const resetH = buttonH(h);
    const resetY = h - bottomPad(h) - resetH;
    const resetW = Math.min(W * 0.5, 240);
    const resetRect = { x: (W - resetW) / 2, y: resetY, w: resetW, h: resetH };
    const fit = fitCharacter(W, hudBottom, resetY - 12, 0.26);
    return { gaugeY, gaugeH, hudBottom, resetRect, fit };
  },

  _flinch() {
    return clamp(this.flinchT / 0.3, 0, 1);
  },

  _targetRect(W, h) {
    const L = this._layout(W, h);
    const t = shinHitRect({ x: W / 2, y: L.fit.groundY, scale: L.fit.scale, smart: SMART, flinch: this._flinch() });
    return { x: t.x - 24, y: t.y - 18, w: t.w + 48, h: t.h + 34 };
  },

  enter() {
    this.progress = 0;
    this.flinchT = 0;
    this.done = false;
    this.resetPressed = false;
    this.miss = [];
    this.t = 0;
    this.confetti = new Confetti(engine.w, engine.h);
  },

  _hit() {
    if (this.done) return;
    this.progress = clamp(this.progress + PER_HIT, 0, 1);
    this.flinchT = 0.32;
    this.shake.add(16);
    playSlap();
    vibrate(40);
    if (this.progress >= 1 && !this.done) {
      this.done = true;
      this.flinchT = 0;
      this.confetti.burst(160);
      playWin();
      vibrate([0, 60, 50, 120]);
    }
  },

  update(dt) {
    this.t += dt;
    this.shake.step(dt);
    if (this.flinchT > 0) this.flinchT = Math.max(0, this.flinchT - dt);
    for (const m of this.miss) {
      m.y -= 60 * dt;
      m.life -= dt * 1.4;
    }
    this.miss = this.miss.filter((m) => m.life > 0);
    if (this.done) this.confetti.update(dt);
  },

  render(ctx, w, h) {
    drawBackground(ctx, w, h, "shin");

    const stage = stageRect(w, h);
    const W = stage.w;
    const L = this._layout(W, h);
    const off = this.shake.step(0);
    const glow = this.done ? 0 : 0.5 + 0.5 * Math.sin(this.t * 5);

    ctx.save();
    ctx.translate(stage.x, 0);

    ctx.save();
    ctx.translate(off.x, off.y);
    drawProfessor(ctx, {
      x: W / 2,
      y: L.fit.groundY,
      scale: L.fit.scale,
      smart: SMART,
      flinch: this._flinch(),
      shinGlow: glow,
      mood: this.done ? "happy" : "auto",
    });
    ctx.restore();

    // 말풍선 (머리 위, HUD 아래로 클램프)
    const bubbleBottom = Math.max(L.hudBottom + 92, L.fit.headTopY - 6);
    drawSpeechBubble(ctx, W / 2, bubbleBottom, lineFor(this.progress, this.done), {
      maxWidth: Math.min(W * 0.82, 340),
      fontSize: 18,
    });

    // 빗나감 표시
    ctx.save();
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "900 22px system-ui, sans-serif";
    for (const m of this.miss) {
      ctx.globalAlpha = clamp(m.life, 0, 1);
      ctx.fillText("툭…", m.x, m.y);
    }
    ctx.restore();

    drawGauge(ctx, { x: W * 0.1, y: L.gaugeY, w: W * 0.8, h: L.gaugeH }, this.progress, {
      label: "종강까지",
      color: "#ffd042",
    });

    drawTopControls(ctx, W, h, "정강이 종강");
    drawButton(ctx, L.resetRect, this.done ? "한 학기 더" : "처음부터", {
      emoji: "🔄",
      variant: this.done ? "primary" : "ghost",
      pressed: this.resetPressed,
    });

    ctx.restore();

    // 전체 화면 오버레이
    if (this.done) {
      this.confetti.render(ctx);
      drawBanner(ctx, w, h, "아이고 종강이야!", "한 학기 끝~ 수고하셨습니다 🎓");
    }
  },

  onPointerDown(x, y) {
    const stage = stageRect(engine.w, engine.h);
    const W = stage.w;
    const h = engine.h;
    const lx = x - stage.x;
    if (handleTopControls(lx, y, engine, W, h)) return;
    const L = this._layout(W, h);
    if (pointInRect(lx, y, L.resetRect)) {
      this.resetPressed = true;
      return;
    }
    if (this.done) return;
    if (pointInRect(lx, y, this._targetRect(W, h))) {
      this._hit();
    } else {
      this.miss.push({ x: lx, y, life: 0.7 });
      this.shake.add(4);
    }
  },

  onPointerUp(x, y) {
    if (this.resetPressed) {
      this.resetPressed = false;
      const stage = stageRect(engine.w, engine.h);
      const L = this._layout(stage.w, engine.h);
      if (pointInRect(x - stage.x, y, L.resetRect)) {
        this.progress = 0;
        this.done = false;
        this.flinchT = 0;
        this.miss = [];
      }
    }
  },
};

export default shin;
