import { NextResponse } from "next/server"
import { MapMarker } from "@/lib/map-data"
import fs from "fs"
import path from "path"

const AMPANG_LAT = 3.1478
const AMPANG_LNG = 101.7615

// Helper to read extracted JSON files safely
function readExtractedJson(filename: string, fallback: any) {
  try {
    const filePath = path.join(process.cwd(), "extract_data", filename)
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8")
      return JSON.parse(data)
    }
  } catch (e) {
    console.error(`Failed to read ${filename}:`, e)
  }
  return fallback
}

export async function GET() {
  let airQuality: any = null
  let weather: any = null

  // Fetch real-time data from open APIs (Open-Meteo) for Ampang Jaya as a baseline
  try {
    // Add an AbortController to prevent slow external APIs from causing "buffering" during page transitions
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 800); // 800ms timeout

    const [aqRes, weatherRes] = await Promise.all([
      fetch(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${AMPANG_LAT}&longitude=${AMPANG_LNG}&current=pm10,pm2_5`,
        { next: { revalidate: 300 }, signal: controller.signal }
      ).catch(() => null),
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${AMPANG_LAT}&longitude=${AMPANG_LNG}&current=temperature_2m,precipitation`,
        { next: { revalidate: 300 }, signal: controller.signal }
      ).catch(() => null),
    ])

    clearTimeout(timeoutId);

    if (aqRes && aqRes.ok) airQuality = await aqRes.json()
    if (weatherRes && weatherRes.ok) weather = await weatherRes.json()
  } catch (error) {
    console.error("Failed to fetch real-time data, falling back to mock")
  }

  const pm10 = airQuality?.current?.pm10 ?? 45.2
  const precipitation = weather?.current?.precipitation ?? 0.0
  const temperature = weather?.current?.temperature_2m ?? 32.0

  // 1. Load Extracted Data
  const cctvs = readExtractedJson("ampang_cctv_cameras.json", [])
  const rivers = readExtractedJson("ampang_river_levels.json", [])
  const aqis = readExtractedJson("ampang_air_quality.json", [])
  const warnings = readExtractedJson("weather_warnings.json", [])

  const markers: MapMarker[] = []
  let markerId = 1

  // 2. Map CCTVs
  const cctvCoords: Record<string, [number, number]> = {
    "AKLEH_KM1": [3.155, 101.750],
    "MRR2_AMPANG": [3.158, 101.748],
    "DUKE_HULU_KELANG": [3.185, 101.750]
  }
  for (const cctv of cctvs) {
    markers.push({
      id: markerId++,
      position: cctvCoords[cctv.id] || [AMPANG_LAT, AMPANG_LNG],
      type: "camera",
      label: `CCTV: ${cctv.name}`,
      status: "Active",
      details: "Live feed mapped from LLM"
    })
  }

  // 3. Map River Levels
  const riverCoords: Record<string, [number, number]> = {
    "Sungai Ampang": [3.143, 101.755],
    "Sungai Klang": [3.140, 101.730]
  }
  for (const river of rivers) {
    markers.push({
      id: markerId++,
      position: riverCoords[river.river] || [AMPANG_LAT, AMPANG_LNG],
      type: "sensor",
      label: `Flood Sensor: ${river.river}`,
      status: river.status,
      details: `${river.water_level_m}m depth (Danger: ${river.danger_level_m}m)`
    })
  }

  // 4. Map AQI Stations
  const aqiCoords: Record<string, [number, number]> = {
    "Cheras, Kuala Lumpur": [3.1380, 101.7600], // Shifted closer to Ampang
    "Batu Muda, Kuala Lumpur": [3.1550, 101.7620], // Shifted closer to Ampang
    "Petaling Jaya, Selangor": [3.1400, 101.7500] // Shifted closer to Ampang
  }
  for (const aq of aqis) {
    markers.push({
      id: markerId++,
      position: aqiCoords[aq.station] || [AMPANG_LAT, AMPANG_LNG],
      type: "sensor",
      label: `Air Quality: ${aq.station}`,
      status: aq.status,
      details: `API Value: ${aq.api_value}`
    })
  }

  // 5. Map Weather Warnings (if any valid warning exists)
  if (warnings && warnings.length > 0) {
    for (const warning of warnings) {
      if (warning.text_en && warning.text_en.includes("Thunderstorms")) {
        markers.push({
          id: markerId++,
          position: [3.1478, 101.7615], // Place at Ampang center
          type: "alert",
          label: `MET Warning: ${warning.heading_en || "Thunderstorm"}`,
          status: "Active",
          details: warning.text_en.substring(0, 80) + "..."
        })
        break // Just show the most relevant one on the map to avoid clutter
      }
    }
  }

  // 6. Add some baseline simulated traffic points for the dashboard's liveliness
  markers.push({
    id: markerId++,
    position: [3.1478, 101.7615],
    type: "traffic",
    label: "Jalan Ampang (Live Traffic)",
    status: "Moderate",
    details: `${Math.floor(Math.random() * 40 + 30)} vehicles/min`,
  })
  markers.push({
    id: markerId++,
    position: [3.155, 101.762],
    type: "traffic",
    label: "Pandan Indah Interchange",
    status: "Heavy",
    details: `${Math.floor(Math.random() * 50 + 60)} vehicles/min`,
  })

  // 7. Add a marker representing Sentinel-1 SAR availability
  markers.push({
    id: markerId++,
    position: [3.160, 101.780],
    type: "sensor",
    label: "Sentinel-1 SAR Monitor",
    status: "Online",
    details: "Latest Pass: 2026-04-17 (Flood/Landslide Map Ready)"
  })

  // 8. Add Actionable Controls: Smart Street Lighting
  markers.push({
    id: markerId++,
    position: [3.1495, 101.759],
    type: "lighting",
    label: "Smart Lighting Zone: Pandan Indah",
    status: "Operational",
    details: "142 Units Online | 65% Brightness",
  })
  markers.push({
    id: markerId++,
    position: [3.1450, 101.761],
    type: "lighting",
    label: "Smart Lighting Zone: Taman Nirwana",
    status: "Operational",
    details: "84 Units Online | 80% Brightness",
  })

  // 9. Add Community Service Citizen Reports
  markers.push({
    id: markerId++,
    position: [3.142, 101.765],
    type: "report",
    label: "Citizen Report: Pothole",
    status: "Pending Dispatch",
    details: "Large pothole reported near SMK Pandan Mewah. It's causing traffic slowdowns and potential damage to vehicles.",
    reporter: {
      name: "Ahmad Faizal",
      phone: "+60 12-345 6789",
      date: "Today, 09:24 AM"
    },
    images: [
      "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584985223364-75eb99db712f?auto=format&fit=crop&w=800&q=80"
    ]
  })
  markers.push({
    id: markerId++,
    position: [3.151, 101.768],
    type: "report",
    label: "Citizen Report: Illegal Dumping",
    status: "In Progress",
    details: "Construction waste dumped near retention pond. Strong odor and potential environmental hazard to the water source.",
    reporter: {
      name: "Sarah Lee",
      phone: "+60 17-987 6543",
      date: "Yesterday, 14:15 PM"
    },
    images: [
      "https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80"
    ]
  })

  // 10. Add Underground Utilities / Dark Fiber network markers
  markers.push({
    id: markerId++,
    position: [3.150, 101.760],
    type: "utility",
    label: "Dark Fiber Node: Alpha",
    status: "Active",
    details: "Transmission Rate: 10Gbps | Joint Venture Network",
  })
  markers.push({
    id: markerId++,
    position: [3.146, 101.768],
    type: "utility",
    label: "Water Main Valve: 12",
    status: "Warning",
    details: "Pressure drop detected. Potential leak in sector 4.",
  })

  // 11. Add BIM (Building Information Modeling) Integration Marker
  markers.push({
    id: markerId++,
    position: [3.1495, 101.7645], // Near Ampang Point
    type: "bim",
    label: "Ampang Hospital (BIM Data)",
    status: "Operational",
    details: "High-fidelity structural & HVAC telemetry available.",
  })

  // 12. Add Facilities & Emergency (Bomba, Police, Clinics)
  markers.push({
    id: markerId++,
    position: [3.1450, 101.7620],
    type: "facility",
    label: "Balai Bomba & Penyelamat Ampang",
    status: "Active",
    details: "Fire & Rescue Station. 2 Fire Engines on standby. 3 min response time to Ampang Point.",
  })
  markers.push({
    id: markerId++,
    position: [3.1530, 101.7580],
    type: "facility",
    label: "Balai Polis Pandan Indah",
    status: "Active",
    details: "Police Station. 4 patrol cars active in sector.",
  })
  markers.push({
    id: markerId++,
    position: [3.1480, 101.7600],
    type: "facility",
    label: "Klinik Kesihatan Ampang",
    status: "Operational",
    details: "Public Health Clinic. Current wait time: 25 mins.",
  })
  markers.push({
    id: markerId++,
    position: [3.1410, 101.7550],
    type: "facility",
    label: "Pasar Muhibbah Taman Nirwana",
    status: "Operational",
    details: "Public Market. Density: Moderate. Waste collection due at 16:00.",
  })

  // 13. Add Waste Management (Residential Collection Routes)
  markers.push({
    id: markerId++,
    position: [3.1425, 101.7605],
    type: "waste",
    label: "Waste Truck: Route A (Taman Dagang)",
    status: "In Transit",
    details: "Capacity: 65% full. Next stop: Lorong Dagang 4.",
  })
  markers.push({
    id: markerId++,
    position: [3.1515, 101.7665],
    type: "waste",
    label: "Waste Truck: Route C (Pandan Indah)",
    status: "In Transit",
    details: "Capacity: 80% full. Rerouting due to traffic congestion.",
  })
  markers.push({
    id: markerId++,
    position: [3.1465, 101.7540],
    type: "waste",
    label: "Smart Bin: Taman Nirwana Zone 2",
    status: "Warning",
    details: "Bin capacity at 95%. Automated dispatch alert sent to KDEB Waste Management.",
  })

  // 14. Add Indah Water Konsortium (IWK) Sewage Treatment Plants
  markers.push({
    id: markerId++,
    position: [3.1400, 101.7650], // Pandan Indah area
    type: "iwk",
    label: "IWK STP: Pandan Indah",
    status: "Operational",
    details: "Capacity: 78% | Flow Rate: 145 L/s | Effluent Quality: Standard A",
  })
  markers.push({
    id: markerId++,
    position: [3.1520, 101.7580], // Taman Nirwana area
    type: "iwk",
    label: "IWK Pump Station: Nirwana",
    status: "Warning",
    details: "Pump 2 vibrating. Scheduled for maintenance. Capacity: 85%",
  })
  markers.push({
    id: markerId++,
    position: [3.1600, 101.7700], // Bukit Indah area
    type: "iwk",
    label: "IWK STP: Bukit Indah",
    status: "Operational",
    details: "Capacity: 45% | Flow Rate: 82 L/s | Effluent Quality: Standard A",
  })

  // 15. Add Public Safety Incidents (Mocked PDRM/Bomba/Ambulance data)
  // Since PDRM and MERS 999 do not provide open real-time APIs for live crime/emergencies,
  // we simulate realistic active dispatch events for the Ampang jurisdiction MVP.
  markers.push({
    id: markerId++,
    position: [3.151, 101.760],
    type: "alert",
    label: "999: Traffic Accident",
    status: "Critical",
    details: "Multi-vehicle collision at Ampang Point intersection. Ambulance and Traffic Police dispatched.",
  })
  markers.push({
    id: markerId++,
    position: [3.142, 101.768],
    type: "alert",
    label: "PDRM: Suspected Break-in",
    status: "Alert",
    details: "Residential alarm triggered in Taman Nirwana. MPV Patrol 3 en route. ETA 2 mins.",
  })
  markers.push({
    id: markerId++,
    position: [3.155, 101.750],
    type: "alert",
    label: "BOMBA: Structural Fire",
    status: "Critical",
    details: "Reported smoke from commercial shoplot near AKLEH exit. Balai Bomba Ampang responding.",
  })

  // Generate dynamic chart data based on current time
  const currentHour = new Date().getHours()
  const trafficChartData = Array.from({ length: 12 }).map((_, i) => {
    const h = (currentHour - 11 + i + 24) % 24
    const base = 500 + Math.sin(h * Math.PI / 12) * 300 // Peak at midday
    const noise = Math.random() * 100 - 50
    return {
      time: `${h.toString().padStart(2, '0')}:00`,
      value: Math.floor(base + noise),
      secondary: Math.floor((base + noise) * 0.8)
    }
  })

  const utilityChartData = Array.from({ length: 12 }).map((_, i) => {
    const h = (currentHour - 11 + i + 24) % 24
    const energyBase = 40 + Math.sin((h - 6) * Math.PI / 12) * 20
    const waterBase = 100 + Math.sin((h - 4) * Math.PI / 12) * 40
    return {
      time: `${h.toString().padStart(2, '0')}:00`,
      value: Math.floor(energyBase + Math.random() * 5),
      water: Math.floor(waterBase + Math.random() * 10)
    }
  })

  return NextResponse.json({ 
    markers,
    metrics: {
      cctvs,
      rivers,
      aqis,
      warnings,
      pm10,
      precipitation,
      temperature,
      trafficFlow: trafficChartData[trafficChartData.length - 1].value + trafficChartData[trafficChartData.length - 1].secondary
    },
    charts: {
      traffic: trafficChartData,
      utility: utilityChartData
    }
  })
}
