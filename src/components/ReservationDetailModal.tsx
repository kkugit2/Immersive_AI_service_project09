"use client";

import { useState } from "react";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { formatTimeRange } from "@/lib/time";
import type { MeetingRoom, Reservation } from "@/types";
import type { ToastType } from "@/hooks/useToast";

interface ReservationDetailModalProps {
  reservation: Reservation;
  room?: MeetingRoom;
  onClose: () => void;
  onCancel: (id: string) => Promise<{ ok: boolean; message?: string }>;
  showToast: (type: ToastType, message: string) => void;
}

export function ReservationDetailModal({
  reservation,
  room,
  onClose,
  onCancel,
  showToast,
}: ReservationDetailModalProps) {
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleCancel = async () => {
    if (submitting) return;
    setSubmitting(true);
    const result = await onCancel(reservation.id);
    setSubmitting(false);
    if (result.ok) {
      showToast("success", "예약이 취소되었습니다.");
      onClose();
    } else {
      showToast("error", result.message ?? "일시적인 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <Modal title="예약 상세" onClose={onClose}>
      <dl className="space-y-3">
        <Row icon="📌" label="회의 제목">
          {reservation.meeting_title}
        </Row>
        <Row icon="🧑" label="예약자">
          {reservation.reserver_name}
        </Row>
        <Row icon="🏠" label="회의실">
          {room ? `회의실 ${room.room_number} (${room.room_name})` : "회의실"}
        </Row>
        <Row icon="🕘" label="시간">
          <span className="tabular-nums">
            {formatTimeRange(reservation.start_time, reservation.end_time)}
          </span>
        </Row>
      </dl>

      <div className="mt-6">
        {!confirming ? (
          <div className="flex justify-end">
            <Button variant="danger" onClick={() => setConfirming(true)}>
              예약 취소
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border border-error/30 bg-[#FEF2F2] p-3">
            <p className="mb-3 text-[14px] text-body">정말 취소하시겠습니까?</p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setConfirming(false)} disabled={submitting}>
                아니요
              </Button>
              <Button variant="danger" onClick={handleCancel} loading={submitting}>
                {submitting ? "취소 중..." : "예, 취소합니다"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span aria-hidden className="mt-0.5 text-base">
        {icon}
      </span>
      <div>
        <dt className="text-[12px] text-muted">{label}</dt>
        <dd className="text-[15px] font-medium text-strong">{children}</dd>
      </div>
    </div>
  );
}
