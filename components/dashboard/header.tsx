"use client"

import { Bell, Search, ChevronDown, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface HeaderProps {
  title: string
  subtitle?: React.ReactNode
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/5 bg-background/40 px-6 backdrop-blur-xl shrink-0">
      <div className="flex items-center gap-4 pl-10 lg:pl-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && (
            <div className="hidden text-sm text-muted-foreground mt-0.5 sm:block">{subtitle}</div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="h-10 w-64 rounded-full border-white/10 bg-white/5 pl-10 text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-white/20 transition-all hover:bg-white/10"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-10 rounded-full gap-2 border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Last 12 hours</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 rounded-xl">
            <DropdownMenuItem className="rounded-lg">Last hour</DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg">Last 6 hours</DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg">Last 12 hours</DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg">Last 24 hours</DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg">Last 7 days</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" size="icon" className="relative h-10 w-10 rounded-full border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute 0 top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]">
            3
          </span>
        </Button>

        <div className="ml-2 hidden items-center gap-3 border-l border-white/10 pl-5 sm:flex">
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary/20 to-primary/40 border border-primary/20 flex items-center justify-center text-primary font-bold shadow-sm">
            A
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold tracking-tight">Admin</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Operations</p>
          </div>
        </div>
      </div>
    </header>
  )
}
