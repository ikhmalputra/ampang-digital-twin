"use client"

import { useState, useCallback, useEffect } from "react"
import Map, { Marker, NavigationControl } from "react-map-gl/maplibre"
import "maplibre-gl/dist/maplibre-gl.css"
import { MapPin } from "lucide-react"

interface ReportMapPickerProps {
  location: { lat: number; lng: number } | null
  onChange: (location: { lat: number; lng: number }) => void
}

export function ReportMapPicker({ location, onChange }: ReportMapPickerProps) {
  const [viewState, setViewState] = useState({
    longitude: 101.7645, // Default to Ampang Jaya center
    latitude: 3.1495,
    zoom: 13,
    pitch: 0,
    bearing: 0
  })

  // Center map when location is updated externally (search or geolocation)
  useEffect(() => {
    if (location) {
      setViewState(prev => ({
        ...prev,
        longitude: location.lng,
        latitude: location.lat,
        zoom: prev.zoom < 15 ? 15 : prev.zoom
      }))
    }
  }, [location])

  // Ensure map is interactive
  const onMove = useCallback((evt: any) => {
    setViewState(evt.viewState)
  }, [])

  // Update location when user clicks the map
  const handleClick = useCallback((event: any) => {
    onChange({
      lng: event.lngLat.lng,
      lat: event.lngLat.lat
    })
  }, [onChange])

  return (
    <div className="relative w-full h-[300px] rounded-lg overflow-hidden border border-border">
      <Map
        {...viewState}
        onMove={onMove}
        onClick={handleClick}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        interactive={true}
        cursor="crosshair"
      >
        <NavigationControl position="bottom-right" />

        {location && (
          <Marker longitude={location.lng} latitude={location.lat} anchor="bottom">
            <div className="relative -top-2 flex flex-col items-center animate-bounce">
              <div className="flex items-center justify-center h-10 w-10 bg-primary text-primary-foreground rounded-full shadow-lg">
                <MapPin className="h-6 w-6" />
              </div>
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1"></div>
            </div>
          </Marker>
        )}
      </Map>

      {!location && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-black/20">
          <div className="bg-background/80 backdrop-blur-sm text-foreground px-4 py-2 rounded-full text-sm font-medium shadow-sm border border-border">
            Click anywhere on the map to place a pin
          </div>
        </div>
      )}
    </div>
  )
}
