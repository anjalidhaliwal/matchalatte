import { WorkoutEntry, WorkoutStats } from '@/types/workout';

const STORAGE_KEY = 'workout_history';

export const saveWorkout = (workout: WorkoutEntry): void => {
  const history = getWorkoutHistory();
  history.push(workout);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
};

export const getWorkoutHistory = (): WorkoutEntry[] => {
  if (typeof window === 'undefined') return [];
  const history = localStorage.getItem(STORAGE_KEY);
  return history ? JSON.parse(history) : [];
};

export const calculateStats = (history: WorkoutEntry[]): WorkoutStats => {
  const stats: WorkoutStats = {
    totalCalories: 0,
    totalWorkouts: history.length,
    workoutsByType: {}
  };

  history.forEach(workout => {
    stats.totalCalories += workout.calories;

    if (!stats.workoutsByType[workout.workoutType]) {
      stats.workoutsByType[workout.workoutType] = {
        count: 0,
        totalCalories: 0
      };
    }

    stats.workoutsByType[workout.workoutType].count += 1;
    stats.workoutsByType[workout.workoutType].totalCalories += workout.calories;
  });

  return stats;
}; 