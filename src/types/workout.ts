export interface WorkoutEntry {
  id: string;
  name: string;
  workoutType: string;
  duration: number;
  calories: number;
  timestamp: string;
}

export interface WorkoutTypeStats {
  count: number;
  totalCalories: number;
}

export interface WorkoutStats {
  totalWorkouts: number;
  totalCalories: number;
  workoutsByType: Record<string, WorkoutTypeStats>;
} 