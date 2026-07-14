"use client";

import { useCallback, useEffect, useState } from "react";

/** beforeinstallprompt 이벤트 타입 (표준 미정의 → 로컬 선언) */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt: () => Promise<void>;
}

interface InstallPromptState {
  /** 설치 프롬프트를 띄울 수 있는 상태(Android/Chrome 등) */
  canInstall: boolean;
  /** 이미 홈화면 앱으로 실행 중(standalone) */
  isStandalone: boolean;
  /** iOS Safari — beforeinstallprompt 미지원, 수동 안내 필요 */
  isIOS: boolean;
  /** 네이티브 설치 프롬프트 실행. accepted 여부 반환 */
  promptInstall: () => Promise<boolean>;
}

export function useInstallPrompt(): InstallPromptState {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // standalone 감지 (설치 후 실행 시 배너/버튼 숨김)
    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      // iOS Safari 전용 플래그
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(!!standalone);

    // iOS 감지 (iPadOS 13+ 는 MacIntel + touch 로 보고됨)
    const ua = window.navigator.userAgent.toLowerCase();
    const iOS =
      /iphone|ipad|ipod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIOS(iOS && /safari/.test(ua) && !/crios|fxios/.test(ua));

    const onBeforeInstall = (e: Event) => {
      e.preventDefault(); // 기본 미니 인포바 억제 → 커스텀 UI 로 유도
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setDeferred(null);
      setIsStandalone(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferred) return false;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    setDeferred(null);
    return outcome === "accepted";
  }, [deferred]);

  return {
    canInstall: deferred !== null && !isStandalone,
    isStandalone,
    isIOS,
    promptInstall,
  };
}
