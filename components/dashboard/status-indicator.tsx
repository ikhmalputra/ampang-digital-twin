"use client"

import { cn } from "@/lib/utils"

interface StatusIndicatorProps {
  label: string
  value: string | number
  status: "operational" | "degraded" | "outage"
}

const statusConfig = {
  operational: {
    label: "Operational",
    className: "bg-accent",
  },
  degraded: {
    label: "Degraded",
    className: "bg-chart-3",
  },
  outage: {
    label: "Outage",
    className: "bg-destructive",
  },
}

export function StatusIndicator({ label, value, status }: StatusIndicatorProps) {
  const config = statusConfig[status]

  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 -mx-2 rounded-lg transition-colors">
      <div className="flex items-center gap-3">
        <div className={cn("h-2 w-2 rounded-full", config.className)} />
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold tabular-nums">{value}</span>
        <span className="text-[10px] uppercase font-bold text-muted-foreground">{config.label}</span>
      </div>
    </div>
  )
}
