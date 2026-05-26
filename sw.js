// 서비스워커: 정적 자산 프리캐시 + 오프라인 동작 (cache-first)
const CACHE = "stressgame-v4";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/style.css",
  "./js/main.js",
  "./js/engine.js",
  "./js/audio.js",
  "./js/utils.js",
  "./js/layout.js",
  "./js/ui.js",
  "./js/characters.js",
  "./js/effects.js",
  "./js/scenery.js",
  "./js/weapons.js",
  "./js/brainart.js",
  "./js/sceneutil.js",
  "./js/games/smash.js",
  "./js/games/brain.js",
  "./js/games/shin.js",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/icon-192-maskable.png",
  "./assets/icons/icon-512-maskable.png",
  "./assets/icons/apple-touch-icon.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  e.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          // 같은 출처의 정상 응답만 캐시에 저장
          if (res.ok && new URL(req.url).origin === self.location.origin) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
    })
  );
});
