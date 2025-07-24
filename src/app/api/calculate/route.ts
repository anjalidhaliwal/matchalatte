import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { workoutType, duration, name } = body;

    if (!workoutType || !duration || !name) {
      return NextResponse.json(
        { error: 'Workout type, duration, and name are required' },
        { status: 400 }
      );
    }

    // MET values for different workout types
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

    // Calculate calories
    const baseMet = metValues[workoutType.toLowerCase()] || metValues['walking'];
    const timeInHours = duration / 60;
    const weight = 70;
    const calories = Math.round(baseMet * weight * timeInHours);

    return NextResponse.json({ calories });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate calories' },
      { status: 500 }
    );
  }
} 