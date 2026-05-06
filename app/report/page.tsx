import { Metadata } from "next"
import { ReportForm } from "@/components/report/report-form"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Citizen Complain Centre | Ampang Jaya Smart City",
  description: "Submit reports, complaints, and issues directly to MPAJ.",
}

export default function ReportPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background relative">
      {/* Simple Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/60 backdrop-blur-2xl">
        <div className="container flex h-20 max-w-screen-xl items-center px-6">
          <Link href="/" className="flex items-center text-sm font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider">
            <ChevronLeft className="mr-2 h-5 w-5" />
            Back to Command Center
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 lg:px-6 py-10 relative">
        <div className="mx-auto max-w-4xl relative z-10">
          <div className="mb-10 text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">Citizen Complain Centre</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed">
              Help us improve Ampang Jaya by reporting issues like potholes, illegal dumping, or broken streetlights. 
              Your report will be sent directly to the MPAJ Command Center.
            </p>
          </div>
          
          <ReportForm />
        </div>
        
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none -z-10"></div>
      </main>
    </div>
  )
}

