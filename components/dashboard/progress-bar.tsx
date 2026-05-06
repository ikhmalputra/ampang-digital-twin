"use client"

import { cn } from "@/lib/utils"

interface ProgressBarProps {
  label: string
  value: number
  max?: number
  className?: string
  showPercentage?: boolean
  color?: "accent" | "warning" | "critical"
}

const colorConfig = {
  accent: "bg-accent",
  warning: "bg-chart-3",
  critical: "bg-destructive",
}

export function ProgressBar({
  label,
  value,
  max = 100,
  className,
  showPercentage = true,
  color = "accent",
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100)

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
        {showPercentage && (
          <span className="font-bold tabular-nums">{percentage.toFixed(0)}%</span>
        )}
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={cn("h-full rounded-full transition-all duration-500", colorConfig[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
