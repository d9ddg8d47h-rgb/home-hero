// Hand-authored to match supabase/migrations/0001_init.sql.
// Once your real Supabase project is running you can keep this in sync with:
//   npx supabase gen types typescript --project-id <your-project-ref> > src/lib/database.types.ts

export type Role = "physio" | "client";

export const EXERCISE_CATEGORIES = [
  "Gross Motor",
  "Strength",
  "Balance",
  "Coordination",
  "Stretching",
  "Functional Play",
  "Gait",
  "Fine Motor",
  "Core",
  "Sports",
] as const;

export const EXERCISE_DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;

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
          avatar_emoji: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          role: Role;
          full_name?: string;
          email: string;
          physio_id?: string | null;
          avatar_emoji?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          role?: Role;
          full_name?: string;
          email?: string;
          physio_id?: string | null;
          avatar_emoji?: string | null;
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
          category: string | null;
          body_area: string | null;
          difficulty: string | null;
          equipment: string | null;
          progression_tip: string | null;
          regression_tip: string | null;
          parent_tip: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          physio_id: string;
          name: string;
          description?: string;
          video_url?: string | null;
          category?: string | null;
          body_area?: string | null;
          difficulty?: string | null;
          equipment?: string | null;
          progression_tip?: string | null;
          regression_tip?: string | null;
          parent_tip?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          physio_id?: string;
          name?: string;
          description?: string;
          video_url?: string | null;
          category?: string | null;
          body_area?: string | null;
          difficulty?: string | null;
          equipment?: string | null;
          progression_tip?: string | null;
          regression_tip?: string | null;
          parent_tip?: string | null;
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
          order_index: number;
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
          order_index?: number;
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
          order_index?: number;
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
      completions: {
        Row: {
          id: string;
          client_id: string;
          prescription_id: string;
          completed_on: string;
          sets_done: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          prescription_id: string;
          completed_on?: string;
          sets_done?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          prescription_id?: string;
          completed_on?: string;
          sets_done?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "completions_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "completions_prescription_id_fkey";
            columns: ["prescription_id"];
            isOneToOne: false;
            referencedRelation: "prescriptions";
            referencedColumns: ["id"];
          },
        ];
      };
      program_templates: {
        Row: {
          id: string;
          physio_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          physio_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          physio_id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "program_templates_physio_id_fkey";
            columns: ["physio_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      program_template_items: {
        Row: {
          id: string;
          template_id: string;
          exercise_id: string;
          sets: number | null;
          reps: number | null;
          note: string | null;
          order_index: number;
        };
        Insert: {
          id?: string;
          template_id: string;
          exercise_id: string;
          sets?: number | null;
          reps?: number | null;
          note?: string | null;
          order_index?: number;
        };
        Update: {
          id?: string;
          template_id?: string;
          exercise_id?: string;
          sets?: number | null;
          reps?: number | null;
          note?: string | null;
          order_index?: number;
        };
        Relationships: [
          {
            foreignKeyName: "program_template_items_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "program_templates";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "program_template_items_exercise_id_fkey";
            columns: ["exercise_id"];
            isOneToOne: false;
            referencedRelation: "exercises";
            referencedColumns: ["id"];
          },
        ];
      };
      client_rewards: {
        Row: {
          id: string;
          client_id: string;
          reward_type: "chest";
          reward_key: string;
          unlocked_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          reward_type: "chest";
          reward_key: string;
          unlocked_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          reward_type?: "chest";
          reward_key?: string;
          unlocked_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "client_rewards_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
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
