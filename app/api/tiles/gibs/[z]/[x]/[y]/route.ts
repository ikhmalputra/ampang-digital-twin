import { NextResponse } from "next/server"

export async function GET(req: Request, ctx: { params: Promise<{ z: string; x: string; y: string }> }) {
  const { z, x, y } = await ctx.params

  const zi = Number.parseInt(z, 10)
  const xi = Number.parseInt(x, 10)
  const yi = Number.parseInt(y, 10)

  if (!Number.isFinite(zi) || !Number.isFinite(xi) || !Number.isFinite(yi) || zi < 0 || xi < 0 || yi < 0) {
    return NextResponse.json({ error: "Invalid tile coordinates" }, { status: 400 })
  }

  const date = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const url = `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${date}/GoogleMapsCompatible_Level9/${zi}/${yi}/${xi}.jpg`

  const upstream = await fetch(url, {
    headers: {
      "user-agent": "ampang-jaya-smart-city/1.0",
    },
    cache: "force-cache",
    signal: req.signal,
  })

  if (!upstream.ok) {
    const text = await upstream.text().catch(() => "")
    return NextResponse.json(
      { error: "Upstream tile error", status: upstream.status, details: text.slice(0, 200) },
      { status: 502 },
    )
  }

  return new Response(upstream.body, {
    headers: {
      "content-type": "image/jpeg",
      "cache-control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  })
}

