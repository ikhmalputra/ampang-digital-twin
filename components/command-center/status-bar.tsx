"use client"

import { useState, useEffect } from "react"
import { Activity, Wifi, Shield, Thermometer, Droplets, Wind } from "lucide-react"
import Image from "next/image"

interface StatusItemProps {
  icon: React.ReactNode
  label: string
  value: string
  status?: "good" | "warning" | "critical"
}

function StatusItem({ icon, label, value, status = "good" }: StatusItemProps) {
  const statusColors = {
    good: "text-accent",
    warning: "text-yellow-500",
    critical: "text-red-500",
  }

  return (
    <div className="flex items-center gap-3">
      <div className="text-muted-foreground">{icon}</div>
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className={`text-sm font-semibold ${statusColors[status]}`}>{value}</span>
      </div>
    </div>
  )
}

export function StatusBar() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [liveData, setLiveData] = useState<any>(null)

  useEffect(() => {
    setCurrentTime(new Date())
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute

    const fetchRealtime = () => {
      fetch("/api/realtime")
        .then(r => r.json())
        .then(data => setLiveData(data.metrics))
        .catch(e => console.error(e))
    }
    fetchRealtime()
    const realtimeTimer = setInterval(fetchRealtime, 60000)

    return () => {
      clearInterval(timer)
      clearInterval(realtimeTimer)
    }
  }, [])

  const aqi = liveData?.aqis?.[0]?.api_value ?? 52
  const temp = liveData?.temperature ?? 32
  const precip = liveData?.precipitation ?? 0

  return (
    <div className="absolute top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:right-auto z-50 flex h-14 items-center justify-between rounded-full border border-white/10 bg-background/60 px-4 md:px-6 backdrop-blur-2xl shadow-xl md:w-auto md:min-w-[60%]">
      {/* Logo and Title */}
      <div className="flex items-center gap-3 pr-2 md:pr-6 md:border-r border-white/10 shrink-0">
        <div className="relative h-9 w-9 overflow-hidden rounded-full bg-white p-0.5 shadow-sm">
          <Image
            src="/mpaj-logo.jpg"
            alt="MPAJ"
            fill
            className="object-contain"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">Ampang Jaya</span>
          <span className="text-[10px] uppercase tracking-wider text-primary">Command Center</span>
        </div>
      </div>

      {/* Status Metrics */}
      <div className="hidden items-center gap-6 px-6 md:flex">
        <StatusItem
          icon={<Activity className="h-4 w-4" />}
          label="System Status"
          value="Operational"
          status="good"
        />
        <StatusItem
          icon={<Wifi className="h-4 w-4" />}
          label="IoT Devices"
          value="1,247 Online"
          status="good"
        />
        <StatusItem
          icon={<Thermometer className="h-4 w-4" />}
          label="Temperature"
          value={`${temp}°C`}
          status={temp > 35 ? "warning" : "good"}
        />
        <StatusItem
          icon={<Wind className="h-4 w-4" />}
          label="Air Quality"
          value={`AQI ${aqi}`}
          status={aqi > 100 ? "warning" : "good"}
        />
      </div>

      {/* Time */}
      <div className="flex items-center gap-2 md:gap-4 pl-2 md:pl-6 md:border-l border-white/10 shrink-0">
        <div className="flex flex-col items-end">
          <span className="text-sm font-semibold text-foreground tracking-tight">
            {currentTime ? currentTime.toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" }) : "--:--"}
          </span>
          <span className="text-[10px] text-muted-foreground uppercase hidden sm:inline-block">
            {currentTime ? currentTime.toLocaleDateString("en-MY", { weekday: "short", day: "numeric", month: "short" }) : "---"}
          </span>
        </div>
        <div className="flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-full bg-red-500/20 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
          <span className="text-[8px] md:text-[10px] font-bold">LIVE</span>
        </div>
      </div>
    </div>
  )
}
