import React from 'react';

export default function InputField({
  label,
  error,
  required = false,
  className = '',
  ...props
}) {
  const inputId = props.id || props.name;

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
      <input
        id={inputId}
        className={`input-field ${error ? 'border-destructive focus-visible:ring-destructive' : ''}`}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}