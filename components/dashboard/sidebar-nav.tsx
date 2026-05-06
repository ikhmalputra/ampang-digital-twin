"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  TrafficCone,
  Wind,
  Zap,
  Droplets,
  Shield,
  Users,
  Bell,
  Settings,
  FileText,
  Menu,
  X,
  Map,
  Car,
  ShieldAlert
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import Image from "next/image"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Command Center", href: "/", icon: Map },
  { name: "Traffic", href: "/traffic", icon: Car },
  { name: "Air Quality", href: "/air-quality", icon: Wind },
  { name: "Energy", href: "/energy", icon: Zap },
  { name: "Water", href: "/water", icon: Droplets },
  { name: "Public Safety", href: "/safety", icon: ShieldAlert },
  { name: "Citizen Services", href: "/report", icon: Users },
]

const secondary = [
  { name: "Alerts", href: "/alerts", icon: Bell, badge: 3 },
  { name: "Reports", href: "/reports", icon: FileText },
]

const footer = [
  { name: "Settings", href: "/settings", icon: Settings },
]

export function SidebarNav() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const SidebarContent = () => (
    <>
      {/* MPAJ Logo */}
      <div className="flex h-20 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-white p-1">
            <Image
              src="/mpaj-logo.jpg"
              alt="Majlis Perbandaran Ampang Jaya"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold leading-tight text-foreground">Majlis Perbandaran</span>
            <span className="text-xs font-semibold leading-tight text-primary">Ampang Jaya</span>
            <span className="mt-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">Smart City</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <div className="mb-2 px-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Infrastructure
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}

        <div className="mb-2 mt-6 px-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Management
        </div>
        {secondary.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-4 w-4" />
                {item.name}
              </div>
              {item.badge && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-medium text-accent-foreground">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border px-3 py-4">
        {footer.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </div>
    </>
  )

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 lg:hidden rounded-xl shadow-lg backdrop-blur-xl bg-background/80"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed left-4 top-4 bottom-4 z-50 flex w-72 flex-col rounded-3xl border border-white/10 bg-background/80 backdrop-blur-2xl shadow-2xl transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-[120%]"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="relative z-40 hidden h-full w-72 flex-col rounded-3xl border border-white/10 bg-background/70 backdrop-blur-2xl shadow-2xl lg:flex overflow-hidden">
        <SidebarContent />
      </aside>
    </>
  )
}
