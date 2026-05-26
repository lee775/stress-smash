// 게임3: 정강이 때려 종강 — 교수님 정강이를 타격해 종강 게이지를 채운다
import { engine } from "../engine.js";
import { drawBackground, drawGauge, drawSpeechBubble, drawButton, drawBanner, Confetti } from "../ui.js";
import { drawProfessor, shinHitRect } from "../characters.js";
import { drawTopControls, handleTopControls } from "../sceneutil.js";
import { clamp, pointInRect, makeShake } from "../utils.js";
import { playSlap, playWin, vibrate } from "../audio.js";

const SMART = 0.85; // 교수님 상태 유지 (할아버지 아님)
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

  _resetRect(w, h) {
    const bw = Math.min(w * 0.5, 240);
    const bh = 54;
    const pad = Math.max(14, h * 0.025);
    return { x: (w - bw) / 2, y: h - bh - pad, w: bw, h: bh };
  },
  _scale(w, h) {
    return clamp(Math.min(w * 0.0017, h * 0.0014), 0.5, 1.15);
  },
  _groundY(h) {
    return h * 0.82;
  },
  _flinch() {
    return clamp(this.flinchT / 0.3, 0, 1);
  },

  _targetRect(w, h) {
    const t = shinHitRect({
      x: w / 2,
      y: this._groundY(h),
      scale: this._scale(w, h),
      smart: SMART,
      flinch: this._flinch(),
    });
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

    const scale = this._scale(w, h);
    const groundY = this._groundY(h);
    const off = this.shake.step(0);
    const glow = this.done ? 0 : 0.5 + 0.5 * Math.sin(this.t * 5);

    ctx.save();
    ctx.translate(off.x, off.y);
    drawProfessor(ctx, {
      x: w / 2,
      y: groundY,
      scale,
      smart: SMART,
      flinch: this._flinch(),
      shinGlow: glow,
      mood: this.done ? "happy" : "auto",
    });
    ctx.restore();

    const headTopY = groundY + (-252 - 59) * scale;
    drawSpeechBubble(ctx, w / 2, headTopY, lineFor(this.progress, this.done), {
      maxWidth: Math.min(w * 0.8, 360),
      fontSize: 20,
    });

    // 빗나감 표시
    ctx.save();
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.font = "900 22px Arial, sans-serif";
    for (const m of this.miss) {
      ctx.globalAlpha = clamp(m.life, 0, 1);
      ctx.fillText("툭…", m.x, m.y);
    }
    ctx.restore();

    drawGauge(ctx, { x: w * 0.1, y: h * 0.135, w: w * 0.8, h: 20 }, this.progress, {
      label: "종강까지",
      color: "#ffd042",
    });

    drawTopControls(ctx, w, h, "정강이 종강");

    if (this.done) {
      this.confetti.render(ctx);
      drawBanner(ctx, w, h, "아이고 종강이야!", "한 학기 끝~ 수고하셨습니다 🎓");
    }

    drawButton(ctx, this._resetRect(w, h), this.done ? "한 학기 더" : "처음부터", {
      emoji: "🔄",
      variant: this.done ? "primary" : "ghost",
      pressed: this.resetPressed,
    });
  },

  onPointerDown(x, y) {
    const w = engine.w;
    const h = engine.h;
    if (handleTopControls(x, y, engine, w, h)) return;
    if (pointInRect(x, y, this._resetRect(w, h))) {
      this.resetPressed = true;
      return;
    }
    if (this.done) return;
    if (pointInRect(x, y, this._targetRect(w, h))) {
      this._hit();
    } else {
      this.miss.push({ x, y, life: 0.7 });
      this.shake.add(4);
    }
  },

  onPointerUp(x, y) {
    if (this.resetPressed) {
      this.resetPressed = false;
      if (pointInRect(x, y, this._resetRect(engine.w, engine.h))) {
        this.progress = 0;
        this.done = false;
        this.flinchT = 0;
        this.miss = [];
      }
    }
  },
};

export default shin;
