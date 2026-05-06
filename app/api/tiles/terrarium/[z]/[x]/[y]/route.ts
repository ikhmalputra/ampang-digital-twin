import { NextResponse } from "next/server"

export async function GET(req: Request, ctx: { params: Promise<{ z: string; x: string; y: string }> }) {
  const { z, x, y } = await ctx.params

  const zi = Number.parseInt(z, 10)
  const xi = Number.parseInt(x, 10)
  const yi = Number.parseInt(y, 10)

  if (!Number.isFinite(zi) || !Number.isFinite(xi) || !Number.isFinite(yi) || zi < 0 || xi < 0 || yi < 0) {
    return NextResponse.json({ error: "Invalid tile coordinates" }, { status: 400 })
  }

  const url = `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${zi}/${xi}/${yi}.png`
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
      "content-type": "image/png",
      "cache-control": "public, max-age=604800, stale-while-revalidate=2592000",
    },
  })
}

