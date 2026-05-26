// js/weapons.js
// 무기별 시각 효과와 타격 튜닝을 한 곳에 모았습니다.

export const WEAPONS = [
  { id: "hammer", name: "망치", desc: "묵직한 한 방으로 깊은 균열을 냅니다." },
  { id: "bat", name: "야구방망이", desc: "넓게 휘둘러 긴 금을 만듭니다." },
  { id: "pipe", name: "쇠파이프", desc: "빠르고 단단한 충격을 줍니다." },
  { id: "brick", name: "벽돌", desc: "투박하지만 파편을 많이 튀깁니다." },
  { id: "fist", name: "주먹", desc: "작지만 빠르게 연타하기 좋습니다." },
];

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + rr, y, rr);
  ctx.closePath();
}

function metalGradient(ctx, x0, y0, x1, y1) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, "#dce6ee");
  g.addColorStop(0.28, "#7f8c96");
  g.addColorStop(0.5, "#f8fbff");
  g.addColorStop(0.72, "#6d7882");
  g.addColorStop(1, "#c7d1da");
  return g;
}

function drawHammerShape(ctx, s = 1) {
  ctx.save();
  ctx.scale(s, s);
  ctx.rotate(-0.55);

  ctx.fillStyle = "#8b5a2b";
  roundRect(ctx, -7, -8, 14, 62, 5);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillRect(-4, -4, 3, 52);

  ctx.fillStyle = metalGradient(ctx, -34, -28, 34, -4);
  roundRect(ctx, -34, -30, 68, 26, 6);
  ctx.fill();
  ctx.strokeStyle = "#40515e";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#5d6a74";
  roundRect(ctx, -13, -22, 26, 14, 4);
  ctx.fill();
  ctx.restore();
}

function drawBatShape(ctx, s = 1) {
  ctx.save();
  ctx.scale(s, s);
  ctx.rotate(-0.55);
  const g = ctx.createLinearGradient(-10, -60, 16, 50);
  g.addColorStop(0, "#f2c178");
  g.addColorStop(0.5, "#b87a35");
  g.addColorStop(1, "#6f431f");
  ctx.fillStyle = g;

  ctx.beginPath();
  ctx.moveTo(-8, 50);
  ctx.quadraticCurveTo(-15, 18, -11, -18);
  ctx.quadraticCurveTo(-8, -56, 0, -70);
  ctx.quadraticCurveTo(14, -64, 16, -18);
  ctx.quadraticCurveTo(14, 19, 8, 50);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#4c2e16";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#3b2413";
  roundRect(ctx, -10, 43, 20, 25, 7);
  ctx.fill();
  ctx.restore();
}

function drawPipeShape(ctx, s = 1) {
  ctx.save();
  ctx.scale(s, s);
  ctx.rotate(-0.62);
  ctx.fillStyle = metalGradient(ctx, -9, -66, 11, 58);
  roundRect(ctx, -9, -66, 18, 124, 9);
  ctx.fill();
  ctx.strokeStyle = "#4b5660";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#74818c";
  roundRect(ctx, -13, -68, 26, 10, 5);
  ctx.fill();
  roundRect(ctx, -13, 50, 26, 10, 5);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.45)";
  ctx.beginPath();
  ctx.moveTo(-4, -57);
  ctx.lineTo(-4, 45);
  ctx.stroke();
  ctx.restore();
}

function drawBrickShape(ctx, s = 1) {
  ctx.save();
  ctx.scale(s, s);
  ctx.rotate(-0.18);
  const g = ctx.createLinearGradient(-34, -22, 34, 22);
  g.addColorStop(0, "#9f3f2d");
  g.addColorStop(0.55, "#c85a3c");
  g.addColorStop(1, "#7d2c22");
  ctx.fillStyle = g;
  roundRect(ctx, -36, -23, 72, 46, 5);
  ctx.fill();
  ctx.strokeStyle = "#62231b";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.strokeStyle = "rgba(255,210,180,0.35)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-36, 0);
  ctx.lineTo(36, 0);
  ctx.moveTo(-12, -23);
  ctx.lineTo(-12, 0);
  ctx.moveTo(13, 0);
  ctx.lineTo(13, 23);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.fillRect(-28, -17, 45, 5);
  ctx.restore();
}

