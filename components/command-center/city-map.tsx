"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { AMPANG_CENTER, type MapMarker } from "@/lib/map-data"
import Map, { Layer, Marker, NavigationControl, Popup, Source, useMap, useControl } from "react-map-gl/maplibre"
import type { MapRef } from "react-map-gl/maplibre"
import maplibregl from "maplibre-gl"
import { Protocol } from "pmtiles"
import { 
  Car, AlertTriangle, Activity, Camera, Lightbulb, 
  MessageSquare, Zap, Building2, ShieldAlert, Trash2, Droplets,
  Layers, Eye, EyeOff, Map as MapIcon, Maximize2, CloudRain, Trees, MapPin, MapPinned,
  Search, Download, Wind, Waves, Hexagon, Target, X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
// @ts-ignore
import { MapboxOverlay } from "@deck.gl/mapbox"
// @ts-ignore
import { PathLayer, PolygonLayer, ColumnLayer } from "@deck.gl/layers"
import { HexagonLayer } from "@deck.gl/aggregation-layers"
// @ts-ignore
import { TripsLayer } from "@deck.gl/geo-layers"
// @ts-ignore
import { Tiles3DLoader } from "@loaders.gl/3d-tiles"
import "maplibre-gl/dist/maplibre-gl.css"
import * as turf from "@turf/turf"
import mqtt from "mqtt"

function DeckGLOverlay(props: any) {
  const overlay = useControl<any>(() => new MapboxOverlay(props));
  
  useEffect(() => {
    if (overlay && typeof overlay.setProps === 'function') {
      overlay.setProps(props);
    }
  }, [overlay, props]);

  return null;
}

// Initialize PMTiles protocol
if (typeof window !== "undefined") {
  const protocol = new Protocol()
  try {
    maplibregl.addProtocol("pmtiles", protocol.tile)
  } catch (e) {
    // Protocol might already be added during HMR
  }
  // Reduce parallel requests to prevent net::ERR_ABORTED under heavy load
  maplibregl.setMaxParallelImageRequests(6)
}

type OSMResponse = {
  roads: any
  trafficLights: any
}

function markerColor(type: string) {
  switch (type) {
    case "traffic":
      return "#0066B3"
    case "alert":
      return "#ef4444"
    case "sensor":
      return "#00A651"
    case "camera":
      return "#f59e0b"
    case "lighting":
      return "#8b5cf6" // Purple
    case "report":
      return "#ec4899" // Pink
    case "utility":
      return "#06b6d4" // Cyan
    case "bim":
      return "#3b82f6" // Blue
    case "facility":
      return "#6366f1" // Indigo
    case "waste":
      return "#d97706" // Amber
    case "iwk":
      return "#14b8a6" // Teal
    default:
      return "#ffffff"
  }
}

function MarkerIcon({ type, status }: { type: string, status?: string }) {
  const Icon = (() => {
    switch (type) {
      case "traffic": return Car
      case "alert": return AlertTriangle
      case "sensor": return Activity
      case "camera": return Camera
      case "lighting": return Lightbulb
      case "report": return MessageSquare
      case "utility": return Zap
      case "bim": return Building2
      case "facility": return ShieldAlert
      case "waste": return Trash2
      case "iwk": return Droplets
      default: return Activity
    }
  })()

  const isPulsing = status === "Critical" || status === "Alert" || status === "Warning" || type === "alert"

  return (
    <div className="relative group">
      {/* Pulse effect for critical/alert markers */}
      {isPulsing && (
        <div className="absolute -inset-1 rounded-full animate-ping opacity-75" style={{ backgroundColor: markerColor(type) }} />
      )}
      <div
        className="relative flex items-center justify-center h-8 w-8 rounded-full border-[2px] border-white/90 shadow-[0_4px_12px_rgba(0,0,0,0.5)] cursor-pointer transition-all duration-300 hover:scale-110 hover:border-white pointer-events-auto backdrop-blur-md"
        style={{ 
          backgroundColor: markerColor(type),
          boxShadow: isPulsing ? `0 0 15px ${markerColor(type)}` : undefined
        }}
      >
        <Icon className="w-4 h-4 text-white" />
      </div>
    </div>
  )
}

function bboxFromFeatureCollection(fc: any) {
  let minLng = Infinity
  let minLat = Infinity
  let maxLng = -Infinity
  let maxLat = -Infinity

  const add = (lng: number, lat: number) => {
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) return
    if (lng < minLng) minLng = lng
    if (lat < minLat) minLat = lat
    if (lng > maxLng) maxLng = lng
    if (lat > maxLat) maxLat = lat
  }

  const walk = (g: any) => {
    if (!g) return
    if (g.type === "FeatureCollection") {
      for (const f of g.features ?? []) walk(f)
      return
    }
    if (g.type === "Feature") {
      walk(g.geometry)
      return
    }
    const coords = g.coordinates
    if (!coords) return
    const stack = [coords]
    while (stack.length) {
      const cur = stack.pop()
      if (!cur) continue
      if (typeof cur[0] === "number" && typeof cur[1] === "number") {
        add(cur[0], cur[1])
      } else if (Array.isArray(cur)) {
        for (const c of cur) stack.push(c)
      }
    }
  }

  walk(fc)
  if (!Number.isFinite(minLng) || !Number.isFinite(minLat) || !Number.isFinite(maxLng) || !Number.isFinite(maxLat)) return null
  return { minLng, minLat, maxLng, maxLat }
}

const TRAFFIC_SIMULATION_DATA = [
  // MRT3 Circle Line (Proposed) - Pink
  { 
    path: [
      [101.7369, 3.1758], // Setiawangsa (Interchange)
      [101.7540, 3.1750], // Taman Hillview
      [101.7580, 3.1530], // Ampang Jaya Station
      [101.7511, 3.1422], // Pandan Indah (Interchange)
      [101.7450, 3.1250]  // Heading South towards Cheras
    ], 
    color: [236, 72, 153, 220],
    width: 15
  },
  // LRT Ampang Line - Orange/Yellow
  { 
    path: [
      [101.7631, 3.1503], // Ampang Station
      [101.7550, 3.1495], // Cahaya Station
      [101.7523, 3.1453], // Cempaka Station
      [101.7511, 3.1422], // Pandan Indah Station
      [101.7383, 3.1325], // Pandan Jaya Station
      [101.7200, 3.1250]  // Heading towards Chan Sow Lin
    ], 
    color: [245, 158, 11, 220],
    width: 12
  },
  // LRT Feeder Bus Route 1 (Green)
  { path: [[101.7631, 3.1503], [101.7650, 3.1550], [101.7750, 3.1580]], color: [34, 197, 94, 200], width: 8 },
  // LRT Feeder Bus Route 2 (Blue)
  { path: [[101.7511, 3.1422], [101.7580, 3.1450], [101.7680, 3.1450]], color: [59, 130, 246, 200], width: 8 }
];

