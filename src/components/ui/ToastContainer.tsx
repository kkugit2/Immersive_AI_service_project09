"use client";

import { useToast, type ToastType } from "@/hooks/useToast";

const barColor: Record<ToastType, string> = {
  success: "#16A34A",
  error: "#DC2626",
  info: "#2563EB",
};

const icon: Record<ToastType, string> = {
  success: "✓",
  error: "!",
  info: "i",
};

export function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end">
      {toasts.map((t) => (
        <div
          key={t.id}
          role={t.type === "error" ? "alert" : "status"}
          className="pointer-events-auto flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-lg bg-white pr-3 shadow-toast animate-toast-in motion-reduce:animate-none"
        >
          <span
            className="w-1 self-stretch"
            style={{ backgroundColor: barColor[t.type] }}
            aria-hidden
          />
          <span
            className="mt-3 grid h-5 w-5 shrink-0 place-items-center rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: barColor[t.type] }}
            aria-hidden
          >
            {icon[t.type]}
          </span>
          <p className="py-3 text-[14px] leading-5 text-body">{t.message}</p>
          <button
            onClick={() => dismissToast(t.id)}
            aria-label="알림 닫기"
            className="ml-auto mt-2 shrink-0 rounded p-1 text-muted hover:text-body focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <span aria-hidden>✕</span>
          </button>
        </div>
      ))}
    </div>
  );
}
