"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      aria-label="Ganti tema"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      size="icon"
      title="Ganti tema"
      type="button"
      variant="outline"
    >
      <span className="relative flex size-4 items-center justify-center">
        <Sun
          className="absolute size-4 rotate-0 scale-100 transition dark:-rotate-90 dark:scale-0"
          aria-hidden="true"
        />
        <Moon
          className="absolute size-4 rotate-90 scale-0 transition dark:rotate-0 dark:scale-100"
          aria-hidden="true"
        />
      </span>
    </Button>
  );
}
