const FONT = "system-ui, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif";

function clamp01(v) {
  return Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0));
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function fillRoundRect(ctx, x, y, w, h, r, fill) {
  ctx.save();
  roundRect(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.restore();
}

function radial(ctx, x, y, r, stops) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  stops.forEach(([p, c]) => g.addColorStop(p, c));
  return g;
}

function linear(ctx, x0, y0, x1, y1, stops) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  stops.forEach(([p, c]) => g.addColorStop(p, c));
  return g;
}

function drawBlob(ctx, x, y, r, fill, alpha = 1, sides = 8) {
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  for (let i = 0; i <= sides; i++) {
    const a = (Math.PI * 2 * i) / sides;
    const wave = 0.82 + Math.sin(i * 1.7) * 0.08 + Math.cos(i * 2.3) * 0.06;
    const px = Math.cos(a) * r * wave;
    const py = Math.sin(a) * r * wave;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.quadraticCurveTo(Math.cos(a - 0.18) * r, Math.sin(a - 0.18) * r, px, py);
  }
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.restore();
}

function wrapText(ctx, text, maxWidth) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth || !line) {
      line = test;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function drawBackground(ctx, w, h, key) {
  ctx.save();

  const palettes = {
    menu: {
      base: [["#1b1242", "#45228c", "#ff5f9e"], ["rgba(255,101,176,.26)", "rgba(116,88,255,.22)", "rgba(43,221,255,.18)"]],
      glow: "#ff75c8",
      accent: "#76f0ff"
    },
    smash: {
      base: [["#070a14", "#121a2b", "#293954"], ["rgba(112,190,255,.18)", "rgba(255,255,255,.10)", "rgba(117,91,255,.14)"]],
      glow: "#8fd7ff",
      accent: "#ffffff"
    },
    brain: {
      base: [["#06252c", "#0b6066", "#42d5b4"], ["rgba(68,244,204,.22)", "rgba(107,156,255,.15)", "rgba(255,255,255,.10)"]],
      glow: "#56f0d4",
      accent: "#b7fff0"
    },
    shin: {
      base: [["#2c170d", "#9a5630", "#ffd48c"], ["rgba(255,214,135,.28)", "rgba(255,112,86,.16)", "rgba(255,255,255,.14)"]],
      glow: "#ffd28a",
      accent: "#fff3c9"
    }
  };
  const p = palettes[key] || palettes.menu;

  ctx.fillStyle = linear(ctx, 0, 0, w, h, [
    [0, p.base[0][0]],
    [0.58, p.base[0][1]],
    [1, p.base[0][2]]
  ]);
  ctx.fillRect(0, 0, w, h);

  // 부드러운 분위기 레이어
  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = radial(ctx, w * 0.18, h * 0.16, Math.max(w, h) * 0.58, [[0, p.base[1][0]], [1, "rgba(255,255,255,0)"]]);
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = radial(ctx, w * 0.86, h * 0.34, Math.max(w, h) * 0.48, [[0, p.base[1][1]], [1, "rgba(255,255,255,0)"]]);
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = radial(ctx, w * 0.52, h * 0.96, Math.max(w, h) * 0.62, [[0, p.base[1][2]], [1, "rgba(255,255,255,0)"]]);
  ctx.fillRect(0, 0, w, h);

  drawBlob(ctx, w * 0.12, h * 0.72, Math.min(w, h) * 0.22, p.glow, 0.11, 9);
  drawBlob(ctx, w * 0.92, h * 0.16, Math.min(w, h) * 0.18, p.accent, 0.09, 7);
  drawBlob(ctx, w * 0.72, h * 0.82, Math.min(w, h) * 0.14, "#ffffff", 0.06, 8);

  ctx.globalCompositeOperation = "source-over";
  ctx.strokeStyle = "rgba(255,255,255,.10)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 7; i++) {
    ctx.save();
    ctx.translate(w * (0.08 + i * 0.16), h * (0.18 + (i % 3) * 0.18));
    ctx.rotate(-0.35);
    roundRect(ctx, -46, -18, 92, 36, 18);
    ctx.stroke();
    ctx.restore();
  }

  ctx.fillStyle = radial(ctx, w / 2, h / 2, Math.max(w, h) * 0.72, [[0, "rgba(0,0,0,0)"], [0.72, "rgba(0,0,0,.12)"], [1, "rgba(0,0,0,.42)"]]);
  ctx.fillRect(0, 0, w, h);

  ctx.restore();
}

