export type MuscleGroup =
  | 'abdominals' | 'abductors' | 'adductors' | 'biceps' | 'calves'
  | 'chest' | 'forearms' | 'glutes' | 'hamstrings' | 'lats'
  | 'lower back' | 'middle back' | 'neck' | 'quadriceps' | 'shoulders'
  | 'traps' | 'triceps';

export type Equipment =
  | 'bands' | 'barbell' | 'body only' | 'cable' | 'dumbbell'
  | 'e-z curl bar' | 'exercise ball' | 'foam roll' | 'kettle bells'
  | 'machine' | 'medicine ball' | 'other';

export type ExerciseLevel = 'beginner' | 'intermediate' | 'expert';
export type ExerciseForce = 'pull' | 'push' | 'static';
export type ExerciseMechanic = 'compound' | 'isolation';
export type ExerciseCategory =
  | 'cardio' | 'olympic weightlifting' | 'plyometrics' | 'powerlifting'
  | 'strength' | 'stretching' | 'strongman';

export type Exercise = {
  id: string;
  name: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  force: ExerciseForce | null;
  level: ExerciseLevel;
  mechanic: ExerciseMechanic | null;
  equipment: string | null;
  category: ExerciseCategory;
  instructions: string[];
};

export const MUSCLE_OPTIONS: MuscleGroup[] = [
  'abdominals', 'biceps', 'calves', 'chest', 'forearms', 'glutes',
  'hamstrings', 'lats', 'lower back', 'middle back', 'quadriceps',
  'shoulders', 'traps', 'triceps',
];

export const EQUIPMENT_OPTIONS: Equipment[] = [
  'barbell', 'body only', 'cable', 'dumbbell', 'e-z curl bar',
  'exercise ball', 'kettle bells', 'machine',
];

export const CATEGORY_OPTIONS: ExerciseCategory[] = [
  'cardio', 'olympic weightlifting', 'plyometrics', 'powerlifting',
  'strength', 'stretching', 'strongman',
];

export const LEVEL_OPTIONS: ExerciseLevel[] = ['beginner', 'intermediate', 'expert'];

export const LEVEL_COLORS: Record<ExerciseLevel, string> = {
  beginner: '#4ade80',
  intermediate: '#fbbf24',
  expert: '#f87171',
};
