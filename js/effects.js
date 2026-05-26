// js/effects.js
// 유리 균열과 파편 효과. 기존 호출 방식과 호환됩니다.

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function hexToRgb(hex) {
  if (!hex || typeof hex !== "string") return null;
  const clean = hex.replace("#", "").trim();
  if (clean.length !== 3 && clean.length !== 6) return null;
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const n = Number.parseInt(full, 16);
  if (Number.isNaN(n)) return null;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgba(color, alpha, fallback = "235,250,255") {
  const rgb = hexToRgb(color);
  if (!rgb) return `rgba(${fallback},${alpha})`;
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
}

function makeJaggedLine(x, y, angle, len, jitter, steps) {
  const points = [{ x, y }];
  for (let i = 1; i <= steps; i++) {
    const p = i / steps;
    const wave = Math.sin(p * Math.PI) * jitter;
    const side = (Math.random() - 0.5) * wave;
    points.push({
      x: x + Math.cos(angle) * len * p + Math.cos(angle + Math.PI / 2) * side,
      y: y + Math.sin(angle) * len * p + Math.sin(angle + Math.PI / 2) * side,
    });
  }
  return points;
}

export function makeCrack(x, y, opts = {}) {
  const scale = clamp(opts.scale ?? 1, 0.2, 3);
  const density = clamp(opts.density ?? 1, 0.2, 3);
  const radius = rand(130, 220) * scale;
  const rayCount = Math.round(rand(9, 15) * density);
  const branchChance = clamp(0.42 + density * 0.12, 0.2, 0.85);
  const branches = [];
  const rays = [];

  // 중심에서 바깥으로 뻗는 주 균열
  for (let i = 0; i < rayCount; i++) {
    const angle = (i / rayCount) * Math.PI * 2 + rand(-0.18, 0.18);
    const len = radius * rand(0.56, 1.08);
    const steps = Math.round(rand(4, 8) + density * 1.5);
    const line = makeJaggedLine(x, y, angle, len, 26 * scale, steps);
    rays.push(line);

    if (Math.random() < branchChance) {
      const baseIndex = Math.max(1, Math.floor(rand(1.4, line.length - 1)));
      const base = line[baseIndex];
      const dir = angle + rand(0.45, 0.95) * (Math.random() < 0.5 ? -1 : 1);
      const blen = len * rand(0.18, 0.42) * scale;
      branches.push(makeJaggedLine(base.x, base.y, dir, blen, 15 * scale, Math.round(rand(3, 6))));
    }

    if (density > 1.15 && Math.random() < 0.28 * density) {
      const base = line[Math.floor(rand(2, line.length - 1))];
      const dir = angle + rand(0.9, 1.45) * (Math.random() < 0.5 ? -1 : 1);
      branches.push(makeJaggedLine(base.x, base.y, dir, len * rand(0.12, 0.26), 10 * scale, 3));
    }
  }

  // 깨진 유리의 다각형 링
  const rings = [];
  const ringCount = Math.round(rand(2, 4) + Math.max(0, density - 1));
  for (let r = 0; r < ringCount; r++) {
    const points = [];
    const sides = Math.round(rand(7, 11) + density);
    const ringRadius = radius * rand(0.16 + r * 0.13, 0.26 + r * 0.18);
    const offset = rand(0, Math.PI * 2);
    for (let i = 0; i < sides; i++) {
      const a = offset + (i / sides) * Math.PI * 2 + rand(-0.12, 0.12);
      const rr = ringRadius * rand(0.72, 1.18);
      points.push({ x: x + Math.cos(a) * rr, y: y + Math.sin(a) * rr });
    }
    rings.push(points);
  }

  return {
    x,
    y,
    radius,
    rays,
    branches,
    rings,
    color: opts.color,
  };
}

function strokePolyline(ctx, points) {
  if (!points || points.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
  ctx.stroke();
}

export function drawCrack(ctx, crack) {
  if (!crack) return;

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // 어두운 받침선으로 어떤 배경에서도 균열이 보이게 합니다.
  ctx.strokeStyle = "rgba(0,12,24,0.42)";
  ctx.lineWidth = 4.5;
  for (const line of crack.rays || []) strokePolyline(ctx, line);
  ctx.lineWidth = 3;
  for (const line of crack.branches || []) strokePolyline(ctx, line);

  ctx.strokeStyle = rgba(crack.color, 0.94);
  ctx.lineWidth = 1.8;
  for (const line of crack.rays || []) strokePolyline(ctx, line);

  ctx.strokeStyle = rgba(crack.color, 0.72, "180,224,255");
  ctx.lineWidth = 1.15;
  for (const line of crack.branches || []) strokePolyline(ctx, line);

  ctx.strokeStyle = rgba(crack.color, 0.32, "235,250,255");
  ctx.lineWidth = 1.1;
  for (const ring of crack.rings || []) {
    if (ring.length < 3) continue;
    ctx.beginPath();
    ctx.moveTo(ring[0].x, ring[0].y);
    for (let i = 1; i < ring.length; i++) ctx.lineTo(ring[i].x, ring[i].y);
    ctx.closePath();
    ctx.stroke();
  }

  // 중심 별 모양 하이라이트
  const cx = crack.x;
  const cy = crack.y;
  const star = Math.max(8, Math.min(18, crack.radius * 0.075));
  ctx.fillStyle = rgba(crack.color, 0.96);
  ctx.beginPath();
  for (let i = 0; i < 12; i++) {
    const a = -Math.PI / 2 + (i / 12) * Math.PI * 2;
    const r = i % 2 === 0 ? star : star * 0.34;
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

export class ShardBurst {
  constructor(x, y, opts = {}) {
    const countMul = clamp(opts.count ?? opts.multiplier ?? 1, 0.1, 3);
    const sizeMul = clamp(opts.size ?? 1, 0.2, 3);
    const count = Math.round(rand(22, 34) * countMul);

    this.x = x;
    this.y = y;
    this.particles = [];

    for (let i = 0; i < count; i++) {
      const angle = rand(0, Math.PI * 2);
      const speed = rand(130, 560) * rand(0.75, 1.15);
      const size = rand(5, 18) * sizeMul;
      const sides = Math.floor(rand(3, 6));
      const verts = [];

      for (let v = 0; v < sides; v++) {
        const a = (v / sides) * Math.PI * 2 + rand(-0.25, 0.25);
        const r = size * rand(0.45, 1);
        verts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
      }

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - rand(80, 260),
        rot: rand(0, Math.PI * 2),
        vr: rand(-7, 7),
        life: rand(0.55, 1.15),
        maxLife: 0,
        verts,
        color: opts.color,
        cool: Math.random() < 0.55,
      });
    }

    for (const p of this.particles) p.maxLife = p.life;
  }

  update(dt) {
    const gravity = 720;
    for (const p of this.particles) {
      p.life -= dt;
      p.vy += gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      p.vx *= Math.pow(0.985, dt * 60);
    }
    this.particles = this.particles.filter((p) => p.life > 0);
  }

  render(ctx) {
    ctx.save();
    ctx.lineJoin = "round";

    for (const p of this.particles) {
      const a = clamp(p.life / p.maxLife, 0, 1);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);

      const fill = p.color
        ? rgba(p.color, 0.18 + a * 0.34)
        : p.cool
          ? `rgba(235,250,255,${0.16 + a * 0.34})`
          : `rgba(180,224,255,${0.14 + a * 0.3})`;

      ctx.fillStyle = fill;
      ctx.strokeStyle = p.color ? rgba(p.color, 0.35 + a * 0.45) : `rgba(245,252,255,${0.28 + a * 0.58})`;
      ctx.lineWidth = 1.2;

      ctx.beginPath();
      ctx.moveTo(p.verts[0].x, p.verts[0].y);
      for (let i = 1; i < p.verts.length; i++) ctx.lineTo(p.verts[i].x, p.verts[i].y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = `rgba(255,255,255,${0.25 * a})`;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(p.verts[0].x * 0.8, p.verts[0].y * 0.8);
      ctx.stroke();

      ctx.restore();
    }

    ctx.restore();
  }

  get dead() {
    return this.particles.length === 0;
  }
}
