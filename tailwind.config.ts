import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#EFF6FF",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
        },
        // 예약 보드 셀 상태 색상
        available: {
          bg: "#F0FDF4",
          border: "#BBF7D0",
          text: "#166534",
          hover: "#DCFCE7",
        },
        booked: {
          bg: "#DBEAFE",
          border: "#93C5FD",
          text: "#1E40AF",
        },
        disabledcell: {
          bg: "#F3F4F6",
          text: "#9CA3AF",
        },
        now: "#EF4444",
        // Neutral
        base: "#FFFFFF",
        subtle: "#F9FAFB",
        edge: "#E5E7EB",
        strong: "#111827",
        body: "#374151",
        muted: "#6B7280",
        // Feedback
        success: "#16A34A",
        error: "#DC2626",
        warning: "#D97706",
        info: "#2563EB",
      },
      fontFamily: {
        sans: [
          "Pretendard",
          "-apple-system",
          "Segoe UI",
          "Malgun Gothic",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.08)",
        modal: "0 10px 40px rgba(0,0,0,0.15)",
        toast: "0 4px 12px rgba(0,0,0,0.12)",
      },
      borderRadius: {
        cell: "4px",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "modal-in": {
          from: { opacity: "0", transform: "scale(0.97)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "sheet-in": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "toast-in": {
          from: { opacity: "0", transform: "translateY(-8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 150ms ease-out",
        "modal-in": "modal-in 150ms ease-out",
        "sheet-in": "sheet-in 200ms ease-out",
        "toast-in": "toast-in 150ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
