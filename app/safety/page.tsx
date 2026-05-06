"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { MetricCard } from "@/components/dashboard/metric-card"
import { CityMap } from "@/components/command-center/city-map"
import { ShieldAlert, PhoneCall, Siren, Activity, Video } from "lucide-react"
import { type MapMarker } from "@/lib/map-data"

export default function SafetyPage() {
  const [markers, setMarkers] = useState<MapMarker[]>([])
  const [liveData, setLiveData] = useState<any>(null)
  
  const fetchData = () => {
    fetch("/api/realtime")
      .then(res => res.json())
      .then(data => {
        setLiveData(data.metrics)
        // Filter only safety, camera, and emergency related markers
        setMarkers(data.markers.filter((m: MapMarker) => 
          m.type === "facility" || m.type === "camera" || m.label.includes("PDRM") || m.label.includes("BOMBA") || m.label.includes("999")
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

  // Calculate dynamic metrics based on markers
  const activeEmergencies = markers.filter(m => m.label.includes("PDRM") || m.label.includes("BOMBA") || m.label.includes("999")).length;
  const activeCCTVs = markers.filter(m => m.type === "camera").length;
  const responderUnits = markers.filter(m => m.type === "facility").length * 3; // Simulated units based on facilities

  return (
    <DashboardLayout 
      title="Public Safety & Emergency Response" 
      subtitle="PDRM, Bomba, & MERS 999 Integrated Dispatch System"
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <MetricCard
          title="Active 999 Calls"
          value={activeEmergencies.toString()}
          unit="ongoing"
          subtitle="Ampang Jaya Sector"
          icon={PhoneCall}
          trend={{ value: 2, isPositive: false }}
          status={activeEmergencies > 2 ? "warning" : "normal"}
        />
        <MetricCard
          title="Avg Response Time"
          value="4.2"
          unit="mins"
          subtitle="PDRM / Bomba SLA"
          icon={Siren}
          trend={{ value: 0.5, isPositive: true }}
          status="normal"
        />
        <MetricCard
          title="Active Patrols"
          value={responderUnits.toString()}
          unit="units"
          subtitle="MPV & URB deployed"
          icon={ShieldAlert}
          trend={{ value: 2, isPositive: true }}
          status="normal"
        />
        <MetricCard
          title="CCTV Analytics"
          value={activeCCTVs.toString()}
          unit="online"
          subtitle="AI Threat Detection"
          icon={Video}
          trend={{ value: 0, isPositive: true }}
          status="normal"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col rounded-3xl border border-white/5 bg-white/5 shadow-sm overflow-hidden h-[600px]">
          <div className="p-5 border-b border-white/5 bg-black/20 flex items-center justify-between">
            <h2 className="font-semibold">Live Dispatch Map (MPAJ Digital Twin)</h2>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span> Emergency</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-indigo-500"></span> Facility</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500"></span> CCTV</span>
            </div>
          </div>
          <div className="flex-1 relative overflow-hidden">
            <CityMap 
              selectedMarker={null} 
              onMarkerSelect={() => {}} 
              basemap="dark" 
              markers={markers} 
              layerVisibility={{
                buildings: true,
                traffic: false,
                markers: true,
                boundary: true,
                landPlots: false,
                parks: false,
                water: false,
                pois: false,
                aqi: false,
                riverLevel: false
              }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border border-white/5 bg-white/5 shadow-sm p-6">
            <h3 className="font-semibold mb-4 text-red-500 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              Active Emergency Dispatches
            </h3>
            <div className="space-y-4">
              {markers.filter(m => m.label.includes("PDRM") || m.label.includes("BOMBA") || m.label.includes("999")).map(m => {
                const isCritical = m.status === "Critical";
                const bgClass = isCritical ? "bg-red-500/10 border-red-500/20" : "bg-yellow-500/10 border-yellow-500/20";
                const textClass = isCritical ? "text-red-500" : "text-yellow-500";
                
                return (
                  <div key={m.id} className={`flex flex-col gap-2 p-3 rounded-lg border ${bgClass}`}>
                    <div className="flex justify-between items-start">
                      <span className={`font-bold text-sm ${textClass}`}>{m.label}</span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${isCritical ? 'bg-red-500 text-white' : 'bg-yellow-500 text-black'}`}>
                        {m.status}
                      </span>
                    </div>
                    <span className="text-xs text-foreground/80 leading-relaxed">{m.details}</span>
                  </div>
                )
              })}
              
              {markers.filter(m => m.label.includes("PDRM") || m.label.includes("BOMBA") || m.label.includes("999")).length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-8">No active emergencies in the sector.</div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/5 shadow-sm p-6 flex-1">
            <h3 className="font-semibold mb-4">Command Centers & Facilities</h3>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-0 md:before:translate-x-0 before:h-full before:w-0.5 before:bg-border">
              
              {markers.filter(m => m.type === "facility").map(m => (
                <div key={m.id} className="relative pl-6">
                  <span className={`absolute left-0 top-1 h-4 w-4 rounded-full border-2 border-background bg-indigo-500`}></span>
                  <p className="text-sm font-medium">{m.label}</p>
                  <p className="text-xs text-muted-foreground">{m.details}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Status: {m.status}</p>
                </div>
              ))}

              {markers.filter(m => m.type === "facility").length === 0 && (
                <div className="relative pl-6">
                  <span className="absolute left-0 top-1 h-4 w-4 rounded-full border-2 border-background bg-muted"></span>
                  <p className="text-sm font-medium text-muted-foreground">No facilities mapped</p>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
