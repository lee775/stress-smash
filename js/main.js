// 부트스트랩 + 메인 메뉴 씬
import { engine } from "./engine.js";
import { drawBackground, drawTitleArt, drawButton } from "./ui.js";
import { drawProfessor } from "./characters.js";
import { pointInRect } from "./utils.js";
import { isMuted, toggleMuted, playClick } from "./audio.js";

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

  _layout(w, h) {
    const bw = Math.min(w * 0.84, 460);
    const bh = Math.min(76, h * 0.11);
    const gap = bh * 0.34;
    const totalH = MENU_ITEMS.length * bh + (MENU_ITEMS.length - 1) * gap;
    const startY = Math.max(h * 0.46, h - totalH - h * 0.12);
    const x = (w - bw) / 2;
    return MENU_ITEMS.map((it, i) => ({
      ...it,
      rect: { x, y: startY + i * (bh + gap), w: bw, h: bh },
    }));
  },

  _muteRect(w, h) {
    const s = 44;
    const pad = Math.max(12, w * 0.03);
    return { x: w - pad - s, y: pad, w: s, h: s };
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
    drawTitleArt(ctx, w, h);

    // 살짝 흔들거리는 교수님 미리보기
    const bob = Math.sin(this.t * 1.6) * 6;
    drawProfessor(ctx, {
      x: w / 2,
      y: h * 0.46 + bob,
      scale: Math.min(w, h) * 0.00072 + 0.18,
      smart: 1,
      mood: "smart",
    });

    const items = this._layout(w, h);
    items.forEach((it, i) =>
      drawButton(ctx, it.rect, it.label, {
        emoji: it.emoji,
        pressed: this.pressed === i,
      })
    );

    drawButton(ctx, this._muteRect(w, h), "", {
      variant: "ghost",
      emoji: isMuted() ? "🔇" : "🔊",
      fontSize: 22,
    });
  },

  onPointerDown(x, y) {
    const w = engine.w;
    const h = engine.h;
    if (pointInRect(x, y, this._muteRect(w, h))) {
      toggleMuted();
      if (!isMuted()) playClick();
      return;
    }
    const items = this._layout(w, h);
    this.pressed = items.findIndex((it) => pointInRect(x, y, it.rect));
  },

  onPointerUp(x, y) {
    if (this.pressed < 0) return;
    const items = this._layout(engine.w, engine.h);
    const it = items[this.pressed];
    const hit = pointInRect(x, y, it.rect);
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
