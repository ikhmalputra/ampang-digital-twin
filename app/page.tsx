"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { StatusBar } from "@/components/command-center/status-bar"
import { MetricsPanel } from "@/components/command-center/metrics-panel"
import { AlertsPanel } from "@/components/command-center/alerts-panel"
import { QuickActions } from "@/components/command-center/quick-actions"
import { DetailPanel } from "@/components/command-center/detail-panel"
import { Map, LayoutDashboard, ChevronLeft, ChevronRight, Menu, X, Layers, MessageSquare, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { BasemapId } from "@/components/command-center/layer-controls"

// Dynamic import for Leaflet (client-side only)
const CityMap = dynamic(
  () => import("@/components/command-center/city-map").then(mod => mod.CityMap),
  { 
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-background/50 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm font-medium text-muted-foreground tracking-widest uppercase">Initializing Digital Twin...</span>
        </div>
      </div>
    )
  }
)

import { LayerControls, LayerState } from "@/components/command-center/layer-controls"
import { SimulationControls } from "@/components/command-center/simulation-controls"
import { 
  Car, AlertTriangle, Activity as ActivityIcon, Camera, Lightbulb, 
  MessageSquare as MessageSquareIcon, Zap, Building2, ShieldAlert, Trash2, Droplets 
} from "lucide-react"

