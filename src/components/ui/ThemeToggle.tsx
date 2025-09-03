"use client";

import React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "./Button";

interface ThemeToggleProps {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function ThemeToggle({
  variant = "ghost",
  size = "md",
  showLabel = false,
}: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant={variant} size={size} disabled>
        <Sun className="h-4 w-4" />
        {showLabel && <span className="ml-2">Theme</span>}
      </Button>
    );
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleTheme}
      className="transition-all duration-200 hover:scale-105"
      title={`Current theme: ${isDark ? "Dark" : "Light"}. Click to toggle.`}
      aria-label="Toggle theme"
    >
      {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      {showLabel && <span className="ml-2">{isDark ? "Dark" : "Light"}</span>}
    </Button>
  );
}

export default ThemeToggle;
