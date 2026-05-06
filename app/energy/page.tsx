"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { MetricCard } from "@/components/dashboard/metric-card"
import { CityMap } from "@/components/command-center/city-map"
import { Zap, Lightbulb, Battery, Activity } from "lucide-react"
import { type MapMarker } from "@/lib/map-data"

export default function EnergyPage() {
  const [markers, setMarkers] = useState<MapMarker[]>([])
  const [liveData, setLiveData] = useState<any>(null)
  
  const fetchData = () => {
    fetch("/api/realtime")
      .then(res => res.json())
      .then(data => {
        setLiveData(data.metrics)
        // Filter only energy, utility, and lighting related markers
        setMarkers(data.markers.filter((m: MapMarker) => 
          m.type === "lighting" || m.type === "utility" || m.label.includes("TNB") || m.label.includes("Power")
        ))
      })
      .catch(err => console.error("Failed to load live data", err))
  }

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem("dashboard_cache")
      if (cached) {
        const parsed = JSON.parse(cached)
        setLiveData(parsed.metrics)
        setChartData(parsed.charts)
      }
    } catch (e) {}
    fetchData()
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  const powerLoad = liveData?.temperature ? (liveData.temperature * 2.5 + 40).toFixed(1) : "120.5";
  const activeLights = markers.filter(m => m.type === "lighting").length * 113 || 226;
  const networkStatus = markers.some(m => m.status === "Warning" || m.status === "Critical") ? "warning" : "normal";

  return (
    <DashboardLayout 
      title="Energy & Lighting Management" 
      subtitle="Smart grid telemetry and street lighting control"
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <MetricCard
          title="Grid Power Load"
          value={powerLoad.toString()}
          unit="MW"
          subtitle="Current Demand"
          icon={Zap}
          trend={{ value: 2.4, isPositive: false }}
          status={parseFloat(powerLoad) > 130 ? "warning" : "normal"}
        />
        <MetricCard
          title="Smart Lighting"
          value={activeLights.toString()}
          unit="units"
          subtitle="Active LED Poles"
          icon={Lightbulb}
          trend={{ value: 0, isPositive: true }}
          status="normal"
        />
        <MetricCard
          title="Grid Stability"
          value="99.9"
          unit="%"
          subtitle="Uptime (30 days)"
          icon={Activity}
          trend={{ value: 0.1, isPositive: true }}
          status={networkStatus}
        />
        <MetricCard
          title="Battery Storage"
          value="85"
          unit="%"
          subtitle="Backup reserves"
          icon={Battery}
          trend={{ value: 5, isPositive: true }}
          status="normal"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col rounded-3xl border border-white/5 bg-white/5 shadow-sm overflow-hidden h-[600px]">
          <div className="p-5 border-b border-white/5 bg-black/20 flex items-center justify-between">
            <h2 className="font-semibold">Energy Grid (MPAJ Digital Twin)</h2>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-purple-500"></span> Lighting</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-cyan-500"></span> Network Node</span>
            </div>
          </div>
          <div className="flex-1 relative overflow-hidden">
            <CityMap 
              selectedMarker={null} 
              onMarkerSelect={() => {}} 
              basemap="dark" 
              markers={markers} 
              showUtilities={true}
            />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border border-white/5 bg-white/5 shadow-sm p-6">
            <h3 className="font-semibold mb-4">Smart Lighting Zones</h3>
            <div className="space-y-4">
              {markers.filter(m => m.type === "lighting").map(m => {
                const isOperational = m.status === "Operational";
                const colorClass = isOperational ? "text-green-500" : "text-yellow-500";
                const bgClass = isOperational ? "bg-purple-500" : "bg-yellow-500";
                
                // Extract brightness percentage if available, else default to 100
                const brightnessMatch = m.details.match(/(\d+)%/);
                const brightness = brightnessMatch ? parseInt(brightnessMatch[1]) : 100;
                
                return (
                  <div key={m.id} className="flex flex-col gap-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{m.label.replace('Smart Lighting Zone: ', '')}</span>
                      <span className={`${colorClass} font-bold`}>{brightness}% Lux</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div className={`h-full ${bgClass}`} style={{ width: `${brightness}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{m.details}</span>
                  </div>
                )
              })}
              
              {markers.filter(m => m.type === "lighting").length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-4">No active lighting zones detected.</div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/5 shadow-sm p-6 flex-1">
            <h3 className="font-semibold mb-4">Utility Nodes</h3>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-0 md:before:translate-x-0 before:h-full before:w-0.5 before:bg-border">
              
              {markers.filter(m => m.type === "utility").map(m => (
                <div key={m.id} className="relative pl-6">
                  <span className={`absolute left-0 top-1 h-4 w-4 rounded-full border-2 border-background ${m.status === 'Warning' ? 'bg-yellow-500' : m.status === 'Critical' ? 'bg-red-500' : 'bg-cyan-500'}`}></span>
                  <p className="text-sm font-medium">{m.label}</p>
                  <p className="text-xs text-muted-foreground">{m.details}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Status: {m.status}</p>
                </div>
              ))}

              {markers.filter(m => m.type === "utility").length === 0 && (
                <div className="relative pl-6">
                  <span className="absolute left-0 top-1 h-4 w-4 rounded-full border-2 border-background bg-muted"></span>
                  <p className="text-sm font-medium text-muted-foreground">No utility alerts</p>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
