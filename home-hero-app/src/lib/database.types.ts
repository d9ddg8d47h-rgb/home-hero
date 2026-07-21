// Hand-authored to match supabase/migrations/0001_init.sql.
// Once your real Supabase project is running you can keep this in sync with:
//   npx supabase gen types typescript --project-id <your-project-ref> > src/lib/database.types.ts

export type Role = "physio" | "client";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: Role;
          full_name: string;
          email: string;
          physio_id: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          role: Role;
          full_name?: string;
          email: string;
          physio_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          role?: Role;
          full_name?: string;
          email?: string;
          physio_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_physio_id_fkey";
            columns: ["physio_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      exercises: {
        Row: {
          id: string;
          physio_id: string;
          name: string;
          description: string;
          video_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          physio_id: string;
          name: string;
          description?: string;
          video_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          physio_id?: string;
          name?: string;
          description?: string;
          video_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "exercises_physio_id_fkey";
            columns: ["physio_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      prescriptions: {
        Row: {
          id: string;
          client_id: string;
          exercise_id: string;
          sets: number | null;
          reps: number | null;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          exercise_id: string;
          sets?: number | null;
          reps?: number | null;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          exercise_id?: string;
          sets?: number | null;
          reps?: number | null;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "prescriptions_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "prescriptions_exercise_id_fkey";
            columns: ["exercise_id"];
            isOneToOne: false;
            referencedRelation: "exercises";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: Role;
    };
    CompositeTypes: Record<string, never>;
  };
}
