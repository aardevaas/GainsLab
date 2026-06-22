// Calories Burned via MET (Metabolic Equivalent of Task)
//
// Source: Ainsworth BE et al. "Compendium of Physical Activities" (2011)
//         Med Sci Sports Exerc. 43(8):1575-81
//
// Formula: Calories = MET × 3.5 × weight(kg) × duration(min) / 200

import type { CalorieBurnResult } from './types';

export interface Activity {
  id: string;
  label: string;
  category: string;
  met: number;
}

export const ACTIVITIES: Activity[] = [
  // Walking
  { id: 'walking_slow',     label: 'Walking (slow)',     category: 'Walking',   met: 2.5  },
  { id: 'walking_moderate', label: 'Walking (moderate)', category: 'Walking',   met: 3.5  },
  { id: 'walking_brisk',    label: 'Walking (brisk)',    category: 'Walking',   met: 4.3  },
  { id: 'walking_uphill',   label: 'Walking (uphill)',   category: 'Walking',   met: 6.0  },
  // Running
  { id: 'running_5mph',     label: 'Running 5 mph',      category: 'Running',   met: 8.3  },
  { id: 'running_6mph',     label: 'Running 6 mph',      category: 'Running',   met: 9.8  },
  { id: 'running_7mph',     label: 'Running 7 mph',      category: 'Running',   met: 11.0 },
  { id: 'running_8mph',     label: 'Running 8 mph',      category: 'Running',   met: 11.8 },
  { id: 'running_9mph',     label: 'Running 9 mph',      category: 'Running',   met: 12.8 },
  { id: 'running_10mph',    label: 'Running 10 mph',     category: 'Running',   met: 14.5 },
  // Cycling
  { id: 'cycling_leisure',  label: 'Cycling (leisure)',  category: 'Cycling',   met: 4.0  },
  { id: 'cycling_moderate', label: 'Cycling (moderate)', category: 'Cycling',   met: 6.8  },
  { id: 'cycling_vigorous', label: 'Cycling (vigorous)', category: 'Cycling',   met: 10.0 },
  // Swimming
  { id: 'swimming_leisure', label: 'Swimming (leisure)', category: 'Swimming',  met: 6.0  },
  { id: 'swimming_moderate',label: 'Swimming (moderate)',category: 'Swimming',  met: 8.3  },
  { id: 'swimming_vigorous',label: 'Swimming (vigorous)',category: 'Swimming',  met: 10.0 },
  // Gym / Strength
  { id: 'weight_training_light',    label: 'Weight Training (light)',    category: 'Gym', met: 3.5 },
  { id: 'weight_training_moderate', label: 'Weight Training (moderate)', category: 'Gym', met: 5.0 },
  { id: 'weight_training_vigorous', label: 'Weight Training (vigorous)', category: 'Gym', met: 6.0 },
  { id: 'crossfit',         label: 'CrossFit',           category: 'Gym',       met: 8.0  },
  { id: 'hiit',             label: 'HIIT',               category: 'Gym',       met: 8.0  },
  { id: 'circuit_training', label: 'Circuit Training',   category: 'Gym',       met: 7.0  },
  // Cardio Equipment
  { id: 'elliptical',       label: 'Elliptical',         category: 'Cardio',    met: 5.0  },
  { id: 'stair_climbing',   label: 'Stair Climbing',     category: 'Cardio',    met: 9.0  },
  { id: 'rowing_moderate',  label: 'Rowing (moderate)',  category: 'Cardio',    met: 7.0  },
  { id: 'rowing_vigorous',  label: 'Rowing (vigorous)',  category: 'Cardio',    met: 12.0 },
  { id: 'jump_rope_slow',   label: 'Jump Rope (slow)',   category: 'Cardio',    met: 8.8  },
  { id: 'jump_rope_fast',   label: 'Jump Rope (fast)',   category: 'Cardio',    met: 14.0 },
  // Classes
  { id: 'yoga',             label: 'Yoga',               category: 'Classes',   met: 3.0  },
  { id: 'pilates',          label: 'Pilates',            category: 'Classes',   met: 3.8  },
  { id: 'dancing',          label: 'Dancing',            category: 'Classes',   met: 5.5  },
  { id: 'boxing',           label: 'Boxing',             category: 'Classes',   met: 7.8  },
  { id: 'martial_arts',     label: 'Martial Arts',       category: 'Classes',   met: 10.3 },
  // Sports
  { id: 'basketball',       label: 'Basketball',         category: 'Sports',    met: 6.5  },
  { id: 'soccer',           label: 'Soccer',             category: 'Sports',    met: 7.0  },
  { id: 'tennis',           label: 'Tennis',             category: 'Sports',    met: 7.3  },
  { id: 'rock_climbing',    label: 'Rock Climbing',      category: 'Sports',    met: 8.0  },
  { id: 'hiking',           label: 'Hiking',             category: 'Sports',    met: 6.0  },
  // Other
  { id: 'stretching',       label: 'Stretching',         category: 'Other',     met: 2.3  },
  { id: 'rest',             label: 'Rest / Sedentary',   category: 'Other',     met: 1.0  },
];

const MET_MAP = new Map(ACTIVITIES.map(a => [a.id, a.met]));

export function calculateCaloriesBurned(
  weightKg: number,
  durationMinutes: number,
  activity: string | number,
): CalorieBurnResult {
  if (weightKg <= 0) throw new RangeError('Weight must be positive');
  if (durationMinutes <= 0) throw new RangeError('Duration must be positive');

  let met: number;
  let activityLabel: string;

  if (typeof activity === 'number') {
    if (activity <= 0) throw new RangeError('MET value must be positive');
    met = activity;
    activityLabel = `Custom MET ${activity}`;
  } else {
    const val = MET_MAP.get(activity);
    if (val === undefined) {
      throw new Error(`Unknown activity: "${activity}". Pass a numeric MET value or a valid activity id.`);
    }
    met = val;
    activityLabel = ACTIVITIES.find(a => a.id === activity)?.label ?? activity;
  }

  const total = (met * 3.5 * weightKg * durationMinutes) / 200;

  return {
    totalCalories: Math.round(total),
    caloriesPerMinute: Math.round((total / durationMinutes) * 10) / 10,
    durationMinutes,
    activity: activityLabel,
  };
}

export function getActivities(): Activity[] {
  return [...ACTIVITIES];
}

export function getActivitiesByCategory(): Record<string, Activity[]> {
  return ACTIVITIES.reduce<Record<string, Activity[]>>((acc, a) => {
    (acc[a.category] ??= []).push(a);
    return acc;
  }, {});
}