export function drawTitleArt(ctx, w, h) {
  ctx.save();
  const cx = w / 2;
  const cy = h * 0.2;
  const titleSize = Math.max(42, Math.min(76, w * 0.14));
  const subSize = Math.max(18, Math.min(28, w * 0.055));

  // 타이틀 뒤 폭발 하이라이트
  ctx.save();
  ctx.translate(cx, cy + 10);
  for (let i = 0; i < 18; i++) {
    ctx.save();
    ctx.rotate((Math.PI * 2 * i) / 18);
    ctx.fillStyle = i % 2 ? "rgba(255,232,116,.38)" : "rgba(255,105,190,.32)";
    roundRect(ctx, 14, -4, w * 0.22, 8, 4);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();

  ctx.fillStyle = radial(ctx, cx, cy, w * 0.45, [[0, "rgba(255,255,255,.30)"], [0.46, "rgba(255,116,210,.15)"], [1, "rgba(255,255,255,0)"]]);
  ctx.fillRect(0, 0, w, h * 0.42);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.font = `900 ${titleSize}px ${FONT}`;

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,.42)";
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 8;
  ctx.strokeStyle = "rgba(55,22,89,.92)";
  ctx.lineWidth = Math.max(7, titleSize * 0.13);
  ctx.strokeText("스트레스 박살", cx, cy);
  ctx.restore();

  const tg = linear(ctx, 0, cy - titleSize / 2, 0, cy + titleSize / 2, [
    [0, "#ffffff"],
    [0.22, "#fff4a8"],
    [0.56, "#ff66c4"],
    [1, "#8c5bff"]
  ]);
  ctx.fillStyle = tg;
  ctx.fillText("스트레스 박살", cx, cy);

  ctx.save();
  ctx.globalAlpha = 0.52;
  ctx.fillStyle = "#ffffff";
  ctx.font = `900 ${Math.max(18, titleSize * 0.34)}px ${FONT}`;
  ctx.fillText("스트레스 박살", cx, cy - titleSize * 0.23);
  ctx.restore();

  const pillW = Math.min(w * 0.56, 310);
  const pillH = Math.max(36, subSize * 1.65);
  const pillX = cx - pillW / 2;
  const pillY = cy + titleSize * 0.58;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,.24)";
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 5;
  fillRoundRect(ctx, pillX, pillY, pillW, pillH, pillH / 2, "rgba(255,255,255,.18)");
  ctx.restore();

  roundRect(ctx, pillX, pillY, pillW, pillH, pillH / 2);
  ctx.strokeStyle = "rgba(255,255,255,.38)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = `800 ${subSize}px ${FONT}`;
  ctx.fillStyle = "#fff8fb";
  ctx.shadowColor = "rgba(0,0,0,.25)";
  ctx.shadowBlur = 5;
  ctx.shadowOffsetY = 2;
  ctx.fillText("교수님 시리즈", cx, pillY + pillH / 2 + 1);

  ctx.restore();
}

