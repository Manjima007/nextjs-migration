"use client";

import { forwardRef, ReactNode } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, leftIcon, rightIcon, error, helperText, ...props }, ref) => {
    const baseClasses = "w-full bg-gray-800/60 border border-gray-600 rounded-lg px-4 lg:px-5 py-3 lg:py-4 text-base lg:text-lg text-white placeholder-gray-400 font-body transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 form-input";
    
    const leftPadding = leftIcon ? "pl-12 lg:pl-14" : "px-4 lg:px-5";
    const rightPadding = rightIcon ? "pr-12 lg:pr-14" : "px-4 lg:px-5";
    
    const combinedClassName = [
      baseClasses,
      leftPadding,
      rightPadding,
      error && "border-red-500 focus:border-red-500 focus:ring-red-500/50",
      className
    ].filter(Boolean).join(" ");

    return (
      <div className="space-y-3">
        {label && (
          <label className="block text-sm lg:text-base font-medium font-heading text-gray-200">
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 lg:left-5 top-1/2 transform -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            className={combinedClassName}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-4 lg:right-5 top-1/2 transform -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        
        {error && (
          <p className="text-sm text-red-400 font-body">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="text-sm text-gray-400 font-body">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };