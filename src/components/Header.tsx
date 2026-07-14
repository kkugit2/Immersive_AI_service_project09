"use client";

import { useEffect, useState } from "react";
import { formatClock, formatKoreanDate, isSameLocalDate } from "@/lib/time";
import { InstallButton } from "./InstallButton";

interface HeaderProps {
  currentDate: Date;
  onPrevDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
}

export function Header({ currentDate, onPrevDay, onNextDay, onToday }: HeaderProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const isToday = now ? isSameLocalDate(currentDate, now) : false;

  return (
    <header className="sticky top-0 z-40 border-b border-edge bg-white">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-2 px-4 py-3 sm:h-16 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-8 sm:py-0">
        {/* 좌: 서비스명 (+ 모바일 설치 버튼) */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span aria-hidden className="text-xl">🗓️</span>
            <span className="text-[18px] font-bold leading-7 text-strong sm:text-[24px] sm:leading-8">
              회의실 예약 시스템
            </span>
          </div>
          {/* 모바일: 헤더 우측 설치 버튼 */}
          <div className="sm:hidden">
            <InstallButton />
          </div>
        </div>

        {/* 중앙: 날짜 네비게이터 */}
        <div className="flex items-center justify-center gap-1 sm:gap-2">
          <button
            onClick={onPrevDay}
            aria-label="이전 날짜"
            className="grid h-11 w-11 place-items-center rounded-lg text-body hover:bg-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <span aria-hidden>◀</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-semibold text-strong tabular-nums">
              {formatKoreanDate(currentDate)}
            </span>
            {isToday && (
              <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[12px] font-semibold text-primary-600">
                오늘
              </span>
            )}
          </div>
          <button
            onClick={onNextDay}
            aria-label="다음 날짜"
            className="grid h-11 w-11 place-items-center rounded-lg text-body hover:bg-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <span aria-hidden>▶</span>
          </button>
          {!isToday && (
            <button
              onClick={onToday}
              className="ml-1 rounded-lg border border-[#D1D5DB] px-2.5 py-1 text-[13px] font-medium text-body hover:bg-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              오늘
            </button>
          )}
        </div>

        {/* 우: 현재 시각 + 설치 버튼 (데스크톱) */}
        <div className="hidden items-center gap-3 sm:flex">
          <span className="text-right text-[14px] text-muted tabular-nums sm:min-w-[72px]">
            {now ? formatClock(now) : ""}
          </span>
          <InstallButton />
        </div>
      </div>
    </header>
  );
}