export default function CommandCenterPage() {
  const [selectedMarker, setSelectedMarker] = useState<number | null>(null)
  const [basemap, setBasemap] = useState<BasemapId>("dark")
  const [markers, setMarkers] = useState<any[]>([])
  const [layers, setLayers] = useState<LayerState>({
    traffic: true,
    cameras: true,
    sensors: true,
    alerts: true,
    lighting: true,
    reports: true,
    utilities: false,
    bim: true,
    facilities: true,
    waste: true,
    demographics: false,
    iwk: true,
    buildings: false,
    boundary: true,
    markers: true,
    landPlots: false,
    parks: true,
    water: true,
    pois: false,
    aqi: true,
    riverLevel: true,
  })
  
  // Panel states
  const [leftPanelOpen, setLeftPanelOpen] = useState(true)
  const [rightPanelOpen, setRightPanelOpen] = useState(true)

  // Predictive analysis states
  const [simulationMode, setSimulationMode] = useState(false)
  const [rainfall, setRainfall] = useState(0) // 0 to 100mm
  const [trafficSimulation, setTrafficSimulation] = useState(false)
  const [developmentSimulation, setDevelopmentSimulation] = useState(false)
  const [zoningCompliance, setZoningCompliance] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 1024) {
        setLeftPanelOpen(false)
        setRightPanelOpen(false)
      }
    }

    const fetchMapData = () => {
      fetch("/api/realtime")
        .then((r) => r.json())
        .then((data) => {
          if (data.markers) setMarkers(data.markers)
        })
        .catch((e) => console.error("Failed to load real-time markers", e))
    }

    fetchMapData()
    const interval = setInterval(fetchMapData, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleLayerToggle = (layer: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [layer]: !prev[layer] }))
  }

  const handleMapClick = () => {
    if (selectedMarker) setSelectedMarker(null)
    if (window.innerWidth < 1024) {
      if (leftPanelOpen) setLeftPanelOpen(false)
      if (rightPanelOpen) setRightPanelOpen(false)
    }
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-sans text-foreground relative">
      {/* Top Status Bar (Floating) */}
      <StatusBar />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden w-full h-full">
        {/* Center Map Area (Now full width/height) */}
        <main className="absolute inset-0 z-0">
          <CityMap 
            selectedMarker={selectedMarker}
            onMarkerSelect={(id) => {
              setSelectedMarker(id)
              if (window.innerWidth < 1024) {
                setLeftPanelOpen(false)
                setRightPanelOpen(false)
              }
            }}
            onMapClick={() => {
              setSelectedMarker(null)
            }}
            basemap={basemap}
            showUtilities={layers.utilities}
            showDemographics={layers.demographics}
            layerVisibility={layers}
            simulationMode={simulationMode}
            rainfall={rainfall}
            trafficSimulation={trafficSimulation}
            developmentSimulation={developmentSimulation}
            zoningCompliance={zoningCompliance}
            liveTraffic={layers.traffic}
            bimOverlay={layers.bim}
            markers={markers.filter(m => 
              (m.type === "traffic" && layers.traffic) ||
              (m.type === "sensor" && layers.sensors) ||
              (m.type === "camera" && layers.cameras) ||
              (m.type === "alert" && layers.alerts) ||
              (m.type === "lighting" && layers.lighting) ||
              (m.type === "report" && layers.reports) ||
              (m.type === "utility" && layers.utilities) ||
              (m.type === "bim" && layers.bim) ||
              (m.type === "facility" && layers.facilities) ||
              (m.type === "waste" && layers.waste) ||
              (m.type === "iwk" && layers.iwk)
            )}
          />

          {/* Coordinates Display */}
          <div className="absolute bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-full border border-white/10 bg-background/60 px-4 py-1.5 backdrop-blur-xl shadow-lg">
            <span className="text-[10px] font-mono text-foreground/80 tracking-widest">
              3.1478°N 101.7615°E
            </span>
          </div>
        </main>
        
        {/* Left Floating Sidebar */}
        <aside 
          className={`absolute top-20 bottom-4 left-4 z-40 flex flex-col w-[calc(100vw-2rem)] md:w-[340px] rounded-3xl border border-white/10 bg-background/70 backdrop-blur-2xl shadow-2xl overflow-hidden transition-transform duration-300 ease-in-out ${
            leftPanelOpen ? "translate-x-0" : "-translate-x-[120%]"
          }`}
        >
          <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto hide-scrollbar">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold tracking-tight">Overview</h2>
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setLeftPanelOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2 rounded-xl bg-secondary/50 p-1.5">
              <Link href="/dashboard" className="flex-1">
                <Button variant="ghost" size="sm" className="w-full gap-2 text-sm justify-start rounded-lg hover:bg-background/50">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Button variant="secondary" size="sm" className="flex-1 gap-2 text-sm justify-start bg-background shadow-sm rounded-lg hover:bg-background/90">
                <Map className="h-4 w-4 text-primary" />
                Live Map
              </Button>
            </div>

            <Link href="/report" className="w-full block">
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:bg-white/5 hover:text-foreground rounded-xl h-12"
              >
                <MessageSquare className="mr-3 h-5 w-5" />
                Citizen Report
              </Button>
            </Link>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Activity className="h-4 w-4" />
                <h3 className="text-sm font-semibold uppercase tracking-wider">City Vitals</h3>
              </div>
              <MetricsPanel markers={markers} />
            </div>
          </div>
        </aside>

        {/* Right Floating Sidebar */}
        <aside 
          className={`absolute top-20 bottom-4 right-4 z-40 flex flex-col w-[calc(100vw-2rem)] md:w-[340px] rounded-3xl border border-white/10 bg-background/70 backdrop-blur-2xl shadow-2xl overflow-hidden transition-transform duration-300 ease-in-out ${
            rightPanelOpen ? "translate-x-0" : "translate-x-[120%]"
          }`}
        >
          <div className="flex flex-col h-full overflow-y-auto hide-scrollbar">
            <div className="flex items-center justify-between p-6 pb-2">
              <h2 className="text-2xl font-semibold tracking-tight">Controls</h2>
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setRightPanelOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6 pt-2 flex flex-col gap-8">
              <SimulationControls 
                active={simulationMode}
                onToggle={setSimulationMode}
                rainfall={rainfall}
                onRainfallChange={setRainfall}
                trafficSimulation={trafficSimulation}
                onTrafficToggle={setTrafficSimulation}
                developmentSimulation={developmentSimulation}
                onDevelopmentToggle={setDevelopmentSimulation}
                zoningCompliance={zoningCompliance}
                onZoningToggle={setZoningCompliance}
              />
              <LayerControls
                layers={layers}
                onToggle={handleLayerToggle}
                basemap={basemap}
                onBasemapChange={setBasemap}
              />
            </div>

            <div className="mt-auto border-t border-white/5 bg-black/10">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-red-500 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    Active Alerts
                  </h3>
                  <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-bold text-red-500">
                    Live
                  </span>
                </div>
                <AlertsPanel onClose={() => {}} markers={markers} />
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Toggle Buttons */}
        <div className="absolute top-4 left-4 z-30 lg:hidden">
          <Button variant="secondary" size="icon" className="rounded-xl shadow-lg backdrop-blur-xl bg-background/80" onClick={() => setLeftPanelOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <div className="absolute top-4 right-4 z-30 lg:hidden">
          <Button variant="secondary" size="icon" className="rounded-xl shadow-lg backdrop-blur-xl bg-background/80" onClick={() => setRightPanelOpen(true)}>
            <Layers className="h-5 w-5" />
          </Button>
        </div>

        {/* Desktop Toggle Left */}
        <div className={`absolute top-1/2 left-0 z-30 hidden lg:block -translate-y-1/2 transition-transform duration-300 ${leftPanelOpen ? "translate-x-[360px]" : "translate-x-4"}`}>
          <Button 
            variant="secondary" 
            size="icon" 
            className="h-16 w-8 rounded-2xl border border-white/10 bg-background/80 backdrop-blur-xl shadow-xl hover:bg-accent hover:text-white"
            onClick={() => setLeftPanelOpen(!leftPanelOpen)}
          >
            {leftPanelOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </Button>
        </div>

        {/* Desktop Toggle Right */}
        <div className={`absolute top-1/2 right-0 z-30 hidden lg:block -translate-y-1/2 transition-transform duration-300 ${rightPanelOpen ? "-translate-x-[360px]" : "-translate-x-4"}`}>
          <Button 
            variant="secondary" 
            size="icon" 
            className="h-16 w-8 rounded-2xl border border-white/10 bg-background/80 backdrop-blur-xl shadow-xl hover:bg-accent hover:text-white"
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
          >
            {rightPanelOpen ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>

        {/* Detail Panel */}
        {selectedMarker && markers.find((m) => m.id === selectedMarker) && (
          <div className="absolute bottom-10 left-1/2 z-50 -translate-x-1/2">
            <DetailPanel 
              marker={markers.find((m) => m.id === selectedMarker)!} 
              onClose={() => setSelectedMarker(null)} 
            />
          </div>
        )}
      </div>
    </div>
  )
}
