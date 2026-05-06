"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { MetricCard } from "@/components/dashboard/metric-card"
import { CityMap } from "@/components/command-center/city-map"
import { Wind, ThermometerSun, Factory, AlertTriangle, Loader2 } from "lucide-react"
import { type MapMarker } from "@/lib/map-data"

export default function AirQualityPage() {
  const [liveData, setLiveData] = useState<any>(null)
  const [markers, setMarkers] = useState<MapMarker[]>([])
  const [isRefreshing, setIsRefreshing] = useState(true)

  const fetchData = () => {
    setIsRefreshing(true)
    fetch("/api/realtime")
      .then(res => res.json())
      .then(data => {
        setLiveData(data.metrics)
        // Filter only Air Quality related markers
        setMarkers(data.markers.filter((m: MapMarker) => m.label.includes("Air Quality")))
        setIsRefreshing(false)
        try { sessionStorage.setItem("dashboard_cache", JSON.stringify(data)) } catch (e) {}
      })
      .catch(err => {
        console.error("Failed to load live data", err)
        setIsRefreshing(false)
        try { sessionStorage.setItem("dashboard_cache", JSON.stringify(data)) } catch (e) {}
      })
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
    const interval = setInterval(fetchData, 60000) // Poll every minute for AQ
    return () => clearInterval(interval)
  }, [])

  if (!liveData) {
    return (
      <DashboardLayout title="Air Quality Monitoring" subtitle="Loading live APIMS data...">
        <div className="flex h-[50vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground animate-pulse">Connecting to DOE sensors...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const aqiMarker = markers.find(m => m.label.includes("Air Quality"));
  const aqi = aqiMarker ? (parseInt(aqiMarker.details.replace(/\D/g, '')) || 52) : (liveData?.aqis?.[0]?.api_value ?? 52);
  const pm10 = liveData?.pm10?.toFixed(1) ?? "45.2"
  const pm25 = (liveData?.pm10 * 0.6).toFixed(1) ?? "28.5" // Estimation based on PM10 if real PM2.5 missing
  const temp = liveData?.temperature?.toFixed(1) ?? "32.0"

  return (
    <DashboardLayout 
      title="Air Quality Monitoring" 
      subtitle={
        <div className="flex items-center gap-2">
          Department of Environment (DOE) API Integration
          {isRefreshing && <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>}
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <MetricCard
          title="Current AQI"
          value={aqi.toString()}
          unit="API"
          subtitle={aqi < 50 ? "Good" : aqi < 100 ? "Moderate" : "Unhealthy"}
          icon={Wind}
          trend={{ value: 4, isPositive: true }}
          status={aqi > 100 ? "warning" : "normal"}
        />
        <MetricCard
          title="PM 2.5 Level"
          value={pm25}
          unit="µg/m³"
          subtitle="Fine Particulate Matter"
          icon={Factory}
          trend={{ value: 1.2, isPositive: false }}
          status={parseFloat(pm25) > 35 ? "warning" : "normal"}
        />
        <MetricCard
          title="PM 10 Level"
          value={pm10}
          unit="µg/m³"
          subtitle="Coarse Particulate Matter"
          icon={AlertTriangle}
          trend={{ value: 0.5, isPositive: false }}
          status={parseFloat(pm10) > 50 ? "warning" : "normal"}
        />
        <MetricCard
          title="Ambient Temp"
          value={temp}
          unit="°C"
          subtitle="Heat Island Effect"
          icon={ThermometerSun}
          trend={{ value: 1.1, isPositive: false }}
          status={parseFloat(temp) > 35 ? "warning" : "normal"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col rounded-3xl border border-white/5 bg-white/5 shadow-sm overflow-hidden h-[600px]">
          <div className="p-5 border-b border-white/5 bg-black/20 flex items-center justify-between">
            <h2 className="font-semibold">Live Air Quality Map (APIMS Integration)</h2>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-md bg-green-500"></span> Good (0-50)</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-md bg-yellow-500"></span> Moderate (51-100)</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-md bg-orange-500"></span> Unhealthy (101-150)</span>
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
            <h3 className="font-semibold mb-4">DOE APIMS Stations</h3>
            <div className="space-y-4">
              {markers.filter(m => m.label.includes("Air Quality")).map((station: any, idx: number) => {
                const apiValue = parseInt(station.details.replace(/\D/g, '')) || 50;
                return (
                  <div key={idx} className="flex flex-col gap-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{station.label.replace('Air Quality: ', '')}</span>
                      <span className={`font-bold ${apiValue > 100 ? 'text-orange-500' : apiValue > 50 ? 'text-yellow-500' : 'text-green-500'}`}>
                        API {apiValue}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${apiValue > 100 ? 'bg-orange-500' : apiValue > 50 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                        style={{ width: `${Math.min(100, (apiValue / 150) * 100)}%` }} 
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{station.status}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-white/5 bg-white/5 shadow-sm p-6 flex-1">
            <h3 className="font-semibold mb-4">Health Advisory</h3>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-0 md:before:translate-x-0 before:h-full before:w-0.5 before:bg-border">
              
              <div className="relative pl-6">
                <span className={`absolute left-0 top-1 h-4 w-4 rounded-full border-2 border-background ${aqi > 100 ? 'bg-orange-500' : aqi > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                <p className="text-sm font-medium">General Public</p>
                <p className="text-xs text-muted-foreground">
                  {aqi > 100 ? "Reduce prolonged or heavy outdoor exertion." : "Air quality is acceptable; however, there may be a risk for some people."}
                </p>
              </div>

              <div className="relative pl-6">
                <span className={`absolute left-0 top-1 h-4 w-4 rounded-full border-2 border-background ${aqi > 100 ? 'bg-red-500' : aqi > 50 ? 'bg-orange-500' : 'bg-yellow-500'}`}></span>
                <p className="text-sm font-medium">Sensitive Groups</p>
                <p className="text-xs text-muted-foreground">
                  {aqi > 50 ? "Unusually sensitive people should consider reducing prolonged outdoor exertion." : "Enjoy your outdoor activities."}
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
