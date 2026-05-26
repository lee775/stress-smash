// 부트스트랩 + 메인 메뉴 씬
import { engine } from "./engine.js";
import { drawBackground, drawTitleArt, drawButton } from "./ui.js";
import { drawProfessor } from "./characters.js";
import { pointInRect } from "./utils.js";
import { isMuted, toggleMuted, playClick } from "./audio.js";
import { stageRect, titleBottom, fitCharacter, buttonH, bottomPad } from "./layout.js";

import smash from "./games/smash.js";
import brain from "./games/brain.js";
import shin from "./games/shin.js";

const MENU_ITEMS = [
  { scene: "smash", emoji: "🔨", label: "화면 부수기" },
  { scene: "brain", emoji: "🧠", label: "교수님 지능 뺏기" },
  { scene: "shin", emoji: "🦵", label: "정강이 때려 종강" },
];

const menu = {
  pressed: -1,
  t: 0,

  // 컬럼-로컬 좌표 기준 버튼 배치
  _buttons(W, h) {
    const bw = Math.min(W * 0.84, 440);
    const bh = buttonH(h);
    const gap = bh * 0.34;
    const totalH = MENU_ITEMS.length * bh + (MENU_ITEMS.length - 1) * gap;
    const top = h - bottomPad(h) - totalH;
    const x = (W - bw) / 2;
    return MENU_ITEMS.map((it, i) => ({
      ...it,
      rect: { x, y: top + i * (bh + gap), w: bw, h: bh },
    }));
  },

  _muteRect(W) {
    const pad = Math.max(12, W * 0.03);
    return { x: W - pad - 44, y: pad, w: 44, h: 44 };
  },

  enter() {
    this.pressed = -1;
    this.t = 0;
  },

  update(dt) {
    this.t += dt;
  },

  render(ctx, w, h) {
    drawBackground(ctx, w, h, "menu");

    const stage = stageRect(w, h);
    const W = stage.w;
    ctx.save();
    ctx.translate(stage.x, 0);

    drawTitleArt(ctx, W, h);

    const buttons = this._buttons(W, h);
    const bandTop = titleBottom(W, h) + 18;
    const bandBottom = buttons[0].rect.y - 20;
    if (bandBottom - bandTop >= 120) {
      // 여백(headroom)을 두고 밴드 안에서 수직 중앙 정렬 → 위아래로 숨 쉬게
      const fit = fitCharacter(W, bandTop, bandBottom, 0.18);
      const figH = 332 * fit.scale;
      const groundY = bandTop + (bandBottom - bandTop + figH) / 2;
      const bob = Math.sin(this.t * 1.6) * 4;
      drawProfessor(ctx, { x: W / 2, y: groundY + bob, scale: fit.scale, smart: 1, mood: "smart" });
    }

    buttons.forEach((it, i) =>
      drawButton(ctx, it.rect, it.label, { emoji: it.emoji, pressed: this.pressed === i })
    );

    drawButton(ctx, this._muteRect(W), "", {
      variant: "ghost",
      emoji: isMuted() ? "🔇" : "🔊",
      fontSize: 22,
    });

    ctx.restore();
  },

  onPointerDown(x, y) {
    const stage = stageRect(engine.w, engine.h);
    const lx = x - stage.x;
    const W = stage.w;
    if (pointInRect(lx, y, this._muteRect(W))) {
      toggleMuted();
      if (!isMuted()) playClick();
      return;
    }
    const buttons = this._buttons(W, engine.h);
    this.pressed = buttons.findIndex((it) => pointInRect(lx, y, it.rect));
  },

  onPointerUp(x, y) {
    if (this.pressed < 0) return;
    const stage = stageRect(engine.w, engine.h);
    const buttons = this._buttons(stage.w, engine.h);
    const it = buttons[this.pressed];
    const hit = pointInRect(x - stage.x, y, it.rect);
    this.pressed = -1;
    if (hit) {
      playClick();
      engine.setScene(it.scene);
    }
  },
};

engine.init();
engine.register("menu", menu);
engine.register("smash", smash);
engine.register("brain", brain);
engine.register("shin", shin);
engine.setScene("menu");
engine.start();
