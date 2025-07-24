import { NextResponse } from 'next/server';

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

const calculateCalories = (workoutType: string, duration: number): number => {
  const metValues: Record<string, number> = {
    'walking': 3.5,
    'running': 8.0,
    'cycling': 7.5,
    'swimming': 6.0,
    'yoga': 2.5,
    'pilates': 3.0,
    'weightlifting': 4.0,
    'hiit': 8.0,
    'dancing': 4.5
  };

  const baseMet = metValues[workoutType.toLowerCase()] || metValues['walking'];
  const timeInHours = duration / 60;
  const weight = 70;
  return Math.round(baseMet * weight * timeInHours);
};

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