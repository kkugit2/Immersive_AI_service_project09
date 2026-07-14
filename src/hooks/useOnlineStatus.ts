"use client";

import { useEffect, useState } from "react";

/** 네트워크 연결 상태. 오프라인 시 마지막 조회 데이터로 동작함을 안내하는 데 사용. */
export function useOnlineStatus(): boolean {
  // SSR/최초 렌더는 온라인으로 가정(하이드레이션 불일치 방지)
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return online;
}
