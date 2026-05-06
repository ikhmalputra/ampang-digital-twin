"use client"

import { Car, Video, Radar, AlertTriangle, Layers, Lightbulb, MessageSquare, Network, Building2, Truck, ShieldPlus, Users, Droplet } from "lucide-react"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type BasemapId = "dark" | "satellite" | "light"

interface LayerButtonProps {
  icon: React.ReactNode
  label: string
  active: boolean
  count: number
  color: string
  onClick: () => void
}

function LayerButton({ icon, label, active, count, color, onClick }: LayerButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-between w-full rounded-2xl px-3 py-2.5 transition-all duration-300 border",
        active 
          ? "bg-white/10 border-white/20 shadow-sm" 
          : "bg-transparent border-transparent hover:bg-white/5"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl shadow-sm transition-colors", 
          active ? color : "bg-white/5 text-muted-foreground"
        )}>
          {icon}
        </div>
        <div className="flex flex-col items-start">
          <span className={cn("text-sm font-medium tracking-tight", active ? "text-foreground" : "text-muted-foreground")}>
            {label}
          </span>
          {count > 0 && (
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{count} Active</span>
          )}
        </div>
      </div>
      
      {/* Toggle switch visual indicator */}
      <div className={cn(
        "h-5 w-9 rounded-full p-0.5 transition-colors duration-300 ease-in-out",
        active ? "bg-green-500" : "bg-white/10"
      )}>
        <div className={cn(
          "h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out",
          active ? "translate-x-4" : "translate-x-0"
        )} />
      </div>
    </button>
  )
}

export interface LayerState {
  traffic: boolean
  cameras: boolean
  sensors: boolean
  alerts: boolean
  lighting: boolean
  reports: boolean
  utilities: boolean
  bim: boolean
  facilities: boolean
  waste: boolean
  demographics: boolean
  iwk: boolean
  // Map-specific layers
  buildings: boolean
  boundary: boolean
  markers: boolean
  landPlots: boolean
  parks: boolean
  water: boolean
  pois: boolean
  aqi: boolean
  riverLevel: boolean
}

interface LayerControlsProps {
  layers: LayerState
  onToggle: (layer: keyof LayerState) => void
  basemap: BasemapId
  onBasemapChange: (basemap: BasemapId) => void
}

export function LayerControls({ layers, onToggle, basemap, onBasemapChange }: LayerControlsProps) {
  return (
    <div className="flex w-full flex-col gap-4">
      {/* Base Map Style */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Base Map
          </span>
        </div>
        <Select value={basemap} onValueChange={(value) => onBasemapChange(value as BasemapId)}>
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="Select basemap" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light" className="text-xs">
              OpenFreeMap (Light)
            </SelectItem>
            <SelectItem value="dark" className="text-xs">
              OpenFreeMap (Dark)
            </SelectItem>
            <SelectItem value="satellite" className="text-xs">
              Satellite (Esri)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Vector Data Layers */}
      <div className="flex flex-col gap-1">
        <div className="mb-1 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Vector Layers
          </span>
        </div>
        <LayerButton
          icon={<Building2 className="h-4 w-4 text-white" />}
          label="3D Buildings"
          active={layers.buildings}
          count={0}
          color="bg-slate-600"
          onClick={() => onToggle("buildings")}
        />
        <LayerButton
          icon={<Layers className="h-4 w-4 text-white" />}
          label="Land Plots (Cadastral)"
          active={layers.landPlots}
          count={0}
          color="bg-amber-500"
          onClick={() => onToggle("landPlots")}
        />
        <LayerButton
          icon={<AlertTriangle className="h-4 w-4 text-white" />}
          label="Points of Interest"
          active={layers.pois}
          count={0}
          color="bg-purple-500"
          onClick={() => onToggle("pois")}
        />
        <LayerButton
          icon={<Network className="h-4 w-4 text-white" />}
          label="Parks & Forests"
          active={layers.parks}
          count={0}
          color="bg-green-500"
          onClick={() => onToggle("parks")}
        />
        <LayerButton
          icon={<Droplet className="h-4 w-4 text-white" />}
          label="Water Bodies"
          active={layers.water}
          count={0}
          color="bg-blue-500"
          onClick={() => onToggle("water")}
        />
        <LayerButton
          icon={<Users className="h-4 w-4 text-white" />}
          label="Population Demographics"
          active={layers.demographics}
          count={5}
          color="bg-emerald-600"
          onClick={() => onToggle("demographics")}
        />
      </div>

      {/* Telemetry Layers */}
      <div className="flex flex-col gap-1">
        <div className="mb-1 flex items-center gap-2">
          <Radar className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Telemetry & Markers
          </span>
        </div>
        <LayerButton
          icon={<Car className="h-4 w-4 text-white" />}
          label="Traffic"
          active={layers.traffic}
          count={24}
          color="bg-primary"
          onClick={() => onToggle("traffic")}
        />
        <LayerButton
          icon={<Video className="h-4 w-4 text-white" />}
          label="CCTV"
          active={layers.cameras}
          count={86}
          color="bg-yellow-500"
          onClick={() => onToggle("cameras")}
        />
        <LayerButton
          icon={<Radar className="h-4 w-4 text-white" />}
          label="Live AQI Sensors"
          active={layers.aqi}
          count={142}
          color="bg-accent"
          onClick={() => onToggle("aqi")}
        />
        <LayerButton
          icon={<AlertTriangle className="h-4 w-4 text-white" />}
          label="River Level Alerts"
          active={layers.riverLevel}
          count={3}
          color="bg-cyan-500"
          onClick={() => onToggle("riverLevel")}
        />
        <LayerButton
          icon={<AlertTriangle className="h-4 w-4 text-white" />}
          label="Incidents"
          active={layers.alerts}
          count={3}
          color="bg-red-500"
          onClick={() => onToggle("alerts")}
        />
        <LayerButton
          icon={<Lightbulb className="h-4 w-4 text-white" />}
          label="Smart Lighting"
          active={layers.lighting}
          count={2}
          color="bg-purple-500"
          onClick={() => onToggle("lighting")}
        />
        <LayerButton
          icon={<MessageSquare className="h-4 w-4 text-white" />}
          label="Citizen Reports"
          active={layers.reports}
          count={2}
          color="bg-pink-500"
          onClick={() => onToggle("reports")}
        />
        <LayerButton
          icon={<Network className="h-4 w-4 text-white" />}
          label="Underground Utilities"
          active={layers.utilities}
          count={5}
          color="bg-cyan-500"
          onClick={() => onToggle("utilities")}
        />
        <LayerButton
          icon={<Building2 className="h-4 w-4 text-white" />}
          label="BIM Models"
          active={layers.bim}
          count={1}
          color="bg-blue-500"
          onClick={() => onToggle("bim")}
        />
        <LayerButton
          icon={<Droplet className="h-4 w-4 text-white" />}
          label="Indah Water (IWK)"
          active={layers.iwk}
          count={3}
          color="bg-teal-500"
          onClick={() => onToggle("iwk")}
        />
        <LayerButton
          icon={<ShieldPlus className="h-4 w-4 text-white" />}
          label="Facilities & Emergency"
          active={layers.facilities}
          count={4}
          color="bg-indigo-500"
          onClick={() => onToggle("facilities")}
        />
        <LayerButton
          icon={<Truck className="h-4 w-4 text-white" />}
          label="Waste Management"
          active={layers.waste}
          count={3}
          color="bg-amber-600"
          onClick={() => onToggle("waste")}
        />
      </div>
    </div>
  )
}
