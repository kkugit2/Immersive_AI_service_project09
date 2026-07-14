"use client";

import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { InstallBanner } from "@/components/InstallBanner";
import { OfflineBanner } from "@/components/OfflineBanner";
import { ReservationBoard } from "@/components/ReservationBoard";
import { ReservationModal } from "@/components/ReservationModal";
import { ReservationDetailModal } from "@/components/ReservationDetailModal";
import { useReservations } from "@/hooks/useReservations";
import { useToast } from "@/hooks/useToast";
import { formatDateKey } from "@/lib/time";
import type { Reservation, SlotSelection } from "@/types";

export default function Home() {
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const dateKey = useMemo(() => formatDateKey(currentDate), [currentDate]);

  const { rooms, reservations, loading, error, createReservation, cancelReservation } =
    useReservations(dateKey);
  const { showToast } = useToast();

  const [selection, setSelection] = useState<SlotSelection | null>(null);
  const [detail, setDetail] = useState<Reservation | null>(null);

  const shiftDay = (delta: number) => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + delta);
      return next;
    });
  };

  const detailRoom = detail ? rooms.find((r) => r.id === detail.room_id) : undefined;

  return (
    <div className="min-h-screen">
      <Header
        currentDate={currentDate}
        onPrevDay={() => shiftDay(-1)}
        onNextDay={() => shiftDay(1)}
        onToday={() => setCurrentDate(new Date())}
      />

      <InstallBanner />
      <OfflineBanner />

      <main className="mx-auto max-w-[1280px] px-4 py-4 sm:px-8 sm:py-6">
        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-error/30 bg-[#FEF2F2] px-4 py-3 text-[14px] text-error"
          >
            데이터를 불러오지 못했습니다. Supabase 연결(.env.local)을 확인해주세요. ({error})
          </div>
        )}

        <ReservationBoard
          dateKey={dateKey}
          rooms={rooms}
          reservations={reservations}
          loading={loading}
          onSelectSlot={setSelection}
          onSelectReservation={setDetail}
        />
      </main>

      {selection && (
        <ReservationModal
          selection={selection}
          onClose={() => setSelection(null)}
          onCreate={createReservation}
          showToast={showToast}
        />
      )}

      {detail && (
        <ReservationDetailModal
          reservation={detail}
          room={detailRoom}
          onClose={() => setDetail(null)}
          onCancel={cancelReservation}
          showToast={showToast}
        />
      )}
    </div>
  );
}
