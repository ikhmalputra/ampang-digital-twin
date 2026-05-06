"use client"

import { cn } from "@/lib/utils"
import { LucideIcon, ArrowRight } from "lucide-react"

interface ServiceCardProps {
  title: string
  description: string
  icon: LucideIcon
  stats?: { label: string; value: string }[]
  className?: string
}

export function ServiceCard({
  title,
  description,
  icon: Icon,
  stats,
  className,
}: ServiceCardProps) {
  return (
    <div
      className={cn(
        "group relative rounded-3xl border border-white/5 bg-white/5 p-6 transition-all duration-300 hover:bg-white/10 hover:border-white/10",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="rounded-xl border border-white/10 bg-black/20 p-3 shadow-sm">
          <Icon className="h-5 w-5 text-accent" />
        </div>
        <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-hover:text-accent group-hover:translate-x-1 duration-300" />
      </div>
      <div className="mt-5">
        <h3 className="font-bold tracking-tight text-lg">{title}</h3>
        <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
      {stats && stats.length > 0 && (
        <div className="mt-5 flex gap-5 border-t border-white/5 pt-5">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-xl font-bold tracking-tight tabular-nums text-foreground">{stat.value}</p>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
