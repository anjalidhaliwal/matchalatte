export interface WorkoutEntry {
  id: string;
  name: string;
  workoutType: string;
  duration: number;
  calories: number;
  timestamp: string;
}

export interface WorkoutStats {
  totalCalories: number;
  totalWorkouts: number;
  workoutsByType: {
    [key: string]: {
      count: number;
      totalCalories: number;
    };
  };
} 