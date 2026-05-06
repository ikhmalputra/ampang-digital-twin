"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { MetricCard } from "@/components/dashboard/metric-card"
import { AreaChartCard } from "@/components/dashboard/area-chart"
import { AlertItem } from "@/components/dashboard/alert-item"
import { StatusIndicator } from "@/components/dashboard/status-indicator"
import { ServiceCard } from "@/components/dashboard/service-card"
import { ProgressBar } from "@/components/dashboard/progress-bar"
import {
  Car,
  Wind,
  Zap,
  Droplets,
  ThermometerSun,
  Users,
  FileText,
  Building2,
  Wifi,
  Camera,
  Truck,
  Lightbulb,
  Award,
  Loader2
} from "lucide-react"

export default function DashboardPage() {
  const [liveData, setLiveData] = useState<any>(null)
  const [chartData, setChartData] = useState<any>(null)
  const [isRefreshing, setIsRefreshing] = useState(true) // Start as refreshing

  const fetchData = () => {
    setIsRefreshing(true)
    fetch("/api/realtime")
      .then(res => res.json())
      .then(data => {
        setLiveData(data.metrics)
        setChartData(data.charts)
        setIsRefreshing(false)
        try { sessionStorage.setItem("dashboard_cache", JSON.stringify(data)) } catch (e) {}
      })
      .catch(err => {
        console.error("Failed to load live data", err)
        setIsRefreshing(false)
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
    // Poll every 10 seconds for real-time updates
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])

  if (!liveData || !chartData) {
    return (
      <DashboardLayout title="Ampang Command Center Dashboard" subtitle="Loading live city infrastructure data...">
        <div className="flex h-[50vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground animate-pulse">Syncing with MPAJ Digital Brain...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Safely extract live metrics or fallback to defaults
  const aqi = liveData?.aqis?.[0]?.api_value ?? 58
  const aqiStatus = liveData?.aqis?.[0]?.status ?? "Moderate conditions"
  const cctvCount = liveData?.cctvs?.length ?? 3
  const warningCount = liveData?.warnings?.length ?? 0
  const riverDepth = liveData?.rivers?.[0]?.water_level_m ?? 31.5
  const pm10 = liveData?.pm10 ?? 45.2
  const precipitation = liveData?.precipitation ?? 0.0
  const temperature = liveData?.temperature ?? 32.0
  
  // Real-time dynamic stats
  const trafficFlow = liveData?.trafficFlow ?? 640
  const hasWarning = warningCount > 0

  return (
    <DashboardLayout 
      title="Ampang Command Center Dashboard" 
      subtitle={
        <div className="flex items-center gap-2">
          Real-time city infrastructure & environment monitoring
          {isRefreshing && <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>}
        </div>
      }
    >
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          title="Total Population"
          value="532,921"
          unit="est. 2026"
          subtitle="Ampang Jaya Municipality"
          icon={Users}
          trend={{ value: 2.1, isPositive: true }}
          status="normal"
        />
        <MetricCard
          title="Traffic Flow"
          value={trafficFlow.toString()}
          unit="vehicles/hr"
          subtitle="Jalan Ampang corridor"
          icon={Car}
          trend={{ value: 12, isPositive: false }}
          status="normal"
        />
        <MetricCard
          title="Air Quality Index"
          value={aqi.toString()}
          unit="AQI"
          subtitle={aqiStatus}
          icon={Wind}
          trend={{ value: 8, isPositive: true }}
          status={aqi > 100 ? "warning" : "normal"}
        />
        <MetricCard
          title="River Water Level"
          value={riverDepth.toString()}
          unit="m"
          subtitle="Sungai Ampang Intake"
          icon={Droplets}
          trend={{ value: 1.2, isPositive: false }}
          status={liveData?.rivers?.[0]?.status === "Alert" ? "warning" : "normal"}
        />
        <MetricCard
          title="Active Warnings"
          value={warningCount.toString()}
          unit="alerts"
          subtitle="MET Malaysia"
          icon={Zap}
          trend={{ value: 0, isPositive: false }}
          status={hasWarning ? "warning" : "normal"}
        />
      </div>

      {/* Charts Grid */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <AreaChartCard
          title="Traffic Volume (Feeder Routes)"
          data={chartData.traffic}
          color="var(--chart-1)"
          secondaryKey="secondary"
          secondaryColor="var(--chart-3)"
          showLegend
          legendLabels={{ primary: "Inbound", secondary: "Outbound" }}
          valueSuffix=" veh"
        />
        <AreaChartCard
          title="Utility Consumption (Water/Energy)"
          data={chartData.utility}
          color="var(--chart-4)"
          secondaryKey="water"
          secondaryColor="var(--chart-5)"
          showLegend
          legendLabels={{ primary: "Electricity (MW)", secondary: "Water (ML)" }}
          valueSuffix=""
        />
      </div>

      {/* Alerts and System Status */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Recent Alerts */}
        <div className="lg:col-span-2 rounded-3xl border border-white/5 bg-white/5 p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Live Alerts & Reports</h2>
            <button className="text-[10px] font-bold uppercase tracking-wider text-accent hover:underline">View all</button>
          </div>
          <div className="space-y-2">
            {liveData?.warnings?.map((w: any, idx: number) => (
              <AlertItem
                key={`warning-${idx}`}
                title={w.heading_en || "Weather Warning"}
                description={w.text_en}
                time="Recent"
                location="Ampang / KL Area"
                severity="warning"
              />
            ))}
            {liveData?.rivers?.map((r: any, idx: number) => (
              r.status !== "Normal" && (
                <AlertItem
                  key={`river-${idx}`}
                  title={`${r.river} Level Alert`}
                  description={`Water level is at ${r.water_level_m}m. Danger level is ${r.danger_level_m}m.`}
                  time="Live"
                  location={r.location}
                  severity="warning"
                />
              )
            ))}
            <AlertItem
              title="Traffic congestion detected"
              description="Heavy traffic buildup on MRR2 near Ampang Point."
              time="5 min ago"
              location="MRR2 Ampang"
              severity="info"
            />
          </div>
        </div>

        {/* System Status */}
        <div className="rounded-3xl border border-white/5 bg-white/5 p-6 shadow-sm">
          <h2 className="mb-6 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Data Integration Status</h2>
          <div>
            <StatusIndicator label="MET Weather API" value="Connected" status="operational" />
            <StatusIndicator label="JPS Flood Sensors" value="Connected" status="operational" />
            <StatusIndicator label="LLM CCTV Feeds" value={`${cctvCount} Active`} status="operational" />
            <StatusIndicator label="DOE Air Quality" value="Connected" status="operational" />
            <StatusIndicator label="GTFS Realtime" value="Connected" status="operational" />
            <StatusIndicator label="KDEB Waste Sensors" value="2 Alerts" status="degraded" />
            <StatusIndicator label="Sentinel-1 SAR" value="Standby" status="operational" />
          </div>
        </div>
      </div>

      {/* Environmental Metrics and Smart City Status */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/5 bg-white/5 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Smart City Rating (Malaysia)</h2>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/20 px-3 py-1.5 rounded-full">
              <Award className="h-3 w-3" /> Target 2025: Developing
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-muted-foreground font-medium">Overall MS ISO 37122:2019 Compliance</span>
                <span className="font-bold text-foreground">28 / 35 Indicators</span>
              </div>
              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[80%] rounded-full" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-black/20 rounded-2xl p-4 border border-white/5 text-center">
                <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">K1: Pelan Tindakan</div>
                <div className="text-xs font-bold text-green-500">Active (2024-2030)</div>
              </div>
              <div className="bg-black/20 rounded-2xl p-4 border border-white/5 text-center">
                <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">K2: Jawatankuasa</div>
                <div className="text-xs font-bold text-green-500">Established</div>
              </div>
              <div className="bg-black/20 rounded-2xl p-4 border border-white/5 text-center">
                <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">K3: ICC Dashboard</div>
                <div className="text-xs font-bold text-blue-400">Phase 2 Online</div>
              </div>
              <div className="bg-black/20 rounded-2xl p-4 border border-white/5 text-center">
                <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">K4: Digital Twin</div>
                <div className="text-xs font-bold text-blue-400">Beta Testing</div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/5 bg-white/5 p-6 shadow-sm">
          <h2 className="mb-6 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Environmental Metrics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-black/20 border border-white/5 p-5 hover:bg-black/30 transition-colors">
              <div className="flex items-center gap-2">
                <ThermometerSun className="h-4 w-4 text-chart-3" />
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Temperature</span>
              </div>
              <p className="mt-3 text-3xl font-bold tracking-tight">{temperature.toFixed(1)}°C</p>
              <p className="text-[10px] uppercase font-semibold text-muted-foreground mt-1">Feels like {(temperature + 4).toFixed(1)}°C</p>
            </div>
            <div className="rounded-2xl bg-black/20 border border-white/5 p-5 hover:bg-black/30 transition-colors">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-chart-2" />
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Precipitation</span>
              </div>
              <p className="mt-3 text-3xl font-bold tracking-tight">{precipitation.toFixed(1)} <span className="text-lg">mm</span></p>
              <p className="text-[10px] uppercase font-semibold text-muted-foreground mt-1">Current Rainfall</p>
            </div>
            <div className="rounded-2xl bg-black/20 border border-white/5 p-5 hover:bg-black/30 transition-colors">
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-accent" />
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Air Quality</span>
              </div>
              <p className="mt-3 text-3xl font-bold tracking-tight">{aqi}</p>
              <p className="text-[10px] uppercase font-semibold text-muted-foreground mt-1">{aqiStatus}</p>
            </div>
            <div className="rounded-2xl bg-black/20 border border-white/5 p-5 hover:bg-black/30 transition-colors">
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-muted-foreground" />
                <span className="text-[10px] uppercase font-bold text-muted-foreground">CCTV Feeds</span>
              </div>
              <p className="mt-3 text-3xl font-bold tracking-tight">{cctvCount}</p>
              <p className="text-[10px] uppercase font-semibold text-muted-foreground mt-1">LLM Cameras Live</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
