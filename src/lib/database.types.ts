// Supabase 테이블 타입 (스키마: supabase/migrations/0001_init.sql 기준)
// 표준 generated 형태를 따라 supabase-js 의 타입 추론과 호환되게 정의.

export type ReservationStatus = "confirmed" | "cancelled";

export type Database = {
  public: {
    Tables: {
      meeting_rooms: {
        Row: {
          id: string;
          room_number: number;
          room_name: string;
          capacity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          room_number: number;
          room_name: string;
          capacity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          room_number?: number;
          room_name?: string;
          capacity?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      reservations: {
        Row: {
          id: string;
          room_id: string;
          reserver_name: string;
          meeting_title: string;
          start_time: string;
          end_time: string;
          status: ReservationStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          reserver_name: string;
          meeting_title: string;
          start_time: string;
          end_time: string;
          status?: ReservationStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          reserver_name?: string;
          meeting_title?: string;
          start_time?: string;
          end_time?: string;
          status?: ReservationStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reservations_room_id_fkey";
            columns: ["room_id"];
            isOneToOne: false;
            referencedRelation: "meeting_rooms";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      reservation_status: ReservationStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
