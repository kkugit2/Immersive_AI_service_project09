"use client";

import { useInstallPrompt } from "@/hooks/useInstallPrompt";

/** 헤더 우측 설치 버튼. 설치 가능한 브라우저에서만 노출. */
export function InstallButton() {
  const { canInstall, promptInstall } = useInstallPrompt();

  if (!canInstall) return null;

  return (
    <button
      onClick={promptInstall}
      aria-label="앱 설치"
      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-primary-600 bg-primary-50 px-3 text-[13px] font-semibold text-primary-600 transition-colors hover:bg-primary-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
    >
      <span aria-hidden>⬇️</span>
      <span className="hidden sm:inline">앱 설치</span>
      <span className="sm:hidden">설치</span>
    </button>
  );
}
