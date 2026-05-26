// 게임1: 화면 부수기 — PC는 바탕화면 / 모바일은 홈화면을 무기로 박살낸다
import { engine } from "../engine.js";
import { drawButton } from "../ui.js";
import { drawDesktopWallpaper, drawMobileHome } from "../scenery.js";
import { WEAPONS, drawWeaponIcon, drawWeaponCursor, weaponImpact } from "../weapons.js";
import { makeCrack, drawCrack, ShardBurst } from "../effects.js";
import { drawTopControls, handleTopControls } from "../sceneutil.js";
import { makeShake, pointInRect, dist, isMobile } from "../utils.js";
import { playCrack, vibrate } from "../audio.js";

const MAX_CRACKS = 70;
const SWING = 0.22; // 스윙 1회 시간(초)

const smash = {
  cracks: [],
  bursts: [],
  shake: makeShake(),
  count: 0,
  down: false,
  lastX: 0,
  lastY: 0,
  curX: 0,
  curY: 0,
  swingT: 1,
  weapon: "hammer",
  resetPressed: false,
  mobile: false,
  bg: null,
  bgKey: "",

  _resetRect(w, h) {
    const bw = Math.min(w * 0.5, 240);
    const bh = 52;
    const pad = Math.max(12, h * 0.02);
    return { x: (w - bw) / 2, y: h - bh - pad, w: bw, h: bh };
  },

  _weaponRects(w, h) {
    const n = WEAPONS.length;
    const ws = Math.max(46, Math.min(68, w * 0.15));
    const gap = Math.max(6, w * 0.02);
    const total = n * ws + (n - 1) * gap;
    const bx = (w - total) / 2;
    const by = this._resetRect(w, h).y - ws - 12;
    return WEAPONS.map((wp, i) => ({
      id: wp.id,
      rect: { x: bx + i * (ws + gap), y: by, w: ws, h: ws },
    }));
  },

  _buildBg(w, h) {
    const dpr = engine.dpr || 1;
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(w * dpr));
    c.height = Math.max(1, Math.round(h * dpr));
    const cx = c.getContext("2d");
    cx.scale(dpr, dpr);
    if (this.mobile) drawMobileHome(cx, w, h);
    else drawDesktopWallpaper(cx, w, h);
    this.bg = c;
    this.bgKey = `${this.mobile ? "m" : "d"}:${Math.round(w)}x${Math.round(h)}`;
  },

  enter() {
    this.cracks = [];
    this.bursts = [];
    this.count = 0;
    this.down = false;
    this.resetPressed = false;
    this.swingT = 1;
    this.mobile = isMobile();
    this.curX = engine.w / 2;
    this.curY = engine.h / 2;
    this.bg = null;
    this.bgKey = "";
    engine.canvas.style.cursor = "none";
  },

  exit() {
    engine.canvas.style.cursor = "";
  },

  onResize() {
    this.bg = null; // 다음 렌더에서 재생성
  },

  _hit(x, y, strong) {
    const imp = weaponImpact(this.weapon);
    const power = strong ? 1 : 0.7;
    this.cracks.push(
      makeCrack(x, y, { scale: imp.crackScale * power, density: imp.density, color: imp.color })
    );
    if (this.cracks.length > MAX_CRACKS) this.cracks.shift();
    this.bursts.push(new ShardBurst(x, y, { count: imp.shards * power, color: imp.color }));
    this.shake.add(imp.shake * power);
    this.swingT = 0;
    this.count++;
    playCrack();
    vibrate(Math.round(imp.shake * power));
    this.lastX = x;
    this.lastY = y;
    this.curX = x;
    this.curY = y;
  },

  update(dt) {
    this.shake.step(dt);
    if (this.swingT < 1) this.swingT = Math.min(1, this.swingT + dt / SWING);
    for (const b of this.bursts) b.update(dt);
    this.bursts = this.bursts.filter((b) => !b.dead);
  },

  render(ctx, w, h) {
    const key = `${this.mobile ? "m" : "d"}:${Math.round(w)}x${Math.round(h)}`;
    if (!this.bg || this.bgKey !== key) this._buildBg(w, h);
    ctx.drawImage(this.bg, 0, 0, w, h);

    const off = this.shake.step(0);
    ctx.save();
    ctx.translate(off.x, off.y);
    for (const c of this.cracks) drawCrack(ctx, c);
    for (const b of this.bursts) b.render(ctx);
    ctx.restore();

    // 무기 커서
    drawWeaponCursor(ctx, this.weapon, this.curX, this.curY, this.swingT);

    if (this.count === 0) {
      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.font = "900 21px system-ui, 'Apple SD Gothic Neo', sans-serif";
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 8;
      ctx.fillText("무기를 고르고 마구 박살내세요!", w / 2, h * 0.46);
      ctx.restore();
    }

    drawTopControls(ctx, w, h, "화면 부수기");

    ctx.save();
    ctx.fillStyle = "#ffe66d";
    ctx.font = "900 28px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 6;
    ctx.fillText(`💥 ${this.count}`, w / 2, h * 0.115);
    ctx.restore();

    // 무기 선택 바
    for (const wp of this._weaponRects(w, h)) {
      drawButton(ctx, wp.rect, "", {
        variant: wp.id === this.weapon ? "primary" : "ghost",
        pressed: wp.id === this.weapon,
      });
      const pad = wp.rect.w * 0.16;
      drawWeaponIcon(ctx, wp.id, {
        x: wp.rect.x + pad,
        y: wp.rect.y + pad,
        w: wp.rect.w - pad * 2,
        h: wp.rect.h - pad * 2,
      });
    }

    drawButton(ctx, this._resetRect(w, h), "싹 치우기", {
      variant: "danger",
      emoji: "🧹",
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
    for (const wp of this._weaponRects(w, h)) {
      if (pointInRect(x, y, wp.rect)) {
        this.weapon = wp.id;
        vibrate(10);
        return;
      }
    }
    this.down = true;
    this._hit(x, y, true);
  },

  onPointerMove(x, y) {
    this.curX = x;
    this.curY = y;
    if (!this.down) return;
    if (dist(x, y, this.lastX, this.lastY) > 46) this._hit(x, y, false);
  },

  onPointerUp(x, y) {
    this.down = false;
    if (this.resetPressed) {
      this.resetPressed = false;
      if (pointInRect(x, y, this._resetRect(engine.w, engine.h))) {
        this.cracks = [];
        this.bursts = [];
        this.count = 0;
      }
    }
  },
};

export default smash;
