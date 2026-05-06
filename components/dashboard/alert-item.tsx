"use client"

import { cn } from "@/lib/utils"
import { AlertTriangle, Info, XCircle, CheckCircle } from "lucide-react"

type AlertSeverity = "info" | "warning" | "critical" | "resolved"

interface AlertItemProps {
  title: string
  description: string
  time: string
  location?: string
  severity: AlertSeverity
}

const severityConfig = {
  info: {
    icon: Info,
    className: "text-chart-2 bg-chart-2/10",
    dot: "bg-chart-2",
  },
  warning: {
    icon: AlertTriangle,
    className: "text-chart-3 bg-chart-3/10",
    dot: "bg-chart-3",
  },
  critical: {
    icon: XCircle,
    className: "text-destructive bg-destructive/10",
    dot: "bg-destructive",
  },
  resolved: {
    icon: CheckCircle,
    className: "text-accent bg-accent/10",
    dot: "bg-accent",
  },
}

export function AlertItem({ title, description, time, location, severity }: AlertItemProps) {
  const config = severityConfig[severity]
  const Icon = config.icon

  return (
    <div className="group flex items-start gap-3 rounded-2xl border border-white/5 bg-background/50 p-4 transition-colors hover:border-white/10 hover:bg-white/5">
      <div className={cn("rounded-full p-2", config.className)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold tracking-tight leading-tight">{title}</p>
          <span className="shrink-0 text-[10px] uppercase font-medium text-muted-foreground">{time}</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{description}</p>
        {location && (
          <p className="text-[10px] text-muted-foreground font-medium mt-1">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground/50 mr-1.5" />
            {location}
          </p>
        )}
      </div>
    </div>
  )
}
