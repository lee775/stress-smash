// js/scenery.js
// 정적 배경 전용: 매 프레임 랜덤 없이 같은 화면을 그립니다.

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

function text(ctx, value, x, y, size, color = "#fff", align = "center", weight = "500") {
  ctx.save();
  ctx.font = `${weight} ${size}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillText(value, x, y);
  ctx.restore();
}

function drawFolder(ctx, x, y, s) {
  ctx.save();
  ctx.fillStyle = "#f5c84c";
  roundRect(ctx, x, y + s * 0.24, s, s * 0.68, s * 0.1);
  ctx.fill();
  ctx.fillStyle = "#ffd86a";
  roundRect(ctx, x + s * 0.05, y + s * 0.12, s * 0.43, s * 0.26, s * 0.08);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.23)";
  ctx.fillRect(x + s * 0.08, y + s * 0.37, s * 0.84, s * 0.08);
  ctx.restore();
}

function drawDocument(ctx, x, y, s) {
  ctx.save();
  ctx.fillStyle = "#f7fbff";
  roundRect(ctx, x + s * 0.16, y + s * 0.06, s * 0.68, s * 0.86, s * 0.07);
  ctx.fill();
  ctx.fillStyle = "#d8e6f5";
  ctx.beginPath();
  ctx.moveTo(x + s * 0.64, y + s * 0.06);
  ctx.lineTo(x + s * 0.84, y + s * 0.26);
  ctx.lineTo(x + s * 0.64, y + s * 0.26);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#78a6d8";
  ctx.lineWidth = Math.max(1, s * 0.045);
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(x + s * 0.27, y + s * (0.4 + i * 0.12));
    ctx.lineTo(x + s * 0.73, y + s * (0.4 + i * 0.12));
    ctx.stroke();
  }
  ctx.restore();
}

function drawGlobe(ctx, x, y, s) {
  ctx.save();
  const cx = x + s / 2;
  const cy = y + s / 2;
  const r = s * 0.38;
  const g = ctx.createRadialGradient(cx - r * 0.4, cy - r * 0.5, r * 0.1, cx, cy, r);
  g.addColorStop(0, "#9ff0ff");
  g.addColorStop(0.55, "#1b94e5");
  g.addColorStop(1, "#1260b6");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.72)";
  ctx.lineWidth = Math.max(1, s * 0.035);
  ctx.beginPath();
  ctx.ellipse(cx, cy, r * 0.45, r, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - r, cy);
  ctx.lineTo(cx + r, cy);
  ctx.moveTo(cx - r * 0.82, cy - r * 0.42);
  ctx.quadraticCurveTo(cx, cy - r * 0.25, cx + r * 0.82, cy - r * 0.42);
  ctx.moveTo(cx - r * 0.82, cy + r * 0.42);
  ctx.quadraticCurveTo(cx, cy + r * 0.25, cx + r * 0.82, cy + r * 0.42);
  ctx.stroke();
  ctx.restore();
}

function drawRecycle(ctx, x, y, s) {
  ctx.save();
  ctx.strokeStyle = "#dff5ff";
  ctx.fillStyle = "rgba(180,230,255,0.22)";
  ctx.lineWidth = Math.max(1, s * 0.05);
  roundRect(ctx, x + s * 0.23, y + s * 0.22, s * 0.54, s * 0.68, s * 0.08);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + s * 0.3, y + s * 0.22);
  ctx.lineTo(x + s * 0.7, y + s * 0.22);
  ctx.moveTo(x + s * 0.39, y + s * 0.14);
  ctx.lineTo(x + s * 0.61, y + s * 0.14);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,0.75)";
  ctx.beginPath();
  ctx.moveTo(x + s * 0.39, y + s * 0.42);
  ctx.lineTo(x + s * 0.5, y + s * 0.32);
  ctx.lineTo(x + s * 0.61, y + s * 0.42);
  ctx.moveTo(x + s * 0.34, y + s * 0.58);
  ctx.lineTo(x + s * 0.46, y + s * 0.7);
  ctx.lineTo(x + s * 0.66, y + s * 0.5);
  ctx.stroke();
  ctx.restore();
}

function drawDesktopIcon(ctx, kind, label, x, y, size) {
  ctx.save();
  if (kind === "folder") drawFolder(ctx, x, y, size);
  if (kind === "doc") drawDocument(ctx, x, y, size);
  if (kind === "browser") drawGlobe(ctx, x, y, size);
  if (kind === "trash") drawRecycle(ctx, x, y, size);

  const labelY = y + size + 13;
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  roundRect(ctx, x - 9, labelY - 9, size + 18, 18, 5);
  ctx.fill();
  text(ctx, label, x + size / 2, labelY, Math.max(9, size * 0.18), "#f8fbff", "center", "600");
  ctx.restore();
}

export function drawDesktopWallpaper(ctx, w, h) {
  ctx.save();
  ctx.clearRect(0, 0, w, h);

  // 풍경 느낌의 PC 배경화면
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#5fb7ff");
  sky.addColorStop(0.48, "#c7ecff");
  sky.addColorStop(0.7, "#7fd693");
  sky.addColorStop(1, "#23694a");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "rgba(255,255,255,0.45)";
  for (const c of [
    [w * 0.18, h * 0.16, 72],
    [w * 0.53, h * 0.12, 92],
    [w * 0.82, h * 0.23, 64],
  ]) {
    ctx.beginPath();
    ctx.ellipse(c[0], c[1], c[2], c[2] * 0.23, 0, 0, Math.PI * 2);
    ctx.ellipse(c[0] + c[2] * 0.42, c[1] + 4, c[2] * 0.7, c[2] * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const ridge = ctx.createLinearGradient(0, h * 0.38, 0, h * 0.82);
  ridge.addColorStop(0, "#6ea3b1");
  ridge.addColorStop(1, "#236a59");
  ctx.fillStyle = ridge;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.62);
  ctx.quadraticCurveTo(w * 0.18, h * 0.39, w * 0.36, h * 0.57);
  ctx.quadraticCurveTo(w * 0.55, h * 0.31, w * 0.77, h * 0.58);
  ctx.quadraticCurveTo(w * 0.9, h * 0.45, w, h * 0.54);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(14,92,60,0.46)";
  ctx.beginPath();
  ctx.moveTo(0, h * 0.77);
  ctx.bezierCurveTo(w * 0.2, h * 0.69, w * 0.42, h * 0.9, w * 0.64, h * 0.75);
  ctx.bezierCurveTo(w * 0.8, h * 0.65, w * 0.93, h * 0.71, w, h * 0.68);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // 바탕화면 아이콘
  const iconSize = Math.max(34, Math.min(54, w * 0.055));
  const ix = Math.max(18, w * 0.025);
  const iy = Math.max(18, h * 0.035);
  const gap = iconSize + 42;
  drawDesktopIcon(ctx, "folder", "작업", ix, iy, iconSize);
  drawDesktopIcon(ctx, "doc", "메모", ix, iy + gap, iconSize);
  drawDesktopIcon(ctx, "browser", "웹", ix, iy + gap * 2, iconSize);
  drawDesktopIcon(ctx, "trash", "휴지통", ix, iy + gap * 3, iconSize);

  // 하단 작업 표시줄
  const barH = Math.max(48, Math.min(64, h * 0.075));
  const barY = h - barH;
  ctx.fillStyle = "rgba(20,31,46,0.82)";
  ctx.fillRect(0, barY, w, barH);
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fillRect(0, barY, w, 1);

  const startS = barH * 0.62;
  roundRect(ctx, 12, barY + (barH - startS) / 2, startS, startS, 8);
  ctx.fillStyle = "#2b91ff";
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.fillRect(12 + startS * 0.24, barY + barH * 0.32, startS * 0.2, startS * 0.2);
  ctx.fillRect(12 + startS * 0.52, barY + barH * 0.32, startS * 0.2, startS * 0.2);
  ctx.fillRect(12 + startS * 0.24, barY + barH * 0.6, startS * 0.2, startS * 0.2);
  ctx.fillRect(12 + startS * 0.52, barY + barH * 0.6, startS * 0.2, startS * 0.2);

  const colors = ["#ffd166", "#06d6a0", "#4cc9f0", "#ef476f"];
  for (let i = 0; i < colors.length; i++) {
    const s = startS * 0.82;
    const x = 28 + startS + i * (s + 12);
    roundRect(ctx, x, barY + (barH - s) / 2, s, s, 8);
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fill();
    ctx.fillStyle = colors[i];
    ctx.beginPath();
    ctx.arc(x + s / 2, barY + barH / 2, s * 0.22, 0, Math.PI * 2);
    ctx.fill();
  }

  const clockW = Math.max(84, w * 0.1);
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  roundRect(ctx, w - clockW - 12, barY + 8, clockW, barH - 16, 8);
  ctx.fill();
  text(ctx, "오후 3:42", w - clockW / 2 - 12, barY + barH * 0.43, Math.max(11, barH * 0.22), "#eef6ff");
  text(ctx, "2026-05-26", w - clockW / 2 - 12, barY + barH * 0.68, Math.max(9, barH * 0.16), "#cdd8e8");

  ctx.restore();
}

function drawAppGlyph(ctx, kind, cx, cy, s) {
  ctx.save();
  ctx.strokeStyle = "#fff";
  ctx.fillStyle = "#fff";
  ctx.lineWidth = Math.max(1.6, s * 0.09);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (kind === "phone") {
    ctx.beginPath();
    ctx.arc(cx - s * 0.06, cy, s * 0.22, -0.7, 2.35);
    ctx.stroke();
  } else if (kind === "chat") {
    roundRect(ctx, cx - s * 0.3, cy - s * 0.22, s * 0.6, s * 0.42, s * 0.16);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.05, cy + s * 0.2);
    ctx.lineTo(cx - s * 0.2, cy + s * 0.32);
    ctx.stroke();
  } else if (kind === "camera") {
    roundRect(ctx, cx - s * 0.34, cy - s * 0.23, s * 0.68, s * 0.5, s * 0.08);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy + s * 0.02, s * 0.14, 0, Math.PI * 2);
    ctx.stroke();
  } else if (kind === "music") {
    ctx.beginPath();
    ctx.moveTo(cx + s * 0.12, cy - s * 0.28);
    ctx.lineTo(cx + s * 0.12, cy + s * 0.18);
    ctx.arc(cx - s * 0.05, cy + s * 0.2, s * 0.13, 0, Math.PI * 2);
    ctx.stroke();
  } else if (kind === "mail") {
    roundRect(ctx, cx - s * 0.34, cy - s * 0.22, s * 0.68, s * 0.46, s * 0.06);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.32, cy - s * 0.18);
    ctx.lineTo(cx, cy + s * 0.07);
    ctx.lineTo(cx + s * 0.32, cy - s * 0.18);
    ctx.stroke();
  } else if (kind === "map") {
    ctx.beginPath();
    ctx.arc(cx, cy - s * 0.08, s * 0.19, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy + s * 0.35);
    ctx.lineTo(cx - s * 0.18, cy + s * 0.08);
    ctx.lineTo(cx + s * 0.18, cy + s * 0.08);
    ctx.closePath();
    ctx.stroke();
  } else if (kind === "gear") {
    ctx.beginPath();
    ctx.arc(cx, cy, s * 0.23, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * s * 0.32, cy + Math.sin(a) * s * 0.32);
      ctx.lineTo(cx + Math.cos(a) * s * 0.4, cy + Math.sin(a) * s * 0.4);
      ctx.stroke();
    }
  } else {
    ctx.beginPath();
    ctx.arc(cx, cy, s * 0.26, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawAppIcon(ctx, x, y, s, colorA, colorB, glyph, label) {
  ctx.save();
  const g = ctx.createLinearGradient(x, y, x + s, y + s);
  g.addColorStop(0, colorA);
  g.addColorStop(1, colorB);
  ctx.fillStyle = g;
  roundRect(ctx, x, y, s, s, s * 0.22);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.beginPath();
  ctx.ellipse(x + s * 0.3, y + s * 0.18, s * 0.28, s * 0.13, -0.25, 0, Math.PI * 2);
  ctx.fill();
  drawAppGlyph(ctx, glyph, x + s / 2, y + s / 2, s * 0.72);
  text(ctx, label, x + s / 2, y + s + 13, Math.max(9, s * 0.17), "#f8fbff", "center", "600");
  ctx.restore();
}

export function drawMobileHome(ctx, w, h) {
  ctx.save();
  ctx.clearRect(0, 0, w, h);

  // 스마트폰 배경과 상태바
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, "#2356d9");
  bg.addColorStop(0.42, "#7b4fe8");
  bg.addColorStop(0.72, "#1db6a6");
  bg.addColorStop(1, "#0d355d");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.beginPath();
  ctx.arc(w * 0.2, h * 0.18, Math.min(w, h) * 0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.beginPath();
  ctx.arc(w * 0.82, h * 0.72, Math.min(w, h) * 0.34, 0, Math.PI * 2);
  ctx.fill();

  const safe = Math.max(16, w * 0.045);
  const statusH = Math.max(32, h * 0.055);
  text(ctx, "15:42", safe, statusH * 0.58, Math.max(13, w * 0.04), "#fff", "left", "700");

  const right = w - safe;
  ctx.strokeStyle = "#fff";
  ctx.fillStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(right - 72, statusH * 0.7);
  ctx.lineTo(right - 72, statusH * 0.58);
  ctx.lineTo(right - 67, statusH * 0.58);
  ctx.lineTo(right - 67, statusH * 0.47);
  ctx.lineTo(right - 62, statusH * 0.47);
  ctx.lineTo(right - 62, statusH * 0.36);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(right - 42, statusH * 0.58, 11, Math.PI * 1.15, Math.PI * 1.85);
  ctx.arc(right - 42, statusH * 0.58, 7, Math.PI * 1.18, Math.PI * 1.82);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(right - 42, statusH * 0.72, 1.8, 0, Math.PI * 2);
  ctx.fill();
  roundRect(ctx, right - 24, statusH * 0.38, 21, 11, 3);
  ctx.stroke();
  ctx.fillRect(right - 21, statusH * 0.41, 14, 5);
  ctx.fillRect(right - 1, statusH * 0.42, 2, 7);

  const cols = 4;
  const icon = Math.min(w * 0.15, h * 0.075, 64);
  const gapX = (w - safe * 2 - icon * cols) / (cols - 1);
  const startY = statusH + Math.max(24, h * 0.045);
  const gapY = icon + Math.max(32, h * 0.045);

  const apps = [
    ["#35d07f", "#0aa35d", "phone", "전화"],
    ["#4cc9f0", "#2479ff", "chat", "문자"],
    ["#ffb703", "#fb5607", "camera", "카메라"],
    ["#ef476f", "#b5179e", "music", "음악"],
    ["#5e60ce", "#48bfe3", "mail", "메일"],
    ["#06d6a0", "#118ab2", "map", "지도"],
    ["#adb5bd", "#495057", "gear", "설정"],
    ["#ffd166", "#f77f00", "sun", "날씨"],
    ["#7209b7", "#3a0ca3", "dot", "게임"],
    ["#80ed99", "#38b000", "dot", "사진"],
    ["#ff758f", "#ff4d6d", "dot", "쇼핑"],
    ["#90dbf4", "#5390d9", "dot", "노트"],
  ];

  for (let i = 0; i < apps.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = safe + col * (icon + gapX);
    const y = startY + row * gapY;
    drawAppIcon(ctx, x, y, icon, apps[i][0], apps[i][1], apps[i][2], apps[i][3]);
  }

  // 페이지 점
  const dotY = h - Math.max(118, h * 0.15);
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i === 0 ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.35)";
    ctx.beginPath();
    ctx.arc(w / 2 + (i - 1) * 14, dotY, i === 0 ? 4 : 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // 하단 독
  const dockH = Math.max(72, h * 0.1);
  const dockW = Math.min(w - safe * 2, icon * 4 + 58);
  const dockX = (w - dockW) / 2;
  const dockY = h - dockH - Math.max(12, h * 0.018);
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  roundRect(ctx, dockX, dockY, dockW, dockH, 24);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.stroke();

  const dockApps = [
    ["#38b000", "#70e000", "phone", ""],
    ["#3a86ff", "#00b4d8", "chat", ""],
    ["#ff006e", "#8338ec", "camera", ""],
    ["#fca311", "#e85d04", "music", ""],
  ];
  const dockGap = (dockW - icon * 0.82 * 4) / 5;
  for (let i = 0; i < 4; i++) {
    const s = icon * 0.82;
    drawAppIcon(ctx, dockX + dockGap + i * (s + dockGap), dockY + (dockH - s) / 2, s, dockApps[i][0], dockApps[i][1], dockApps[i][2], dockApps[i][3]);
  }

  ctx.restore();
}
