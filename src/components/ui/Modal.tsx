"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/** 중앙 모달(데스크톱) / 하단 시트(모바일). 오버레이/ESC 닫기 + 포커스 트랩. */
export function Modal({ title, onClose, children }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;

    // 첫 포커스 가능한 요소로 이동
    const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
      'input, select, textarea, button, [href], [tabindex]:not([tabindex="-1"])'
    );
    focusable?.[0]?.focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && focusable && focusable.length > 0) {
        const list = Array.from(focusable);
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ backgroundColor: "rgba(17,24,39,0.5)" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full sm:w-[420px] max-w-full bg-white shadow-modal rounded-t-xl sm:rounded-xl animate-sheet-in sm:animate-modal-in motion-reduce:animate-none"
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h1 className="text-[20px] font-bold leading-7 text-strong">{title}</h1>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="grid h-11 w-11 place-items-center rounded-lg text-muted hover:bg-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <span aria-hidden className="text-lg leading-none">✕</span>
          </button>
        </div>
        <div className="border-t border-edge" />
        <div className="px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-4">
          {children}
        </div>
      </div>
    </div>
  );
}
