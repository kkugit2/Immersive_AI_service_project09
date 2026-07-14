import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  // 개발 모드에서는 SW 캐싱을 비활성화(HMR/디버깅 편의)
  disable: process.env.NODE_ENV === "development",
  register: true,
  reloadOnOnline: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  workboxOptions: {
    // 오프라인 시 마지막으로 방문한 화면을 보여주기 위한 네비게이션 폴백
    // (SW 미제어 시 최초 방문은 offline 안내 페이지로 폴백)
    runtimeCaching: [
      // CDN(폰트/CSS): 캐시 우선
      {
        urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "cdn-assets",
          expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      // Supabase REST API: 네트워크 우선, 실패 시 캐시된 예약 데이터 표시
      {
        urlPattern: /^https:\/\/[a-z0-9]+\.supabase\.co\/rest\/.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "supabase-api",
          networkTimeoutSeconds: 10,
          expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      // Next.js 정적 청크: 캐시 우선
      {
        urlPattern: /\/_next\/static\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "next-static",
          expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
      // 이미지/아이콘: 캐시 우선
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "images",
          expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
      // 그 외 JS/CSS: 캐시 우선
      {
        urlPattern: /\.(?:js|css)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "static-resources",
          expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
      // 페이지(HTML 문서/네비게이션): 네트워크 우선, 실패 시 마지막 방문 화면
      {
        urlPattern: ({ request }) => request.mode === "navigate",
        handler: "NetworkFirst",
        options: {
          cacheName: "pages",
          networkTimeoutSeconds: 10,
          expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default withPWA(nextConfig);
