// 교수님 캐릭터 벡터 아트: smart 1 -> 0 으로 할아버지화

const TAU = Math.PI * 2;

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const lerp = (a, b, t) => a + (b - a) * t;

function colorMix(a, b, t) {
  const ah = a.slice(1);
  const bh = b.slice(1);
  const ar = parseInt(ah.slice(0, 2), 16);
  const ag = parseInt(ah.slice(2, 4), 16);
  const ab = parseInt(ah.slice(4, 6), 16);
  const br = parseInt(bh.slice(0, 2), 16);
  const bg = parseInt(bh.slice(2, 4), 16);
  const bb = parseInt(bh.slice(4, 6), 16);
  const hx = (n) => Math.round(n).toString(16).padStart(2, "0");
  return `#${hx(lerp(ar, br, t))}${hx(lerp(ag, bg, t))}${hx(lerp(ab, bb, t))}`;
}

function ellipse(ctx, x, y, rx, ry, rot = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rot, 0, TAU);
}

function roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function line(ctx, pts) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.stroke();
}

function fillStroke(ctx, fill, stroke = "#241b21", lw = 4) {
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = lw;
  ctx.strokeStyle = stroke;
  ctx.stroke();
}

function autoMood(mood, smart, grandpa, flinch) {
  if (mood && mood !== "auto") return mood;
  if (flinch > 0.35) return "pain";
  if (smart > 0.72) return "smart";
  if (grandpa > 0.68) return "grandpa";
  return "confused";
}

export function shinHitRect(opts = {}) {
  const x = opts.x ?? 0;
  const y = opts.y ?? 0;
  const scale = opts.scale ?? 1;
  const smart = clamp(opts.smart ?? 1, 0, 1);
  const grandpa = 1 - smart;
  const flinch = clamp(opts.flinch ?? 0, 0, 1);

  const bodyLean = 12 * grandpa - 18 * flinch;
  const kneeBend = 17 * flinch;

  // 앞쪽 오른다리 정강이 타격 박스
  return {
    x: x + (22 + bodyLean) * scale,
    y: y + (-98 + kneeBend * 0.55) * scale,
    w: 36 * scale,
    h: 78 * scale,
  };
}

