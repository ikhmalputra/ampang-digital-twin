"use client"

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { cn } from "@/lib/utils"

interface AreaChartCardProps {
  title: string
  data: Array<{ time: string; value: number; [key: string]: any }>
  dataKey?: string
  secondaryKey?: string
  color?: string
  secondaryColor?: string
  className?: string
  showLegend?: boolean
  legendLabels?: { primary: string; secondary?: string }
  valuePrefix?: string
  valueSuffix?: string
}

export function AreaChartCard({
  title,
  data,
  dataKey = "value",
  secondaryKey,
  color = "var(--chart-1)",
  secondaryColor = "var(--chart-3)",
  className,
  showLegend = false,
  legendLabels,
  valuePrefix = "",
  valueSuffix = "",
}: AreaChartCardProps) {
  const latestValue = data[data.length - 1]?.[dataKey as keyof (typeof data)[0]] ?? 0
  const secondaryLatestValue = secondaryKey 
    ? data[data.length - 1]?.[secondaryKey as keyof (typeof data)[0]] ?? 0 
    : null

  return (
    <div className={cn("rounded-3xl border border-white/5 bg-white/5 p-6 hover:bg-white/10 transition-colors", className)}>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{title}</h3>
          <div className="mt-1.5 flex items-baseline gap-3">
            <span className="text-3xl font-bold tracking-tight text-foreground">
              {valuePrefix}{typeof latestValue === 'number' ? latestValue.toLocaleString() : latestValue}{valueSuffix}
            </span>
            {secondaryLatestValue !== null && (
              <span className="text-sm text-muted-foreground">
                / {valuePrefix}{typeof secondaryLatestValue === 'number' ? secondaryLatestValue.toLocaleString() : secondaryLatestValue}{valueSuffix}
              </span>
            )}
          </div>
        </div>
        {showLegend && legendLabels && (
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-muted-foreground">{legendLabels.primary}</span>
            </div>
            {legendLabels.secondary && (
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: secondaryColor }} />
                <span className="text-muted-foreground">{legendLabels.secondary}</span>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${title.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
              {secondaryKey && (
                <linearGradient id={`gradient-secondary-${title.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={secondaryColor} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={secondaryColor} stopOpacity={0} />
                </linearGradient>
              )}
            </defs>
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
              dy={10}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                fontSize: '12px',
              }}
              labelStyle={{ color: 'var(--muted-foreground)' }}
              itemStyle={{ color: 'var(--foreground)' }}
            />
            {secondaryKey && (
              <Area
                type="monotone"
                dataKey={secondaryKey}
                stroke={secondaryColor}
                strokeWidth={1.5}
                fill={`url(#gradient-secondary-${title.replace(/\s/g, '')})`}
              />
            )}
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={1.5}
              fill={`url(#gradient-${title.replace(/\s/g, '')})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
        <span>12 hours ago</span>
        <span>Now</span>
      </div>
    </div>
  )
}
