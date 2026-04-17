// Service Worker for ROOKIE BASEBALL
const CACHE_NAME = 'rookie-baseball-v6';

// ベースパスを動的に取得（Netlify: "/" / GitHub Pages: "/repo-name/"）
const BASE = self.location.pathname.replace(/\/sw\.js$/, '');

// キャッシュするファイル一覧（相対パスで定義）
const ASSET_PATHS = [
  '/',
  '/index.html',
  // 画像
  '/images/tutorial_mascot.png',
  '/images/base_running.png',
  '/images/field_positions.png',
  '/images/strike_zone.png',
  '/images/card_lv01_all.png',
  '/images/card_lv01_arm.png',
  '/images/card_lv01_defense.png',
  '/images/card_lv01_meet.png',
  '/images/card_lv01_pitcher.png',
  '/images/card_lv01_speed.png',
  '/images/card_lv05_all.png',
  '/images/card_lv05_arm.png',
  '/images/card_lv05_defense.png',
  '/images/card_lv05_meet.png',
  '/images/card_lv05_pitcher.png',
  '/images/card_lv05_speed.png',
  '/images/card_lv10_all.png',
  '/images/card_lv10_arm.png',
  '/images/card_lv10_defense.png',
  '/images/card_lv10_meet.png',
  '/images/card_lv10_pitcher.png',
  '/images/card_lv10_speed.png',
  '/images/card_lv15_all.png',
  '/images/card_lv15_arm.png',
  '/images/card_lv15_defense.png',
  '/images/card_lv15_meet.png',
  '/images/card_lv15_pitcher.png',
  '/images/card_lv15_speed.png',
  '/images/card_lv20_all.png',
  '/images/card_lv20_arm.png',
  '/images/card_lv20_defense.png',
  '/images/card_lv20_meet.png',
  '/images/card_lv20_pitcher.png',
  '/images/card_lv20_speed.png',
  '/images/card_lv25_all.png',
  '/images/card_lv25_arm.png',
  '/images/card_lv25_defense.png',
  '/images/card_lv25_meet.png',
  '/images/card_lv25_pitcher.png',
  '/images/card_lv25_speed.png',
  '/images/card_lv30_all.png',
  '/images/card_lv30_arm.png',
  '/images/card_lv30_defense.png',
  '/images/card_lv30_meet.png',
  '/images/card_lv30_pitcher.png',
  '/images/card_lv30_speed.png',
  '/images/card_lv50_all.png',
  '/images/card_lv50_arm.png',
  '/images/card_lv50_defense.png',
  '/images/card_lv50_meet.png',
  '/images/card_lv50_pitcher.png',
  '/images/card_lv50_speed.png',
  // アイコン
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  // 効果音
  '/sounds/hanko.mp3',
  '/sounds/get_card.mp3',
  '/sounds/menu_select.mp3',
  '/sounds/quiz_correct.mp3',
  '/sounds/quiz_question.mp3',
  '/sounds/quiz_wrong.mp3',
  '/sounds/upgrade.mp3',
];

// ベースパスを付けた完全URLリストを生成
const ASSETS = ASSET_PATHS.map(p => BASE + p);

// インストール時：全アセットをキャッシュ
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .catch(() => {}) // 一部失敗しても続行
      .then(() => self.skipWaiting())
  );
});

// アクティベート時：古いキャッシュを削除
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// フェッチ処理
self.addEventListener('fetch', event => {
  if (!event.request.url.startsWith('http')) return;

  const url = new URL(event.request.url);
  const path = url.pathname;
  const isHTML = path === BASE + '/' || path === BASE + '/index.html' || path.endsWith('.html');

  if (isHTML) {
    // index.html はネットワーク優先（常に最新を取得）
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // 画像・効果音などはキャッシュ優先
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (!response || response.status !== 200 || response.type === 'opaque') {
            return response;
          }
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        });
      })
    );
  }
});
