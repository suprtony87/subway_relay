export default {
  async fetch(request) {
    const url = new URL(request.url);
    const target = url.searchParams.get("url");

    if (!target) {
      return new Response("Missing ?url= parameter", {
        status: 400,
      });
    }

    // Only allow MTA API requests
    let targetUrl;
    try {
      targetUrl = new URL(target);
    } catch {
      return new Response("Invalid target URL", {
        status: 400,
      });
    }

    if (targetUrl.hostname !== "api-endpoint.mta.info") {
      return new Response("Only MTA API requests are allowed", {
        status: 403,
      });
    }

    // Handle browser preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders(),
      });
    }

    const response = await fetch(targetUrl.toString(), {
      method: "GET",
      headers: {
        "User-Agent": "nyc-subway-live",
      },
    });

    const headers = new Headers(response.headers);

    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "*");
    headers.set("Cache-Control", "no-store");

    return new Response(response.body, {
      status: response.status,
      headers,
    });
  },
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "*",
  };
}
