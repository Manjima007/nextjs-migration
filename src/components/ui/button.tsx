"use client";

import { motion } from "framer-motion";
import { ReactNode, forwardRef, ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  children: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", loading, fullWidth, children, disabled, ...props }, ref) => {
    const variants = {
      default: "btn-primary text-white font-heading font-semibold shadow-lg hover:shadow-xl",
      destructive: "bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl font-heading font-semibold",
      outline: "border-2 border-gray-600 bg-transparent text-gray-300 hover:bg-gray-800 hover:text-white hover:border-primary-500 transition-all font-heading font-medium",
      secondary: "bg-gray-800 text-gray-100 hover:bg-gray-700 shadow-lg hover:shadow-xl font-heading font-semibold",
      ghost: "bg-transparent text-gray-300 hover:bg-gray-800 hover:text-white font-heading font-medium",
      link: "bg-transparent text-primary-400 hover:text-primary-300 underline-offset-4 hover:underline font-heading font-medium",
    };

    const sizes = {
      default: "h-12 lg:h-14 px-6 lg:px-8 py-3 lg:py-4 text-base lg:text-lg",
      sm: "h-10 lg:h-11 px-4 lg:px-5 py-2 lg:py-3 text-sm lg:text-base",
      lg: "h-14 lg:h-16 px-8 lg:px-10 py-4 lg:py-5 text-lg lg:text-xl",
      icon: "h-12 w-12 lg:h-14 lg:w-14",
    };

    const baseClasses = "relative inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-900 disabled:opacity-50 disabled:pointer-events-none overflow-hidden";
    
    const combinedClassName = [
      baseClasses,
      variants[variant],
      sizes[size],
      fullWidth && "w-full",
      className
    ].filter(Boolean).join(" ");

    const MotionButton = motion.button as any;

    return (
      <MotionButton
        ref={ref}
        className={combinedClassName}
        disabled={disabled || loading}
        whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
        whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full loading-spin" />
          </div>
        )}
        <span className={`font-heading ${loading ? "opacity-0" : "opacity-100"}`}>
          {children}
        </span>
      </MotionButton>
    );
  }
);

Button.displayName = "Button";

export { Button };