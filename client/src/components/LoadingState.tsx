import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullHeight?: boolean;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  size = 'md',
  fullHeight = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const heightStyles = fullHeight ? 'min-h-[400px]' : '';

  return (
    <div
      className={`
        flex flex-col items-center justify-center py-12 px-4
        ${heightStyles}
        ${className}
      `}
    >
      <div className="relative">
        <div className="absolute inset-0 bg-primary-100 rounded-full animate-ping opacity-25" />
        <Loader2
          className={`${sizeClasses[size]} text-primary-600 animate-spin relative z-10`}
        />
      </div>
      {message && (
        <p className="mt-4 text-earth-600 text-sm font-medium">{message}</p>
      )}
    </div>
  );
};

export const LoadingSpinner: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <Loader2 className={`animate-spin text-primary-600 ${className}`} />
  );
};

export default LoadingState;
