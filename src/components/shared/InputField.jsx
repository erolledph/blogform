import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function InputField({
  label,
  error,
  required = false,
  className = '',
  type = 'text',
  showPasswordToggle = false,
  icon: Icon = null,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = props.id || props.name;
  const actualType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={className}>
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-base font-medium text-foreground mb-4"
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
        <input
          id={inputId}
          type={actualType}
          className={`input-field ${Icon ? 'pl-12' : ''} ${showPasswordToggle ? 'pr-12' : ''} ${error ? 'border-destructive focus-visible:ring-destructive' : ''}`}
          {...props}
        />
        {showPasswordToggle && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Eye className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}