# 회의실 예약 시스템 (Meeting Room Reservation System)

직관적인 그리드 UI로 회의실 예약 현황을 실시간 확인하고, 빈 시간대를 클릭해 즉시 예약하는 웹 기반 회의실 예약 시스템입니다.

## 소개

여러 회의실의 예약 현황을 한 화면(시간 × 회의실 그리드)에서 확인하고, 빈 시간대를 클릭하는 것만으로 3클릭 이내에 예약을 완료할 수 있습니다. Supabase Realtime 을 통해 다른 사용자의 예약/취소가 즉시 화면에 반영됩니다.

- **즉시성**: 빈 시간대 클릭으로 바로 예약
- **가시성**: 전체 회의실 현황을 한눈에 확인
- **간편성**: 복잡한 절차 없는 빠른 예약

## 기능 목록

- **예약 현황 보드**: 시간대(행) × 회의실 1~6번(열) 그리드. 빈자리(녹색·클릭 가능) / 예약됨(파란색·예약자·제목 표시) / 오늘 보드의 현재 시각(빨간 라인) 구분.
- **예약 생성**: 빈 셀 클릭 → 모달에서 예약자명·회의 목적 입력, 회의실·날짜 자동 채움, 이용 시간(30분/1시간/1시간 30분/2시간) 선택 → 예약 완료.
- **예약 취소**: 예약 블록 클릭 → 상세 모달에서 취소(`status: cancelled` 처리).
- **날짜 네비게이션**: 헤더에서 이전/다음 날짜 이동 및 "오늘"로 복귀, 날짜별 현황 조회.
- **실시간 UI 업데이트**: Supabase Realtime 구독으로 다중 사용자 변경 즉시 반영.
- **예약 충돌 방지**: 동일 회의실·겹치는 시간대(confirmed) 중복 예약을 DB 트리거로 차단.
- **운영 규칙**: 30분 단위, 운영 시간 09:00~18:00 (18 슬롯).
- **PWA (앱 설치)**: Web App Manifest·아이콘(192/512/maskable/apple-touch) 제공, 홈 화면 설치 지원. 헤더 설치 버튼 및 모바일 상단 설치 배너(iOS는 수동 설치 안내) 제공.
- **오프라인 지원**: Service Worker 런타임 캐싱(정적 자원 CacheFirst, API·문서 NetworkFirst)으로 오프라인 시 마지막 조회 화면 표시, 온/오프라인 상태 배너 안내.
- **모바일 UI 최적화**: 세로 화면(standalone) 기준 반응형 그리드·모달·헤더 레이아웃 최적화.

## 설치 및 실행 방법

### 요구 사항
- Node.js 18.18 이상
- Supabase 프로젝트

### 기술 스택
- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS v3 (시맨틱 컬러 토큰)
- Supabase (PostgreSQL) — `@supabase/supabase-js`, Realtime 구독
- PWA: `@ducanh2912/next-pwa` (Service Worker + Web App Manifest + 오프라인 캐싱)
- 테스트: Vitest

### 로컬 실행
```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정 (아래 "Supabase 환경 변수 설정" 참고)
cp .env.local.example .env.local
# .env.local 을 열어 실제 값 입력

# 3. 개발 서버 실행 → http://localhost:3000
npm run dev

# 4. 프로덕션 빌드 / 실행
npm run build
npm run start

# 5. 테스트 실행
npm test
```

### Supabase 환경 변수 설정
`.env.local.example` 을 `.env.local` 로 복사한 뒤, Supabase 대시보드 > Project Settings > API 에서 값을 확인해 입력합니다.

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-public-key>
```

> `NEXT_PUBLIC_SUPABASE_ANON_KEY` 는 브라우저에 노출되는 공개(anon) 키이며, 데이터 접근은 Row Level Security(RLS) 정책으로 보호됩니다. `.env.local` 은 `.gitignore` 로 커밋에서 제외됩니다.

### 데이터베이스 초기화
`supabase/migrations/` 의 SQL 을 순서대로 적용하고 `supabase/seed.sql` 로 초기 데이터(회의실 1~6번 + 예약 목록)를 적재합니다.

```
supabase/migrations/0001_init.sql           # 테이블·enum·RLS·Realtime
supabase/migrations/0002_overlap_trigger.sql # 예약 시간 중복 방지 트리거
supabase/migrations/0003_harden_functions.sql # 함수 search_path 고정
supabase/seed.sql                            # 초기 회의실 및 예약 데이터
```

## 프로젝트 구조

```
src/
  app/
    layout.tsx                    # 루트 레이아웃, ToastProvider, 폰트
    page.tsx                      # 메인 페이지 (보드 조립, 상태 오케스트레이션)
    globals.css                   # Tailwind 및 전역 스타일
  components/
    Header.tsx                    # 서비스명·날짜 네비게이터·현재 시각
    ReservationBoard.tsx          # 시간×회의실 그리드, 셀/블록/현재시각 라인
    ReservationModal.tsx          # 신규 예약 폼 모달
    ReservationDetailModal.tsx    # 예약 상세 보기 및 취소 모달
    ui/                           # Button, Modal, ToastContainer 공통 UI
  hooks/
    useReservations.ts            # 날짜별 조회·생성·취소·Realtime 구독
    useToast.tsx                  # 토스트 상태/컨텍스트
  lib/
    supabase.ts                   # 단일 Supabase 브라우저 클라이언트
    database.types.ts             # DB 스키마 타입
    time.ts                       # 슬롯 생성·매핑·병합·포맷 유틸
    constants.ts                  # 운영 시간·슬롯·이용 시간 선택지
    time.test.ts                  # 시간 유틸 단위 테스트 (Vitest)
  types/
    index.ts                      # 도메인 타입
supabase/
  migrations/                     # DB 스키마 마이그레이션
  seed.sql                        # 초기 데이터
```

## 배포

- **플랫폼**: Vercel (Next.js)
- **상태**: 프로덕션 배포됨
- **URL**: https://immersive-ai-service-project09.vercel.app

배포 환경에서는 Vercel 프로젝트의 환경 변수(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)로 Supabase 에 연결합니다.

## 수정된 부분

- PWA 변환: `@ducanh2912/next-pwa` 도입, Service Worker 및 런타임 캐싱(정적=CacheFirst, API/문서=NetworkFirst) 설정
- Web App Manifest(`public/manifest.json`) 및 아이콘(192/512/maskable/apple-touch) 추가, `layout.tsx` PWA 메타 태그 반영
- 앱 설치 안내 UI 추가: `useInstallPrompt` 훅, 헤더 설치 버튼, 모바일 설치 배너(iOS 수동 안내 포함)
- 오프라인 지원 추가: `useOnlineStatus` 훅 및 오프라인 상태 배너
- 모바일 UI 최적화: 헤더·예약 보드·모달 반응형 레이아웃 개선

## 라이선스

별도 라이선스가 지정되지 않았습니다. (사내 프로젝트)
