export const formatNumber = (value: number, decimals: number = 2): string => {
  if (value === null || value === undefined || isNaN(value)) return '0';
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatInteger = (value: number): string => {
  if (value === null || value === undefined || isNaN(value)) return '0';
  return Math.round(value).toLocaleString('en-US');
};

export const formatCurrency = (value: number, currency: string = 'USD'): string => {
  if (value === null || value === undefined || isNaN(value)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  const percentage = value > 1 ? value : value * 100;
  return `${percentage.toFixed(decimals)}%`;
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatRelativeDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 5) return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
};

export const formatYield = (value: number, unit: string = 'kg/ha'): string => {
  if (value === null || value === undefined || isNaN(value)) return `0 ${unit}`;
  return `${formatNumber(value)} ${unit}`;
};

export const formatProduction = (value: number, unit: string = 'tons'): string => {
  if (value === null || value === undefined || isNaN(value)) return `0 ${unit}`;
  return `${formatNumber(value)} ${unit}`;
};

export const formatArea = (value: number, unit: string = 'ha'): string => {
  if (value === null || value === undefined || isNaN(value)) return `0 ${unit}`;
  return `${formatNumber(value)} ${unit}`;
};