const DEVELOPMENT_SIMULATION_DATA = [
  // Plot 1: Ampang Point Commercial Expansion
  {
    polygon: [
      [101.7470, 3.1570],
      [101.7510, 3.1570],
      [101.7510, 3.1610],
      [101.7470, 3.1610]
    ],
    height: 180, // 50+ stories
    color: [249, 115, 22, 180] // Orange
  },
  // Plot 2: Pandan Indah Mixed-Use TOD (Transit Oriented Development)
  {
    polygon: [
      [101.7520, 3.1300],
      [101.7570, 3.1300],
      [101.7570, 3.1350],
      [101.7520, 3.1350]
    ],
    height: 140, // 40 stories
    color: [249, 115, 22, 180]
  },
  // Plot 3: Taman Melawati High-Rise Residential
  {
    polygon: [
      [101.7450, 3.2080],
      [101.7520, 3.2080],
      [101.7520, 3.2140],
      [101.7450, 3.2140]
    ],
    height: 120, // 35 stories
    color: [249, 115, 22, 180]
  },
  // Plot 4: Small Infill Development near Jalan Ampang
  {
    polygon: [
      [101.7630, 3.1490],
      [101.7640, 3.1490],
      [101.7640, 3.1500],
      [101.7630, 3.1500]
    ],
    height: 90, // 25 stories
    color: [249, 115, 22, 180]
  }
];

const DARK_FIBER_NETWORK_DATA = [
  // Main Backbone
  { path: [[101.7600, 3.1420], [101.7615, 3.1478], [101.7645, 3.1495], [101.7680, 3.1530]], color: [6, 182, 212, 255] }, // Cyan
  // Branch Lines
  { path: [[101.7615, 3.1478], [101.7580, 3.1480], [101.7550, 3.1490]], color: [6, 182, 212, 180] },
  { path: [[101.7645, 3.1495], [101.7650, 3.1460], [101.7680, 3.1450]], color: [6, 182, 212, 180] },
];

const DEMOGRAPHICS_DATA = [
  // Mock data for different zones in Ampang Jaya
  {
    polygon: [[101.7630, 3.1490], [101.7680, 3.1500], [101.7650, 3.1550], [101.7600, 3.1520]],
    density: 12500, // High density (Ampang Point / Commercial)
    name: "Ampang Point Zone"
  },
  {
    polygon: [[101.7550, 3.1410], [101.7615, 3.1478], [101.7580, 3.1480], [101.7500, 3.1440]],
    density: 8200, // Medium-High (Taman Nirwana)
    name: "Taman Nirwana"
  },
  {
    polygon: [[101.7650, 3.1550], [101.7700, 3.1580], [101.7750, 3.1540], [101.7680, 3.1500]],
    density: 15400, // Very High (Pandan Indah)
    name: "Pandan Indah"
  },
  {
    polygon: [[101.7680, 3.1450], [101.7720, 3.1470], [101.7700, 3.1500], [101.7645, 3.1495]],
    density: 6100, // Medium (Taman Dagang)
    name: "Taman Dagang"
  }
];

interface CityMapProps {
  selectedMarker: number | null
  onMarkerSelect: (id: number) => void
  basemap: "dark" | "satellite" | "light"
  markers: MapMarker[]
  showUtilities?: boolean
  showDemographics?: boolean
  layerVisibility?: {
    buildings: boolean
    traffic: boolean
    markers: boolean
    boundary: boolean
    landPlots: boolean
    parks: boolean
    water: boolean
    pois: boolean
    aqi: boolean
    riverLevel: boolean
    bim?: boolean
  }
  onMapClick?: () => void
  simulationMode?: boolean
  rainfall?: number
  trafficSimulation?: boolean
  developmentSimulation?: boolean
  zoningCompliance?: boolean
  liveTraffic?: boolean
  bimOverlay?: boolean
}

