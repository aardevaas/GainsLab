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
          timezone: string;
          is_admin: boolean;
          is_creator: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at' | 'timezone' | 'is_admin' | 'is_creator'> & { id?: string; timezone?: string; is_admin?: boolean; is_creator?: boolean };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
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
        Insert: Omit<Database['public']['Tables']['dietary_profiles']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['dietary_profiles']['Insert']>;
        Relationships: [];
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
        Insert: Omit<Database['public']['Tables']['body_measurements']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['body_measurements']['Insert']>;
        Relationships: [];
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
          saturated_fat_g: number | null;
          trans_fat_g: number | null;
          cholesterol_mg: number | null;
          added_sugar_g: number | null;
          micronutrients: Record<string, number> | null;
          created_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['food_logs']['Row'],
          'id' | 'created_at' | 'saturated_fat_g' | 'trans_fat_g' | 'cholesterol_mg' | 'added_sugar_g' | 'micronutrients'
        > & {
          id?: string;
          saturated_fat_g?: number | null;
          trans_fat_g?: number | null;
          cholesterol_mg?: number | null;
          added_sugar_g?: number | null;
          micronutrients?: Record<string, number> | null;
        };
        Update: Partial<Database['public']['Tables']['food_logs']['Insert']>;
        Relationships: [];
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
        Insert: Omit<Database['public']['Tables']['workout_plans']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['workout_plans']['Insert']>;
        Relationships: [];
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
        Insert: Omit<Database['public']['Tables']['workout_days']['Row'], 'id'> & { id?: string };
        Update: Partial<Database['public']['Tables']['workout_days']['Insert']>;
        Relationships: [];
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
        Insert: Omit<Database['public']['Tables']['workout_exercises']['Row'], 'id'> & { id?: string };
        Update: Partial<Database['public']['Tables']['workout_exercises']['Insert']>;
        Relationships: [];
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
        Insert: Omit<Database['public']['Tables']['workout_sessions']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['workout_sessions']['Insert']>;
        Relationships: [];
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
          rpe: number | null;
          is_warmup: boolean;
        };
        Insert: Omit<Database['public']['Tables']['session_sets']['Row'], 'id' | 'rpe' | 'is_warmup'> & {
          id?: string;
          rpe?: number | null;
          is_warmup?: boolean;
        };
        Update: Partial<Database['public']['Tables']['session_sets']['Insert']>;
        Relationships: [];
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
        Insert: Omit<Database['public']['Tables']['progress_photos']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['progress_photos']['Insert']>;
        Relationships: [];
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
        Insert: Omit<Database['public']['Tables']['sleep_logs']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['sleep_logs']['Insert']>;
        Relationships: [];
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
        Insert: Omit<Database['public']['Tables']['saved_recipes']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['saved_recipes']['Insert']>;
        Relationships: [];
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
        Insert: Omit<Database['public']['Tables']['liked_dishes']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['liked_dishes']['Insert']>;
        Relationships: [];
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
        Insert: Omit<Database['public']['Tables']['grocery_lists']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['grocery_lists']['Insert']>;
        Relationships: [];
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
        Insert: Omit<Database['public']['Tables']['grocery_items']['Row'], 'id'> & { id?: string };
        Update: Partial<Database['public']['Tables']['grocery_items']['Insert']>;
        Relationships: [];
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
        Insert: Omit<Database['public']['Tables']['competitions']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['competitions']['Insert']>;
        Relationships: [];
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
        Insert: Omit<Database['public']['Tables']['competition_entries']['Row'], 'id' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['competition_entries']['Insert']>;
        Relationships: [];
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
        Insert: Omit<Database['public']['Tables']['leaderboard_scores']['Row'], 'id' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['leaderboard_scores']['Insert']>;
        Relationships: [];
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
        Insert: Omit<Database['public']['Tables']['body_age_assessments']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['body_age_assessments']['Insert']>;
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string;
          status: 'active' | 'inactive' | 'expired';
          started_at: string | null;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'created_at'> & { id?: string; updated_at?: string };
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>;
        Relationships: [];
      };
      payment_submissions: {
        Row: {
          id: string;
          user_id: string;
          receipt_storage_path: string;
          plan_id: string;
          status: 'pending' | 'approved' | 'rejected' | 'flagged';
          amount_extracted: number | null;
          transaction_id_extracted: string | null;
          date_extracted: string | null;
          destination_extracted: string | null;
          ocr_raw: Json | null;
          ocr_confidence: string | null;
          auto_approved: boolean;
          reviewed_by: string | null;
          review_note: string | null;
          submitted_at: string;
          reviewed_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['payment_submissions']['Row'], 'id' | 'submitted_at' | 'auto_approved' | 'reviewed_by' | 'review_note' | 'reviewed_at'> & {
          id?: string;
          auto_approved?: boolean;
          reviewed_by?: string | null;
          review_note?: string | null;
          reviewed_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['payment_submissions']['Insert']>;
        Relationships: [];
      };
      verified_tx_ids: {
        Row: {
          transaction_id: string;
          submission_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['verified_tx_ids']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['verified_tx_ids']['Insert']>;
        Relationships: [];
      };
      daily_targets: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          calorie_target: number | null;
          protein_target: number | null;
          carb_target: number | null;
          fat_target: number | null;
          training_freq_target: number | null;
          goal: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['daily_targets']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['daily_targets']['Insert']>;
        Relationships: [];
      };
      daily_metrics: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          calories_in: number | null;
          protein_g: number | null;
          carbs_g: number | null;
          fat_g: number | null;
          calorie_target: number | null;
          protein_target: number | null;
          trained: boolean;
          session_count_week: number | null;
          training_volume: number | null;
          est_1rm_snapshot: number | null;
          sleep_minutes: number | null;
          sleep_quality: number | null;
          logged_food: boolean;
          logged_workout: boolean;
          logged_progress: boolean;
          weight_kg: number | null;
          body_fat_pct: number | null;
          pillar_nutrition: number | null;
          pillar_training: number | null;
          pillar_recovery: number | null;
          pillar_consistency: number | null;
          pillar_progress: number | null;
          daily_score: number | null;
          gains_score: number | null;
          goal_snapshot: string | null;
          computed_at: string;
        };
        Insert: { user_id: string; date: string } & Partial<Omit<Database['public']['Tables']['daily_metrics']['Row'], 'user_id' | 'date'>>;
        Update: Partial<Database['public']['Tables']['daily_metrics']['Insert']>;
        Relationships: [];
      };
      foods: {
        Row: {
          id: string;
          source: string;
          source_id: string | null;
          barcode: string | null;
          name: string;
          brand: string | null;
          serving_qty: number | null;
          serving_unit: string | null;
          serving_grams: number | null;
          calories: number | null;
          protein_g: number | null;
          carbs_g: number | null;
          fat_g: number | null;
          saturated_fat_g: number | null;
          trans_fat_g: number | null;
          cholesterol_mg: number | null;
          sodium_mg: number | null;
          fiber_g: number | null;
          sugar_g: number | null;
          added_sugar_g: number | null;
          micronutrients: Record<string, number> | null;
          verified: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['foods']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['foods']['Insert']>;
        Relationships: [];
      };
      exercises: {
        Row: {
          id: string;
          source: string;
          source_id: string | null;
          name: string;
          category: string | null;
          equipment: string | null;
          primary_muscles: string[] | null;
          secondary_muscles: string[] | null;
          instructions: string[] | null;
          images: string[] | null;
          gif_url: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['exercises']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['exercises']['Insert']>;
        Relationships: [];
      };
      creator_applications: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          bio: string | null;
          specialty: string[];
          instagram_url: string | null;
          youtube_url: string | null;
          tiktok_url: string | null;
          experience_years: number | null;
          certifications: string | null;
          motivation: string;
          status: 'pending' | 'approved' | 'rejected';
          reviewed_by: string | null;
          review_note: string | null;
          reviewed_at: string | null;
          submitted_at: string;
        };
        Insert: Omit<Database['public']['Tables']['creator_applications']['Row'], 'id' | 'submitted_at' | 'status' | 'reviewed_by' | 'review_note' | 'reviewed_at'> & {
          id?: string;
          status?: 'pending' | 'approved' | 'rejected';
          reviewed_by?: string | null;
          review_note?: string | null;
          reviewed_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['creator_applications']['Insert']>;
        Relationships: [];
      };
      creator_profiles: {
        Row: {
          id: string;
          user_id: string;
          display_name: string;
          slug: string;
          bio: string | null;
          avatar_url: string | null;
          cover_url: string | null;
          specialty: string[];
          country: string | null;
          city: string | null;
          languages: string[];
          instagram_url: string | null;
          youtube_url: string | null;
          tiktok_url: string | null;
          website_url: string | null;
          certifications: string | null;
          experience_years: number | null;
          community_price_bob: number | null;
          platform_cut_pct: number;
          total_clients: number;
          total_transformations: number;
          avg_client_rating: number | null;
          is_verified: boolean;
          is_featured: boolean;
          is_accepting_clients: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['creator_profiles']['Row'], 'id' | 'created_at' | 'updated_at' | 'total_clients' | 'total_transformations' | 'platform_cut_pct' | 'is_verified' | 'is_featured' | 'is_accepting_clients'> & {
          id?: string;
          platform_cut_pct?: number;
          total_clients?: number;
          total_transformations?: number;
          is_verified?: boolean;
          is_featured?: boolean;
          is_accepting_clients?: boolean;
        };
        Update: Partial<Database['public']['Tables']['creator_profiles']['Insert']>;
        Relationships: [];
      };
      programs: {
        Row: {
          id: string;
          creator_id: string;
          title: string;
          description: string | null;
          type: 'standard' | 'one_on_one' | 'challenge';
          goal: 'fat_loss' | 'muscle_gain' | 'maintenance' | 'performance' | 'general' | null;
          duration_weeks: number;
          price_bob: number;
          cover_image_url: string | null;
          is_published: boolean;
          is_free: boolean;
          enrollment_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['programs']['Row'], 'id' | 'created_at' | 'updated_at' | 'enrollment_count' | 'is_published' | 'is_free'> & {
          id?: string;
          is_published?: boolean;
          is_free?: boolean;
          enrollment_count?: number;
        };
        Update: Partial<Database['public']['Tables']['programs']['Insert']>;
        Relationships: [];
      };
      program_weeks: {
        Row: {
          id: string;
          program_id: string;
          week_number: number;
          title: string | null;
          description: string | null;
        };
        Insert: Omit<Database['public']['Tables']['program_weeks']['Row'], 'id'> & { id?: string };
        Update: Partial<Database['public']['Tables']['program_weeks']['Insert']>;
        Relationships: [];
      };
      program_days: {
        Row: {
          id: string;
          week_id: string;
          day_number: number;
          title: string | null;
          rest_day: boolean;
        };
        Insert: Omit<Database['public']['Tables']['program_days']['Row'], 'id'> & { id?: string; rest_day?: boolean };
        Update: Partial<Database['public']['Tables']['program_days']['Insert']>;
        Relationships: [];
      };
      program_day_completions: {
        Row: {
          id: string;
          user_id: string;
          day_id: string;
          completed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          day_id: string;
          completed_at?: string;
        };
        Update: Partial<Database['public']['Tables']['program_day_completions']['Insert']>;
        Relationships: [];
      };
      program_exercises: {
        Row: {
          id: string;
          day_id: string;
          exercise_id: string | null;
          exercise_name: string;
          sets: number | null;
          reps: string | null;
          weight_guidance: string | null;
          rest_seconds: number | null;
          notes: string | null;
          order_index: number;
        };
        Insert: Omit<Database['public']['Tables']['program_exercises']['Row'], 'id'> & { id?: string; order_index?: number };
        Update: Partial<Database['public']['Tables']['program_exercises']['Insert']>;
        Relationships: [];
      };
      program_nutrition: {
        Row: {
          id: string;
          day_id: string;
          calorie_target: number | null;
          protein_g: number | null;
          carbs_g: number | null;
          fat_g: number | null;
          meal_timing_notes: string | null;
          recommended_recipe_ids: string[];
        };
        Insert: Omit<Database['public']['Tables']['program_nutrition']['Row'], 'id'> & { id?: string; recommended_recipe_ids?: string[] };
        Update: Partial<Database['public']['Tables']['program_nutrition']['Insert']>;
        Relationships: [];
      };
      program_habits: {
        Row: {
          id: string;
          program_id: string;
          title: string;
          description: string | null;
          frequency: 'daily' | 'weekly';
          order_index: number;
        };
        Insert: Omit<Database['public']['Tables']['program_habits']['Row'], 'id'> & { id?: string; frequency?: 'daily' | 'weekly'; order_index?: number };
        Update: Partial<Database['public']['Tables']['program_habits']['Insert']>;
        Relationships: [];
      };
      client_roster: {
        Row: {
          id: string;
          creator_id: string;
          member_user_id: string;
          program_id: string | null;
          status: 'active' | 'paused' | 'completed' | 'cancelled';
          current_week: number;
          start_date: string;
          end_date: string | null;
          payment_amount_bob: number | null;
          payment_submission_id: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['client_roster']['Row'], 'id' | 'created_at' | 'updated_at' | 'current_week' | 'status'> & {
          id?: string;
          status?: 'active' | 'paused' | 'completed' | 'cancelled';
          current_week?: number;
        };
        Update: Partial<Database['public']['Tables']['client_roster']['Insert']>;
        Relationships: [];
      };
      creator_ratings: {
        Row: {
          id: string;
          roster_id: string;
          creator_id: string;
          member_user_id: string;
          rating: number;
          review_text: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          roster_id: string;
          creator_id: string;
          member_user_id: string;
          rating: number;
          review_text?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['creator_ratings']['Insert']>;
        Relationships: [];
      };
      creator_communities: {
        Row: {
          id: string;
          creator_id: string;
          name: string;
          description: string | null;
          is_public: boolean;
          member_count: number;
          post_count: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['creator_communities']['Row'], 'id' | 'created_at' | 'member_count' | 'post_count' | 'is_public'> & {
          id?: string;
          is_public?: boolean;
          member_count?: number;
          post_count?: number;
        };
        Update: Partial<Database['public']['Tables']['creator_communities']['Insert']>;
        Relationships: [];
      };
      community_posts: {
        Row: {
          id: string;
          community_id: string;
          author_user_id: string;
          content: string | null;
          image_urls: string[];
          video_url: string | null;
          post_type: 'text' | 'image' | 'video' | 'workout_share' | 'progress_share';
          is_pinned: boolean;
          like_count: number;
          comment_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['community_posts']['Row'], 'id' | 'created_at' | 'updated_at' | 'like_count' | 'comment_count' | 'is_pinned'> & {
          id?: string;
          is_pinned?: boolean;
          like_count?: number;
          comment_count?: number;
          image_urls?: string[];
        };
        Update: Partial<Database['public']['Tables']['community_posts']['Insert']>;
        Relationships: [];
      };
      community_post_likes: {
        Row: {
          post_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['community_post_likes']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['community_post_likes']['Insert']>;
        Relationships: [];
      };
      community_post_comments: {
        Row: {
          id: string;
          post_id: string;
          author_user_id: string;
          content: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['community_post_comments']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['community_post_comments']['Insert']>;
        Relationships: [];
      };
      recipe_packs: {
        Row: {
          id: string;
          creator_id: string;
          title: string;
          description: string | null;
          cover_image_url: string | null;
          price_bob: number;
          recipe_count: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['recipe_packs']['Row'], 'id' | 'created_at' | 'recipe_count'> & { id?: string; recipe_count?: number };
        Update: Partial<Database['public']['Tables']['recipe_packs']['Insert']>;
        Relationships: [];
      };
      creator_recipes: {
        Row: {
          id: string;
          creator_id: string;
          pack_id: string | null;
          title: string;
          description: string | null;
          ingredients: Json;
          instructions: string[];
          macros: Json | null;
          image_url: string | null;
          prep_time_minutes: number | null;
          cook_time_minutes: number | null;
          servings: number | null;
          tags: string[];
          access_level: 'free' | 'community' | 'pack';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['creator_recipes']['Row'], 'id' | 'created_at'> & { id?: string; access_level?: 'free' | 'community' | 'pack'; tags?: string[]; instructions?: string[] };
        Update: Partial<Database['public']['Tables']['creator_recipes']['Insert']>;
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          roster_id: string;
          sender_id: string;
          body: string;
          read_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at' | 'read_at'> & { id?: string; read_at?: string | null };
        Update: Partial<Database['public']['Tables']['messages']['Insert']>;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          body: string | null;
          href: string | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at' | 'read_at' | 'body' | 'href'> & {
          id?: string;
          body?: string | null;
          href?: string | null;
          read_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
        Relationships: [];
      };
      automated_checkins: {
        Row: {
          id: string;
          creator_id: string;
          program_id: string | null;
          title: string;
          questions: Json;
          frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
          send_day_of_week: number | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['automated_checkins']['Row'], 'id' | 'created_at' | 'is_active'> & { id?: string; is_active?: boolean; questions?: Json };
        Update: Partial<Database['public']['Tables']['automated_checkins']['Insert']>;
        Relationships: [];
      };
      checkin_responses: {
        Row: {
          id: string;
          checkin_id: string;
          member_user_id: string;
          responses: Json;
          submitted_at: string;
        };
        Insert: Omit<Database['public']['Tables']['checkin_responses']['Row'], 'id' | 'submitted_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['checkin_responses']['Insert']>;
        Relationships: [];
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
