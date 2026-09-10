export const isEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isPassword = (password: string): boolean => {
  return password.length >= 6;
};

export const isRequired = (value: string | number): boolean => {
  if (typeof value === 'number') {
    return !isNaN(value) && value !== null;
  }
  return value !== undefined && value !== null && value.trim().length > 0;
};

export const isInRange = (value: number, min: number, max: number): boolean => {
  if (value === null || value === undefined || isNaN(value)) return false;
  return value >= min && value <= max;
};

export const isMin = (value: number, min: number): boolean => {
  if (value === null || value === undefined || isNaN(value)) return false;
  return value >= min;
};

export const isMax = (value: number, max: number): boolean => {
  if (value === null || value === undefined || isNaN(value)) return false;
  return value <= max;
};

export const isPositive = (value: number): boolean => {
  if (value === null || value === undefined || isNaN(value)) return false;
  return value > 0;
};

export const validateEmail = (email: string): string | null => {
  if (!isRequired(email)) return 'Email is required';
  if (!isEmail(email)) return 'Please enter a valid email address';
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!isRequired(password)) return 'Password is required';
  if (!isPassword(password)) return 'Password must be at least 6 characters';
  return null;
};

export const validateName = (name: string): string | null => {
  if (!isRequired(name)) return 'Name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  return null;
};

export const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
  if (!isRequired(confirmPassword)) return 'Please confirm your password';
  if (password !== confirmPassword) return 'Passwords do not match';
  return null;
};

export const validateNumberField = (
  value: number,
  fieldName: string,
  options?: { min?: number; max?: number; required?: boolean }
): string | null => {
  const { min, max, required = true } = options || {};
  if (required && (value === null || value === undefined || isNaN(value))) {
    return `${fieldName} is required`;
  }
  if (!required && (value === null || value === undefined || isNaN(value))) {
    return null;
  }
  if (min !== undefined && !isMin(value, min)) {
    return `${fieldName} must be at least ${min}`;
  }
  if (max !== undefined && !isMax(value, max)) {
    return `${fieldName} must be at most ${max}`;
  }
  return null;
};

export const validateSelectField = (value: string, fieldName: string): string | null => {
  if (!value || value.trim().length === 0) {
    return `Please select ${fieldName}`;
  }
  return null;
};
