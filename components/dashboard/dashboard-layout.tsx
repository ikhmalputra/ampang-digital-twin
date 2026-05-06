"use client"

import { SidebarNav } from "./sidebar-nav"
import { Header } from "./header"

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: React.ReactNode
}

export function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-sans text-foreground relative p-4 gap-4">
      <SidebarNav />
      <div className="flex-1 flex flex-col h-full rounded-3xl border border-white/10 bg-background/60 backdrop-blur-2xl shadow-2xl overflow-hidden relative">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 hide-scrollbar">{children}</main>
      </div>
    </div>
  )
}