export function CityMap({ 
  selectedMarker, onMarkerSelect, basemap, markers, showUtilities = false, showDemographics = false, 
  layerVisibility = {
    buildings: false,
    traffic: true,
    markers: true,
    boundary: true,
    landPlots: false,
    parks: true,
    water: true,
    pois: false,
    aqi: true,
    riverLevel: true,
  }, onMapClick, 
  simulationMode = false, rainfall = 0,
  trafficSimulation = false, developmentSimulation = false, zoningCompliance = false, liveTraffic = false, bimOverlay = false
}: CityMapProps) {
  const [mounted, setMounted] = useState(false)
  const [poiGeoJson, setPoiGeoJson] = useState<any>(null)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [isAnalysisMode, setIsAnalysisMode] = useState(false)
  const [trafficTrips, setTrafficTrips] = useState<any>(null)
  const [floodGrid, setFloodGrid] = useState<any>(null)
  const [bimData, setBimData] = useState<any>(null)
  const [time, setTime] = useState(0)
  const [liveSensorData, setLiveSensorData] = useState<any>(null)

  // Setup MQTT Client for real-time sensor updates
  useEffect(() => {
    // Connect to local Mosquitto over WebSockets (port 9001)
    const client = mqtt.connect("ws://localhost:9001", {
      clientId: `ampang_dt_client_${Math.random().toString(16).slice(2)}`,
    });

    client.on('connect', () => {
      console.log('Connected to Mosquitto MQTT broker');
      client.subscribe('ampang/sensors/water_level', (err) => {
        if (!err) console.log('Subscribed to ampang/sensors/water_level');
      });
    });

    client.on('message', (topic, message) => {
      try {
        const payload = JSON.parse(message.toString());
        console.log(`Received MQTT on ${topic}:`, payload);
        if (topic === 'ampang/sensors/water_level') {
          setLiveSensorData(payload);
        }
      } catch (e) {
        console.error('MQTT Parsing error:', e);
      }
    });

    return () => {
      client.end();
    };
  }, []);

  // Load advanced simulation data
  useEffect(() => {
    if (trafficSimulation && !trafficTrips) {
      fetch("/data/ampang_traffic_trips.json")
        .then(res => res.json())
        .then(data => setTrafficTrips(data))
        .catch(err => console.error("Failed to load traffic trips", err))
    }
    if (simulationMode && !floodGrid) {
      fetch("/data/ampang_flood_sim.json")
        .then(res => res.json())
        .then(data => setFloodGrid(data))
        .catch(err => console.error("Failed to load flood grid", err))
    }
    if (bimOverlay && !bimData) {
      fetch("/data/ampang_bim_mock.json")
        .then(res => res.json())
        .then(data => setBimData(data))
        .catch(err => console.error("Failed to load BIM data", err))
    }
  }, [trafficSimulation, trafficTrips, simulationMode, floodGrid, bimOverlay, bimData])

  // Animation loop for TripsLayer
  useEffect(() => {
    let animationFrame: number;
    if (trafficSimulation && trafficTrips) {
      const loopLength = 1000; // SIMULATION_DURATION from Python script
      const animationSpeed = 30; // speed multiplier
      
      const animate = () => {
        setTime((t) => (t + animationSpeed) % loopLength);
        animationFrame = requestAnimationFrame(animate);
      };
      
      animationFrame = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animationFrame);
  }, [trafficSimulation, trafficTrips]);

  // Geocoder state
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Map export
  const exportMap = () => {
    if (!mapRef.current) return;
    const canvas = mapRef.current.getMap().getCanvas();
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `Ampang_Digital_Twin_${new Date().toISOString().slice(0,10)}.png`;
    a.click();
  }

  // Geocoder search function using Nominatim (OpenStreetMap Free API)
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      // 1. Check if the user entered Latitude, Longitude (e.g., "3.14, 101.76")
      const coordMatch = searchQuery.match(/^(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)$/);
      if (coordMatch) {
        const lat = coordMatch[1];
        const lon = coordMatch[2];
        flyToResult(lat, lon);
        return; // Skip the API call since we already have coordinates
      }

      // 2. If it's text, prioritize Ampang Jaya context by appending it if not present
      let queryText = searchQuery;
      if (!queryText.toLowerCase().includes('ampang') && !queryText.toLowerCase().includes('selangor')) {
        // Automatically hint to the API that we want places in Ampang/Selangor
        queryText = `${queryText}, Ampang, Selangor`;
      }

      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(queryText)}&format=json&countrycodes=my&limit=5`);
      const data = await res.json();
      
      // If nothing found with the Ampang hint, try a fallback general Malaysia search
      if (data.length === 0 && queryText !== searchQuery) {
        const fallbackRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&countrycodes=my&limit=5`);
        const fallbackData = await fallbackRes.json();
        setSearchResults(fallbackData);
      } else {
        setSearchResults(data);
      }
      
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setIsSearching(false);
    }
  }

  const flyToResult = (lat: string, lon: string) => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [parseFloat(lon), parseFloat(lat)],
        zoom: 16,
        pitch: 45,
        duration: 2000
      });
    }
    setSearchResults([]);
    setSearchQuery("");
  }
  const mapRef = useRef<MapRef | null>(null)
  const [osm, setOsm] = useState<OSMResponse | null>(null)
  const [boundary, setBoundary] = useState<any>(null)
  const [invertedBoundary, setInvertedBoundary] = useState<any>(null)
  // Use internal map state for popups to avoid context errors with react-map-gl
  const [clickInfo, setClickInfo] = useState<{
    feature: any;
    lngLat: { lng: number; lat: number };
  } | null>(null)

  // Avoid placing Popup outside of Map context. We will render it INSIDE the Map component.
  const [river, setRiver] = useState<any>(null)

  // Automatically manage layer visibility based on active simulations to reduce clutter
  const effectiveLayerVisibility = useMemo(() => {
    if (simulationMode || trafficSimulation || developmentSimulation || zoningCompliance) {
      return {
        ...layerVisibility,
        buildings: !trafficSimulation && !simulationMode,
        traffic: !developmentSimulation && !simulationMode && !zoningCompliance,
        markers: false,
        boundary: false,
        landPlots: false,
        parks: !simulationMode,
        water: true,
        pois: false,
        aqi: false,
        riverLevel: false,
      }
    }
    return layerVisibility
  }, [layerVisibility, simulationMode, trafficSimulation, developmentSimulation, zoningCompliance])

  const deckLayers = useMemo(() => {
    const layers = []

    // AI Analysis: POI Density Hexagon Heatmap
    if (isAnalysisMode && poiGeoJson) {
      layers.push(
        new HexagonLayer({
          id: 'poi-heatmap',
          data: poiGeoJson.features,
          getPosition: (d: any) => d.geometry.coordinates,
          colorRange: [
            [255, 255, 178], // Light yellow
            [254, 204, 92],
            [253, 141, 60],
            [240, 59, 32],
            [189, 0, 38]   // Deep red
          ],
          elevationRange: [0, 500],
          elevationScale: 5,
          extruded: true,
          radius: 150, // 150 meter hexagons
          opacity: 0.8,
          coverage: 0.9,
          pickable: true,
          autoHighlight: true,
          onClick: (info: any) => {
            if (info.object) {
              const points = info.object.points;
              // Basic breakdown of what is in this hexagon
              const categories = points.reduce((acc: any, p: any) => {
                const cat = p.source.properties.amenity || p.source.properties.shop || 'other';
                acc[cat] = (acc[cat] || 0) + 1;
                return acc;
              }, {});
              
              setAnalysisResult({
                type: 'hexagon',
                count: points.length,
                categories,
                lngLat: info.coordinate
              });
            }
            return true;
          }
        })
      );
    }

    // Performance optimization: Do not render complex DeckGL layers when zoomed out too far
    // You can access map zoom via mapRef if needed, but since DeckGL overlays automatically
    // sync with Mapbox, we can just rely on DeckGL's built-in visibility toggles or simply 
    // allow them to render since they are hardware-accelerated.
    
    if (simulationMode && river) {
      // SWMM-style Dynamic Flood Grid (Time-Series)
      if (floodGrid) {
        // Map time (0-1000) to depth index (0-99)
        const timeIndex = Math.min(99, Math.floor(time / 10));
        
        layers.push(
          new ColumnLayer({
            id: 'flood-grid-simulation',
            data: floodGrid,
            diskResolution: 6,
            radius: 50,
            extruded: true,
            pickable: false,
            elevationScale: 5,
            getPosition: (d: any) => d.position,
            getFillColor: (d: any) => {
              const depth = d.depths[timeIndex];
              if (depth <= 0) return [0, 0, 0, 0];
              if (depth < 1) return [14, 165, 233, 120]; // Light blue
              if (depth < 3) return [234, 179, 8, 150]; // Yellow
              return [239, 68, 68, 180]; // Red
            },
            getElevation: (d: any) => d.depths[timeIndex],
            updateTriggers: {
              getFillColor: [timeIndex],
              getElevation: [timeIndex]
            },
            transitions: {
              getElevation: 30,
              getFillColor: 30
            }
          })
        )
      } else {
        // Fallback generic river expansion
        const baseWidth = 20
        const floodWidth = baseWidth + (rainfall * 2.5)
        const floodColor = rainfall < 50 
          ? [14, 165, 233, 120] 
          : rainfall < 120 
          ? [234, 179, 8, 150] 
          : [239, 68, 68, 180]

        layers.push(
          new PathLayer({
            id: 'flood-simulation-fallback',
            data: river,
            getPath: (d: any) => d.geometry?.coordinates || [],
            getColor: floodColor as [number, number, number, number],
            getWidth: floodWidth,
            widthMinPixels: 2,
            jointRounded: true,
            capRounded: true,
            pickable: false,
            transitions: {
              getWidth: 600,
              getColor: 600
            }
          })
        )
      }
    }

    if (trafficSimulation) {
      // Mock Rail & Feeder Routes
      layers.push(
        new PathLayer({
          id: 'traffic-simulation-routes',
          data: TRAFFIC_SIMULATION_DATA,
          getPath: (d: any) => d.path,
          getColor: (d: any) => d.color,
          getWidth: (d: any) => d.width,
          widthMinPixels: 4,
          jointRounded: true,
          capRounded: true,
          pickable: false
        })
      )
      
      // SUMO-style Microscopic Traffic Flow
      if (trafficTrips) {
        layers.push(
          new TripsLayer({
            id: 'microscopic-traffic-simulation',
            data: trafficTrips,
            getPath: (d: any) => d.path,
            getTimestamps: (d: any) => d.timestamps,
            getColor: (d: any) => d.color,
            opacity: 0.8,
            widthMinPixels: 5,
            jointRounded: true,
            capRounded: true,
            trailLength: 40,
            currentTime: time,
            shadowEnabled: false
          })
        )
      }
    }

    if (bimOverlay && bimData) {
      // Render internal floors
      layers.push(
        new PolygonLayer({
          id: 'bim-floors',
          data: bimData.floors,
          getPolygon: (d: any) => d.polygon,
          getFillColor: (d: any) => d.color,
          getElevation: (d: any) => d.elevation,
          extruded: true,
          wireframe: true,
          getLineColor: [255, 255, 255, 255],
          lineWidthMinPixels: 2,
          pickable: true
        })
      )
      
      // Render HVAC pipes
      layers.push(
        new PathLayer({
          id: 'bim-hvac',
          data: bimData.hvac,
          getPath: (d: any) => d.path,
          getColor: (d: any) => d.color,
          getWidth: 3,
          widthMinPixels: 3,
          jointRounded: true,
          capRounded: true,
          pickable: true
        })
      )
    }

    if (developmentSimulation) {
        // Mock High-Rise Development
        layers.push(
          new PolygonLayer({
            id: 'development-simulation',
            data: DEVELOPMENT_SIMULATION_DATA,
            getPolygon: (d: any) => d.polygon,
          getFillColor: (d: any) => d.color,
          getElevation: (d: any) => d.height,
          extruded: true,
          wireframe: true,
          getLineColor: [255, 255, 255, 100],
          lineWidthMinPixels: 1,
          pickable: false,
          material: {
            ambient: 0.8,
            diffuse: 0.6,
            shininess: 32,
            specularColor: [255, 255, 255]
          }
        })
      )
    }

    if (showUtilities) {
        // MPAJ + iFIBER Dark Fiber Network
        layers.push(
          new PathLayer({
            id: 'dark-fiber-network',
            data: DARK_FIBER_NETWORK_DATA,
            getPath: (d: any) => d.path,
            getColor: (d: any) => d.color,
            getWidth: 4,
            widthMinPixels: 2,
            pickable: false,
            jointRounded: true,
            capRounded: true
          })
        )
      }

      if (showDemographics) {
        // Population Density Heatmap
        layers.push(
          new PolygonLayer({
            id: 'demographics-layer',
            data: DEMOGRAPHICS_DATA,
            getPolygon: (d: any) => d.polygon,
            getFillColor: (d: any) => {
              // Interpolate color based on density
              const density = d.density;
              if (density > 15000) return [220, 38, 38, 120]; // Red
              if (density > 10000) return [249, 115, 22, 120]; // Orange
              if (density > 8000) return [234, 179, 8, 120]; // Yellow
              return [34, 197, 94, 120]; // Green
            },
            extruded: false,
            pickable: false, // Changed from true to false to disable hover/click on demographics entirely
            stroked: true,
            getLineColor: [255, 255, 255, 50],
            lineWidthMinPixels: 1
          })
        )
      }

      return layers
    }, [basemap, simulationMode, rainfall, river, trafficSimulation, developmentSimulation, showUtilities, showDemographics, zoningCompliance, bimOverlay, bimData, time, floodGrid, trafficTrips])

  const [fetchedStyle, setFetchedStyle] = useState<any>(null)
  const [baseStyle, setBaseStyle] = useState<any>(null)

  useEffect(() => {
    const fetchStyle = async () => {
      try {
        let styleJson;
        if (basemap === "satellite") {
          // Base style for satellite
          styleJson = {
            version: 8,
            sources: {
              satellite: {
                type: "raster",
                tiles: [
                  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                ],
                tileSize: 256,
                maxzoom: 19,
                attribution: "Tiles © Esri"
              }
            },
            layers: [
              {
                id: "satellite-layer",
                type: "raster",
                source: "satellite"
              }
            ]
          };
        } else {
          // Fetch OpenFreeMap style
          const styleUrl = basemap === "dark" 
            ? "https://tiles.openfreemap.org/styles/dark"
            : "https://tiles.openfreemap.org/styles/positron"; // Fallback to positron for light/google3d
          const res = await fetch(styleUrl);
          if (!res.ok) throw new Error("Failed to fetch openfreemap style");
          styleJson = await res.json();
          // Fix 404 font errors by using a reliable glyphs source
          styleJson.glyphs = "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf";
        }
        setFetchedStyle(styleJson);
      } catch (err) {
        console.error("Failed to fetch map style", err);
      }
    };

    fetchStyle();
  }, [basemap]);

  useEffect(() => {
    if (!fetchedStyle) return;

    // Deep clone to avoid mutating the cached style
    const styleJson = JSON.parse(JSON.stringify(fetchedStyle));

    // Inject Terrain and 3D Buildings
    styleJson.sources.terrainSource = {
      type: "raster-dem",
      encoding: "terrarium",
      tiles: ["/api/tiles/terrarium/{z}/{x}/{y}"],
      tileSize: 256,
      maxzoom: 14,
      attribution: "Terrain data: Mapzen Terrarium (AWS)"
    };

    styleJson.sources.overtureBuildings = {
      type: "vector",
      url: "pmtiles://https://overturemaps-tiles-us-west-2-beta.s3.amazonaws.com/2024-07-22/buildings.pmtiles",
      attribution: "© Overture Maps Foundation"
    };

    // Add Sky and Light
    styleJson.sky = {
      "sky-color": "#000000",
      "sky-horizon-blend": 0,
      "horizon-color": "#000000",
      "horizon-fog-blend": 0,
      "fog-color": "#000000",
      "fog-ground-blend": 0
    };

    styleJson.light = {
      anchor: "viewport",
      color: "#ffffff",
      intensity: basemap === "satellite" ? 0.4 : 0.25,
      position: basemap === "satellite" ? [1.5, 90, 80] : [1.15, 210, 30]
    };

    // Disable Terrain by default for performance unless specifically requested
    // styleJson.terrain = { source: "terrainSource", exaggeration: 1.2 };

    const customLayers = [
      {
        id: "hillshade",
        type: "hillshade",
        source: "terrainSource",
        paint: {
          "hillshade-exaggeration": 0.3,
          "hillshade-shadow-color": "#0b1220",
          "hillshade-highlight-color": "#1f2937",
          "hillshade-illumination-anchor": "viewport"
        }
      },
      {
        id: "overture-buildings-3d",
        type: "fill-extrusion",
        source: "overtureBuildings",
        "source-layer": "building",
        minzoom: 15.5, // Massively increased minzoom to save performance
        layout: {
          visibility: effectiveLayerVisibility.buildings ? "visible" : "none"
        },
        filter: ["any", ["==", ["geometry-type"], "Polygon"], ["==", ["geometry-type"], "MultiPolygon"]],
        paint: {
          "fill-extrusion-color": zoningCompliance ? [
            "case",
            [">", ["coalesce", ["get", "height"], 0], 50],
            "#ef4444", // Red for buildings > 50m (Violation)
            [">", ["coalesce", ["get", "height"], 0], 30],
            "#f59e0b", // Orange for buildings > 30m (Warning)
            basemap === "light" ? "#f1f5f9" : basemap === "satellite" ? "#1f2937" : "#020617" // Default colors
          ] : [
            "interpolate",
            ["linear"],
            ["coalesce", ["get", "height"], 0],
            0, basemap === "light" ? "#ffffff" : basemap === "satellite" ? "#1f2937" : "#020617",
            20, basemap === "light" ? "#f1f5f9" : basemap === "satellite" ? "#374151" : "#0f172a",
            60, basemap === "light" ? "#e2e8f0" : basemap === "satellite" ? "#4b5563" : "#1e293b",
            120, basemap === "light" ? "#cbd5e1" : basemap === "satellite" ? "#6b7280" : "#334155",
            200, basemap === "light" ? "#94a3b8" : basemap === "satellite" ? "#9ca3af" : "#475569"
          ],
          "fill-extrusion-opacity": basemap === "satellite" ? 0.9 : 0.8,
          "fill-extrusion-height": ["max", 0, ["coalesce", ["get", "height"], 12]],
          "fill-extrusion-base": ["max", 0, ["coalesce", ["get", "min_height"], 0]],
          "fill-extrusion-vertical-gradient": true
        }
      }
    ]

    // Inject custom layers just BEFORE the first label/symbol layer so that labels stay visible on top!
    const firstSymbolIndex = styleJson.layers.findIndex((l: any) => l.type === "symbol");
    if (firstSymbolIndex !== -1) {
      styleJson.layers.splice(firstSymbolIndex, 0, ...customLayers);
    } else {
      styleJson.layers.push(...customLayers);
    }

    // Override map background color entirely
    if (styleJson.layers) {
      const bgLayer = styleJson.layers.find((l: any) => l.type === 'background');
      if (bgLayer) {
        bgLayer.paint = { "background-color": "#000000" };
      } else {
        styleJson.layers.unshift({
          id: "background-black",
          type: "background",
          paint: { "background-color": "#000000" }
        });
      }
      
      // Also forcefully hide or darken satellite layers outside of Ampang by setting everything to pitch black first
      styleJson.layers = styleJson.layers.map((layer: any) => {
        if (layer.id === 'satellite-layer') {
          // Keep satellite, but we'll mask it
          return layer;
        }
        return layer;
      });
    }

    setBaseStyle(styleJson);
  }, [fetchedStyle, basemap, zoningCompliance, effectiveLayerVisibility.buildings]);

  useEffect(() => {
    // Traffic and land plots are now handled via Vector Tiles (PMTiles)
    // No need to fetch and parse large GeoJSON files in the browser
  }, [liveTraffic])

  useEffect(() => {
    fetch(`/data/ampang-boundary.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((json) => {
        const bnd = json.boundary ?? null;
        setBoundary(bnd)
        
        if (bnd && bnd.features && bnd.features[0]) {
          const ampangRing = bnd.features[0].geometry.coordinates[0];
          // Create a localized inverted polygon covering a much larger area to ensure no edges are seen
          setInvertedBoundary({
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                geometry: {
                  type: "Polygon",
                  coordinates: [
                    [
                      [95.0, -5.0],
                      [95.0, 10.0],
                      [105.0, 10.0],
                      [105.0, -5.0],
                      [95.0, -5.0]
                    ],
                    ampangRing // Hole
                  ]
                }
              }
            ]
          });
        }
      })
      .catch((e) => {
        console.error("Failed to fetch local boundary data", e);
        setBoundary(null);
        setInvertedBoundary(null);
      })
  }, [])

  useEffect(() => {
    fetch(`/data/ampang-river.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((json) => setRiver(json.features))
      .catch((e) => {
        console.error("Failed to fetch river data", e)
      })
  }, [])

  useEffect(() => {
    if (!boundary) return
    const b = bboxFromFeatureCollection(boundary)
    if (!b) return
    mapRef.current?.fitBounds(
      [
        [b.minLng, b.minLat],
        [b.maxLng, b.maxLat],
      ],
      { padding: 60, duration: 0, pitch: 75, bearing: 30 },
    )
  }, [boundary])

  useEffect(() => {
    // Only re-fly to selected marker if we ACTUALLY have a selected marker 
    // and it's different or we haven't flown to it yet.
    if (!selectedMarker || !mapRef.current) return
    const m = markers.find((x) => x.id === selectedMarker)
    if (!m) return
    mapRef.current?.flyTo({
      center: [m.position[1], m.position[0]],
      zoom: 16,
      pitch: 60,
      bearing: 30,
      duration: 1000,
    })
  }, [selectedMarker])

  useEffect(() => {
    // Prevent multiple Maplibre instances by checking if already mounted and loaded
    setMounted(true)

    // Load POI GeoJSON for browser-side Turf.js and Hexagon analysis
    fetch('/data/ampang-pois.geojson')
      .then(res => res.json())
      .then(data => {
        // Filter points to only include actual point features for analysis
        const pointsOnly = {
          ...data,
          features: data.features.filter((f: any) => f.geometry && f.geometry.type === 'Point')
        };
        setPoiGeoJson(pointsOnly)
      })
      .catch(err => console.log('Could not load POI json for analysis', err))

    // Globally suppress "Failed to fetch" unhandled promise rejections
    // that MapLibre's internal workers throw when aborting tile requests
    const handleRejection = (event: PromiseRejectionEvent) => {
      const msg = event.reason?.message || String(event.reason)
      if (msg.includes("Failed to fetch") || msg.includes("Aborted")) {
        event.preventDefault()
      }
    }
    window.addEventListener("unhandledrejection", handleRejection)
    return () => window.removeEventListener("unhandledrejection", handleRejection)
  }, [])

  const [cursorState, setCursorState] = useState<string>("auto")

  const handleMapClickForAnalysis = (lngLat: any) => {
    if (!isAnalysisMode || !poiGeoJson) return;

    // 1. Create a point where the user clicked
    const centerPt = turf.point([lngLat.lng, lngLat.lat]);
    
    // 2. Draw a 1km radius (buffer) around the click
    const buffer = turf.buffer(centerPt, 1, { units: 'kilometers' });

    // 3. Find all POIs inside this buffer
    const pointsWithin = turf.pointsWithinPolygon(poiGeoJson, buffer as any);

    // 4. Calculate an "AI Livability / Coverage Score"
    let hospitalCount = 0;
    let schoolCount = 0;
    let shopCount = 0;

    pointsWithin.features.forEach((f: any) => {
      const type = f.properties.amenity || f.properties.shop;
      if (['hospital', 'clinic'].includes(type)) hospitalCount++;
      else if (['school', 'kindergarten'].includes(type)) schoolCount++;
      else if (['mall', 'supermarket', 'convenience'].includes(type)) shopCount++;
    });

    // Basic scoring algorithm (out of 100)
    const score = Math.min(100, (hospitalCount * 15) + (schoolCount * 10) + (shopCount * 5));

    setAnalysisResult({
      type: 'radius',
      lngLat: lngLat,
      buffer: buffer,
      score: score,
      metrics: {
        hospitals: hospitalCount,
        schools: schoolCount,
        shops: shopCount,
        totalPOIs: pointsWithin.features.length
      }
    });
  }

  if (!mounted || !baseStyle) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading map...</div>
      </div>
    )
  }

  const transformRequest = (url: string) => {
    return { url }
  }

  const handleError = (e: any) => {
    const error = e.error || e
    const message = error?.message || String(error)

    // Suppress expected ERR_ABORTED / Failed to fetch (0) errors that occur
    // when MapLibre cancels tile requests during fast panning/zooming
    const suppressPatterns = ["Failed to fetch", "Aborted", "ERR_ABORTED", "Fetch is aborted"]
    if (suppressPatterns.some((p) => message.includes(p))) {
      return
    }

    console.error("MapLibre Error:", error)
  }

  return (
    <div className="h-full w-full relative">
      {/* Top Center: Main Control Bar (Search + Analysis + Export) */}
      <div className="absolute top-20 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:right-auto z-40 flex items-center gap-2 md:gap-3">
        <form onSubmit={handleSearch} className="relative flex-1 md:flex-none">
          <div className="flex items-center bg-background/60 backdrop-blur-2xl shadow-xl rounded-full overflow-hidden border border-white/10 h-12 px-2 w-full">
            <Search className="h-5 w-5 text-muted-foreground ml-3 shrink-0" />
            <Input 
              type="text" 
              placeholder="Search Ampang Jaya..." 
              className="w-full md:w-80 border-0 focus-visible:ring-0 bg-transparent h-full px-3 text-sm placeholder:text-muted-foreground"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-white/10 mr-1" onClick={() => setSearchQuery('')}>
                <X className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
          </div>
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 mt-3 w-full bg-background/80 backdrop-blur-2xl shadow-2xl rounded-2xl border border-white/10 overflow-hidden animate-in fade-in slide-in-from-top-2">
              {searchResults.map((result: any, idx: number) => (
                <button
                  key={idx}
                  type="button"
                  className="w-full text-left px-5 py-3.5 text-sm hover:bg-white/10 transition-colors border-b border-white/5 last:border-0 truncate"
                  onClick={() => flyToResult(result.lat, result.lon)}
                >
                  {result.display_name}
                </button>
              ))}
            </div>
          )}
        </form>

        <div className="h-12 flex items-center bg-background/60 backdrop-blur-2xl shadow-xl rounded-full border border-white/10 px-2 gap-1">
          <Button 
            variant={isAnalysisMode ? "secondary" : "ghost"} 
            size="icon"
            className={`h-9 w-9 rounded-full transition-colors ${isAnalysisMode ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'hover:bg-white/10 text-muted-foreground'}`}
            onClick={() => {
              setIsAnalysisMode(!isAnalysisMode)
              setAnalysisResult(null)
            }}
            title="AI Livability Analysis Mode"
          >
            <Hexagon className="h-4 w-4" />
          </Button>

          <Button 
            variant="ghost" 
            size="icon"
            className="h-9 w-9 rounded-full hover:bg-white/10 text-muted-foreground"
            onClick={exportMap}
            title="Export Map as PNG"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* AI Analysis Legend & Results Overlay */}
        {isAnalysisMode && (
          <div className="absolute bottom-10 left-4 z-10 w-80 bg-background/95 backdrop-blur shadow-lg border border-border rounded-xl p-5 animate-in slide-in-from-bottom-5">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              AI Site Analysis
            </h3>
            
            {!analysisResult ? (
              <p className="text-sm text-muted-foreground leading-relaxed">
                Click anywhere on the map to run a 1km Livability & Coverage analysis. The 3D hexagons show density of critical infrastructure.
              </p>
            ) : analysisResult.type === 'radius' ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-sm font-medium">Livability Score</span>
                    <span className={`text-2xl font-black ${analysisResult.score > 70 ? 'text-green-500' : analysisResult.score > 40 ? 'text-yellow-500' : 'text-red-500'}`}>
                      {analysisResult.score}/100
                    </span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${analysisResult.score > 70 ? 'bg-green-500' : analysisResult.score > 40 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                      style={{ width: `${analysisResult.score}%` }} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-secondary/50 p-2 rounded-md">
                    <div className="text-muted-foreground text-xs mb-1">Hospitals/Clinics</div>
                    <div className="font-semibold text-lg">{analysisResult.metrics.hospitals}</div>
                  </div>
                  <div className="bg-secondary/50 p-2 rounded-md">
                    <div className="text-muted-foreground text-xs mb-1">Schools</div>
                    <div className="font-semibold text-lg">{analysisResult.metrics.schools}</div>
                  </div>
                  <div className="bg-secondary/50 p-2 rounded-md">
                    <div className="text-muted-foreground text-xs mb-1">Commercial/Shops</div>
                    <div className="font-semibold text-lg">{analysisResult.metrics.shops}</div>
                  </div>
                  <div className="bg-secondary/50 p-2 rounded-md">
                    <div className="text-muted-foreground text-xs mb-1">Total POIs in 1km</div>
                    <div className="font-semibold text-lg">{analysisResult.metrics.totalPOIs}</div>
                  </div>
                </div>
              </div>
            ) : analysisResult.type === 'hexagon' ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Density Node Selected</span>
                  <span className="bg-orange-500/20 text-orange-500 px-2 py-1 rounded text-xs font-bold">{analysisResult.count} POIs</span>
                </div>
                <div className="text-xs text-muted-foreground max-h-32 overflow-y-auto space-y-1">
                  {Object.entries(analysisResult.categories as Record<string, number>)
                    .sort(([, a], [, b]) => b - a)
                    .map(([cat, count]) => (
                      <div key={cat} className="flex justify-between">
                        <span className="capitalize">{cat}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}

      <Map
        ref={mapRef}
        reuseMaps={true}
        mapLib={maplibregl}
        mapStyle={baseStyle as any}
        transformRequest={transformRequest}
        onError={handleError}
        interactiveLayerIds={['overture-buildings-3d', 'roads-line-hover', 'land-plots-fill', 'pois-point', 'aqi-point', 'river-point']}
        cursor={isAnalysisMode ? "crosshair" : cursorState}
        onMouseEnter={() => setCursorState('pointer')}
        onMouseLeave={() => setCursorState("auto")}
        initialViewState={{
          latitude: AMPANG_CENTER[0],
          longitude: AMPANG_CENTER[1],
          zoom: 13.5,
          pitch: 0,
          bearing: 0,
        }}
        maxPitch={85}
        maxZoom={20}
        minZoom={11.5}
        maxBounds={[
          [101.69, 3.06], // Southwest bound to lock camera around Ampang/KL
          [101.86, 3.32]  // Northeast bound
        ]}
        onClick={(e) => {
          console.log("Maplibre base map clicked")
          if (e.originalEvent) {
            e.originalEvent.stopPropagation()
          }
          
          if (isAnalysisMode) {
            handleMapClickForAnalysis(e.lngLat)
            return;
          }
          
          if (e.features && e.features.length > 0) {
            setClickInfo({
              feature: e.features[0],
              lngLat: e.lngLat
            })
            return;
          }
          
          setClickInfo(null)
          if (onMapClick) onMapClick()
        }}
        attributionControl={false}
        style={{ width: "100%", height: "100%" }}
      >
        {/* Tooltip/Popup for click interactions MUST be inside <Map> */}
        {clickInfo && (
          <Popup
            longitude={clickInfo.lngLat.lng}
            latitude={clickInfo.lngLat.lat}
            closeButton={true}
            closeOnClick={false}
            onClose={() => setClickInfo(null)}
            anchor="bottom"
            className="z-[1100] text-black"
            maxWidth="300px"
          >
            <div className="text-sm p-1 text-black">
              {clickInfo.feature.layer.id === "overture-buildings-3d" ? (
                <>
                  <div className="font-semibold text-black">
                    {clickInfo.feature.properties?.names || clickInfo.feature.properties?.name || "Building"}
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5">
                    Height: {clickInfo.feature.properties?.height ? `${Math.round(clickInfo.feature.properties.height)}m` : "Unknown"}
                  </div>
                </>
              ) : clickInfo.feature.layer.id === "roads-line" || clickInfo.feature.layer.id === "roads-line-hover" ? (
                <>
                  <div className="font-semibold text-black">
                    {clickInfo.feature.properties?.name || "Unnamed Road"}
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5 flex flex-col gap-1 capitalize">
                    <span>Type: {clickInfo.feature.properties?.highway || "Road"}</span>
                    <span>Max Speed: {clickInfo.feature.properties?.maxspeed || "Unknown"} km/h</span>
                  </div>
                </>
              ) : clickInfo.feature.layer.id === "land-plots-fill" ? (
                <>
                  <div className="font-semibold text-black">
                    Land Parcel (Lot)
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5 capitalize flex flex-col gap-1">
                    <span>Lot Number: {clickInfo.feature.properties?.lot_no || clickInfo.feature.properties?.no_lot || "N/A"}</span>
                    <span>Area: {clickInfo.feature.properties?.luas || "Unknown"}</span>
                    <span>Use: {clickInfo.feature.properties?.kategori || "Unknown"}</span>
                  </div>
                </>
              ) : clickInfo.feature.layer.id === "pois-point" ? (
                <>
                  <div className="font-semibold text-black">
                    {clickInfo.feature.properties?.name || "Point of Interest"}
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5 flex flex-col gap-1 capitalize">
                    <span>Category: {clickInfo.feature.properties?.amenity || clickInfo.feature.properties?.shop || "Unknown"}</span>
                  </div>
                </>
              ) : clickInfo.feature.layer.id === "aqi-point" ? (
                <>
                  <div className="font-semibold text-black">
                    {clickInfo.feature.properties?.name}
                  </div>
                  <div className="text-xs mt-1 flex flex-col gap-1">
                    <span className="font-medium px-2 py-1 rounded bg-gray-100 w-fit text-black">AQI: {clickInfo.feature.properties?.aqi} ({clickInfo.feature.properties?.status})</span>
                    <span className="text-gray-500">Updated: {new Date(clickInfo.feature.properties?.last_updated).toLocaleTimeString()}</span>
                  </div>
                </>
              ) : clickInfo.feature.layer.id === "river-point" ? (
                <>
                  <div className="font-semibold text-black">
                    {clickInfo.feature.properties?.name}
                  </div>
                  <div className="text-xs mt-1 flex flex-col gap-1">
                    <span className="font-medium px-2 py-1 rounded bg-gray-100 w-fit text-black">Level: {clickInfo.feature.properties?.level}m</span>
                    <span className="text-gray-600">Threshold: {clickInfo.feature.properties?.threshold}m</span>
                    <span className={`font-semibold ${clickInfo.feature.properties?.status === 'Danger' ? 'text-red-600' : clickInfo.feature.properties?.status === 'Alert' ? 'text-yellow-600' : 'text-green-600'}`}>
                      Status: {clickInfo.feature.properties?.status}
                    </span>
                  </div>
                </>
              ) : null}
            </div>
          </Popup>
        )}
        {/* Force a pure black background underneath everything to ensure no base map bleeds through */}
        <Source id="black-background-src" type="geojson" data={{
          type: "Feature",
          properties: {},
          geometry: {
            type: "Polygon",
            coordinates: [[[95.0, -5.0], [95.0, 10.0], [105.0, 10.0], [105.0, -5.0], [95.0, -5.0]]]
          }
        }}>
          <Layer
            id="black-background-fill"
            type="fill"
            paint={{
              "fill-color": "#000000",
              "fill-opacity": 1
            }}
            // Place it at the absolute bottom of the layer stack
            beforeId={fetchedStyle?.layers?.[0]?.id}
          />
        </Source>

        {/* LIVE AQI SENSORS */}
        {effectiveLayerVisibility.aqi && (
          <Source id="aqi-sensors" type="geojson" data="/data/live-aqi.geojson">
            <Layer
              id="aqi-point"
              type="circle"
              paint={{
                "circle-color": ["get", "color"],
                "circle-radius": [
                  "interpolate", ["linear"], ["zoom"],
                  11, 8,
                  15, 14
                ],
                "circle-stroke-width": 2,
                "circle-stroke-color": "#ffffff",
                "circle-opacity": 0.9
              }}
            />
            <Layer
              id="aqi-label"
              type="symbol"
              layout={{
                "text-field": ["to-string", ["get", "aqi"]],
                "text-font": ["Open Sans Bold"],
                "text-size": [
                  "interpolate", ["linear"], ["zoom"],
                  11, 10,
                  15, 14
                ],
                "text-allow-overlap": true
              }}
              paint={{
                "text-color": "#ffffff",
                "text-halo-color": "#000000",
                "text-halo-width": 1
              }}
            />
          </Source>
        )}

        {/* LIVE RIVER LEVEL SENSORS */}
        {effectiveLayerVisibility.riverLevel && (
          <Source id="river-sensors" type="geojson" data="/data/live-water-levels.geojson">
            <Layer
              id="river-point-pulse"
              type="circle"
              paint={{
                "circle-color": ["get", "color"],
                "circle-radius": [
                  "interpolate", ["linear"], ["zoom"],
                  11, 15,
                  15, 25
                ],
                "circle-opacity": 0.3,
                "circle-pitch-alignment": "map"
              }}
            />
            <Layer
              id="river-point"
              type="circle"
              paint={{
                "circle-color": ["get", "color"],
                "circle-radius": [
                  "interpolate", ["linear"], ["zoom"],
                  11, 6,
                  15, 10
                ],
                "circle-stroke-width": 2,
                "circle-stroke-color": "#ffffff"
              }}
            />
            <Layer
              id="river-label"
              type="symbol"
              minzoom={13}
              layout={{
                "text-field": ["concat", ["get", "name"], "\n", ["to-string", ["get", "level"]], "m"],
                "text-font": ["Open Sans Bold"],
                "text-size": 12,
                "text-offset": [0, 1.5],
                "text-anchor": "top"
              }}
              paint={{
                "text-color": ["get", "color"],
                "text-halo-color": "#000000",
                "text-halo-width": 2
              }}
            />
          </Source>
        )}

        {/* 
          POINTS OF INTEREST (POIs) LAYER
        */}
        {effectiveLayerVisibility.pois && (
          <Source id="pois" type="vector" url="pmtiles:///data/ampang-pois.pmtiles">
            {/* Background halo for POI dots */}
            <Layer
              id="pois-point-halo"
              type="circle"
              source-layer="pois"
              minzoom={14}
              paint={{
                "circle-color": "#ffffff",
                "circle-radius": 6,
                "circle-opacity": 0.8
              }}
            />
            {/* Core POI dot */}
            <Layer
              id="pois-point"
              type="circle"
              source-layer="pois"
              minzoom={14}
              paint={{
                "circle-color": [
                  "match",
                  ["get", "amenity"],
                  "hospital", "#ef4444", // Red for hospitals
                  "clinic", "#ef4444",
                  "school", "#eab308", // Yellow for schools
                  "police", "#3b82f6", // Blue for police
                  "fire_station", "#ef4444",
                  "#8b5cf6" // Default purple for others (shops, etc)
                ],
                "circle-radius": 4,
                "circle-stroke-width": 1,
                "circle-stroke-color": "#ffffff"
              }}
            />
            <Layer
              id="pois-label"
              type="symbol"
              source-layer="pois"
              minzoom={15.5} // Hide text until zoomed in closely to avoid clutter
              layout={{
                "text-field": ["get", "name"],
                "text-font": ["Open Sans Regular"],
                "text-size": 11,
                "text-offset": [0, 1.2],
                "text-anchor": "top",
                "text-allow-overlap": false, // Prevent text from overlapping other text
                "text-ignore-placement": false
              }}
              paint={{
                "text-color": "#ffffff",
                "text-halo-color": "#000000",
                "text-halo-width": 2
              }}
            />
          </Source>
        )}

        <DeckGLOverlay layers={deckLayers} interleaved={false} />
        <NavigationControl position="bottom-right" showCompass style={{ marginBottom: "2rem", marginRight: "1rem" }} />

          {effectiveLayerVisibility.boundary && invertedBoundary && (
          <Source id="ampang-mask" type="geojson" data={invertedBoundary}>
            <Layer
              id="ampang-mask-flat"
              type="fill"
              paint={{
                "fill-color": "#000000",
                "fill-opacity": 1
              }}
            />
          </Source>
        )}

        {effectiveLayerVisibility.boundary && boundary && (
          <Source id="ampang-boundary" type="geojson" data={boundary}>
            <Layer
              id="ampang-boundary-fill"
              type="fill"
              paint={{ "fill-color": "#0066B3", "fill-opacity": 0.08 }}
            />
            <Layer
              id="ampang-boundary-outline"
              type="line"
              paint={{ "line-color": "#60a5fa", "line-width": 2, "line-opacity": 0.9 }}
            />
          </Source>
        )}

        {/* 
          WATER BODIES LAYER
        */}
        {effectiveLayerVisibility.water && (
          <Source id="water" type="vector" url="pmtiles:///data/ampang-water.pmtiles">
            <Layer
              id="water-fill"
              type="fill"
              source-layer="water"
              paint={{
                "fill-color": "#3b82f6",
                "fill-opacity": 0.4
              }}
            />
          </Source>
        )}

        {/* 
          PARKS AND FORESTS LAYER
        */}
        {effectiveLayerVisibility.parks && (
          <Source id="parks" type="vector" url="pmtiles:///data/ampang-parks.pmtiles">
            <Layer
              id="parks-fill"
              type="fill"
              source-layer="parks"
              paint={{
                "fill-color": "#22c55e",
                "fill-opacity": 0.15
              }}
            />
          </Source>
        )}
        {effectiveLayerVisibility.landPlots && (
          <Source id="land-plots" type="vector" url="pmtiles:///data/ampang-land-plots.pmtiles">
            <Layer
              id="land-plots-fill"
              type="fill"
              source-layer="land-plots"
              minzoom={14}
              paint={{
                "fill-color": "#f59e0b",
                "fill-opacity": 0.1
              }}
            />
            <Layer
              id="land-plots-line"
              type="line"
              source-layer="land-plots"
              minzoom={14}
              paint={{
                "line-color": "#f59e0b",
                "line-width": 1,
                "line-opacity": 0.8
              }}
            />
          </Source>
        )}

        {effectiveLayerVisibility.traffic && (
          <Source id="roads" type="vector" url="pmtiles:///data/ampang-roads.pmtiles">
            <Layer
              id="roads-line"
              type="line"
              source-layer="roads"
              minzoom={11}
              paint={{
                "line-color": "#3b82f6", // Default static blue color for roads since traffic is mock
                "line-width": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  11, 0.5,
                  14, 2,
                  18, 8
                ],
                "line-opacity": 0.6
              }}
              layout={{
                "line-cap": "round",
                "line-join": "round"
              }}
            />
            {/* Invisible wider line for easier hovering */}
            <Layer
              id="roads-line-hover"
              type="line"
              source-layer="roads"
              minzoom={11}
              paint={{
                "line-width": 15,
                "line-color": "transparent"
              }}
            />
          </Source>
        )}

        {effectiveLayerVisibility.traffic && (
          <Source id="traffic-lights" type="vector" url="pmtiles:///data/ampang-traffic-lights.pmtiles">
            <Layer
              id="traffic-lights-point"
              type="circle"
              source-layer="traffic-lights"
              minzoom={12}
              paint={{
                "circle-color": "#f59e0b",
                "circle-radius": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  12, 2,
                  16, 4
                ],
                "circle-stroke-width": 1,
                "circle-stroke-color": "#ffffff"
              }}
            />
          </Source>
        )}

        {/* Custom HTML Markers */}
      {effectiveLayerVisibility.markers && markers.map((m) => (
        <Marker
          key={m.id}
          latitude={m.position[0]}
          longitude={m.position[1]}
          anchor="center"
          style={{ cursor: 'pointer', zIndex: m.id === selectedMarker ? 40 : 10 }}
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            console.log("Marker clicked", m.id);
            onMarkerSelect(m.id);
          }}
        >
          <div className="flex flex-col items-center gap-1 group">
            <MarkerIcon type={m.type} status={m.status} />
            {/* Always show a small label for context, but hide on zoom out if too cluttered (handled via css ideally, but let's just make it small and neat) */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-10 pointer-events-none whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-[10px] font-medium text-white shadow-xl backdrop-blur-sm border border-white/10 z-50">
              {m.label}
              {m.status && <span className="ml-1 opacity-70">({m.status})</span>}
            </div>
          </div>
        </Marker>
      ))}

        {liveSensorData && (
          <Popup
            longitude={101.7610}
            latitude={3.1550}
            closeButton={true}
            closeOnClick={false}
            onClose={() => setLiveSensorData(null)}
            anchor="bottom"
            className="z-[1100]"
          >
            <div className="text-sm p-2 text-black">
              <div className="font-bold border-b pb-1 mb-1">Live Sensor (MQTT)</div>
              <div>ID: {liveSensorData.sensor_id}</div>
              <div>Water Level: {liveSensorData.water_level_m}m</div>
              <div>Status: {liveSensorData.status}</div>
            </div>
          </Popup>
        )}

      </Map>
    </div>
  )
}
