'use client';

import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { WorkoutEntry, WorkoutStats } from '@/types/workout';
import { saveWorkout, getWorkoutHistory, calculateStats } from '@/utils/storage';

const matchaConfetti = () => {
  const colors = ['#86a886', '#4a6b4a', '#dcede6'];
  const end = Date.now() + 2000;

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
};

export default function Home() {
  const [name, setName] = useState('');
  const [workoutType, setWorkoutType] = useState('');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<WorkoutEntry[]>([]);
  const [stats, setStats] = useState<WorkoutStats | null>(null);
  const [selectedUser, setSelectedUser] = useState<string>('all');

  useEffect(() => {
    const loadedHistory = getWorkoutHistory();
    setHistory(loadedHistory);
    setStats(calculateStats(loadedHistory));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    
    setLoading(true);
    setError(null);
    setCalories(null);
    
    try {
      const response = await fetch('/api/calculate-calories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workoutType,
          duration: parseInt(duration),
        }),
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to calculate calories');
      }

      const newWorkout: WorkoutEntry = {
        id: Date.now().toString(),
        name,
        workoutType,
        duration: parseInt(duration),
        calories: data.calories,
        timestamp: new Date().toISOString(),
      };

      saveWorkout(newWorkout);
      const updatedHistory = [...history, newWorkout];
      setHistory(updatedHistory);
      setStats(calculateStats(updatedHistory));
      setCalories(data.calories);
      matchaConfetti();
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Get unique users from history
  const users = ['all', ...new Set(history.map(entry => entry.name))];
  
  // Filter history based on selected user
  const filteredHistory = selectedUser === 'all' 
    ? history 
    : history.filter(entry => entry.name === selectedUser);

  // Calculate user-specific stats
  const userStats = calculateStats(filteredHistory);

  // Calculate averages
  const avgCaloriesPerWorkout = userStats.totalWorkouts > 0 
    ? Math.round(userStats.totalCalories / userStats.totalWorkouts) 
    : 0;

  const avgDurationPerWorkout = userStats.totalWorkouts > 0
    ? Math.round(filteredHistory.reduce((acc, curr) => acc + curr.duration, 0) / userStats.totalWorkouts)
    : 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f3f8f2] via-[#e8f3e7] to-[#dcede6] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg overflow-hidden p-8 border border-[#86a886]/20 mb-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#4a6b4a] mb-2">Matcha Fitness</h1>
            <p className="text-[#86a886]">Track your wellness journey ✨</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
            <div className="relative">
              <label htmlFor="name" className="block text-sm font-medium text-[#4a6b4a] mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="block w-full px-4 py-3 rounded-xl border-[#86a886]/30 bg-white/50 focus:border-[#86a886] focus:ring focus:ring-[#86a886]/20 transition-all duration-200 text-[#4a6b4a] placeholder-[#86a886]/50"
                required
              />
            </div>

            <div className="relative">
              <label htmlFor="workoutType" className="block text-sm font-medium text-[#4a6b4a] mb-2">
                What did you do today?
              </label>
              <input
                type="text"
                id="workoutType"
                value={workoutType}
                onChange={(e) => setWorkoutType(e.target.value)}
                placeholder="e.g., yoga, pilates, dance"
                className="block w-full px-4 py-3 rounded-xl border-[#86a886]/30 bg-white/50 focus:border-[#86a886] focus:ring focus:ring-[#86a886]/20 transition-all duration-200 text-[#4a6b4a] placeholder-[#86a886]/50"
                required
              />
            </div>
            
            <div className="relative">
              <label htmlFor="duration" className="block text-sm font-medium text-[#4a6b4a] mb-2">
                For how long? (minutes)
              </label>
              <input
                type="number"
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="30"
                className="block w-full px-4 py-3 rounded-xl border-[#86a886]/30 bg-white/50 focus:border-[#86a886] focus:ring focus:ring-[#86a886]/20 transition-all duration-200 text-[#4a6b4a] placeholder-[#86a886]/50"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 rounded-xl bg-[#86a886] hover:bg-[#748f74] text-white font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Brewing your results...
                </span>
              ) : '✨ Calculate Calories ✨'}
            </button>
          </form>
          
          {error && (
            <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-200">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}
          
          {calories !== null && !error && (
            <div className="mt-8 text-center bg-white/70 rounded-2xl p-6 shadow-inner">
              <h2 className="text-lg font-medium text-[#4a6b4a]">You burned approximately</h2>
              <p className="text-4xl font-bold text-[#86a886] mt-2 mb-1">{calories}</p>
              <p className="text-[#86a886]">calories</p>
              <div className="mt-4 text-sm text-[#86a886]/70">
                Great job! Time for a matcha latte? 🍵
              </div>
            </div>
          )}
        </div>

        {/* Stats and History Section */}
        {stats && history.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg overflow-hidden p-8 border border-[#86a886]/20">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#4a6b4a]">Fitness Journey</h2>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="px-4 py-2 rounded-xl border-[#86a886]/30 bg-white/50 focus:border-[#86a886] focus:ring focus:ring-[#86a886]/20 text-[#4a6b4a]"
                >
                  {users.map(user => (
                    <option key={user} value={user}>
                      {user === 'all' ? 'All Users' : user}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/70 rounded-xl p-4 shadow-inner">
                  <p className="text-sm text-[#86a886]">Total Workouts</p>
                  <p className="text-2xl font-bold text-[#4a6b4a]">{userStats.totalWorkouts}</p>
                </div>
                <div className="bg-white/70 rounded-xl p-4 shadow-inner">
                  <p className="text-sm text-[#86a886]">Total Calories</p>
                  <p className="text-2xl font-bold text-[#4a6b4a]">{userStats.totalCalories}</p>
                </div>
                <div className="bg-white/70 rounded-xl p-4 shadow-inner">
                  <p className="text-sm text-[#86a886]">Avg Calories/Workout</p>
                  <p className="text-2xl font-bold text-[#4a6b4a]">{avgCaloriesPerWorkout}</p>
                </div>
                <div className="bg-white/70 rounded-xl p-4 shadow-inner">
                  <p className="text-sm text-[#86a886]">Avg Duration (min)</p>
                  <p className="text-2xl font-bold text-[#4a6b4a]">{avgDurationPerWorkout}</p>
                </div>
              </div>

              {Object.entries(userStats.workoutsByType).length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xl font-bold text-[#4a6b4a] mb-4">Workout Types</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(userStats.workoutsByType)
                      .sort((a, b) => b[1].count - a[1].count)
                      .map(([type, data]) => (
                        <div key={type} className="bg-white/70 rounded-xl p-4 shadow-inner">
                          <p className="font-medium text-[#4a6b4a] capitalize">{type}</p>
                          <div className="flex justify-between mt-2">
                            <p className="text-sm text-[#86a886]">{data.count} times</p>
                            <p className="text-sm text-[#86a886]">{Math.round(data.totalCalories / data.count)} cal/avg</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#4a6b4a] mb-4">Recent Workouts</h3>
              <div className="space-y-4">
                {filteredHistory.slice().reverse().map((workout) => (
                  <div key={workout.id} className="bg-white/70 rounded-xl p-4 shadow-inner">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-[#4a6b4a]">{workout.name}</p>
                        <p className="text-sm text-[#86a886] capitalize">{workout.workoutType}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#4a6b4a]">{workout.calories} calories</p>
                        <p className="text-sm text-[#86a886]">{workout.duration} minutes</p>
                      </div>
                    </div>
                    <p className="text-xs text-[#86a886]/70 mt-2">
                      {new Date(workout.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
