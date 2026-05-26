export const GLYPH_KINDS = ['einstein', 'sigma', 'pi', 'atom', 'book', 'bulb', 'flask'];

const clamp01 = (v) => Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0));
const lerp = (a, b, t) => a + (b - a) * t;
const TAU = Math.PI * 2;

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16)
  };
}

function mixColor(a, b, t) {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  return `rgb(${Math.round(lerp(ca.r, cb.r, t))}, ${Math.round(lerp(ca.g, cb.g, t))}, ${Math.round(lerp(ca.b, cb.b, t))})`;
}

function withAlpha(color, alpha) {
  if (color.startsWith('rgb(')) return color.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
  return color;
}

function strokeGlow(ctx, color, blur, alpha = 1) {
  ctx.shadowColor = withAlpha(color, alpha);
  ctx.shadowBlur = blur;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

function roundStroke(ctx, width, color, alpha = 1) {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = width;
  ctx.strokeStyle = withAlpha(color, alpha);
}

function brainLobePath(ctx, s, sag) {
  ctx.beginPath();
  ctx.moveTo(-0.43 * s, -0.03 * s + sag);
  ctx.bezierCurveTo(-0.55 * s, -0.28 * s, -0.34 * s, -0.45 * s, -0.12 * s, -0.39 * s + sag * 0.2);
  ctx.bezierCurveTo(-0.03 * s, -0.56 * s, 0.22 * s, -0.52 * s, 0.27 * s, -0.34 * s);
  ctx.bezierCurveTo(0.53 * s, -0.32 * s, 0.56 * s, -0.02 * s, 0.41 * s, 0.11 * s + sag);
  ctx.bezierCurveTo(0.48 * s, 0.31 * s, 0.26 * s, 0.47 * s, 0.08 * s, 0.38 * s + sag);
  ctx.bezierCurveTo(-0.03 * s, 0.55 * s, -0.31 * s, 0.45 * s, -0.31 * s, 0.25 * s + sag);
  ctx.bezierCurveTo(-0.54 * s, 0.23 * s, -0.58 * s, 0.02 * s, -0.43 * s, -0.03 * s + sag);
  ctx.closePath();
}

function drawFold(ctx, pts, width, color, alpha) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    ctx.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
  }
  const last = pts[pts.length - 1];
  ctx.lineTo(last[0], last[1]);
  roundStroke(ctx, width, color, alpha);
  ctx.stroke();
}

