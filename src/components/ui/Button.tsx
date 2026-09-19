import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg disabled:opacity-50 disabled:pointer-events-none";

  const variantStyles = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-600/30 focus:ring-blue-500",
    secondary: "bg-dark-card hover:bg-dark-cardHover text-dark-heading border border-dark-border hover:border-dark-borderHover focus:ring-dark-border",
    outline: "bg-transparent hover:bg-white/5 text-dark-heading border border-dark-border hover:border-dark-borderHover focus:ring-slate-500",
    ghost: "bg-transparent hover:bg-white/5 text-dark-text hover:text-dark-heading",
  };

  const sizeStyles = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2 gap-2",
    lg: "text-base px-5 py-2.5 gap-2.5",
    icon: "h-9 w-9 p-0",
  };

  return (
    <button
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