export function drawButton(ctx, rect, label, opts = {}) {
  ctx.save();
  const { x, y, w, h } = rect;
  const variant = opts.variant || "primary";
  const pressed = !!opts.pressed;
  const offset = pressed ? 3 : 0;
  const r = h / 2;
  const fontSize = opts.fontSize || Math.max(18, Math.min(26, h * 0.34));

  const colors = {
    primary: ["#fff2a8", "#ff8bd4", "#7d5cff", "#4b2ab7"],
    ghost: ["rgba(255,255,255,.34)", "rgba(255,255,255,.16)", "rgba(255,255,255,.08)", "rgba(255,255,255,.22)"],
    danger: ["#ffd1b8", "#ff6a66", "#d92750", "#8b1433"]
  }[variant] || ["#fff2a8", "#ff8bd4", "#7d5cff", "#4b2ab7"];

  ctx.save();
  ctx.shadowColor = pressed ? "rgba(0,0,0,.18)" : "rgba(0,0,0,.34)";
  ctx.shadowBlur = pressed ? 8 : 18;
  ctx.shadowOffsetY = pressed ? 3 : 9;
  fillRoundRect(ctx, x, y + offset, w, h, r, linear(ctx, x, y, x, y + h, [
    [0, colors[0]],
    [0.48, colors[1]],
    [1, colors[2]]
  ]));
  ctx.restore();

  roundRect(ctx, x, y + offset, w, h, r);
  ctx.strokeStyle = variant === "ghost" ? "rgba(255,255,255,.46)" : "rgba(255,255,255,.54)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.save();
  roundRect(ctx, x + 5, y + offset + 4, w - 10, h * 0.45, r);
  ctx.clip();
  ctx.fillStyle = linear(ctx, x, y, x, y + h * 0.5, [[0, "rgba(255,255,255,.56)"], [1, "rgba(255,255,255,0)"]]);
  ctx.fillRect(x + 5, y + offset + 4, w - 10, h * 0.45);
  ctx.restore();

  if (pressed) {
    ctx.fillStyle = "rgba(0,0,0,.12)";
    roundRect(ctx, x, y + offset, w, h, r);
    ctx.fill();
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `900 ${fontSize}px ${FONT}`;
  ctx.fillStyle = variant === "ghost" ? "#ffffff" : "#fffaff";
  ctx.shadowColor = "rgba(28,10,55,.34)";
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 2;
  const text = opts.emoji ? `${opts.emoji} ${label}` : String(label);
  ctx.fillText(text, x + w / 2, y + offset + h / 2 + 1);

  ctx.restore();
}

export function drawGauge(ctx, rect, value01, opts = {}) {
  ctx.save();
  const v = clamp01(value01);
  const { x, y, w, h } = rect;
  const label = opts.label || "";
  const color = opts.color || (opts.danger ? "#ff4f6e" : "#63e6d1");
  const trackColor = opts.trackColor || "rgba(255,255,255,.18)";
  const pct = `${Math.round(v * 100)}%`;

  ctx.textBaseline = "alphabetic";
  ctx.font = `800 ${Math.max(13, Math.min(17, h * 0.42))}px ${FONT}`;
  ctx.fillStyle = "rgba(255,255,255,.88)";
  ctx.shadowColor = "rgba(0,0,0,.25)";
  ctx.shadowBlur = 4;
  if (label) {
    ctx.textAlign = "left";
    ctx.fillText(label, x, y - 8);
  }
  if (opts.showPct !== false) {
    ctx.textAlign = "right";
    ctx.fillText(pct, x + w, y - 8);
  }

  ctx.shadowBlur = 0;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,.25)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 5;
  fillRoundRect(ctx, x, y, w, h, h / 2, trackColor);
  ctx.restore();

  roundRect(ctx, x, y, w, h, h / 2);
  ctx.strokeStyle = "rgba(255,255,255,.28)";
  ctx.lineWidth = 1;
  ctx.stroke();

  const fillW = Math.max(h, w * v);
  const fg = linear(ctx, x, y, x + w, y, [
    [0, "#ffffff"],
    [0.16, color],
    [0.72, opts.danger ? "#ff315b" : "#34c9ff"],
    [1, opts.danger ? "#bb163b" : "#7967ff"]
  ]);
  ctx.save();
  roundRect(ctx, x, y, fillW, h, h / 2);
  ctx.clip();
  ctx.fillStyle = fg;
  ctx.fillRect(x, y, fillW, h);
  ctx.fillStyle = linear(ctx, x, y, x, y + h, [[0, "rgba(255,255,255,.58)"], [0.45, "rgba(255,255,255,.16)"], [1, "rgba(255,255,255,0)"]]);
  ctx.fillRect(x + 2, y + 2, Math.max(0, fillW - 4), h * 0.45);
  ctx.restore();

  ctx.restore();
}

export function drawSpeechBubble(ctx, cx, bottomY, text, opts = {}) {
  ctx.save();
  const fontSize = opts.fontSize || 22;
  const maxWidth = opts.maxWidth || 360;
  ctx.font = `800 ${fontSize}px ${FONT}`;
  const lines = wrapText(ctx, text, maxWidth - 48);
  const lineH = fontSize * 1.32;
  const textW = Math.max(...lines.map((line) => ctx.measureText(line).width), 40);
  const bw = Math.min(maxWidth, textW + 48);
  const bh = lines.length * lineH + 34;
  const x = cx - bw / 2;
  const y = bottomY - bh - 28;
  const r = Math.min(24, bh * 0.32);

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,.28)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 8;
  fillRoundRect(ctx, x, y, bw, bh, r, opts.bg || "rgba(255,255,255,.92)");
  ctx.restore();

  ctx.beginPath();
  ctx.moveTo(cx - 16, y + bh - 2);
  ctx.lineTo(cx, bottomY);
  ctx.lineTo(cx + 16, y + bh - 2);
  ctx.closePath();
  ctx.fillStyle = opts.bg || "rgba(255,255,255,.92)";
  ctx.fill();

  roundRect(ctx, x, y, bw, bh, r);
  ctx.strokeStyle = "rgba(255,255,255,.78)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = opts.fg || "#241536";
  ctx.shadowColor = "rgba(255,255,255,.7)";
  ctx.shadowBlur = 0;
  lines.forEach((line, i) => {
    ctx.fillText(line, cx, y + 24 + lineH * i + lineH / 2);
  });

  ctx.restore();
}

