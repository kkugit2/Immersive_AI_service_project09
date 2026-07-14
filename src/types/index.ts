import type { ReservationStatus } from "@/lib/database.types";

export type { ReservationStatus };

export interface MeetingRoom {
  id: string;
  room_number: number;
  room_name: string;
  capacity: number;
}

export interface Reservation {
  id: string;
  room_id: string;
  reserver_name: string;
  meeting_title: string;
  start_time: string; // ISO
  end_time: string; // ISO
  status: ReservationStatus;
}

// 새 예약 생성 폼 입력
export interface NewReservationInput {
  room_id: string;
  reserver_name: string;
  meeting_title: string;
  start_time: string; // ISO
  end_time: string; // ISO
}

// 보드 셀에서 클릭한 슬롯 정보 (예약 생성 모달로 전달)
export interface SlotSelection {
  room: MeetingRoom;
  date: string; // yyyy-MM-dd
  slotTime: string; // HH:mm (시작 시간)
}
