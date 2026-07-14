# CLAUDE.md — Immersive_AI_service_project09 (회의실 예약 시스템)

> 본 문서는 프로젝트의 **현재 시점 최신 규칙/스펙**만 담는 Living Document 입니다.
> 변경 이력은 git 커밋 히스토리가 담당하므로 이 문서에 과거 내용을 누적하지 않습니다.
> README.md 는 배포 관리 서브에이전트 전담 문서이므로 본 에이전트는 수정하지 않습니다.

---

## 프로젝트 개요

직관적인 그리드 UI로 회의실 예약 현황을 실시간 확인하고, 빈 시간대를 클릭해 즉시 예약하는 웹 기반 회의실 예약 시스템.
- 핵심 가치: 즉시성(클릭 예약) · 가시성(한 화면 현황) · 간편성(3클릭 이내 예약).

## 기술 스택

- **프레임워크**: Next.js 15 (App Router) + React 19 + TypeScript
- **스타일**: Tailwind CSS v3, 시맨틱 컬러 토큰 사용
- **상태관리**: React Hooks (useState/useEffect) + 커스텀 훅
- **백엔드/DB**: Supabase (PostgreSQL) — `@supabase/supabase-js`
- **실시간**: Supabase Realtime 구독
- **폰트**: Pretendard (CDN), 시스템 폰트 폴백
- **배포**: Vercel (배포는 test-deploy-manager 서브에이전트 담당)

## 전역 코딩 컨벤션

- 언어: TypeScript strict. 컴포넌트는 함수형 + 명시적 props 타입.
- 파일/디렉터리: `src/` 하위. 컴포넌트 PascalCase(`ReservationBoard.tsx`), 훅 camelCase(`useReservations.ts`), 유틸 camelCase.
- 클라이언트 컴포넌트는 파일 상단에 `'use client'` 명시.
- Supabase 접근은 `src/lib/supabase.ts` 단일 클라이언트를 통해서만.
- DB 타입은 `src/lib/database.types.ts` 에 정의하고 도메인 타입은 `src/types/` 에 둔다.
- 시간/날짜 유틸은 `src/lib/time.ts` 로 일원화 (슬롯 계산, 병합, 포맷).
- 컬러/스타일은 하드코딩 대신 `tailwind.config.ts` 의 시맨틱 토큰 사용.
- 환경변수: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (`.env.local`).
- 사용자 노출 문자열은 한국어.

---

## PRD 반영 사항

> 출처: `PRD.md` (최신 기준으로 아래 섹션 전체를 덮어씀)

### 핵심 기능
1. **예약 현황 보드**: 시간대(행) × 회의실 1~6번(열) 그리드.
   - 상태 색상 구분: 빈 시간대(밝은 녹색, 클릭 가능) / 예약됨(파란색, 예약자·목적 표시) / 현재 시간(빨간 라인 강조).
   - 셀/블록에 예약자명, 회의 제목, 시간 범위 표시.
2. **예약 생성**: 빈 셀 클릭 → 모달 → 예약자명·회의 목적 입력, 회의실·날짜·시작시간 자동 채움, 이용 시간(30분 단위) 선택 → 예약 완료.
3. **예약 취소**: 예약 블록 클릭 → 상세 모달 → 취소 시 `status: cancelled` 처리.
4. **날짜 네비게이션**: 헤더에서 날짜 이동, 날짜별 현황 조회.
5. **실시간 UI 업데이트**: Supabase Realtime 으로 다중 사용자 반영.

### 데이터 모델 (Supabase / PostgreSQL)
- **meeting_rooms**: `id` (UUID PK), `room_number` (int 1-6, unique), `room_name` (text), `capacity` (int), `created_at` (timestamptz), `updated_at` (timestamptz).
- **reservations**: `id` (UUID PK), `room_id` (UUID FK → meeting_rooms.id), `reserver_name` (text), `meeting_title` (text), `start_time` (timestamptz), `end_time` (timestamptz), `status` (enum `confirmed`|`cancelled`, 기본 `confirmed`), `created_at` (timestamptz), `updated_at` (timestamptz).
- 관계: 회의실 1 : N 예약.
- 초기 데이터: 회의실 1~6번 + 초기 예약 목록(`meetingroom_reservations.xlsx`). 상태 매핑 `확정→confirmed`, `취소→cancelled`.

### 운영 규칙
- 시간 단위 기본 30분, 운영 시간 09:00~18:00 (18 슬롯).
- 예약 충돌 방지: 동일 회의실·겹치는 시간대(confirmed) 중복 예약 차단.
- 조회는 confirmed 상태 위주로 보드에 표시(취소 예약은 빈 셀 취급).
- MVP 단계에서 인증 없음(Phase 2 예정). RLS 는 익명 read/insert/update 허용 정책.

### 성공 지표
- 예약까지 3클릭 이내, 전체 현황 한 화면 확인, 반응 < 1초, 모바일 사용 가능.

---

## UI/UX 가이드라인 반영 사항

