export function drawIcon(ctx, size, opts = {}) {
  const s = size;
  const maskable = !!opts.maskable;
  const cx = s * 0.5;
  const cy = s * 0.5;
  const scale = s / 512;
  const motif = maskable ? 0.86 : 1;

  const px = (v) => v * scale * motif;
  const x = (v) => cx + v * scale * motif;
  const y = (v) => cy + v * scale * motif;

  ctx.save();
  ctx.clearRect(0, 0, s, s);

  // 배경: 게임 메뉴 느낌의 풀블리드 브랜드 그라디언트
  const bg = ctx.createLinearGradient(0, 0, s, s);
  bg.addColorStop(0, "#25124d");
  bg.addColorStop(0.48, "#6f2bc2");
  bg.addColorStop(1, "#ff75b7");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, s, s);

  // 가장자리 에너지 링
  ctx.save();
  ctx.globalAlpha = 0.28;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = Math.max(2, s * 0.018);
  ctx.beginPath();
  ctx.arc(cx, cy, s * 0.43, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 0.16;
  ctx.lineWidth = Math.max(2, s * 0.032);
  ctx.beginPath();
  ctx.arc(cx, cy, s * 0.35, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // 깨진 유리 별 폭발 실루엣
  const star = [
    [0, -188], [34, -82], [128, -142], [85, -43],
    [196, -18], [82, 22], [151, 112], [42, 67],
    [18, 186], [-24, 72], [-132, 131], [-76, 32],
    [-192, -6], [-79, -42], [-112, -151], [-30, -84],
  ];

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.38)";
  ctx.shadowBlur = px(18);
  ctx.shadowOffsetY = px(10);
  ctx.beginPath();
  star.forEach(([sx, sy], i) => {
    const xx = x(sx);
    const yy = y(sy + (maskable ? 8 : 0));
    if (i === 0) ctx.moveTo(xx, yy);
    else ctx.lineTo(xx, yy);
  });
  ctx.closePath();
  const burst = ctx.createRadialGradient(cx, cy, px(26), cx, cy, px(204));
  burst.addColorStop(0, "#ffffff");
  burst.addColorStop(0.48, "#f5f0ff");
  burst.addColorStop(1, "#c9f4ff");
  ctx.fillStyle = burst;
  ctx.fill();
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#2b134e";
  ctx.lineWidth = px(18);
  ctx.stroke();
  ctx.restore();

  // 교수님 얼굴: 작게 봐도 읽히는 안경과 넥타이
  ctx.save();
  ctx.translate(0, maskable ? px(8) : 0);

  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur = px(10);
  ctx.shadowOffsetY = px(7);

  ctx.fillStyle = "#ffd5b8";
  ctx.strokeStyle = "#24113f";
  ctx.lineWidth = px(14);
  ctx.beginPath();
  ctx.arc(cx, y(-8), px(78), 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 머리카락과 눈썹
  ctx.shadowColor = "transparent";
  ctx.fillStyle = "#24113f";
  ctx.beginPath();
  ctx.moveTo(x(-72), y(-54));
  ctx.quadraticCurveTo(x(-28), y(-106), x(28), y(-82));
  ctx.quadraticCurveTo(x(68), y(-68), x(75), y(-28));
  ctx.quadraticCurveTo(x(18), y(-58), x(-72), y(-54));
  ctx.fill();

  // 두꺼운 원형 안경
  ctx.strokeStyle = "#24113f";
  ctx.lineWidth = px(12);
  ctx.beginPath();
  ctx.arc(x(-34), y(-7), px(28), 0, Math.PI * 2);
  ctx.arc(x(34), y(-7), px(28), 0, Math.PI * 2);
  ctx.moveTo(x(-6), y(-7));
  ctx.lineTo(x(6), y(-7));
  ctx.stroke();

  ctx.fillStyle = "#24113f";
  ctx.beginPath();
  ctx.arc(x(-34), y(-5), px(7), 0, Math.PI * 2);
  ctx.arc(x(34), y(-5), px(7), 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#24113f";
  ctx.lineCap = "round";
  ctx.lineWidth = px(9);
  ctx.beginPath();
  ctx.moveTo(x(-30), y(38));
  ctx.quadraticCurveTo(cx, y(55), x(30), y(38));
  ctx.stroke();

  // 넥타이 힌트
  ctx.fillStyle = "#ff2f8f";
  ctx.strokeStyle = "#24113f";
  ctx.lineJoin = "round";
  ctx.lineWidth = px(10);
  ctx.beginPath();
  ctx.moveTo(x(-18), y(72));
  ctx.lineTo(x(18), y(72));
  ctx.lineTo(x(28), y(134));
  ctx.lineTo(cx, y(164));
  ctx.lineTo(x(-28), y(134));
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();

  // 굵은 균열선: 중심에서 방사, 작은 아이콘에서도 보이게
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = px(10);
  ctx.shadowColor = "rgba(37,18,77,0.65)";
  ctx.shadowBlur = px(5);

  const cracks = [
    [[0, -34], [8, -82], [-12, -136], [-6, -178]],
    [[26, -22], [82, -64], [125, -126]],
    [[42, 6], [102, 4], [179, -22]],
    [[28, 35], [72, 86], [127, 124]],
    [[-4, 46], [3, 100], [18, 176]],
    [[-35, 29], [-87, 72], [-139, 126]],
    [[-48, -2], [-103, -16], [-180, -3]],
    [[-29, -30], [-72, -78], [-112, -143]],
  ];

  for (const path of cracks) {
    ctx.beginPath();
    path.forEach(([px0, py0], i) => {
      const xx = x(px0);
      const yy = y(py0 + (maskable ? 8 : 0));
      if (i === 0) ctx.moveTo(xx, yy);
      else ctx.lineTo(xx, yy);
    });
    ctx.stroke();
  }

  // 보조 균열
  ctx.lineWidth = px(6);
  const branches = [
    [[8, -82], [42, -104]],
    [[82, -64], [94, -29]],
    [[102, 4], [132, 31]],
    [[72, 86], [43, 112]],
    [[-87, 72], [-88, 108]],
    [[-103, -16], [-130, -48]],
    [[-72, -78], [-42, -114]],
  ];

  for (const path of branches) {
    ctx.beginPath();
    path.forEach(([px0, py0], i) => {
      const xx = x(px0);
      const yy = y(py0 + (maskable ? 8 : 0));
      if (i === 0) ctx.moveTo(xx, yy);
      else ctx.lineTo(xx, yy);
    });
    ctx.stroke();
  }
  ctx.restore();

  // 중심 충격 포인트
  ctx.save();
  ctx.translate(0, maskable ? px(8) : 0);
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#24113f";
  ctx.lineWidth = px(8);
  ctx.beginPath();
  ctx.arc(cx, cy, px(18), 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}
