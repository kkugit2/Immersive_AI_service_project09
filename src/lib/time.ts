import { OPEN_HOUR, CLOSE_HOUR, SLOT_MINUTES } from "./constants";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export interface Slot {
  index: number; // 0-based slot index from OPEN_HOUR
  hour: number;
  minute: number;
  label: string; // "09:00"
}

/** 운영 시간 내 시작 시간 슬롯 목록 (09:00 ~ 17:30, 30분 단위) */
export function buildSlots(): Slot[] {
  const slots: Slot[] = [];
  let index = 0;
  for (let h = OPEN_HOUR; h < CLOSE_HOUR; h++) {
    for (let m = 0; m < 60; m += SLOT_MINUTES) {
      slots.push({ index, hour: h, minute: m, label: timeLabel(h, m) });
      index++;
    }
  }
  return slots;
}

export const TOTAL_SLOTS = (CLOSE_HOUR - OPEN_HOUR) * (60 / SLOT_MINUTES);

export function timeLabel(hour: number, minute: number): string {
  return `${pad(hour)}:${pad(minute)}`;
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

/** Date → 'yyyy-MM-dd' (로컬 기준) */
export function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** 'yyyy-MM-dd' → 로컬 자정 Date */
export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** 헤더용 한국어 날짜: "2026.07.14 (월)" */
export function formatKoreanDate(date: Date): string {
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(
    date.getDate()
  )} (${WEEKDAYS[date.getDay()]})`;
}

/** 현재 시각 표기: "오후 2:30" */
export function formatClock(date: Date): string {
  let h = date.getHours();
  const m = date.getMinutes();
  const ampm = h < 12 ? "오전" : "오후";
  h = h % 12;
  if (h === 0) h = 12;
  return `${ampm} ${h}:${pad(m)}`;
}

/** 날짜 키 + 시/분 → 로컬 Date → ISO 문자열 */
export function makeISO(dateKey: string, hour: number, minute: number): string {
  const base = parseDateKey(dateKey);
  base.setHours(hour, minute, 0, 0);
  return base.toISOString();
}

/** ISO 시각에 분 추가 → ISO */
export function addMinutesISO(iso: string, minutes: number): string {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}

/** 하루 조회 경계 (해당 날짜 로컬 00:00 ~ 다음날 00:00) */
export function getDayBounds(dateKey: string): { startISO: string; endISO: string } {
  const start = parseDateKey(dateKey);
  const end = new Date(start.getTime());
  end.setDate(end.getDate() + 1);
  return { startISO: start.toISOString(), endISO: end.toISOString() };
}

/** ISO 시각 → 로컬 슬롯 인덱스 (운영시간 밖이면 경계로 클램프) */
export function slotIndexOf(iso: string): number {
  const d = new Date(iso);
  const minutesFromOpen = (d.getHours() - OPEN_HOUR) * 60 + d.getMinutes();
  return Math.round(minutesFromOpen / SLOT_MINUTES);
}

/** 예약이 차지하는 슬롯 span (최소 1) */
export function slotSpanOf(startISO: string, endISO: string): number {
  const startIdx = slotIndexOf(startISO);
  const endIdx = slotIndexOf(endISO);
  return Math.max(1, endIdx - startIdx);
}

/** "10:00 ~ 11:00 (1시간)" */
export function formatTimeRange(startISO: string, endISO: string): string {
  const s = new Date(startISO);
  const e = new Date(endISO);
  const durMin = Math.round((e.getTime() - s.getTime()) / 60_000);
  return `${timeLabel(s.getHours(), s.getMinutes())} ~ ${timeLabel(
    e.getHours(),
    e.getMinutes()
  )} (${formatDuration(durMin)})`;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}분`;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
}

/** ISO → "HH:mm" (로컬) */
export function isoToTimeLabel(iso: string): string {
  const d = new Date(iso);
  return timeLabel(d.getHours(), d.getMinutes());
}

/** 두 날짜가 같은 로컬 날짜인지 */
export function isSameLocalDate(a: Date, b: Date): boolean {
  return formatDateKey(a) === formatDateKey(b);
}

/** 현재 시각의 소수 슬롯 위치 (그리드 라인 배치용, 운영시간 기준 0~TOTAL_SLOTS) */
export function nowSlotFraction(now: Date): number | null {
  const minutesFromOpen = (now.getHours() - OPEN_HOUR) * 60 + now.getMinutes();
  const frac = minutesFromOpen / SLOT_MINUTES;
  if (frac < 0 || frac > TOTAL_SLOTS) return null;
  return frac;
}
