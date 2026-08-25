"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

import { Switch } from "@/components/ui/switch";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Deferring to a mounted flag avoids a hydration mismatch, since the server can't know the stored theme.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <div className="flex items-center justify-between rounded-md border bg-card px-3 py-2.5">
      <div className="flex items-center gap-2 text-muted-foreground">
        {isDark ? <Moon className="size-4" /> : <Sun className="size-4" />}
        <span className="text-[0.72rem] font-semibold">Tema escuro</span>
      </div>
      <Switch
        size="sm"
        checked={isDark}
        disabled={!mounted}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        aria-label="Alternar tema escuro"
      />
    </div>
  );
}
