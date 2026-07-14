-- Seed: meeting_rooms (rooms 1~6)
insert into public.meeting_rooms (room_number, room_name, capacity) values
  (1, '1번 회의실 (소회의실 A)', 4),
  (2, '2번 회의실 (소회의실 B)', 4),
  (3, '3번 회의실 (중회의실 A)', 8),
  (4, '4번 회의실 (중회의실 B)', 8),
  (5, '5번 회의실 (대회의실)', 16),
  (6, '6번 회의실 (스튜디오)', 6)
on conflict (room_number) do update set room_name = excluded.room_name, capacity = excluded.capacity;

-- Seed: reservations (from meetingroom_reservations.xlsx)
-- 원본 데이터에는 legacy 중복 예약 1건이 존재하므로, 이력 데이터 적재 동안 겹침 방지 트리거를 잠시 비활성화한다.
alter table public.reservations disable trigger trg_reservations_no_overlap;

insert into public.reservations (room_id, reserver_name, meeting_title, start_time, end_time, status) values
  ((select id from public.meeting_rooms where room_number = 3), '박도윤', '주간 팀 회의', '2026-07-13 16:00:00+09', '2026-07-13 18:00:00+09', 'confirmed'),
  ((select id from public.meeting_rooms where room_number = 3), '임지호', '고객사 화상 미팅', '2026-07-14 09:00:00+09', '2026-07-14 10:00:00+09', 'confirmed'),
  ((select id from public.meeting_rooms where room_number = 4), '조유나', '채용 면접', '2026-07-13 16:00:00+09', '2026-07-13 18:00:00+09', 'cancelled'),
  ((select id from public.meeting_rooms where room_number = 1), '권민재', '신규 프로젝트 킥오프', '2026-07-14 09:00:00+09', '2026-07-14 10:00:00+09', 'cancelled'),
  ((select id from public.meeting_rooms where room_number = 1), '최지우', '고객사 화상 미팅', '2026-07-19 11:00:00+09', '2026-07-19 12:00:00+09', 'confirmed'),
  ((select id from public.meeting_rooms where room_number = 4), '박도윤', '신규 프로젝트 킥오프', '2026-07-17 14:00:00+09', '2026-07-17 15:00:00+09', 'confirmed'),
  ((select id from public.meeting_rooms where room_number = 1), '임지호', '채용 면접', '2026-07-15 10:00:00+09', '2026-07-15 11:00:00+09', 'confirmed'),
  ((select id from public.meeting_rooms where room_number = 5), '김민준', '채용 면접', '2026-07-16 16:00:00+09', '2026-07-16 18:00:00+09', 'cancelled'),
  ((select id from public.meeting_rooms where room_number = 3), '윤예준', '워크숍 준비 회의', '2026-07-15 14:00:00+09', '2026-07-15 15:00:00+09', 'confirmed'),
  ((select id from public.meeting_rooms where room_number = 2), '오준서', '신규 프로젝트 킥오프', '2026-07-17 14:00:00+09', '2026-07-17 15:00:00+09', 'cancelled'),
  ((select id from public.meeting_rooms where room_number = 3), '오준서', '분기 실적 보고', '2026-07-17 10:00:00+09', '2026-07-17 11:00:00+09', 'confirmed'),
  ((select id from public.meeting_rooms where room_number = 5), '조유나', '제품 기획 리뷰', '2026-07-14 16:00:00+09', '2026-07-14 17:00:00+09', 'cancelled'),
  ((select id from public.meeting_rooms where room_number = 1), '한소율', '고객사 화상 미팅', '2026-07-17 14:00:00+09', '2026-07-17 16:00:00+09', 'confirmed'),
  ((select id from public.meeting_rooms where room_number = 6), '강시우', '워크숍 준비 회의', '2026-07-17 16:00:00+09', '2026-07-17 17:00:00+09', 'confirmed'),
  ((select id from public.meeting_rooms where room_number = 1), '정하은', '신규 프로젝트 킥오프', '2026-07-13 14:00:00+09', '2026-07-13 15:00:00+09', 'cancelled'),
  ((select id from public.meeting_rooms where room_number = 3), '오준서', '제품 기획 리뷰', '2026-07-13 16:00:00+09', '2026-07-13 17:00:00+09', 'confirmed'),
  ((select id from public.meeting_rooms where room_number = 2), '임지호', '워크숍 준비 회의', '2026-07-13 13:00:00+09', '2026-07-13 14:00:00+09', 'confirmed'),
  ((select id from public.meeting_rooms where room_number = 2), '오준서', '화상 회의', '2026-07-16 16:00:00+09', '2026-07-16 17:00:00+09', 'confirmed'),
  ((select id from public.meeting_rooms where room_number = 2), '윤예준', '고객사 화상 미팅', '2026-07-15 11:00:00+09', '2026-07-15 12:00:00+09', 'cancelled'),
  ((select id from public.meeting_rooms where room_number = 5), '정하은', '화상 회의', '2026-07-15 15:00:00+09', '2026-07-15 16:00:00+09', 'confirmed'),
  ((select id from public.meeting_rooms where room_number = 2), '이서연', '거래처 미팅', '2026-07-14 13:00:00+09', '2026-07-14 14:00:00+09', 'confirmed'),
  ((select id from public.meeting_rooms where room_number = 4), '권민재', '거래처 미팅', '2026-07-15 14:00:00+09', '2026-07-15 15:00:00+09', 'confirmed'),
  ((select id from public.meeting_rooms where room_number = 2), '조유나', '제품 기획 리뷰', '2026-07-17 14:00:00+09', '2026-07-17 16:00:00+09', 'confirmed'),
  ((select id from public.meeting_rooms where room_number = 6), '권민재', '월간 전체 회의', '2026-07-18 09:00:00+09', '2026-07-18 10:00:00+09', 'cancelled'),
  ((select id from public.meeting_rooms where room_number = 6), '신아윤', '화상 회의', '2026-07-16 15:00:00+09', '2026-07-16 16:00:00+09', 'cancelled')
;

alter table public.reservations enable trigger trg_reservations_no_overlap;
