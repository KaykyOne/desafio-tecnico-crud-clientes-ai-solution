//* Types Imports
import type { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: number;
  icon: ReactNode;
  tone: "neutral" | "active" | "inactive";
};

const toneStyles: Record<StatCardProps["tone"], string> = {
  neutral: "border-border bg-muted text-foreground",
  active: "border-border bg-muted text-foreground",
  inactive: "border-border bg-background text-muted-foreground",
};

export function StatCard({ label, value, icon, tone }: StatCardProps) {
  return (
    <div className={`rounded-2xl border p-5 ${toneStyles[tone]}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold opacity-75">{label}</p>
        <span className="flex size-7 items-center justify-center rounded-lg bg-white/70">{icon}</span>
      </div>
      <p className="mt-4 text-3xl font-black tracking-[-0.06em]">{value}</p>
    </div>
  );
}
