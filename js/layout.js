// 해상도 비례 레이아웃 헬퍼: 세로 컬럼(stage) + 겹치지 않는 세로 밴드 + 캐릭터 핏 스케일

// 넓은 화면에서는 세로 컬럼으로 가둬 가로 늘어짐/겹침을 막는다.
// 모바일 세로 화면에서는 stage = 전체 폭.
export function stageRect(w, h) {
  const sw = Math.min(w, Math.round(h * 0.66));
  return { x: Math.round((w - sw) / 2), w: sw, h };
}

// 상단 컨트롤(뒤로/음소거)이 차지하는 영역의 아래 y (컬럼-로컬 좌표)
export function topBarBottom(stageW) {
  const pad = Math.max(12, stageW * 0.03);
  return pad + 44;
}

// 하단 컨트롤(리셋 등) 버튼 높이/패딩
export function bottomPad(h) {
  return Math.max(14, Math.round(h * 0.02));
}
export function buttonH(h) {
  return Math.max(48, Math.min(64, Math.round(h * 0.075)));
}

// 캐릭터를 세로 밴드 [topY, bottomY]에 맞춰 스케일/바닥좌표 계산.
// headroom: 머리 위로 비워둘 비율(말풍선/뇌 공간). 폭/세로 모두 고려해 절대 밴드를 넘지 않음.
//
// 주의: 교수님 캐릭터의 실제 시각 높이는 발끝~머리카락 끝까지 ≈ 332 로컬단위다.
// (머리 중심 -252, 반지름~53, 머리카락 -77 → 상단 약 -329). 이 값으로 스케일을 잡아야
// 머리카락이 밴드 위(타이틀/HUD)를 침범하지 않는다.
const FIG_H = 332;

export function fitCharacter(stageW, topY, bottomY, headroom = 0) {
  const bandH = Math.max(20, bottomY - topY);
  const figH = bandH * (1 - headroom) * 0.96; // 추가 안전 여백 4%
  let scale = figH / FIG_H;
  scale = Math.min(scale, (stageW * 0.78) / 200); // 가로 제약(폭 ≈ ±100)
  scale = Math.min(scale, 1.3);
  const groundY = bottomY;
  const headTopY = groundY - FIG_H * scale; // 머리카락 끝 기준
  return { scale, groundY, headTopY, bandH };
}

// drawTitleArt(ctx, W, h)가 차지하는 대략적 아래 y (겹침 회피용, ui.js 공식과 일치)
export function titleBottom(stageW, h) {
  const titleSize = Math.max(42, Math.min(76, stageW * 0.14));
  const subSize = Math.max(18, Math.min(28, stageW * 0.055));
  const pillH = Math.max(36, subSize * 1.65);
  return h * 0.2 + titleSize * 0.58 + pillH + 14;
}