> 출처: `UI-DESIGN.md` (최신 기준으로 아래 섹션 전체를 덮어씀)

### 컨셉
"빈 자리가 한눈에 보이고, 클릭 한 번으로 잡는다" — Clean / Trustworthy / Efficient. 명확성 > 심미성 > 화려함.

### 컬러 토큰 (tailwind theme.extend.colors 등록)
- primary: 600 `#2563EB`, 700 `#1D4ED8`, 500 `#3B82F6`, 50 `#EFF6FF`.
- 상태(보드 셀): available bg `#F0FDF4`/border `#BBF7D0`/text `#166534`, availableHover `#DCFCE7`; booked bg `#DBEAFE`/border `#93C5FD`/text `#1E40AF`; disabled bg `#F3F4F6`/text `#9CA3AF`; now line `#EF4444`.
- neutral: bg-base `#FFFFFF`, bg-subtle `#F9FAFB`, border `#E5E7EB`, text-strong `#111827`, text-body `#374151`, text-muted `#6B7280`.
- feedback: success `#16A34A`, error `#DC2626`, warning `#D97706`, info `#2563EB`.

### 타이포그래피
- Pretendard(CDN) + 시스템 폴백. 시간 숫자 `tabular-nums`.
- Display 24/32 700, H1 20/28 700, H2 18/26 600, Body 14/20 400, Label 13/18 500, Caption 12/16 400, Button 14/20 600.

### 레이아웃 / 컴포넌트
- **헤더**(64px sticky): 서비스명+아이콘 / 중앙 날짜 네비게이터(◀ 날짜 ▶, 오늘 뱃지) / 우측 현재 시각(1분 갱신).
- **보드**: 좌측 시간축 열 sticky-left(64px), 상단 회의실 헤더 sticky-top. 셀 최소 44px 높이·120px 폭(태블릿 100px, 모바일 88px). 연속 예약 rowspan 병합. 오늘 보드에만 현재 시각 빨간 라인. 카드 상단 범례.
- **예약 생성 모달**: 회의실·날짜 읽기전용 배지, 예약자명·회의목적 필수, 시작시간·이용시간(30분/1시간/1시간30분/2시간) 드롭다운, 종료시각 자동표시. 충돌 시 에러. ✕/오버레이/ESC 닫기, 포커스 트랩.
- **예약 상세 모달**: 제목·예약자·회의실·시간, Danger 스타일 "예약 취소" + 확인 다이얼로그.
- **버튼**: Primary/Secondary/Danger, 높이 40px, radius 8px, focus 시 primary-500 2px 링.
- **입력/셀렉트**: 높이 40px, radius 8px, focus/error/disabled 상태 스타일.
- **토스트**: 우측상단(데스크톱)/상단중앙(모바일), 좌측 4px 컬러바, 3초 자동 소멸, 세로 스택.

### 반응형
- 데스크톱 ≥1024: 최대폭 1280px, 좌우 32px, 전체 그리드.
- 태블릿 768~1023: 셀 폭 축소 + 가로 스크롤, 좌우 24px.
- 모바일 <768: A안(가로 스크롤 그리드) 기본, 시간열 sticky-left, 모달은 하단 시트, 헤더 2줄.

### 인터랙션 / 접근성
- 호버: 빈 셀 `#DCFCE7`+`+ 예약` 힌트, 예약 블록 툴팁 미리보기. transition 120ms.
- 애니메이션 120~200ms, `prefers-reduced-motion` 존중(0ms).
- WCAG 2.1 AA: 대비 4.5:1+, 색+텍스트 병행, 터치 44px, 키보드 내비(Tab/Enter/ESC), 셀 `aria-label`, 토스트 `role=status`/에러 `role=alert`, 포커스 링 유지.

---

## 기능 인덱스

| 기능 | 위치 | 설명 |
|------|------|------|
| Supabase 클라이언트 | `src/lib/supabase.ts` | 단일 브라우저 클라이언트 |
| DB/도메인 타입 | `src/lib/database.types.ts`, `src/types/index.ts` | 테이블 및 도메인 타입 |
| 시간 유틸 | `src/lib/time.ts` | 슬롯 생성·매핑·병합·포맷 |
| 예약 데이터 훅 | `src/hooks/useReservations.ts` | 날짜별 조회·생성·취소·Realtime 구독 |
| 토스트 훅 | `src/hooks/useToast.tsx` | 토스트 상태/렌더 |
| 헤더 | `src/components/Header.tsx` | 서비스명·날짜 네비게이터·현재 시각 |
| 예약 현황 보드 | `src/components/ReservationBoard.tsx` | 시간×회의실 그리드, 셀/블록/현재시각 라인 |
| 예약 생성 모달 | `src/components/ReservationModal.tsx` | 신규 예약 폼 |
| 예약 상세 모달 | `src/components/ReservationDetailModal.tsx` | 상세 보기·취소 |
| 공통 UI | `src/components/ui/` | Button, Modal, Toast 등 |
| 메인 페이지 | `src/app/page.tsx` | 보드 조립, 상태 오케스트레이션 |
