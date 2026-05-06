import { NextResponse } from "next/server"

type OverpassNode = {
  type: "node"
  id: number
  lat: number
  lon: number
}

type OverpassWay = {
  type: "way"
  id: number
  nodes: number[]
  tags?: Record<string, string>
}

type OverpassResponse = {
  elements: Array<OverpassNode | OverpassWay | { type: string; id: number }>
}

type GeoJSONPolygon = {
  type: "Polygon"
  coordinates: number[][][]
}

type GeoJSONMultiPolygon = {
  type: "MultiPolygon"
  coordinates: number[][][][]
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function toFeatureCollection(features: any[]) {
  return {
    type: "FeatureCollection",
    features,
  }
}

async function postOverpass(query: string) {
  const endpoints = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.openstreetmap.ru/api/interpreter",
  ]

  const body = new URLSearchParams({ data: query }).toString()

  let lastStatus = 502
  let lastText = ""

  for (const endpoint of endpoints) {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), 30000)
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          "user-agent": "ampang-jaya-smart-city/1.0",
        },
        body,
        next: { revalidate: 86400 },
        signal: controller.signal,
      })
      clearTimeout(t)

      if (res.ok) return { ok: true as const, res }

      lastStatus = res.status
      lastText = await res.text().catch(() => "")
    } catch (e) {
      clearTimeout(t)
      lastStatus = 504
      lastText = String(e)
    }
  }

  return { ok: false as const, status: lastStatus, text: lastText }
}

function isPolygon(geojson: any): geojson is GeoJSONPolygon {
  return geojson?.type === "Polygon" && Array.isArray(geojson.coordinates)
}

function isMultiPolygon(geojson: any): geojson is GeoJSONMultiPolygon {
  return geojson?.type === "MultiPolygon" && Array.isArray(geojson.coordinates)
}

function pointInRing(pt: [number, number], ring: Array<[number, number]>) {
  const [x, y] = pt
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i]![0]
    const yi = ring[i]![1]
    const xj = ring[j]![0]
    const yj = ring[j]![1]
    const denom = yj - yi
    const intersect =
      yi > y !== yj > y && denom !== 0 && x < ((xj - xi) * (y - yi)) / denom + xi
    if (intersect) inside = !inside
  }
  return inside
}

function pointInPolygonRings(pt: [number, number], rings: number[][][]) {
  if (rings.length === 0) return false
  const outer = rings[0] as Array<[number, number]>
  if (!pointInRing(pt, outer)) return false
  for (let i = 1; i < rings.length; i++) {
    const hole = rings[i] as Array<[number, number]>
    if (pointInRing(pt, hole)) return false
  }
  return true
}

function pointInGeometry(pt: [number, number], geometry: GeoJSONPolygon | GeoJSONMultiPolygon) {
  if (isPolygon(geometry)) return pointInPolygonRings(pt, geometry.coordinates)
  for (const poly of geometry.coordinates) {
    if (pointInPolygonRings(pt, poly)) return true
  }
  return false
}

function bboxOfGeometry(geojson: GeoJSONPolygon | GeoJSONMultiPolygon) {
  let minLng = Infinity
  let minLat = Infinity
  let maxLng = -Infinity
  let maxLat = -Infinity

  const add = (lng: number, lat: number) => {
    if (lng < minLng) minLng = lng
    if (lat < minLat) minLat = lat
    if (lng > maxLng) maxLng = lng
    if (lat > maxLat) maxLat = lat
  }

  const consumeRings = (rings: number[][][]) => {
    for (const ring of rings) {
      for (const c of ring) add(c[0], c[1])
    }
  }

  if (isPolygon(geojson)) consumeRings(geojson.coordinates)
  else for (const poly of geojson.coordinates) consumeRings(poly)

  return { minLng, minLat, maxLng, maxLat }
}

function centroidOfCoords(coords: Array<[number, number]>) {
  if (coords.length === 0) return [0, 0] as [number, number]
  const pts = coords.length > 2 && coords[0]![0] === coords[coords.length - 1]![0] && coords[0]![1] === coords[coords.length - 1]![1]
    ? coords.slice(0, -1)
    : coords
  let sx = 0
  let sy = 0
  for (const p of pts) {
    sx += p[0]
    sy += p[1]
  }
  return [sx / pts.length, sy / pts.length] as [number, number]
}

function intersectsGeometry(coords: Array<[number, number]>, geometry: GeoJSONPolygon | GeoJSONMultiPolygon) {
  if (coords.length === 0) return false
  const c = centroidOfCoords(coords)
  if (pointInGeometry(c, geometry)) return true
  const step = Math.max(1, Math.floor(coords.length / 24))
  for (let i = 0; i < coords.length; i += step) {
    if (pointInGeometry(coords[i]!, geometry)) return true
  }
  return false
}