export function drawBanner(ctx, w, h, title, sub = "") {
  ctx.save();
  ctx.fillStyle = "rgba(4,5,14,.54)";
  ctx.fillRect(0, 0, w, h);

  const bw = Math.min(w * 0.86, 520);
  const bh = sub ? 172 : 132;
  const x = (w - bw) / 2;
  const y = h * 0.42 - bh / 2;

  ctx.fillStyle = radial(ctx, w / 2, h * 0.42, bw * 0.72, [[0, "rgba(255,240,145,.36)"], [0.55, "rgba(255,96,192,.16)"], [1, "rgba(255,255,255,0)"]]);
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,.42)";
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 12;
  fillRoundRect(ctx, x, y, bw, bh, 34, linear(ctx, x, y, x + bw, y + bh, [
    [0, "#fff0a6"],
    [0.42, "#ff69be"],
    [1, "#6957ff"]
  ]));
  ctx.restore();

  roundRect(ctx, x, y, bw, bh, 34);
  ctx.strokeStyle = "rgba(255,255,255,.65)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.save();
  roundRect(ctx, x + 8, y + 7, bw - 16, bh * 0.42, 26);
  ctx.clip();
  ctx.fillStyle = linear(ctx, x, y, x, y + bh * 0.45, [[0, "rgba(255,255,255,.64)"], [1, "rgba(255,255,255,0)"]]);
  ctx.fillRect(x + 8, y + 7, bw - 16, bh * 0.42);
  ctx.restore();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.font = `900 ${Math.max(34, Math.min(58, bw * 0.11))}px ${FONT}`;
  ctx.strokeStyle = "rgba(69,27,95,.78)";
  ctx.lineWidth = 7;
  ctx.strokeText(title, w / 2, y + bh * 0.43);
  ctx.fillStyle = "#fffdf4";
  ctx.shadowColor = "rgba(0,0,0,.22)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;
  ctx.fillText(title, w / 2, y + bh * 0.43);

  if (sub) {
    ctx.font = `800 ${Math.max(17, Math.min(24, bw * 0.045))}px ${FONT}`;
    ctx.fillStyle = "rgba(255,255,255,.94)";
    ctx.shadowBlur = 3;
    ctx.fillText(sub, w / 2, y + bh * 0.72);
  }

  ctx.restore();
}

export class Confetti {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.items = [];
    this.colors = ["#fff36d", "#ff5aa8", "#6cf0ff", "#8b6dff", "#5dff9c", "#ff8b4f"];
  }

  burst(n = 120) {
    const cx = this.w / 2;
    const cy = this.h * 0.36;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 120 + Math.random() * 420;
      this.items.push({
        x: cx + (Math.random() - 0.5) * this.w * 0.32,
        y: cy + (Math.random() - 0.5) * 30,
        vx: Math.cos(a) * sp * 0.55,
        vy: Math.sin(a) * sp - 260 - Math.random() * 160,
        g: 520 + Math.random() * 260,
        sway: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 11,
        rot: Math.random() * Math.PI,
        size: 5 + Math.random() * 9,
        life: 1.6 + Math.random() * 1.9,
        age: 0,
        color: this.colors[(Math.random() * this.colors.length) | 0],
        circle: Math.random() < 0.28
      });
    }
  }

  update(dt) {
    const step = Math.min(0.05, Math.max(0, dt || 0));
    for (const p of this.items) {
      p.age += step;
      p.sway += step * 4;
      p.vy += p.g * step;
      p.x += (p.vx + Math.sin(p.sway) * 54) * step;
      p.y += p.vy * step;
      p.rot += p.spin * step;
    }
    this.items = this.items.filter((p) => p.age < p.life && p.y < this.h + 80);
  }

  render(ctx) {
    ctx.save();
    for (const p of this.items) {
      const alpha = Math.max(0, 1 - p.age / p.life);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      if (p.circle) {
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.48, 0, Math.PI * 2);
        ctx.fill();
      } else {
        roundRect(ctx, -p.size * 0.45, -p.size * 0.28, p.size * 0.9, p.size * 0.56, 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,.38)";
        ctx.fillRect(-p.size * 0.35, -p.size * 0.22, p.size * 0.7, p.size * 0.16);
      }
      ctx.restore();
    }
    ctx.restore();
  }

  get count() {
    return this.items.length;
  }
}
