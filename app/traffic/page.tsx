"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { MetricCard } from "@/components/dashboard/metric-card"
import { CityMap } from "@/components/command-center/city-map"
import { Car, AlertTriangle, Clock, Navigation } from "lucide-react"
import { type MapMarker } from "@/lib/map-data"

export default function TrafficPage() {
  const [markers, setMarkers] = useState<MapMarker[]>([])
  const [liveData, setLiveData] = useState<any>(null)
  
  const fetchData = () => {
    fetch("/api/realtime")
      .then(res => res.json())
      .then(data => {
        setLiveData(data.metrics)
        // Filter only traffic, camera, and alert related markers
        setMarkers(data.markers.filter((m: MapMarker) => 
          m.type === "traffic" || m.type === "camera" || m.type === "alert"
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

  const avgSpeed = liveData?.trafficFlow 
    ? Math.max(10, 60 - Math.floor(liveData.trafficFlow / 20)) 
    : 34;
  const activeJams = markers.filter(m => m.type === "traffic" && (m.status === "Heavy" || m.status === "Moderate")).length;
  
  return (
    <DashboardLayout 
      title="Traffic & Transport Management" 
      subtitle="Real-time congestion monitoring and public transit telemetry"
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <MetricCard
          title="Average Speed"
          value={avgSpeed.toString()}
          unit="km/h"
          subtitle="Ampang Jaya Core"
          icon={Car}
          trend={{ value: 2, isPositive: avgSpeed > 30 }}
          status={avgSpeed < 20 ? "warning" : "normal"}
        />
        <MetricCard
          title="Active Traffic Jams"
          value={activeJams.toString()}
          unit="incidents"
          subtitle="Live Sensor Data"
          icon={AlertTriangle}
          trend={{ value: 1, isPositive: false }}
          status={activeJams > 5 ? "warning" : "normal"}
        />
        <MetricCard
          title="Est. Travel Time"
          value="24"
          unit="mins"
          subtitle="Ampang Point to KLCC"
          icon={Clock}
          trend={{ value: 5, isPositive: false }}
          status="warning"
        />
        <MetricCard
          title="LRT Ampang Line"
          value="Normal"
          unit="status"
          subtitle="All trains on schedule"
          icon={Navigation}
          trend={{ value: 0, isPositive: true }}
          status="normal"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col rounded-3xl border border-white/5 bg-white/5 shadow-sm overflow-hidden h-[600px]">
          <div className="p-5 border-b border-white/5 bg-black/20 flex items-center justify-between">
            <h2 className="font-semibold">Live Traffic Flow (MPAJ Digital Twin)</h2>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500"></span> Clear</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500"></span> Moderate</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span> Heavy</span>
            </div>
          </div>
          <div className="flex-1 relative overflow-hidden">
            <CityMap 
              selectedMarker={null} 
              onMarkerSelect={() => {}} 
              basemap="dark" 
              markers={markers} 
              liveTraffic={true}
            />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border border-white/5 bg-white/5 shadow-sm p-6">
            <h3 className="font-semibold mb-4">Congestion Hotspots</h3>
            <div className="space-y-4">
              {markers.filter(m => m.type === "traffic").map(m => {
                const isHeavy = m.status === "Heavy";
                const isModerate = m.status === "Moderate";
                const colorClass = isHeavy ? "text-red-500" : isModerate ? "text-yellow-500" : "text-green-500";
                const bgClass = isHeavy ? "bg-red-500" : isModerate ? "bg-yellow-500" : "bg-green-500";
                const widthClass = isHeavy ? "w-[85%]" : isModerate ? "w-[60%]" : "w-[30%]";
                
                return (
                  <div key={m.id} className="flex flex-col gap-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{m.label}</span>
                      <span className={`${colorClass} font-bold`}>{m.status}</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div className={`h-full ${bgClass} ${widthClass}`} />
                    </div>
                    <span className="text-xs text-muted-foreground">{m.details}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/5 shadow-sm p-6 flex-1">
            <h3 className="font-semibold mb-4">Live Incident Feed</h3>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-0 md:before:translate-x-0 before:h-full before:w-0.5 before:bg-border">
              
              {markers.filter(m => m.type === "alert").map(m => (
                <div key={m.id} className="relative pl-6">
                  <span className="absolute left-0 top-1 h-4 w-4 rounded-full border-2 border-background bg-red-500"></span>
                  <p className="text-sm font-medium">{m.label}</p>
                  <p className="text-xs text-muted-foreground">{m.details}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Live • Automated Detection</p>
                </div>
              ))}

              <div className="relative pl-6">
                <span className="absolute left-0 top-1 h-4 w-4 rounded-full border-2 border-background bg-blue-500"></span>
                <p className="text-sm font-medium">Roadworks (Scheduled)</p>
                <p className="text-xs text-muted-foreground">Jalan Cahaya. Right lane closed for pipe repair.</p>
                <p className="text-[10px] text-muted-foreground mt-1">Active • MPAJ Ops</p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
