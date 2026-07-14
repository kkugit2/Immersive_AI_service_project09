"use client";

import { useOnlineStatus } from "@/hooks/useOnlineStatus";

/** 오프라인 상태 안내. 마지막으로 조회한 예약 현황이 표시됨을 알림. */
export function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;

  return (
    <div
      role="status"
      className="flex items-center justify-center gap-2 bg-warning/10 px-4 py-2 text-center text-[13px] font-medium text-warning"
    >
      <span aria-hidden>📡</span>
      오프라인 상태입니다. 마지막으로 조회한 예약 현황을 표시합니다.
    </div>
  );
}
