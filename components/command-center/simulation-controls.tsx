"use client"

import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Waves, CloudRain, Car, Building, Scale3d } from "lucide-react"

interface SimulationControlsProps {
  active: boolean
  onToggle: (checked: boolean) => void
  rainfall: number
  onRainfallChange: (value: number) => void
  trafficSimulation: boolean
  onTrafficToggle: (checked: boolean) => void
  developmentSimulation: boolean
  onDevelopmentToggle: (checked: boolean) => void
  zoningCompliance: boolean
  onZoningToggle: (checked: boolean) => void
}

export function SimulationControls({ 
  active, onToggle, 
  rainfall, onRainfallChange,
  trafficSimulation, onTrafficToggle,
  developmentSimulation, onDevelopmentToggle,
  zoningCompliance, onZoningToggle
}: SimulationControlsProps) {
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex items-center gap-2 mb-1">
        <Waves className="h-4 w-4 text-primary" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Predictive Analysis
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {/* Flood Simulation */}
        <div className={`flex flex-col gap-2 rounded-2xl border transition-all duration-300 ${active ? 'bg-blue-500/10 border-blue-500/30 shadow-lg' : 'bg-white/5 border-transparent hover:bg-white/10'} p-4`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground flex items-center gap-2">
              <CloudRain className="h-4 w-4 text-blue-400" />
              Flood Modeling
            </span>
            <Switch checked={active} onCheckedChange={onToggle} />
          </div>
          
          {active && (
            <div className="flex flex-col gap-4 pt-3 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Rainfall Intensity</span>
                <span className="font-mono text-blue-400 font-bold">{rainfall} mm/hr</span>
              </div>
              <Slider
                value={[rainfall]}
                onValueChange={(vals) => onRainfallChange(vals[0])}
                max={200}
                step={5}
                className="w-full"
              />
              
              <div className="rounded-xl bg-background/50 p-3 border border-white/5 backdrop-blur-sm">
                <p className="text-[11px] leading-relaxed text-blue-100">
                  {rainfall < 50 
                    ? "Low risk. Sungai Ampang flow is stable." 
                    : rainfall < 120 
                    ? "Moderate risk. Retention ponds filling. Watch low-lying areas in Taman Dagang." 
                    : "High risk! Flash floods likely in Ampang Point and MRR2 intersections."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Traffic Simulation */}
        <div className={`flex flex-col gap-2 rounded-2xl border transition-all duration-300 ${trafficSimulation ? 'bg-green-500/10 border-green-500/30 shadow-lg' : 'bg-white/5 border-transparent hover:bg-white/10'} p-4`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground flex items-center gap-2">
              <Car className="h-4 w-4 text-green-400" />
              Rail & Transit Network
            </span>
            <Switch checked={trafficSimulation} onCheckedChange={onTrafficToggle} />
          </div>
          {trafficSimulation && (
             <div className="mt-2 rounded-xl bg-background/50 p-3 border border-white/5 backdrop-blur-sm animate-in fade-in">
              <p className="text-[11px] leading-relaxed text-green-100">
                Visualizing LRT Ampang Line (Orange), proposed MRT3 Circle Line (Pink), and automated feeder bus routes (Green/Blue).
              </p>
             </div>
          )}
        </div>

        {/* Development Impact */}
        <div className={`flex flex-col gap-2 rounded-2xl border transition-all duration-300 ${developmentSimulation ? 'bg-orange-500/10 border-orange-500/30 shadow-lg' : 'bg-white/5 border-transparent hover:bg-white/10'} p-4`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground flex items-center gap-2">
              <Building className="h-4 w-4 text-orange-400" />
              High-Rise Impact
            </span>
            <Switch checked={developmentSimulation} onCheckedChange={onDevelopmentToggle} />
          </div>
          {developmentSimulation && (
             <div className="mt-2 rounded-xl bg-background/50 p-3 border border-white/5 backdrop-blur-sm animate-in fade-in">
              <p className="text-[11px] leading-relaxed text-orange-100">
                Visualizing shadow impact and population density changes for 4 major approved projects (Ampang Point, Pandan Indah TOD, Melawati).
              </p>
             </div>
          )}
        </div>

        {/* Zoning Compliance */}
        <div className={`flex flex-col gap-2 rounded-2xl border transition-all duration-300 ${zoningCompliance ? 'bg-red-500/10 border-red-500/30 shadow-lg' : 'bg-white/5 border-transparent hover:bg-white/10'} p-4`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground flex items-center gap-2">
              <Scale3d className="h-4 w-4 text-red-400" />
              Zoning Compliance
            </span>
            <Switch checked={zoningCompliance} onCheckedChange={onZoningToggle} />
          </div>
          {zoningCompliance && (
             <div className="mt-2 rounded-xl bg-background/50 p-3 border border-white/5 backdrop-blur-sm animate-in fade-in">
              <p className="text-[11px] leading-relaxed text-red-100">
                Highlighting buildings exceeding 50m height limits in restricted residential zones.
              </p>
             </div>
          )}
        </div>

      </div>
    </div>
  )
}