export function drawProfessor(ctx, opts = {}) {
  const x = opts.x ?? 0;
  const y = opts.y ?? 0;
  const scale = opts.scale ?? 1;
  const smart = clamp(opts.smart ?? 1, 0, 1);
  const grandpa = 1 - smart;
  const flinch = clamp(opts.flinch ?? 0, 0, 1);
  const shinGlow = clamp(opts.shinGlow ?? 0, 0, 1);
  const mood = autoMood(opts.mood ?? "auto", smart, grandpa, flinch);

  const outline = "#241b21";
  const skin = "#ffd1aa";
  const skinDark = "#e7a37b";
  const coat = colorMix("#f9fbff", "#e6ded1", grandpa);
  const hair = colorMix("#202229", "#f4f0e7", grandpa);
  const pants = colorMix("#293144", "#5e625d", grandpa);

  const bodyLean = 12 * grandpa - 18 * flinch;
  const headX = 21 * grandpa - 24 * flinch;
  const headY = -252 + 18 * grandpa - 9 * flinch;
  const shoulderY = -190 + 16 * grandpa;
  const kneeBend = 17 * flinch;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // 바닥 그림자
  const shadow = ctx.createRadialGradient(4, -2, 8, 4, -2, 95);
  shadow.addColorStop(0, "rgba(0,0,0,0.24)");
  shadow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = shadow;
  ellipse(ctx, 5, -2, 96, 18);
  ctx.fill();

  // 할아버지 지팡이
  if (grandpa > 0.25) {
    ctx.save();
    ctx.globalAlpha = clamp((grandpa - 0.2) / 0.8, 0, 1);
    ctx.strokeStyle = "#6d4125";
    ctx.lineWidth = 8;
    line(ctx, [
      [-67 + bodyLean, -129],
      [-83 + bodyLean, -60],
      [-82 + bodyLean, -3],
    ]);
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(-57 + bodyLean, -131, 16, Math.PI * 0.72, Math.PI * 1.62);
    ctx.stroke();
    ctx.restore();
  }

  // 다리
  ctx.strokeStyle = outline;
  ctx.lineWidth = 5;
  ctx.fillStyle = pants;

  ctx.beginPath();
  ctx.moveTo(-43 + bodyLean, -136);
  ctx.quadraticCurveTo(-58 + bodyLean, -86, -50 + bodyLean, -20);
  ctx.lineTo(-17 + bodyLean, -20);
  ctx.quadraticCurveTo(-24 + bodyLean, -85, -14 + bodyLean, -137);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(17 + bodyLean, -136);
  ctx.quadraticCurveTo(48 + bodyLean + kneeBend, -90 + kneeBend, 39 + bodyLean, -20 + kneeBend);
  ctx.lineTo(70 + bodyLean, -20 + kneeBend);
  ctx.quadraticCurveTo(70 + bodyLean, -88, 53 + bodyLean, -137);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 신발
  ctx.fillStyle = "#17191f";
  roundRect(ctx, -67 + bodyLean, -22, 60, 21, 8);
  ctx.fill();
  roundRect(ctx, 25 + bodyLean, -22 + kneeBend, 62, 21, 8);
  ctx.fill();

  // 정강이 글로우
  if (shinGlow > 0.01) {
    const r = shinHitRect({ x: 0, y: 0, scale: 1, smart, flinch });
    ctx.save();
    ctx.globalAlpha = 0.25 + shinGlow * 0.5;
    ctx.strokeStyle = "#ffe65a";
    ctx.lineWidth = 5 + shinGlow * 7;
    ellipse(ctx, r.x + r.w / 2, r.y + r.h / 2, r.w * 0.62, r.h * 0.56, -0.1);
    ctx.stroke();
    ctx.globalAlpha = shinGlow * 0.18;
    ctx.fillStyle = "#fff176";
    ctx.fill();
    ctx.restore();
  }

  // 몸통과 가운
  ctx.fillStyle = "#9fc6e8";
  ctx.strokeStyle = outline;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-55 + bodyLean, shoulderY);
  ctx.quadraticCurveTo(4 + bodyLean, shoulderY - 28, 64 + bodyLean, shoulderY);
  ctx.lineTo(78 + bodyLean, -71);
  ctx.quadraticCurveTo(7 + bodyLean, -43, -70 + bodyLean, -72);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = coat;
  ctx.beginPath();
  ctx.moveTo(-64 + bodyLean, shoulderY);
  ctx.quadraticCurveTo(-91 + bodyLean, -138, -72 + bodyLean, -70);
  ctx.quadraticCurveTo(-34 + bodyLean, -49, 1 + bodyLean, -60);
  ctx.lineTo(-16 + bodyLean, shoulderY - 7);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(65 + bodyLean, shoulderY);
  ctx.quadraticCurveTo(92 + bodyLean, -138, 74 + bodyLean, -70);
  ctx.quadraticCurveTo(37 + bodyLean, -49, 2 + bodyLean, -60);
  ctx.lineTo(18 + bodyLean, shoulderY - 7);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 셔츠와 넥타이
  ctx.fillStyle = "#fff8ef";
  ctx.beginPath();
  ctx.moveTo(-22 + bodyLean, shoulderY - 6);
  ctx.lineTo(0 + bodyLean, -82);
  ctx.lineTo(23 + bodyLean, shoulderY - 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = colorMix("#cf2b45", "#8b4d43", grandpa);
  ctx.beginPath();
  ctx.moveTo(-8 + bodyLean, -167);
  ctx.lineTo(9 + bodyLean, -167);
  ctx.lineTo(15 + bodyLean, -88);
  ctx.lineTo(0 + bodyLean, -73);
  ctx.lineTo(-15 + bodyLean, -88);
  ctx.closePath();
  ctx.fill();

  // 팔과 손
  ctx.strokeStyle = outline;
  ctx.lineWidth = 15;
  line(ctx, [
    [-65 + bodyLean, -163],
    [-89 + bodyLean, -112],
    [-80 + bodyLean, -84],
  ]);
  line(ctx, [
    [65 + bodyLean, -163],
    [89 + bodyLean, -111],
    [77 + bodyLean, -84],
  ]);

  ctx.strokeStyle = coat;
  ctx.lineWidth = 10;
  line(ctx, [
    [-65 + bodyLean, -163],
    [-89 + bodyLean, -112],
    [-80 + bodyLean, -84],
  ]);
  line(ctx, [
    [65 + bodyLean, -163],
    [89 + bodyLean, -111],
    [77 + bodyLean, -84],
  ]);

  ctx.fillStyle = skin;
  ctx.strokeStyle = outline;
  ctx.lineWidth = 4;
  ellipse(ctx, -80 + bodyLean, -78, 13, 16, -0.2);
  ctx.fill();
  ctx.stroke();
  ellipse(ctx, 77 + bodyLean, -78, 13, 16, 0.2);
  ctx.fill();
  ctx.stroke();

  // 목
  ctx.fillStyle = skinDark;
  roundRect(ctx, headX - 17, -205, 34, 34, 10);
  ctx.fill();

  // 얼굴
  const face = ctx.createLinearGradient(headX - 42, headY - 52, headX + 44, headY + 44);
  face.addColorStop(0, "#ffe0bf");
  face.addColorStop(1, "#f0ad82");
  fillStroke(ctx, (() => {
    ellipse(ctx, headX, headY, lerp(51, 47, grandpa), lerp(59, 53, grandpa), 0.08);
    return face;
  })(), outline, 5);

  // 귀
  ellipse(ctx, headX - 50, headY + 2, 13, 20, -0.08);
  fillStroke(ctx, skin, outline, 4);
  ellipse(ctx, headX + 49, headY + 2, 13, 20, 0.08);
  fillStroke(ctx, skin, outline, 4);

  // 머리카락
  ctx.beginPath();
  ctx.moveTo(headX - 51, headY - 29);
  ctx.quadraticCurveTo(headX - 36, headY - 77, headX - 2 - 13 * grandpa, headY - 72);
  ctx.quadraticCurveTo(headX + 42, headY - 69, headX + 50, headY - 23);
  ctx.quadraticCurveTo(headX + 18, headY - 43 + 21 * grandpa, headX - 4, headY - 34 + 27 * grandpa);
  ctx.quadraticCurveTo(headX - 29, headY - 42 + 13 * grandpa, headX - 51, headY - 29);
  ctx.closePath();
  fillStroke(ctx, hair, outline, 4);

  if (grandpa > 0.18) {
    ctx.save();
    ctx.globalAlpha = grandpa;
    ctx.strokeStyle = "#fffdf4";
    ctx.lineWidth = 5;
    line(ctx, [
      [headX - 35, headY - 38],
      [headX - 18, headY - 54],
      [headX + 3, headY - 50],
    ]);
    line(ctx, [
      [headX + 26, headY - 36],
      [headX + 39, headY - 48],
    ]);
    ctx.restore();
  }

  // 눈썹과 안경
  const glassesDrop = 17 * grandpa + 8 * flinch;
  ctx.strokeStyle = outline;
  ctx.lineWidth = 4;
  line(ctx, [
    [headX - 34, headY - 16],
    [headX - 12, headY - 22 - 4 * smart],
  ]);
  line(ctx, [
    [headX + 13, headY - 22 - 4 * smart],
    [headX + 35, headY - 16],
  ]);

  ctx.strokeStyle = "#26313d";
  ctx.lineWidth = 3;
  ellipse(ctx, headX - 20, headY - 2 + glassesDrop, 17, 12, -0.05);
  ctx.stroke();
  ellipse(ctx, headX + 21, headY - 2 + glassesDrop, 17, 12, 0.05);
  ctx.stroke();
  line(ctx, [
    [headX - 3, headY - 1 + glassesDrop],
    [headX + 4, headY - 1 + glassesDrop],
  ]);

  // 표정
  ctx.fillStyle = "#1b1b1f";
  if (mood === "confused" || mood === "grandpa") {
    ctx.strokeStyle = "#1b1b1f";
    ctx.lineWidth = 3;
    line(ctx, [
      [headX - 28, headY - 3],
      [headX - 13, headY + 3],
    ]);
    line(ctx, [
      [headX + 13, headY + 3],
      [headX + 28, headY - 3],
    ]);
  } else {
    ellipse(ctx, headX - 21, headY - 4, 4, mood === "pain" ? 8 : 5);
    ctx.fill();
    ellipse(ctx, headX + 22, headY - 4, 4, mood === "pain" ? 8 : 5);
    ctx.fill();
  }

  // 코
  ctx.strokeStyle = "#b97156";
  ctx.lineWidth = 3;
  line(ctx, [
    [headX + 3, headY + 1],
    [headX + 9, headY + 20],
    [headX - 1, headY + 22],
  ]);

  // 흰 수염
  if (grandpa > 0.28) {
    ctx.save();
    ctx.globalAlpha = clamp((grandpa - 0.25) / 0.75, 0, 1);
    ctx.fillStyle = "#f8f4ea";
    ctx.beginPath();
    ctx.moveTo(headX - 31, headY + 28);
    ctx.quadraticCurveTo(headX, headY + 58, headX + 31, headY + 28);
    ctx.quadraticCurveTo(headX + 11, headY + 45, headX, headY + 42);
    ctx.quadraticCurveTo(headX - 11, headY + 45, headX - 31, headY + 28);
    ctx.fill();
    ctx.restore();
  }

  // 입과 아얏
  ctx.strokeStyle = "#7c2630";
  ctx.lineWidth = 4;
  if (mood === "pain") {
    ctx.fillStyle = "#8e2734";
    ellipse(ctx, headX + 4, headY + 36, 15, 20);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#fff7df";
    ctx.strokeStyle = "#241b21";
    ctx.lineWidth = 3;
    ctx.font = "bold 20px system-ui, Apple SD Gothic Neo, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeText("아얏", headX + 73, headY + 14);
    ctx.fillText("아얏", headX + 73, headY + 14);
  } else if (mood === "happy") {
    ctx.beginPath();
    ctx.arc(headX + 2, headY + 22, 18, 0.1, Math.PI - 0.1);
    ctx.stroke();
  } else if (mood === "smart") {
    line(ctx, [
      [headX - 12, headY + 31],
      [headX + 14, headY + 26],
    ]);
  } else {
    ctx.beginPath();
    ctx.arc(headX + 2, headY + 35, 14, Math.PI + 0.15, TAU - 0.15);
    ctx.stroke();
  }

  // 통증 모션 라인
  if (flinch > 0.05) {
    ctx.save();
    ctx.globalAlpha = flinch;
    ctx.strokeStyle = "#ffef7a";
    ctx.lineWidth = 4;
    line(ctx, [
      [69 + bodyLean, -111],
      [107 + bodyLean, -130],
    ]);
    line(ctx, [
      [64 + bodyLean, -82],
      [111 + bodyLean, -77],
    ]);
    line(ctx, [
      [43 + bodyLean, -43 + kneeBend],
      [91 + bodyLean, -40 + kneeBend],
    ]);
    ctx.restore();
  }

  ctx.restore();
}