function drawFistShape(ctx, s = 1) {
  ctx.save();
  ctx.scale(s, s);
  ctx.rotate(-0.2);

  const skin = "#f0b184";
  const shade = "#c97c55";
  ctx.fillStyle = skin;
  for (let i = 0; i < 4; i++) {
    roundRect(ctx, -31 + i * 15, -28, 14, 34, 7);
    ctx.fill();
  }

  ctx.fillStyle = "#e4a078";
  roundRect(ctx, -30, -5, 59, 36, 12);
  ctx.fill();

  ctx.fillStyle = skin;
  roundRect(ctx, 20, 0, 19, 30, 10);
  ctx.fill();

  ctx.strokeStyle = shade;
  ctx.lineWidth = 2;
  for (let i = 1; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(-31 + i * 15, -22);
    ctx.lineTo(-31 + i * 15, 2);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawWeaponIcon(ctx, id, rect) {
  ctx.save();
  const { x, y, w, h } = rect;
  ctx.translate(x + w / 2, y + h / 2);
  const s = Math.min(w, h) / 120;

  if (id === "hammer") drawHammerShape(ctx, s);
  else if (id === "bat") drawBatShape(ctx, s);
  else if (id === "pipe") drawPipeShape(ctx, s);
  else if (id === "brick") drawBrickShape(ctx, s);
  else drawFistShape(ctx, s);

  ctx.restore();
}

export function drawWeaponCursor(ctx, id, x, y, swing) {
  const t = Math.max(0, Math.min(1, swing));
  const hit = Math.sin(t * Math.PI);
  const recoil = t > 0.55 ? (t - 0.55) / 0.45 : 0;

  ctx.save();
  ctx.translate(x, y);

  // 접점은 포인터 근처, 손잡이는 뒤쪽으로 빠지게 배치합니다.
  if (id === "hammer") {
    ctx.translate(-18 + hit * 15 - recoil * 10, -58 + hit * 54);
    ctx.rotate(-0.9 + hit * 1.35 - recoil * 0.35);
    drawHammerShape(ctx, 1.05);
  } else if (id === "bat") {
    ctx.translate(-30 + hit * 20, -80 + hit * 75);
    ctx.rotate(-1.05 + hit * 1.55 - recoil * 0.4);
    drawBatShape(ctx, 1.06);
  } else if (id === "pipe") {
    ctx.translate(-20 + hit * 12, -72 + hit * 68);
    ctx.rotate(-0.95 + hit * 1.4 - recoil * 0.3);
    drawPipeShape(ctx, 1.0);
  } else if (id === "brick") {
    ctx.translate(-8 + hit * 8, -42 + hit * 40);
    ctx.rotate(-0.38 + hit * 0.72 - recoil * 0.2);
    drawBrickShape(ctx, 1.05);
  } else {
    ctx.translate(-2 + hit * 4, -24 + hit * 24);
    ctx.rotate(-0.25 + hit * 0.35);
    drawFistShape(ctx, 0.92);
  }

  ctx.restore();
}

export function weaponImpact(id) {
  if (id === "hammer") {
    return { crackScale: 1.65, density: 1.35, shards: 1.45, shake: 28, color: "#dff6ff" };
  }
  if (id === "bat") {
    return { crackScale: 1.35, density: 1.6, shards: 1.15, shake: 22, color: "#fff0c7" };
  }
  if (id === "pipe") {
    return { crackScale: 1.15, density: 1.25, shards: 1.2, shake: 20, color: "#d8ecff" };
  }
  if (id === "brick") {
    return { crackScale: 1.45, density: 1.05, shards: 1.75, shake: 26, color: "#ffc4ad" };
  }
  return { crackScale: 0.72, density: 0.75, shards: 0.65, shake: 10, color: "#ffe0d2" };
}
