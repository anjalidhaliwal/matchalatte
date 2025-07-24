import { NextResponse } from 'next/server';

interface RequestBody {
  workoutType: string;
  duration: number;
  name: string;
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

export const runtime = 'edge';

export async function POST(req: Request) {
  if (req.method !== 'POST') {
    return NextResponse.json<ErrorResponse>(
      { error: 'Method not allowed' },
      { status: 405 }
    );
  }

  try {
    const { workoutType, duration, name }: RequestBody = await req.json();

    if (!workoutType || !duration || !name) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Workout type, duration, and name are required' },
        { status: 400 }
      );
    }

    const calories = calculateCalories(workoutType, duration);
    return NextResponse.json<SuccessResponse>(
      { calories },
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  } catch (error: unknown) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to calculate calories';
    return NextResponse.json<ErrorResponse>(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 