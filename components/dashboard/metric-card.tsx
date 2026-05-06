"use client"

import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  unit?: string
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  status?: "normal" | "warning" | "critical"
  className?: string
}

export function MetricCard({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  trend,
  status = "normal",
  className,
}: MetricCardProps) {
  const statusColors = {
    normal: "text-accent",
    warning: "text-chart-3",
    critical: "text-destructive",
  }

  return (
    <div
      className={cn(
        "group relative rounded-3xl border border-white/5 bg-white/5 p-6 transition-all duration-300 hover:bg-white/10",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-1.5">
            <span className={cn("text-4xl font-bold tracking-tight", statusColors[status])}>
              {value}
            </span>
            {unit && <span className="text-sm font-semibold text-muted-foreground">{unit}</span>}
          </div>
          {subtitle && (
            <p className="text-xs font-medium text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className="rounded-xl bg-white/5 p-3 shadow-sm border border-white/5 group-hover:bg-white/10 transition-colors">
          <Icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
      </div>
      {trend && (
        <div className="mt-5 flex items-center gap-2 bg-black/20 rounded-lg px-2.5 py-1.5 w-max">
          <span
            className={cn(
              "text-xs font-bold",
              trend.isPositive ? "text-accent" : "text-destructive"
            )}
          >
            {trend.isPositive ? "+" : ""}{trend.value}%
          </span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">from last hour</span>
        </div>
      )}
    </div>
  )
}
