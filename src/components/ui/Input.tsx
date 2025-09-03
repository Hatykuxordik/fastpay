import React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-900 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-20">
            <div className="text-gray-400 dark:text-gray-500 w-5 h-5 flex items-center justify-center">
              {React.cloneElement(icon as React.ReactElement, {
                className: "w-5 h-5",
              })}
            </div>
          </div>
        )}
        <input
          className={cn(
            "block w-full py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 !bg-white !text-gray-900 dark:text-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-colors text-base leading-6 relative z-10",
            icon ? "!pl-12 pr-10" : "px-4",
            "placeholder:text-gray-400 dark:placeholder:text-gray-500 placeholder:opacity-100",
            error &&
              "border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500",
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};
