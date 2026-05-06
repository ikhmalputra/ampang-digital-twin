import { NextResponse } from "next/server"

type NominatimItem = {
  geojson?: any
  display_name?: string
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const q = (url.searchParams.get("q") ?? "Ampang Jaya, Selangor, Malaysia").trim()

  const searchUrl = new URL("https://nominatim.openstreetmap.org/search")
  searchUrl.searchParams.set("q", q)
  searchUrl.searchParams.set("format", "jsonv2")
  searchUrl.searchParams.set("polygon_geojson", "1")
  searchUrl.searchParams.set("limit", "5")

  const res = await fetch(searchUrl.toString(), {
    headers: {
      "accept": "application/json",
      "user-agent": "ampang-jaya-smart-city/1.0",
    },
    next: { revalidate: 86400 },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    return NextResponse.json(
      { error: "Boundary lookup failed", status: res.status, details: text.slice(0, 500) },
      { status: 502 },
    )
  }

  const items = (await res.json()) as NominatimItem[]
  const item = (items ?? []).find((x) => x.geojson && (x.geojson.type === "Polygon" || x.geojson.type === "MultiPolygon"))

  if (!item?.geojson) {
    return NextResponse.json({ error: "No boundary geometry found" }, { status: 404 })
  }

  return NextResponse.json({
    query: q,
    name: item.display_name ?? q,
    boundary: {
      type: "FeatureCollection",
      features: [{ type: "Feature", properties: { name: item.display_name ?? q }, geometry: item.geojson }],
    },
  })
}

