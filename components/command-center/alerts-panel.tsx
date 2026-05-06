"use client"

import { AlertTriangle, Bell, CheckCircle, Clock, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { MapMarker } from "@/lib/map-data"

const typeConfig = {
  critical: { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
  warning: { icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  info: { icon: Bell, color: "text-primary", bg: "bg-primary/10" },
  resolved: { icon: CheckCircle, color: "text-accent", bg: "bg-accent/10" },
}

interface AlertsPanelProps {
  onClose: () => void
  markers?: MapMarker[]
}

export function AlertsPanel({ onClose, markers = [] }: AlertsPanelProps) {
  // Generate dynamic alerts from markers
  const dynamicAlerts = markers
    .filter(m => m.type === "alert" || (m.type === "sensor" && m.status === "Alert") || m.status === "Danger")
    .map((m, i) => ({
      id: `dyn-${i}`,
      type: m.status === "Danger" ? "critical" : "warning" as const,
      title: m.label,
      location: m.details.substring(0, 40) + (m.details.length > 40 ? "..." : ""),
      time: "Live Data"
    }))

  const fallbackAlerts = [
    { id: 1, type: "warning" as const, title: "Traffic congestion detected", location: "Jalan Ampang", time: "2 min ago" },
    { id: 2, type: "info" as const, title: "Scheduled maintenance", location: "Pandan Indah", time: "15 min ago" },
    { id: 3, type: "resolved" as const, title: "Power restored", location: "Taman Kosas", time: "32 min ago" },
    { id: 5, type: "info" as const, title: "New sensor online", location: "Zone B-12", time: "1 hr ago" },
  ]

  const alerts = dynamicAlerts.length > 0 ? [...dynamicAlerts, ...fallbackAlerts].slice(0, 5) : fallbackAlerts

  return (
    <div className="flex h-full w-full flex-col">
      <ScrollArea className="flex-1 max-h-[300px] lg:max-h-[none] pr-2">
        <div className="flex flex-col gap-2">
          {alerts.map((alert) => {
            const config = typeConfig[alert.type as keyof typeof typeConfig]
            const Icon = config.icon
            return (
              <div
                key={alert.id}
                className={`flex items-start gap-3 rounded-xl p-3 transition-colors border border-white/5 bg-background/50 hover:bg-white/5`}
              >
                <div className={`mt-0.5 rounded-full p-1.5 ${config.bg} ${config.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground tracking-tight">{alert.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{alert.location}</p>
                  <div className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground uppercase font-medium">
                    <Clock className="h-3 w-3" />
                    {alert.time}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>

      <div className="pt-3 mt-3">
        <Button variant="secondary" className="w-full text-xs rounded-xl h-10 font-semibold" size="sm">
          View All Alerts
        </Button>
      </div>
    </div>
  )
}
