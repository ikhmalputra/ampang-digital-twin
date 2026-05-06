"use client"

import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface FloatingPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center"
}

export function FloatingPanel({ children, className, position = "top-left", ...props }: FloatingPanelProps) {
  const positionClasses = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "top-center": "top-4 left-1/2 -translate-x-1/2",
  }

  return (
    <div
      className={cn(
        "absolute z-[1000] rounded-xl border border-border/50 bg-card/95 p-4 shadow-2xl backdrop-blur-xl",
        positionClasses[position],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