async function fetchBoundaryGeoJSON(q: string) {
  const searchUrl = new URL("https://nominatim.openstreetmap.org/search")
  searchUrl.searchParams.set("q", q)
  searchUrl.searchParams.set("format", "jsonv2")
  searchUrl.searchParams.set("polygon_geojson", "1")
  searchUrl.searchParams.set("limit", "5")

  const res = await fetch(searchUrl.toString(), {
    headers: {
      accept: "application/json",
      "user-agent": "ampang-jaya-smart-city/1.0",
    },
    next: { revalidate: 86400 },
  })

  if (!res.ok) return null
  const items = (await res.json()) as Array<{ geojson?: any }>
  const item = (items ?? []).find((x) => isPolygon(x.geojson) || isMultiPolygon(x.geojson))
  return item?.geojson ?? null
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const q = (url.searchParams.get("q") ?? "").trim()
  const lat = Number.parseFloat(url.searchParams.get("lat") ?? "")
  const lng = Number.parseFloat(url.searchParams.get("lng") ?? "")
  const radiusRaw = Number.parseInt(url.searchParams.get("radius") ?? "900", 10)

  const radius = clampNumber(Number.isFinite(radiusRaw) ? radiusRaw : 900, 200, 3000)
  const boundaryGeoJSON = q ? await fetchBoundaryGeoJSON(q) : null
  const polygon = boundaryGeoJSON && (isPolygon(boundaryGeoJSON) || isMultiPolygon(boundaryGeoJSON))
    ? (boundaryGeoJSON as GeoJSONPolygon | GeoJSONMultiPolygon)
    : null

  if (!polygon && (!Number.isFinite(lat) || !Number.isFinite(lng))) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const bbox = polygon ? bboxOfGeometry(polygon) : null
  const query = polygon
    ? [
        "[out:json][timeout:60];",
        "(",
        `  way["highway"~"motorway|trunk|primary|secondary|tertiary|residential|service"](${bbox!.minLat},${bbox!.minLng},${bbox!.maxLat},${bbox!.maxLng});`,
        `  node["highway"="traffic_signals"](${bbox!.minLat},${bbox!.minLng},${bbox!.maxLat},${bbox!.maxLng});`,
        ");",
        "out body;",
        ">;",
        "out skel qt;",
      ].join("\n")
    : [
        "[out:json][timeout:25];",
        "(",
        `  way["highway"~"motorway|trunk|primary|secondary|tertiary|residential|service"](around:${radius},${lat},${lng});`,
        `  node["highway"="traffic_signals"](around:${radius},${lat},${lng});`,
        ");",
        "out body;",
        ">;",
        "out skel qt;",
      ].join("\n")

  const overpass = await postOverpass(query)
  if (!overpass.ok) {
    return NextResponse.json(
      { error: "Overpass request failed", status: overpass.status, details: overpass.text.slice(0, 500) },
      { status: 502 },
    )
  }

  const data = (await overpass.res.json()) as OverpassResponse

  const nodeIndex = new Map<number, { lat: number; lon: number; tags?: Record<string, string> }>()
  const ways: OverpassWay[] = []
  const trafficSignals: any[] = []

  for (const el of data.elements ?? []) {
    if (el.type === "node") {
      const n = el as OverpassNode & { tags?: Record<string, string> }
      nodeIndex.set(n.id, { lat: n.lat, lon: n.lon, tags: n.tags })
      
      if (n.tags && n.tags["highway"] === "traffic_signals") {
        if (polygon && !pointInGeometry([n.lon, n.lat], polygon)) continue
        trafficSignals.push({
          type: "Feature",
          id: n.id,
          properties: n.tags,
          geometry: {
            type: "Point",
            coordinates: [n.lon, n.lat]
          }
        })
      }
    } else if (el.type === "way") {
      ways.push(el as OverpassWay)
    }
  }

  const roads: any[] = []

  for (const way of ways) {
    const tags = way.tags ?? {}
    const coords = (way.nodes ?? [])
      .map((id) => nodeIndex.get(id))
      .filter(Boolean)
      .map((p) => [p!.lon, p!.lat])

    if (coords.length < 2) continue

    if (tags["highway"]) {
      if (polygon) {
        if (!intersectsGeometry(coords as Array<[number, number]>, polygon)) continue
      }

      // Generate realistic deterministic congestion (0-100) based on way ID and road type + current minute
      let baseCongestion = 20
      if (tags["highway"] === "motorway" || tags["highway"] === "trunk") baseCongestion = 70
      else if (tags["highway"] === "primary") baseCongestion = 60
      else if (tags["highway"] === "secondary") baseCongestion = 40
      
      const currentMinute = new Date().getMinutes()
      const timeVariance = Math.sin((currentMinute + way.id) * Math.PI / 15) * 20 // +/- 20 variance over time
      const pseudoRandom = (way.id % 100) - 20
      const congestion = clampNumber(baseCongestion + pseudoRandom + timeVariance, 0, 100)

      roads.push({
        type: "Feature",
        id: way.id,
        properties: {
          ...tags,
          congestion,
        },
        geometry: {
          type: "LineString",
          coordinates: coords,
        },
      })
    }
  }

  return NextResponse.json({
    radius,
    center: polygon ? null : { lat, lng },
    query: q || null,
    roads: toFeatureCollection(roads),
    trafficLights: toFeatureCollection(trafficSignals),
  })
}
