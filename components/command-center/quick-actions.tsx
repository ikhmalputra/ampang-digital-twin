"use client"

import { useState, useRef, useEffect } from "react"
import { Phone, Megaphone, FileText, Settings, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const actions = [
  { icon: Phone, label: "Emergency Call", color: "bg-red-500 hover:bg-red-600" },
  { icon: Megaphone, label: "Broadcast Alert", color: "bg-yellow-500 hover:bg-yellow-600" },
  { icon: FileText, label: "Generate Report", color: "bg-primary hover:bg-primary/90" },
  { icon: Settings, label: "Settings", color: "bg-secondary hover:bg-secondary/80" },
]

export function QuickActions() {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <TooltipProvider>
      <div className="flex flex-col-reverse items-end gap-2" ref={containerRef}>
        {/* Main Toggle Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              className={`h-12 w-12 rounded-full shadow-xl transition-transform duration-200 ${
                isOpen ? "bg-secondary text-foreground hover:bg-secondary/80 rotate-45" : "bg-primary text-white hover:bg-primary/90"
              }`}
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>{isOpen ? "Close Actions" : "Quick Actions"}</p>
          </TooltipContent>
        </Tooltip>

        {/* Action Buttons */}
        <div 
          className={`flex flex-col-reverse items-center gap-2 transition-all duration-200 origin-bottom ${
            isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
          }`}
        >
          {actions.map((action, index) => {
            const Icon = action.icon
            return (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    className={`h-10 w-10 rounded-full ${action.color} text-white shadow-lg`}
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>{action.label}</p>
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>
      </div>
    </TooltipProvider>
  )
}
