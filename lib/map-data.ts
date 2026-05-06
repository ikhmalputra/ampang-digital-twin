// Ampang Jaya coordinates
export const AMPANG_CENTER: [number, number] = [3.1478, 101.7615]

// Map marker types
export type MapMarker = {
  id: number
  position: [number, number]
  type: "traffic" | "sensor" | "camera" | "alert" | "lighting" | "report" | "utility" | "bim" | "facility" | "waste" | "iwk"
  label: string
  status: "Normal" | "Warning" | "Critical" | "Active" | "Inactive" | "Alert" | "Danger" | "Moderate" | "Heavy" | "Online" | "Offline" | "Operational" | "Pending Dispatch" | "In Progress" | "In Transit"
  details: string
  reporter?: {
    name: string
    phone: string
    date: string
  }
  images?: string[]
}

// Map data points
export const markers: MapMarker[] = [
  { id: 1, position: [3.1478, 101.7615], type: "traffic", label: "Jalan Ampang", status: "Moderate", details: "45 vehicles/min" },
  { id: 2, position: [3.1520, 101.7580], type: "sensor", label: "Air Quality Station A1", status: "Normal", details: "AQI: 52" },
  { id: 3, position: [3.1450, 101.7650], type: "camera", label: "CCTV Junction 12", status: "Active", details: "Live feed available" },
  { id: 4, position: [3.1500, 101.7700], type: "alert", label: "Incident Report", status: "Active", details: "Road maintenance ongoing" },
  { id: 5, position: [3.1430, 101.7550], type: "sensor", label: "Water Level Sensor", status: "Normal", details: "2.3m depth" },
  { id: 6, position: [3.1550, 101.7620], type: "traffic", label: "Pandan Indah Interchange", status: "Heavy", details: "78 vehicles/min" },
  { id: 7, position: [3.1400, 101.7680], type: "camera", label: "CCTV Plaza Ampang", status: "Active", details: "Live feed available" },
  { id: 8, position: [3.1580, 101.7550], type: "sensor", label: "Smart Streetlight Zone", status: "Online", details: "142 units active" },
]

// Chart data generator - generates consistent data using seed values
export function generateChartData(baseValues: number[], times: string[]): Array<{ time: string; value: number }> {
  return times.map((time, i) => ({
    time,
    value: baseValues[i] ?? baseValues[0],
  }))
}

// Pre-generated chart data to avoid hydration mismatches
export const trafficChartData = [
  { time: "00:00", value: 342, secondary: 280 },
  { time: "02:00", value: 285, secondary: 220 },
  { time: "04:00", value: 198, secondary: 165 },
  { time: "06:00", value: 456, secondary: 380 },
  { time: "08:00", value: 892, secondary: 720 },
  { time: "10:00", value: 756, secondary: 610 },
  { time: "12:00", value: 684, secondary: 550 },
  { time: "14:00", value: 721, secondary: 580 },
  { time: "16:00", value: 834, secondary: 670 },
  { time: "18:00", value: 912, secondary: 745 },
  { time: "20:00", value: 678, secondary: 540 },
  { time: "22:00", value: 445, secondary: 365 },
]

export const airQualityChartData = [
  { time: "00:00", value: 48 },
  { time: "02:00", value: 45 },
  { time: "04:00", value: 42 },
  { time: "06:00", value: 52 },
  { time: "08:00", value: 68 },
  { time: "10:00", value: 72 },
  { time: "12:00", value: 65 },
  { time: "14:00", value: 58 },
  { time: "16:00", value: 62 },
  { time: "18:00", value: 70 },
  { time: "20:00", value: 55 },
  { time: "22:00", value: 52 },
]

export const energyChartData = [
  { time: "00:00", value: 2.8 },
  { time: "02:00", value: 2.4 },
  { time: "04:00", value: 2.2 },
  { time: "06:00", value: 3.1 },
  { time: "08:00", value: 4.2 },
  { time: "10:00", value: 4.8 },
  { time: "12:00", value: 5.1 },
  { time: "14:00", value: 4.9 },
  { time: "16:00", value: 4.5 },
  { time: "18:00", value: 4.8 },
  { time: "20:00", value: 3.8 },
  { time: "22:00", value: 3.2 },
]

export const waterChartData = [
  { time: "00:00", value: 12.4 },
  { time: "02:00", value: 10.8 },
  { time: "04:00", value: 9.2 },
  { time: "06:00", value: 14.5 },
  { time: "08:00", value: 18.2 },
  { time: "10:00", value: 16.8 },
  { time: "12:00", value: 15.4 },
  { time: "14:00", value: 14.2 },
  { time: "16:00", value: 15.8 },
  { time: "18:00", value: 17.5 },
  { time: "20:00", value: 14.8 },
  { time: "22:00", value: 13.2 },
]
