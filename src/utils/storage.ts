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

export const calculateStats = (workouts: WorkoutEntry[]): WorkoutStats => {
  const stats: WorkoutStats = {
    totalWorkouts: workouts.length,
    totalCalories: 0,
    workoutsByType: {},
  };

  workouts.forEach((workout) => {
    stats.totalCalories += workout.calories;

    const type = workout.workoutType.toLowerCase();
    if (!stats.workoutsByType[type]) {
      stats.workoutsByType[type] = {
        count: 0,
        totalCalories: 0,
      };
    }

    stats.workoutsByType[type].count += 1;
    stats.workoutsByType[type].totalCalories += workout.calories;
  });

  return stats;
}; 