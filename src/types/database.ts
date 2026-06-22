export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          name: string | null;
          username: string | null;
          avatar_url: string | null;
          date_of_birth: string | null;
          sex: 'male' | 'female' | null;
          height_cm: number | null;
          weight_kg: number | null;
          goal: 'lose_weight' | 'maintain' | 'gain_muscle' | 'improve_endurance' | 'general_fitness' | null;
          activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | 'extra_active' | null;
          units: 'metric' | 'imperial';
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      dietary_profiles: {
        Row: {
          id: string;
          user_id: string;
          diet_type: 'omnivore' | 'vegetarian' | 'vegan' | 'pescatarian' | 'keto' | 'paleo' | 'mediterranean' | null;
          restrictions: string[];
          allergies: string[];
          diseases: string[];
          disliked_foods: string[];
          macro_preset: 'balanced' | 'high_protein' | 'low_carb' | 'high_carb' | 'keto' | 'zone' | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['dietary_profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['dietary_profiles']['Insert']>;
      };
      body_measurements: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          weight_kg: number | null;
          body_fat_pct: number | null;
          lean_mass_kg: number | null;
          waist_cm: number | null;
          chest_cm: number | null;
          hips_cm: number | null;
          left_arm_cm: number | null;
          right_arm_cm: number | null;
          left_thigh_cm: number | null;
          right_thigh_cm: number | null;
          neck_cm: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['body_measurements']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['body_measurements']['Insert']>;
      };
      food_logs: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
          food_id: string | null;
          food_name: string;
          brand: string | null;
          quantity: number;
          unit: string;
          calories: number;
          protein_g: number;
          carbs_g: number;
          fat_g: number;
          fiber_g: number | null;
          sugar_g: number | null;
          sodium_mg: number | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['food_logs']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['food_logs']['Insert']>;
      };
      workout_plans: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          days_per_week: number;
          goal: string | null;
          difficulty: 'beginner' | 'intermediate' | 'advanced' | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['workout_plans']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['workout_plans']['Insert']>;
      };
      workout_days: {
        Row: {
          id: string;
          plan_id: string;
          day_number: number;
          name: string;
          muscle_focus: string[];
          order: number;
        };
        Insert: Database['public']['Tables']['workout_days']['Row'];
        Update: Partial<Database['public']['Tables']['workout_days']['Insert']>;
      };
      workout_exercises: {
        Row: {
          id: string;
          day_id: string;
          exercise_id: string;
          exercise_name: string;
          sets: number;
          reps: number | null;
          duration_seconds: number | null;
          weight_kg: number | null;
          rest_seconds: number;
          notes: string | null;
          order: number;
        };
        Insert: Database['public']['Tables']['workout_exercises']['Row'];
        Update: Partial<Database['public']['Tables']['workout_exercises']['Insert']>;
      };
      workout_sessions: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string | null;
          date: string;
          duration_minutes: number | null;
          calories_burned: number | null;
          notes: string | null;
          completed: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['workout_sessions']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['workout_sessions']['Insert']>;
      };
      session_sets: {
        Row: {
          id: string;
          session_id: string;
          exercise_id: string;
          exercise_name: string;
          set_number: number;
          reps: number | null;
          weight_kg: number | null;
          duration_seconds: number | null;
          notes: string | null;
        };
        Insert: Database['public']['Tables']['session_sets']['Row'];
        Update: Partial<Database['public']['Tables']['session_sets']['Insert']>;
      };
      progress_photos: {
        Row: {
          id: string;
          user_id: string;
          url: string;
          date: string;
          notes: string | null;
          is_public: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['progress_photos']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['progress_photos']['Insert']>;
      };
      sleep_logs: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          hours: number;
          quality_rating: number;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['sleep_logs']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['sleep_logs']['Insert']>;
      };
      saved_recipes: {
        Row: {
          id: string;
          user_id: string;
          recipe_id: string;
          source: 'themealdb' | 'spoonacular' | 'custom';
          recipe_snapshot: Json;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['saved_recipes']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['saved_recipes']['Insert']>;
      };
      liked_dishes: {
        Row: {
          id: string;
          user_id: string;
          dish_name: string;
          recipe_id: string | null;
          recipe_snapshot: Json | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['liked_dishes']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['liked_dishes']['Insert']>;
      };
      grocery_lists: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          week_of: string;
          is_complete: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['grocery_lists']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['grocery_lists']['Insert']>;
      };
      grocery_items: {
        Row: {
          id: string;
          list_id: string;
          ingredient: string;
          quantity: number | null;
          unit: string | null;
          is_checked: boolean;
          category: string | null;
        };
        Insert: Database['public']['Tables']['grocery_items']['Row'];
        Update: Partial<Database['public']['Tables']['grocery_items']['Insert']>;
      };
      competitions: {
        Row: {
          id: string;
          name: string;
          description: string;
          type: 'steps' | 'calories_burned' | 'workouts' | 'streak' | 'weight_loss' | 'custom';
          start_date: string;
          end_date: string;
          prize_description: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['competitions']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['competitions']['Insert']>;
      };
      competition_entries: {
        Row: {
          id: string;
          competition_id: string;
          user_id: string;
          score: number;
          joined_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['competition_entries']['Row'], 'updated_at'>;
        Update: Partial<Database['public']['Tables']['competition_entries']['Insert']>;
      };
      leaderboard_scores: {
        Row: {
          id: string;
          user_id: string;
          category: string;
          score: number;
          period: 'weekly' | 'monthly' | 'all_time';
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['leaderboard_scores']['Row'], 'updated_at'>;
        Update: Partial<Database['public']['Tables']['leaderboard_scores']['Insert']>;
      };
      body_age_assessments: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          pushup_max: number | null;
          situp_max: number | null;
          resting_hr: number | null;
          flexibility_score: number | null;
          mile_time_minutes: number | null;
          body_age_score: number | null;
          chronological_age: number | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['body_age_assessments']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['body_age_assessments']['Insert']>;
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan: 'free' | 'pro' | 'elite';
          status: 'active' | 'cancelled' | 'past_due' | 'trialing';
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
