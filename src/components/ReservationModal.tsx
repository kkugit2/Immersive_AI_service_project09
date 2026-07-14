"use client";

import { useMemo, useState } from "react";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { DURATION_OPTIONS, CLOSE_HOUR, OPEN_HOUR } from "@/lib/constants";
import { buildSlots, makeISO, addMinutesISO, isoToTimeLabel, formatKoreanDate, parseDateKey } from "@/lib/time";
import type { NewReservationInput, SlotSelection } from "@/types";
import type { ToastType } from "@/hooks/useToast";

interface ReservationModalProps {
  selection: SlotSelection;
  onClose: () => void;
  onCreate: (input: NewReservationInput) => Promise<{ ok: boolean; message?: string }>;
  showToast: (type: ToastType, message: string) => void;
}

export function ReservationModal({ selection, onClose, onCreate, showToast }: ReservationModalProps) {
  const slots = useMemo(() => buildSlots(), []);
  const [reserverName, setReserverName] = useState("");
  const [meetingTitle, setMeetingTitle] = useState("");
  const [startLabel, setStartLabel] = useState(selection.slotTime);
  const [durationMin, setDurationMin] = useState(DURATION_OPTIONS[0].minutes);
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  const [startH, startM] = startLabel.split(":").map(Number);
  const startISO = makeISO(selection.date, startH, startM);
  const endISO = addMinutesISO(startISO, durationMin);
  const endLabel = isoToTimeLabel(endISO);

  // 종료가 운영 종료(18:00)를 넘는지
  const endTotalMin = startH * 60 + startM + durationMin;
  const exceedsClose = endTotalMin > CLOSE_HOUR * 60;

  const nameError = touched && reserverName.trim() === "" ? "예약자명을 입력해주세요." : "";
  const titleError = touched && meetingTitle.trim() === "" ? "회의 목적을 입력해주세요." : "";
  const canSubmit = reserverName.trim() !== "" && meetingTitle.trim() !== "" && !exceedsClose;

  const handleSubmit = async () => {
    setTouched(true);
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    const result = await onCreate({
      room_id: selection.room.id,
      reserver_name: reserverName.trim(),
      meeting_title: meetingTitle.trim(),
      start_time: startISO,
      end_time: endISO,
    });
    setSubmitting(false);
    if (result.ok) {
      showToast("success", "예약이 완료되었습니다.");
      onClose();
    } else {
      showToast("error", result.message ?? "일시적인 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <Modal title="회의실 예약" onClose={onClose}>
      {/* 자동 채움 배지 */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="rounded-lg bg-primary-50 px-2.5 py-1 text-[13px] font-semibold text-primary-600">
          회의실 {selection.room.room_number}
        </span>
        <span className="text-[13px] text-muted">·</span>
        <span className="rounded-lg bg-subtle px-2.5 py-1 text-[13px] font-medium text-body">
          {formatKoreanDate(parseDateKey(selection.date))}
        </span>
      </div>

      <div className="space-y-4">
        <Field label="예약자명" required error={nameError}>
          <input
            type="text"
            value={reserverName}
            onChange={(e) => setReserverName(e.target.value)}
            placeholder="이름을 입력하세요"
            className={inputClass(!!nameError)}
          />
        </Field>

        <Field label="회의 목적/제목" required error={titleError}>
          <input
            type="text"
            value={meetingTitle}
            onChange={(e) => setMeetingTitle(e.target.value)}
            placeholder="예: 주간 기획 회의"
            className={inputClass(!!titleError)}
          />
        </Field>

        <div className="flex gap-3">
          <Field label="시작 시간" className="flex-1">
            <select
              value={startLabel}
              onChange={(e) => setStartLabel(e.target.value)}
              className={inputClass(false)}
            >
              {slots.map((s) => (
                <option key={s.index} value={s.label}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="이용 시간" className="flex-1">
            <select
              value={durationMin}
              onChange={(e) => setDurationMin(Number(e.target.value))}
              className={inputClass(false)}
            >
              {DURATION_OPTIONS.map((d) => (
                <option key={d.minutes} value={d.minutes}>
                  {d.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <p className={`text-[13px] ${exceedsClose ? "text-error" : "text-muted"}`}>
          {exceedsClose
            ? `운영 시간(${pad(OPEN_HOUR)}:00~${pad(CLOSE_HOUR)}:00)을 초과합니다.`
            : `→ 종료 ${endLabel}`}
        </p>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={submitting}>
          취소
        </Button>
        <Button variant="primary" onClick={handleSubmit} loading={submitting} disabled={!canSubmit}>
          {submitting ? "예약 중..." : "예약하기"}
        </Button>
      </div>
    </Modal>
  );
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function inputClass(error: boolean) {
  // 모바일: 높이 48px·글씨 16px(iOS 자동 확대 방지), 데스크톱: 40px·14px
  return `h-12 w-full rounded-lg border px-3 text-[16px] text-body outline-none transition-colors focus:ring-2 focus:ring-primary-500 sm:h-10 sm:text-[14px] ${
    error ? "border-error" : "border-[#D1D5DB] focus:border-primary-500"
  }`;
}

function Field({
  label,
  required,
  error,
  className = "",
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-[13px] font-medium text-body">
        {label}
        {required && <span className="ml-0.5 text-error">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-[12px] text-error">{error}</p>}
    </div>
  );
}
