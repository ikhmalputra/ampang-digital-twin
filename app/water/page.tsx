"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { MetricCard } from "@/components/dashboard/metric-card"
import { CityMap } from "@/components/command-center/city-map"
import { Droplets, AlertTriangle, Waves, Activity } from "lucide-react"
import { type MapMarker } from "@/lib/map-data"

export default function WaterPage() {
  const [markers, setMarkers] = useState<MapMarker[]>([])
  const [liveData, setLiveData] = useState<any>(null)
  
  const fetchData = () => {
    fetch("/api/realtime")
      .then(res => res.json())
      .then(data => {
        setLiveData(data.metrics)
        // Filter only water, river, and IWK related markers
        setMarkers(data.markers.filter((m: MapMarker) => 
          m.type === "sensor" && (m.label.includes("Flood") || m.label.includes("River")) || m.type === "iwk"
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

  const rainfall = liveData?.precipitation ? liveData.precipitation.toFixed(1) : "0.0";
  const activeAlerts = markers.filter(m => m.status === "Warning" || m.status === "Alert" || m.status === "Danger").length;
  const floodRisk = activeAlerts > 0 ? "High" : parseFloat(rainfall) > 20 ? "Moderate" : "Low";

  return (
    <DashboardLayout 
      title="Water & Drainage Management" 
      subtitle="JPS Flood Sensors & Air Selangor Pipeline Management"
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <MetricCard
          title="Daily Rainfall"
          value={rainfall.toString()}
          unit="mm"
          subtitle="Ampang Jaya Average"
          icon={Droplets}
          trend={{ value: 5, isPositive: false }}
          status={parseFloat(rainfall) > 50 ? "warning" : "normal"}
        />
        <MetricCard
          title="Active Flood Alerts"
          value={activeAlerts.toString()}
          unit="zones"
          subtitle="JPS River Sensors"
          icon={AlertTriangle}
          trend={{ value: activeAlerts, isPositive: false }}
          status={activeAlerts > 0 ? "warning" : "normal"}
        />
        <MetricCard
          title="Flood Risk Level"
          value={floodRisk}
          unit=""
          subtitle="Predictive Analysis"
          icon={Waves}
          trend={{ value: 0, isPositive: true }}
          status={floodRisk === "Low" ? "normal" : "warning"}
        />
        <MetricCard
          title="IWK Facilities"
          value={markers.filter(m => m.type === "iwk").length.toString()}
          unit="online"
          subtitle="Sewage Treatment Plants"
          icon={Activity}
          trend={{ value: 0, isPositive: true }}
          status="normal"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col rounded-3xl border border-white/5 bg-white/5 shadow-sm overflow-hidden h-[600px]">
          <div className="p-5 border-b border-white/5 bg-black/20 flex items-center justify-between">
            <h2 className="font-semibold">Water Infrastructure (MPAJ Digital Twin)</h2>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500"></span> River Sensor</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-teal-500"></span> IWK Facility</span>
            </div>
          </div>
          <div className="flex-1 relative overflow-hidden">
            <CityMap 
              selectedMarker={null} 
              onMarkerSelect={() => {}} 
              basemap="dark" 
              markers={markers} 
              simulationMode={parseFloat(rainfall) > 0}
              rainfall={parseFloat(rainfall)}
              layerVisibility={{
                buildings: false,
                traffic: false,
                markers: true,
                boundary: true,
                landPlots: false,
                parks: false,
                water: true,
                pois: false,
                aqi: false,
                riverLevel: true
              }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border border-white/5 bg-white/5 shadow-sm p-6">
            <h3 className="font-semibold mb-4">River Level Telemetry (JPS)</h3>
            <div className="space-y-4">
              {markers.filter(m => m.label.includes("Flood")).map(m => {
                const isDanger = m.status === "Danger" || m.status === "Alert";
                const isWarning = m.status === "Warning";
                const colorClass = isDanger ? "text-red-500" : isWarning ? "text-yellow-500" : "text-green-500";
                const bgClass = isDanger ? "bg-red-500" : isWarning ? "bg-yellow-500" : "bg-green-500";
                
                // Extract water level percentage (mocked from details string)
                const levelMatch = m.details.match(/([\d.]+)m/);
                const dangerMatch = m.details.match(/Danger: ([\d.]+)m/);
                const currentLevel = levelMatch ? parseFloat(levelMatch[1]) : 0;
                const dangerLevel = dangerMatch ? parseFloat(dangerMatch[1]) : 10;
                const percentage = Math.min(100, (currentLevel / dangerLevel) * 100);
                
                return (
                  <div key={m.id} className="flex flex-col gap-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{m.label.replace('Flood Sensor: ', '')}</span>
                      <span className={`${colorClass} font-bold`}>{currentLevel}m / {dangerLevel}m</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div className={`h-full ${bgClass}`} style={{ width: `${percentage}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{m.details}</span>
                  </div>
                )
              })}
              
              {markers.filter(m => m.label.includes("Flood")).length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-4">No river sensors detected.</div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/5 shadow-sm p-6 flex-1">
            <h3 className="font-semibold mb-4">IWK Treatment Plants</h3>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-0 md:before:translate-x-0 before:h-full before:w-0.5 before:bg-border">
              
              {markers.filter(m => m.type === "iwk").map(m => (
                <div key={m.id} className="relative pl-6">
                  <span className={`absolute left-0 top-1 h-4 w-4 rounded-full border-2 border-background ${m.status === 'Warning' ? 'bg-yellow-500' : m.status === 'Critical' ? 'bg-red-500' : 'bg-teal-500'}`}></span>
                  <p className="text-sm font-medium">{m.label}</p>
                  <p className="text-xs text-muted-foreground">{m.details}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Status: {m.status}</p>
                </div>
              ))}

              {markers.filter(m => m.type === "iwk").length === 0 && (
                <div className="relative pl-6">
                  <span className="absolute left-0 top-1 h-4 w-4 rounded-full border-2 border-background bg-muted"></span>
                  <p className="text-sm font-medium text-muted-foreground">No IWK facilities mapped</p>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
