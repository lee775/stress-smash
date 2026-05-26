// 씬 공통 레이아웃 + 상단 컨트롤 (뒤로가기 / 음소거)
// 그리기는 ui.js(코덱스) 프리미티브를 사용하고, 좌표/히트테스트는 여기서 담당한다.
import { drawButton } from "./ui.js";
import { pointInRect } from "./utils.js";
import { toggleMuted, isMuted, playClick } from "./audio.js";

export function topControlRects(w, h) {
  const pad = Math.max(12, w * 0.03);
  const bw = Math.min(110, w * 0.26);
  const bh = 44;
  return {
    back: { x: pad, y: pad, w: bw, h: bh },
    mute: { x: w - pad - bh, y: pad, w: bh, h: bh },
  };
}

// 상단 컨트롤 렌더 (제목은 가운데 표시)
export function drawTopControls(ctx, w, h, title) {
  const r = topControlRects(w, h);
  drawButton(ctx, r.back, "뒤로", { variant: "ghost", emoji: "←", fontSize: 20 });
  drawButton(ctx, r.mute, "", { variant: "ghost", emoji: isMuted() ? "🔇" : "🔊", fontSize: 22 });

  if (title) {
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.font = "900 24px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(title, w / 2, r.back.y + r.back.h / 2 + 1);
    ctx.restore();
  }
  return r;
}

// 상단 컨트롤 입력 처리. 처리했으면 true 반환.
export function handleTopControls(x, y, engine, w, h) {
  const r = topControlRects(w, h);
  if (pointInRect(x, y, r.back)) {
    playClick();
    engine.setScene("menu");
    return true;
  }
  if (pointInRect(x, y, r.mute)) {
    toggleMuted();
    if (!isMuted()) playClick();
    return true;
  }
  return false;
}
