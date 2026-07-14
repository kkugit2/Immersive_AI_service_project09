"use client";

import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg text-[14px] font-semibold leading-5 transition-colors duration-[120ms] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 disabled:bg-primary-500/50 disabled:opacity-70",
  secondary:
    "bg-white text-body border border-[#D1D5DB] hover:bg-subtle active:bg-[#F3F4F6] disabled:text-muted",
  danger:
    "bg-white text-error border border-error hover:bg-[#FEF2F2] active:bg-[#FEE2E2]",
};

export function Button({
  variant = "primary",
  loading = false,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
          aria-hidden
        />
      )}
      {children}
    </button>
  );
}
