// 정적 웹 자산을 www/ 로 복사한다 (GitHub Pages 배포 + Capacitor webDir 공용)
import { rmSync, mkdirSync, cpSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = resolve(root, "www");

// 복사 대상 (루트 기준)
const ITEMS = [
  "index.html",
  "manifest.webmanifest",
  "sw.js",
  "css",
  "js",
  "assets",
];

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

for (const item of ITEMS) {
  const src = resolve(root, item);
  if (!existsSync(src)) {
    console.warn(`skip (없음): ${item}`);
    continue;
  }
  cpSync(src, resolve(out, item), { recursive: true });
  console.log(`copied: ${item}`);
}

console.log(`\n빌드 완료 → ${out}`);
