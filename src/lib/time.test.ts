import { describe, it, expect } from "vitest";
import {
  buildSlots,
  TOTAL_SLOTS,
  timeLabel,
  formatDateKey,
  parseDateKey,
  formatKoreanDate,
  formatClock,
  makeISO,
  addMinutesISO,
  getDayBounds,
  slotIndexOf,
  slotSpanOf,
  formatTimeRange,
  formatDuration,
  isoToTimeLabel,
  isSameLocalDate,
  nowSlotFraction,
} from "./time";
import { DURATION_OPTIONS, OPEN_HOUR, CLOSE_HOUR, SLOT_MINUTES } from "./constants";

// PRD 핵심 기능별 단위 테스트.
// 시간 유틸은 로컬 타임존 기준으로 동작하므로, 절대 ISO 문자열 비교 대신
// 왕복(round-trip) 속성으로 검증해 CI 타임존에 영향받지 않도록 한다.

describe("예약 현황 보드 - 슬롯 그리드 (PRD 2.1)", () => {
  it("운영시간 09:00~18:00, 30분 단위로 18개 슬롯을 생성한다", () => {
    const slots = buildSlots();
    expect(slots).toHaveLength(18);
    expect(TOTAL_SLOTS).toBe(18);
    expect((CLOSE_HOUR - OPEN_HOUR) * (60 / SLOT_MINUTES)).toBe(18);
  });

  it("첫 슬롯은 09:00, 마지막 슬롯은 17:30 이다", () => {
    const slots = buildSlots();
    expect(slots[0].label).toBe("09:00");
    expect(slots[0].index).toBe(0);
    expect(slots[17].label).toBe("17:30");
    expect(slots[17].index).toBe(17);
  });

  it("슬롯 인덱스는 연속적이며 30분 간격 라벨을 가진다", () => {
    const slots = buildSlots();
    expect(slots[1].label).toBe("09:30");
    expect(slots[2].label).toBe("10:00");
    slots.forEach((s, i) => expect(s.index).toBe(i));
  });

  it("slotIndexOf 는 시작 시각을 올바른 슬롯 인덱스로 매핑한다", () => {
    expect(slotIndexOf(makeISO("2026-07-14", 9, 0))).toBe(0);
    expect(slotIndexOf(makeISO("2026-07-14", 9, 30))).toBe(1);
    expect(slotIndexOf(makeISO("2026-07-14", 10, 0))).toBe(2);
    expect(slotIndexOf(makeISO("2026-07-14", 17, 30))).toBe(17);
  });

  it("slotSpanOf 는 예약 길이를 슬롯 span 으로 계산한다 (최소 1)", () => {
    const start = makeISO("2026-07-14", 10, 0);
    expect(slotSpanOf(start, addMinutesISO(start, 30))).toBe(1); // 30분 → 1슬롯
    expect(slotSpanOf(start, addMinutesISO(start, 60))).toBe(2); // 1시간 → 2슬롯
    expect(slotSpanOf(start, addMinutesISO(start, 120))).toBe(4); // 2시간 → 4슬롯
  });
});

describe("예약 생성 - 시간 계산 (PRD 2.2)", () => {
  it("이용 시간 선택지는 30분/1시간/1시간30분/2시간 이다", () => {
    expect(DURATION_OPTIONS.map((o) => o.minutes)).toEqual([30, 60, 90, 120]);
    expect(DURATION_OPTIONS.map((o) => o.label)).toEqual([
      "30분",
      "1시간",
      "1시간 30분",
      "2시간",
    ]);
  });

  it("makeISO + addMinutesISO 로 종료 시각을 자동 계산한다", () => {
    const start = makeISO("2026-07-14", 14, 0);
    const end = addMinutesISO(start, 90);
    // 90분 차이
    expect(new Date(end).getTime() - new Date(start).getTime()).toBe(90 * 60_000);
    // 로컬 시각으로 15:30 이 되어야 한다
    expect(isoToTimeLabel(end)).toBe("15:30");
  });

  it("formatTimeRange 는 '시작 ~ 종료 (기간)' 형식을 만든다", () => {
    const start = makeISO("2026-07-14", 10, 0);
    const end = addMinutesISO(start, 60);
    expect(formatTimeRange(start, end)).toBe("10:00 ~ 11:00 (1시간)");
  });

  it("각 이용 시간 선택지가 올바른 종료 라벨을 만든다", () => {
    const start = makeISO("2026-07-14", 9, 0);
    const expected: Record<number, string> = {
      30: "09:30",
      60: "10:00",
      90: "10:30",
      120: "11:00",
    };
    for (const { minutes } of DURATION_OPTIONS) {
      expect(isoToTimeLabel(addMinutesISO(start, minutes))).toBe(expected[minutes]);
    }
  });
});

