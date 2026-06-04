export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "*",
        },
      });
    }

    const url = new URL(request.url);
    const cache = caches.default;

    // ── Cache lookup ────────────────────────────────────────────────────────
    const cacheKey = new Request(request.url, { method: "GET" });
    const cached = await cache.match(cacheKey);
    if (cached) return cached;

    // ── Fetch từ HuggingFace ────────────────────────────────────────────────
    const hfBase = "https://huggingface.co/datasets/Toilatop1sever/Pun-Chan-Arena/resolve/main";
    const hfUrl = `${hfBase}${url.pathname}`;

    try {
      const res = await fetch(hfUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "*/*",
          "Referer": "https://huggingface.co/",
          "Range": request.headers.get("Range") || "",
        },
      });

      if (!res.ok) {
        return new Response(`HuggingFace error: ${res.status}`, { status: res.status });
      }

      // Model nặng cache 7 ngày, file khác 1 ngày
      const isModel = url.pathname.match(/\.(gltf|glb|vrm|bin)$/i);
      const maxAge  = isModel ? 604800 : 86400;

      const response = new Response(res.body, {
        status: res.status,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": res.headers.get("Content-Type") || "application/octet-stream",
          "Cache-Control": `public, max-age=${maxAge}`,
        },
      });

      // Lưu vào Cloudflare edge cache
      ctx.waitUntil(cache.put(cacheKey, response.clone()));

      return response;
    } catch (err) {
      return new Response(`Proxy error: ${err}`, { status: 500 });
    }
  },
};
