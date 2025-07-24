import { NextResponse } from 'next/server';

const calculateCalories = (workoutType: string, duration: number): number => {
  const workoutIntensities: { [key: string]: { low: number; moderate: number; high: number } } = {
    'walking': { low: 2.5, moderate: 3.5, high: 4.5 },
    'running': { low: 6.0, moderate: 8.0, high: 11.0 },
    'cycling': { low: 4.0, moderate: 6.0, high: 10.0 },
    'swimming': { low: 4.5, moderate: 6.0, high: 9.0 },
    'yoga': { low: 2.0, moderate: 3.0, high: 4.0 },
    'pilates': { low: 2.5, moderate: 3.0, high: 3.5 },
    'weightlifting': { low: 3.0, moderate: 4.0, high: 6.0 },
    'hiit': { low: 6.0, moderate: 8.0, high: 10.0 },
    'dancing': { low: 3.5, moderate: 4.5, high: 6.0 },
    'stretching': { low: 1.5, moderate: 2.0, high: 2.5 },
    'crossfit': { low: 5.0, moderate: 7.0, high: 9.0 },
    'boxing': { low: 4.0, moderate: 6.0, high: 9.0 },
    'rowing': { low: 3.5, moderate: 5.5, high: 8.5 },
    'stair climbing': { low: 4.0, moderate: 6.0, high: 8.0 },
    'jump rope': { low: 8.0, moderate: 10.0, high: 12.0 },
  };

  const defaultMets = { low: 3.0, moderate: 4.0, high: 5.0 };
  const mets = workoutIntensities[workoutType.toLowerCase()] || defaultMets;

  let intensity: 'low' | 'moderate' | 'high';
  if (duration <= 20) {
    intensity = 'high';
  } else if (duration <= 45) {
    intensity = 'moderate';
  } else {
    intensity = 'low';
  }

  const met = mets[intensity];
  const weightInKg = 68;
  const timeInHours = duration / 60;
  const baseCalories = Math.round(met * 3.5 * weightInKg * timeInHours / 200);
  const variation = baseCalories * 0.05;
  const finalCalories = Math.round(baseCalories + (Math.random() * variation * 2 - variation));
  return Math.max(finalCalories, 1);
};

interface RequestBody {
  workoutType: string;
  duration: number;
}

interface ErrorResponse {
  error: string;
}

interface SuccessResponse {
  calories: number;
}

type ApiResponse = ErrorResponse | SuccessResponse;

export async function POST(request: Request) {
  try {
    const { workoutType, duration }: RequestBody = await request.json();

    if (!workoutType || !duration) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Workout type and duration are required' },
        { status: 400 }
      );
    }

    const calories = calculateCalories(workoutType, duration);
    return NextResponse.json<SuccessResponse>({ calories });
  } catch (error: unknown) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to calculate calories';
    return NextResponse.json<ErrorResponse>(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 