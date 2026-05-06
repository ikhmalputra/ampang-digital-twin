"use client"

import { useState } from "react"
import { MapPin, Camera, AlertCircle, CheckCircle2, Loader2, Upload, Search, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ReportMapPicker } from "./report-map-picker"

export function ReportForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isLocating, setIsLocating] = useState(false)

  const handleSearchLocation = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault()
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    try {
      // Append Ampang Jaya for better local results if not already specified
      const query = searchQuery.toLowerCase().includes("ampang") ? searchQuery : `${searchQuery}, Ampang Jaya`
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`)
      const data = await res.json()
      
      if (data && data.length > 0) {
        setLocation({
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        })
      } else {
        // Fallback without Ampang Jaya constraint
        const fallbackRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`)
        const fallbackData = await fallbackRes.json()
        if (fallbackData && fallbackData.length > 0) {
          setLocation({
            lat: parseFloat(fallbackData[0].lat),
            lng: parseFloat(fallbackData[0].lon)
          })
        } else {
          alert("Location not found. Please try a different search or click on the map.")
        }
      }
    } catch (err) {
      console.error("Search error:", err)
      alert("Failed to search location. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  const handleGeolocation = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsLocating(true)
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
          setIsLocating(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          alert("Could not get your current location. Please check your browser permissions.")
          setIsLocating(false)
        },
        { enableHighAccuracy: true }
      )
    } else {
      alert("Geolocation is not supported by your browser.")
      setIsLocating(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Create a fake preview URL for the demo
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call to MPAJ backend
    await new Promise((resolve) => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in duration-500 max-w-2xl mx-auto mt-10">
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
        </div>
        <h2 className="text-3xl font-bold mb-4 tracking-tight">Report Submitted Successfully</h2>
        <p className="text-muted-foreground mb-10 max-w-md mx-auto text-lg leading-relaxed">
          Thank you for making Ampang Jaya a better place. Your report has been sent to the Intelligent Command Centre.
        </p>
        <div className="bg-black/20 p-6 rounded-2xl border border-white/5 inline-block text-left mb-10 shadow-inner">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Reference ID</p>
          <p className="font-mono text-2xl font-bold tracking-wider text-foreground">MPAJ-REP-{Math.floor(100000 + Math.random() * 900000)}</p>
        </div>
        <div>
          <Button 
            size="lg"
            className="rounded-full px-8 h-12 text-base font-bold shadow-lg"
            onClick={() => {
              setIsSubmitted(false)
              setLocation(null)
              setPreviewUrl(null)
            }}>Submit Another Report</Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10 rounded-3xl border border-white/10 bg-background/60 backdrop-blur-2xl p-8 md:p-10 shadow-2xl">
      
      {/* 1. Category & Title */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold border-b border-white/10 pb-4 flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-xl text-primary">
            <AlertCircle className="h-5 w-5" />
          </div>
          1. Issue Details
        </h3>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <Label htmlFor="category" className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Category <span className="text-red-500">*</span></Label>
            <Select required>
              <SelectTrigger id="category" className="h-12 rounded-xl bg-white/5 border-white/10 focus:ring-primary/50">
                <SelectValue placeholder="Select an issue category" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-white/10 bg-background/95 backdrop-blur-xl">
                <SelectItem className="rounded-lg py-3" value="infrastructure">Infrastructure (Potholes, Roads)</SelectItem>
                <SelectItem className="rounded-lg py-3" value="waste">Waste & Illegal Dumping</SelectItem>
                <SelectItem className="rounded-lg py-3" value="utilities">Utilities (Streetlights, Drains)</SelectItem>
                <SelectItem className="rounded-lg py-3" value="environment">Environment (Fallen Trees, Pests)</SelectItem>
                <SelectItem className="rounded-lg py-3" value="public_order">Public Order / Nuisance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="title" className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Short Title <span className="text-red-500">*</span></Label>
            <Input id="title" placeholder="e.g. Massive pothole on Jalan Besar" required className="h-12 rounded-xl bg-white/5 border-white/10 focus-visible:ring-primary/50" />
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="description" className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Detailed Description</Label>
          <Textarea 
            id="description" 
            placeholder="Please provide any additional details that might help the response team..." 
            className="min-h-[120px] rounded-2xl bg-white/5 border-white/10 focus-visible:ring-primary/50 resize-y"
          />
        </div>
      </div>

      {/* 2. Location Pinpoint */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold border-b border-white/10 pb-4 flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-xl text-primary">
            <MapPin className="h-5 w-5" />
          </div>
          2. Exact Location
        </h3>
        <p className="text-base text-muted-foreground leading-relaxed">
          Search for an address, use your current location, or click on the map to place a pin.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search address or landmark..." 
              className="h-12 pl-12 rounded-xl bg-white/5 border-white/10 focus-visible:ring-primary/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSearchLocation(e as any)
                }
              }}
            />
          </div>
          <Button variant="secondary" className="h-12 rounded-xl px-6 font-bold hover:bg-white/10" onClick={handleSearchLocation} disabled={isSearching || !searchQuery.trim()}>
            {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : "Search"}
          </Button>
          <Button variant="outline" onClick={handleGeolocation} disabled={isLocating} className="h-12 rounded-xl px-6 font-bold shrink-0 bg-white/5 border-white/10 hover:bg-white/10">
            {isLocating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Navigation className="mr-2 h-5 w-5" />}
            Use My Location
          </Button>
        </div>
        
        <div className="h-[400px] w-full rounded-2xl border border-white/10 overflow-hidden bg-black/20 relative shadow-inner">
          <ReportMapPicker 
            location={location} 
            onChange={setLocation} 
          />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Latitude</Label>
            <Input value={location?.lat?.toFixed(6) || ""} readOnly placeholder="Select on map" className="h-12 rounded-xl bg-black/20 border-white/5 font-mono text-muted-foreground" />
          </div>
          <div className="space-y-3">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Longitude</Label>
            <Input value={location?.lng?.toFixed(6) || ""} readOnly placeholder="Select on map" className="h-12 rounded-xl bg-black/20 border-white/5 font-mono text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* 3. Evidence Upload */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold border-b border-white/10 pb-4 flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-xl text-primary">
            <Camera className="h-5 w-5" />
          </div>
          3. Photo Evidence
        </h3>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <p className="text-base text-muted-foreground leading-relaxed">
              Please upload clear photos of the issue. This helps the MPAJ team dispatch the correct equipment.
            </p>
            <div className="flex items-center justify-center w-full">
              <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/50 transition-all duration-300">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-muted-foreground">
                  <Upload className="w-10 h-10 mb-3 text-primary/70" />
                  <p className="mb-2 text-sm"><span className="font-bold text-foreground">Click to upload</span> or drag and drop</p>
                  <p className="text-xs font-medium uppercase tracking-wider">PNG, JPG or JPEG (MAX. 5MB)</p>
                </div>
                <Input id="dropzone-file" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
          </div>
          
          <div className="h-40 rounded-2xl border border-white/10 bg-black/20 flex items-center justify-center overflow-hidden shadow-inner relative">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 opacity-50">
                <Camera className="h-8 w-8 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">No image selected</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submit Action */}
      <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        {!location ? (
          <p className="text-sm font-bold text-red-500 bg-red-500/10 px-4 py-2 rounded-lg">
            * Please pinpoint a location on the map before submitting.
          </p>
        ) : (
          <p className="text-sm font-bold text-green-500 bg-green-500/10 px-4 py-2 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> Ready to submit
          </p>
        )}
        
        <Button 
          type="submit" 
          size="lg" 
          disabled={isSubmitting || !location}
          className="w-full sm:w-auto h-14 px-8 rounded-full text-base font-bold shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-3 h-5 w-5 animate-spin" />
              Submitting to MPAJ...
            </>
          ) : (
            "Submit Citizen Report"
          )}
        </Button>
      </div>
    </form>
  )
}
