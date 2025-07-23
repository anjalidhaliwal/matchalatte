import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// More accurate MET values based on CDC and research data
const calculateCaloriesLocally = (workoutType: string, duration: number): number => {
  // MET values from the 2011 Compendium of Physical Activities
  const workoutIntensities: { [key: string]: { low: number; moderate: number; high: number } } = {
    'walking': { low: 2.5, moderate: 3.5, high: 4.5 }, // Varying speeds
    'running': { low: 6.0, moderate: 8.0, high: 11.0 }, // Different paces
    'cycling': { low: 4.0, moderate: 6.0, high: 10.0 }, // Different intensities
    'swimming': { low: 4.5, moderate: 6.0, high: 9.0 }, // Different strokes
    'yoga': { low: 2.0, moderate: 3.0, high: 4.0 }, // Different styles
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

  // Get the MET values for the workout type or use moderate defaults
  const defaultMets = { low: 3.0, moderate: 4.0, high: 5.0 };
  const mets = workoutIntensities[workoutType.toLowerCase()] || defaultMets;

  // Determine intensity based on duration
  // Shorter workouts tend to be higher intensity
  let intensity: 'low' | 'moderate' | 'high';
  if (duration <= 20) {
    intensity = 'high';
  } else if (duration <= 45) {
    intensity = 'moderate';
  } else {
    intensity = 'low';
  }

  const met = mets[intensity];
  
  // Calorie calculation formula: MET * 3.5 * weight (kg) * time (hours) / 200
  // Using a more representative average weight of 68kg (150 lbs)
  const weightInKg = 68;
  const timeInHours = duration / 60;
  
  // Add a small random variation (±5%) to make it more realistic
  const baseCalories = Math.round(met * 3.5 * weightInKg * timeInHours / 200);
  const variation = baseCalories * 0.05; // 5% variation
  const finalCalories = Math.round(baseCalories + (Math.random() * variation * 2 - variation));

  return Math.max(finalCalories, 1); // Ensure we never return less than 1 calorie
};

export async function POST(request: Request) {
  try {
    const { workoutType, duration } = await request.json();

    if (!workoutType || !duration) {
      return NextResponse.json(
        { error: 'Workout type and duration are required' },
        { status: 400 }
      );
    }

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a fitness expert that calculates calories burned during workouts. Provide only the number, no explanation."
          },
          {
            role: "user",
            content: `Calculate how many calories would be burned during ${duration} minutes of ${workoutType}. Consider intensity and provide a reasonable estimate. Return only the number.`
          }
        ]
      });

      const calories = parseInt(completion.choices[0].message.content || "0");
      return NextResponse.json({ calories });
    } catch (openaiError) {
      console.log('OpenAI API error, using fallback calculation');
      // Use fallback calculation if OpenAI API fails
      const calories = calculateCaloriesLocally(workoutType, duration);
      return NextResponse.json({ calories });
    }
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to calculate calories' },
      { status: 500 }
    );
  }
} 