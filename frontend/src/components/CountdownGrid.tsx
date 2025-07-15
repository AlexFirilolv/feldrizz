import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCountdown } from '../hooks/useCountdown';
import CountdownCard from './CountdownCard';
import LoadingSpinner from './LoadingSpinner';
import { HeartIcon, StarIcon } from '@heroicons/react/24/solid';

const CountdownGrid: React.FC = () => {
  const { overview, loading, error, refetch } = useCountdown();
  const navigate = useNavigate();

  const handleCardClick = (dayNumber: number) => {
    navigate(`/day/${dayNumber}`);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading our journey..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">💔</div>
          <h2 className="text-2xl font-bold text-warm-gray-800 mb-4">
            Oops! Something went wrong
          </h2>
          <p className="text-warm-gray-600 mb-6 max-w-md">
            {error}
          </p>
          <button 
            onClick={refetch}
            className="btn-romantic"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!overview || !overview.days) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🤷‍♀️</div>
          <h2 className="text-2xl font-bold text-warm-gray-800 mb-4">
            No countdown found
          </h2>
          <p className="text-warm-gray-600">
            It looks like the countdown hasn't been set up yet.
          </p>
        </div>
      </div>
    );
  }

  const currentDay = overview.current_day;
  const unlockedCount = overview.days.filter(day => day.is_unlocked).length;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-sunset rounded-full mb-6 animate-bounce-gentle">
          <HeartIcon className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-warm-gray-800 mb-4">
          <span className="romantic-text">25 Days</span>
        </h1>
        
        <p className="text-xl text-warm-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
          A countdown to celebrate our 6-month anniversary. Each day brings us closer 
          together with a special memory to unlock and cherish. 💕
        </p>

        {/* Progress indicator */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className="flex items-center space-x-2 text-warm-gray-600">
            <StarIcon className="w-5 h-5 text-warm-orange" />
            <span className="font-medium">
              {unlockedCount} of {overview.total_days} days unlocked
            </span>
          </div>
          
          {currentDay && (
            <div className="flex items-center space-x-2 text-warm-gray-600">
              <div className="w-2 h-2 bg-warm-orange rounded-full animate-pulse"></div>
              <span className="romantic-text">
                Currently on Day {currentDay}
              </span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="max-w-md mx-auto">
          <div className="w-full bg-warm-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-sunset h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(unlockedCount / overview.total_days) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-warm-gray-500 mt-2">
            {Math.round((unlockedCount / overview.total_days) * 100)}% complete
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {overview.days.map((day) => (
          <CountdownCard
            key={day.day_number}
            day={day}
            onClick={handleCardClick}
            className="animate-fade-in"
            style={{ 
              animationDelay: `${(25 - day.day_number) * 0.05}s`,
              animationFillMode: 'both'
            }}
          />
        ))}
      </div>

      {/* Call to action */}
      {currentDay && (
        <div className="text-center mt-16 p-8 bg-white/60 backdrop-blur-sm rounded-2xl shadow-romantic border border-white/20">
          <h3 className="text-2xl font-bold text-warm-gray-800 mb-4 romantic-text">
            Ready for today's surprise?
          </h3>
          <p className="text-warm-gray-600 mb-6">
            Day {currentDay} is now available! Click the card above to see what's waiting for you.
          </p>
          <button
            onClick={() => handleCardClick(currentDay)}
            className="btn-romantic text-lg px-8 py-4"
          >
            Open Day {currentDay} 💝
          </button>
        </div>
      )}
    </div>
  );
};

export default CountdownGrid; 