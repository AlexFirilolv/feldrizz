import React from 'react';
import { LockClosedIcon, HeartIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { CountdownCardProps } from '../types';
import clsx from 'clsx';

const CountdownCard: React.FC<CountdownCardProps & { style?: React.CSSProperties }> = ({ 
  day, 
  onClick, 
  className = '',
  style
}) => {
  const handleClick = () => {
    if (day.is_unlocked) {
      onClick(day.day_number);
    }
  };

  const isSpecialDay = day.day_number === 1 || day.day_number === 25;

  return (
    <div
      onClick={handleClick}
      style={style}
      className={clsx(
        'countdown-card relative overflow-hidden group',
        day.is_unlocked ? 'unlocked cursor-pointer' : 'locked',
        isSpecialDay && 'ring-2 ring-warm-orange ring-opacity-50',
        className
      )}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-warm-orange to-soft-pink"></div>
        {day.is_unlocked && (
          <div className="absolute inset-0">
            <HeartIconSolid className="w-4 h-4 text-warm-orange opacity-10 absolute top-2 right-2" />
            <SparklesIcon className="w-3 h-3 text-soft-pink opacity-10 absolute bottom-2 left-2" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 p-4 md:p-6 h-full flex flex-col items-center justify-center text-center">
        {/* Day number */}
        <div className={clsx(
          'text-3xl md:text-4xl font-bold mb-3 transition-all duration-300',
          day.is_unlocked 
            ? 'text-warm-gray-800 group-hover:text-warm-orange' 
            : 'text-warm-gray-400'
        )}>
          {day.day_number}
        </div>

        {/* Title */}
        <h3 className={clsx(
          'text-sm md:text-base font-medium mb-3 transition-all duration-300',
          day.is_unlocked 
            ? 'text-warm-gray-700 group-hover:text-warm-gray-800' 
            : 'text-warm-gray-400'
        )}>
          {day.title}
        </h3>

        {/* Status indicator */}
        <div className="flex items-center justify-center">
          {day.is_unlocked ? (
            <div className="flex items-center space-x-2">
              <HeartIcon className="w-5 h-5 text-warm-orange animate-pulse-soft" />
              <span className="text-xs text-warm-gray-600 romantic-text">
                Unlocked
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <LockClosedIcon className="w-5 h-5 text-warm-gray-400" />
              <span className="text-xs text-warm-gray-400">
                Locked
              </span>
            </div>
          )}
        </div>

        {/* Special day indicator */}
        {isSpecialDay && day.is_unlocked && (
          <div className="absolute top-2 right-2">
            <div className="w-3 h-3 bg-warm-orange rounded-full animate-ping"></div>
            <div className="absolute inset-0 w-3 h-3 bg-warm-orange rounded-full"></div>
          </div>
        )}
      </div>

      {/* Hover effect overlay */}
      {day.is_unlocked && (
        <div className="absolute inset-0 bg-gradient-soft opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
      )}

      {/* Click ripple effect */}
      {day.is_unlocked && (
        <div className="absolute inset-0 bg-warm-orange opacity-0 group-active:opacity-10 transition-opacity duration-150 ease-out"></div>
      )}
    </div>
  );
};

export default CountdownCard; 