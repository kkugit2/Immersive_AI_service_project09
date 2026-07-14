"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getDayBounds } from "@/lib/time";
import type { MeetingRoom, Reservation, NewReservationInput } from "@/types";

interface UseReservationsResult {
  rooms: MeetingRoom[];
  reservations: Reservation[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createReservation: (input: NewReservationInput) => Promise<{ ok: boolean; message?: string }>;
  cancelReservation: (id: string) => Promise<{ ok: boolean; message?: string }>;
}

export function useReservations(dateKey: string): UseReservationsResult {
  const [rooms, setRooms] = useState<MeetingRoom[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dateKeyRef = useRef(dateKey);
  dateKeyRef.current = dateKey;

  // 회의실 목록 (1회 로드)
  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from("meeting_rooms")
        .select("id, room_number, room_name, capacity")
        .order("room_number", { ascending: true });
      if (!active) return;
      if (error) {
        setError(error.message);
        return;
      }
      setRooms(data ?? []);
    })();
    return () => {
      active = false;
    };
  }, []);

  const fetchReservations = useCallback(async (key: string) => {
    const { startISO, endISO } = getDayBounds(key);
    const { data, error } = await supabase
      .from("reservations")
      .select("id, room_id, reserver_name, meeting_title, start_time, end_time, status")
      .eq("status", "confirmed")
      .gte("start_time", startISO)
      .lt("start_time", endISO)
      .order("start_time", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Reservation[];
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchReservations(dateKeyRef.current);
      setReservations(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "예약을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [fetchReservations]);

  // 날짜 변경 시 재조회
  useEffect(() => {
    refresh();
  }, [dateKey, refresh]);

  // Realtime 구독: reservations 변경 시 현재 날짜 데이터 재조회
  useEffect(() => {
    const channel = supabase
      .channel("reservations-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reservations" },
        () => {
          fetchReservations(dateKeyRef.current)
            .then(setReservations)
            .catch(() => {
              /* 조용히 무시, 다음 refresh 에서 복구 */
            });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchReservations]);

  const createReservation = useCallback<UseReservationsResult["createReservation"]>(
    async (input) => {
      const { data, error } = await supabase
        .from("reservations")
        .insert({
          room_id: input.room_id,
          reserver_name: input.reserver_name,
          meeting_title: input.meeting_title,
          start_time: input.start_time,
          end_time: input.end_time,
          status: "confirmed",
        })
        .select("id, room_id, reserver_name, meeting_title, start_time, end_time, status")
        .single();

      if (error) {
        // exclusion constraint 위반 = 시간 충돌 (Postgres code 23P01)
        const code = (error as { code?: string }).code;
        if (code === "23P01") {
          return { ok: false, message: "이미 예약된 시간대입니다. 다른 시간을 선택해주세요." };
        }
        return { ok: false, message: "일시적인 오류가 발생했습니다. 다시 시도해주세요." };
      }

      // 낙관적 반영 (Realtime 이 뒤이어 확정)
      if (data) {
        setReservations((prev) =>
          prev.some((r) => r.id === data.id) ? prev : [...prev, data as Reservation]
        );
      }
      return { ok: true };
    },
    []
  );

  const cancelReservation = useCallback<UseReservationsResult["cancelReservation"]>(
    async (id) => {
      const { error } = await supabase
        .from("reservations")
        .update({ status: "cancelled" })
        .eq("id", id);
      if (error) {
        return { ok: false, message: "일시적인 오류가 발생했습니다. 다시 시도해주세요." };
      }
      setReservations((prev) => prev.filter((r) => r.id !== id));
      return { ok: true };
    },
    []
  );

  return {
    rooms,
    reservations,
    loading,
    error,
    refresh,
    createReservation,
    cancelReservation,
  };
}
