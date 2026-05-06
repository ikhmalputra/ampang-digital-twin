import { Construction } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"

interface ComingSoonProps {
  title: string
  description?: string
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <DashboardLayout 
      title={title} 
      subtitle={description || "Module in development for Phase 2"}
    >
      <div className="flex h-[60vh] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Construction className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Under Construction</h2>
        <p className="mt-2 max-w-[500px] text-muted-foreground">
          The <strong>{title}</strong> module is part of the Digital Twin Phase 2 rollout. 
          This section will integrate directly with MPAJ backend databases once the API endpoints are fully commissioned.
        </p>
      </div>
    </DashboardLayout>
  )
}
