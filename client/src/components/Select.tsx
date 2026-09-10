import React from 'react';
import type { SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  helperText,
  options,
  placeholder,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-earth-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={inputId}
          className={`
            w-full rounded-lg border text-sm transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            appearance-none bg-white
            pl-4 pr-10 py-2.5
            ${error ? 'border-red-300 bg-red-50 focus:ring-red-500' : 'border-earth-200 hover:border-earth-300'}
            ${props.value === '' || !props.value ? 'text-earth-500' : 'text-earth-800'}
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-earth-400">
          <ChevronDown size={18} />
        </div>
      </div>
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
      {!error && helperText && (
        <p className="mt-1.5 text-sm text-earth-500">{helperText}</p>
      )}
    </div>
  );
};

export default Select;
