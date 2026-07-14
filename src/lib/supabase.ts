import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // 빌드/런타임을 중단시키지 않고 콘솔로 안내 (UI 에는 에러 배너로 노출됨)
  console.warn(
    "[supabase] 환경변수가 없습니다. .env.local 에 NEXT_PUBLIC_SUPABASE_URL 과 NEXT_PUBLIC_SUPABASE_ANON_KEY 를 설정하세요."
  );
}

// createClient 는 빈 URL 을 허용하지 않으므로, 미설정 시 안전한 플레이스홀더를 사용한다.
export const supabase = createClient<Database>(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key",
  {
    realtime: { params: { eventsPerSecond: 5 } },
  }
);
