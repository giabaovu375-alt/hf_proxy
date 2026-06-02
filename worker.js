export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "*",
        },
      });
    }

    const url = new URL(request.url);
    const hfBase = "https://huggingface.co/datasets/Toilatop1sever/Pun-Chan-Arena/resolve/main";
    const hfUrl = `${hfBase}${url.pathname}`;

    try {
      const res = await fetch(hfUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "*/*",
          "Referer": "https://huggingface.co/",
        },
      });

      if (!res.ok) {
        return new Response(`HuggingFace error: ${res.status}`, { status: res.status });
      }

      return new Response(res.body, {
        status: res.status,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": res.headers.get("Content-Type") || "application/octet-stream",
          "Cache-Control": "public, max-age=86400",
        },
      });
    } catch (err) {
      return new Response(`Proxy error: ${err}`, { status: 500 });
    }
  },
};