describe("예약 시간 표기 - formatDuration / timeLabel", () => {
  it("timeLabel 은 두 자리 zero-pad 를 적용한다", () => {
    expect(timeLabel(9, 0)).toBe("09:00");
    expect(timeLabel(17, 30)).toBe("17:30");
  });

  it("formatDuration 은 분/시간/시간+분을 한국어로 표기한다", () => {
    expect(formatDuration(30)).toBe("30분");
    expect(formatDuration(60)).toBe("1시간");
    expect(formatDuration(90)).toBe("1시간 30분");
    expect(formatDuration(120)).toBe("2시간");
  });
});

describe("날짜 네비게이션 (PRD 2.x / 헤더)", () => {
  it("formatDateKey ↔ parseDateKey 왕복이 보존된다", () => {
    const key = "2026-07-14";
    expect(formatDateKey(parseDateKey(key))).toBe(key);
  });

  it("formatDateKey 는 zero-pad 된 yyyy-MM-dd 를 만든다", () => {
    expect(formatDateKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("formatKoreanDate 는 요일 포함 한국어 날짜를 만든다", () => {
    // 2026-07-14 는 화요일
    expect(formatKoreanDate(parseDateKey("2026-07-14"))).toBe("2026.07.14 (화)");
  });

  it("getDayBounds 는 하루 경계(24시간)를 반환한다", () => {
    const { startISO, endISO } = getDayBounds("2026-07-14");
    expect(new Date(endISO).getTime() - new Date(startISO).getTime()).toBe(
      24 * 60 * 60_000
    );
    // 시작 경계는 해당 날짜 슬롯 조회의 하한
    expect(formatDateKey(new Date(startISO))).toBe("2026-07-14");
  });

  it("isSameLocalDate 는 같은 로컬 날짜를 구분한다", () => {
    const a = new Date(2026, 6, 14, 9, 0);
    const b = new Date(2026, 6, 14, 23, 59);
    const c = new Date(2026, 6, 15, 0, 1);
    expect(isSameLocalDate(a, b)).toBe(true);
    expect(isSameLocalDate(a, c)).toBe(false);
  });
});

describe("현재 시각 강조 (PRD 2.1 - 현재 시간 라인)", () => {
  it("formatClock 은 오전/오후 12시간제로 표기한다", () => {
    expect(formatClock(new Date(2026, 6, 14, 9, 5))).toBe("오전 9:05");
    expect(formatClock(new Date(2026, 6, 14, 14, 30))).toBe("오후 2:30");
    expect(formatClock(new Date(2026, 6, 14, 0, 0))).toBe("오전 12:00");
    expect(formatClock(new Date(2026, 6, 14, 12, 0))).toBe("오후 12:00");
  });

  it("nowSlotFraction 은 운영시간 내에서 소수 슬롯 위치를 반환한다", () => {
    expect(nowSlotFraction(new Date(2026, 6, 14, 9, 0))).toBe(0);
    expect(nowSlotFraction(new Date(2026, 6, 14, 10, 0))).toBe(2);
    expect(nowSlotFraction(new Date(2026, 6, 14, 9, 15))).toBe(0.5);
  });

  it("nowSlotFraction 은 운영시간 밖이면 null 을 반환한다", () => {
    expect(nowSlotFraction(new Date(2026, 6, 14, 8, 0))).toBeNull();
    expect(nowSlotFraction(new Date(2026, 6, 14, 20, 0))).toBeNull();
  });
});
