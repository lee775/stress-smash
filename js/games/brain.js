// 게임2: 교수님 지능 뺏기 — 탭할수록 뇌가 쪼그라들고 지식이 빠져나가 할아버지가 된다
import { engine } from "../engine.js";
import { drawBackground, drawGauge, drawSpeechBubble, drawButton, Confetti } from "../ui.js";
import { drawProfessor } from "../characters.js";
import { drawBrain, drawKnowledgeGlyph, GLYPH_KINDS } from "../brainart.js";
import { drawTopControls, handleTopControls } from "../sceneutil.js";
import { clamp, pointInRect, makeShake, pick, rand } from "../utils.js";
import { playPop, playWin, vibrate } from "../audio.js";

const DRAIN = 0.03; // 탭당 지능 감소량 (세밀하게)

// 지능 단계: smart 내림차순
const STAGES = [
  { min: 0.86, label: "천재 교수님", line: "이 정도는 기본 상식이죠." },
  { min: 0.72, label: "교수님", line: "양자역학의 핵심은 말이지..." },
  { min: 0.58, label: "시간강사", line: "음... 미분을 하면 그러니까..." },
  { min: 0.44, label: "동네 아저씨", line: "어... 1 더하기 1은... 둘?" },
  { min: 0.3, label: "할아버지", line: "밥은... 먹었냐...?" },
  { min: 0.16, label: "꼬부랑 할아버지", line: "내 안경 어디 갔어..." },
  { min: 0.0, label: "그냥 할아버지", line: "에헴~ 라떼는 말이야!" },
];

function stageFor(smart) {
  return STAGES.find((s) => smart >= s.min) ?? STAGES[STAGES.length - 1];
}

const brain = {
  smart: 1,
  glyphs: [],
  shake: makeShake(),
  done: false,
  confetti: null,
  resetPressed: false,
  yank: 0,
  t: 0,

  _resetRect(w, h) {
    const bw = Math.min(w * 0.5, 240);
    const bh = 52;
    const pad = Math.max(12, h * 0.02);
    return { x: (w - bw) / 2, y: h - bh - pad, w: bw, h: bh };
  },
  _scale(w, h) {
    return clamp(Math.min(w * 0.0017, h * 0.0014), 0.5, 1.1);
  },
  _groundY(h) {
    return h * 0.85;
  },

  enter() {
    this.smart = 1;
    this.glyphs = [];
    this.done = false;
    this.resetPressed = false;
    this.yank = 0;
    this.t = 0;
    this.confetti = new Confetti(engine.w, engine.h);
  },

  _drain(headX, headY) {
    if (this.done) return;
    this.smart = clamp(this.smart - DRAIN, 0, 1);
    this.shake.add(8);
    this.yank = 1;
    playPop();
    vibrate(14);
    // 지식 글리프 한두 개가 머리에서 빠져나간다
    const n = 1 + (Math.random() < 0.4 ? 1 : 0);
    for (let i = 0; i < n; i++) {
      const ang = rand(-Math.PI * 0.85, -Math.PI * 0.15);
      const sp = rand(70, 150);
      this.glyphs.push({
        kind: pick(GLYPH_KINDS),
        x: headX + rand(-20, 20),
        y: headY + rand(-10, 10),
        vx: Math.cos(ang) * sp,
        vy: Math.sin(ang) * sp - 40,
        rot: rand(-0.4, 0.4),
        size: rand(26, 40),
        life: 1,
      });
    }
    if (this.smart <= 0 && !this.done) {
      this.done = true;
      this.confetti.burst(140);
      playWin();
      vibrate([0, 40, 40, 90]);
    }
  },

  update(dt) {
    this.t += dt;
    this.shake.step(dt);
    if (this.yank > 0) this.yank = Math.max(0, this.yank - dt * 4);
    for (const g of this.glyphs) {
      g.x += g.vx * dt;
      g.y += g.vy * dt;
      g.vy += 30 * dt;
      g.life -= dt * 0.9;
    }
    this.glyphs = this.glyphs.filter((g) => g.life > 0);
    if (this.done) this.confetti.update(dt);
  },

  render(ctx, w, h) {
    drawBackground(ctx, w, h, "brain");

    const scale = this._scale(w, h);
    const groundY = this._groundY(h);
    const off = this.shake.step(0);

    ctx.save();
    ctx.translate(off.x, off.y);
    drawProfessor(ctx, { x: w / 2, y: groundY, scale, smart: this.smart });
    ctx.restore();

    // 머리 위로 빨려나오는 뇌 (남은 지능 시각화)
    const headTop = groundY + (-252 - 59) * scale + off.y;
    const brainSize = 78 * scale;
    const brainY = headTop - brainSize * 0.5 - this.yank * 16 + Math.sin(this.t * 2) * 3;
    const brainX = w / 2 + off.x;
    drawBrain(ctx, brainX, brainY, brainSize, this.smart);

    // 빠져나간 지식 글리프
    for (const g of this.glyphs) {
      ctx.save();
      ctx.translate(g.x, g.y);
      ctx.rotate(g.rot);
      drawKnowledgeGlyph(ctx, g.kind, 0, 0, g.size, clamp(g.life, 0, 1));
      ctx.restore();
    }

    // 말풍선 (뇌 위)
    const stage = stageFor(this.smart);
    drawSpeechBubble(ctx, w / 2, brainY - brainSize * 0.55, stage.line, {
      maxWidth: Math.min(w * 0.82, 380),
      fontSize: 19,
    });

    // IQ 게이지
    const iq = Math.round(this.smart * 130 + 20);
    drawGauge(ctx, { x: w * 0.1, y: h * 0.14, w: w * 0.8, h: 18 }, this.smart, {
      label: `교수님 지능  IQ ${iq}`,
      color: "#5ad1ff",
      showPct: false,
    });

    // 현재 단계 라벨
    ctx.save();
    ctx.fillStyle = this.done ? "#fff3a8" : "rgba(255,255,255,0.95)";
    ctx.font = "900 20px system-ui, 'Apple SD Gothic Neo', sans-serif";
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(0,0,0,0.4)";
    ctx.shadowBlur = 6;
    ctx.fillText(this.done ? "🎉 할아버지 완성! 🎉" : `🧠 ${stage.label}`, w / 2, h * 0.2);
    ctx.restore();

    drawTopControls(ctx, w, h, "지능 뺏기");

    if (this.done) this.confetti.render(ctx);

    drawButton(ctx, this._resetRect(w, h), "지능 복구", {
      emoji: "🔄",
      variant: "primary",
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
    const scale = this._scale(w, h);
    const headY = this._groundY(h) + (-252) * scale;
    this._drain(w / 2, headY);
  },

  onPointerUp(x, y) {
    if (this.resetPressed) {
      this.resetPressed = false;
      if (pointInRect(x, y, this._resetRect(engine.w, engine.h))) {
        this.smart = 1;
        this.done = false;
        this.glyphs = [];
      }
    }
  },
};

export default brain;
