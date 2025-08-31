/// <reference types="node" />

// 서버리스라는데, 버셀은 포기, 뻐킹
export const config = { runtime: "nodejs" };

export default async function handler(req: any, res: any) {
  const { request, coords, sourcecrs, output, orders, lang } = req.query || {};

  const id  = process.env.NAVER_MAP_ID     || process.env.VITE_NAVER_ID;
  const key = process.env.NAVER_MAP_SECRET || process.env.VITE_NAVER_SECRET;
  const envInfo = {
    has_NAVER_MAP_ID: Boolean(process.env.NAVER_MAP_ID),
    has_NAVER_MAP_SECRET: Boolean(process.env.NAVER_MAP_SECRET),
    has_VITE_NAVER_ID: Boolean(process.env.VITE_NAVER_ID),
    has_VITE_NAVER_SECRET: Boolean(process.env.VITE_NAVER_SECRET),
  };

  try {
    if (!coords || typeof coords !== "string") {
      res.status(400).json({ step: "validate", error: 'coords required "lon,lat"', envInfo });
      return;
    }
    if (!/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(coords)) {
      res.status(400).json({ step: "validate", error: 'coords must be "lon,lat"', coords, envInfo });
      return;
    }
    if (!id || !key) {
      res.status(500).json({ step: "env", error: "NAVER credentials missing", envInfo });
      return;
    }

    const qs = new URLSearchParams({
      request: (request as string) || "coordsToaddr",
      coords: coords as string, // "lon,lat" = x,y
      sourcecrs: (sourcecrs as string) || "epsg:4326",
      output: (output as string) || "json",
      orders: (orders as string) || "roadaddr,addr,admcode,legalcode",
      lang: (lang as string) || "ko",
    });

    const url = `https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc?${qs}`;

    let upstream;
    try {
      upstream = await fetch(url, {
        headers: {
          "X-NCP-APIGW-API-KEY-ID": id,
          "X-NCP-APIGW-API-KEY": key,
          "Accept": "application/json",
        },
      });
    } catch (e: any) {
      res.status(502).json({ step: "fetch", error: String(e?.message || e), url, envInfo });
      return;
    }

    const text = await upstream.text();
    const ct = upstream.headers.get("content-type") || "";

    if (!upstream.ok) {
      res.status(upstream.status).json({
        step: "upstream",
        status: upstream.status,
        contentType: ct,
        bodySnippet: text.slice(0, 400),
        url,
        envInfo,
      });
      return;
    }

    res.setHeader("content-type", ct || "application/json; charset=utf-8");
    res.status(200).send(text);
  } catch (e: any) {
    console.error("[revgeo] fatal:", e);
    res.status(500).json({ step: "fatal", error: String(e?.message || e), envInfo });
  }
}