export function drawBrain(ctx, x, y, size, vitality) {
  const v = clamp01(vitality);
  const decay = 1 - v;
  const s = size * lerp(0.45, 1, v);
  const sag = size * decay * 0.16;
  const body = mixColor('#8a7665', '#ff7fa4', v);
  const edge = mixColor('#5e5049', '#cc416c', v);
  const fold = mixColor('#574941', '#a82458', v);
  const shine = mixColor('#c0aea3', '#ffe0ec', v);
  const aura = mixColor('#8bffef', '#fff07c', v);

  ctx.save();
  ctx.translate(x, y + sag * 0.25);
  ctx.scale(1, lerp(1.2, 1, v));

  // 생각 기운
  const sparkCount = Math.round(lerp(0, 9, v));
  if (sparkCount > 0) {
    ctx.save();
    strokeGlow(ctx, aura, size * 0.18, 0.55 * v);
    for (let i = 0; i < sparkCount; i++) {
      const a = (i / sparkCount) * TAU + 0.4;
      const r = size * (0.47 + (i % 3) * 0.07);
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r * 0.72 - size * 0.08;
      ctx.globalAlpha = 0.45 + 0.45 * v;
      ctx.beginPath();
      ctx.moveTo(px - size * 0.035, py);
      ctx.lineTo(px + size * 0.035, py);
      ctx.moveTo(px, py - size * 0.035);
      ctx.lineTo(px, py + size * 0.035);
      roundStroke(ctx, Math.max(1.2, size * 0.035), aura, 0.85);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 뇌 몸통
  ctx.save();
  strokeGlow(ctx, body, size * 0.05, 0.35 * v);
  brainLobePath(ctx, s, sag * 0.2);
  const grad = ctx.createRadialGradient(-s * 0.18, -s * 0.28, s * 0.04, 0, 0, s * 0.72);
  grad.addColorStop(0, mixColor('#a9968d', '#ffb0c6', v));
  grad.addColorStop(0.55, body);
  grad.addColorStop(1, mixColor('#67584f', '#d65b80', v));
  ctx.fillStyle = grad;
  ctx.fill();
  roundStroke(ctx, Math.max(1.4, size * 0.045), edge, 0.95);
  ctx.stroke();
  ctx.restore();

  // 가운데 홈
  ctx.beginPath();
  ctx.moveTo(0, -0.36 * s);
  ctx.bezierCurveTo(-0.05 * s, -0.2 * s, 0.07 * s, -0.08 * s + sag * 0.2, -0.01 * s, 0.08 * s + sag * 0.5);
  ctx.bezierCurveTo(0.08 * s, 0.2 * s + sag, -0.05 * s, 0.28 * s + sag, 0.02 * s, 0.4 * s + sag);
  roundStroke(ctx, Math.max(1.2, size * 0.035), fold, lerp(0.55, 0.95, v));
  ctx.stroke();

  // 주름
  const fw = Math.max(1.1, size * lerp(0.028, 0.04, v));
  const foldAlpha = lerp(0.45, 0.9, v);
  drawFold(ctx, [[-0.35*s,-0.17*s],[ -0.22*s,-0.24*s],[-0.12*s,-0.14*s],[-0.24*s,-0.04*s]], fw, fold, foldAlpha);
  drawFold(ctx, [[0.13*s,-0.25*s],[0.28*s,-0.2*s],[0.2*s,-0.08*s],[0.36*s,-0.02*s]], fw, fold, foldAlpha);
  drawFold(ctx, [[-0.38*s,0.08*s],[-0.22*s,0.1*s],[-0.26*s,0.24*s],[-0.08*s,0.22*s]], fw, fold, foldAlpha);
  drawFold(ctx, [[0.08*s,0.06*s],[0.22*s,0.14*s],[0.12*s,0.26*s],[0.28*s,0.31*s]], fw, fold, foldAlpha);
  drawFold(ctx, [[-0.06*s,-0.33*s],[-0.17*s,-0.25*s],[-0.05*s,-0.18*s]], fw * 0.82, fold, foldAlpha);
  drawFold(ctx, [[0.3*s,-0.29*s],[0.39*s,-0.18*s],[0.31*s,-0.1*s]], fw * 0.82, fold, foldAlpha);

  // 광택
  if (v > 0.05) {
    ctx.save();
    ctx.globalAlpha = 0.12 + v * 0.34;
    ctx.beginPath();
    ctx.ellipse(-0.17 * s, -0.25 * s, 0.17 * s, 0.07 * s, -0.35, 0, TAU);
    ctx.fillStyle = shine;
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0.21 * s, -0.18 * s, 0.12 * s, 0.045 * s, 0.25, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  // 고갈 표정과 땀
  if (decay > 0.28) {
    ctx.save();
    const faceA = Math.min(1, decay * 1.35);
    roundStroke(ctx, Math.max(1, size * 0.025), mixColor('#3f3732', '#7f2746', v), faceA);
    ctx.beginPath();
    ctx.arc(-0.15 * s, 0.03 * s + sag * 0.5, size * 0.015, 0, TAU);
    ctx.arc(0.14 * s, 0.04 * s + sag * 0.5, size * 0.015, 0, TAU);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0.19 * s + sag, 0.11 * s, Math.PI * 1.12, Math.PI * 1.88);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0.42 * s, -0.06 * s + sag);
    ctx.bezierCurveTo(0.52 * s, 0.08 * s + sag, 0.41 * s, 0.18 * s + sag, 0.34 * s, 0.07 * s + sag);
    ctx.closePath();
    ctx.fillStyle = `rgba(119, 214, 230, ${0.8 * faceA})`;
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}

function glowText(ctx, text, x, y, size, alpha, color = '#f9fff4') {
  ctx.save();
  ctx.globalAlpha = clamp01(alpha);
  ctx.font = `900 ${size}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = Math.max(2, size * 0.13);
  strokeGlow(ctx, '#b8fff4', size * 0.25, alpha);
  ctx.strokeStyle = 'rgba(7, 57, 61, 0.85)';
  ctx.strokeText(text, x, y);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

export function drawKnowledgeGlyph(ctx, kind, x, y, size, alpha) {
  const a = clamp01(alpha);
  const s = size;
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = a;
  strokeGlow(ctx, '#b9fff2', s * 0.22, a);

  // 지식 기호 공통 후광
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.52, 0, TAU);
  ctx.fillStyle = `rgba(191, 255, 238, ${0.08 * a})`;
  ctx.fill();

  if (kind === 'einstein') {
    glowText(ctx, 'E=mc²', 0, 0, s * 0.42, a, '#fff7a8');
  } else if (kind === 'sigma') {
    glowText(ctx, 'Σ', 0, 0, s * 0.82, a, '#ffffff');
  } else if (kind === 'pi') {
    glowText(ctx, 'π', 0, -s * 0.02, s * 0.82, a, '#ffffff');
  } else if (kind === 'atom') {
    roundStroke(ctx, Math.max(1.4, s * 0.055), '#f8fff8', a);
    for (let i = 0; i < 3; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI) / 3);
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.44, s * 0.16, 0, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.08, 0, TAU);
    ctx.fillStyle = '#fff27a';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(s * 0.33, -s * 0.05, s * 0.055, 0, TAU);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  } else if (kind === 'book') {
    roundStroke(ctx, Math.max(1.4, s * 0.045), '#08383d', a);
    ctx.fillStyle = '#fff9d6';
    ctx.beginPath();
    ctx.moveTo(-s * 0.42, -s * 0.28);
    ctx.quadraticCurveTo(-s * 0.18, -s * 0.38, 0, -s * 0.18);
    ctx.lineTo(0, s * 0.32);
    ctx.quadraticCurveTo(-s * 0.2, s * 0.16, -s * 0.42, s * 0.26);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(s * 0.42, -s * 0.28);
    ctx.quadraticCurveTo(s * 0.18, -s * 0.38, 0, -s * 0.18);
    ctx.lineTo(0, s * 0.32);
    ctx.quadraticCurveTo(s * 0.2, s * 0.16, s * 0.42, s * 0.26);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    roundStroke(ctx, Math.max(1, s * 0.025), '#5daea8', a);
    ctx.beginPath();
    ctx.moveTo(-s * 0.28, -s * 0.05);
    ctx.lineTo(-s * 0.08, s * 0.03);
    ctx.moveTo(s * 0.08, s * 0.03);
    ctx.lineTo(s * 0.28, -s * 0.05);
    ctx.stroke();
  } else if (kind === 'bulb') {
    roundStroke(ctx, Math.max(1.5, s * 0.05), '#08383d', a);
    ctx.fillStyle = '#fff27a';
    ctx.beginPath();
    ctx.arc(0, -s * 0.08, s * 0.27, Math.PI * 0.1, Math.PI * 0.9, true);
    ctx.quadraticCurveTo(-s * 0.2, s * 0.17, -s * 0.09, s * 0.26);
    ctx.lineTo(s * 0.09, s * 0.26);
    ctx.quadraticCurveTo(s * 0.2, s * 0.17, s * 0.27, -s * 0.08);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    roundStroke(ctx, Math.max(1.2, s * 0.04), '#f8fff8', a);
    ctx.beginPath();
    ctx.moveTo(-s * 0.11, s * 0.35);
    ctx.lineTo(s * 0.11, s * 0.35);
    ctx.moveTo(-s * 0.09, s * 0.45);
    ctx.lineTo(s * 0.09, s * 0.45);
    ctx.stroke();
  } else if (kind === 'flask') {
    roundStroke(ctx, Math.max(1.4, s * 0.045), '#08383d', a);
    ctx.fillStyle = '#d7fff9';
    ctx.beginPath();
    ctx.moveTo(-s * 0.13, -s * 0.42);
    ctx.lineTo(s * 0.13, -s * 0.42);
    ctx.lineTo(s * 0.08, -s * 0.06);
    ctx.lineTo(s * 0.35, s * 0.34);
    ctx.quadraticCurveTo(0, s * 0.48, -s * 0.35, s * 0.34);
    ctx.lineTo(-s * 0.08, -s * 0.06);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-s * 0.22, s * 0.17);
    ctx.quadraticCurveTo(0, s * 0.08, s * 0.22, s * 0.17);
    ctx.lineTo(s * 0.31, s * 0.32);
    ctx.quadraticCurveTo(0, s * 0.42, -s * 0.31, s * 0.32);
    ctx.closePath();
    ctx.fillStyle = `rgba(92, 240, 207, ${0.72 * a})`;
    ctx.fill();
  } else {
    glowText(ctx, '?', 0, 0, s * 0.75, a, '#ffffff');
  }

  ctx.restore();
}
