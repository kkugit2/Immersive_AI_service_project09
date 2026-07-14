"use client";

import { useEffect, useState } from "react";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

const DISMISS_KEY = "pwa-install-dismissed";

/**
 * 모바일 상단 "홈 화면에 추가" 안내 배너.
 * - Android/Chrome 등: beforeinstallprompt 사용 → 설치 버튼 제공
 * - iOS Safari: 프롬프트 미지원 → 공유 → "홈 화면에 추가" 수동 안내
 * 사용자가 닫으면 localStorage 에 기록해 재노출하지 않음.
 */
export function InstallBanner() {
  const { canInstall, isIOS, isStandalone, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(true); // 최초엔 숨김(하이드레이션 안정)

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
  }, []);

  const close = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* 저장 실패는 무시 */
    }
  };

  // 이미 설치됨 / 이미 닫음 / 설치 경로 없음 → 미노출
  const show = !isStandalone && !dismissed && (canInstall || isIOS);
  if (!show) return null;

  return (
    <div
      role="region"
      aria-label="앱 설치 안내"
      className="border-b border-primary-600/20 bg-primary-50 px-4 py-2.5 sm:hidden"
    >
      <div className="flex items-center gap-3">
        <span aria-hidden className="text-xl">📲</span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-primary-700">홈 화면에 추가</p>
          {isIOS ? (
            <p className="text-[13px] leading-5 text-body">
              공유 버튼 <span aria-hidden>􀈂</span>{" "}
              <span className="font-medium">→ &quot;홈 화면에 추가&quot;</span> 를 누르면
              앱처럼 사용할 수 있어요.
            </p>
          ) : (
            <p className="text-[13px] leading-5 text-body">
              설치하면 홈 화면에서 앱처럼 빠르게 열 수 있어요.
            </p>
          )}
        </div>

        {!isIOS && canInstall && (
          <button
            onClick={promptInstall}
            className="shrink-0 rounded-lg bg-primary-600 px-3 py-2 text-[13px] font-semibold text-white active:bg-primary-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            설치
          </button>
        )}
        <button
          onClick={close}
          aria-label="안내 닫기"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted active:bg-white/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <span aria-hidden className="text-base">✕</span>
        </button>
      </div>
    </div>
  );
}
