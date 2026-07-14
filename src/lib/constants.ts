// 운영 시간 및 슬롯 설정 (PRD: 09:00~18:00, 30분 단위)
export const OPEN_HOUR = 9;
export const CLOSE_HOUR = 18;
export const SLOT_MINUTES = 30;

// 이용 시간 선택지 (분)
export const DURATION_OPTIONS: { label: string; minutes: number }[] = [
  { label: "30분", minutes: 30 },
  { label: "1시간", minutes: 60 },
  { label: "1시간 30분", minutes: 90 },
  { label: "2시간", minutes: 120 },
];
