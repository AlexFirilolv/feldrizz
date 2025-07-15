import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  message = 'Loading...',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      {/* Heart-shaped loading animation */}
      <div className="relative">
        <div className={`${sizeClasses[size]} loading-heart text-warm-orange`}>
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-full h-full"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        
        {/* Pulse rings */}
        <div className="absolute inset-0 animate-ping">
          <div className={`${sizeClasses[size]} border-2 border-soft-pink rounded-full opacity-30`}></div>
        </div>
        <div className="absolute inset-0 animate-pulse delay-150">
          <div className={`${sizeClasses[size]} border border-warm-orange rounded-full opacity-20`}></div>
        </div>
      </div>

      {/* Loading message */}
      {message && (
        <p className={`${textSizeClasses[size]} text-warm-gray-600 romantic-text animate-pulse`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner; 