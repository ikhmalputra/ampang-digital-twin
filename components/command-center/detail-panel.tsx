"use client"

import { useState } from "react"
import { X, MapPin, Clock, Activity, ExternalLink, Video, History, Download, ChevronLeft, ChevronRight, User, Box, Thermometer, Wind, Zap, ShieldPlus,
  Truck,
  AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import type { MapMarker } from "@/lib/map-data"

interface DetailPanelProps {
  marker: MapMarker
  onClose: () => void
}

export function DetailPanel({ marker, onClose }: DetailPanelProps) {
  const [showExpanded, setShowExpanded] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [wasteDispatched, setWasteDispatched] = useState(false)

  if (!marker) return null

  const typeLabels: Record<string, string> = {
    traffic: "Traffic Monitor",
    sensor: "IoT Sensor",
    camera: "CCTV Camera",
    alert: "Active Incident",
    lighting: "Smart Lighting",
    report: "Citizen Report",
    utility: "Underground Utility",
    bim: "BIM Digital Twin",
    facility: "Facility & Emergency",
    waste: "Waste Management",
    iwk: "Indah Water",
  }

  const typeColors: Record<string, string> = {
    traffic: "bg-primary",
    sensor: "bg-accent",
    camera: "bg-yellow-500",
    alert: "bg-red-500",
    lighting: "bg-purple-500",
    report: "bg-pink-500",
    utility: "bg-cyan-500",
    bim: "bg-blue-500",
    facility: "bg-indigo-500",
    waste: "bg-amber-600",
    iwk: "bg-teal-500",
  }

  return (
    <>
      <div className="pointer-events-auto flex w-80 flex-col rounded-3xl border border-white/10 bg-background/80 backdrop-blur-2xl p-6 shadow-2xl transition-all duration-300">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)] ${typeColors[marker.type]}`} />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              {typeLabels[marker.type]}
            </span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-white/10" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <h3 className="mt-2 text-xl font-bold tracking-tight text-foreground">{marker.label}</h3>
        
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
            <MapPin className="h-4 w-4" />
            <span>{marker.position[0].toFixed(4)}, {marker.position[1].toFixed(4)}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
            <Clock className="h-4 w-4" />
            <span>Last updated: Just now</span>
          </div>
          <div className="flex items-center gap-3 text-sm font-semibold">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span className={marker.status === "Danger" || marker.status === "Critical" ? "text-red-500" : "text-accent"}>{marker.status}</span>
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-white/5 border border-white/5 p-4 backdrop-blur-sm">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Current Reading</p>
          <p className="mt-1 text-xl font-bold tracking-tight text-foreground">{marker.details}</p>
        </div>

        {/* Actionable Controls: Smart Lighting */}
        {marker.type === "lighting" && (
          <div className="mt-4 space-y-4 rounded-lg border border-border/50 bg-secondary/20 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Power Status</span>
              <Switch defaultChecked />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Brightness</span>
                <span className="text-xs text-muted-foreground">65%</span>
              </div>
              <Slider defaultValue={[65]} max={100} step={1} className="w-full" />
            </div>
            <Button size="sm" variant="outline" className="w-full text-xs">Run Diagnostics</Button>
          </div>
        )}

        {/* Actionable Controls: Citizen Reports */}
        {marker.type === "report" && (
          <div className="mt-4 space-y-3 rounded-lg border border-border/50 bg-secondary/20 p-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Reported via Citizen App</span>
              <span className="text-sm font-medium text-foreground">Issue ID: #RPT-4429</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="w-full bg-pink-600 hover:bg-pink-700 text-xs">Dispatch Crew</Button>
              <Button size="sm" variant="outline" className="w-full text-xs">Mark Resolved</Button>
            </div>
          </div>
        )}

        {/* Actionable Controls: Utilities */}
        {marker.type === "utility" && (
          <div className="mt-4 space-y-3 rounded-lg border border-border/50 bg-secondary/20 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Node Status</span>
              <Badge variant={marker.status === "Active" ? "default" : "destructive"}>{marker.status}</Badge>
            </div>
            <Button size="sm" variant="outline" className="w-full text-xs">Isolate Sector</Button>
          </div>
        )}

        {/* Actionable Controls: Waste Management */}
        {marker.type === "waste" && (
          <div className="mt-4 flex flex-col gap-3 rounded-lg border border-border/50 bg-secondary/20 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Smart Bin Capacity</span>
              <span className="text-sm font-bold text-amber-500">95% Full</span>
            </div>
            <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
              <div className="h-full bg-amber-500 w-[95%]" />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button 
                size="sm" 
                variant={wasteDispatched ? "secondary" : "default"} 
                className={wasteDispatched ? "bg-green-500/20 text-green-500 hover:bg-green-500/30 text-xs" : "bg-amber-600 hover:bg-amber-700 text-xs"}
                onClick={() => setWasteDispatched(true)}
                disabled={wasteDispatched}
              >
                {wasteDispatched ? "Dispatched" : "Dispatch Truck"}
              </Button>
              <Button size="sm" variant="outline" className="text-xs">
                Optimize Route
              </Button>
            </div>
          </div>
        )}

        {/* Actionable Controls: BIM */}
        {marker.type === "bim" && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="flex flex-col items-center gap-1 rounded-lg border border-border/50 bg-secondary/20 p-3 text-center">
              <Thermometer className="h-5 w-5 text-blue-400" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">HVAC</span>
              <span className="text-sm font-bold text-foreground">Optimal</span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-lg border border-border/50 bg-secondary/20 p-3 text-center">
              <Zap className="h-5 w-5 text-yellow-400" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Power</span>
              <span className="text-sm font-bold text-foreground">420 kW</span>
            </div>
          </div>
        )}

        {/* CCTV Mock Video Player */}
        {marker.type === "camera" && (
          <div className="mt-4 overflow-hidden rounded-lg border border-border/50 bg-black">
            <div className="relative aspect-video w-full">
              <video 
                autoPlay 
                loop 
                muted 
                playsInline
                className="h-full w-full object-cover opacity-80"
              >
                <source src="https://cdn.pixabay.com/video/2016/09/21/5334-182885994_tiny.mp4" type="video/mp4" />
              </video>
              <div className="absolute top-2 right-2 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 backdrop-blur-md">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                <span className="text-[8px] font-bold text-white tracking-widest">LIVE</span>
              </div>
              <div className="absolute bottom-2 left-2 text-[8px] font-mono text-white/80">
                {new Date().toISOString().split('T')[0]} {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowExpanded(true)}>
            View History
          </Button>
          <Button size="sm" className="text-xs bg-primary hover:bg-primary/90" onClick={() => setShowExpanded(true)}>
            <ExternalLink className="mr-1 h-3 w-3" />
            Details
          </Button>
        </div>
      </div>

      {/* Expanded Modal View */}
      {showExpanded && (
        <div 
          className="pointer-events-auto fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-8" 
          onClick={(e) => { e.stopPropagation(); setShowExpanded(false); }}
        >
          <div 
            className="flex w-full max-w-[95vw] lg:max-w-7xl max-h-[95vh] flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl"
            onClick={(e) => e.stopPropagation()} 
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] ${typeColors[marker.type]} shadow-${typeColors[marker.type].replace('bg-', '')}`} />
                <h2 className="text-xl font-bold tracking-tight text-slate-100">
                  {marker.label} <span className="ml-2 hidden sm:inline text-sm font-normal text-slate-400">| Detailed Analysis</span>
                </h2>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white" onClick={() => setShowExpanded(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Main Content: Flex Row on Desktop */}
            <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
              
              {/* Left/Main Column: Video & Stats */}
              <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 md:p-6 min-w-0">
                
                {/* Main Content Container */}
                {marker.type === "report" ? (
                  <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900 ring-1 ring-white/5">
                    {/* Image Slider */}
                    <div className="relative h-64 w-full bg-black shrink-0 group">
                      {marker.images && marker.images.length > 0 ? (
                        <>
                          <img src={marker.images[activeImage]} alt="Report" className="h-full w-full object-cover opacity-90 transition-opacity duration-300" />
                          {marker.images.length > 1 && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => { e.stopPropagation(); setActiveImage(prev => prev === 0 ? marker.images!.length - 1 : prev - 1); }}
                              >
                                <ChevronLeft className="h-6 w-6" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => { e.stopPropagation(); setActiveImage(prev => prev === marker.images!.length - 1 ? 0 : prev + 1); }}
                              >
                                <ChevronRight className="h-6 w-6" />
                              </Button>
                              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                {marker.images.map((_, i) => (
                                  <div key={i} className={`h-1.5 w-1.5 rounded-full transition-colors ${i === activeImage ? 'bg-white' : 'bg-white/40'}`} />
                                ))}
                              </div>
                            </>
                          )}
                        </>
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center bg-slate-900 p-6 text-center">
                          <div className="mb-4 rounded-full bg-pink-500/20 p-4">
                            <MapPin className="h-12 w-12 text-pink-500 opacity-50" />
                          </div>
                          <p className="text-slate-500">No images provided</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Report Details Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-2">Issue Description</h3>
                        <p className="text-sm text-slate-300 leading-relaxed">{marker.details}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-4 w-4 text-pink-400" />
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Reporter Details</span>
                          </div>
                          <p className="text-sm font-semibold text-white">{marker.reporter?.name || "Anonymous Citizen"}</p>
                          <p className="text-xs text-slate-500 mt-1">{marker.reporter?.phone || "Contact hidden"}</p>
                        </div>
                        
                        <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-pink-400" />
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Reported Time</span>
                          </div>
                          <p className="text-sm font-semibold text-white">{marker.reporter?.date || "Just now"}</p>
                          <p className="text-xs text-slate-500 mt-1">Status: <span className="text-pink-400">{marker.status}</span></p>
                        </div>
                        
                        <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-4 sm:col-span-2">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-4 w-4 text-pink-400" />
                            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Exact Location</span>
                          </div>
                          <p className="text-sm font-semibold text-white">{marker.position[0].toFixed(6)}, {marker.position[1].toFixed(6)}</p>
                          <p className="text-xs text-slate-500 mt-1">Ampang Jaya Municipal Area</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : marker.type === "bim" ? (
                  <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-950 ring-1 ring-white/5">
                    {/* Mock BIM 3D Viewport */}
                    <div className="relative h-72 w-full bg-slate-900 shrink-0 flex items-center justify-center overflow-hidden border-b border-slate-800">
                      <div className="absolute inset-0 opacity-20" style={{
                        backgroundImage: `linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)`,
                        backgroundSize: '20px 20px'
                      }} />
                      <Box className="h-32 w-32 text-blue-500 opacity-80" strokeWidth={1} />
                      <div className="absolute top-4 left-4 rounded bg-black/80 px-3 py-1.5 backdrop-blur-md border border-white/10">
                        <span className="text-[10px] font-bold text-blue-400 tracking-widest uppercase">STRUCTURAL WIREFRAME</span>
                      </div>
                      <div className="absolute bottom-4 right-4 flex gap-2">
                        <Badge variant="outline" className="border-blue-500/30 text-blue-300 bg-blue-950/50">Level 1-12 Active</Badge>
                        <Badge variant="outline" className="border-blue-500/30 text-blue-300 bg-blue-950/50">HVAC Synced</Badge>
                      </div>
                    </div>
                    
                    {/* BIM Details Area */}
                    <div className="flex-1 overflow-y-auto p-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                          <Thermometer className="h-5 w-5 text-slate-400 mb-2" />
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Internal Temp</p>
                          <p className="text-xl font-bold text-white mt-1">22.4°C</p>
                        </div>
                        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                          <Wind className="h-5 w-5 text-slate-400 mb-2" />
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Air Quality (CO2)</p>
                          <p className="text-xl font-bold text-emerald-400 mt-1">420 ppm</p>
                        </div>
                        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                          <Zap className="h-5 w-5 text-slate-400 mb-2" />
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Power Usage</p>
                          <p className="text-xl font-bold text-yellow-400 mt-1">420 kW</p>
                        </div>
                        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                          <Activity className="h-5 w-5 text-slate-400 mb-2" />
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Occupancy</p>
                          <p className="text-xl font-bold text-blue-400 mt-1">842 pax</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full overflow-hidden rounded-xl border border-slate-800 bg-black ring-1 ring-white/5" style={{ aspectRatio: '16/9' }}>
                    {marker.type === "camera" ? (
                      <video 
                        autoPlay loop muted playsInline
                        className="h-full w-full object-cover"
                      >
                        <source src="https://cdn.pixabay.com/video/2016/09/21/5334-182885994_tiny.mp4" type="video/mp4" />
                      </video>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-900">
                        <Activity className="h-16 w-16 text-slate-700" />
                        <span className="absolute bottom-4 right-4 text-xs font-mono text-slate-600 tracking-widest">SYSTEM TELEMETRY</span>
                      </div>
                    )}
                    
                    {/* Overlays */}
                    {marker.type === "camera" && (
                      <div className="absolute top-4 right-4 flex items-center gap-2 rounded bg-black/80 px-3 py-1.5 backdrop-blur-md border border-white/10">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                        <span className="text-[10px] font-bold text-white tracking-widest">LIVE STREAM</span>
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4 rounded bg-black/80 px-3 py-1.5 backdrop-blur-md border border-white/10">
                      <span className="font-mono text-[10px] text-white/70">
                        {marker.type === "camera" ? `CAM-${marker.id.toString().padStart(4, '0')} | ` : `SYS-${marker.id.toString().padStart(4, '0')} | `}
                        2026-04-22 {new Date().toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Stats Grid - Hidden for reports and BIM */}
                {marker.type !== "report" && marker.type !== "bim" && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 shrink-0">
                    <div className="flex flex-col gap-1 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Current Status</span>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${marker.status === 'Active' || marker.status === 'Operational' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        <span className={`font-semibold ${marker.status === 'Active' || marker.status === 'Operational' ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {marker.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">System Uptime</span>
                      <span className="font-semibold text-slate-200">99.98%</span>
                    </div>
                    <div className="flex flex-col gap-1 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Coordinate</span>
                      <span className="font-mono text-sm text-slate-300">
                        {marker.position[0].toFixed(3)}, {marker.position[1].toFixed(3)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: History Sidebar */}
              <div className="flex w-full md:w-[350px] lg:w-[400px] shrink-0 flex-col border-t md:border-t-0 md:border-l border-slate-800 bg-slate-900/20">
                <div className="flex items-center gap-2 border-b border-slate-800 p-6 pb-4">
                  <History className="h-4 w-4 text-slate-400" />
                  <h3 className="font-semibold text-slate-200 tracking-tight">Event History Log</h3>
                </div>
                
                <div className="flex flex-col gap-4 overflow-y-auto p-6">
                  {marker.type === "report" ? [
                    { time: "Just Now", event: "Assigned to Inspector Ahmad", type: "info" },
                    { time: "10 mins ago", event: "Automated AI severity assessed: High", type: "warning" },
                    { time: "15 mins ago", event: "Report created via Smart Ampang App", type: "info" },
                    { time: "15 mins ago", event: "Images successfully uploaded", type: "resolved" },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 text-sm relative">
                      <div className="w-16 font-mono text-[10px] text-slate-500 pt-0.5 shrink-0">{item.time}</div>
                      <div className="relative pb-4 flex-1">
                        <div className={`absolute -left-3 top-1.5 h-2 w-2 rounded-full ring-4 ring-slate-950 ${
                          item.type === 'warning' ? 'bg-amber-400' : item.type === 'resolved' ? 'bg-emerald-400' : 'bg-blue-400'
                        }`} />
                        {i !== 3 && <div className="absolute -left-2 top-3 h-full w-px bg-slate-800" />}
                        <div className={`pl-2 ${item.type === 'warning' ? 'text-amber-200' : 'text-slate-300'}`}>{item.event}</div>
                      </div>
                    </div>
                  )) : marker.type === "bim" ? [
                    { time: "Just Now", event: "HVAC Zone 3 adjusted automatically", type: "info" },
                    { time: "25 mins ago", event: "Occupancy limit warning in Lobby", type: "warning" },
                    { time: "1 hr ago", event: "Elevator B maintenance completed", type: "resolved" },
                    { time: "3 hrs ago", event: "Power consumption spike detected", type: "warning" },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 text-sm relative">
                      <div className="w-16 font-mono text-[10px] text-slate-500 pt-0.5 shrink-0">{item.time}</div>
                      <div className="relative pb-4 flex-1">
                        <div className={`absolute -left-3 top-1.5 h-2 w-2 rounded-full ring-4 ring-slate-950 ${
                          item.type === 'warning' ? 'bg-amber-400' : item.type === 'resolved' ? 'bg-emerald-400' : 'bg-blue-400'
                        }`} />
                        {i !== 3 && <div className="absolute -left-2 top-3 h-full w-px bg-slate-800" />}
                        <div className={`pl-2 ${item.type === 'warning' ? 'text-amber-200' : 'text-slate-300'}`}>{item.event}</div>
                      </div>
                    </div>
                  )) : [
                    { time: "10:45 AM", event: "Traffic volume increased by 15%", type: "warning" },
                    { time: "09:30 AM", event: "Routine diagnostic check passed", type: "info" },
                    { time: "08:15 AM", event: "Morning rush hour peak recorded", type: "warning" },
                    { time: "06:00 AM", event: "Night vision mode deactivated", type: "info" },
                    { time: "Yesterday", event: "Minor congestion cleared", type: "resolved" },
                    { time: "Yesterday", event: "System reboot initiated", type: "info" },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 text-sm relative">
                      <div className="w-16 font-mono text-[10px] text-slate-500 pt-0.5 shrink-0">{item.time}</div>
                      <div className="relative pb-4 flex-1">
                        <div className={`absolute -left-3 top-1.5 h-2 w-2 rounded-full ring-4 ring-slate-950 ${
                          item.type === 'warning' ? 'bg-amber-400' : item.type === 'resolved' ? 'bg-emerald-400' : 'bg-blue-400'
                        }`} />
                        {i !== 5 && <div className="absolute -left-2 top-3 h-full w-px bg-slate-800" />}
                        <div className={`pl-2 ${item.type === 'warning' ? 'text-amber-200' : 'text-slate-300'}`}>{item.event}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-auto border-t border-slate-800 p-6 flex flex-col gap-3">
                  {marker.type === "lighting" && (
                    <div className="mb-4 space-y-4 rounded-lg border border-purple-500/20 bg-purple-500/10 p-4">
                      <h4 className="text-sm font-semibold text-purple-400">Lighting Controls</h4>
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-sm font-medium">Power Status</span>
                        <Switch defaultChecked />
                      </div>
                      <div className="space-y-2 text-slate-300">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Brightness</span>
                          <span className="text-xs">65%</span>
                        </div>
                        <Slider defaultValue={[65]} max={100} step={1} className="w-full" />
                      </div>
                      <Button size="sm" variant="outline" className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/20">
                        Run Diagnostics
                      </Button>
                    </div>
                  )}

                  {marker.type === "report" && (
                    <div className="mb-4 space-y-3 rounded-lg border border-pink-500/20 bg-pink-500/10 p-4">
                      <h4 className="text-sm font-semibold text-pink-400">Issue Management</h4>
                      <Button className="w-full bg-pink-600 text-white hover:bg-pink-700">
                        Dispatch Response Crew
                      </Button>
                      <Button variant="outline" className="w-full border-pink-500/50 text-pink-400 hover:bg-pink-500/20">
                        Mark as Resolved
                      </Button>
                    </div>
                  )}

                  {marker.type === "facility" && (
                    <div className="flex h-full w-full items-center justify-center bg-indigo-950/20 rounded-xl border border-indigo-500/20">
                      <div className="text-center p-8">
                        <ShieldPlus className="h-16 w-16 text-indigo-400 mx-auto mb-4 opacity-50" />
                        <h3 className="text-xl font-medium text-indigo-100 mb-2">Emergency Response Sector</h3>
                        <p className="text-sm text-indigo-300/80 max-w-md mx-auto">
                          Live integration with emergency dispatch systems is currently in standby mode. 
                          Personnel tracking and asset deployment will be visualized here during active incidents.
                        </p>
                      </div>
                    </div>
                  )}

                  {marker.type === "waste" && (
                    <div className="flex flex-col h-full w-full gap-6">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-4">
                          <span className="text-xs text-amber-500 font-semibold uppercase tracking-wider">Fill Level</span>
                          <div className="mt-2 text-3xl font-light text-amber-100">95%</div>
                        </div>
                        <div className="rounded-xl border border-border/50 bg-secondary/20 p-4">
                          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Est. Weight</span>
                          <div className="mt-2 text-3xl font-light text-foreground">420kg</div>
                        </div>
                        <div className="rounded-xl border border-border/50 bg-secondary/20 p-4">
                          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Next Pickup</span>
                          <div className="mt-2 text-3xl font-light text-foreground">14:00</div>
                        </div>
                      </div>

                      <div className="flex-1 rounded-xl border border-border/50 bg-card p-6">
                        <h3 className="text-sm font-semibold mb-6">Automated Dispatch Protocol</h3>
                        
                        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-amber-500/20 before:to-transparent">
                          
                          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-amber-500 shadow shadow-amber-500/50 z-10">
                              <AlertTriangle className="h-4 w-4 text-white" />
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] rounded-xl border border-amber-500/30 bg-amber-950/20 p-4">
                              <h4 className="text-sm font-medium text-amber-200">Capacity Threshold Reached</h4>
                              <p className="text-xs text-amber-500/70 mt-1">Sensor detected fill level &gt; 90%</p>
                              <p className="text-[10px] text-muted-foreground mt-2">10:45 AM</p>
                            </div>
                          </div>

                          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-background ${wasteDispatched ? 'bg-green-500' : 'bg-muted'} z-10 transition-colors`}>
                              <Truck className="h-4 w-4 text-white" />
                            </div>
                            <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] rounded-xl border ${wasteDispatched ? 'border-green-500/30 bg-green-950/20' : 'border-border/50 bg-card/50'} p-4 transition-colors`}>
                              <h4 className={`text-sm font-medium ${wasteDispatched ? 'text-green-200' : 'text-muted-foreground'}`}>KDEB Truck Dispatched</h4>
                              <p className={`text-xs mt-1 ${wasteDispatched ? 'text-green-500/70' : 'text-muted-foreground/50'}`}>Route optimized and driver notified</p>
                              {wasteDispatched && <p className="text-[10px] text-muted-foreground mt-2">Just now</p>}
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                  )}

                  {marker.type === "iwk" && (
                    <div className="flex flex-col h-full w-full gap-6">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="rounded-xl border border-teal-500/20 bg-teal-950/20 p-4">
                          <span className="text-xs text-teal-500 font-semibold uppercase tracking-wider">Flow Rate</span>
                          <div className="mt-2 text-3xl font-light text-teal-100">
                            {marker.details.match(/Flow Rate: (\d+)/)?.[1] || "145"} <span className="text-sm">L/s</span>
                          </div>
                        </div>
                        <div className="rounded-xl border border-border/50 bg-secondary/20 p-4">
                          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Capacity</span>
                          <div className="mt-2 text-3xl font-light text-foreground">
                            {marker.details.match(/Capacity: (\d+%)/)?.[1] || "78%"}
                          </div>
                        </div>
                        <div className="rounded-xl border border-border/50 bg-secondary/20 p-4">
                          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Quality</span>
                          <div className="mt-2 text-xl font-light text-foreground mt-3">Standard A</div>
                        </div>
                      </div>

                      <div className="flex-1 rounded-xl border border-border/50 bg-card p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-sm font-semibold">Effluent Telemetry</h3>
                          <span className="text-xs text-teal-500 flex items-center"><span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse mr-2"></span> Live</span>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Biological Oxygen Demand (BOD)</span>
                              <span className="text-foreground">18 mg/L <span className="text-muted-foreground">(Max 20)</span></span>
                            </div>
                            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                              <div className="h-full bg-teal-500 w-[90%]" />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Chemical Oxygen Demand (COD)</span>
                              <span className="text-foreground">42 mg/L <span className="text-muted-foreground">(Max 50)</span></span>
                            </div>
                            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                              <div className="h-full bg-teal-500 w-[84%]" />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Suspended Solids</span>
                              <span className="text-foreground">35 mg/L <span className="text-muted-foreground">(Max 50)</span></span>
                            </div>
                            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                              <div className="h-full bg-teal-500 w-[70%]" />
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-8 pt-4 border-t border-border flex gap-3">
                          <Button className="flex-1 bg-teal-600 hover:bg-teal-700">Run Diagnostics</Button>
                          <Button variant="outline" className="flex-1">Bypass Valve</Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {marker.type === "utility" && (
                    <div className="mb-4 space-y-3 rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-4">
                      <h4 className="text-sm font-semibold text-cyan-400">Network Control</h4>
                      <Button className="w-full bg-cyan-600 text-white hover:bg-cyan-700">
                        Reroute Traffic
                      </Button>
                      <Button variant="outline" className="w-full border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20">
                        Initiate Sector Lockdown
                      </Button>
                    </div>
                  )}

                  <Button className="w-full bg-slate-100 text-slate-900 hover:bg-slate-200" onClick={() => setShowExpanded(false)}>
                    Close Detailed View
                  </Button>
                  <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                    <Download className="mr-2 h-4 w-4" />
                    Export 24hr Log Data
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  )
}
