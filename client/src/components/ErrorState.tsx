import React, { type ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  children?: ReactNode;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An error occurred while fetching data. Please try again.',
  onRetry,
  children,
  className = '',
}) => {
  return (
    <div
      className={`
        flex flex-col items-center justify-center py-16 px-4 text-center
        ${className}
      `}
    >
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-5">
        <AlertCircle size={32} className="text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-earth-800 mb-2">{title}</h3>
      <p className="text-earth-500 text-sm max-w-sm mb-6">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} size="md" leftIcon={<RefreshCw size={16} />}>
          Try Again
        </Button>
      )}
      {children}
    </div>
  );
};

interface InlineErrorProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const InlineError: React.FC<InlineErrorProps> = ({
  message,
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`
        flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-100
        ${className}
      `}
    >
      <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
      <p className="flex-1 text-sm text-red-700">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm font-medium text-red-700 hover:text-red-800 hover:underline"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorState;
