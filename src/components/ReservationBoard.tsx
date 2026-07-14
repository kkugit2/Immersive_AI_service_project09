"use client";

import { useEffect, useState } from "react";
import type { MeetingRoom, Reservation, SlotSelection } from "@/types";
import {
  buildSlots,
  TOTAL_SLOTS,
  slotIndexOf,
  slotSpanOf,
  isoToTimeLabel,
  isSameLocalDate,
  nowSlotFraction,
  parseDateKey,
} from "@/lib/time";

const HEADER_H = 44;
const SLOT_H = 48;

interface ReservationBoardProps {
  dateKey: string;
  rooms: MeetingRoom[];
  reservations: Reservation[];
  loading: boolean;
  onSelectSlot: (sel: SlotSelection) => void;
  onSelectReservation: (r: Reservation) => void;
}

export function ReservationBoard({
  dateKey,
  rooms,
  reservations,
  loading,
  onSelectSlot,
  onSelectReservation,
}: ReservationBoardProps) {
  const slots = buildSlots();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const boardDate = parseDateKey(dateKey);
  const isToday = now ? isSameLocalDate(boardDate, now) : false;
  const nowFrac = isToday && now ? nowSlotFraction(now) : null;

  // 점유 맵 + 예약 블록 계산
  const occupied = new Set<string>();
  const blocks: { room: MeetingRoom; res: Reservation; startIdx: number; span: number }[] = [];
  const roomIndex = new Map(rooms.map((r, i) => [r.id, i]));

  for (const res of reservations) {
    if (res.status !== "confirmed" || !roomIndex.has(res.room_id)) continue;
    let startIdx = slotIndexOf(res.start_time);
    let span = slotSpanOf(res.start_time, res.end_time);
    if (startIdx < 0) {
      span += startIdx;
      startIdx = 0;
    }
    if (startIdx + span > TOTAL_SLOTS) span = TOTAL_SLOTS - startIdx;
    if (span <= 0) continue;
    const room = rooms.find((r) => r.id === res.room_id)!;
    blocks.push({ room, res, startIdx, span });
    for (let i = startIdx; i < startIdx + span; i++) occupied.add(`${res.room_id}:${i}`);
  }

  const gridTemplateColumns = `64px repeat(${rooms.length}, minmax(112px, 1fr))`;
  const gridTemplateRows = `${HEADER_H}px repeat(${TOTAL_SLOTS}, ${SLOT_H}px)`;

  return (
    <section className="rounded-xl border border-edge bg-white shadow-card">
      {/* 범례 */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 text-[13px] text-muted sm:px-5">
        <LegendItem swatchClass="bg-available-bg border border-available-border" label="빈자리" />
        <LegendItem swatchClass="bg-booked-bg border border-booked-border" label="예약됨" />
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0 w-5 border-t-2 border-now" aria-hidden />
          현재 시각
        </span>
        <span className="ml-auto hidden text-[12px] text-muted sm:inline">
          빈 셀을 클릭해 예약하세요
        </span>
      </div>

      <div className="px-4 pb-1 text-[12px] text-muted sm:hidden">← 좌우로 스크롤</div>

      <div className="overflow-x-auto rounded-b-xl">
        <div
          className="relative grid min-w-max"
          style={{ gridTemplateColumns, gridTemplateRows }}
          role="grid"
          aria-label="회의실 예약 현황 보드"
        >
          {/* 좌상단 코너 */}
          <div
            className="sticky left-0 top-0 z-30 border-b border-r border-edge bg-white"
            style={{ gridColumn: 1, gridRow: 1 }}
          />

          {/* 회의실 헤더 (sticky-top) */}
          {rooms.map((room, i) => (
            <div
              key={room.id}
              className="sticky top-0 z-20 flex items-center justify-center border-b border-r border-edge bg-white px-2 text-center text-[13px] font-semibold text-strong"
              style={{ gridColumn: i + 2, gridRow: 1 }}
              title={`${room.room_name} · 정원 ${room.capacity}명`}
            >
              <span className="truncate">회의실 {room.room_number}</span>
            </div>
          ))}

          {/* 시간 라벨 (sticky-left) */}
          {slots.map((slot) => (
            <div
              key={`t-${slot.index}`}
              className="sticky left-0 z-10 flex items-start justify-end border-b border-r border-edge bg-white px-2 pt-1 text-[12px] text-muted tabular-nums"
              style={{ gridColumn: 1, gridRow: slot.index + 2 }}
            >
              {slot.label}
            </div>
          ))}

          {/* 빈 셀 (클릭 가능) */}
          {rooms.map((room, colIdx) =>
            slots.map((slot) => {
              if (occupied.has(`${room.id}:${slot.index}`)) return null;
              const slotDate = parseDateKey(dateKey);
              slotDate.setHours(slot.hour, slot.minute, 0, 0);
              const isPast = !!(now && isToday && slotDate.getTime() < now.getTime());
              return (
                <button
                  key={`e-${room.id}-${slot.index}`}
                  type="button"
                  role="gridcell"
                  disabled={isPast}
                  onClick={() => onSelectSlot({ room, date: dateKey, slotTime: slot.label })}
                  aria-label={`회의실 ${room.room_number}, ${slot.label}, 예약 가능`}
                  className={`group m-px flex items-center justify-center rounded-cell border border-transparent text-[12px] transition-colors duration-[120ms] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 motion-reduce:transition-none ${
                    isPast
                      ? "cursor-not-allowed bg-disabledcell-bg text-disabledcell-text"
                      : "cursor-pointer bg-available-bg text-available-text hover:bg-available-hover"
                  }`}
                  style={{ gridColumn: colIdx + 2, gridRow: slot.index + 2 }}
                >
                  {!isPast && (
                    <span className="opacity-0 transition-opacity group-hover:opacity-100 motion-reduce:transition-none">
                      + 예약
                    </span>
                  )}
                </button>
              );
            })
          )}

          {/* 예약 블록 */}
          {blocks.map(({ room, res, startIdx, span }) => {
            const colIdx = roomIndex.get(room.id)!;
            const timeRange = `${isoToTimeLabel(res.start_time)}~${isoToTimeLabel(res.end_time)}`;
            return (
              <button
                key={res.id}
                type="button"
                role="gridcell"
                onClick={() => onSelectReservation(res)}
                aria-label={`회의실 ${room.room_number}, ${timeRange}, ${res.meeting_title}, ${res.reserver_name} 예약`}
                title={`${res.meeting_title} · ${res.reserver_name} · ${timeRange}`}
                className="z-[5] m-px flex flex-col justify-start overflow-hidden rounded-cell border border-booked-border bg-booked-bg px-2 py-1 text-left transition-[filter] duration-[120ms] hover:brightness-[1.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 motion-reduce:transition-none"
                style={{ gridColumn: colIdx + 2, gridRow: `${startIdx + 2} / span ${span}` }}
              >
                <span className="truncate text-[13px] font-medium leading-[18px] text-booked-text">
                  {res.meeting_title}
                </span>
                <span className="truncate text-[12px] leading-4 text-booked-text/80">
                  {res.reserver_name}
                </span>
                {span > 1 && (
                  <span className="mt-auto truncate text-[11px] leading-4 text-booked-text/70 tabular-nums">
                    {timeRange}
                  </span>
                )}
              </button>
            );
          })}

          {/* 현재 시각 라인 */}
          {nowFrac !== null && now && (
            <div
              className="pointer-events-none absolute left-0 right-0 z-40 flex items-center"
              style={{ top: HEADER_H + nowFrac * SLOT_H }}
            >
              <span className="sticky left-0 z-10 -translate-y-1/2 rounded-r bg-now px-1 text-[11px] font-semibold text-white tabular-nums">
                {`${pad(now.getHours())}:${pad(now.getMinutes())}`}
              </span>
              <span className="h-0.5 flex-1 -translate-y-[1px] bg-now" aria-hidden />
            </div>
          )}

          {/* 로딩 스켈레톤 */}
          {loading && (
            <div
              className="absolute inset-0 z-50 animate-pulse bg-white/70 motion-reduce:animate-none"
              style={{ top: HEADER_H }}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function LegendItem({ swatchClass, label }: { swatchClass: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`inline-block h-3.5 w-3.5 rounded-sm ${swatchClass}`} aria-hidden />
      {label}
    </span>
  );
}
