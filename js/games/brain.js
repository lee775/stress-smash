// 게임2: 교수님 지능 뺏기 — 탭할수록 뇌가 쪼그라들고 지식이 빠져나가 할아버지가 된다
import { engine } from "../engine.js";
import { drawBackground, drawGauge, drawSpeechBubble, drawButton, Confetti } from "../ui.js";
import { drawProfessor } from "../characters.js";
import { drawBrain, drawKnowledgeGlyph, GLYPH_KINDS } from "../brainart.js";
import { drawTopControls, handleTopControls } from "../sceneutil.js";
import { clamp, pointInRect, makeShake, pick, rand } from "../utils.js";
import { stageRect, topBarBottom, buttonH, bottomPad, fitCharacter } from "../layout.js";
import { playPop, playWin, vibrate } from "../audio.js";

const DRAIN = 0.03; // 탭당 지능 감소량 (세밀하게)

const STAGES = [
  {
    min: 0.86,
    label: "천재 교수님",
    lines: ["이 정도는 기본 상식이죠.", "프로이트 학파에 따르면....", "과제 내세요."],
  },
  {
    min: 0.72,
    label: "교수님",
    lines: ["양자역학의 핵심은 말이지...", "윤지학생은....졸업을 아직도...?", "과제 내세요."],
  },
  {
    min: 0.58,
    label: "시간강사",
    lines: ["음... 미분을 하면 그러니까...", "프로이트 학파에 따르면....", "윤지학생은....졸업을 아직도...?"],
  },
  { min: 0.44, label: "동네 아저씨", lines: ["어... 1 더하기 1은... 둘?"] },
  { min: 0.3, label: "할아버지", lines: ["밥은... 먹었냐...?"] },
  { min: 0.16, label: "꼬부랑 할아버지", lines: ["내 안경 어디 갔어..."] },
  { min: 0.0, label: "그냥 할아버지", lines: ["에헴~ 라떼는 말이야!"] },
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
  lineIdx: 0,

  // 컬럼-로컬 레이아웃 (W = stage.w)
  _layout(W, h) {
    const top = topBarBottom(W);
    const gaugeY = top + 28;
    const gaugeH = 18;
    const labelY = gaugeY + gaugeH + 24;
    const hudBottom = labelY + 8;
    const resetH = buttonH(h);
    const resetY = h - bottomPad(h) - resetH;
    const resetRect = { x: (W - Math.min(W * 0.5, 240)) / 2, y: resetY, w: Math.min(W * 0.5, 240), h: resetH };
    const fit = fitCharacter(W, hudBottom, resetY - 12, 0.42);
    return { gaugeY, gaugeH, labelY, hudBottom, resetRect, fit };
  },

  enter() {
    this.smart = 1;
    this.glyphs = [];
    this.done = false;
    this.resetPressed = false;
    this.yank = 0;
    this.t = 0;
    this.lineIdx = 0;
    this.confetti = new Confetti(engine.w, engine.h);
  },

  _drain(headX, headY) {
    if (this.done) return;
    this.smart = clamp(this.smart - DRAIN, 0, 1);
    this.lineIdx++;
    this.shake.add(8);
    this.yank = 1;
    playPop();
    vibrate(14);
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
        size: rand(24, 38),
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

    const stage = stageRect(w, h);
    const W = stage.w;
    const L = this._layout(W, h);
    const off = this.shake.step(0);
    const stageObj = stageFor(this.smart);
    const line = stageObj.lines[this.lineIdx % stageObj.lines.length];

    ctx.save();
    ctx.translate(stage.x, 0);

    // 캐릭터 + 뇌 (흔들림 적용)
    ctx.save();
    ctx.translate(off.x, off.y);
    drawProfessor(ctx, { x: W / 2, y: L.fit.groundY, scale: L.fit.scale, smart: this.smart });
    const brainSize = 76 * L.fit.scale;
    const brainY = L.fit.headTopY - brainSize * 0.42 - this.yank * 16 + Math.sin(this.t * 2) * 3;
    drawBrain(ctx, W / 2, brainY, brainSize, this.smart);
    ctx.restore();

    // 빠져나간 지식 글리프
    for (const g of this.glyphs) {
      ctx.save();
      ctx.translate(g.x, g.y);
      ctx.rotate(g.rot);
      drawKnowledgeGlyph(ctx, g.kind, 0, 0, g.size, clamp(g.life, 0, 1));
      ctx.restore();
    }

    // 말풍선 (뇌 위, HUD 아래로 클램프)
    const bubbleBottom = Math.max(L.hudBottom + 96, brainY - brainSize * 0.6);
    drawSpeechBubble(ctx, W / 2, bubbleBottom, line, {
      maxWidth: Math.min(W * 0.82, 360),
      fontSize: 18,
    });

    // IQ 게이지
    const iq = Math.round(this.smart * 130 + 20);
    drawGauge(ctx, { x: W * 0.1, y: L.gaugeY, w: W * 0.8, h: L.gaugeH }, this.smart, {
      label: `교수님 지능  IQ ${iq}`,
      color: "#5ad1ff",
      showPct: false,
    });

    // 단계 라벨
    ctx.save();
    ctx.fillStyle = this.done ? "#fff3a8" : "rgba(255,255,255,0.95)";
    ctx.font = "900 19px system-ui, 'Apple SD Gothic Neo', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.shadowColor = "rgba(0,0,0,0.4)";
    ctx.shadowBlur = 6;
    ctx.fillText(this.done ? "🎉 할아버지 완성! 🎉" : `🧠 ${stageObj.label}`, W / 2, L.labelY);
    ctx.restore();

    drawTopControls(ctx, W, h, "지능 뺏기");
    drawButton(ctx, L.resetRect, "지능 복구", { emoji: "🔄", variant: "primary", pressed: this.resetPressed });

    ctx.restore();

    // 꽃가루는 전체 화면 기준
    if (this.done) this.confetti.render(ctx);
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
    const headY = L.fit.groundY + -252 * L.fit.scale;
    this._drain(W / 2, headY);
  },

  onPointerUp(x, y) {
    if (this.resetPressed) {
      this.resetPressed = false;
      const stage = stageRect(engine.w, engine.h);
      const L = this._layout(stage.w, engine.h);
      if (pointInRect(x - stage.x, y, L.resetRect)) {
        this.smart = 1;
        this.done = false;
        this.glyphs = [];
      }
    }
  },
};

export default brain;
