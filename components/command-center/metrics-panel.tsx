"use client"

import { Car, Zap, Droplets, TreePine, TrendingUp, TrendingDown, Minus, CloudRain } from "lucide-react"
import type { MapMarker } from "@/lib/map-data"

interface MetricCardProps {
  icon: React.ReactNode
  label: string
  value: string
  change: number
  unit?: string
}

function MetricCard({ icon, label, value, change, unit }: MetricCardProps) {
  const getTrendIcon = () => {
    if (change > 0) return <TrendingUp className="h-3 w-3 text-accent" />
    if (change < 0) return <TrendingDown className="h-3 w-3 text-red-500" />
    return <Minus className="h-3 w-3 text-muted-foreground" />
  }

  const getTrendColor = () => {
    if (change > 0) return "text-accent"
    if (change < 0) return "text-red-500"
    return "text-muted-foreground"
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/5 border border-white/10 p-4 transition-colors hover:bg-white/10">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/20 text-primary shadow-sm">
          {icon}
        </div>
        <div className="flex flex-col">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-bold tracking-tight text-foreground">{value}</span>
            {unit && <span className="text-xs text-muted-foreground font-medium">{unit}</span>}
          </div>
        </div>
      </div>
      <div className={`flex flex-col items-end gap-1 ${getTrendColor()}`}>
        <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md">
          {getTrendIcon()}
          <span className="text-xs font-bold">{Math.abs(change)}%</span>
        </div>
      </div>
    </div>
  )
}

interface MetricsPanelProps {
  markers?: MapMarker[]
}

export function MetricsPanel({ markers = [] }: MetricsPanelProps) {
  // Find real-time air quality marker
  const aqiMarker = markers.find(m => m.label.includes("Air Quality"))
  const aqiValue = aqiMarker ? aqiMarker.details.split("Value: ")[1] : "52"

  // Find real-time water/flood marker
  const floodMarker = markers.find(m => m.label.includes("Sungai Ampang"))
  const waterValue = floodMarker ? floodMarker.details.split(" ")[0] : "2.3m"

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-col gap-2">
        <MetricCard
          icon={<Car className="h-5 w-5" />}
          label="Traffic Flow"
          value="12.4K"
          change={8.2}
          unit="veh/hr"
        />
        <MetricCard
          icon={<TreePine className="h-5 w-5" />}
          label="Air Quality (API)"
          value={aqiValue}
          change={-2.1}
          unit=""
        />
        <MetricCard
          icon={<CloudRain className="h-5 w-5" />}
          label="River Water Level"
          value={waterValue}
          change={1.5}
          unit=""
        />
        <MetricCard
          icon={<Zap className="h-5 w-5" />}
          label="Smart Lighting"
          value="142"
          change={0}
          unit="active"
        />
      </div>
    </div>
  )
}
